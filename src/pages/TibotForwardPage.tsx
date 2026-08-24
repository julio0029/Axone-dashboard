import { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { Card } from '../components/Card'
import {
  useTibotForward, shortHash, fmtDate,
  type TboHeatmapCell,
  type ConfidenceBin, type CalibrationPoint, type MatrixCell,
} from '../data/tibotForward'

// ── colours ────────────────────────────────────────────────────────────────
const C = {
  up: '#1ec8a5',
  down: '#ff5470',
  nmm: '#6b7a96',
  neutral: '#4dd2ff',
  blue: '#2f9bff',
  warn: '#ffb454',
  muted: '#6b7a96',
  bg2: '#0d1625',
  border: '#1b2740',
}

// ── small helpers ──────────────────────────────────────────────────────────
function pct(v: number | null | undefined, dp = 1) {
  if (v == null) return '—'
  return `${(v * 100).toFixed(dp)}%`
}
function fmt(v: number | null | undefined, dp = 4) {
  if (v == null) return '—'
  return v.toFixed(dp)
}

type VerdictTone = 'pass' | 'marginal' | 'blocked' | 'excluded' | 'flag' | 'retracted' | 'monitoring' | 'caution'
function verdictColor(s: string): string {
  const sl = s.toLowerCase()
  if (sl.includes('retract')) return C.muted
  if (sl.includes('resolv')) return C.muted
  if (sl.includes('blocked')) return C.warn
  if (sl.includes('excluded')) return '#4a5568'
  if (sl.includes('pass-marginal') || sl.includes('caution') || sl.includes('monitoring')) return C.warn
  if (sl.includes('pass') || sl.includes('live_validated')) return C.up
  if (sl.includes('fail') || sl.includes('blocker')) return C.down
  if (sl.includes('flag') || sl.includes('extended') || sl.includes('superseded')) return '#e8a838'
  return C.muted
}

function StatusPill({ label, tone }: { label: string; tone?: VerdictTone }) {
  const color = verdictColor(tone ?? label)
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-wide"
      style={{ color, background: color + '22', border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  )
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-ax-muted uppercase tracking-widest">{label}</span>
      <span className="font-mono text-xl tracking-tight mt-0.5" style={{ color: color ?? C.neutral }}>{value}</span>
      {sub && <span className="text-[10px] text-ax-muted mt-0.5">{sub}</span>}
    </div>
  )
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-ax-bg-2 border border-ax-border/70 text-ax-text text-xs rounded px-2 py-1.5 focus:outline-none focus:border-ax-blue/50"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Section 1: Top-Level Summary ───────────────────────────────────────────
function SummarySection({ data }: { data: ReturnType<typeof useTibotForward>['data'] }) {
  if (!data) return null
  const { totals, integrity, sentinel_verdicts } = data

  return (
    <Card
      title="Validation Summary"
      subtitle={`TX ${data.tx_ref}`}
      right={
        <div className="flex flex-col items-end gap-1">
          <StatusPill label="SENTINEL PASS" />
          <span className="text-[10px] text-ax-muted">Initial + Re-audit both complete</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banners */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded text-sm font-display tracking-wide ax-glow-text border border-ax-blue/40 bg-ax-blue/10">
            {data.banner}
          </span>
          <span className="px-3 py-1.5 rounded text-xs text-ax-muted border border-ax-border/50">
            {data.sub_banner}
          </span>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5 pt-1">
          <Stat label="Total Predictions" value={totals.total_forward_predictions.toLocaleString()} />
          <Stat label="TBO Records" value={totals.tbo_records.toString()} sub="triple_barrier_outcome" />
          <Stat label="BQ Records" value={totals.bq_records.toLocaleString()} sub="breakout_quality" />
          <Stat label="TBO Matched" value={totals.tbo_matched.toString()} sub={`${totals.tbo_pending} pending`} color={C.up} />
          <Stat label="BQ Matched" value={totals.bq_matched.toLocaleString()} sub={`${totals.bq_pending} pending`} color={C.up} />
          <Stat label="Validation Period" value="2026-08-16" sub="to 2026-08-24" />
        </div>

        {/* Integrity row */}
        <div className="border-t border-ax-border/50 pt-4">
          <p className="text-[10px] text-ax-muted uppercase tracking-widest mb-2">Integrity & Audit Status</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-ax-muted">Leakage check</span>
              <StatusPill label={integrity.leakage_verdict} />
              <span className="text-[10px] text-ax-muted">({integrity.leakage_total_checked?.toLocaleString()} records, 0 fails)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-ax-muted">Timestamp integrity</span>
              <StatusPill label={integrity.timestamp_integrity} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-ax-muted">Outcome matching</span>
              <StatusPill label="PARTIAL" tone="monitoring" />
              <span className="text-[10px] text-ax-muted">(TBO h6/h12 + BQ h1 matched; h24/h48 pending barrier close)</span>
            </div>
          </div>
        </div>

        {/* Sentinel verdicts */}
        <div className="border-t border-ax-border/50 pt-4">
          <p className="text-[10px] text-ax-muted uppercase tracking-widest mb-2">Sentinel Audit Verdicts</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-ax-border/50 bg-ax-bg-2/60 p-3">
              <p className="text-xs text-ax-muted mb-2">Initial Audit — {sentinel_verdicts.initial_audit.audit_file}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(sentinel_verdicts.initial_audit)
                  .filter(([k]) => k !== 'audit_file')
                  .map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1">
                      <span className="text-[10px] text-ax-muted">{k.toUpperCase().replace(/_/g, ' ')}:</span>
                      <StatusPill label={String(v).split(' —')[0]} />
                    </div>
                  ))}
              </div>
            </div>
            <div className="rounded-lg border border-ax-border/50 bg-ax-bg-2/60 p-3">
              <p className="text-xs text-ax-muted mb-2">Re-audit — {sentinel_verdicts.reaudit.audit_file}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(sentinel_verdicts.reaudit)
                  .filter(([k]) => k !== 'audit_file')
                  .map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1">
                      <span className="text-[10px] text-ax-muted">{k.toUpperCase().replace(/_/g, ' ')}:</span>
                      <StatusPill label={String(v)} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key decisions */}
        <div className="border-t border-ax-border/50 pt-4 space-y-1">
          <p className="text-[10px] text-ax-muted uppercase tracking-widest mb-2">Sentinel Decisions</p>
          {Object.entries(sentinel_verdicts.decisions).map(([k, v]) => (
            <div key={k} className="flex items-start gap-2 text-xs">
              <span className="text-ax-muted shrink-0">{k.replace(/_/g, ' ')}:</span>
              <span className="text-ax-text">{v}</span>
            </div>
          ))}
        </div>

        {/* Chronos link */}
        <div className="border-t border-ax-border/50 pt-3 text-[10px] text-ax-muted font-mono">
          Chronos manifest SHA256: {shortHash(String(integrity.chronos_manifest_sha256))}…
          &nbsp;·&nbsp; Matching run: {fmtDate(String(integrity.matching_run_timestamp))}
        </div>
      </div>
    </Card>
  )
}

