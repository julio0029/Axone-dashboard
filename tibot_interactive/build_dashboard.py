#!/usr/bin/env python3
"""Build read-only Tibot interactive dashboard artifacts for Guy.
Writes only under axone_dashboard/tibot_interactive directory.

Changes 2026-06-12:
  - GUY_OUT fixed to write inside axone_dashboard/tibot_interactive/
  - gann_swing feature overlay added (gann_features key in chart JSON)
  - predict_proba added for classifiers (probability_up in layers)
  - Fallback: gann_swing.pkl used for inference when classifier pkl lacks model features
"""
from __future__ import annotations
import json, math, re, hashlib, traceback
from datetime import datetime, timezone
from pathlib import Path
from statistics import mean

import pandas as pd

ROOT = Path('/Users/axone/.openclaw')
GUY_OUT = ROOT/'agents/guy/workspace/WEB_DASHBOARD/axone_dashboard/tibot_interactive'
DATA_OUT = GUY_OUT/'data'
TIBOT_BOTS = ROOT/'agents/tibot/workspace/BOTS'
HIST = ROOT/'workspace/DATA/historical'
ALLOWED_PREFIX = str(ROOT/'agents/guy/workspace')
MAX_ROWS = 1500

if not str(GUY_OUT).startswith(ALLOWED_PREFIX):
    raise SystemExit(f'unsafe output path: {GUY_OUT}')
DATA_OUT.mkdir(parents=True, exist_ok=True)

def jload(p: Path):
    try:
        return json.loads(p.read_text())
    except Exception as e:
        return {'__error__': str(e)}

def finite(v):
    try:
        if v is None: return None
        f=float(v)
        return f if math.isfinite(f) else None
    except Exception:
        return None

def rel(p):
    return str(p)

def safe_id(s):
    return re.sub(r'[^A-Za-z0-9_.-]+','_',s)[:220]

def metric_summary(m):
    keys = ['accuracy','precision','recall','f1','macro_f1','mae','rmse','r2','directional_accuracy','test_accuracy','test_f1','test_mae','test_rmse','best_score','sticking_rate']
    out = {}
    def walk(prefix, obj, depth=0):
        if depth>3 or len(out)>14: return
        if isinstance(obj, dict):
            for k,v in obj.items():
                lk=k.lower()
                if lk in keys and isinstance(v,(int,float)):
                    out[k]=finite(v)
                elif k == 'grid_search' and isinstance(v, dict) and isinstance(v.get('best_score'), (int,float)):
                    out['grid_best_score']=finite(v.get('best_score'))
                elif k in ('test','validation','holdout','metrics','scores'):
                    walk(k, v, depth+1)
        elif isinstance(obj, list):
            for v in obj[:3]: walk(prefix, v, depth+1)
    walk('', m)
    for k,v in m.items() if isinstance(m, dict) else []:
        if len(out)>=10: break
        if isinstance(v,(int,float)) and k not in out:
            out[k]=finite(v)
    return {k:v for k,v in out.items() if v is not None}

def avg_metrics(items):
    vals = {}
    for it in items:
        for k,v in it.get('metrics',{}).items():
            if isinstance(v,(int,float)) and math.isfinite(v):
                vals.setdefault(k,[]).append(float(v))
    return {k: round(mean(v),6) for k,v in vals.items() if v}

def normalize_ohlcv(df):
    cols = {c.lower().replace(' ','_'): c for c in df.columns}
    mapping = {}
    for need, alts in {
        'time':['timestamp','open_time','open_time_ms','date','datetime','Open time'.lower().replace(' ','_')],
        'open':['open'], 'high':['high'], 'low':['low'], 'close':['close'], 'volume':['volume']
    }.items():
        for a in alts:
            if a in cols:
                mapping[need]=cols[a]; break
    if not all(k in mapping for k in ['open','high','low','close','volume']):
        return None, 'OHLCV columns not found'
    time_col = mapping.get('time')
    out = pd.DataFrame()
    if time_col:
        s = df[time_col]
        if pd.api.types.is_numeric_dtype(s):
            out['t'] = pd.to_datetime(s, unit='ms', utc=True, errors='coerce')
        else:
            out['t'] = pd.to_datetime(s, utc=True, errors='coerce')
    else:
        out['t'] = pd.to_datetime(df.index, utc=True, errors='coerce')
    for k in ['open','high','low','close','volume']:
        out[k[0] if k!='volume' else 'v'] = pd.to_numeric(df[mapping[k]], errors='coerce')
    out = out.dropna(subset=['t','o','h','l','c']).sort_values('t')
    return out, None

