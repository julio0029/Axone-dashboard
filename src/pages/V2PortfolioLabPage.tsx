import { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { Card } from '../components/Card'
import { AwaitingData, LoadGate, Pill, StatTile } from '../components/V2'
import {
  usePortfolioLab,
  usd,
  pct,
  sym,
  type PortfolioProfile,
} from '../data/v2'

const AX = { blue: '#2f9bff', blue2: '#4dd2ff', up: '#1ec8a5', down: '#ff5470', grid: '#16203a', muted: '#6b7a96' }

export function V2PortfolioLabPage() {
  const { status, data, error } = usePortfolioLab()
  const [sel, setSel] = useState<string | null>(null)

  const active: PortfolioProfile | null = useMemo(() => {
    if (!data) return null
    const ready = data.profiles.filter((p) => p.status === 'ready')
    const chosen = sel ? data.profiles.find((p) => p.key === sel) : ready[0]
    return chosen ?? null
  }, [data, sel])

  return (
    <div className="space-y-4">
      <SimHeader />
      <LoadGate status={status} error={error} absentHint="portfolio lab data not found — run scripts/gen_v2_portfolio_lab.py">
        {data && (
          <>
            <ProfileSelector data={data} active={active} onSelect={setSel} />
            {active && active.status === 'ready' && active.summary ? (
              <ActiveProfile p={active} />
            ) : (
              <AwaitingData
                title="Profile awaiting Track C output"
                detail="This portfolio profile is part of the planned Track C matrix but has not produced a walk-forward result yet. Select a profile marked ready above."
              />
            )}
          </>
        )}
      </LoadGate>
    </div>
  )
}

function SimHeader() {
  return (
    <div className="rounded-lg border border-ax-blue/30 bg-ax-blue/[0.06] px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="font-display text-[13px] tracking-wide text-ax-blue-2 uppercase">Historical Portfolio Lab</span>
      <span className="text-ax-muted text-xs">
        Track C · 5-minute walk-forward simulation over the frozen 10-symbol universe
      </span>
      <span className="ml-auto text-ax-muted/70 text-[10px] uppercase tracking-widest">
        historical backtest · not live · not paper
      </span>
    </div>
  )
}

function ProfileSelector({
  data,
  active,
  onSelect,
}: {
  data: NonNullable<ReturnType<typeof usePortfolioLab>['data']>
  active: PortfolioProfile | null
  onSelect: (k: string) => void
}) {
  return (
    <Card
      title="Portfolio profile"
      subtitle={`${data.profileCountReady} ready · ${data.profileCountAwaiting} awaiting · Track C matrix (equity × max positions × max allocation)`}
      right={<span className="text-ax-muted text-[10px] font-mono">generated {data.generatedAtUtc}</span>}
    >
      <div className="flex flex-wrap gap-2">
        {data.profiles.map((p) => {
          const ready = p.status === 'ready'
          const isActive = active?.key === p.key
          return (
            <button
              key={p.key}
              type="button"
              disabled={!ready}
              onClick={() => ready && onSelect(p.key)}
              className="text-left rounded-lg border px-3 py-2 transition min-w-[8.5rem]"
              style={{
                borderColor: isActive ? AX.blue2 : ready ? 'rgba(47,155,255,0.25)' : '#1b2740',
                background: isActive ? 'rgba(47,155,255,0.12)' : ready ? 'rgba(255,255,255,0.02)' : 'transparent',
                opacity: ready ? 1 : 0.5,
                boxShadow: isActive ? '0 0 0 1px rgba(77,210,255,0.5)' : undefined,
                cursor: ready ? 'pointer' : 'not-allowed',
              }}
            >
              <div className="font-display text-sm text-ax-text tracking-wide">{p.label}</div>
              <div className="mt-1">
                {ready ? (
                  <span className="text-[10px] font-mono" style={{ color: (p.summary?.totalReturnPct ?? 0) >= 0 ? AX.up : AX.down }}>
                    {p.summary ? `${pct(p.summary.totalReturnPct, 1)} · ${p.summary.nTrades} trades` : 'ready'}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono uppercase tracking-widest text-ax-muted">awaiting</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function ActiveProfile({ p }: { p: PortfolioProfile }) {
  const s = p.summary!
  return (
    <div className="space-y-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatTile label="Start equity" value={`$${usd(s.startEquity)}`} sub={`${p.maxPositions} pos · ${p.maxAllocPct}% alloc`} />
        <StatTile label="End equity" value={`$${usd(s.endEquity)}`} sub={`${p.range?.days ?? '—'} days`} />
        <StatTile label="Total return" value={pct(s.totalReturnPct, 1)} tone={(s.totalReturnPct ?? 0) >= 0 ? 'up' : 'down'} sub="compounded, gross" />
        <StatTile label="Max drawdown" value={pct(s.maxDrawdownPct, 2)} tone="down" sub={s.maxDrawdownAt?.slice(0, 10) ?? ''} />
        <StatTile label="Win rate" value={s.winRatePct !== null ? `${s.winRatePct}%` : '—'} sub={`${s.nClosed} closed · ${s.nOpen} open`} />
        <StatTile label="Profit factor" value={s.profitFactor ?? '—'} sub={`Sharpe≈ ${s.sharpeApprox ?? '—'}`} />
      </div>

      {/* Equity + drawdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" title="Equity curve" subtitle="daily · log scale (compounded fixed-fraction simulation)">
          <ReactECharts option={equityOption(p)} style={{ height: 320 }} notMerge lazyUpdate />
        </Card>
        <Card title="Drawdown" subtitle="running % from peak">
          <ReactECharts option={drawdownOption(p)} style={{ height: 320 }} notMerge lazyUpdate />
        </Card>
      </div>

      {/* Allocation + symbol contribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Allocation model" subtitle="fixed-fraction slot sizing">
          <dl className="text-sm space-y-2">
            <KV k="Max concurrent positions" v={String(p.maxPositions ?? '—')} />
            <KV k="Max allocation / position" v={p.maxAllocPct !== null ? `${p.maxAllocPct}%` : '—'} />
            <KV k="Slot size (of start equity)" v={p.slotSizeUsd !== null ? `$${usd(p.slotSizeUsd)}` : '—'} />
            <KV k="Missed entries (no slot etc.)" v={usd(s.missedEntries, 0)} />
            <KV k="Avg hold" v={s.avgHoldBars !== null ? `${s.avgHoldBars} bars (5m)` : '—'} />
          </dl>
          {p.missed && p.missed.total > 0 && (
            <div className="mt-3 pt-3 border-t border-ax-border/60">
              <p className="text-ax-muted text-[10px] uppercase tracking-widest mb-1.5">missed-entry reasons</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(p.missed.byReason).map(([r, n]) => (
                  <Pill key={r} color="#ffb454">
                    {r} · {n}
                  </Pill>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card className="xl:col-span-2" title="Symbol contribution" subtitle="net PnL (USD) by symbol — full trade log">
          <ReactECharts option={contributionOption(p)} style={{ height: 300 }} notMerge lazyUpdate />
        </Card>
      </div>

      {/* Trade table */}
      <Card
        title="Trade log"
        subtitle={`showing last ${p.tradeSampleCount ?? 0} of ${s.nTrades} trades (most recent)`}
        right={
          <div className="flex items-center gap-2 text-[10px] text-ax-muted font-mono">
            {p.sourceHashes &&
              Object.entries(p.sourceHashes).map(([f, h]) => (
                <span key={f} title={f}>
                  {f.split('.')[0]}:{h}
                </span>
              ))}
          </div>
        }
      >
        <TradeTable rows={p.tradeSample ?? []} />
      </Card>

      <p className="text-ax-muted/60 text-[10px] px-1">
        Historical walk-forward simulation. Returns are gross and compounded; they are not live or paper-traded results
        and do not model real-world liquidity or market impact. Source range {p.range?.startUtc?.slice(0, 10)} →{' '}
        {p.range?.endUtc?.slice(0, 10)}.
      </p>
    </div>
  )
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ax-border/40 pb-1.5">
      <dt className="text-ax-muted text-xs">{k}</dt>
      <dd className="text-ax-text text-sm font-mono">{v}</dd>
    </div>
  )
}

function TradeTable({ rows }: { rows: NonNullable<PortfolioProfile['tradeSample']> }) {
  return (
    <div className="overflow-x-auto ax-scroll max-h-[420px]">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-ax-bg-2">
          <tr className="text-ax-muted uppercase tracking-widest text-[10px]">
            {['Symbol', 'Dir', 'Entry', 'Exit', 'Entry px', 'Exit px', 'Alloc', 'Net PnL', 'bps', 'Hold'].map((h) => (
              <th key={h} className="text-left font-normal px-2 py-1.5 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono">
          {[...rows].reverse().map((t, i) => {
            const up = t.netPnlUsd >= 0
            return (
              <tr key={i} className="border-b border-ax-border/30 hover:bg-white/[0.02]">
                <td className="px-2 py-1 text-ax-text font-sans">{sym(t.symbol)}</td>
                <td className="px-2 py-1" style={{ color: t.direction === 'LONG' ? AX.up : AX.down }}>
                  {t.direction}
                </td>
                <td className="px-2 py-1 text-ax-muted whitespace-nowrap">{t.entryTs?.replace('T', ' ').slice(0, 16)}</td>
                <td className="px-2 py-1 text-ax-muted whitespace-nowrap">
                  {t.stillOpen ? <span style={{ color: AX.blue2 }}>OPEN</span> : t.exitTs?.replace('T', ' ').slice(0, 16)}
                </td>
                <td className="px-2 py-1 text-ax-text">{t.entryPrice}</td>
                <td className="px-2 py-1 text-ax-text">{t.exitPrice}</td>
                <td className="px-2 py-1 text-ax-muted">${usd(t.committedUsd, 0)}</td>
                <td className="px-2 py-1" style={{ color: up ? AX.up : AX.down }}>
                  {up ? '+' : ''}
                  {usd(t.netPnlUsd, 4)}
                </td>
                <td className="px-2 py-1" style={{ color: up ? AX.up : AX.down }}>
                  {up ? '+' : ''}
                  {usd(t.netPnlBps, 1)}
                </td>
                <td className="px-2 py-1 text-ax-muted">{t.holdBars}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ---- ECharts options ----
const baseGrid = { left: 56, right: 16, top: 20, bottom: 30 }
const axisCommon = {
  axisLine: { lineStyle: { color: AX.grid } },
  axisLabel: { color: AX.muted, fontSize: 10 },
  splitLine: { lineStyle: { color: AX.grid, opacity: 0.4 } },
}

function equityOption(p: PortfolioProfile): EChartsOption {
  const c = p.equityCurve ?? []
  return {
    grid: baseGrid,
    tooltip: { trigger: 'axis', backgroundColor: '#0e1424', borderColor: AX.grid, textStyle: { color: '#c7d3e6' } },
    xAxis: { type: 'category', data: c.map((d) => d.t.slice(0, 10)), ...axisCommon, boundaryGap: false },
    yAxis: { type: 'log', ...axisCommon, name: 'equity $', nameTextStyle: { color: AX.muted, fontSize: 10 } },
    series: [
      {
        type: 'line',
        data: c.map((d) => d.equity),
        showSymbol: false,
        lineStyle: { color: AX.blue2, width: 1.5 },
        areaStyle: { color: 'rgba(77,210,255,0.10)' },
      },
    ],
  }
}

function drawdownOption(p: PortfolioProfile): EChartsOption {
  const d = p.drawdown ?? []
  return {
    grid: baseGrid,
    tooltip: { trigger: 'axis', backgroundColor: '#0e1424', borderColor: AX.grid, textStyle: { color: '#c7d3e6' } },
    xAxis: { type: 'category', data: d.map((x) => x.t.slice(0, 10)), ...axisCommon, boundaryGap: false },
    yAxis: { type: 'value', ...axisCommon, name: '% dd', max: 0, nameTextStyle: { color: AX.muted, fontSize: 10 } },
    series: [
      {
        type: 'line',
        data: d.map((x) => x.dd),
        showSymbol: false,
        lineStyle: { color: AX.down, width: 1 },
        areaStyle: { color: 'rgba(255,84,112,0.15)' },
      },
    ],
  }
}

function contributionOption(p: PortfolioProfile): EChartsOption {
  const c = (p.symbolContribution ?? []).slice(0, 12)
  return {
    grid: { left: 70, right: 20, top: 10, bottom: 24 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#0e1424', borderColor: AX.grid, textStyle: { color: '#c7d3e6' } },
    xAxis: { type: 'value', ...axisCommon },
    yAxis: {
      type: 'category',
      data: c.map((x) => sym(x.symbol)).reverse(),
      ...axisCommon,
      splitLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: c
          .map((x) => ({ value: x.netUsd, itemStyle: { color: x.netUsd >= 0 ? AX.up : AX.down } }))
          .reverse(),
        barWidth: '60%',
      },
    ],
  }
}
