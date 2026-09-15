// Authoritative Axone architecture — synced 2026-09-16.
// Live/configured agents + pending (Darwin, future Execution) + the human Operator.
// Trade path: Kerry+Chronos → Tibot → Wally (opportunity) → Wolf (lifecycle) → future execution.
// Independent evaluation: Wolf/Wally decisions → Oracle (counterfactual) → Sentinel (integrity).
// This is a faithful, read-only representation of system ownership & flows;
// it does not mutate any source architecture file.

export type AgentId =
  | 'operator'
  | 'axone' | 'kerry' | 'tibot' | 'wally' | 'sentinel' | 'chronos'
  | 'darwin' | 'karen' | 'guy' | 'spider' | 'glia' | 'sublime' | 'conchita'
  | 'wolf' | 'oracle' | 'execution'

/** live = configured & active · pending = not configured / no authority yet · external = human */
export type AgentStatus = 'live' | 'pending' | 'external'

export interface AgentNode {
  id: AgentId
  name: string
  role: string
  /** what this agent exclusively owns (cross-writes by others are prohibited) */
  owns: string
  /** layout coordinates (screen space, y grows downward) */
  x: number
  y: number
  /** category index -> colour */
  cat: number
  /** has a bespoke detailed page (vs the Coming-soon placeholder) */
  detailed: boolean
  /** explicit route for the detailed page (defaults handled in the nav) */
  route?: string
  status: AgentStatus
}

export type EdgeKind =
  | 'flow'     // data / contract flow
  | 'control'  // Axone request routing & orchestration
  | 'memory'   // Glia durable-memory links
  | 'read'     // Guy read-only dashboard flow
  | 'audit'    // Sentinel integrity / leakage supervision
  | 'eval'     // Oracle counterfactual decision-quality evaluation (scoring-only, firewalled)
  | 'pending'  // future / disabled execution flow (not live)

export interface AgentEdge {
  source: AgentId
  target: AgentId
  kind: EdgeKind
}

// Category 0: orchestrator, 1: live/external data, 2: historical/evidence,
// 3: model/bots, 4: integrity/supervision, 5: memory, 6: system/code,
// 7: advisory, 8: visualisation, 9: risk/execution (pending), 10: operator,
// 11: evaluation (counterfactual), 12: lifecycle/portfolio, 13: opportunity/decision
export const CATEGORIES = [
  { name: 'Orchestrator', color: '#4dd2ff' },
  { name: 'Data (live / external)', color: '#2f9bff' },
  { name: 'Historical / Evidence', color: '#5b8bff' },
  { name: 'Model / Bots', color: '#7c5cff' },
  { name: 'Integrity / Supervision', color: '#1ec8a5' },
  { name: 'Memory', color: '#b07cff' },
  { name: 'System / Code', color: '#8aa0c6' },
  { name: 'Advisory', color: '#ffb454' },
  { name: 'Visualisation', color: '#ff9f6b' },
  { name: 'Execution (pending)', color: '#ff5470' },
  { name: 'Operator', color: '#cdd9ec' },
  { name: 'Evaluation (counterfactual)', color: '#ffd166' },
  { name: 'Lifecycle / Portfolio', color: '#ff6b9d' },
  { name: 'Opportunity / Decision', color: '#c084fc' },
]