def parse_time_series(s):
    if pd.api.types.is_numeric_dtype(s):
        return pd.to_datetime(s, unit='ms', utc=True, errors='coerce')
    return pd.to_datetime(s, utc=True, errors='coerce')

def rows(df):
    res=[]
    for r in df.to_dict(orient='records'):
        rr={}
        for k,v in r.items():
            if hasattr(v, 'isoformat'):
                rr[k]=v.isoformat()
            else:
                fv=finite(v)
                rr[k]=fv
        res.append(rr)
    return res

def load_gann_features(symbol, timeframe, tmin, tmax, blocked):
    """Load gann_swing feature columns from datasets_active gann_swing.pkl."""
    gann_candidates = [
        TIBOT_BOTS/'datasets_active'/f'{symbol}_{timeframe}_gann_swing.pkl',
        TIBOT_BOTS/'datasets_active'/f'{symbol}_{timeframe}_gann_swing_classifier.pkl',
        TIBOT_BOTS/'datasets_active'/f'{symbol}_{timeframe}_gann_swing_predictor.pkl',
        TIBOT_BOTS/'datasets'/f'{symbol}_{timeframe}_gann_swing_classifier.pkl',
        TIBOT_BOTS/'datasets'/f'{symbol}_{timeframe}_gann_swing_predictor.pkl',
    ]
    gann_path = next((p for p in gann_candidates if p.exists()), None)
    if not gann_path:
        return []
    try:
        gd = pd.read_pickle(gann_path)
        if 'timestamp' in gd.columns:
            gd_t = parse_time_series(gd['timestamp'])
        elif 'candle_close_time' in gd.columns:
            gd_t = parse_time_series(gd['candle_close_time'])
        else:
            gd_t = parse_time_series(pd.Series(gd.index, index=gd.index))
        gl = pd.DataFrame({'t': gd_t})
        for gcol in ['gann_swing', 'gann_swing_change', 'gann_count', 'gann_swing_age', 'close_rel_gann_change', 'gann_swing_top', 'gann_swing_bottom']:
            if gcol in gd.columns:
                gl[gcol] = pd.to_numeric(gd[gcol], errors='coerce')
        # Current datasets_active often do not carry sparse top/bottom columns. Derive best-effort markers
        # from swing-change candles and available high/low columns for read-only visual diagnostics.
        if 'gann_swing_top' not in gl.columns and 'high' in gd.columns and 'gann_swing_change' in gl.columns:
            swing_change = pd.to_numeric(gl['gann_swing_change'], errors='coerce')
            gl['gann_swing_top'] = pd.to_numeric(gd['high'], errors='coerce').where(swing_change < 0)
        if 'gann_swing_bottom' not in gl.columns and 'low' in gd.columns and 'gann_swing_change' in gl.columns:
            swing_change = pd.to_numeric(gl['gann_swing_change'], errors='coerce')
            gl['gann_swing_bottom'] = pd.to_numeric(gd['low'], errors='coerce').where(swing_change > 0)
        gl = gl.dropna(subset=['t']).sort_values('t')
        gl = gl[(gl['t'] >= tmin) & (gl['t'] <= tmax)]
        if len(gl) > MAX_ROWS:
            gl = gl.tail(MAX_ROWS)
        return rows(gl)
    except Exception as e:
        blocked.append(f'gann_swing features unavailable: {e}')
        return []

