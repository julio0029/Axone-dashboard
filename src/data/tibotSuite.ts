import { useEffect, useState } from 'react'

export type TibotLoadStatus = 'loading' | 'ready' | 'absent' | 'error'

export interface ContractField {
  path: string
  sha256: string
  rows: number
  cols: number
  schema: { name: string; type: string; nullable: boolean }[]
  schema_column_order_sha256?: string
  timestamp_min_utc: string
  timestamp_max_utc: string
  grid_gaps_count?: number
  role: string
}

export interface TibotSample {
  windowMode: string
  rows: number
  timestampStartUtc: string | null
  timestampEndUtc: string | null
  columns: string[]
  latest: Record<string, string | number | null>
  rowsData: Record<string, string | number | null>[]
}

export interface TibotModelRow {
  modelKey: string
  family: string
  symbol: string
  interval: string
  status: string
  targetColumns: string[]
  joinPolicy: string
  provenanceLabelRequired: string
  rawOhlcv: ContractField
  featureInput: ContractField
  targetInput: ContractField
  metrics: null | Record<string, unknown>
  metricsStatus: string
  reportingEvidence: { path: string; sha256: string; note: string }[]
  guards: { name: string; verdict: string }[]
  selectedModelEvidence: string
  finalTraining: { status: string; evidence: null | Record<string, unknown> }
  sample: TibotSample
}

export interface TibotFamilySummary {
  family: string
  candidateCount: number
  intervals: string[]
  statuses: string[]
  selectedModelEvidence: string
  finalTraining: { status: string; evidence: null | Record<string, unknown> }
}

export interface TibotSuitePayload {
  artifactType: string
  generatedAtUtc: string
  contractPath: string
  contractSha256: string
  admissibleEvidenceBasis: string
  manifest: {
    manifest_id: string
    created_at_utc: string
    created_by: string
    status: string
  }
  sourceBasis: {
    raw_historical_index: { path: string; sha256: string }
    sentinel_audits: Record<string, { path: string; exists: boolean; sha256: string }>
    source_manifest_hashes: Record<string, { path: string; sha256: string }>
  }
  displayWarnings: string[]
  families: TibotFamilySummary[]
  models: TibotModelRow[]
}

export const TIBOT_SUITE_PATH = `${import.meta.env.BASE_URL}data/tibot_suite_dashboard_20260723.json`

export function useTibotSuitePayload(): {
  status: TibotLoadStatus
  data: TibotSuitePayload | null
  error?: string
} {
  const [state, setState] = useState<{ status: TibotLoadStatus; data: TibotSuitePayload | null; error?: string }>({
    status: 'loading',
    data: null,
  })

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', data: null })
    fetch(TIBOT_SUITE_PATH, { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 404) return { status: 'absent' as const, data: null }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const json = (await r.json()) as TibotSuitePayload
        if (!json?.manifest || !Array.isArray(json?.models)) {
          throw new Error('malformed Tibot-suite payload')
        }
        return { status: 'ready' as const, data: json }
      })
      .then((s) => alive && setState(s))
      .catch((e) => alive && setState({ status: 'error', data: null, error: String(e?.message ?? e) }))
    return () => {
      alive = false
    }
  }, [])

  return state
}

export function shortHash(hash: string | undefined): string {
  return hash ? `${hash.slice(0, 12)}...` : '-'
}

export function familyLabel(family: string): string {
  return family.replace(/^prediction\//, '').replace(/_/g, ' ')
}

export function formatCell(v: string | number | null | undefined): string {
  if (v == null) return '-'
  if (typeof v === 'number') {
    const abs = Math.abs(v)
    if (abs !== 0 && abs < 0.001) return v.toExponential(2)
    if (abs < 1) return v.toFixed(6)
    if (abs < 1000) return v.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
    return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  return v
}
