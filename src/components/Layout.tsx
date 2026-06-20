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
          <p className="text-ax-muted text-[10px] uppercase tracking-widest px-3 pt-4 pb-1">Agents</p>
          {AGENTS.filter((a) => a.id !== 'axone').map((a) => (
            <NavLink
              key={a.id}
              to={a.detailed ? '/kerry' : `/agent/${a.id}`}
              className={navClass}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: CATEGORIES[a.cat].color }}
              />
              {a.name}
              {!a.detailed && <span className="ml-auto text-[9px] text-ax-muted">soon</span>}
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
  else if (path.startsWith('/kerry')) label = 'Kerry · Market Data'
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