def load_chart(bot_id, manifest, metrics, feature_schema, blocked):
    symbol = manifest.get('symbol')
    timeframe = manifest.get('timeframe')
    target = manifest.get('target') or metrics.get('target')
    sources = {}
    if not symbol or not timeframe or symbol == 'GENERAL' or timeframe == 'GENERAL':
        blocked.append('Specific symbol/timeframe unavailable for chart (GENERAL bot or malformed manifest).')
        return None, sources
    hist_path = HIST/f'{symbol}_{timeframe}_monthly.pkl'
    dataset_src = metrics.get('dataset') or manifest.get('feature_schema_source_path') or ''
    dataset_path = Path(dataset_src).with_suffix('.pkl') if dataset_src else Path('__missing_dataset__.pkl')
    if not dataset_path.exists():
        fam = manifest.get('family')
        cat = manifest.get('category')
        suffix = f'{fam}_predictor' if cat == 'prediction' else f'{fam}_classifier'
        for base in [TIBOT_BOTS/'datasets_active', TIBOT_BOTS/'datasets']:
            cand = base/f'{symbol}_{timeframe}_{suffix}.pkl'
            if cand.exists(): dataset_path = cand; break
    sources['historical_ohlcv'] = rel(hist_path) if hist_path.exists() else None
    sources['training_dataset'] = rel(dataset_path) if dataset_path.exists() else None
    if not hist_path.exists(): blocked.append(f'Raw OHLCV missing: {hist_path}')
    if not dataset_path.exists(): blocked.append(f'Training dataset missing: {dataset_path}')
    if not hist_path.exists() or not dataset_path.exists():
        return None, sources
    try:
        h = pd.read_pickle(hist_path)
        ohlcv, err = normalize_ohlcv(h)
        if err: blocked.append(err); return None, sources
        d = pd.read_pickle(dataset_path)
    except Exception as e:
        blocked.append(f'Failed loading chart sources: {e}')
        return None, sources
    if 'timestamp' in d.columns:
        dt = parse_time_series(d['timestamp'])
    elif 'candle_close_time' in d.columns:
        dt = parse_time_series(d['candle_close_time'])
    else:
        dt = parse_time_series(pd.Series(d.index, index=d.index))
    layer = pd.DataFrame({'t': dt})
    if 'target' in d.columns:
        layer['target'] = pd.to_numeric(d['target'], errors='coerce')
    elif target and target in d.columns:
        layer['target'] = pd.to_numeric(d[target], errors='coerce')
    else:
        blocked.append('Training output layer/target column unavailable in dataset.')
    pred_status = 'unavailable'
    model_path = Path(manifest.get('package_artifact_path') or '')
    # Try model.joblib then model.keras in the bot dir
    bot_dir = TIBOT_BOTS/bot_id
    if not model_path.exists() and bot_dir.is_dir():
        for mname in ['model.joblib', 'model.keras']:
            cand = bot_dir/mname
            if cand.exists(): model_path = cand; break
    sources['model_artifact'] = rel(model_path) if model_path.exists() else None
    features = feature_schema.get('features') if isinstance(feature_schema, dict) else None
    if model_path.exists() and features:
        try:
            if model_path.suffix == '.joblib':
                import joblib as _jl
                model_obj = _jl.load(model_path)
            else:
                import keras as _k
                model_obj = _k.models.load_model(model_path)
            if isinstance(model_obj, dict):
                model = model_obj.get('model') if isinstance(model_obj.get('model'), object) and hasattr(model_obj.get('model'), 'predict') else model_obj
                model_features = model_obj.get('features') if isinstance(model_obj.get('features'), list) else features
            else:
                model = model_obj
                model_features = features

            # For keras or sklearn, resolve features from model_features
            # If model_features not present in d, try gann_swing.pkl fallback
            missing_in_d = [f for f in model_features if f not in d.columns]
            gann_ds = TIBOT_BOTS/'datasets_active'/f'{symbol}_{timeframe}_gann_swing.pkl'
            if missing_in_d and gann_ds.exists():
                try:
                    gd = pd.read_pickle(gann_ds)
                    still_missing = [f for f in model_features if f not in gd.columns]
                    if len(still_missing) < len(missing_in_d):
                        d = gd
                        if 'timestamp' in d.columns:
                            dt2 = parse_time_series(d['timestamp'])
                        elif 'candle_close_time' in d.columns:
                            dt2 = parse_time_series(d['candle_close_time'])
                        else:
                            dt2 = parse_time_series(pd.Series(d.index, index=d.index))
                        layer = pd.DataFrame({'t': dt2})
                        if 'target' in d.columns:
                            layer['target'] = pd.to_numeric(d['target'], errors='coerce')
                        missing_in_d = [f for f in model_features if f not in d.columns]
                        sources['inference_dataset_fallback'] = rel(gann_ds)
                except Exception:
                    pass

            if missing_in_d:
                blocked.append(f'Prediction blocked: {len(missing_in_d)} feature columns missing; first={missing_in_d[:5]}')
            elif not hasattr(model, 'predict'):
                blocked.append(f'Prediction unavailable: model has no predict() ({type(model).__name__}).')
            else:
                X = d[model_features].replace([float('inf'), float('-inf')], pd.NA)
                yhat = model.predict(X)
                layer['prediction'] = pd.to_numeric(pd.Series(yhat, index=d.index if hasattr(d,'index') else None), errors='coerce')
                pred_status = 'derived_from_model_predict'
                # For classifiers: also get probability_up via predict_proba
                if hasattr(model, 'predict_proba'):
                    try:
                        proba = model.predict_proba(X)
                        classes = list(model.classes_) if hasattr(model, 'classes_') else None
                        if classes and proba.shape[1] == len(classes):
                            # probability_up = prob of class 1 (or 1.0 or positive class)
                            up_idx = None
                            for idx, cls in enumerate(classes):
                                try:
                                    if float(cls) == 1.0:
                                        up_idx = idx; break
                                except Exception:
                                    pass
                            if up_idx is not None:
                                layer['probability_up'] = pd.to_numeric(pd.Series(proba[:, up_idx], index=d.index if hasattr(d,'index') else None), errors='coerce')
                        elif proba.shape[1] == 2:
                            layer['probability_up'] = pd.to_numeric(pd.Series(proba[:, 1], index=d.index if hasattr(d,'index') else None), errors='coerce')
                        pred_status = 'derived_from_model_predict_proba'
                    except Exception as ep:
                        blocked.append(f'predict_proba unavailable: {ep}')
        except Exception as e:
            blocked.append(f'Prediction unavailable: {type(e).__name__}: {e}')
    else:
        blocked.append('Prediction unavailable: model artifact or feature schema missing.')
    layer = layer.dropna(subset=['t']).sort_values('t')
    # Choose a common timestamp window instead of blindly tailing OHLCV. Some Chronos files extend
    # beyond Tibot datasets; using OHLCV tail alone can make targets/gann overlays appear empty.
    common_max = ohlcv['t'].max()
    if not layer.empty:
        common_max = min(common_max, layer['t'].max())
    ohlcv = ohlcv[ohlcv['t'] <= common_max].sort_values('t')
    if len(ohlcv) > MAX_ROWS:
        ohlcv = ohlcv.tail(MAX_ROWS)
    tmin, tmax = (ohlcv['t'].min(), ohlcv['t'].max())
    layer = layer[(layer['t'] >= tmin) & (layer['t'] <= tmax)]
    if len(layer) > MAX_ROWS:
        layer = layer.tail(MAX_ROWS)
    # Load gann_swing features overlay, filtered to the same OHLCV candle window.
    gann_features = load_gann_features(symbol, timeframe, tmin, tmax, blocked)
    chart = {
        'bot_id': bot_id, 'symbol': symbol, 'timeframe': timeframe,
        'family': manifest.get('family'), 'category': manifest.get('category'),
        'target_name': target or 'target',
        'prediction_status': pred_status,
        'ohlcv': rows(ohlcv),
        'layers': rows(layer),
        'gann_features': gann_features,
        'blocked': blocked[:],
        'sources': sources,
    }
    name = safe_id(bot_id)+'.json'
    (DATA_OUT/name).write_text(json.dumps(chart, indent=2, allow_nan=False))
    return 'data/'+name, sources

