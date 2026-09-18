#!/usr/bin/env python3
"""
gen_v2_symbol_research.py  --  Axone V2 · Symbol Research (Tracks A + E)

READ-ONLY generator. Emits public/data/v2_symbol_research.json.

Track A (Tibot symbol-universe expansion): original vs new symbols, promoted
family inventory, and the transfer-classification matrix. Classifications
(GENERAL_TRANSFER_PASS / CALIBRATION_REQUIRED / SYMBOL_TUNING_REQUIRED /
NOT_APPLICABLE) are only shown when a real eval cell file exists at
  TRACK_A.../<family>/<SYM>_<TF>_eval_<date>.json
Otherwise every cell is PENDING and the track carries its real BLOCKED status
from the status doc. No classification is invented.

Track E (Karen symbol discovery): advisory market context, top-trader consensus,
and the breakout/reversal/anomaly watchlist — read verbatim from Karen's cycle
JSON files. Advisory only; does not enter the frozen Track D universe.
"""

import glob
import hashlib
import json
import os
import re
from datetime import datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V2_ROOT = "/Users/julesdevaux/.openclaw/agents/axone/workspace/AXONE_V2_RESEARCH_20260918"
TRACK_A = os.path.join(V2_ROOT, "TRACK_A_symbol_universe_expansion")
TRACK_E = os.path.join(V2_ROOT, "TRACK_E_karen_symbol_discovery")
OUT = os.path.join(REPO, "public", "data", "v2_symbol_research.json")

# Original (frozen) universe + expansion targets — sourced from Track A status doc.
ORIGINAL_UNIVERSE = ["BNBUSDT", "BTCUSDT", "DOGEUSDT", "ETHUSDT", "FETUSDT",
                     "PEPEUSDT", "SHIBUSDT", "SOLUSDT", "SUIUSDT", "XRPUSDT"]
EXPANSION_TARGETS = ["ARBUSDT", "LINKUSDT", "UNIUSDT", "ATOMUSDT", "INJUSDT", "CRVUSDT"]

# Promoted family inventory (from Track A status doc, 2026-09-18).
FAMILIES = [
    {"family": "breakout_quality", "cls": "classification", "arch": "extra_trees_bq_v1",
     "timeframes": ["5m", "1h", "4h", "1D"], "note": "10 symbols x 4 TFs"},
    {"family": "ema_transition", "cls": "classification", "arch": "-",
     "timeframes": ["1h", "4h"], "note": "Gate-C SV pending Sentinel"},
    {"family": "market_regime", "cls": "classification", "arch": "-",
     "timeframes": ["1h", "4h"], "note": "Gate-C SV pending Sentinel"},
    {"family": "triple_barrier_outcome", "cls": "classification", "arch": "-",
     "timeframes": [], "note": "see family.json"},
    {"family": "ema_dynamics", "cls": "prediction", "arch": "-",
     "timeframes": ["1h", "4h"], "note": "BTCUSDT, ETHUSDT (Gate-C SV partial)"},
    {"family": "excursion_payoff_forecast", "cls": "prediction", "arch": "-",
     "timeframes": ["1h", "4h"], "note": "Gate-C SV ran 2026-08-20"},
]

CLASSES = ["GENERAL_TRANSFER_PASS", "CALIBRATION_REQUIRED", "SYMBOL_TUNING_REQUIRED", "NOT_APPLICABLE"]


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def short(s):
    return s[:12] if s else s


def load_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return None


