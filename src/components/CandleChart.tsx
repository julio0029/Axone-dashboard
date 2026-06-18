import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import {
  type Candle, type Timeframe,
  ema, sma, rsi as calcRsi, bollinger, swings,
} from '../data/kerry'

function fmtTime(ms: number, tf: Timeframe) {
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  if (tf === '1d') return `${d.getMonth() + 1}/${p(d.getDate())}`
  return `${d.getMonth() + 1}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function CandleChart({
  candles, tf, enabled,
}: {
  candles: Candle[]
  tf: Timeframe
  enabled: Set<string>
}) {
  const option = useMemo<EChartsOption>(() => {
    const times = candles.map((c) => fmtTime(c.time, tf))
    const ohlc = candles.map((c) => [c.open, c.close, c.low, c.high])
    const closes = candles.map((c) => c.close)

    const showVol = enabled.has('volume')
    const showRsi = enabled.has('rsi')
    const subs = [showVol && 'vol', showRsi && 'rsi'].filter(Boolean) as string[]
    const nSub = subs.length

    // panel layout (top/height %)
    const layout = nSub === 0
      ? { main: [4, 84], vol: [0, 0], rsi: [0, 0] }
      : nSub === 1
      ? { main: [4, 62], vol: [72, 18], rsi: [72, 18] }
      : { main: [3, 50], vol: [58, 16], rsi: [78, 15] }

    const grids = [{ left: 56, right: 24, top: `${layout.main[0]}%`, height: `${layout.main[1]}%` }]
    const gridIndex: Record<string, number> = {}
    subs.forEach((s, i) => {
      gridIndex[s] = i + 1
      const pos = s === 'vol' ? layout.vol : layout.rsi
      grids.push({ left: 56, right: 24, top: `${pos[0]}%`, height: `${pos[1]}%` })
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
    const yAxes = grids.map((_, i) => ({
      scale: true,
      gridIndex: i,
      splitLine: { show: i === 0, lineStyle: { color: '#16203a' } },
      axisLine: { lineStyle: { color: '#1b2740' } },
      axisLabel: {
        color: '#6b7a96',
        fontSize: 10,
        inside: false,
      },
    }))

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

    // overlays
    const addLine = (name: string, data: (number | null)[], color: string, width = 1.4, dashed = false) =>
      series.push({
        name, type: 'line', xAxisIndex: 0, yAxisIndex: 0,
        data, smooth: true, showSymbol: false,
        lineStyle: { color, width, type: dashed ? 'dashed' : 'solid', opacity: 0.9 },
      })

    if (enabled.has('ema20')) addLine('EMA 20', ema(closes, 20), '#4dd2ff')
    if (enabled.has('ema50')) addLine('EMA 50', ema(closes, 50), '#7c5cff')
    if (enabled.has('ma200')) addLine('MA 200', sma(closes, 200), '#ffb454')
    if (enabled.has('boll')) {
      const b = bollinger(closes, 20, 2)
      addLine('BB upper', b.upper, 'rgba(47,155,255,0.5)', 1, true)
      addLine('BB mid', b.mid, 'rgba(47,155,255,0.35)', 1, true)
      addLine('BB lower', b.lower, 'rgba(47,155,255,0.5)', 1, true)
    }
    if (enabled.has('swings')) {
      const { highs, lows } = swings(candles, 4)
      series.push({
        name: 'Swing high', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
        symbol: 'triangle', symbolSize: 9, symbolRotate: 180,
        itemStyle: { color: '#ff5470' },
        data: highs.map((h) => [h.idx, h.price]),
      })
      series.push({
        name: 'Swing low', type: 'scatter', xAxisIndex: 0, yAxisIndex: 0,
        symbol: 'triangle', symbolSize: 9,
        itemStyle: { color: '#1ec8a5' },
        data: lows.map((l) => [l.idx, l.price]),
      })
    }

    if (showVol) {
      series.push({
        name: 'Volume', type: 'bar',
        xAxisIndex: gridIndex.vol, yAxisIndex: gridIndex.vol,
        data: candles.map((c) => ({
          value: c.volume,
          itemStyle: { color: c.close >= c.open ? 'rgba(30,200,165,0.5)' : 'rgba(255,84,112,0.5)' },
        })),
      })
    }
    if (showRsi) {
      series.push({
        name: 'RSI 14', type: 'line',
        xAxisIndex: gridIndex.rsi, yAxisIndex: gridIndex.rsi,
        data: calcRsi(closes, 14), showSymbol: false, smooth: true,
        lineStyle: { color: '#4dd2ff', width: 1.4 },
        markLine: {
          silent: true, symbol: 'none',
          lineStyle: { color: '#6b7a96', type: 'dashed', opacity: 0.4 },
          data: [{ yAxis: 70 }, { yAxis: 30 }],
        },
      })
    }

    return {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', link: [{ xAxisIndex: 'all' }] },
        backgroundColor: 'rgba(10,16,32,0.95)',
        borderColor: '#1b2740',
        textStyle: { color: '#c7d3e6', fontSize: 11 },
      },
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      legend: {
        top: 0, left: 56, textStyle: { color: '#6b7a96', fontSize: 10 },
        icon: 'roundRect', itemWidth: 12, itemHeight: 4,
      },
      grid: grids,
      xAxis: xAxes,
      yAxis: yAxes,
      series,
      dataZoom: [
        { type: 'inside', xAxisIndex: grids.map((_, i) => i), start: 55, end: 100 },
        {
          type: 'slider', xAxisIndex: grids.map((_, i) => i), bottom: 6, height: 16,
          start: 55, end: 100,
          borderColor: '#1b2740', fillerColor: 'rgba(47,155,255,0.15)',
          handleStyle: { color: '#2f9bff' }, textStyle: { color: '#6b7a96', fontSize: 9 },
          dataBackground: { lineStyle: { color: '#1b2740' }, areaStyle: { color: '#101a2e' } },
        },
      ],
    }
  }, [candles, tf, enabled])

  return (
    <ReactECharts
      option={option}
      notMerge
      style={{ height: 560, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  )
}
