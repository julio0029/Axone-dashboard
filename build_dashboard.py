#!/usr/bin/env python3
"""Build a GitHub Pages-compatible, read-only Axone architecture dashboard.
Writes only inside Guy's WEB_DASHBOARD/axone_dashboard output directory.
"""
from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

OUT = Path('/Users/axone/.openclaw/agents/guy/workspace/WEB_DASHBOARD/axone_dashboard')
GUY_ROOT = Path('/Users/axone/.openclaw/agents/guy/workspace')
TIBOT_SRC = Path('/Users/axone/.openclaw/agents/guy/workspace/WEB_DASHBOARD/tibot_interactive')
TIBOT_DST = OUT / 'tibot_interactive'

AGENTS_DOC = Path('/Users/axone/.openclaw/workspace/AGENTS.md')
TOOLS_DOC = Path('/Users/axone/.openclaw/workspace/TOOLS.md')

AGENTS = [
    {
        'name': 'Axone', 'layer': 'Orchestration', 'owns': 'Routing, coordination, architecture guard, final aggregation',
        'consumes': 'User/operator requests, agent outputs, architecture docs',
        'emits': 'Validated dispatches, summaries, operator-facing answers',
        'boundaries': 'Does not code, fetch APIs, train, backtest, approve risk, or trade',
        'status': 'documented', 'accent': 'orchestration'
    },
    {
        'name': 'Spider', 'layer': 'External data / APIs', 'owns': 'Binance/web/HTTP fetches and raw external data retrieval',
        'consumes': 'External sources by request', 'emits': 'Raw data to Chronos, Karen, Darwin, Kerry as requested',
        'boundaries': 'No trade decisions; no bot/strategy/risk/live-store writes', 'status': 'documented', 'accent': 'data'
    },
    {
        'name': 'Chronos', 'layer': 'Historical engine', 'owns': 'Historical storage, replay, walk-forward validation, evidence ledgers',
        'consumes': 'Spider-fetched archives', 'emits': 'Evidence/metrics/ledgers to Sentinel, Wally, Tibot, Darwin, Guy',
        'boundaries': 'Never modifies live data; never trains bots; never creates strategies or approves trades', 'status': 'documented', 'accent': 'historical'
    },
    {
        'name': 'Kerry', 'layer': 'Live data layer', 'owns': 'DATA/live rolling feature-ready datasets, max 200 candles',
        'consumes': 'Spider live feeds', 'emits': 'Live features to Tibot, Wally, Sentinel',
        'boundaries': 'No historical writes, no bot training, no strategy creation', 'status': 'documented', 'accent': 'data'
    },
    {
        'name': 'Tibot', 'layer': 'Bot intelligence', 'owns': 'Prediction and classification bots; training/optimisation; bot registry',
        'consumes': 'Chronos historical datasets and Kerry live features',
        'emits': 'Probabilities, classes, expected return, confidence, validation metrics',
        'boundaries': 'Does not create strategies, emit trades, execute, or write historical/live data', 'status': 'interactive sub-dashboard available', 'accent': 'model'
    },
    {
        'name': 'Wally', 'layer': 'Strategy', 'owns': 'Strategy design/evaluation and open/hold/close/reduce proposals',
        'consumes': 'Tibot outputs only', 'emits': 'Trade proposals to Sentinel',
        'boundaries': 'No bot ownership/training; no execution; cannot bypass Sentinel; no risk-store writes', 'status': 'documented', 'accent': 'strategy'
    },
    {
        'name': 'Sentinel', 'layer': 'Risk authority', 'owns': 'Portfolio risk, gating, strategy ratings, paper/live execution path',
        'consumes': 'Wally proposals, Chronos evidence, Karen advisory context',
        'emits': 'Approve/reject/reduce/close decisions and rating updates',
        'boundaries': 'No bots or strategies; cannot enable paper/live without explicit operator approval', 'status': 'documented', 'accent': 'risk'
    },
    {
        'name': 'Darwin', 'layer': 'Research / evolution', 'owns': 'Symbol proposals, bot-family proposals, strategy mutations, advisory assessments',
        'consumes': 'Owner-produced evidence from Chronos/Tibot/Wally/Sentinel plus Spider external data',
        'emits': 'Advisory recommendations into the controlled chain',
        'boundaries': 'Never deploys directly; never writes bot/strategy/risk/historical/live stores', 'status': 'documented', 'accent': 'research'
    },
    {
        'name': 'Karen', 'layer': 'External intelligence', 'owns': 'Copy-trader/public-trader behaviour intel',
        'consumes': 'Spider external data', 'emits': 'Advisory context to Sentinel',
        'boundaries': 'No approval, blocking, sizing, veto, or direct fetching', 'status': 'documented', 'accent': 'intel'
    },
    {
        'name': 'Sublime', 'layer': 'Code / implementation', 'owns': 'Scripts, pipelines, ML implementation, debugging and tests',
        'consumes': 'Specs from owning agents', 'emits': 'Code, scripts, tests',
        'boundaries': 'Does not decide trading logic, strategy intent, or risk policy', 'status': 'documented', 'accent': 'code'
    },
    {
        'name': 'Conchita', 'layer': 'Maintenance / recovery', 'owns': 'System health, config, recovery, skills upkeep',
        'consumes': 'System state', 'emits': 'Maintenance reports and approved config patches',
        'boundaries': 'No trading logic/bot/strategy/risk changes without explicit operator approval', 'status': 'documented', 'accent': 'maintenance'
    },
    {
        'name': 'Glia', 'layer': 'Memory / token optimisation', 'owns': 'Memory compression, retrieval, summarisation',
        'consumes': 'Agent outputs and validated knowledge', 'emits': 'Compressed recall snippets and summaries',
        'boundaries': 'No trading logic/bot/strategy/risk changes; no silent drop of trading-relevant memory', 'status': 'documented', 'accent': 'memory'
    },
    {
        'name': 'Guy', 'layer': 'Read-only dashboard', 'owns': 'Static visualisation artifacts under Guy workspace',
        'consumes': 'Read-only architecture docs and approved dashboard/source artifacts',
        'emits': 'GitHub-hostable dashboards and summaries',
        'boundaries': 'No upstream writes, no trading, no API calls, no scheduler changes', 'status': 'this dashboard generated', 'accent': 'dashboard'
    },
]

