#!/usr/bin/env python3
"""Generate the Sandbox chart's TA-v3 export JSON from Chronos' certified
BTCUSDT Technical_analysis_v3 fresh pass (run ta_v3_btcusdt_20260622).

Source of truth (READ-ONLY — never mutated): the Chronos-certified artifacts
under EVIDENCE/ta_v3_btcusdt_20260622/:
  - BTCUSDT_5m_ta_v3.csv   630,834 rows × 149 cols   sha256 a020617a…
  - BTCUSDT_1h_ta_v3.csv    52,577 rows × 149 cols   sha256 fc0f89a8…
  - CERTIFIED_LEDGER.json   (canonical schema, hashes, validation)

Integrity gate (data is sacred): every CSV's SHA-256 is recomputed here and
matched against CERTIFIED_LEDGER.json before any JSON is written. A mismatch,
a wrong column count, or a schema drift aborts the run — we report BLOCKED
rather than guess.

Browser-safe loading strategy (explicit, deterministic, reproducible):
  * ALL 149 certified columns are exported — none are dropped.
  * Only ROWS are windowed: the most-recent N rows (tail window) are emitted,
    because the 5m file is 1.5 GB and cannot ship whole to a browser. The tail
    window also lands past every indicator's warmup-null head, so every column
    is populated. The window is recorded in the manifest (windowMode/windowN/
    canonicalRows + the canonical row index range) so it is fully reproducible.
  * NO values are recomputed or altered — cells are copied verbatim (NaN→null).

Emits into public/data/:
  ta_v3_btcusdt_5m.json, ta_v3_btcusdt_1h.json   (TaV3Export contract)
  ta_v3_provenance.json                          (ledger / hash / validation)
"""
from __future__ import annotations

import hashlib
import json
import math
import re
import sys
from pathlib import Path

import pandas as pd

# ── certified source bundle (read-only) ──────────────────────────────────────
SRC = Path(
    "/Users/julesdevaux/.openclaw/agents/chronos/workspace/"
    "EVIDENCE/ta_v3_btcusdt_20260622"
)
LEDGER = SRC / "CERTIFIED_LEDGER.json"
CSV = {"5m": SRC / "BTCUSDT_5m_ta_v3.csv", "1h": SRC / "BTCUSDT_1h_ta_v3.csv"}

# tail-window size (rows) per timeframe — most-recent N candles.
WINDOW_N = {"5m": 3000, "1h": 3000}

OUT = Path(__file__).resolve().parent.parent / "public" / "data"

# ── column classification (deterministic, over the certified schema) ──────────
PRICE = {"open", "high", "low", "close"}
VOLUME = {"volume"}
# non-plottable timestamp / epoch / metadata — surfaced in a data/inspection
# layer (never silently dropped), not drawn as a numeric series.
META = {
    "open_time_utc", "open_time_ms", "available_at_utc",
    "htf_1h_partial_bucket_close_utc", "htf_1h_confirmed_available_at_utc",
    "htf_1D_partial_bucket_close_utc", "htf_1D_confirmed_available_at_utc",
}
MARKER = {
    "candle_doji", "candle_marubozu",
    "gann_swing", "gann_swing_change",
    "gann_swing_top", "gann_swing_bottom",
}

_OVERLAY_RE = re.compile(
    r"^(ema_\d+|ma_\d+|bolinger_(sma|upper|lower)|donchian_(upper|lower|mid)_\d+"
    r"|keltner_(mid|upper|lower)_\d+|ichimoku_(conversion|base|span_a|span_b)"
    r"|htf_(1h|1D)_(partial|confirmed)_(open|high|low|close)"
    r"|(1h|1D)_level_breakout_(bear|bull))$"
)


def is_overlay(name: str) -> bool:
    """Absolute price-scale series drawn on the main candle panel."""
    if name in ("median", "vwap"):
        return True
    return bool(_OVERLAY_RE.match(name))


def role_of(name: str) -> str:
    if name in PRICE:
        return "price"
    if name in VOLUME:
        return "volume"
    if name in META:
        return "meta"
    if name in MARKER:
        return "marker"
    if is_overlay(name):
        return "overlay"
    return "oscillator"


