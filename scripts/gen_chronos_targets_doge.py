#!/usr/bin/env python3
"""Generate the Chronos page's predictive-targets export JSON for DOGEUSDT.

Same dual hash-gate and alignment-assert contract as gen_chronos_targets.py
(BTCUSDT).  Source of truth (READ-ONLY — Chronos owns, never mutate):

  Targets bundle  EVIDENCE/targets_dogeusdt_v3_20260624/
    DOGEUSDT_5m_targets_v1.csv   630,834 rows (timestamp + 25 target cols)
    DOGEUSDT_1h_targets_v1.csv    52,577 rows
    *.manifest.json              (output_sha256, source_sha256, contract)

  OHLCV source  EVIDENCE/ta_v3_dogeusdt_20260624/
    DOGEUSDT_{5m,1h}_ta_v3.csv  (manifest's source_file — open/high/low/
                                  close/volume + open_time_utc)

Emits into public/data/:
  chronos_targets_dogeusdt_5m.json
  chronos_targets_dogeusdt_1h.json
  chronos_targets_provenance_dogeusdt.json
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
    "EVIDENCE/targets_dogeusdt_v3_20260624"
)
TARGETS_CSV = {
    "5m": TARGETS_DIR / "DOGEUSDT_5m_targets_v1.csv",
    "1h": TARGETS_DIR / "DOGEUSDT_1h_targets_v1.csv",
}
TARGETS_MANIFEST = {
    "5m": TARGETS_DIR / "DOGEUSDT_5m_targets_v1.manifest.json",
    "1h": TARGETS_DIR / "DOGEUSDT_1h_targets_v1.manifest.json",
}
BUILD_SCRIPT = Path(
    "/Users/julesdevaux/.openclaw/agents/chronos/scripts/"
    "build_predictive_targets_v1.py"
)

WINDOW_N = {"5m": 2000, "1h": 2000}
OUT = Path(__file__).resolve().parent.parent / "public" / "data"

OHLCV = ["open", "high", "low", "close", "volume"]
JOIN_KEY_SRC = "open_time_utc"
JOIN_KEY_TGT = "timestamp"
PASSTHROUGH = ["timestamp", "available_at_utc"]

TARGET_SPEC = {
    "target_candle_color_1":  ("direction", "color",      "Next-candle",  "Colour of candle t+1 (green/red/flat)."),
    "target_candle_color_2":  ("direction", "color",      "Next-candle",  "Colour of candle t+2."),
    "target_candle_color_3":  ("direction", "color",      "Next-candle",  "Colour of candle t+3."),
    "target_candle_pct_1":    ("numeric",   "candle_pct", "Next-candle",  "Close-to-close % move of candle t+1."),
    "target_candle_pct_2":    ("numeric",   "candle_pct", "Next-candle",  "Close-to-close % move of candle t+2."),
    "target_candle_pct_3":    ("numeric",   "candle_pct", "Next-candle",  "Close-to-close % move of candle t+3."),
    "target_direction_1":     ("direction", "dir",        "Forward",      "Direction over next 1 bar (up/down/flat)."),
    "target_direction_3":     ("direction", "dir",        "Forward",      "Direction over next 3 bars."),
    "target_direction_12":    ("direction", "dir",        "Forward",      "Direction over next 12 bars."),
    "target_fwd_return_1":    ("numeric",   "returns",    "Forward",      "Forward simple return over 1 bar."),
    "target_fwd_return_3":    ("numeric",   "returns",    "Forward",      "Forward simple return over 3 bars."),
    "target_fwd_return_12":   ("numeric",   "returns",    "Forward",      "Forward simple return over 12 bars."),
    "target_log_return_1":    ("numeric",   "returns",    "Forward",      "Forward log return over 1 bar."),
    "target_log_return_3":    ("numeric",   "returns",    "Forward",      "Forward log return over 3 bars."),
    "target_log_return_12":   ("numeric",   "returns",    "Forward",      "Forward log return over 12 bars."),
    "target_mfe_12":          ("numeric",   "excursion",  "Excursion",    "Max favourable excursion over 12 bars."),
    "target_mae_12":          ("numeric",   "excursion",  "Excursion",    "Max adverse excursion over 12 bars."),
    "target_realized_vol_12": ("numeric",   "vol",        "Excursion",    "Realised volatility over 12 bars."),
    "target_first_passage_12":("direction", "passage",    "Excursion",    "First ±1·ATR barrier touched in 12 bars."),
    "target_reversal_bars_ema_9_21":     ("numeric",   "rev_bars", "EMA reversal", "Bars until next EMA-9/21 crossover."),
    "target_reversal_pct_move_ema_9_21": ("numeric",   "rev_pct",  "EMA reversal", "% move to that EMA-9/21 reversal."),
    "target_reversal_direction_ema_9_21":("direction", "dir",      "EMA reversal", "Direction of the next EMA-9/21 reversal."),
    "target_gann_bars_to_next_swing":    ("numeric",   "gann_bars","Gann swing",   "Bars to the next confirmed Gann swing."),
    "target_gann_pct_to_next_swing":     ("numeric",   "gann_pct", "Gann swing",   "% move to the next Gann swing extremum."),
    "target_gann_next_direction":        ("direction", "dir",      "Gann swing",   "Direction of the next Gann swing."),
}

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
    try:
        f = float(v)
        return None if math.isnan(f) else f
    except (ValueError, TypeError):
        return None


def cell_str(v):
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
    if total > n:
        skip = range(1, total - n + 1)
        df = pd.read_csv(path, skiprows=skip)
        start_idx = total - n
    else:
        df = pd.read_csv(path)
        start_idx = 0
    return df.reset_index(drop=True), start_idx


def to_ms(series: pd.Series) -> list[int]:
    dt = pd.to_datetime(series, utc=True)
    return [int(v.value // 1_000_000) for v in dt]


def build_export(tf: str, manifest: dict, src_csv: Path) -> dict:
    n = WINDOW_N[tf]
    total = int(manifest["row_count_output"])

    tdf, start_idx = read_tail(TARGETS_CSV[tf], total, n)
    sdf, _ = read_tail(src_csv, int(manifest["row_count_input"]), n)

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
    for c in OHLCV:
        columns[c] = [cell_num(v) for v in sdf[c].tolist()]
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
        "symbol": "DOGEUSDT",
        "interval": tf,
        "rows": rows,
        "canonicalRows": total,
        "targetCount": len(manifest_cols),
        "windowMode": "tail",
        "windowN": n,
        "windowRowRange": [start_idx, total],
        "windowStart": win_start,
        "windowEnd": win_end,
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
    print("verifying certified DOGEUSDT target + source CSV hashes …")
    for tf in ("5m", "1h"):
        mpath = TARGETS_MANIFEST[tf]
        if not mpath.exists():
            raise SystemExit(f"BLOCKED: targets manifest not found at {mpath}")
        m = json.loads(mpath.read_text())
        manifests[tf] = m

        got_t = sha256(TARGETS_CSV[tf])
        if got_t != m["output_sha256"]:
            raise SystemExit(
                f"BLOCKED: {tf} targets sha256 mismatch\n"
                f"  expect {m['output_sha256']}\n  got    {got_t}"
            )
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
        dst = OUT / f"chronos_targets_dogeusdt_{tf}.json"
        dst.write_text(json.dumps(exp, separators=(",", ":")))
        kb = dst.stat().st_size / 1024
        m = exp["manifest"]
        written.append((tf, m["rows"], m["canonicalRows"], kb))
        print(
            f"  {tf}: {m['rows']} of {m['canonicalRows']} canonical rows · "
            f"{m['targetCount']} targets + OHLCV → {dst.name} ({kb:.0f} KB)"
        )

    m5 = manifests["5m"]
    prov = {
        "manifestType": "CHRONOS_PREDICTIVE_TARGETS",
        "version": m5["version"],
        "symbol": "DOGEUSDT",
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
    (OUT / "chronos_targets_provenance_dogeusdt.json").write_text(
        json.dumps(prov, indent=2)
    )
    print("  provenance → chronos_targets_provenance_dogeusdt.json")
    print("done:", len(written), "timeframe exports written")


BUILD_SCRIPT_SHA1 = None

if __name__ == "__main__":
    main()
