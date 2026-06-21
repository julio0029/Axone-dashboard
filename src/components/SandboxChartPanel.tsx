import { useMemo, useState } from 'react'
import { Card } from './Card'
import { SandboxChart } from './SandboxChart'
import {
  useTaV2Export, classifyColumn, EXPORT_PATHS,
  type ColumnRole, type ManifestColumn, type SandboxTf,
} from '../data/taV2Export'

const TIMEFRAMES: SandboxTf[] = ['5m', '1h', '4h', '1D']

// Every column in the export is independently toggleable — no cap, any number
// from zero through all. Columns are grouped by render role for the selector.
// Price (O/H/L/C) drives the candlestick, which renders only when all four are on.
const ROLE_GROUPS: { role: ColumnRole; name: string; hint?: string }[] = [
  { role: 'price', name: 'Price · candlestick', hint: 'needs O/H/L/C together' },
  { role: 'overlay', name: 'Overlays' },
  { role: 'oscillator', name: 'Oscillators' },
  { role: 'volume', name: 'Volume' },
  { role: 'marker', name: 'Markers' },
]

export function SandboxChartPanel() {
  const [tf, setTf] = useState<SandboxTf>('5m')
  const { status, data, error } = useTaV2Export(EXPORT_PATHS[tf])
  const [query, setQuery] = useState('')
  const [enabled, setEnabled] = useState<Set<string> | null>(null)

  // Every column is toggleable, including the candlestick price columns. There
  // is no 2-column cap: any number from zero through all may be selected.
  const allCols: ManifestColumn[] = useMemo(
    () => (data ? data.manifest.columns : []),
    [data],
  )

  // default selection = all available columns (preserves the candle + volume +
  // Gann-swing view); the user can then independently toggle any column off.
  const sel = useMemo(() => {
    if (enabled) return enabled
    return new Set(allCols.map((c) => c.name))
  }, [enabled, allCols])

  const toggle = (name: string) =>
    setEnabled(() => {
      const n = new Set(sel)
      n.has(name) ? n.delete(name) : n.add(name)
      return n
    })

  // group columns by render role for the control list
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ROLE_GROUPS.map((rg) => ({
      key: rg.role,
      name: rg.name,
      hint: rg.hint,
      cols: allCols.filter(
        (c) => classifyColumn(c) === rg.role && (!q || c.name.toLowerCase().includes(q)),
      ),
    })).filter((g) => g.cols.length > 0)
  }, [allCols, query])

  const badge =
    status === 'ready'
      ? { label: 'real export', cls: 'text-ax-up bg-[#1ec8a5]/10 border-[#1ec8a5]/30' }
      : status === 'loading'
      ? { label: 'loading…', cls: 'text-ax-muted bg-white/[0.03] border-ax-border' }
      : { label: 'awaiting export', cls: 'text-ax-down bg-[#ff5470]/10 border-[#ff5470]/30' }

  const m = data?.manifest
  const subtitle =
    status === 'ready' && m
      ? `${m.symbol} · ${m.interval} · ${m.rows.toLocaleString('en-US')} of ${(m.canonicalRows ?? m.rows).toLocaleString('en-US')} canonical candles · Gann swings`
      : 'Verified Chronos Gate-A BTCUSDT bundle · OHLCV + Gann swings'

  return (
    <Card
      title="Interactive Gann swing chart"
      subtitle={subtitle}
      right={
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-ax-border/70 overflow-hidden">
            {TIMEFRAMES.map((t) => (
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
          <div className="text-ax-text text-sm font-medium">
            {tf} timeframe — awaiting the verified {tf} export.
          </div>
          <p className="text-ax-muted text-sm mt-2 max-w-2xl leading-relaxed">
            This chart renders <span className="text-ax-up">only</span> Chronos' Sentinel-gated Gate-A export
            (no mock, no client recompute). When the artifact is served at the path below it renders real
            candlesticks plus the certified <code className="text-ax-blue-2">gann_swing</code> direction as
            swing-top/bottom pivots. Switch to <span className="text-ax-text">1D</span> for the full
            2020–2025 history.
          </p>
          {status === 'error' && (
            <p className="text-ax-down text-xs mt-3 font-mono">load error: {error}</p>
          )}
          <div className="mt-4 grid gap-3 text-xs">
            <ContractRow k="Fetch path" v={EXPORT_PATHS[tf]} />
            <ContractRow k="Payload" v={'{ manifest, time: number[] (ms), columns: Record<name, (number|null)[]> }'} />
            <ContractRow
              k="manifest"
              v={'{ symbol, interval, rows, windowStart, windowEnd, sha1 (validated seal), columns: [{ name, dtype, group?, role?, nanPct? }] }'}
            />
          </div>
        </div>
      )}

      {status === 'ready' && data && m && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          {/* controls */}
          <div className="space-y-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter columns…"
              className="w-full px-3 py-2 rounded-lg bg-ax-bg-2/70 border border-ax-border/70 text-sm text-ax-text placeholder:text-ax-muted focus:outline-none focus:border-ax-blue/50"
            />
            <div className="flex items-center justify-between text-[11px] text-ax-muted">
              <span>{sel.size} / {allCols.length} selected</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEnabled(new Set(allCols.map((c) => c.name)))}
                  className="hover:text-ax-text transition"
                >
                  all
                </button>
                <span className="text-ax-border">·</span>
                <button onClick={() => setEnabled(new Set())} className="hover:text-ax-text transition">
                  clear
                </button>
              </div>
            </div>
            <div className="max-h-[520px] overflow-y-auto ax-scroll space-y-3 pr-1">
              {groups.map((g) => (
                <div key={g.key}>
                  <div className="text-[10px] uppercase tracking-widest text-ax-muted px-1 pb-1">
                    {g.name}
                    {g.hint && <span className="text-ax-muted/60 normal-case tracking-normal"> · {g.hint}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.cols.map((c) => {
                      const on = sel.has(c.name)
                      return (
                        <button
                          key={c.name}
                          onClick={() => toggle(c.name)}
                          title={`${c.dtype}${c.nanPct != null ? ` · ${(c.nanPct * 100).toFixed(1)}% NaN` : ''} · ${classifyColumn(c)}`}
                          className={`font-mono text-[11px] px-2 py-1 rounded-md border transition ${
                            on
                              ? 'bg-ax-blue/15 border-ax-blue/40 text-ax-text ax-glow'
                              : 'bg-ax-bg-2/70 border-ax-border/60 text-ax-muted hover:text-ax-text'
                          }`}
                        >
                          {c.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              {groups.length === 0 && (
                <div className="text-ax-muted text-xs px-1 py-4">no columns match “{query}”.</div>
              )}
            </div>
          </div>

          {/* chart */}
          <div className="min-w-0">
            <SandboxChart data={data} enabled={sel} />
            <p className="text-ax-muted text-[11px] font-mono mt-3 pt-3 border-t border-ax-border/50 leading-relaxed">
              verified export · {m.symbol} {m.interval} · {m.windowStart} → {m.windowEnd} ·{' '}
              {m.rows.toLocaleString('en-US')}/{(m.canonicalRows ?? m.rows).toLocaleString('en-US')} candles ·{' '}
              {m.gateAVerdict ?? 'PASS'} · sentinel gate {m.sha1.slice(0, 12)}…
              {m.env ? ` · ${m.env}` : ''}
            </p>
            <p className="text-ax-muted text-[11px] mt-1 leading-relaxed">
              <span className="text-ax-up">▲</span> swing top (green, above the high) ·{' '}
              <span className="text-ax-down">▼</span> swing bottom (red, below the low). Derived from the
              certified <code className="text-ax-blue-2">gann_swing</code> direction column (+1 up / −1 down):
              each sign flip is a confirmed Gann pivot closing the prior leg — a deterministic read of the
              sealed column, nothing recomputed.{m.upPct != null ? ` Full series: ${m.upPct}% up / ${m.downPct}% down.` : ''}
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

function ContractRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <span className="shrink-0 w-20 text-ax-muted uppercase tracking-wide text-[10px] pt-0.5">{k}</span>
      <code className="font-mono text-[11px] text-ax-blue-2 bg-ax-bg-2/70 border border-ax-border/60 rounded px-2 py-1 break-all">
        {v}
      </code>
    </div>
  )
}