def band_of(name: str) -> str:
    """Sub-panel scale-band for an oscillator (groups compatible scales so the
    pane count stays bounded even with all columns enabled)."""
    if name.endswith("_rel_median") or name.endswith("_rel_open"):
        return "rel"  # tiny ratios centered ~0 (the 53 relative-price family)
    if name in ("open_rel_1h_levels", "open_rel_1D_levels"):
        return "sr_dist"  # signed price distance to nearest S/R level
    if name in ("rsi", "stochastic_k", "stochastic_d", "plus_di_14",
                "minus_di_14", "adx_14", "williams_r_14", "mfi_14",
                "donchian_position_20"):
        return "bounded"  # bounded 0–100 (williams −100–0, donch-pos 0–1)
    if name in ("macd_short", "macd_long", "macd"):
        return "macd"
    if name in ("roc_12", "momentum_12", "cci_20"):
        return "momentum"
    if name in ("true_range", "atr_14", "span"):
        return "volatility"
    if name in ("obv", "cmf_20"):
        return "flow"
    if name == "gann_count":
        return "gann"
    if name in ("time_day_sin", "time_day_cos"):
        return "cycle"
    if name in ("htf_1h_partial_volume", "htf_1h_confirmed_volume",
                "htf_1D_partial_volume", "htf_1D_confirmed_volume"):
        return "htf_vol"
    return "misc"