FLOWS = [
    ['External', 'Spider', 'Raw archives / live feeds'],
    ['Spider', 'Chronos', 'Historical archives'],
    ['Spider', 'Kerry', 'Live feed snapshots'],
    ['Chronos', 'Tibot', 'Historical training/validation evidence'],
    ['Kerry', 'Tibot', 'Live features'],
    ['Tibot', 'Wally', 'Bot probabilities/classes/confidence'],
    ['Wally', 'Sentinel', 'Trade proposals only'],
    ['Chronos', 'Sentinel', 'Evidence for risk/gating'],
    ['Spider', 'Karen', 'External trader intel raw input'],
    ['Karen', 'Sentinel', 'Advisory context only'],
    ['Chronos', 'Darwin', 'Owner-produced evidence'],
    ['Tibot', 'Darwin', 'Read-only bot evidence'],
    ['Wally', 'Darwin', 'Read-only strategy evidence'],
    ['Sentinel', 'Darwin', 'Read-only risk/performance evidence'],
    ['Darwin', 'Chronos → Tibot/Wally → Sentinel', 'Advisory proposals only'],
    ['All agents', 'Glia', 'Summarisation candidates'],
    ['Any owning agent', 'Sublime', 'Implementation specs'],
    ['System state', 'Conchita', 'Maintenance checks'],
    ['Approved read-only sources', 'Guy', 'Static dashboards'],
]

