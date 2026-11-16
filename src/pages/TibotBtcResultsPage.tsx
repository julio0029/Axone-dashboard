import { useEffect, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import './tibot-btc-results.css'

type Candidate = { candidate_architecture: string; family: string; horizon_bars: number | null; queue_ordinal: number; status: string; target: string; failure_reason: string | null; exception_class: string | null }
type Reconciliation = { result: string; score_rows: number; prediction_columns: number; non_null_prediction_values: number; null_prediction_values: number; counts_expected_and_observed: Record<string, number>; selected_receipt_commitment_sha256: string; canonical_source_hash_matched: boolean; receipt_manifest_all_selected_matched: boolean }
type Identity = { transaction: string; evidence_transaction: string; bundle_manifest_sha256: string; delivery: string }
type Matrix = { header: string[]; rows: string[][] }

const ROOT = `${import.meta.env.BASE_URL}data/tibot-btcusdt-clean-pass/`
const ARTIFACTS = ['SHA256_MANIFEST.json', 'INPUT_SHA256_MANIFEST.json', 'DATA_DICTIONARY.json', 'reconciliation_summary.json', 'selected_candidate_metadata.json', 'no_fit_cells.json', 'btc_usdt_ohlcv_predictions_wide.csv.gz']

export function TibotBtcResultsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [recon, setRecon] = useState<Reconciliation | null>(null)
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [matrix, setMatrix] = useState<Matrix | null>(null)
  const [loadError, setLoadError] = useState('')
  const [family, setFamily] = useState('ALL')
  const [target, setTarget] = useState('ALL')
  const [horizon, setHorizon] = useState('ALL')
  const [model, setModel] = useState('ALL')
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`${ROOT}selected_candidate_metadata.json`).then(r => r.json()),
      fetch(`${ROOT}reconciliation_summary.json`).then(r => r.json()),
      fetch(`${ROOT}dashboard_identity.json`).then(r => r.json()),
      loadMatrix(`${ROOT}btc_usdt_ohlcv_predictions_wide.csv.gz`),
    ]).then(([candidateData, reconciliation, pageIdentity, values]) => {
      setCandidates(candidateData); setRecon(reconciliation); setIdentity(pageIdentity); setMatrix(values)
    }).catch((error: unknown) => setLoadError(error instanceof Error ? error.message : String(error)))
  }, [])

  const predicted = useMemo(() => candidates.filter(c => c.status === 'PREDICTED'), [candidates])
  const families = unique(predicted.map(c => c.family))
  const targets = unique(predicted.filter(c => family === 'ALL' || c.family === family).map(c => c.target))
  const horizons = unique(predicted.filter(c => family === 'ALL' || c.family === family).map(c => c.horizon_bars == null ? 'unbounded' : String(c.horizon_bars)))
  const models = unique(predicted.filter(c => family === 'ALL' || c.family === family).map(c => c.candidate_architecture))
  const visible = predicted.filter(c =>
    (family === 'ALL' || c.family === family) && (target === 'ALL' || c.target === target) &&
    (horizon === 'ALL' || (c.horizon_bars == null ? 'unbounded' : String(c.horizon_bars)) === horizon) &&
    (model === 'ALL' || c.candidate_architecture === model))
  const failures = candidates.filter(c => c.status !== 'PREDICTED')

  const chart = useMemo(() => matrix ? chartOption(matrix, candidates, selected) : null, [matrix, candidates, selected])
  const toggle = (ordinal: number) => setSelected(current => current.includes(ordinal) ? current.filter(v => v !== ordinal) : current.length < 4 ? [...current, ordinal] : [...current.slice(1), ordinal])

  return <div className="btc-evidence">
    <header className="btc-title">
      <div><span>TIBOT / BTCUSDT / 1H · VERIFIED CLEAN-PASS EVIDENCE</span><h1>The tape passed.<br/><em>The models did not.</em></h1></div>
      <div className="btc-id"><span>Bundle manifest SHA-256</span><code>{identity?.bundle_manifest_sha256 ?? 'loading identity…'}</code></div>
    </header>

    <section className="btc-state-grid">
      <div className="pass"><span>LIFECYCLE / SOURCE RECONCILIATION</span><strong>{recon?.result ?? '…'}</strong><p>Canonical source, queue overlays, and selected receipts reconciled.</p></div>
      <div className="closed"><span>MODEL ACCEPTANCE / DEPLOYMENT</span><strong>NOT GRANTED</strong><p>No acceptance, Wally enablement, connectivity, paper/live trading, or deployment is implied.</p></div>
    </section>

    <section className="btc-ledger">
      <Metric value={recon?.score_rows} label="exact OHLCV rows" />
      <Metric value={recon?.counts_expected_and_observed.predicted} label="available prediction series" />
      <Metric value={recon?.counts_expected_and_observed.candidate_receipts} label="candidate receipts" />
      <Metric value={recon?.counts_expected_and_observed.governed_numerical_failures} label="governed failures" tone="warn" />
      <Metric value={recon?.counts_expected_and_observed.no_fit_cells} label="no-fit cells" tone="warn" />
    </section>

    {loadError && <div className="btc-error">Evidence load failed: {loadError}</div>}
    <section className="btc-chart-panel">
      <div className="btc-chart-head"><div><span>CANONICAL SCORE WINDOW</span><h2>OHLCV + selected prediction traces</h2></div><p>{matrix ? `${matrix.rows.length.toLocaleString()} / 6,011 rows loaded · no sampling` : 'Decompressing exact evidence artifact…'}</p></div>
      {chart ? <ReactECharts option={chart} style={{ height: 610 }} notMerge lazyUpdate /> : <div className="btc-loading">Loading verified matrix…</div>}
    </section>

    <section className="btc-controls">
      <header><div><span>PREDICTION SELECTOR</span><h2>{visible.length} matching series</h2></div><p>Select up to four traces. Filters never alter the underlying data.</p></header>
      <div className="btc-filter-row">
        <Filter label="Family" value={family} values={families} onChange={v => { setFamily(v); setTarget('ALL'); setHorizon('ALL'); setModel('ALL') }} />
        <Filter label="Target" value={target} values={targets} onChange={setTarget} />
        <Filter label="Horizon" value={horizon} values={horizons} onChange={setHorizon} />
        <Filter label="Model" value={model} values={models} onChange={setModel} />
      </div>
      <div className="btc-series-list">{visible.slice(0, 120).map(c => <button key={c.queue_ordinal} className={selected.includes(c.queue_ordinal) ? 'active' : ''} onClick={() => toggle(c.queue_ordinal)}><i>q{String(c.queue_ordinal).padStart(6, '0')}</i><span><b>{c.family}</b><small>{c.target} · h{c.horizon_bars ?? '—'} · {c.candidate_architecture}</small></span><strong>{selected.includes(c.queue_ordinal) ? 'ON' : '+'}</strong></button>)}</div>
      {visible.length > 120 && <p className="btc-cap">Showing the first 120 matches. Narrow filters to reach every series.</p>}
    </section>

    <section className="btc-audit-grid">
      <article><span>CANDIDATE OUTCOME</span><h3>585 predicted / 594 selected</h3><p>{recon?.non_null_prediction_values.toLocaleString()} non-null values; {recon?.null_prediction_values.toLocaleString()} nulls retained exactly. Null means unavailable or governed failure; nothing is imputed.</p></article>
      <article><span>GOVERNED FAILURES</span><h3>9 numerical failures</h3><p>{unique(failures.map(f => f.exception_class ?? f.failure_reason ?? 'governed failure')).join(' · ')}</p></article>
      <article><span>NO-FIT OVERLAY</span><h3>6 cells remained no-fit</h3><p>Shown as a lifecycle outcome only. No-fit is separate from the 9 candidate execution failures and is not model acceptance.</p></article>
    </section>

    <section className="btc-downloads"><div><span>EVIDENCE ARTIFACTS</span><h2>Read back the published identity</h2><p>{identity?.delivery}</p></div><div>{ARTIFACTS.map(name => <a key={name} href={`${ROOT}${name}`} download>{name}<b>↓</b></a>)}</div></section>
    <footer>Evidence {identity?.evidence_transaction} · publication {identity?.transaction} · receipt commitment <code>{recon?.selected_receipt_commitment_sha256}</code></footer>
  </div>
}

