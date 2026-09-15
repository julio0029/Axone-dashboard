import { useMemo, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import type { Ohlcv, WallyTrade } from '../data/wallyTrades'

// Mandatory colour convention (spec):
//   LONG  → entry GREEN,  exit ORANGE
//   SHORT → entry RED,    exit BLUE
const C = {
  longEntry: '#1ec8a5',
  longExit: '#ffb454',
  shortEntry: '#ff5470',
  shortExit: '#4dd2ff',
  win: 'rgba(30,200,165,0.6)',
  loss: 'rgba(255,84,112,0.6)',
  sel: '#ffd24d',
}

const DETAIL_BARS = 45 * 288 // show connectors only when zoomed tighter than ~45 days of 5m bars

function fmtLabel(ms: number) {
  const d = new Date(ms), p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
}

export function WallyChart({
  ohlcv, trades, selectedId, onPick, height = 560,
}: {
  ohlcv: Ohlcv
  trades: WallyTrade[]
  selectedId: string | null
  onPick: (id: string) => void
  height?: number
}) {
  const chartRef = useRef<ReactECharts>(null)
  const nBars = ohlcv.t.length

  // ts → candle index (regular 5m grid, but built explicitly to survive any gaps).
  const tsToIdx = useMemo(() => {
    const m = new Map<number, number>()
    for (let i = 0; i < ohlcv.t.length; i++) m.set(ohlcv.t[i], i)
    return m
  }, [ohlcv])

  const idxOf = (ts: number) => {
    const hit = tsToIdx.get(ts)
    if (hit != null) return hit
    // nearest bar (defensive; decisions align to 5m bars)
    return Math.max(0, Math.min(nBars - 1, Math.round((ts - ohlcv.t[0]) / 300000)))
  }

  // trades with resolved indices
  const tr = useMemo(() => trades
    .filter((t) => t.entry_price != null && t.exit_price != null)
    .map((t) => ({ t, ei: idxOf(t.entry_ts), xi: idxOf(t.exit_ts) })),
    [trades, tsToIdx])

  // Initial view: last ~30 days.
  const initStart = Math.max(0, 100 - (30 * 288) / nBars * 100)
  const [zoomPct, setZoomPct] = useState<[number, number]>([initStart, 100])
  const visBars = (zoomPct[1] - zoomPct[0]) / 100 * nBars
  const detail = visBars <= DETAIL_BARS

  const option = useMemo<EChartsOption>(() => {
    const times = ohlcv.t.map(fmtLabel)
    const ohlc = ohlcv.t.map((_, i) => [ohlcv.o[i], ohlcv.c[i], ohlcv.l[i], ohlcv.h[i]])
    const vol = ohlcv.t.map((_, i) => ({
      value: ohlcv.v[i],
      itemStyle: { color: ohlcv.c[i] >= ohlcv.o[i] ? 'rgba(30,200,165,0.35)' : 'rgba(255,84,112,0.35)' },
    }))

    const sz = detail ? 9 : 5
    type Pt = { value: [number, number]; tid: string }
    const longE: Pt[] = [], shortE: Pt[] = [], longX: Pt[] = [], shortX: Pt[] = []
    for (const { t, ei, xi } of tr) {
      const e: Pt = { value: [ei, t.entry_price as number], tid: t.id }
      const x: Pt = { value: [xi, t.exit_price as number], tid: t.id }
      if (t.direction === 'LONG') { longE.push(e); longX.push(x) }
      else { shortE.push(e); shortX.push(x) }
    }

    // Connectors only when zoomed to detail — declutter when zoomed out.
    const loIdx = zoomPct[0] / 100 * nBars, hiIdx = zoomPct[1] / 100 * nBars
    const connectors = detail
      ? tr.filter(({ xi, ei }) => xi >= loIdx && ei <= hiIdx).map(({ t, ei, xi }) => ({
          coords: [[ei, t.entry_price as number], [xi, t.exit_price as number]],
          lineStyle: { color: (t.pnl_net ?? 0) > 0 ? C.win : C.loss, width: 1 },
        }))
      : []

    const sel = selectedId ? tr.find(({ t }) => t.id === selectedId) : null

    const series: any[] = [
      {
        name: 'OHLC', type: 'candlestick', xAxisIndex: 0, yAxisIndex: 0, data: ohlc,
        itemStyle: { color: '#1ec8a5', color0: '#ff5470', borderColor: '#1ec8a5', borderColor0: '#ff5470' },
      },
      { name: 'Volume', type: 'bar', xAxisIndex: 1, yAxisIndex: 1, data: vol },
      { name: 'trade path', type: 'lines', xAxisIndex: 0, yAxisIndex: 0, coordinateSystem: 'cartesian2d',
        data: connectors, polyline: false, silent: true, z: 3, lineStyle: { opacity: 0.55 } },
      { name: 'LONG entry', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0, data: longE,
        symbol: 'triangle', symbolSize: sz, itemStyle: { color: C.longEntry }, z: 6 },
      { name: 'LONG exit', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0, data: longX,
        symbol: 'diamond', symbolSize: sz, itemStyle: { color: C.longExit }, z: 6 },
      { name: 'SHORT entry', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0, data: shortE,
        symbol: 'triangle', symbolRotate: 180, symbolSize: sz, itemStyle: { color: C.shortEntry }, z: 6 },
      { name: 'SHORT exit', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0, data: shortX,
        symbol: 'diamond', symbolSize: sz, itemStyle: { color: C.shortExit }, z: 6 },
    ]

    if (sel) {
      const { t, ei, xi } = sel
      series.push({
        name: 'selected', type: 'lines', xAxisIndex: 0, yAxisIndex: 0, coordinateSystem: 'cartesian2d',
        polyline: false, silent: true, z: 9,
        data: [{ coords: [[ei, t.entry_price as number], [xi, t.exit_price as number]] }],
        lineStyle: { color: C.sel, width: 2.5, opacity: 0.95 },
      })
      series.push({
        name: 'selected pts', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0, z: 10, silent: true,
        symbolSize: 16, itemStyle: { color: 'transparent', borderColor: C.sel, borderWidth: 2.5 },
        data: [[ei, t.entry_price as number], [xi, t.exit_price as number]],
        markArea: { silent: true, itemStyle: { color: 'rgba(255,210,77,0.07)' },
          data: [[{ xAxis: ei }, { xAxis: xi }]] },
      })
    }

    return {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        trigger: 'item', backgroundColor: 'rgba(10,16,32,0.96)', borderColor: '#1b2740',
        textStyle: { color: '#c7d3e6', fontSize: 11 },
        formatter: (p: any) => {
          if (p.seriesType === 'candlestick') {
            const [o, c, l, h] = p.data
            return `${times[p.dataIndex]}<br/>O ${o} H ${h}<br/>L ${l} C ${c}`
          }
          if (p.data?.tid) {
            const t = trades.find((x) => x.id === p.data.tid)
            if (t) return tradeTip(t)
          }
          return ''
        },
      },
      axisPointer: { link: [{ xAxisIndex: 'all' }], lineStyle: { color: '#2f9bff', opacity: 0.3 } },
      legend: {
        top: 0, left: 56, textStyle: { color: '#6b7a96', fontSize: 10 }, icon: 'roundRect',
        itemWidth: 12, itemHeight: 8, data: ['LONG entry', 'LONG exit', 'SHORT entry', 'SHORT exit'],
      },
      grid: [
        { left: 62, right: 24, top: '9%', height: '62%' },
        { left: 62, right: 24, top: '78%', height: '15%' },
      ],
      xAxis: [
        { type: 'category', gridIndex: 0, data: times, boundaryGap: true,
          axisLine: { lineStyle: { color: '#1b2740' } }, axisTick: { show: false },
          axisLabel: { show: false }, splitLine: { show: false } },
        { type: 'category', gridIndex: 1, data: times, boundaryGap: true,
          axisLine: { lineStyle: { color: '#1b2740' } }, axisTick: { show: false },
          axisLabel: { color: '#6b7a96', fontSize: 10 }, splitLine: { show: false } },
      ],
      yAxis: [
        { scale: true, gridIndex: 0, splitLine: { lineStyle: { color: '#16203a' } },
          axisLine: { lineStyle: { color: '#1b2740' } }, axisLabel: { color: '#6b7a96', fontSize: 10 } },
        { scale: true, gridIndex: 1, splitNumber: 2, splitLine: { show: false },
          axisLine: { lineStyle: { color: '#1b2740' } }, axisLabel: { color: '#6b7a96', fontSize: 9 } },
      ],
      series,
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1], start: zoomPct[0], end: zoomPct[1] },
        { type: 'slider', xAxisIndex: [0, 1], bottom: 4, height: 16, start: zoomPct[0], end: zoomPct[1],
          borderColor: '#1b2740', fillerColor: 'rgba(47,155,255,0.15)', handleStyle: { color: '#2f9bff' },
          textStyle: { color: '#6b7a96', fontSize: 9 },
          dataBackground: { lineStyle: { color: '#1b2740' }, areaStyle: { color: '#101a2e' } } },
      ],
    }
  }, [ohlcv, tr, trades, selectedId, detail, zoomPct, nBars])

  const onEvents = useMemo(() => ({
    click: (p: any) => { if (p?.data?.tid) onPick(p.data.tid) },
    datazoom: () => {
      const inst = chartRef.current?.getEchartsInstance()
      if (!inst) return
      const dz = (inst.getOption() as any).dataZoom?.[0]
      if (dz && typeof dz.start === 'number' && typeof dz.end === 'number') setZoomPct([dz.start, dz.end])
    },
  }), [onPick])

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      notMerge
      lazyUpdate
      style={{ height, width: '100%' }}
      opts={{ renderer: 'canvas' }}
      onEvents={onEvents}
      onChartReady={(inst: any) => { (window as any).__wc = inst }}
    />
  )
}

