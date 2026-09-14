#!/usr/bin/env python3
"""Generate Tibot Batch 3 Gate-B results JSON bundle for the dashboard.

Sources (READ-ONLY — Guy never modifies Axone data):
  agents/tibot/workspace/BOTS/{category}/{family}/general/run_gate_b_20260914/
      gate_b_results_20260914.json

Batch 3 families (5):
  classification/breakout_failure_reversal    -> NO_GO
  classification/htf_ltf_swing_alignment      -> CANDIDATE_SELECTED (hgb_shallow)
  classification/pivot_capture_timing         -> CANDIDATE_SELECTED (logreg_balanced)
  classification/swing_exhaustion_probability -> CANDIDATE_SELECTED (hgb_shallow)
  prediction/gann_swing_remaining             -> CANDIDATE_SELECTED (logreg_balanced, weak)

Emits: public/data/tibot_batch3_gateb_20260914.json

Every metric is copied verbatim from the source gate_b_results files.
Nothing is computed, estimated, or fabricated. If a metric is absent it is omitted.
"""
from __future__ import annotations

import json
from pathlib import Path

TIBOT_BOTS = Path("/Users/julesdevaux/.openclaw/agents/tibot/workspace/BOTS")
OUT = Path(__file__).parent.parent / "public" / "data" / "tibot_batch3_gateb_20260914.json"

RUN_DIR = "general/run_gate_b_20260914"
RESULTS_FILE = "gate_b_results_20260914.json"

# (category, family) in the intended display order
FAMILIES = [
    ("classification", "breakout_failure_reversal"),
    ("classification", "htf_ltf_swing_alignment"),
    ("classification", "pivot_capture_timing"),
    ("classification", "swing_exhaustion_probability"),
    ("prediction", "gann_swing_remaining"),
]

# Human-readable guard definitions (keys taken verbatim from source; labels derived
# from the key string only — no thresholds invented beyond what the key encodes).
GUARD_LABELS = {
    "g1_bacc_ge_052": "G1 · balanced accuracy ≥ 0.52",
    "g2_mcc_ge_008": "G2 · MCC ≥ 0.08",
    "g3_f1_ge_030": "G3 · macro-F1 ≥ 0.30",
    "g1_bacc_ge_055": "G1 · balanced accuracy ≥ 0.55",
    "g2_mcc_ge_010": "G2 · MCC ≥ 0.10",
    "g3_f1_ge_045": "G3 · macro-F1 ≥ 0.45",
    "g4_pos_frac_035_065": "G4 · positive fraction ∈ [0.35, 0.65]",
    "g5_prauc_ge_055": "G5 · PR-AUC ≥ 0.55",
}

# Per-family supplementary notes (sourced from the operator brief / pre-registration;
# kept factual, no fabricated metrics).
FAMILY_NOTES = {
    "swing_exhaustion_probability": [
        "Pre-registration documents that low-horizon exhaustion targets can structurally "
        "fail the G4 positive-fraction / G5 PR-AUC guards under extreme class imbalance.",
    ],
    "gann_swing_remaining": [
        "Only the terminal_h{3,6,12,24} targets are evaluated in this Gate-B run.",
        "The separate target_swing_progress_stage (EXHAUSTED class) is NOT yet evaluated — "
        "held pending a Chronos data-fix track. It is intentionally omitted here and must not "
        "be shown as CANDIDATE_SELECTED or any other status until further notice.",
        "Weak candidate: only 1 of 16 cells passed Gate-B guards.",
    ],
}


def collapse_guard(fold_bools) -> bool:
    """A guard passes for a cell only if it holds on every fold."""
    return bool(fold_bools) and all(bool(x) for x in fold_bools)


