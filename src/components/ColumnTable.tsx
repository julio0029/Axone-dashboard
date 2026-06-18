import { COLUMNS, type DisplayType } from '../data/kerry'

const BADGE: Record<DisplayType, string> = {
  overlay: 'text-ax-blue-2 bg-ax-blue/10 border-ax-blue/30',
  subchart: 'text-ax-up bg-[#1ec8a5]/10 border-[#1ec8a5]/30',
  marker: 'text-ax-down bg-[#ff5470]/10 border-[#ff5470]/30',
}

export function ColumnTable({
  enabled, onToggle,
}: {
  enabled: Set<string>
  onToggle: (key: string) => void
}) {
  return (
    <div className="overflow-x-auto ax-scroll">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-ax-muted text-[11px] uppercase tracking-wider text-left">
            <th className="py-2 px-3 font-medium">Column</th>
            <th className="py-2 px-3 font-medium">Description</th>
            <th className="py-2 px-3 font-medium">Source</th>
            <th className="py-2 px-3 font-medium">Timeframe</th>
            <th className="py-2 px-3 font-medium">Display</th>
            <th className="py-2 px-3 font-medium text-right">On chart</th>
          </tr>
        </thead>
        <tbody>
          {COLUMNS.map((c) => {
            const on = enabled.has(c.key)
            return (
              <tr key={c.key} className="border-t border-ax-border/50 hover:bg-white/[0.02]">
                <td className="py-2.5 px-3 text-ax-text font-medium whitespace-nowrap">{c.name}</td>
                <td className="py-2.5 px-3 text-ax-muted">{c.description}</td>
                <td className="py-2.5 px-3 text-ax-muted font-mono text-xs whitespace-nowrap">{c.source}</td>
                <td className="py-2.5 px-3 text-ax-muted uppercase text-xs">{c.timeframe}</td>
                <td className="py-2.5 px-3">
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${BADGE[c.display]}`}>
                    {c.display}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => onToggle(c.key)}
                    role="switch"
                    aria-checked={on}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                      on ? 'bg-ax-blue ax-glow' : 'bg-ax-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                        on ? 'translate-x-[18px]' : 'translate-x-[4px]'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