def track_a():
    status_files = sorted(glob.glob(os.path.join(TRACK_A, "TRACK_A_STATUS_*.md")))
    status_file = status_files[-1] if status_files else None
    status_text = ""
    blocker = None
    overall = "unknown"
    if status_file and os.path.isfile(status_file):
        with open(status_file) as f:
            status_text = f.read()
        m = re.search(r"\*\*Status:\*\*\s*(.+)", status_text)
        if m:
            overall = m.group(1).strip()
        bm = re.search(r"##\s*Blocker\s*\n+(.+?)(?:\n##|\Z)", status_text, re.S)
        if bm:
            blocker = " ".join(bm.group(1).split())[:600]

    # Detect any real eval cells: <family>/<SYM>_<TF>_eval_<date>.json
    cells = {}
    for ev in glob.glob(os.path.join(TRACK_A, "*", "*_eval_*.json")):
        fam = os.path.basename(os.path.dirname(ev))
        base = os.path.basename(ev)
        cm = re.match(r"([A-Z0-9]+USDT)_([0-9a-zA-Z]+)_eval_", base)
        if not cm:
            continue
        data = load_json(ev) or {}
        disp = data.get("disposition") or data.get("classification")
        cells[f"{fam}::{cm.group(1)}::{cm.group(2)}"] = {
            "family": fam, "symbol": cm.group(1), "timeframe": cm.group(2),
            "disposition": disp if disp in CLASSES else None,
            "file": os.path.relpath(ev, V2_ROOT),
        }

    return {
        "track": "TRACK_A_symbol_universe_expansion",
        "present": bool(status_file),
        "overallStatus": overall,
        "blocked": overall.upper().startswith("BLOCKED"),
        "blocker": blocker,
        "statusFile": os.path.relpath(status_file, V2_ROOT) if status_file else None,
        "statusFileSha": short(sha256_file(status_file)) if status_file else None,
        "originalUniverse": ORIGINAL_UNIVERSE,
        "expansionTargets": EXPANSION_TARGETS,
        "families": FAMILIES,
        "classifications": CLASSES,
        "evalCellCount": len(cells),
        "evalCells": list(cells.values()),
        "note": "Transfer classifications appear only when a real eval cell exists. "
                "With no cells on disk every (target x family) is PENDING and the "
                "track is BLOCKED awaiting Sublime data provision.",
    }


def track_e():
    consensus_files = sorted(glob.glob(os.path.join(TRACK_E, "*consensus-snapshot.json")))
    discovery_files = sorted(glob.glob(os.path.join(TRACK_E, "*discovery-candidates.json")))
    consensus = load_json(consensus_files[-1]) if consensus_files else None
    discovery = load_json(discovery_files[-1]) if discovery_files else None
    out = {
        "track": "TRACK_E_karen_symbol_discovery",
        "present": bool(consensus or discovery),
        "advisoryOnly": True,
        "consensus": None,
        "discovery": None,
    }
    if consensus:
        out["consensus"] = consensus
        out["consensusFile"] = os.path.relpath(consensus_files[-1], V2_ROOT)
        out["consensusSha"] = short(sha256_file(consensus_files[-1]))
    if discovery:
        out["discovery"] = discovery
        out["discoveryFile"] = os.path.relpath(discovery_files[-1], V2_ROOT)
        out["discoverySha"] = short(sha256_file(discovery_files[-1]))
    return out


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    a = track_a()
    e = track_e()
    out = {
        "schema": "v2_symbol_research.v1",
        "generatedAtUtc": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sourceRoot": V2_ROOT,
        "trackA": a,
        "trackE": e,
        "provenance": {
            "note": "Track A transfer results are read from real eval-cell files only; "
                    "none exist yet so classifications are PENDING and the track is BLOCKED. "
                    "Track E is Karen advisory context read verbatim from cycle JSON — "
                    "advisory only, does not enter the frozen Track D 48h universe.",
        },
    }
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"[symbol-research] Track A present={a['present']} blocked={a['blocked']} evalCells={a['evalCellCount']}")
    print(f"[symbol-research] Track E present={e['present']} "
          f"consensus={'y' if e['consensus'] else 'n'} discovery={'y' if e['discovery'] else 'n'}")
    print(f"[symbol-research] wrote {os.path.relpath(OUT, REPO)}  sha256={short(sha256_file(OUT))}")


if __name__ == "__main__":
    main()
