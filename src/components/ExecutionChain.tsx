import type { ReactNode } from 'react'
import type {
  ClockStartGate,
  ExecutionChain as ExecutionChainT,
  ExecutionLineage,
  ExecutionStageDef,
  KillSwitch,
  StageStatus,
} from '../data/paper'
import { NotAvailable, Pill, SourcePath } from './V2'

// =====================================================================
// TX:20260922-014 — the seven-stage paper execution chain.
// Every panel here is PAPER/TESTNET. No real capital. The chain is shown as
// SEVEN DISTINCT STAGES keyed by Wolf's decision ID; nothing is collapsed.
// =====================================================================

const C = {
  ok: '#1ec8a5',
  amber: '#ffb454',
  amberSoft: '#ffcf8a',
  red: '#ff5470',
  orange: '#ff8a3d',
  steel: '#8fa3c4',
  muted: '#6b7a96',
}

/** Status → tone. NOT_STARTED / NOT_AVAILABLE are deliberately muted so an
 *  absent stage never reads like a measured pass. */
function stageTone(status: StageStatus): string {
  switch (status) {
    case 'REACHED':
    case 'FILLED':
      return C.ok
    case 'PARTIAL_FILL':
      return C.amber
    case 'TIMEOUT':
      return C.orange
    case 'REJECTED':
    case 'PRE_FLIGHT_REJECTED':
    case 'DUPLICATE_REJECTED':
    case 'STALE_DECISION':
      return C.red
    case 'PENDING':
      return C.steel
    default:
      return C.muted // NOT_STARTED / NOT_AVAILABLE
  }
}

function label(status: string) {
  return status.replace(/_/g, ' ')
}

/**
 * The mandatory, impossible-to-miss labelling. This is not a footnote — it is a
 * full-width warning bar rendered at the head of every execution panel group.
 */
export function NoRealCapitalBanner() {
  return (
    <div
      className="rounded-2xl border-2 px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-1.5"
      style={{
        borderColor: C.amber,
        background:
          'repeating-linear-gradient(135deg, rgba(255,84,112,0.10) 0 16px, rgba(255,180,84,0.08) 16px 32px)',
      }}
    >
      <span
        className="font-display text-base md:text-xl tracking-[0.16em] uppercase font-semibold"
        style={{ color: C.amberSoft, textShadow: `0 0 18px ${C.amber}66` }}
      >
        ⚠ Binance Paper / Testnet — No Real Capital
      </span>
      <span className="text-[#ffcf8a]/85 text-xs md:text-sm tracking-wide">
        Every stage below is simulated on Binance Testnet. No live trading. No mainnet. No real money.
      </span>
      <span className="ml-auto font-mono text-[10px] uppercase tracking-widest" style={{ color: `${C.amber}bb` }}>
        testnet.binance.vision
      </span>
    </div>
  )
}

/** LIFECYCLE_POLICY rendered honestly as UNRESOLVED — never defaulted or guessed. */
export function LifecyclePolicyBadge({ policy }: { policy: ExecutionChainT['lifecyclePolicy'] }) {
  return (
    <div className="rounded-xl border border-ax-border/70 bg-white/[0.02] px-4 py-3">
      <div className="text-ax-muted text-[10px] uppercase tracking-widest">Lifecycle policy</div>
      <div className="flex items-center gap-2 mt-1">
        <span
          className="font-display text-lg tracking-wide"
          style={{ color: C.amberSoft, textShadow: `0 0 12px ${C.amber}44` }}
        >
          {policy.value}
        </span>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: C.amber }}>
          unresolved
        </span>
      </div>
      <div className="text-ax-muted text-[11px] mt-1 flex items-center gap-1.5 flex-wrap">
        resolves to
        {policy.resolvesTo.map((r) => (
          <span key={r} className="font-mono text-ax-text/80 border border-ax-border/60 rounded px-1 py-0.5 text-[10px]">
            {r}
          </span>
        ))}
      </div>
      <p className="text-ax-muted/70 text-[10px] leading-relaxed mt-1.5">{policy.note}</p>
    </div>
  )
}

