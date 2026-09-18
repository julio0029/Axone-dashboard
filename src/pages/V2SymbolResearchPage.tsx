import { Card } from '../components/Card'
import { AwaitingData, LoadGate, Pill } from '../components/V2'
import {
  useSymbolResearch,
  sym,
  type SymbolResearch,
  type TrackA,
  type TrackE,
  type ConsensusRow,
  type DiscoveryCandidate,
} from '../data/v2'

const AX = { blue2: '#4dd2ff', up: '#1ec8a5', down: '#ff5470', amber: '#ffb454', muted: '#6b7a96', violet: '#a78bfa' }

const CLS_COLOR: Record<string, string> = {
  GENERAL_TRANSFER_PASS: AX.up,
  CALIBRATION_REQUIRED: AX.amber,
  SYMBOL_TUNING_REQUIRED: '#ff9f43',
  NOT_APPLICABLE: AX.muted,
  PENDING: AX.muted,
}

export function V2SymbolResearchPage() {
  const { status, data, error } = useSymbolResearch()
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-ax-blue/30 bg-ax-blue/[0.06] px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-display text-[13px] tracking-wide text-ax-blue-2 uppercase">Symbol Research</span>
        <span className="text-ax-muted text-xs">Track A symbol-transfer classification · Track E Karen advisory discovery</span>
      </div>
      <LoadGate status={status} error={error} absentHint="symbol-research data not found — run scripts/gen_v2_symbol_research.py">
        {data && <Body d={data} />}
      </LoadGate>
    </div>
  )
}

function Body({ d }: { d: SymbolResearch }) {
  return (
    <>
      <UniverseCard a={d.trackA} />
      <TransferMatrix a={d.trackA} />
      <KarenSection e={d.trackE} />
    </>
  )
}

