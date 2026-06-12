#!/usr/bin/env python3
"""Build a self-contained Guy diagnostic for the 2026-06-11 gann_swing classifier regressions.
Read-only inputs: Tibot BOTS/backups/datasets_active + Chronos historical.
Writes only under Guy workspace: this dashboard dir and Guy DATA/gann_swing_diagnostic/.
"""
from __future__ import annotations
import json, math, html, traceback
from pathlib import Path
from datetime import datetime, timezone
from typing import Any
import pandas as pd

ROOT = Path('/Users/axone/.openclaw')
GUY = ROOT/'agents/guy/workspace'
HERE = GUY/'DASHBOARDS/gann_swing_regression_diagnostic_20260612'
CACHE = GUY/'DATA/gann_swing_diagnostic'
ACTIVE = ROOT/'agents/tibot/workspace/BOTS'
SNAP = ROOT/'agents/tibot/workspace/backups/BOTS_pre_corrected_retrain_20260611'
HIST = ROOT/'workspace/DATA/historical'
assert str(HERE).startswith(str(GUY)) and str(CACHE).startswith(str(GUY))
HERE.mkdir(parents=True, exist_ok=True); CACHE.mkdir(parents=True, exist_ok=True)

BOTS = [
    ('classifier__gann_swing_classifier__TRUMPUSDT__4h', 0.608, 0.319, -0.289),
    ('classifier__gann_swing_classifier__SUIUSDT__1h', 0.660, 0.382, -0.278),
    ('classifier__gann_swing_classifier__DOGEUSDT__5m', 0.619, 0.354, -0.264),
    ('classifier__gann_swing_classifier__BTCUSDT__1h', 0.639, 0.387, -0.252),
    ('classifier__gann_swing_classifier__SUIUSDT__4h', 0.627, 0.376, -0.251),
]

def jload(p: Path) -> dict[str, Any]:
    try: return json.loads(p.read_text())
    except Exception: return {}

def finite(v):
    try:
        f=float(v); return f if math.isfinite(f) else None
    except Exception: return None

def normalize_ohlcv(df: pd.DataFrame) -> pd.DataFrame:
    cols={c.lower().replace(' ','_'):c for c in df.columns}
    def pick(*names):
        for n in names:
            if n in cols: return cols[n]
        return None
    tc=pick('timestamp','open_time','close_time','date','datetime')
    oc,hc,lc,cc,vc=pick('open'),pick('high'),pick('low'),pick('close'),pick('volume')
    if not tc and 'Close time' in df.columns: tc='Close time'
    if not all([oc,hc,lc,cc]):
        # Binance Vision title-case fallback
        oc,hc,lc,cc,vc='Open','High','Low','Close','Volume'
    out=pd.DataFrame()
    s=df[tc] if tc else pd.Series(df.index, index=df.index)
    out['t']=pd.to_datetime(s, unit='ms' if pd.api.types.is_numeric_dtype(s) else None, utc=True, errors='coerce')
    for dst,src in [('o',oc),('h',hc),('l',lc),('c',cc),('v',vc)]:
        out[dst]=pd.to_numeric(df[src], errors='coerce') if src in df.columns else None
    return out.dropna(subset=['t','o','h','l','c']).sort_values('t')

def metric_pack(base: Path, bot: str) -> dict[str, Any]:
    m=jload(base/bot/'metrics.json'); test=m.get('test',{}) if isinstance(m.get('test'),dict) else m
    return {'macro_f1': finite(test.get('macro_f1') or m.get('macro_f1')), 'accuracy': finite(test.get('accuracy') or m.get('accuracy')), 'sticking_rate': finite(test.get('sticking_rate') or m.get('sticking_rate')), 'confusion_matrix': test.get('confusion_matrix') or m.get('confusion_matrix'), 'labels': test.get('labels') or m.get('labels')}

