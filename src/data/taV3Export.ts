// ─────────────────────────────────────────────────────────────────────────
// TA-v3 export contract — the Sandbox chart's real data source.
//
// Source of truth: Chronos' certified BTCUSDT Technical_analysis_v3 fresh pass
// (run ta_v3_btcusdt_20260622). All 149 certified columns are exported per
// timeframe (5m, 1h); only ROWS are windowed (tail) so the 1.5 GB 5m file is
// browser-safe. Nothing here is mock data and nothing is recomputed client-side
// — values are copied verbatim from the certified CSV by scripts/gen_ta_v3.py,
// which re-verifies every CSV SHA-256 against CERTIFIED_LEDGER.json first.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'

export type TaV3Tf = '5m' | '1h'

export const TA_V3_TIMEFRAMES: TaV3Tf[] = ['5m', '1h']

export const TA_V3_PATHS: Record<TaV3Tf, string> = {
  '5m': `${import.meta.env.BASE_URL}data/ta_v3_btcusdt_5m.json`,
  '1h': `${import.meta.env.BASE_URL}data/ta_v3_btcusdt_1h.json`,
}

export const TA_V3_PROVENANCE_PATH = `${import.meta.env.BASE_URL}data/ta_v3_provenance.json`

/** How a column is rendered. `meta` columns are NOT plotted — they live in the
 *  data/inspection layer (still independently toggleable, never dropped). */
export type V3Role = 'price' | 'overlay' | 'oscillator' | 'volume' | 'marker' | 'meta'

export interface V3Column {
  name: string
  dtype: string
  group: string
  groupLabel: string
  role: V3Role
  plottable: boolean
  nanPct: number
  /** Oscillator scale-band — groups compatible scales into one sub-pane. */
  band?: string
}

export interface V3Manifest {
  symbol: string
  interval: string
  rows: number
  canonicalRows: number
  columnCount: number
  windowMode: string
  windowN: number
  windowRowRange: [number, number]
  windowStart: string
  windowEnd: string
  tsRangeCanonical: { first: string; last: string }
  csvSha256: string
  ledgerSha256: string
  scriptSha1: string
  scriptSha256: string
  causalNote: string
  gateVerdict: string
  generatedBy: string
  generatedAt: string
  columns: V3Column[]
}

/** Columnar payload. `time` is ms-epoch per row. Numeric columns are number|null;
 *  meta timestamp columns are string|null. Aligned to `time` by index. */
export interface TaV3Export {
  manifest: V3Manifest
  time: number[]
  columns: Record<string, (number | string | null)[]>
}

// human labels + ordering for oscillator scale-bands (sub-panes)
export const BAND_LABEL: Record<string, string> = {
  bounded: 'Bounded 0–100 (RSI / Stoch / DI / MFI…)',
  macd: 'MACD',
  momentum: 'Momentum (ROC / CCI…)',
  volatility: 'Volatility (ATR / TR / span)',
  flow: 'Flow (OBV / CMF)',
  cycle: 'Time cycle (sin / cos)',
  gann: 'Gann count',
  htf_vol: 'HTF volume',
  rel: 'Relative-price ratios',
  sr_dist: 'S/R distance',
  misc: 'Other oscillators',
}

export const BAND_ORDER = [
  'bounded', 'macd', 'momentum', 'volatility', 'flow',
  'rel', 'sr_dist', 'htf_vol', 'cycle', 'gann', 'misc',
]

// ── loader hooks ─────────────────────────────────────────────────────────────

export type LoadStatus = 'loading' | 'ready' | 'absent' | 'error'

export interface ExportState {
  status: LoadStatus
  data: TaV3Export | null
  error?: string
}

export function useTaV3Export(path: string): ExportState {
  const [state, setState] = useState<ExportState>({ status: 'loading', data: null })

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', data: null })
    fetch(path, { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 404) return { status: 'absent' as const, data: null }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const json = (await r.json()) as TaV3Export
        if (!json?.manifest || !Array.isArray(json?.time) || !json?.columns) {
          throw new Error('malformed export: expected { manifest, time[], columns{} }')
        }
        return { status: 'ready' as const, data: json }
      })
      .then((s) => alive && setState(s))
      .catch((e) => alive && setState({ status: 'error', data: null, error: String(e?.message ?? e) }))
    return () => {
      alive = false
    }
  }, [path])

  return state
}

export interface V3Provenance {
  ledgerType: string
  generatedBy: string
  generatedAt: string
  symbol: string
  timeframes: string[]
  ledgerSha256: string
  scriptSha1: string
  scriptSha256: string
  causalNote: string
  columnCount: number
  artifacts: Record<string, {
    csvSha256: string
    rows: number
    tsRange: { first: string; last: string }
    shownRows: number
  }>
  validation: Record<string, Record<string, string>>
  relativePriceFields: number
  roleTally: Record<string, number>
  windowing: { mode: string; n: Record<string, number>; note: string }
}

export function useV3Provenance(): { data: V3Provenance | null } {
  const [data, setData] = useState<V3Provenance | null>(null)
  useEffect(() => {
    let alive = true
    fetch(TA_V3_PROVENANCE_PATH, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && setData(j))
      .catch(() => alive && setData(null))
    return () => {
      alive = false
    }
  }, [])
  return { data }
}
