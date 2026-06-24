#!/usr/bin/env python3
"""Generate the Kerry page's TA-v3 exports for all 38 certified symbol/TF pairs.

Source of truth (READ-ONLY — never mutated): Chronos' certified batch outputs at
  EVIDENCE/ta_v3_production_20260624/<SYMBOL>_<TF>_ta_v3.csv  +  *_run.manifest.json

Integrity gate (data is sacred — dual hash gate):
  Gate 1: sha256(output_csv) == manifest.output_csv_sha256
  Gate 2: manifest.ts_aligned == True AND manifest.input_row_match == True
A mismatch or missing file ABORTS the run (BLOCKED) — we never guess.

Browser-safe loading: all 150 certified columns are exported.  Only ROWS are
windowed (most-recent WINDOW_N per TF).  No values recomputed; cells copied
verbatim (NaN→null).  5m files are 600k rows / 20–32 MB — the tail window
keeps browser payloads to ~4–5 MB per pair.

Emits into public/data/:
  kerry_ta_v3_<SYMBOL>_<TF>.json   (38 files — TaV3Export contract)
  kerry_ta_v3_provenance.json       (master provenance / hash table)
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
EVIDENCE = Path(
    "/Users/julesdevaux/.openclaw/agents/chronos/workspace/"
    "EVIDENCE/ta_v3_production_20260624"
)

# 38 pairs: BTC/ETH/BNB/FET/PEPE/SHIB/SOL/SUI/XRP → 5m,1h,4h,1D; DOGE → 5m,1h
ALL_PAIRS: dict[str, list[str]] = {
    "BTCUSDT":  ["5m", "1h", "4h", "1D"],
    "BNBUSDT":  ["5m", "1h", "4h", "1D"],
    "ETHUSDT":  ["5m", "1h", "4h", "1D"],
    "FETUSDT":  ["5m", "1h", "4h", "1D"],
    "PEPEUSDT": ["5m", "1h", "4h", "1D"],
    "SHIBUSDT": ["5m", "1h", "4h", "1D"],
    "SOLUSDT":  ["5m", "1h", "4h", "1D"],
    "SUIUSDT":  ["5m", "1h", "4h", "1D"],
    "XRPUSDT":  ["5m", "1h", "4h", "1D"],
    "DOGEUSDT": ["5m", "1h"],
}

# tail-window (rows) — most-recent candles exported per TF
WINDOW_N: dict[str, int] = {"5m": 2000, "1h": 2000, "4h": 2000, "1D": 2000}

OUT = Path(__file__).resolve().parent.parent / "public" / "data"

# ── column classification ─────────────────────────────────────────────────────

_OVERLAY_RE = re.compile(
    r"^(ema_\d+|ma_\d+|bolinger_(sma|upper|lower)|donchian_(upper|lower|mid)_\d+"
    r"|keltner_(mid|upper|lower)_\d+|ichimoku_(conversion|base|span_a|span_b)"
    r"|htf_(1h|1D)_(partial|confirmed)_(open|high|low|close)"
    r"|(?:1h|1D)_level_breakout_(?:bear|bull)"
    r"|(?:1h|1D)_(?:resistance|support)_level)$"
)

META = {
    "open_time_utc", "open_time_ms", "available_at_utc",
    "htf_1h_partial_bucket_close_utc", "htf_1h_confirmed_available_at_utc",
    "htf_1D_partial_bucket_close_utc", "htf_1D_confirmed_available_at_utc",
}
PRICE  = {"open", "high", "low", "close"}
VOLUME = {"volume"}
MARKER = {"candle_doji", "candle_marubozu", "gann_swing", "gann_swing_change",
          "gann_swing_top", "gann_swing_bottom"}


def role_of(name: str) -> str:
    if name in PRICE:
        return "price"
    if name in VOLUME:
        return "volume"
    if name in META:
        return "meta"
    if name in MARKER:
        return "marker"
    if name in ("median", "vwap") or _OVERLAY_RE.match(name):
        return "overlay"
    return "oscillator"


def band_of(name: str) -> str:
    if name.endswith("_rel_median") or name.endswith("_rel_open"):
        return "rel"
    if name in ("open_rel_1h_levels", "open_rel_1D_levels"):
        return "sr_dist"
    if name in ("rsi", "stochastic_k", "stochastic_d", "plus_di_14",
                "minus_di_14", "adx_14", "williams_r_14", "mfi_14",
                "donchian_position_20"):
        return "bounded"
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


def group_of(name: str) -> tuple[str, str]:
    if name in PRICE | VOLUME | {"open_time_utc", "open_time_ms", "available_at_utc"}:
        return "base_ohlcv", "Base OHLCV"
    if name in ("time_day_sin", "time_day_cos"):
        return "time_encoding", "Time encoding"
    if name in ("median", "span", "span_rel_median", "span_rel_open"):
        return "price_primitives", "Price primitives"
    if name.startswith("ema_") or name.startswith("median_rel_ema_") or name.startswith("open_rel_ema_"):
        return "ema_family", "EMA family"
    if name.startswith("ma_") or name.startswith("median_rel_ma_") or name.startswith("open_rel_ma_"):
        return "ma_family", "MA family"
    if name.startswith("macd"):
        return "macd", "MACD"
    if name.startswith("rsi"):
        return "rsi", "RSI"
    if name.startswith("vwap"):
        return "vwap", "VWAP"
    if name.startswith("stochastic"):
        return "stochastic", "Stochastic"
    if name.startswith("bolinger"):
        return "bollinger_bands", "Bollinger bands"
    if name in ("true_range", "atr_14", "atr_14_rel_median"):
        return "volatility", "Volatility (ATR / TR)"
    if name in ("plus_di_14", "minus_di_14", "adx_14"):
        return "directional", "Directional (DI / ADX)"
    if name in ("cci_20", "williams_r_14", "roc_12", "momentum_12", "obv", "mfi_14", "cmf_20"):
        return "oscillators", "Oscillators"
    if name.startswith("donchian"):
        return "donchian", "Donchian"
    if name.startswith("keltner"):
        return "keltner", "Keltner"
    if name.startswith("ichimoku"):
        return "ichimoku", "Ichimoku (causal)"
    if name.startswith("candle_"):
        return "candle_patterns", "Candle patterns"
    if name.startswith("gann"):
        return "gann", "Gann"
    if name.startswith("htf_1h"):
        return "htf_1h", "HTF 1h context"
    if name.startswith("htf_1D"):
        return "htf_1D", "HTF 1D context"
    if "1h_" in name or "1D_" in name or name.startswith("open_rel_1"):
        return "support_resistance", "Support / resistance"
    return "other", "Other"


# ── helpers ───────────────────────────────────────────────────────────────────

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def cell(v):
    if v is None:
        return None
    if isinstance(v, float):
        return None if math.isnan(v) else v
    try:
        if pd.isna(v):
            return None
    except (ValueError, TypeError):
        pass
    if isinstance(v, int):
        return v
    return str(v)


def read_first_ts(path: Path) -> str | None:
    try:
        first = pd.read_csv(path, nrows=1)
        return str(first["open_time_utc"].iloc[0]) if "open_time_utc" in first.columns else None
    except Exception:
        return None


def read_tail(path: Path, total: int, n: int) -> tuple[pd.DataFrame, int]:
    if total > n:
        skip = range(1, total - n + 1)
        df = pd.read_csv(path, skiprows=skip)
        start_idx = total - n
    else:
        df = pd.read_csv(path)
        start_idx = 0
    return df.reset_index(drop=True), start_idx


# ── per-pair build ────────────────────────────────────────────────────────────

def build_pair(symbol: str, tf: str, verbose: bool = True) -> dict:
    csv_path = EVIDENCE / f"{symbol}_{tf}_ta_v3.csv"
    mfst_path = EVIDENCE / f"{symbol}_{tf}_ta_v3_run.manifest.json"

    if not csv_path.exists():
        raise SystemExit(f"BLOCKED: CSV not found: {csv_path}")
    if not mfst_path.exists():
        raise SystemExit(f"BLOCKED: manifest not found: {mfst_path}")

    mfst = json.loads(mfst_path.read_text())

    # ── gate 1: output CSV sha256 ─────────────────────────────────────────────
    expect_sha = mfst.get("output_csv_sha256")
    if not expect_sha:
        raise SystemExit(f"BLOCKED: {symbol}/{tf} manifest missing output_csv_sha256")
    if verbose:
        print(f"  sha256({symbol}/{tf})…", end=" ", flush=True)
    got_sha = sha256(csv_path)
    if got_sha != expect_sha:
        raise SystemExit(
            f"BLOCKED: {symbol}/{tf} CSV sha256 mismatch\n"
            f"  expect {expect_sha}\n  got    {got_sha}"
        )
    if verbose:
        print(f"{got_sha[:12]}… PASS", flush=True)

    # ── gate 2: alignment flags ────────────────────────────────────────────────
    if not mfst.get("ts_aligned"):
        raise SystemExit(f"BLOCKED: {symbol}/{tf} manifest.ts_aligned is not True")
    if not mfst.get("input_row_match"):
        raise SystemExit(f"BLOCKED: {symbol}/{tf} manifest.input_row_match is not True")

    total = int(mfst["row_count"])
    n = WINDOW_N[tf]
    first_ts = read_first_ts(csv_path)

    df, start_idx = read_tail(csv_path, total, n)
    ordered = list(df.columns)
    col_count = len(ordered)

    rows = len(df)
    time_ms = [int(v) for v in df["open_time_ms"].tolist()]

    columns: dict[str, list] = {}
    manifest_cols = []
    for name in ordered:
        series = df[name].tolist()
        columns[name] = [cell(v) for v in series]
        role = role_of(name)
        nan_n = sum(1 for v in columns[name] if v is None)
        gkey, glabel = group_of(name)
        mc: dict = {
            "name": name,
            "dtype": str(df[name].dtype),
            "group": gkey,
            "groupLabel": glabel,
            "role": role,
            "plottable": role != "meta",
            "nanPct": round(nan_n / rows, 4) if rows else 0.0,
        }
        if role == "oscillator":
            mc["band"] = band_of(name)
        manifest_cols.append(mc)

    win_start = str(df["open_time_utc"].iloc[0])
    win_end   = str(df["open_time_utc"].iloc[-1])

    manifest_sha = sha256(mfst_path)

    manifest = {
        "symbol": symbol,
        "interval": tf,
        "rows": rows,
        "canonicalRows": total,
        "columnCount": col_count,
        "windowMode": "tail",
        "windowN": n,
        "windowRowRange": [start_idx, total],
        "windowStart": win_start,
        "windowEnd": win_end,
        "tsRangeCanonical": {
            "first": first_ts or win_start,
            "last": win_end,
        },
        # provenance / integrity
        "csvSha256": got_sha,
        "ledgerSha256": manifest_sha,
        "scriptSha1": mfst.get("code_sha1", ""),
        "scriptSha256": mfst.get("code_sha256", ""),
        "causalNote": f"TA-v3 production batch, causal={mfst.get('causal', True)}, "
                      f"gann={mfst.get('gann_calculation_contract', '')}",
        "gateVerdict": (
            f"PASS — output_csv_sha256 verified ({got_sha[:12]}…), "
            f"ts_aligned=True, input_row_match=True"
        ),
        "generatedBy": mfst.get("runner", "ta_v3_batch_runner.py"),
        "generatedAt": "2026-06-25",
        "taVersion": mfst.get("technical_analysis_version", "v3"),
        "nullPolicy": mfst.get("null_policy", ""),
        "columns": manifest_cols,
    }
    return {
        "manifest": manifest,
        "time": time_ms,
        "columns": columns,
    }


# ── main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    provenance: dict[str, dict[str, dict]] = {}
    total_files = sum(len(tfs) for tfs in ALL_PAIRS.values())
    done = 0

    for symbol, tfs in ALL_PAIRS.items():
        provenance[symbol] = {}
        for tf in tfs:
            done += 1
            print(f"[{done}/{total_files}] {symbol} {tf}", flush=True)
            exp = build_pair(symbol, tf)
            dst = OUT / f"kerry_ta_v3_{symbol}_{tf}.json"
            dst.write_text(json.dumps(exp, separators=(",", ":")))
            kb = dst.stat().st_size / 1024
            m = exp["manifest"]
            provenance[symbol][tf] = {
                "csvSha256":    m["csvSha256"],
                "manifestSha256": m["ledgerSha256"],
                "rows":         m["rows"],
                "canonicalRows": m["canonicalRows"],
                "columnCount":  m["columnCount"],
                "windowStart":  m["windowStart"],
                "windowEnd":    m["windowEnd"],
                "gateVerdict":  m["gateVerdict"],
                "fileSizeKb":   round(kb, 1),
                "real": True,
            }
            print(
                f"    {m['rows']:,} of {m['canonicalRows']:,} rows · "
                f"{m['columnCount']} cols → {dst.name} ({kb:.0f} KB)",
                flush=True,
            )

    prov = {
        "manifestType": "KERRY_TA_V3",
        "taVersion": "v3",
        "evidenceDir": str(EVIDENCE),
        "generatedAt": "2026-06-25",
        "windowMode": "tail",
        "windowN": WINDOW_N,
        "pairs": provenance,
        "symbolTimeframes": {sym: tfs for sym, tfs in ALL_PAIRS.items()},
        "windowing": {
            "mode": "tail",
            "n": WINDOW_N,
            "note": (
                "All 150 certified TA-v3 columns are exported. Only rows are windowed: "
                "the most-recent N rows per timeframe (browser-safe; past warmup nulls). "
                "No values recomputed; cells copied verbatim from the certified CSVs (NaN→null). "
                "Window is reproducible via windowRowRange."
            ),
        },
    }
    (OUT / "kerry_ta_v3_provenance.json").write_text(json.dumps(prov, indent=2))
    print(f"\nProvenance → kerry_ta_v3_provenance.json")
    print(f"Done: {total_files} exports written.")


if __name__ == "__main__":
    main()
