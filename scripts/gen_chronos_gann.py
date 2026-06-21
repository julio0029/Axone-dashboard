#!/usr/bin/env python3
"""Generate the Sandbox chart's real export JSON from Chronos' verified
Gate-A BTCUSDT calculation-run bundle.

Source of truth (read-only): the Sentinel-gated, hash-verified artifacts under
Chronos' EVIDENCE/gateA_run_20260621/. This script NEVER mutates Axone data — it
reads the canonical Gann parquet files and emits display-windowed JSON for the
dashboard's existing TaV2Export contract: { manifest, time[], columns{} }.

The 8 artifact SHA-256 hashes are re-verified here before any JSON is written;
a mismatch aborts the run (data is sacred).
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

import pyarrow.parquet as pq

# ── verified bundle (paths + hashes straight from Chronos' manifest) ──────────
RUN = Path(
    "/Users/julesdevaux/.openclaw/agents/chronos/workspace/EVIDENCE/gateA_run_20260621"
)
MANIFEST = RUN / "gateA_btcusdt_calculation_manifest_20260621.json"
BUNDLE = RUN / "btcusdt_dashboard_bundle_20260621.json"
ARTIFACTS = RUN / "artifacts"

# display windows per timeframe (most-recent N candles; 1D ships full history)
WINDOWS = {"5m": 3000, "1h": 3000, "4h": 3000, "1D": None}

OUT = Path(__file__).resolve().parent.parent / "public" / "data"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def verify_hashes(manifest: dict) -> None:
    """Re-verify all 8 artifact hashes against the manifest before emitting."""
    bad = []
    g = manifest["pipeline_outputs"]["gann_swing_outputs"]
    s = manifest["pipeline_outputs"]["workspace_canonical_store"]
    for tf, meta in g.items():
        p = Path(meta["output_path"])
        if sha256(p) != meta["sha256"]:
            bad.append(("gann", tf, p))
    for tf, meta in s.items():
        p = Path(meta.get("output_path") or meta.get("path"))
        if sha256(p) != meta["sha256"]:
            bad.append(("canonical", tf, p))
    if bad:
        for kind, tf, p in bad:
            print(f"HASH MISMATCH: {kind} {tf} {p}", file=sys.stderr)
        raise SystemExit("aborting: artifact hash verification failed")
    print("hash verification: all 8 artifacts PASS")


def build_export(tf: str, manifest: dict) -> dict:
    gmeta = manifest["pipeline_outputs"]["gann_swing_outputs"][tf]
    src = Path(gmeta["output_path"])
    df = pq.read_table(src).to_pandas()
    total = len(df)
    win = WINDOWS[tf]
    if win is not None and total > win:
        df = df.tail(win).reset_index(drop=True)
    rows = len(df)

    ts = df["timestamp"]
    time_ms = (ts.astype("int64") // 1_000_000).tolist()

    def numcol(name):
        return [None if v != v else float(v) for v in df[name].tolist()]

    columns = {
        "open": numcol("open"),
        "high": numcol("high"),
        "low": numcol("low"),
        "close": numcol("close"),
        "volume": numcol("volume"),
        # certified Gann swing-direction column, verbatim: +1 up / -1 down / null
        "gann_swing": numcol("gann_swing"),
    }

    win_start = ts.iloc[0].strftime("%Y-%m-%d %H:%M")
    win_end = ts.iloc[-1].strftime("%Y-%m-%d %H:%M")

    out_manifest = {
        "symbol": manifest["scope"]["symbol"],
        "interval": tf,
        "rows": rows,
        "windowStart": win_start,
        "windowEnd": win_end,
        # seal shown on the chart = the matched Sentinel gate SHA (Gate-A proof)
        "sha1": manifest["sentinel_gate_sha"],
        "scriptFile": "core/contracts/technical_analysis_v2_gann.py (v2-locked)",
        "env": "Chronos Gate-A calculation run",
        "generatedAt": manifest["generated_at"],
        # extended, verified provenance (optional fields the UI reads)
        "manifestId": manifest["manifest_id"],
        "gateAVerdict": manifest["verdict"],
        "sentinelSha": manifest["sentinel_gate_sha"],
        "gannShimSha256": manifest["gann_shim_sha256"],
        "canonicalRows": gmeta["total_rows"],
        "upPct": gmeta["up_pct"],
        "downPct": gmeta["down_pct"],
        "nanCount": gmeta["nan_count"],
        "columns": [
            {"name": "open", "dtype": "float64", "role": "price"},
            {"name": "high", "dtype": "float64", "role": "price"},
            {"name": "low", "dtype": "float64", "role": "price"},
            {"name": "close", "dtype": "float64", "role": "price"},
            {"name": "volume", "dtype": "float64", "role": "volume", "group": "candles"},
            {
                "name": "gann_swing",
                "dtype": "float64",
                "role": "marker",
                "group": "gann",
                "nanPct": gmeta["nan_count"] / gmeta["total_rows"],
            },
        ],
    }
    return {"manifest": out_manifest, "time": time_ms, "columns": columns}


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    bundle = json.loads(BUNDLE.read_text())
    if manifest["verdict"] != "PASS":
        raise SystemExit(f"manifest verdict is {manifest['verdict']!r}, not PASS")
    verify_hashes(manifest)

    OUT.mkdir(parents=True, exist_ok=True)
    written = []
    for tf in ("5m", "1h", "4h", "1D"):
        exp = build_export(tf, manifest)
        dst = OUT / f"gann_btcusdt_{tf}.json"
        dst.write_text(json.dumps(exp, separators=(",", ":")))
        kb = dst.stat().st_size / 1024
        written.append((tf, exp["manifest"]["rows"], exp["manifest"]["canonicalRows"], kb))
        print(f"  {tf}: {exp['manifest']['rows']} rows shown / {exp['manifest']['canonicalRows']} canonical → {dst.name} ({kb:.0f} KB)")

    # provenance summary the page imports for the Gate-A cards
    prov = {
        "manifestId": manifest["manifest_id"],
        "bundleId": bundle["bundle_id"],
        "verdict": manifest["verdict"],
        "generatedAt": manifest["generated_at"],
        "sentinelSha": manifest["sentinel_gate_sha"],
        "gannShimSha256": manifest["gann_shim_sha256"],
        "gateBStatus": manifest["gate_b_status"],
        "scope": manifest["scope"],
        "gapAudit": manifest["gap_audit"],
        "ingest": {
            "totalSourceCandles": bundle["dataset_summary"]["total_source_candles"],
            "authorizedRepairs": bundle["dataset_summary"]["authorized_repairs"],
            "knownGaps": bundle["dataset_summary"]["known_gaps"],
        },
        "provenanceChain": bundle["provenance_chain"],
        "validation": manifest["validation"],
        "timeframes": {
            tf: {
                "canonicalRows": manifest["pipeline_outputs"]["gann_swing_outputs"][tf]["total_rows"],
                "upPct": manifest["pipeline_outputs"]["gann_swing_outputs"][tf]["up_pct"],
                "downPct": manifest["pipeline_outputs"]["gann_swing_outputs"][tf]["down_pct"],
                "nanCount": manifest["pipeline_outputs"]["gann_swing_outputs"][tf]["nan_count"],
            }
            for tf in ("5m", "1h", "4h", "1D")
        },
    }
    (OUT / "chronos_gateA_provenance.json").write_text(json.dumps(prov, indent=2))
    print(f"  provenance → chronos_gateA_provenance.json")
    print("done:", len(written), "timeframe exports written")


if __name__ == "__main__":
    main()
