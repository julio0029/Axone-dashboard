#!/usr/bin/env python3
"""
gen_v2_paper_test.py  --  Axone V2 · 48h Paper Test (Track D)

READ-ONLY generator. Emits public/data/v2_paper_test.json.

CRITICAL: Track D is PAPER / TESTNET only (Binance Testnet — no mainnet, no real
money). The emitted JSON carries explicit simulated=true / realMoney=false /
endpoint flags so the UI can label every equity/PnL figure as SIMULATED. This is
a hard requirement, not a style choice.

The generator scans for run directories under
  TRACK_D_48h_paper_test/run_<run_id>/
and reads the append-only logs defined in the Wolf→Paper Adapter Contract V1:
  TRACK_D_WOLF_LEDGER.jsonl        (Wolf-owned; intended actions / decisions)
  TRACK_D_ADAPTER_LOG.jsonl        (Adapter-owned; testnet acks / fills)
  TRACK_D_PORTFOLIO_LEDGER.jsonl   (Wolf-owned; per-boundary equity/positions)
  TRACK_D_HEARTBEAT.jsonl          (per-5m-boundary heartbeat)
  TRACK_D_RECONCILIATION_LOG.jsonl (drift snapshots)
  TRACK_D_KILL_SWITCH_LOG.jsonl    (state transitions)

Until the paper run starts, no run dir exists -> status "not_started" and the UI
shows the labelled structure with 'awaiting data' — never fabricated fills.

Decision (Wally/Wolf INTENDED action) and execution (paper-exchange ack/fill) are
kept as SEPARATE fields, mirroring the contract's two-record design so a viewer
can never confuse an intent with a fill.
"""

import glob
import hashlib
import json
import os
from datetime import datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V2_ROOT = "/Users/julesdevaux/.openclaw/agents/axone/workspace/AXONE_V2_RESEARCH_20260918"
TRACK_D = os.path.join(V2_ROOT, "TRACK_D_48h_paper_test")
OUT = os.path.join(REPO, "public", "data", "v2_paper_test.json")

TESTNET_ENDPOINT = "https://testnet.binance.vision"
UNIVERSE = ["BNBUSDT", "BTCUSDT", "DOGEUSDT", "ETHUSDT", "FETUSDT",
            "PEPEUSDT", "SHIBUSDT", "SOLUSDT", "SUIUSDT", "XRPUSDT"]
TAIL = 200  # most-recent rows shipped per log


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def short(s):
    return s[:12] if s else s


def tail_jsonl(path, n=TAIL):
    rows = []
    if not os.path.isfile(path):
        return rows, 0
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    total = len(rows)
    return rows[-n:], total


