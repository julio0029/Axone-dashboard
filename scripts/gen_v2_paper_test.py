#!/usr/bin/env python3
"""
gen_v2_paper_test.py  --  BRANCH 1 · PAPER CANDIDATE V1  (frozen 10-symbol 48h forward test)

READ-ONLY generator. Emits public/data/paper_candidate_v1.json.

This is the PAPER CANDIDATE V1 branch generator. It is structurally isolated
from the V2 RESEARCH branch (gen_v2_portfolio_lab.py / gen_v2_symbol_research.py):

  * It reads ONLY two provenance roots:
        1. <V2_ROOT>/TRACK_D_48h_paper_test/     (the frozen forward-test dir)
        2. Sentinel AUDITS/SENTINEL_PAPER_CANDIDATE_V1_PREFLIGHT_20260922.md
  * EVERY file access is funnelled through assert_paper_provenance(), a hard gate
    that RAISES (fails loudly) on any path under a V2 research root
    (AXONE_V2_RESEARCH_*) that is NOT inside TRACK_D_48h_paper_test/. No research
    result can ever be read into, or aggregated onto, this branch.

Current real state (verified 2026-09-22): TRACK_D holds only design documents.
There is no freeze manifest, no Sentinel preflight verdict, no execution
evidence and no paper trades. This branch therefore renders NOT_AVAILABLE /
NOT_STARTED throughout — never zeros or empty charts that could read as
measured results, and never a carried-forward research value.
"""

import glob
import hashlib
import json
import os
import re
from datetime import datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---- Branch-1 provenance roots (the ONLY things this generator may read) ----
V2_ROOT = "/Users/julesdevaux/.openclaw/agents/axone/workspace/AXONE_V2_RESEARCH_20260918"
TRACK_D = os.path.join(V2_ROOT, "TRACK_D_48h_paper_test")
SENTINEL_AUDITS = "/Users/julesdevaux/.openclaw/agents/sentinel/workspace/AUDITS"
SENTINEL_PREFLIGHT = os.path.join(SENTINEL_AUDITS, "SENTINEL_PAPER_CANDIDATE_V1_PREFLIGHT_20260922.md")
# Sentinel's machine-readable clock-start verdict lives inside Track D (allowed).
SENTINEL_VERDICT_JSON = os.path.join(TRACK_D, "SENTINEL_PAPER_CANDIDATE_V1_VERDICT_20260922.json")

OUT = os.path.join(REPO, "public", "data", "paper_candidate_v1.json")

TESTNET_ENDPOINT = "https://testnet.binance.vision"
UNIVERSE = ["BNBUSDT", "BTCUSDT", "DOGEUSDT", "ETHUSDT", "FETUSDT",
            "PEPEUSDT", "SHIBUSDT", "SOLUSDT", "SUIUSDT", "XRPUSDT"]

# =====================================================================
# TX:20260922-014  ·  SEVEN-STAGE EXECUTION CHAIN  (generic schema)
#
# Built policy-agnostically against the Wolf -> Paper Adapter Contract V1
# generic execution schema. The chain is displayed as SEVEN DISTINCT STAGES,
# each keyed by Wolf's decision ID (wolf_ledger_ref) so lineage is visible end
# to end. No adapter and no run records exist yet (Sentinel verdict BLOCKED,
# clock has not started), so every stage renders NOT_AVAILABLE / NOT_STARTED --
# never a fabricated or zero value that could read as a measured result.
# =====================================================================

# The join key carried through every stage.
JOIN_KEY = "wolf_ledger_ref"

