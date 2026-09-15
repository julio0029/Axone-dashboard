// Wally historical-research data contract.
//
// Consumes public/data/wally_trades_{sym}.json + wally_index.json, emitted read-only
// by scripts/gen_wally_trades.py. Each per-trade record joins (1:1, asserted) the Oracle
// decision-eval (retrospective prices + efficiency), all_trades.jsonl (bps P&L / MFE / MAE),
// and the decision ledger (opp_w, HOLD count, exit decision). Nothing is recomputed or
// fabricated client-side; genuinely-absent fields arrive as null and render "N/A".
//
// P&L / MFE / MAE / costs are RETURNS IN BASIS POINTS (bps), not position-sized currency.
// Prices are Wally's executed marks (entry_close / exit_close) in quote currency.
//
// HISTORICAL SIMULATION ONLY — no live/paper trades executed.

import { useEffect, useState } from 'react'

export const WALLY_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'SHIBUSDT', 'FETUSDT', 'SUIUSDT',
] as const
export type WallySym = (typeof WALLY_SYMBOLS)[number]

export type Direction = 'LONG' | 'SHORT'

export interface OracleContext {
  entry_efficiency: number | null
  exit_efficiency: number | null
  mfe_capture_ratio: number | null
  optimal_direction: string | null
  optimal_entry_delay_bars: number | null
  optimal_exit_delay_bars: number | null
  cf_optimal_action: string | null
  cf_pnl_bps: number | null
  counterfactual_long_return: number | null
  counterfactual_short_return: number | null
  missed_upside: number | null
  missed_downside: number | null
  decision_quality_score: number | null
  net_score: number | null
}

export interface WallyTrade {
  id: string
  symbol: WallySym
  direction: Direction
  entry_ts: number
  exit_ts: number
  entry_price: number | null
  exit_price: number | null
  hold_bars: number | null
  hold_minutes: number | null
  regime: string | null
  conviction: number | null
  opp_w: number | null
  vote_margin: number | null
  pnl_gross: number | null
  pnl_net: number | null
  cost_bps: number | null
  mfe: number | null
  mae: number | null
  mfe_capture: number | null
  hit: boolean | null
  hold_decisions: number | null
  exit_decision: string | null
  exit_type: string | null
  oracle: OracleContext
}

export interface Ohlcv {
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
}

export interface WallyProvenance {
  symbol: string
  variant: string
  trade_count: number
  oracle_source: string
  trades_source: string
  ledger_source: string
  ohlcv_source: string
  oracle_sha256_head: string
  ledger_sha256_head: string
  window_start: string
  window_end: string
  ohlcv_bars: number
  ledger_matched: number
}

export interface WallySymbolData {
  symbol: WallySym
  variant: string
  ohlcv: Ohlcv
  trades: WallyTrade[]
  provenance: WallyProvenance
}

export interface WallyVariant {
  id: string
  label: string
  oracle_dir: string
  trades_file: string
  ledger_glob: string
  note: string
}

export interface WallyIndex {
  generated_at: string
  variants: WallyVariant[]
  symbols: { symbol: string; trade_count: number; ohlcv_bars: number; window_start: string; window_end: string }[]
  note: string
}

export const WALLY_INDEX_PATH = `${import.meta.env.BASE_URL}data/wally_index.json`

// The variant is a first-class dimension. Today one variant is published; future
// portfolio-simulation variants (Variant C, capital-reallocation runs, ...) are added
// to wally_index.json and to this path map without touching the page.
export function wallyPath(sym: WallySym, _variant: string): string {
  // Current generator emits one file per symbol for the published variant. When multiple
  // variants ship, files become wally_trades_{sym}_{variant}.json and this switches on it.
  return `${import.meta.env.BASE_URL}data/wally_trades_${sym.toLowerCase()}.json`
}

export type LoadStatus = 'loading' | 'ready' | 'error'

export function useWallyIndex() {
  const [index, setIndex] = useState<WallyIndex | null>(null)
  useEffect(() => {
    fetch(WALLY_INDEX_PATH, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setIndex)
      .catch(() => setIndex(null))
  }, [])
  return index
}

export function useWallySymbol(sym: WallySym, variant: string) {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [data, setData] = useState<WallySymbolData | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    setStatus('loading'); setData(null); setError(null)
    fetch(wallyPath(sym, variant), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((j: WallySymbolData) => { if (alive) { setData(j); setStatus('ready') } })
      .catch((e) => { if (alive) { setError(String(e)); setStatus('error') } })
    return () => { alive = false }
  }, [sym, variant])
  return { status, data, error }
}

