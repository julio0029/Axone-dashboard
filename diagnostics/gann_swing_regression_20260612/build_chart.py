#!/usr/bin/env python3
"""
Rerun builder — uses Chronos augmented feature PKLs + Tibot frozen schemas.
Rerun: 2026-06-12. Operator-approved read-only visualisation rerun.

Writes ONLY under /Users/axone/.openclaw/agents/guy/workspace/.
"""
from __future__ import annotations
import json, math, traceback
from pathlib import Path
from datetime import datetime, timezone
from typing import Any
import numpy as np
import pandas as pd

ROOT     = Path('/Users/axone/.openclaw')
GUY      = ROOT / 'agents/guy/workspace'
HERE     = GUY  / 'DASHBOARDS/gann_swing_regression_diagnostic_20260612'
CACHE    = GUY  / 'DATA/gann_swing_diagnostic'
ACTIVE   = ROOT / 'agents/tibot/workspace/BOTS'
SNAP     = ROOT / 'agents/tibot/workspace/backups/BOTS_pre_corrected_retrain_20260611'
CHRONOS  = ROOT / 'agents/chronos/workspace/gann_swing_diagnostic_feature_rebuild_20260612'
SCHEMA_EXPORT = ROOT / 'agents/tibot/workspace/AUDITS/gann_swing_diagnostic_schema_export_20260612'
HIST     = ROOT / 'workspace/DATA/historical'

assert str(HERE).startswith(str(GUY))
assert str(CACHE).startswith(str(GUY))
HERE.mkdir(parents=True, exist_ok=True)
CACHE.mkdir(parents=True, exist_ok=True)

# (bot_id, snap_macro_f1, active_macro_f1, delta)
BOTS = [
    ('classifier__gann_swing_classifier__TRUMPUSDT__4h', 0.608, 0.319, -0.289),
    ('classifier__gann_swing_classifier__SUIUSDT__1h',   0.660, 0.382, -0.278),
    ('classifier__gann_swing_classifier__DOGEUSDT__5m',  0.619, 0.354, -0.264),
    ('classifier__gann_swing_classifier__BTCUSDT__1h',   0.639, 0.387, -0.252),
    ('classifier__gann_swing_classifier__SUIUSDT__4h',   0.627, 0.376, -0.251),
]

# ── helpers ──────────────────────────────────────────────────────────────────

def jload(p: Path) -> dict:
    try:
        return json.loads(p.read_text())
    except Exception:
        return {}

def finite(v):
    try:
        f = float(v)
        return f if math.isfinite(f) else None
    except Exception:
        return None

def rows(df: pd.DataFrame) -> list[dict]:
    out = []
    for r in df.to_dict('records'):
        rr = {}
        for k, v in r.items():
            if hasattr(v, 'isoformat'):
                rr[k] = v.isoformat()
            else:
                rr[k] = finite(v)
        out.append(rr)
    return out

def ts_col(df: pd.DataFrame) -> pd.Series:
    for c in ('timestamp', 'candle_close_time'):
        if c in df.columns:
            return pd.to_datetime(df[c], utc=True, errors='coerce')
    return pd.to_datetime(df.index, utc=True, errors='coerce')

def metric_pack(base: Path, bot: str) -> dict:
    m    = jload(base / bot / 'metrics.json')
    test = m.get('test', {}) if isinstance(m.get('test'), dict) else m
    return {
        'macro_f1':        finite(test.get('macro_f1')       or m.get('macro_f1')),
        'accuracy':        finite(test.get('accuracy')        or m.get('accuracy')),
        'sticking_rate':   finite(test.get('sticking_rate')   or m.get('sticking_rate')),
        'confusion_matrix': test.get('confusion_matrix')      or m.get('confusion_matrix'),
        'labels':           test.get('labels')                 or m.get('labels'),
    }

