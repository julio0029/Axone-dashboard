#!/usr/bin/env python3
"""Generate the Chronos page's predictive-targets export JSON.

Source of truth (READ-ONLY — never mutated): Chronos owns and runs
`build_predictive_targets_v1.py`, which consumes the certified causal
Technical_analysis_v3 CSVs and emits one row of predictive TARGET columns
(the training labels for Tibot bots) per candle.

  Targets bundle  EVIDENCE/targets_btcusdt_v3_20260623/
    BTCUSDT_5m_targets_v1.csv   630,834 rows  (timestamp + 25 target cols)
    BTCUSDT_1h_targets_v1.csv    52,577 rows
    *.manifest.json             (output_sha256, source_sha256, contract)

  OHLCV source  EVIDENCE/ta_v3_btcusdt_20260622_corrected/
    BTCUSDT_{5m,1h}_ta_v3.csv   (the manifest's source_file — open/high/low/
                                 close/volume + open_time_utc/_ms)

The targets CSV holds ONLY the labels + timestamp/available_at_utc — it carries
no price. We join it to the certified OHLCV source on the timestamp column
(targets.timestamp == source.open_time_utc) so the page can draw candlesticks
with the predictive targets overlaid candle-by-candle.

Integrity gate (data is sacred): every CSV's SHA-256 is recomputed and matched
against the targets manifest before any JSON is written —
  targets CSV  vs manifest.output_sha256
  OHLCV CSV    vs manifest.source_sha256
A mismatch, a row-count/timestamp-alignment drift, or a missing target column
ABORTS the run (BLOCKED) — we never guess.

Browser-safe loading: all 25 target columns + OHLCV are exported; only ROWS are
windowed (most-recent N per timeframe). No values are recomputed or altered —
cells are copied verbatim (NaN/'' → null).

Emits into public/data/:
  chronos_targets_btcusdt_5m.json, chronos_targets_btcusdt_1h.json
  chronos_targets_provenance.json
"""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import pandas as pd

# ── certified source bundles (read-only) ─────────────────────────────────────
TARGETS_DIR = Path(
    "/Users/julesdevaux/.openclaw/agents/chronos/workspace/"
    "EVIDENCE/targets_btcusdt_v3_20260623"
)
TARGETS_CSV = {
    "5m": TARGETS_DIR / "BTCUSDT_5m_targets_v1.csv",
    "1h": TARGETS_DIR / "BTCUSDT_1h_targets_v1.csv",
}
TARGETS_MANIFEST = {
    "5m": TARGETS_DIR / "BTCUSDT_5m_targets_v1.manifest.json",
    "1h": TARGETS_DIR / "BTCUSDT_1h_targets_v1.manifest.json",
}
# Chronos-owned generator script (read-only) — recorded for provenance.
BUILD_SCRIPT = Path(
    "/Users/julesdevaux/.openclaw/agents/chronos/scripts/"
    "build_predictive_targets_v1.py"
)

# tail-window size (rows) per timeframe — most-recent N labelled candles.
WINDOW_N = {"5m": 2000, "1h": 2000}

OUT = Path(__file__).resolve().parent.parent / "public" / "data"

# OHLCV columns pulled from the certified TA-v3 source (verbatim).
OHLCV = ["open", "high", "low", "close", "volume"]
JOIN_KEY_SRC = "open_time_utc"   # source timestamp
JOIN_KEY_TGT = "timestamp"       # targets timestamp
PASSTHROUGH = ["timestamp", "available_at_utc"]