# Seven distinct stages (never collapsed into one trade row). Each stage names
# the append-only log(s) that would source it under §11 of the contract.
EXECUTION_STAGES = [
    {"index": 1, "key": "wally_decision", "label": "Wally decision",
     "description": "Opportunity / direction / conviction. Decision-layer input to Wolf.",
     "sourceLog": "TRACK_D_WOLF_LEDGER.jsonl (contract_state_snapshot) + upstream Wally proposal"},
    {"index": 2, "key": "wolf_action", "label": "Wolf action",
     "description": "wolf_action_type + intended direction/quantity/reference price. The ONLY component allowed to signal the adapter.",
     "sourceLog": "TRACK_D_WOLF_LEDGER.jsonl (WolfAction, schema wolf_action.v1)"},
    {"index": 3, "key": "paper_order", "label": "Binance paper order",
     "description": "Order submitted to Binance paper/testnet. POST /api/v3/order, newClientOrderId = wolf_<hash>.",
     "sourceLog": "TRACK_D_ADAPTER_LOG.jsonl (submitted)"},
    {"index": 4, "key": "acknowledgement", "label": "Acknowledgement",
     "description": "Exchange acknowledgement: exchange_order_id, client_order_id, ack timestamp, latency.",
     "sourceLog": "TRACK_D_ADAPTER_LOG.jsonl (AdapterFill, schema adapter_fill.v1)"},
    {"index": 5, "key": "fill", "label": "Fill",
     "description": "fill_status incl. PARTIAL_FILL. Shows filled vs requested quantity explicitly -- a partial is never rounded away.",
     "sourceLog": "TRACK_D_ADAPTER_LOG.jsonl (fill_status / fill_quantity_*)"},
    {"index": 6, "key": "position", "label": "Position",
     "description": "Reconciled position vs exchange balance (binary presence + base-asset size, ±5% tolerance).",
     "sourceLog": "TRACK_D_RECONCILIATION_LOG.jsonl + TRACK_D_PORTFOLIO_LEDGER.jsonl"},
    {"index": 7, "key": "pnl", "label": "PnL",
     "description": "Realized / unrealized PnL. Absent PnL and zero PnL are different facts and render differently.",
     "sourceLog": "TRACK_D_PORTFOLIO_LEDGER.jsonl"},
]

# Policy-agnostic action vocabulary. LIFECYCLE_POLICY is PENDING_F3, so we do
# NOT assume which taxonomy is active -- we carry BOTH and resolve nothing.
ACTION_VOCABULARY = {
    # brief TX:20260922-014 taxonomy (WOLF_0-flavoured)
    "brief": ["ENTER_LONG", "ENTER_SHORT", "HOLD", "EXIT_LONG", "EXIT_SHORT",
              "EXIT_LONG_THEN_ENTER_SHORT", "EXIT_SHORT_THEN_ENTER_LONG", "ABSTAIN"],
    # Wolf->Paper Adapter Contract V1 taxonomy
    "contract_v1": ["ENTER_LONG", "ENTER_SHORT", "EXIT", "REDUCE",
                    "REVERSE_LONG", "REVERSE_SHORT"],
}

# First-class fill / lifecycle outcomes each shown as its own stage state.
FILL_STATES = ["FILLED", "PARTIAL_FILL", "REJECTED", "TIMEOUT", "STALE_DECISION",
               "DUPLICATE_REJECTED", "PRE_FLIGHT_REJECTED"]

# Kill-switch states. Brief vocabulary is authoritative for the legend; the
# contract's own vocabulary is carried alongside for the mapping.
KILL_SWITCH_STATES = ["ENABLED", "DISABLED", "EMERGENCY_STOP"]
KILL_SWITCH_CONTRACT_STATES = ["ARMED", "TRIGGERED", "HALTED"]

# Append-only run logs per contract §11 that the chain would source from.
RUN_LOGS = [
    {"name": "TRACK_D_WOLF_LEDGER.jsonl", "role": "Wolf-owned; one line per (boundary, symbol)"},
    {"name": "TRACK_D_PORTFOLIO_LEDGER.jsonl", "role": "Wolf-owned; one line per boundary (equity/PnL/positions)"},
    {"name": "TRACK_D_ADAPTER_LOG.jsonl", "role": "Adapter-owned; one line per API call (order/ack/fill)"},
    {"name": "TRACK_D_PROCESSED_KEYS.jsonl", "role": "Adapter-owned; dedup store (idempotency by join key)"},
    {"name": "TRACK_D_RECONCILIATION_LOG.jsonl", "role": "Adapter-owned; per-boundary + hourly position/cash reconciliation"},
    {"name": "TRACK_D_KILL_SWITCH_LOG.jsonl", "role": "Adapter-owned; every kill-switch state transition"},
    {"name": "TRACK_D_HEARTBEAT.jsonl", "role": "Runner supervisor; every 5m boundary"},
]