def model_file(base: Path, bot: str) -> Path|None:
    d=base/bot
    for n in ('model.joblib','model.keras'):
        if (d/n).exists(): return d/n
    return None

def load_model_predict(base: Path, bot: str, df: pd.DataFrame) -> tuple[pd.DataFrame|None, str]:
    mf=model_file(base, bot)
    if not mf: return None, 'model artifact missing'
    try:
        if mf.suffix == '.joblib':
            import joblib
            obj=joblib.load(mf)
            if isinstance(obj, dict):
                model=obj.get('model', obj); feats=obj.get('features') or jload(base/bot/'feature_schema.json').get('features')
            else:
                model=obj; feats=jload(base/bot/'feature_schema.json').get('features')
            if not feats: return None, 'feature schema missing'
            missing=[f for f in feats if f not in df.columns]
            if missing: return None, f'{len(missing)} feature columns missing; first={missing[:8]}'
            X=df[feats].replace([float('inf'), float('-inf')], pd.NA)
            pred=model.predict(X)
            out=pd.DataFrame({'t': list(ts_of(df)), 'predicted_class': pd.to_numeric(pd.Series(list(pred)), errors='coerce')})
            if hasattr(model, 'predict_proba'):
                proba=model.predict_proba(X); classes=list(getattr(model,'classes_', obj.get('classes_', []) if isinstance(obj,dict) else []))
                up_idx=None
                for i,c in enumerate(classes):
                    try:
                        if float(c)==1.0: up_idx=i; break
                    except Exception: pass
                if up_idx is None and getattr(proba,'shape',[0,0])[1] >= 2: up_idx=1
                if up_idx is not None: out['probability_up']=pd.to_numeric(pd.Series(list(proba[:,up_idx])), errors='coerce')
            return out, 'ok'
        if mf.suffix == '.keras':
            try:
                import keras
            except Exception as e:
                return None, f'keras unavailable: {e}'
            feats=jload(base/bot/'feature_schema.json').get('features')
            if not feats: return None, 'feature schema missing'
            missing=[f for f in feats if f not in df.columns]
            if missing: return None, f'{len(missing)} feature columns missing; first={missing[:8]}'
            X=df[feats].replace([float('inf'), float('-inf')], pd.NA).fillna(0).astype('float32')
            scaler=base/bot/'scaler.joblib'
            if scaler.exists():
                import joblib; X=joblib.load(scaler).transform(X)
            model=keras.models.load_model(mf, compile=False)
            y=model.predict(X, verbose=0)
            vals=y.reshape(-1) if getattr(y,'ndim',1)>1 and y.shape[-1]==1 else (y[:,1] if getattr(y,'ndim',1)>1 and y.shape[-1]>1 else y)
            prob=pd.Series(vals).astype(float)
            pred=(prob>=0.5).map({True:1.0,False:-1.0})
            return pd.DataFrame({'t': list(ts_of(df)), 'predicted_class': list(pred), 'probability_up': list(prob)}), 'ok'
        return None, f'unsupported model suffix {mf.suffix}'
    except Exception as e:
        return None, f'{type(e).__name__}: {e}'

def ts_of(df: pd.DataFrame):
    if 'timestamp' in df.columns: return pd.to_datetime(df['timestamp'], utc=True, errors='coerce')
    if 'candle_close_time' in df.columns: return pd.to_datetime(df['candle_close_time'], utc=True, errors='coerce')
    return pd.to_datetime(df.index, utc=True, errors='coerce')

def rows(df: pd.DataFrame) -> list[dict[str,Any]]:
    res=[]
    for r in df.to_dict('records'):
        rr={}
        for k,v in r.items():
            if hasattr(v,'isoformat'): rr[k]=v.isoformat()
            else: rr[k]=finite(v)
        res.append(rr)
    return res