bots=[]; source_registry={'generated_at': datetime.now(timezone.utc).isoformat(), 'read_only_inputs': [], 'views': {}, 'notes': []}
for p in sorted(TIBOT_BOTS.iterdir()):
    if not p.is_dir() or not (p/'manifest.json').exists():
        continue
    manifest=jload(p/'manifest.json'); metrics=jload(p/'metrics.json') if (p/'metrics.json').exists() else {}; schema=jload(p/'feature_schema.json') if (p/'feature_schema.json').exists() else {}
    bot_id=manifest.get('bot_id') or p.name
    blocked=[]
    parts = bot_id.split('__')
    id_prefix = parts[0] if parts else ''
    cat = manifest.get('category') or id_prefix
    if id_prefix == 'classifier' or cat in ('classifier','classification') or bot_id.endswith('_classifier') or '_classifier__' in bot_id or bot_id.endswith('_detector') or '_detector__' in bot_id:
        ui_class = 'classification'
    elif id_prefix == 'prediction' or cat == 'prediction' or bot_id.endswith('_predictor') or '_predictor__' in bot_id:
        ui_class = 'prediction'
    else:
        ui_class = 'classification' if 'classifier' in bot_id else 'prediction' if 'predictor' in bot_id else 'unknown'
        blocked.append('Bot class could not be confidently normalized; inferred from bot_id.')
    raw_family = manifest.get('family') or (parts[1] if len(parts) > 1 else 'unknown')
    family = re.sub(r'_(predictor|classifier)$', '', str(raw_family))
    if isinstance(manifest, dict) and manifest.get('__error__'): blocked.append('Malformed manifest JSON: '+manifest['__error__'])
    if isinstance(metrics, dict) and metrics.get('__error__'): blocked.append('Malformed metrics JSON: '+metrics['__error__'])
    metrics_s = metric_summary(metrics if isinstance(metrics,dict) else {})
    chart_file, chart_sources = load_chart(bot_id, manifest if isinstance(manifest,dict) else {}, metrics if isinstance(metrics,dict) else {}, schema if isinstance(schema,dict) else {}, blocked)
    bot = {
        'bot_id': bot_id, 'class': ui_class, 'raw_category': cat, 'family': family,
        'symbol': manifest.get('symbol'), 'timeframe': manifest.get('timeframe'),
        'target': manifest.get('target'), 'framework': manifest.get('framework'),
        'registry_status': manifest.get('registry_status'), 'production_readiness': manifest.get('production_readiness'),
        'metrics': metrics_s, 'chart_file': chart_file, 'blocked': blocked,
        'sources': {
            'bot_dir': rel(p), 'manifest': rel(p/'manifest.json'),
            'metrics': rel(p/'metrics.json') if (p/'metrics.json').exists() else None,
            'feature_schema': rel(p/'feature_schema.json') if (p/'feature_schema.json').exists() else None,
            **chart_sources
        }
    }
    bots.append(bot)
    source_registry['views'][bot_id]=bot['sources']

