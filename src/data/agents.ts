export type AgentId =
  | 'axone' | 'kerry' | 'tibot' | 'wally' | 'sentinel' | 'chronos'
  | 'darwin' | 'karen' | 'guy' | 'spider' | 'glia' | 'sublime' | 'conchita'

export interface AgentNode {
  id: AgentId
  name: string
  role: string
  /** layout coordinates (screen space, y grows downward) */
  x: number
  y: number
  /** category index -> colour */
  cat: number
  /** route slug; only kerry has a detailed page for now */
  detailed: boolean
}

export type EdgeKind = 'flow' | 'control' | 'memory' | 'read'

export interface AgentEdge {
  source: AgentId
  target: AgentId
  kind: EdgeKind
}

// Category 0: orchestrator, 1: data, 2: model/strategy, 3: risk/eval,
// 4: research/evolution, 5: support/system, 6: visualisation
export const CATEGORIES = [
  { name: 'Orchestrator', color: '#4dd2ff' },
  { name: 'Data', color: '#2f9bff' },
  { name: 'Model / Strategy', color: '#7c5cff' },
  { name: 'Risk / Gate', color: '#ff5470' },
  { name: 'Research / Evolution', color: '#1ec8a5' },
  { name: 'System / Support', color: '#8aa0c6' },
  { name: 'Visualisation', color: '#ffb454' },
]

export const AGENTS: AgentNode[] = [
  { id: 'axone',    name: 'Axone',    role: 'Orchestrator — routes & coordinates all agents', x: 520, y: 60,  cat: 0, detailed: false },
  { id: 'spider',   name: 'Spider',   role: 'External data & APIs (Binance, web)',            x: 90,  y: 300, cat: 1, detailed: false },
  { id: 'kerry',    name: 'Kerry',    role: 'Live market-data layer (≤200 candles, features)', x: 250, y: 300, cat: 1, detailed: true  },
  { id: 'tibot',    name: 'Tibot',    role: 'Prediction / classification / strategy bots',     x: 410, y: 300, cat: 2, detailed: false },
  { id: 'wally',    name: 'Wally',    role: 'Strategy creation & trade proposals',             x: 570, y: 300, cat: 2, detailed: false },
  { id: 'sentinel', name: 'Sentinel', role: 'Risk gate & final trade approval',                x: 730, y: 300, cat: 3, detailed: false },
  { id: 'chronos',  name: 'Chronos',  role: 'Historical data, training & replay',              x: 880, y: 300, cat: 1, detailed: false },
  { id: 'darwin',   name: 'Darwin',   role: 'Evolution, discovery & advisory assessment',      x: 1010, y: 300, cat: 4, detailed: false },
  { id: 'karen',    name: 'Karen',    role: 'Copy-trading intel (advisory)',                   x: 730, y: 150, cat: 4, detailed: false },
  { id: 'sublime',  name: 'Sublime',  role: 'Code & implementation engineer',                  x: 410, y: 470, cat: 5, detailed: false },
  { id: 'conchita', name: 'Conchita', role: 'System health, config & maintenance',             x: 120, y: 470, cat: 5, detailed: false },
  { id: 'glia',     name: 'Glia',     role: 'Memory: compression, retrieval, recall',          x: 560, y: 600, cat: 5, detailed: false },
  { id: 'guy',      name: 'Guy',      role: 'Dashboard builder (reads system state)',          x: 1010, y: 470, cat: 6, detailed: false },
]

export const EDGES: AgentEdge[] = [
  // primary information flow
  { source: 'spider',   target: 'kerry',    kind: 'flow' },
  { source: 'kerry',    target: 'tibot',    kind: 'flow' },
  { source: 'tibot',    target: 'wally',    kind: 'flow' },
  { source: 'wally',    target: 'sentinel', kind: 'flow' },
  { source: 'sentinel', target: 'chronos',  kind: 'flow' },
  { source: 'chronos',  target: 'darwin',   kind: 'flow' },
  // additional contracts
  { source: 'karen',    target: 'sentinel', kind: 'flow' },
  { source: 'tibot',    target: 'sentinel', kind: 'flow' },
  { source: 'wally',    target: 'sentinel', kind: 'flow' },
  // darwin feedback
  { source: 'darwin',   target: 'tibot',    kind: 'control' },
  { source: 'darwin',   target: 'wally',    kind: 'control' },
  { source: 'darwin',   target: 'sentinel', kind: 'control' },
  { source: 'darwin',   target: 'sublime',  kind: 'control' },
  // guy reads system state
  { source: 'axone',    target: 'guy',      kind: 'read' },
]

// Axone orchestrates all agents (control edges, rendered faintly)
for (const a of AGENTS) {
  if (a.id !== 'axone' && a.id !== 'guy') EDGES.push({ source: 'axone', target: a.id, kind: 'control' })
}
// Glia <-> all agents (memory edges, rendered faintly)
for (const a of AGENTS) {
  if (a.id !== 'glia') EDGES.push({ source: 'glia', target: a.id, kind: 'memory' })
}
