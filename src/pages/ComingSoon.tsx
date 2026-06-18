import { useParams, Link } from 'react-router-dom'
import { AGENTS } from '../data/agents'

export function ComingSoon() {
  const { id } = useParams()
  const a = AGENTS.find((x) => x.id === id)
  return (
    <div className="h-full flex items-center justify-center">
      <div className="ax-card ax-glow px-12 py-14 text-center max-w-md">
        <div className="text-5xl mb-4">🛰️</div>
        <h1 className="font-display text-2xl tracking-wide ax-glow-text">
          {a ? a.name : 'Agent'} dashboard
        </h1>
        <p className="text-ax-muted mt-2 text-sm">{a?.role}</p>
        <p className="mt-5 inline-block text-xs uppercase tracking-widest text-ax-blue-2 border border-ax-blue/30 rounded-full px-3 py-1">
          Coming soon
        </p>
        <div className="mt-6">
          <Link to="/" className="text-sm text-ax-muted hover:text-ax-text">← back to architecture</Link>
        </div>
      </div>
    </div>
  )
}