LAYERS = [
    {'name': 'External intelligence/data', 'members': ['Spider', 'Karen'], 'note': 'Spider fetches; Karen analyses copy/public-trader behaviour for Sentinel only.'},
    {'name': 'Data engines', 'members': ['Chronos', 'Kerry'], 'note': 'Chronos owns historical evidence; Kerry owns rolling live features.'},
    {'name': 'Model intelligence', 'members': ['Tibot'], 'note': 'Tibot is sole owner of prediction/classification bots.'},
    {'name': 'Strategy', 'members': ['Wally'], 'note': 'Wally consumes Tibot outputs and emits proposals, never execution.'},
    {'name': 'Risk gate', 'members': ['Sentinel'], 'note': 'Sentinel is the only gate to paper/live execution and risk decisions.'},
    {'name': 'Research / evolution', 'members': ['Darwin'], 'note': 'Darwin is advisory and never deploys directly.'},
    {'name': 'Build / maintain / remember / view', 'members': ['Sublime', 'Conchita', 'Glia', 'Guy'], 'note': 'Support agents stay inside their ownership boundaries.'},
]


def load_json(path: Path):
    if not path.exists():
        return None
    with path.open() as f:
        return json.load(f)


def copy_tibot_dashboard():
    if TIBOT_DST.exists():
        shutil.rmtree(TIBOT_DST)
    if TIBOT_SRC.exists():
        ignore = shutil.ignore_patterns('__pycache__', '.DS_Store')
        shutil.copytree(TIBOT_SRC, TIBOT_DST, ignore=ignore)
        sanitize_tibot_browser_metadata()


REDACTIONS = [
    ('/Users/axone/.openclaw/agents/tibot/workspace/BOTS/', 'tibot-source://BOTS/'),
    ('/Users/axone/.openclaw/workspace/DATA/historical/', 'chronos-source://DATA/historical/'),
    ('/Users/axone/.openclaw/agents/guy/workspace/WEB_DASHBOARD/tibot_interactive/', 'guy-source://WEB_DASHBOARD/tibot_interactive/'),
    ('/Users/axone/.openclaw/agents/guy/workspace/WEB_DASHBOARD/axone_dashboard/', 'guy-source://WEB_DASHBOARD/axone_dashboard/'),
    ('/Users/axone/.openclaw/workspace/', 'workspace-source://'),
    ('/Users/axone/.openclaw/', 'openclaw-source://'),
    ('/Users/axone/', 'user-source://'),
]


def redact_local_paths(value):
    """Return browser-safe metadata without absolute local paths."""
    if isinstance(value, str):
        redacted = value
        for old, repl in REDACTIONS:
            redacted = redacted.replace(old, repl)
        return redacted
    if isinstance(value, list):
        return [redact_local_paths(v) for v in value]
    if isinstance(value, dict):
        return {k: redact_local_paths(v) for k, v in value.items()}
    return value


def sanitize_tibot_browser_metadata():
    """Keep Tibot dashboard metrics/charts, but remove absolute local paths from browser-facing files."""
    for path in TIBOT_DST.rglob('*'):
        if not path.is_file() or path.suffix.lower() not in {'.html', '.js', '.json', '.md'}:
            continue
        text = path.read_text(errors='ignore')
        new = redact_local_paths(text)
        if new != text:
            path.write_text(new)


def write_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=False) + '\n')


