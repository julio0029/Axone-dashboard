import type { ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AGENTS, CATEGORIES } from '../data/agents'

interface NavItem {
  to: string
  label: string
  glyph: string
  badge?: string
}

/** Canonical / production pages (real data, certified or live). */
const CANONICAL: NavItem[] = [
  { to: '/wolf-live-48h', label: 'Wolf Live 48h', glyph: '◆', badge: 'live' },
  { to: '/kerry', label: 'Kerry', glyph: '●' },
  { to: '/chronos', label: 'Chronos', glyph: '●' },
  { to: '/tibot', label: 'Tibot Families', glyph: '●', badge: '49' },
  { to: '/tibot/family/donchian_breakout/bnbusdt/1h', label: 'Donchian Screen', glyph: '▥', badge: 'example' },
  { to: '/registry', label: 'Registry', glyph: '▤', badge: 'new' },
]

/** BRANCH 1 — Paper Candidate V1 (frozen forward test). Isolated from research. */
const BRANCH1: NavItem[] = [
  { to: '/paper-candidate-v1', label: 'Paper Candidate V1', glyph: '◈', badge: 'frozen' },
]

/** BRANCH 2 — V2 Research (Wolf/Karen/risk experiments over the research root). */
const BRANCH2: NavItem[] = [
  { to: '/v2/portfolio-lab', label: 'Portfolio Lab', glyph: '▚', badge: 'V2' },
  { to: '/v2/symbol-research', label: 'Symbol Research', glyph: '⬡', badge: 'V2' },
]

/** Sandbox / research pages — exploratory, historical, not production. */
const SANDBOX: NavItem[] = [
  { to: '/ta-v2', label: 'TA-v3 Testbed', glyph: '◇', badge: 'test' },
  { to: '/sandbox/wally', label: 'Wally Research', glyph: '◎', badge: 'historical' },
]

