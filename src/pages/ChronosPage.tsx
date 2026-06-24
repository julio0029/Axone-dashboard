import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { ChronosChart } from '../components/ChronosChart'
import { ChronosTargetTable } from '../components/ChronosTargetTable'
import {
  CHRONOS_PATHS, CHRONOS_PROVENANCE_PATHS, CHRONOS_TIMEFRAMES, CHRONOS_SYMBOLS,
  AVAILABLE_TFS, GROUP_ORDER, DIR_COLOR,
  useChronosExport, useChronosProvenance,
  type ChronosTf, type ChronosSym,
} from '../data/chronosTargets'

const DEFAULT_ON = [
  'target_direction_1',
  'target_candle_color_1',
  'target_fwd_return_1',
]

export function ChronosPage() {
  const [sym, setSym] = useState<ChronosSym>('BTCUSDT')
  const [tf, setTf] = useState<ChronosTf>('1h')
  const [showVolume, setShowVolume] = useState(true)
  const [enabled, setEnabled] = useState<Set<string>>(() => new Set(DEFAULT_ON))

  const availTfs = AVAILABLE_TFS[sym]
  const safeTf = availTfs.includes(tf) ? tf : availTfs[0]

  const handleSymChange = (newSym: ChronosSym) => {
    setSym(newSym)
    if (!AVAILABLE_TFS[newSym].includes(tf)) setTf(AVAILABLE_TFS[newSym][0])
  }

  const path = CHRONOS_PATHS[sym][safeTf]
  const state = useChronosExport(path ?? '')
  const { data: prov } = useChronosProvenance(CHRONOS_PROVENANCE_PATHS[sym])
  const data = state.data

  const toggle = (name: string) =>
    setEnabled((s) => {
      const n = new Set(s)
      n.has(name) ? n.delete(name) : n.add(name)
      return n
    })
  const setGroup = (names: string[], on: boolean) =>
    setEnabled((s) => {
      const n = new Set(s)
      names.forEach((name) => (on ? n.add(name) : n.delete(name)))
      return n
    })

  const last = useMemo(() => {
    if (!data) return null
    const i = data.time.length - 1
    const c = data.columns
    const closeNow = c.close[i] as number
    const closePrev = c.close[i - 1] as number
    return {
      close: closeNow,
      chg: ((closeNow - closePrev) / closePrev) * 100,
      dir1: c.target_direction_1?.[i] as string | null,
      color1: c.target_candle_color_1?.[i] as string | null,
      fwd1: c.target_fwd_return_1?.[i] as number | null,
      gannBars: c.target_gann_bars_to_next_swing?.[i] as number | null,
      gannDir: c.target_gann_next_direction?.[i] as string | null,
      ts: data.manifest.windowEnd,
    }
  }, [data])

  const fmt = (n: number) =>
    n >= 1 ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : n.toPrecision(4)

  const allNames = data?.manifest.columns.map((c) => c.name) ?? []

  return (
    <div className="space-y-5 max-w-[1500px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight ax-glow-text">Chronos · Predictive Targets</h1>
          <p className="text-ax-muted mt-1 text-sm">
            The training labels Chronos derives for Tibot — forward returns, directions, excursions,
            EMA-reversal and Gann-swing horizons — overlaid candle-by-candle on certified {sym} price.
          </p>
          <p className="text-xs mt-2 flex items-center gap-2 flex-wrap">
            {state.status === 'ready' ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-ax-up/30 bg-[#1ec8a5]/10 text-ax-up">
                <span className="w-1.5 h-1.5 rounded-full bg-ax-up" /> REAL targets · build_predictive_targets_v1 · hash-verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-ax-border bg-white/5 text-ax-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-ax-muted" /> {state.status}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#ffb454]/40 bg-[#ffb454]/10 text-[#ffb454]">
              ⚠ labels only — never Tibot features / live inference
            </span>
            <Link to="/ta-v2" className="text-ax-blue-2 hover:underline">
              see the TA-v3 feature schema this is derived from →
            </Link>
          </p>
          {data && (
            <p className="text-[11px] mt-1.5 text-ax-muted leading-relaxed max-w-[680px]">
              {data.manifest.rows.toLocaleString()} of {data.manifest.canonicalRows.toLocaleString()} canonical{' '}
              {safeTf} rows (tail window) · {data.manifest.windowStart} → {data.manifest.windowEnd} UTC.
              OHLCV joined from the certified TA-v3 source on timestamp; 25 target columns copied verbatim
              (NaN→null). Nothing recomputed client-side.
            </p>
          )}
        </div>
        {last && (
          <div className="text-right">
            <div className="font-mono text-2xl text-ax-text">${fmt(last.close)}</div>
            <div className={`text-sm font-mono ${last.chg >= 0 ? 'text-ax-up' : 'text-ax-down'}`}>
              {last.chg >= 0 ? '▲' : '▼'} {last.chg.toFixed(2)}%
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-5">
        {/* Left panel */}
        <div className="space-y-5">
          <Card title="Symbol" bodyClass="!p-3">
            <div className="grid grid-cols-2 gap-1.5">
              {CHRONOS_SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSymChange(s)}
                  className={`py-1.5 rounded-lg text-xs font-mono transition truncate ${
                    s === sym
                      ? 'bg-ax-blue/15 text-ax-text ax-glow'
                      : 'text-ax-muted hover:text-ax-text hover:bg-white/5'
                  }`}
                >
                  {s.replace('USDT', '')}
                </button>
              ))}
            </div>
          </Card>
          <Card title="Timeframe" bodyClass="!p-3">
            <div className="grid grid-cols-2 gap-2">
              {CHRONOS_TIMEFRAMES.map((t) => {
                const avail = availTfs.includes(t)
                return (
                  <button
                    key={t}
                    disabled={!avail}
                    onClick={() => avail && setTf(t)}
                    title={!avail ? `${t} not available for ${sym}` : undefined}
                    className={`py-2 rounded-lg text-sm font-mono transition ${
                      !avail
                        ? 'text-ax-muted/30 cursor-not-allowed'
                        : t === safeTf
                        ? 'bg-ax-blue/15 text-ax-text ax-glow'
                        : 'text-ax-muted hover:text-ax-text hover:bg-white/5'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </Card>
          <Card title="View" bodyClass="!p-3">
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm px-1">
                <span className="text-ax-muted">Volume pane</span>
                <button
                  onClick={() => setShowVolume((v) => !v)}
                  role="switch" aria-checked={showVolume}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${showVolume ? 'bg-ax-blue ax-glow' : 'bg-ax-border'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${showVolume ? 'translate-x-[18px]' : 'translate-x-[4px]'}`} />
                </button>
              </label>
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => setGroup(allNames, true)}
                  className="flex-1 px-2 py-1.5 rounded border border-ax-blue/30 text-ax-blue-2 text-xs hover:bg-ax-blue/10 transition"
                >all targets</button>
                <button
                  onClick={() => setGroup(allNames, false)}
                  className="flex-1 px-2 py-1.5 rounded border border-ax-border text-ax-muted text-xs hover:bg-white/5 transition"
                >clear</button>
              </div>
            </div>
          </Card>
          {last && (
            <Card title="Latest label" subtitle={last.ts + ' UTC'} bodyClass="!p-4">
              <dl className="text-sm space-y-2">
                <LabelRow k="dir +1" v={last.dir1} />
                <LabelRow k="candle +1" v={last.color1} />
                <div className="flex justify-between font-mono">
                  <dt className="text-ax-muted">fwd ret +1</dt>
                  <dd className={(last.fwd1 ?? 0) >= 0 ? 'text-ax-up' : 'text-ax-down'}>
                    {last.fwd1 == null ? '—' : `${last.fwd1.toFixed(3)}%`}
                  </dd>
                </div>
                <div className="flex justify-between font-mono border-t border-ax-border/60 pt-2">
                  <dt className="text-ax-muted">gann swing</dt>
                  <dd className="text-ax-text">
                    {last.gannBars == null ? '—' : `${last.gannBars} bars`}{' '}
                    <span style={{ color: DIR_COLOR[last.gannDir ?? ''] ?? '#6b7a96' }}>{last.gannDir ?? ''}</span>
                  </dd>
                </div>
              </dl>
            </Card>
          )}
        </div>

        {/* Center chart */}
        <Card
          title={`${sym} · ${safeTf} · predictive targets`}
          subtitle="Candles + direction label ribbons + banded numeric target panes · scroll / drag to zoom · hover for values"
          bodyClass="!p-2"
        >
          {state.status === 'ready' && data ? (
            <ChronosChart data={data} tf={safeTf} enabled={enabled} showVolume={showVolume} />
          ) : (
            <div className="h-[420px] flex items-center justify-center text-sm text-ax-muted">
              {state.status === 'loading' && 'loading certified targets…'}
              {state.status === 'absent' && `targets export not found (run scripts/gen_chronos_targets_v3.py)`}
              {state.status === 'error' && `failed to load: ${state.error}`}
            </div>
          )}
        </Card>
      </div>

      {/* Target registry */}
      <Card
        title="Predictive target columns"
        subtitle="25 labels emitted per candle by build_predictive_targets_v1 · toggle onto the chart · direction targets render as colour ribbons, numeric targets as banded sub-panes"
      >
        {data ? (
          <ChronosTargetTable
            columns={data.manifest.columns}
            enabled={enabled}
            onToggle={toggle}
            onGroup={setGroup}
            groupOrder={GROUP_ORDER}
          />
        ) : (
          <p className="text-sm text-ax-muted">column registry loads with the export.</p>
        )}
      </Card>

      {/* Provenance / integrity */}
      {prov && (
        <Card title="Provenance & integrity" subtitle="how this page is wired to Chronos' certified output">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
            <Prov k="Symbol" v={prov.symbol} />
            <Prov k="Build script" v={prov.buildScript.split('/').pop() ?? ''} />
            <Prov k="Script sha1" v={prov.buildScriptSha1 ?? '—'} mono />
            <Prov k="Manifest version" v={prov.version} />
            <Prov k="Generated (UTC)" v={prov.generatedAtUtc} />
            <Prov k="Purge/embargo" v={String(prov.purgeEmbargoRequiredBars ?? '—')} />
            {prov.timeframes.map((t) => (
              <Prov key={t} k={`${t} targets sha256`} v={prov.artifacts[t]?.targetsCsvSha256 ?? '—'} mono />
            ))}
            {prov.timeframes.slice(0, 1).map((t) => (
              <Prov key={`src-${t}`} k={`OHLCV source sha256 (${t})`} v={prov.artifacts[t]?.sourceCsvSha256 ?? '—'} mono />
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-[11px] text-[#ffb454] bg-[#ffb454]/5 border border-[#ffb454]/25 rounded-lg px-3 py-2 leading-relaxed">
              <strong>Leakage policy:</strong> {prov.leakagePolicy}
            </p>
            <p className="text-[11px] text-ax-muted leading-relaxed">
              <strong className="text-ax-text">Null policy:</strong> {prov.nullPolicy}{' '}
              <strong className="text-ax-text">Window:</strong> {prov.windowing.note}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

function LabelRow({ k, v }: { k: string; v: string | null }) {
  return (
    <div className="flex justify-between items-center">
      <dt className="text-ax-muted font-mono">{k}</dt>
      <dd>
        <span
          className="px-2 py-0.5 rounded text-[11px] font-mono border"
          style={{
            color: DIR_COLOR[v ?? ''] ?? '#6b7a96',
            borderColor: (DIR_COLOR[v ?? ''] ?? '#6b7a96') + '55',
            background: (DIR_COLOR[v ?? ''] ?? '#6b7a96') + '14',
          }}
        >
          {v ?? '—'}
        </span>
      </dd>
    </div>
  )
}

function Prov({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ax-border/30 py-1">
      <span className="text-ax-muted whitespace-nowrap">{k}</span>
      <span className={`text-ax-text text-right ${mono ? 'font-mono text-[10px] break-all' : ''}`}>{v}</span>
    </div>
  )
}