# ledger group -> human label for the selector
GROUP_LABEL = {
    "base_ohlcv": "Base OHLCV",
    "time_encoding": "Time encoding",
    "price_primitives": "Price primitives",
    "rsi": "RSI",
    "bollinger_bands": "Bollinger bands",
    "ema_family": "EMA family",
    "ma_family": "MA family",
    "macd": "MACD",
    "stochastic": "Stochastic",
    "vwap": "VWAP",
    "volatility": "Volatility (ATR / TR)",
    "directional": "Directional (DI / ADX)",
    "oscillators": "Oscillators",
    "donchian": "Donchian",
    "keltner": "Keltner",
    "ichimoku": "Ichimoku (causal)",
    "gann": "Gann",
    "candle_patterns": "Candle patterns",
    "htf_1h": "HTF 1h context",
    "htf_1D": "HTF 1D context",
    "support_resistance": "Support / resistance",
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def group_lookup(ledger: dict) -> dict:
    g2cols = ledger["column_schema"]["groups"]
    col2group = {}
    for gkey, cols in g2cols.items():
        for c in cols:
            col2group[c] = gkey
    return col2group


def cell(v):
    """Verbatim cell → JSON value. NaN/NaT → None. No recompute."""
    if v is None:
        return None
    if isinstance(v, float):
        return None if math.isnan(v) else v
    # pandas may hand us numpy scalars; normalise
    try:
        if pd.isna(v):
            return None
    except (ValueError, TypeError):
        pass
    if isinstance(v, (int,)):
        return v
    return str(v)


def read_tail(tf: str, total: int) -> pd.DataFrame:
    """Read header + the last WINDOW_N rows only (memory-safe for the 1.5 GB
    5m file). Deterministic: rows [total-N, total) of the certified CSV."""
    n = WINDOW_N[tf]
    path = CSV[tf]
    if total > n:
        # skip data rows 1 .. (total-n); keep header (row 0) + final n rows
        skip = range(1, total - n + 1)
        df = pd.read_csv(path, skiprows=skip)
        start_idx = total - n
    else:
        df = pd.read_csv(path)
        start_idx = 0
    df = df.reset_index(drop=True)
    return df, start_idx


def build_export(tf: str, ledger: dict, col2group: dict) -> dict:
    art = ledger["artifacts"][tf]
    total = art["rows"]
    ordered = ledger["column_schema"]["ordered_column_list"]

    df, start_idx = read_tail(tf, total)

    # ── schema gate: exact 149/149 parity, exact order ───────────────────────
    csv_cols = list(df.columns)
    if csv_cols != ordered:
        missing = [c for c in ordered if c not in csv_cols]
        extra = [c for c in csv_cols if c not in ordered]
        raise SystemExit(
            f"BLOCKED: {tf} schema drift. missing={missing} extra={extra}"
        )
    if len(csv_cols) != 149:
        raise SystemExit(f"BLOCKED: {tf} column count {len(csv_cols)} != 149")

    rows = len(df)

    # time axis from the certified epoch-ms column (verbatim)
    time_ms = [int(v) for v in df["open_time_ms"].tolist()]

    columns: dict[str, list] = {}
    manifest_cols = []
    for name in ordered:
        series = df[name].tolist()
        columns[name] = [cell(v) for v in series]
        role = role_of(name)
        nan = sum(1 for v in columns[name] if v is None)
        mc = {
            "name": name,
            "dtype": str(df[name].dtype),
            "group": col2group.get(name, "other"),
            "groupLabel": GROUP_LABEL.get(col2group.get(name, "other"), "Other"),
            "role": role,
            "plottable": role != "meta",
            "nanPct": round(nan / rows, 4) if rows else 0.0,
        }
        if role == "oscillator":
            mc["band"] = band_of(name)
        manifest_cols.append(mc)

    if len(manifest_cols) != 149:
        raise SystemExit(f"BLOCKED: emitted {len(manifest_cols)} cols != 149")

    win_start = str(df["open_time_utc"].iloc[0])
    win_end = str(df["open_time_utc"].iloc[-1])

    manifest = {
        "symbol": ledger["symbol"],
        "interval": tf,
        "rows": rows,
        "canonicalRows": total,
        "columnCount": len(manifest_cols),
        "windowMode": "tail",
        "windowN": WINDOW_N[tf],
        "windowRowRange": [start_idx, total],  # canonical [start, end)
        "windowStart": win_start,
        "windowEnd": win_end,
        "tsRangeCanonical": art["ts_range"],
        # provenance / integrity (surfaced on the chart)
        "csvSha256": art["csv_sha256"],
        "ledgerSha256": LEDGER_SHA,
        "scriptSha1": ledger["canonical_script_sha1"],
        "scriptSha256": ledger["canonical_script_sha256"],
        "causalNote": ledger["causal_note"],
        "gateVerdict": ledger["validation_results"]["overall"],
        "generatedBy": ledger["generated_by"],
        "generatedAt": ledger["generated_at_utc"],
        "columns": manifest_cols,
    }
    return {"manifest": manifest, "time": time_ms, "columns": columns}


def main() -> None:
    global LEDGER_SHA
    if not LEDGER.exists():
        raise SystemExit(f"BLOCKED: ledger not found at {LEDGER}")
    ledger = json.loads(LEDGER.read_text())
    LEDGER_SHA = sha256(LEDGER)

    if ledger["validation_results"]["overall"].split()[0] != "PASS":
        raise SystemExit(
            f"BLOCKED: ledger overall verdict is "
            f"{ledger['validation_results']['overall']!r}, not PASS"
        )

    # ── integrity gate: recompute every CSV hash, match the ledger ───────────
    print("verifying certified CSV hashes …")
    for tf in ("5m", "1h"):
        expect = ledger["artifacts"][tf]["csv_sha256"]
        got = sha256(CSV[tf])
        if got != expect:
            raise SystemExit(
                f"BLOCKED: {tf} CSV sha256 mismatch\n  expect {expect}\n  got    {got}"
            )
        print(f"  {tf}: {got[:12]}… PASS")

    col2group = group_lookup(ledger)

    OUT.mkdir(parents=True, exist_ok=True)
    written = []
    role_tally = {}
    for tf in ("5m", "1h"):
        exp = build_export(tf, ledger, col2group)
        dst = OUT / f"ta_v3_btcusdt_{tf}.json"
        dst.write_text(json.dumps(exp, separators=(",", ":")))
        kb = dst.stat().st_size / 1024
        m = exp["manifest"]
        written.append((tf, m["rows"], m["canonicalRows"], kb))
        if not role_tally:
            for c in m["columns"]:
                role_tally[c["role"]] = role_tally.get(c["role"], 0) + 1
        print(
            f"  {tf}: {m['rows']} of {m['canonicalRows']} canonical rows · "
            f"{m['columnCount']}/149 cols → {dst.name} ({kb:.0f} KB)"
        )

    # provenance summary the page imports for the Gate cards
    prov = {
        "ledgerType": ledger["ledger_type"],
        "generatedBy": ledger["generated_by"],
        "generatedAt": ledger["generated_at_utc"],
        "symbol": ledger["symbol"],
        "timeframes": ledger["timeframes"],
        "ledgerSha256": LEDGER_SHA,
        "scriptSha1": ledger["canonical_script_sha1"],
        "scriptSha256": ledger["canonical_script_sha256"],
        "causalNote": ledger["causal_note"],
        "columnCount": ledger["column_schema"]["total_columns"],
        "artifacts": {
            tf: {
                "csvSha256": ledger["artifacts"][tf]["csv_sha256"],
                "rows": ledger["artifacts"][tf]["rows"],
                "tsRange": ledger["artifacts"][tf]["ts_range"],
                "shownRows": WINDOW_N[tf],
            }
            for tf in ("5m", "1h")
        },
        "validation": ledger["validation_results"],
        "relativePriceFields": ledger["relative_price_fields"]["total_rel_columns"],
        "roleTally": role_tally,
        "windowing": {
            "mode": "tail",
            "n": WINDOW_N,
            "note": (
                "All 149 certified columns are exported. Only rows are windowed: "
                "the most-recent N rows per timeframe (browser-safe; past warmup "
                "nulls). No values recomputed; cells copied verbatim from the "
                "certified CSV (NaN→null). Window is reproducible via windowRowRange."
            ),
        },
    }
    (OUT / "ta_v3_provenance.json").write_text(json.dumps(prov, indent=2))
    print("  provenance → ta_v3_provenance.json")
    print("role tally:", role_tally)
    print("done:", len(written), "timeframe exports written")


LEDGER_SHA = ""

if __name__ == "__main__":
    main()
