import { type TargetColumn } from '../data/chronosTargets'

const ROLE_BADGE: Record<string, string> = {
  direction: 'text-ax-down bg-[#ff5470]/10 border-[#ff5470]/30',
  numeric: 'text-ax-blue-2 bg-ax-blue/10 border-ax-blue/30',
}

const ROLE_LABEL: Record<string, string> = {
  direction: 'ribbon',
  numeric: 'sub-pane',
}

/** Column-toggle table over the 25 predictive targets, grouped by family.
 *  Each group has its own all/clear; the page wires a global all/clear. */
export function ChronosTargetTable({
  columns, enabled, onToggle, onGroup, groupOrder,
}: {
  columns: TargetColumn[]
  enabled: Set<string>
  onToggle: (name: string) => void
  onGroup: (names: string[], on: boolean) => void
  groupOrder: string[]
}) {
  const groups = groupOrder
    .map((g) => ({ group: g, cols: columns.filter((c) => c.group === g) }))
    .filter((g) => g.cols.length > 0)

  return (
    <div className="space-y-5">
      {groups.map(({ group, cols }) => {
        const names = cols.map((c) => c.name)
        const onCount = names.filter((n) => enabled.has(n)).length
        return (
          <div key={group}>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-sm font-display tracking-wide text-ax-text">
                {group} <span className="text-ax-muted font-normal">· {onCount}/{cols.length}</span>
              </h3>
              <div className="flex gap-1.5 text-[10px]">
                <button
                  onClick={() => onGroup(names, true)}
                  className="px-2 py-0.5 rounded border border-ax-blue/30 text-ax-blue-2 hover:bg-ax-blue/10 transition"
                >all</button>
                <button
                  onClick={() => onGroup(names, false)}
                  className="px-2 py-0.5 rounded border border-ax-border text-ax-muted hover:bg-white/5 transition"
                >clear</button>
              </div>
            </div>
            <div className="overflow-x-auto ax-scroll rounded-lg border border-ax-border/50">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {cols.map((c) => {
                    const on = enabled.has(c.name)
                    return (
                      <tr key={c.name} className="border-t border-ax-border/40 first:border-t-0 hover:bg-white/[0.02]">
                        <td className="py-2 px-3 text-ax-text font-mono text-xs whitespace-nowrap">
                          {c.name.replace(/^target_/, '')}
                        </td>
                        <td className="py-2 px-3 text-ax-muted text-xs">{c.desc}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${ROLE_BADGE[c.role]}`}>
                            {ROLE_LABEL[c.role]}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-ax-muted font-mono text-[11px] whitespace-nowrap">{c.dtype}</td>
                        <td className="py-2 px-3 text-ax-muted font-mono text-[11px] text-right whitespace-nowrap">
                          {c.nanPct > 0 ? `${(c.nanPct * 100).toFixed(1)}% null` : '—'}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => onToggle(c.name)}
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
          </div>
        )
      })}
    </div>
  )
}