def normalize_ohlcv(df: pd.DataFrame) -> pd.DataFrame:
    cols = {c.lower().replace(' ', '_'): c for c in df.columns}
    def pick(*names):
        for n in names:
            if n in cols: return cols[n]
        return None
    tc = pick('timestamp', 'open_time', 'close_time', 'date', 'datetime')
    oc = pick('open')
    hc = pick('high')
    lc = pick('low')
    cc = pick('close')
    vc = pick('volume')
    if not tc and 'Close time' in df.columns: tc = 'Close time'
    if not all([oc, hc, lc, cc]):
        oc, hc, lc, cc, vc = 'Open', 'High', 'Low', 'Close', 'Volume'
    out = pd.DataFrame()
    s   = df[tc] if tc else pd.Series(df.index, index=df.index)
    out['t'] = pd.to_datetime(s, unit='ms' if pd.api.types.is_numeric_dtype(s) else None, utc=True, errors='coerce')
    for dst, src in [('o', oc), ('h', hc), ('l', lc), ('c', cc), ('v', vc)]:
        out[dst] = pd.to_numeric(df[src], errors='coerce') if src and src in df.columns else None
    return out.dropna(subset=['t', 'o', 'h', 'l', 'c']).sort_values('t')


# ── inference functions ───────────────────────────────────────────────────────

def run_joblib(model_path: Path, feature_schema_path: Path | None,
               df: pd.DataFrame, label: str) -> tuple[pd.DataFrame | None, str]:
    """Run a joblib model (handles both plain Pipeline and wrapped dict)."""
    try:
        import joblib
        obj    = joblib.load(model_path)
        model  = obj['model']   if isinstance(obj, dict) else obj
        feats  = obj.get('features') if isinstance(obj, dict) else None
        tuned  = obj.get('tuned_threshold') if isinstance(obj, dict) else None
        classes = obj.get('classes_') if isinstance(obj, dict) else getattr(model, 'classes_', None)

        if feats is None and feature_schema_path:
            feats = jload(feature_schema_path).get('features')
        if not feats:
            return None, 'no feature list available'

        missing = [f for f in feats if f not in df.columns]
        if missing:
            return None, f'{len(missing)} features missing; first={missing[:8]}'

        X = df[feats].replace([float('inf'), float('-inf')], pd.NA)

        if hasattr(model, 'predict_proba'):
            proba  = model.predict_proba(X)
            # resolve "up" class index: classes are [0.0,1.0] for snapshot, [-1.0,1.0] for active
            c_list = [float(c) for c in (classes or [])]
            up_idx = None
            for i, c in enumerate(c_list):
                if c == 1.0: up_idx = i; break
            if up_idx is None and proba.shape[1] >= 2: up_idx = 1
            prob_up = pd.Series(proba[:, up_idx]) if up_idx is not None else pd.Series([0.5]*len(df))

            thresh = float(tuned) if tuned is not None else 0.5
            # Map to classes: snapshot uses [0,1], active uses [-1,1]
            if c_list and -1.0 in c_list:
                pred = (prob_up >= thresh).map({True: 1.0, False: -1.0})
            else:
                pred = (prob_up >= thresh).map({True: 1.0, False: 0.0})
        else:
            pred    = pd.Series(list(model.predict(X)), dtype=float)
            prob_up = pd.Series([float('nan')] * len(df))

        t = ts_col(df)
        out = pd.DataFrame({'t': list(t), 'predicted_class': list(pred), 'probability_up': list(prob_up)})
        return out, 'ok'
    except Exception as e:
        return None, f'{type(e).__name__}: {e}\n{traceback.format_exc()}'


def run_keras_btc_snapshot(df: pd.DataFrame) -> tuple[pd.DataFrame | None, str]:
    """BTC 1h snapshot: 175-col frozen schema + matching scaler from MODELS_RETRAINED."""
    try:
        import keras, joblib
        frozen_schema_path = SCHEMA_EXPORT / 'BTCUSDT_1h_frozen_175_feature_schema.json'
        schema = jload(frozen_schema_path)
        feats  = schema.get('features', [])
        if len(feats) != 175:
            return None, f'frozen schema has {len(feats)} features, expected 175'

        scaler_path = Path(schema['preprocessing']['scaler_path'])
        if not scaler_path.exists():
            return None, f'scaler not found: {scaler_path}'

        model_path = SNAP / 'classifier__gann_swing_classifier__BTCUSDT__1h/model.keras'
        if not model_path.exists():
            return None, f'snapshot keras model missing: {model_path}'

        missing = [f for f in feats if f not in df.columns]
        if missing:
            return None, f'{len(missing)} frozen features missing from augmented PKL; first={missing[:8]}'

        X = df[feats].replace([float('inf'), float('-inf')], np.nan).fillna(0).astype('float32')
        scaler = joblib.load(scaler_path)
        X = scaler.transform(X).astype('float32')

        model = keras.models.load_model(model_path, compile=False)
        y     = model.predict(X, verbose=0)
        if y.ndim > 1 and y.shape[-1] > 1:
            prob = pd.Series(y[:, 1].astype(float))
        elif y.ndim > 1:
            prob = pd.Series(y.reshape(-1).astype(float))
        else:
            prob = pd.Series(y.astype(float))

        pred = (prob >= 0.5).map({True: 1.0, False: -1.0})
        t    = ts_col(df)
        return pd.DataFrame({'t': list(t), 'predicted_class': list(pred), 'probability_up': list(prob)}), 'ok'
    except Exception as e:
        return None, f'{type(e).__name__}: {e}\n{traceback.format_exc()}'


