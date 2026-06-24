#!/usr/bin/env python3
"""Generate Chronos predictive-targets export JSON for all Phase-3 symbols/TFs.

Source (READ-ONLY — Chronos owns):
  EVIDENCE/targets_production_v3_20260625/
    {SYM}_{TF}_pt_v1.csv          (timestamp + available_at_utc + 25 target cols)
    {SYM}_{TF}_pt_v1.manifest.json (output_sha256, source_sha256, contract)
  EVIDENCE/ta_v3_production_20260624/
    {SYM}_{TF}_ta_v3.csv          (OHLCV source; referenced by manifest.source_file)

Coverage: 10 symbols × 4 TFs – 2 missing DOGE TFs = 38 combos.
  Symbols: BTC ETH BNB SOL XRP DOGE FET PEPE SHIB SUI
  TFs:     5m 1h 4h 1D   (DOGE: 5m 1h only)

Integrity gate: dual SHA-256 verify (targets CSV vs manifest.output_sha256;
source CSV vs manifest.source_sha256) + row-count + row-for-row timestamp-
alignment assert — BLOCKED on any mismatch.

Windowing: tail-N rows per TF (5m→2000, 1h→2000, 4h→1000, 1D→500).
All 25 target columns + OHLCV written verbatim (NaN/''→null). No recompute.

Emits into public/data/:
  chronos_targets_{sym_lower}_{tf_lower}.json   (38 files)
  chronos_targets_provenance_{sym_lower}.json   (10 files)
"""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import pandas as pd

# ── Phase-3 evidence bundle (READ-ONLY) ──────────────────────────────────────
EVIDENCE_DIR = Path(
    "/Users/julesdevaux/.openclaw/agents/chronos/workspace/"
    "EVIDENCE/targets_production_v3_20260625"
)

BUILD_SCRIPT = Path(
    "/Users/julesdevaux/.openclaw/agents/chronos/scripts/"
    "build_predictive_targets_v1.py"
)

# Symbol → available TFs (DOGE lacks 4h and 1D in this bundle)
SYMBOLS_TFS: dict[str, list[str]] = {
    "BTCUSDT":  ["5m", "1h", "4h", "1D"],
    "ETHUSDT":  ["5m", "1h", "4h", "1D"],
    "BNBUSDT":  ["5m", "1h", "4h", "1D"],
    "SOLUSDT":  ["5m", "1h", "4h", "1D"],
    "XRPUSDT":  ["5m", "1h", "4h", "1D"],
    "DOGEUSDT": ["5m", "1h"],
    "FETUSDT":  ["5m", "1h", "4h", "1D"],
    "PEPEUSDT": ["5m", "1h", "4h", "1D"],
    "SHIBUSDT": ["5m", "1h", "4h", "1D"],
    "SUIUSDT":  ["5m", "1h", "4h", "1D"],
}

# Tail-window sizes per TF (rows)
WINDOW_N: dict[str, int] = {"5m": 2000, "1h": 2000, "4h": 1000, "1D": 500}

OUT = Path(__file__).resolve().parent.parent / "public" / "data"

OHLCV = ["open", "high", "low", "close", "volume"]
JOIN_KEY_SRC = "open_time_utc"
JOIN_KEY_TGT = "timestamp"
PASSTHROUGH = ["timestamp", "available_at_utc"]

