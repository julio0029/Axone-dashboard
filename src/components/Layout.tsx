import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AGENTS, CATEGORIES } from '../data/agents'

export function Layout() {
  const loc = useLocation()
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
          <NavLink to="/ta-v2" className={navClass}>
            <span className="text-ax-up">◇</span> Sandbox
            <span className="ml-auto text-[9px] uppercase tracking-wide text-ax-blue-2">test</span>
          </NavLink>
          <NavLink to="/registry" className={navClass}>
            <span className="text-ax-blue-2">▤</span> Registry
            <span className="ml-auto text-[9px] uppercase tracking-wide text-ax-blue-2">new</span>
          </NavLink>
          <NavLink to="/tibot-forward" className={navClass}>
            <span className="text-ax-up">⬡</span> Tibot Validation
            <span className="ml-auto text-[9px] uppercase tracking-wide text-ax-up">live</span>
          </NavLink>
          <NavLink to="/tibot-batches" className={navClass}>
            <span style={{ color: '#ffb454' }}>◐</span> Tibot Gate-B
            <span className="ml-auto text-[9px] uppercase tracking-wide" style={{ color: '#ffb454' }}>batch 3</span>
          </NavLink>
          <NavLink to="/wally" className={navClass}>
            <span style={{ color: '#ffb454' }}>◎</span> Wally Research
            <span className="ml-auto text-[9px] uppercase tracking-wide" style={{ color: '#ffb454' }}>historical</span>
          </NavLink>
          <p className="text-ax-muted text-[10px] uppercase tracking-widest px-3 pt-4 pb-1">Agents</p>
          {AGENTS.filter((a) => a.id !== 'axone' && a.id !== 'operator').map((a) => (
            <NavLink
              key={a.id}
              to={a.detailed ? (a.route ?? `/agent/${a.id}`) : `/agent/${a.id}`}
              className={navClass}
            >
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
                !a.detailed && <span className="ml-auto text-[9px] text-ax-muted">soon</span>
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
          {loc.pathname.startsWith('/ta-v2') ? (
            <div className="flex items-center gap-2 text-xs text-ax-blue-2">
              <span className="w-2 h-2 rounded-full bg-ax-blue-2 animate-pulse" /> sandbox · TA-v2 testbed
            </div>
          ) : loc.pathname.startsWith('/tibot-forward') ? (
            <div className="flex items-center gap-2 text-xs text-ax-up">
              <span className="w-2 h-2 rounded-full bg-ax-up animate-pulse" /> 24h live-forward validation · prediction only
            </div>
          ) : loc.pathname.startsWith('/tibot-batches') ? (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#ffb454' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ffb454' }} /> Gate-B Batch 3 · BTCUSDT prototype · not promoted
            </div>
          ) : loc.pathname.startsWith('/wally') ? (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#ffb454' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ffb454' }} /> historical research · simulation only — no live/paper trades
            </div>
          ) : loc.pathname.startsWith('/tibot') ? (
            <div className="flex items-center gap-2 text-xs text-ax-blue-2">
              <span className="w-2 h-2 rounded-full bg-ax-blue-2 animate-pulse" /> sandbox · Chronos-bound review
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
  if (path.startsWith('/ta-v2')) label = 'Sandbox'
  else if (path.startsWith('/registry')) label = 'Registry · Progressive Universe'
  else if (path.startsWith('/kerry')) label = 'Kerry · Market Data'
  else if (path.startsWith('/wally')) label = 'Wally · Trade Research (Historical)'
  else if (path.startsWith('/chronos')) label = 'Chronos · Predictive Targets'
  else if (path.startsWith('/tibot-forward')) label = 'Tibot · 24h Live-Forward Validation'
  else if (path.startsWith('/tibot-batches')) label = 'Tibot · Gate-B Pipeline (Batch 3)'
  else if (path.startsWith('/tibot')) label = 'Tibot · Suite Review'
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
