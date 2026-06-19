// ─────────────────────────────────────────────────────────────────────────
// TA-v2 feature set — REAL data.
//
// Source of truth: Sublime's completed BTCUSDT validation (PASS), relayed by
// Axone. Schema reconstructed 1:1 from the verified script's `Indicators.all()`
// (defaults: _column='median', with_rel=True). Every figure below is from the
// real test run — none of this module is mocked.
//
//   File   technical_analysis_v2.py  ·  1,186 lines
//   SHA-1  fea54e5d17b505a3894220c82373a9cb9f972e5c
//   Env    conda base · Python 3.14.5
// ─────────────────────────────────────────────────────────────────────────

export const TA_V2_PROVENANCE = {
  file: 'technical_analysis_v2.py',
  lines: 1186,
  sha1: 'fea54e5d17b505a3894220c82373a9cb9f972e5c',
  env: 'conda base · Python 3.14.5',
  columns: 90,
} as const

export const BTC_VALIDATION = {
  symbol: 'BTCUSDT',
  interval: '5m',
  candles: 100_000,
  rangeStart: '2024-10-12 00:10',
  rangeEnd: '2025-09-24 05:25',
  rows: 100_000,
  cols: 90,
  exceptions: 0,
} as const

// Candle flags — the two columns newly ported into TA-v2 (previously missing).
export const CANDLE_FLAGS = {
  doji: { flagged: 69_023, unflagged: 30_977 },
  marubozu: { bullish: 5_387, bearish: 5_332, neutral: 89_281 },
} as const

// Canonical parity: max absolute delta vs the canonical implementation over the
// same 100k rows. EMA / MACD / Bollinger are bit-for-bit; RSI's divergence is
// the intended Wilder smoothing difference, not a regression.
export type ParityKind = 'exact' | 'intended' | 'shape'

export interface ParityRow {
  name: string
  kind: ParityKind
  maxAbsDelta: number
  note: string
}

export const PARITY: ParityRow[] = [
  { name: 'EMA (all periods)', kind: 'exact', maxAbsDelta: 0.0, note: 'Bit-for-bit match across every span.' },
  { name: 'MACD', kind: 'exact', maxAbsDelta: 0.0, note: 'Short / long / signal all match canonical.' },
  { name: 'Bollinger', kind: 'exact', maxAbsDelta: 0.0, note: 'SMA + upper/lower bands match canonical.' },
  { name: 'RSI', kind: 'intended', maxAbsDelta: 55.087, note: "Intended Wilder smoothing divergence — not a regression." },
]

// NaN audit over the 100k rows.
export const NAN_AUDIT = {
  allNanColumns: 0,
  maxNonGannPct: 0.199, // worst non-Gann column
  gannMarkerPct: 94, // sparse Gann event markers only (~)
  note: 'No all-NaN columns. Only the sparse Gann event markers are NaN-heavy (~94%); every other column is ≤ 0.199%.',
} as const

// ── Full 90-column schema, grouped by indicator family ──────────────────────
// `cols` lists the real output column names. Reconstructed from Indicators.all()
// with _column='median' and with_rel=True.

export type ParityTag = 'exact' | 'intended' | 'populated'

export interface SchemaGroup {
  key: string
  name: string
  desc: string
  cols: string[]
  parity: ParityTag
  isNew?: boolean
  nanHeavy?: boolean
}

