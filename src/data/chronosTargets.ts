// ─────────────────────────────────────────────────────────────────────────
// Chronos predictive-targets export contract — the Chronos page's data source.
//
// Source of truth: Chronos owns/runs build_predictive_targets_v1.py, which turns
// the certified causal Technical_analysis_v3 output into 25 predictive TARGET
// columns (the training labels for Tibot bots). scripts/gen_chronos_targets.py
// re-verifies every CSV SHA-256 (targets vs manifest.output_sha256, OHLCV source
// vs manifest.source_sha256), joins OHLCV from the certified source on the
// timestamp, windows the most-recent rows, and copies cells verbatim (NaN→null).
//
// LEAKAGE: these columns are LABELS / ground-truth ONLY. They use future events
// and must never be fed to Tibot as features or used at live inference. This page
// VISUALISES them; it does not change them.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'

export type ChronosTf = '5m' | '1h' | '4h' | '1D'
export type ChronosSym =
  | 'BTCUSDT' | 'ETHUSDT' | 'BNBUSDT' | 'SOLUSDT' | 'XRPUSDT'
  | 'DOGEUSDT' | 'FETUSDT' | 'PEPEUSDT' | 'SHIBUSDT' | 'SUIUSDT'

export const CHRONOS_TIMEFRAMES: ChronosTf[] = ['5m', '1h', '4h', '1D']
export const CHRONOS_SYMBOLS: ChronosSym[] = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'FETUSDT', 'PEPEUSDT', 'SHIBUSDT', 'SUIUSDT',
]

/** Which timeframes exist per symbol in the Phase-3 bundle (DOGE: 5m+1h only). */
export const AVAILABLE_TFS: Record<ChronosSym, ChronosTf[]> = {
  BTCUSDT:  ['5m', '1h', '4h', '1D'],
  ETHUSDT:  ['5m', '1h', '4h', '1D'],
  BNBUSDT:  ['5m', '1h', '4h', '1D'],
  SOLUSDT:  ['5m', '1h', '4h', '1D'],
  XRPUSDT:  ['5m', '1h', '4h', '1D'],
  DOGEUSDT: ['5m', '1h'],
  FETUSDT:  ['5m', '1h', '4h', '1D'],
  PEPEUSDT: ['5m', '1h', '4h', '1D'],
  SHIBUSDT: ['5m', '1h', '4h', '1D'],
  SUIUSDT:  ['5m', '1h', '4h', '1D'],
}

function p(sym: ChronosSym, tf: ChronosTf): string {
  return `${import.meta.env.BASE_URL}data/chronos_targets_${sym.toLowerCase()}_${tf.toLowerCase()}.json`
}

export const CHRONOS_PATHS: Record<ChronosSym, Partial<Record<ChronosTf, string>>> = {
  BTCUSDT:  { '5m': p('BTCUSDT','5m'),  '1h': p('BTCUSDT','1h'),  '4h': p('BTCUSDT','4h'),  '1D': p('BTCUSDT','1D')  },
  ETHUSDT:  { '5m': p('ETHUSDT','5m'),  '1h': p('ETHUSDT','1h'),  '4h': p('ETHUSDT','4h'),  '1D': p('ETHUSDT','1D')  },
  BNBUSDT:  { '5m': p('BNBUSDT','5m'),  '1h': p('BNBUSDT','1h'),  '4h': p('BNBUSDT','4h'),  '1D': p('BNBUSDT','1D')  },
  SOLUSDT:  { '5m': p('SOLUSDT','5m'),  '1h': p('SOLUSDT','1h'),  '4h': p('SOLUSDT','4h'),  '1D': p('SOLUSDT','1D')  },
  XRPUSDT:  { '5m': p('XRPUSDT','5m'),  '1h': p('XRPUSDT','1h'),  '4h': p('XRPUSDT','4h'),  '1D': p('XRPUSDT','1D')  },
  DOGEUSDT: { '5m': p('DOGEUSDT','5m'), '1h': p('DOGEUSDT','1h') },
  FETUSDT:  { '5m': p('FETUSDT','5m'),  '1h': p('FETUSDT','1h'),  '4h': p('FETUSDT','4h'),  '1D': p('FETUSDT','1D')  },
  PEPEUSDT: { '5m': p('PEPEUSDT','5m'), '1h': p('PEPEUSDT','1h'), '4h': p('PEPEUSDT','4h'), '1D': p('PEPEUSDT','1D') },
  SHIBUSDT: { '5m': p('SHIBUSDT','5m'), '1h': p('SHIBUSDT','1h'), '4h': p('SHIBUSDT','4h'), '1D': p('SHIBUSDT','1D') },
  SUIUSDT:  { '5m': p('SUIUSDT','5m'),  '1h': p('SUIUSDT','1h'),  '4h': p('SUIUSDT','4h'),  '1D': p('SUIUSDT','1D')  },
}

