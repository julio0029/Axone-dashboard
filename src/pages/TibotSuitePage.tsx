import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Card } from '../components/Card'
import { TibotSuiteChart } from '../components/TibotSuiteChart'
import {
  familyLabel,
  formatCell,
  shortHash,
  useTibotSuitePayload,
  type TibotModelRow,
} from '../data/tibotSuite'

export function TibotSuitePage() {
  const { status, data, error } = useTibotSuitePayload()
  const [family, setFamily] = useState<string>('all')
  const [interval, setInterval] = useState<string>('all')
  const [modelKey, setModelKey] = useState<string>('')

  const filtered = useMemo(() => {
    if (!data) return []
    return data.models.filter((m) => {
      const familyOk = family === 'all' || m.family === family
      const intervalOk = interval === 'all' || m.interval === interval
      return familyOk && intervalOk
    })
  }, [data, family, interval])

  const selected = useMemo(() => {
    if (!filtered.length) return null
    return filtered.find((m) => m.modelKey === modelKey) ?? filtered[0]
  }, [filtered, modelKey])

  const intervals = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.models.map((m) => m.interval)))
  }, [data])

  if (status !== 'ready' || !data) {
    return (
      <Card title="Tibot suite review" subtitle="Chronos-bound sandbox dashboard payload">
        <div className="py-14 text-center text-sm text-ax-muted">
          {status === 'loading' && 'loading Tibot-suite payload...'}
          {status === 'absent' && 'payload not found at public/data/tibot_suite_dashboard_20260723.json'}
          {status === 'error' && `failed to load: ${error}`}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-5 max-w-[1560px] mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-tight ax-glow-text">Tibot · suite review</h1>
          <p className="text-ax-muted mt-1 text-sm max-w-4xl">
            Sandbox-only candidate review using Chronos-managed historical OHLCV and target files for the chart layer.
            Tibot metrics are reporting-only and never imply artifact eligibility without Sentinel final PASS.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <Badge tone="up">Chronos contract verified {shortHash(data.contractSha256)}</Badge>
            <Badge tone="warn">no promotion · no BOTS write</Badge>
            <Badge tone="muted">{data.models.length} candidate rows</Badge>
          </div>
        </div>
        <div className="text-right text-xs text-ax-muted font-mono max-w-[520px] break-all">
          <div>{data.contractPath}</div>
          <div className="text-ax-blue-2 mt-1">{data.manifest.status}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5">
        <div className="space-y-5">
          <Card title="Review controls" bodyClass="!p-3">
            <ControlGroup label="Family">
              <SelectButton active={family === 'all'} onClick={() => setFamily('all')}>all</SelectButton>
              {data.families.map((f) => (
                <SelectButton key={f.family} active={family === f.family} onClick={() => setFamily(f.family)}>
                  {familyLabel(f.family)}
                </SelectButton>
              ))}
            </ControlGroup>
            <ControlGroup label="Timeframe">
              <SelectButton active={interval === 'all'} onClick={() => setInterval('all')}>all</SelectButton>
              {intervals.map((tf) => (
                <SelectButton key={tf} active={interval === tf} onClick={() => setInterval(tf)}>
                  {tf}
                </SelectButton>
              ))}
            </ControlGroup>
          </Card>

          <Card title="Candidate selector" subtitle={`${filtered.length} rows in current filter`} bodyClass="!p-2">
            <div className="max-h-[500px] overflow-y-auto ax-scroll space-y-1 pr-1">
              {filtered.map((m) => (
                <button
                  key={m.modelKey}
                  onClick={() => setModelKey(m.modelKey)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                    selected?.modelKey === m.modelKey
                      ? 'border-ax-blue/50 bg-ax-blue/15 ax-glow'
                      : 'border-ax-border/60 bg-ax-bg-2/50 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-ax-text truncate">{m.interval}</span>
                    <StatusChip status={m.status} />
                  </div>
                  <div className="text-[11px] text-ax-muted mt-1 leading-snug">{familyLabel(m.family)}</div>
                  <div className="text-[10px] text-ax-blue-2 font-mono truncate mt-1">{m.selectedModelEvidence}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Final training" subtitle="updated as Chronos completes each family">
            <div className="space-y-2">
              {data.families.map((f) => (
                <div key={f.family} className="rounded-lg border border-ax-border/60 bg-ax-bg-2/50 px-3 py-2">
                  <div className="text-sm text-ax-text">{familyLabel(f.family)}</div>
                  <div className="text-[11px] text-ax-muted font-mono mt-1">{f.finalTraining.status}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {selected && (
          <div className="space-y-5 min-w-0">
            <Card
              title={`${selected.symbol} · ${selected.interval} · ${familyLabel(selected.family)}`}
              subtitle={`${selected.sample.windowMode} · ${selected.sample.timestampStartUtc ?? '-'} -> ${selected.sample.timestampEndUtc ?? '-'} UTC`}
              right={<StatusChip status={selected.status} />}
              bodyClass="!p-2"
            >
              <TibotSuiteChart model={selected} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card title="Candidate metrics & guards" subtitle={selected.metricsStatus}>
                <MetricPanel model={selected} />
              </Card>
              <Card title="Latest joined row" subtitle="raw OHLCV plus target columns">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1 text-xs font-mono">
                  {selected.sample.columns.map((c) => (
                    <div key={c} className="flex justify-between gap-3">
                      <span className="text-ax-muted truncate">{c}</span>
                      <span className="text-ax-text shrink-0">{formatCell(selected.sample.latest[c])}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card title="Source provenance" subtitle="real paths, date ranges, schemas, SHA-256">
              <div className="space-y-4">
                <SourceBlock title="Raw historical OHLCV" field={selected.rawOhlcv} />
                <SourceBlock title="Feature/input contract" field={selected.featureInput} />
                <SourceBlock title="Target / predictive target" field={selected.targetInput} />
                <div className="pt-3 border-t border-ax-border/60">
                  <div className="text-[10px] uppercase tracking-widest text-ax-muted mb-2">Reporting evidence</div>
                  <div className="space-y-1">
                    {selected.reportingEvidence.map((e) => (
                      <div key={`${e.path}-${e.sha256}`} className="grid grid-cols-1 lg:grid-cols-[1fr_130px] gap-2 text-[11px]">
                        <span className="text-ax-muted font-mono break-all">{e.path}</span>
                        <span className="text-ax-blue-2 font-mono">{shortHash(e.sha256)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricPanel({ model }: { model: TibotModelRow }) {
  const metrics = model.metrics ?? {}
  const cells = Array.isArray((metrics as { cells?: unknown[] }).cells) ? (metrics as { cells: unknown[] }).cells : []
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Metric k="Selected" v={model.selectedModelEvidence} />
        <Metric k="Artifact" v="blocked until Sentinel final PASS" />
        {model.guards.map((g) => <Metric key={g.name} k={g.name} v={g.verdict} />)}
      </div>
      {cells.length > 0 ? (
        <div className="overflow-x-auto ax-scroll">
          <table className="min-w-full text-xs">
            <thead className="text-ax-muted">
              <tr className="border-b border-ax-border/60">
                <th className="text-left py-2 pr-4 font-normal">Target</th>
                <th className="text-right py-2 pr-4 font-normal">MAE</th>
                <th className="text-right py-2 pr-4 font-normal">MSE</th>
                <th className="text-right py-2 pr-4 font-normal">MC p05/p50/p95</th>
                <th className="text-left py-2 font-normal">Guard</th>
              </tr>
            </thead>
            <tbody>
              {cells.map((cell, idx) => <MetricRow key={idx} cell={cell as Record<string, unknown>} />)}
            </tbody>
          </table>
        </div>
      ) : (
        <pre className="max-h-[260px] overflow-auto ax-scroll rounded-lg border border-ax-border/60 bg-ax-bg-2/60 p-3 text-[11px] text-ax-muted">
          {JSON.stringify(metrics, null, 2)}
        </pre>
      )}
    </div>
  )
}

function MetricRow({ cell }: { cell: Record<string, unknown> }) {
  const holdout = (cell.holdout ?? {}) as Record<string, unknown>
  const mc = (cell.monte_carlo ?? {}) as Record<string, unknown>
  const guard = (holdout.guard ?? {}) as Record<string, unknown>
  return (
    <tr className="border-b border-ax-border/40 align-top">
      <td className="py-2 pr-4 font-mono text-ax-blue-2">{String(cell.target_column ?? cell.path ?? '-').split('/').pop()}</td>
      <td className="py-2 pr-4 text-right font-mono text-ax-text">{formatCell((holdout.value ?? holdout.mae) as number | null)}</td>
      <td className="py-2 pr-4 text-right font-mono text-ax-text">{formatCell(holdout.mse as number | null)}</td>
      <td className="py-2 pr-4 text-right font-mono text-ax-muted">
        {formatCell(mc.p05 as number | null)} / {formatCell(mc.p50 as number | null)} / {formatCell(mc.p95 as number | null)}
      </td>
      <td className="py-2 text-left"><StatusChip status={String(cell.validation_status ?? guard._overall_pass ?? 'metrics_only')} /></td>
    </tr>
  )
}

function SourceBlock({ title, field }: { title: string; field: TibotModelRow['rawOhlcv'] }) {
  return (
    <div className="rounded-lg border border-ax-border/60 bg-ax-bg-2/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-ax-text">{title}</div>
        <div className="text-[11px] text-ax-blue-2 font-mono">{shortHash(field.sha256)}</div>
      </div>
      <div className="mt-2 text-[11px] font-mono text-ax-muted break-all">{field.path}</div>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
        <Metric k="Rows / cols" v={`${field.rows.toLocaleString()} / ${field.cols}`} />
        <Metric k="Date range" v={`${field.timestamp_min_utc} -> ${field.timestamp_max_utc}`} />
        <Metric k="Schema hash" v={shortHash(field.schema_column_order_sha256)} />
      </div>
      <div className="mt-2 text-[11px] text-ax-muted">
        {field.schema.map((s) => s.name).join(', ')}
      </div>
    </div>
  )
}

function Metric({ k, v }: { k: string; v: string | number | null | undefined }) {
  return (
    <div className="rounded-lg border border-ax-border/50 bg-ax-bg-2/50 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-ax-muted">{k}</div>
      <div className="mt-1 text-xs text-ax-text font-mono break-words">{formatCell(v)}</div>
    </div>
  )
}

function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-[10px] uppercase tracking-widest text-ax-muted px-1 mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function SelectButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-lg text-xs transition ${
        active ? 'bg-ax-blue/15 text-ax-text ax-glow' : 'text-ax-muted hover:text-ax-text hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  )
}

function Badge({ children, tone }: { children: ReactNode; tone: 'up' | 'warn' | 'muted' }) {
  const cls =
    tone === 'up'
      ? 'border-ax-up/30 bg-[#1ec8a5]/10 text-ax-up'
      : tone === 'warn'
        ? 'border-[#ffb454]/40 bg-[#ffb454]/10 text-[#ffb454]'
        : 'border-ax-border bg-white/5 text-ax-muted'
  return <span className={`inline-flex items-center rounded border px-2 py-0.5 ${cls}`}>{children}</span>
}

function StatusChip({ status }: { status: string }) {
  const good = status.includes('PASS') || status === 'true'
  const blocked = status.includes('BLOCK') || status.includes('FAIL') || status === 'false'
  const cls = good
    ? 'border-ax-up/30 bg-[#1ec8a5]/10 text-ax-up'
    : blocked
      ? 'border-ax-down/30 bg-[#ff5470]/10 text-ax-down'
      : 'border-[#ffb454]/40 bg-[#ffb454]/10 text-[#ffb454]'
  return <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] uppercase tracking-wide ${cls}`}>{status}</span>
}
