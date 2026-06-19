import { BTCUSDT_1H } from './btcusdtReal'

export const SYMBOLS = [
  'BTCUSDT', 'BNBUSDT', 'SOLUSDT', 'SUIUSDT', 'DOGEUSDT',
  'FETUSDT', 'XRPUSDT', 'SHIBUSDT', 'PEPEUSDT', 'TRUMPUSDT',
] as const
export type Symbol = (typeof SYMBOLS)[number]

export const TIMEFRAMES = ['5m', '1h', '4h', '1d'] as const
export type Timeframe = (typeof TIMEFRAMES)[number]

export interface Candle {
  time: number // ms
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const TF_MS: Record<Timeframe, number> = {
  '5m': 5 * 60_000,
  '1h': 60 * 60_000,
  '4h': 4 * 60 * 60_000,
  '1d': 24 * 60 * 60_000,
}

// rough anchor prices so each symbol looks distinct (mock data only)
const BASE_PRICE: Record<Symbol, number> = {
  BTCUSDT: 67000, BNBUSDT: 610, SOLUSDT: 165, SUIUSDT: 1.45, DOGEUSDT: 0.16,
  FETUSDT: 1.35, XRPUSDT: 0.62, SHIBUSDT: 0.000026, PEPEUSDT: 0.0000115, TRUMPUSDT: 9.2,
}

// deterministic PRNG so the chart is stable across reloads (mulberry32)
function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic mock OHLCV — a seeded random walk anchored to BASE_PRICE. */
export function generateOHLCV(symbol: Symbol, tf: Timeframe, n = 200): Candle[] {
  const rand = rng(hash(symbol + tf))
  const base = BASE_PRICE[symbol]
  const vol = base * 0.012 // per-candle volatility
  const step = TF_MS[tf]
  const now = Math.floor(Date.now() / step) * step
  const out: Candle[] = []
  let price = base
  let drift = (rand() - 0.5) * vol * 0.4
  for (let i = n - 1; i >= 0; i--) {
    drift += (rand() - 0.5) * vol * 0.15
    drift *= 0.92
    const open = price
    const change = drift + (rand() - 0.5) * vol
    const close = Math.max(base * 0.2, open + change)
    const high = Math.max(open, close) + rand() * vol * 0.8
    const low = Math.min(open, close) - rand() * vol * 0.8
    const volume = base * (0.5 + rand() * 2) * 1000
    out.push({ time: now - i * step, open, high, low, close, volume })
    price = close
  }
  return out
}

// ---------- indicator calculations (mirror Kerry feature intent) ----------

export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = []
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= period) sum -= values[i - period]
    out.push(i >= period - 1 ? sum / period : null)
  }
  return out
}

export function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = []
  const k = 2 / (period + 1)
  let prev: number | null = null
  for (let i = 0; i < values.length; i++) {
    if (prev === null) prev = values[i]
    else prev = values[i] * k + prev * (1 - k)
    out.push(i >= period - 1 ? prev : null)
  }
  return out
}

export function rsi(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = [null]
  let gain = 0, loss = 0
  for (let i = 1; i < values.length; i++) {
    const d = values[i] - values[i - 1]
    const g = Math.max(0, d), l = Math.max(0, -d)
    if (i <= period) {
      gain += g; loss += l
      if (i === period) {
        gain /= period; loss /= period
        out.push(100 - 100 / (1 + gain / (loss || 1e-9)))
      } else out.push(null)
    } else {
      gain = (gain * (period - 1) + g) / period
      loss = (loss * (period - 1) + l) / period
      out.push(100 - 100 / (1 + gain / (loss || 1e-9)))
    }
  }
  return out
}

export function bollinger(values: number[], period = 20, mult = 2) {
  const mid = sma(values, period)
  const upper: (number | null)[] = []
  const lower: (number | null)[] = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) { upper.push(null); lower.push(null); continue }
    let s = 0
    for (let j = i - period + 1; j <= i; j++) s += (values[j] - (mid[i] as number)) ** 2
    const sd = Math.sqrt(s / period)
    upper.push((mid[i] as number) + mult * sd)
    lower.push((mid[i] as number) - mult * sd)
  }
  return { mid, upper, lower }
}

