#!/usr/bin/env python3
"""
gen_manifest_registry.py  —  Axone Progressive Manifest Registry (scaffold, additive)

Guy is READ-ONLY with respect to Axone. This script:
  * consumes only ALREADY-PUBLISHED artifacts:
      - the dashboard's own verified, hash-gated slices in public/data/
        (chronos_targets_*.json, ta_v3_*.json) — these were produced by the
        dual-hash-gated Chronos generators, so their embedded manifests are the
        authoritative record of what is verified AND rendered on the dashboard;
      - Chronos EVIDENCE manifests (read-only) for pending / not-yet-rendered
        slices, e.g. the MODEL_CHOICE_V1 package (Tier 4 predictions).
  * writes ONE file: public/data/manifest_registry.json
  * never reads or writes Axone source data (no parquet/CSV, no recompute).

Registry model — a progressive tiered universe. Each slice is (symbol, timeframe,
tier) with a status:
    verified  — a published manifest exists AND the slice is reflected (hash-gated)
                on the dashboard  -> the UI renders it.
    pending   — declared / upstream-certified but not yet surfaced & hash-gated
                here (or gated behind Gate A)  -> the UI shows a pending state.
    blocked   — manifest present but explicitly not-for-use (e.g. source-rights).

Tiers:
    t1_ohlcv    Raw OHLCV                 (Chronos / Spider certified native source)
    t2_features Technical features        (Chronos TA-v3)
    t3_targets  Ground-truth targets      (Chronos predictive targets / label contract)
    t4_models   Models & predictions      (Tibot selected/alternative) — Gate-A gated
"""
import json
import os
import glob
import hashlib
from datetime import datetime, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DATA = os.path.join(REPO, "public", "data")
CHRONOS_EVIDENCE = os.path.expanduser(
    "~/.openclaw/agents/chronos/workspace/EVIDENCE"
)
OUT = os.path.join(PUBLIC_DATA, "manifest_registry.json")

TIERS = [
    {"key": "t1_ohlcv",    "label": "Raw OHLCV",           "order": 1,
     "owner": "Chronos / Spider", "desc": "Certified native-source open/high/low/close/volume bars."},
    {"key": "t2_features", "label": "Technical features",  "order": 2,
     "owner": "Chronos",          "desc": "TA-v3 causal feature columns derived from raw OHLCV."},
    {"key": "t3_targets",  "label": "Ground-truth targets","order": 3,
     "owner": "Chronos",          "desc": "Label-only predictive targets (purged/embargoed; never live features)."},
    {"key": "t4_models",   "label": "Models & predictions","order": 4,
     "owner": "Tibot",            "desc": "Selected/alternative models, timestamp-aligned predictions, confidence & metrics."},
]

# Ordering used for display; a symbol/TF only appears if it is actually published.
TF_ORDER = ["5m", "15m", "1h", "4h", "1D"]
SYM_ORDER = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
             "DOGEUSDT", "FETUSDT", "PEPEUSDT", "SHIBUSDT", "SUIUSDT"]


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def short(h):
    return (h[:16] + "…") if isinstance(h, str) and len(h) > 17 else h


def load_json(path):
    with open(path, "r") as f:
        return json.load(f)


def sym_sort(sym):
    return (SYM_ORDER.index(sym) if sym in SYM_ORDER else 99, sym)


def tf_sort(tf):
    return (TF_ORDER.index(tf) if tf in TF_ORDER else 99, tf)


def collect_target_slices():
    """Tier 1 (OHLCV) + Tier 3 (targets): verified & rendered from the dashboard's
    own hash-gated chronos_targets_{sym}_{tf}.json data files."""
    slices = []
    symbols = set()
    tfs = set()
    for path in sorted(glob.glob(os.path.join(PUBLIC_DATA, "chronos_targets_*.json"))):
        base = os.path.basename(path)
        if base.startswith("chronos_targets_provenance"):
            continue
        try:
            d = load_json(path)
            m = d.get("manifest", {})
        except Exception:
            continue
        sym = (m.get("symbol") or "").upper()
        tf = m.get("interval") or ""
        if not sym or not tf:
            continue
        symbols.add(sym)
        tfs.add(tf)
        rng = {
            "startUtc": m.get("windowStart"),
            "endUtc": m.get("windowEnd"),
        }
        rows = m.get("rows")
        canonical = m.get("canonicalRows")
        rel = os.path.relpath(path, PUBLIC_DATA)
        # Tier 1 — Raw OHLCV (source CSV hash gates this slice)
        slices.append({
            "symbol": sym, "timeframe": tf, "tier": "t1_ohlcv", "status": "verified",
            "rows": rows, "canonicalRows": canonical, "range": rng,
            "source": "Chronos ta_v3 native OHLCV (dual-hash-gated)",
            "manifestSha256": m.get("sourceCsvSha256"),
            "renderedFile": f"data/{rel}",
            "renderedRoute": "/chronos",
            "note": "OHLCV shipped inside the hash-gated targets bundle.",
        })
        # Tier 3 — Ground-truth targets
        slices.append({
            "symbol": sym, "timeframe": tf, "tier": "t3_targets", "status": "verified",
            "rows": rows, "canonicalRows": canonical, "range": rng,
            "targetCount": m.get("targetCount"),
            "source": "Chronos predictive targets v3 (label-only)",
            "manifestSha256": m.get("targetsCsvSha256"),
            "renderedFile": f"data/{rel}",
            "renderedRoute": "/chronos",
            "note": "Labels only — never used as Tibot features / live inference.",
        })
    return slices, symbols, tfs