export function Layout() {
  const loc = useLocation()
  // Coming-soon agents: real agent nodes without a bespoke page (excl. orchestrator,
  // operator and the future Execution concept). Wolf & Oracle live here until built out.
  const comingSoon = AGENTS.filter(
    (a) => !a.detailed && !['axone', 'operator', 'execution'].includes(a.id),
  )
  return (
    <div className="min-h-screen flex text-ax-text">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-ax-border/70 bg-ax-bg-2/60 backdrop-blur-sm flex flex-col">
        <div className="px-5 py-5 border-b border-ax-border/70">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-ax-blue-2 ax-glow" />
            <span className="font-display text-lg tracking-wide ax-glow-text">AXONE</span>
          </div>
          <p className="text-ax-muted text-[11px] mt-1">Multi-agent control deck</p>
        </div>

        <nav className="flex-1 overflow-y-auto ax-scroll px-3 py-4 space-y-1">
          <NavLink to="/" end className={navClass}>
            <span className="text-ax-blue-2">◈</span> Architecture
          </NavLink>

          <SectionLabel>Canonical</SectionLabel>
          {CANONICAL.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              <span className="text-ax-blue-2">{item.glyph}</span> {item.label}
              {item.badge && (
                <span className="ml-auto text-[9px] uppercase tracking-wide text-ax-blue-2">{item.badge}</span>
              )}
            </NavLink>
          ))}

          <SectionLabel>Branch 1 · Paper Candidate V1</SectionLabel>
          {BRANCH1.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              <span style={{ color: '#ffb454' }}>{item.glyph}</span> {item.label}
              {item.badge && (
                <span className="ml-auto text-[9px] uppercase tracking-wide" style={{ color: '#ffb454' }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <SectionLabel>Branch 2 · V2 Research</SectionLabel>
          {BRANCH2.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              <span style={{ color: '#4dd2ff' }}>{item.glyph}</span> {item.label}
              {item.badge && (
                <span className="ml-auto text-[9px] uppercase tracking-wide" style={{ color: '#4dd2ff' }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <SectionLabel>Sandbox / Research</SectionLabel>
          {SANDBOX.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              <span style={{ color: '#ffb454' }}>{item.glyph}</span> {item.label}
              {item.badge && (
                <span className="ml-auto text-[9px] uppercase tracking-wide" style={{ color: '#ffb454' }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <SectionLabel>Coming Soon</SectionLabel>
          {comingSoon.map((a) => (
            <NavLink key={a.id} to={`/agent/${a.id}`} className={navClass}>
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background: a.status === 'pending' ? 'transparent' : CATEGORIES[a.cat].color,
                  border: a.status === 'pending' ? '1px dashed #ff5470' : undefined,
                }}
              />
              <span className={a.status === 'pending' ? 'text-[#ff8aa0]' : undefined}>{a.name}</span>
              {a.status === 'pending' ? (
                <span className="ml-auto text-[9px] uppercase tracking-wide text-[#ff5470]">pending</span>
              ) : (
                <span className="ml-auto text-[9px] text-ax-muted">soon</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-3 border-t border-ax-border/70 text-[10px] text-ax-muted">
          Guy · dashboard build
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 shrink-0 border-b border-ax-border/70 bg-ax-bg-2/40 backdrop-blur-sm flex items-center px-6 justify-between">
          <Breadcrumb path={loc.pathname} />
          {loc.pathname.startsWith('/wolf-live-48h') ? (
            <div className="flex items-center gap-2 text-xs text-[#1ec8a5]">
              <span className="w-2 h-2 rounded-full bg-[#1ec8a5] animate-pulse" /> BINANCE SPOT TESTNET · LIVE · NOT REAL MONEY
            </div>
          ) : loc.pathname.startsWith('/paper-candidate-v1') ? (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#ffb454' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ffb454' }} /> Branch 1 · Paper Candidate V1 · frozen forward test — isolated from research
            </div>
          ) : loc.pathname.startsWith('/v2/portfolio-lab') ? (
            <div className="flex items-center gap-2 text-xs text-ax-blue-2">
              <span className="w-2 h-2 rounded-full bg-ax-blue-2 animate-pulse" /> Branch 2 · V2 Research · historical simulation
            </div>
          ) : loc.pathname.startsWith('/v2/symbol-research') ? (
            <div className="flex items-center gap-2 text-xs text-ax-blue-2">
              <span className="w-2 h-2 rounded-full bg-ax-blue-2 animate-pulse" /> Branch 2 · V2 Research · symbol research
            </div>
          ) : loc.pathname.startsWith('/ta-v2') ? (
            <div className="flex items-center gap-2 text-xs text-ax-blue-2">
              <span className="w-2 h-2 rounded-full bg-ax-blue-2 animate-pulse" /> sandbox · TA-v3 testbed
            </div>
          ) : loc.pathname.startsWith('/sandbox/wally') ? (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#ffb454' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ffb454' }} /> historical research · simulation only — no live/paper trades
            </div>
          ) : loc.pathname.startsWith('/tibot/family/') ? (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#ffb454' }}>
              <span className="w-2 h-2 rounded-full bg-[#ff5470]" /> screening only · Wally gate required
            </div>
          ) : loc.pathname.startsWith('/tibot') ? (
            <div className="flex items-center gap-2 text-xs text-ax-blue-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5470]" /> general models · metrics void · C8 not installed
            </div>
          ) : loc.pathname.startsWith('/registry') ? (
            <div className="flex items-center gap-2 text-xs text-ax-blue-2">
              <span className="w-2 h-2 rounded-full bg-ax-blue-2 animate-pulse" /> sandbox · progressive registry
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-ax-muted">
              <span className="w-2 h-2 rounded-full bg-ax-down/80 animate-pulse" /> illustrative · mock data
            </div>
          )}
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto ax-scroll p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-ax-muted text-[10px] uppercase tracking-widest px-3 pt-4 pb-1">{children}</p>
  )
}

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition',
    isActive
      ? 'bg-ax-blue/15 text-ax-text ax-glow'
      : 'text-ax-muted hover:text-ax-text hover:bg-white/5',
  ].join(' ')
}

function Breadcrumb({ path }: { path: string }) {
  let label = 'Architecture'
  if (path.startsWith('/paper-candidate-v1')) label = 'Branch 1 · Paper Candidate V1 (Frozen Forward Test)'
  else if (path.startsWith('/wolf-live-48h')) label = 'Wolf · Live 48h Testnet Monitor'
  else if (path.startsWith('/v2/portfolio-lab')) label = 'Branch 2 · V2 Research · Historical Portfolio Lab'
  else if (path.startsWith('/v2/symbol-research')) label = 'Branch 2 · V2 Research · Symbol Research'
  else if (path.startsWith('/ta-v2')) label = 'Sandbox · TA-v3 Testbed'
  else if (path.startsWith('/registry')) label = 'Registry · Progressive Universe'
  else if (path.startsWith('/kerry')) label = 'Kerry · Market Data'
  else if (path.startsWith('/sandbox/wally')) label = 'Sandbox · Wally Research (Historical)'
  else if (path.startsWith('/chronos')) label = 'Chronos · Predictive Targets'
  else if (path.startsWith('/tibot/family/')) label = 'Tibot · Donchian Breakout · BNBUSDT 1h'
  else if (path.startsWith('/tibot')) label = 'Tibot · 49 Family Registry'
  else if (path.startsWith('/agent/')) {
    const id = path.split('/')[2]
    const a = AGENTS.find((x) => x.id === id)
    label = a ? `${a.name}` : 'Agent'
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-ax-muted">Axone</span>
      <span className="text-ax-border">/</span>
      <span className="text-ax-text font-display tracking-wide">{label}</span>
    </div>
  )
}
