import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { ArchitectureGraph } from '../components/ArchitectureGraph'
import { AGENTS, type AgentId } from '../data/agents'

export function ArchitecturePage() {
  const nav = useNavigate()
  const go = (id: AgentId) => {
    const a = AGENTS.find((x) => x.id === id)
    if (a?.detailed) nav('/kerry')
    else if (id !== 'axone') nav(`/agent/${id}`)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-3xl tracking-tight ax-glow-text">Axone Architecture</h1>
        <p className="text-ax-muted mt-1 text-sm">
          The live agent topology and information flow. Click any node to open its dashboard.
        </p>
      </div>

      <Card
        title="System Topology"
        subtitle="Kerry → Tibot → Wally → Sentinel → Chronos → Darwin · Axone orchestrates · Glia ↔ all"
        bodyClass="!p-2"
      >
        <ArchitectureGraph onSelect={go} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Flow edges">
          <ul className="text-sm text-ax-muted space-y-1.5">
            <li><span className="text-ax-blue-2">━━</span> data / contract flow</li>
            <li><span className="text-[#7c5cff]">╌╌</span> Axone orchestration + Darwin feedback</li>
            <li><span className="text-ax-muted">┄┄</span> Glia memory links (all agents)</li>
            <li><span className="text-[#ffb454]">╌╌</span> Guy reads system state</li>
          </ul>
        </Card>
        <Card title="Detailed pages">
          <p className="text-sm text-ax-muted">
            <span className="text-ax-text">Kerry</span> is live. The remaining agent pages are
            scaffolded incrementally and currently show a “Coming soon” placeholder.
          </p>
        </Card>
        <Card title="Agents">
          <p className="text-sm text-ax-muted">
            <span className="text-ax-text">{AGENTS.length}</span> nodes ·
            orchestrator, data, model/strategy, risk gate, research, system & visualisation layers.
          </p>
        </Card>
      </div>
    </div>
  )
}