payload={'generated_at': datetime.now(timezone.utc).isoformat(), 'bots': [], 'notes': ['Inference uses current datasets_active feature rows for both snapshot and active models. If a model feature schema cannot be satisfied exactly, prediction generation is skipped rather than feeding a wrong schema.']}
findings=[]
for bot,pre,post,delta in BOTS:
    parts=bot.split('__'); sym,tf=parts[-2],parts[-1]
    ds=ACTIVE/'datasets_active'/f'{sym}_{tf}_gann_swing_classifier.pkl'
    hist=HIST/f'{sym}_{tf}_monthly.pkl'
    entry={'bot_id':bot,'symbol':sym,'timeframe':tf,'audit_macro_f1':{'snapshot':pre,'active':post,'delta':delta}, 'panes':{}, 'skips':[]}
    if not ds.exists():
        entry['skips'].append(f'dataset missing: {ds}'); payload['bots'].append(entry); continue
    d=pd.read_pickle(ds).copy(); d['t']=ts_of(d); d=d.dropna(subset=['t']).sort_values('t')
    test_window=d.tail(min(500,len(d))).copy()
    # OHLCV align to same window
    if hist.exists():
        o=normalize_ohlcv(pd.read_pickle(hist)); o=o[(o['t']>=test_window['t'].min()) & (o['t']<=test_window['t'].max())].tail(len(test_window))
    else:
        o=pd.DataFrame({'t':test_window['t'], 'o':None,'h':None,'l':None,'c':None,'v':None})
        entry['skips'].append(f'OHLCV missing: {hist}')
    features=pd.DataFrame({'t':test_window['t']})
    for c in ['gann_swing','gann_swing_change','gann_swing_age','gann_count','close_rel_gann_change','target']:
        if c in test_window.columns: features[c]=pd.to_numeric(test_window[c], errors='coerce')
    for label,base in [('snapshot',SNAP),('active',ACTIVE)]:
        pred,status=load_model_predict(base, bot, test_window.drop(columns=['t'], errors='ignore'))
        metrics=metric_pack(base, bot)
        cache_dir=CACHE/bot; cache_dir.mkdir(parents=True, exist_ok=True)
        if pred is not None:
            pred=pred.dropna(subset=['t']).tail(len(test_window))
            pred.to_csv(cache_dir/f'{label}_predictions.csv', index=False)
            vc=pred['predicted_class'].round(6).value_counts().to_dict() if 'predicted_class' in pred else {}
            entry['panes'][label]={'metrics':metrics,'prediction_status':'ok','predictions':rows(pred),'class_counts':{str(k):int(v) for k,v in vc.items()}}
        else:
            (cache_dir/f'{label}_predictions.csv').write_text('status\n'+status+'\n')
            entry['panes'][label]={'metrics':metrics,'prediction_status':'skipped: '+status,'predictions':[],'class_counts':{}}
            entry['skips'].append(f'{label}: {status}')
    entry['ohlcv']=rows(o); entry['features']=rows(features)
    snap_ok=entry['panes']['snapshot']['prediction_status']=='ok'; active_ok=entry['panes']['active']['prediction_status']=='ok'
    if snap_ok and active_ok:
        sp=entry['panes']['snapshot']['predictions']; ap=entry['panes']['active']['predictions']; n=min(len(sp),len(ap)); disagree=sum(1 for i in range(n) if finite(sp[i].get('predicted_class'))!=finite(ap[i].get('predicted_class')))
        q=f'Comparable predictions generated; disagreement {disagree}/{n} ({(disagree/n*100 if n else 0):.1f}%).'
    elif snap_ok and not active_ok:
        q='Snapshot predictions generated and look usable; active predictions skipped because current model feature schema is not reconstructable from datasets_active, so visual comparison is not valid. Metrics still show active model is much more one-sided by confusion-matrix recall.'
    elif not snap_ok and active_ok:
        q='Active predictions generated but snapshot skipped; cannot visually compare.'
    else:
        q='Both snapshot and active inference skipped; only metrics/confusion matrices are shown.'
    entry['qualitative_finding']=q
    findings.append((bot,q))
    payload['bots'].append(entry)