def run_keras_btc_active(df: pd.DataFrame) -> tuple[pd.DataFrame | None, str]:
    """BTC 1h active: 197-col schema + scaler from BOTS/."""
    try:
        import keras, joblib
        schema_path = SCHEMA_EXPORT / 'classifier__gann_swing_classifier__BTCUSDT__1h.schema.json'
        schema = jload(schema_path)
        feats  = schema['schemas']['active']['features']
        if len(feats) != 197:
            return None, f'active schema has {len(feats)} features, expected 197'

        scaler_path = ACTIVE / 'classifier__gann_swing_classifier__BTCUSDT__1h/scaler.joblib'
        model_path  = ACTIVE / 'classifier__gann_swing_classifier__BTCUSDT__1h/model.keras'
        if not model_path.exists():
            return None, f'active keras model missing: {model_path}'

        missing = [f for f in feats if f not in df.columns]
        if missing:
            return None, f'{len(missing)} active features missing from augmented PKL; first={missing[:8]}'

        X = df[feats].replace([float('inf'), float('-inf')], np.nan).fillna(0).astype('float32')
        if scaler_path.exists():
            scaler = joblib.load(scaler_path)
            X = scaler.transform(X).astype('float32')

        model = keras.models.load_model(model_path, compile=False)
        y     = model.predict(X, verbose=0)
        if y.ndim > 1 and y.shape[-1] > 1:
            prob = pd.Series(y[:, 1].astype(float))
        elif y.ndim > 1:
            prob = pd.Series(y.reshape(-1).astype(float))
        else:
            prob = pd.Series(y.astype(float))

        pred = (prob >= 0.5).map({True: 1.0, False: -1.0})
        t    = ts_col(df)
        return pd.DataFrame({'t': list(t), 'predicted_class': list(pred), 'probability_up': list(prob)}), 'ok'
    except Exception as e:
        return None, f'{type(e).__name__}: {e}\n{traceback.format_exc()}'


# ── main build loop ───────────────────────────────────────────────────────────

CHRONOS_PKLS = {
    'classifier__gann_swing_classifier__TRUMPUSDT__4h':
        CHRONOS / 'TRUMPUSDT_4h/TRUMPUSDT_4h_gann_swing_classifier_active_augmented_features.pkl',
    'classifier__gann_swing_classifier__SUIUSDT__1h':
        CHRONOS / 'SUIUSDT_1h/SUIUSDT_1h_gann_swing_classifier_active_augmented_features.pkl',
    'classifier__gann_swing_classifier__DOGEUSDT__5m':
        CHRONOS / 'DOGEUSDT_5m/DOGEUSDT_5m_gann_swing_classifier_active_augmented_features.pkl',
    'classifier__gann_swing_classifier__SUIUSDT__4h':
        CHRONOS / 'SUIUSDT_4h/SUIUSDT_4h_gann_swing_classifier_active_augmented_features.pkl',
    'classifier__gann_swing_classifier__BTCUSDT__1h':
        CHRONOS / 'BTCUSDT_1h/BTCUSDT_1h_gann_swing_classifier_active_augmented_features.pkl',
}

payload = {
    'generated_at': datetime.now(timezone.utc).isoformat(),
    'rerun': True,
    'rerun_reason': 'Chronos augmented feature PKLs + Tibot frozen schema export',
    'bots': [],
    'notes': [
        'Active inference uses Chronos augmented feature PKLs with all 187/197 expected columns.',
        'BTC 1h snapshot uses 175-col frozen schema + matching scaler from MODELS_RETRAINED.',
        'Non-BTC snapshot uses per-bot feature list embedded in snapshot model.joblib dict.',
        'Non-BTC active uses per-bot feature list embedded in active model.joblib dict.',
    ],
}