export const SCHEMA_GROUPS: SchemaGroup[] = [
  {
    key: 'price', name: 'Price & base', parity: 'populated',
    desc: 'Raw OHLCV plus the median (H+L)/2 used as the reference column for relative features.',
    cols: ['open', 'high', 'low', 'close', 'volume', 'median'],
  },
  {
    key: 'span', name: 'Span', parity: 'populated',
    desc: 'High−low candle span and its ratio to median.',
    cols: ['span', 'span_rel_median'],
  },
  {
    key: 'ema', name: 'EMA', parity: 'exact',
    desc: 'Exponential moving averages over 8 spans, each with a median-relative variant.',
    cols: [
      'ema_5', 'ema_10', 'ema_30', 'ema_50', 'ema_60', 'ema_100', 'ema_120', 'ema_200',
      'median_rel_ema_5', 'median_rel_ema_10', 'median_rel_ema_30', 'median_rel_ema_50',
      'median_rel_ema_60', 'median_rel_ema_100', 'median_rel_ema_120', 'median_rel_ema_200',
    ],
  },
  {
    key: 'sma', name: 'SMA', parity: 'populated',
    desc: 'Simple moving averages over 8 windows, each with a median-relative variant.',
    cols: [
      'ma_5', 'ma_10', 'ma_30', 'ma_50', 'ma_60', 'ma_100', 'ma_120', 'ma_200',
      'median_rel_ma_5', 'median_rel_ma_10', 'median_rel_ma_30', 'median_rel_ma_50',
      'median_rel_ma_60', 'median_rel_ma_100', 'median_rel_ma_120', 'median_rel_ma_200',
    ],
  },
  {
    key: 'macd', name: 'MACD', parity: 'exact',
    desc: 'Moving-average convergence/divergence with short & long legs and a median-relative line.',
    cols: ['macd', 'macd_short', 'macd_long', 'macd_rel_median'],
  },
  {
    key: 'rsi', name: 'RSI', parity: 'intended',
    desc: "Wilder's Relative Strength Index and its 0–1 normalised variant.",
    cols: ['rsi', 'rsi_rel_median'],
  },
  {
    key: 'vwap', name: 'VWAP', parity: 'populated',
    desc: 'Volume-weighted average price and its median-relative variant.',
    cols: ['vwap', 'vwap_rel_median'],
  },
  {
    key: 'stoch', name: 'Stochastic', parity: 'populated',
    desc: '%K / %D oscillator with 0–1 normalised variants.',
    cols: ['stochastic_k', 'stochastic_d', 'stochastic_k_rel_median', 'stochastic_d_rel_median'],
  },
  {
    key: 'boll', name: 'Bollinger', parity: 'exact',
    desc: 'SMA-20 ± 2σ envelope with median-relative bands.',
    cols: [
      'bolinger_sma', 'bolinger_upper', 'bolinger_lower',
      'bolinger_sma_rel_median', 'bolinger_upper_rel_median', 'bolinger_lower_rel_median',
    ],
  },
  {
    key: 'atr', name: 'ATR', parity: 'populated',
    desc: "True range and Wilder's Average True Range (14) with median-relative variant.",
    cols: ['true_range', 'atr_14', 'atr_14_rel_median'],
  },
  {
    key: 'adx', name: 'ADX / DMI', parity: 'populated',
    desc: 'Directional movement: +DI, −DI and the ADX trend-strength line (14).',
    cols: ['plus_di_14', 'minus_di_14', 'adx_14'],
  },
  {
    key: 'cci', name: 'CCI', parity: 'populated',
    desc: 'Commodity Channel Index (20).',
    cols: ['cci_20'],
  },
  {
    key: 'williams', name: 'Williams %R', parity: 'populated',
    desc: 'Williams %R (14), −100…0 range.',
    cols: ['williams_r_14'],
  },
  {
    key: 'roc', name: 'ROC / Momentum', parity: 'populated',
    desc: 'Rate of change and absolute momentum over 12 periods.',
    cols: ['roc_12', 'momentum_12'],
  },
  {
    key: 'obv', name: 'OBV', parity: 'populated',
    desc: 'On-balance volume (cumulative).',
    cols: ['obv'],
  },
  {
    key: 'candles', name: 'Candlestick flags', parity: 'populated', isNew: true,
    desc: 'Exact stock-indicators Doji & Marubozu match flags — the two columns newly ported into TA-v2.',
    cols: ['candle_doji', 'candle_marubozu'],
  },
  {
    key: 'mfi', name: 'MFI', parity: 'populated',
    desc: 'Volume-weighted Money Flow Index (14).',
    cols: ['mfi_14'],
  },
  {
    key: 'cmf', name: 'CMF', parity: 'populated',
    desc: 'Chaikin Money Flow (20).',
    cols: ['cmf_20'],
  },
  {
    key: 'donchian', name: 'Donchian', parity: 'populated',
    desc: 'Donchian channel bands (20) plus normalised channel position.',
    cols: ['donchian_upper_20', 'donchian_lower_20', 'donchian_mid_20', 'donchian_position_20'],
  },
  {
    key: 'keltner', name: 'Keltner', parity: 'populated',
    desc: 'Keltner channel bands from EMA-20 ± 2·ATR.',
    cols: ['keltner_mid_20', 'keltner_upper_20', 'keltner_lower_20'],
  },
  {
    key: 'ichimoku', name: 'Ichimoku', parity: 'populated',
    desc: 'The five standard Ichimoku cloud components.',
    cols: ['ichimoku_conversion', 'ichimoku_base', 'ichimoku_span_a', 'ichimoku_span_b', 'ichimoku_lagging'],
  },
  {
    key: 'gann', name: 'Gann swings', parity: 'populated', nanHeavy: true,
    desc: 'Gann swing state & count plus sparse swing-event markers (top/bottom/change).',
    cols: ['gann_swing', 'gann_swing_change', 'gann_swing_top', 'gann_swing_bottom', 'gann_count'],
  },
]

// Sanity: this must equal TA_V2_PROVENANCE.columns (90).
export const SCHEMA_COLUMN_COUNT = SCHEMA_GROUPS.reduce((n, g) => n + g.cols.length, 0)
