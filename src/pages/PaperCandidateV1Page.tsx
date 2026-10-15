import type { ReactNode } from 'react'
import { Card } from '../components/Card'
import { BranchBanner, LoadGate, NotAvailable, Pill, SourcePath } from '../components/V2'
import {
  ActionVocabulary,
  ClockStartGatePanel,
  KillSwitchIndicator,
  LifecyclePolicyBadge,
  LineageTable,
  NoRealCapitalBanner,
  StageStepper,
  StateLegend,
} from '../components/ExecutionChain'
import { usePaperCandidate, type PaperCandidateV1, type SentinelPreflight, type FreezeManifest } from '../data/paper'
import { sym } from '../data/v2'

// Branch-1 identity palette: steel / amber "frozen forward test" — deliberately
// distinct from the electric-blue V2 Research branch.
const P = { amber: '#ffb454', amberSoft: '#ffcf8a', steel: '#8fa3c4', down: '#ff5470', muted: '#6b7a96' }

const VERDICT_COLOR: Record<string, string> = { PASS: '#1ec8a5', FAIL: '#ff5470', BLOCKED: '#ffb454' }

export function PaperCandidateV1Page() {
  const { status, data, error } = usePaperCandidate()
  return (
    <div className="space-y-4">
      {data && (
        <BranchBanner
          branch="paper"
          title="Paper Candidate V1 — Frozen 10-symbol 48h forward test"
          subtitle={data.branchDescription}
          sourcePath={data.sourceRoots.trackD}
          status={<Pill color={P.muted}>{data.overallStatus.replace('_', ' ')}</Pill>}
        />
      )}
      <LoadGate
        status={status}
        error={error}
        absentHint="paper-candidate data not found — run scripts/gen_v2_paper_test.py"
      >
        {data && <Body d={data} />}
      </LoadGate>
    </div>
  )
}

