// ─────────────────────────────────────────────────────────────────────────
// TA-v2 export contract — the real artifact the Sandbox chart consumes.
//
// Source of truth: a re-validated, consumable export emitted by Sublime —
// the full TA-v2 BTCUSDT output (all ~90 columns) plus a manifest carrying
// column names/dtypes, the freshly-validated SHA seal, and window/rows.
//
// This module defines the expected shape and a runtime loader. NOTHING here
// is mock data: until the artifact lands at EXPORT_PATH the loader reports
// `absent` and the UI shows an explicit "awaiting export" state. No client
// recompute, no synthetic fill.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { SCHEMA_GROUPS } from './taV2'

/** Where the Sandbox chart fetches the real export from (served as a static
 *  asset under the Vite base). Swap this when Axone forwards the final path. */
/** Selectable Sandbox timeframes, each backed by its own real export. */
export type SandboxTf = '5m' | '1h'

export const EXPORT_PATHS: Record<SandboxTf, string> = {
  '5m': `${import.meta.env.BASE_URL}data/ta_v2_btcusdt.json`,
  '1h': `${import.meta.env.BASE_URL}data/ta_v2_btcusdt_1h.json`,
}

/** Default/5m path (back-compat). */
export const EXPORT_PATH = EXPORT_PATHS['5m']

/** How a column is rendered on the chart. */
export type ColumnRole =
  | 'price' // o/h/l/c — the candlestick itself
  | 'overlay' // price-scale line on the main panel (EMA, MA, Bollinger, VWAP, channels…)
  | 'oscillator' // own sub-panel with an independent axis (RSI, MACD, ADX, ATR, *_rel_*…)
  | 'volume' // sub-panel bar series
  | 'marker' // discrete event markers on the price panel (candle flags, Gann swings)

export interface ManifestColumn {
  name: string
  dtype: string
  /** Optional family key (matches SCHEMA_GROUPS) — used for grouping the toggle UI. */
  group?: string
  /** Optional render role. When absent it is inferred by `classifyColumn`. */
  role?: ColumnRole
  /** Optional NaN fraction (0–1) from the validation audit, for the column chip. */
  nanPct?: number
}

export interface TaV2Manifest {
  symbol: string
  interval: string
  rows: number
  windowStart: string
  windowEnd: string
  /** Fresh, re-validated SHA-1 seal of technical_analysis_v2.py. NEVER reuse the
   *  pre-drift fea54e5d… seal — this comes straight from Sublime's manifest. */
  sha1: string
  scriptFile?: string
  scriptLines?: number
  env?: string
  generatedAt?: string
  columns: ManifestColumn[]
}

/** Columnar payload: `time` is ms-epoch per row; `columns[name]` is aligned to it. */
export interface TaV2Export {
  manifest: TaV2Manifest
  time: number[]
  columns: Record<string, (number | null)[]>
}

// ── column classification ───────────────────────────────────────────────────
// Manifest-provided `role` always wins; otherwise infer from the column name so
// the chart works even if the export ships names + dtypes only.

const PRICE = new Set(['open', 'high', 'low', 'close'])
const MARKERS = new Set([
  'candle_doji', 'candle_marubozu',
  'gann_swing_top', 'gann_swing_bottom', 'gann_swing_change',
  '1h_level_breakout_bull', '1h_level_breakout_bear',
  '1d_level_breakout_bull', '1d_level_breakout_bear',
])

/** Absolute, price-scale overlays drawn on the main candle panel. */
function isPriceOverlay(name: string): boolean {
  if (name === 'median' || name === 'vwap') return true
  if (/^ema_\d+$/.test(name) || /^ma_\d+$/.test(name)) return true
  if (/^bolinger_(sma|upper|lower)$/.test(name)) return true
  if (/^donchian_(upper|lower|mid)_\d+$/.test(name)) return true
  if (/^keltner_(mid|upper|lower)_\d+$/.test(name)) return true
  if (/^ichimoku_(conversion|base|span_a|span_b|lagging)$/.test(name)) return true
  return false
}

export function classifyColumn(col: ManifestColumn): ColumnRole {
  if (col.role) return col.role
  const n = col.name.toLowerCase()
  if (PRICE.has(n)) return 'price'
  if (n === 'volume') return 'volume'
  if (MARKERS.has(n)) return 'marker'
  if (isPriceOverlay(n)) return 'overlay'
  // everything else numeric (rsi, macd*, stochastic*, atr, adx, cci, williams,
  // roc, momentum, obv, mfi, cmf, *_rel_*, span, gann_swing/count…) → sub-panel.
  return 'oscillator'
}

/** Family/group lookup so the toggle UI can mirror the schema grouping. */
const COL_TO_FAMILY: Record<string, { key: string; name: string }> = (() => {
  const m: Record<string, { key: string; name: string }> = {}
  for (const g of SCHEMA_GROUPS) for (const c of g.cols) m[c] = { key: g.key, name: g.name }
  return m
})()

export function familyOf(col: ManifestColumn): { key: string; name: string } {
  if (col.group) {
    const g = SCHEMA_GROUPS.find((x) => x.key === col.group)
    if (g) return { key: g.key, name: g.name }
  }
  return COL_TO_FAMILY[col.name] ?? { key: 'other', name: 'Other' }
}

// ── loader hook ─────────────────────────────────────────────────────────────

export type LoadStatus = 'loading' | 'ready' | 'absent' | 'error'

export interface ExportState {
  status: LoadStatus
  data: TaV2Export | null
  error?: string
}

/** Fetch the real export at `path`. 404 → `absent` (awaiting Sublime), any
 *  parsed payload → `ready`. Never fabricates data. */
export function useTaV2Export(path: string = EXPORT_PATH): ExportState {
  const [state, setState] = useState<ExportState>({ status: 'loading', data: null })

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', data: null })
    fetch(path, { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 404) return { status: 'absent' as const, data: null }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const json = (await r.json()) as TaV2Export
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