findings = []

for bot, snap_f1, active_f1, delta in BOTS:
    parts = bot.split('__')
    sym, tf = parts[-2], parts[-1]
    is_btc  = (sym == 'BTCUSDT')
    pkl_path = CHRONOS_PKLS[bot]

    entry = {
        'bot_id': bot, 'symbol': sym, 'timeframe': tf,
        'audit_macro_f1': {'snapshot': snap_f1, 'active': active_f1, 'delta': delta},
        'panes': {}, 'skips': [], 'inputs': {},
    }

    if not pkl_path.exists():
        entry['skips'].append(f'Chronos augmented PKL missing: {pkl_path}')
        payload['bots'].append(entry)
        findings.append((bot, 'RENDER_FAILED: Chronos PKL missing'))
        continue

    df = pd.read_pickle(pkl_path).copy()
    df['t'] = ts_col(df)
    df = df.dropna(subset=['t']).sort_values('t')
    test_window = df.tail(min(500, len(df))).copy()

    entry['inputs']['chronos_pkl'] = str(pkl_path)
    entry['inputs']['rows_in_window'] = len(test_window)

    # OHLCV alignment
    hist_path = HIST / f'{sym}_{tf}_monthly.pkl'
    if hist_path.exists():
        o = normalize_ohlcv(pd.read_pickle(hist_path))
        o = o[(o['t'] >= test_window['t'].min()) & (o['t'] <= test_window['t'].max())].tail(len(test_window))
    else:
        o = pd.DataFrame({'t': test_window['t'], 'o': None, 'h': None, 'l': None, 'c': None, 'v': None})
        entry['skips'].append(f'OHLCV missing: {hist_path}')

    # Gann swing feature overlay
    features_df = pd.DataFrame({'t': test_window['t']})
    for c in ['gann_swing', 'gann_swing_change', 'gann_swing_age', 'gann_count',
              'close_rel_gann_change', 'target']:
        if c in test_window.columns:
            features_df[c] = pd.to_numeric(test_window[c], errors='coerce')

    # ── Snapshot inference ──
    snap_model_path = SNAP / bot / 'model.joblib'
    snap_schema_path = SCHEMA_EXPORT / f'{bot}.schema.json'

    if is_btc:
        snap_pred, snap_status = run_keras_btc_snapshot(test_window)
        entry['inputs']['snap_schema'] = str(SCHEMA_EXPORT / 'BTCUSDT_1h_frozen_175_feature_schema.json')
        entry['inputs']['snap_scaler'] = str(
            Path(jload(SCHEMA_EXPORT / 'BTCUSDT_1h_frozen_175_feature_schema.json')['preprocessing']['scaler_path'])
        )
        entry['inputs']['snap_model'] = str(SNAP / bot / 'model.keras')
    else:
        snap_pred, snap_status = run_joblib(snap_model_path, snap_schema_path, test_window, 'snapshot')
        entry['inputs']['snap_schema'] = str(snap_schema_path)
        entry['inputs']['snap_model']  = str(snap_model_path)

    snap_metrics  = metric_pack(SNAP, bot)
    cache_dir     = CACHE / bot
    cache_dir.mkdir(parents=True, exist_ok=True)

    if snap_pred is not None:
        snap_pred = snap_pred.dropna(subset=['t']).tail(len(test_window))
        snap_pred.to_csv(cache_dir / 'snapshot_predictions.csv', index=False)
        vc = snap_pred['predicted_class'].round(6).value_counts().to_dict() if 'predicted_class' in snap_pred else {}
        entry['panes']['snapshot'] = {
            'metrics': snap_metrics, 'prediction_status': 'ok',
            'predictions': rows(snap_pred),
            'class_counts': {str(k): int(v) for k, v in vc.items()},
        }
    else:
        (cache_dir / 'snapshot_predictions.csv').write_text('status\n' + snap_status + '\n')
        entry['panes']['snapshot'] = {
            'metrics': snap_metrics, 'prediction_status': 'skipped: ' + snap_status,
            'predictions': [], 'class_counts': {},
        }
        entry['skips'].append(f'snapshot: {snap_status[:200]}')

    # ── Active inference ──
    active_model_path = ACTIVE / bot / ('model.keras' if is_btc else 'model.joblib')
    active_schema_path = SCHEMA_EXPORT / f'{bot}.schema.json'

    if is_btc:
        act_pred, act_status = run_keras_btc_active(test_window)
        entry['inputs']['active_schema'] = str(active_schema_path)
        entry['inputs']['active_scaler'] = str(ACTIVE / bot / 'scaler.joblib')
        entry['inputs']['active_model']  = str(active_model_path)
    else:
        act_pred, act_status = run_joblib(active_model_path, active_schema_path, test_window, 'active')
        entry['inputs']['active_schema'] = str(active_schema_path)
        entry['inputs']['active_model']  = str(active_model_path)

    act_metrics = metric_pack(ACTIVE, bot)

    if act_pred is not None:
        act_pred = act_pred.dropna(subset=['t']).tail(len(test_window))
        act_pred.to_csv(cache_dir / 'active_predictions.csv', index=False)
        vc = act_pred['predicted_class'].round(6).value_counts().to_dict() if 'predicted_class' in act_pred else {}
        entry['panes']['active'] = {
            'metrics': act_metrics, 'prediction_status': 'ok',
            'predictions': rows(act_pred),
            'class_counts': {str(k): int(v) for k, v in vc.items()},
        }
    else:
        (cache_dir / 'active_predictions.csv').write_text('status\n' + act_status + '\n')
        entry['panes']['active'] = {
            'metrics': act_metrics, 'prediction_status': 'skipped: ' + act_status,
            'predictions': [], 'class_counts': {},
        }
        entry['skips'].append(f'active: {act_status[:200]}')

    entry['ohlcv']    = rows(o)
    entry['features'] = rows(features_df)

    # ── Qualitative finding ──
    snap_ok   = entry['panes']['snapshot']['prediction_status'] == 'ok'
    active_ok = entry['panes']['active']['prediction_status']   == 'ok'

    if snap_ok and active_ok:
        sp = entry['panes']['snapshot']['predictions']
        ap = entry['panes']['active']['predictions']
        n  = min(len(sp), len(ap))
        disagree = sum(
            1 for i in range(n)
            if finite(sp[i].get('predicted_class')) != finite(ap[i].get('predicted_class'))
        )
        q = (f'Both snapshot and active predictions generated (augmented Chronos PKLs). '
             f'Disagreement {disagree}/{n} ({(disagree/n*100 if n else 0):.1f}%). '
             f'Snapshot class counts: {entry["panes"]["snapshot"]["class_counts"]}. '
             f'Active class counts: {entry["panes"]["active"]["class_counts"]}.')
    elif snap_ok and not active_ok:
        q = (f'Snapshot OK; active skipped: {act_status[:120]}. '
             f'Snapshot class counts: {entry["panes"]["snapshot"]["class_counts"]}.')
    elif not snap_ok and active_ok:
        q = (f'Active OK; snapshot skipped: {snap_status[:120]}. '
             f'Active class counts: {entry["panes"]["active"]["class_counts"]}.')
    else:
        q = f'Both skipped. Snapshot: {snap_status[:120]}. Active: {act_status[:120]}.'

    entry['qualitative_finding'] = q
    findings.append((bot, snap_ok, active_ok, entry))
    payload['bots'].append(entry)

