import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { classifyColumn, type TaV2Export, type ManifestColumn } from '../data/taV2Export'

const PALETTE = [
  '#4dd2ff', '#7c5cff', '#ffb454', '#1ec8a5', '#ff5470',
  '#2f9bff', '#c77dff', '#5ad1b0', '#ffd166', '#ef6f6c',
]

// Verified against the real export: the Gann swing columns are INVERTED vs their
// names. `gann_swing_bottom` values land on actual price PEAKS (swing tops) and
// `gann_swing_top` values land on actual TROUGHS (swing bottoms). Bind the marker
// to what each column truly marks, not to its name:
//   gann_swing_bottom → swing TOP    → green arrow above the high
//   gann_swing_top    → swing BOTTOM → red arrow below the low
const GANN_TOP_COL = 'gann_swing_bottom'
const GANN_BOTTOM_COL = 'gann_swing_top'

function fmtTime(ms: number, interval: string) {
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  const daily = /d|w|mo/i.test(interval) && !/m$/i.test(interval) // 1d/1w style
  if (daily) return `${d.getUTCMonth() + 1}/${p(d.getUTCDate())}`
  return `${d.getUTCMonth() + 1}/${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
}

export function SandboxChart({
  data, enabled, height = 600,
}: {
  data: TaV2Export
  enabled: Set<string>
  height?: number
}) {
  const option = useMemo<EChartsOption>(() => {
    const { time, columns, manifest } = data
    const col = (name: string): (number | null)[] => columns[name] ?? []
    const times = time.map((t) => fmtTime(t, manifest.interval))

    const ohlc = time.map((_, i) => [
      col('open')[i] ?? null, col('close')[i] ?? null,
      col('low')[i] ?? null, col('high')[i] ?? null,
    ])
    const lows = col('low')

    // partition the enabled columns by render role
    const byName: Record<string, ManifestColumn> = {}
    for (const c of manifest.columns) byName[c.name] = c
    const roleOf = (name: string) =>
      classifyColumn(byName[name] ?? { name, dtype: 'float' })

    const overlays: string[] = []
    const oscillators: string[] = []
    const markers: string[] = []
    let showVol = false
    for (const name of manifest.columns.map((c) => c.name)) {
      if (!enabled.has(name)) continue
      const role = roleOf(name)
      if (role === 'overlay') overlays.push(name)
      else if (role === 'oscillator') oscillators.push(name)
      else if (role === 'marker') markers.push(name)
      else if (role === 'volume') showVol = true
    }

    // candlestick (price columns) is itself toggleable: render it only when all
    // present price columns are enabled, so O/H/L/C behave as independent toggles.
    const priceCols = manifest.columns
      .filter((c) => classifyColumn(c) === 'price')
      .map((c) => c.name)
    const showCandles = priceCols.length > 0 && priceCols.every((n) => enabled.has(n))

    const subs: string[] = [...(showVol ? ['__vol__'] : []), ...oscillators]
    const nSub = subs.length

    // vertical layout — main panel on top, sub-panels share the lower band
    const mainTop = 6
    const mainHeight = nSub === 0 ? 84 : 46
    const subTop = 60
    const subBand = 36 // % of height available to sub-panels
    const gap = 2
    const subH = nSub > 0 ? Math.max(6, (subBand - gap * (nSub - 1)) / nSub) : 0

    const grids: NonNullable<EChartsOption['grid']> = [
      { left: 58, right: 26, top: `${mainTop}%`, height: `${mainHeight}%` },
    ]
    const subGridIndex: Record<string, number> = {}
    subs.forEach((s, i) => {
      subGridIndex[s] = i + 1
      grids.push({ left: 58, right: 26, top: `${subTop + i * (subH + gap)}%`, height: `${subH}%` })
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
      splitLine: { show: i === 0, lineStyle: { color: '#16203a' } },
      axisLine: { lineStyle: { color: '#1b2740' } },
      axisLabel: { color: '#6b7a96', fontSize: 10 },
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
        data: col(name), smooth: true, showSymbol: false,
        lineStyle: { color: PALETTE[i % PALETTE.length], width: 1.3, opacity: 0.9 },
      })
    })

    markers.forEach((name) => {
      const highs = col('high')

      // Chronos Gate-A: a single certified swing-DIRECTION column (+1 up / -1
      // down / null). A sign flip is a confirmed Gann swing pivot — the candle
      // closing the prior leg. up→down ends an up-leg → swing TOP (green ▲ above
      // the high); down→up ends a down-leg → swing BOTTOM (red ▼ below the low).
      // This is a deterministic read of the certified column — nothing invented.
      if (name === 'gann_swing') {
        const dir = col(name)
        const tops: [number, number][] = []
        const bottoms: [number, number][] = []
        for (let i = 1; i < time.length; i++) {
          const prev = dir[i - 1]
          const cur = dir[i]
          if (prev == null || cur == null || prev === cur) continue
          if (prev === 1 && cur === -1) tops.push([i - 1, (highs[i - 1] ?? 0) * 1.0008])
          else if (prev === -1 && cur === 1) bottoms.push([i - 1, (lows[i - 1] ?? 0) * 0.9992])
        }
        series.push({
          name: 'gann swing top', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
          symbol: 'triangle', symbolSize: 9, symbolRotate: 180,
          itemStyle: { color: '#1ec8a5' }, data: tops,
        })
        series.push({
          name: 'gann swing bottom', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
          symbol: 'triangle', symbolSize: 9, symbolRotate: 0,
          itemStyle: { color: '#ff5470' }, data: bottoms,
        })
        return
      }

      const isGannTop = name === GANN_TOP_COL
      const isGannBottom = name === GANN_BOTTOM_COL
      const pts: [number, number][] = []
      for (let i = 0; i < time.length; i++) {
        const v = col(name)[i]
        if (v === null || v === undefined || v === 0 || Number.isNaN(v as number)) continue
        if (isGannTop) pts.push([i, (highs[i] ?? (v as number)) * 1.0008]) // just above the high
        else if (isGannBottom) pts.push([i, (lows[i] ?? (v as number)) * 0.9992]) // just below the low
        else pts.push([i, (lows[i] ?? 0) * 0.999]) // generic flags sit at the low
      }
      if (isGannTop || isGannBottom) {
        series.push({
          // swing TOP  → green arrow above the high (down-pointing onto the peak)
          // swing BOTTOM → red arrow below the low (up-pointing under the trough)
          name: isGannTop ? 'gann swing top' : 'gann swing bottom',
          type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
          symbol: 'triangle', symbolSize: 10, symbolRotate: isGannTop ? 180 : 0,
          itemStyle: { color: isGannTop ? '#1ec8a5' : '#ff5470' },
          data: pts,
        })
      } else {
        series.push({
          name, type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
          symbol: 'triangle', symbolSize: 7, symbolRotate: 0,
          itemStyle: { color: /bear/.test(name) ? '#ff5470' : '#4dd2ff' },
          data: pts,
        })
      }
    })

    if (showVol) {
      const gi = subGridIndex['__vol__']
      series.push({
        name: 'volume', type: 'bar', xAxisIndex: gi, yAxisIndex: gi,
        data: time.map((_, i) => ({
          value: col('volume')[i] ?? 0,
          itemStyle: {
            color: (col('close')[i] ?? 0) >= (col('open')[i] ?? 0)
              ? 'rgba(30,200,165,0.5)' : 'rgba(255,84,112,0.5)',
          },
        })),
      })
    }

    oscillators.forEach((name, i) => {
      const gi = subGridIndex[name]
      series.push({
        name, type: 'line', xAxisIndex: gi, yAxisIndex: gi,
        data: col(name), showSymbol: false, smooth: true,
        lineStyle: { color: PALETTE[(i + 3) % PALETTE.length], width: 1.3 },
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
      },
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      legend: {
        type: 'scroll', top: 0, left: 58, right: 26,
        textStyle: { color: '#6b7a96', fontSize: 10 },
        icon: 'roundRect', itemWidth: 12, itemHeight: 4,
      },
      grid: grids,
      xAxis: xAxes,
      yAxis: yAxes,
      series,
      dataZoom: [
        { type: 'inside', xAxisIndex: grids.map((_, i) => i), start: 60, end: 100 },
        {
          type: 'slider', xAxisIndex: grids.map((_, i) => i), bottom: 4, height: 14,
          start: 60, end: 100, borderColor: '#1b2740', fillerColor: 'rgba(47,155,255,0.15)',
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
