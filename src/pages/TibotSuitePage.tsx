import { useEffect, useMemo, useState } from 'react'

type Metric = string | number | null

interface Family {
  family: string
  tier: string
  tier_rationale: string
  readiness_summary: Record<string, number>
  cells_total: number
  cells_ready: number
  bot_class: string
  prediction_target: string
  trading_interpretation: string
  horizon: string
  prior_metrics: Record<string, Metric>
  prior_metrics_validity: string
  general_model: {
    artifact: string | null
    sha256: string | null
    feature_source: string | null
    required_features: string[] | null
    required_n: number | null
    blocked_reason: string | null
  }
  input_contract: { contract_id: string; live: string; historical: string }
  certification_gate: string
}

interface Feed {
  transaction: string
  generated_utc: string
  families_total: number
  display_policy: string
  families: Family[]
}

const TIER_COPY: Record<string, string> = {
  TIER_1_PROMOTED: 'promoted, metrics now void',
  TIER_2_NEVER_COMPLETED: 'never got a verdict (3 passed gates)',
  TIER_3_VERDICT_VOID_PENDING_RETEST: 'retired on void statistics',
  TIER_4_STRUCTURALLY_BLOCKED: 'unbounded horizon (1 family)',
  TIER_5_SETTLED_NULL_KEEP_CLOSED: 'audited NULL, needs a new hypothesis',
}

const TIER_SHORT: Record<string, string> = {
  TIER_1_PROMOTED: 'T1 · PROMOTED',
  TIER_2_NEVER_COMPLETED: 'T2 · NEVER COMPLETED',
  TIER_3_VERDICT_VOID_PENDING_RETEST: 'T3 · VOID / RETEST',
  TIER_4_STRUCTURALLY_BLOCKED: 'T4 · BLOCKED',
  TIER_5_SETTLED_NULL_KEEP_CLOSED: 'T5 · NULL / CLOSED',
}

