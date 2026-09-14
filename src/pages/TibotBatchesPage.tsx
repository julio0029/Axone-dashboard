import { useState } from 'react'
import { Card } from '../components/Card'
import {
  useTibotBatch3, shortHash,
  type Family, type Cell, type LifecycleState,
} from '../data/tibotBatch3'

// ── Lifecycle tone palette — the three states must never be visually confusable.
//   NO_GO      → red / grey (retired)
//   CANDIDATE  → amber + blue (prototype, not promoted)
//   PROMOTED   → green (full bar, elsewhere)
const TONE = {
  no_go: { fg: '#ff5470', bg: 'rgba(255,84,112,0.10)', border: 'rgba(255,84,112,0.40)' },
  candidate: { fg: '#ffb454', bg: 'rgba(255,180,84,0.10)', border: 'rgba(255,180,84,0.45)' },
  promoted: { fg: '#1ec8a5', bg: 'rgba(30,200,165,0.10)', border: 'rgba(30,200,165,0.40)' },
} as const

type Tone = keyof typeof TONE

function verdictTone(verdict: string): Tone {
  if (verdict === 'NO_GO') return 'no_go'
  if (verdict === 'CANDIDATE_SELECTED') return 'candidate'
  if (verdict === 'PROMOTED') return 'promoted'
  return 'no_go'
}

function verdictLabel(verdict: string): string {
  if (verdict === 'NO_GO') return 'NO-GO'
  if (verdict === 'CANDIDATE_SELECTED') return 'CANDIDATE SELECTED'
  if (verdict === 'PROMOTED') return 'PROMOTED'
  return verdict
}

