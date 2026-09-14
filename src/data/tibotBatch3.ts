import { useEffect, useState } from 'react'

export interface Cell {
  target: string
  model: string
  horizon: number
  status: 'PASS' | 'FAIL'
  n_total: number | null
  n_folds: number | null
  bacc_mean: number | null
  mcc_mean: number | null
  macro_f1_mean: number | null
  pr_auc_mean?: number | null
  guards: Record<string, boolean>
  guards_failed: string[]
}

export interface Family {
  family: string
  category: string
  arch_verdict: 'NO_GO' | 'CANDIDATE_SELECTED' | string
  selected_model: string | null
  pass_counts: Record<string, number>
  env: { sklearn: string | null; python: string | null; prereg_sha: string | null }
  targets: string[]
  models: string[]
  horizons: number[]
  guard_keys: string[]
  guard_labels: Record<string, string>
  n_cells: number
  n_pass: number
  n_fail: number
  cells: Cell[]
  notes: string[]
  source_path: string
}

export interface LifecycleState {
  state: string
  tone: 'no_go' | 'candidate' | 'promoted'
  label: string
  description: string
}

export interface Batch3Bundle {
  schema_version: string
  generated_by: string
  generated_date: string
  tx_ref: string
  batch: string
  batch_context: string
  run_id: string
  lifecycle_legend: LifecycleState[]
  candidate_caption: string
  promoted_reference: { note: string; families: string[] }
  families: Family[]
}

export function useTibotBatch3() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [data, setData] = useState<Batch3Bundle | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('data/tibot_batch3_gateb_20260914.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: Batch3Bundle) => {
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

export function shortHash(h: string | null) {
  return h ? h.slice(0, 10) : ''
}
