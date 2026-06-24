import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { SandboxChart } from '../components/SandboxChart'
import {
  KERRY_SYMBOLS, KERRY_TIMEFRAMES, KERRY_PROVENANCE_PATH,
  availableTfs, useKerryExport,
  type KerrySym, type KerryTf, type KerryProvenance,
} from '../data/kerryV3'
import type { V3Role } from '../data/taV3Export'

const ROLE_DOT: Record<V3Role, string> = {
  price: 'bg-ax-up',
  overlay: 'bg-ax-blue',
  oscillator: 'bg-[#c77dff]',
  volume: 'bg-[#ffb454]',
  marker: 'bg-ax-down',
  meta: 'bg-ax-border',
}

const DEFAULT_ON = [
  'open', 'high', 'low', 'close', 'volume',
  'ema_50', 'bolinger_upper', 'bolinger_sma', 'bolinger_lower',
  'rsi', 'gann_swing',
]

const fmt = (n: number) =>
  n >= 1 ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : n.toPrecision(4)

export function KerryPage() {
  const [sym, setSym] = useState<KerrySym>('BTCUSDT')
  const [tf, setTf] = useState<KerryTf>('1h')
  const [query, setQuery] = useState('')
  const [enabled, setEnabled] = useState<Set<string> | null>(null)
  const [prov, setProv] = useState<KerryProvenance | null>(null)

  // Reset TF to 1h when switching to DOGE if 4h/1D selected
  useEffect(() => {
    if (sym === 'DOGEUSDT' && (tf === '4h' || tf === '1D')) setTf('1h')
  }, [sym, tf])

  useEffect(() => {
    fetch(KERRY_PROVENANCE_PATH, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setProv)
      .catch(() => setProv(null))
  }, [])

  const { status, data, error } = useKerryExport(sym, tf)

  const allCols = useMemo(() => (data ? data.manifest.columns : []), [data])

  const sel = useMemo(() => {
    if (enabled) return enabled
    const have = new Set(allCols.map((c) => c.name))
    return new Set(DEFAULT_ON.filter((n) => have.has(n)))
  }, [enabled, allCols])

  const toggle = (name: string) =>
    setEnabled(() => {
      const n = new Set(sel)
      n.has(name) ? n.delete(name) : n.add(name)
      return n
    })

  const setMany = (names: string[], on: boolean) =>
    setEnabled(() => {
      const n = new Set(sel)
      for (const name of names) on ? n.add(name) : n.delete(name)
      return n
    })

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const order: string[] = []
    const map: Record<string, { label: string; cols: typeof allCols }> = {}
    for (const c of allCols) {
      if (!map[c.group]) { map[c.group] = { label: c.groupLabel, cols: [] }; order.push(c.group) }
      if (!q || c.name.toLowerCase().includes(q)) map[c.group].cols.push(c)
    }
    return order.map((k) => ({ key: k, ...map[k] })).filter((g) => g.cols.length > 0)
  }, [allCols, query])

  const last = useMemo(() => {
    if (!data) return null
    const i = data.time.length - 1
    const c = data.columns
    return {
      open: c.open?.[i] as number,
      high: c.high?.[i] as number,
      low: c.low?.[i] as number,
      close: c.close?.[i] as number,
      volume: c.volume?.[i] as number,
      chg: ((c.close?.[i] as number) - (c.close?.[i - 1] as number)) / (c.close?.[i - 1] as number) * 100,
    }
  }, [data])

  const m = data?.manifest

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto">
      {/* ── header ── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight ax-glow-text">Kerry · TA-v3 Indicators</h1>
          <p className="text-ax-muted mt-1 text-sm">
            Chronos-certified Technical_analysis_v3 for all 10 symbols across 5m / 1h / 4h / 1D.
            150 columns, dual hash-gate verified, nothing recomputed client-side.
          </p>
          <p className="text-xs mt-2 flex items-center gap-2 flex-wrap">
            {status === 'ready' ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-ax-up/30 bg-[#1ec8a5]/10 text-ax-up">
                <span className="w-1.5 h-1.5 rounded-full bg-ax-up" />
                REAL · certified TA-v3 · sha256-verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-ax-border bg-white/5 text-ax-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-ax-muted" /> {status}
              </span>
            )}
          </p>
          {m && (
            <p className="text-[11px] mt-1.5 text-ax-muted leading-relaxed max-w-[680px]">
              {m.rows.toLocaleString()} of {m.canonicalRows.toLocaleString()} canonical {tf} rows
              (tail window) · {m.windowStart} → {m.windowEnd} UTC · {m.columnCount} certified columns.
            </p>
          )}
        </div>
        {last && (
          <div className="text-right font-mono">
            <div className="text-2xl text-ax-text">${fmt(last.close)}</div>
            <div className={`text-sm ${last.chg >= 0 ? 'text-ax-up' : 'text-ax-down'}`}>
              {last.chg >= 0 ? '▲' : '▼'} {Math.abs(last.chg).toFixed(2)}%
            </div>
          </div>
        )}
      </div>

      {/* ── main layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        {/* Left: symbol + TF + last OHLCV */}
        <div className="space-y-4">
          <Card title="Symbol" bodyClass="!p-2">
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto ax-scroll">
              {KERRY_SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSym(s)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-mono transition ${
                    s === sym
                      ? 'bg-ax-blue/15 text-ax-text ax-glow'
                      : 'text-ax-muted hover:text-ax-text hover:bg-white/5'
                  }`}
                >
                  {s.replace('USDT', '')}
                  <span className="text-ax-muted/50 text-[10px]">USDT</span>
                </button>
              ))}
            </div>
          </Card>
          <Card title="Timeframe" bodyClass="!p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {KERRY_TIMEFRAMES.map((t) => {
                const avail = availableTfs(sym).includes(t)
                return (
                  <button
                    key={t}
                    onClick={() => avail && setTf(t)}
                    disabled={!avail}
                    className={`py-1.5 rounded-md text-sm font-mono transition ${
                      !avail
                        ? 'text-ax-muted/30 cursor-not-allowed'
                        : t === tf
                        ? 'bg-ax-blue/15 text-ax-text ax-glow'
                        : 'text-ax-muted hover:text-ax-text hover:bg-white/5'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </Card>
          {last && (
            <Card title="Last candle" bodyClass="!p-3">
              <dl className="text-sm font-mono space-y-1">
                {([['O', last.open], ['H', last.high], ['L', last.low], ['C', last.close]] as const).map(
                  ([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <dt className="text-ax-muted">{k}</dt>
                      <dd className="text-ax-text">{fmt(v)}</dd>
                    </div>
                  ),
                )}
                <div className="flex justify-between border-t border-ax-border/60 pt-1">
                  <dt className="text-ax-muted">Vol</dt>
                  <dd className="text-ax-text">
                    {last.volume >= 1_000_000
                      ? `${(last.volume / 1_000_000).toFixed(2)}M`
                      : last.volume >= 1000
                      ? `${(last.volume / 1000).toFixed(1)}k`
                      : last.volume.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </Card>
          )}
        </div>

        {/* Right: chart + column selector */}
        <Card
          title={`${sym} · ${tf} · TA-v3`}
          subtitle={
            status === 'ready' && m
              ? `${m.rows.toLocaleString()} of ${m.canonicalRows.toLocaleString()} rows · ${m.columnCount} columns`
              : `Certified Chronos TA-v3 · ${sym} ${tf}`
          }
          right={
            status === 'ready' ? (
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border text-ax-up bg-[#1ec8a5]/10 border-[#1ec8a5]/30">
                certified v3
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border text-ax-muted bg-white/[0.03] border-ax-border">
                {status}
              </span>
            )
          }
        >
          {status === 'loading' && (
            <div className="py-16 text-center text-ax-muted text-sm animate-pulse">
              Loading {sym} {tf}…
            </div>
          )}
          {status === 'absent' && (
            <div className="rounded-xl border border-dashed border-ax-border/70 bg-ax-bg-2/40 px-5 py-6">
              <div className="text-ax-text text-sm font-medium">{sym} {tf} — no export available.</div>
              <p className="text-ax-muted text-sm mt-1">This timeframe has no certified data for this symbol.</p>
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-xl border border-dashed border-ax-down/40 bg-ax-bg-2/40 px-5 py-6">
              <div className="text-ax-down text-sm font-medium">Load error</div>
              <p className="text-ax-muted text-xs font-mono mt-1">{error}</p>
            </div>
          )}
          {status === 'ready' && data && m && (
            <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
              {/* Column selector */}
              <div className="space-y-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="filter 150 columns…"
                  className="w-full px-3 py-2 rounded-lg bg-ax-bg-2/70 border border-ax-border/70 text-sm text-ax-text placeholder:text-ax-muted focus:outline-none focus:border-ax-blue/50"
                />
                <div className="flex items-center justify-between text-[11px] text-ax-muted">
                  <span><span className="text-ax-text font-mono">{sel.size}</span> / {allCols.length} selected</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEnabled(new Set(allCols.map((c) => c.name)))} className="hover:text-ax-text transition">all</button>
                    <span className="text-ax-border">·</span>
                    <button onClick={() => setEnabled(new Set())} className="hover:text-ax-text transition">clear</button>
                  </div>
                </div>
                <div className="max-h-[560px] overflow-y-auto ax-scroll space-y-3 pr-1">
                  {groups.map((g) => {
                    const names = g.cols.map((c) => c.name)
                    const onCount = names.filter((n) => sel.has(n)).length
                    return (
                      <div key={g.key}>
                        <div className="flex items-center justify-between px-1 pb-1">
                          <span className="text-[10px] uppercase tracking-widest text-ax-muted">
                            {g.label} <span className="text-ax-muted/50">{onCount}/{g.cols.length}</span>
                          </span>
                          <button
                            onClick={() => setMany(names, onCount < names.length)}
                            className="text-[10px] text-ax-muted hover:text-ax-text transition"
                          >
                            {onCount < names.length ? 'all' : 'none'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {g.cols.map((c) => {
                            const on = sel.has(c.name)
                            return (
                              <button
                                key={c.name}
                                onClick={() => toggle(c.name)}
                                title={`${c.role}${c.band ? ` · ${c.band}` : ''} · ${c.dtype} · ${(c.nanPct * 100).toFixed(1)}% null`}
                                className={`flex items-center gap-1 font-mono text-[11px] px-2 py-1 rounded-md border transition ${
                                  on
                                    ? 'bg-ax-blue/15 border-ax-blue/40 text-ax-text ax-glow'
                                    : 'bg-ax-bg-2/70 border-ax-border/60 text-ax-muted hover:text-ax-text'
                                }`}
                              >
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${ROLE_DOT[c.role]} ${on ? '' : 'opacity-50'}`} />
                                {c.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                  {groups.length === 0 && (
                    <div className="text-ax-muted text-xs px-1 py-4">no columns match "{query}".</div>
                  )}
                </div>
              </div>

              {/* Chart */}
              <div className="min-w-0">
                <SandboxChart data={data} enabled={sel} height={600} />
                <p className="text-ax-muted text-[11px] font-mono mt-3 pt-3 border-t border-ax-border/50 leading-relaxed break-all">
                  certified TA-v3 · {m.symbol} {m.interval} · {m.windowStart} → {m.windowEnd} ·{' '}
                  {m.rows.toLocaleString()}/{m.canonicalRows.toLocaleString()} rows ({m.windowMode} window,
                  canonical [{m.windowRowRange[0].toLocaleString()}, {m.windowRowRange[1].toLocaleString()})) ·{' '}
                  csv {m.csvSha256.slice(0, 12)}…
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── provenance / certification card ── */}
      <Card
        title="Provenance & certification"
        subtitle="Hash-verified artifacts per symbol / timeframe — all REAL, certified TA-v3"
      >
        {prov ? (
          <div className="space-y-4">
            <p className="text-ax-muted text-xs leading-relaxed max-w-3xl">
              All 38 pairs generated by <code className="text-ax-blue-2">scripts/gen_kerry_ta_v3.py</code> from
              Chronos-locked evidence in <code className="text-ax-blue-2">EVIDENCE/ta_v3_production_20260624/</code>.
              Dual hash gate: (1) sha256(CSV) verified against <code>output_csv_sha256</code> in each manifest,
              (2) <code>ts_aligned == True</code> and <code>input_row_match == True</code> asserted.
              Nothing recomputed; 2000-row tail window exported verbatim (NaN→null).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono border-collapse">
                <thead>
                  <tr className="border-b border-ax-border/60">
                    <th className="text-left py-2 pr-4 text-ax-muted font-normal">Symbol</th>
                    {['5m', '1h', '4h', '1D'].map((t) => (
                      <th key={t} colSpan={2} className="text-center py-2 px-2 text-ax-muted font-normal border-l border-ax-border/30">{t}</th>
                    ))}
                  </tr>
                  <tr className="border-b border-ax-border/40">
                    <th />
                    {['5m', '1h', '4h', '1D'].map((t) => (
                      <>
                        <th key={t + '_status'} className="py-1 px-2 text-ax-muted/60 font-normal border-l border-ax-border/30">status</th>
                        <th key={t + '_hash'} className="py-1 px-2 text-ax-muted/60 font-normal">csv sha256 (12)</th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KERRY_SYMBOLS.map((s) => (
                    <tr key={s} className="border-b border-ax-border/20 hover:bg-white/[0.02] transition">
                      <td className="py-1.5 pr-4 text-ax-text">{s}</td>
                      {(['5m', '1h', '4h', '1D'] as const).map((t) => {
                        const pair = prov.pairs?.[s]?.[t]
                        if (!pair) {
                          return (
                            <>
                              <td key={t + '_st'} className="py-1.5 px-2 border-l border-ax-border/20 text-ax-muted/40">—</td>
                              <td key={t + '_sh'} className="py-1.5 px-2 text-ax-muted/40">—</td>
                            </>
                          )
                        }
                        return (
                          <>
                            <td key={t + '_st'} className="py-1.5 px-2 border-l border-ax-border/20">
                              <span className="inline-flex items-center gap-1 text-ax-up">
                                <span className="w-1.5 h-1.5 rounded-full bg-ax-up" /> REAL
                              </span>
                            </td>
                            <td key={t + '_sh'} className="py-1.5 px-2 text-ax-blue-2 tabular-nums">
                              {pair.csvSha256.slice(0, 12)}…
                            </td>
                          </>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-ax-muted text-sm py-4">Loading provenance…</div>
        )}
      </Card>
    </div>
  )
}