function LifecycleBadge({ verdict, size = 'md' }: { verdict: string; size?: 'sm' | 'md' | 'lg' }) {
  const tone = TONE[verdictTone(verdict)]
  const cls = size === 'lg'
    ? 'px-3 py-1 text-sm'
    : size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px]'
    : 'px-2 py-0.5 text-xs'
  // NO_GO uses a diagonal "retired" hatch feel via dashed border; CANDIDATE is solid
  // amber; PROMOTED solid green. Distinct enough to never read as each other.
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-semibold tracking-wide ${cls}`}
      style={{
        color: tone.fg,
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        borderStyle: verdict === 'NO_GO' ? 'dashed' : 'solid',
      }}
    >
      {verdict === 'NO_GO' && '⊘'}
      {verdict === 'CANDIDATE_SELECTED' && '◐'}
      {verdict === 'PROMOTED' && '✓'}
      {verdictLabel(verdict)}
    </span>
  )
}

function pct(v: number | null | undefined, dp = 3) {
  if (v == null) return '—'
  return v.toFixed(dp)
}

function fmtHorizon(h: number) {
  return `h${h}`
}

// ── Lifecycle legend ───────────────────────────────────────────────────────
function LifecycleLegend({ legend, caption }: { legend: LifecycleState[]; caption: string }) {
  return (
    <Card title="Lifecycle States" subtitle="Three distinct Tibot stages — never conflated">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {legend.map((s) => {
          const tone = TONE[s.tone]
          return (
            <div
              key={s.state}
              className="rounded-lg p-3 flex flex-col gap-2"
              style={{ background: tone.bg, border: `1px solid ${tone.border}`, borderStyle: s.state === 'NO_GO' ? 'dashed' : 'solid' }}
            >
              <LifecycleBadge verdict={s.state} />
              <p className="text-[11px] text-ax-muted leading-relaxed">{s.description}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
        <p className="text-[11px] text-amber-200">
          <span className="font-semibold">CANDIDATE_SELECTED caption:</span> {caption}
        </p>
      </div>
    </Card>
  )
}

// ── Per-cell status pill for the matrix ────────────────────────────────────
function CellPill({ cell, isSelectedModel }: { cell: Cell; isSelectedModel: boolean }) {
  const [open, setOpen] = useState(false)
  const pass = cell.status === 'PASS'
  const color = pass ? TONE.promoted.fg : TONE.no_go.fg
  const bg = pass ? TONE.promoted.bg : TONE.no_go.bg
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded px-1.5 py-1 text-[10px] font-mono transition hover:brightness-125"
        style={{
          color,
          background: bg,
          border: `1px solid ${pass ? TONE.promoted.border : TONE.no_go.border}`,
          outline: isSelectedModel ? `1px solid ${TONE.candidate.fg}66` : 'none',
        }}
        title={`${cell.target} · ${cell.model} · ${fmtHorizon(cell.horizon)}`}
      >
        {pass ? 'PASS' : 'FAIL'}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 left-0 w-60 rounded-lg border border-ax-border bg-ax-bg-2 p-3 text-[10px] shadow-xl">
          <div className="font-mono text-ax-text mb-1 break-all">{cell.target}</div>
          <div className="text-ax-muted mb-2">{cell.model} · {fmtHorizon(cell.horizon)} · n={cell.n_total?.toLocaleString()} · {cell.n_folds} folds</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono">
            <span className="text-ax-muted">bacc</span><span className="text-ax-text">{pct(cell.bacc_mean)}</span>
            <span className="text-ax-muted">mcc</span><span className="text-ax-text">{pct(cell.mcc_mean)}</span>
            <span className="text-ax-muted">macro-f1</span><span className="text-ax-text">{pct(cell.macro_f1_mean)}</span>
            {cell.pr_auc_mean != null && (
              <><span className="text-ax-muted">pr-auc</span><span className="text-ax-text">{pct(cell.pr_auc_mean)}</span></>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-ax-border/50">
            {Object.entries(cell.guards).map(([k, ok]) => (
              <div key={k} className="flex items-center gap-1">
                <span style={{ color: ok ? TONE.promoted.fg : TONE.no_go.fg }}>{ok ? '✓' : '✗'}</span>
                <span className="text-ax-muted font-mono">{k}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Family card ────────────────────────────────────────────────────────────
function FamilyCard({ fam, candidateCaption }: { fam: Family; candidateCaption: string }) {
  const tone = TONE[verdictTone(fam.arch_verdict)]
  const isCandidate = fam.arch_verdict === 'CANDIDATE_SELECTED'

  // Build a target × model matrix
  const cellFor = (target: string, model: string): Cell | undefined =>
    fam.cells.find((c) => c.target === target && c.model === model)

  return (
    <div
      className="rounded-xl border p-4 space-y-4"
      style={{ borderColor: tone.border, background: tone.bg, borderStyle: fam.arch_verdict === 'NO_GO' ? 'dashed' : 'solid' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-lg tracking-tight text-ax-text">{fam.family}</h3>
            <LifecycleBadge verdict={fam.arch_verdict} size="lg" />
          </div>
          <p className="text-[11px] text-ax-muted mt-1">
            {fam.category} · {fam.n_pass}/{fam.n_cells} cells passed guards
            {fam.selected_model && <> · selected model <span className="text-ax-text font-mono">{fam.selected_model}</span></>}
          </p>
        </div>
        <div className="text-right text-[10px] text-ax-muted font-mono">
          <div>sklearn {fam.env.sklearn}</div>
          <div>prereg {shortHash(fam.env.prereg_sha)}…</div>
        </div>
      </div>

      {/* Candidate caption */}
      {isCandidate && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <p className="text-[11px] text-amber-200">⚠ {candidateCaption}</p>
        </div>
      )}

      {/* Pass counts per model */}
      <div className="flex flex-wrap gap-2">
        {fam.models.map((m) => {
          const n = fam.pass_counts[m] ?? 0
          const total = fam.targets.length
          const isSel = m === fam.selected_model
          return (
            <div
              key={m}
              className="rounded px-2 py-1 text-[10px] font-mono flex items-center gap-1.5"
              style={{
                background: isSel ? TONE.candidate.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSel ? TONE.candidate.border : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {isSel && <span style={{ color: TONE.candidate.fg }}>◐</span>}
              <span className="text-ax-text">{m}</span>
              <span style={{ color: n > 0 ? TONE.promoted.fg : TONE.no_go.fg }}>{n}/{total}</span>
            </div>
          )
        })}
      </div>

      {/* Target × model matrix */}
      <div className="overflow-x-auto">
        <table className="text-[10px] border-separate" style={{ borderSpacing: '3px' }}>
          <thead>
            <tr>
              <th className="text-left text-ax-muted font-normal px-1 py-1 sticky left-0">target ↓ / model →</th>
              {fam.models.map((m) => (
                <th key={m} className="px-1 py-1 text-ax-muted font-normal font-mono whitespace-nowrap">
                  {m === fam.selected_model ? (
                    <span style={{ color: TONE.candidate.fg }}>◐ {m}</span>
                  ) : m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fam.targets.map((t) => (
              <tr key={t}>
                <td className="text-ax-muted font-mono px-1 py-1 whitespace-nowrap sticky left-0 bg-transparent">{t}</td>
                {fam.models.map((m) => {
                  const c = cellFor(t, m)
                  return (
                    <td key={m} className="w-20">
                      {c ? <CellPill cell={c} isSelectedModel={m === fam.selected_model} /> : <span className="text-ax-muted">—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Guard legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {fam.guard_keys.map((k) => (
          <span key={k} className="text-[10px] text-ax-muted font-mono">{fam.guard_labels[k]}</span>
        ))}
      </div>

      {/* Notes */}
      {fam.notes.length > 0 && (
        <div className="rounded-lg border border-ax-border/50 bg-ax-bg-2/50 p-3 space-y-1">
          {fam.notes.map((n, i) => (
            <p key={i} className="text-[11px] text-ax-muted leading-relaxed">• {n}</p>
          ))}
        </div>
      )}

      {/* Source provenance */}
      <div className="text-[9px] text-ax-muted font-mono break-all opacity-70">
        source: {fam.source_path}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export function TibotBatchesPage() {
  const { status, data, error } = useTibotBatch3()

  if (status !== 'ready' || !data) {
    return (
      <Card title="Tibot · Gate-B Batches">
        <div className="py-14 text-center text-sm text-ax-muted">
          {status === 'loading' && 'Loading Batch 3 Gate-B bundle…'}
          {status === 'error' && `Failed to load: ${error}`}
        </div>
      </Card>
    )
  }

  const counts = {
    no_go: data.families.filter((f) => f.arch_verdict === 'NO_GO').length,
    candidate: data.families.filter((f) => f.arch_verdict === 'CANDIDATE_SELECTED').length,
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-tight ax-glow-text">Tibot · Gate-B Pipeline — Batch 3</h1>
          <p className="text-ax-muted mt-1 text-sm max-w-3xl">{data.batch_context}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded border border-ax-blue/40 bg-ax-blue/10 text-ax-blue-2">{data.batch} · {data.run_id}</span>
            <span className="px-2 py-0.5 rounded border" style={{ borderColor: TONE.no_go.border, color: TONE.no_go.fg }}>
              {counts.no_go} NO-GO
            </span>
            <span className="px-2 py-0.5 rounded border" style={{ borderColor: TONE.candidate.border, color: TONE.candidate.fg }}>
              {counts.candidate} CANDIDATE
            </span>
            <span className="px-2 py-0.5 rounded border border-ax-border/50 text-ax-muted">BTCUSDT general-context prototyping</span>
          </div>
        </div>
        <div className="text-right text-[10px] text-ax-muted font-mono">
          <div>Generated: {data.generated_date}</div>
          <div className="text-ax-blue-2 mt-0.5">{data.tx_ref}</div>
        </div>
      </div>

      <LifecycleLegend legend={data.lifecycle_legend} caption={data.candidate_caption} />

      {/* Family cards */}
      <div className="grid grid-cols-1 gap-5">
        {data.families.map((fam) => (
          <FamilyCard key={fam.family} fam={fam} candidateCaption={data.candidate_caption} />
        ))}
      </div>

      {/* Promoted reference */}
      <Card title="Promoted Families (separate, higher bar)" subtitle="Not part of Batch 3 — shown for lifecycle context only">
        <p className="text-xs text-ax-muted mb-3">{data.promoted_reference.note}</p>
        <div className="flex flex-wrap gap-2">
          {data.promoted_reference.families.map((f) => (
            <span
              key={f}
              className="px-2 py-1 rounded text-xs font-mono flex items-center gap-1.5"
              style={{ background: TONE.promoted.bg, border: `1px solid ${TONE.promoted.border}`, color: TONE.promoted.fg }}
            >
              ✓ {f}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-ax-muted mt-3">
          These carry full Sentinel PASS + multi-symbol + live-forward-validation eligibility — a categorically
          higher bar than Batch-3 CANDIDATE_SELECTED. See the Tibot 24h Live-Forward Validation page.
        </p>
      </Card>
    </div>
  )
}
