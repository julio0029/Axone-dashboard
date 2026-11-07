import { Link } from 'react-router-dom'
import { SCREENING_CELL, SCREENING_MODELS, type ScreeningModel } from '../data/tibotDonchianExample'
import './tibot-family-example.css'

const pct = (value: number) => `${(value * 100).toFixed(1)}%`
const metric = (value: number) => value.toFixed(3)

export function TibotFamilyExamplePage() {
  return (
    <div className="family-screen">
      <Link className="family-back" to="/tibot">← Family registry</Link>

      <header className="family-hero">
        <div>
          <p className="family-eyebrow">TIBOT / COMPLETED FAMILY SCREEN / ONE CELL</p>
          <h1><span>Donchian</span> breakout<br />screening tape</h1>
          <p className="family-deck">A bounded comparison of three fitted candidates for one symbol-timeframe cell. This is evidence display—not model selection, promotion, or training completion.</p>
        </div>
        <div className="family-cell" aria-label="Screened cell definition">
          <div><span>family</span><strong>{SCREENING_CELL.family}</strong></div>
          <div><span>market</span><strong>{SCREENING_CELL.symbol} · {SCREENING_CELL.timeframe}</strong></div>
          <div><span>route</span><strong>{SCREENING_CELL.route}</strong></div>
          <div className="wide"><span>target</span><strong>{SCREENING_CELL.target}</strong></div>
        </div>
      </header>

      <section className="family-badges" aria-label="Screening limitations">
        {['SCREENING ONLY', 'NOT SERIALIZED', 'NOT DEPLOYABLE', 'WALLY GATE REQUIRED'].map((label) => <b key={label}>{label}</b>)}
      </section>

      <section className="family-ledger" aria-label="Cell event counts">
        <div><b>{SCREENING_CELL.predictors}</b><span>predictors</span></div>
        <div><b>{SCREENING_CELL.fitEvents}</b><span>fit events</span></div>
        <div><b>{SCREENING_CELL.scoreEvents}</b><span>score events</span></div>
        <div><b>3 / 3</b><span>original bias guards failed</span></div>
      </section>

      <section className="family-advisory">
        <div className="advisory-mark">!</div>
        <div><h2>The waiver removed bias only as a throughput blocker.</h2><p>Every candidate fell below the original 0.35–0.65 positive-rate guard. The failures remain disclosed and all three candidates remain subject to Wally rejection or quarantine. No automatic acceptance or use is permitted.</p></div>
      </section>

      <section className="family-models" aria-label="Side-by-side model comparison">
        {SCREENING_MODELS.map((model, index) => <ModelLane key={model.id} model={model} index={index} />)}
      </section>

      <section className="family-provenance">
        <header><p>VERIFIED PROVENANCE</p><h2>Evidence chain</h2></header>
        <div className="provenance-grid">
          {SCREENING_MODELS.map((model) => <HashRow key={model.id} label={`${model.shortName} receipt`} hash={model.receiptHash} />)}
          <HashRow label="Terminal-chain audit" hash={SCREENING_CELL.auditHash} />
          <HashRow label="Throughput waiver" hash={SCREENING_CELL.waiverHash} />
        </div>
        <p className="provenance-note">Hashes identify the exact verified source bytes. Public data on this page is limited to non-secret derived screening evidence.</p>
      </section>
    </div>
  )
}

function ModelLane({ model, index }: { model: ScreeningModel; index: number }) {
  return (
    <article className="model-lane">
      <header><span>0{index + 1}</span><div><p>{model.shortName}</p><h2>{model.name}</h2></div><b>BIAS FAIL</b></header>
      <div className="model-metrics">
        <Metric label="Accuracy" value={metric(model.accuracy)} />
        <Metric label="Balanced" value={metric(model.balancedAccuracy)} />
        <Metric label="Macro-F1" value={metric(model.macroF1)} />
        <Metric label="Fit time" value={`${model.fitSeconds.toFixed(2)}s`} />
      </div>
      <div className="matrix-block">
        <div className="section-label">Confusion matrix <span>predicted →</span></div>
        <div className="matrix" aria-label={`${model.name} confusion matrix`}>
          <i>actual 0</i><b>{model.confusionMatrix[0][0]}<small>TN</small></b><b>{model.confusionMatrix[0][1]}<small>FP</small></b>
          <i>actual 1</i><b>{model.confusionMatrix[1][0]}<small>FN</small></b><b>{model.confusionMatrix[1][1]}<small>TP</small></b>
        </div>
      </div>
      <div className="rate-block">
        <div className="section-label">Predicted class share <span>{pct(model.positiveRate)} positive</span></div>
        <div className="rate-track"><span className="guard-zone" /><i style={{ width: pct(model.classShares.negative) }} /><b style={{ width: pct(model.classShares.positive) }} /></div>
        <div className="rate-legend"><span>0 · {pct(model.classShares.negative)}</span><span>guard 35–65%</span><span>1 · {pct(model.classShares.positive)}</span></div>
      </div>
      <div className="prediction-block">
        <div className="section-label">Score-event predictions <span>{model.predictions ? '611 verified rows' : 'digest only'}</span></div>
        {model.predictions ? <PredictionTape model={model} /> : <div className="prediction-absent">Row-level sequence is absent from the verified HGB receipt. No values are inferred.</div>}
      </div>
      <div className="params">{model.params.map((param) => <span key={param}>{param}</span>)}</div>
      <HashRow label="Prediction SHA-256" hash={model.predictionHash} compact />
    </article>
  )
}

function PredictionTape({ model }: { model: ScreeningModel }) {
  return <div className="prediction-tape" role="img" aria-label={`${model.name} binary predictions across 611 score events`}>{model.predictions?.map((value, i) => <i key={i} className={value ? 'positive' : ''} title={`Event ${i + 1}: ${value}`} />)}</div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><b>{value}</b></div>
}

function HashRow({ label, hash, compact = false }: { label: string; hash: string; compact?: boolean }) {
  return <div className={compact ? 'hash-row compact' : 'hash-row'}><span>{label}</span><code>{hash}</code></div>
}