export const CHRONOS_PROVENANCE_PATHS: Record<ChronosSym, string> = {
  BTCUSDT:  `${import.meta.env.BASE_URL}data/chronos_targets_provenance_btcusdt.json`,
  ETHUSDT:  `${import.meta.env.BASE_URL}data/chronos_targets_provenance_ethusdt.json`,
  BNBUSDT:  `${import.meta.env.BASE_URL}data/chronos_targets_provenance_bnbusdt.json`,
  SOLUSDT:  `${import.meta.env.BASE_URL}data/chronos_targets_provenance_solusdt.json`,
  XRPUSDT:  `${import.meta.env.BASE_URL}data/chronos_targets_provenance_xrpusdt.json`,
  DOGEUSDT: `${import.meta.env.BASE_URL}data/chronos_targets_provenance_dogeusdt.json`,
  FETUSDT:  `${import.meta.env.BASE_URL}data/chronos_targets_provenance_fetusdt.json`,
  PEPEUSDT: `${import.meta.env.BASE_URL}data/chronos_targets_provenance_pepeusdt.json`,
  SHIBUSDT: `${import.meta.env.BASE_URL}data/chronos_targets_provenance_shibusdt.json`,
  SUIUSDT:  `${import.meta.env.BASE_URL}data/chronos_targets_provenance_suiusdt.json`,
}

/** How a target column is rendered.
 *   direction → categorical label drawn as a coloured marker on the price pane
 *   numeric   → numeric series drawn in a banded sub-pane
 *   meta      → timestamp passthrough (inspection only, never plotted) */
export type TargetRole = 'direction' | 'numeric' | 'meta'

export interface TargetColumn {
  name: string
  dtype: string
  role: TargetRole
  band: string
  bandLabel: string
  group: string
  desc: string
  nanPct: number
}

export interface ChronosManifest {
  symbol: string
  interval: string
  rows: number
  canonicalRows: number
  targetCount: number
  windowMode: string
  windowN: number
  windowRowRange: [number, number]
  windowStart: string
  windowEnd: string
  targetsCsvSha256: string
  sourceCsvSha256: string
  sourceFile: string
  buildScriptSha1: string | null
  manifestVersion: string
  generatedAtUtc: string
  leakagePolicy: string
  nullPolicy: string
  parameters: Record<string, unknown>
  gannEventContract: Record<string, unknown>
  ohlcv: string[]
  passthrough: string[]
  columns: TargetColumn[]
}

/** Columnar payload. `time` is ms-epoch per row. OHLCV + numeric targets are
 *  number|null; direction + passthrough columns are string|null. Index-aligned
 *  to `time`. */
export interface ChronosExport {
  manifest: ChronosManifest
  time: number[]
  columns: Record<string, (number | string | null)[]>
}

// numeric sub-pane band ordering (mirrors the generator's BAND_ORDER)
export const BAND_ORDER = [
  'candle_pct', 'returns', 'excursion', 'vol',
  'rev_bars', 'rev_pct', 'gann_bars', 'gann_pct',
]

// categorical → colour for the direction markers / table chips
export const DIR_COLOR: Record<string, string> = {
  up: '#1ec8a5', green: '#1ec8a5', upper_first: '#1ec8a5',
  down: '#ff5470', red: '#ff5470', lower_first: '#ff5470',
  flat: '#6b7a96', neither: '#6b7a96', unknown: '#3b4a66',
}

// the canonical group order shown on the page (matches Axone's task brief)
export const GROUP_ORDER = [
  'Next-candle', 'Forward', 'Excursion', 'EMA reversal', 'Gann swing',
]

// ── loader hooks (mirror the TA-v3 contract) ─────────────────────────────────

export type LoadStatus = 'loading' | 'ready' | 'absent' | 'error'

export interface ExportState {
  status: LoadStatus
  data: ChronosExport | null
  error?: string
}

export function useChronosExport(path: string): ExportState {
  const [state, setState] = useState<ExportState>({ status: 'loading', data: null })

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', data: null })
    fetch(path, { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 404) return { status: 'absent' as const, data: null }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const json = (await r.json()) as ChronosExport
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

export interface ChronosProvenance {
  manifestType: string
  version: string
  symbol: string
  timeframes: string[]
  generatedAtUtc: string
  buildScript: string
  buildScriptSha1: string | null
  parameters: Record<string, unknown>
  leakagePolicy: string
  nullPolicy: string
  gannEventContract: Record<string, unknown>
  purgeEmbargoRequiredBars: string | null
  sameCandleDualTouchPolicy: string | null
  artifacts: Record<string, {
    targetsCsvSha256: string
    sourceCsvSha256: string
    sourceFile: string
    canonicalRows: number
    shownRows: number
  }>
  targetColumns: string[]
  bandOrder: string[]
  bandLabel: Record<string, string>
  windowing: { mode: string; n: Record<string, number>; note: string }
}

export function useChronosProvenance(path: string): { data: ChronosProvenance | null } {
  const [data, setData] = useState<ChronosProvenance | null>(null)
  useEffect(() => {
    let alive = true
    fetch(path, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && setData(j))
      .catch(() => alive && setData(null))
    return () => {
      alive = false
    }
  }, [path])
  return { data }
}