/** Simple swing high/low markers (local extrema over a window). */
export function swings(c: Candle[], w = 4) {
  const highs: { idx: number; price: number }[] = []
  const lows: { idx: number; price: number }[] = []
  for (let i = w; i < c.length - w; i++) {
    let isHigh = true, isLow = true
    for (let j = i - w; j <= i + w; j++) {
      if (c[j].high > c[i].high) isHigh = false
      if (c[j].low < c[i].low) isLow = false
    }
    if (isHigh) highs.push({ idx: i, price: c[i].high })
    if (isLow) lows.push({ idx: i, price: c[i].low })
  }
  return { highs, lows }
}

// ---------- optional-column registry (bottom panel) ----------

export type DisplayType = 'overlay' | 'subchart' | 'marker'

export interface ColumnDef {
  key: string
  name: string
  description: string
  source: string
  timeframe: 'all' | Timeframe
  display: DisplayType
  defaultOn: boolean
}

export const COLUMNS: ColumnDef[] = [
  { key: 'ema50', name: 'EMA 50', description: 'Exponential moving average (50).', source: 'Kerry · ema_50', timeframe: 'all', display: 'overlay', defaultOn: true },
  { key: 'ema200', name: 'EMA 200', description: 'Exponential moving average (200).', source: 'Kerry · ema_200', timeframe: 'all', display: 'overlay', defaultOn: false },
  { key: 'boll', name: 'Bollinger Bands', description: 'SMA-20 ± 2σ envelope.', source: 'Kerry · bolinger_*', timeframe: 'all', display: 'overlay', defaultOn: false },
  { key: 'swings', name: 'Swing Hi/Lo', description: 'Local swing high/low markers (Gann-style).', source: 'Kerry · high/low', timeframe: 'all', display: 'marker', defaultOn: true },
  { key: 'volume', name: 'Volume', description: 'Per-candle traded volume.', source: 'Kerry · volume', timeframe: 'all', display: 'subchart', defaultOn: true },
  { key: 'rsi', name: 'RSI 14', description: 'Relative Strength Index (14) — momentum.', source: 'Kerry · rsi', timeframe: 'all', display: 'subchart', defaultOn: true },
]

// ---------- real-data bundle (BTCUSDT · 1h, certified Kerry handoff) ----------

/** Real precomputed indicator series, aligned candle-by-candle to the candles array. */
export interface RealOverlays {
  ema50: (number | null)[]
  ema200: (number | null)[]
  rsi: (number | null)[]
  bbMid: (number | null)[]
  bbUp: (number | null)[]
  bbLow: (number | null)[]
}

export interface RealBundle {
  candles: Candle[]
  overlays: RealOverlays
  meta: { source: string; windowStartUtc: string; windowEndUtc: string; count: number; interval: string }
}

/** The single symbol/timeframe currently backed by real data (operator scope: BTCUSDT only). */
export const REAL_SYMBOL: Symbol = 'BTCUSDT'
export const REAL_TF: Timeframe = '1h'

export function isRealAvailable(symbol: Symbol, tf: Timeframe): boolean {
  return symbol === REAL_SYMBOL && tf === REAL_TF
}

export function getRealBundle(): RealBundle {
  const s = BTCUSDT_1H
  const candles: Candle[] = s.t.map((t, i) => ({
    time: t, open: s.o[i], high: s.h[i], low: s.l[i], close: s.c[i], volume: s.v[i],
  }))
  return {
    candles,
    overlays: { ema50: s.ema50, ema200: s.ema200, rsi: s.rsi, bbMid: s.bbMid, bbUp: s.bbUp, bbLow: s.bbLow },
    meta: {
      source: s.source, windowStartUtc: s.windowStartUtc, windowEndUtc: s.windowEndUtc,
      count: s.count, interval: s.interval,
    },
  }
}