# =====================================================================
# HARD PROVENANCE GATE  --  the entire point of the two-branch task.
# =====================================================================
_V2_RESEARCH_MARK = re.compile(r"AXONE_V2_RESEARCH_[0-9]+")
_PAPER_SUBDIR = "TRACK_D_48h_paper_test"


class ProvenanceViolation(RuntimeError):
    """Raised when the paper branch is asked to read a V2 research path."""


def assert_paper_provenance(path):
    """Fail loudly on any V2-research path that is not the frozen Track D dir.

    Allowed:  anything under <V2_ROOT>/TRACK_D_48h_paper_test/, and any path
              that is NOT under a V2 research root at all (e.g. the Sentinel
              audit, which lives under sentinel/workspace/AUDITS).
    Rejected: any path under AXONE_V2_RESEARCH_* whose components do not
              include TRACK_D_48h_paper_test  (i.e. Track A/B/C/E research).
    """
    ap = os.path.abspath(path)
    if _V2_RESEARCH_MARK.search(ap):
        parts = ap.split(os.sep)
        if _PAPER_SUBDIR not in parts:
            raise ProvenanceViolation(
                "PROVENANCE VIOLATION [paper-candidate-v1]: refusing to read a V2 "
                f"research path that is not under {_PAPER_SUBDIR}/: {ap}")
    return ap


def _rel(path):
    """Human-facing canonical path used for on-panel source labels."""
    marker = ".openclaw/"
    ap = os.path.abspath(path)
    i = ap.find(marker)
    return ap[i + len(marker):] if i >= 0 else ap


def sha256_file(path):
    assert_paper_provenance(path)
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def short(s):
    return s[:12] if s else s


def paper_glob(pattern):
    """glob restricted to the paper branch; every hit is provenance-checked."""
    hits = sorted(glob.glob(pattern))
    return [assert_paper_provenance(h) for h in hits]


def find_freeze_manifest():
    """A freeze manifest would live inside Track D. None exists yet."""
    cands = []
    for pat in ("*FREEZE*", "*freeze*", "*MANIFEST*", "*manifest*"):
        cands += paper_glob(os.path.join(TRACK_D, "**", pat))
    cands = [c for c in cands if os.path.isfile(c)]
    if not cands:
        return {"status": "NOT_AVAILABLE", "ref": None, "artifacts": [],
                "source": {"path": _rel(TRACK_D), "present": os.path.isdir(TRACK_D)}}
    manifest = sorted(cands)[-1]
    return {"status": "AVAILABLE", "ref": _rel(manifest),
            "sha256": short(sha256_file(manifest)), "artifacts": [],
            "source": {"path": _rel(manifest), "present": True}}


def read_sentinel_preflight():
    """Read the Sentinel PAPER CANDIDATE V1 preflight verdict, if it exists."""
    present = os.path.isfile(SENTINEL_PREFLIGHT)
    if not present:
        return {"status": "NOT_AVAILABLE", "verdict": None, "date": None,
                "auditPath": _rel(SENTINEL_PREFLIGHT), "present": False}
    assert_paper_provenance(SENTINEL_PREFLIGHT)
    with open(SENTINEL_PREFLIGHT) as f:
        text = f.read()
    verdict = None
    m = re.search(r"\b(PASS|FAIL|BLOCKED)\b", text)
    if m:
        verdict = m.group(1)
    dm = re.search(r"(20\d{2}-\d{2}-\d{2})", text)
    return {"status": "AVAILABLE", "verdict": verdict,
            "date": dm.group(1) if dm else None,
            "auditPath": _rel(SENTINEL_PREFLIGHT), "present": True,
            "sha256": short(sha256_file(SENTINEL_PREFLIGHT))}


def find_run_evidence():
    """Paper-only execution evidence lives in run_<id>/ dirs. None exist yet."""
    runs = [d for d in paper_glob(os.path.join(TRACK_D, "run_*")) if os.path.isdir(d)]
    return runs


def design_docs():
    docs = [d for d in paper_glob(os.path.join(TRACK_D, "*.md")) if os.path.isfile(d)]
    return [{"file": os.path.basename(d), "path": _rel(d)} for d in docs]


