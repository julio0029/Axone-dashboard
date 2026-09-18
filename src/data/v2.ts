import { useEffect, useState } from 'react'

// Axone V2 dashboard data layer.
// Three independent views, each fetching a read-only JSON emitted by a
// scripts/gen_v2_*.py generator from the V2 research root. Every payload is
// designed to degrade gracefully: if a source track has not produced output
// yet, the JSON says so (status/awaiting) and the UI shows "awaiting data"
// rather than crashing or fabricating numbers.

export type LoadStatus = 'loading' | 'ready' | 'absent' | 'error'

function base(path: string): string {
  return `${import.meta.env.BASE_URL}data/${path}`
}

/** Generic read-only JSON fetch with 404 -> absent + malformed -> error. */
export function useJson<T>(
  file: string,
  validate?: (j: unknown) => boolean,
): { status: LoadStatus; data: T | null; error?: string } {
  const [state, setState] = useState<{ status: LoadStatus; data: T | null; error?: string }>({
    status: 'loading',
    data: null,
  })
  useEffect(() => {
    let alive = true
    setState({ status: 'loading', data: null })
    fetch(base(file), { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 404) return { status: 'absent' as const, data: null }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const json = (await r.json()) as T
        if (validate && !validate(json)) throw new Error('malformed payload')
        return { status: 'ready' as const, data: json }
      })
      .then((s) => alive && setState(s))
      .catch((e) => alive && setState({ status: 'error', data: null, error: String(e?.message ?? e) }))
    return () => {
      alive = false
    }
  }, [file])
  return state
}

// ---------------------------------------------------------------------------
// View 1 — Historical Portfolio Lab (Track C)
// ---------------------------------------------------------------------------

export interface EquityPoint {
  t: string
  equity: number
}
export interface DrawdownPoint {
  t: string
  dd: number
}
export interface SymbolContribution {
  symbol: string
  trades: number
  netUsd: number
  wins: number
  losses: number
  winRate: number | null
}
export interface TradeRow {
  symbol: string
  direction: string
  entryTs: string
  exitTs: string
  entryPrice: number
  exitPrice: number
  committedUsd: number
  netPnlUsd: number
  netPnlBps: number
  holdBars: number
  stillOpen: boolean
}
export interface ProfileSummary {
  startEquity: number | null
  endEquity: number | null
  totalReturnPct: number | null
  maxDrawdownPct: number | null
  maxDrawdownAt: string | null
  sharpeApprox: number | null
  nTrades: number
  nClosed: number
  nOpen: number
  winRatePct: number | null
  profitFactor: number | null
  netPnlUsd: number
  avgWinBps: number | null
  avgLossBps: number | null
  avgHoldBars: number | null
  missedEntries: number
}
export interface PortfolioProfile {
  key: string
  label: string
  startEquity: number | null
  maxPositions: number | null
  maxAllocPct: number | null
  slotSizeUsd: number | null
  status: 'ready' | 'awaiting'
  range?: { startUtc: string | null; endUtc: string | null; days: number }
  summary?: ProfileSummary
  equityCurve?: EquityPoint[]
  drawdown?: DrawdownPoint[]
  symbolContribution?: SymbolContribution[]
  tradeSample?: TradeRow[]
  tradeSampleCount?: number
  missed?: { total: number; byReason: Record<string, number>; topSymbols: { symbol: string; count: number }[] }
  sourceHashes?: Record<string, string>
}
export interface PortfolioLab {
  schema: string
  track: string
  generatedAtUtc: string
  trackPresent: boolean
  profileCountExpected: number
  profileCountReady: number
  profileCountAwaiting: number
  profiles: PortfolioProfile[]
  provenance: { note: string; tradeSampleCap: number }
}

export function usePortfolioLab() {
  return useJson<PortfolioLab>('v2_portfolio_lab.json', (j) =>
    Array.isArray((j as PortfolioLab)?.profiles),
  )
}

// ---------------------------------------------------------------------------
// View 2 — 48h Paper Test (Track D) — PAPER / TESTNET / SIMULATED
// ---------------------------------------------------------------------------