export const AGENTS: AgentNode[] = [
  {
    id: 'operator', name: 'Operator', status: 'external', cat: 10, detailed: false,
    role: 'Human operator — issues requests and grants explicit execution approval',
    owns: 'Intent & final go/no-go for paper/live execution',
    x: 540, y: 30,
  },
  {
    id: 'axone', name: 'Axone', status: 'live', cat: 0, detailed: false,
    role: 'Top-level orchestrator — interprets intent, decomposes, routes, coordinates, aggregates. Does not perform specialist work.',
    owns: 'Routing, ownership/approval enforcement, result aggregation',
    x: 540, y: 130,
  },
  {
    id: 'spider', name: 'Spider', status: 'live', cat: 1, detailed: false,
    role: 'External data / API gateway — web, HTTP, Binance REST/CLI, research & downloads. All external access flows through Spider.',
    owns: 'External web / API / Binance access',
    x: 110, y: 285,
  },
  {
    id: 'kerry', name: 'Kerry', status: 'live', cat: 1, detailed: true, route: '/kerry',
    role: 'Live data layer — DATA/live/<symbol>_<period>.csv, ≤200 closed candles, live indicators/features & cadence checks.',
    owns: 'Rolling live datasets (≤200 closed candles) & live features',
    x: 305, y: 285,
  },
  {
    id: 'chronos', name: 'Chronos', status: 'live', cat: 2, detailed: true, route: '/chronos',
    role: 'Historical owner — historical training, replay, backtests/walk-forward evidence, manifests, hashes & certified reports. DATA/live is out of scope.',
    owns: 'Historical datasets, training, replay, evidence, manifests & hashes',
    x: 765, y: 270,
  },
  {
    id: 'tibot', name: 'Tibot', status: 'live', cat: 3, detailed: true, route: '/tibot',
    role: 'Sole bot owner — prediction, classification AND strategy bots; training and bot registries/outputs. Bot-level strategy logic lives here.',
    owns: 'Prediction / classification / strategy bots & their training',
    x: 470, y: 405,
  },
  {
    id: 'sentinel', name: 'Sentinel', status: 'live', cat: 4, detailed: false,
    role: 'Integrity & leakage supervisor — validates clean, aligned, leakage-free datasets/pipelines; records PASS/FAIL/BLOCKED + leakage evidence. NOT the trade/risk gate; does not repair source data/code.',
    owns: 'Integrity / leakage supervision & transient hygiene',
    x: 625, y: 270,
  },
  {
    id: 'glia', name: 'Glia', status: 'live', cat: 5, detailed: false,
    role: 'Memory system — durable context retrieval/compression/persistence & token-efficient recall. Sole owner of memory writes.',
    owns: 'Durable memory writes & compression',
    x: 470, y: 540,
  },
  {
    id: 'conchita', name: 'Conchita', status: 'live', cat: 6, detailed: false,
    role: 'System maintenance — OpenClaw config, health/recovery, logs, prompt structures & skills upkeep.',
    owns: 'Config / system / skill maintenance',
    x: 110, y: 515,
  },
  {
    id: 'sublime', name: 'Sublime', status: 'live', cat: 6, detailed: false,
    role: 'Code design / writing / review only — once final, code moves to the designated owning agent that runs it. Not a runtime owner.',
    owns: 'Code authoring & review (not runtime)',
    x: 285, y: 515,
  },
  {
    id: 'karen', name: 'Karen', status: 'live', cat: 7, detailed: false,
    role: 'Copy/public-trader intelligence — advisory feeds & behavioural analysis. External data arrives via Spider. No final decision authority.',
    owns: 'Advisory copy-trade intelligence (no authority)',
    x: 130, y: 430,
  },
  {
    id: 'guy', name: 'Guy', status: 'live', cat: 8, detailed: false,
    role: 'Read-only visualisation — presents certified artifacts, provenance, audit state & interactive charts. Must not mutate source evidence/data.',
    owns: 'Dashboard implementation & deployment (read-only consumer)',
    x: 920, y: 540,
  },
  {
    id: 'wally', name: 'Wally', status: 'live', cat: 13, detailed: true, route: '/sandbox/wally',
    role: 'Opportunity & directional intelligence — LONG/SHORT/ABSTAIN calls, conviction, expected move, multi-timeframe context & opportunity ranking. Produces ranked proposals; does NOT manage open positions. Dashboard view is historical V3_CANDIDATE research (simulation only).',
    owns: 'Directional opportunity proposals & conviction (no lifecycle / no execution)',
    x: 700, y: 470,
  },
  {
    id: 'wolf', name: 'Wolf', status: 'live', cat: 12, detailed: false,
    role: 'Trade lifecycle, position & portfolio management — reads Wally proposals + portfolio state and decides ENTER/HOLD/EXIT/REVERSE/REDUCE, sizing, TP/SL/trailing & exposure. Owns the position lifecycle after Wally identifies an opportunity. No broker or paper/live execution authority yet. NOT a repurposing of Sentinel.',
    owns: 'Position lifecycle decisions & portfolio ledger (no execution authority)',
    x: 875, y: 470,
  },
  {
    id: 'oracle', name: 'Oracle', status: 'live', cat: 11, detailed: false,
    role: 'Counterfactual decision-quality evaluator — retrospectively scores Wally/Wolf decisions using future price info (scoring-only, firewalled from decision inputs). Distinct from Sentinel: Oracle judges whether a decision was good; Sentinel audits integrity / leakage / causality.',
    owns: 'Retrospective counterfactual evaluations (writes EVALUATIONS/ only)',
    x: 815, y: 320,
  },
  {
    id: 'execution', name: 'Execution', status: 'pending', cat: 9, detailed: false,
    role: 'FUTURE — paper/live trade execution & broker connectivity. Not built and not connected to any exchange. Shown for architecture completeness only; requires explicit operator approval to ever enable.',
    owns: '(future) Order execution — not built',
    x: 1010, y: 560,
  },
  {
    id: 'darwin', name: 'Darwin', status: 'pending', cat: 9, detailed: false,
    role: 'PENDING — intended evolution/discovery role; precise scope awaiting operator definition. Not configured live.',
    owns: '(future) Evolution / discovery — scope TBD',
    x: 985, y: 250,
  },
]