# ── target-column classification (deterministic, over the 25-col contract) ───
# Each target is given a render role:
#   direction  → categorical label drawn as a coloured marker on the price pane
#   numeric    → numeric series drawn in a banded sub-pane (band groups scales)
#   meta       → timestamp passthrough (inspection layer, never plotted)
TARGET_SPEC = {
    # next-candle outlook ----------------------------------------------------
    "target_candle_color_1":  ("direction", "color",      "Next-candle",  "Colour of candle t+1 (green/red/flat)."),
    "target_candle_color_2":  ("direction", "color",      "Next-candle",  "Colour of candle t+2."),
    "target_candle_color_3":  ("direction", "color",      "Next-candle",  "Colour of candle t+3."),
    "target_candle_pct_1":    ("numeric",   "candle_pct", "Next-candle",  "Close-to-close % move of candle t+1."),
    "target_candle_pct_2":    ("numeric",   "candle_pct", "Next-candle",  "Close-to-close % move of candle t+2."),
    "target_candle_pct_3":    ("numeric",   "candle_pct", "Next-candle",  "Close-to-close % move of candle t+3."),
    # forward returns / direction -------------------------------------------
    "target_direction_1":     ("direction", "dir",        "Forward",      "Direction over next 1 bar (up/down/flat)."),
    "target_direction_3":     ("direction", "dir",        "Forward",      "Direction over next 3 bars."),
    "target_direction_12":    ("direction", "dir",        "Forward",      "Direction over next 12 bars."),
    "target_fwd_return_1":    ("numeric",   "returns",    "Forward",      "Forward simple return over 1 bar."),
    "target_fwd_return_3":    ("numeric",   "returns",    "Forward",      "Forward simple return over 3 bars."),
    "target_fwd_return_12":   ("numeric",   "returns",    "Forward",      "Forward simple return over 12 bars."),
    "target_log_return_1":    ("numeric",   "returns",    "Forward",      "Forward log return over 1 bar."),
    "target_log_return_3":    ("numeric",   "returns",    "Forward",      "Forward log return over 3 bars."),
    "target_log_return_12":   ("numeric",   "returns",    "Forward",      "Forward log return over 12 bars."),
    # excursion / volatility -------------------------------------------------
    "target_mfe_12":          ("numeric",   "excursion",  "Excursion",    "Max favourable excursion over 12 bars."),
    "target_mae_12":          ("numeric",   "excursion",  "Excursion",    "Max adverse excursion over 12 bars."),
    "target_realized_vol_12": ("numeric",   "vol",        "Excursion",    "Realised volatility over 12 bars."),
    "target_first_passage_12":("direction", "passage",    "Excursion",    "First ±1·ATR barrier touched in 12 bars."),
    # EMA-9/21 reversal ------------------------------------------------------
    "target_reversal_bars_ema_9_21":     ("numeric",   "rev_bars", "EMA reversal", "Bars until next EMA-9/21 crossover."),
    "target_reversal_pct_move_ema_9_21": ("numeric",   "rev_pct",  "EMA reversal", "% move to that EMA-9/21 reversal."),
    "target_reversal_direction_ema_9_21":("direction", "dir",      "EMA reversal", "Direction of the next EMA-9/21 reversal."),
    # Gann swing -------------------------------------------------------------
    "target_gann_bars_to_next_swing":    ("numeric",   "gann_bars","Gann swing",   "Bars to the next confirmed Gann swing."),
    "target_gann_pct_to_next_swing":     ("numeric",   "gann_pct", "Gann swing",   "% move to the next Gann swing extremum."),
    "target_gann_next_direction":        ("direction", "dir",      "Gann swing",   "Direction of the next Gann swing."),
}

# numeric sub-pane band → human label + ordering
BAND_LABEL = {
    "candle_pct": "Next-candle % move",
    "returns":    "Forward returns (simple / log)",
    "excursion":  "MFE / MAE (12)",
    "vol":        "Realised vol (12)",
    "rev_bars":   "EMA-reversal · bars",
    "rev_pct":    "EMA-reversal · % move",
    "gann_bars":  "Gann swing · bars",
    "gann_pct":   "Gann swing · % move",
}
BAND_ORDER = ["candle_pct", "returns", "excursion", "vol",
              "rev_bars", "rev_pct", "gann_bars", "gann_pct"]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def sha1(path: Path) -> str:
    h = hashlib.sha1()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def cell_num(v):
    """Verbatim numeric cell → JSON. NaN/None → None. No recompute."""
    if v is None:
        return None
    if isinstance(v, float):
        return None if math.isnan(v) else v
    try:
        if pd.isna(v):
            return None
    except (ValueError, TypeError):
        pass
    if isinstance(v, (int,)):
        return v
    try:
        f = float(v)
        return None if math.isnan(f) else f
    except (ValueError, TypeError):
        return None


def cell_str(v):
    """Verbatim categorical/timestamp cell → JSON. NaN/'' → None."""
    if v is None:
        return None
    try:
        if pd.isna(v):
            return None
    except (ValueError, TypeError):
        pass
    s = str(v).strip()
    return s if s else None


def read_tail(path: Path, total: int, n: int) -> tuple[pd.DataFrame, int]:
    """Read header + the last n rows only (memory-safe for the big 5m files)."""
    if total > n:
        skip = range(1, total - n + 1)  # keep header (row 0) + final n rows
        df = pd.read_csv(path, skiprows=skip)
        start_idx = total - n
    else:
        df = pd.read_csv(path)
        start_idx = 0
    return df.reset_index(drop=True), start_idx