(HERE/'diagnostic_data.json').write_text(json.dumps(payload, indent=2, allow_nan=False))

# Self-contained HTML/SVG renderer.
html_doc = r'''<!doctype html><html><head><meta charset="utf-8"><title>gann_swing regression diagnostic</title><style>
body{margin:0;background:#0b1020;color:#e9eefc;font:13px/1.4 system-ui,Segoe UI,Arial}.wrap{max-width:1500px;margin:0 auto;padding:22px}h1{margin:0 0 6px}.muted{color:#9fb0d0}.bot{border:1px solid #2b3a62;background:#111a31;border-radius:16px;padding:16px;margin:18px 0}.panes{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pane{border:1px solid #2b3a62;background:#07101f;border-radius:12px;padding:10px}.metrics{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.pill{border:1px solid #33456f;border-radius:999px;padding:4px 8px;color:#cfe2ff;background:#0b1224}.skip{color:#ffd8df;background:#23121b;border:1px solid #5a2b35;border-radius:10px;padding:8px;white-space:pre-wrap}.finding{color:#d7ffe4;background:#102016;border:1px solid #255d3a;border-radius:10px;padding:8px;margin:8px 0}svg{width:100%;height:430px;background:#06101f;border-radius:8px}.axis{stroke:#33456f}.up{fill:#39d98a;stroke:#39d98a}.down{fill:#ff6b6b;stroke:#ff6b6b}.line{fill:none;stroke:#fbbf24;stroke-width:1.3}.age{fill:none;stroke:#22d3ee;stroke-width:1}.prob{opacity:.45}.predUp{fill:#39d98a}.predDown{fill:#ff6b6b}@media(max-width:1000px){.panes{grid-template-columns:1fr}}</style></head><body><div class="wrap"><h1>gann_swing regression diagnostic</h1><div class="muted" id="gen"></div><div id="root"></div></div><script>
const data = __DATA__;
const fmt=x=>Number.isFinite(+x)?(+x).toFixed(3):'—';
document.getElementById('gen').textContent='generated '+data.generated_at+' · self-contained local Guy view';
function mhtml(m){return `<div class="metrics"><span class="pill">macro_F1 ${fmt(m.macro_f1)}</span><span class="pill">acc ${fmt(m.accuracy)}</span><span class="pill">sticking ${fmt(m.sticking_rate)}</span><span class="pill">cm ${JSON.stringify(m.confusion_matrix||[])}</span></div>`}
function drawSvg(bot,paneName){const p=bot.panes[paneName], o=bot.ohlcv||[], f=bot.features||[], pred=p.predictions||[]; const W=720,H=430,ml=45,mr=12,top=20,ph=230,fh=95,ftop=295; if(o.length<2)return '<div class="skip">OHLCV unavailable</div>'; const minT=Math.min(...o.map(r=>Date.parse(r.t))), maxT=Math.max(...o.map(r=>Date.parse(r.t))); const hi=Math.max(...o.map(r=>+r.h)), lo=Math.min(...o.map(r=>+r.l)); const x=t=>ml+(Date.parse(t)-minT)/(maxT-minT)*(W-ml-mr); const y=v=>top+(hi-v)/(hi-lo||1)*ph; const vals=[]; f.forEach(r=>['gann_swing','gann_swing_age','gann_count'].forEach(k=>Number.isFinite(+r[k])&&vals.push(+r[k]))); const mn=vals.length?Math.min(...vals):0,mx=vals.length?Math.max(...vals):1; const yf=v=>ftop+fh-(v-mn)/(mx-mn||1)*fh; const bw=Math.max(1.5,Math.min(6,(W-ml-mr)/o.length*.55)); let s=`<svg viewBox="0 0 ${W} ${H}"><line class="axis" x1="${ml}" y1="${top+ph}" x2="${W-mr}" y2="${top+ph}"/><text x="4" y="${top+10}" fill="#9fb0d0">${fmt(hi)}</text><text x="4" y="${top+ph}" fill="#9fb0d0">${fmt(lo)}</text>`; o.forEach(r=>{let cx=x(r.t), up=+r.c>=+r.o, cls=up?'up':'down'; s+=`<line class="${cls}" x1="${cx}" y1="${y(r.h)}" x2="${cx}" y2="${y(r.l)}"/><rect class="${cls}" x="${cx-bw/2}" y="${Math.min(y(r.o),y(r.c))}" width="${bw}" height="${Math.max(1,Math.abs(y(r.o)-y(r.c)))}"/>`;}); pred.forEach(r=>{if(Number.isFinite(+r.probability_up)){const pp=Math.max(0,Math.min(1,+r.probability_up)); s+=`<rect class="prob" x="${x(r.t)-bw/2}" y="${top+ph+8}" width="${bw}" height="10" fill="rgb(${Math.round(255*pp)},${Math.round(255*(1-pp))},80)"/>`;} if(Number.isFinite(+r.predicted_class)){s+=`<circle class="${+r.predicted_class>0?'predUp':'predDown'}" cx="${x(r.t)}" cy="${top+ph+26}" r="2.7"/>`;}}); function poly(k,cls){const pts=f.filter(r=>Number.isFinite(+r[k])).map(r=>`${x(r.t)},${yf(r[k])}`).join(' '); if(pts)s+=`<polyline class="${cls}" points="${pts}"/>`;} s+=`<line class="axis" x1="${ml}" y1="${ftop+fh}" x2="${W-mr}" y2="${ftop+fh}"/><text x="4" y="${ftop+12}" fill="#9fb0d0">features</text>`; poly('gann_swing','line'); poly('gann_swing_age','age'); f.filter(r=>Number.isFinite(+r.gann_swing_change)&&+r.gann_swing_change!==0).forEach(r=>s+=`<circle cx="${x(r.t)}" cy="${yf(r.gann_swing||0)}" r="3" fill="#fbbf24"/>`); s+=`<text x="${ml}" y="${H-8}" fill="#9fb0d0">${new Date(minT).toISOString().slice(0,10)}</text><text x="${W-115}" y="${H-8}" fill="#9fb0d0">${new Date(maxT).toISOString().slice(0,10)}</text></svg>`; return s;}
function pane(bot,name){const p=bot.panes[name]; return `<div class="pane"><h3>${name}</h3>${mhtml(p.metrics||{})}<div class="muted">${p.prediction_status} · class_counts ${JSON.stringify(p.class_counts||{})}</div>${p.prediction_status==='ok'?drawSvg(bot,name):'<div class="skip">'+p.prediction_status+'</div>'}</div>`}
document.getElementById('root').innerHTML=data.bots.map(b=>`<section class="bot"><h2>${b.bot_id}</h2><div class="muted">${b.symbol} ${b.timeframe} · audit macro_F1 snapshot ${b.audit_macro_f1.snapshot} → active ${b.audit_macro_f1.active} (${b.audit_macro_f1.delta})</div><div class="finding">${b.qualitative_finding}</div>${b.skips&&b.skips.length?'<div class="skip">skips: '+b.skips.join('\n')+'</div>':''}<div class="panes">${pane(b,'snapshot')}${pane(b,'active')}</div></section>`).join('');
</script></body></html>'''
(HERE/'index.html').write_text(html_doc.replace('__DATA__', json.dumps(payload, allow_nan=False)))
summary='\n'.join([f'- {b}: {q}' for b,q in findings])
(HERE/'summary.md').write_text(f"# gann_swing regression diagnostic\n\nGenerated: {payload['generated_at']}\n\n{summary}\n")
print(f'Wrote {HERE}/index.html')