classes={}
for b in bots:
    c=classes.setdefault(b['class'], {'class': b['class'], 'bot_count': 0, 'families': {}, 'metrics': {}, 'blocked_count': 0})
    c['bot_count'] += 1
    c['blocked_count'] += 1 if b['blocked'] else 0
    f=c['families'].setdefault(b['family'], {'family': b['family'], 'bot_count':0, 'symbols': set(), 'timeframes': set(), 'metrics': {}, 'blocked_count': 0, 'bots': []})
    f['bot_count'] += 1
    if b.get('symbol'): f['symbols'].add(b['symbol'])
    if b.get('timeframe'): f['timeframes'].add(b['timeframe'])
    f['blocked_count'] += 1 if b['blocked'] else 0
    f['bots'].append(b)
for c in classes.values():
    class_bots=[]
    for f in c['families'].values():
        f['metrics']=avg_metrics(f['bots'])
        f['symbols']=sorted(f['symbols']); f['timeframes']=sorted(f['timeframes'])
        class_bots.extend(f['bots'])
    c['metrics']=avg_metrics(class_bots)
    c['families'] = dict(sorted(c['families'].items()))

status={
    'generated_at': source_registry['generated_at'],
    'last_built': source_registry['generated_at'],
    'scope': 'Guy read-only derived dashboard; local artifact reads only; no upstream writes or external action calls.',
    'bot_count': len(bots),
    'gann_swing_overlay_available': True,
    'toggles': {
        'ohlcv': {'default': True, 'description': 'Raw OHLCV candlesticks'},
        'gannLabels': {'default': True, 'description': 'gann_swing class label markers and classifier prediction markers'},
        'gannLine': {'default': False, 'description': 'gann_swing step/line (-1/0/+1)'},
        'gannChange': {'default': False, 'description': 'gann_swing_change plus derived/explicit top-bottom markers'},
        'gannSecondary': {'default': False, 'description': 'gann_swing_age, gann_count, and close_rel_gann_change on overlay axis'},
        'target': {'default': False, 'description': 'Training output layer / target'},
        'prediction': {'default': False, 'description': 'Model prediction line'},
        'probability': {'default': False, 'description': 'probability_up heatmap row'},
        'localStorage_key': 'guy.tibot_interactive.overlay_toggles.v2',
    },
    'classes': {k:v for k,v in sorted(classes.items())},
    'blocked_or_unavailable': [
        {'bot_id': b['bot_id'], 'class': b['class'], 'family': b['family'], 'symbol': b.get('symbol'), 'timeframe': b.get('timeframe'), 'blocked': b['blocked']}
        for b in bots if b['blocked']
    ]
}
app_data={'generated_at': status['generated_at'], 'classes': status['classes']}
(GUY_OUT/'app_data.json').write_text(json.dumps(app_data, indent=2, allow_nan=False))
(GUY_OUT/'dashboard_status.json').write_text(json.dumps(status, indent=2, allow_nan=False))
(GUY_OUT/'source_registry.json').write_text(json.dumps(source_registry, indent=2, allow_nan=False))
print(f'Done. {len(bots)} bots. Output: {GUY_OUT}')
