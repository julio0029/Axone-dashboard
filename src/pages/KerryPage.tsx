import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { CandleChart } from '../components/CandleChart'
import { ColumnTable } from '../components/ColumnTable'
import {
  SYMBOLS, TIMEFRAMES, COLUMNS, generateOHLCV,
  type Symbol, type Timeframe,
} from '../data/kerry'

export function KerryPage() {
  const [symbol, setSymbol] = useState<Symbol>('BTCUSDT')
  const [tf, setTf] = useState<Timeframe>('1h')
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(COLUMNS.filter((c) => c.defaultOn).map((c) => c.key)),
  )

  const candles = useMemo(() => generateOHLCV(symbol, tf, 200), [symbol, tf])
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
          <p className="text-xs mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-ax-down/30 bg-[#ff5470]/10 text-ax-down">
              <span className="w-1.5 h-1.5 rounded-full bg-ax-down" /> illustrative mock OHLCV
            </span>
            <Link to="/ta-v2" className="text-ax-blue-2 hover:underline">
              see the validated TA-v2 schema & BTCUSDT test →
            </Link>
          </p>
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
          title={`${symbol} · ${tf}`}
          subtitle="Candlestick · interactive zoom (scroll / drag the range bar) · hover for OHLCV"
          bodyClass="!p-2"
        >
          <CandleChart candles={candles} tf={tf} enabled={enabled} />
        </Card>
      </div>

      {/* Bottom panel */}
      <Card
        title="Optional columns"
        subtitle="Client-side mock subset for this chart — the full 90-column TA-v2 schema lives on the TA-v2 · Validation page."
      >
        <ColumnTable enabled={enabled} onToggle={toggle} />
      </Card>
    </div>
  )
}