function Body({ d }: { d: PaperCandidateV1 }) {
  return (
    <>
      {/* NOT STARTED headline — the honest current state */}
      <Card
        title="Forward-test status"
        subtitle="Branch 1 · TRACK_D_48h_paper_test"
        right={<Pill color={P.muted}>{d.overallStatus.replace('_', ' ')}</Pill>}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          <Tile label="Overall" value={<span style={{ color: P.amberSoft }}>{d.overallStatus.replace('_', ' ')}</span>} sub="no run yet" />
          <Tile label="Execution" value="PAPER ONLY" sub="mainnet forbidden" />
          <Tile label="Endpoint" value={<span className="text-xs font-mono">testnet.binance.vision</span>} sub="testnet" />
          <Tile label="Universe" value={`${d.universeSize}`} sub="frozen symbols" />
          <Tile label="Freeze manifest" value={badge(d.freezeManifest.status)} />
          <Tile label="Sentinel verdict" value={badge(d.sentinelPreflight.status)} />
        </div>
        <SourcePath path={d.sources.find((s) => s.panel === '48h window')?.path ?? d.sourceRoots.trackD} branch="paper" className="mt-3" />
      </Card>

      {/* ============================================================= */}
      {/* TX:20260922-014 — SEVEN-STAGE PAPER EXECUTION CHAIN            */}
      {/* ============================================================= */}
      <ExecutionChainSection d={d} />

      {/* Freeze manifest + artifact hashes */}
      <Card title="Freeze manifest & artifact SHA256" subtitle="Branch 1 · the frozen candidate's manifest reference and hashes">
        <FreezeBlock f={d.freezeManifest} />
        <SourcePath path={d.freezeManifest.source.path} branch="paper" className="mt-3" />
      </Card>

      {/* Sentinel preflight verdict */}
      <Card
        title="Sentinel preflight verdict"
        subtitle="Branch 1 · PASS / FAIL / BLOCKED with date + audit artifact"
        right={
          <Pill color={d.sentinelPreflight.verdict ? VERDICT_COLOR[d.sentinelPreflight.verdict] : P.muted}>
            {d.sentinelPreflight.verdict ?? d.sentinelPreflight.status.replace('_', ' ')}
          </Pill>
        }
      >
        <SentinelBlock s={d.sentinelPreflight} />
        <SourcePath path={d.sentinelPreflight.auditPath} branch="paper" className="mt-3" />
      </Card>

      {/* Two-column: execution verification + 48h window */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Paper-only execution verification" subtitle="Branch 1 · testnet-pinned, mainnet forbidden">
          {d.executionVerification.status === 'NOT_STARTED' ? (
            <NotAvailable label="NOT STARTED" detail={d.executionVerification.detail} />
          ) : (
            <p className="text-ax-text text-sm">{d.executionVerification.detail}</p>
          )}
          <SourcePath path={d.executionVerification.source.path} branch="paper" className="mt-3" />
        </Card>
        <Card title="48h window" subtitle="Branch 1 · forward-test start / end">
          {d.window48h.status === 'NOT_STARTED' ? (
            <NotAvailable label="NOT STARTED" detail="The 48-hour forward-test window has not begun. Start/end are recorded only when a run directory exists." />
          ) : (
            <dl className="text-sm space-y-2">
              <KV k="Start (UTC)" v={d.window48h.startUtc ?? '—'} />
              <KV k="End (UTC)" v={d.window48h.endUtc ?? '—'} />
            </dl>
          )}
          <SourcePath path={d.window48h.source.path} branch="paper" className="mt-3" />
        </Card>
      </div>

      {/* Operational incidents */}
      <Card title="Operational incidents log" subtitle="Branch 1 · kill-switch / reconciliation / heartbeat incidents">
        {d.incidents.status === 'NOT_STARTED' || d.incidents.entries.length === 0 ? (
          <NotAvailable label="NOT STARTED" detail={d.incidents.note} />
        ) : (
          <ul className="text-sm space-y-1">
            {d.incidents.entries.map((e, i) => (
              <li key={i} className="font-mono text-xs text-ax-text">{JSON.stringify(e)}</li>
            ))}
          </ul>
        )}
        <SourcePath path={d.incidents.source.path} branch="paper" className="mt-3" />
      </Card>

      {/* Paper trades + performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Paper trades" subtitle="Branch 1 · simulated fills on Binance Testnet">
          <NotAvailable label="NOT AVAILABLE" detail="No paper trades exist. Trades appear only from a real run's append-only logs." />
          <SourcePath path={d.paperTrades.source.path} branch="paper" className="mt-3" />
        </Card>
        <Card title="Paper performance" subtitle="Branch 1 · simulated equity & PnL — never zeros">
          <div className="grid grid-cols-2 gap-3">
            <Tile label="Equity" value={<span style={{ color: P.muted }}>NOT AVAILABLE</span>} />
            <Tile label="Realized PnL" value={<span style={{ color: P.muted }}>NOT AVAILABLE</span>} />
            <Tile label="Unrealized PnL" value={<span style={{ color: P.muted }}>NOT AVAILABLE</span>} />
            <Tile label="Open positions" value={<span style={{ color: P.muted }}>NOT AVAILABLE</span>} />
          </div>
          <p className="text-ax-muted/70 text-[11px] mt-2">{d.paperPerformance.note}</p>
          <SourcePath path={d.paperPerformance.source.path} branch="paper" className="mt-3" />
        </Card>
      </div>

      {/* Frozen universe + design docs */}
      <Card title="Frozen paper-test universe" subtitle="Branch 1 · 10 symbols (frozen)">
        <div className="flex flex-wrap gap-1.5">
          {d.universe.map((s) => (
            <Pill key={s} color={P.steel}>{sym(s)}</Pill>
          ))}
        </div>
        {d.designDocsOnly.length > 0 && (
          <div className="mt-4 pt-3 border-t border-ax-border/60">
            <p className="text-ax-muted text-[10px] uppercase tracking-widest mb-1.5">design documents on disk (no evidence yet)</p>
            <div className="flex flex-col gap-1">
              {d.designDocsOnly.map((doc) => (
                <span key={doc.file} className="font-mono text-[11px] text-ax-muted/80">{doc.file}</span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Provenance guard note — verifiable isolation statement */}
      <div className="rounded-lg border border-ax-border/60 bg-white/[0.015] px-4 py-3">
        <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: P.amberSoft }}>
          branch isolation · provenance guard
        </p>
        <p className="text-ax-muted text-xs leading-relaxed">{d.provenance.note}</p>
        <p className="text-ax-muted/70 text-[10px] font-mono mt-2">
          guard: {d.provenanceGuard.tsLocation} · {d.provenanceGuard.pythonLocation} — reject{' '}
          {d.provenanceGuard.forbiddenPattern} outside {d.provenanceGuard.allowedSubdir}/
        </p>
      </div>
    </>
  )
}

/**
 * The seven-stage paper execution chain (TX:20260922-014). Built against the
 * generic Wolf → adapter execution schema, policy-agnostic (LIFECYCLE_POLICY
 * unresolved), every stage distinct and keyed by Wolf's decision ID. All panels
 * carry the BINANCE PAPER/TESTNET — NO REAL CAPITAL label and render explicit
 * NOT AVAILABLE / NOT STARTED states — no fabricated or zero data.
 */
function ExecutionChainSection({ d }: { d: PaperCandidateV1 }) {
  const ec = d.executionChain
  return (
    <div className="space-y-4">
      <NoRealCapitalBanner />

      <Card
        title="Paper execution chain — seven distinct stages"
        subtitle={`Branch 1 · generic execution schema · joined by ${ec.joinKey} (Wolf's decision ID)`}
        right={<Pill color="#ffb454">{ec.status.replace('_', ' ')}</Pill>}
      >
        <p className="text-ax-muted text-xs leading-relaxed mb-3">{ec.joinKeyDescription}</p>
        <StageStepper stages={ec.stages} />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <LifecyclePolicyBadge policy={ec.lifecyclePolicy} />
          <KillSwitchIndicator ks={ec.killSwitch} />
        </div>
        <div className="mt-4 pt-3 border-t border-ax-border/50">
          <p className="text-ax-muted text-[10px] uppercase tracking-widest mb-1.5">first-class stage outcomes</p>
          <StateLegend states={ec.fillStates} />
        </div>
        <SourcePath path={ec.source.path} branch="paper" className="mt-3" />
      </Card>

      {/* Per-decision lineage table (each Wolf decision → its 7 stage outcomes) */}
      <Card
        title="Execution lineage — per Wolf decision"
        subtitle="Branch 1 · one row per Wolf decision ID; each stage outcome shown distinctly, never inferred"
        right={<Pill color="#6b7a96">{ec.lineageCount} lineages</Pill>}
      >
        <LineageTable chain={ec} />
        <p className="text-ax-muted/70 text-[10px] mt-3 leading-relaxed">
          A Wolf action can be rejected, time out, become stale, partially fill, or reconcile differently than
          requested — each is a distinct stage outcome here, not a collapsed trade row. {ec.adapterStatus.note}
        </p>
      </Card>

      {/* Action vocabulary (both taxonomies — policy unresolved) */}
      <Card
        title="Wolf action vocabulary"
        subtitle="Branch 1 · both taxonomies carried — LIFECYCLE_POLICY is PENDING_F3, neither assumed"
      >
        <ActionVocabulary vocab={ec.actionVocabulary} />
      </Card>

      {/* Real, hash-verified Sentinel clock-start gate — the honest reason NOT STARTED */}
      <Card
        title="Clock-start gate — Sentinel preflight verdict"
        subtitle="Branch 1 · real, hash-verified verdict explaining why the chain has not started"
        right={
          <Pill color={d.clockStartGate.clockMayStart === false ? '#ff5470' : '#1ec8a5'}>
            {d.clockStartGate.verdict ?? d.clockStartGate.status.replace('_', ' ')}
          </Pill>
        }
      >
        <ClockStartGatePanel gate={d.clockStartGate} />
      </Card>

      {/* Append-only run logs the chain would source from (§11) */}
      <Card title="Run logs (append-only)" subtitle="Branch 1 · Wolf → adapter execution schema · storage layout §11">
        <div className="overflow-x-auto ax-scroll">
          <table className="w-full text-xs">
            <tbody>
              {ec.logs.map((l) => (
                <tr key={l.name} className="border-b border-ax-border/30">
                  <td className="px-2 py-1.5 font-mono text-[11px] text-ax-text/85 whitespace-nowrap">{l.name}</td>
                  <td className="px-2 py-1.5 text-ax-muted text-[11px]">{l.role}</td>
                  <td className="px-2 py-1.5 text-right">
                    <Pill color={l.present ? '#1ec8a5' : '#6b7a96'}>{l.present ? 'present' : 'not available'}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function FreezeBlock({ f }: { f: FreezeManifest }) {
  if (f.status === 'NOT_AVAILABLE') {
    return <NotAvailable label="NOT AVAILABLE" detail="No freeze manifest exists under TRACK_D_48h_paper_test/. The candidate has not been frozen; artifact SHA256 hashes will be listed here once it is." />
  }
  return (
    <div className="space-y-2">
      <dl className="text-sm space-y-2">
        <KV k="Manifest" v={f.ref ?? '—'} />
        <KV k="Manifest SHA256" v={f.sha256 ?? '—'} />
      </dl>
      {f.artifacts.length > 0 && (
        <table className="w-full text-xs font-mono mt-2">
          <tbody>
            {f.artifacts.map((a) => (
              <tr key={a.name} className="border-b border-ax-border/30">
                <td className="px-2 py-1 text-ax-text">{a.name}</td>
                <td className="px-2 py-1 text-ax-muted">{a.sha256}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function SentinelBlock({ s }: { s: SentinelPreflight }) {
  if (s.status === 'NOT_AVAILABLE') {
    return (
      <NotAvailable
        label="NOT AVAILABLE"
        detail={`No Sentinel preflight verdict exists yet. Expected audit artifact: ${s.auditPath}`}
      />
    )
  }
  return (
    <dl className="text-sm space-y-2">
      <KV k="Verdict" v={s.verdict ?? '—'} />
      <KV k="Date" v={s.date ?? '—'} />
      <KV k="Audit artifact" v={s.auditPath} />
      <KV k="SHA256" v={s.sha256 ?? '—'} />
    </dl>
  )
}

function Tile({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-ax-border/70 bg-white/[0.02] px-4 py-3">
      <div className="text-ax-muted text-[10px] uppercase tracking-widest">{label}</div>
      <div className="font-display text-base tracking-wide mt-0.5">{value}</div>
      {sub && <div className="text-ax-muted text-[11px] mt-0.5">{sub}</div>}
    </div>
  )
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ax-border/40 pb-1.5">
      <dt className="text-ax-muted text-xs">{k}</dt>
      <dd className="text-ax-text text-sm font-mono truncate max-w-[60%]" title={v}>{v}</dd>
    </div>
  )
}

function badge(status: string) {
  const color = status === 'AVAILABLE' ? '#1ec8a5' : P.muted
  return <span className="text-sm" style={{ color }}>{status.replace('_', ' ')}</span>
}