function Metric({ value, label, tone = '' }: { value?: number; label: string; tone?: string }) { return <div className={tone}><strong>{value?.toLocaleString() ?? '…'}</strong><span>{label}</span></div> }
function Filter({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (v: string) => void }) { return <label><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}><option value="ALL">All</option>{values.map(v => <option key={v}>{v}</option>)}</select></label> }
function unique(values: string[]) { return [...new Set(values)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) }

async function loadMatrix(url: string): Promise<Matrix> {
  const response = await fetch(url)
  if (!response.ok || !response.body) throw new Error(`Matrix HTTP ${response.status}`)
  if (!('DecompressionStream' in window)) throw new Error('This browser cannot decompress the verified gzip artifact')
  const stream = response.body.pipeThrough(new DecompressionStream('gzip'))
  const text = await new Response(stream).text()
  const lines = text.trimEnd().split('\n')
  return { header: lines[0].replace(/\r$/, '').split(','), rows: lines.slice(1).map(line => line.replace(/\r$/, '').split(',')) }
}

function chartOption(matrix: Matrix, candidates: Candidate[], selected: number[]) {
  const x = matrix.rows.map(r => r[0].replace(' ', 'T').replace('+00:00', 'Z'))
  const candidateMap = new Map(candidates.map(c => [c.queue_ordinal, c]))
  const predictionSeries = selected.map((ordinal, index) => {
    const prefix = `pred_q${String(ordinal).padStart(6, '0')}__`
    const column = matrix.header.findIndex(h => h.startsWith(prefix))
    const c = candidateMap.get(ordinal)
    return { name: `q${String(ordinal).padStart(6, '0')} · ${c?.candidate_architecture ?? ''}`, type: 'line', xAxisIndex: 1, yAxisIndex: 2, showSymbol: false, connectNulls: false, sampling: 'none', lineStyle: { width: 1.4, color: ['#58d6ff','#af8cff','#ffb454','#38d9a9'][index] }, data: matrix.rows.map(r => column < 0 || r[column] === '' ? null : Number(r[column])) }
  })
  return {
    animation: false, backgroundColor: 'transparent', legend: { top: 4, right: 10, textStyle: { color: '#9db0c9', fontSize: 10 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, backgroundColor: '#07101d', borderColor: '#23405e', textStyle: { color: '#dcecff' } },
    axisPointer: { link: [{ xAxisIndex: 'all' }] },
    grid: [{ left: 58, right: 22, top: 42, height: '55%' }, { left: 58, right: 22, top: '68%', height: '20%' }],
    xAxis: [0, 1].map(i => ({ type: 'category', gridIndex: i, data: x, boundaryGap: true, axisLabel: { color: '#6f849f', hideOverlap: true }, axisLine: { lineStyle: { color: '#20354c' } }, splitLine: { show: false } })),
    yAxis: [{ scale: true, gridIndex: 0, axisLabel: { color: '#6f849f' }, splitLine: { lineStyle: { color: '#14283d' } } }, { scale: true, gridIndex: 0, show: false }, { scale: true, gridIndex: 1, axisLabel: { color: '#6f849f' }, splitLine: { lineStyle: { color: '#14283d' } } }],
    dataZoom: [{ type: 'inside', xAxisIndex: [0,1], start: 88, end: 100 }, { type: 'slider', xAxisIndex: [0,1], bottom: 4, height: 22, start: 88, end: 100, borderColor: '#20354c', fillerColor: '#163d5e88', textStyle: { color: '#6f849f' } }],
    series: [{ name: 'BTCUSDT', type: 'candlestick', data: matrix.rows.map(r => [Number(r[4]), Number(r[7]), Number(r[6]), Number(r[5])]), itemStyle: { color: '#38d9a9', color0: '#ff5e78', borderColor: '#38d9a9', borderColor0: '#ff5e78' } }, ...predictionSeries],
  }
}
