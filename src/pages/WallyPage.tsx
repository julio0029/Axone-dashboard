import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../components/Card'
import { WallyChart } from '../components/WallyChart'
import {
  WALLY_SYMBOLS, useWallyIndex, useWallySymbol, applyFilters, summarize,
  exitReasonLabel, type WallySym, type WallyTrade, type Filters,
} from '../data/wallyTrades'

// ── formatting helpers ──────────────────────────────────────────────────────
const na = (v: number | null | undefined, d = 2, suf = '') =>
  v == null || Number.isNaN(v) ? 'N/A' : `${v.toFixed(d)}${suf}`
const price = (v: number | null | undefined) =>
  v == null ? 'N/A' : v >= 1 ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v.toPrecision(4)
const pct = (v: number | null | undefined, d = 1) =>
  v == null || Number.isNaN(v) ? 'N/A' : `${(v * 100).toFixed(d)}%`
const dtUTC = (ms: number) => {
  const d = new Date(ms), p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
}
const dur = (min: number | null) => min == null ? 'N/A' : min >= 1440 ? `${(min / 1440).toFixed(1)}d` : min >= 60 ? `${(min / 60).toFixed(1)}h` : `${min}m`
const dayStr = (ms: number) => new Date(ms).toISOString().slice(0, 10)

type SortKey =
  | 'entry_ts' | 'exit_ts' | 'direction' | 'entry_price' | 'exit_price' | 'hold_minutes'
  | 'conviction' | 'pnl_gross' | 'cost_bps' | 'pnl_net' | 'mfe' | 'mae' | 'mfe_capture'
  | 'entry_eff' | 'exit_eff'

const accessor: Record<SortKey, (t: WallyTrade) => number | string | null> = {
  entry_ts: (t) => t.entry_ts, exit_ts: (t) => t.exit_ts, direction: (t) => t.direction,
  entry_price: (t) => t.entry_price, exit_price: (t) => t.exit_price, hold_minutes: (t) => t.hold_minutes,
  conviction: (t) => t.conviction, pnl_gross: (t) => t.pnl_gross, cost_bps: (t) => t.cost_bps,
  pnl_net: (t) => t.pnl_net, mfe: (t) => t.mfe, mae: (t) => t.mae, mfe_capture: (t) => t.mfe_capture,
  entry_eff: (t) => t.oracle.entry_efficiency, exit_eff: (t) => t.oracle.exit_efficiency,
}

const COLS: { key: SortKey; label: string; render: (t: WallyTrade) => string; cls?: (t: WallyTrade) => string }[] = [
  { key: 'direction', label: 'Dir', render: (t) => t.direction, cls: (t) => t.direction === 'LONG' ? 'text-ax-up' : 'text-ax-down' },
  { key: 'entry_ts', label: 'Entry (UTC)', render: (t) => dtUTC(t.entry_ts) },
  { key: 'entry_price', label: 'Entry px', render: (t) => price(t.entry_price) },
  { key: 'exit_ts', label: 'Exit (UTC)', render: (t) => dtUTC(t.exit_ts) },
  { key: 'exit_price', label: 'Exit px', render: (t) => price(t.exit_price) },
  { key: 'hold_minutes', label: 'Dur', render: (t) => dur(t.hold_minutes) },
  { key: 'conviction', label: 'Conv', render: (t) => na(t.conviction, 2) },
  { key: 'pnl_gross', label: 'Gross', render: (t) => na(t.pnl_gross, 1) },
  { key: 'cost_bps', label: 'Cost', render: (t) => na(t.cost_bps, 0) },
  { key: 'pnl_net', label: 'Net', render: (t) => na(t.pnl_net, 1), cls: (t) => (t.pnl_net ?? 0) > 0 ? 'text-ax-up' : 'text-ax-down' },
  { key: 'mfe', label: 'MFE', render: (t) => na(t.mfe, 1) },
  { key: 'mae', label: 'MAE', render: (t) => na(t.mae, 1) },
  { key: 'mfe_capture', label: 'Capture', render: (t) => na(t.mfe_capture, 2) },
  { key: 'entry_eff', label: 'Ent.eff', render: (t) => na(t.oracle.entry_efficiency, 2) },
  { key: 'exit_eff', label: 'Ex.eff', render: (t) => na(t.oracle.exit_efficiency, 2) },
]

