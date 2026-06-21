import { useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { SandboxChartPanel } from '../components/SandboxChartPanel'
import {
  TA_V2_PROVENANCE, BTC_VALIDATION, CANDLE_FLAGS, PARITY, NAN_AUDIT,
  SCHEMA_GROUPS, SCHEMA_COLUMN_COUNT, type ParityTag,
} from '../data/taV2'
import {
  CHRONOS_GATE_A, GATE_A_TIMEFRAMES, GATE_A_GAPS, GATE_A_VALIDATION,
  GATE_A_PROVENANCE_CHAIN,
} from '../data/chronosGateA'

const PARITY_BADGE: Record<ParityTag, { label: string; cls: string }> = {
  exact: { label: 'parity 0.0', cls: 'text-ax-up bg-[#1ec8a5]/10 border-[#1ec8a5]/30' },
  intended: { label: 'Wilder Δ', cls: 'text-ax-blue-2 bg-ax-blue/10 border-ax-blue/30' },
  populated: { label: 'validated', cls: 'text-ax-muted bg-white/[0.03] border-ax-border' },
}

const nf = (n: number) => n.toLocaleString('en-US')

export function TaV2Page() {
  const [open, setOpen] = useState<Set<string>>(() => new Set(['candles']))
  const toggle = (k: string) =>
    setOpen((s) => {
      const n = new Set(s)
      n.has(k) ? n.delete(k) : n.add(k)
      return n
    })

  const dojiPct = useMemo(
    () => (CANDLE_FLAGS.doji.flagged / BTC_VALIDATION.candles) * 100,
    [],
  )
  const maruActive = CANDLE_FLAGS.marubozu.bullish + CANDLE_FLAGS.marubozu.bearish

  return (
    <div className="space-y-5 max-w-[1500px] mx-auto">
      {/* Hero / thesis */}
      <div className="ax-card overflow-hidden">
        <div className="px-6 py-6 md:px-8 md:py-7 relative">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ax-blue-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-ax-up ax-glow" />
                Sandbox · Chronos Gate-A · BTCUSDT calculation run
              </div>
              <h1 className="font-display text-[34px] leading-tight tracking-tight mt-2 ax-glow-text">
                Gate-A verified.
                <br />Gann swings, 5m → 1D.
              </h1>
              <p className="text-ax-muted mt-2 text-sm max-w-xl">
                Chronos' Sentinel-gated calculation run over {nf(CHRONOS_GATE_A.totalSourceCandles)} source{' '}
                {CHRONOS_GATE_A.symbol} candles ({CHRONOS_GATE_A.rangeStart} → {CHRONOS_GATE_A.rangeEnd}).
                Real OHLCV plus the certified <code className="text-ax-blue-2">gann_swing</code> direction across
                four timeframes — all 8 artifact SHA-256 hashes re-verified before this dashboard was touched.
                Gate B and the EVIDENCE target-spec are <span className="text-ax-text">parked</span>; no targets built.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-[40px] leading-none text-ax-up">PASS</div>
              <div className="text-ax-muted text-xs tracking-wide mt-1">Gate-A verdict</div>
              <div className="mt-3 text-[11px] font-mono text-ax-muted">
                sentinel gate {CHRONOS_GATE_A.sentinelSha.slice(0, 12)}…
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-6 rounded-xl overflow-hidden border border-ax-border/70 bg-ax-border/40">
            <Kpi label="Range" value={CHRONOS_GATE_A.rangeStart} sub={`→ ${CHRONOS_GATE_A.rangeEnd}`} />
            <Kpi label="Timeframes" value="4" sub="5m · 1h · 4h · 1D" />
            <Kpi label="Hashes verified" value="8 / 8" sub="SHA-256 confirmed" good />
            <Kpi label="Gate B" value="Parked" sub="no targets built" />
          </div>
        </div>
      </div>

      {/* Provenance: verified Gate-A chain */}
      <div className="ax-card px-5 py-4 border-l-2 border-l-ax-up">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-ax-up text-sm">◆</span>
          <div className="text-sm">
            <span className="text-ax-text font-medium">Data provenance.</span>{' '}
            <span className="text-ax-muted">
              The interactive chart below renders <span className="text-ax-up">only</span> Chronos' verified
              Gate-A export — real OHLCV candles and the certified <code className="text-ax-blue-2">gann_swing</code>{' '}
              direction column (swing pivots derived from its sign flips, nothing recomputed). Guy is read-only with
              respect to Axone: the canonical stores and Gann artifacts are untouched; only the dashboard's display
              JSON was written. The <span className="text-ax-text">schema / parity / candle-flag</span> panels lower
              on this page remain the broader TA-v2 indicator reference (Sublime), distinct from this calculation run.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Gann chart — verified Chronos Gate-A export */}
      <SandboxChartPanel />

      {/* Gate-A run summary: per-timeframe split + validation checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          title="Gann swing split by timeframe"
          subtitle="Up / down direction share over the full canonical series"
          right={<Seal sha1={CHRONOS_GATE_A.sentinelSha} />}
        >
          <div className="divide-y divide-ax-border/50">
            {GATE_A_TIMEFRAMES.map((t) => (
              <div key={t.tf} className="flex items-center gap-4 py-3">
                <div className="w-12 shrink-0 font-mono text-ax-text text-sm">{t.tf}</div>
                <div className="w-28 shrink-0 text-ax-muted text-[11px] font-mono">{nf(t.rows)} rows</div>
                <div className="flex-1 min-w-0">
                  <FlagBar
                    segments={[
                      { label: `up ${t.upPct}%`, value: t.upPct, cls: 'bg-ax-up' },
                      { label: `down ${t.downPct}%`, value: t.downPct, cls: 'bg-ax-down' },
                    ]}
                    total={100}
                  />
                </div>
                <div className="w-24 shrink-0 text-right font-mono text-[11px]">
                  <span className="text-ax-up">{t.upPct}%</span>
                  <span className="text-ax-muted"> / </span>
                  <span className="text-ax-down">{t.downPct}%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-ax-muted text-xs mt-4 pt-3 border-t border-ax-border/50">
            Accepted ingest gaps (binance-downtime): 5m {GATE_A_GAPS['5m'].breaks} breaks /{' '}
            {GATE_A_GAPS['5m'].missing} missing · 1h {GATE_A_GAPS['1h'].breaks} breaks /{' '}
            {GATE_A_GAPS['1h'].missing} missing — consistent with the ingest ledger.
          </p>
        </Card>

        <Card
          title="Gate-A validation"
          subtitle={`Manifest ${CHRONOS_GATE_A.manifestId}`}
          right={
            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border text-ax-up bg-[#1ec8a5]/10 border-[#1ec8a5]/30">
              all pass
            </span>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
            {GATE_A_VALIDATION.map((v) => (
              <div key={v.key} className="flex items-center gap-2 text-sm py-1">
                <span className="text-ax-up text-xs">✓</span>
                <span className="text-ax-muted">{v.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-ax-border/50 space-y-1.5">
            {GATE_A_PROVENANCE_CHAIN.map((step, i) => (
              <div key={i} className="flex gap-2 text-[11px] text-ax-muted leading-relaxed">
                <span className="text-ax-blue-2 font-mono shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <p className="text-ax-muted text-[11px] font-mono mt-3 pt-3 border-t border-ax-border/50 break-all">
            gann shim sha256 {CHRONOS_GATE_A.gannShimSha256.slice(0, 24)}…
          </p>
        </Card>
      </div>

      {/* ── TA-v2 indicator schema reference (Sublime) — context, not this run ── */}
      <div className="ax-card px-5 py-3 border-l-2 border-l-ax-blue/40">
        <div className="text-[11px] uppercase tracking-[0.2em] text-ax-blue-2">TA-v2 indicator schema reference</div>
        <p className="text-ax-muted text-xs mt-1">
          The panels below describe Sublime's full {SCHEMA_COLUMN_COUNT}-column TA-v2 schema and its parity/candle-flag
          validation — broader indicator context, separate from the Chronos Gate-A calculation run above.
        </p>
      </div>

      {/* Candle flags — the new story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          title="Doji"
          subtitle="candle_doji · stock-indicators match flag"
          right={<NewBadge />}
        >
          <FlagBar
            segments={[
              { label: 'flagged', value: CANDLE_FLAGS.doji.flagged, cls: 'bg-ax-blue' },
              { label: 'unflagged', value: CANDLE_FLAGS.doji.unflagged, cls: 'bg-ax-border' },
            ]}
            total={BTC_VALIDATION.candles}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm font-mono">
            <Stat k="Flagged" v={nf(CANDLE_FLAGS.doji.flagged)} accent />
            <Stat k="Unflagged" v={nf(CANDLE_FLAGS.doji.unflagged)} />
          </div>
          <p className="text-ax-muted text-xs mt-3">
            {dojiPct.toFixed(1)}% of candles match the Doji body/range test — populated non-trivially.
          </p>
        </Card>

        <Card
          title="Marubozu"
          subtitle="candle_marubozu · directional match flag"
          right={<NewBadge />}
        >
          <FlagBar
            segments={[
              { label: 'bullish', value: CANDLE_FLAGS.marubozu.bullish, cls: 'bg-ax-up' },
              { label: 'bearish', value: CANDLE_FLAGS.marubozu.bearish, cls: 'bg-ax-down' },
              { label: 'neutral', value: CANDLE_FLAGS.marubozu.neutral, cls: 'bg-ax-border' },
            ]}
            total={BTC_VALIDATION.candles}
          />
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm font-mono">
            <Stat k="Bullish" v={nf(CANDLE_FLAGS.marubozu.bullish)} up />
            <Stat k="Bearish" v={nf(CANDLE_FLAGS.marubozu.bearish)} down />
            <Stat k="Neutral" v={nf(CANDLE_FLAGS.marubozu.neutral)} />
          </div>
          <p className="text-ax-muted text-xs mt-3">
            {nf(maruActive)} directional Marubozu candles ({((maruActive / BTC_VALIDATION.candles) * 100).toFixed(1)}%),
            split near-evenly bull/bear.
          </p>
        </Card>
      </div>

      {/* Parity ledger — the signature element */}
      <Card
        title="Canonical parity ledger"
        subtitle="Max absolute delta vs canonical over the same 100,000 rows"
        right={<Seal sha1={TA_V2_PROVENANCE.sha1} />}
      >
        <div className="divide-y divide-ax-border/50">
          {PARITY.map((p) => (
            <div key={p.name} className="flex items-center gap-4 py-3">
              <div className="w-44 shrink-0 text-ax-text text-sm">{p.name}</div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-lg tracking-tight tabular-nums">
                  {p.kind === 'exact' ? (
                    <span className="text-ax-up">0.000000</span>
                  ) : (
                    <span className="text-ax-blue-2">{p.maxAbsDelta.toFixed(3)}</span>
                  )}
                </div>
                <div className="text-ax-muted text-xs mt-0.5">{p.note}</div>
              </div>
              <span
                className={`shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${
                  p.kind === 'exact'
                    ? 'text-ax-up bg-[#1ec8a5]/10 border-[#1ec8a5]/30'
                    : 'text-ax-blue-2 bg-ax-blue/10 border-ax-blue/30'
                }`}
              >
                {p.kind === 'exact' ? 'bit-for-bit' : 'intended Δ'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-ax-muted text-xs mt-4 pt-3 border-t border-ax-border/50">
          {NAN_AUDIT.note}
        </p>
      </Card>

      {/* Full schema, grouped */}
      <Card
        title="TA-v2 output schema"
        subtitle={`${SCHEMA_COLUMN_COUNT} columns across ${SCHEMA_GROUPS.length} indicator families — click a family to expand`}
        right={
          <button
            onClick={() => setOpen(new Set(SCHEMA_GROUPS.map((g) => g.key)))}
            className="text-xs text-ax-muted hover:text-ax-text transition"
          >
            expand all
          </button>
        }
      >
        <div className="space-y-2">
          {SCHEMA_GROUPS.map((g) => {
            const isOpen = open.has(g.key)
            const badge = PARITY_BADGE[g.parity]
            return (
              <div key={g.key} className="rounded-xl border border-ax-border/60 overflow-hidden">
                <button
                  onClick={() => toggle(g.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition"
                >
                  <span className={`text-ax-muted text-xs transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                  <span className="text-ax-text font-medium text-sm">{g.name}</span>
                  {g.isNew && <NewBadge />}
                  <span className="text-ax-muted text-xs font-mono">{g.cols.length} col{g.cols.length > 1 ? 's' : ''}</span>
                  <span className="ml-auto flex items-center gap-2">
                    {g.nanHeavy && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border text-ax-down bg-[#ff5470]/10 border-[#ff5470]/30">
                        sparse markers
                      </span>
                    )}
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-ax-border/50">
                    <p className="text-ax-muted text-xs mb-3">{g.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.cols.map((c) => (
                        <code
                          key={c}
                          className="font-mono text-[11px] px-2 py-1 rounded-md bg-ax-bg-2/70 border border-ax-border/60 text-ax-text"
                        >
                          {c}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <p className="text-ax-muted text-[11px] font-mono text-center pb-2">
        source · {TA_V2_PROVENANCE.file} · {nf(TA_V2_PROVENANCE.lines)} lines · sha1 {TA_V2_PROVENANCE.sha1}
      </p>
    </div>
  )
}

// ── small building blocks ───────────────────────────────────────────────────

function Kpi({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: boolean }) {
  return (
    <div className="bg-ax-panel/80 px-4 py-3">
      <div className="text-ax-muted text-[10px] uppercase tracking-widest">{label}</div>
      <div className={`font-mono text-sm mt-1 ${good ? 'text-ax-up' : 'text-ax-text'}`}>{value}</div>
      {sub && <div className="text-ax-muted text-[11px] font-mono mt-0.5">{sub}</div>}
    </div>
  )
}

function NewBadge() {
  return (
    <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-ax-blue/15 text-ax-blue-2 border border-ax-blue/40 ax-glow">
      new
    </span>
  )
}

function Stat({ k, v, accent, up, down }: { k: string; v: string; accent?: boolean; up?: boolean; down?: boolean }) {
  const color = up ? 'text-ax-up' : down ? 'text-ax-down' : accent ? 'text-ax-blue-2' : 'text-ax-text'
  return (
    <div>
      <div className="text-ax-muted text-[11px] uppercase tracking-wide">{k}</div>
      <div className={`${color} text-base mt-0.5`}>{v}</div>
    </div>
  )
}

function FlagBar({
  segments, total,
}: {
  segments: { label: string; value: number; cls: string }[]
  total: number
}) {
  return (
    <div className="h-3 w-full rounded-full overflow-hidden flex bg-ax-bg-2 border border-ax-border/60">
      {segments.map((s) => (
        <div
          key={s.label}
          className={s.cls}
          style={{ width: `${(s.value / total) * 100}%` }}
          title={`${s.label}: ${s.value.toLocaleString('en-US')}`}
        />
      ))}
    </div>
  )
}

function Seal({ sha1 }: { sha1: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-widest text-ax-muted">verified</div>
      <div className="font-mono text-[11px] text-ax-blue-2">{sha1.slice(0, 12)}…</div>
    </div>
  )
}
