import { useMemo, useState } from 'react'
import { Card } from '../components/Card'
import {
  useManifestRegistry,
  indexSlices,
  sliceKey,
  shortHash,
  symLabel,
  STATUS_META,
  type RegistrySlice,
  type TierKey,
  type SliceStatus,
} from '../data/manifestRegistry'

const TIER_KEYS: TierKey[] = ['t1_ohlcv', 't2_features', 't3_targets', 't4_models']
const TIER_PIP = { t1_ohlcv: '1', t2_features: '2', t3_targets: '3', t4_models: '4' }

export function RegistryPage() {
  const { status, data, error } = useManifestRegistry()
  const [selected, setSelected] = useState<RegistrySlice | null>(null)

  const idx = useMemo(() => (data ? indexSlices(data.slices) : null), [data])

  if (status !== 'ready' || !data || !idx) {
    return (
      <div className="space-y-4">
        <Banner text="Historical sandbox — not live forecasts" />
        <Card title="Progressive Manifest Registry" subtitle="shared tiered universe · read-only scaffold">
          <div className="py-14 text-center text-sm text-ax-muted">
            {status === 'loading' && 'loading manifest registry…'}
            {status === 'absent' && 'registry not found — run scripts/gen_manifest_registry.py'}
            {status === 'error' && `error: ${error}`}
          </div>
        </Card>
      </div>
    )
  }

  const gateA = data.gates?.gateA
  const grid: string[] = data.timeframes

  return (
    <div className="space-y-4">
      <Banner text={data.banner} />

      {/* Top summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Registry" subtitle={data.artifactType}>
          <dl className="text-sm space-y-1.5">
            <Row k="version" v={data.version} />
            <Row k="generated" v={data.generatedAtUtc} />
            <Row k="slices" v={`${data.sliceCount}`} />
            <Row k="symbols × TFs" v={`${data.symbols.length} × ${data.timeframes.join('/')}`} />
          </dl>
        </Card>

        <Card title="Gate A" subtitle="Tier-4 predictions gate">
          {gateA ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Dot status={gateA.status} />
                <span className="font-display text-sm tracking-wide" style={{ color: STATUS_META[gateA.status].color }}>
                  {gateA.status.toUpperCase()}
                </span>
                <span className="text-ax-muted text-xs">{gateA.label}</span>
              </div>
              <p className="text-ax-muted text-xs leading-relaxed">{gateA.description}</p>
            </div>
          ) : (
            <p className="text-ax-muted text-sm">no gate declared</p>
          )}
        </Card>

        <Card title="Tier fill" subtitle="verified / pending / blocked">
          <div className="space-y-2">
            {data.tiers.map((t) => {
              const tal = data.tally[t.key]
              return (
                <div key={t.key} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-ax-muted font-mono">T{t.order}</span>
                  <span className="w-28 text-ax-text truncate">{t.label}</span>
                  <FillBar tally={tal} />
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Tier legend */}
      <Card title="Progressive tiers" subtitle="each historical slice fills tier by tier as manifests are published & verified">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {data.tiers.map((t) => (
            <div key={t.key} className="rounded-lg border border-ax-border/70 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-ax-blue/15 text-ax-blue-2 text-[11px] font-mono">
                  {t.order}
                </span>
                <span className="text-ax-text text-sm font-display tracking-wide">{t.label}</span>
              </div>
              <p className="text-ax-muted text-[11px] leading-snug">{t.desc}</p>
              <p className="text-ax-muted/70 text-[10px] mt-1.5 uppercase tracking-wide">owner · {t.owner}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Progressive matrix */}
      <Card
        title="Historical universe"
        subtitle="symbol × timeframe × tier — verified slices render; pending / blocked show placeholder"
        right={<StatusKey />}
      >
        <div className="overflow-x-auto ax-scroll">
          <table className="w-full border-separate border-spacing-y-1">
            <thead>
              <tr className="text-ax-muted text-[10px] uppercase tracking-widest">
                <th className="text-left font-normal px-2 py-1 sticky left-0 bg-ax-bg-2/0">Symbol</th>
                {grid.map((tf) => (
                  <th key={tf} className="text-center font-normal px-2 py-1">{tf}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.symbols.map((sym) => (
                <tr key={sym} className="group">
                  <td className="px-2 py-1 sticky left-0">
                    <span className="font-display text-sm text-ax-text tracking-wide">{symLabel(sym)}</span>
                    <span className="text-ax-muted text-[10px] ml-1">{sym.replace(symLabel(sym), '')}</span>
                  </td>
                  {grid.map((tf) => {
                    // does this (sym,tf) exist at all in the published grid?
                    const exists = TIER_KEYS.some((tk) => idx.has(sliceKey(sym, tf, tk)))
                    return (
                      <td key={tf} className="px-1.5 py-1">
                        {exists ? (
                          <div className="flex items-center justify-center gap-1 rounded-md border border-ax-border/50 bg-white/[0.015] px-1.5 py-1">
                            {TIER_KEYS.map((tk) => {
                              const s = idx.get(sliceKey(sym, tf, tk))
                              return (
                                <TierPip
                                  key={tk}
                                  tier={tk}
                                  slice={s}
                                  active={
                                    !!selected &&
                                    selected.symbol === sym &&
                                    selected.timeframe === tf &&
                                    selected.tier === tk
                                  }
                                  onClick={() => s && setSelected(s)}
                                />
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center text-ax-border text-xs select-none">·</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-ax-muted/70 text-[10px] mt-3">
          Pips = tiers 1–4 (OHLCV · features · targets · models). Click a pip to inspect its slice.
        </p>
      </Card>

      {/* Slice inspector */}
      <Card title="Slice inspector" subtitle={selected ? `${selected.symbol} · ${selected.timeframe} · T${TIER_PIP[selected.tier]}` : 'select a pip above'}>
        {selected ? (
          <SliceDetail slice={selected} tierLabel={data.tiers.find((t) => t.key === selected.tier)?.label ?? selected.tier} />
        ) : (
          <p className="text-ax-muted text-sm py-6 text-center">
            No slice selected. Click any tier pip in the matrix to see its manifest hash, range and provenance.
          </p>
        )}
      </Card>

      <p className="text-ax-muted/60 text-[10px] px-1">
        {String(data.policy?.readOnly ?? '')} · {String(data.policy?.leakage ?? '')}
      </p>
    </div>
  )
}

function Banner({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-ax-down/40 bg-ax-down/10 px-4 py-2.5 flex items-center gap-2.5">
      <span className="w-2 h-2 rounded-full bg-ax-down animate-pulse shrink-0" />
      <span className="text-[13px] tracking-wide text-[#ffb0bd] font-display uppercase">{text}</span>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ax-muted text-xs">{k}</dt>
      <dd className="text-ax-text text-xs font-mono truncate max-w-[60%] text-right">{v}</dd>
    </div>
  )
}

function Dot({ status }: { status: SliceStatus }) {
  return <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_META[status].color }} />
}

function FillBar({ tally }: { tally: { verified: number; pending: number; blocked: number } }) {
  const total = Math.max(1, tally.verified + tally.pending + tally.blocked)
  const seg = (n: number, s: SliceStatus) =>
    n > 0 ? <span style={{ width: `${(n / total) * 100}%`, background: STATUS_META[s].color }} className="h-full inline-block" /> : null
  return (
    <div className="flex-1 flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/5 flex">
        {seg(tally.verified, 'verified')}
        {seg(tally.pending, 'pending')}
        {seg(tally.blocked, 'blocked')}
      </div>
      <span className="text-ax-muted font-mono text-[10px] w-16 text-right">
        {tally.verified}✓ {tally.pending + tally.blocked}⏳
      </span>
    </div>
  )
}

function StatusKey() {
  return (
    <div className="flex items-center gap-3 text-[10px] text-ax-muted">
      {(['verified', 'pending', 'blocked'] as SliceStatus[]).map((s) => (
        <span key={s} className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: STATUS_META[s].color }} />
          {STATUS_META[s].label}
        </span>
      ))}
    </div>
  )
}

function TierPip({
  tier,
  slice,
  active,
  onClick,
}: {
  tier: TierKey
  slice?: RegistrySlice
  active: boolean
  onClick: () => void
}) {
  const st = slice?.status
  const color = st ? STATUS_META[st].color : '#1b2740'
  const verified = st === 'verified'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!slice}
      title={slice ? `T${TIER_PIP[tier]} ${slice.status}` : `T${TIER_PIP[tier]} —`}
      className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-mono transition"
      style={{
        color: verified ? '#07101f' : color,
        background: verified ? color : STATUS_META[st ?? 'pending']?.dim ?? 'transparent',
        border: st === 'blocked' ? `1px solid ${color}` : st === 'pending' ? `1px dashed ${color}` : 'none',
        opacity: slice ? 1 : 0.25,
        boxShadow: active ? `0 0 0 2px #4dd2ff` : undefined,
      }}
    >
      {TIER_PIP[tier]}
    </button>
  )
}

function SliceDetail({ slice, tierLabel }: { slice: RegistrySlice; tierLabel: string }) {
  const fields: [string, string | number | null | undefined][] = [
    ['tier', `T${TIER_PIP[slice.tier]} · ${tierLabel}`],
    ['status', slice.status],
    ['source', slice.source],
    ['rows', slice.rows ?? undefined],
    ['canonical rows', slice.canonicalRows ?? undefined],
    ['range', slice.range ? `${slice.range.startUtc ?? '—'} → ${slice.range.endUtc ?? '—'}` : undefined],
    ['targets', slice.targetCount ?? undefined],
    ['features', slice.featureCount ?? undefined],
    ['target contract', slice.targetContract ?? undefined],
    ['package status', slice.packageStatus ?? undefined],
    ['manifest sha256', slice.manifestSha256 ? shortHash(slice.manifestSha256) : undefined],
    ['rendered', slice.renderedRoute ?? undefined],
  ]
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Dot status={slice.status} />
        <span className="font-display tracking-wide" style={{ color: STATUS_META[slice.status].color }}>
          {slice.status.toUpperCase()}
        </span>
        {slice.status !== 'verified' && (
          <span className="text-ax-muted text-xs">— not rendered; placeholder shown</span>
        )}
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        {fields
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 border-b border-ax-border/40 pb-1">
              <dt className="text-ax-muted text-xs">{k}</dt>
              <dd className="text-ax-text text-xs font-mono truncate max-w-[62%] text-right">{String(v)}</dd>
            </div>
          ))}
      </dl>
      {slice.note && <p className="text-ax-muted text-xs leading-relaxed">{slice.note}</p>}
      {slice.renderedRoute && (
        <a
          href={`#${slice.renderedRoute}`}
          className="inline-block text-xs text-ax-blue-2 hover:underline"
        >
          → open rendered view ({slice.renderedRoute})
        </a>
      )}
    </div>
  )
}
