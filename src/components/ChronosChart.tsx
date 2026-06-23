import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import {
  type ChronosExport, type ChronosTf, type TargetColumn,
  BAND_ORDER, DIR_COLOR,
} from '../data/chronosTargets'

function fmtTime(ms: number, tf: ChronosTf) {
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return tf === '1h'
    ? `${d.getMonth() + 1}/${p(d.getDate())} ${p(d.getHours())}:00`
    : `${d.getMonth() + 1}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// distinct colours for the numeric line series inside a sub-pane
const LINE_COLORS = ['#4dd2ff', '#7c5cff', '#ffb454', '#1ec8a5', '#ff5470', '#2f9bff']

/** Chronos predictive-targets chart.
 *  Price pane: candlesticks (+ optional volume sub-pane).
 *  Direction targets → categorical "label ribbons" (one thin pane each).
 *  Numeric targets   → banded sub-panes (one per enabled band; series per col). */
export function ChronosChart({
  data, tf, enabled, showVolume,
}: {
  data: ChronosExport
  tf: ChronosTf
  enabled: Set<string>
  showVolume: boolean
}) {
  const option = useMemo<EChartsOption>(() => {
    const cols = data.columns
    const times = data.time.map((t) => fmtTime(t, tf))
    const ohlc = data.time.map((_, i) => [
      cols.open[i] as number, cols.close[i] as number,
      cols.low[i] as number, cols.high[i] as number,
    ])

    const enabledCols = data.manifest.columns.filter((c) => enabled.has(c.name))
    const dirCols = enabledCols.filter((c) => c.role === 'direction')
    const numCols = enabledCols.filter((c) => c.role === 'numeric')

    // numeric bands present, ordered
    const bands = BAND_ORDER.filter((b) => numCols.some((c) => c.band === b))

    // ── sub-pane plan: volume → direction ribbons → numeric band panes ──────
    type Pane =
      | { kind: 'vol' }
      | { kind: 'dir'; col: TargetColumn }
      | { kind: 'num'; band: string; label: string; cols: TargetColumn[] }
    const panes: Pane[] = []
    if (showVolume) panes.push({ kind: 'vol' })
    dirCols.forEach((col) => panes.push({ kind: 'dir', col }))
    bands.forEach((b) => {
      const bc = numCols.filter((c) => c.band === b)
      panes.push({ kind: 'num', band: b, label: bc[0]?.bandLabel || b, cols: bc })
    })

    // ── vertical layout: main pane + weighted sub-panes ─────────────────────
    const weight = (p: Pane) => (p.kind === 'dir' ? 0.5 : 1)
    const totalW = panes.reduce((s, p) => s + weight(p), 0)
    const MAIN_TOP = 4
    const mainH = panes.length === 0 ? 84 : 46
    const subTop0 = MAIN_TOP + mainH + 5
    const subSpace = 100 - subTop0 - 3
    const gap = 2.2

    const grids = [{ left: 58, right: 56, top: `${MAIN_TOP}%`, height: `${mainH}%` }]
    const paneTop: number[] = []
    let cursor = subTop0
    const usableSub = subSpace - gap * Math.max(0, panes.length - 1)
    panes.forEach((p) => {
      const h = (usableSub * weight(p)) / totalW
      paneTop.push(cursor)
      grids.push({ left: 58, right: 56, top: `${cursor}%`, height: `${h}%` })
      cursor += h + gap
    })
    const nGrid = grids.length

    const xAxes = grids.map((_, i) => ({
      type: 'category' as const,
      gridIndex: i,
      data: times,
      boundaryGap: true,
      axisLine: { lineStyle: { color: '#1b2740' } },
      axisLabel: { show: i === nGrid - 1, color: '#6b7a96', fontSize: 10 },
      axisTick: { show: false },
      splitLine: { show: false },
      axisPointer: { label: { show: i === nGrid - 1 } },
    }))

    const yAxes = grids.map((_, i) => {
      if (i === 0) {
        return {
          scale: true, gridIndex: 0,
          splitLine: { show: true, lineStyle: { color: '#16203a' } },
          axisLine: { lineStyle: { color: '#1b2740' } },
          axisLabel: { color: '#6b7a96', fontSize: 10 },
        }
      }
      const pane = panes[i - 1]
      if (pane.kind === 'dir') {
        // hidden axis — ribbon bars fill the pane height
        return {
          gridIndex: i, min: 0, max: 1, show: false,
          axisLine: { show: false }, axisLabel: { show: false },
          splitLine: { show: false }, axisTick: { show: false },
        }
      }
      return {
        scale: true, gridIndex: i,
        splitLine: { show: false },
        axisLine: { lineStyle: { color: '#1b2740' } },
        axisLabel: { color: '#6b7a96', fontSize: 9, showMinLabel: false, showMaxLabel: true },
        splitNumber: 2,
      }
    })

    type Series = NonNullable<EChartsOption['series']>
    const series: Series = [
      {
        name: 'OHLC', type: 'candlestick', xAxisIndex: 0, yAxisIndex: 0,
        data: ohlc,
        itemStyle: {
          color: '#1ec8a5', color0: '#ff5470',
          borderColor: '#1ec8a5', borderColor0: '#ff5470',
        },
      },
    ]

    // graphic labels pinned to each sub-pane (band / ribbon name)
    const graphic: Record<string, unknown>[] = []

    panes.forEach((p, idx) => {
      const gi = idx + 1
      const topPct = paneTop[idx]
      if (p.kind === 'vol') {
        series.push({
          name: 'Volume', type: 'bar', xAxisIndex: gi, yAxisIndex: gi,
          data: data.time.map((_, i) => ({
            value: cols.volume[i] as number,
            itemStyle: {
              color: (cols.close[i] as number) >= (cols.open[i] as number)
                ? 'rgba(30,200,165,0.45)' : 'rgba(255,84,112,0.45)',
            },
          })),
        })
        graphic.push(paneLabel('Volume', topPct))
      } else if (p.kind === 'dir') {
        const vals = cols[p.col.name] as (string | null)[]
        series.push({
          name: p.col.name, type: 'bar', xAxisIndex: gi, yAxisIndex: gi,
          barWidth: '100%', barCategoryGap: '0%',
          data: vals.map((v) => ({
            value: v == null ? 0 : 1,
            itemStyle: { color: v == null ? 'transparent' : (DIR_COLOR[v] ?? '#3b4a66'), opacity: 0.85 },
          })),
          tooltip: { show: true },
        })
        graphic.push(paneLabel(ribbonLabel(p.col.name), topPct))
      } else {
        p.cols.forEach((c, ci) => {
          series.push({
            name: c.name, type: 'line', xAxisIndex: gi, yAxisIndex: gi,
            data: cols[c.name] as (number | null)[],
            showSymbol: false, smooth: false, connectNulls: false,
            lineStyle: { color: LINE_COLORS[ci % LINE_COLORS.length], width: 1.3 },
            itemStyle: { color: LINE_COLORS[ci % LINE_COLORS.length] },
          })
        })
        graphic.push(paneLabel(p.label, topPct))
      }
    })

    return {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', link: [{ xAxisIndex: 'all' }] },
        backgroundColor: 'rgba(10,16,32,0.96)',
        borderColor: '#1b2740',
        textStyle: { color: '#c7d3e6', fontSize: 11 },
        valueFormatter: (v) =>
          typeof v === 'number' ? (Math.abs(v) < 1 ? v.toFixed(4) : v.toLocaleString()) : String(v ?? '—'),
      },
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      legend: {
        type: 'scroll', top: 0, left: 58, right: 56,
        textStyle: { color: '#6b7a96', fontSize: 10 },
        icon: 'roundRect', itemWidth: 12, itemHeight: 4,
      },
      grid: grids,
      xAxis: xAxes,
      yAxis: yAxes,
      graphic: graphic as EChartsOption['graphic'],
      series,
      dataZoom: [
        { type: 'inside', xAxisIndex: grids.map((_, i) => i), start: 60, end: 100 },
        {
          type: 'slider', xAxisIndex: grids.map((_, i) => i), bottom: 4, height: 16,
          start: 60, end: 100,
          borderColor: '#1b2740', fillerColor: 'rgba(47,155,255,0.15)',
          handleStyle: { color: '#2f9bff' }, textStyle: { color: '#6b7a96', fontSize: 9 },
          dataBackground: { lineStyle: { color: '#1b2740' }, areaStyle: { color: '#101a2e' } },
        },
      ],
    }
  }, [data, tf, enabled, showVolume])

  // pane count drives height so panes never crush
  const paneCount = useMemo(() => {
    const ec = data.manifest.columns.filter((c) => enabled.has(c.name))
    const dirs = ec.filter((c) => c.role === 'direction').length
    const bands = new Set(ec.filter((c) => c.role === 'numeric').map((c) => c.band)).size
    return (showVolume ? 1 : 0) + dirs + bands
  }, [data, enabled, showVolume])

  return (
    <ReactECharts
      option={option}
      notMerge
      style={{ height: 480 + paneCount * 70, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  )
}

function paneLabel(text: string, topPct: number): Record<string, unknown> {
  return {
    type: 'text', left: 60, top: `${topPct - 1.6}%`,
    style: { text, fill: '#6b7a96', font: '10px ui-monospace, monospace' },
    z: 10,
  }
}

function ribbonLabel(name: string): string {
  return name.replace(/^target_/, '').replace(/_/g, ' ')
}