# ── target-column classification (25-col contract, same across all symbols/TFs)
TARGET_SPEC = {
    "target_candle_color_1":             ("direction", "color",      "Next-candle",  "Colour of candle t+1 (green/red/flat)."),
    "target_candle_color_2":             ("direction", "color",      "Next-candle",  "Colour of candle t+2."),
    "target_candle_color_3":             ("direction", "color",      "Next-candle",  "Colour of candle t+3."),
    "target_candle_pct_1":               ("numeric",   "candle_pct", "Next-candle",  "Close-to-close % move of candle t+1."),
    "target_candle_pct_2":               ("numeric",   "candle_pct", "Next-candle",  "Close-to-close % move of candle t+2."),
    "target_candle_pct_3":               ("numeric",   "candle_pct", "Next-candle",  "Close-to-close % move of candle t+3."),
    "target_direction_1":                ("direction", "dir",        "Forward",      "Direction over next 1 bar (up/down/flat)."),
    "target_direction_3":                ("direction", "dir",        "Forward",      "Direction over next 3 bars."),
    "target_direction_12":               ("direction", "dir",        "Forward",      "Direction over next 12 bars."),
    "target_fwd_return_1":               ("numeric",   "returns",    "Forward",      "Forward simple return over 1 bar."),
    "target_fwd_return_3":               ("numeric",   "returns",    "Forward",      "Forward simple return over 3 bars."),
    "target_fwd_return_12":              ("numeric",   "returns",    "Forward",      "Forward simple return over 12 bars."),
    "target_log_return_1":               ("numeric",   "returns",    "Forward",      "Forward log return over 1 bar."),
    "target_log_return_3":               ("numeric",   "returns",    "Forward",      "Forward log return over 3 bars."),
    "target_log_return_12":              ("numeric",   "returns",    "Forward",      "Forward log return over 12 bars."),
    "target_mfe_12":                     ("numeric",   "excursion",  "Excursion",    "Max favourable excursion over 12 bars."),
    "target_mae_12":                     ("numeric",   "excursion",  "Excursion",    "Max adverse excursion over 12 bars."),
    "target_realized_vol_12":            ("numeric",   "vol",        "Excursion",    "Realised volatility over 12 bars."),
    "target_first_passage_12":           ("direction", "passage",    "Excursion",    "First ±1·ATR barrier touched in 12 bars."),
    "target_reversal_bars_ema_9_21":     ("numeric",   "rev_bars",   "EMA reversal", "Bars until next EMA-9/21 crossover."),
    "target_reversal_pct_move_ema_9_21": ("numeric",   "rev_pct",    "EMA reversal", "% move to that EMA-9/21 reversal."),
    "target_reversal_direction_ema_9_21":("direction", "dir",        "EMA reversal", "Direction of the next EMA-9/21 reversal."),
    "target_gann_bars_to_next_swing":    ("numeric",   "gann_bars",  "Gann swing",   "Bars to the next confirmed Gann swing."),
    "target_gann_pct_to_next_swing":     ("numeric",   "gann_pct",   "Gann swing",   "% move to the next Gann swing extremum."),
    "target_gann_next_direction":        ("direction", "dir",        "Gann swing",   "Direction of the next Gann swing."),
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


def verify_combo(sym: str, tf: str) -> dict:
    """Hash-gate one (sym, tf) combo. Returns the loaded manifest dict."""
    csv_path = EVIDENCE_DIR / f"{sym}_{tf}_pt_v1.csv"
    mf_path  = EVIDENCE_DIR / f"{sym}_{tf}_pt_v1.manifest.json"

    if not mf_path.exists():
        raise SystemExit(f"BLOCKED: manifest not found: {mf_path}")
    if not csv_path.exists():
        raise SystemExit(f"BLOCKED: targets CSV not found: {csv_path}")

    m = json.loads(mf_path.read_text())

    # gate 1: targets CSV vs manifest.output_sha256
    got_t = sha256(csv_path)
    if got_t != m["output_sha256"]:
        raise SystemExit(
            f"BLOCKED: {sym}/{tf} targets sha256 mismatch\n"
            f"  expect {m['output_sha256']}\n  got    {got_t}"
        )

    # gate 2: OHLCV source CSV vs manifest.source_sha256
    src_csv = Path(m["source_file"])
    if not src_csv.exists():
        raise SystemExit(f"BLOCKED: {sym}/{tf} source CSV not found: {src_csv}")
    got_s = sha256(src_csv)
    if got_s != m["source_sha256"]:
        raise SystemExit(
            f"BLOCKED: {sym}/{tf} source sha256 mismatch\n"
            f"  expect {m['source_sha256']}\n  got    {got_s}"
        )

    print(f"  {sym}/{tf}: targets {got_t[:12]}… PASS · source {got_s[:12]}… PASS")
    return m


def build_export(sym: str, tf: str, manifest: dict) -> dict:
    n = WINDOW_N[tf]
    total = int(manifest["row_count_output"])
    csv_path = EVIDENCE_DIR / f"{sym}_{tf}_pt_v1.csv"
    src_csv  = Path(manifest["source_file"])

    tdf, start_idx = read_tail(csv_path, total, n)
    sdf, _         = read_tail(src_csv, int(manifest["row_count_input"]), n)

    target_cols = manifest["target_columns"]
    missing = [c for c in target_cols if c not in tdf.columns]
    if missing:
        raise SystemExit(f"BLOCKED: {sym}/{tf} targets missing columns: {missing}")
    for c in OHLCV + [JOIN_KEY_SRC]:
        if c not in sdf.columns:
            raise SystemExit(f"BLOCKED: {sym}/{tf} source missing column: {c}")

    if len(tdf) != len(sdf):
        raise SystemExit(
            f"BLOCKED: {sym}/{tf} row-count mismatch "
            f"targets={len(tdf)} source={len(sdf)}"
        )

    tgt_ts = pd.to_datetime(tdf[JOIN_KEY_TGT], utc=True).reset_index(drop=True)
    src_ts = pd.to_datetime(sdf[JOIN_KEY_SRC], utc=True).reset_index(drop=True)
    if not tgt_ts.equals(src_ts):
        bad = int((tgt_ts != src_ts).sum())
        raise SystemExit(
            f"BLOCKED: {sym}/{tf} timestamp misalignment — "
            f"{bad}/{len(tgt_ts)} rows differ"
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
        columns[name] = (
            [cell_str(v) for v in raw]
            if role == "direction"
            else [cell_num(v) for v in raw]
        )
        nan = sum(1 for v in columns[name] if v is None)
        manifest_cols.append({
            "name": name,
            "dtype": str(tdf[name].dtype),
            "role": role,
            "band": band,
            "bandLabel": BAND_LABEL.get(band, ""),
            "group": group,
            "desc": desc,
            "nanPct": round(nan / rows, 4) if rows else 0.0,
        })

    win_start = cell_str(tdf[JOIN_KEY_TGT].iloc[0])
    win_end   = cell_str(tdf[JOIN_KEY_TGT].iloc[-1])

    out_manifest = {
        "symbol": sym,
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

    total_combos = sum(len(tfs) for tfs in SYMBOLS_TFS.values())
    print(f"Chronos Phase-3 export — {total_combos} combos across {len(SYMBOLS_TFS)} symbols")
    print(f"Evidence: {EVIDENCE_DIR}")
    print()

    print("── verifying hashes ──────────────────────────────────────────────────")
    all_manifests: dict[str, dict[str, dict]] = {}
    for sym, tfs in SYMBOLS_TFS.items():
        all_manifests[sym] = {}
        for tf in tfs:
            all_manifests[sym][tf] = verify_combo(sym, tf)

    OUT.mkdir(parents=True, exist_ok=True)
    print()
    print("── building exports ──────────────────────────────────────────────────")
    written = 0
    for sym, tfs in SYMBOLS_TFS.items():
        for tf in tfs:
            exp = build_export(sym, tf, all_manifests[sym][tf])
            dst = OUT / f"chronos_targets_{sym.lower()}_{tf.lower()}.json"
            dst.write_text(json.dumps(exp, separators=(",", ":")))
            kb = dst.stat().st_size / 1024
            m = exp["manifest"]
            print(
                f"  {sym}/{tf}: {m['rows']} of {m['canonicalRows']} rows · "
                f"{m['targetCount']} targets → {dst.name} ({kb:.0f} KB)"
            )
            written += 1

        # provenance per symbol
        ref_m = all_manifests[sym][tfs[0]]
        prov = {
            "manifestType": "CHRONOS_PREDICTIVE_TARGETS",
            "version": ref_m["version"],
            "symbol": sym,
            "timeframes": tfs,
            "generatedAtUtc": ref_m["created_at_utc"],
            "buildScript": str(BUILD_SCRIPT),
            "buildScriptSha1": BUILD_SCRIPT_SHA1,
            "parameters": ref_m["parameters"],
            "leakagePolicy": ref_m["leakage_policy"],
            "nullPolicy": ref_m["null_policy"],
            "gannEventContract": ref_m["gann_event_contract"],
            "purgeEmbargoRequiredBars": ref_m.get("purge_embargo_required_bars"),
            "sameCandleDualTouchPolicy": ref_m.get("same_candle_dual_touch_policy"),
            "artifacts": {
                tf: {
                    "targetsCsvSha256": all_manifests[sym][tf]["output_sha256"],
                    "sourceCsvSha256":  all_manifests[sym][tf]["source_sha256"],
                    "sourceFile":       all_manifests[sym][tf]["source_file"],
                    "canonicalRows":    all_manifests[sym][tf]["row_count_output"],
                    "shownRows":        WINDOW_N[tf],
                }
                for tf in tfs
            },
            "targetColumns": ref_m["target_columns"],
            "bandOrder": BAND_ORDER,
            "bandLabel": BAND_LABEL,
            "windowing": {
                "mode": "tail",
                "n": {tf: WINDOW_N[tf] for tf in tfs},
                "note": (
                    "All 25 predictive target columns + OHLCV are exported. Only rows "
                    "are windowed (most-recent N per timeframe; browser-safe). OHLCV is "
                    "joined from the certified TA-v3 source on timestamp == open_time_utc "
                    "(row-for-row alignment asserted). No values recomputed; cells copied "
                    "verbatim from the certified CSVs (NaN/''→null)."
                ),
            },
        }
        prov_dst = OUT / f"chronos_targets_provenance_{sym.lower()}.json"
        prov_dst.write_text(json.dumps(prov, indent=2))
        print(f"  {sym}: provenance → {prov_dst.name}")

    print()
    print(f"done: {written} target exports + {len(SYMBOLS_TFS)} provenance files written")


BUILD_SCRIPT_SHA1 = None

if __name__ == "__main__":
    main()
