import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { AGENTS, EDGES, CATEGORIES, type AgentId, type EdgeKind } from '../data/agents'

const EDGE_STYLE: Record<EdgeKind, { color: string; type: 'solid' | 'dashed' | 'dotted'; width: number; opacity: number; arrow: boolean; curve: number }> = {
  flow:    { color: '#2f9bff', type: 'solid',  width: 2.2, opacity: 0.9,  arrow: true,  curve: 0.08 },
  control: { color: '#7c5cff', type: 'dashed', width: 1,   opacity: 0.28, arrow: true,  curve: 0.18 },
  memory:  { color: '#8aa0c6', type: 'dotted', width: 1,   opacity: 0.16, arrow: false, curve: 0.3 },
  read:    { color: '#ffb454', type: 'dashed', width: 1.4, opacity: 0.6,  arrow: true,  curve: 0.1 },
}

export function ArchitectureGraph({ onSelect }: { onSelect: (id: AgentId) => void }) {
  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(10,16,32,0.95)',
      borderColor: '#1b2740',
      textStyle: { color: '#c7d3e6' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (p: any) => {
        if (p.dataType !== 'node') return ''
        const d = p.data as { name: string; role: string }
        return `<b>${d.name}</b><br/><span style="color:#6b7a96">${d.role}</span>`
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
      },
      emphasis: { focus: 'adjacency', scale: 1.1, lineStyle: { width: 3 } },
      data: AGENTS.map((a) => ({
        id: a.id,
        name: a.name,
        value: a.role,
        role: a.role,
        x: a.x,
        y: a.y,
        category: a.cat,
        symbol: a.id === 'axone' ? 'diamond' : 'circle',
        symbolSize: a.id === 'axone' ? 46 : a.detailed ? 40 : 30,
        itemStyle: {
          color: CATEGORIES[a.cat].color,
          borderColor: a.detailed ? '#4dd2ff' : 'rgba(47,155,255,0.35)',
          borderWidth: a.detailed ? 2.5 : 1,
          shadowColor: CATEGORIES[a.cat].color,
          shadowBlur: a.id === 'axone' ? 24 : 12,
        },
      })),
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
      style={{ height: 560, width: '100%' }}
      opts={{ renderer: 'canvas' }}
      onEvents={{
        click: (p: { dataType?: string; data?: { id?: AgentId } }) => {
          if (p.dataType === 'node' && p.data?.id) onSelect(p.data.id)
        },
      }}
    />
  )
}