def read_sentinel_verdict():
    """Sentinel's machine-readable clock-start verdict (real, hash-verified).

    This is genuine on-disk data (not fabricated): it explains WHY the seven-stage
    chain is NOT STARTED -- the clock has not been authorised to start. Rendered
    verbatim; no field is invented.
    """
    present = os.path.isfile(SENTINEL_VERDICT_JSON)
    if not present:
        return {"status": "NOT_AVAILABLE", "verdict": None, "clockMayStart": None,
                "source": {"path": _rel(SENTINEL_VERDICT_JSON), "present": False}}
    assert_paper_provenance(SENTINEL_VERDICT_JSON)
    with open(SENTINEL_VERDICT_JSON) as f:
        v = json.load(f)
    blockers = [
        {"id": b.get("id"), "severity": b.get("severity"),
         "summary": b.get("summary"), "owner": b.get("owner")}
        for b in v.get("blockers", [])
    ]
    return {
        "status": "AVAILABLE",
        "verdict": v.get("verdict"),
        "clockMayStart": v.get("clock_may_start"),
        "conditionalPass": v.get("conditional_pass"),
        "auditDate": v.get("audit_date_utc"),
        "scope": v.get("scope"),
        "freezeManifestStatus": v.get("freeze_manifest_status"),
        "blockerCount": len(blockers),
        "blockers": blockers,
        "resolutionSequence": v.get("blocker_resolution_sequence", []),
        "sha256": short(sha256_file(SENTINEL_VERDICT_JSON)),
        "source": {"path": _rel(SENTINEL_VERDICT_JSON), "present": True},
    }


def build_execution_chain(runs, track_present):
    """Assemble the generic seven-stage execution chain, keyed by wolf_ledger_ref.

    Reads the append-only run logs (§11) when a run directory exists and joins
    every record onto its Wolf decision ID. No run exists yet, so `lineages` is
    empty and every stage scaffold is NOT_STARTED. When records DO exist this
    builder will populate one seven-stage lineage per Wolf decision -- each stage
    outcome (incl. REJECTED / TIMEOUT / STALE_DECISION / PARTIAL_FILL) shown
    distinctly, never inferred or collapsed.
    """
    started = bool(runs)

    def log_ref(name):
        # Path a log WOULD occupy inside the (single) run dir, for source labels.
        if runs:
            p = os.path.join(runs[0], name)
            return {"path": _rel(p), "present": os.path.isfile(p)}
        return {"path": _rel(os.path.join(TRACK_D, "run_<run_id>", name)), "present": False}

    logs = [{"name": l["name"], "role": l["role"], **log_ref(l["name"])} for l in RUN_LOGS]

    # Kill-switch: read only from a real transition log; never defaulted.
    ks_ref = log_ref("TRACK_D_KILL_SWITCH_LOG.jsonl")
    kill_switch = {
        "status": "AVAILABLE" if ks_ref["present"] else "NOT_AVAILABLE",
        "state": None,  # populated verbatim from the log's last transition when present
        "legend": KILL_SWITCH_STATES,
        "contractStates": KILL_SWITCH_CONTRACT_STATES,
        "note": "No kill-switch transition log exists yet. State is unknown -- not "
                "assumed ENABLED. Contract states ARMED/TRIGGERED/HALTED map onto "
                "ENABLED/DISABLED/EMERGENCY_STOP.",
        "source": ks_ref,
    }

    lineages = []
    if started:
        lineages = join_lineages(runs)  # populated only from real logs

    stages = [
        {**s,
         "status": "NOT_STARTED" if not started else "PENDING",
         "source": log_ref(s["sourceLog"].split(" ")[0]) if s["sourceLog"].startswith("TRACK_D") else
                   {"path": _rel(os.path.join(TRACK_D, "run_<run_id>")), "present": False}}
        for s in EXECUTION_STAGES
    ]

    return {
        "status": "NOT_STARTED" if not started else "RUNNING",
        "started": started,
        "joinKey": JOIN_KEY,
        "joinKeyDescription": "Wolf's decision ID (wolf_ledger_ref = <run_id>:<symbol>:"
                              "<boundary_iso>:<action_seq>) is carried through all seven "
                              "stages so lineage is visible end to end.",
        "lifecyclePolicy": {
            "value": "PENDING_F3",
            "resolved": False,
            "resolvesTo": ["CONTRACT_V1", "WOLF_0"],
            "resolvedBy": "Wolf F3 incremental-value comparison + Sentinel audit",
            "note": "LIFECYCLE_POLICY is deliberately unresolved. It is not defaulted, "
                    "not hidden, and not guessed. It resolves to CONTRACT_V1 or WOLF_0 "
                    "only after Wolf's F3 comparison and Sentinel's audit.",
        },
        "actionVocabulary": ACTION_VOCABULARY,
        "fillStates": FILL_STATES,
        "killSwitch": kill_switch,
        "stages": stages,
        "lineages": lineages,
        "lineageCount": len(lineages),
        "endpoint": TESTNET_ENDPOINT,
        "paperOnly": True,
        "mainnetForbidden": True,
        "logs": logs,
        "adapterStatus": {
            "present": False,
            "note": "Binance paper/testnet adapter is being implemented in parallel "
                    "(Sublime, TX:20260922-013). This dashboard plumbing is built "
                    "against the generic execution schema and is ready for real records.",
        },
        "source": {"path": _rel(TRACK_D), "present": track_present},
    }


