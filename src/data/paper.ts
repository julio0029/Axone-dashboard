import { useEffect, useState } from 'react'

// =====================================================================
// BRANCH 1 — PAPER CANDIDATE V1  ·  dedicated, isolated data adapter.
//
// This module is the ONLY loader for the paper-candidate branch. It does not
// share the generic research fetch hook (src/data/v2.ts::useJson) — it has its
// own fetch that is hard-wired to the single paper-candidate payload and runs a
// provenance guard on every load. This is deliberate: no shared loader may be
// able to pull a V2 research file into the paper branch.
// =====================================================================

export type LoadStatus = 'loading' | 'ready' | 'absent' | 'error'

// The paper branch may only cite Track D or a non-research (Sentinel) path.
const FORBIDDEN_RESEARCH = /AXONE_V2_RESEARCH_\d+/
const PAPER_SUBDIR = 'TRACK_D_48h_paper_test'

export interface SourceRef {
  panel: string
  path: string
  present: boolean
}
export interface FreezeManifest {
  status: 'NOT_AVAILABLE' | 'AVAILABLE'
  ref: string | null
  sha256?: string
  artifacts: { name: string; sha256: string }[]
  source: { path: string; present: boolean }
}
export interface SentinelPreflight {
  status: 'NOT_AVAILABLE' | 'AVAILABLE'
  verdict: 'PASS' | 'FAIL' | 'BLOCKED' | null
  date: string | null
  auditPath: string
  present: boolean
  sha256?: string
}
// ---- TX:20260922-014: generic seven-stage execution chain -------------------
export interface StageSource {
  path: string
  present: boolean
}
/** A stage's status. NOT_STARTED/NOT_AVAILABLE are distinct from any measured
 *  outcome; PARTIAL_FILL/REJECTED/TIMEOUT/STALE_DECISION are first-class. */
export type StageStatus =
  | 'NOT_STARTED'
  | 'NOT_AVAILABLE'
  | 'PENDING'
  | 'REACHED'
  | 'FILLED'
  | 'PARTIAL_FILL'
  | 'REJECTED'
  | 'TIMEOUT'
  | 'STALE_DECISION'
  | 'DUPLICATE_REJECTED'
  | 'PRE_FLIGHT_REJECTED'

export interface ExecutionStageDef {
  index: number
  key: string
  label: string
  description: string
  sourceLog: string
  status: StageStatus
  source: StageSource
}
export interface KillSwitch {
  status: 'NOT_AVAILABLE' | 'AVAILABLE'
  state: string | null
  legend: string[]
  contractStates: string[]
  note: string
  source: StageSource
}
export interface LifecyclePolicy {
  value: string
  resolved: boolean
  resolvesTo: string[]
  resolvedBy: string
  note: string
}
export interface ExecutionLineage {
  wolfLedgerRef: string
  runId: string
  symbol: string | null
  boundaryUtc: string | null
  killSwitchAtDecision: string | null
  stages: Record<string, Record<string, unknown> & { status: StageStatus }>
}
export interface ExecutionChain {
  status: 'NOT_STARTED' | 'RUNNING'
  started: boolean
  joinKey: string
  joinKeyDescription: string
  lifecyclePolicy: LifecyclePolicy
  actionVocabulary: { brief: string[]; contract_v1: string[] }
  fillStates: string[]
  killSwitch: KillSwitch
  stages: ExecutionStageDef[]
  lineages: ExecutionLineage[]
  lineageCount: number
  endpoint: string
  paperOnly: boolean
  mainnetForbidden: boolean
  logs: { name: string; role: string; path: string; present: boolean }[]
  adapterStatus: { present: boolean; note: string }
  source: StageSource
}
export interface ClockStartGate {
  status: 'NOT_AVAILABLE' | 'AVAILABLE'
  verdict: string | null
  clockMayStart: boolean | null
  conditionalPass?: boolean
  auditDate?: string
  scope?: string
  freezeManifestStatus?: string
  blockerCount?: number
  blockers?: { id: string; severity: string; summary: string; owner: string }[]
  resolutionSequence?: string[]
  sha256?: string
  source: StageSource
}

