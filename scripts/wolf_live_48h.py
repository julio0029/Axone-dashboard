#!/usr/bin/env python3
"""Read-only Wolf 48h dashboard producer. Writes only beneath Axone-dashboard."""
from __future__ import annotations

import argparse, glob, hashlib, json, os, tempfile, time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEDGER = Path('/Users/julesdevaux/.openclaw/agents/wolf/workspace/LEDGER/paper_adapter_live_ledger.jsonl')
WALLY = '/Users/julesdevaux/.openclaw/agents/wally/workspace/LEDGER/live_forward_decisions_*.jsonl'
CANDLES = Path('/Users/julesdevaux/.openclaw/workspace/DATA/live')
AUTH = Path('/Users/julesdevaux/.hermes/exec_plane/AUTHORIZATION.json')
STATE = Path('/Users/julesdevaux/.hermes/exec_plane/state.json')
HEARTBEAT = Path('/Users/julesdevaux/.openclaw/agents/wolf/workspace/live_execution/wolf_standing_runner_heartbeat.json')
LOG = Path('/Users/julesdevaux/.openclaw/agents/wolf/workspace/live_execution/standing_runner_supervised.log')
OUT = ROOT / 'public/data/wolf_live_48h.json'
CURSOR = ROOT / '.wolf-live-48h-cursor.json'

def read_json(path):
    with path.open() as f: return json.load(f)

def jsonl(path):
    out=[]
    try:
        with Path(path).open(errors='replace') as f:
            for line in f:
                try: out.append(json.loads(line))
                except json.JSONDecodeError: pass
    except FileNotFoundError: pass
    return out

def atomic(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix='.'+path.name+'.')
    try:
        with os.fdopen(fd,'w') as f:
            json.dump(payload,f,separators=(',',':'),allow_nan=False); f.flush(); os.fsync(f.fileno())
        os.replace(tmp,path)
    finally:
        if os.path.exists(tmp): os.unlink(tmp)

def side(action):
    return 'LONG' if 'LONG' in (action or '') else 'SHORT' if 'SHORT' in (action or '') else '—'

def iso_ts(v):
    return datetime.fromisoformat(v.replace('Z','+00:00')).timestamp()