// ── Section 2: Family Status ───────────────────────────────────────────────
function FamilyStatusSection({ data }: { data: ReturnType<typeof useTibotForward>['data'] }) {
  if (!data) return null

  type FamilyRecord = { intervals?: Record<string, { status: string; verdict?: string; note?: string; reason?: string }> } | { status: string; reason?: string }

  const families = data.family_status as Record<string, FamilyRecord>

  return (
    <Card title="Family Validation Status" subtitle="Live-validated / Blocked / Excluded per family & interval">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {Object.entries(families).map(([family, info]) => {
          const hasIntervals = 'intervals' in info && info.intervals
          const color = verdictColor(
            hasIntervals
              ? Object.values(info.intervals!)[0]?.status ?? ''
              : (info as { status: string }).status
          )
          return (
            <div
              key={family}
              className="rounded-lg border p-3 flex flex-col gap-2"
              style={{ borderColor: color + '44', background: color + '11' }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs text-ax-text">{family}</span>
                {!hasIntervals && (
                  <StatusPill label={(info as { status: string }).status} />
                )}
              </div>
              {hasIntervals ? (
                <div className="space-y-1">
                  {Object.entries(info.intervals!).map(([iv, ivInfo]) => (
                    <div key={iv} className="flex items-start gap-2 text-xs">
                      <span className="text-ax-muted w-8 shrink-0">{iv}</span>
                      <StatusPill label={ivInfo.status.replace('LIVE_VALIDATED', 'VALIDATED')} />
                      {ivInfo.verdict && <StatusPill label={ivInfo.verdict} />}
                      <span className="text-ax-muted text-[10px]">{ivInfo.note ?? ivInfo.reason}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-ax-muted">{(info as { status: string; reason?: string }).reason}</p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Section 3: Prediction Explorer ────────────────────────────────────────
const PRED_COLORS: Record<string, string> = {
  up: C.up,
  down: C.down,
  no_material_move: C.muted,
  '1': C.up,
  '-1': C.down,
  '0': C.muted,
}

function fmtTs(iso: string) {
  if (!iso) return ''
  return iso.replace('T', ' ').slice(0, 16)
}

function PredictionExplorer({ data }: { data: ReturnType<typeof useTibotForward>['data'] }) {
  if (!data) return null

  const [family, setFamily] = useState('tbo')
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setInterval] = useState('1h')
  const [horizon, setHorizon] = useState('all')
  const [outcome, setOutcome] = useState('all')
  const [correct, setCorrect] = useState('all')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  const allRecords = useMemo(() => {
    return [...data.explorer.tbo, ...data.explorer.bq]
  }, [data])

  const symbols = useMemo(() => Array.from(new Set(allRecords.map((r) => r.symbol))).sort(), [allRecords])
  const intervals = useMemo(() => {
    const src = family === 'tbo' ? data.explorer.tbo : data.explorer.bq
    return Array.from(new Set(src.map((r) => r.interval))).sort()
  }, [family, data])
  const horizons = useMemo(() => {
    const src = family === 'tbo' ? data.explorer.tbo : data.explorer.bq
    return Array.from(new Set(src.map((r) => r.horizon))).sort()
  }, [family, data])

  const filtered = useMemo(() => {
    const src = family === 'tbo' ? data.explorer.tbo : data.explorer.bq
    return src.filter((r) => {
      if (symbol !== 'all' && r.symbol !== symbol) return false
      if (interval !== 'all' && r.interval !== interval) return false
      if (horizon !== 'all' && r.horizon !== horizon) return false
      if (outcome !== 'all' && r.prediction !== outcome) return false
      if (correct === 'correct' && r.correct !== true) return false
      if (correct === 'incorrect' && r.correct !== false) return false
      if (correct === 'pending' && r.correct !== null) return false
      return true
    })
  }, [family, symbol, interval, horizon, outcome, correct, data])

  const paged = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page])
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  // OHLCV for the current symbol/interval combination
  const ohlcvKey = `${symbol}_${interval}`
  const ohlcvRaw = data.ohlcv[ohlcvKey] ?? []

  // Build ECharts option for the candle+prediction chart
  const chartOption = useMemo<EChartsOption>(() => {
    if (!ohlcvRaw.length) return {}

    const times = ohlcvRaw.map(([ts]) => {
      const d = new Date(ts)
      const pad = (n: number) => String(n).padStart(2, '0')
      if (interval === '1D') return `${d.getMonth() + 1}/${pad(d.getDate())}`
      return `${d.getMonth() + 1}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    })
    const ohlc = ohlcvRaw.map(([, o, h, l, c]) => [o, c, l, h])
    const vol = ohlcvRaw.map(([, o, , , c, v]) => ({
      value: v,
      itemStyle: { color: c >= o ? 'rgba(30,200,165,0.4)' : 'rgba(255,84,112,0.4)' },
    }))

    // Map prediction timestamps to candle indices
    const tsIndex: Record<string, number> = {}
    ohlcvRaw.forEach(([ts], i) => { tsIndex[ts] = i })

    // Use the filtered records for overlays (limit to current sym/iv/horizon for clarity)
    const overlayRecords = filtered.filter(
      (r) => r.symbol === symbol && r.interval === interval
    ).slice(0, 200) // cap for chart performance

    const predScatter = overlayRecords.map((r) => {
      const ts = new Date(r.candle_timestamp).getTime()
      // Find nearest candle index
      let nearestIdx = -1
      let minDiff = Infinity
      ohlcvRaw.forEach(([cts], i) => {
        const diff = Math.abs(cts - ts)
        if (diff < minDiff) { minDiff = diff; nearestIdx = i }
      })
      if (nearestIdx < 0) return null
      const candle = ohlcvRaw[nearestIdx]
      const price = candle[2] * 0.998 // slightly below low
      const pred = r.prediction
      const col = r.correct === true ? C.up : r.correct === false ? C.down : C.muted
      return { value: [nearestIdx, price], itemStyle: { color: col }, pred, conf: r.confidence, real: r.realized_outcome }
    }).filter(Boolean)

    return {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', link: [{ xAxisIndex: 'all' }] },
        backgroundColor: 'rgba(10,16,32,0.95)',
        borderColor: C.border,
        textStyle: { color: '#c7d3e6', fontSize: 11 },
      },
      legend: {
        top: 0, left: 56, textStyle: { color: C.muted, fontSize: 10 },
        icon: 'roundRect', itemWidth: 12, itemHeight: 4,
      },
      grid: [
        { left: 56, right: 24, top: '6%', height: '62%' },
        { left: 56, right: 24, top: '73%', height: '18%' },
      ],
      xAxis: [
        {
          type: 'category', gridIndex: 0, data: times, boundaryGap: true,
          axisLine: { lineStyle: { color: C.border } },
          axisLabel: { show: false }, splitLine: { show: false },
          axisPointer: { label: { show: false } },
        },
        {
          type: 'category', gridIndex: 1, data: times, boundaryGap: true,
          axisLine: { lineStyle: { color: C.border } },
          axisLabel: { color: C.muted, fontSize: 10 },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          scale: true, gridIndex: 0,
          splitLine: { lineStyle: { color: '#16203a' } },
          axisLabel: { color: C.muted, fontSize: 10 },
        },
        {
          scale: true, gridIndex: 1,
          splitLine: { show: false },
          axisLabel: { color: C.muted, fontSize: 9 },
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      series: [
        {
          name: 'OHLC', type: 'candlestick', xAxisIndex: 0, yAxisIndex: 0,
          data: ohlc,
          itemStyle: { color: C.up, color0: C.down, borderColor: C.up, borderColor0: C.down },
        },
        {
          name: 'Predictions',
          type: 'scatter',
          xAxisIndex: 0, yAxisIndex: 0,
          symbolSize: 7,
          symbol: 'triangle',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: predScatter as any[],
          tooltip: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
              const d = params.data
              return `Pred: ${d.pred}<br/>Conf: ${(d.conf as number)?.toFixed(3)}<br/>Realized: ${d.real ?? 'pending'}`
            },
          },
        },
        {
          name: 'Volume', type: 'bar', xAxisIndex: 1, yAxisIndex: 1, data: vol,
        },
      ] as any,
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1], start: 40, end: 100 },
        {
          type: 'slider', xAxisIndex: [0, 1], bottom: 4, height: 16,
          start: 40, end: 100,
          borderColor: C.border, fillerColor: 'rgba(47,155,255,0.12)',
          handleStyle: { color: C.blue },
          textStyle: { color: C.muted, fontSize: 9 },
        },
      ],
    }
  }, [ohlcvRaw, filtered, symbol, interval, interval])

  const familyRecords = family === 'tbo' ? data.explorer.tbo : data.explorer.bq
  const outcomes = useMemo(() => Array.from(new Set(familyRecords.map((r) => r.prediction))).sort(), [familyRecords])

  return (
    <Card title="Prediction Explorer" subtitle="Filter predictions; OHLCV chart shows overlay markers colored by correctness">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={family}
            onChange={(v) => { setFamily(v); setHorizon('all'); setInterval('1h'); setPage(0) }}
            options={[{ value: 'tbo', label: 'triple_barrier_outcome' }, { value: 'bq', label: 'breakout_quality' }]}
          />
          <Select
            value={symbol}
            onChange={(v) => { setSymbol(v); setPage(0) }}
            options={[{ value: 'all', label: 'All symbols' }, ...symbols.map((s) => ({ value: s, label: s }))]}
          />
          <Select
            value={interval}
            onChange={(v) => { setInterval(v); setPage(0) }}
            options={[{ value: 'all', label: 'All intervals' }, ...intervals.map((s) => ({ value: s, label: s }))]}
          />
          {family === 'tbo' && (
            <Select
              value={horizon}
              onChange={(v) => { setHorizon(v); setPage(0) }}
              options={[{ value: 'all', label: 'All horizons' }, ...horizons.map((s) => ({ value: s, label: s }))]}
            />
          )}
          <Select
            value={outcome}
            onChange={(v) => { setOutcome(v); setPage(0) }}
            options={[{ value: 'all', label: 'All predictions' }, ...outcomes.map((s) => ({ value: s, label: s }))]}
          />
          <Select
            value={correct}
            onChange={(v) => { setCorrect(v); setPage(0) }}
            options={[
              { value: 'all', label: 'All outcomes' },
              { value: 'correct', label: 'Correct only' },
              { value: 'incorrect', label: 'Incorrect only' },
              { value: 'pending', label: 'Pending (no outcome)' },
            ]}
          />
          <span className="text-xs text-ax-muted ml-auto">{filtered.length.toLocaleString()} records</span>
        </div>

        {/* Chart */}
        {ohlcvRaw.length > 0 ? (
          <div>
            <div className="text-[10px] text-ax-muted mb-1">
              OHLCV — {symbol} / {interval} · Triangles = prediction markers (green=correct, red=incorrect, grey=pending)
            </div>
            <ReactECharts
              option={chartOption}
              notMerge
              style={{ height: 480, width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-ax-muted">
            No OHLCV data available for {symbol} / {interval}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-ax-border/50 text-ax-muted">
                <th className="text-left py-2 pr-3 font-normal">Timestamp</th>
                <th className="text-left py-2 pr-3 font-normal">Symbol</th>
                <th className="text-left py-2 pr-3 font-normal">TF</th>
                <th className="text-left py-2 pr-3 font-normal">Horizon</th>
                <th className="text-left py-2 pr-3 font-normal">Prediction</th>
                <th className="text-right py-2 pr-3 font-normal">Confidence</th>
                <th className="text-left py-2 pr-3 font-normal">Realized</th>
                <th className="text-left py-2 pr-3 font-normal">Correct</th>
                <th className="text-left py-2 font-normal">Model</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => (
                <tr key={i} className="border-b border-ax-border/30 hover:bg-white/3">
                  <td className="py-1.5 pr-3 font-mono text-ax-muted">{fmtTs(r.candle_timestamp)}</td>
                  <td className="py-1.5 pr-3">{r.symbol}</td>
                  <td className="py-1.5 pr-3">{r.interval}</td>
                  <td className="py-1.5 pr-3">{r.horizon}</td>
                  <td className="py-1.5 pr-3">
                    <span style={{ color: PRED_COLORS[r.prediction] ?? C.muted }}>{r.prediction}</span>
                  </td>
                  <td className="py-1.5 pr-3 text-right font-mono">{r.confidence?.toFixed(3)}</td>
                  <td className="py-1.5 pr-3">
                    {r.realized_outcome
                      ? <span style={{ color: PRED_COLORS[r.realized_outcome] ?? C.muted }}>{r.realized_outcome}</span>
                      : <span className="text-ax-muted">pending</span>}
                  </td>
                  <td className="py-1.5 pr-3">
                    {r.correct === true && <span style={{ color: C.up }}>✓</span>}
                    {r.correct === false && <span style={{ color: C.down }}>✗</span>}
                    {r.correct === null && <span className="text-ax-muted">—</span>}
                  </td>
                  <td className="py-1.5 font-mono text-[10px] text-ax-muted">{shortHash(r.model_sha256)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 justify-center pt-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs border border-ax-border/50 rounded disabled:opacity-30 hover:border-ax-blue/50"
            >
              ← Prev
            </button>
            <span className="text-xs text-ax-muted">Page {page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 text-xs border border-ax-border/50 rounded disabled:opacity-30 hover:border-ax-blue/50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Section 4: Prediction vs Reality ──────────────────────────────────────
function PredVsRealitySection({ data }: { data: ReturnType<typeof useTibotForward>['data'] }) {
  if (!data) return null
  const { tbo_metrics, bq_metrics } = data
  const tboPerf = tbo_metrics.forward_performance as Record<string, unknown>
  const bqPerf = bq_metrics.forward_performance as Record<string, unknown>

  // TBO confusion matrix (h6 + h12 combined)
  const tboConfusion = tboPerf.confusion_by_outcome_class as Record<string, Record<string, number>> | undefined
  const bqConfusion = bqPerf.confusion_by_outcome_class as Record<string, Record<string, number>> | undefined

  // TBO heatmap
  const heatmap: TboHeatmapCell[] = tbo_metrics.tbo_heatmap

  function ConfusionMatrix({ mat, title }: { mat: Record<string, Record<string, number>>; title: string }) {
    const actualClasses = Object.keys(mat)
    const predClasses = Array.from(new Set(actualClasses.flatMap((ac) => Object.keys(mat[ac]))))
    const maxVal = Math.max(...actualClasses.flatMap((ac) => Object.values(mat[ac])))
    return (
      <div>
        <p className="text-xs text-ax-muted mb-2">{title}</p>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="py-1 pr-2 text-ax-muted font-normal text-right text-[10px]">Actual ↓ / Pred →</th>
                {predClasses.map((pc) => (
                  <th key={pc} className="py-1 px-3 font-normal" style={{ color: PRED_COLORS[pc] ?? C.muted }}>{pc}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actualClasses.map((ac) => (
                <tr key={ac}>
                  <td className="py-1 pr-2 text-right" style={{ color: PRED_COLORS[ac] ?? C.muted }}>{ac}</td>
                  {predClasses.map((pc) => {
                    const v = mat[ac]?.[pc] ?? 0
                    const isCorrect = ac === pc
                    const intensity = maxVal > 0 ? v / maxVal : 0
                    return (
                      <td key={pc} className="py-1 px-3 text-center font-mono rounded"
                        style={{
                          background: isCorrect
                            ? `rgba(30,200,165,${intensity * 0.4})`
                            : `rgba(255,84,112,${intensity * 0.25})`,
                          color: v > 0 ? '#c7d3e6' : C.muted,
                        }}>
                        {v || '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <Card title="Prediction vs Reality" subtitle="Confusion matrices and distribution comparison — only metrics present in artifacts">
      <div className="space-y-6">
        {/* TBO */}
        <div>
          <h3 className="text-sm font-display text-ax-blue-2 mb-3">triple_barrier_outcome · 1h (h6+h12 matched, n=180)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tboConfusion && (
              <ConfusionMatrix mat={tboConfusion} title="Confusion matrix — rows=actual, cols=predicted (h6+h12 combined)" />
            )}
            <div className="space-y-3">
              {(['h6', 'h12', 'h24', 'h48'] as const).map((h) => {
                const hdata = tboPerf[h] as Record<string, unknown> | undefined
                if (!hdata) return null
                const status = String(hdata.status ?? '')
                const n = hdata.n_matched as number
                const hr = hdata.hit_rate_overall as number | undefined
                return (
                  <div key={h} className="rounded-lg border border-ax-border/50 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-ax-text">{h}</span>
                      {status.startsWith('BLOCKED') || status.startsWith('PENDING') ? (
                        <StatusPill label="BLOCKED" />
                      ) : (
                        <StatusPill label={`Hit rate ${pct(hr)}`} tone={hr != null && hr > 0.38 ? 'pass' : 'marginal'} />
                      )}
                    </div>
                    {status && <p className="text-[10px] text-ax-muted">{status}</p>}
                    {n > 0 && <p className="text-[10px] text-ax-muted">n={n} matched</p>}
                    {hdata.prediction_distribution != null && (
                      <div className="flex gap-2 mt-1 text-[10px]">
                        {Object.entries(hdata.prediction_distribution as Record<string, number>).map(([k, v]) => (
                          <span key={k} style={{ color: PRED_COLORS[k] ?? C.muted }}>{k}: {String(v)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* TBO heatmap — latest prediction per symbol×horizon */}
        <div>
          <h3 className="text-xs text-ax-muted uppercase tracking-widest mb-2">TBO Prediction Heatmap — latest candle per symbol × horizon</h3>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse min-w-[500px]">
              <thead>
                <tr>
                  <th className="py-1.5 pr-3 text-ax-muted font-normal text-left">Symbol</th>
                  {['h6', 'h12', 'h24'].map((h) => (
                    <th key={h} className="py-1.5 px-4 text-ax-muted font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set(heatmap.map((c) => c.symbol))).sort().map((sym) => (
                  <tr key={sym} className="border-b border-ax-border/30">
                    <td className="py-1.5 pr-3 font-mono text-ax-muted text-[10px]">{sym}</td>
                    {['h6', 'h12', 'h24'].map((h) => {
                      const cell = heatmap.find((c) => c.symbol === sym && c.horizon === h)
                      if (!cell) return <td key={h} className="px-4 text-center text-ax-muted">—</td>
                      const col = PRED_COLORS[cell.prediction] ?? C.muted
                      const alpha = cell.confidence != null ? cell.confidence : 0.5
                      return (
                        <td key={h} className="px-4 py-1.5 text-center rounded"
                          style={{ background: col + Math.round(alpha * 100 * 0.5).toString(16).padStart(2, '0') }}>
                          <span style={{ color: col }} className="font-mono text-[10px]">
                            {cell.prediction} ({cell.confidence?.toFixed(2)})
                          </span>
                          {cell.correct === true && <span className="ml-1 text-ax-up text-[9px]">✓</span>}
                          {cell.correct === false && <span className="ml-1 text-ax-down text-[9px]">✗</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BQ */}
        <div>
          <h3 className="text-sm font-display text-ax-blue-2 mb-3">breakout_quality · h1 (n=4,680 matched)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bqConfusion && (
              <ConfusionMatrix mat={bqConfusion} title="BQ confusion — rows=actual, cols=predicted" />
            )}
            <div className="space-y-2">
              <div className="rounded-lg border border-ax-border/50 p-3">
                <p className="text-xs text-ax-muted mb-2">By interval (hit rate)</p>
                {Object.entries((bqPerf.by_interval ?? {}) as Record<string, { hit_rate: number; n: number }>).map(([k, v]) => {
                  const key = k.replace(/[(),']/g, '').trim()
                  const isWeak = key === '1D'
                  return (
                    <div key={k} className="flex items-center justify-between py-1 border-b border-ax-border/30">
                      <span className="text-xs font-mono">{key}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono" style={{ color: isWeak ? C.warn : C.up }}>
                          {pct(v.hit_rate)}
                        </span>
                        <span className="text-[10px] text-ax-muted">n={v.n.toLocaleString()}</span>
                        {isWeak && <StatusPill label="THIN SAMPLE" tone="monitoring" />}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="rounded-lg border border-ax-border/50 p-3 text-[11px] text-ax-muted space-y-1">
                <p>Note: BQ accuracy (76.45%) is partially inflated by 95.1% class-0 realized dominance.</p>
                <p>Operative metric is <strong className="text-ax-text">balanced accuracy: 56.0%</strong> (vs 52.5% training OOS).</p>
                <p>Bearish breakout recall: 21.4% — model over-predicts bearish 8.8× realized.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ── Section 5: Historical vs Forward Performance ───────────────────────────
function HistVsForwardSection({ data }: { data: ReturnType<typeof useTibotForward>['data'] }) {
  if (!data) return null
  const bqPerf = data.bq_metrics.forward_performance as Record<string, number | undefined>

  const compData = [
    {
      label: 'BQ Accuracy',
      train: bqPerf.training_oos_accuracy,
      live: bqPerf.forward_accuracy,
      delta: bqPerf.accuracy_vs_training_oos,
      note: 'Partially inflated by 95.1% class-0 outcome dominance',
    },
    {
      label: 'BQ Balanced Acc.',
      train: bqPerf.training_oos_balanced_accuracy,
      live: bqPerf.forward_balanced_accuracy,
      delta: bqPerf.balanced_accuracy_vs_training_oos,
      note: 'Operative discrimination metric',
    },
  ]

  const chartOption: EChartsOption = {
    backgroundColor: 'transparent',
    animation: false,
    tooltip: { backgroundColor: 'rgba(10,16,32,0.95)', borderColor: C.border, textStyle: { color: '#c7d3e6' } },
    legend: { textStyle: { color: C.muted, fontSize: 10 }, top: 8, right: 16 },
    grid: { left: 80, right: 24, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: compData.map((d) => d.label),
      axisLabel: { color: C.muted, fontSize: 11 },
      axisLine: { lineStyle: { color: C.border } },
    },
    yAxis: {
      type: 'value',
      min: 0.45, max: 0.85,
      axisLabel: { color: C.muted, fontSize: 10, formatter: (v: number) => pct(v, 0) },
      splitLine: { lineStyle: { color: '#16203a' } },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series: [
      {
        name: 'Training OOS', type: 'bar', barGap: '10%', barWidth: '30%',
        data: compData.map((d) => d.train),
        itemStyle: { color: C.muted, opacity: 0.7 },
      },
      {
        name: '24h Forward', type: 'bar', barWidth: '30%',
        data: compData.map((d) => d.live),
        itemStyle: { color: C.blue },
        label: {
          show: true, position: 'top',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (p: any) => pct(p.value as number, 1),
          color: C.blue, fontSize: 10,
        },
      },
    ] as any,
  }

  return (
    <Card title="Historical vs 24h Forward Performance" subtitle="Only metrics present in artifacts shown — no manufactured comparisons">
      <div className="space-y-4">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200">
          These comparisons use metrics from the same model family (BQ) computed under the same definitions.
          TBO training OOS used macro_f1/PR-AUC/Brier — not directly comparable to forward hit rate; TBO OOS
          baseline is permanently unavailable (Gate-C did not store raw prediction/label pairs).
        </div>

        <ReactECharts
          option={chartOption}
          notMerge
          style={{ height: 260, width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {compData.map((d) => (
            <div key={d.label} className="rounded-lg border border-ax-border/50 p-3">
              <p className="text-xs font-display text-ax-text mb-2">{d.label}</p>
              <div className="flex items-end gap-4">
                <div>
                  <span className="text-[10px] text-ax-muted block">Training OOS</span>
                  <span className="font-mono text-base" style={{ color: C.muted }}>{pct(d.train)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-ax-muted block">24h Forward</span>
                  <span className="font-mono text-base" style={{ color: C.up }}>{pct(d.live)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-ax-muted block">Delta</span>
                  <span className="font-mono text-base" style={{ color: (d.delta ?? 0) > 0 ? C.up : C.down }}>
                    {(d.delta ?? 0) > 0 ? '+' : ''}{pct(d.delta)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-ax-muted mt-1">{d.note}</p>
            </div>
          ))}
        </div>

        {/* TBO hit rates (only where computed) */}
        <div>
          <h3 className="text-xs text-ax-muted uppercase tracking-widest mb-2">TBO hit rates vs 3-class random baseline (33.3%)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'h6', value: 0.3846, n: 117, verdict: 'PASS-MARGINAL', note: 'CI overlaps chance at n=117' },
              { label: 'h12', value: 0.4921, n: 63, verdict: 'PASS', note: '+15.9pp above chance' },
              { label: 'h24', value: null, n: 0, verdict: 'BLOCKED', note: 'Barriers not closed' },
              { label: 'h48', value: null, n: 0, verdict: 'BLOCKED', note: 'Barriers not closed' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-ax-border/50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-xs">{item.label}</span>
                  <StatusPill label={item.verdict} />
                </div>
                {item.value != null ? (
                  <span className="font-mono text-xl" style={{ color: item.value > 0.4 ? C.up : C.warn }}>{pct(item.value)}</span>
                ) : (
                  <span className="font-mono text-xl" style={{ color: C.muted }}>—</span>
                )}
                <p className="text-[10px] text-ax-muted mt-1">{item.note}</p>
                {item.n > 0 && <p className="text-[10px] text-ax-muted">n={item.n}</p>}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-ax-muted mt-2">
            Note: h6 statistically non-distinguishable from random at 95% CI. Explained by bullish regime mismatch
            (71.8% realized "up" vs 37.6% model predicted "up"). Not a confirmed structural failure — monitor at h24/h48.
          </p>
        </div>
      </div>
    </Card>
  )
}

// ── Section 6: Symbol × Timeframe Matrix ──────────────────────────────────
function SymbolTFMatrix({ data }: { data: ReturnType<typeof useTibotForward>['data'] }) {
  if (!data) return null
  const [family, setFamily] = useState('bq')
  const matrix = family === 'tbo' ? data.tbo_metrics.sym_tf_matrix : data.bq_metrics.sym_tf_matrix

  const symbols = Array.from(new Set(Object.values(matrix).map((c) => c.symbol))).sort()
  const intervals = Array.from(new Set(Object.values(matrix).map((c) => c.interval))).sort()

  function cellColor(hr: number | null) {
    if (hr == null) return C.muted
    if (hr >= 0.8) return C.up
    if (hr >= 0.7) return '#a3e8d0'
    if (hr >= 0.5) return C.warn
    return C.down
  }

  return (
    <Card
      title="Symbol × Timeframe Matrix"
      subtitle="Hit rate heatmap across all symbol/interval combos with matched outcomes"
      right={
        <Select
          value={family}
          onChange={setFamily}
          options={[{ value: 'bq', label: 'breakout_quality' }, { value: 'tbo', label: 'triple_barrier_outcome (1h)' }]}
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse min-w-[500px]">
          <thead>
            <tr>
              <th className="py-2 pr-4 text-ax-muted font-normal text-left">Symbol</th>
              {intervals.map((iv) => (
                <th key={iv} className="py-2 px-4 text-ax-muted font-normal">{iv}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.map((sym) => (
              <tr key={sym} className="border-b border-ax-border/30">
                <td className="py-2 pr-4 font-mono text-ax-muted text-[10px]">{sym}</td>
                {intervals.map((iv) => {
                  const cell: MatrixCell | undefined = matrix[`${sym}_${iv}`]
                  const hr = cell?.hit_rate ?? null
                  const col = cellColor(hr)
                  return (
                    <td key={iv} className="py-2 px-4 text-center rounded"
                      style={{ background: hr != null ? col + '22' : 'transparent' }}>
                      {hr != null ? (
                        <span className="font-mono" style={{ color: col }}>{pct(hr, 0)}</span>
                      ) : (
                        <span className="text-ax-muted">—</span>
                      )}
                      {cell?.n_matched != null && cell.n_matched > 0 && (
                        <div className="text-[9px] text-ax-muted">n={cell.n_matched}</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ── Section 7: Confidence Analysis ────────────────────────────────────────
function ConfidenceSection({ data }: { data: ReturnType<typeof useTibotForward>['data'] }) {
  if (!data) return null
  const [family, setFamily] = useState('tbo')

  const bins: ConfidenceBin[] = family === 'tbo' ? data.tbo_metrics.confidence_bins : data.bq_metrics.confidence_bins
  const calib: CalibrationPoint[] = family === 'tbo' ? data.tbo_metrics.calibration : data.bq_metrics.calibration

  const binChartOption: EChartsOption = {
    backgroundColor: 'transparent',
    animation: false,
    tooltip: { backgroundColor: 'rgba(10,16,32,0.95)', borderColor: C.border, textStyle: { color: '#c7d3e6', fontSize: 11 } },
    legend: { textStyle: { color: C.muted, fontSize: 10 }, top: 4, right: 16 },
    grid: { left: 50, right: 20, top: 36, bottom: 40 },
    xAxis: {
      type: 'category',
      data: bins.map((b) => b.range),
      axisLabel: { color: C.muted, fontSize: 9, rotate: 30 },
      axisLine: { lineStyle: { color: C.border } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: C.muted, fontSize: 10 },
      splitLine: { lineStyle: { color: '#16203a' } },
    },
    series: [
      {
        name: 'Correct', type: 'bar', stack: 'total',
        data: bins.map((b) => b.correct),
        itemStyle: { color: C.up + 'cc' },
      },
      {
        name: 'Incorrect', type: 'bar', stack: 'total',
        data: bins.map((b) => b.incorrect),
        itemStyle: { color: C.down + 'cc' },
      },
      {
        name: 'Pending', type: 'bar', stack: 'total',
        data: bins.map((b) => b.pending),
        itemStyle: { color: C.muted + '88' },
      },
    ],
  }

  const calibChartOption: EChartsOption = {
    backgroundColor: 'transparent',
    animation: false,
    tooltip: { backgroundColor: 'rgba(10,16,32,0.95)', borderColor: C.border, textStyle: { color: '#c7d3e6', fontSize: 11 } },
    legend: { textStyle: { color: C.muted, fontSize: 10 }, top: 4, right: 16 },
    grid: { left: 50, right: 20, top: 36, bottom: 40 },
    xAxis: {
      type: 'category',
      data: calib.map((c) => c.bin),
      axisLabel: { color: C.muted, fontSize: 9, rotate: 30 },
      axisLine: { lineStyle: { color: C.border } },
      name: 'Confidence bin',
      nameTextStyle: { color: C.muted, fontSize: 10 },
      nameLocation: 'end',
    },
    yAxis: {
      type: 'value',
      min: 0, max: 1,
      axisLabel: { color: C.muted, fontSize: 10, formatter: (v: number) => pct(v, 0) },
      splitLine: { lineStyle: { color: '#16203a' } },
      name: 'Accuracy',
      nameTextStyle: { color: C.muted, fontSize: 10 },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series: [
      {
        name: 'Perfect calibration', type: 'line',
        data: calib.map((c) => c.mean_confidence),
        lineStyle: { color: C.muted, type: 'dashed', opacity: 0.5 },
        showSymbol: false,
      },
      {
        name: 'Observed accuracy', type: 'line',
        data: calib.map((c) => c.accuracy),
        lineStyle: { color: C.blue, width: 2 },
        itemStyle: { color: C.blue },
        symbol: 'circle', symbolSize: 5,
        label: {
          show: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (p: any) => pct(p.value as number, 0),
          color: C.blue, fontSize: 9, position: 'top',
        },
      },
    ] as any,
  }

  return (
    <Card
      title="Confidence Analysis"
      subtitle="Confidence distribution and calibration (observed accuracy vs mean confidence per bin)"
      right={
        <Select
          value={family}
          onChange={setFamily}
          options={[{ value: 'tbo', label: 'TBO' }, { value: 'bq', label: 'BQ' }]}
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-ax-muted mb-2">Count by confidence bin (stacked correct/incorrect/pending)</p>
          <ReactECharts option={binChartOption} notMerge style={{ height: 220 }} opts={{ renderer: 'canvas' }} />
        </div>
        <div>
          <p className="text-xs text-ax-muted mb-2">Calibration — observed accuracy vs mean confidence (matched records only)</p>
          {calib.length > 0
            ? <ReactECharts option={calibChartOption} notMerge style={{ height: 220 }} opts={{ renderer: 'canvas' }} />
            : <div className="h-[220px] flex items-center justify-center text-sm text-ax-muted">Awaiting matched outcomes</div>}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(() => {
          const stats = family === 'tbo' ? data.tbo_metrics.confidence_stats : data.bq_metrics.confidence_stats
          return [
            { label: 'Mean confidence', value: fmt(stats.mean, 3) },
            { label: 'Std dev', value: fmt(stats.std, 3) },
            { label: 'Min', value: fmt(stats.min, 3) },
            { label: 'Max', value: fmt(stats.max, 3) },
          ].map((s) => (
            <div key={s.label} className="rounded border border-ax-border/50 p-2">
              <span className="text-[10px] text-ax-muted block">{s.label}</span>
              <span className="font-mono text-sm text-ax-text">{s.value}</span>
            </div>
          ))
        })()}
      </div>
    </Card>
  )
}

// ── Section 8: Evidence & Audit Panel ─────────────────────────────────────
function EvidencePanel({ data }: { data: ReturnType<typeof useTibotForward>['data'] }) {
  if (!data) return null
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (k: string) => setExpanded((p) => ({ ...p, [k]: !p[k] }))

  const panels = [
    { key: 'sentinel_audit', label: 'Sentinel Initial Audit', file: 'forward_audit_20260825.md', verdict: 'PASS / PASS with FLAGS' },
    { key: 'sentinel_reaudit', label: 'Sentinel Re-Audit', file: 'forward_reaudit_20260825.md', verdict: 'PASS (TBO h12) / PASS-MARGINAL (TBO h6)' },
    { key: 'sentinel_decisions', label: 'Sentinel Decisions', file: 'forward_audit_decisions_20260825.md', verdict: 'TBO-3 retracted; BQ-4 active' },
    { key: 'tbo_4h_gap_decision', label: 'TBO 4h Gap Decision', file: 'tbo_4h_gap_decision_20260825.md', verdict: 'BLOCKED ~until 2026-08-29' },
  ]

  return (
    <Card title="Evidence & Audit Panel" subtitle="Expandable source documents — read verbatim from Sentinel and Tibot artifacts">
      <div className="space-y-3">
        {/* Flag summary */}
        <div>
          <p className="text-[10px] text-ax-muted uppercase tracking-widest mb-2">Active Flags</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...data.flags.tbo, ...data.flags.bq].map((f) => (
              <div key={f.id} className="flex items-start gap-2 rounded border border-ax-border/40 p-2">
                <StatusPill label={f.id} />
                <div>
                  <StatusPill label={f.status} />
                  <p className="text-[10px] text-ax-muted mt-0.5">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Provenance */}
        <div className="border-t border-ax-border/50 pt-3">
          <p className="text-[10px] text-ax-muted uppercase tracking-widest mb-2">Data Provenance</p>
          <div className="space-y-1 font-mono text-[10px]">
            {Object.entries(data.provenance).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-ax-muted shrink-0">{k}:</span>
                <span className="text-ax-text break-all">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chronos manifest reference */}
        <div className="border-t border-ax-border/50 pt-3 text-[10px] text-ax-muted font-mono">
          Chronos manifest SHA256: {data.integrity.chronos_manifest_sha256}
        </div>

        {/* Expandable audit texts */}
        <div className="border-t border-ax-border/50 pt-3 space-y-2">
          <p className="text-[10px] text-ax-muted uppercase tracking-widest mb-2">Source Documents</p>
          {panels.map((p) => (
            <div key={p.key} className="rounded-lg border border-ax-border/50">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/3 rounded-lg"
                onClick={() => toggle(p.key)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ax-text font-display">{p.label}</span>
                  <span className="text-[10px] text-ax-muted font-mono">{p.file}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ax-muted">{p.verdict}</span>
                  <span className="text-ax-muted">{expanded[p.key] ? '▲' : '▼'}</span>
                </div>
              </button>
              {expanded[p.key] && (
                <div className="px-4 pb-4">
                  <pre className="text-[10px] text-ax-muted whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto ax-scroll bg-ax-bg-2/60 rounded p-3">
                    {data.audit_texts[p.key]}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export function TibotForwardPage() {
  const { status, data, error } = useTibotForward()

  if (status !== 'ready' || !data) {
    return (
      <Card title="Tibot · 24h Live-Forward Validation">
        <div className="py-14 text-center text-sm text-ax-muted">
          {status === 'loading' && 'Loading validation bundle…'}
          {status === 'error' && `Failed to load: ${error}`}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-tight ax-glow-text">Tibot · 24h Live-Forward Validation</h1>
          <p className="text-ax-muted mt-1 text-sm max-w-3xl">
            First live forward predictions from frozen Tibot classification models matched against realized Chronos outcomes.
            Prediction validation only — no trades were executed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded border border-ax-blue/40 bg-ax-blue/10 text-ax-blue-2">
              24h LIVE-FORWARD MODEL VALIDATION
            </span>
            <span className="px-2 py-0.5 rounded border border-ax-border/50 text-ax-muted">
              Prediction validation only — no trades were executed
            </span>
            <span className="px-2 py-0.5 rounded border border-ax-border/50 text-ax-muted">
              Not backtesting — genuine timestamped forward predictions
            </span>
            <span className="px-2 py-0.5 rounded border border-ax-up/40 bg-ax-up/10 text-ax-up">
              Sentinel PASS (initial + re-audit)
            </span>
          </div>
        </div>
        <div className="text-right text-[10px] text-ax-muted font-mono">
          <div>Generated: {data.generated_date}</div>
          <div className="text-ax-blue-2 mt-0.5">{data.tx_ref}</div>
        </div>
      </div>

      <SummarySection data={data} />
      <FamilyStatusSection data={data} />
      <PredictionExplorer data={data} />
      <PredVsRealitySection data={data} />
      <HistVsForwardSection data={data} />
      <SymbolTFMatrix data={data} />
      <ConfidenceSection data={data} />
      <EvidencePanel data={data} />
    </div>
  )
}
