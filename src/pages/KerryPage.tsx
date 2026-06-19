import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { CandleChart } from '../components/CandleChart'
import { ColumnTable } from '../components/ColumnTable'
import {
  SYMBOLS, TIMEFRAMES, COLUMNS, generateOHLCV,
  isRealAvailable, getRealBundle, REAL_SYMBOL, REAL_TF,
  type Symbol, type Timeframe,
} from '../data/kerry'

export function KerryPage() {
  const [symbol, setSymbol] = useState<Symbol>('BTCUSDT')
  const [tf, setTf] = useState<Timeframe>('1h')
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(COLUMNS.filter((c) => c.defaultOn).map((c) => c.key)),
  )

  const real = isRealAvailable(symbol, tf)
  const bundle = useMemo(() => (real ? getRealBundle() : null), [real])
  const candles = useMemo(
    () => (bundle ? bundle.candles : generateOHLCV(symbol, tf, 200)),
    [bundle, symbol, tf],
  )
  const last = candles[candles.length - 1]
  const prev = candles[candles.length - 2]
  const chg = ((last.close - prev.close) / prev.close) * 100

  const toggle = (key: string) =>
    setEnabled((s) => {
      const n = new Set(s)
      n.has(key) ? n.delete(key) : n.add(key)
      return n
    })

  const fmt = (n: number) =>
    n >= 1 ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : n.toPrecision(4)

  return (
    <div className="space-y-5 max-w-[1500px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight ax-glow-text">Kerry · Market Data</h1>
          <p className="text-ax-muted mt-1 text-sm">
            Raw OHLCV and the features derived from it, aligned candle-by-candle.
          </p>
          <p className="text-xs mt-2 flex items-center gap-2 flex-wrap">
            {real ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-ax-up/30 bg-[#1ec8a5]/10 text-ax-up">
                <span className="w-1.5 h-1.5 rounded-full bg-ax-up" /> REAL OHLCV · Binance via Kerry handoff
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-ax-down/30 bg-[#ff5470]/10 text-ax-down">
                <span className="w-1.5 h-1.5 rounded-full bg-ax-down" /> illustrative mock OHLCV
              </span>
            )}
            <Link to="/ta-v2" className="text-ax-blue-2 hover:underline">
              see the validated TA-v2 schema & BTCUSDT test →
            </Link>
          </p>
          {real && bundle ? (
            <p className="text-[11px] mt-1.5 text-ax-muted leading-relaxed max-w-[640px]">
              {bundle.meta.count} real {bundle.meta.interval} candles · {bundle.meta.windowStartUtc} → {bundle.meta.windowEndUtc} UTC.
              Overlays (EMA&nbsp;50/200, Bollinger, RSI) use Kerry's precomputed indicator columns, not a
              client-side recompute. Source: {bundle.meta.source}. EMA/MACD/Bollinger are parity-0 vs TA-v2 per
              Sublime's validation; the 5m / 100k TA-v2 frame is not exported, so this chart uses the available
              real 1h handoff.
            </p>
          ) : (
            <p className="text-[11px] mt-1.5 text-ax-muted leading-relaxed max-w-[640px]">
              {symbol === REAL_SYMBOL
                ? `Real data for ${REAL_SYMBOL} is wired at the ${REAL_TF} timeframe — switch to ${REAL_TF} to view it. Other timeframes remain a seeded mock.`
                : `Per operator scope, only ${REAL_SYMBOL} is backed by real data. ${symbol} remains a deterministic seeded mock (no real feed wired).`}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl text-ax-text">${fmt(last.close)}</div>
          <div className={`text-sm font-mono ${chg >= 0 ? 'text-ax-up' : 'text-ax-down'}`}>
            {chg >= 0 ? '▲' : '▼'} {chg.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-5">
        {/* Left panel */}
        <div className="space-y-5">
          <Card title="Symbol" bodyClass="!p-3">
            <div className="space-y-1 max-h-[320px] overflow-y-auto ax-scroll">
              {SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition ${
                    s === symbol ? 'bg-ax-blue/15 text-ax-text ax-glow' : 'text-ax-muted hover:text-ax-text hover:bg-white/5'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
          <Card title="Timeframe" bodyClass="!p-3">
            <div className="grid grid-cols-4 gap-2">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTf(t)}
                  className={`py-2 rounded-lg text-sm font-mono transition ${
                    t === tf ? 'bg-ax-blue/15 text-ax-text ax-glow' : 'text-ax-muted hover:text-ax-text hover:bg-white/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>
          <Card title="OHLCV (last)" bodyClass="!p-4">
            <dl className="text-sm font-mono space-y-1.5">
              {([['O', last.open], ['H', last.high], ['L', last.low], ['C', last.close]] as const).map(
                ([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-ax-muted">{k}</dt>
                    <dd className="text-ax-text">{fmt(v)}</dd>
                  </div>
                ),
              )}
              <div className="flex justify-between border-t border-ax-border/60 pt-1.5">
                <dt className="text-ax-muted">Vol</dt>
                <dd className="text-ax-text">{(last.volume / 1000).toFixed(1)}k</dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Center chart */}
        <Card
          title={`${symbol} · ${tf}${real ? ' · REAL' : ''}`}
          subtitle="Candlestick · interactive zoom (scroll / drag the range bar) · hover for OHLCV"
          bodyClass="!p-2"
        >
          <CandleChart candles={candles} tf={tf} enabled={enabled} real={bundle?.overlays} />
        </Card>
      </div>

      {/* Bottom panel */}
      <Card
        title="Optional columns"
        subtitle={
          real
            ? "Overlay/sub-chart subset for this chart, drawn from Kerry's real precomputed columns — the full 90-column TA-v2 schema lives on the TA-v2 · Validation page."
            : 'Client-side subset for this chart (recomputed from the seeded mock OHLCV) — the full 90-column TA-v2 schema lives on the TA-v2 · Validation page.'
        }
      >
        <ColumnTable enabled={enabled} onToggle={toggle} />
      </Card>
    </div>
  )
}