/** Kill-switch state indicator. Never assumes ENABLED; NOT AVAILABLE until a log exists. */
export function KillSwitchIndicator({ ks }: { ks: KillSwitch }) {
  const present = ks.status === 'AVAILABLE' && ks.state
  const tone =
    ks.state === 'ENABLED' ? C.ok : ks.state === 'EMERGENCY_STOP' ? C.red : ks.state === 'DISABLED' ? C.orange : C.muted
  return (
    <div className="rounded-xl border border-ax-border/70 bg-white/[0.02] px-4 py-3">
      <div className="text-ax-muted text-[10px] uppercase tracking-widest">Kill switch</div>
      <div className="font-display text-lg tracking-wide mt-1" style={{ color: present ? tone : C.muted }}>
        {present ? label(ks.state as string) : 'NOT AVAILABLE'}
      </div>
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {ks.legend.map((s) => (
          <span
            key={s}
            className="font-mono text-[9px] uppercase tracking-wide rounded px-1.5 py-0.5"
            style={{
              color: ks.state === s ? '#0a0e17' : C.muted,
              background: ks.state === s ? tone : 'transparent',
              border: `1px solid ${ks.state === s ? tone : 'rgba(107,122,150,0.4)'}`,
            }}
          >
            {label(s)}
          </span>
        ))}
      </div>
      <p className="text-ax-muted/70 text-[10px] leading-relaxed mt-1.5">{ks.note}</p>
    </div>
  )
}

/**
 * The seven-stage stepper. Each stage is a distinct card — a viewer sees exactly
 * where an instruction reached and where it stopped. Never collapsed to one row.
 */