def main():
    if not str(OUT).startswith(str(GUY_ROOT)):
        raise RuntimeError(f'Refusing to write outside Guy workspace: {OUT}')
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'assets').mkdir(exist_ok=True)
    (OUT / 'data').mkdir(exist_ok=True)

    tibot_status = load_json(TIBOT_SRC / 'dashboard_status.json') or {}
    tibot_app = load_json(TIBOT_SRC / 'app_data.json') or {}
    tibot_exists = (TIBOT_SRC / 'index.html').exists()
    generated_at = datetime.now(timezone.utc).isoformat()

    copy_tibot_dashboard()

    architecture = {
        'generated_at': generated_at,
        'repository_target': 'julio0029/Axone-dashboard',
        'mode': 'static_github_pages_read_only',
        'status_policy': 'Statuses are documentation/artifact availability only; no live health checks are fabricated.',
        'agents': AGENTS,
        'layers': LAYERS,
        'flows': FLOWS,
        'approval_chains': [
            'New symbol: Darwin proposal → Chronos data availability → Kerry live-data feasibility → Tibot training feasibility → Wally strategy feasibility → Sentinel risk approval → Axone operator approval',
            'New bot family: Darwin/Tibot proposal → Chronos validation evidence → Tibot training & registry → Wally consumes → Sentinel ratings',
            'Strategy mutation: Darwin proposal → Wally evaluation → Sentinel rating & gate',
            'Trade: Wally proposal → Sentinel gate → explicit operator approval for paper/live only',
            'Risk-limit change: Sentinel proposal citing Chronos evidence → operator approval',
        ],
        'tibot_subdashboard': {
            'included': tibot_exists,
            'method': 'copied static directory and embedded via relative iframe plus direct relative link',
            'relative_path': 'tibot_interactive/index.html' if tibot_exists else None,
            'generated_at': tibot_status.get('generated_at') or tibot_app.get('generated_at') or 'unavailable',
            'bot_count': tibot_status.get('bot_count', 'unavailable'),
            'classes': {k: {'bot_count': v.get('bot_count')} for k, v in (tibot_status.get('classes') or {}).items() if isinstance(v, dict)},
        },
        'safety': {
            'external_api_calls': 'none',
            'backend_required': False,
            'relative_paths_only': True,
            'upstream_writes': 'none',
            'paper_live_trading': 'not present',
        },
    }
    write_json(OUT / 'data' / 'architecture.json', architecture)

    source_registry = redact_local_paths({
        'generated_at': generated_at,
        'purpose': 'Documents read-only source inputs used to build the Axone architecture dashboard. Local source paths are redacted for GitHub Pages/browser safety.',
        'read_only_inputs': [
            {'name': 'AGENTS.md', 'path': str(AGENTS_DOC), 'used_for': 'authoritative architecture, ownership, boundaries'},
            {'name': 'TOOLS.md', 'path': str(TOOLS_DOC), 'used_for': 'resource ownership and routing contracts'},
            {'name': 'Tibot interactive dashboard', 'path': str(TIBOT_SRC), 'used_for': 'sub-dashboard copy/link/embed'},
            {'name': 'Tibot dashboard status', 'path': str(TIBOT_SRC / 'dashboard_status.json'), 'used_for': 'artifact availability metrics'},
        ],
        'browser_runtime_paths': ['index.html', 'assets/styles.css', 'assets/app.js', 'data/architecture.json', 'dashboard_status.json', 'tibot_interactive/index.html'],
        'write_scope': str(OUT),
    })
    write_json(OUT / 'source_registry.json', source_registry)

    dashboard_status = {
        'generated_at': generated_at,
        'dashboard': 'Axone architecture dashboard',
        'repo_target': 'julio0029/Axone-dashboard',
        'artifact_status': 'generated',
        'live_system_status': 'unavailable_not_checked',
        'status_policy': 'No live status is fabricated; this static dashboard reports documented roles and local artifact availability only.',
        'tibot_subdashboard': architecture['tibot_subdashboard'],
        'checks_required': ['json_parse', 'python_compile', 'js_syntax', 'static_safety_scan', 'write_scope_scan'],
    }
    write_json(OUT / 'dashboard_status.json', dashboard_status)

    app_js = f"""'use strict';
const ARCHITECTURE = {json.dumps(architecture, indent=2)};

function el(tag, attrs = {{}}, children = []) {{
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {{
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  }}
  for (const child of children) node.append(child);
  return node;
}}

function renderAgents(filter = 'all') {{
  const grid = document.querySelector('[data-agent-grid]');
  grid.innerHTML = '';
  const q = document.querySelector('[data-search]').value.trim().toLowerCase();
  ARCHITECTURE.agents
    .filter(a => filter === 'all' || a.accent === filter)
    .filter(a => !q || JSON.stringify(a).toLowerCase().includes(q))
    .forEach(agent => {{
      grid.append(el('article', {{ class: `agent-card ${{agent.accent}}` }}, [
        el('div', {{ class: 'card-top' }}, [
          el('h3', {{ text: agent.name }}),
          el('span', {{ class: 'badge', text: agent.status }})
        ]),
        el('p', {{ class: 'layer', text: agent.layer }}),
        row('Owns', agent.owns), row('Inputs', agent.consumes), row('Outputs', agent.emits), row('Boundary', agent.boundaries)
      ]));
    }});
}}

function row(label, text) {{
  return el('div', {{ class: 'fact' }}, [el('strong', {{ text: label }}), el('span', {{ text }})]);
}}

function renderFlow() {{
  const flow = document.querySelector('[data-flow]');
  ARCHITECTURE.flows.forEach(([from, to, label]) => {{
    flow.append(el('div', {{ class: 'flow-row' }}, [
      el('span', {{ class: 'node', text: from }}), el('span', {{ class: 'arrow', text: '→' }}),
      el('span', {{ class: 'node', text: to }}), el('span', {{ class: 'flow-label', text: label }})
    ]));
  }});
}}

function renderLayers() {{
  const target = document.querySelector('[data-layers]');
  ARCHITECTURE.layers.forEach(layer => target.append(el('section', {{ class: 'layer-card' }}, [
    el('h3', {{ text: layer.name }}),
    el('p', {{ text: layer.note }}),
    el('div', {{ class: 'chips' }}, layer.members.map(m => el('span', {{ class: 'chip', text: m }})))
  ])));
}}

function renderChains() {{
  const list = document.querySelector('[data-chains]');
  ARCHITECTURE.approval_chains.forEach(chain => list.append(el('li', {{ text: chain }})));
}}

function initFilters() {{
  document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => {{
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderAgents(btn.dataset.filter);
  }}));
  document.querySelector('[data-search]').addEventListener('input', () => {{
    const active = document.querySelector('[data-filter].active');
    renderAgents(active ? active.dataset.filter : 'all');
  }});
}}

document.addEventListener('DOMContentLoaded', () => {{
  document.querySelector('[data-generated]').textContent = ARCHITECTURE.generated_at;
  document.querySelector('[data-tibot-count]').textContent = ARCHITECTURE.tibot_subdashboard.bot_count;
  document.querySelector('[data-tibot-generated]').textContent = ARCHITECTURE.tibot_subdashboard.generated_at;
  renderLayers(); renderFlow(); renderChains(); renderAgents(); initFilters();
}});
"""
    (OUT / 'assets' / 'app.js').write_text(app_js)

    css = """
:root{--bg:#07111f;--panel:#0d1a2f;--panel2:#11213a;--ink:#e8f1ff;--muted:#9ab0d0;--line:#243954;--cyan:#67e8f9;--violet:#a78bfa;--green:#7ee787;--amber:#f6c177;--red:#f97373}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 18% 0%,#17355f 0,#07111f 38%,#040912 100%);color:var(--ink);font:14px/1.55 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial}.wrap{max-width:1380px;margin:auto;padding:24px}.hero{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;align-items:stretch}.panel,.agent-card,.layer-card{border:1px solid var(--line);background:linear-gradient(180deg,rgba(17,33,58,.95),rgba(9,18,34,.96));border-radius:22px;padding:20px;box-shadow:0 18px 48px rgba(0,0,0,.22)}h1{font-size:clamp(32px,5vw,58px);line-height:1;margin:0 0 10px}h2{font-size:24px;margin:0 0 14px}h3{font-size:18px;margin:0}.muted,p{color:var(--muted)}a{color:var(--cyan);text-decoration:none}a:hover{text-decoration:underline}.nav{position:sticky;top:0;z-index:5;backdrop-filter:blur(14px);background:rgba(4,9,18,.78);border-bottom:1px solid var(--line)}.nav .wrap{display:flex;gap:14px;align-items:center;padding-top:10px;padding-bottom:10px}.brand{font-weight:800;color:var(--ink);margin-right:auto}.nav a{font-size:13px;color:var(--muted)}.kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:14px}.kpi{padding:14px;border:1px solid var(--line);border-radius:16px;background:#091629}.kpi strong{display:block;font-size:26px;color:var(--ink)}.section{margin-top:24px}.layer-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}.chips{display:flex;gap:8px;flex-wrap:wrap}.chip,.badge,.pill{display:inline-flex;border:1px solid var(--line);background:#0b1830;border-radius:999px;padding:5px 9px;color:var(--muted);font-size:12px}.filters{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.filters button,.open-btn{border:1px solid var(--line);background:#0b1830;color:var(--ink);padding:9px 12px;border-radius:999px;cursor:pointer}.filters button.active,.open-btn{border-color:var(--cyan);box-shadow:0 0 0 2px rgba(103,232,249,.12)}.search{width:100%;max-width:420px;background:#061225;color:var(--ink);border:1px solid var(--line);border-radius:12px;padding:11px 12px;margin-bottom:12px}.agent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:14px}.card-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.layer{margin:5px 0 12px;color:var(--cyan)}.fact{display:grid;grid-template-columns:82px 1fr;gap:10px;padding:8px 0;border-top:1px solid rgba(36,57,84,.6)}.fact strong{color:#c8d8ef}.orchestration{border-color:#7dd3fc}.data,.historical{border-color:#60a5fa}.model{border-color:#a78bfa}.strategy{border-color:#f6c177}.risk{border-color:#f97373}.research{border-color:#34d399}.intel{border-color:#f0abfc}.code,.maintenance,.memory,.dashboard{border-color:#93c5fd}.flow-box{display:grid;gap:9px}.flow-row{display:grid;grid-template-columns:minmax(110px,.8fr) 24px minmax(150px,1fr) 2fr;gap:10px;align-items:center;padding:10px;border:1px solid rgba(36,57,84,.75);border-radius:14px;background:#091629}.node{font-weight:750;color:var(--ink)}.arrow{color:var(--cyan);font-size:18px}.flow-label{color:var(--muted)}.chains li{margin:8px 0;color:var(--muted)}.tibot-frame{width:100%;height:760px;border:1px solid var(--line);border-radius:18px;background:#07111f}.warning{border-left:4px solid var(--amber);padding:12px 14px;background:rgba(246,193,119,.08);border-radius:12px;color:#f8dfb4}.footer{color:var(--muted);font-size:12px;margin:24px 0}@media(max-width:850px){.hero{grid-template-columns:1fr}.flow-row{grid-template-columns:1fr}.arrow{display:none}.nav .wrap{flex-wrap:wrap}.tibot-frame{height:620px}}
""".strip() + "\n"
    (OUT / 'assets' / 'styles.css').write_text(css)

    html = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Axone Dashboard · Read-only Architecture</title>
  <link rel="stylesheet" href="assets/styles.css" />