# ── write app_data.json ───────────────────────────────────────────────────────
(HERE / 'app_data.json').write_text(json.dumps(payload, indent=2, allow_nan=False))

# ── write index.html — self-contained ────────────────────────────────────────
html_src = r'''<!doctype html><html><head><meta charset="utf-8"><title>gann_swing regression diagnostic — rerun 2026-06-12</title><style>
body{margin:0;background:#0b1020;color:#e9eefc;font:13px/1.4 system-ui,Segoe UI,Arial}
.wrap{max-width:1500px;margin:0 auto;padding:22px}
h1{margin:0 0 6px}.muted{color:#9fb0d0}
.rerun-badge{display:inline-block;background:#1a3a1a;color:#39d98a;border:1px solid #39d98a;border-radius:6px;padding:3px 8px;font-size:11px;margin:0 8px}
.bot{border:1px solid #2b3a62;background:#111a31;border-radius:16px;padding:16px;margin:18px 0}
.panes{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pane{border:1px solid #2b3a62;background:#07101f;border-radius:12px;padding:10px}
.metrics{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.pill{border:1px solid #33456f;border-radius:999px;padding:4px 8px;color:#cfe2ff;background:#0b1224}
.skip{color:#ffd8df;background:#23121b;border:1px solid #5a2b35;border-radius:10px;padding:8px;white-space:pre-wrap}
.finding{color:#d7ffe4;background:#102016;border:1px solid #255d3a;border-radius:10px;padding:8px;margin:8px 0}
svg{width:100%;height:430px;background:#06101f;border-radius:8px}
.axis{stroke:#33456f}.up{fill:#39d98a;stroke:#39d98a}.down{fill:#ff6b6b;stroke:#ff6b6b}
.line{fill:none;stroke:#fbbf24;stroke-width:1.3}.age{fill:none;stroke:#22d3ee;stroke-width:1}
.prob{opacity:.45}.predUp{fill:#39d98a}.predDown{fill:#ff6b6b}
.disagree-marker{fill:none;stroke:#ff9900;stroke-width:1.5;stroke-dasharray:3,2}
@media(max-width:1000px){.panes{grid-template-columns:1fr}}
</style></head><body>
<div class="wrap">
<h1>gann_swing regression diagnostic <span class="rerun-badge">RERUN: Chronos augmented features</span></h1>
<div class="muted" id="gen"></div>
<div id="root"></div>
</div>
<script>
const data=__DATA__;
const fmt=x=>Number.isFinite(+x)?(+x).toFixed(3):'—';
document.getElementById('gen').textContent='generated '+data.generated_at+' · '+data.rerun_reason;
function mhtml(m){
  if(!m||Object.keys(m).length===0)return '<div class="muted">metrics unavailable</div>';
  const cm=m.confusion_matrix;
  const cmStr=cm?JSON.stringify(cm):'—';
  return '<div class="metrics"><span class="pill">macro_F1 '+fmt(m.macro_f1)+'</span><span class="pill">acc '+fmt(m.accuracy)+'</span><span class="pill">sticking '+fmt(m.sticking_rate)+'</span><span class="pill">cm '+cmStr+'</span></div>';
}
function drawSvg(bot, paneName) {
  const p=bot.panes[paneName], o=bot.ohlcv||[], f=bot.features||[], pred=p.predictions||[];
  const otherPane=paneName==='snapshot'?'active':'snapshot';
  const otherPred=(bot.panes[otherPane]||{}).predictions||[];
  const W=720,H=430,ml=45,mr=12,top=20,ph=230,fh=95,ftop=295;
  if(o.length<2) return '<div class="skip">OHLCV unavailable</div>';
  const minT=Math.min(...o.map(r=>Date.parse(r.t))), maxT=Math.max(...o.map(r=>Date.parse(r.t)));
  const hi=Math.max(...o.map(r=>+r.h)), lo=Math.min(...o.map(r=>+r.l));
  const x=t=>ml+(Date.parse(t)-minT)/(maxT-minT)*(W-ml-mr);
  const y=v=>top+(hi-v)/(hi-lo||1)*ph;
  const vals=[]; f.forEach(r=>['gann_swing','gann_swing_age','gann_count'].forEach(k=>Number.isFinite(+r[k])&&vals.push(+r[k])));
  const mn=vals.length?Math.min(...vals):0, mx=vals.length?Math.max(...vals):1;
  const yf=v=>ftop+fh-(v-mn)/(mx-mn||1)*fh;
  const bw=Math.max(1.5,Math.min(6,(W-ml-mr)/o.length*.55));
  // Build a fast lookup from t → other pane's predicted class
  const otherMap={};
  otherPred.forEach(r=>{if(r.t)otherMap[r.t]=r.predicted_class;});
  let s=`<svg viewBox="0 0 ${W} ${H}"><line class="axis" x1="${ml}" y1="${top+ph}" x2="${W-mr}" y2="${top+ph}"/>`;
  s+=`<text x="4" y="${top+10}" fill="#9fb0d0">${fmt(hi)}</text><text x="4" y="${top+ph}" fill="#9fb0d0">${fmt(lo)}</text>`;
  o.forEach(r=>{let cx=x(r.t),up=+r.c>=+r.o,cls=up?'up':'down';s+=`<line class="${cls}" x1="${cx}" y1="${y(r.h)}" x2="${cx}" y2="${y(r.l)}"/><rect class="${cls}" x="${cx-bw/2}" y="${Math.min(y(r.o),y(r.c))}" width="${bw}" height="${Math.max(1,Math.abs(y(r.o)-y(r.c)))}"/>`;});
  pred.forEach(r=>{
    if(Number.isFinite(+r.probability_up)){const pp=Math.max(0,Math.min(1,+r.probability_up));s+=`<rect class="prob" x="${x(r.t)-bw/2}" y="${top+ph+8}" width="${bw}" height="10" fill="rgb(${Math.round(255*pp)},${Math.round(255*(1-pp))},80)"/>`;}
    if(Number.isFinite(+r.predicted_class)){s+=`<circle class="${+r.predicted_class>0?'predUp':'predDown'}" cx="${x(r.t)}" cy="${top+ph+26}" r="2.7"/>`;}
    // Disagree overlay: highlight candle top when models disagree
    const other=otherMap[r.t];
    if(Number.isFinite(+r.predicted_class)&&Number.isFinite(+other)&&+r.predicted_class!==+other){
      s+=`<rect class="disagree-marker" x="${x(r.t)-bw/2-1}" y="${top+1}" width="${bw+2}" height="${ph-2}"/>`;
    }
  });
  function poly(k,cls){const pts=f.filter(r=>Number.isFinite(+r[k])).map(r=>`${x(r.t)},${yf(r[k])}`).join(' ');if(pts)s+=`<polyline class="${cls}" points="${pts}"/>`;}
  s+=`<line class="axis" x1="${ml}" y1="${ftop+fh}" x2="${W-mr}" y2="${ftop+fh}"/><text x="4" y="${ftop+12}" fill="#9fb0d0">features</text>`;
  poly('gann_swing','line'); poly('gann_swing_age','age');
  f.filter(r=>Number.isFinite(+r.gann_swing_change)&&+r.gann_swing_change!==0).forEach(r=>s+=`<circle cx="${x(r.t)}" cy="${yf(r.gann_swing||0)}" r="3" fill="#fbbf24"/>`);
  s+=`<text x="${ml}" y="${H-8}" fill="#9fb0d0">${new Date(minT).toISOString().slice(0,10)}</text><text x="${W-115}" y="${H-8}" fill="#9fb0d0">${new Date(maxT).toISOString().slice(0,10)}</text></svg>`;
  return s;
}
function pane(bot,name){
  const p=bot.panes[name];
  return `<div class="pane"><h3>${name}</h3>${mhtml(p.metrics||{})}<div class="muted">${p.prediction_status} · class_counts ${JSON.stringify(p.class_counts||{})}</div>${p.prediction_status==='ok'?drawSvg(bot,name):'<div class="skip">'+p.prediction_status+'</div>'}</div>`;
}
document.getElementById('root').innerHTML=data.bots.map(b=>`
<section class="bot">
  <h2>${b.bot_id}</h2>
  <div class="muted">${b.symbol} ${b.timeframe} · audit macro_F1: snapshot ${b.audit_macro_f1.snapshot} → active ${b.audit_macro_f1.active} (${b.audit_macro_f1.delta})</div>
  <div class="finding">${b.qualitative_finding}</div>
  ${b.skips&&b.skips.length?'<div class="skip">skips:\n'+b.skips.join('\n')+'</div>':''}
  <div class="panes">${pane(b,'snapshot')}${pane(b,'active')}</div>
</section>`).join('');
</script></body></html>'''

(HERE / 'index.html').write_text(html_src.replace('__DATA__', json.dumps(payload, allow_nan=False)))

# ── summary printout for console ─────────────────────────────────────────────
print(f'Rerun complete. Written to {HERE}')
print()
for bot, snap_ok, active_ok, entry in findings:
    print(f'  {bot}:')
    print(f'    snapshot: {"OK" if snap_ok else "FAILED"}  active: {"OK" if active_ok else "FAILED"}')
    if entry.get('skips'):
        for s in entry['skips'][:3]:
            print(f'    skip: {s[:120]}')
    if snap_ok and active_ok:
        sp_cc = entry['panes']['snapshot']['class_counts']
        ac_cc = entry['panes']['active']['class_counts']
        print(f'    snap class counts: {sp_cc}')
        print(f'    active class counts: {ac_cc}')
