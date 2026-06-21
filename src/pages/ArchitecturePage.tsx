import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { ArchitectureGraph } from '../components/ArchitectureGraph'
import { AGENTS, type AgentId } from '../data/agents'

const liveCount = AGENTS.filter((a) => a.status === 'live').length
const pendingCount = AGENTS.filter((a) => a.status === 'pending').length

export function ArchitecturePage() {
  const nav = useNavigate()
  const go = (id: AgentId) => {
    if (id === 'operator') return // operator is the human, not a dashboard
    const a = AGENTS.find((x) => x.id === id)
    if (a?.detailed) nav('/kerry')
    else if (id !== 'axone') nav(`/agent/${id}`)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-3xl tracking-tight ax-glow-text">Axone Architecture</h1>
        <p className="text-ax-muted mt-1 text-sm">
          Authoritative agent topology &amp; information flow · synced 2026-06-22 ·{' '}
          <span className="text-ax-text">{liveCount} live</span> +{' '}
          <span className="text-[#ff8aa0]">{pendingCount} pending</span> + operator. Click any node for detail.
        </p>
      </div>

      <Card
        title="System Topology"
        subtitle="Operator → Axone routes specialists · Spider gateway · Chronos→Sentinel audit · Kerry+Chronos→Tibot bots · Guy read-only · Wally & Darwin pending"
        bodyClass="!p-2"
      >
        <ArchitectureGraph onSelect={go} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Edge legend">
          <ul className="text-sm text-ax-muted space-y-1.5">
            <li><span className="text-ax-blue-2">━━</span> data / contract flow</li>
            <li><span className="text-[#1ec8a5]">━━</span> Sentinel integrity / leakage audit</li>
            <li><span className="text-[#7c5cff]">╌╌</span> Axone request routing</li>
            <li><span className="text-[#ffb454]">╌╌</span> Guy read-only dashboard flow</li>
            <li><span className="text-ax-muted">┄┄</span> Glia memory links</li>
            <li><span className="text-[#ff5470]">╌╌</span> future execution (disabled / pending)</li>
          </ul>
        </Card>

        <Card title="Status legend">
          <ul className="text-sm text-ax-muted space-y-1.5">
            <li><span className="text-[#1ec8a5]">●</span> <span className="text-ax-text">LIVE / configured</span> — active agent</li>
            <li><span className="text-[#ff5470]">◌</span> <span className="text-[#ff8aa0]">PENDING / not live</span> — no current authority</li>
            <li className="pt-1">
              <span className="text-[#ff8aa0]">Wally ⏳</span> — future risk gate &amp; execution approval (not live).
            </li>
            <li>
              <span className="text-[#ff8aa0]">Darwin ⏳</span> — future evolution / discovery (scope TBD).
            </li>
          </ul>
        </Card>

        <Card title="Supervision gate">
          <p className="text-xs text-ax-muted mb-2">
            Sentinel is the <span className="text-[#1ec8a5]">integrity / leakage supervisor</span> — not the trade/risk gate.
          </p>
          <ul className="text-sm text-ax-muted space-y-1.5">
            <li><span className="text-[#1ec8a5]">PASS</span> — clean &amp; leakage-free; permits downstream use</li>
            <li><span className="text-[#ff5470]">FAIL</span> — defect found; returns to Axone / owner</li>
            <li><span className="text-[#ffb454]">BLOCKED</span> — cannot verify; halts the flow</li>
            <li><span className="text-[#7c5cff]">⚠ leakage gate</span> — records leakage evidence per pass</li>
          </ul>
        </Card>

        <Card title="Detailed pages">
          <p className="text-sm text-ax-muted">
            <span className="text-ax-text">Kerry</span> is live. Other agent pages are scaffolded
            incrementally and currently show a “Coming soon” placeholder. The{' '}
            <span className="text-ax-text">TA v3</span> Sandbox integration lives on the{' '}
            <span className="text-ax-text">/ta-v2</span> page.
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Ownership boundaries" subtitle="Each owner is exclusive — cross-writes are prohibited">
          <ul className="text-sm text-ax-muted space-y-1.5">
            <li>External web / API / Binance → <span className="text-ax-text">Spider</span> only</li>
            <li>Historical datasets / training / replay / evidence → <span className="text-ax-text">Chronos</span> only</li>
            <li>Rolling live data (≤200 closed candles) → <span className="text-ax-text">Kerry</span> only</li>
            <li>Prediction / classification / strategy bots + training → <span className="text-ax-text">Tibot</span> only</li>
            <li>Durable memory writes / compression → <span className="text-ax-text">Glia</span> only</li>
            <li>Integrity / leakage supervision + transient hygiene → <span className="text-ax-text">Sentinel</span> (no repair, no risk approval)</li>
            <li>Config / system / skills → <span className="text-ax-text">Conchita</span></li>
            <li>Code authored/reviewed by <span className="text-ax-text">Sublime</span>, run by the owning domain agent</li>
            <li>Dashboard build/deploy → <span className="text-ax-text">Guy</span> (read-only consumer of certified artifacts)</li>
          </ul>
        </Card>

        <Card title="Change &amp; verification workflow">
          <ol className="text-sm text-ax-muted space-y-1.5 list-decimal list-inside">
            <li>Architecture change / new calculation → <span className="text-ax-text">Axone</span> routes to the correct owner</li>
            <li><span className="text-ax-text">Chronos</span> historical verification where applicable</li>
            <li><span className="text-[#1ec8a5]">Sentinel</span> supervises &amp; records PASS / FAIL / BLOCKED + leakage</li>
            <li><span className="text-ax-text">Glia</span> stores compressed durable context</li>
            <li>After a clean PASS, Axone notifies <span className="text-ax-text">Guy</span> → deploy → provenance/hash closes the loop</li>
          </ol>
          <p className="text-xs text-ax-muted mt-3 border-t border-ax-border/60 pt-2">
            The proposed <span className="text-ax-text">axone_setup</span> Sentinel skill captures this workflow but is a{' '}
            <span className="text-[#ff8aa0]">pending proposal</span> (id <code className="text-ax-blue-2">axone-setup-20260621-5b0dbebc06</code>) — not installed/applied.
          </p>
          <p className="text-xs text-ax-muted mt-2">
            Paper/live execution requires the future <span className="text-[#ff8aa0]">Wally</span> gate plus explicit operator approval — currently disabled.
          </p>
        </Card>
      </div>
    </div>
  )
}