def produce():
    now=datetime.now(timezone.utc); auth=read_json(AUTH); state=read_json(STATE)
    universe=auth['launch_record']['trading_universe']; enabled=universe['enabled_and_pinned']
    session_start=iso_ts(auth['launch_record']['clock_start_utc'])
    decisions={}
    for p in sorted(glob.glob(WALLY)):
        for d in jsonl(p):
            if d.get('decision_timestamp') and iso_ts(d['decision_timestamp']) >= session_start:
                decisions[d.get('decision_id')]=d
    all_records=jsonl(LEDGER)
    chain_ok=all(all_records[i].get('previous_hash')==all_records[i-1].get('record_hash') for i in range(1,len(all_records)))
    records=[r for r in all_records if r.get('schema')=='paper_adapter_v2.execution.v1' and r.get('recorded_at') and iso_ts(r['recorded_at']) >= session_start]
    records.sort(key=lambda r:(r.get('sequence',0),r.get('record_hash','')))
    seen=set(); records=[r for r in records if not (r.get('record_hash') in seen or seen.add(r.get('record_hash')))]

    candles={}; latest={}
    for sym in enabled:
        p=CANDLES/sym/'5m/candles.parquet'
        if not p.exists(): continue
        import pandas as pd
        df=pd.read_parquet(p).tail(200)
        rows=[]
        for x in df.to_dict('records'):
            t=x['timestamp']; t=t.isoformat() if hasattr(t,'isoformat') else str(t)
            rows.append({'time':t,'open':float(x['open']),'high':float(x['high']),'low':float(x['low']),'close':float(x['close']),'volume':float(x['volume'])})
        candles[sym]=rows
        if rows: latest[sym]=rows[-1]['close']

    lots=defaultdict(list); realized=0.0; realized_curve=[]; actions=[]; position_changes=[]
    for r in records:
        w=r.get('wally_decision') or decisions.get(r.get('decision_id')) or {}
        wolf=r.get('wolf_action') or {}; sym=w.get('symbol','UNKNOWN')
        exs=r.get('exchange_actions') or []
        if not exs:
            actions.append({'kind':'PROPOSED','timestamp':r.get('recorded_at'),'symbol':sym,'side':side(wolf.get('action')),'wolf_action':wolf.get('action'),'exchange_action':None,'order_status':r.get('status'),'acknowledged':None,'client_order_id':None,'exchange_order_id':None,'quantity':None,'fill_price':None,'notional':None,'commission':None,'commission_asset':None,'conviction':w.get('conviction'),'uncertainty':w.get('uncertainty'),'expected_gain':w.get('expected_move_pct'),'holding_horizon':w.get('horizon_bars'),'realized_pnl':None,'unrealized_pnl':None,'exit_reason':wolf.get('action_reason'),'rejection':r.get('rejection'),'fail_closed':bool(r.get('rejection') and ('pinned sizing' in r['rejection'] or sym in universe['excluded_with_reason'])),'decision_id':r.get('decision_id'),'sequence':r.get('sequence'),'record_hash':r.get('record_hash')})
        for ex in exs:
            fills=ex.get('fills') or []
            fill_qty=sum(float(f.get('qty',0)) for f in fills) or float(ex.get('filled_quantity') or 0)
            fill_price=(sum(float(f['price'])*float(f['qty']) for f in fills)/sum(float(f['qty']) for f in fills)) if fills and sum(float(f['qty']) for f in fills) else None
            action=ex.get('action',''); closed_pnl=0.0
            if fills and fill_price is not None:
                signed=fill_qty if action=='OPEN_LONG' else -fill_qty if action=='OPEN_SHORT' else -fill_qty if action=='CLOSE_LONG' else fill_qty
                remaining=abs(signed)
                if action.startswith('CLOSE'):
                    while remaining>1e-12 and lots[sym]:
                        lot=lots[sym][0]; q=min(remaining,abs(lot['qty']))
                        pnl=(fill_price-lot['price'])*q*(1 if lot['qty']>0 else -1)
                        closed_pnl+=pnl; lot['qty']-=q*(1 if lot['qty']>0 else -1); remaining-=q
                        if abs(lot['qty'])<1e-12: lots[sym].pop(0)
                else: lots[sym].append({'qty':signed,'price':fill_price})
                realized+=closed_pnl; realized_curve.append([r.get('recorded_at'),realized])
                position_changes.append({'symbol':sym,'timestamp':r.get('recorded_at'),'price':fill_price,'quantity':signed,'action':action,'decision_id':r.get('decision_id')})
            commissions=[f"{f.get('commission')} {f.get('commissionAsset')}" for f in fills]
            actions.append({'kind':'ACTUAL_FILL' if fills else 'PROPOSED','timestamp':r.get('recorded_at'),'symbol':sym,'side':side(action),'wolf_action':wolf.get('action'),'exchange_action':action,'order_status':ex.get('status'),'acknowledged':ex.get('acknowledged'),'client_order_id':ex.get('client_order_id'),'exchange_order_id':ex.get('exchange_order_id'),'quantity':fill_qty or None,'fill_price':fill_price,'notional':fill_qty*fill_price if fill_price else None,'commission':', '.join(commissions) or None,'commission_asset':fills[0].get('commissionAsset') if fills else None,'conviction':w.get('conviction'),'uncertainty':w.get('uncertainty'),'expected_gain':w.get('expected_move_pct'),'holding_horizon':w.get('horizon_bars'),'realized_pnl':closed_pnl if action.startswith('CLOSE') and fills else None,'unrealized_pnl':None,'exit_reason':wolf.get('action_reason') if action.startswith('CLOSE') else None,'rejection':r.get('rejection'),'fail_closed':False,'decision_id':r.get('decision_id'),'sequence':r.get('sequence'),'record_hash':r.get('record_hash')})

    positions=[]; gross=net=unrealized=0.0
    for sym, ls in lots.items():
        qty=sum(x['qty'] for x in ls)
        if abs(qty)<1e-12: continue
        avg=sum(abs(x['qty'])*x['price'] for x in ls)/sum(abs(x['qty']) for x in ls); mark=latest.get(sym)
        upnl=(mark-avg)*qty if mark is not None else None
        notional=abs(qty*(mark if mark is not None else avg)); gross+=notional; net+=qty*(mark if mark is not None else avg)
        if upnl is not None: unrealized+=upnl
        positions.append({'symbol':sym,'side':'LONG' if qty>0 else 'SHORT','quantity':abs(qty),'entry_price':avg,'mark_price':mark,'notional':notional,'unrealized_pnl':upnl})
    for a in actions:
        p=next((p for p in positions if p['symbol']==a['symbol']),None)
        if p: a['unrealized_pnl']=p['unrealized_pnl']
    # Supervisor refusals are strategy proposals stopped before the adapter/venue.
    for event in jsonl(LOG):
        if event.get('ts') and iso_ts(event['ts']) >= session_start and event.get('message')=='FAIL-CLOSED: no valid pinned sizing for symbol; ENTER refused':
            d=decisions.get(event.get('decision_id')) or {}
            actions.append({'kind':'PROPOSED','timestamp':event['ts'],'symbol':event.get('symbol'),'side':side(d.get('desired_stance')),'wolf_action':f"ENTER_{d.get('desired_stance')}" if d.get('desired_stance') in ('LONG','SHORT') else 'ENTER','exchange_action':None,'order_status':'REFUSED BEFORE ADAPTER','acknowledged':False,'client_order_id':None,'exchange_order_id':None,'quantity':None,'fill_price':None,'notional':None,'commission':None,'commission_asset':None,'conviction':d.get('conviction'),'uncertainty':d.get('uncertainty'),'expected_gain':d.get('expected_move_pct'),'holding_horizon':d.get('horizon_bars'),'realized_pnl':None,'unrealized_pnl':None,'exit_reason':None,'rejection':'no valid pinned sizing for symbol; ENTER refused','fail_closed':True,'decision_id':event.get('decision_id'),'sequence':None,'record_hash':None})
    hb_age=max(0,now.timestamp()-HEARTBEAT.stat().st_mtime) if HEARTBEAT.exists() else None
    closed=[a for a in actions if a['realized_pnl'] is not None]
    pnl_points=[]; peak=0; max_dd=0
    for t,v in realized_curve:
        peak=max(peak,v); max_dd=min(max_dd,v-peak); pnl_points.append([t,v])
    start=auth['launch_record']['clock_start_utc']; end=auth['launch_record']['clock_end_utc']
    payload={'ok':True,'generated_at':now.isoformat(),'freshness_seconds':0,'source_ledger_mtime':datetime.fromtimestamp(LEDGER.stat().st_mtime,timezone.utc).isoformat(),'session':{'run_tag':auth.get('run_tag'),'session_id':state.get('session_id'),'clock_start_utc':start,'clock_end_utc':end,'state':state.get('state'),'runner_pid':state.get('runner_pid'),'heartbeat_age_seconds':hb_age,'stale':hb_age is None or hb_age>420,'chain_valid':chain_ok,'environment':'BINANCE SPOT TESTNET','fees':'ZERO FEES','real_money':False},'universe':{'enabled':enabled,'excluded':universe['excluded_with_reason']},'metrics':{'open_positions':len(positions),'gross_exposure_derived':gross,'net_exposure_derived':net,'realized_pnl_derived':realized,'unrealized_pnl_derived':unrealized,'trade_count':sum(1 for a in actions if a['kind']=='ACTUAL_FILL'),'win_rate_derived':(sum(1 for a in closed if a['realized_pnl']>0)/len(closed) if closed else None),'max_drawdown_derived':max_dd,'p10_utilization':len(positions),'a10':10,'portfolio_equity':None,'available_capital':None,'counterfactual_cost_pnl':None},'positions':positions,'actions':sorted(actions,key=lambda x:(x['timestamp'] or '',x['sequence'] or 0),reverse=True),'position_changes':position_changes,'candles':candles,'wally_decisions':list(decisions.values())[-500:],'pnl_curve':pnl_points,'not_available':['Portfolio equity (no session equity ledger)','Available capital (no session capital ledger)','Expected gain (expected_move_pct is null)','Holding horizon (horizon_bars is null)','Counterfactual realistic-cost PnL (no authorized cost model)'],'formulae':{'exposure':'Σ |open fill quantity × latest 5m close|; net keeps signed quantity','realized_pnl':'FIFO close fills versus open fill prices; commissions observed separately','unrealized_pnl':'Σ signed open quantity × (latest 5m close − FIFO entry price)','p10':'count of symbols with non-zero fill-derived open quantity; ceiling A10=10'}}
    atomic(OUT,payload)
    atomic(CURSOR,{'ledger_byte_offset':LEDGER.stat().st_size,'last_sequence':records[-1]['sequence'] if records else None,'last_record_hash':records[-1]['record_hash'] if records else None,'last_successful_update':payload['generated_at'],'output_sha256':hashlib.sha256(OUT.read_bytes()).hexdigest()})
    return payload

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--watch',action='store_true'); ap.add_argument('--interval',type=float,default=2.0); args=ap.parse_args()
    last=(-1,-1)
    while True:
        try:
            candle_mtime=max([(CANDLES/s/'5m/candles.parquet').stat().st_mtime_ns for s in read_json(AUTH)['launch_record']['trading_universe']['enabled_and_pinned'] if (CANDLES/s/'5m/candles.parquet').exists()] or [0])
            sig=(LEDGER.stat().st_size,max([Path(p).stat().st_mtime_ns for p in glob.glob(WALLY)] or [0]),LOG.stat().st_size if LOG.exists() else 0,HEARTBEAT.stat().st_mtime_ns if HEARTBEAT.exists() else 0,candle_mtime)
            if sig!=last: produce(); last=sig
        except Exception as e:
            atomic(OUT,{'ok':False,'generated_at':datetime.now(timezone.utc).isoformat(),'error':f'{type(e).__name__}: {e}','stale_data_suppressed':True})
            if not args.watch: raise
        if not args.watch: break
        time.sleep(max(.5,args.interval))
if __name__=='__main__': main()