def to_ms(series: pd.Series) -> list[int]:
    """UTC timestamp strings → epoch-ms ints (verbatim, no shift)."""
    dt = pd.to_datetime(series, utc=True)
    return [int(v.value // 1_000_000) for v in dt]


def build_export(tf: str, manifest: dict, src_csv: Path) -> dict:
    n = WINDOW_N[tf]
    total = int(manifest["row_count_output"])

    tdf, start_idx = read_tail(TARGETS_CSV[tf], total, n)
    sdf, src_start = read_tail(src_csv, int(manifest["row_count_input"]), n)

    # ── schema gate: every contract target column present ────────────────────
    target_cols = manifest["target_columns"]
    missing = [c for c in target_cols if c not in tdf.columns]
    if missing:
        raise SystemExit(f"BLOCKED: {tf} targets missing columns: {missing}")
    for c in OHLCV + [JOIN_KEY_SRC]:
        if c not in sdf.columns:
            raise SystemExit(f"BLOCKED: {tf} source missing column: {c}")

    if len(tdf) != len(sdf):
        raise SystemExit(
            f"BLOCKED: {tf} row-count mismatch targets={len(tdf)} source={len(sdf)}"
        )

    # ── alignment gate: timestamps must match row-for-row ────────────────────
    tgt_ts = pd.to_datetime(tdf[JOIN_KEY_TGT], utc=True).reset_index(drop=True)
    src_ts = pd.to_datetime(sdf[JOIN_KEY_SRC], utc=True).reset_index(drop=True)
    if not tgt_ts.equals(src_ts):
        bad = int((tgt_ts != src_ts).sum())
        raise SystemExit(
            f"BLOCKED: {tf} timestamp misalignment — {bad}/{len(tgt_ts)} rows "
            f"differ between targets and OHLCV source"
        )

    rows = len(tdf)
    time_ms = to_ms(tdf[JOIN_KEY_TGT])

    columns: dict[str, list] = {}
    # OHLCV (numeric, verbatim from certified source)
    for c in OHLCV:
        columns[c] = [cell_num(v) for v in sdf[c].tolist()]
    # passthrough timestamps (string meta)
    for c in PASSTHROUGH:
        if c in tdf.columns:
            columns[c] = [cell_str(v) for v in tdf[c].tolist()]

    manifest_cols = []
    for name in target_cols:
        role, band, group, desc = TARGET_SPEC.get(
            name, ("numeric", "misc", "Other", "")
        )
        raw = tdf[name].tolist()
        if role == "direction":
            columns[name] = [cell_str(v) for v in raw]
        else:
            columns[name] = [cell_num(v) for v in raw]
        nan = sum(1 for v in columns[name] if v is None)
        mc = {
            "name": name,
            "dtype": str(tdf[name].dtype),
            "role": role,
            "band": band,
            "bandLabel": BAND_LABEL.get(band, ""),
            "group": group,
            "desc": desc,
            "nanPct": round(nan / rows, 4) if rows else 0.0,
        }
        manifest_cols.append(mc)

    win_start = cell_str(tdf[JOIN_KEY_TGT].iloc[0])
    win_end = cell_str(tdf[JOIN_KEY_TGT].iloc[-1])

    out_manifest = {
        "symbol": "BTCUSDT",
        "interval": tf,
        "rows": rows,
        "canonicalRows": total,
        "targetCount": len(manifest_cols),
        "windowMode": "tail",
        "windowN": n,
        "windowRowRange": [start_idx, total],
        "windowStart": win_start,
        "windowEnd": win_end,
        # provenance / integrity
        "targetsCsvSha256": manifest["output_sha256"],
        "sourceCsvSha256": manifest["source_sha256"],
        "sourceFile": manifest["source_file"],
        "buildScriptSha1": BUILD_SCRIPT_SHA1,
        "manifestVersion": manifest["version"],
        "generatedAtUtc": manifest["created_at_utc"],
        "leakagePolicy": manifest["leakage_policy"],
        "nullPolicy": manifest["null_policy"],
        "parameters": manifest["parameters"],
        "gannEventContract": manifest["gann_event_contract"],
        "ohlcv": OHLCV,
        "passthrough": PASSTHROUGH,
        "columns": manifest_cols,
    }
    return {"manifest": out_manifest, "time": time_ms, "columns": columns}


def main() -> None:
    global BUILD_SCRIPT_SHA1
    BUILD_SCRIPT_SHA1 = sha1(BUILD_SCRIPT) if BUILD_SCRIPT.exists() else None

    manifests = {}
    print("verifying certified target + source CSV hashes …")
    for tf in ("5m", "1h"):
        mpath = TARGETS_MANIFEST[tf]
        if not mpath.exists():
            raise SystemExit(f"BLOCKED: targets manifest not found at {mpath}")
        m = json.loads(mpath.read_text())
        manifests[tf] = m

        # gate 1: targets CSV vs manifest.output_sha256
        got_t = sha256(TARGETS_CSV[tf])
        if got_t != m["output_sha256"]:
            raise SystemExit(
                f"BLOCKED: {tf} targets sha256 mismatch\n"
                f"  expect {m['output_sha256']}\n  got    {got_t}"
            )
        # gate 2: OHLCV source CSV vs manifest.source_sha256
        src_csv = Path(m["source_file"])
        if not src_csv.exists():
            raise SystemExit(f"BLOCKED: {tf} source CSV not found at {src_csv}")
        got_s = sha256(src_csv)
        if got_s != m["source_sha256"]:
            raise SystemExit(
                f"BLOCKED: {tf} source sha256 mismatch\n"
                f"  expect {m['source_sha256']}\n  got    {got_s}"
            )
        print(f"  {tf}: targets {got_t[:12]}… PASS · source {got_s[:12]}… PASS")

    OUT.mkdir(parents=True, exist_ok=True)
    written = []
    for tf in ("5m", "1h"):
        exp = build_export(tf, manifests[tf], Path(manifests[tf]["source_file"]))
        dst = OUT / f"chronos_targets_btcusdt_{tf}.json"
        dst.write_text(json.dumps(exp, separators=(",", ":")))
        kb = dst.stat().st_size / 1024
        m = exp["manifest"]
        written.append((tf, m["rows"], m["canonicalRows"], kb))
        print(
            f"  {tf}: {m['rows']} of {m['canonicalRows']} canonical rows · "
            f"{m['targetCount']} targets + OHLCV → {dst.name} ({kb:.0f} KB)"
        )

    # provenance summary the page imports for the integrity/leakage cards
    m5 = manifests["5m"]
    prov = {
        "manifestType": "CHRONOS_PREDICTIVE_TARGETS",
        "version": m5["version"],
        "symbol": "BTCUSDT",
        "timeframes": ["5m", "1h"],
        "generatedAtUtc": m5["created_at_utc"],
        "buildScript": str(BUILD_SCRIPT),
        "buildScriptSha1": BUILD_SCRIPT_SHA1,
        "parameters": m5["parameters"],
        "leakagePolicy": m5["leakage_policy"],
        "nullPolicy": m5["null_policy"],
        "gannEventContract": m5["gann_event_contract"],
        "purgeEmbargoRequiredBars": m5.get("purge_embargo_required_bars"),
        "sameCandleDualTouchPolicy": m5.get("same_candle_dual_touch_policy"),
        "artifacts": {
            tf: {
                "targetsCsvSha256": manifests[tf]["output_sha256"],
                "sourceCsvSha256": manifests[tf]["source_sha256"],
                "sourceFile": manifests[tf]["source_file"],
                "canonicalRows": manifests[tf]["row_count_output"],
                "shownRows": WINDOW_N[tf],
            }
            for tf in ("5m", "1h")
        },
        "targetColumns": m5["target_columns"],
        "bandOrder": BAND_ORDER,
        "bandLabel": BAND_LABEL,
        "windowing": {
            "mode": "tail",
            "n": WINDOW_N,
            "note": (
                "All 25 predictive target columns + OHLCV are exported. Only rows "
                "are windowed (most-recent N per timeframe; browser-safe). OHLCV is "
                "joined from the certified TA-v3 source on timestamp == open_time_utc "
                "(row-for-row alignment asserted). No values recomputed; cells copied "
                "verbatim from the certified CSVs (NaN/''→null)."
            ),
        },
    }
    (OUT / "chronos_targets_provenance.json").write_text(json.dumps(prov, indent=2))
    print("  provenance → chronos_targets_provenance.json")
    print("done:", len(written), "timeframe exports written")


BUILD_SCRIPT_SHA1 = None

if __name__ == "__main__":
    main()