export function TibotSuitePage() {
  const [feed, setFeed] = useState<Feed | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState('ALL')
  const [selectedName, setSelectedName] = useState('breakout_quality')

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/tibot_families_20261019.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<Feed>
      })
      .then(setFeed)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)))
  }, [])

  const visible = useMemo(() => {
    if (!feed) return []
    const needle = query.trim().toLowerCase()
    return feed.families.filter((family) =>
      (tier === 'ALL' || family.tier === tier) &&
      (!needle || `${family.family} ${family.bot_class}`.toLowerCase().includes(needle)),
    )
  }, [feed, query, tier])

  const selected = feed?.families.find((family) => family.family === selectedName) ?? visible[0]
  const ready = feed?.families.reduce((sum, family) => sum + family.cells_ready, 0) ?? 0
  const total = feed?.families.reduce((sum, family) => sum + family.cells_total, 0) ?? 0
  const notReady = feed?.families.reduce((sum, family) => sum + (family.readiness_summary.NOT_READY ?? 0), 0) ?? 0

  if (!feed) {
    return <div className="tibot-loading">{error ? `Feed unavailable: ${error}` : 'Verifying family registry…'}</div>
  }

  return (
    <div className="tibot-console">
      <section className="tibot-hero">
        <div>
          <div className="tibot-kicker">TIBOT / FAMILY REGISTRY · {feed.transaction}</div>
          <h1>Choose what gets<br /><em>retested first.</em></h1>
          <p>General-model evidence only. Historical verdicts remain visible, but their statistics are void.</p>
        </div>
        <div className="tibot-ledger" aria-label="Registry totals">
          <div><strong data-testid="family-total">{feed.families_total}</strong><span>families indexed</span></div>
          <div><strong>{ready}<i> / {total}</i></strong><span>connectors ready</span></div>
          <div className="danger"><strong>{notReady}</strong><span>NOT_READY · fail closed</span></div>
        </div>
      </section>

      <section className="tibot-alert" data-testid="c8-alert">
        <span className="tibot-alert-mark">C8</span>
        <div><strong>Certification control plane is not installed.</strong><p>Nothing in this view is a validated or deployable model. No test run is authorized.</p></div>
      </section>

      <section className="tibot-tiers" aria-label="Tier definitions">
        {Object.entries(TIER_COPY).map(([key, copy]) => (
          <button key={key} className={tier === key ? 'active' : ''} onClick={() => setTier(tier === key ? 'ALL' : key)}>
            <b>{TIER_SHORT[key]}</b><span>{copy}</span>
          </button>
        ))}
      </section>

      <div className="tibot-workspace">
        <section className="tibot-index">
          <header>
            <div><span>FAMILY INDEX</span><b>{visible.length} / {feed.families_total}</b></div>
            <input aria-label="Filter families" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by family or class…" />
          </header>
          <div className="tibot-table-head"><span>Family / tier</span><span>Class</span><span>Ready</span></div>
          <div className="tibot-family-list">
            {visible.map((family) => (
              <button key={family.family} className={selected?.family === family.family ? 'selected' : ''} onClick={() => setSelectedName(family.family)}>
                <span><b>{family.family}</b><small>{TIER_SHORT[family.tier]}</small></span>
                <code>{family.bot_class}</code>
                <span className={family.cells_ready === family.cells_total ? 'ready' : 'closed'}>
                  <b>{family.cells_ready}/{family.cells_total}</b><small>{readinessLabel(family)}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        {selected && <FamilyDossier family={selected} />}
      </div>
      <footer className="tibot-footer">Feed generated {feed.generated_utc} · {feed.display_policy}</footer>
    </div>
  )
}

function FamilyDossier({ family }: { family: Family }) {
  const blocked = family.general_model.blocked_reason
  return (
    <article className="tibot-dossier" data-testid="family-detail">
      <header>
        <div><span>GENERAL MODEL DOSSIER</span><h2>{family.family}</h2></div>
        <div className="tibot-status-stack"><b>{TIER_SHORT[family.tier]}</b><span>{family.cells_ready}/{family.cells_total} connectors ready</span></div>
      </header>

      <div className="tibot-gate-strip"><b>C8 · NOT INSTALLED</b><span>{family.certification_gate}</span></div>
      {blocked && <div className="tibot-blocked"><span>NOT_READY · FAIL CLOSED</span><code>{blocked}</code></div>}

      <Section title="01 / Input contract">
        <KeyValue label="Contract ID" value={family.input_contract.contract_id} />
        <KeyValue label="Live path" value={family.input_contract.live} mono />
        <KeyValue label="Historical path" value={family.input_contract.historical} mono />
      </Section>

      <Section title={`02 / Required features · n=${family.general_model.required_n ?? 'unrecovered'}`}>
        {family.general_model.required_features?.length ? (
          <ol className="tibot-features" data-testid="required-features">
            {family.general_model.required_features.map((feature, index) => <li key={feature}><i>{String(index + 1).padStart(2, '0')}</i><code>{feature}</code></li>)}
          </ol>
        ) : <p className="tibot-empty">Feature names could not be recovered from the artifact. Connector remains closed.</p>}
      </Section>

      <Section title="03 / Target & use">
        <KeyValue label="Prediction target" value={family.prediction_target} />
        <KeyValue label="Horizon" value={family.horizon} />
        <KeyValue label="Trading interpretation" value={family.trading_interpretation} />
      </Section>

      <Section title="04 / General model artifact">
        <KeyValue label="Artifact" value={family.general_model.artifact ?? 'NO MODEL ARTIFACT ON DISK'} mono />
        <KeyValue label="SHA-256" value={family.general_model.sha256 ?? '—'} mono />
        <KeyValue label="Feature source" value={family.general_model.feature_source ?? '—'} mono />
      </Section>

      <Section title="05 / Verdict context">
        <KeyValue label="Tier rationale" value={family.tier_rationale} />
        {blocked && <KeyValue label="Blocked reason" value={blocked} mono />}
      </Section>

      <section className="tibot-metrics" data-testid="void-metrics">
        <div className="tibot-void-label"><b>VOID · PRE-REFRESH DATA</b><span>{family.prior_metrics_validity}</span></div>
        <p>Measured on defective data: 4h buckets had 3 of 48 constituents; daily history contained 1,190 zero-coverage bars. Do not use for ranking or deployment.</p>
        <div>{Object.entries(family.prior_metrics).map(([key, value]) => <span key={key}><small>{key.replaceAll('_', ' ')}</small><b>{value ?? '—'}</b></span>)}</div>
      </section>

      <button className="tibot-after-training" disabled><span>Symbol × timeframe predictions</span><b>AVAILABLE AFTER TRAINING</b></button>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="tibot-section"><h3>{title}</h3>{children}</section>
}

function KeyValue({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="tibot-kv"><span>{label}</span><p className={mono ? 'mono' : ''}>{value}</p></div>
}

function readinessLabel(family: Family) {
  return Object.entries(family.readiness_summary).map(([key, value]) => `${value} ${key}`).join(' · ')
}