export function WallyPage() {
  const index = useWallyIndex()
  const [sym, setSym] = useState<WallySym>('BTCUSDT')
  const variant = index?.variants[0]?.id ?? 'baseline_0.05'
  const { status, data, error } = useWallySymbol(sym, variant)

  const [dir, setDir] = useState<Filters['direction']>('ALL')
  const [outcome, setOutcome] = useState<Filters['outcome']>('ALL')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [convMin, setConvMin] = useState<string>('')
  const [convMax, setConvMax] = useState<string>('')
  const [exitReason, setExitReason] = useState<string>('ALL')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'entry_ts', dir: 'asc' })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const trades: WallyTrade[] = data?.trades ?? []
  const exitReasons = useMemo(
    () => Array.from(new Set(trades.map(exitReasonLabel))).sort(),
    [trades],
  )

  const filters: Filters = {
    variant, symbol: sym,
    dateFrom: dateFrom ? Date.parse(dateFrom + 'T00:00:00Z') : null,
    dateTo: dateTo ? Date.parse(dateTo + 'T23:59:59Z') : null,
    direction: dir, outcome,
    convMin: convMin ? Number(convMin) : null,
    convMax: convMax ? Number(convMax) : null,
    exitReason,
  }
  const filtered = useMemo(() => applyFilters(trades, filters), [trades, JSON.stringify(filters)])
  const sorted = useMemo(() => {
    const acc = accessor[sort.key]
    return [...filtered].sort((a, b) => {
      const av = acc(a), bv = acc(b)
      if (av == null) return 1
      if (bv == null) return -1
      const r = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sort.dir === 'asc' ? r : -r
    })
  }, [filtered, sort])

  const summary = useMemo(() => summarize(filtered, data?.provenance.ohlcv_bars ?? 0), [filtered, data])
  const selected = useMemo(() => trades.find((t) => t.id === selectedId) ?? null, [trades, selectedId])

  // reset selection & filters bounds when symbol changes
  useEffect(() => { setSelectedId(null) }, [sym])

  // table row refs for scroll-on-select (chart → table)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})
  useEffect(() => {
    if (selectedId && rowRefs.current[selectedId]) {
      rowRefs.current[selectedId]!.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedId])

  const toggleSort = (key: SortKey) =>
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'entry_ts' ? 'asc' : 'desc' })

  return (
    <div className="space-y-5 max-w-[1800px] mx-auto">
      {/* ── header + mandatory labels ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl tracking-tight ax-glow-text">Wally · Trade Research</h1>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-widest border border-[#ffb454]/50 bg-[#ffb454]/10 text-[#ffb454]">
              Wally Historical Research
            </span>
          </div>
          <p className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-md border border-ax-down/40 bg-ax-down/10 text-ax-down text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-ax-down animate-pulse" />
            Historical simulation only — no live / paper trades executed
          </p>
          <p className="text-ax-muted mt-2 text-sm max-w-[860px] leading-relaxed">
            Every completed Wally decision from the {variant} walk, overlaid on canonical 5-minute OHLCV.
            Prices &amp; efficiency are Oracle's retrospective evaluation; P&amp;L / MFE / MAE / costs are
            <span className="text-ax-text"> returns in basis points (bps)</span>, not position-sized currency.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-ax-muted">variant</div>
          <select
            value={variant} disabled
            className="mt-1 bg-ax-bg-2/70 border border-ax-border/70 rounded-md px-3 py-1.5 text-sm font-mono text-ax-text"
          >
            {(index?.variants?.length ? index.variants : [{ id: variant, label: variant }]).map((v) => (
              <option key={v.id} value={v.id}>{v.label ?? v.id}</option>
            ))}
          </select>
          <div className="text-[10px] text-ax-muted mt-1 max-w-[200px]">
            first-class dimension — future portfolio variants slot in here
          </div>
        </div>
      </div>

      {/* ── summary metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Trades" value={summary.count.toLocaleString()} sub={`${summary.longs}L / ${summary.shorts}S`} />
        <Stat label="Hit rate" value={pct(summary.hitRate)} sub="net > 0" />
        <Stat label="Cum. net" value={na(summary.cumNet, 0, ' bps')} accent={summary.cumNet >= 0 ? 'up' : 'down'} />
        <Stat label="Mean / median net" value={`${na(summary.meanNet, 1)} / ${na(summary.medianNet, 1)}`} sub="bps" />
        <Stat label="Mean MFE / MAE" value={`${na(summary.meanMfe, 1)} / ${na(summary.meanMae, 1)}`} sub="bps" />
        <Stat label="Median capture" value={na(summary.medianMfeCapture, 2)} sub="MFE capture" />
        <Stat label="Avg hold" value={dur(summary.avgHoldMin != null ? Math.round(summary.avgHoldMin) : null)} />
        <Stat label="Turnover" value={na(summary.turnoverPerDay, 2, '/day')} />
        <Stat label="Capital util." value={pct(summary.utilization)} sub="bars in position" />
      </div>

      {/* ── filters ── */}
      <Card title="Filters" bodyClass="!py-3">
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3 text-sm">
          <Field label="Symbol">
            <select value={sym} onChange={(e) => setSym(e.target.value as WallySym)} className={selCls}>
              {WALLY_SYMBOLS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Direction">
            <Seg value={dir} onChange={setDir} options={['ALL', 'LONG', 'SHORT']} />
          </Field>
          <Field label="Outcome">
            <Seg value={outcome} onChange={setOutcome} options={['ALL', 'WIN', 'LOSS']} />
          </Field>
          <Field label="From">
            <input type="date" value={dateFrom} min={data ? dayStr(trades[0]?.entry_ts ?? 0) : undefined}
              onChange={(e) => setDateFrom(e.target.value)} className={selCls} />
          </Field>
          <Field label="To">
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={selCls} />
          </Field>
          <Field label="Conviction ≥">
            <input type="number" step="0.1" value={convMin} placeholder="min" onChange={(e) => setConvMin(e.target.value)} className={`${selCls} w-20`} />
          </Field>
          <Field label="Conviction ≤">
            <input type="number" step="0.1" value={convMax} placeholder="max" onChange={(e) => setConvMax(e.target.value)} className={`${selCls} w-20`} />
          </Field>
          <Field label="Exit reason">
            <select value={exitReason} onChange={(e) => setExitReason(e.target.value)} className={selCls}>
              <option value="ALL">ALL</option>
              {exitReasons.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <button
            onClick={() => { setDir('ALL'); setOutcome('ALL'); setDateFrom(''); setDateTo(''); setConvMin(''); setConvMax(''); setExitReason('ALL') }}
            className="text-xs text-ax-muted hover:text-ax-text border border-ax-border/70 rounded-md px-3 py-1.5 transition"
          >clear</button>
          <div className="text-xs text-ax-muted ml-auto">
            showing <span className="text-ax-text font-mono">{filtered.length.toLocaleString()}</span> / {trades.length.toLocaleString()} trades
          </div>
        </div>
      </Card>

      {/* ── chart ── */}
      <Card
        title={`${sym} · 5m OHLCV · Wally trades`}
        subtitle={data ? `${data.provenance.ohlcv_bars.toLocaleString()} bars · ${data.provenance.window_start.slice(0, 10)} → ${data.provenance.window_end.slice(0, 10)} UTC` : 'loading…'}
        right={<Legend />}
      >
        {status === 'loading' && <div className="py-20 text-center text-ax-muted text-sm animate-pulse">Loading {sym}…</div>}
        {status === 'error' && (
          <div className="rounded-xl border border-dashed border-ax-down/40 bg-ax-bg-2/40 px-5 py-6">
            <div className="text-ax-down text-sm font-medium">Load error</div>
            <p className="text-ax-muted text-xs font-mono mt-1">{error}</p>
          </div>
        )}
        {status === 'ready' && data && (
          <WallyChart ohlcv={data.ohlcv} trades={filtered} selectedId={selectedId} onPick={setSelectedId} height={580} />
        )}
      </Card>

      {/* ── decision context ── */}
      {selected && <DecisionContext trade={selected} onClose={() => setSelectedId(null)} />}

      {/* ── trade table ── */}
      <Card
        title="Trades"
        subtitle="Click a row to focus it on the chart · click a chart marker to jump here"
        right={<span className="text-[10px] uppercase tracking-wide text-ax-muted">{sorted.length.toLocaleString()} rows</span>}
      >
        <div className="overflow-auto ax-scroll max-h-[520px]">
          <table className="w-full text-[11px] font-mono border-collapse">
            <thead className="sticky top-0 bg-ax-panel z-10">
              <tr className="border-b border-ax-border/60 text-ax-muted">
                {COLS.map((c) => (
                  <th key={c.key} onClick={() => toggleSort(c.key)}
                    className="text-left py-2 px-2 font-normal cursor-pointer hover:text-ax-text whitespace-nowrap select-none">
                    {c.label}{sort.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
                <th className="text-left py-2 px-2 font-normal whitespace-nowrap">Exit reason</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => {
                const isSel = t.id === selectedId
                return (
                  <tr
                    key={t.id}
                    ref={(el) => { rowRefs.current[t.id] = el }}
                    onClick={() => setSelectedId(isSel ? null : t.id)}
                    className={`border-b border-ax-border/20 cursor-pointer transition ${isSel ? 'bg-[#ffd24d]/10 ring-1 ring-[#ffd24d]/40' : 'hover:bg-white/[0.03]'}`}
                  >
                    {COLS.map((c) => (
                      <td key={c.key} className={`py-1.5 px-2 whitespace-nowrap ${c.cls?.(t) ?? 'text-ax-text'}`}>{c.render(t)}</td>
                    ))}
                    <td className="py-1.5 px-2 whitespace-nowrap text-ax-muted">{exitReasonLabel(t)}</td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={COLS.length + 1} className="py-8 text-center text-ax-muted">No trades match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── provenance ── */}
      {data && (
        <Card title="Provenance & data gaps" subtitle="All sources read-only; every join asserted 1:1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5 font-mono text-ax-muted leading-relaxed">
              <Prov k="Variant" v={data.variant} />
              <Prov k="Trades" v={`${data.provenance.trade_count.toLocaleString()} (${data.provenance.ledger_matched.toLocaleString()} ledger-matched)`} />
              <Prov k="Oracle (prices/eff)" v={data.provenance.oracle_source} />
              <Prov k="Trades (P&L bps)" v={data.provenance.trades_source} />
              <Prov k="Ledger (conviction)" v={data.provenance.ledger_source} />
              <Prov k="OHLCV" v={`${data.provenance.ohlcv_source} · ${data.provenance.ohlcv_bars.toLocaleString()} bars`} />
              <Prov k="Oracle sha256" v={data.provenance.oracle_sha256_head.slice(0, 24) + '…'} />
              <Prov k="Ledger sha256" v={data.provenance.ledger_sha256_head.slice(0, 24) + '…'} />
            </div>
            <div className="space-y-2 text-ax-muted leading-relaxed">
              <p className="text-ax-text font-medium">Known gaps (reported, not fabricated)</p>
              <p>· <span className="text-ax-text">Tibot per-family evidence</span> at each historical entry is <span className="text-ax-down">not available</span> — the accessible Tibot forward-prediction ledger covers only the live-forward window (2026-08-21+), not this backtest walk. Shown as "not recorded" in the decision panel.</p>
              <p>· <span className="text-ax-text">Exit reason</span> is recorded only as a matched signal exit (EXIT_LONG / EXIT_SHORT); a finer stop / target / timeout cause is not in the ledger.</p>
              <p>· A finer <span className="text-ax-text">exit-reason taxonomy</span> and per-trade Tibot attribution would need new evidence from Wally / Tibot; Guy will not synthesise it.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// ── sub-components ───────────────────────────────────────────────────────────
const selCls = 'bg-ax-bg-2/70 border border-ax-border/70 rounded-md px-2.5 py-1.5 text-sm font-mono text-ax-text focus:outline-none focus:border-ax-blue/50'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-ax-muted">{label}</span>
      {children}
    </label>
  )
}

function Seg<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: T[] }) {
  return (
    <div className="flex rounded-md overflow-hidden border border-ax-border/70">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-2.5 py-1.5 text-xs font-mono transition ${o === value ? 'bg-ax-blue/20 text-ax-text' : 'text-ax-muted hover:text-ax-text hover:bg-white/5'}`}>
          {o}
        </button>
      ))}
    </div>
  )
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'up' | 'down' }) {
  return (
    <div className="ax-card px-4 py-3">
      <div className="text-[10px] uppercase tracking-wide text-ax-muted">{label}</div>
      <div className={`text-lg font-mono mt-0.5 ${accent === 'up' ? 'text-ax-up' : accent === 'down' ? 'text-ax-down' : 'text-ax-text'}`}>{value}</div>
      {sub && <div className="text-[10px] text-ax-muted mt-0.5">{sub}</div>}
    </div>
  )
}

function Legend() {
  const items: [string, string][] = [
    ['LONG entry', '#1ec8a5'], ['LONG exit', '#ffb454'], ['SHORT entry', '#ff5470'], ['SHORT exit', '#4dd2ff'],
  ]
  return (
    <div className="flex items-center gap-3 text-[10px] text-ax-muted flex-wrap justify-end">
      {items.map(([l, c]) => (
        <span key={l} className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: c }} />{l}</span>
      ))}
    </div>
  )
}

function Prov({ k, v }: { k: string; v: string }) {
  return <div className="flex gap-2 break-all"><span className="text-ax-muted/70 min-w-[130px]">{k}</span><span className="text-ax-blue-2">{v}</span></div>
}

function DecisionContext({ trade, onClose }: { trade: WallyTrade; onClose: () => void }) {
  const o = trade.oracle
  const premature = o.optimal_exit_delay_bars != null && o.optimal_exit_delay_bars > 0
  return (
    <Card
      title={`Decision context · ${trade.id}`}
      subtitle="The evidence Wally acted on, plus Oracle's retrospective read"
      right={<button onClick={onClose} className="text-xs text-ax-muted hover:text-ax-text">close ✕</button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Wally */}
        <div>
          <SectionHead color="#2f9bff" title="Wally · what it had at entry" />
          <dl className="text-xs font-mono space-y-1">
            <Row k="Direction" v={trade.direction} vcls={trade.direction === 'LONG' ? 'text-ax-up' : 'text-ax-down'} />
            <Row k="Regime" v={trade.regime ?? 'N/A'} />
            <Row k="Conviction (dom_w)" v={na(trade.conviction, 4)} />
            <Row k="Opposing (opp_w)" v={na(trade.opp_w, 4)} />
            <Row k="Vote margin" v={na(trade.vote_margin, 4)} />
            <Row k="ENTER decision" v={`ENTER_${trade.direction}`} />
            <Row k="HOLD decisions in trade" v={trade.hold_decisions != null ? String(trade.hold_decisions) : 'N/A — not recorded'} />
            <Row k="EXIT decision" v={trade.exit_decision ?? 'N/A — not recorded'} />
            <Row k="Exit type" v={trade.exit_type ?? 'N/A'} />
          </dl>
        </div>

        {/* Tibot */}
        <div>
          <SectionHead color="#c77dff" title="Tibot · per-family evidence" />
          <div className="rounded-lg border border-dashed border-ax-border/70 bg-ax-bg-2/40 p-3 text-xs text-ax-muted leading-relaxed">
            <p className="text-ax-text mb-1.5">Not available for this trade.</p>
            <p>The accessible Tibot forward-prediction ledger covers only the live-forward window (2026-08-21 onward); it does not carry the historical-walk predictions Wally consumed at this entry. Nothing is fabricated here.</p>
            <div className="mt-2 grid grid-cols-4 gap-1">
              {['5m', '1h', '4h', '1d'].map((tf) => (
                <div key={tf} className="text-center rounded border border-ax-border/50 py-1">
                  <div className="text-ax-text/70">{tf}</div>
                  <div className="text-[10px] text-ax-muted">no data</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Oracle */}
        <div>
          <SectionHead color="#ffb454" title="Oracle · retrospective" />
          <p className="text-[10px] uppercase tracking-wide text-ax-down mb-1.5">Retrospective — not available to Wally at decision time</p>
          <dl className="text-xs font-mono space-y-1">
            <Row k="Entry efficiency" v={na(o.entry_efficiency, 3)} />
            <Row k="Exit efficiency" v={na(o.exit_efficiency, 3)} />
            <Row k="MFE capture ratio" v={na(o.mfe_capture_ratio, 3)} />
            <Row k="Optimal direction" v={o.optimal_direction ?? 'N/A'} vcls={o.optimal_direction === trade.direction ? 'text-ax-up' : 'text-ax-down'} />
            <Row k="Optimal entry delay" v={o.optimal_entry_delay_bars != null ? `${o.optimal_entry_delay_bars} bars` : 'N/A'} />
            <Row k="Optimal exit delay" v={o.optimal_exit_delay_bars != null ? `${o.optimal_exit_delay_bars} bars ${premature ? '(exited early)' : ''}` : 'N/A'} />
            <Row k="Counterfactual P&L" v={na(o.cf_pnl_bps, 1, ' bps')} />
            <Row k="Missed upside" v={na(o.missed_upside, 1, ' bps')} />
            <Row k="Missed downside" v={na(o.missed_downside, 1, ' bps')} />
            <Row k="Decision-quality score" v={na(o.decision_quality_score, 1)} />
            <Row k="Net score" v={na(o.net_score, 1)} />
          </dl>
        </div>
      </div>
    </Card>
  )
}

function SectionHead({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-sm font-display text-ax-text">{title}</span>
    </div>
  )
}

function Row({ k, v, vcls }: { k: string; v: string; vcls?: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ax-border/20 py-0.5">
      <dt className="text-ax-muted">{k}</dt>
      <dd className={vcls ?? 'text-ax-text'}>{v}</dd>
    </div>
  )
}
