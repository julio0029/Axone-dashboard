import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import type { TibotModelRow } from '../data/tibotSuite'

const TARGET_COLORS = ['#4dd2ff', '#7c5cff', '#ffb454', '#1ec8a5', '#ff5470', '#9fe870']

export function TibotSuiteChart({
  model,
  selectedTargets,
}: {
  model: TibotModelRow
  selectedTargets?: string[]
}) {
  const option = useMemo<EChartsOption>(() => {
    const rows = model.sample.rowsData
    const times = rows.map((r) => shortTime(String(r.timestamp ?? ''), model.interval))
    const ohlc = rows.map((r) => [
      Number(r.open),
      Number(r.close),
      Number(r.low),
      Number(r.high),
    ])

    const activeTargets = selectedTargets?.length ? selectedTargets : model.targetColumns

    const targetSeries = activeTargets.flatMap((col, i) => {
      const predictionCol = predictionColumnFor(rows, col)
      const color = TARGET_COLORS[i % TARGET_COLORS.length]
      const series: Record<string, unknown>[] = [{
        name: `${col} · hard target`,
        type: 'line' as const,
        xAxisIndex: 2,
        yAxisIndex: 2,
        data: rows.map((r) => coerceTarget(r[col])),
        showSymbol: false,
        step: isDiscrete(rows.map((r) => r[col])) ? 'middle' as const : false as const,
        connectNulls: false,
        lineStyle: { width: 1.5, color },
        itemStyle: { color },
      }]
      if (predictionCol) {
        series.push({
          name: `${col} · model prediction`,
          type: 'line' as const,
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: rows.map((r) => coerceTarget(r[predictionCol])),
          showSymbol: false,
          step: false as const,
          connectNulls: false,
          lineStyle: { width: 1.3, color, type: 'dashed' as const, opacity: 0.82 },
          itemStyle: { color },
        })
      }
      return series
    })

    const predictionMissing = activeTargets.length > 0 && activeTargets.every((col) => !predictionColumnFor(rows, col))

    const graphic = [
      paneLabel('raw OHLCV', 5),
      paneLabel('volume', 57),
      paneLabel('hard target / model prediction', 76),
    ]
    if (predictionMissing) {
      graphic.push({
        type: 'text',
        right: 52,
        top: '76%',
        style: {
          text: 'model prediction series missing in reporting payload',
          fill: '#ffb454',
          font: '10px ui-monospace, monospace',
        },
        z: 10,
      })
    }

    return {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', link: [{ xAxisIndex: 'all' }] },
        backgroundColor: 'rgba(10,16,32,0.96)',
        borderColor: '#1b2740',
        textStyle: { color: '#c7d3e6', fontSize: 11 },
        valueFormatter: (v) => (typeof v === 'number' ? formatNum(v) : String(v ?? '-')),
      },
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      legend: {
        type: 'scroll',
        top: 0,
        left: 58,
        right: 52,
        textStyle: { color: '#6b7a96', fontSize: 10 },
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 4,
      },
      grid: [
        { left: 58, right: 52, top: '6%', height: '48%' },
        { left: 58, right: 52, top: '59%', height: '13%' },
        { left: 58, right: 52, top: '78%', height: '16%' },
      ],
      xAxis: [0, 1, 2].map((gridIndex) => ({
        type: 'category' as const,
        gridIndex,
        data: times,
        boundaryGap: true,
        axisLine: { lineStyle: { color: '#1b2740' } },
        axisLabel: { show: gridIndex === 2, color: '#6b7a96', fontSize: 10 },
        axisTick: { show: false },
        splitLine: { show: false },
      })),
      yAxis: [
        {
          scale: true,
          gridIndex: 0,
          splitLine: { lineStyle: { color: '#16203a' } },
          axisLabel: { color: '#6b7a96', fontSize: 10 },
        },
        {
          scale: true,
          gridIndex: 1,
          splitLine: { show: false },
          axisLabel: { color: '#6b7a96', fontSize: 9 },
        },
        {
          scale: true,
          gridIndex: 2,
          splitLine: { show: false },
          axisLabel: { color: '#6b7a96', fontSize: 9 },
        },
      ],
      graphic,
      series: [
        {
          name: 'OHLC',
          type: 'candlestick',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: ohlc,
          itemStyle: {
            color: '#1ec8a5',
            color0: '#ff5470',
            borderColor: '#1ec8a5',
            borderColor0: '#ff5470',
          },
        },
        {
          name: 'volume',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: rows.map((r) => ({
            value: Number(r.volume),
            itemStyle: {
              color: Number(r.close) >= Number(r.open) ? 'rgba(30,200,165,0.45)' : 'rgba(255,84,112,0.45)',
            },
          })),
        },
        ...targetSeries,
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1, 2], start: 55, end: 100 },
        {
          type: 'slider',
          xAxisIndex: [0, 1, 2],
          bottom: 4,
          height: 16,
          start: 55,
          end: 100,
          borderColor: '#1b2740',
          fillerColor: 'rgba(47,155,255,0.15)',
          handleStyle: { color: '#2f9bff' },
          textStyle: { color: '#6b7a96', fontSize: 9 },
        },
      ],
    }
  }, [model, selectedTargets])

  if (!model.sample.rowsData.length) {
    return <div className="h-[440px] flex items-center justify-center text-sm text-ax-muted">no joined rows in payload</div>
  }

  return <ReactECharts option={option} notMerge style={{ height: 560, width: '100%' }} opts={{ renderer: 'canvas' }} />
}

function predictionColumnFor(rows: Record<string, string | number | null>[], targetColumn: string): string | null {
  const candidates = [
    `prediction_${targetColumn}`,
    `pred_${targetColumn}`,
    `yhat_${targetColumn}`,
    `${targetColumn}_prediction`,
    `${targetColumn}_pred`,
  ]
  const sample = rows.find(Boolean)
  if (!sample) return null
  return candidates.find((name) => Object.prototype.hasOwnProperty.call(sample, name)) ?? null
}

function coerceTarget(v: string | number | null): number | null {
  if (v == null) return null
  if (typeof v === 'number') return v
  const parsed = Number(v)
  return Number.isFinite(parsed) ? parsed : null
}

function isDiscrete(values: (string | number | null)[]): boolean {
  const nums = values.filter((v): v is number => typeof v === 'number')
  if (!nums.length) return false
  return nums.every((v) => Number.isInteger(v) && Math.abs(v) <= 10)
}

function shortTime(iso: string, interval: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  if (interval === '1D') return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`
  return `${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
}

function formatNum(v: number): string {
  const abs = Math.abs(v)
  if (abs !== 0 && abs < 0.001) return v.toExponential(2)
  return abs < 1 ? v.toFixed(6) : v.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function paneLabel(text: string, topPct: number): Record<string, unknown> {
  return {
    type: 'text',
    left: 60,
    top: `${topPct}%`,
    style: { text, fill: '#6b7a96', font: '10px ui-monospace, monospace' },
    z: 10,
  }
}
