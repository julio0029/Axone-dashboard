import { Card } from '../components/Card'
import { AwaitingData, LoadGate, PaperTestnetBanner, Pill, SimTag, StatTile } from '../components/V2'
import { usePaperTest, sym, type PaperTest, type PaperRun } from '../data/v2'

const AX = { blue2: '#4dd2ff', up: '#1ec8a5', down: '#ff5470', amber: '#ffb454', muted: '#6b7a96' }

export function V2PaperTestPage() {
  const { status, data, error } = usePaperTest()
  return (
    <div className="space-y-4">
      {/* Banner shows even before data resolves, from the resolved payload once ready */}
      {data && <PaperTestnetBanner endpoint={data.exchangeEndpoint} />}
      <LoadGate status={status} error={error} absentHint="paper-test data not found — run scripts/gen_v2_paper_test.py">
        {data && <Body d={data} />}
      </LoadGate>
    </div>
  )
}

function Body({ d }: { d: PaperTest }) {
  const notStarted = d.status === 'not_started' || !d.activeRun
  return (
    <>
      {/* Run status strip */}
      <Card
        title="48h Paper Test"
        subtitle="Track D · Wolf → paper adapter · Binance Testnet shadow run"
        right={
          <div className="flex items-center gap-2">
            <Pill color={notStarted ? '#6b7a96' : AX.up}>{d.status.replace('_', ' ')}</Pill>
            <Pill color={AX.amber}>PAPER · TESTNET</Pill>
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          <StatTile label="Mode" value={<span style={{ color: AX.amber }}>{d.mode.replace('_', ' / ')}</span>} sub="no real money" />
          <StatTile label="Endpoint" value={<span className="text-xs font-mono">testnet.binance.vision</span>} sub="mainnet forbidden" />
          <StatTile label="Slot size" value={`$${d.slotSizeUsd}`} sim sub={`${d.orderType} · sim`} />
          <StatTile label="Boundary" value={`${d.boundarySeconds / 60}m`} sub="5-minute cadence" />
          <StatTile label="Universe" value={`${d.universe.length}`} sub="frozen symbols" />
          <StatTile
            label="Kill switch"
            value={d.activeRun ? d.activeRun.killSwitchState : 'ARMED'}
            tone={d.activeRun?.killSwitchState === 'TRIGGERED' || d.activeRun?.killSwitchState === 'HALTED' ? 'down' : 'default'}
            sub="fail-closed"
          />
        </div>
      </Card>

      {notStarted ? (
        <NotStarted d={d} />
      ) : (
        <LiveRun run={d.activeRun!} />
      )}

      {/* Decision vs execution — the contract's two-record design, always shown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Decision layer" subtitle="Wally → Wolf · INTENDED action">
          <p className="text-ax-muted text-xs leading-relaxed">{d.decisionExecutionSeparation.decisionRecord}</p>
          <p className="text-ax-muted/70 text-[11px] mt-2">
            Schema <span className="font-mono text-ax-text">wolf_action.v1</span>. HOLD / NO_ACTION are ledger-only and
            never reach the adapter.
          </p>
        </Card>
        <Card title="Execution layer" subtitle="Paper adapter · ack / fill (SEPARATE record)">
          <p className="text-ax-muted text-xs leading-relaxed">{d.decisionExecutionSeparation.executionRecord}</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {d.decisionExecutionSeparation.fillStatuses.map((f) => (
              <Pill key={f} color={AX.amber}>
                {f}
              </Pill>
            ))}
          </div>
        </Card>
      </div>

      {/* Pipeline health */}
      <Card title="Pipeline health" subtitle="fail-closed operational monitors (from the frozen adapter contract)">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {d.pipelineHealthComponents.map((c) => (
            <div key={c.key} className="rounded-lg border border-ax-border/70 bg-white/[0.02] p-3">
              <div className="text-ax-text text-sm font-display tracking-wide">{c.label}</div>
              {c.states && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {c.states.map((s) => (
                    <Pill key={s} color={AX.amber}>
                      {s}
                    </Pill>
                  ))}
                </div>
              )}
              <div className="text-ax-muted/70 text-[10px] font-mono mt-2 truncate" title={c.source}>
                {c.source}
              </div>
              {!d.activeRun && <div className="text-ax-muted/60 text-[10px] mt-1 uppercase tracking-widest">awaiting run</div>}
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-ax-border/60 flex items-center gap-2 text-[11px] text-ax-muted">
          severity model:
          {d.severityModel.map((s) => (
            <Pill key={s} color={s === 'INVALIDATING' ? AX.down : s === 'DEGRADED' ? AX.amber : AX.muted}>
              {s}
            </Pill>
          ))}
        </div>
      </Card>

      <p className="text-ax-muted/60 text-[10px] px-1">
        Track D is a paper / testnet shadow test. {d.provenance.note}
        {d.contractFile && (
          <>
            {' '}
            Contract <span className="font-mono">{d.contractSha}</span>.
          </>
        )}
      </p>
    </>
  )
}

function NotStarted({ d }: { d: PaperTest }) {
  return (
    <div className="space-y-4">
      <AwaitingData
        title="Paper test not started"
        detail="No run directory exists yet under TRACK_D_48h_paper_test/. Once the 48h Binance-Testnet shadow run begins, live 5m OHLCV, Wolf decisions, paper fills, open positions and simulated equity/PnL will stream here. Until then nothing is fabricated."
      />
      {/* The labelled skeleton of what will appear — so the layout is clear but empty */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Live 5m OHLCV" subtitle="per-symbol candles">
          <AwaitingData title="awaiting feed" />
        </Card>
        <Card title="Open positions" subtitle="testnet holdings">
          <AwaitingData title="awaiting run" />
        </Card>
        <Card title="Equity & PnL" subtitle="simulated · testnet" right={<SimTag />}>
          <AwaitingData title="awaiting run" detail="Realized / unrealized PnL will be marked SIMULATED." />
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Wolf decision → paper order/fill" subtitle="intended action vs testnet ack (separate columns)">
          <IntentFillHeaderOnly />
        </Card>
        <Card title="Missed boundaries" subtitle="5m heartbeat gaps">
          <AwaitingData title="awaiting run" />
        </Card>
      </div>
      <div className="rounded-lg border border-ax-border/60 bg-white/[0.015] px-4 py-3">
        <p className="text-ax-muted text-[11px] uppercase tracking-widest mb-2">frozen paper-test universe</p>
        <div className="flex flex-wrap gap-1.5">
          {d.universe.map((s) => (
            <Pill key={s} color={AX.muted}>
              {sym(s)}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  )
}

function IntentFillHeaderOnly() {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-ax-muted uppercase tracking-widest text-[10px]">
          <th className="text-left font-normal px-2 py-1.5">Symbol</th>
          <th className="text-left font-normal px-2 py-1.5">Wolf INTENDED</th>
          <th className="text-left font-normal px-2 py-1.5">
            Paper ack / fill <SimTag />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={3}>
            <div className="py-6 text-center text-ax-muted/70 text-[11px] uppercase tracking-widest">
              awaiting run — intent &amp; fill shown in separate columns
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

function LiveRun({ run }: { run: PaperRun }) {
  // Rendered once real run logs exist. Every equity/PnL figure carries SimTag.
  const eq = run.latestEquity ?? {}
  const num = (k: string) => {
    const v = (eq as Record<string, unknown>)[k]
    return typeof v === 'number' ? v : null
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Portfolio equity" value={fmt(num('portfolio_equity_usd'))} sim tone="default" />
        <StatTile label="Realized PnL" value={fmt(num('realized_pnl_usd'))} sim tone={(num('realized_pnl_usd') ?? 0) >= 0 ? 'up' : 'down'} />
        <StatTile label="Unrealized PnL" value={fmt(num('unrealized_pnl_usd'))} sim tone={(num('unrealized_pnl_usd') ?? 0) >= 0 ? 'up' : 'down'} />
        <StatTile label="Open positions" value={String(num('open_positions_count') ?? '—')} sub="testnet" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Wolf decisions (INTENDED)" subtitle={`${run.counts.wolfDecisions ?? 0} recorded · tail`}>
          <LogList rows={run.wolfDecisionsTail} keys={['boundary_timestamp_utc', 'symbol', 'wolf_action_type', 'action_reason_code']} />
        </Card>
        <Card title="Paper fills (ack / fill)" subtitle={`${run.counts.adapterFills ?? 0} recorded · tail`} right={<SimTag />}>
          <LogList rows={run.adapterFillsTail} keys={['fill_timestamp_utc', 'symbol', 'fill_status', 'fill_price']} />
        </Card>
      </div>
      <Card title="Missed boundaries" subtitle={`${run.missedBoundaryCount} gaps`}>
        {run.missedBoundaryCount === 0 ? (
          <p className="text-ax-muted text-sm py-4 text-center">no missed 5m boundaries</p>
        ) : (
          <LogList rows={run.missedBoundaries} keys={['boundary_timestamp_utc', 'status']} />
        )}
      </Card>
    </div>
  )
}

function fmt(n: number | null) {
  if (n === null) return '—'
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function LogList({ rows, keys }: { rows: Record<string, unknown>[]; keys: string[] }) {
  if (!rows?.length) return <p className="text-ax-muted text-sm py-4 text-center">awaiting rows</p>
  return (
    <div className="overflow-x-auto ax-scroll max-h-[260px] text-xs font-mono">
      <table className="w-full">
        <tbody>
          {[...rows].reverse().map((r, i) => (
            <tr key={i} className="border-b border-ax-border/30">
              {keys.map((k) => (
                <td key={k} className="px-2 py-1 text-ax-text whitespace-nowrap">
                  {String(r[k] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
