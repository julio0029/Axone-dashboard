import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import {
  BAND_LABEL, BAND_ORDER, type TaV3Export, type V3Column,
} from '../data/taV3Export'

const PALETTE = [
  '#4dd2ff', '#7c5cff', '#ffb454', '#1ec8a5', '#ff5470',
  '#2f9bff', '#c77dff', '#5ad1b0', '#ffd166', '#ef6f6c',
  '#8ab4ff', '#b388ff', '#ffc97a', '#74e0c4', '#ff8095',
]

function fmtTime(ms: number, interval: string) {
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  const daily = /^\d+d|w|mo/i.test(interval)
  if (daily) return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`
  return `${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
}

export function SandboxChart({
  data, enabled, height = 640,
}: {
  data: TaV3Export
  enabled: Set<string>
  height?: number
}) {
  const option = useMemo<EChartsOption>(() => {
    const { time, columns, manifest } = data
    const byName: Record<string, V3Column> = {}
    for (const c of manifest.columns) byName[c.name] = c

    const num = (name: string): (number | null)[] =>
      (columns[name] ?? []).map((v) => (typeof v === 'number' ? v : null))

    const times = time.map((t) => fmtTime(t, manifest.interval))
    const opens = num('open'), highs = num('high'), lows = num('low'), closes = num('close')
    const ohlc = time.map((_, i) => [opens[i] ?? null, closes[i] ?? null, lows[i] ?? null, highs[i] ?? null])

    // ── partition enabled, plottable columns by role ─────────────────────────
    const overlays: string[] = []
    const markers: string[] = []
    const oscByBand: Record<string, string[]> = {}
    let showVol = false
    for (const c of manifest.columns) {
      if (!enabled.has(c.name)) continue
      if (c.role === 'overlay') overlays.push(c.name)
      else if (c.role === 'marker') markers.push(c.name)
      else if (c.role === 'volume') showVol = true
      else if (c.role === 'oscillator') {
        const b = c.band ?? 'misc'
        ;(oscByBand[b] ??= []).push(c.name)
      }
    }
    const activeBands = BAND_ORDER.filter((b) => oscByBand[b]?.length)

    // candlestick is itself toggleable: render only when all 4 price cols on
    const priceCols = ['open', 'high', 'low', 'close']
    const showCandles = priceCols.every((n) => enabled.has(n))

    // sub-panes: volume first, then one per active oscillator band
    const subs: { key: string; label: string }[] = [
      ...(showVol ? [{ key: '__vol__', label: 'Volume' }] : []),
      ...activeBands.map((b) => ({ key: b, label: BAND_LABEL[b] ?? b })),
    ]
    const nSub = subs.length

    // ── vertical layout ──────────────────────────────────────────────────────
    const mainTop = 8
    const mainHeight = nSub === 0 ? 80 : Math.max(28, 50 - nSub * 1.6)
    const subTop = mainTop + mainHeight + 4
    const subBandTotal = Math.max(10, 94 - subTop)
    const gap = 1.4
    const subH = nSub > 0 ? Math.max(4, (subBandTotal - gap * (nSub - 1)) / nSub) : 0

    const grids: NonNullable<EChartsOption['grid']> = [
      { left: 64, right: 28, top: `${mainTop}%`, height: `${mainHeight}%` },
    ]
    const subGridIndex: Record<string, number> = {}
    subs.forEach((s, i) => {
      subGridIndex[s.key] = i + 1
      grids.push({ left: 64, right: 28, top: `${subTop + i * (subH + gap)}%`, height: `${subH}%` })
    })
    const nGrid = grids.length

    const xAxes = grids.map((_, i) => ({
      type: 'category' as const, gridIndex: i, data: times, boundaryGap: true,
      axisLine: { lineStyle: { color: '#1b2740' } },
      axisLabel: { show: i === nGrid - 1, color: '#6b7a96', fontSize: 10 },
      axisTick: { show: false }, splitLine: { show: false },
      axisPointer: { label: { show: i === nGrid - 1 } },
    }))
    const yAxes = grids.map((_, i) => ({
      scale: true, gridIndex: i,
      name: i === 0 ? '' : subs[i - 1].label,
      nameTextStyle: { color: '#6b7a96', fontSize: 9, align: 'left' as const },
      nameLocation: 'end' as const, nameGap: 4,
      splitLine: { show: i === 0, lineStyle: { color: '#16203a' } },
      axisLine: { lineStyle: { color: '#1b2740' } },
      axisLabel: { color: '#6b7a96', fontSize: 9 },
    }))

    type Series = NonNullable<EChartsOption['series']>
    const series: Series = []

    if (showCandles) {
      series.push({
        name: 'OHLC', type: 'candlestick', xAxisIndex: 0, yAxisIndex: 0, data: ohlc,
        itemStyle: {
          color: '#1ec8a5', color0: '#ff5470',
          borderColor: '#1ec8a5', borderColor0: '#ff5470',
        },
      })
    }

    overlays.forEach((name, i) => {
      series.push({
        name, type: 'line', xAxisIndex: 0, yAxisIndex: 0,
        data: num(name), smooth: false, showSymbol: false,
        lineStyle: { color: PALETTE[i % PALETTE.length], width: 1.1, opacity: 0.9 },
      })
    })

    // ── markers on the price pane ────────────────────────────────────────────
    markers.forEach((name) => {
      if (name === 'gann_swing') {
        // certified ±1 direction column — a sign flip is a confirmed pivot:
        // up→down ends an up-leg → swing TOP; down→up → swing BOTTOM.
        const dir = num(name)
        const tops: [number, number][] = []
        const bottoms: [number, number][] = []
        for (let i = 1; i < time.length; i++) {
          const prev = dir[i - 1], cur = dir[i]
          if (prev == null || cur == null || prev === cur) continue
          if (prev === 1 && cur === -1) tops.push([i - 1, (highs[i - 1] ?? 0) * 1.001])
          else if (prev === -1 && cur === 1) bottoms.push([i - 1, (lows[i - 1] ?? 0) * 0.999])
        }
        series.push({
          name: 'gann_swing ▲top', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
          symbol: 'triangle', symbolSize: 8, symbolRotate: 180,
          itemStyle: { color: '#1ec8a5' }, data: tops,
        })
        series.push({
          name: 'gann_swing ▼bot', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
          symbol: 'triangle', symbolSize: 8, symbolRotate: 0,
          itemStyle: { color: '#ff5470' }, data: bottoms,
        })
        return
      }
      // gann_swing_top / _bottom / _change hold the certified pivot PRICE on
      // pivot rows (null elsewhere) — plot the marker at that exact price.
      if (name === 'gann_swing_top' || name === 'gann_swing_bottom' || name === 'gann_swing_change') {
        const v = num(name)
        const pts: [number, number][] = []
        for (let i = 0; i < time.length; i++) if (v[i] != null) pts.push([i, v[i] as number])
        const isTop = name === 'gann_swing_top'
        const isBot = name === 'gann_swing_bottom'
        series.push({
          name, type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
          symbol: isTop ? 'triangle' : isBot ? 'triangle' : 'diamond',
          symbolSize: 9, symbolRotate: isTop ? 180 : 0,
          itemStyle: { color: isTop ? '#1ec8a5' : isBot ? '#ff5470' : '#ffb454' },
          data: pts,
        })
        return
      }
      // candle flags: boolean (doji 0/1) or directional (marubozu ±100)
      const v = num(name)
      const up: [number, number][] = []
      const dn: [number, number][] = []
      for (let i = 0; i < time.length; i++) {
        const x = v[i]
        if (x == null || x === 0) continue
        const y = (lows[i] ?? 0) * 0.998
        if (x < 0) dn.push([i, y])
        else up.push([i, y])
      }
      if (up.length) series.push({
        name: name + (dn.length ? ' +' : ''), type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
        symbol: 'pin', symbolSize: 9, itemStyle: { color: '#4dd2ff' }, data: up,
      })
      if (dn.length) series.push({
        name: name + ' −', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
        symbol: 'pin', symbolSize: 9, itemStyle: { color: '#ff5470' }, data: dn,
      })
    })

    // ── volume sub-pane ──────────────────────────────────────────────────────
    if (showVol) {
      const gi = subGridIndex['__vol__']
      series.push({
        name: 'volume', type: 'bar', xAxisIndex: gi, yAxisIndex: gi,
        data: time.map((_, i) => ({
          value: num('volume')[i] ?? 0,
          itemStyle: {
            color: (closes[i] ?? 0) >= (opens[i] ?? 0)
              ? 'rgba(30,200,165,0.5)' : 'rgba(255,84,112,0.5)',
          },
        })),
      })
    }

    // ── oscillator sub-panes, grouped by band ────────────────────────────────
    activeBands.forEach((band) => {
      const gi = subGridIndex[band]
      oscByBand[band].forEach((name, j) => {
        series.push({
          name, type: 'line', xAxisIndex: gi, yAxisIndex: gi,
          data: num(name), showSymbol: false, smooth: false,
          lineStyle: { color: PALETTE[j % PALETTE.length], width: 1.1 },
        })
      })
    })

    return {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', link: [{ xAxisIndex: 'all' }] },
        backgroundColor: 'rgba(10,16,32,0.95)', borderColor: '#1b2740',
        textStyle: { color: '#c7d3e6', fontSize: 11 },
        confine: true,
      },
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      legend: {
        type: 'scroll', top: 0, left: 64, right: 28,
        textStyle: { color: '#6b7a96', fontSize: 10 },
        icon: 'roundRect', itemWidth: 12, itemHeight: 4, pageIconColor: '#6b7a96',
      },
      grid: grids,
      xAxis: xAxes,
      yAxis: yAxes,
      series,
      dataZoom: [
        { type: 'inside', xAxisIndex: grids.map((_, i) => i), start: 55, end: 100 },
        {
          type: 'slider', xAxisIndex: grids.map((_, i) => i), bottom: 2, height: 14,
          start: 55, end: 100, borderColor: '#1b2740', fillerColor: 'rgba(47,155,255,0.15)',
          handleStyle: { color: '#2f9bff' }, textStyle: { color: '#6b7a96', fontSize: 9 },
          dataBackground: { lineStyle: { color: '#1b2740' }, areaStyle: { color: '#101a2e' } },
        },
      ],
    }
  }, [data, enabled])

  return (
    <ReactECharts
      option={option}
      notMerge
      style={{ height, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  )
}