def build_run(run_dir):
    """Read a live/complete run directory's logs (used once the run exists)."""
    def p(name):
        return os.path.join(run_dir, name)

    wolf, wolf_n = tail_jsonl(p("TRACK_D_WOLF_LEDGER.jsonl"))
    adapter, adapter_n = tail_jsonl(p("TRACK_D_ADAPTER_LOG.jsonl"))
    portfolio, portfolio_n = tail_jsonl(p("TRACK_D_PORTFOLIO_LEDGER.jsonl"))
    heartbeat, hb_n = tail_jsonl(p("TRACK_D_HEARTBEAT.jsonl"))
    recon, recon_n = tail_jsonl(p("TRACK_D_RECONCILIATION_LOG.jsonl"))
    killsw, ks_n = tail_jsonl(p("TRACK_D_KILL_SWITCH_LOG.jsonl"))

    latest_equity = portfolio[-1] if portfolio else None
    latest_ks = killsw[-1] if killsw else None
    latest_hb = heartbeat[-1] if heartbeat else None

    # missed boundaries: heartbeats flagged as gaps/missed
    missed = [h for h in heartbeat if h.get("missed") or h.get("status") in ("MISSED", "GAP")]

    return {
        "runId": os.path.basename(run_dir),
        "runDir": os.path.relpath(run_dir, V2_ROOT),
        "counts": {
            "wolfDecisions": wolf_n, "adapterFills": adapter_n,
            "portfolioBoundaries": portfolio_n, "heartbeats": hb_n,
            "reconciliations": recon_n, "killSwitchTransitions": ks_n,
        },
        "latestEquity": latest_equity,
        "killSwitchState": (latest_ks or {}).get("state", "ARMED"),
        "latestHeartbeat": latest_hb,
        "missedBoundaries": missed[-50:],
        "missedBoundaryCount": len(missed),
        "wolfDecisionsTail": wolf,
        "adapterFillsTail": adapter,
        "portfolioTail": portfolio,
        "reconciliationTail": recon,
        "killSwitchLog": killsw,
    }


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    track_present = os.path.isdir(TRACK_D)
    run_dirs = sorted(glob.glob(os.path.join(TRACK_D, "run_*")))
    run_dirs = [d for d in run_dirs if os.path.isdir(d)]

    # contract doc provenance (frozen field structure the UI renders as labels)
    contract = glob.glob(os.path.join(TRACK_D, "WOLF_PAPER_ADAPTER_CONTRACT_*.md"))
    contract_file = sorted(contract)[-1] if contract else None

    if run_dirs:
        active = build_run(run_dirs[-1])
        status = "running"
    else:
        active = None
        status = "not_started"

    out = {
        "schema": "v2_paper_test.v1",
        "track": "TRACK_D_48h_paper_test",
        "generatedAtUtc": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sourceRoot": TRACK_D,
        "trackPresent": track_present,
        "status": status,
        # ---- HARD LABELLING FLAGS (consumed by the UI to mark every figure) ----
        "mode": "PAPER_TESTNET",
        "simulated": True,
        "realMoney": False,
        "exchangeEndpoint": TESTNET_ENDPOINT,
        "labelBanner": "PAPER / TESTNET — SIMULATED · NO REAL MONEY · Binance Testnet only",
        # ------------------------------------------------------------------------
        "universe": UNIVERSE,
        "slotSizeUsd": 200.00,
        "orderType": "MARKET",
        "boundarySeconds": 300,
        "decisionExecutionSeparation": {
            "decisionRecord": "WolfAction (schema wolf_action.v1) — Wolf's INTENDED action; "
                              "HOLD/NO_ACTION never traverse the adapter (ledger-only).",
            "executionRecord": "AdapterFill (schema adapter_fill.v1) — testnet ack/fill returned "
                               "by the paper adapter; stored as a SEPARATE record so intent and "
                               "fill can never be conflated.",
            "fillStatuses": ["FILLED", "PARTIAL", "REJECTED", "TIMEOUT",
                             "DUPLICATE_REJECTED", "PRE_FLIGHT_REJECTED"],
        },
        "pipelineHealthComponents": [
            {"key": "heartbeat", "label": "5m boundary heartbeat", "source": "TRACK_D_HEARTBEAT.jsonl"},
            {"key": "reconciliation", "label": "Position/cash reconciliation", "source": "TRACK_D_RECONCILIATION_LOG.jsonl"},
            {"key": "killSwitch", "label": "Kill switch", "source": "TRACK_D_KILL_SWITCH_LOG.jsonl",
             "states": ["ARMED", "TRIGGERED", "HALTED"]},
            {"key": "credentialSafety", "label": "Credential safety (testnet-pinned)", "source": "TRACK_D_CREDENTIAL_SAFETY_LOG.jsonl"},
        ],
        "severityModel": ["FINDING", "DEGRADED", "INVALIDATING"],
        "activeRun": active,
        "contractFile": os.path.relpath(contract_file, V2_ROOT) if contract_file else None,
        "contractSha": short(sha256_file(contract_file)) if contract_file else None,
        "provenance": {
            "note": "Track D is Binance Testnet paper trading only. No mainnet endpoint is valid. "
                    "Until a run_<id> directory with append-only logs exists, status is "
                    "'not_started' and the view shows labelled structure with awaiting-data — "
                    "no fills, equity, or PnL are ever fabricated.",
        },
    }
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"[paper-test] track present={track_present} status={status} runDirs={len(run_dirs)}")
    print(f"[paper-test] mode=PAPER_TESTNET simulated=True realMoney=False endpoint={TESTNET_ENDPOINT}")
    print(f"[paper-test] wrote {os.path.relpath(OUT, REPO)}  sha256={short(sha256_file(OUT))}")


if __name__ == "__main__":
    main()