export const EDGES: AgentEdge[] = [
  // A — request routing: Operator ↔ Axone
  { source: 'operator', target: 'axone', kind: 'control' },

  // B/C — external & live feature flow: Spider → Kerry → Tibot
  { source: 'spider', target: 'kerry', kind: 'flow' },
  { source: 'kerry', target: 'tibot', kind: 'flow' },
  // B — Spider serves historical acquisition & advisory external data
  { source: 'spider', target: 'chronos', kind: 'flow' },
  { source: 'spider', target: 'karen', kind: 'flow' },

  // G — bot inputs: certified historical evidence + live features → Tibot
  { source: 'chronos', target: 'tibot', kind: 'flow' },
  // bot outputs back to Axone
  { source: 'tibot', target: 'axone', kind: 'flow' },

  // D/E — historical/calc → Sentinel integrity & leakage audit → Axone
  { source: 'chronos', target: 'sentinel', kind: 'audit' },
  { source: 'sentinel', target: 'axone', kind: 'audit' },

  // H — advisory intel: Karen → Axone (no authority)
  { source: 'karen', target: 'axone', kind: 'flow' },

  // E — verified dashboard flow: Chronos certified → Guy read-only → close loop → Axone
  { source: 'axone', target: 'guy', kind: 'read' },
  { source: 'chronos', target: 'guy', kind: 'read' },
  { source: 'guy', target: 'axone', kind: 'read' },

  // F — memory flow: Sentinel/Axone durable summary → Glia → reference back to Axone
  { source: 'sentinel', target: 'glia', kind: 'memory' },
  { source: 'glia', target: 'axone', kind: 'memory' },

  // I — canonical decision chain: Tibot evidence → Wally opportunity → Wolf lifecycle
  { source: 'tibot', target: 'wally', kind: 'flow' },
  { source: 'wally', target: 'wolf', kind: 'flow' },
  // future execution (PENDING / disabled): Wolf lifecycle → Execution (not built)
  { source: 'wolf', target: 'execution', kind: 'pending' },

  // J — independent evaluation chain (never fed back into decision timestamps):
  //     Wally/Wolf decisions → Oracle counterfactual eval → Sentinel integrity/audit
  { source: 'wally', target: 'oracle', kind: 'eval' },
  { source: 'wolf', target: 'oracle', kind: 'eval' },
  { source: 'oracle', target: 'sentinel', kind: 'eval' },

  // Darwin future evolution feedback (PENDING)
  { source: 'darwin', target: 'tibot', kind: 'pending' },
  { source: 'darwin', target: 'axone', kind: 'pending' },
]

// Axone routes/orchestrates every live specialist (faint control edges)
const AXONE_ROUTED: AgentId[] = ['spider', 'kerry', 'chronos', 'tibot', 'sentinel', 'karen', 'sublime', 'conchita', 'wally', 'wolf', 'oracle']
for (const id of AXONE_ROUTED) EDGES.push({ source: 'axone', target: id, kind: 'control' })

// Glia underlies all live agents' durable memory (faint dotted edges)
for (const a of AGENTS) {
  if (a.status === 'live' && a.id !== 'glia' && a.id !== 'axone') {
    EDGES.push({ source: 'glia', target: a.id, kind: 'memory' })
  }
}