def collect_feature_slices(symbols, tfs):
    """Tier 2 (technical features): verified where the full TA-v3 slice is actually
    rendered (public/data/ta_v3_{sym}_{tf}.json); otherwise pending (upstream-
    certified by Chronos but not yet surfaced on the dashboard)."""
    slices = []
    rendered = {}
    for path in sorted(glob.glob(os.path.join(PUBLIC_DATA, "ta_v3_*.json"))):
        base = os.path.basename(path)
        if base == "ta_v3_provenance.json":
            continue
        try:
            d = load_json(path)
            m = d.get("manifest", {})
        except Exception:
            continue
        sym = (m.get("symbol") or "").upper()
        tf = m.get("interval") or ""
        if sym and tf:
            rendered[(sym, tf)] = (m, os.path.relpath(path, PUBLIC_DATA))
    for sym in sorted(symbols, key=sym_sort):
        for tf in sorted(tfs, key=tf_sort):
            # only emit a feature slice where the (sym,tf) pair actually exists as a
            # target slice (keeps the matrix to the real published grid)
            key = (sym, tf)
            if key in rendered:
                m, rel = rendered[key]
                slices.append({
                    "symbol": sym, "timeframe": tf, "tier": "t2_features", "status": "verified",
                    "rows": m.get("rows"), "canonicalRows": m.get("canonicalRows"),
                    "range": {"startUtc": m.get("windowStart"), "endUtc": m.get("windowEnd")},
                    "featureCount": m.get("columns") if isinstance(m.get("columns"), int) else m.get("featureCount"),
                    "source": "Chronos Technical_analysis_v3 (149-col certified)",
                    "manifestSha256": m.get("sourceCsvSha256") or m.get("ledgerSha256"),
                    "renderedFile": f"data/{rel}",
                    "renderedRoute": "/ta-v2",
                    "note": "Full TA-v3 feature slice surfaced on the Sandbox chart.",
                })
    return slices, set(rendered.keys())


def pending_feature_slices(target_pairs, rendered_feature_pairs):
    """For every published (sym,tf) that has verified targets but no rendered feature
    slice yet, register Tier-2 as pending (upstream-certified, not surfaced)."""
    out = []
    for (sym, tf) in sorted(target_pairs, key=lambda p: (sym_sort(p[0]), tf_sort(p[1]))):
        if (sym, tf) in rendered_feature_pairs:
            continue
        out.append({
            "symbol": sym, "timeframe": tf, "tier": "t2_features", "status": "pending",
            "source": "Chronos Technical_analysis_v3 (upstream evidence)",
            "renderedRoute": None,
            "note": "TA-v3 features certified upstream by Chronos; full slice not yet surfaced on the dashboard.",
        })
    return out


