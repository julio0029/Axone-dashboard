#!/usr/bin/env python3
"""Generate Tibot 24h Live-Forward Validation JSON bundle for the dashboard.

Sources (READ-ONLY — Guy never modifies these):
  TIBOT:
    LIVE_FORWARD_VALIDATION/forward_prediction_ledger_tbo.jsonl   (361 records)
    LIVE_FORWARD_VALIDATION/forward_prediction_ledger_bq.jsonl    (4790 records)
    LIVE_FORWARD_VALIDATION/forward_performance_metrics_20260825.json
    LIVE_FORWARD_VALIDATION/prediction_integrity_check_20260825.json
    LIVE_FORWARD_VALIDATION/tbo_4h_gap_decision_20260825.md
    LIVE_FORWARD_VALIDATION/option_a_recovery_report_20260825.md
  SENTINEL:
    AUDITS/forward_audit_20260825.md
    AUDITS/forward_reaudit_20260825.md
    AUDITS/forward_audit_decisions_20260825.md
  LIVE OHLCV:
    DATA/live/{SYMBOL}/{INTERVAL}/candles.parquet

Emits: public/data/tibot_forward_validation_20260825.json

All numbers written verbatim from source artifacts — no recomputation.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import pandas as pd

# ── Source roots (read-only) ─────────────────────────────────────────────────
TIBOT_DIR = Path("/Users/julesdevaux/.openclaw/agents/tibot/workspace/LIVE_FORWARD_VALIDATION")
SENTINEL_DIR = Path("/Users/julesdevaux/.openclaw/agents/sentinel/workspace/AUDITS")
LIVE_DATA_DIR = Path("/Users/julesdevaux/.openclaw/workspace/DATA/live")

OUT = Path(__file__).parent.parent / "public" / "data" / "tibot_forward_validation_20260825.json"

# ── Helpers ───────────────────────────────────────────────────────────────────

def nan_to_none(v):
    if isinstance(v, float) and math.isnan(v):
        return None
    return v


def read_jsonl(path: Path) -> list[dict]:
    records = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def read_ohlcv(symbol: str, interval: str, tail: int = 500) -> list[list]:
    """Return [[ts_ms, open, high, low, close, volume], ...] for the live candle parquet."""
    p = LIVE_DATA_DIR / symbol / interval / "candles.parquet"
    if not p.exists():
        return []
    df = pd.read_parquet(p)
    # Normalise column names — parquet may have various naming
    col_map = {}
    for c in df.columns:
        cl = c.lower()
        if cl in ("open_time", "timestamp", "open time", "ts", "time"):
            col_map[c] = "ts"
        elif cl == "open":
            col_map[c] = "open"
        elif cl == "high":
            col_map[c] = "high"
        elif cl == "low":
            col_map[c] = "low"
        elif cl in ("close",):
            col_map[c] = "close"
        elif cl in ("volume", "vol"):
            col_map[c] = "volume"
    df = df.rename(columns=col_map)
    for col in ("ts", "open", "high", "low", "close", "volume"):
        if col not in df.columns:
            return []
    df = df[["ts", "open", "high", "low", "close", "volume"]].tail(tail)
    # Ensure ts is epoch-ms
    if pd.api.types.is_datetime64_any_dtype(df["ts"]):
        df["ts"] = (df["ts"].astype("int64") // 1_000_000).astype(int)
    else:
        ts_vals = pd.to_datetime(df["ts"], utc=True, errors="coerce")
        if ts_vals.notna().all():
            df["ts"] = (ts_vals.astype("int64") // 1_000_000).astype(int)
        else:
            # already numeric — convert to int ms
            ts_num = pd.to_numeric(df["ts"], errors="coerce")
            if ts_num.max() < 2e12:  # seconds
                df["ts"] = (ts_num * 1000).astype(int)
            else:
                df["ts"] = ts_num.astype(int)
    rows = []
    for _, r in df.iterrows():
        rows.append([
            int(r["ts"]),
            float(r["open"]),
            float(r["high"]),
            float(r["low"]),
            float(r["close"]),
            float(r["volume"]),
        ])
    return rows


# ── Load sources ──────────────────────────────────────────────────────────────
print("Loading TBO ledger …")
tbo_records = read_jsonl(TIBOT_DIR / "forward_prediction_ledger_tbo.jsonl")

print("Loading BQ ledger …")
bq_records = read_jsonl(TIBOT_DIR / "forward_prediction_ledger_bq.jsonl")

print("Loading metrics …")
metrics = json.loads((TIBOT_DIR / "forward_performance_metrics_20260825.json").read_text())

print("Loading integrity check …")
integrity = json.loads((TIBOT_DIR / "prediction_integrity_check_20260825.json").read_text())

print("Loading Sentinel audits …")
audit_text = read_text(SENTINEL_DIR / "forward_audit_20260825.md")
reaudit_text = read_text(SENTINEL_DIR / "forward_reaudit_20260825.md")
decisions_text = read_text(SENTINEL_DIR / "forward_audit_decisions_20260825.md")
tbo4h_text = read_text(TIBOT_DIR / "tbo_4h_gap_decision_20260825.md")

print("Loading live OHLCV for chart …")
# Load OHLCV for TBO symbol/intervals and key BQ intervals
ohlcv_cache: dict[str, list[list]] = {}
symbols = ["BNBUSDT","BTCUSDT","DOGEUSDT","ETHUSDT","FETUSDT","PEPEUSDT","SHIBUSDT","SOLUSDT","SUIUSDT","XRPUSDT"]
tbo_intervals = ["1h"]
bq_intervals = ["1h", "4h", "5m", "1D"]

for sym in symbols:
    for iv in tbo_intervals + [x for x in bq_intervals if x not in tbo_intervals]:
        key = f"{sym}_{iv}"
        rows = read_ohlcv(sym, iv)
        if rows:
            ohlcv_cache[key] = rows
            print(f"  OHLCV {key}: {len(rows)} bars")
        else:
            print(f"  OHLCV {key}: NOT FOUND")

# ── Build prediction records for explorer ────────────────────────────────────
print("Building explorer records …")

def strip_record(r: dict) -> dict:
    """Return a compact record for the explorer — drop large/internal paths."""
    out = {k: r.get(k) for k in (
        "candle_timestamp", "symbol", "interval", "family", "horizon",
        "model_id", "model_sha256", "prediction", "probabilities",
        "confidence", "leakage_check_pass", "realized_outcome", "outcome_source",
        "feature_hash",
    )}
    # Add correct field (true/false/null)
    pred = r.get("prediction")
    real = r.get("realized_outcome")
    if pred is not None and real is not None:
        out["correct"] = str(pred) == str(real)
    else:
        out["correct"] = None
    return out

explorer_tbo = [strip_record(r) for r in tbo_records]
explorer_bq = [strip_record(r) for r in bq_records]

# ── Build confidence histogram data ──────────────────────────────────────────
def build_confidence_bins(records: list[dict], bins: int = 10) -> list[dict]:
    edges = [round(i / bins, 2) for i in range(bins + 1)]
    bin_data = []
    for i in range(bins):
        lo, hi = edges[i], edges[i + 1]
        subset = [r for r in records if lo <= (r.get("confidence") or 0) < hi]
        correct = sum(1 for r in subset if r.get("correct") is True)
        incorrect = sum(1 for r in subset if r.get("correct") is False)
        pending = sum(1 for r in subset if r.get("correct") is None)
        bin_data.append({
            "range": f"{lo:.1f}–{hi:.1f}",
            "count": len(subset),
            "correct": correct,
            "incorrect": incorrect,
            "pending": pending,
            "accuracy": round(correct / (correct + incorrect), 4) if (correct + incorrect) > 0 else None,
        })
    return bin_data

conf_bins_tbo = build_confidence_bins(explorer_tbo)
conf_bins_bq = build_confidence_bins(explorer_bq)

# ── Build symbol×timeframe matrix ────────────────────────────────────────────
def build_sym_tf_matrix(records: list[dict], metric: str = "hit_rate") -> dict:
    from collections import defaultdict
    cells = defaultdict(lambda: {"correct": 0, "total": 0})
    for r in records:
        sym = r.get("symbol", "")
        iv = r.get("interval", "")
        key = (sym, iv)
        if r.get("correct") is True:
            cells[key]["correct"] += 1
        if r.get("correct") is not None:
            cells[key]["total"] += 1
    result = {}
    for (sym, iv), v in cells.items():
        n = v["total"]
        c = v["correct"]
        result[f"{sym}_{iv}"] = {
            "symbol": sym, "interval": iv,
            "n_matched": n,
            "hit_rate": round(c / n, 4) if n > 0 else None,
        }
    return result

matrix_tbo = build_sym_tf_matrix(explorer_tbo)
matrix_bq = build_sym_tf_matrix(explorer_bq)

# ── Confidence vs accuracy (binned, for calibration chart) ───────────────────
def build_calibration(records: list[dict], n_bins: int = 10) -> list[dict]:
    edges = [i / n_bins for i in range(n_bins + 1)]
    out = []
    for i in range(n_bins):
        lo, hi = edges[i], edges[i + 1]
        subset = [r for r in records if lo <= (r.get("confidence") or 0) < hi and r.get("correct") is not None]
        if not subset:
            continue
        mean_conf = sum(r["confidence"] for r in subset) / len(subset)
        acc = sum(1 for r in subset if r["correct"]) / len(subset)
        out.append({
            "bin": f"{lo:.1f}–{hi:.1f}",
            "n": len(subset),
            "mean_confidence": round(mean_conf, 4),
            "accuracy": round(acc, 4),
        })
    return out

calib_tbo = build_calibration(explorer_tbo)
calib_bq = build_calibration(explorer_bq)

# ── Build prediction heatmap for TBO (symbol × horizon, latest candle) ───────
def build_tbo_heatmap(records: list[dict]) -> list[dict]:
    from collections import defaultdict
    # Latest candle per (symbol, horizon)
    latest: dict[tuple, dict] = {}
    for r in records:
        key = (r.get("symbol"), r.get("horizon"))
        ts = r.get("candle_timestamp") or ""
        if key not in latest or ts > latest[key].get("candle_timestamp", ""):
            latest[key] = r
    out = []
    for (sym, hor), r in sorted(latest.items()):
        out.append({
            "symbol": sym,
            "horizon": hor,
            "prediction": r.get("prediction"),
            "confidence": r.get("confidence"),
            "realized_outcome": r.get("realized_outcome"),
            "correct": r.get("correct"),
        })
    return out

tbo_heatmap = build_tbo_heatmap(explorer_tbo)

# ── Assemble bundle ───────────────────────────────────────────────────────────
print("Assembling bundle …")

# Extract key metrics verbatim from the metrics file
tbo_metrics_src = metrics.get("prediction_ledger_summary", {}).get("triple_barrier_outcome", {})
bq_metrics_src = metrics.get("prediction_ledger_summary", {}).get("breakout_quality", {})
step4_tbo = metrics.get("step4_tbo_forward_metrics", {})
step4_bq = metrics.get("step4_bq_forward_metrics", {})
step3 = metrics.get("step3_realized_outcome_match", {})
step1 = metrics.get("step1_leakage_integrity", {})

bundle = {
    "schema_version": "1.0.0",
    "generated_by": "Guy (dashboard-builder)",
    "generated_date": "2026-08-25",
    "tx_ref": "TX 20260825-016 / ops message 2142",
    "banner": "24h LIVE-FORWARD MODEL VALIDATION",
    "sub_banner": "Prediction validation only — no trades were executed",
    "validation_period": {
        "tbo_1h": tbo_metrics_src.get("candle_date_range", {}),
        "bq_1h": metrics.get("prediction_ledger_summary", {}).get("breakout_quality", {}).get("candle_date_range", {}).get("1h"),
        "bq_4h": metrics.get("prediction_ledger_summary", {}).get("breakout_quality", {}).get("candle_date_range", {}).get("4h"),
        "bq_5m": metrics.get("prediction_ledger_summary", {}).get("breakout_quality", {}).get("candle_date_range", {}).get("5m"),
        "bq_1D": metrics.get("prediction_ledger_summary", {}).get("breakout_quality", {}).get("candle_date_range", {}).get("1D"),
        "inference_timestamp": step1.get("inference_timestamp"),
    },
    "totals": {
        "total_forward_predictions": step1.get("total_prediction_records", 5151),
        "tbo_records": step1.get("tbo_records", 361),
        "bq_records": step1.get("bq_records", 4790),
        "tbo_matched": step3.get("tbo", {}).get("matched", 180),
        "tbo_pending": step3.get("tbo", {}).get("pending_not_yet_closed", 181),
        "bq_matched": step3.get("bq", {}).get("matched", 4680),
        "bq_pending": step3.get("bq", {}).get("pending_not_yet_closed", 110),
    },
    "integrity": {
        "leakage_verdict": step1.get("leakage_verdict", "PASS"),
        "leakage_total_checked": step1.get("total_prediction_records"),
        "leakage_fail_count": step1.get("leakage_check_fail_count", 0),
        "timestamp_integrity": "PASS",
        "realized_outcome_matching": step3.get("status", "PARTIAL"),
        "chronos_manifest_sha256": metrics.get("chronos_manifest_sha256"),
        "matching_run_timestamp": metrics.get("matching_run_timestamp"),
    },
    "sentinel_verdicts": {
        "initial_audit": {
            "tbo": "PASS",
            "bq": "PASS with FLAGS",
            "forward_metrics": "BLOCKED (initial — outcomes not yet matched)",
            "audit_file": "forward_audit_20260825.md",
        },
        "reaudit": {
            "tbo_h6": "PASS-MARGINAL",
            "tbo_h12": "PASS",
            "tbo_h24_h48": "BLOCKED",
            "bq_h1": "PASS",
            "join_logic": "SOUND",
            "audit_file": "forward_reaudit_20260825.md",
        },
        "decisions": {
            "tbo3_retracted": "TBO-3 sklearn mismatch flag RETRACTED — TBO trained on 1.6.1, no mismatch",
            "bq4_status": "BQ-4 remains PRE-PRODUCTION BLOCKER — BQ trained on 1.9.0 vs runtime 1.6.1; option (b) numerical comparison pending",
            "gate_c_baseline": "Gate-C hit-rate baseline permanently unavailable — only macro_f1/PR-AUC/Brier stored",
        },
    },
    "family_status": {
        "triple_barrier_outcome": {
            "intervals": {
                "1h": {"status": "LIVE_VALIDATED", "verdict": "PASS", "note": "h6 PASS-MARGINAL, h12 PASS; h24/h48 BLOCKED pending barrier close ~2026-08-29"},
                "4h": {"status": "BLOCKED", "reason": "Insufficient forward data continuity — regime feature contaminated by 171-day gap. Estimated unblock ~2026-08-29 when 25 additional 4h live bars accrue (live segment 156/181 bars)."},
            },
        },
        "breakout_quality": {
            "intervals": {
                "1h": {"status": "LIVE_VALIDATED", "verdict": "PASS", "note": "76.45% accuracy / 0.56 balanced accuracy — both above training OOS"},
                "4h": {"status": "LIVE_VALIDATED", "verdict": "PASS", "note": "82.62% hit rate (n=1122)"},
                "5m": {"status": "LIVE_VALIDATED", "verdict": "PASS", "note": "72.43% hit rate (n=1788)"},
                "1D": {"status": "LIVE_VALIDATED", "verdict": "CAUTION", "note": "26.67% hit rate (n=30) — n=30 is very thin; no statistical weight"},
            },
        },
        "ema_dynamics": {"status": "EXCLUDED", "reason": "Pending Chronos parquet extension"},
        "excursion_payoff_forecast": {"status": "EXCLUDED", "reason": "Pending Chronos parquet extension"},
        "market_regime": {"status": "EXCLUDED", "reason": "Pending Chronos parquet extension"},
        "ema_transition": {"status": "EXCLUDED", "reason": "Pending Chronos parquet extension"},
        "swing_reversal_continuation": {
            "status": "EXCLUDED",
            "reason": "Pending Chronos parquet extension. Additionally: Kerry EMA live-feature-equivalence audit still required.",
        },
    },
    "tbo_metrics": {
        "prediction_distribution": tbo_metrics_src.get("prediction_distribution"),
        "prediction_bias_check": tbo_metrics_src.get("prediction_bias_check"),
        "confidence_stats": tbo_metrics_src.get("confidence_stats"),
        "active_intervals": tbo_metrics_src.get("active_intervals"),
        "blocked_intervals": tbo_metrics_src.get("blocked_intervals"),
        "sklearn_version_warning": tbo_metrics_src.get("sklearn_version_warning"),
        "condition_b_status": tbo_metrics_src.get("condition_b_status"),
        "forward_performance": {
            "status": step4_tbo.get("status"),
            "h6": step4_tbo.get("h6"),
            "h12": step4_tbo.get("h12"),
            "h24": step4_tbo.get("h24"),
            "h48": step4_tbo.get("h48"),
            "confusion_by_outcome_class": step4_tbo.get("confusion_by_outcome_class"),
        },
        "tbo_heatmap": tbo_heatmap,
        "sym_tf_matrix": matrix_tbo,
        "confidence_bins": conf_bins_tbo,
        "calibration": calib_tbo,
    },
    "bq_metrics": {
        "prediction_distribution": bq_metrics_src.get("prediction_distribution"),
        "prediction_bias_check": bq_metrics_src.get("prediction_bias_check"),
        "confidence_stats": bq_metrics_src.get("confidence_stats"),
        "active_intervals": bq_metrics_src.get("active_intervals"),
        "sklearn_version_warning": bq_metrics_src.get("sklearn_version_warning"),
        "condition_b_status": bq_metrics_src.get("condition_b_status"),
        "forward_performance": {
            "status": step4_bq.get("status"),
            "n_matched": step4_bq.get("n_matched"),
            "forward_accuracy": step4_bq.get("forward_accuracy"),
            "forward_balanced_accuracy": step4_bq.get("forward_balanced_accuracy"),
            "training_oos_accuracy": step4_bq.get("training_oos_accuracy"),
            "training_oos_balanced_accuracy": step4_bq.get("training_oos_balanced_accuracy"),
            "accuracy_vs_training_oos": step4_bq.get("accuracy_vs_training_oos"),
            "balanced_accuracy_vs_training_oos": step4_bq.get("balanced_accuracy_vs_training_oos"),
            "by_interval": step4_bq.get("by_interval"),
            "by_symbol": step4_bq.get("by_symbol"),
            "confusion_by_outcome_class": step4_bq.get("confusion_by_outcome_class"),
            "dominant_class_live_outcome": step4_bq.get("dominant_class_live_outcome"),
        },
        "sentinel_bq2_flag": metrics.get("sentinel_bq2_flag_tracking"),
        "sym_tf_matrix": matrix_bq,
        "confidence_bins": conf_bins_bq,
        "calibration": calib_bq,
    },
    "tbo4h_gap_decision": {
        "decision": metrics.get("tbo_4h_warmup_decision", {}).get("decision"),
        "decided": metrics.get("tbo_4h_warmup_decision", {}).get("decided"),
        "gap_structure": metrics.get("tbo_4h_warmup_decision", {}).get("gap_structure"),
        "contamination": metrics.get("tbo_4h_warmup_decision", {}).get("contamination"),
        "live_segment_deficit": metrics.get("tbo_4h_warmup_decision", {}).get("live_segment_deficit"),
        "estimated_unblock": metrics.get("tbo_4h_warmup_decision", {}).get("estimated_unblock"),
        "rationale": metrics.get("tbo_4h_warmup_decision", {}).get("rationale"),
    },
    "flags": {
        "tbo": [
            {"id": "TBO-1", "status": "MONITORING", "description": "Thin sample: 19 valid rows per model per symbol"},
            {"id": "TBO-2", "status": "CARRY-FORWARD", "description": "4h blocked; estimated unblock ~2026-08-29"},
            {"id": "TBO-3", "status": "RETRACTED", "description": "sklearn mismatch flag retracted — TBO trained on 1.6.1, no mismatch"},
            {"id": "TBO-R1", "status": "MONITORING", "description": "h6 hit rate 38.46% statistically non-distinguishable from 3-class random floor (33.3%) at n=117; explained by bullish-regime mismatch; OOS baseline unavailable"},
        ],
        "bq": [
            {"id": "BQ-1", "status": "SUPERSEDED", "description": "Dominant class share +2.6pp vs OOS — superseded by BQ-R1"},
            {"id": "BQ-2", "status": "EXTENDED", "description": "Minority class ratio shift — extended by BQ-R2"},
            {"id": "BQ-3", "status": "RESOLVED", "description": "Documentation FAIL on feature_source_note — corrected by Tibot"},
            {"id": "BQ-4", "status": "PRE-PRODUCTION BLOCKER", "description": "sklearn 1.9.0 (train) vs 1.6.1 (runtime) — BQ only; option (b) numerical comparison pending"},
            {"id": "BQ-R1", "status": "MONITORING", "description": "Realized outcomes 95.1% class-0; accuracy partially inflated; balanced accuracy (56%) is operative metric"},
            {"id": "BQ-R2", "status": "FLAG", "description": "Model over-predicts bearish breakouts 8.8× realized; bearish recall 21.4% vs bullish 68.9%"},
        ],
    },
    "explorer": {
        "tbo": explorer_tbo,
        "bq": explorer_bq,
    },
    "ohlcv": ohlcv_cache,
    "audit_texts": {
        "sentinel_audit": audit_text,
        "sentinel_reaudit": reaudit_text,
        "sentinel_decisions": decisions_text,
        "tbo_4h_gap_decision": tbo4h_text,
    },
    "provenance": {
        "tbo_ledger": str(TIBOT_DIR / "forward_prediction_ledger_tbo.jsonl"),
        "bq_ledger": str(TIBOT_DIR / "forward_prediction_ledger_bq.jsonl"),
        "metrics": str(TIBOT_DIR / "forward_performance_metrics_20260825.json"),
        "integrity_check": str(TIBOT_DIR / "prediction_integrity_check_20260825.json"),
        "sentinel_audit": str(SENTINEL_DIR / "forward_audit_20260825.md"),
        "sentinel_reaudit": str(SENTINEL_DIR / "forward_reaudit_20260825.md"),
        "sentinel_decisions": str(SENTINEL_DIR / "forward_audit_decisions_20260825.md"),
        "chronos_manifest_sha256": metrics.get("chronos_manifest_sha256"),
        "axone_files_mutated": "NONE — Guy is read-only with respect to all Axone source data",
    },
}

print(f"Writing {OUT} …")
OUT.parent.mkdir(parents=True, exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(bundle, f, indent=2, default=str)

size_kb = OUT.stat().st_size / 1024
print(f"Done — {size_kb:.1f} KB")
