import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { AGENTS, EDGES, CATEGORIES, type AgentId, type EdgeKind } from '../data/agents'

const EDGE_STYLE: Record<EdgeKind, { color: string; type: 'solid' | 'dashed' | 'dotted'; width: number; opacity: number; arrow: boolean; curve: number }> = {
  flow:    { color: '#2f9bff', type: 'solid',  width: 2.2, opacity: 0.9,  arrow: true,  curve: 0.08 },
  audit:   { color: '#1ec8a5', type: 'solid',  width: 2.2, opacity: 0.85, arrow: true,  curve: 0.12 },
  control: { color: '#7c5cff', type: 'dashed', width: 1,   opacity: 0.26, arrow: true,  curve: 0.18 },
  memory:  { color: '#b07cff', type: 'dotted', width: 1,   opacity: 0.16, arrow: false, curve: 0.3  },
  read:    { color: '#ffb454', type: 'dashed', width: 1.4, opacity: 0.6,  arrow: true,  curve: 0.1  },
  pending: { color: '#ff5470', type: 'dashed', width: 1.4, opacity: 0.4,  arrow: true,  curve: 0.14 },
}

export function ArchitectureGraph({ onSelect }: { onSelect: (id: AgentId) => void }) {
  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(10,16,32,0.95)',
      borderColor: '#1b2740',
      textStyle: { color: '#c7d3e6' },
      extraCssText: 'max-width:320px;white-space:normal;',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (p: any) => {
        if (p.dataType !== 'node') return ''
        const d = p.data as { name: string; role: string; owns: string; status: string }
        const tag =
          d.status === 'pending'
            ? '<span style="color:#ff5470">● PENDING / NOT LIVE</span>'
            : d.status === 'external'
              ? '<span style="color:#cdd9ec">● Operator</span>'
              : '<span style="color:#1ec8a5">● LIVE</span>'
        return (
          `<b>${d.name}</b>&nbsp;&nbsp;${tag}` +
          `<br/><span style="color:#9fb0cc">${d.role}</span>` +
          `<br/><span style="color:#6b7a96">Owns: ${d.owns}</span>`
        )
      },
    },
    legend: [{
      data: CATEGORIES.map((c) => c.name),
      textStyle: { color: '#6b7a96', fontSize: 11 },
      bottom: 6,
      icon: 'circle',
    }],
    series: [{
      type: 'graph',
      layout: 'none',
      roam: true,
      zoom: 1.05,
      categories: CATEGORIES.map((c) => ({ name: c.name, itemStyle: { color: c.color } })),
      label: {
        show: true,
        position: 'bottom',
        color: '#c7d3e6',
        fontSize: 11,
        fontFamily: 'Space Grotesk, sans-serif',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (p: any) => (p.data?.status === 'pending' ? `${p.data.name} ⏳` : p.data?.name),
      },
      emphasis: { focus: 'adjacency', scale: 1.1, lineStyle: { width: 3 } },
      data: AGENTS.map((a) => {
        const pending = a.status === 'pending'
        const operator = a.status === 'external'
        return {
          id: a.id,
          name: a.name,
          value: a.role,
          role: a.role,
          owns: a.owns,
          status: a.status,
          x: a.x,
          y: a.y,
          category: a.cat,
          symbol: a.id === 'axone' ? 'diamond' : operator ? 'roundRect' : 'circle',
          symbolSize: a.id === 'axone' ? 46 : operator ? 30 : a.detailed ? 40 : 30,
          itemStyle: {
            color: pending ? 'rgba(255,84,112,0.18)' : CATEGORIES[a.cat].color,
            borderColor: pending
              ? '#ff5470'
              : a.detailed
                ? '#4dd2ff'
                : operator
                  ? '#cdd9ec'
                  : 'rgba(47,155,255,0.35)',
            borderType: pending ? 'dashed' : 'solid',
            borderWidth: pending ? 2 : a.detailed ? 2.5 : 1,
            opacity: pending ? 0.9 : 1,
            shadowColor: pending ? 'transparent' : CATEGORIES[a.cat].color,
            shadowBlur: a.id === 'axone' ? 24 : pending ? 0 : 12,
          },
          label: pending ? { color: '#ff8aa0' } : undefined,
        }
      }),
      links: EDGES.map((e) => {
        const s = EDGE_STYLE[e.kind]
        return {
          source: e.source,
          target: e.target,
          symbol: s.arrow ? ['none', 'arrow'] : ['none', 'none'],
          symbolSize: 7,
          lineStyle: { color: s.color, type: s.type, width: s.width, opacity: s.opacity, curveness: s.curve },
        }
      }),
    }],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 580, width: '100%' }}
      opts={{ renderer: 'canvas' }}
      onEvents={{
        click: (p: { dataType?: string; data?: { id?: AgentId } }) => {
          if (p.dataType === 'node' && p.data?.id) onSelect(p.data.id)
        },
      }}
    />
  )
}
