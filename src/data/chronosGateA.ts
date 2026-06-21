// ─────────────────────────────────────────────────────────────────────────
// Chronos Gate-A · BTCUSDT calculation run — verified provenance.
//
// Source of truth (read-only, hash-verified before any dashboard write):
//   agents/chronos/workspace/EVIDENCE/gateA_run_20260621/
//     gateA_btcusdt_calculation_manifest_20260621.json
//     btcusdt_dashboard_bundle_20260621.json
//
// All 8 artifact SHA-256 hashes were re-verified by Guy (scripts/gen_chronos_gann.py)
// against the manifest — see public/data/chronos_gateA_provenance.json. These are
// faithful copies of certified values; nothing here is invented or recomputed.
// ─────────────────────────────────────────────────────────────────────────

export const CHRONOS_GATE_A = {
  manifestId: 'chronos-gateA-btcusdt-calculation-run-20260621',
  bundleId: 'chronos-btcusdt-dashboard-bundle-20260621',
  verdict: 'PASS',
  generatedAt: '2026-06-21T08:47:00Z',
  sentinelSha: '791418cf83e3c258f353fa8de20e8d3e6763b614e1d395271354b0845dbee7e0',
  gannShimSha256: '429873fdc1a252f59e97d292698d023d282d0e36aa8e414eb600e091339c6ac0',
  gateBStatus: 'PARKED — targets.py / EVIDENCE target spec not built',
  symbol: 'BTCUSDT',
  venue: 'binance',
  source: 'binance-vision (Spider-mediated)',
  rangeStart: '2020-01-01',
  rangeEnd: '2025-12-31',
  totalSourceCandles: 683411,
  authorizedRepairs: 2,
} as const

/** Per-timeframe canonical row counts + certified Gann swing-direction split. */
export interface TfStat {
  tf: '5m' | '1h' | '4h' | '1D'
  rows: number
  upPct: number
  downPct: number
  nanCount: number
}

export const GATE_A_TIMEFRAMES: TfStat[] = [
  { tf: '5m', rows: 630834, upPct: 50.46, downPct: 49.54, nanCount: 1 },
  { tf: '1h', rows: 52577, upPct: 51.56, downPct: 48.43, nanCount: 1 },
  { tf: '4h', rows: 13151, upPct: 52.81, downPct: 47.17, nanCount: 3 },
  { tf: '1D', rows: 2192, upPct: 53.01, downPct: 46.94, nanCount: 1 },
]

/** Accepted ingest gaps (binance-downtime-accepted, consistent w/ ledger). */
export const GATE_A_GAPS = {
  '5m': { breaks: 15, missing: 462 },
  '1h': { breaks: 15, missing: 31 },
} as const

/** The certified validation checklist (all true) from the Gate-A manifest. */
export const GATE_A_VALIDATION: { key: string; label: string }[] = [
  { key: 'canonical_schema_pass', label: 'Canonical schema' },
  { key: 'row_count_verified', label: 'Row counts re-read' },
  { key: 'dedup_keys_verified', label: 'Dedup keys' },
  { key: 'monotonic_timestamps_verified', label: 'Monotonic timestamps' },
  { key: 'ohlc_positive_verified', label: 'OHLC positive' },
  { key: 'high_gte_low_verified', label: 'High ≥ Low' },
  { key: 'gann_shim_sha256_verified', label: 'Gann shim SHA-256' },
  { key: 'no_live_writes', label: 'No live writes' },
  { key: 'no_target_columns', label: 'No target columns (Gate B parked)' },
]

/** End-to-end provenance chain (Spider → Sublime → Chronos → Guy). */
export const GATE_A_PROVENANCE_CHAIN: string[] = [
  'Binance Vision public dataset (Spider-fetched)',
  'Spider: 288 ZIP+CHECKSUM files, HTTP 200, no checksum mismatches',
  'Sublime ingest_parquet.py SHA-1 94726b04 — 683,411 rows, 10/10 tests PASS',
  'Chronos owner-acceptance PASS',
  'Live ingest: 683,411 rows, 144 partitions, 0 month gaps, 2 authorized repairs',
  'Gate A calculation pipeline PASS (run_pipeline.py 2026-06-21T08:47 UTC)',
  'Dashboard bundle verification PASS — all 8 SHA-256 hashes confirmed',
  'Guy: re-verified 8 hashes, sealed Sandbox export (read-only, no Axone mutation)',
]