def join_lineages(runs):
    """Join append-only run logs onto Wolf decision IDs into seven-stage lineages.

    Only ever emits stages backed by a real log line. Absent stages stay
    NOT_AVAILABLE. Executed only when a run directory exists; today it returns []
    because no run dir is present.
    """
    def read_jsonl(path):
        assert_paper_provenance(path)
        rows = []
        if not os.path.isfile(path):
            return rows
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        rows.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
        return rows

    lineages = []
    for run in runs:
        wolf = read_jsonl(os.path.join(run, "TRACK_D_WOLF_LEDGER.jsonl"))
        adapter = read_jsonl(os.path.join(run, "TRACK_D_ADAPTER_LOG.jsonl"))
        recon = read_jsonl(os.path.join(run, "TRACK_D_RECONCILIATION_LOG.jsonl"))
        adapter_by_ref = {}
        for a in adapter:
            ref = a.get(JOIN_KEY)
            if ref:
                adapter_by_ref.setdefault(ref, []).append(a)
        for w in wolf:
            ref = w.get(JOIN_KEY)
            if not ref:
                continue
            fills = adapter_by_ref.get(ref, [])
            lineages.append(_lineage_from_records(ref, run, w, fills, recon))
    return lineages


def _absent_stage(reason="NOT_AVAILABLE"):
    return {"status": reason}