// ── derived helpers ────────────────────────────────────────────────────────

export type ExitReason = string

export function exitReasonLabel(t: WallyTrade): string {
  // The walk records a signal-driven exit (EXIT_LONG / EXIT_SHORT) matched to the entry;
  // a finer stop/target/timeout reason is NOT recorded in the source ledger.
  if (t.exit_decision) return t.exit_decision === 'EXIT_LONG' || t.exit_decision === 'EXIT_SHORT'
    ? 'Signal exit' : t.exit_decision
  if (t.exit_type === 'matched') return 'Signal exit'
  return 'N/A — not recorded'
}

export interface Filters {
  variant: string
  symbol: WallySym
  dateFrom: number | null
  dateTo: number | null
  direction: 'ALL' | Direction
  outcome: 'ALL' | 'WIN' | 'LOSS'
  convMin: number | null
  convMax: number | null
  exitReason: 'ALL' | string
}

export function applyFilters(trades: WallyTrade[], f: Filters): WallyTrade[] {
  return trades.filter((t) => {
    if (f.dateFrom != null && t.entry_ts < f.dateFrom) return false
    if (f.dateTo != null && t.entry_ts > f.dateTo) return false
    if (f.direction !== 'ALL' && t.direction !== f.direction) return false
    if (f.outcome === 'WIN' && !((t.pnl_net ?? 0) > 0)) return false
    if (f.outcome === 'LOSS' && !((t.pnl_net ?? 0) <= 0)) return false
    if (f.convMin != null && (t.conviction ?? -Infinity) < f.convMin) return false
    if (f.convMax != null && (t.conviction ?? Infinity) > f.convMax) return false
    if (f.exitReason !== 'ALL' && exitReasonLabel(t) !== f.exitReason) return false
    return true
  })
}

export interface Summary {
  count: number
  hitRate: number | null
  cumNet: number
  meanNet: number | null
  medianNet: number | null
  meanMfe: number | null
  meanMae: number | null
  medianMfeCapture: number | null
  avgHoldMin: number | null
  turnoverPerDay: number | null
  utilization: number | null // fraction of window bars spent in position (filtered)
  longs: number
  shorts: number
}

export function summarize(trades: WallyTrade[], windowBars: number): Summary {
  const n = trades.length
  if (n === 0) return {
    count: 0, hitRate: null, cumNet: 0, meanNet: null, medianNet: null,
    meanMfe: null, meanMae: null, medianMfeCapture: null, avgHoldMin: null,
    turnoverPerDay: null, utilization: null, longs: 0, shorts: 0,
  }
  const med = (xs: number[]) => {
    if (!xs.length) return null
    const s = [...xs].sort((a, b) => a - b)
    return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
  }
  const nets = trades.map((t) => t.pnl_net ?? 0)
  const sorted = [...nets].sort((a, b) => a - b)
  const median = sorted.length % 2
    ? sorted[(sorted.length - 1) / 2]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
  const wins = trades.filter((t) => (t.pnl_net ?? 0) > 0).length
  const mean = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null
  const holds = trades.map((t) => t.hold_minutes).filter((x): x is number => x != null)
  const spanMs = Math.max(...trades.map((t) => t.exit_ts)) - Math.min(...trades.map((t) => t.entry_ts))
  const days = spanMs > 0 ? spanMs / 86_400_000 : null
  const barsHeld = trades.reduce((a, t) => a + (t.hold_bars ?? 0), 0)
  return {
    count: n,
    hitRate: wins / n,
    cumNet: nets.reduce((a, b) => a + b, 0),
    meanNet: mean(nets),
    medianNet: median,
    meanMfe: mean(trades.map((t) => t.mfe).filter((x): x is number => x != null)),
    meanMae: mean(trades.map((t) => t.mae).filter((x): x is number => x != null)),
    // capture is unbounded-negative when MFE≈0 on losing trades → median is the honest centre
    medianMfeCapture: med(trades.map((t) => t.mfe_capture).filter((x): x is number => x != null)),
    avgHoldMin: mean(holds),
    turnoverPerDay: days ? n / days : null,
    utilization: windowBars > 0 ? barsHeld / windowBars : null,
    longs: trades.filter((t) => t.direction === 'LONG').length,
    shorts: trades.filter((t) => t.direction === 'SHORT').length,
  }
}
