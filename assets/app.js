'use strict';
const ARCHITECTURE = {
  "generated_at": "2026-06-07T19:26:59.021708+00:00",
  "repository_target": "julio0029/Axone-dashboard",
  "mode": "static_github_pages_read_only",
  "status_policy": "Statuses are documentation/artifact availability only; no live health checks are fabricated.",
  "agents": [
    {
      "name": "Axone",
      "layer": "Orchestration",
      "owns": "Routing, coordination, architecture guard, final aggregation",
      "consumes": "User/operator requests, agent outputs, architecture docs",
      "emits": "Validated dispatches, summaries, operator-facing answers",
      "boundaries": "Does not code, fetch APIs, train, backtest, approve risk, or trade",
      "status": "documented",
      "accent": "orchestration"
    },
    {
      "name": "Spider",
      "layer": "External data / APIs",
      "owns": "Binance/web/HTTP fetches and raw external data retrieval",
      "consumes": "External sources by request",
      "emits": "Raw data to Chronos, Karen, Darwin, Kerry as requested",
      "boundaries": "No trade decisions; no bot/strategy/risk/live-store writes",
      "status": "documented",
      "accent": "data"
    },
    {
      "name": "Chronos",
      "layer": "Historical engine",
      "owns": "Historical storage, replay, walk-forward validation, evidence ledgers",
      "consumes": "Spider-fetched archives",
      "emits": "Evidence/metrics/ledgers to Sentinel, Wally, Tibot, Darwin, Guy",
      "boundaries": "Never modifies live data; never trains bots; never creates strategies or approves trades",
      "status": "documented",
      "accent": "historical"
    },
    {
      "name": "Kerry",
      "layer": "Live data layer",
      "owns": "DATA/live rolling feature-ready datasets, max 200 candles",
      "consumes": "Spider live feeds",
      "emits": "Live features to Tibot, Wally, Sentinel",
      "boundaries": "No historical writes, no bot training, no strategy creation",
      "status": "documented",
      "accent": "data"
    },
    {
      "name": "Tibot",
      "layer": "Bot intelligence",
      "owns": "Prediction and classification bots; training/optimisation; bot registry",
      "consumes": "Chronos historical datasets and Kerry live features",
      "emits": "Probabilities, classes, expected return, confidence, validation metrics",
      "boundaries": "Does not create strategies, emit trades, execute, or write historical/live data",
      "status": "interactive sub-dashboard available",
      "accent": "model"
    },
    {
      "name": "Wally",
      "layer": "Strategy",
      "owns": "Strategy design/evaluation and open/hold/close/reduce proposals",
      "consumes": "Tibot outputs only",
      "emits": "Trade proposals to Sentinel",
      "boundaries": "No bot ownership/training; no execution; cannot bypass Sentinel; no risk-store writes",
      "status": "documented",
      "accent": "strategy"
    },
    {
      "name": "Sentinel",
      "layer": "Risk authority",
      "owns": "Portfolio risk, gating, strategy ratings, paper/live execution path",
      "consumes": "Wally proposals, Chronos evidence, Karen advisory context",
      "emits": "Approve/reject/reduce/close decisions and rating updates",
      "boundaries": "No bots or strategies; cannot enable paper/live without explicit operator approval",
      "status": "documented",
      "accent": "risk"
    },
    {
      "name": "Darwin",
      "layer": "Research / evolution",
      "owns": "Symbol proposals, bot-family proposals, strategy mutations, advisory assessments",
      "consumes": "Owner-produced evidence from Chronos/Tibot/Wally/Sentinel plus Spider external data",
      "emits": "Advisory recommendations into the controlled chain",
      "boundaries": "Never deploys directly; never writes bot/strategy/risk/historical/live stores",
      "status": "documented",
      "accent": "research"
    },
    {
      "name": "Karen",
      "layer": "External intelligence",
      "owns": "Copy-trader/public-trader behaviour intel",
      "consumes": "Spider external data",
      "emits": "Advisory context to Sentinel",
      "boundaries": "No approval, blocking, sizing, veto, or direct fetching",
      "status": "documented",
      "accent": "intel"
    },
    {
      "name": "Sublime",
      "layer": "Code / implementation",
      "owns": "Scripts, pipelines, ML implementation, debugging and tests",
      "consumes": "Specs from owning agents",
      "emits": "Code, scripts, tests",
      "boundaries": "Does not decide trading logic, strategy intent, or risk policy",
      "status": "documented",
      "accent": "code"
    },
    {
      "name": "Conchita",
      "layer": "Maintenance / recovery",
      "owns": "System health, config, recovery, skills upkeep",
      "consumes": "System state",
      "emits": "Maintenance reports and approved config patches",
      "boundaries": "No trading logic/bot/strategy/risk changes without explicit operator approval",
      "status": "documented",
      "accent": "maintenance"
    },
    {
      "name": "Glia",
      "layer": "Memory / token optimisation",
      "owns": "Memory compression, retrieval, summarisation",
      "consumes": "Agent outputs and validated knowledge",
      "emits": "Compressed recall snippets and summaries",
      "boundaries": "No trading logic/bot/strategy/risk changes; no silent drop of trading-relevant memory",
      "status": "documented",
      "accent": "memory"
    },
    {
      "name": "Guy",
      "layer": "Read-only dashboard",
      "owns": "Static visualisation artifacts under Guy workspace",
      "consumes": "Read-only architecture docs and approved dashboard/source artifacts",
      "emits": "GitHub-hostable dashboards and summaries",
      "boundaries": "No upstream writes, no trading, no API calls, no scheduler changes",
      "status": "this dashboard generated",
      "accent": "dashboard"
    }
  ],
  "layers": [
    {
      "name": "External intelligence/data",
      "members": [
        "Spider",
        "Karen"
      ],
      "note": "Spider fetches; Karen analyses copy/public-trader behaviour for Sentinel only."
    },
    {
      "name": "Data engines",
      "members": [
        "Chronos",
        "Kerry"
      ],
      "note": "Chronos owns historical evidence; Kerry owns rolling live features."
    },
    {
      "name": "Model intelligence",
      "members": [
        "Tibot"
      ],
      "note": "Tibot is sole owner of prediction/classification bots."
    },
    {
      "name": "Strategy",
      "members": [
        "Wally"
      ],
      "note": "Wally consumes Tibot outputs and emits proposals, never execution."
    },
    {
      "name": "Risk gate",
      "members": [
        "Sentinel"
      ],
      "note": "Sentinel is the only gate to paper/live execution and risk decisions."
    },
    {
      "name": "Research / evolution",
      "members": [
        "Darwin"
      ],
      "note": "Darwin is advisory and never deploys directly."
    },
    {
      "name": "Build / maintain / remember / view",
      "members": [
        "Sublime",
        "Conchita",
        "Glia",
        "Guy"
      ],
      "note": "Support agents stay inside their ownership boundaries."
    }
  ],
  "flows": [
    [
      "External",
      "Spider",
      "Raw archives / live feeds"
    ],
    [
      "Spider",
      "Chronos",
      "Historical archives"
    ],
    [
      "Spider",
      "Kerry",
      "Live feed snapshots"
    ],
    [
      "Chronos",
      "Tibot",
      "Historical training/validation evidence"
    ],
    [
      "Kerry",
      "Tibot",
      "Live features"
    ],
    [
      "Tibot",
      "Wally",
      "Bot probabilities/classes/confidence"
    ],
    [
      "Wally",
      "Sentinel",
      "Trade proposals only"
    ],
    [
      "Chronos",
      "Sentinel",
      "Evidence for risk/gating"
    ],
    [
      "Spider",
      "Karen",
      "External trader intel raw input"
    ],
    [
      "Karen",
      "Sentinel",
      "Advisory context only"
    ],
    [
      "Chronos",
      "Darwin",
      "Owner-produced evidence"
    ],
    [
      "Tibot",
      "Darwin",
      "Read-only bot evidence"
    ],
    [
      "Wally",
      "Darwin",
      "Read-only strategy evidence"
    ],
    [
      "Sentinel",
      "Darwin",
      "Read-only risk/performance evidence"
    ],
    [
      "Darwin",
      "Chronos \u2192 Tibot/Wally \u2192 Sentinel",
      "Advisory proposals only"
    ],
    [
      "All agents",
      "Glia",
      "Summarisation candidates"
    ],
    [
      "Any owning agent",
      "Sublime",
      "Implementation specs"
    ],
    [
      "System state",
      "Conchita",
      "Maintenance checks"
    ],
    [
      "Approved read-only sources",
      "Guy",
      "Static dashboards"
    ]
  ],
  "approval_chains": [
    "New symbol: Darwin proposal \u2192 Chronos data availability \u2192 Kerry live-data feasibility \u2192 Tibot training feasibility \u2192 Wally strategy feasibility \u2192 Sentinel risk approval \u2192 Axone operator approval",
    "New bot family: Darwin/Tibot proposal \u2192 Chronos validation evidence \u2192 Tibot training & registry \u2192 Wally consumes \u2192 Sentinel ratings",
    "Strategy mutation: Darwin proposal \u2192 Wally evaluation \u2192 Sentinel rating & gate",
    "Trade: Wally proposal \u2192 Sentinel gate \u2192 explicit operator approval for paper/live only",
    "Risk-limit change: Sentinel proposal citing Chronos evidence \u2192 operator approval"
  ],
  "tibot_subdashboard": {
    "included": true,
    "method": "copied static directory and embedded via relative iframe plus direct relative link",
    "relative_path": "tibot_interactive/index.html",
    "generated_at": "2026-06-03T22:26:36.629989+00:00",
    "bot_count": 375,
    "classes": {
      "classification": {
        "bot_count": 223
      },
      "prediction": {
        "bot_count": 152
      }
    }
  },
  "safety": {
    "external_api_calls": "none",
    "backend_required": false,
    "relative_paths_only": true,
    "upstream_writes": "none",
    "paper_live_trading": "not present"
  }
};

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  return node;
}