export interface PaperCandidateV1 {
  schema: string
  branch: 'PAPER_CANDIDATE_V1'
  branchLabel: string
  branchDescription: string
  generatedAtUtc: string
  sourceRoots: { trackD: string; sentinelAudit: string }
  overallStatus: 'NOT_STARTED' | 'RUNNING'
  started: boolean
  universe: string[]
  universeSize: number
  freezeManifest: FreezeManifest
  sentinelPreflight: SentinelPreflight
  executionVerification: {
    status: string
    paperOnly: boolean
    endpoint: string
    mainnetForbidden: boolean
    detail: string
    source: { path: string; present: boolean }
  }
  window48h: { status: string; startUtc: string | null; endUtc: string | null; source: { path: string; present: boolean } }
  incidents: { status: string; entries: Record<string, unknown>[]; note: string; source: { path: string; present: boolean } }
  paperTrades: { status: string; count: number; trades: Record<string, unknown>[]; source: { path: string; present: boolean } }
  paperPerformance: {
    status: string
    equityUsd: number | null
    realizedPnlUsd: number | null
    unrealizedPnlUsd: number | null
    openPositions: number | null
    note: string
    source: { path: string; present: boolean }
  }
  executionChain: ExecutionChain
  clockStartGate: ClockStartGate
  designDocsOnly: { file: string; path: string }[]
  sources: SourceRef[]
  provenanceGuard: {
    rule: string
    allowedSubdir: string
    forbiddenPattern: string
    pythonLocation: string
    tsLocation: string
  }
  provenance: { note: string }
}

/**
 * Provenance guard — the frontend half of the two-branch enforcement.
 * Throws (fails loudly → error state) if the payload is not the paper branch,
 * or if ANY declared source path is a V2 research path outside Track D.
 */
export function assertPaperProvenance(p: PaperCandidateV1): void {
  if (p.branch !== 'PAPER_CANDIDATE_V1') {
    throw new Error(`PROVENANCE VIOLATION: expected PAPER_CANDIDATE_V1, got "${p.branch}"`)
  }
  const check = (path: string, where: string) => {
    if (FORBIDDEN_RESEARCH.test(path) && !path.split('/').includes(PAPER_SUBDIR)) {
      throw new Error(
        `PROVENANCE VIOLATION: paper branch (${where}) references a V2 research path ` +
          `outside ${PAPER_SUBDIR}/: ${path}`,
      )
    }
  }
  for (const s of p.sources ?? []) check(s.path, `panel "${s.panel}"`)
  check(p.sourceRoots.trackD, 'sourceRoots.trackD')
  // TX:20260922-014 — the execution chain and its per-log/gate paths are guarded too.
  if (p.executionChain) {
    check(p.executionChain.source.path, 'executionChain.source')
    check(p.executionChain.killSwitch.source.path, 'executionChain.killSwitch')
    for (const st of p.executionChain.stages ?? []) check(st.source.path, `stage "${st.key}"`)
    for (const lg of p.executionChain.logs ?? []) check(lg.path, `log "${lg.name}"`)
  }
  if (p.clockStartGate) check(p.clockStartGate.source.path, 'clockStartGate.source')
}

/** Dedicated paper-branch fetch — hard-wired file, provenance-guarded. */
export function usePaperCandidate(): { status: LoadStatus; data: PaperCandidateV1 | null; error?: string } {
  const [state, setState] = useState<{ status: LoadStatus; data: PaperCandidateV1 | null; error?: string }>({
    status: 'loading',
    data: null,
  })
  useEffect(() => {
    let alive = true
    const url = `${import.meta.env.BASE_URL}data/paper_candidate_v1.json`
    fetch(url, { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 404) return { status: 'absent' as const, data: null }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const json = (await r.json()) as PaperCandidateV1
        assertPaperProvenance(json) // fails loudly on cross-branch contamination
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