export interface PaperTest {
  schema: string
  track: string
  generatedAtUtc: string
  trackPresent: boolean
  status: 'not_started' | 'running' | 'complete'
  mode: string
  simulated: boolean
  realMoney: boolean
  exchangeEndpoint: string
  labelBanner: string
  universe: string[]
  slotSizeUsd: number
  orderType: string
  boundarySeconds: number
  decisionExecutionSeparation: {
    decisionRecord: string
    executionRecord: string
    fillStatuses: string[]
  }
  pipelineHealthComponents: { key: string; label: string; source: string; states?: string[] }[]
  severityModel: string[]
  activeRun: PaperRun | null
  contractFile: string | null
  contractSha: string | null
  provenance: { note: string }
}
export interface PaperRun {
  runId: string
  runDir: string
  counts: Record<string, number>
  latestEquity: Record<string, unknown> | null
  killSwitchState: string
  latestHeartbeat: Record<string, unknown> | null
  missedBoundaries: Record<string, unknown>[]
  missedBoundaryCount: number
  wolfDecisionsTail: Record<string, unknown>[]
  adapterFillsTail: Record<string, unknown>[]
  portfolioTail: Record<string, unknown>[]
  reconciliationTail: Record<string, unknown>[]
  killSwitchLog: Record<string, unknown>[]
}

export function usePaperTest() {
  return useJson<PaperTest>('v2_paper_test.json', (j) => (j as PaperTest)?.mode === 'PAPER_TESTNET')
}

// ---------------------------------------------------------------------------
// View 3 — Symbol Research (Tracks A + E)
// ---------------------------------------------------------------------------

export interface FamilyRow {
  family: string
  cls: string
  arch: string
  timeframes: string[]
  note: string
}
export interface EvalCell {
  family: string
  symbol: string
  timeframe: string
  disposition: string | null
  file: string
}
export interface TrackA {
  track: string
  present: boolean
  overallStatus: string
  blocked: boolean
  blocker: string | null
  statusFile: string | null
  statusFileSha: string | null
  originalUniverse: string[]
  expansionTargets: string[]
  families: FamilyRow[]
  classifications: string[]
  evalCellCount: number
  evalCells: EvalCell[]
  note: string
}
export interface ConsensusRow {
  rank: number
  symbol: string
  pct_1d: number
  pct_1h: number
  pct_4h: number
  vol_usd_24h_m: number
  acct_ls_ratio: number | null
  pos_ls_ratio: number | null
  crowding: string
  directional_regime: string
  momentum_phase: string
  notes: string
}
export interface DiscoveryCandidate {
  symbol: string
  discovery_type: string[]
  confidence: string
  pct_1d: number
  pct_1h: number
  pct_4h: number
  vol_usd_24h_m: number
  signal: string
  phase: string
  research_priority: string
  watch_for: string
}
export interface TrackE {
  track: string
  present: boolean
  advisoryOnly: boolean
  consensus: {
    generated_at: string
    advisory_only: boolean
    market_context: {
      regime: string
      confidence: number
      consensus_confidence: number
      bias: string
      breadth: { positive_ratio: number; positive_count: number; tradable_count: number; delta_pp_vs_prior: number }
    }
    top_trader_consensus: ConsensusRow[]
    aggregate_signals: {
      crowded_long_symbols: string[]
      momentum_accelerating: string[]
      breakout_exhaustion: string[]
      reversal_underway: string[]
      structural_anomalies: { symbol: string; anomaly: string; [k: string]: unknown }[]
      spot_only_no_futures: string[]
    }
  } | null
  consensusFile?: string
  consensusSha?: string
  discovery: {
    generated_at: string
    advisory_only: boolean
    track_d_interference: string
    discovery_candidates: DiscoveryCandidate[]
    discovery_summary: Record<string, unknown>
  } | null
  discoveryFile?: string
  discoverySha?: string
}
export interface SymbolResearch {
  schema: string
  generatedAtUtc: string
  trackA: TrackA
  trackE: TrackE
  provenance: { note: string }
}

export function useSymbolResearch() {
  return useJson<SymbolResearch>('v2_symbol_research.json', (j) => !!(j as SymbolResearch)?.trackA)
}

// ---------------------------------------------------------------------------
// formatting helpers
// ---------------------------------------------------------------------------

export function sym(s: string): string {
  return s.replace(/USDT$/, '')
}
export function usd(n: number | null | undefined, dp = 2): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}
export function pct(n: number | null | undefined, dp = 2): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return `${n >= 0 ? '' : ''}${n.toLocaleString('en-US', { maximumFractionDigits: dp })}%`
}