function UniverseCard({ a }: { a: TrackA }) {
  return (
    <Card
      title="Symbol universe"
      subtitle="frozen original set vs Track A expansion targets"
      right={<Pill color={a.blocked ? AX.down : AX.up}>{a.overallStatus}</Pill>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p className="text-ax-muted text-[10px] uppercase tracking-widest mb-2">
            original universe · {a.originalUniverse.length} symbols
          </p>
          <div className="flex flex-wrap gap-1.5">
            {a.originalUniverse.map((s) => (
              <Pill key={s} color={AX.blue2}>
                {sym(s)}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <p className="text-ax-muted text-[10px] uppercase tracking-widest mb-2">
            expansion targets · {a.expansionTargets.length} symbols
          </p>
          <div className="flex flex-wrap gap-1.5">
            {a.expansionTargets.map((s) => (
              <Pill key={s} color={AX.amber}>
                {sym(s)}
              </Pill>
            ))}
          </div>
        </div>
      </div>
      {a.blocker && (
        <div className="mt-4 rounded-lg border border-ax-down/40 bg-ax-down/10 px-4 py-3">
          <p className="text-[#ffb0bd] text-[11px] uppercase tracking-widest mb-1">Track A blocker</p>
          <p className="text-ax-text/90 text-xs leading-relaxed">{a.blocker}</p>
        </div>
      )}
    </Card>
  )
}

function TransferMatrix({ a }: { a: TrackA }) {
  const cellFor = (family: string, symbol: string) =>
    a.evalCells.find((c) => c.family === family && c.symbol === symbol)

  return (
    <Card
      title="Tibot transfer classification"
      subtitle="promoted family × expansion target — GENERAL_TRANSFER_PASS / CALIBRATION_REQUIRED / SYMBOL_TUNING_REQUIRED / NOT_APPLICABLE"
      right={
        <div className="flex items-center gap-2 text-[10px] text-ax-muted">
          {a.classifications.map((c) => (
            <span key={c} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: CLS_COLOR[c] }} />
              {c.split('_')[0]}
            </span>
          ))}
        </div>
      }
    >
      {a.evalCellCount === 0 && (
        <div className="mb-3 rounded-md border border-ax-border/60 bg-white/[0.02] px-3 py-2 text-[11px] text-ax-muted">
          No evaluation cells on disk yet — every (target × family) is <span className="text-ax-text">PENDING</span>.
          Classifications populate only from real eval-cell files once Sublime provisions data and Sentinel passes the data gate.
        </div>
      )}
      <div className="overflow-x-auto ax-scroll">
        <table className="w-full border-separate border-spacing-y-1 text-xs">
          <thead>
            <tr className="text-ax-muted text-[10px] uppercase tracking-widest">
              <th className="text-left font-normal px-2 py-1 sticky left-0">Family</th>
              <th className="text-left font-normal px-2 py-1">Type</th>
              {a.expansionTargets.map((s) => (
                <th key={s} className="text-center font-normal px-2 py-1">
                  {sym(s)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a.families.map((f) => (
              <tr key={f.family}>
                <td className="px-2 py-1.5 sticky left-0">
                  <div className="font-display text-sm text-ax-text tracking-wide">{f.family}</div>
                  <div className="text-ax-muted/70 text-[10px]">{f.timeframes.join(' · ') || '—'}</div>
                </td>
                <td className="px-2 py-1.5">
                  <Pill color={f.cls === 'prediction' ? AX.violet : AX.blue2}>{f.cls}</Pill>
                </td>
                {a.expansionTargets.map((s) => {
                  const cell = cellFor(f.family, s)
                  const disp = cell?.disposition ?? 'PENDING'
                  const color = CLS_COLOR[disp] ?? AX.muted
                  return (
                    <td key={s} className="px-1.5 py-1.5 text-center">
                      <span
                        className="inline-block rounded-md px-2 py-1 text-[9px] font-mono uppercase tracking-wide"
                        style={{
                          color: disp === 'PENDING' ? AX.muted : '#07101f',
                          background: disp === 'PENDING' ? 'transparent' : color,
                          border: disp === 'PENDING' ? `1px dashed ${AX.muted}55` : 'none',
                        }}
                        title={cell ? cell.file : 'no eval cell yet'}
                      >
                        {disp === 'PENDING' ? '—' : disp.split('_')[0]}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-ax-muted/60 text-[10px] mt-3">
        Calibration status flows per family: general-model transfer → cluster calibration → symbol-specific tuning →
        not-applicable, decided on OOS walk-forward with bootstrap CIs.
      </p>
    </Card>
  )
}

function KarenSection({ e }: { e: TrackE }) {
  if (!e.present || (!e.consensus && !e.discovery)) {
    return (
      <Card title="Karen context" subtitle="advisory positioning / consensus (Track E)">
        <AwaitingData title="Karen has not produced a cycle yet" />
      </Card>
    )
  }
  const mc = e.consensus?.market_context
  return (
    <>
      <Card
        title="Karen market context"
        subtitle="advisory only — does not enter the frozen Track D universe"
        right={<Pill color={AX.violet}>advisory</Pill>}
      >
        {mc && (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <Mini label="Regime" value={mc.regime} />
            <Mini label="Bias" value={mc.bias} tone={mc.bias.includes('long') ? AX.up : AX.muted} />
            <Mini label="Confidence" value={`${(mc.confidence * 100).toFixed(0)}%`} />
            <Mini label="Consensus conf." value={`${(mc.consensus_confidence * 100).toFixed(0)}%`} />
            <Mini label="Breadth (pos)" value={`${(mc.breadth.positive_ratio * 100).toFixed(1)}%`} sub={`${mc.breadth.positive_count}/${mc.breadth.tradable_count}`} />
          </div>
        )}
      </Card>

      {e.consensus && (
        <Card title="Top-trader consensus" subtitle={`Karen positioning read · ${e.consensus.top_trader_consensus.length} symbols`}>
          <ConsensusTable rows={e.consensus.top_trader_consensus} />
        </Card>
      )}

      {e.discovery && <Watchlist d={e.discovery} />}
    </>
  )
}

function Mini({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-ax-border/70 bg-white/[0.02] px-3 py-2">
      <div className="text-ax-muted text-[10px] uppercase tracking-widest">{label}</div>
      <div className="font-display text-sm mt-0.5 tracking-wide" style={{ color: tone }}>
        {value}
      </div>
      {sub && <div className="text-ax-muted/70 text-[10px] font-mono">{sub}</div>}
    </div>
  )
}

const CROWD_COLOR: Record<string, string> = { high: '#ff5470', medium: '#ffb454', low: '#1ec8a5' }

function ConsensusTable({ rows }: { rows: ConsensusRow[] }) {
  return (
    <div className="overflow-x-auto ax-scroll max-h-[420px]">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-ax-bg-2">
          <tr className="text-ax-muted uppercase tracking-widest text-[10px]">
            {['#', 'Symbol', '1h', '4h', '1d', 'Vol $M', 'Crowding', 'Regime', 'Phase'].map((h) => (
              <th key={h} className="text-left font-normal px-2 py-1.5 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.symbol} className="border-b border-ax-border/30 hover:bg-white/[0.02]" title={r.notes}>
              <td className="px-2 py-1 text-ax-muted font-mono">{r.rank}</td>
              <td className="px-2 py-1 text-ax-text font-display">{sym(r.symbol)}</td>
              <Pc v={r.pct_1h} />
              <Pc v={r.pct_4h} />
              <Pc v={r.pct_1d} />
              <td className="px-2 py-1 text-ax-muted font-mono">{r.vol_usd_24h_m}</td>
              <td className="px-2 py-1">
                <span className="font-mono uppercase text-[10px]" style={{ color: CROWD_COLOR[r.crowding] ?? AX.muted }}>
                  {r.crowding}
                </span>
              </td>
              <td className="px-2 py-1 text-ax-muted">{r.directional_regime}</td>
              <td className="px-2 py-1 text-ax-muted">{r.momentum_phase}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Pc({ v }: { v: number }) {
  return (
    <td className="px-2 py-1 font-mono" style={{ color: v >= 0 ? AX.up : AX.down }}>
      {v >= 0 ? '+' : ''}
      {v}%
    </td>
  )
}

const PRIO_COLOR: Record<string, string> = { high: '#ff5470', medium: '#ffb454', low: '#6b7a96' }

function Watchlist({ d }: { d: NonNullable<TrackE['discovery']> }) {
  return (
    <Card
      title="Breakout / reversal watchlist"
      subtitle="Karen discovery candidates — research only"
      right={<span className="text-ax-muted text-[10px]">{d.track_d_interference.split('—')[0].trim()}</span>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {d.discovery_candidates.map((c: DiscoveryCandidate) => (
          <div key={c.symbol} className="rounded-xl border border-ax-border/70 bg-white/[0.02] p-3.5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-display text-sm text-ax-text tracking-wide">{sym(c.symbol)}</span>
              <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: PRIO_COLOR[c.research_priority] }}>
                {c.research_priority}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {c.discovery_type.map((t) => (
                <Pill key={t} color={AX.violet}>
                  {t}
                </Pill>
              ))}
            </div>
            <div className="flex gap-3 text-[11px] font-mono mb-2">
              <span style={{ color: c.pct_1h >= 0 ? AX.up : AX.down }}>1h {c.pct_1h}%</span>
              <span style={{ color: c.pct_4h >= 0 ? AX.up : AX.down }}>4h {c.pct_4h}%</span>
              <span style={{ color: c.pct_1d >= 0 ? AX.up : AX.down }}>1d {c.pct_1d}%</span>
              <span className="text-ax-muted">${c.vol_usd_24h_m}M</span>
            </div>
            <p className="text-ax-muted text-[11px] leading-relaxed">{c.signal}</p>
            <p className="text-ax-muted/70 text-[10px] mt-2 border-t border-ax-border/40 pt-1.5">
              <span className="uppercase tracking-widest">watch:</span> {c.watch_for}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
