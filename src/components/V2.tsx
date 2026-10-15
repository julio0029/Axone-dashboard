import type { ReactNode } from 'react'
import type { LoadStatus } from '../data/v2'

/**
 * Shared primitives for the Axone V2 views.
 * - LoadGate: renders loading/absent/error uniformly; children only on ready.
 * - AwaitingData: explicit "source has not produced this yet" placeholder —
 *   never a fabricated number.
 * - PaperTestnetBanner / SimTag: the hard PAPER/TESTNET labelling for View 2.
 */

export function LoadGate({
  status,
  error,
  absentHint,
  children,
}: {
  status: LoadStatus
  error?: string
  absentHint?: string
  children: ReactNode
}) {
  if (status === 'ready') return <>{children}</>
  return (
    <div className="py-16 text-center text-sm text-ax-muted">
      {status === 'loading' && 'loading…'}
      {status === 'absent' && (absentHint ?? 'data file not found — run the generator')}
      {status === 'error' && <span className="text-ax-down">error: {error}</span>}
    </div>
  )
}

/** Explicit awaiting-data placeholder. Used wherever a track has not produced output. */
export function AwaitingData({
  title = 'Awaiting data',
  detail,
  className = '',
}: {
  title?: string
  detail?: string
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-ax-border bg-white/[0.015] px-5 py-10 text-center ${className}`}
    >
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <span className="inline-block w-2 h-2 rounded-full border border-ax-muted" />
        <span className="font-display text-sm tracking-wide text-ax-muted uppercase">{title}</span>
      </div>
      {detail && <p className="text-ax-muted/80 text-xs leading-relaxed max-w-md mx-auto">{detail}</p>}
      <p className="text-ax-muted/50 text-[10px] mt-3 uppercase tracking-widest">
        no result on disk · nothing fabricated
      </p>
    </div>
  )
}

/** Big, unmistakable PAPER / TESTNET banner for the 48h Paper Test view. */
export function PaperTestnetBanner({ endpoint }: { endpoint: string }) {
  return (
    <div
      className="rounded-xl border-2 px-5 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-1"
      style={{
        borderColor: '#ffb454',
        background: 'repeating-linear-gradient(135deg, rgba(255,180,84,0.10) 0 14px, rgba(255,180,84,0.04) 14px 28px)',
      }}
    >
      <span
        className="font-display text-sm md:text-base tracking-[0.18em] uppercase font-semibold"
        style={{ color: '#ffcf8a', textShadow: '0 0 16px rgba(255,180,84,0.5)' }}
      >
        ⚠ Paper / Testnet — Simulated
      </span>
      <span className="text-[#ffcf8a]/90 text-xs md:text-sm tracking-wide">
        No real money · Binance Testnet only ({endpoint})
      </span>
      <span className="ml-auto text-[#ffcf8a]/70 text-[10px] uppercase tracking-widest">
        every equity / PnL figure below is simulated
      </span>
    </div>
  )
}

/** Inline SIM tag to attach to any equity/PnL figure in the paper view. */
export function SimTag({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest align-middle ${className}`}
      style={{ background: 'rgba(255,180,84,0.16)', color: '#ffcf8a', border: '1px solid rgba(255,180,84,0.4)' }}
    >
      sim
    </span>
  )
}

export function StatTile({
  label,
  value,
  sub,
  tone = 'default',
  sim = false,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: 'default' | 'up' | 'down'
  sim?: boolean
}) {
  const color = tone === 'up' ? '#1ec8a5' : tone === 'down' ? '#ff5470' : undefined
  return (
    <div className="rounded-xl border border-ax-border/70 bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-1.5 text-ax-muted text-[10px] uppercase tracking-widest">
        {label}
        {sim && <SimTag />}
      </div>
      <div className="font-display text-lg tracking-wide mt-0.5" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-ax-muted text-[11px] mt-0.5">{sub}</div>}
    </div>
  )
}

/**
 * Branch identity banner — the top-of-page marker that makes the two branches
 * impossible to confuse at a glance.
 * - paper  → Branch 1 · Paper Candidate V1 (steel/amber, "frozen forward test")
 * - research → Branch 2 · V2 Research (electric blue, "experiments")
 */
export function BranchBanner({
  branch,
  title,
  subtitle,
  sourcePath,
  status,
}: {
  branch: 'paper' | 'research'
  title: string
  subtitle: string
  sourcePath: string
  status?: ReactNode
}) {
  const paper = branch === 'paper'
  const accent = paper ? '#ffb454' : '#4dd2ff'
  const tag = paper ? 'BRANCH 1 · PAPER CANDIDATE V1' : 'BRANCH 2 · V2 RESEARCH'
  return (
    <div
      className="rounded-2xl border-2 px-5 py-4"
      style={{
        borderColor: paper ? 'rgba(255,180,84,0.55)' : 'rgba(77,210,255,0.45)',
        background: paper
          ? 'repeating-linear-gradient(135deg, rgba(255,180,84,0.10) 0 16px, rgba(255,180,84,0.03) 16px 32px)'
          : 'linear-gradient(180deg, rgba(47,155,255,0.10), rgba(47,155,255,0.03))',
      }}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          className="font-mono text-[10px] tracking-[0.22em] uppercase px-2 py-0.5 rounded"
          style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}66` }}
        >
          {tag}
        </span>
        <span
          className="font-display text-base md:text-lg tracking-wide"
          style={{ color: accent, textShadow: `0 0 16px ${accent}55` }}
        >
          {title}
        </span>
        {status && <span className="ml-auto">{status}</span>}
      </div>
      <p className="text-ax-muted text-xs mt-1.5">{subtitle}</p>
      <SourcePath path={sourcePath} branch={branch} className="mt-2" />
    </div>
  )
}

/** Small monospace "source: <path>" label attached to every branch panel. */
export function SourcePath({
  path,
  branch = 'research',
  className = '',
}: {
  path: string
  branch?: 'paper' | 'research'
  className?: string
}) {
  const accent = branch === 'paper' ? '#ffb454' : '#4dd2ff'
  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-mono ${className}`} title={path}>
      <span className="uppercase tracking-widest" style={{ color: `${accent}cc` }}>
        source
      </span>
      <span className="text-ax-muted/80 truncate">{path}</span>
    </div>
  )
}

/** NOT AVAILABLE / NOT STARTED explicit state for a paper-branch panel. */
export function NotAvailable({
  label = 'NOT AVAILABLE',
  detail,
}: {
  label?: string
  detail?: string
}) {
  return (
    <div
      className="rounded-xl border border-dashed px-5 py-8 text-center"
      style={{ borderColor: 'rgba(255,180,84,0.35)', background: 'rgba(255,180,84,0.03)' }}
    >
      <div className="font-display text-sm tracking-[0.18em] uppercase" style={{ color: '#ffcf8a' }}>
        {label}
      </div>
      {detail && <p className="text-ax-muted/80 text-xs leading-relaxed max-w-md mx-auto mt-2">{detail}</p>}
      <p className="text-ax-muted/50 text-[10px] mt-3 uppercase tracking-widest">
        no evidence on disk · nothing fabricated · not carried from research
      </p>
    </div>
  )
}

export function Pill({ children, color = '#4dd2ff' }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {children}
    </span>
  )
}
