import { useState, useEffect } from 'react'

export interface TboHeatmapCell {
  symbol: string
  horizon: string
  prediction: string
  confidence: number
  realized_outcome: string | null
  correct: boolean | null
}

export interface ExplorerRecord {
  candle_timestamp: string
  symbol: string
  interval: string
  family: string
  horizon: string
  model_id: string
  model_sha256: string
  prediction: string
  probabilities: Record<string, number>
  confidence: number
  leakage_check_pass: boolean
  realized_outcome: string | null
  outcome_source: string | null
  feature_hash: string
  correct: boolean | null
}

export interface ConfidenceBin {
  range: string
  count: number
  correct: number
  incorrect: number
  pending: number
  accuracy: number | null
}

export interface CalibrationPoint {
  bin: string
  n: number
  mean_confidence: number
  accuracy: number
}

export interface MatrixCell {
  symbol: string
  interval: string
  n_matched: number
  hit_rate: number | null
}

export interface ForwardBundle {
  schema_version: string
  generated_by: string
  generated_date: string
  tx_ref: string
  banner: string
  sub_banner: string
  validation_period: Record<string, unknown>
  totals: {
    total_forward_predictions: number
    tbo_records: number
    bq_records: number
    tbo_matched: number
    tbo_pending: number
    bq_matched: number
    bq_pending: number
  }
  integrity: {
    leakage_verdict: string
    leakage_total_checked: number
    leakage_fail_count: number
    timestamp_integrity: string
    realized_outcome_matching: string
    chronos_manifest_sha256: string
    matching_run_timestamp: string
  }
  sentinel_verdicts: {
    initial_audit: Record<string, string>
    reaudit: Record<string, string>
    decisions: Record<string, string>
  }
  family_status: Record<string, unknown>
  tbo_metrics: {
    prediction_distribution: Record<string, number>
    prediction_bias_check: Record<string, unknown>
    confidence_stats: Record<string, number>
    active_intervals: string[]
    blocked_intervals: string[]
    forward_performance: Record<string, unknown>
    tbo_heatmap: TboHeatmapCell[]
    sym_tf_matrix: Record<string, MatrixCell>
    confidence_bins: ConfidenceBin[]
    calibration: CalibrationPoint[]
  }
  bq_metrics: {
    prediction_distribution: Record<string, number>
    prediction_bias_check: Record<string, unknown>
    confidence_stats: Record<string, number>
    active_intervals: string[]
    forward_performance: Record<string, unknown>
    sentinel_bq2_flag: Record<string, unknown>
    sym_tf_matrix: Record<string, MatrixCell>
    confidence_bins: ConfidenceBin[]
    calibration: CalibrationPoint[]
  }
  tbo4h_gap_decision: Record<string, unknown>
  flags: { tbo: FlagEntry[]; bq: FlagEntry[] }
  explorer: { tbo: ExplorerRecord[]; bq: ExplorerRecord[] }
  ohlcv: Record<string, number[][]>
  audit_texts: Record<string, string>
  provenance: Record<string, string>
}

export interface FlagEntry {
  id: string
  status: string
  description: string
}

export function useTibotForward() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [data, setData] = useState<ForwardBundle | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetch('data/tibot_forward_validation_20260825.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: ForwardBundle) => {
        setData(d)
        setStatus('ready')
      })
      .catch((e: Error) => {
        setError(e.message)
        setStatus('error')
      })
  }, [])

  return { status, data, error }
}

export function shortHash(h: string) {
  return h ? h.slice(0, 8) : ''
}

export function fmtDate(iso: string) {
  return iso ? iso.slice(0, 10) : ''
}