function renderAgents(filter = 'all') {
  const grid = document.querySelector('[data-agent-grid]');
  grid.innerHTML = '';
  const q = document.querySelector('[data-search]').value.trim().toLowerCase();
  ARCHITECTURE.agents
    .filter(a => filter === 'all' || a.accent === filter)
    .filter(a => !q || JSON.stringify(a).toLowerCase().includes(q))
    .forEach(agent => {
      grid.append(el('article', { class: `agent-card ${agent.accent}` }, [
        el('div', { class: 'card-top' }, [
          el('h3', { text: agent.name }),
          el('span', { class: 'badge', text: agent.status })
        ]),
        el('p', { class: 'layer', text: agent.layer }),
        row('Owns', agent.owns), row('Inputs', agent.consumes), row('Outputs', agent.emits), row('Boundary', agent.boundaries)
      ]));
    });
}

function row(label, text) {
  return el('div', { class: 'fact' }, [el('strong', { text: label }), el('span', { text })]);
}

function renderFlow() {
  const flow = document.querySelector('[data-flow]');
  ARCHITECTURE.flows.forEach(([from, to, label]) => {
    flow.append(el('div', { class: 'flow-row' }, [
      el('span', { class: 'node', text: from }), el('span', { class: 'arrow', text: '→' }),
      el('span', { class: 'node', text: to }), el('span', { class: 'flow-label', text: label })
    ]));
  });
}

function renderLayers() {
  const target = document.querySelector('[data-layers]');
  ARCHITECTURE.layers.forEach(layer => target.append(el('section', { class: 'layer-card' }, [
    el('h3', { text: layer.name }),
    el('p', { text: layer.note }),
    el('div', { class: 'chips' }, layer.members.map(m => el('span', { class: 'chip', text: m })))
  ])));
}

function renderChains() {
  const list = document.querySelector('[data-chains]');
  ARCHITECTURE.approval_chains.forEach(chain => list.append(el('li', { text: chain })));
}

function initFilters() {
  document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderAgents(btn.dataset.filter);
  }));
  document.querySelector('[data-search]').addEventListener('input', () => {
    const active = document.querySelector('[data-filter].active');
    renderAgents(active ? active.dataset.filter : 'all');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-generated]').textContent = ARCHITECTURE.generated_at;
  document.querySelector('[data-tibot-count]').textContent = ARCHITECTURE.tibot_subdashboard.bot_count;
  document.querySelector('[data-tibot-generated]').textContent = ARCHITECTURE.tibot_subdashboard.generated_at;
  renderLayers(); renderFlow(); renderChains(); renderAgents(); initFilters();
});
