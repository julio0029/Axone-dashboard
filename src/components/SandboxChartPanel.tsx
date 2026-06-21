import { useMemo, useState } from 'react'
import { Card } from './Card'
import { SandboxChart } from './SandboxChart'
import {
  useTaV3Export, TA_V3_PATHS, TA_V3_TIMEFRAMES,
  type TaV3Tf, type V3Column, type V3Role,
} from '../data/taV3Export'

// A readable starting view; every one of the 149 columns can then be toggled
// independently (All / Clear / zero all work). No cap.
const DEFAULT_ON = [
  'open', 'high', 'low', 'close', 'volume',
  'ema_50', 'bolinger_upper', 'bolinger_sma', 'bolinger_lower',
  'rsi', 'gann_swing',
]

const ROLE_DOT: Record<V3Role, string> = {
  price: 'bg-ax-up',
  overlay: 'bg-ax-blue',
  oscillator: 'bg-[#c77dff]',
  volume: 'bg-[#ffb454]',
  marker: 'bg-ax-down',
  meta: 'bg-ax-border',
}

export function SandboxChartPanel() {
  const [tf, setTf] = useState<TaV3Tf>('5m')
  const { status, data, error } = useTaV3Export(TA_V3_PATHS[tf])
  const [query, setQuery] = useState('')
  const [enabled, setEnabled] = useState<Set<string> | null>(null)

  const allCols: V3Column[] = useMemo(() => (data ? data.manifest.columns : []), [data])

  const sel = useMemo(() => {
    if (enabled) return enabled
    // default selection intersected with what this export actually has
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
      for (const name of names) (on ? n.add(name) : n.delete(name))
      return n
    })

  // group columns by certified ledger group, preserving schema order
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const order: string[] = []
    const map: Record<string, { label: string; cols: V3Column[] }> = {}
    for (const c of allCols) {
      if (!map[c.group]) {
        map[c.group] = { label: c.groupLabel, cols: [] }
        order.push(c.group)
      }
      if (!q || c.name.toLowerCase().includes(q)) map[c.group].cols.push(c)
    }
    return order.map((k) => ({ key: k, ...map[k] })).filter((g) => g.cols.length > 0)
  }, [allCols, query])

  // meta (non-plotted) columns that are enabled → data/inspection layer
  const metaRows = useMemo(() => {
    if (!data) return []
    return allCols
      .filter((c) => c.role === 'meta' && sel.has(c.name))
      .map((c) => {
        const arr = data.columns[c.name] ?? []
        let v: string | number | null = null
        for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) { v = arr[i]; break }
        return { name: c.name, value: v }
      })
  }, [allCols, sel, data])

  const m = data?.manifest
  const badge =
    status === 'ready'
      ? { label: 'certified v3', cls: 'text-ax-up bg-[#1ec8a5]/10 border-[#1ec8a5]/30' }
      : status === 'loading'
      ? { label: 'loading…', cls: 'text-ax-muted bg-white/[0.03] border-ax-border' }
      : { label: 'awaiting export', cls: 'text-ax-down bg-[#ff5470]/10 border-[#ff5470]/30' }

  const subtitle =
    status === 'ready' && m
      ? `${m.symbol} · ${m.interval} · ${m.rows.toLocaleString('en-US')} of ${m.canonicalRows.toLocaleString('en-US')} canonical rows · ${m.columnCount} certified columns`
      : 'Chronos-certified BTCUSDT Technical_analysis_v3 · 149 columns · 5m & 1h'

  return (
    <Card
      title="Interactive TA-v3 chart"
      subtitle={subtitle}
      right={
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-ax-border/70 overflow-hidden">
            {TA_V3_TIMEFRAMES.map((t) => (
              <button
                key={t}
                onClick={() => setTf(t)}
                className={`px-3 py-1 text-xs font-mono transition ${
                  t === tf ? 'bg-ax-blue/20 text-ax-text ax-glow' : 'text-ax-muted hover:text-ax-text hover:bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
      }
    >
      {status === 'loading' && (
        <div className="py-16 text-center text-ax-muted text-sm animate-pulse">Loading {tf} export…</div>
      )}

      {status !== 'loading' && status !== 'ready' && (
        <div className="rounded-xl border border-dashed border-ax-border/70 bg-ax-bg-2/40 px-5 py-6">
          <div className="text-ax-text text-sm font-medium">{tf} — awaiting the certified TA-v3 export.</div>
          <p className="text-ax-muted text-sm mt-2 max-w-2xl leading-relaxed">
            This chart renders <span className="text-ax-up">only</span> Chronos' certified
            Technical_analysis_v3 export (no mock, no client recompute). Expected at{' '}
            <code className="text-ax-blue-2">{TA_V3_PATHS[tf]}</code>.
          </p>
          {status === 'error' && <p className="text-ax-down text-xs mt-3 font-mono">load error: {error}</p>}
        </div>
      )}

      {status === 'ready' && data && m && (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
          {/* ── selector ── */}
          <div className="space-y-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter 149 columns…"
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
                            className={`group flex items-center gap-1 font-mono text-[11px] px-2 py-1 rounded-md border transition ${
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
                <div className="text-ax-muted text-xs px-1 py-4">no columns match “{query}”.</div>
              )}
            </div>
          </div>

          {/* ── chart + inspection ── */}
          <div className="min-w-0">
            <SandboxChart data={data} enabled={sel} />

            {metaRows.length > 0 && (
              <div className="mt-3 rounded-lg border border-ax-border/60 bg-ax-bg-2/40 px-3 py-2">
                <div className="text-[10px] uppercase tracking-widest text-ax-muted mb-1">
                  Data / inspection layer · non-plotted metadata (latest row)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-0.5">
                  {metaRows.map((r) => (
                    <div key={r.name} className="flex justify-between gap-3 text-[11px] font-mono">
                      <span className="text-ax-muted truncate">{r.name}</span>
                      <span className="text-ax-blue-2 shrink-0">{r.value == null ? '—' : String(r.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-ax-muted text-[11px] font-mono mt-3 pt-3 border-t border-ax-border/50 leading-relaxed break-all">
              certified TA-v3 · {m.symbol} {m.interval} · {m.windowStart} → {m.windowEnd} ·{' '}
              {m.rows.toLocaleString('en-US')}/{m.canonicalRows.toLocaleString('en-US')} rows ({m.windowMode} window,
              canonical [{m.windowRowRange[0].toLocaleString('en-US')}, {m.windowRowRange[1].toLocaleString('en-US')})) ·{' '}
              {m.gateVerdict.split('—')[0].trim()} · csv {m.csvSha256.slice(0, 12)}… · script sha1 {m.scriptSha1.slice(0, 12)}…
            </p>
            <p className="text-ax-muted text-[11px] mt-1 leading-relaxed">
              All 149 certified columns are independently selectable. Markers:{' '}
              <span className="text-ax-up">▲</span> gann swing top / <span className="text-ax-down">▼</span> bottom (from the
              certified <code className="text-ax-blue-2">gann_swing</code> ±1 column &amp; pivot-price columns); candle flags as pins.
              Oscillators render in scale-grouped sub-panes; timestamps/metadata appear in the inspection layer above
              (never plotted, never dropped). Only rows are windowed — no value is recomputed.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