export function StageStepper({ stages }: { stages: ExecutionStageDef[] }) {
  return (
    <div className="overflow-x-auto ax-scroll -mx-1 px-1 pb-2">
      <div className="flex items-stretch gap-2 min-w-max">
        {stages.map((s, i) => {
          const tone = stageTone(s.status)
          return (
            <div key={s.key} className="flex items-stretch">
              <div
                className="w-44 rounded-xl border bg-white/[0.02] px-3 py-3 flex flex-col"
                style={{ borderColor: `${tone}55` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono"
                    style={{ background: `${tone}22`, color: tone, border: `1px solid ${tone}66` }}
                  >
                    {s.index}
                  </span>
                  <span
                    className="font-mono text-[8.5px] uppercase tracking-widest rounded px-1.5 py-0.5"
                    style={{ background: `${tone}1a`, color: tone, border: `1px solid ${tone}55` }}
                  >
                    {label(s.status)}
                  </span>
                </div>
                <div className="font-display text-sm tracking-wide text-ax-text mt-2">{s.label}</div>
                <p className="text-ax-muted/80 text-[10px] leading-snug mt-1 flex-1">{s.description}</p>
                <div className="text-ax-muted/50 text-[8.5px] font-mono mt-2 truncate" title={s.sourceLog}>
                  {s.sourceLog}
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className="flex items-center px-0.5" style={{ color: C.muted }}>
                  <span className="text-lg leading-none">→</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Legend of first-class fill / lifecycle outcomes. */
export function StateLegend({ states }: { states: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {states.map((s) => (
        <span
          key={s}
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wide"
          style={{
            color: stageTone(s as StageStatus),
            background: `${stageTone(s as StageStatus)}18`,
            border: `1px solid ${stageTone(s as StageStatus)}55`,
          }}
        >
          {label(s)}
        </span>
      ))}
    </div>
  )
}

/** Action vocabulary — both taxonomies shown, since the policy is unresolved. */
export function ActionVocabulary({ vocab }: { vocab: ExecutionChainT['actionVocabulary'] }) {
  const row = (title: string, items: string[], note: string) => (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-ax-muted text-[10px] uppercase tracking-widest">{title}</span>
        <span className="text-ax-muted/60 text-[10px]">{note}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {items.map((a) => (
          <span key={a} className="font-mono text-[10px] text-ax-text/85 border border-ax-border/60 rounded px-1.5 py-0.5">
            {a}
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <div className="space-y-3">
      {row('CONTRACT_V1 taxonomy', vocab.contract_v1, 'if F3 resolves → CONTRACT_V1')}
      {row('WOLF_0 taxonomy', vocab.brief, 'if F3 resolves → WOLF_0')}
      <p className="text-ax-muted/60 text-[10px]">
        Both vocabularies are shown because LIFECYCLE_POLICY is PENDING_F3. Neither is assumed active.
      </p>
    </div>
  )
}

/** The per-decision lineage table. Empty (NOT AVAILABLE) until real records exist. */
export function LineageTable({ chain }: { chain: ExecutionChainT }) {
  if (chain.lineageCount === 0 || chain.lineages.length === 0) {
    return (
      <NotAvailable
        label="NOT AVAILABLE"
        detail={
          'No execution records exist. No adapter has run and the clock has not started, so there ' +
          'is no Wolf decision to trace through the seven stages. Rows appear only from real, ' +
          'append-only run logs — never sample or zero rows.'
        }
      />
    )
  }
  const cols = chain.stages
  return (
    <div className="overflow-x-auto ax-scroll">
      <table className="w-full text-xs border-collapse min-w-max">
        <thead>
          <tr className="text-left">
            <th className="px-2 py-1.5 text-ax-muted text-[10px] uppercase tracking-widest sticky left-0 bg-ax-bg-2">
              {chain.joinKey}
            </th>
            {cols.map((c) => (
              <th key={c.key} className="px-2 py-1.5 text-ax-muted text-[10px] uppercase tracking-widest">
                {c.index}. {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chain.lineages.map((l) => (
            <LineageRow key={l.wolfLedgerRef} lineage={l} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LineageRow({ lineage, cols }: { lineage: ExecutionLineage; cols: ExecutionStageDef[] }) {
  return (
    <tr className="border-t border-ax-border/30 align-top">
      <td className="px-2 py-1.5 font-mono text-[10px] text-ax-text/85 sticky left-0 bg-ax-bg-2 whitespace-nowrap">
        {lineage.wolfLedgerRef}
        <div className="text-ax-muted/60">{lineage.symbol}</div>
      </td>
      {cols.map((c) => {
        const st = lineage.stages[c.key]
        const status = (st?.status ?? 'NOT_AVAILABLE') as StageStatus
        const tone = stageTone(status)
        return (
          <td key={c.key} className="px-2 py-1.5">
            <span
              className="font-mono text-[9px] uppercase tracking-wide rounded px-1.5 py-0.5"
              style={{ color: tone, background: `${tone}18`, border: `1px solid ${tone}55` }}
            >
              {label(status)}
            </span>
          </td>
        )
      })}
    </tr>
  )
}

/** The real, hash-verified Sentinel clock-start gate — explains WHY it's NOT STARTED. */
export function ClockStartGatePanel({ gate }: { gate: ClockStartGate }) {
  if (gate.status === 'NOT_AVAILABLE') {
    return <NotAvailable label="NOT AVAILABLE" detail="No Sentinel clock-start verdict on disk." />
  }
  const blocked = gate.clockMayStart === false
  const tone = gate.verdict === 'BLOCKED' || blocked ? C.red : gate.verdict === 'PASS' ? C.ok : C.amber
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GateTile label="Verdict" value={<span style={{ color: tone }}>{gate.verdict ?? '—'}</span>} />
        <GateTile
          label="Clock may start"
          value={<span style={{ color: blocked ? C.red : C.ok }}>{blocked ? 'NO' : 'YES'}</span>}
        />
        <GateTile label="Freeze manifest" value={<span style={{ color: C.muted }}>{gate.freezeManifestStatus ?? '—'}</span>} />
        <GateTile label="Blockers" value={<span style={{ color: C.red }}>{gate.blockerCount ?? 0}</span>} sub="hard" />
      </div>
      {gate.blockers && gate.blockers.length > 0 && (
        <div className="space-y-1.5">
          {gate.blockers.map((b) => (
            <div key={b.id} className="rounded-lg border border-ax-border/50 bg-white/[0.015] px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px]" style={{ color: C.red }}>
                  {b.id}
                </span>
                <Pill color={C.red}>{b.severity}</Pill>
                <span className="text-ax-muted/70 text-[10px] ml-auto font-mono">{b.owner}</span>
              </div>
              <p className="text-ax-text/85 text-xs mt-1 leading-snug">{b.summary}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-ax-muted/70 text-[10px] font-mono">
        verdict sha256 {gate.sha256 ?? '—'} · audited {gate.auditDate ?? '—'}
      </p>
      <SourcePath path={gate.source.path} branch="paper" />
    </div>
  )
}

function GateTile({ label: l, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-ax-border/70 bg-white/[0.02] px-4 py-3">
      <div className="text-ax-muted text-[10px] uppercase tracking-widest">{l}</div>
      <div className="font-display text-lg tracking-wide mt-0.5">{value}</div>
      {sub && <div className="text-ax-muted text-[11px] mt-0.5">{sub}</div>}
    </div>
  )
}