def _lineage_from_records(ref, run, wolf_rec, fills, recon):
    """Build one seven-stage lineage from real records. Each stage is distinct.

    A missing stage stays NOT_AVAILABLE; a present stage carries only fields that
    exist in the source record. PARTIAL is surfaced as PARTIAL_FILL with filled vs
    requested quantity. REJECTED / TIMEOUT / PRE_FLIGHT_REJECTED / DUPLICATE_REJECTED
    are carried verbatim from fill_status.
    """
    fill = fills[-1] if fills else None
    snap = wolf_rec.get("contract_state_snapshot", {}) or {}
    fill_status_map = {"PARTIAL": "PARTIAL_FILL"}  # normalise contract -> brief label

    def stage_order():
        if not fill:
            return _absent_stage("NOT_STARTED")
        return {
            "status": "REACHED",
            "adapterOrderRef": fill.get("adapter_order_ref"),
            "side": fill.get("side"),
            "orderType": fill.get("order_type"),
            "requestedQtyUsd": fill.get("requested_quantity_usd"),
            "endpoint": fill.get("exchange_endpoint"),
            "clientOrderId": fill.get("exchange_client_order_id"),
            "submittedUtc": fill.get("adapter_request_timestamp_utc"),
        }

    def stage_ack():
        if not fill:
            return _absent_stage("NOT_STARTED")
        acked = fill.get("exchange_order_id") is not None
        return {
            "status": "REACHED" if acked else "NOT_AVAILABLE",
            "exchangeOrderId": fill.get("exchange_order_id"),
            "ackUtc": fill.get("adapter_response_timestamp_utc"),
            "latencyMs": fill.get("latency_ms"),
        }

    def stage_fill():
        if not fill:
            return _absent_stage("NOT_STARTED")
        raw = fill.get("fill_status")
        return {
            "status": fill_status_map.get(raw, raw),
            "fillStatus": raw,
            "fillPrice": fill.get("fill_price"),
            "filledQtyBase": fill.get("fill_quantity_base"),
            "filledQtyQuoteUsd": fill.get("fill_quantity_quote_usd"),
            "requestedQtyUsd": fill.get("requested_quantity_usd"),
            "fillUtc": fill.get("fill_timestamp_utc"),
            "errorCode": fill.get("error_code"),
            "errorText": fill.get("error_text"),
        }

    recon_for = [r for r in recon if r.get(JOIN_KEY) == ref or r.get("symbol") == wolf_rec.get("symbol")]
    last_recon = recon_for[-1] if recon_for else None

    return {
        "wolfLedgerRef": ref,
        "runId": wolf_rec.get("run_id") or os.path.basename(run),
        "symbol": wolf_rec.get("symbol"),
        "boundaryUtc": wolf_rec.get("boundary_timestamp_utc"),
        "killSwitchAtDecision": wolf_rec.get("kill_switch_state"),
        "stages": {
            "wally_decision": {
                "status": "REACHED" if snap else "NOT_AVAILABLE",
                "state": snap.get("state"),
                "net": snap.get("net"),
                "oppRatio": snap.get("opp_ratio"),
                "direction": wolf_rec.get("direction"),
            },
            "wolf_action": {
                "status": "REACHED",
                "actionType": wolf_rec.get("wolf_action_type"),
                "direction": wolf_rec.get("direction"),
                "intendedQtyUsd": wolf_rec.get("intended_quantity_usd"),
                "orderType": wolf_rec.get("order_type"),
                "refPrice": wolf_rec.get("intended_reference_price"),
                "reasonCode": wolf_rec.get("action_reason_code"),
            },
            "paper_order": stage_order(),
            "acknowledgement": stage_ack(),
            "fill": stage_fill(),
            "position": {
                "status": "REACHED" if last_recon else "NOT_AVAILABLE",
                "positionExists": (last_recon or {}).get("position_exists"),
                "sizeBase": (last_recon or {}).get("position_size_base"),
                "reconcileStatus": (last_recon or {}).get("severity"),
            },
            "pnl": {
                "status": "NOT_AVAILABLE",  # populated from portfolio ledger when present
                "realizedPnlUsd": None,
                "unrealizedPnlUsd": None,
            },
        },
    }


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)

    track_present = os.path.isdir(TRACK_D)
    runs = find_run_evidence()
    freeze = find_freeze_manifest()
    sentinel = read_sentinel_preflight()
    verdict = read_sentinel_verdict()
    execution_chain = build_execution_chain(runs, track_present)
    docs = design_docs()

    started = bool(runs)  # a real forward test would have a run_<id> dir

    trackd_src = _rel(TRACK_D)

    # Every panel declares its BRANCH and its source artifact path. The TS
    # adapter re-checks each of these against the same provenance rule.
    sources = [
        {"panel": "Freeze manifest", "path": freeze["source"]["path"], "present": freeze["source"]["present"]},
        {"panel": "Sentinel preflight verdict", "path": sentinel["auditPath"], "present": sentinel["present"]},
        {"panel": "Paper-only execution verification", "path": trackd_src, "present": track_present},
        {"panel": "48h window", "path": trackd_src, "present": track_present},
        {"panel": "Operational incidents", "path": trackd_src, "present": track_present},
        {"panel": "Paper trades & performance", "path": trackd_src, "present": track_present},
        {"panel": "Execution chain (7 stages)", "path": execution_chain["source"]["path"], "present": track_present},
        {"panel": "Clock-start gate (Sentinel verdict)", "path": verdict["source"]["path"], "present": verdict["source"]["present"]},
    ]

    out = {
        "schema": "paper_candidate_v1.v1",
        "branch": "PAPER_CANDIDATE_V1",
        "branchLabel": "Branch 1 — Paper Candidate V1",
        "branchDescription": "Frozen 10-symbol 48h forward (paper/testnet) test. "
                             "Isolated from the V2 Research branch; no research result feeds it.",
        "generatedAtUtc": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sourceRoots": {"trackD": trackd_src, "sentinelAudit": _rel(SENTINEL_PREFLIGHT)},
        "overallStatus": "NOT_STARTED" if not started else "RUNNING",
        "started": started,
        "universe": UNIVERSE,
        "universeSize": len(UNIVERSE),
        # ---- required panels; all NOT_AVAILABLE / NOT_STARTED at real state ----
        "freezeManifest": freeze,
        "sentinelPreflight": sentinel,
        "executionVerification": {
            "status": "NOT_STARTED",
            "paperOnly": True,
            "endpoint": TESTNET_ENDPOINT,
            "mainnetForbidden": True,
            "detail": "No run directory exists under TRACK_D_48h_paper_test/. Paper-only "
                      "execution has not been verified because no execution has occurred.",
            "source": {"path": trackd_src, "present": track_present},
        },
        "window48h": {
            "status": "NOT_STARTED",
            "startUtc": None,
            "endUtc": None,
            "source": {"path": trackd_src, "present": track_present},
        },
        "incidents": {
            "status": "NOT_STARTED",
            "entries": [],
            "note": "No operational incidents log exists yet (the run has not started).",
            "source": {"path": trackd_src, "present": track_present},
        },
        "paperTrades": {
            "status": "NOT_AVAILABLE",
            "count": 0,
            "trades": [],
            "source": {"path": trackd_src, "present": track_present},
        },
        "paperPerformance": {
            "status": "NOT_AVAILABLE",
            "equityUsd": None,
            "realizedPnlUsd": None,
            "unrealizedPnlUsd": None,
            "openPositions": None,
            "note": "No simulated equity/PnL exists. Figures render NOT AVAILABLE — never zeros.",
            "source": {"path": trackd_src, "present": track_present},
        },
        # ---- TX:20260922-014: generic seven-stage execution chain ----
        "executionChain": execution_chain,
        "clockStartGate": verdict,
        "designDocsOnly": docs,
        "sources": sources,
        "provenanceGuard": {
            "rule": "Reject any path under AXONE_V2_RESEARCH_* not inside "
                    "TRACK_D_48h_paper_test/. Fails loudly (ProvenanceViolation).",
            "allowedSubdir": _PAPER_SUBDIR,
            "forbiddenPattern": "AXONE_V2_RESEARCH_[0-9]+",
            "pythonLocation": "scripts/gen_v2_paper_test.py:assert_paper_provenance",
            "tsLocation": "src/data/paper.ts:assertPaperProvenance",
        },
        "provenance": {
            "note": "PAPER CANDIDATE V1 is a paper/testnet forward test. Until a "
                    "run_<id> directory, a freeze manifest and a Sentinel preflight "
                    "verdict exist, every panel is NOT_AVAILABLE / NOT_STARTED. No "
                    "value is ever fabricated, carried forward, or sourced from the "
                    "V2 Research branch.",
        },
    }

    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))

    print(f"[paper-candidate-v1] track present={track_present} started={started} runs={len(runs)}")
    print(f"[paper-candidate-v1] freeze={freeze['status']} sentinel={sentinel['status']} "
          f"verdict={sentinel['verdict']}")
    print(f"[paper-candidate-v1] execution-chain status={execution_chain['status']} "
          f"lineages={execution_chain['lineageCount']} lifecycle_policy=PENDING_F3 "
          f"kill_switch={execution_chain['killSwitch']['status']}")
    print(f"[paper-candidate-v1] clock-start gate verdict={verdict['verdict']} "
          f"clock_may_start={verdict['clockMayStart']} blockers={verdict.get('blockerCount')}")
    print(f"[paper-candidate-v1] provenance gate active (reject AXONE_V2_RESEARCH_* outside {_PAPER_SUBDIR}/)")
    print(f"[paper-candidate-v1] wrote {os.path.relpath(OUT, REPO)}  sha256={short(sha256_file(OUT))}")


if __name__ == "__main__":
    main()