def load_family(category: str, family: str) -> dict:
    path = TIBOT_BOTS / category / family / RUN_DIR / RESULTS_FILE
    src = json.loads(path.read_text())
    summary = src["summary"]
    results = src["results"]

    targets = sorted({r["target"] for r in results})
    models = list(summary.get("pass_counts", {}).keys())
    horizons = sorted({r["horizon"] for r in results})

    # Guard key order — union across cells, preserving first-seen order
    guard_keys: list[str] = []
    for r in results:
        for k in r.get("guards_all_folds", {}):
            if k not in guard_keys:
                guard_keys.append(k)

    cells = []
    for r in results:
        guards = {k: collapse_guard(v) for k, v in r.get("guards_all_folds", {}).items()}
        failed = [k for k, ok in guards.items() if not ok]
        cell = {
            "target": r["target"],
            "model": r["model"],
            "horizon": r["horizon"],
            "status": r["status"],
            "n_total": r.get("n_total"),
            "n_folds": r.get("n_folds"),
            "bacc_mean": r.get("bacc_mean"),
            "mcc_mean": r.get("mcc_mean"),
            "macro_f1_mean": r.get("macro_f1_mean"),
            "guards": guards,
            "guards_failed": failed,
        }
        # optional metrics — include only when present in source
        if "pr_auc_mean" in r:
            cell["pr_auc_mean"] = r["pr_auc_mean"]
        cells.append(cell)

    return {
        "family": family,
        "category": category,
        "arch_verdict": summary.get("arch_verdict"),
        "selected_model": summary.get("selected_model"),
        "pass_counts": summary.get("pass_counts", {}),
        "env": {
            "sklearn": summary.get("env", {}).get("sklearn"),
            "python": summary.get("env", {}).get("python", "").split(" (")[0],
            "prereg_sha": summary.get("env", {}).get("prereg_sha"),
        },
        "targets": targets,
        "models": models,
        "horizons": horizons,
        "guard_keys": guard_keys,
        "guard_labels": {k: GUARD_LABELS.get(k, k) for k in guard_keys},
        "n_cells": len(cells),
        "n_pass": sum(1 for c in cells if c["status"] == "PASS"),
        "n_fail": sum(1 for c in cells if c["status"] == "FAIL"),
        "cells": cells,
        "notes": FAMILY_NOTES.get(family, []),
        "source_path": str(TIBOT_BOTS / category / family / RUN_DIR / RESULTS_FILE),
    }


families = []
for category, family in FAMILIES:
    print(f"Loading {category}/{family} …")
    fam = load_family(category, family)
    print(f"  verdict={fam['arch_verdict']} selected={fam['selected_model']} "
          f"cells={fam['n_cells']} pass={fam['n_pass']} fail={fam['n_fail']}")
    families.append(fam)

bundle = {
    "schema_version": "1.0.0",
    "generated_by": "Guy (dashboard-builder)",
    "generated_date": "2026-09-15",
    "tx_ref": "TX 20260913-003",
    "batch": "Batch 3",
    "batch_context": (
        "Batch 3 experimental Gate-B prototyping — a new addition alongside the existing "
        "Track A / Batch 1 / Batch 2 history. Gate-B prototyping runs on BTCUSDT, "
        "general (symbol-independent) context only."
    ),
    "run_id": "run_gate_b_20260914",
    # Lifecycle states — the three must never be conflated.
    "lifecycle_legend": [
        {
            "state": "NO_GO",
            "tone": "no_go",
            "label": "NO-GO",
            "description": "Gate-B failed — retired. No model passed the pre-registered guards.",
        },
        {
            "state": "CANDIDATE_SELECTED",
            "tone": "candidate",
            "label": "CANDIDATE SELECTED",
            "description": (
                "Passed Gate-B BTCUSDT prototyping on general / symbol-independent context only. "
                "NOT yet multi-symbol validated, NOT yet Sentinel-audited (audit in progress in "
                "parallel), NOT authorized for Wally / production use."
            ),
        },
        {
            "state": "PROMOTED",
            "tone": "promoted",
            "label": "PROMOTED",
            "description": (
                "The separate, much higher bar: full Sentinel PASS, multi-symbol, "
                "live-forward-validation-eligible. Used for families such as breakout_quality, "
                "ema_transition, ema_dynamics, excursion_payoff_forecast."
            ),
        },
    ],
    "candidate_caption": (
        "BTCUSDT prototype only, pending Sentinel audit and multi-symbol validation — "
        "not authorized for live/production use."
    ),
    "promoted_reference": {
        "note": (
            "PROMOTED families are shown separately and at a much higher bar. They are not part "
            "of this Batch-3 Gate-B view; see the Tibot 24h Live-Forward Validation page."
        ),
        "families": [
            "breakout_quality",
            "ema_transition",
            "ema_dynamics",
            "excursion_payoff_forecast",
        ],
    },
    "families": families,
}

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(bundle, indent=2))
print(f"\nWrote {OUT} ({OUT.stat().st_size / 1024:.1f} KB)")