function na(v: number | null | undefined, digits = 2, suffix = '') {
  return v == null ? 'N/A' : `${v.toFixed(digits)}${suffix}`
}

function tradeTip(t: WallyTrade): string {
  const d = new Date(t.entry_ts), p = (n: number) => String(n).padStart(2, '0')
  const ets = `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
  const x = new Date(t.exit_ts)
  const xts = `${x.getUTCFullYear()}-${p(x.getUTCMonth() + 1)}-${p(x.getUTCDate())} ${p(x.getUTCHours())}:${p(x.getUTCMinutes())}`
  const dur = t.hold_minutes != null ? `${(t.hold_minutes / 60).toFixed(1)}h` : 'N/A'
  const dirColor = t.direction === 'LONG' ? C.longEntry : C.shortEntry
  const pnlColor = (t.pnl_net ?? 0) > 0 ? C.longEntry : C.shortEntry
  return [
    `<b>${t.id}</b>`,
    `<span style="color:${dirColor}">${t.direction}</span> · ${t.regime ?? '—'}`,
    `entry ${ets} @ ${na(t.entry_price, 6)}`,
    `exit&nbsp; ${xts} @ ${na(t.exit_price, 6)}`,
    `duration ${dur} · conv ${na(t.conviction, 2)} · margin ${na(t.vote_margin, 2)}`,
    `net <span style="color:${pnlColor}">${na(t.pnl_net, 1, ' bps')}</span> · MFE ${na(t.mfe, 1)} · MAE ${na(t.mae, 1)} · cap ${na(t.mfe_capture, 2)}`,
    `entry eff ${na(t.oracle.entry_efficiency, 2)} · exit eff ${na(t.oracle.exit_efficiency, 2)}`,
  ].join('<br/>')
}