</head>
<body>
  <nav class="nav"><div class="wrap"><a class="brand" href="#top">Axone Dashboard</a><a href="#layers">Layers</a><a href="#flow">Flow</a><a href="#agents">Agents</a><a href="#tibot">Tibot</a><a href="source_registry.json">Sources</a><a href="dashboard_status.json">Status</a></div></nav>
  <main id="top" class="wrap">
    <section class="hero">
      <div class="panel">
        <span class="pill">GitHub Pages static artifact · target julio0029/Axone-dashboard</span>
        <h1>Axone architecture control map</h1>
        <p>Read-only landing page for the full Axone multi-agent trading/research architecture. This dashboard shows ownership, inputs, outputs, boundaries, approval chains, and the latest Guy-hosted Tibot interactive sub-dashboard.</p>
        <p class="warning">No live status is fabricated. Status labels here mean documented role or local artifact availability only.</p>
      </div>
      <aside class="panel">
        <h2>Artifact status</h2>
        <div class="kpis"><div class="kpi"><strong>13</strong><span>Architecture agents</span></div><div class="kpi"><strong data-tibot-count>—</strong><span>Tibot bots in sub-dashboard</span></div><div class="kpi"><strong>0</strong><span>Backend services/API calls</span></div><div class="kpi"><strong>RO</strong><span>Guy read-only scope</span></div></div>
        <p class="muted">Generated: <span data-generated>—</span><br/>Tibot artifact: <span data-tibot-generated>—</span></p>
      </aside>
    </section>

    <section id="layers" class="section panel"><h2>Architecture layers</h2><div class="layer-grid" data-layers></div></section>
    <section id="flow" class="section panel"><h2>Read-only graph / flow</h2><p>Direction shows allowed information flow, not execution authority.</p><div class="flow-box" data-flow></div></section>
    <section class="section panel"><h2>Approval chains and hard gates</h2><ul class="chains" data-chains></ul></section>

    <section id="agents" class="section panel">
      <h2>Agent cards</h2>
      <input class="search" data-search placeholder="Search agents, ownership, boundaries…" />
      <div class="filters"><button class="active" data-filter="all">All</button><button data-filter="data">Data</button><button data-filter="historical">Historical</button><button data-filter="model">Model</button><button data-filter="strategy">Strategy</button><button data-filter="risk">Risk</button><button data-filter="research">Research</button><button data-filter="dashboard">Dashboard</button></div>
      <div class="agent-grid" data-agent-grid></div>
    </section>

    <section id="tibot" class="section panel">
      <h2>Tibot interactive sub-dashboard</h2>
      <p>Included by copying the latest Guy-owned Tibot static dashboard into <code>tibot_interactive/</code> and embedding it with a relative iframe. Data files and browser-side interactivity are preserved.</p>
      <p><a class="open-btn" href="tibot_interactive/index.html">Open Tibot dashboard directly</a></p>
      <iframe class="tibot-frame" src="tibot_interactive/index.html" title="Tibot interactive bot explorer"></iframe>
    </section>
    <p class="footer">Static dashboard only. No scheduler, broker/API, paper/live trading, retraining, replay, optimisation, or upstream writes.</p>
  </main>
  <script src="assets/app.js"></script>
</body>
</html>
"""
    (OUT / 'index.html').write_text(html)

    summary = f"""# Axone Architecture Dashboard

Generated: {generated_at}

Output directory: `WEB_DASHBOARD/axone_dashboard/` inside Guy workspace.

## Contents
- `index.html` — GitHub Pages-compatible landing page for Axone architecture.
- `assets/styles.css` — local styling, no external assets.
- `assets/app.js` — local browser interactivity for filters/search/graph rendering.
- `data/architecture.json` — browser-safe architecture data using relative/runtime-safe metadata.
- `dashboard_status.json` — artifact status; no fabricated live system state.
- `source_registry.json` — redacted read-only source metadata for audit.
- `tibot_interactive/` — copied latest Tibot interactive sub-dashboard, embedded via relative iframe.

## Deployment note
Publish this directory as the root of GitHub repo `julio0029/Axone-dashboard` and enable GitHub Pages. No backend, secrets, package install, or external API access is required.
"""
    (OUT / 'summary.md').write_text(summary)

if __name__ == '__main__':
    main()