def collect_model_choice_pending():
    """Tier 4 (models & predictions): register the MODEL_CHOICE_V1 package as the
    first Tier-4 slice. It is pending/blocked pending Tibot exports + Gate A.
    Read-only over Chronos EVIDENCE metadata only."""
    slices = []
    gate = {
        "gateA": {
            "status": "pending",
            "label": "Gate A — Tibot Tier-4 export contract",
            "description": (
                "Tier-4 predictions render only after Gate A passes and Tibot emits "
                "hash-manifested dashboard exports. Contract coordinated with Tibot on pass."
            ),
        }
    }
    man_dir = os.path.join(CHRONOS_EVIDENCE, "MANIFESTS")
    mc_manifest = None
    if os.path.isdir(man_dir):
        cand = sorted(glob.glob(os.path.join(man_dir, "MODEL_CHOICE_V1_*_manifest.json")))
        if cand:
            mc_manifest = cand[-1]
    scope = {}
    package_status = None
    manifest_sha = None
    if mc_manifest and os.path.isfile(mc_manifest):
        try:
            mm = load_json(mc_manifest)
            package_status = mm.get("package_status")
            manifest_sha = mm.get("package_manifest_content_sha256") or mm.get("evidence_content_sha256")
        except Exception:
            pass
    # intake ledger (scope: symbol/interval/target contract)
    led = sorted(glob.glob(os.path.join(
        CHRONOS_EVIDENCE, "MODEL_CHOICE_V1_*", "*intake_ledger*.json")))
    if led:
        try:
            ld = load_json(led[-1])
            scope = ld.get("scope", {})
        except Exception:
            pass
    sym = (scope.get("symbol") or "BTCUSDT").upper()
    tf = scope.get("interval") or "1h"
    # blocked if the package is flagged not-for-use, else pending
    status = "blocked" if (package_status and "NOT_FOR_TRAINING" in package_status) else "pending"
    slices.append({
        "symbol": sym, "timeframe": tf, "tier": "t4_models", "status": status,
        "range": {"startUtc": scope.get("certified_start_utc"), "endUtc": scope.get("certified_end_utc")},
        "rows": scope.get("X_rows"),
        "source": "Tibot MODEL_CHOICE_V1 (Chronos-certified intake)",
        "manifestSha256": manifest_sha,
        "packageStatus": package_status,
        "targetContract": scope.get("contract_id") or "target_direction_1_v1.0",
        "renderedRoute": None,
        "note": "Awaiting Gate A + Tibot dashboard exports (prediction/actual/confidence/metrics).",
        "gate": "gateA",
    })
    return slices, gate, {
        "manifestPath": os.path.relpath(mc_manifest, os.path.dirname(REPO)) if mc_manifest else None,
        "packageStatus": package_status,
    }


def main():
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    t13, syms, tfs = collect_target_slices()
    target_pairs = {(s["symbol"], s["timeframe"]) for s in t13 if s["tier"] == "t3_targets"}
    t2, rendered_feature_pairs = collect_feature_slices(syms, tfs)
    t2_pending = pending_feature_slices(target_pairs, rendered_feature_pairs)
    t4, gate, mc_meta = collect_model_choice_pending()

    slices = t13 + t2 + t2_pending + t4
    # register the model-choice pending symbol/tf into the grid even if not in targets
    for s in t4:
        syms.add(s["symbol"])
        tfs.add(s["timeframe"])

    # tally
    tally = {t["key"]: {"verified": 0, "pending": 0, "blocked": 0} for t in TIERS}
    for s in slices:
        tally[s["tier"]][s["status"]] += 1

    registry = {
        "artifactType": "AXONE_PROGRESSIVE_MANIFEST_REGISTRY",
        "version": "scaffold_v1",
        "generatedAtUtc": now,
        "generatedBy": "Guy (dashboard, read-only)",
        "banner": "Historical sandbox — not live forecasts",
        "policy": {
            "renderRule": "Only slices with status 'verified' render; 'pending'/'blocked' show a placeholder state.",
            "readOnly": "Guy consumes published Chronos/Tibot manifests read-only and never mutates Axone source data.",
            "leakage": "Tier-3 targets are labels only — never Tibot features or live inference.",
        },
        "tiers": TIERS,
        "gates": gate,
        "symbols": sorted(syms, key=sym_sort),
        "timeframes": sorted(tfs, key=tf_sort),
        "tally": tally,
        "sliceCount": len(slices),
        "slices": slices,
        "provenance": {
            "targetsGridSource": "public/data/chronos_targets_*.json (dual-hash-gated)",
            "featuresSource": "public/data/ta_v3_*.json (149-col certified)",
            "modelChoice": mc_meta,
            "note": "Additive scaffold. Existing live views (/, /chronos, /ta-v2, /tibot) unchanged.",
        },
    }

    with open(OUT, "w") as f:
        json.dump(registry, f, indent=2)
    out_sha = sha256_file(OUT)

    print(f"[registry] wrote {os.path.relpath(OUT, REPO)}  sha256={short(out_sha)}")
    print(f"[registry] symbols={len(registry['symbols'])} timeframes={registry['timeframes']}")
    print(f"[registry] slices={len(slices)}")
    for t in TIERS:
        k = t["key"]
        print(f"           {k:12s} verified={tally[k]['verified']:3d} "
              f"pending={tally[k]['pending']:3d} blocked={tally[k]['blocked']:3d}")


if __name__ == "__main__":
    main()
