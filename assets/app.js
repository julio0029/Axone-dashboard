'use strict';
const ARCHITECTURE = {
  "generated_at": "2026-06-08T00:45:50.540660+00:00",
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
  },
  "review_data": {
    "generated_at": "2026-06-08T00:45:50.540660+00:00",
    "tibot_quality_audit": {
      "audit_window_label": "BTC HTF vs all quality audit, 2026-06-08",
      "bot_counts": {
        "usable": 65,
        "watch": 43,
        "blocked": 253,
        "missing_metric": 88
      },
      "group_summary": {
        "btc_1h_4h_1d": {
          "avg_primary_metric": 0.477783,
          "bot_count": 29,
          "median_primary_metric": 0.490631,
          "metric_count": 21,
          "recommendations": {
            "blocked": 23,
            "usable": 4,
            "watch": 2
          }
        },
        "btc_5m": {
          "avg_primary_metric": 0.482471,
          "bot_count": 7,
          "median_primary_metric": 0.497778,
          "metric_count": 7,
          "recommendations": {
            "blocked": 5,
            "usable": 1,
            "watch": 1
          }
        },
        "non_btc": {
          "avg_primary_metric": 0.492973,
          "bot_count": 325,
          "median_primary_metric": 0.502136,
          "metric_count": 245,
          "recommendations": {
            "blocked": 225,
            "usable": 60,
            "watch": 40
          }
        }
      },
      "metric_mismatch_note": "Dashboard displays validation metrics in many cases, not chronological test metrics; this makes BTC high-timeframe groups look much stronger than their out-of-sample test results.",
      "interpretation": "BTC 1h/4h/1d are among the better groups on dashboard/validation metrics, but authoritative test metrics show many of those scores degrade sharply; BTC 5m is mixed rather than uniformly poor. Non-BTC performance is highly uneven and many dashboard entries are misleading because Guy reads bot-dir metrics stubs or validation metrics.",
      "mismatch_counts": {
        "checks": 375,
        "validation_metric_not_test": 127,
        "bot_dir_missing_stub": 161,
        "issue_counts": {
          "Guy points at bot-dir metrics stub while report metrics exist": 66,
          "none_detected": 182,
          "dashboard displays validation metric, not out-of-sample test metric": 127
        }
      },
      "strongest_groups": [
        {
          "family": "gann_swing",
          "category": "prediction",
          "bot_count": 33,
          "usable": 28,
          "watch": 3,
          "blocked": 2,
          "avg_primary_metric": 0.7502,
          "median_primary_metric": 0.7679,
          "metric_count": 33
        },
        {
          "family": "gann_swing",
          "category": "classifier",
          "bot_count": 40,
          "usable": 21,
          "watch": 10,
          "blocked": 9,
          "avg_primary_metric": 0.5596,
          "median_primary_metric": 0.6097,
          "metric_count": 40
        },
        {
          "family": "breakout",
          "category": "prediction",
          "bot_count": 40,
          "usable": 0,
          "watch": 8,
          "blocked": 32,
          "avg_primary_metric": 0.4956,
          "median_primary_metric": 0.5033,
          "metric_count": 40
        },
        {
          "family": "momentum",
          "category": "prediction",
          "bot_count": 40,
          "usable": 1,
          "watch": 7,
          "blocked": 32,
          "avg_primary_metric": 0.4913,
          "median_primary_metric": 0.4981,
          "metric_count": 40
        },
        {
          "family": "breakout",
          "category": "classifier",
          "bot_count": 40,
          "usable": 15,
          "watch": 3,
          "blocked": 22,
          "avg_primary_metric": 0.4822,
          "median_primary_metric": 0.4921,
          "metric_count": 40
        },
        {
          "family": "next_candle",
          "category": "classifier",
          "bot_count": 40,
          "usable": 0,
          "watch": 12,
          "blocked": 28,
          "avg_primary_metric": 0.4356,
          "median_primary_metric": 0.4702,
          "metric_count": 40
        }
      ],
      "weakest_groups": [
        {
          "family": "momentum",
          "category": "classifier",
          "bot_count": 40,
          "usable": 0,
          "watch": 0,
          "blocked": 40,
          "avg_primary_metric": 0.2715,
          "median_primary_metric": 0.2945,
          "metric_count": 40
        },
        {
          "family": "next_candle",
          "category": "classifier",
          "bot_count": 40,
          "usable": 0,
          "watch": 12,
          "blocked": 28,
          "avg_primary_metric": 0.4356,
          "median_primary_metric": 0.4702,
          "metric_count": 40
        },
        {
          "family": "breakout",
          "category": "classifier",
          "bot_count": 40,
          "usable": 15,
          "watch": 3,
          "blocked": 22,
          "avg_primary_metric": 0.4822,
          "median_primary_metric": 0.4921,
          "metric_count": 40
        },
        {
          "family": "momentum",
          "category": "prediction",
          "bot_count": 40,
          "usable": 1,
          "watch": 7,
          "blocked": 32,
          "avg_primary_metric": 0.4913,
          "median_primary_metric": 0.4981,
          "metric_count": 40
        },
        {
          "family": "breakout",
          "category": "prediction",
          "bot_count": 40,
          "usable": 0,
          "watch": 8,
          "blocked": 32,
          "avg_primary_metric": 0.4956,
          "median_primary_metric": 0.5033,
          "metric_count": 40
        },
        {
          "family": "gann_swing",
          "category": "classifier",
          "bot_count": 40,
          "usable": 21,
          "watch": 10,
          "blocked": 9,
          "avg_primary_metric": 0.5596,
          "median_primary_metric": 0.6097,
          "metric_count": 40
        }
      ],
      "strongest_bots": [
        {
          "bot_id": "prediction__gann_swing_predictor__SOLUSDT__4h",
          "symbol": "SOLUSDT",
          "timeframe": "4h",
          "family": "gann_swing",
          "category": "prediction",
          "primary_metric": 0.849,
          "recommendation": "usable",
          "rows": 3261
        },
        {
          "bot_id": "prediction__gann_swing_predictor__XRPUSDT__1d",
          "symbol": "XRPUSDT",
          "timeframe": "1d",
          "family": "gann_swing",
          "category": "prediction",
          "primary_metric": 0.8333,
          "recommendation": "usable",
          "rows": 1159
        },
        {
          "bot_id": "prediction__gann_swing_predictor__FETUSDT__4h",
          "symbol": "FETUSDT",
          "timeframe": "4h",
          "family": "gann_swing",
          "category": "prediction",
          "primary_metric": 0.8142,
          "recommendation": "usable",
          "rows": 3367
        },
        {
          "bot_id": "prediction__gann_swing_predictor__BTCUSDT__1h",
          "symbol": "BTCUSDT",
          "timeframe": "1h",
          "family": "gann_swing",
          "category": "prediction",
          "primary_metric": 0.811,
          "recommendation": "usable",
          "rows": 4124
        },
        {
          "bot_id": "prediction__gann_swing_predictor__BNBUSDT__1h",
          "symbol": "BNBUSDT",
          "timeframe": "1h",
          "family": "gann_swing",
          "category": "prediction",
          "primary_metric": 0.7967,
          "recommendation": "usable",
          "rows": 4064
        },
        {
          "bot_id": "prediction__gann_swing_predictor__BTCUSDT__5m",
          "symbol": "BTCUSDT",
          "timeframe": "5m",
          "family": "gann_swing",
          "category": "prediction",
          "primary_metric": 0.7967,
          "recommendation": "usable",
          "rows": 5178
        },
        {
          "bot_id": "prediction__gann_swing_predictor__BNBUSDT__1d",
          "symbol": "BNBUSDT",
          "timeframe": "1d",
          "family": "gann_swing",
          "category": "prediction",
          "primary_metric": 0.7957,
          "recommendation": "usable",
          "rows": 1234
        },
        {
          "bot_id": "prediction__gann_swing_predictor__SUIUSDT__4h",
          "symbol": "SUIUSDT",
          "timeframe": "4h",
          "family": "gann_swing",
          "category": "prediction",
          "primary_metric": 0.7939,
          "recommendation": "usable",
          "rows": 2843
        },
        {
          "bot_id": "prediction__gann_swing_predictor__SOLUSDT__1h",
          "symbol": "SOLUSDT",
          "timeframe": "1h",
          "family": "gann_swing",
          "category": "prediction",
          "primary_metric": 0.791,
          "recommendation": "usable",
          "rows": 4016
        },
        {
          "bot_id": "prediction__gann_swing_predictor__SHIBUSDT__4h",
          "symbol": "SHIBUSDT",
          "timeframe": "4h",
          "family": "gann_swing",
          "category": "prediction",
          "primary_metric": 0.7885,
          "recommendation": "usable",
          "rows": 3370
        }
      ],
      "sources": [
        "tibot-source://AUDITS/btc_htf_vs_all_quality_20260608/tibot_quality_audit_btc_htf_vs_all.json",
        "tibot-source://AUDITS/btc_htf_vs_all_quality_20260608/dashboard_metric_consistency_check.json",
        "tibot-source://AUDITS/btc_htf_vs_all_quality_20260608/quality_by_symbol_timeframe_family.json",
        "tibot-source://AUDITS/btc_htf_vs_all_quality_20260608/usable_vs_diagnostic_bot_recommendations.json"
      ]
    },
    "sentinel_btc_short_validation": {
      "window": {
        "start": "2026-06-02T08:49:59.999Z",
        "end": "2026-06-05T20:05:00Z"
      },
      "run_label": "short_btc_full_backbone_after_sentinel_polarity_fix_20260607T213719Z",
      "metrics": {
        "final_equity": 9294.44,
        "return_pct": -7.0556,
        "max_drawdown_pct": 4.2116,
        "win_rate": 0.3315,
        "profit_factor": 0.5158,
        "realized_pnl": -419.5981,
        "total_fees": 571.4274,
        "total_trades": 715,
        "open_trades_remaining": 2
      },
      "proposal_counts_by_side": {
        "short": 1818,
        "long": 2182
      },
      "decision_counts_by_side": {
        "long_accept": 529,
        "long_reject": 1653,
        "short_accept": 188,
        "short_reject": 1630
      },
      "accepted_by_side": {
        "long": 529,
        "short": 188
      },
      "closed_by_side": {
        "long": 529,
        "short": 186
      },
      "pnl_by_side": {
        "long": {
          "closed": 529,
          "realized_pnl_exit_fee_net_usd": -356.06766554387286,
          "wins": 158
        },
        "short": {
          "closed": 186,
          "realized_pnl_exit_fee_net_usd": -63.530460306768354,
          "wins": 79
        }
      },
      "before_after_side_distribution": {
        "before": {
          "long": {
            "accepted": 604,
            "closed": 602,
            "entry_fees_from_accepts_usd": 220.23426959123228,
            "exit_fees_from_closed_usd": 219.81795275963262,
            "notional_accepted_usd": 293645.69278830965,
            "notional_closed_usd": 293090.6036795101,
            "proposals": 2182,
            "realized_pnl_exit_fee_net_usd": -365.64944621115984,
            "rejected": 1578,
            "wins": 182
          },
          "short": {
            "accepted": 0,
            "closed": 0,
            "entry_fees_from_accepts_usd": 0,
            "exit_fees_from_closed_usd": 0,
            "notional_accepted_usd": 0,
            "notional_closed_usd": 0,
            "proposals": 1818,
            "realized_pnl_exit_fee_net_usd": 0,
            "rejected": 1818,
            "wins": 0
          }
        },
        "after": {
          "long": {
            "accepted": 529,
            "closed": 529,
            "entry_fees_from_accepts_usd": 205.12223779467521,
            "exit_fees_from_closed_usd": 205.12223779467521,
            "notional_accepted_usd": 273496.3170595671,
            "notional_closed_usd": 273496.3170595671,
            "proposals": 2182,
            "realized_pnl_exit_fee_net_usd": -356.06766554387286,
            "rejected": 1653,
            "wins": 158
          },
          "short": {
            "accepted": 188,
            "closed": 186,
            "entry_fees_from_accepts_usd": 80.83561772352319,
            "exit_fees_from_closed_usd": 80.34729202798442,
            "notional_accepted_usd": 107780.82363136424,
            "notional_closed_usd": 107129.72270397922,
            "proposals": 1818,
            "realized_pnl_exit_fee_net_usd": -63.530460306768354,
            "rejected": 1630,
            "wins": 79
          }
        }
      },
      "ohlcv_available": true,
      "ohlcv_unavailable_reason": null,
      "candles": [
        {
          "ts": "2026-06-02T08:49:59.999000Z",
          "open": 69861.75,
          "high": 69943.33,
          "low": 69800.0,
          "close": 69801.3
        },
        {
          "ts": "2026-06-02T08:54:59.999000Z",
          "open": 69801.31,
          "high": 69833.62,
          "low": 69775.0,
          "close": 69775.0
        },
        {
          "ts": "2026-06-02T08:59:59.999000Z",
          "open": 69775.01,
          "high": 69849.0,
          "low": 69705.3,
          "close": 69821.99
        },
        {
          "ts": "2026-06-02T09:04:59.999000Z",
          "open": 69822.0,
          "high": 69849.0,
          "low": 69590.92,
          "close": 69597.09
        },
        {
          "ts": "2026-06-02T09:09:59.999000Z",
          "open": 69597.1,
          "high": 69714.0,
          "low": 69597.09,
          "close": 69654.57
        },
        {
          "ts": "2026-06-02T09:14:59.999000Z",
          "open": 69654.58,
          "high": 69654.58,
          "low": 69500.0,
          "close": 69555.96
        },
        {
          "ts": "2026-06-02T09:19:59.999000Z",
          "open": 69555.97,
          "high": 69628.53,
          "low": 69491.45,
          "close": 69612.75
        },
        {
          "ts": "2026-06-02T09:24:59.999000Z",
          "open": 69612.74,
          "high": 69614.0,
          "low": 69417.93,
          "close": 69489.99
        },
        {
          "ts": "2026-06-02T09:29:59.999000Z",
          "open": 69489.99,
          "high": 69489.99,
          "low": 69324.65,
          "close": 69399.1
        },
        {
          "ts": "2026-06-02T09:34:59.999000Z",
          "open": 69399.1,
          "high": 69550.0,
          "low": 69349.03,
          "close": 69526.71
        },
        {
          "ts": "2026-06-02T09:39:59.999000Z",
          "open": 69526.7,
          "high": 69566.96,
          "low": 69475.0,
          "close": 69475.31
        },
        {
          "ts": "2026-06-02T09:44:59.999000Z",
          "open": 69475.31,
          "high": 69514.0,
          "low": 69424.29,
          "close": 69490.01
        },
        {
          "ts": "2026-06-02T09:49:59.999000Z",
          "open": 69490.01,
          "high": 69524.0,
          "low": 69380.01,
          "close": 69496.28
        },
        {
          "ts": "2026-06-02T09:54:59.999000Z",
          "open": 69496.28,
          "high": 69510.93,
          "low": 69396.46,
          "close": 69396.47
        },
        {
          "ts": "2026-06-02T09:59:59.999000Z",
          "open": 69396.47,
          "high": 69454.41,
          "low": 69392.16,
          "close": 69426.01
        },
        {
          "ts": "2026-06-02T10:04:59.999000Z",
          "open": 69426.01,
          "high": 69533.23,
          "low": 69336.98,
          "close": 69522.01
        },
        {
          "ts": "2026-06-02T10:09:59.999000Z",
          "open": 69522.01,
          "high": 69648.0,
          "low": 69501.23,
          "close": 69636.0
        },
        {
          "ts": "2026-06-02T10:14:59.999000Z",
          "open": 69636.0,
          "high": 69756.0,
          "low": 69602.75,
          "close": 69657.99
        },
        {
          "ts": "2026-06-02T10:19:59.999000Z",
          "open": 69658.0,
          "high": 69724.16,
          "low": 69642.0,
          "close": 69724.16
        },
        {
          "ts": "2026-06-02T10:24:59.999000Z",
          "open": 69724.15,
          "high": 69724.16,
          "low": 69518.0,
          "close": 69544.39
        },
        {
          "ts": "2026-06-02T10:29:59.999000Z",
          "open": 69544.4,
          "high": 69662.57,
          "low": 69533.41,
          "close": 69646.01
        },
        {
          "ts": "2026-06-02T10:34:59.999000Z",
          "open": 69646.0,
          "high": 69673.93,
          "low": 69504.01,
          "close": 69512.0
        },
        {
          "ts": "2026-06-02T10:39:59.999000Z",
          "open": 69512.0,
          "high": 69535.29,
          "low": 69448.0,
          "close": 69496.0
        },
        {
          "ts": "2026-06-02T10:44:59.999000Z",
          "open": 69495.99,
          "high": 69513.44,
          "low": 69470.0,
          "close": 69474.0
        },
        {
          "ts": "2026-06-02T10:49:59.999000Z",
          "open": 69474.0,
          "high": 69530.08,
          "low": 69470.73,
          "close": 69480.0
        },
        {
          "ts": "2026-06-02T10:54:59.999000Z",
          "open": 69480.0,
          "high": 69690.18,
          "low": 69479.99,
          "close": 69662.12
        },
        {
          "ts": "2026-06-02T10:59:59.999000Z",
          "open": 69662.11,
          "high": 69690.18,
          "low": 69645.05,
          "close": 69652.19
        },
        {
          "ts": "2026-06-02T11:04:59.999000Z",
          "open": 69652.18,
          "high": 69659.47,
          "low": 69568.21,
          "close": 69587.25
        },
        {
          "ts": "2026-06-02T11:09:59.999000Z",
          "open": 69587.26,
          "high": 69611.52,
          "low": 69557.08,
          "close": 69602.0
        },
        {
          "ts": "2026-06-02T11:14:59.999000Z",
          "open": 69602.0,
          "high": 69608.01,
          "low": 69497.14,
          "close": 69552.0
        },
        {
          "ts": "2026-06-02T11:19:59.999000Z",
          "open": 69551.99,
          "high": 69566.06,
          "low": 69430.0,
          "close": 69450.01
        },
        {
          "ts": "2026-06-02T11:24:59.999000Z",
          "open": 69450.01,
          "high": 69522.2,
          "low": 69443.51,
          "close": 69522.08
        },
        {
          "ts": "2026-06-02T11:29:59.999000Z",
          "open": 69522.09,
          "high": 69536.0,
          "low": 69465.64,
          "close": 69495.99
        },
        {
          "ts": "2026-06-02T11:34:59.999000Z",
          "open": 69495.99,
          "high": 69495.99,
          "low": 69397.83,
          "close": 69430.0
        },
        {
          "ts": "2026-06-02T11:39:59.999000Z",
          "open": 69429.99,
          "high": 69517.36,
          "low": 69420.0,
          "close": 69516.74
        },
        {
          "ts": "2026-06-02T11:44:59.999000Z",
          "open": 69516.73,
          "high": 69531.76,
          "low": 69474.0,
          "close": 69474.0
        },
        {
          "ts": "2026-06-02T11:49:59.999000Z",
          "open": 69474.0,
          "high": 69547.99,
          "low": 69463.27,
          "close": 69536.01
        },
        {
          "ts": "2026-06-02T11:54:59.999000Z",
          "open": 69536.0,
          "high": 69607.03,
          "low": 69512.0,
          "close": 69587.25
        },
        {
          "ts": "2026-06-02T11:59:59.999000Z",
          "open": 69587.26,
          "high": 69587.26,
          "low": 69461.72,
          "close": 69461.72
        },
        {
          "ts": "2026-06-02T12:04:59.999000Z",
          "open": 69461.73,
          "high": 69548.13,
          "low": 69392.0,
          "close": 69490.01
        },
        {
          "ts": "2026-06-02T12:09:59.999000Z",
          "open": 69490.0,
          "high": 69490.0,
          "low": 69288.0,
          "close": 69468.63
        },
        {
          "ts": "2026-06-02T12:14:59.999000Z",
          "open": 69468.63,
          "high": 69482.83,
          "low": 69319.91,
          "close": 69343.99
        },
        {
          "ts": "2026-06-02T12:19:59.999000Z",
          "open": 69344.0,
          "high": 69364.0,
          "low": 69242.02,
          "close": 69245.15
        },
        {
          "ts": "2026-06-02T12:24:59.999000Z",
          "open": 69245.14,
          "high": 69439.85,
          "low": 69242.02,
          "close": 69407.48
        },
        {
          "ts": "2026-06-02T12:29:59.999000Z",
          "open": 69407.49,
          "high": 69409.78,
          "low": 69268.55,
          "close": 69286.03
        },
        {
          "ts": "2026-06-02T12:34:59.999000Z",
          "open": 69286.03,
          "high": 69286.04,
          "low": 69160.0,
          "close": 69173.84
        },
        {
          "ts": "2026-06-02T12:39:59.999000Z",
          "open": 69173.84,
          "high": 69190.97,
          "low": 69100.0,
          "close": 69104.0
        },
        {
          "ts": "2026-06-02T12:44:59.999000Z",
          "open": 69104.0,
          "high": 69243.85,
          "low": 69074.0,
          "close": 69215.51
        },
        {
          "ts": "2026-06-02T12:49:59.999000Z",
          "open": 69215.52,
          "high": 69250.0,
          "low": 69116.01,
          "close": 69130.04
        },
        {
          "ts": "2026-06-02T12:54:59.999000Z",
          "open": 69130.04,
          "high": 69130.04,
          "low": 69063.86,
          "close": 69063.87
        },
        {
          "ts": "2026-06-02T12:59:59.999000Z",
          "open": 69063.87,
          "high": 69095.14,
          "low": 68989.61,
          "close": 69010.42
        },
        {
          "ts": "2026-06-02T13:04:59.999000Z",
          "open": 69010.41,
          "high": 69180.0,
          "low": 68936.0,
          "close": 69106.01
        },
        {
          "ts": "2026-06-02T13:09:59.999000Z",
          "open": 69106.0,
          "high": 69120.0,
          "low": 68980.0,
          "close": 69005.99
        },
        {
          "ts": "2026-06-02T13:14:59.999000Z",
          "open": 69006.0,
          "high": 69066.0,
          "low": 68899.0,
          "close": 68918.81
        },
        {
          "ts": "2026-06-02T13:19:59.999000Z",
          "open": 68918.81,
          "high": 69056.57,
          "low": 68872.0,
          "close": 68994.0
        },
        {
          "ts": "2026-06-02T13:24:59.999000Z",
          "open": 68994.01,
          "high": 69100.0,
          "low": 68994.0,
          "close": 69062.01
        },
        {
          "ts": "2026-06-02T13:29:59.999000Z",
          "open": 69062.0,
          "high": 69100.0,
          "low": 69002.78,
          "close": 69020.0
        },
        {
          "ts": "2026-06-02T13:34:59.999000Z",
          "open": 69019.99,
          "high": 69106.0,
          "low": 68920.0,
          "close": 68957.1
        },
        {
          "ts": "2026-06-02T13:39:59.999000Z",
          "open": 68957.1,
          "high": 68976.0,
          "low": 68806.96,
          "close": 68880.71
        },
        {
          "ts": "2026-06-02T13:44:59.999000Z",
          "open": 68880.7,
          "high": 68968.56,
          "low": 68768.01,
          "close": 68879.76
        },
        {
          "ts": "2026-06-02T13:49:59.999000Z",
          "open": 68879.76,
          "high": 68980.45,
          "low": 68836.0,
          "close": 68890.01
        },
        {
          "ts": "2026-06-02T13:54:59.999000Z",
          "open": 68890.0,
          "high": 68897.79,
          "low": 68782.28,
          "close": 68795.93
        },
        {
          "ts": "2026-06-02T13:59:59.999000Z",
          "open": 68795.94,
          "high": 68839.85,
          "low": 68757.03,
          "close": 68811.91
        },
        {
          "ts": "2026-06-02T14:04:59.999000Z",
          "open": 68809.93,
          "high": 68836.0,
          "low": 68611.81,
          "close": 68635.99
        },
        {
          "ts": "2026-06-02T14:09:59.999000Z",
          "open": 68635.99,
          "high": 68739.25,
          "low": 68430.35,
          "close": 68433.5
        },
        {
          "ts": "2026-06-02T14:14:59.999000Z",
          "open": 68433.5,
          "high": 68696.05,
          "low": 68307.8,
          "close": 68584.0
        },
        {
          "ts": "2026-06-02T14:19:59.999000Z",
          "open": 68584.01,
          "high": 68584.01,
          "low": 68300.89,
          "close": 68333.36
        },
        {
          "ts": "2026-06-02T14:24:59.999000Z",
          "open": 68333.37,
          "high": 68388.0,
          "low": 67940.45,
          "close": 68006.32
        },
        {
          "ts": "2026-06-02T14:29:59.999000Z",
          "open": 68006.32,
          "high": 68113.13,
          "low": 67617.85,
          "close": 67884.28
        },
        {
          "ts": "2026-06-02T14:34:59.999000Z",
          "open": 67884.29,
          "high": 68145.12,
          "low": 67860.0,
          "close": 68069.72
        },
        {
          "ts": "2026-06-02T14:39:59.999000Z",
          "open": 68069.74,
          "high": 68280.0,
          "low": 68045.61,
          "close": 68084.0
        },
        {
          "ts": "2026-06-02T14:44:59.999000Z",
          "open": 68084.0,
          "high": 68084.0,
          "low": 67900.0,
          "close": 68023.58
        },
        {
          "ts": "2026-06-02T14:49:59.999000Z",
          "open": 68023.58,
          "high": 68262.0,
          "low": 68016.65,
          "close": 68246.51
        },
        {
          "ts": "2026-06-02T14:54:59.999000Z",
          "open": 68246.51,
          "high": 68280.0,
          "low": 68082.72,
          "close": 68102.09
        },
        {
          "ts": "2026-06-02T14:59:59.999000Z",
          "open": 68102.1,
          "high": 68153.18,
          "low": 67980.66,
          "close": 68019.3
        },
        {
          "ts": "2026-06-02T15:04:59.999000Z",
          "open": 68019.3,
          "high": 68037.46,
          "low": 67830.0,
          "close": 67930.47
        },
        {
          "ts": "2026-06-02T15:09:59.999000Z",
          "open": 67930.48,
          "high": 68094.6,
          "low": 67930.48,
          "close": 68004.01
        },
        {
          "ts": "2026-06-02T15:14:59.999000Z",
          "open": 68004.01,
          "high": 68011.82,
          "low": 67822.0,
          "close": 67854.49
        },
        {
          "ts": "2026-06-02T15:19:59.999000Z",
          "open": 67854.49,
          "high": 67854.49,
          "low": 67628.31,
          "close": 67703.23
        },
        {
          "ts": "2026-06-02T15:24:59.999000Z",
          "open": 67704.11,
          "high": 67790.49,
          "low": 67533.0,
          "close": 67599.11
        },
        {
          "ts": "2026-06-02T15:29:59.999000Z",
          "open": 67599.11,
          "high": 67618.49,
          "low": 67372.61,
          "close": 67450.0
        },
        {
          "ts": "2026-06-02T15:34:59.999000Z",
          "open": 67450.01,
          "high": 67499.69,
          "low": 67166.0,
          "close": 67246.92
        },
        {
          "ts": "2026-06-02T15:39:59.999000Z",
          "open": 67246.93,
          "high": 67300.0,
          "low": 67076.0,
          "close": 67196.56
        },
        {
          "ts": "2026-06-02T15:44:59.999000Z",
          "open": 67196.55,
          "high": 67373.36,
          "low": 67196.55,
          "close": 67277.59
        },
        {
          "ts": "2026-06-02T15:49:59.999000Z",
          "open": 67277.59,
          "high": 67495.13,
          "low": 67155.06,
          "close": 67174.23
        },
        {
          "ts": "2026-06-02T15:54:59.999000Z",
          "open": 67174.23,
          "high": 67214.37,
          "low": 67112.7,
          "close": 67171.15
        },
        {
          "ts": "2026-06-02T15:59:59.999000Z",
          "open": 67171.16,
          "high": 67332.91,
          "low": 67146.17,
          "close": 67304.28
        },
        {
          "ts": "2026-06-02T16:04:59.999000Z",
          "open": 67304.29,
          "high": 67450.09,
          "low": 67228.45,
          "close": 67436.56
        },
        {
          "ts": "2026-06-02T16:09:59.999000Z",
          "open": 67436.57,
          "high": 67590.36,
          "low": 67372.81,
          "close": 67571.84
        },
        {
          "ts": "2026-06-02T16:14:59.999000Z",
          "open": 67571.84,
          "high": 67969.68,
          "low": 67519.42,
          "close": 67928.45
        },
        {
          "ts": "2026-06-02T16:19:59.999000Z",
          "open": 67928.45,
          "high": 68146.3,
          "low": 67842.99,
          "close": 68084.39
        },
        {
          "ts": "2026-06-02T16:24:59.999000Z",
          "open": 68084.4,
          "high": 68102.46,
          "low": 67799.02,
          "close": 67828.0
        },
        {
          "ts": "2026-06-02T16:29:59.999000Z",
          "open": 67828.0,
          "high": 67896.0,
          "low": 67787.28,
          "close": 67863.72
        },
        {
          "ts": "2026-06-02T16:34:59.999000Z",
          "open": 67863.72,
          "high": 67868.75,
          "low": 67795.3,
          "close": 67795.31
        },
        {
          "ts": "2026-06-02T16:39:59.999000Z",
          "open": 67795.32,
          "high": 67815.93,
          "low": 67541.65,
          "close": 67610.0
        },
        {
          "ts": "2026-06-02T16:44:59.999000Z",
          "open": 67610.01,
          "high": 67700.0,
          "low": 67568.0,
          "close": 67631.67
        },
        {
          "ts": "2026-06-02T16:49:59.999000Z",
          "open": 67631.68,
          "high": 67833.96,
          "low": 67623.19,
          "close": 67762.0
        },
        {
          "ts": "2026-06-02T16:54:59.999000Z",
          "open": 67762.0,
          "high": 67762.01,
          "low": 67541.29,
          "close": 67545.67
        },
        {
          "ts": "2026-06-02T16:59:59.999000Z",
          "open": 67545.67,
          "high": 67594.01,
          "low": 67404.31,
          "close": 67413.44
        },
        {
          "ts": "2026-06-02T17:04:59.999000Z",
          "open": 67413.44,
          "high": 67573.4,
          "low": 67378.0,
          "close": 67531.5
        },
        {
          "ts": "2026-06-02T17:09:59.999000Z",
          "open": 67531.51,
          "high": 67626.0,
          "low": 67411.11,
          "close": 67446.89
        },
        {
          "ts": "2026-06-02T17:14:59.999000Z",
          "open": 67446.88,
          "high": 67536.0,
          "low": 67442.0,
          "close": 67507.19
        },
        {
          "ts": "2026-06-02T17:19:59.999000Z",
          "open": 67507.18,
          "high": 67572.3,
          "low": 67460.0,
          "close": 67568.54
        },
        {
          "ts": "2026-06-02T17:24:59.999000Z",
          "open": 67568.53,
          "high": 67801.54,
          "low": 67568.0,
          "close": 67801.53
        },
        {
          "ts": "2026-06-02T17:29:59.999000Z",
          "open": 67801.54,
          "high": 67806.0,
          "low": 67716.01,
          "close": 67740.01
        },
        {
          "ts": "2026-06-02T17:34:59.999000Z",
          "open": 67740.0,
          "high": 67837.53,
          "low": 67576.0,
          "close": 67622.01
        },
        {
          "ts": "2026-06-02T17:39:59.999000Z",
          "open": 67622.01,
          "high": 67698.49,
          "low": 67616.0,
          "close": 67661.35
        },
        {
          "ts": "2026-06-02T17:44:59.999000Z",
          "open": 67661.35,
          "high": 67661.35,
          "low": 67477.39,
          "close": 67496.25
        },
        {
          "ts": "2026-06-02T17:49:59.999000Z",
          "open": 67496.25,
          "high": 67514.0,
          "low": 67420.0,
          "close": 67454.44
        },
        {
          "ts": "2026-06-02T17:54:59.999000Z",
          "open": 67454.43,
          "high": 67508.0,
          "low": 67390.6,
          "close": 67456.0
        },
        {
          "ts": "2026-06-02T17:59:59.999000Z",
          "open": 67456.0,
          "high": 67524.0,
          "low": 67425.82,
          "close": 67492.34
        },
        {
          "ts": "2026-06-02T18:04:59.999000Z",
          "open": 67492.34,
          "high": 67593.99,
          "low": 67490.0,
          "close": 67537.19
        },
        {
          "ts": "2026-06-02T18:09:59.999000Z",
          "open": 67537.19,
          "high": 67627.97,
          "low": 67516.01,
          "close": 67604.0
        },
        {
          "ts": "2026-06-02T18:14:59.999000Z",
          "open": 67604.0,
          "high": 67661.7,
          "low": 67584.0,
          "close": 67600.01
        },
        {
          "ts": "2026-06-02T18:19:59.999000Z",
          "open": 67600.0,
          "high": 67616.0,
          "low": 67533.33,
          "close": 67542.92
        },
        {
          "ts": "2026-06-02T18:24:59.999000Z",
          "open": 67542.91,
          "high": 67556.62,
          "low": 67404.0,
          "close": 67404.0
        },
        {
          "ts": "2026-06-02T18:29:59.999000Z",
          "open": 67404.0,
          "high": 67449.54,
          "low": 67288.78,
          "close": 67301.56
        },
        {
          "ts": "2026-06-02T18:34:59.999000Z",
          "open": 67301.56,
          "high": 67363.38,
          "low": 67253.94,
          "close": 67290.02
        },
        {
          "ts": "2026-06-02T18:39:59.999000Z",
          "open": 67290.02,
          "high": 67312.86,
          "low": 67215.92,
          "close": 67244.01
        },
        {
          "ts": "2026-06-02T18:44:59.999000Z",
          "open": 67244.01,
          "high": 67300.0,
          "low": 67200.0,
          "close": 67300.0
        },
        {
          "ts": "2026-06-02T18:49:59.999000Z",
          "open": 67300.0,
          "high": 67313.82,
          "low": 67205.53,
          "close": 67286.0
        },
        {
          "ts": "2026-06-02T18:54:59.999000Z",
          "open": 67286.0,
          "high": 67290.46,
          "low": 67124.2,
          "close": 67124.21
        },
        {
          "ts": "2026-06-02T18:59:59.999000Z",
          "open": 67124.21,
          "high": 67358.88,
          "low": 67124.21,
          "close": 67341.99
        },
        {
          "ts": "2026-06-02T19:04:59.999000Z",
          "open": 67341.99,
          "high": 67424.3,
          "low": 67262.68,
          "close": 67275.28
        },
        {
          "ts": "2026-06-02T19:09:59.999000Z",
          "open": 67275.29,
          "high": 67356.0,
          "low": 67230.48,
          "close": 67280.66
        },
        {
          "ts": "2026-06-02T19:14:59.999000Z",
          "open": 67280.65,
          "high": 67372.08,
          "low": 67280.65,
          "close": 67344.89
        },
        {
          "ts": "2026-06-02T19:19:59.999000Z",
          "open": 67344.9,
          "high": 67372.93,
          "low": 67169.94,
          "close": 67183.62
        },
        {
          "ts": "2026-06-02T19:24:59.999000Z",
          "open": 67183.61,
          "high": 67240.0,
          "low": 67100.22,
          "close": 67100.22
        },
        {
          "ts": "2026-06-02T19:29:59.999000Z",
          "open": 67100.22,
          "high": 67188.72,
          "low": 66932.0,
          "close": 66978.2
        },
        {
          "ts": "2026-06-02T19:34:59.999000Z",
          "open": 66978.21,
          "high": 67018.0,
          "low": 66432.0,
          "close": 66590.0
        },
        {
          "ts": "2026-06-02T19:39:59.999000Z",
          "open": 66590.01,
          "high": 66816.39,
          "low": 66583.34,
          "close": 66773.66
        },
        {
          "ts": "2026-06-02T19:44:59.999000Z",
          "open": 66773.66,
          "high": 66964.01,
          "low": 66638.93,
          "close": 66925.61
        },
        {
          "ts": "2026-06-02T19:49:59.999000Z",
          "open": 66925.61,
          "high": 67160.0,
          "low": 66874.14,
          "close": 67153.56
        },
        {
          "ts": "2026-06-02T19:54:59.999000Z",
          "open": 67153.36,
          "high": 67498.0,
          "low": 67128.14,
          "close": 67202.0
        },
        {
          "ts": "2026-06-02T19:59:59.999000Z",
          "open": 67202.01,
          "high": 67316.68,
          "low": 67167.42,
          "close": 67315.14
        },
        {
          "ts": "2026-06-02T20:04:59.999000Z",
          "open": 67315.14,
          "high": 67315.15,
          "low": 67091.79,
          "close": 67289.64
        },
        {
          "ts": "2026-06-02T20:09:59.999000Z",
          "open": 67289.64,
          "high": 67464.87,
          "low": 67289.64,
          "close": 67441.45
        },
        {
          "ts": "2026-06-02T20:14:59.999000Z",
          "open": 67441.45,
          "high": 67487.5,
          "low": 67355.99,
          "close": 67381.97
        },
        {
          "ts": "2026-06-02T20:19:59.999000Z",
          "open": 67381.98,
          "high": 67405.18,
          "low": 67094.68,
          "close": 67135.99
        },
        {
          "ts": "2026-06-02T20:24:59.999000Z",
          "open": 67136.0,
          "high": 67143.4,
          "low": 66957.24,
          "close": 67019.98
        },
        {
          "ts": "2026-06-02T20:29:59.999000Z",
          "open": 67019.98,
          "high": 67056.0,
          "low": 66911.2,
          "close": 66962.17
        },
        {
          "ts": "2026-06-02T20:34:59.999000Z",
          "open": 66962.18,
          "high": 67362.81,
          "low": 66949.9,
          "close": 67186.0
        },
        {
          "ts": "2026-06-02T20:39:59.999000Z",
          "open": 67186.0,
          "high": 67310.0,
          "low": 67186.0,
          "close": 67292.01
        },
        {
          "ts": "2026-06-02T20:44:59.999000Z",
          "open": 67292.0,
          "high": 67302.0,
          "low": 67202.5,
          "close": 67302.0
        },
        {
          "ts": "2026-06-02T20:49:59.999000Z",
          "open": 67301.99,
          "high": 67490.0,
          "low": 67301.99,
          "close": 67490.0
        },
        {
          "ts": "2026-06-02T20:54:59.999000Z",
          "open": 67490.0,
          "high": 67689.65,
          "low": 67463.24,
          "close": 67613.34
        },
        {
          "ts": "2026-06-02T20:59:59.999000Z",
          "open": 67613.34,
          "high": 67652.0,
          "low": 67580.01,
          "close": 67587.77
        },
        {
          "ts": "2026-06-02T21:04:59.999000Z",
          "open": 67587.78,
          "high": 67682.0,
          "low": 67552.3,
          "close": 67576.0
        },
        {
          "ts": "2026-06-02T21:09:59.999000Z",
          "open": 67576.0,
          "high": 67806.92,
          "low": 67575.99,
          "close": 67645.61
        },
        {
          "ts": "2026-06-02T21:14:59.999000Z",
          "open": 67645.61,
          "high": 67691.52,
          "low": 67412.0,
          "close": 67470.97
        },
        {
          "ts": "2026-06-02T21:19:59.999000Z",
          "open": 67470.96,
          "high": 67690.0,
          "low": 67470.96,
          "close": 67689.99
        },
        {
          "ts": "2026-06-02T21:24:59.999000Z",
          "open": 67689.99,
          "high": 67820.0,
          "low": 67689.99,
          "close": 67778.13
        },
        {
          "ts": "2026-06-02T21:29:59.999000Z",
          "open": 67778.12,
          "high": 67918.0,
          "low": 67764.0,
          "close": 67887.99
        },
        {
          "ts": "2026-06-02T21:34:59.999000Z",
          "open": 67887.99,
          "high": 67908.0,
          "low": 67818.51,
          "close": 67899.61
        },
        {
          "ts": "2026-06-02T21:39:59.999000Z",
          "open": 67899.61,
          "high": 67923.24,
          "low": 67800.0,
          "close": 67818.0
        },
        {
          "ts": "2026-06-02T21:44:59.999000Z",
          "open": 67817.99,
          "high": 67829.99,
          "low": 67712.0,
          "close": 67732.0
        },
        {
          "ts": "2026-06-02T21:49:59.999000Z",
          "open": 67732.0,
          "high": 67732.0,
          "low": 67605.64,
          "close": 67609.02
        },
        {
          "ts": "2026-06-02T21:54:59.999000Z",
          "open": 67609.01,
          "high": 67653.41,
          "low": 67516.0,
          "close": 67526.0
        },
        {
          "ts": "2026-06-02T21:59:59.999000Z",
          "open": 67526.0,
          "high": 67642.0,
          "low": 67511.0,
          "close": 67566.01
        },
        {
          "ts": "2026-06-02T22:04:59.999000Z",
          "open": 67566.01,
          "high": 67566.01,
          "low": 67304.01,
          "close": 67369.99
        },
        {
          "ts": "2026-06-02T22:09:59.999000Z",
          "open": 67369.99,
          "high": 67444.0,
          "low": 67312.52,
          "close": 67363.99
        },
        {
          "ts": "2026-06-02T22:14:59.999000Z",
          "open": 67363.99,
          "high": 67377.99,
          "low": 67212.97,
          "close": 67217.79
        },
        {
          "ts": "2026-06-02T22:19:59.999000Z",
          "open": 67217.8,
          "high": 67250.97,
          "low": 66933.33,
          "close": 67059.25
        },
        {
          "ts": "2026-06-02T22:24:59.999000Z",
          "open": 67059.25,
          "high": 67417.83,
          "low": 67024.0,
          "close": 67370.0
        },
        {
          "ts": "2026-06-02T22:29:59.999000Z",
          "open": 67370.0,
          "high": 67434.0,
          "low": 67294.0,
          "close": 67294.0
        },
        {
          "ts": "2026-06-02T22:34:59.999000Z",
          "open": 67294.01,
          "high": 67310.0,
          "low": 67054.0,
          "close": 67061.64
        },
        {
          "ts": "2026-06-02T22:39:59.999000Z",
          "open": 67061.65,
          "high": 67126.0,
          "low": 66906.58,
          "close": 66923.99
        },
        {
          "ts": "2026-06-02T22:44:59.999000Z",
          "open": 66924.0,
          "high": 66980.0,
          "low": 66804.0,
          "close": 66956.01
        },
        {
          "ts": "2026-06-02T22:49:59.999000Z",
          "open": 66956.0,
          "high": 66956.0,
          "low": 66611.68,
          "close": 66760.01
        },
        {
          "ts": "2026-06-02T22:54:59.999000Z",
          "open": 66760.01,
          "high": 66836.0,
          "low": 66363.27,
          "close": 66575.41
        },
        {
          "ts": "2026-06-02T22:59:59.999000Z",
          "open": 66575.41,
          "high": 66741.72,
          "low": 66244.02,
          "close": 66385.2
        },
        {
          "ts": "2026-06-02T23:04:59.999000Z",
          "open": 66385.2,
          "high": 66410.0,
          "low": 66201.77,
          "close": 66325.07
        },
        {
          "ts": "2026-06-02T23:09:59.999000Z",
          "open": 66325.07,
          "high": 66653.99,
          "low": 66285.25,
          "close": 66482.0
        },
        {
          "ts": "2026-06-02T23:14:59.999000Z",
          "open": 66482.0,
          "high": 66692.0,
          "low": 66471.1,
          "close": 66692.0
        },
        {
          "ts": "2026-06-02T23:19:59.999000Z",
          "open": 66692.0,
          "high": 66769.24,
          "low": 66526.23,
          "close": 66538.0
        },
        {
          "ts": "2026-06-02T23:24:59.999000Z",
          "open": 66538.01,
          "high": 66657.34,
          "low": 66374.53,
          "close": 66446.0
        },
        {
          "ts": "2026-06-02T23:29:59.999000Z",
          "open": 66446.0,
          "high": 66476.0,
          "low": 66193.0,
          "close": 66443.99
        },
        {
          "ts": "2026-06-02T23:34:59.999000Z",
          "open": 66443.99,
          "high": 66622.0,
          "low": 66252.0,
          "close": 66548.01
        },
        {
          "ts": "2026-06-02T23:39:59.999000Z",
          "open": 66548.01,
          "high": 66636.0,
          "low": 66416.0,
          "close": 66554.01
        },
        {
          "ts": "2026-06-02T23:44:59.999000Z",
          "open": 66554.0,
          "high": 66736.0,
          "low": 66475.92,
          "close": 66724.34
        },
        {
          "ts": "2026-06-02T23:49:59.999000Z",
          "open": 66724.33,
          "high": 66808.0,
          "low": 66674.01,
          "close": 66777.63
        },
        {
          "ts": "2026-06-02T23:54:59.999000Z",
          "open": 66777.63,
          "high": 66788.0,
          "low": 66705.44,
          "close": 66783.79
        },
        {
          "ts": "2026-06-02T23:59:59.999000Z",
          "open": 66783.79,
          "high": 66868.62,
          "low": 66756.58,
          "close": 66760.83
        },
        {
          "ts": "2026-06-03T00:04:59.999000Z",
          "open": 66760.84,
          "high": 66881.67,
          "low": 66709.99,
          "close": 66744.56
        },
        {
          "ts": "2026-06-03T00:09:59.999000Z",
          "open": 66744.56,
          "high": 66850.89,
          "low": 66654.0,
          "close": 66837.99
        },
        {
          "ts": "2026-06-03T00:14:59.999000Z",
          "open": 66838.0,
          "high": 66912.0,
          "low": 66769.92,
          "close": 66822.01
        },
        {
          "ts": "2026-06-03T00:19:59.999000Z",
          "open": 66822.01,
          "high": 67122.3,
          "low": 66822.01,
          "close": 67085.72
        },
        {
          "ts": "2026-06-03T00:24:59.999000Z",
          "open": 67085.72,
          "high": 67100.0,
          "low": 66846.0,
          "close": 66884.37
        },
        {
          "ts": "2026-06-03T00:29:59.999000Z",
          "open": 66884.37,
          "high": 66950.0,
          "low": 66770.01,
          "close": 66776.34
        },
        {
          "ts": "2026-06-03T00:34:59.999000Z",
          "open": 66776.35,
          "high": 67050.15,
          "low": 66705.35,
          "close": 67030.0
        },
        {
          "ts": "2026-06-03T00:39:59.999000Z",
          "open": 67030.0,
          "high": 67204.15,
          "low": 67020.25,
          "close": 67049.42
        },
        {
          "ts": "2026-06-03T00:44:59.999000Z",
          "open": 67049.42,
          "high": 67096.84,
          "low": 67020.26,
          "close": 67075.07
        },
        {
          "ts": "2026-06-03T00:49:59.999000Z",
          "open": 67075.07,
          "high": 67150.0,
          "low": 66960.42,
          "close": 66981.93
        },
        {
          "ts": "2026-06-03T00:54:59.999000Z",
          "open": 66981.93,
          "high": 67040.0,
          "low": 66966.0,
          "close": 67024.59
        },
        {
          "ts": "2026-06-03T00:59:59.999000Z",
          "open": 67024.58,
          "high": 67043.0,
          "low": 66938.0,
          "close": 66938.01
        },
        {
          "ts": "2026-06-03T01:04:59.999000Z",
          "open": 66938.01,
          "high": 66952.0,
          "low": 66780.0,
          "close": 66926.01
        },
        {
          "ts": "2026-06-03T01:09:59.999000Z",
          "open": 66926.01,
          "high": 66928.0,
          "low": 66830.54,
          "close": 66837.35
        },
        {
          "ts": "2026-06-03T01:14:59.999000Z",
          "open": 66837.36,
          "high": 66854.71,
          "low": 66672.58,
          "close": 66829.16
        },
        {
          "ts": "2026-06-03T01:19:59.999000Z",
          "open": 66829.16,
          "high": 66982.96,
          "low": 66814.0,
          "close": 66878.01
        },
        {
          "ts": "2026-06-03T01:24:59.999000Z",
          "open": 66878.01,
          "high": 66964.0,
          "low": 66862.0,
          "close": 66944.21
        },
        {
          "ts": "2026-06-03T01:29:59.999000Z",
          "open": 66944.2,
          "high": 67038.3,
          "low": 66938.63,
          "close": 67024.01
        },
        {
          "ts": "2026-06-03T01:34:59.999000Z",
          "open": 67024.01,
          "high": 67050.0,
          "low": 66869.99,
          "close": 66896.0
        },
        {
          "ts": "2026-06-03T01:39:59.999000Z",
          "open": 66896.01,
          "high": 66914.0,
          "low": 66624.64,
          "close": 66633.39
        },
        {
          "ts": "2026-06-03T01:44:59.999000Z",
          "open": 66633.39,
          "high": 66675.95,
          "low": 66472.65,
          "close": 66511.99
        },
        {
          "ts": "2026-06-03T01:49:59.999000Z",
          "open": 66511.98,
          "high": 66650.0,
          "low": 66504.04,
          "close": 66634.01
        },
        {
          "ts": "2026-06-03T01:54:59.999000Z",
          "open": 66634.0,
          "high": 67039.83,
          "low": 66606.05,
          "close": 66994.75
        },
        {
          "ts": "2026-06-03T01:59:59.999000Z",
          "open": 66994.75,
          "high": 66994.75,
          "low": 66898.48,
          "close": 66920.0
        },
        {
          "ts": "2026-06-03T02:04:59.999000Z",
          "open": 66920.0,
          "high": 66920.01,
          "low": 66723.06,
          "close": 66880.01
        },
        {
          "ts": "2026-06-03T02:09:59.999000Z",
          "open": 66880.01,
          "high": 66909.57,
          "low": 66788.41,
          "close": 66893.24
        },
        {
          "ts": "2026-06-03T02:14:59.999000Z",
          "open": 66893.24,
          "high": 66896.86,
          "low": 66820.23,
          "close": 66820.23
        },
        {
          "ts": "2026-06-03T02:19:59.999000Z",
          "open": 66820.23,
          "high": 66920.0,
          "low": 66780.0,
          "close": 66919.04
        },
        {
          "ts": "2026-06-03T02:24:59.999000Z",
          "open": 66919.04,
          "high": 66919.04,
          "low": 66657.08,
          "close": 66680.0
        },
        {
          "ts": "2026-06-03T02:29:59.999000Z",
          "open": 66680.0,
          "high": 66714.89,
          "low": 66638.0,
          "close": 66651.55
        },
        {
          "ts": "2026-06-03T02:34:59.999000Z",
          "open": 66651.56,
          "high": 66742.82,
          "low": 66605.85,
          "close": 66689.03
        },
        {
          "ts": "2026-06-03T02:39:59.999000Z",
          "open": 66689.03,
          "high": 66842.0,
          "low": 66655.08,
          "close": 66826.01
        },
        {
          "ts": "2026-06-03T02:44:59.999000Z",
          "open": 66826.0,
          "high": 66848.0,
          "low": 66742.0,
          "close": 66742.0
        },
        {
          "ts": "2026-06-03T02:49:59.999000Z",
          "open": 66742.0,
          "high": 66802.97,
          "low": 66654.0,
          "close": 66765.33
        },
        {
          "ts": "2026-06-03T02:54:59.999000Z",
          "open": 66765.33,
          "high": 66818.0,
          "low": 66700.0,
          "close": 66700.01
        },
        {
          "ts": "2026-06-03T02:59:59.999000Z",
          "open": 66700.02,
          "high": 66708.0,
          "low": 66586.17,
          "close": 66620.01
        },
        {
          "ts": "2026-06-03T03:04:59.999000Z",
          "open": 66620.0,
          "high": 66653.67,
          "low": 66574.43,
          "close": 66607.32
        },
        {
          "ts": "2026-06-03T03:09:59.999000Z",
          "open": 66607.33,
          "high": 66628.18,
          "low": 66400.0,
          "close": 66417.34
        },
        {
          "ts": "2026-06-03T03:14:59.999000Z",
          "open": 66417.35,
          "high": 66515.87,
          "low": 66416.0,
          "close": 66515.87
        },
        {
          "ts": "2026-06-03T03:19:59.999000Z",
          "open": 66515.87,
          "high": 66622.0,
          "low": 66374.17,
          "close": 66396.0
        },
        {
          "ts": "2026-06-03T03:24:59.999000Z",
          "open": 66396.0,
          "high": 66471.91,
          "low": 66335.22,
          "close": 66430.34
        },
        {
          "ts": "2026-06-03T03:29:59.999000Z",
          "open": 66430.34,
          "high": 66434.0,
          "low": 66090.1,
          "close": 66147.81
        },
        {
          "ts": "2026-06-03T03:34:59.999000Z",
          "open": 66147.81,
          "high": 66261.74,
          "low": 66010.0,
          "close": 66037.2
        },
        {
          "ts": "2026-06-03T03:39:59.999000Z",
          "open": 66037.2,
          "high": 66134.29,
          "low": 66000.0,
          "close": 66018.0
        },
        {
          "ts": "2026-06-03T03:44:59.999000Z",
          "open": 66018.01,
          "high": 66095.54,
          "low": 65737.61,
          "close": 65755.01
        },
        {
          "ts": "2026-06-03T03:49:59.999000Z",
          "open": 65755.0,
          "high": 65910.94,
          "low": 65656.04,
          "close": 65700.39
        },
        {
          "ts": "2026-06-03T03:54:59.999000Z",
          "open": 65700.4,
          "high": 65936.68,
          "low": 65426.34,
          "close": 65936.67
        },
        {
          "ts": "2026-06-03T03:59:59.999000Z",
          "open": 65936.68,
          "high": 65978.0,
          "low": 65800.0,
          "close": 65849.9
        },
        {
          "ts": "2026-06-03T04:04:59.999000Z",
          "open": 65849.9,
          "high": 66512.0,
          "low": 65834.0,
          "close": 66496.01
        },
        {
          "ts": "2026-06-03T04:09:59.999000Z",
          "open": 66496.0,
          "high": 66603.41,
          "low": 66322.73,
          "close": 66373.13
        },
        {
          "ts": "2026-06-03T04:14:59.999000Z",
          "open": 66373.12,
          "high": 66428.24,
          "low": 66314.0,
          "close": 66340.0
        },
        {
          "ts": "2026-06-03T04:19:59.999000Z",
          "open": 66339.99,
          "high": 66480.0,
          "low": 66324.91,
          "close": 66359.99
        },
        {
          "ts": "2026-06-03T04:24:59.999000Z",
          "open": 66359.99,
          "high": 66466.0,
          "low": 66356.0,
          "close": 66465.99
        },
        {
          "ts": "2026-06-03T04:29:59.999000Z",
          "open": 66466.0,
          "high": 66623.44,
          "low": 66434.9,
          "close": 66579.32
        },
        {
          "ts": "2026-06-03T04:34:59.999000Z",
          "open": 66579.32,
          "high": 66579.32,
          "low": 66311.28,
          "close": 66464.64
        },
        {
          "ts": "2026-06-03T04:39:59.999000Z",
          "open": 66464.65,
          "high": 66502.0,
          "low": 66372.0,
          "close": 66376.81
        },
        {
          "ts": "2026-06-03T04:44:59.999000Z",
          "open": 66376.8,
          "high": 66476.0,
          "low": 66376.0,
          "close": 66440.91
        },
        {
          "ts": "2026-06-03T04:49:59.999000Z",
          "open": 66440.91,
          "high": 66510.01,
          "low": 66428.03,
          "close": 66451.2
        },
        {
          "ts": "2026-06-03T04:54:59.999000Z",
          "open": 66451.2,
          "high": 66451.2,
          "low": 66278.23,
          "close": 66326.19
        },
        {
          "ts": "2026-06-03T04:59:59.999000Z",
          "open": 66326.18,
          "high": 66467.48,
          "low": 66314.4,
          "close": 66465.98
        },
        {
          "ts": "2026-06-03T05:04:59.999000Z",
          "open": 66465.99,
          "high": 67047.26,
          "low": 66465.99,
          "close": 67013.26
        },
        {
          "ts": "2026-06-03T05:09:59.999000Z",
          "open": 67013.26,
          "high": 67076.0,
          "low": 66901.03,
          "close": 67075.99
        },
        {
          "ts": "2026-06-03T05:14:59.999000Z",
          "open": 67076.0,
          "high": 67268.63,
          "low": 67052.0,
          "close": 67135.99
        },
        {
          "ts": "2026-06-03T05:19:59.999000Z",
          "open": 67135.99,
          "high": 67284.02,
          "low": 67117.91,
          "close": 67174.0
        },
        {
          "ts": "2026-06-03T05:24:59.999000Z",
          "open": 67174.0,
          "high": 67191.99,
          "low": 67027.38,
          "close": 67056.85
        },
        {
          "ts": "2026-06-03T05:29:59.999000Z",
          "open": 67056.85,
          "high": 67103.07,
          "low": 66980.65,
          "close": 67103.06
        },
        {
          "ts": "2026-06-03T05:34:59.999000Z",
          "open": 67103.07,
          "high": 67103.07,
          "low": 66775.0,
          "close": 66958.0
        },
        {
          "ts": "2026-06-03T05:39:59.999000Z",
          "open": 66958.0,
          "high": 66970.0,
          "low": 66823.94,
          "close": 66949.99
        },
        {
          "ts": "2026-06-03T05:44:59.999000Z",
          "open": 66950.0,
          "high": 67062.0,
          "low": 66942.97,
          "close": 67026.14
        },
        {
          "ts": "2026-06-03T05:49:59.999000Z",
          "open": 67026.14,
          "high": 67103.96,
          "low": 67024.6,
          "close": 67103.96
        },
        {
          "ts": "2026-06-03T05:54:59.999000Z",
          "open": 67103.96,
          "high": 67364.24,
          "low": 67101.29,
          "close": 67322.91
        },
        {
          "ts": "2026-06-03T05:59:59.999000Z",
          "open": 67322.9,
          "high": 67398.28,
          "low": 67274.0,
          "close": 67330.01
        },
        {
          "ts": "2026-06-03T06:04:59.999000Z",
          "open": 67330.0,
          "high": 67374.0,
          "low": 67203.34,
          "close": 67249.97
        },
        {
          "ts": "2026-06-03T06:09:59.999000Z",
          "open": 67249.98,
          "high": 67318.26,
          "low": 67194.0,
          "close": 67204.01
        },
        {
          "ts": "2026-06-03T06:14:59.999000Z",
          "open": 67204.01,
          "high": 67207.52,
          "low": 67109.06,
          "close": 67160.0
        },
        {
          "ts": "2026-06-03T06:19:59.999000Z",
          "open": 67160.0,
          "high": 67275.99,
          "low": 67150.0,
          "close": 67222.0
        },
        {
          "ts": "2026-06-03T06:24:59.999000Z",
          "open": 67222.0,
          "high": 67366.93,
          "low": 67222.0,
          "close": 67340.93
        },
        {
          "ts": "2026-06-03T06:29:59.999000Z",
          "open": 67340.94,
          "high": 67355.36,
          "low": 67234.53,
          "close": 67253.63
        },
        {
          "ts": "2026-06-03T06:34:59.999000Z",
          "open": 67253.64,
          "high": 67464.87,
          "low": 67179.47,
          "close": 67464.87
        },
        {
          "ts": "2026-06-03T06:39:59.999000Z",
          "open": 67464.87,
          "high": 67516.0,
          "low": 67404.81,
          "close": 67492.0
        },
        {
          "ts": "2026-06-03T06:44:59.999000Z",
          "open": 67491.99,
          "high": 67498.0,
          "low": 67302.98,
          "close": 67316.83
        },
        {
          "ts": "2026-06-03T06:49:59.999000Z",
          "open": 67316.83,
          "high": 67337.0,
          "low": 67205.94,
          "close": 67207.17
        },
        {
          "ts": "2026-06-03T06:54:59.999000Z",
          "open": 67207.17,
          "high": 67207.17,
          "low": 67055.68,
          "close": 67059.99
        },
        {
          "ts": "2026-06-03T06:59:59.999000Z",
          "open": 67059.99,
          "high": 67080.0,
          "low": 66962.95,
          "close": 66983.27
        },
        {
          "ts": "2026-06-03T07:04:59.999000Z",
          "open": 66983.27,
          "high": 67000.0,
          "low": 66872.01,
          "close": 66979.99
        },
        {
          "ts": "2026-06-03T07:09:59.999000Z",
          "open": 66979.99,
          "high": 67081.43,
          "low": 66979.99,
          "close": 67049.99
        },
        {
          "ts": "2026-06-03T07:14:59.999000Z",
          "open": 67050.0,
          "high": 67150.0,
          "low": 67049.99,
          "close": 67072.0
        },
        {
          "ts": "2026-06-03T07:19:59.999000Z",
          "open": 67072.0,
          "high": 67334.4,
          "low": 67028.0,
          "close": 67268.01
        },
        {
          "ts": "2026-06-03T07:24:59.999000Z",
          "open": 67268.01,
          "high": 67276.05,
          "low": 67169.45,
          "close": 67203.95
        },
        {
          "ts": "2026-06-03T07:29:59.999000Z",
          "open": 67203.94,
          "high": 67234.0,
          "low": 67156.0,
          "close": 67191.55
        },
        {
          "ts": "2026-06-03T07:34:59.999000Z",
          "open": 67191.54,
          "high": 67266.51,
          "low": 67175.49,
          "close": 67260.01
        },
        {
          "ts": "2026-06-03T07:39:59.999000Z",
          "open": 67260.01,
          "high": 67287.12,
          "low": 67190.58,
          "close": 67233.37
        },
        {
          "ts": "2026-06-03T07:44:59.999000Z",
          "open": 67233.37,
          "high": 67237.23,
          "low": 67078.91,
          "close": 67208.49
        },
        {
          "ts": "2026-06-03T07:49:59.999000Z",
          "open": 67208.5,
          "high": 67304.55,
          "low": 67188.01,
          "close": 67304.55
        },
        {
          "ts": "2026-06-03T07:54:59.999000Z",
          "open": 67304.55,
          "high": 67322.9,
          "low": 67286.03,
          "close": 67305.63
        },
        {
          "ts": "2026-06-03T07:59:59.999000Z",
          "open": 67305.63,
          "high": 67305.64,
          "low": 67208.01,
          "close": 67220.03
        },
        {
          "ts": "2026-06-03T08:04:59.999000Z",
          "open": 67220.03,
          "high": 67264.34,
          "low": 67165.15,
          "close": 67232.68
        },
        {
          "ts": "2026-06-03T08:09:59.999000Z",
          "open": 67232.69,
          "high": 67247.04,
          "low": 67126.01,
          "close": 67148.52
        },
        {
          "ts": "2026-06-03T08:14:59.999000Z",
          "open": 67148.53,
          "high": 67151.16,
          "low": 67066.55,
          "close": 67070.0
        },
        {
          "ts": "2026-06-03T08:19:59.999000Z",
          "open": 67069.99,
          "high": 67146.67,
          "low": 67025.68,
          "close": 67117.06
        },
        {
          "ts": "2026-06-03T08:24:59.999000Z",
          "open": 67117.06,
          "high": 67117.06,
          "low": 67014.12,
          "close": 67014.13
        },
        {
          "ts": "2026-06-03T08:29:59.999000Z",
          "open": 67014.13,
          "high": 67061.62,
          "low": 67006.06,
          "close": 67027.6
        },
        {
          "ts": "2026-06-03T08:34:59.999000Z",
          "open": 67027.61,
          "high": 67232.88,
          "low": 67027.61,
          "close": 67111.43
        },
        {
          "ts": "2026-06-03T08:39:59.999000Z",
          "open": 67111.43,
          "high": 67131.74,
          "low": 66974.0,
          "close": 66979.19
        },
        {
          "ts": "2026-06-03T08:44:59.999000Z",
          "open": 66979.18,
          "high": 67131.37,
          "low": 66974.0,
          "close": 67088.32
        },
        {
          "ts": "2026-06-03T08:49:59.999000Z",
          "open": 67088.33,
          "high": 67145.75,
          "low": 67014.12,
          "close": 67118.88
        },
        {
          "ts": "2026-06-03T08:54:59.999000Z",
          "open": 67118.89,
          "high": 67177.82,
          "low": 66978.0,
          "close": 67068.74
        },
        {
          "ts": "2026-06-03T08:59:59.999000Z",
          "open": 67068.75,
          "high": 67068.75,
          "low": 67020.72,
          "close": 67028.0
        },
        {
          "ts": "2026-06-03T09:04:59.999000Z",
          "open": 67028.01,
          "high": 67095.33,
          "low": 66969.91,
          "close": 67021.19
        },
        {
          "ts": "2026-06-03T09:09:59.999000Z",
          "open": 67021.18,
          "high": 67105.03,
          "low": 66986.0,
          "close": 67079.99
        },
        {
          "ts": "2026-06-03T09:14:59.999000Z",
          "open": 67079.99,
          "high": 67079.99,
          "low": 66942.0,
          "close": 66962.05
        },
        {
          "ts": "2026-06-03T09:19:59.999000Z",
          "open": 66962.05,
          "high": 66964.0,
          "low": 66860.0,
          "close": 66860.01
        },
        {
          "ts": "2026-06-03T09:24:59.999000Z",
          "open": 66860.0,
          "high": 66895.1,
          "low": 66824.54,
          "close": 66824.55
        },
        {
          "ts": "2026-06-03T09:29:59.999000Z",
          "open": 66824.55,
          "high": 66908.0,
          "low": 66808.27,
          "close": 66832.01
        },
        {
          "ts": "2026-06-03T09:34:59.999000Z",
          "open": 66832.01,
          "high": 66864.36,
          "low": 66816.96,
          "close": 66836.0
        },
        {
          "ts": "2026-06-03T09:39:59.999000Z",
          "open": 66836.01,
          "high": 66836.01,
          "low": 66750.0,
          "close": 66754.91
        },
        {
          "ts": "2026-06-03T09:44:59.999000Z",
          "open": 66754.92,
          "high": 66775.11,
          "low": 66728.19,
          "close": 66733.42
        },
        {
          "ts": "2026-06-03T09:49:59.999000Z",
          "open": 66733.42,
          "high": 67036.52,
          "low": 66656.48,
          "close": 67023.02
        },
        {
          "ts": "2026-06-03T09:54:59.999000Z",
          "open": 67023.02,
          "high": 67322.0,
          "low": 67023.02,
          "close": 67129.63
        },
        {
          "ts": "2026-06-03T09:59:59.999000Z",
          "open": 67129.63,
          "high": 67195.06,
          "low": 67075.17,
          "close": 67075.17
        },
        {
          "ts": "2026-06-03T10:04:59.999000Z",
          "open": 67075.18,
          "high": 67178.0,
          "low": 67068.51,
          "close": 67178.0
        },
        {
          "ts": "2026-06-03T10:09:59.999000Z",
          "open": 67178.0,
          "high": 67476.69,
          "low": 67177.99,
          "close": 67440.0
        },
        {
          "ts": "2026-06-03T10:14:59.999000Z",
          "open": 67440.01,
          "high": 67454.24,
          "low": 67243.41,
          "close": 67305.99
        },
        {
          "ts": "2026-06-03T10:19:59.999000Z",
          "open": 67305.98,
          "high": 67332.0,
          "low": 67200.0,
          "close": 67204.4
        },
        {
          "ts": "2026-06-03T10:24:59.999000Z",
          "open": 67204.4,
          "high": 67291.29,
          "low": 67192.88,
          "close": 67243.24
        },
        {
          "ts": "2026-06-03T10:29:59.999000Z",
          "open": 67243.25,
          "high": 67318.0,
          "low": 67219.97,
          "close": 67318.0
        },
        {
          "ts": "2026-06-03T10:34:59.999000Z",
          "open": 67318.0,
          "high": 67386.28,
          "low": 67290.0,
          "close": 67328.57
        },
        {
          "ts": "2026-06-03T10:39:59.999000Z",
          "open": 67328.57,
          "high": 67414.0,
          "low": 67202.54,
          "close": 67336.48
        },
        {
          "ts": "2026-06-03T10:44:59.999000Z",
          "open": 67336.47,
          "high": 67336.48,
          "low": 67221.05,
          "close": 67234.15
        },
        {
          "ts": "2026-06-03T10:49:59.999000Z",
          "open": 67234.15,
          "high": 67246.0,
          "low": 67200.0,
          "close": 67230.0
        },
        {
          "ts": "2026-06-03T10:54:59.999000Z",
          "open": 67230.0,
          "high": 67231.54,
          "low": 67182.72,
          "close": 67231.54
        },
        {
          "ts": "2026-06-03T10:59:59.999000Z",
          "open": 67231.54,
          "high": 67320.44,
          "low": 67231.54,
          "close": 67294.52
        },
        {
          "ts": "2026-06-03T11:04:59.999000Z",
          "open": 67294.51,
          "high": 67366.82,
          "low": 67244.0,
          "close": 67257.99
        },
        {
          "ts": "2026-06-03T11:09:59.999000Z",
          "open": 67258.0,
          "high": 67271.85,
          "low": 67203.18,
          "close": 67216.83
        },
        {
          "ts": "2026-06-03T11:14:59.999000Z",
          "open": 67216.83,
          "high": 67341.54,
          "low": 67206.4,
          "close": 67341.5
        },
        {
          "ts": "2026-06-03T11:19:59.999000Z",
          "open": 67341.5,
          "high": 67350.0,
          "low": 67292.94,
          "close": 67350.0
        },
        {
          "ts": "2026-06-03T11:24:59.999000Z",
          "open": 67350.0,
          "high": 67363.38,
          "low": 67308.6,
          "close": 67347.94
        },
        {
          "ts": "2026-06-03T11:29:59.999000Z",
          "open": 67347.94,
          "high": 67359.99,
          "low": 67308.0,
          "close": 67329.99
        },
        {
          "ts": "2026-06-03T11:34:59.999000Z",
          "open": 67330.0,
          "high": 67330.0,
          "low": 67172.0,
          "close": 67172.0
        },
        {
          "ts": "2026-06-03T11:39:59.999000Z",
          "open": 67172.01,
          "high": 67192.0,
          "low": 67111.0,
          "close": 67124.0
        },
        {
          "ts": "2026-06-03T11:44:59.999000Z",
          "open": 67124.0,
          "high": 67184.0,
          "low": 67114.0,
          "close": 67150.0
        },
        {
          "ts": "2026-06-03T11:49:59.999000Z",
          "open": 67150.01,
          "high": 67150.01,
          "low": 67065.63,
          "close": 67095.06
        },
        {
          "ts": "2026-06-03T11:54:59.999000Z",
          "open": 67095.06,
          "high": 67112.0,
          "low": 67068.0,
          "close": 67078.0
        },
        {
          "ts": "2026-06-03T11:59:59.999000Z",
          "open": 67078.0,
          "high": 67109.99,
          "low": 67056.58,
          "close": 67067.37
        },
        {
          "ts": "2026-06-03T12:04:59.999000Z",
          "open": 67067.37,
          "high": 67106.0,
          "low": 66950.0,
          "close": 67106.0
        },
        {
          "ts": "2026-06-03T12:09:59.999000Z",
          "open": 67105.99,
          "high": 67105.99,
          "low": 67039.44,
          "close": 67096.0
        },
        {
          "ts": "2026-06-03T12:14:59.999000Z",
          "open": 67095.99,
          "high": 67129.11,
          "low": 66886.87,
          "close": 66972.76
        },
        {
          "ts": "2026-06-03T12:19:59.999000Z",
          "open": 66972.75,
          "high": 66972.76,
          "low": 66808.27,
          "close": 66844.0
        },
        {
          "ts": "2026-06-03T12:24:59.999000Z",
          "open": 66843.99,
          "high": 66945.69,
          "low": 66782.65,
          "close": 66892.01
        },
        {
          "ts": "2026-06-03T12:29:59.999000Z",
          "open": 66892.01,
          "high": 67082.0,
          "low": 66882.0,
          "close": 67032.01
        },
        {
          "ts": "2026-06-03T12:34:59.999000Z",
          "open": 67032.02,
          "high": 67163.82,
          "low": 67009.02,
          "close": 67128.5
        },
        {
          "ts": "2026-06-03T12:39:59.999000Z",
          "open": 67128.49,
          "high": 67128.5,
          "low": 66840.0,
          "close": 66862.71
        },
        {
          "ts": "2026-06-03T12:44:59.999000Z",
          "open": 66862.71,
          "high": 66976.0,
          "low": 66840.06,
          "close": 66968.46
        },
        {
          "ts": "2026-06-03T12:49:59.999000Z",
          "open": 66968.46,
          "high": 67027.39,
          "low": 66925.37,
          "close": 67021.86
        },
        {
          "ts": "2026-06-03T12:54:59.999000Z",
          "open": 67021.86,
          "high": 67138.12,
          "low": 67016.77,
          "close": 67076.0
        },
        {
          "ts": "2026-06-03T12:59:59.999000Z",
          "open": 67075.99,
          "high": 67102.0,
          "low": 67020.0,
          "close": 67078.72
        },
        {
          "ts": "2026-06-03T13:04:59.999000Z",
          "open": 67078.72,
          "high": 67219.98,
          "low": 67048.0,
          "close": 67048.0
        },
        {
          "ts": "2026-06-03T13:09:59.999000Z",
          "open": 67048.0,
          "high": 67077.6,
          "low": 66984.0,
          "close": 67070.02
        },
        {
          "ts": "2026-06-03T13:14:59.999000Z",
          "open": 67070.02,
          "high": 67166.74,
          "low": 67070.01,
          "close": 67122.01
        },
        {
          "ts": "2026-06-03T13:19:59.999000Z",
          "open": 67122.01,
          "high": 67219.98,
          "low": 67110.0,
          "close": 67219.98
        },
        {
          "ts": "2026-06-03T13:24:59.999000Z",
          "open": 67219.97,
          "high": 67244.62,
          "low": 67098.43,
          "close": 67107.7
        },
        {
          "ts": "2026-06-03T13:29:59.999000Z",
          "open": 67107.71,
          "high": 67107.71,
          "low": 66834.05,
          "close": 66838.01
        },
        {
          "ts": "2026-06-03T13:34:59.999000Z",
          "open": 66838.01,
          "high": 67192.0,
          "low": 66838.01,
          "close": 67124.01
        },
        {
          "ts": "2026-06-03T13:39:59.999000Z",
          "open": 67124.0,
          "high": 67124.0,
          "low": 66853.03,
          "close": 66981.64
        },
        {
          "ts": "2026-06-03T13:44:59.999000Z",
          "open": 66981.65,
          "high": 66990.86,
          "low": 66717.82,
          "close": 66744.27
        },
        {
          "ts": "2026-06-03T13:49:59.999000Z",
          "open": 66744.26,
          "high": 66834.0,
          "low": 66635.0,
          "close": 66794.0
        },
        {
          "ts": "2026-06-03T13:54:59.999000Z",
          "open": 66794.0,
          "high": 67041.72,
          "low": 66762.01,
          "close": 66940.01
        },
        {
          "ts": "2026-06-03T13:59:59.999000Z",
          "open": 66940.0,
          "high": 66980.0,
          "low": 66767.32,
          "close": 66906.01
        },
        {
          "ts": "2026-06-03T14:04:59.999000Z",
          "open": 66906.0,
          "high": 66948.0,
          "low": 66751.99,
          "close": 66777.11
        },
        {
          "ts": "2026-06-03T14:09:59.999000Z",
          "open": 66777.11,
          "high": 66868.62,
          "low": 66739.56,
          "close": 66774.0
        },
        {
          "ts": "2026-06-03T14:14:59.999000Z",
          "open": 66774.0,
          "high": 66911.2,
          "low": 66754.0,
          "close": 66903.72
        },
        {
          "ts": "2026-06-03T14:19:59.999000Z",
          "open": 66903.72,
          "high": 66934.0,
          "low": 66694.0,
          "close": 66694.0
        },
        {
          "ts": "2026-06-03T14:24:59.999000Z",
          "open": 66694.01,
          "high": 66808.28,
          "low": 66643.96,
          "close": 66709.99
        },
        {
          "ts": "2026-06-03T14:29:59.999000Z",
          "open": 66710.0,
          "high": 66796.0,
          "low": 66658.3,
          "close": 66791.99
        },
        {
          "ts": "2026-06-03T14:34:59.999000Z",
          "open": 66792.0,
          "high": 66856.0,
          "low": 66707.21,
          "close": 66770.02
        },
        {
          "ts": "2026-06-03T14:39:59.999000Z",
          "open": 66770.02,
          "high": 66990.66,
          "low": 66770.02,
          "close": 66955.16
        },
        {
          "ts": "2026-06-03T14:44:59.999000Z",
          "open": 66955.16,
          "high": 66955.16,
          "low": 66732.24,
          "close": 66752.0
        },
        {
          "ts": "2026-06-03T14:49:59.999000Z",
          "open": 66751.99,
          "high": 66882.0,
          "low": 66745.87,
          "close": 66819.74
        },
        {
          "ts": "2026-06-03T14:54:59.999000Z",
          "open": 66819.74,
          "high": 66935.88,
          "low": 66744.0,
          "close": 66881.4
        },
        {
          "ts": "2026-06-03T14:59:59.999000Z",
          "open": 66881.41,
          "high": 66881.41,
          "low": 66772.0,
          "close": 66864.95
        },
        {
          "ts": "2026-06-03T15:04:59.999000Z",
          "open": 66864.95,
          "high": 66898.0,
          "low": 66760.0,
          "close": 66760.0
        },
        {
          "ts": "2026-06-03T15:09:59.999000Z",
          "open": 66760.0,
          "high": 66768.0,
          "low": 66515.11,
          "close": 66580.94
        },
        {
          "ts": "2026-06-03T15:14:59.999000Z",
          "open": 66580.93,
          "high": 66669.86,
          "low": 66500.0,
          "close": 66525.55
        },
        {
          "ts": "2026-06-03T15:19:59.999000Z",
          "open": 66525.55,
          "high": 66581.06,
          "low": 66344.16,
          "close": 66356.49
        },
        {
          "ts": "2026-06-03T15:24:59.999000Z",
          "open": 66356.5,
          "high": 66416.02,
          "low": 66256.52,
          "close": 66382.3
        },
        {
          "ts": "2026-06-03T15:29:59.999000Z",
          "open": 66382.29,
          "high": 66663.54,
          "low": 66324.0,
          "close": 66597.74
        },
        {
          "ts": "2026-06-03T15:34:59.999000Z",
          "open": 66597.74,
          "high": 66678.0,
          "low": 66324.95,
          "close": 66349.99
        },
        {
          "ts": "2026-06-03T15:39:59.999000Z",
          "open": 66350.0,
          "high": 66450.0,
          "low": 66226.82,
          "close": 66327.95
        },
        {
          "ts": "2026-06-03T15:44:59.999000Z",
          "open": 66327.95,
          "high": 66370.1,
          "low": 66270.0,
          "close": 66304.01
        },
        {
          "ts": "2026-06-03T15:49:59.999000Z",
          "open": 66304.01,
          "high": 66350.0,
          "low": 66144.0,
          "close": 66309.19
        },
        {
          "ts": "2026-06-03T15:54:59.999000Z",
          "open": 66309.19,
          "high": 66378.42,
          "low": 66177.4,
          "close": 66188.0
        },
        {
          "ts": "2026-06-03T15:59:59.999000Z",
          "open": 66188.0,
          "high": 66248.0,
          "low": 66076.0,
          "close": 66076.01
        },
        {
          "ts": "2026-06-03T16:04:59.999000Z",
          "open": 66076.01,
          "high": 66180.42,
          "low": 65872.5,
          "close": 66179.23
        },
        {
          "ts": "2026-06-03T16:09:59.999000Z",
          "open": 66179.22,
          "high": 66373.18,
          "low": 65941.65,
          "close": 66186.0
        },
        {
          "ts": "2026-06-03T16:14:59.999000Z",
          "open": 66186.0,
          "high": 66276.65,
          "low": 66040.01,
          "close": 66172.97
        },
        {
          "ts": "2026-06-03T16:19:59.999000Z",
          "open": 66172.97,
          "high": 66228.97,
          "low": 65932.8,
          "close": 66058.0
        },
        {
          "ts": "2026-06-03T16:24:59.999000Z",
          "open": 66058.0,
          "high": 66058.0,
          "low": 65633.57,
          "close": 65633.69
        },
        {
          "ts": "2026-06-03T16:29:59.999000Z",
          "open": 65633.69,
          "high": 65800.0,
          "low": 65555.0,
          "close": 65606.94
        },
        {
          "ts": "2026-06-03T16:34:59.999000Z",
          "open": 65606.94,
          "high": 65812.73,
          "low": 65586.44,
          "close": 65751.6
        },
        {
          "ts": "2026-06-03T16:39:59.999000Z",
          "open": 65751.6,
          "high": 65906.4,
          "low": 65696.0,
          "close": 65897.41
        },
        {
          "ts": "2026-06-03T16:44:59.999000Z",
          "open": 65897.4,
          "high": 65984.87,
          "low": 65837.2,
          "close": 65924.0
        },
        {
          "ts": "2026-06-03T16:49:59.999000Z",
          "open": 65924.0,
          "high": 66071.04,
          "low": 65866.0,
          "close": 65903.54
        },
        {
          "ts": "2026-06-03T16:54:59.999000Z",
          "open": 65903.54,
          "high": 65993.87,
          "low": 65822.4,
          "close": 65950.0
        },
        {
          "ts": "2026-06-03T16:59:59.999000Z",
          "open": 65950.01,
          "high": 66068.0,
          "low": 65933.58,
          "close": 66061.83
        },
        {
          "ts": "2026-06-03T17:04:59.999000Z",
          "open": 66061.83,
          "high": 66126.0,
          "low": 65891.78,
          "close": 65899.69
        },
        {
          "ts": "2026-06-03T17:09:59.999000Z",
          "open": 65899.68,
          "high": 65907.6,
          "low": 65730.41,
          "close": 65750.62
        },
        {
          "ts": "2026-06-03T17:14:59.999000Z",
          "open": 65750.61,
          "high": 65852.56,
          "low": 65704.8,
          "close": 65715.23
        },
        {
          "ts": "2026-06-03T17:19:59.999000Z",
          "open": 65715.23,
          "high": 65954.0,
          "low": 65715.23,
          "close": 65927.14
        },
        {
          "ts": "2026-06-03T17:24:59.999000Z",
          "open": 65927.14,
          "high": 65943.21,
          "low": 65791.51,
          "close": 65819.11
        },
        {
          "ts": "2026-06-03T17:29:59.999000Z",
          "open": 65819.11,
          "high": 65984.88,
          "low": 65819.11,
          "close": 65945.93
        },
        {
          "ts": "2026-06-03T17:34:59.999000Z",
          "open": 65945.93,
          "high": 66177.97,
          "low": 65851.81,
          "close": 66164.01
        },
        {
          "ts": "2026-06-03T17:39:59.999000Z",
          "open": 66164.01,
          "high": 66189.8,
          "low": 66071.27,
          "close": 66172.0
        },
        {
          "ts": "2026-06-03T17:44:59.999000Z",
          "open": 66172.0,
          "high": 66184.76,
          "low": 66099.0,
          "close": 66109.39
        },
        {
          "ts": "2026-06-03T17:49:59.999000Z",
          "open": 66109.38,
          "high": 66114.0,
          "low": 65945.43,
          "close": 65954.28
        },
        {
          "ts": "2026-06-03T17:54:59.999000Z",
          "open": 65954.28,
          "high": 65981.31,
          "low": 65806.0,
          "close": 65894.0
        },
        {
          "ts": "2026-06-03T17:59:59.999000Z",
          "open": 65894.0,
          "high": 65992.0,
          "low": 65852.64,
          "close": 65964.08
        },
        {
          "ts": "2026-06-03T18:04:59.999000Z",
          "open": 65964.08,
          "high": 66092.0,
          "low": 65964.08,
          "close": 66014.01
        },
        {
          "ts": "2026-06-03T18:09:59.999000Z",
          "open": 66014.01,
          "high": 66068.01,
          "low": 65994.0,
          "close": 66054.24
        },
        {
          "ts": "2026-06-03T18:14:59.999000Z",
          "open": 66054.25,
          "high": 66054.25,
          "low": 65860.73,
          "close": 65972.81
        },
        {
          "ts": "2026-06-03T18:19:59.999000Z",
          "open": 65972.8,
          "high": 65972.8,
          "low": 65758.0,
          "close": 65813.84
        },
        {
          "ts": "2026-06-03T18:24:59.999000Z",
          "open": 65813.84,
          "high": 65904.0,
          "low": 65744.01,
          "close": 65902.01
        },
        {
          "ts": "2026-06-03T18:29:59.999000Z",
          "open": 65902.01,
          "high": 65924.0,
          "low": 65852.65,
          "close": 65899.99
        },
        {
          "ts": "2026-06-03T18:34:59.999000Z",
          "open": 65900.0,
          "high": 65984.88,
          "low": 65858.0,
          "close": 65866.09
        },
        {
          "ts": "2026-06-03T18:39:59.999000Z",
          "open": 65866.09,
          "high": 65978.0,
          "low": 65784.07,
          "close": 65968.01
        },
        {
          "ts": "2026-06-03T18:44:59.999000Z",
          "open": 65968.01,
          "high": 66098.0,
          "low": 65968.0,
          "close": 66044.17
        },
        {
          "ts": "2026-06-03T18:49:59.999000Z",
          "open": 66044.16,
          "high": 66161.24,
          "low": 66034.0,
          "close": 66047.63
        },
        {
          "ts": "2026-06-03T18:54:59.999000Z",
          "open": 66047.63,
          "high": 66102.0,
          "low": 66036.0,
          "close": 66070.01
        },
        {
          "ts": "2026-06-03T18:59:59.999000Z",
          "open": 66070.01,
          "high": 66125.77,
          "low": 66018.0,
          "close": 66036.57
        },
        {
          "ts": "2026-06-03T19:04:59.999000Z",
          "open": 66036.56,
          "high": 66048.0,
          "low": 65980.92,
          "close": 66036.63
        },
        {
          "ts": "2026-06-03T19:09:59.999000Z",
          "open": 66036.64,
          "high": 66036.64,
          "low": 65904.45,
          "close": 65910.01
        },
        {
          "ts": "2026-06-03T19:14:59.999000Z",
          "open": 65910.01,
          "high": 65970.02,
          "low": 65902.0,
          "close": 65970.02
        },
        {
          "ts": "2026-06-03T19:19:59.999000Z",
          "open": 65970.02,
          "high": 66054.0,
          "low": 65899.99,
          "close": 65932.0
        },
        {
          "ts": "2026-06-03T19:24:59.999000Z",
          "open": 65932.0,
          "high": 65940.0,
          "low": 65698.0,
          "close": 65745.11
        },
        {
          "ts": "2026-06-03T19:29:59.999000Z",
          "open": 65745.1,
          "high": 65766.0,
          "low": 65600.0,
          "close": 65658.18
        },
        {
          "ts": "2026-06-03T19:34:59.999000Z",
          "open": 65658.01,
          "high": 65741.76,
          "low": 65624.89,
          "close": 65722.78
        },
        {
          "ts": "2026-06-03T19:39:59.999000Z",
          "open": 65722.01,
          "high": 65816.0,
          "low": 65694.0,
          "close": 65768.01
        },
        {
          "ts": "2026-06-03T19:44:59.999000Z",
          "open": 65768.01,
          "high": 65825.1,
          "low": 65749.42,
          "close": 65764.01
        },
        {
          "ts": "2026-06-03T19:49:59.999000Z",
          "open": 65764.0,
          "high": 65847.99,
          "low": 65746.67,
          "close": 65746.9
        },
        {
          "ts": "2026-06-03T19:54:59.999000Z",
          "open": 65746.89,
          "high": 65746.89,
          "low": 65359.3,
          "close": 65359.31
        },
        {
          "ts": "2026-06-03T19:59:59.999000Z",
          "open": 65359.31,
          "high": 65487.86,
          "low": 65251.0,
          "close": 65462.0
        },
        {
          "ts": "2026-06-03T20:04:59.999000Z",
          "open": 65461.99,
          "high": 65462.18,
          "low": 65252.0,
          "close": 65319.58
        },
        {
          "ts": "2026-06-03T20:09:59.999000Z",
          "open": 65319.58,
          "high": 65420.57,
          "low": 65300.0,
          "close": 65389.99
        },
        {
          "ts": "2026-06-03T20:14:59.999000Z",
          "open": 65390.0,
          "high": 65614.74,
          "low": 65389.99,
          "close": 65580.01
        },
        {
          "ts": "2026-06-03T20:19:59.999000Z",
          "open": 65580.0,
          "high": 65580.0,
          "low": 65283.69,
          "close": 65340.84
        },
        {
          "ts": "2026-06-03T20:24:59.999000Z",
          "open": 65340.85,
          "high": 65500.0,
          "low": 65340.01,
          "close": 65487.36
        },
        {
          "ts": "2026-06-03T20:29:59.999000Z",
          "open": 65487.36,
          "high": 65594.0,
          "low": 65487.35,
          "close": 65548.01
        },
        {
          "ts": "2026-06-03T20:34:59.999000Z",
          "open": 65548.01,
          "high": 65566.0,
          "low": 65411.4,
          "close": 65486.0
        },
        {
          "ts": "2026-06-03T20:39:59.999000Z",
          "open": 65486.0,
          "high": 65498.0,
          "low": 65320.0,
          "close": 65334.0
        },
        {
          "ts": "2026-06-03T20:44:59.999000Z",
          "open": 65333.99,
          "high": 65363.99,
          "low": 65179.99,
          "close": 65190.63
        },
        {
          "ts": "2026-06-03T20:49:59.999000Z",
          "open": 65190.63,
          "high": 65233.83,
          "low": 65065.31,
          "close": 65112.01
        },
        {
          "ts": "2026-06-03T20:54:59.999000Z",
          "open": 65112.01,
          "high": 65198.0,
          "low": 65039.0,
          "close": 65045.59
        },
        {
          "ts": "2026-06-03T20:59:59.999000Z",
          "open": 65045.58,
          "high": 65045.58,
          "low": 64766.0,
          "close": 65007.27
        },
        {
          "ts": "2026-06-03T21:04:59.999000Z",
          "open": 65007.27,
          "high": 65408.98,
          "low": 64960.87,
          "close": 65277.15
        },
        {
          "ts": "2026-06-03T21:09:59.999000Z",
          "open": 65277.15,
          "high": 65579.58,
          "low": 65277.15,
          "close": 65528.01
        },
        {
          "ts": "2026-06-03T21:14:59.999000Z",
          "open": 65528.0,
          "high": 65528.0,
          "low": 65332.0,
          "close": 65413.39
        },
        {
          "ts": "2026-06-03T21:19:59.999000Z",
          "open": 65413.38,
          "high": 65569.81,
          "low": 65401.38,
          "close": 65536.0
        },
        {
          "ts": "2026-06-03T21:24:59.999000Z",
          "open": 65536.0,
          "high": 65586.0,
          "low": 65460.61,
          "close": 65526.71
        },
        {
          "ts": "2026-06-03T21:29:59.999000Z",
          "open": 65526.71,
          "high": 65592.11,
          "low": 65472.01,
          "close": 65522.01
        },
        {
          "ts": "2026-06-03T21:34:59.999000Z",
          "open": 65522.0,
          "high": 65644.25,
          "low": 65492.24,
          "close": 65592.38
        },
        {
          "ts": "2026-06-03T21:39:59.999000Z",
          "open": 65592.39,
          "high": 65720.01,
          "low": 65400.0,
          "close": 65462.09
        },
        {
          "ts": "2026-06-03T21:44:59.999000Z",
          "open": 65462.08,
          "high": 65585.95,
          "low": 65300.0,
          "close": 65518.0
        },
        {
          "ts": "2026-06-03T21:49:59.999000Z",
          "open": 65517.99,
          "high": 65860.0,
          "low": 65480.0,
          "close": 65774.78
        },
        {
          "ts": "2026-06-03T21:54:59.999000Z",
          "open": 65774.77,
          "high": 65774.77,
          "low": 65541.69,
          "close": 65672.0
        },
        {
          "ts": "2026-06-03T21:59:59.999000Z",
          "open": 65671.99,
          "high": 65799.94,
          "low": 65616.0,
          "close": 65768.88
        },
        {
          "ts": "2026-06-03T22:04:59.999000Z",
          "open": 65768.89,
          "high": 65841.23,
          "low": 65524.96,
          "close": 65543.71
        },
        {
          "ts": "2026-06-03T22:09:59.999000Z",
          "open": 65543.72,
          "high": 65652.0,
          "low": 65460.99,
          "close": 65562.01
        },
        {
          "ts": "2026-06-03T22:14:59.999000Z",
          "open": 65562.01,
          "high": 65565.57,
          "low": 65300.0,
          "close": 65328.0
        },
        {
          "ts": "2026-06-03T22:19:59.999000Z",
          "open": 65328.0,
          "high": 65328.0,
          "low": 65104.0,
          "close": 65275.05
        },
        {
          "ts": "2026-06-03T22:24:59.999000Z",
          "open": 65275.05,
          "high": 65289.01,
          "low": 65000.0,
          "close": 65234.01
        },
        {
          "ts": "2026-06-03T22:29:59.999000Z",
          "open": 65234.01,
          "high": 65278.0,
          "low": 65112.0,
          "close": 65168.01
        },
        {
          "ts": "2026-06-03T22:34:59.999000Z",
          "open": 65168.0,
          "high": 65257.33,
          "low": 65122.0,
          "close": 65220.0
        },
        {
          "ts": "2026-06-03T22:39:59.999000Z",
          "open": 65220.0,
          "high": 65254.0,
          "low": 64938.35,
          "close": 65020.48
        },
        {
          "ts": "2026-06-03T22:44:59.999000Z",
          "open": 65020.48,
          "high": 65156.0,
          "low": 65006.0,
          "close": 65065.99
        },
        {
          "ts": "2026-06-03T22:49:59.999000Z",
          "open": 65065.99,
          "high": 65094.0,
          "low": 64814.0,
          "close": 64928.69
        },
        {
          "ts": "2026-06-03T22:54:59.999000Z",
          "open": 64928.68,
          "high": 65017.99,
          "low": 64819.75,
          "close": 64828.01
        },
        {
          "ts": "2026-06-03T22:59:59.999000Z",
          "open": 64828.01,
          "high": 65027.68,
          "low": 64778.15,
          "close": 64912.98
        },
        {
          "ts": "2026-06-03T23:04:59.999000Z",
          "open": 64912.97,
          "high": 64979.99,
          "low": 64500.0,
          "close": 64650.0
        },
        {
          "ts": "2026-06-03T23:09:59.999000Z",
          "open": 64650.0,
          "high": 64764.0,
          "low": 64459.14,
          "close": 64482.42
        },
        {
          "ts": "2026-06-03T23:14:59.999000Z",
          "open": 64482.42,
          "high": 64734.81,
          "low": 64409.0,
          "close": 64604.63
        },
        {
          "ts": "2026-06-03T23:19:59.999000Z",
          "open": 64604.62,
          "high": 64650.46,
          "low": 64380.0,
          "close": 64503.12
        },
        {
          "ts": "2026-06-03T23:24:59.999000Z",
          "open": 64503.13,
          "high": 64555.49,
          "low": 64362.79,
          "close": 64382.26
        },
        {
          "ts": "2026-06-03T23:29:59.999000Z",
          "open": 64382.27,
          "high": 64534.2,
          "low": 64382.27,
          "close": 64505.4
        },
        {
          "ts": "2026-06-03T23:34:59.999000Z",
          "open": 64505.4,
          "high": 64633.5,
          "low": 64450.0,
          "close": 64528.74
        },
        {
          "ts": "2026-06-03T23:39:59.999000Z",
          "open": 64528.74,
          "high": 64565.08,
          "low": 64276.62,
          "close": 64312.51
        },
        {
          "ts": "2026-06-03T23:44:59.999000Z",
          "open": 64313.04,
          "high": 64391.05,
          "low": 64252.51,
          "close": 64260.0
        },
        {
          "ts": "2026-06-03T23:49:59.999000Z",
          "open": 64260.0,
          "high": 64346.54,
          "low": 64203.28,
          "close": 64296.11
        },
        {
          "ts": "2026-06-03T23:54:59.999000Z",
          "open": 64296.1,
          "high": 64317.66,
          "low": 64092.49,
          "close": 64094.0
        },
        {
          "ts": "2026-06-03T23:59:59.999000Z",
          "open": 64094.0,
          "high": 64184.95,
          "low": 64092.5,
          "close": 64142.75
        },
        {
          "ts": "2026-06-04T00:04:59.999000Z",
          "open": 64142.75,
          "high": 64428.0,
          "low": 64127.5,
          "close": 64351.15
        },
        {
          "ts": "2026-06-04T00:09:59.999000Z",
          "open": 64351.14,
          "high": 64396.0,
          "low": 64163.66,
          "close": 64327.99
        },
        {
          "ts": "2026-06-04T00:14:59.999000Z",
          "open": 64327.99,
          "high": 64385.99,
          "low": 64246.56,
          "close": 64316.53
        },
        {
          "ts": "2026-06-04T00:19:59.999000Z",
          "open": 64316.53,
          "high": 64387.44,
          "low": 64208.25,
          "close": 64270.0
        },
        {
          "ts": "2026-06-04T00:24:59.999000Z",
          "open": 64270.0,
          "high": 64346.0,
          "low": 63985.0,
          "close": 64016.0
        },
        {
          "ts": "2026-06-04T00:29:59.999000Z",
          "open": 64016.0,
          "high": 64036.91,
          "low": 63358.01,
          "close": 63358.01
        },
        {
          "ts": "2026-06-04T00:34:59.999000Z",
          "open": 63358.01,
          "high": 63768.0,
          "low": 63324.13,
          "close": 63719.04
        },
        {
          "ts": "2026-06-04T00:39:59.999000Z",
          "open": 63719.03,
          "high": 63815.74,
          "low": 63070.0,
          "close": 63127.29
        },
        {
          "ts": "2026-06-04T00:44:59.999000Z",
          "open": 63127.28,
          "high": 63654.57,
          "low": 63127.1,
          "close": 63595.33
        },
        {
          "ts": "2026-06-04T00:49:59.999000Z",
          "open": 63595.34,
          "high": 63601.41,
          "low": 63198.01,
          "close": 63252.01
        },
        {
          "ts": "2026-06-04T00:54:59.999000Z",
          "open": 63252.01,
          "high": 63370.0,
          "low": 63000.0,
          "close": 63178.07
        },
        {
          "ts": "2026-06-04T00:59:59.999000Z",
          "open": 63178.08,
          "high": 63350.0,
          "low": 63068.0,
          "close": 63344.97
        },
        {
          "ts": "2026-06-04T01:04:59.999000Z",
          "open": 63344.98,
          "high": 63500.0,
          "low": 63214.0,
          "close": 63387.18
        },
        {
          "ts": "2026-06-04T01:09:59.999000Z",
          "open": 63387.18,
          "high": 63478.0,
          "low": 63166.0,
          "close": 63316.0
        },
        {
          "ts": "2026-06-04T01:14:59.999000Z",
          "open": 63316.0,
          "high": 63366.0,
          "low": 63100.01,
          "close": 63124.0
        },
        {
          "ts": "2026-06-04T01:19:59.999000Z",
          "open": 63124.0,
          "high": 63134.0,
          "low": 62800.63,
          "close": 62885.64
        },
        {
          "ts": "2026-06-04T01:24:59.999000Z",
          "open": 62885.63,
          "high": 63018.33,
          "low": 62569.0,
          "close": 62608.72
        },
        {
          "ts": "2026-06-04T01:29:59.999000Z",
          "open": 62608.72,
          "high": 62943.6,
          "low": 62603.28,
          "close": 62699.99
        },
        {
          "ts": "2026-06-04T01:34:59.999000Z",
          "open": 62700.0,
          "high": 62960.44,
          "low": 62697.37,
          "close": 62905.21
        },
        {
          "ts": "2026-06-04T01:39:59.999000Z",
          "open": 62905.22,
          "high": 63161.43,
          "low": 62750.07,
          "close": 62800.0
        },
        {
          "ts": "2026-06-04T01:44:59.999000Z",
          "open": 62800.01,
          "high": 62967.6,
          "low": 62790.78,
          "close": 62825.0
        },
        {
          "ts": "2026-06-04T01:49:59.999000Z",
          "open": 62825.0,
          "high": 62873.78,
          "low": 62500.0,
          "close": 62508.75
        },
        {
          "ts": "2026-06-04T01:54:59.999000Z",
          "open": 62508.75,
          "high": 62587.78,
          "low": 62238.0,
          "close": 62247.34
        },
        {
          "ts": "2026-06-04T01:59:59.999000Z",
          "open": 62247.34,
          "high": 62338.25,
          "low": 62100.01,
          "close": 62178.1
        },
        {
          "ts": "2026-06-04T02:04:59.999000Z",
          "open": 62178.1,
          "high": 62233.09,
          "low": 61383.56,
          "close": 61466.67
        },
        {
          "ts": "2026-06-04T02:09:59.999000Z",
          "open": 61466.68,
          "high": 62444.82,
          "low": 61461.75,
          "close": 62022.25
        },
        {
          "ts": "2026-06-04T02:14:59.999000Z",
          "open": 62022.25,
          "high": 62491.24,
          "low": 61971.83,
          "close": 62402.13
        },
        {
          "ts": "2026-06-04T02:19:59.999000Z",
          "open": 62402.14,
          "high": 62606.62,
          "low": 62150.0,
          "close": 62521.42
        },
        {
          "ts": "2026-06-04T02:24:59.999000Z",
          "open": 62521.42,
          "high": 63049.59,
          "low": 62502.76,
          "close": 63026.88
        },
        {
          "ts": "2026-06-04T02:29:59.999000Z",
          "open": 63026.88,
          "high": 63100.0,
          "low": 62816.9,
          "close": 62997.98
        },
        {
          "ts": "2026-06-04T02:34:59.999000Z",
          "open": 62997.97,
          "high": 63447.59,
          "low": 62901.0,
          "close": 63276.61
        },
        {
          "ts": "2026-06-04T02:39:59.999000Z",
          "open": 63276.61,
          "high": 63352.52,
          "low": 63040.51,
          "close": 63347.43
        },
        {
          "ts": "2026-06-04T02:44:59.999000Z",
          "open": 63347.42,
          "high": 63499.41,
          "low": 63250.12,
          "close": 63410.0
        },
        {
          "ts": "2026-06-04T02:49:59.999000Z",
          "open": 63410.0,
          "high": 63622.7,
          "low": 63325.52,
          "close": 63537.34
        },
        {
          "ts": "2026-06-04T02:54:59.999000Z",
          "open": 63537.35,
          "high": 63587.89,
          "low": 63258.91,
          "close": 63287.43
        },
        {
          "ts": "2026-06-04T02:59:59.999000Z",
          "open": 63287.43,
          "high": 63330.95,
          "low": 63155.7,
          "close": 63231.99
        },
        {
          "ts": "2026-06-04T03:04:59.999000Z",
          "open": 63232.0,
          "high": 63775.64,
          "low": 63218.48,
          "close": 63714.05
        },
        {
          "ts": "2026-06-04T03:09:59.999000Z",
          "open": 63714.04,
          "high": 64029.36,
          "low": 63652.36,
          "close": 63813.08
        },
        {
          "ts": "2026-06-04T03:14:59.999000Z",
          "open": 63813.09,
          "high": 63977.0,
          "low": 63705.61,
          "close": 63960.77
        },
        {
          "ts": "2026-06-04T03:19:59.999000Z",
          "open": 63960.77,
          "high": 64142.85,
          "low": 63956.0,
          "close": 64075.99
        },
        {
          "ts": "2026-06-04T03:24:59.999000Z",
          "open": 64075.99,
          "high": 64075.99,
          "low": 63884.35,
          "close": 63907.72
        },
        {
          "ts": "2026-06-04T03:29:59.999000Z",
          "open": 63907.73,
          "high": 64015.99,
          "low": 63900.0,
          "close": 63919.99
        },
        {
          "ts": "2026-06-04T03:34:59.999000Z",
          "open": 63920.0,
          "high": 64505.06,
          "low": 63903.98,
          "close": 64454.0
        },
        {
          "ts": "2026-06-04T03:39:59.999000Z",
          "open": 64454.01,
          "high": 64484.0,
          "low": 64237.69,
          "close": 64484.0
        },
        {
          "ts": "2026-06-04T03:44:59.999000Z",
          "open": 64484.0,
          "high": 64540.3,
          "low": 64369.13,
          "close": 64389.18
        },
        {
          "ts": "2026-06-04T03:49:59.999000Z",
          "open": 64389.17,
          "high": 64442.0,
          "low": 64334.29,
          "close": 64377.29
        },
        {
          "ts": "2026-06-04T03:54:59.999000Z",
          "open": 64377.3,
          "high": 64458.0,
          "low": 64333.73,
          "close": 64391.99
        },
        {
          "ts": "2026-06-04T03:59:59.999000Z",
          "open": 64392.0,
          "high": 64398.36,
          "low": 64254.98,
          "close": 64363.49
        },
        {
          "ts": "2026-06-04T04:04:59.999000Z",
          "open": 64363.49,
          "high": 64514.0,
          "low": 64338.0,
          "close": 64514.0
        },
        {
          "ts": "2026-06-04T04:09:59.999000Z",
          "open": 64514.0,
          "high": 64606.48,
          "low": 64355.42,
          "close": 64372.97
        },
        {
          "ts": "2026-06-04T04:14:59.999000Z",
          "open": 64372.97,
          "high": 64685.91,
          "low": 64372.97,
          "close": 64630.0
        },
        {
          "ts": "2026-06-04T04:19:59.999000Z",
          "open": 64630.0,
          "high": 64720.92,
          "low": 64504.0,
          "close": 64598.25
        },
        {
          "ts": "2026-06-04T04:24:59.999000Z",
          "open": 64598.0,
          "high": 64764.32,
          "low": 64583.37,
          "close": 64745.72
        },
        {
          "ts": "2026-06-04T04:29:59.999000Z",
          "open": 64745.73,
          "high": 64752.0,
          "low": 64574.0,
          "close": 64574.0
        },
        {
          "ts": "2026-06-04T04:34:59.999000Z",
          "open": 64574.01,
          "high": 64613.85,
          "low": 64265.73,
          "close": 64280.0
        },
        {
          "ts": "2026-06-04T04:39:59.999000Z",
          "open": 64280.0,
          "high": 64476.7,
          "low": 64266.67,
          "close": 64390.01
        },
        {
          "ts": "2026-06-04T04:44:59.999000Z",
          "open": 64390.0,
          "high": 64460.0,
          "low": 64276.88,
          "close": 64415.99
        },
        {
          "ts": "2026-06-04T04:49:59.999000Z",
          "open": 64415.99,
          "high": 64440.0,
          "low": 64309.06,
          "close": 64358.0
        },
        {
          "ts": "2026-06-04T04:54:59.999000Z",
          "open": 64358.0,
          "high": 64464.66,
          "low": 64343.33,
          "close": 64464.66
        },
        {
          "ts": "2026-06-04T04:59:59.999000Z",
          "open": 64464.66,
          "high": 64464.66,
          "low": 64327.95,
          "close": 64399.99
        },
        {
          "ts": "2026-06-04T05:04:59.999000Z",
          "open": 64399.99,
          "high": 64400.0,
          "low": 64000.9,
          "close": 64022.75
        },
        {
          "ts": "2026-06-04T05:09:59.999000Z",
          "open": 64022.75,
          "high": 64054.65,
          "low": 63800.0,
          "close": 63828.17
        },
        {
          "ts": "2026-06-04T05:14:59.999000Z",
          "open": 63828.18,
          "high": 63958.0,
          "low": 63716.78,
          "close": 63958.0
        },
        {
          "ts": "2026-06-04T05:19:59.999000Z",
          "open": 63958.0,
          "high": 64017.51,
          "low": 63807.12,
          "close": 63830.66
        },
        {
          "ts": "2026-06-04T05:24:59.999000Z",
          "open": 63830.65,
          "high": 63870.32,
          "low": 63648.01,
          "close": 63826.0
        },
        {
          "ts": "2026-06-04T05:29:59.999000Z",
          "open": 63826.0,
          "high": 63910.0,
          "low": 63814.0,
          "close": 63842.13
        },
        {
          "ts": "2026-06-04T05:34:59.999000Z",
          "open": 63842.12,
          "high": 64256.56,
          "low": 63768.87,
          "close": 64226.0
        },
        {
          "ts": "2026-06-04T05:39:59.999000Z",
          "open": 64226.01,
          "high": 64337.85,
          "low": 64092.37,
          "close": 64128.01
        },
        {
          "ts": "2026-06-04T05:44:59.999000Z",
          "open": 64128.01,
          "high": 64282.0,
          "low": 64092.6,
          "close": 64282.0
        },
        {
          "ts": "2026-06-04T05:49:59.999000Z",
          "open": 64281.99,
          "high": 64282.0,
          "low": 64081.58,
          "close": 64098.0
        },
        {
          "ts": "2026-06-04T05:54:59.999000Z",
          "open": 64098.0,
          "high": 64099.99,
          "low": 63931.07,
          "close": 64033.99
        },
        {
          "ts": "2026-06-04T05:59:59.999000Z",
          "open": 64034.0,
          "high": 64040.0,
          "low": 63915.0,
          "close": 63955.47
        },
        {
          "ts": "2026-06-04T06:04:59.999000Z",
          "open": 63955.48,
          "high": 64170.0,
          "low": 63892.0,
          "close": 64152.49
        },
        {
          "ts": "2026-06-04T06:09:59.999000Z",
          "open": 64152.49,
          "high": 64234.0,
          "low": 64088.01,
          "close": 64233.99
        },
        {
          "ts": "2026-06-04T06:14:59.999000Z",
          "open": 64233.99,
          "high": 64260.0,
          "low": 64200.01,
          "close": 64260.0
        },
        {
          "ts": "2026-06-04T06:19:59.999000Z",
          "open": 64259.99,
          "high": 64481.22,
          "low": 64180.03,
          "close": 64366.01
        },
        {
          "ts": "2026-06-04T06:24:59.999000Z",
          "open": 64366.0,
          "high": 64410.0,
          "low": 64257.28,
          "close": 64267.26
        },
        {
          "ts": "2026-06-04T06:29:59.999000Z",
          "open": 64267.25,
          "high": 64317.89,
          "low": 64225.35,
          "close": 64255.99
        },
        {
          "ts": "2026-06-04T06:34:59.999000Z",
          "open": 64256.0,
          "high": 64256.0,
          "low": 64075.18,
          "close": 64146.27
        },
        {
          "ts": "2026-06-04T06:39:59.999000Z",
          "open": 64146.26,
          "high": 64438.0,
          "low": 64136.0,
          "close": 64368.0
        },
        {
          "ts": "2026-06-04T06:44:59.999000Z",
          "open": 64368.0,
          "high": 64394.0,
          "low": 64288.0,
          "close": 64336.0
        },
        {
          "ts": "2026-06-04T06:49:59.999000Z",
          "open": 64335.99,
          "high": 64335.99,
          "low": 64166.08,
          "close": 64184.01
        },
        {
          "ts": "2026-06-04T06:54:59.999000Z",
          "open": 64184.0,
          "high": 64276.0,
          "low": 64082.0,
          "close": 64082.0
        },
        {
          "ts": "2026-06-04T06:59:59.999000Z",
          "open": 64082.0,
          "high": 64082.0,
          "low": 63976.0,
          "close": 64027.99
        },
        {
          "ts": "2026-06-04T07:04:59.999000Z",
          "open": 64027.99,
          "high": 64062.81,
          "low": 63869.58,
          "close": 63895.99
        },
        {
          "ts": "2026-06-04T07:09:59.999000Z",
          "open": 63896.0,
          "high": 63916.98,
          "low": 63768.55,
          "close": 63895.97
        },
        {
          "ts": "2026-06-04T07:14:59.999000Z",
          "open": 63895.97,
          "high": 63935.2,
          "low": 63721.24,
          "close": 63811.2
        },
        {
          "ts": "2026-06-04T07:19:59.999000Z",
          "open": 63811.21,
          "high": 63829.98,
          "low": 63500.0,
          "close": 63527.99
        },
        {
          "ts": "2026-06-04T07:24:59.999000Z",
          "open": 63527.99,
          "high": 63668.0,
          "low": 63492.89,
          "close": 63628.0
        },
        {
          "ts": "2026-06-04T07:29:59.999000Z",
          "open": 63627.99,
          "high": 63720.0,
          "low": 63569.23,
          "close": 63696.01
        },
        {
          "ts": "2026-06-04T07:34:59.999000Z",
          "open": 63696.01,
          "high": 63904.0,
          "low": 63692.01,
          "close": 63789.6
        },
        {
          "ts": "2026-06-04T07:39:59.999000Z",
          "open": 63789.61,
          "high": 63936.3,
          "low": 63786.0,
          "close": 63934.08
        },
        {
          "ts": "2026-06-04T07:44:59.999000Z",
          "open": 63934.08,
          "high": 64048.0,
          "low": 63890.04,
          "close": 63930.55
        },
        {
          "ts": "2026-06-04T07:49:59.999000Z",
          "open": 63930.54,
          "high": 63952.0,
          "low": 63774.68,
          "close": 63899.99
        },
        {
          "ts": "2026-06-04T07:54:59.999000Z",
          "open": 63900.0,
          "high": 63900.0,
          "low": 63738.27,
          "close": 63765.99
        },
        {
          "ts": "2026-06-04T07:59:59.999000Z",
          "open": 63766.0,
          "high": 63785.45,
          "low": 63602.0,
          "close": 63603.15
        },
        {
          "ts": "2026-06-04T08:04:59.999000Z",
          "open": 63603.15,
          "high": 63884.0,
          "low": 63479.96,
          "close": 63881.99
        },
        {
          "ts": "2026-06-04T08:09:59.999000Z",
          "open": 63881.99,
          "high": 63904.63,
          "low": 63450.0,
          "close": 63482.0
        },
        {
          "ts": "2026-06-04T08:14:59.999000Z",
          "open": 63482.01,
          "high": 63625.66,
          "low": 63333.0,
          "close": 63360.0
        },
        {
          "ts": "2026-06-04T08:19:59.999000Z",
          "open": 63360.01,
          "high": 63546.0,
          "low": 63260.0,
          "close": 63536.15
        },
        {
          "ts": "2026-06-04T08:24:59.999000Z",
          "open": 63536.15,
          "high": 63593.0,
          "low": 63245.9,
          "close": 63552.0
        },
        {
          "ts": "2026-06-04T08:29:59.999000Z",
          "open": 63552.0,
          "high": 63559.99,
          "low": 63400.0,
          "close": 63484.0
        },
        {
          "ts": "2026-06-04T08:34:59.999000Z",
          "open": 63484.0,
          "high": 63682.0,
          "low": 63436.02,
          "close": 63519.99
        },
        {
          "ts": "2026-06-04T08:39:59.999000Z",
          "open": 63520.0,
          "high": 63582.0,
          "low": 63486.0,
          "close": 63544.32
        },
        {
          "ts": "2026-06-04T08:44:59.999000Z",
          "open": 63544.31,
          "high": 63651.84,
          "low": 63372.63,
          "close": 63417.62
        },
        {
          "ts": "2026-06-04T08:49:59.999000Z",
          "open": 63417.61,
          "high": 63524.0,
          "low": 63407.57,
          "close": 63518.0
        },
        {
          "ts": "2026-06-04T08:54:59.999000Z",
          "open": 63518.0,
          "high": 63653.99,
          "low": 63462.0,
          "close": 63615.33
        },
        {
          "ts": "2026-06-04T08:59:59.999000Z",
          "open": 63615.33,
          "high": 63755.95,
          "low": 63576.0,
          "close": 63629.99
        },
        {
          "ts": "2026-06-04T09:04:59.999000Z",
          "open": 63629.99,
          "high": 63644.0,
          "low": 63407.0,
          "close": 63428.48
        },
        {
          "ts": "2026-06-04T09:09:59.999000Z",
          "open": 63428.48,
          "high": 63469.72,
          "low": 63288.0,
          "close": 63390.01
        },
        {
          "ts": "2026-06-04T09:14:59.999000Z",
          "open": 63390.01,
          "high": 63470.0,
          "low": 63200.0,
          "close": 63337.74
        },
        {
          "ts": "2026-06-04T09:19:59.999000Z",
          "open": 63337.75,
          "high": 63337.75,
          "low": 63102.0,
          "close": 63120.0
        },
        {
          "ts": "2026-06-04T09:24:59.999000Z",
          "open": 63120.0,
          "high": 63192.0,
          "low": 63012.0,
          "close": 63024.97
        },
        {
          "ts": "2026-06-04T09:29:59.999000Z",
          "open": 63024.96,
          "high": 63060.88,
          "low": 62806.89,
          "close": 62863.99
        },
        {
          "ts": "2026-06-04T09:34:59.999000Z",
          "open": 62864.0,
          "high": 62996.0,
          "low": 62703.33,
          "close": 62996.0
        },
        {
          "ts": "2026-06-04T09:39:59.999000Z",
          "open": 62996.0,
          "high": 63000.0,
          "low": 62795.65,
          "close": 62878.06
        },
        {
          "ts": "2026-06-04T09:44:59.999000Z",
          "open": 62878.06,
          "high": 62928.32,
          "low": 62790.05,
          "close": 62899.44
        },
        {
          "ts": "2026-06-04T09:49:59.999000Z",
          "open": 62899.44,
          "high": 63166.0,
          "low": 62895.15,
          "close": 63077.98
        },
        {
          "ts": "2026-06-04T09:54:59.999000Z",
          "open": 63077.98,
          "high": 63078.02,
          "low": 62933.77,
          "close": 63059.99
        },
        {
          "ts": "2026-06-04T09:59:59.999000Z",
          "open": 63059.99,
          "high": 63272.01,
          "low": 63040.0,
          "close": 63266.0
        },
        {
          "ts": "2026-06-04T10:04:59.999000Z",
          "open": 63266.01,
          "high": 63276.0,
          "low": 63004.0,
          "close": 63046.0
        },
        {
          "ts": "2026-06-04T10:09:59.999000Z",
          "open": 63045.99,
          "high": 63070.0,
          "low": 62884.0,
          "close": 62919.99
        },
        {
          "ts": "2026-06-04T10:14:59.999000Z",
          "open": 62920.0,
          "high": 63000.0,
          "low": 62820.01,
          "close": 62872.58
        },
        {
          "ts": "2026-06-04T10:19:59.999000Z",
          "open": 62872.58,
          "high": 63006.0,
          "low": 62750.0,
          "close": 62978.3
        },
        {
          "ts": "2026-06-04T10:24:59.999000Z",
          "open": 62978.31,
          "high": 62978.31,
          "low": 62760.0,
          "close": 62777.25
        },
        {
          "ts": "2026-06-04T10:29:59.999000Z",
          "open": 62777.26,
          "high": 62798.0,
          "low": 62500.0,
          "close": 62501.51
        },
        {
          "ts": "2026-06-04T10:34:59.999000Z",
          "open": 62501.51,
          "high": 62730.43,
          "low": 62415.94,
          "close": 62709.83
        },
        {
          "ts": "2026-06-04T10:39:59.999000Z",
          "open": 62709.83,
          "high": 62792.0,
          "low": 62636.0,
          "close": 62775.0
        },
        {
          "ts": "2026-06-04T10:44:59.999000Z",
          "open": 62775.0,
          "high": 62788.02,
          "low": 62544.0,
          "close": 62723.46
        },
        {
          "ts": "2026-06-04T10:49:59.999000Z",
          "open": 62723.47,
          "high": 62800.53,
          "low": 62301.21,
          "close": 62410.5
        },
        {
          "ts": "2026-06-04T10:54:59.999000Z",
          "open": 62410.51,
          "high": 62498.0,
          "low": 62307.28,
          "close": 62383.4
        },
        {
          "ts": "2026-06-04T10:59:59.999000Z",
          "open": 62383.39,
          "high": 62496.0,
          "low": 62304.0,
          "close": 62420.0
        },
        {
          "ts": "2026-06-04T11:04:59.999000Z",
          "open": 62420.01,
          "high": 62636.0,
          "low": 62368.0,
          "close": 62602.03
        },
        {
          "ts": "2026-06-04T11:09:59.999000Z",
          "open": 62602.04,
          "high": 62670.0,
          "low": 62310.0,
          "close": 62310.0
        },
        {
          "ts": "2026-06-04T11:14:59.999000Z",
          "open": 62310.01,
          "high": 62353.74,
          "low": 62223.0,
          "close": 62272.6
        },
        {
          "ts": "2026-06-04T11:19:59.999000Z",
          "open": 62272.61,
          "high": 62560.0,
          "low": 62238.0,
          "close": 62550.61
        },
        {
          "ts": "2026-06-04T11:24:59.999000Z",
          "open": 62550.62,
          "high": 62578.0,
          "low": 62408.0,
          "close": 62569.99
        },
        {
          "ts": "2026-06-04T11:29:59.999000Z",
          "open": 62570.0,
          "high": 62650.89,
          "low": 62518.07,
          "close": 62617.38
        },
        {
          "ts": "2026-06-04T11:34:59.999000Z",
          "open": 62617.37,
          "high": 62833.82,
          "low": 62470.0,
          "close": 62538.55
        },
        {
          "ts": "2026-06-04T11:39:59.999000Z",
          "open": 62538.55,
          "high": 62581.99,
          "low": 62222.0,
          "close": 62383.75
        },
        {
          "ts": "2026-06-04T11:44:59.999000Z",
          "open": 62383.75,
          "high": 62388.47,
          "low": 62205.0,
          "close": 62237.98
        },
        {
          "ts": "2026-06-04T11:49:59.999000Z",
          "open": 62237.99,
          "high": 62505.09,
          "low": 62237.98,
          "close": 62500.0
        },
        {
          "ts": "2026-06-04T11:54:59.999000Z",
          "open": 62500.0,
          "high": 62510.0,
          "low": 62360.0,
          "close": 62424.0
        },
        {
          "ts": "2026-06-04T11:59:59.999000Z",
          "open": 62424.0,
          "high": 62555.27,
          "low": 62413.92,
          "close": 62545.99
        },
        {
          "ts": "2026-06-04T12:04:59.999000Z",
          "open": 62546.0,
          "high": 62706.0,
          "low": 62476.0,
          "close": 62675.01
        },
        {
          "ts": "2026-06-04T12:09:59.999000Z",
          "open": 62675.01,
          "high": 62675.01,
          "low": 62392.0,
          "close": 62467.85
        },
        {
          "ts": "2026-06-04T12:14:59.999000Z",
          "open": 62467.86,
          "high": 62556.0,
          "low": 62427.5,
          "close": 62530.0
        },
        {
          "ts": "2026-06-04T12:19:59.999000Z",
          "open": 62530.0,
          "high": 62804.36,
          "low": 62525.74,
          "close": 62666.81
        },
        {
          "ts": "2026-06-04T12:24:59.999000Z",
          "open": 62666.82,
          "high": 63400.0,
          "low": 62654.58,
          "close": 63294.32
        },
        {
          "ts": "2026-06-04T12:29:59.999000Z",
          "open": 63294.32,
          "high": 63329.99,
          "low": 63065.92,
          "close": 63267.99
        },
        {
          "ts": "2026-06-04T12:34:59.999000Z",
          "open": 63267.99,
          "high": 63685.63,
          "low": 63148.8,
          "close": 63492.86
        },
        {
          "ts": "2026-06-04T12:39:59.999000Z",
          "open": 63492.86,
          "high": 63720.85,
          "low": 63394.0,
          "close": 63686.0
        },
        {
          "ts": "2026-06-04T12:44:59.999000Z",
          "open": 63686.01,
          "high": 63686.01,
          "low": 63540.0,
          "close": 63564.0
        },
        {
          "ts": "2026-06-04T12:49:59.999000Z",
          "open": 63564.0,
          "high": 63911.24,
          "low": 63506.0,
          "close": 63910.9
        },
        {
          "ts": "2026-06-04T12:54:59.999000Z",
          "open": 63910.91,
          "high": 63966.48,
          "low": 63784.03,
          "close": 63825.79
        },
        {
          "ts": "2026-06-04T12:59:59.999000Z",
          "open": 63825.8,
          "high": 63842.68,
          "low": 63668.89,
          "close": 63766.82
        },
        {
          "ts": "2026-06-04T13:04:59.999000Z",
          "open": 63766.82,
          "high": 63841.1,
          "low": 63626.76,
          "close": 63700.0
        },
        {
          "ts": "2026-06-04T13:09:59.999000Z",
          "open": 63700.01,
          "high": 63790.0,
          "low": 63588.47,
          "close": 63627.0
        },
        {
          "ts": "2026-06-04T13:14:59.999000Z",
          "open": 63626.99,
          "high": 63735.06,
          "low": 63546.0,
          "close": 63586.85
        },
        {
          "ts": "2026-06-04T13:19:59.999000Z",
          "open": 63586.85,
          "high": 63624.0,
          "low": 63270.01,
          "close": 63271.69
        },
        {
          "ts": "2026-06-04T13:24:59.999000Z",
          "open": 63271.68,
          "high": 63296.0,
          "low": 63076.0,
          "close": 63152.0
        },
        {
          "ts": "2026-06-04T13:29:59.999000Z",
          "open": 63152.01,
          "high": 63315.08,
          "low": 63068.41,
          "close": 63229.99
        },
        {
          "ts": "2026-06-04T13:34:59.999000Z",
          "open": 63230.0,
          "high": 63825.2,
          "low": 63194.22,
          "close": 63734.43
        },
        {
          "ts": "2026-06-04T13:39:59.999000Z",
          "open": 63734.42,
          "high": 64244.0,
          "low": 63652.97,
          "close": 64150.0
        },
        {
          "ts": "2026-06-04T13:44:59.999000Z",
          "open": 64150.0,
          "high": 64155.85,
          "low": 63750.0,
          "close": 63798.61
        },
        {
          "ts": "2026-06-04T13:49:59.999000Z",
          "open": 63798.61,
          "high": 63961.81,
          "low": 63668.01,
          "close": 63829.42
        },
        {
          "ts": "2026-06-04T13:54:59.999000Z",
          "open": 63829.42,
          "high": 63867.67,
          "low": 63681.12,
          "close": 63830.36
        },
        {
          "ts": "2026-06-04T13:59:59.999000Z",
          "open": 63830.36,
          "high": 64230.0,
          "low": 63790.0,
          "close": 64230.0
        },
        {
          "ts": "2026-06-04T14:04:59.999000Z",
          "open": 64230.0,
          "high": 64307.07,
          "low": 64051.68,
          "close": 64065.68
        },
        {
          "ts": "2026-06-04T14:09:59.999000Z",
          "open": 64065.67,
          "high": 64438.0,
          "low": 63980.0,
          "close": 64301.99
        },
        {
          "ts": "2026-06-04T14:14:59.999000Z",
          "open": 64301.99,
          "high": 64494.92,
          "low": 64276.0,
          "close": 64365.73
        },
        {
          "ts": "2026-06-04T14:19:59.999000Z",
          "open": 64365.74,
          "high": 64411.2,
          "low": 64162.04,
          "close": 64174.44
        },
        {
          "ts": "2026-06-04T14:24:59.999000Z",
          "open": 64174.44,
          "high": 64203.8,
          "low": 64082.0,
          "close": 64176.01
        },
        {
          "ts": "2026-06-04T14:29:59.999000Z",
          "open": 64176.01,
          "high": 64177.01,
          "low": 64052.0,
          "close": 64144.0
        },
        {
          "ts": "2026-06-04T14:34:59.999000Z",
          "open": 64144.0,
          "high": 64148.0,
          "low": 63890.85,
          "close": 64074.0
        },
        {
          "ts": "2026-06-04T14:39:59.999000Z",
          "open": 64074.01,
          "high": 64074.01,
          "low": 63844.68,
          "close": 63902.5
        },
        {
          "ts": "2026-06-04T14:44:59.999000Z",
          "open": 63902.5,
          "high": 64028.0,
          "low": 63893.2,
          "close": 64000.91
        },
        {
          "ts": "2026-06-04T14:49:59.999000Z",
          "open": 64000.9,
          "high": 64078.0,
          "low": 63785.33,
          "close": 63903.6
        },
        {
          "ts": "2026-06-04T14:54:59.999000Z",
          "open": 63903.6,
          "high": 64002.0,
          "low": 63796.58,
          "close": 63840.0
        },
        {
          "ts": "2026-06-04T14:59:59.999000Z",
          "open": 63840.0,
          "high": 63986.71,
          "low": 63808.94,
          "close": 63958.97
        },
        {
          "ts": "2026-06-04T15:04:59.999000Z",
          "open": 63958.97,
          "high": 64030.51,
          "low": 63850.98,
          "close": 63937.82
        },
        {
          "ts": "2026-06-04T15:09:59.999000Z",
          "open": 63937.82,
          "high": 64369.6,
          "low": 63937.82,
          "close": 64327.24
        },
        {
          "ts": "2026-06-04T15:14:59.999000Z",
          "open": 64327.25,
          "high": 64370.0,
          "low": 64210.4,
          "close": 64365.52
        },
        {
          "ts": "2026-06-04T15:19:59.999000Z",
          "open": 64365.51,
          "high": 64404.0,
          "low": 64080.0,
          "close": 64122.0
        },
        {
          "ts": "2026-06-04T15:24:59.999000Z",
          "open": 64122.0,
          "high": 64124.0,
          "low": 63800.0,
          "close": 63970.0
        },
        {
          "ts": "2026-06-04T15:29:59.999000Z",
          "open": 63970.0,
          "high": 64063.45,
          "low": 63948.24,
          "close": 63982.45
        },
        {
          "ts": "2026-06-04T15:34:59.999000Z",
          "open": 63982.44,
          "high": 64085.56,
          "low": 63892.91,
          "close": 63940.79
        },
        {
          "ts": "2026-06-04T15:39:59.999000Z",
          "open": 63940.79,
          "high": 64006.77,
          "low": 63842.0,
          "close": 63874.01
        },
        {
          "ts": "2026-06-04T15:44:59.999000Z",
          "open": 63874.0,
          "high": 63938.05,
          "low": 63802.56,
          "close": 63842.53
        },
        {
          "ts": "2026-06-04T15:49:59.999000Z",
          "open": 63842.53,
          "high": 63862.0,
          "low": 63691.7,
          "close": 63754.0
        },
        {
          "ts": "2026-06-04T15:54:59.999000Z",
          "open": 63753.99,
          "high": 63902.0,
          "low": 63741.04,
          "close": 63772.34
        },
        {
          "ts": "2026-06-04T15:59:59.999000Z",
          "open": 63772.33,
          "high": 64000.0,
          "low": 63696.0,
          "close": 63896.17
        },
        {
          "ts": "2026-06-04T16:04:59.999000Z",
          "open": 63896.16,
          "high": 63920.0,
          "low": 63724.0,
          "close": 63729.12
        },
        {
          "ts": "2026-06-04T16:09:59.999000Z",
          "open": 63729.12,
          "high": 63880.0,
          "low": 63694.0,
          "close": 63786.0
        },
        {
          "ts": "2026-06-04T16:14:59.999000Z",
          "open": 63786.0,
          "high": 63832.0,
          "low": 63648.0,
          "close": 63660.0
        },
        {
          "ts": "2026-06-04T16:19:59.999000Z",
          "open": 63660.01,
          "high": 63763.2,
          "low": 63659.0,
          "close": 63716.85
        },
        {
          "ts": "2026-06-04T16:24:59.999000Z",
          "open": 63716.85,
          "high": 63826.98,
          "low": 63668.0,
          "close": 63804.48
        },
        {
          "ts": "2026-06-04T16:29:59.999000Z",
          "open": 63804.48,
          "high": 63878.0,
          "low": 63632.05,
          "close": 63646.01
        },
        {
          "ts": "2026-06-04T16:34:59.999000Z",
          "open": 63646.01,
          "high": 63657.26,
          "low": 63460.0,
          "close": 63476.04
        },
        {
          "ts": "2026-06-04T16:39:59.999000Z",
          "open": 63476.05,
          "high": 63790.0,
          "low": 63456.0,
          "close": 63742.01
        },
        {
          "ts": "2026-06-04T16:44:59.999000Z",
          "open": 63742.01,
          "high": 63862.0,
          "low": 63701.01,
          "close": 63780.08
        },
        {
          "ts": "2026-06-04T16:49:59.999000Z",
          "open": 63780.07,
          "high": 63920.0,
          "low": 63710.8,
          "close": 63769.97
        },
        {
          "ts": "2026-06-04T16:54:59.999000Z",
          "open": 63769.96,
          "high": 63816.0,
          "low": 63664.0,
          "close": 63664.01
        },
        {
          "ts": "2026-06-04T16:59:59.999000Z",
          "open": 63664.01,
          "high": 63673.45,
          "low": 63510.7,
          "close": 63563.51
        },
        {
          "ts": "2026-06-04T17:04:59.999000Z",
          "open": 63563.51,
          "high": 63582.18,
          "low": 63446.0,
          "close": 63523.99
        },
        {
          "ts": "2026-06-04T17:09:59.999000Z",
          "open": 63523.99,
          "high": 63570.0,
          "low": 63458.0,
          "close": 63562.72
        },
        {
          "ts": "2026-06-04T17:14:59.999000Z",
          "open": 63562.72,
          "high": 63722.0,
          "low": 63526.02,
          "close": 63591.99
        },
        {
          "ts": "2026-06-04T17:19:59.999000Z",
          "open": 63592.0,
          "high": 63592.0,
          "low": 63242.0,
          "close": 63259.87
        },
        {
          "ts": "2026-06-04T17:24:59.999000Z",
          "open": 63259.87,
          "high": 63370.34,
          "low": 63116.0,
          "close": 63172.86
        },
        {
          "ts": "2026-06-04T17:29:59.999000Z",
          "open": 63172.85,
          "high": 63270.0,
          "low": 63130.8,
          "close": 63224.0
        },
        {
          "ts": "2026-06-04T17:34:59.999000Z",
          "open": 63224.0,
          "high": 63306.0,
          "low": 63035.65,
          "close": 63083.99
        },
        {
          "ts": "2026-06-04T17:39:59.999000Z",
          "open": 63084.0,
          "high": 63152.0,
          "low": 63000.8,
          "close": 63000.8
        },
        {
          "ts": "2026-06-04T17:44:59.999000Z",
          "open": 63000.8,
          "high": 63041.24,
          "low": 62969.69,
          "close": 63041.23
        },
        {
          "ts": "2026-06-04T17:49:59.999000Z",
          "open": 63041.24,
          "high": 63128.0,
          "low": 62944.91,
          "close": 63090.27
        },
        {
          "ts": "2026-06-04T17:54:59.999000Z",
          "open": 63090.27,
          "high": 63650.0,
          "low": 63060.0,
          "close": 63598.0
        },
        {
          "ts": "2026-06-04T17:59:59.999000Z",
          "open": 63598.0,
          "high": 63616.32,
          "low": 63431.33,
          "close": 63540.97
        },
        {
          "ts": "2026-06-04T18:04:59.999000Z",
          "open": 63540.96,
          "high": 63578.99,
          "low": 63344.0,
          "close": 63344.0
        },
        {
          "ts": "2026-06-04T18:09:59.999000Z",
          "open": 63344.0,
          "high": 63369.23,
          "low": 63234.18,
          "close": 63280.0
        },
        {
          "ts": "2026-06-04T18:14:59.999000Z",
          "open": 63279.99,
          "high": 63298.0,
          "low": 63149.76,
          "close": 63158.01
        },
        {
          "ts": "2026-06-04T18:19:59.999000Z",
          "open": 63158.02,
          "high": 63455.17,
          "low": 63150.0,
          "close": 63388.01
        },
        {
          "ts": "2026-06-04T18:24:59.999000Z",
          "open": 63388.01,
          "high": 63644.41,
          "low": 63343.3,
          "close": 63600.35
        },
        {
          "ts": "2026-06-04T18:29:59.999000Z",
          "open": 63600.36,
          "high": 63932.52,
          "low": 63530.0,
          "close": 63896.27
        },
        {
          "ts": "2026-06-04T18:34:59.999000Z",
          "open": 63896.26,
          "high": 64100.53,
          "low": 63732.02,
          "close": 63847.99
        },
        {
          "ts": "2026-06-04T18:39:59.999000Z",
          "open": 63847.99,
          "high": 64053.99,
          "low": 63813.13,
          "close": 63954.24
        },
        {
          "ts": "2026-06-04T18:44:59.999000Z",
          "open": 63954.12,
          "high": 64110.28,
          "low": 63906.0,
          "close": 63924.93
        },
        {
          "ts": "2026-06-04T18:49:59.999000Z",
          "open": 63924.93,
          "high": 64045.99,
          "low": 63852.0,
          "close": 64012.0
        },
        {
          "ts": "2026-06-04T18:54:59.999000Z",
          "open": 64011.99,
          "high": 64100.0,
          "low": 63932.87,
          "close": 63932.88
        },
        {
          "ts": "2026-06-04T18:59:59.999000Z",
          "open": 63932.87,
          "high": 64032.0,
          "low": 63819.62,
          "close": 63819.62
        },
        {
          "ts": "2026-06-04T19:04:59.999000Z",
          "open": 63819.62,
          "high": 63830.0,
          "low": 63686.14,
          "close": 63713.84
        },
        {
          "ts": "2026-06-04T19:09:59.999000Z",
          "open": 63713.83,
          "high": 63726.64,
          "low": 63628.0,
          "close": 63685.5
        },
        {
          "ts": "2026-06-04T19:14:59.999000Z",
          "open": 63685.5,
          "high": 63889.74,
          "low": 63620.64,
          "close": 63886.33
        },
        {
          "ts": "2026-06-04T19:19:59.999000Z",
          "open": 63886.33,
          "high": 64034.88,
          "low": 63867.05,
          "close": 63981.12
        },
        {
          "ts": "2026-06-04T19:24:59.999000Z",
          "open": 63981.11,
          "high": 64032.49,
          "low": 63925.54,
          "close": 64020.22
        },
        {
          "ts": "2026-06-04T19:29:59.999000Z",
          "open": 64020.22,
          "high": 64163.93,
          "low": 63960.36,
          "close": 64128.0
        },
        {
          "ts": "2026-06-04T19:34:59.999000Z",
          "open": 64128.0,
          "high": 64144.0,
          "low": 63900.0,
          "close": 63965.44
        },
        {
          "ts": "2026-06-04T19:39:59.999000Z",
          "open": 63965.44,
          "high": 63965.44,
          "low": 63764.01,
          "close": 63956.0
        },
        {
          "ts": "2026-06-04T19:44:59.999000Z",
          "open": 63955.99,
          "high": 63955.99,
          "low": 63786.0,
          "close": 63786.01
        },
        {
          "ts": "2026-06-04T19:49:59.999000Z",
          "open": 63786.01,
          "high": 63786.01,
          "low": 63694.2,
          "close": 63726.0
        },
        {
          "ts": "2026-06-04T19:54:59.999000Z",
          "open": 63726.01,
          "high": 63764.0,
          "low": 63596.0,
          "close": 63652.37
        },
        {
          "ts": "2026-06-04T19:59:59.999000Z",
          "open": 63652.37,
          "high": 63696.0,
          "low": 63544.0,
          "close": 63629.38
        },
        {
          "ts": "2026-06-04T20:04:59.999000Z",
          "open": 63629.38,
          "high": 63636.0,
          "low": 63377.8,
          "close": 63393.08
        },
        {
          "ts": "2026-06-04T20:09:59.999000Z",
          "open": 63393.08,
          "high": 63415.99,
          "low": 63249.26,
          "close": 63349.01
        },
        {
          "ts": "2026-06-04T20:14:59.999000Z",
          "open": 63349.0,
          "high": 63546.56,
          "low": 63340.37,
          "close": 63505.31
        },
        {
          "ts": "2026-06-04T20:19:59.999000Z",
          "open": 63505.31,
          "high": 63538.0,
          "low": 63360.0,
          "close": 63370.63
        },
        {
          "ts": "2026-06-04T20:24:59.999000Z",
          "open": 63370.63,
          "high": 63416.0,
          "low": 63299.42,
          "close": 63326.38
        },
        {
          "ts": "2026-06-04T20:29:59.999000Z",
          "open": 63326.39,
          "high": 63363.99,
          "low": 63182.84,
          "close": 63341.0
        },
        {
          "ts": "2026-06-04T20:34:59.999000Z",
          "open": 63341.01,
          "high": 63558.0,
          "low": 63338.0,
          "close": 63548.7
        },
        {
          "ts": "2026-06-04T20:39:59.999000Z",
          "open": 63548.7,
          "high": 63548.7,
          "low": 63444.0,
          "close": 63506.04
        },
        {
          "ts": "2026-06-04T20:44:59.999000Z",
          "open": 63506.03,
          "high": 63653.2,
          "low": 63506.03,
          "close": 63560.93
        },
        {
          "ts": "2026-06-04T20:49:59.999000Z",
          "open": 63560.93,
          "high": 63616.92,
          "low": 63424.53,
          "close": 63534.0
        },
        {
          "ts": "2026-06-04T20:54:59.999000Z",
          "open": 63534.01,
          "high": 63567.41,
          "low": 63495.11,
          "close": 63565.99
        },
        {
          "ts": "2026-06-04T20:59:59.999000Z",
          "open": 63565.99,
          "high": 63648.0,
          "low": 63550.0,
          "close": 63638.4
        },
        {
          "ts": "2026-06-04T21:04:59.999000Z",
          "open": 63638.4,
          "high": 63772.0,
          "low": 63606.0,
          "close": 63752.7
        },
        {
          "ts": "2026-06-04T21:09:59.999000Z",
          "open": 63752.7,
          "high": 63859.59,
          "low": 63747.63,
          "close": 63847.0
        },
        {
          "ts": "2026-06-04T21:14:59.999000Z",
          "open": 63846.99,
          "high": 63876.0,
          "low": 63738.0,
          "close": 63804.82
        },
        {
          "ts": "2026-06-04T21:19:59.999000Z",
          "open": 63804.82,
          "high": 63817.72,
          "low": 63578.65,
          "close": 63676.02
        },
        {
          "ts": "2026-06-04T21:24:59.999000Z",
          "open": 63676.03,
          "high": 63688.8,
          "low": 63494.86,
          "close": 63555.48
        },
        {
          "ts": "2026-06-04T21:29:59.999000Z",
          "open": 63555.47,
          "high": 63638.0,
          "low": 63438.0,
          "close": 63495.63
        },
        {
          "ts": "2026-06-04T21:34:59.999000Z",
          "open": 63495.64,
          "high": 63516.93,
          "low": 63367.84,
          "close": 63427.99
        },
        {
          "ts": "2026-06-04T21:39:59.999000Z",
          "open": 63428.0,
          "high": 63452.0,
          "low": 63281.78,
          "close": 63310.0
        },
        {
          "ts": "2026-06-04T21:44:59.999000Z",
          "open": 63309.99,
          "high": 63496.0,
          "low": 63106.04,
          "close": 63496.0
        },
        {
          "ts": "2026-06-04T21:49:59.999000Z",
          "open": 63496.0,
          "high": 63530.71,
          "low": 63372.84,
          "close": 63420.0
        },
        {
          "ts": "2026-06-04T21:54:59.999000Z",
          "open": 63420.0,
          "high": 63475.31,
          "low": 63338.0,
          "close": 63456.88
        },
        {
          "ts": "2026-06-04T21:59:59.999000Z",
          "open": 63456.88,
          "high": 63456.88,
          "low": 63264.93,
          "close": 63286.21
        },
        {
          "ts": "2026-06-04T22:04:59.999000Z",
          "open": 63286.21,
          "high": 63496.0,
          "low": 63201.41,
          "close": 63310.01
        },
        {
          "ts": "2026-06-04T22:09:59.999000Z",
          "open": 63310.02,
          "high": 63396.0,
          "low": 63194.0,
          "close": 63276.01
        },
        {
          "ts": "2026-06-04T22:14:59.999000Z",
          "open": 63276.0,
          "high": 63394.0,
          "low": 63200.0,
          "close": 63292.0
        },
        {
          "ts": "2026-06-04T22:19:59.999000Z",
          "open": 63292.01,
          "high": 63439.82,
          "low": 63291.06,
          "close": 63388.0
        },
        {
          "ts": "2026-06-04T22:24:59.999000Z",
          "open": 63388.0,
          "high": 63445.28,
          "low": 63312.0,
          "close": 63380.01
        },
        {
          "ts": "2026-06-04T22:29:59.999000Z",
          "open": 63380.01,
          "high": 63444.0,
          "low": 63310.0,
          "close": 63352.14
        },
        {
          "ts": "2026-06-04T22:34:59.999000Z",
          "open": 63352.14,
          "high": 63410.0,
          "low": 63238.0,
          "close": 63244.01
        },
        {
          "ts": "2026-06-04T22:39:59.999000Z",
          "open": 63244.01,
          "high": 63465.56,
          "low": 63230.0,
          "close": 63465.55
        },
        {
          "ts": "2026-06-04T22:44:59.999000Z",
          "open": 63465.56,
          "high": 63592.28,
          "low": 63452.0,
          "close": 63504.15
        },
        {
          "ts": "2026-06-04T22:49:59.999000Z",
          "open": 63504.14,
          "high": 63662.0,
          "low": 63442.0,
          "close": 63616.0
        },
        {
          "ts": "2026-06-04T22:54:59.999000Z",
          "open": 63616.01,
          "high": 63658.0,
          "low": 63539.55,
          "close": 63641.45
        },
        {
          "ts": "2026-06-04T22:59:59.999000Z",
          "open": 63641.46,
          "high": 63772.0,
          "low": 63626.0,
          "close": 63735.43
        },
        {
          "ts": "2026-06-04T23:04:59.999000Z",
          "open": 63735.42,
          "high": 63838.0,
          "low": 63672.0,
          "close": 63837.34
        },
        {
          "ts": "2026-06-04T23:09:59.999000Z",
          "open": 63837.34,
          "high": 63852.0,
          "low": 63760.0,
          "close": 63767.55
        },
        {
          "ts": "2026-06-04T23:14:59.999000Z",
          "open": 63767.55,
          "high": 63768.49,
          "low": 63604.0,
          "close": 63604.01
        },
        {
          "ts": "2026-06-04T23:19:59.999000Z",
          "open": 63604.01,
          "high": 63620.0,
          "low": 63382.0,
          "close": 63382.01
        },
        {
          "ts": "2026-06-04T23:24:59.999000Z",
          "open": 63382.01,
          "high": 63495.74,
          "low": 63376.0,
          "close": 63443.49
        },
        {
          "ts": "2026-06-04T23:29:59.999000Z",
          "open": 63442.44,
          "high": 63550.0,
          "low": 63422.0,
          "close": 63461.99
        },
        {
          "ts": "2026-06-04T23:34:59.999000Z",
          "open": 63461.99,
          "high": 63653.99,
          "low": 63461.99,
          "close": 63616.0
        },
        {
          "ts": "2026-06-04T23:39:59.999000Z",
          "open": 63616.0,
          "high": 63710.0,
          "low": 63610.07,
          "close": 63710.0
        },
        {
          "ts": "2026-06-04T23:44:59.999000Z",
          "open": 63710.0,
          "high": 63796.0,
          "low": 63709.99,
          "close": 63762.33
        },
        {
          "ts": "2026-06-04T23:49:59.999000Z",
          "open": 63762.32,
          "high": 63776.0,
          "low": 63698.0,
          "close": 63771.84
        },
        {
          "ts": "2026-06-04T23:54:59.999000Z",
          "open": 63771.84,
          "high": 63890.0,
          "low": 63771.84,
          "close": 63862.0
        },
        {
          "ts": "2026-06-04T23:59:59.999000Z",
          "open": 63861.99,
          "high": 63918.0,
          "low": 63786.0,
          "close": 63885.99
        },
        {
          "ts": "2026-06-05T00:04:59.999000Z",
          "open": 63885.99,
          "high": 63885.99,
          "low": 63734.0,
          "close": 63738.01
        },
        {
          "ts": "2026-06-05T00:09:59.999000Z",
          "open": 63738.0,
          "high": 63834.0,
          "low": 63720.01,
          "close": 63823.2
        },
        {
          "ts": "2026-06-05T00:14:59.999000Z",
          "open": 63823.21,
          "high": 63845.4,
          "low": 63647.99,
          "close": 63662.77
        },
        {
          "ts": "2026-06-05T00:19:59.999000Z",
          "open": 63662.77,
          "high": 63711.28,
          "low": 63592.27,
          "close": 63686.2
        },
        {
          "ts": "2026-06-05T00:24:59.999000Z",
          "open": 63686.19,
          "high": 63907.94,
          "low": 63686.19,
          "close": 63840.12
        },
        {
          "ts": "2026-06-05T00:29:59.999000Z",
          "open": 63840.11,
          "high": 63909.97,
          "low": 63704.0,
          "close": 63909.52
        },
        {
          "ts": "2026-06-05T00:34:59.999000Z",
          "open": 63909.53,
          "high": 63978.0,
          "low": 63838.0,
          "close": 63888.45
        },
        {
          "ts": "2026-06-05T00:39:59.999000Z",
          "open": 63888.46,
          "high": 63889.0,
          "low": 63679.99,
          "close": 63862.7
        },
        {
          "ts": "2026-06-05T00:44:59.999000Z",
          "open": 63862.71,
          "high": 63864.0,
          "low": 63688.0,
          "close": 63697.94
        },
        {
          "ts": "2026-06-05T00:49:59.999000Z",
          "open": 63697.94,
          "high": 63797.71,
          "low": 63660.0,
          "close": 63748.0
        },
        {
          "ts": "2026-06-05T00:54:59.999000Z",
          "open": 63748.01,
          "high": 63748.01,
          "low": 63510.0,
          "close": 63524.01
        },
        {
          "ts": "2026-06-05T00:59:59.999000Z",
          "open": 63524.0,
          "high": 63524.0,
          "low": 63396.57,
          "close": 63426.72
        },
        {
          "ts": "2026-06-05T01:04:59.999000Z",
          "open": 63426.73,
          "high": 63426.73,
          "low": 63052.0,
          "close": 63070.85
        },
        {
          "ts": "2026-06-05T01:09:59.999000Z",
          "open": 63070.85,
          "high": 63288.0,
          "low": 63070.85,
          "close": 63212.64
        },
        {
          "ts": "2026-06-05T01:14:59.999000Z",
          "open": 63212.65,
          "high": 63361.92,
          "low": 63140.0,
          "close": 63361.92
        },
        {
          "ts": "2026-06-05T01:19:59.999000Z",
          "open": 63361.91,
          "high": 63424.62,
          "low": 63243.63,
          "close": 63356.0
        },
        {
          "ts": "2026-06-05T01:24:59.999000Z",
          "open": 63356.0,
          "high": 63356.0,
          "low": 63144.58,
          "close": 63313.99
        },
        {
          "ts": "2026-06-05T01:29:59.999000Z",
          "open": 63313.99,
          "high": 63350.0,
          "low": 63264.0,
          "close": 63343.99
        },
        {
          "ts": "2026-06-05T01:34:59.999000Z",
          "open": 63344.0,
          "high": 63566.0,
          "low": 63344.0,
          "close": 63408.0
        },
        {
          "ts": "2026-06-05T01:39:59.999000Z",
          "open": 63408.0,
          "high": 63512.0,
          "low": 63270.0,
          "close": 63307.92
        },
        {
          "ts": "2026-06-05T01:44:59.999000Z",
          "open": 63307.92,
          "high": 63440.0,
          "low": 63286.0,
          "close": 63440.0
        },
        {
          "ts": "2026-06-05T01:49:59.999000Z",
          "open": 63440.0,
          "high": 63442.0,
          "low": 63306.0,
          "close": 63326.05
        },
        {
          "ts": "2026-06-05T01:54:59.999000Z",
          "open": 63326.04,
          "high": 63346.0,
          "low": 63244.0,
          "close": 63338.23
        },
        {
          "ts": "2026-06-05T01:59:59.999000Z",
          "open": 63338.23,
          "high": 63446.0,
          "low": 63284.0,
          "close": 63374.67
        },
        {
          "ts": "2026-06-05T02:04:59.999000Z",
          "open": 63374.67,
          "high": 63436.0,
          "low": 63240.0,
          "close": 63329.6
        },
        {
          "ts": "2026-06-05T02:09:59.999000Z",
          "open": 63329.6,
          "high": 63337.61,
          "low": 63193.33,
          "close": 63226.52
        },
        {
          "ts": "2026-06-05T02:14:59.999000Z",
          "open": 63226.53,
          "high": 63276.0,
          "low": 63180.0,
          "close": 63180.0
        },
        {
          "ts": "2026-06-05T02:19:59.999000Z",
          "open": 63180.0,
          "high": 63270.0,
          "low": 63003.0,
          "close": 63019.54
        },
        {
          "ts": "2026-06-05T02:24:59.999000Z",
          "open": 63019.53,
          "high": 63059.65,
          "low": 62766.53,
          "close": 62920.0
        },
        {
          "ts": "2026-06-05T02:29:59.999000Z",
          "open": 62920.0,
          "high": 62924.0,
          "low": 62700.0,
          "close": 62705.48
        },
        {
          "ts": "2026-06-05T02:34:59.999000Z",
          "open": 62705.49,
          "high": 62856.86,
          "low": 62620.0,
          "close": 62822.75
        },
        {
          "ts": "2026-06-05T02:39:59.999000Z",
          "open": 62822.74,
          "high": 62954.0,
          "low": 62808.0,
          "close": 62899.23
        },
        {
          "ts": "2026-06-05T02:44:59.999000Z",
          "open": 62899.23,
          "high": 62942.0,
          "low": 62588.77,
          "close": 62742.01
        },
        {
          "ts": "2026-06-05T02:49:59.999000Z",
          "open": 62742.0,
          "high": 62861.95,
          "low": 62692.01,
          "close": 62743.44
        },
        {
          "ts": "2026-06-05T02:54:59.999000Z",
          "open": 62743.45,
          "high": 62806.88,
          "low": 62623.38,
          "close": 62636.85
        },
        {
          "ts": "2026-06-05T02:59:59.999000Z",
          "open": 62636.84,
          "high": 62714.0,
          "low": 62600.0,
          "close": 62617.72
        },
        {
          "ts": "2026-06-05T03:04:59.999000Z",
          "open": 62617.72,
          "high": 62656.79,
          "low": 62472.16,
          "close": 62594.0
        },
        {
          "ts": "2026-06-05T03:09:59.999000Z",
          "open": 62593.99,
          "high": 62593.99,
          "low": 62366.37,
          "close": 62400.24
        },
        {
          "ts": "2026-06-05T03:14:59.999000Z",
          "open": 62400.24,
          "high": 62430.0,
          "low": 62339.0,
          "close": 62379.62
        },
        {
          "ts": "2026-06-05T03:19:59.999000Z",
          "open": 62379.61,
          "high": 62820.0,
          "low": 62379.61,
          "close": 62780.0
        },
        {
          "ts": "2026-06-05T03:24:59.999000Z",
          "open": 62780.01,
          "high": 62783.52,
          "low": 62546.45,
          "close": 62659.81
        },
        {
          "ts": "2026-06-05T03:29:59.999000Z",
          "open": 62659.81,
          "high": 62672.0,
          "low": 62534.0,
          "close": 62599.18
        },
        {
          "ts": "2026-06-05T03:34:59.999000Z",
          "open": 62599.18,
          "high": 62888.0,
          "low": 62599.18,
          "close": 62820.01
        },
        {
          "ts": "2026-06-05T03:39:59.999000Z",
          "open": 62820.01,
          "high": 62821.25,
          "low": 62650.0,
          "close": 62730.0
        },
        {
          "ts": "2026-06-05T03:44:59.999000Z",
          "open": 62730.0,
          "high": 62769.6,
          "low": 62584.22,
          "close": 62665.41
        },
        {
          "ts": "2026-06-05T03:49:59.999000Z",
          "open": 62665.41,
          "high": 62823.52,
          "low": 62654.0,
          "close": 62796.86
        },
        {
          "ts": "2026-06-05T03:54:59.999000Z",
          "open": 62796.87,
          "high": 62861.64,
          "low": 62692.01,
          "close": 62766.19
        },
        {
          "ts": "2026-06-05T03:59:59.999000Z",
          "open": 62766.19,
          "high": 62818.0,
          "low": 62687.4,
          "close": 62730.0
        },
        {
          "ts": "2026-06-05T04:04:59.999000Z",
          "open": 62730.0,
          "high": 62754.0,
          "low": 62487.24,
          "close": 62630.01
        },
        {
          "ts": "2026-06-05T04:09:59.999000Z",
          "open": 62630.0,
          "high": 62980.0,
          "low": 62598.0,
          "close": 62922.93
        },
        {
          "ts": "2026-06-05T04:14:59.999000Z",
          "open": 62922.93,
          "high": 62926.01,
          "low": 62775.0,
          "close": 62861.3
        },
        {
          "ts": "2026-06-05T04:19:59.999000Z",
          "open": 62861.3,
          "high": 62884.75,
          "low": 62659.99,
          "close": 62698.01
        },
        {
          "ts": "2026-06-05T04:24:59.999000Z",
          "open": 62698.01,
          "high": 62840.0,
          "low": 62659.71,
          "close": 62822.42
        },
        {
          "ts": "2026-06-05T04:29:59.999000Z",
          "open": 62822.43,
          "high": 63240.48,
          "low": 62822.42,
          "close": 63240.32
        },
        {
          "ts": "2026-06-05T04:34:59.999000Z",
          "open": 63240.32,
          "high": 63240.32,
          "low": 63026.0,
          "close": 63103.99
        },
        {
          "ts": "2026-06-05T04:39:59.999000Z",
          "open": 63104.0,
          "high": 63209.17,
          "low": 63078.0,
          "close": 63116.25
        },
        {
          "ts": "2026-06-05T04:44:59.999000Z",
          "open": 63116.25,
          "high": 63116.25,
          "low": 62990.81,
          "close": 63025.12
        },
        {
          "ts": "2026-06-05T04:49:59.999000Z",
          "open": 63025.11,
          "high": 63072.0,
          "low": 62846.28,
          "close": 62964.01
        },
        {
          "ts": "2026-06-05T04:54:59.999000Z",
          "open": 62964.01,
          "high": 63326.0,
          "low": 62964.01,
          "close": 63318.67
        },
        {
          "ts": "2026-06-05T04:59:59.999000Z",
          "open": 63318.68,
          "high": 63646.0,
          "low": 63210.0,
          "close": 63615.23
        },
        {
          "ts": "2026-06-05T05:04:59.999000Z",
          "open": 63615.22,
          "high": 63688.0,
          "low": 63410.25,
          "close": 63418.88
        },
        {
          "ts": "2026-06-05T05:09:59.999000Z",
          "open": 63418.88,
          "high": 63550.0,
          "low": 63366.67,
          "close": 63402.77
        },
        {
          "ts": "2026-06-05T05:14:59.999000Z",
          "open": 63402.77,
          "high": 63481.99,
          "low": 63344.0,
          "close": 63384.33
        },
        {
          "ts": "2026-06-05T05:19:59.999000Z",
          "open": 63384.34,
          "high": 63416.44,
          "low": 63278.0,
          "close": 63336.86
        },
        {
          "ts": "2026-06-05T05:24:59.999000Z",
          "open": 63336.87,
          "high": 63520.0,
          "low": 63336.86,
          "close": 63387.96
        },
        {
          "ts": "2026-06-05T05:29:59.999000Z",
          "open": 63387.95,
          "high": 63561.2,
          "low": 63373.68,
          "close": 63510.02
        },
        {
          "ts": "2026-06-05T05:34:59.999000Z",
          "open": 63510.01,
          "high": 63562.45,
          "low": 63335.03,
          "close": 63341.68
        },
        {
          "ts": "2026-06-05T05:39:59.999000Z",
          "open": 63341.69,
          "high": 63350.0,
          "low": 63085.75,
          "close": 63170.35
        },
        {
          "ts": "2026-06-05T05:44:59.999000Z",
          "open": 63170.35,
          "high": 63216.0,
          "low": 62887.0,
          "close": 62893.14
        },
        {
          "ts": "2026-06-05T05:49:59.999000Z",
          "open": 62893.14,
          "high": 62946.0,
          "low": 62618.89,
          "close": 62780.02
        },
        {
          "ts": "2026-06-05T05:54:59.999000Z",
          "open": 62780.01,
          "high": 62970.0,
          "low": 62694.91,
          "close": 62713.6
        },
        {
          "ts": "2026-06-05T05:59:59.999000Z",
          "open": 62713.61,
          "high": 62780.79,
          "low": 62278.0,
          "close": 62329.35
        },
        {
          "ts": "2026-06-05T06:04:59.999000Z",
          "open": 62329.36,
          "high": 62471.3,
          "low": 62027.78,
          "close": 62175.99
        },
        {
          "ts": "2026-06-05T06:09:59.999000Z",
          "open": 62175.98,
          "high": 62634.53,
          "low": 62170.52,
          "close": 62444.0
        },
        {
          "ts": "2026-06-05T06:14:59.999000Z",
          "open": 62444.01,
          "high": 62538.0,
          "low": 62078.0,
          "close": 62082.93
        },
        {
          "ts": "2026-06-05T06:19:59.999000Z",
          "open": 62082.94,
          "high": 62256.0,
          "low": 61814.0,
          "close": 61827.53
        },
        {
          "ts": "2026-06-05T06:24:59.999000Z",
          "open": 61827.52,
          "high": 61967.27,
          "low": 61126.01,
          "close": 61462.49
        },
        {
          "ts": "2026-06-05T06:29:59.999000Z",
          "open": 61462.49,
          "high": 61786.0,
          "low": 61350.0,
          "close": 61681.21
        },
        {
          "ts": "2026-06-05T06:34:59.999000Z",
          "open": 61681.2,
          "high": 61995.99,
          "low": 61644.0,
          "close": 61714.99
        },
        {
          "ts": "2026-06-05T06:39:59.999000Z",
          "open": 61714.99,
          "high": 61954.25,
          "low": 61659.28,
          "close": 61808.0
        },
        {
          "ts": "2026-06-05T06:44:59.999000Z",
          "open": 61808.0,
          "high": 62192.0,
          "low": 61710.52,
          "close": 62146.11
        },
        {
          "ts": "2026-06-05T06:49:59.999000Z",
          "open": 62146.11,
          "high": 62203.29,
          "low": 61870.0,
          "close": 61896.41
        },
        {
          "ts": "2026-06-05T06:54:59.999000Z",
          "open": 61896.41,
          "high": 62024.0,
          "low": 61784.0,
          "close": 61991.25
        },
        {
          "ts": "2026-06-05T06:59:59.999000Z",
          "open": 61991.25,
          "high": 62046.0,
          "low": 61879.87,
          "close": 61946.57
        },
        {
          "ts": "2026-06-05T07:04:59.999000Z",
          "open": 61946.57,
          "high": 61985.36,
          "low": 61602.51,
          "close": 61682.0
        },
        {
          "ts": "2026-06-05T07:09:59.999000Z",
          "open": 61682.0,
          "high": 61721.52,
          "low": 61413.22,
          "close": 61539.8
        },
        {
          "ts": "2026-06-05T07:14:59.999000Z",
          "open": 61539.81,
          "high": 61680.0,
          "low": 61378.38,
          "close": 61497.53
        },
        {
          "ts": "2026-06-05T07:19:59.999000Z",
          "open": 61497.52,
          "high": 61805.89,
          "low": 61491.74,
          "close": 61666.21
        },
        {
          "ts": "2026-06-05T07:24:59.999000Z",
          "open": 61666.22,
          "high": 62005.15,
          "low": 61606.0,
          "close": 61837.45
        },
        {
          "ts": "2026-06-05T07:29:59.999000Z",
          "open": 61837.44,
          "high": 62356.13,
          "low": 61782.0,
          "close": 62252.95
        },
        {
          "ts": "2026-06-05T07:34:59.999000Z",
          "open": 62252.94,
          "high": 62526.87,
          "low": 62190.0,
          "close": 62445.84
        },
        {
          "ts": "2026-06-05T07:39:59.999000Z",
          "open": 62445.83,
          "high": 62827.55,
          "low": 62436.47,
          "close": 62768.0
        },
        {
          "ts": "2026-06-05T07:44:59.999000Z",
          "open": 62768.0,
          "high": 62902.0,
          "low": 62678.84,
          "close": 62881.98
        },
        {
          "ts": "2026-06-05T07:49:59.999000Z",
          "open": 62881.98,
          "high": 62992.52,
          "low": 62753.53,
          "close": 62850.01
        },
        {
          "ts": "2026-06-05T07:54:59.999000Z",
          "open": 62850.0,
          "high": 62987.04,
          "low": 62792.1,
          "close": 62940.52
        },
        {
          "ts": "2026-06-05T07:59:59.999000Z",
          "open": 62940.53,
          "high": 63116.0,
          "low": 62836.79,
          "close": 63115.99
        },
        {
          "ts": "2026-06-05T08:04:59.999000Z",
          "open": 63115.99,
          "high": 63120.98,
          "low": 62869.64,
          "close": 62873.96
        },
        {
          "ts": "2026-06-05T08:09:59.999000Z",
          "open": 62873.95,
          "high": 62979.33,
          "low": 62740.15,
          "close": 62761.78
        },
        {
          "ts": "2026-06-05T08:14:59.999000Z",
          "open": 62761.77,
          "high": 62819.5,
          "low": 62704.0,
          "close": 62805.61
        },
        {
          "ts": "2026-06-05T08:19:59.999000Z",
          "open": 62805.61,
          "high": 62818.18,
          "low": 62584.58,
          "close": 62648.26
        },
        {
          "ts": "2026-06-05T08:24:59.999000Z",
          "open": 62648.27,
          "high": 62775.99,
          "low": 62617.86,
          "close": 62703.5
        },
        {
          "ts": "2026-06-05T08:29:59.999000Z",
          "open": 62703.5,
          "high": 62873.99,
          "low": 62678.04,
          "close": 62816.13
        },
        {
          "ts": "2026-06-05T08:34:59.999000Z",
          "open": 62816.28,
          "high": 62932.63,
          "low": 62691.69,
          "close": 62702.44
        },
        {
          "ts": "2026-06-05T08:39:59.999000Z",
          "open": 62702.44,
          "high": 62750.0,
          "low": 62526.98,
          "close": 62533.31
        },
        {
          "ts": "2026-06-05T08:44:59.999000Z",
          "open": 62533.3,
          "high": 62701.97,
          "low": 62516.09,
          "close": 62540.0
        },
        {
          "ts": "2026-06-05T08:49:59.999000Z",
          "open": 62540.01,
          "high": 62612.0,
          "low": 62491.81,
          "close": 62590.93
        },
        {
          "ts": "2026-06-05T08:54:59.999000Z",
          "open": 62590.92,
          "high": 62590.93,
          "low": 62379.31,
          "close": 62391.38
        },
        {
          "ts": "2026-06-05T08:59:59.999000Z",
          "open": 62391.39,
          "high": 62495.99,
          "low": 62288.88,
          "close": 62454.64
        },
        {
          "ts": "2026-06-05T09:04:59.999000Z",
          "open": 62454.64,
          "high": 62658.0,
          "low": 62442.0,
          "close": 62549.36
        },
        {
          "ts": "2026-06-05T09:09:59.999000Z",
          "open": 62549.35,
          "high": 62782.0,
          "low": 62508.43,
          "close": 62745.15
        },
        {
          "ts": "2026-06-05T09:14:59.999000Z",
          "open": 62745.14,
          "high": 63099.65,
          "low": 62630.0,
          "close": 63099.64
        },
        {
          "ts": "2026-06-05T09:19:59.999000Z",
          "open": 63099.65,
          "high": 63259.9,
          "low": 62950.0,
          "close": 62964.0
        },
        {
          "ts": "2026-06-05T09:24:59.999000Z",
          "open": 62964.0,
          "high": 63078.0,
          "low": 62901.1,
          "close": 63037.26
        },
        {
          "ts": "2026-06-05T09:29:59.999000Z",
          "open": 63037.27,
          "high": 63140.0,
          "low": 63002.81,
          "close": 63114.43
        },
        {
          "ts": "2026-06-05T09:34:59.999000Z",
          "open": 63114.43,
          "high": 63124.0,
          "low": 62940.0,
          "close": 63015.52
        },
        {
          "ts": "2026-06-05T09:39:59.999000Z",
          "open": 63015.52,
          "high": 63064.0,
          "low": 62799.86,
          "close": 62814.34
        },
        {
          "ts": "2026-06-05T09:44:59.999000Z",
          "open": 62814.34,
          "high": 62840.0,
          "low": 62775.0,
          "close": 62819.49
        },
        {
          "ts": "2026-06-05T09:49:59.999000Z",
          "open": 62819.49,
          "high": 62922.0,
          "low": 62813.19,
          "close": 62838.01
        },
        {
          "ts": "2026-06-05T09:54:59.999000Z",
          "open": 62838.0,
          "high": 62994.0,
          "low": 62804.0,
          "close": 62863.42
        },
        {
          "ts": "2026-06-05T09:59:59.999000Z",
          "open": 62863.42,
          "high": 62908.0,
          "low": 62811.43,
          "close": 62860.09
        },
        {
          "ts": "2026-06-05T10:04:59.999000Z",
          "open": 62860.09,
          "high": 62931.81,
          "low": 62780.17,
          "close": 62824.66
        },
        {
          "ts": "2026-06-05T10:09:59.999000Z",
          "open": 62824.66,
          "high": 62838.82,
          "low": 62667.36,
          "close": 62680.81
        },
        {
          "ts": "2026-06-05T10:14:59.999000Z",
          "open": 62680.8,
          "high": 62805.22,
          "low": 62652.0,
          "close": 62748.76
        },
        {
          "ts": "2026-06-05T10:19:59.999000Z",
          "open": 62748.77,
          "high": 62748.77,
          "low": 62552.7,
          "close": 62570.69
        },
        {
          "ts": "2026-06-05T10:24:59.999000Z",
          "open": 62570.7,
          "high": 62632.6,
          "low": 62501.76,
          "close": 62538.35
        },
        {
          "ts": "2026-06-05T10:29:59.999000Z",
          "open": 62538.35,
          "high": 62630.0,
          "low": 62538.35,
          "close": 62586.01
        },
        {
          "ts": "2026-06-05T10:34:59.999000Z",
          "open": 62586.01,
          "high": 62653.61,
          "low": 62565.62,
          "close": 62565.63
        },
        {
          "ts": "2026-06-05T10:39:59.999000Z",
          "open": 62565.62,
          "high": 62580.87,
          "low": 62375.0,
          "close": 62387.26
        },
        {
          "ts": "2026-06-05T10:44:59.999000Z",
          "open": 62387.27,
          "high": 62711.99,
          "low": 62387.26,
          "close": 62675.51
        },
        {
          "ts": "2026-06-05T10:49:59.999000Z",
          "open": 62675.51,
          "high": 62675.52,
          "low": 62552.42,
          "close": 62602.0
        },
        {
          "ts": "2026-06-05T10:54:59.999000Z",
          "open": 62602.0,
          "high": 62616.6,
          "low": 62453.0,
          "close": 62546.08
        },
        {
          "ts": "2026-06-05T10:59:59.999000Z",
          "open": 62546.08,
          "high": 62563.63,
          "low": 62492.0,
          "close": 62536.87
        },
        {
          "ts": "2026-06-05T11:04:59.999000Z",
          "open": 62536.87,
          "high": 62538.83,
          "low": 62350.79,
          "close": 62406.0
        },
        {
          "ts": "2026-06-05T11:09:59.999000Z",
          "open": 62406.0,
          "high": 62490.0,
          "low": 62292.36,
          "close": 62324.65
        },
        {
          "ts": "2026-06-05T11:14:59.999000Z",
          "open": 62324.64,
          "high": 62380.0,
          "low": 62255.28,
          "close": 62326.53
        },
        {
          "ts": "2026-06-05T11:19:59.999000Z",
          "open": 62326.53,
          "high": 62502.0,
          "low": 62246.0,
          "close": 62491.91
        },
        {
          "ts": "2026-06-05T11:24:59.999000Z",
          "open": 62491.9,
          "high": 62644.48,
          "low": 62326.0,
          "close": 62344.88
        },
        {
          "ts": "2026-06-05T11:29:59.999000Z",
          "open": 62344.87,
          "high": 62510.0,
          "low": 62339.29,
          "close": 62471.91
        },
        {
          "ts": "2026-06-05T11:34:59.999000Z",
          "open": 62473.18,
          "high": 62521.92,
          "low": 62289.42,
          "close": 62349.24
        },
        {
          "ts": "2026-06-05T11:39:59.999000Z",
          "open": 62349.24,
          "high": 62377.65,
          "low": 62255.0,
          "close": 62295.99
        },
        {
          "ts": "2026-06-05T11:44:59.999000Z",
          "open": 62295.99,
          "high": 62303.99,
          "low": 62114.4,
          "close": 62114.4
        },
        {
          "ts": "2026-06-05T11:49:59.999000Z",
          "open": 62114.41,
          "high": 62260.0,
          "low": 62000.0,
          "close": 62189.17
        },
        {
          "ts": "2026-06-05T11:54:59.999000Z",
          "open": 62189.18,
          "high": 62224.0,
          "low": 62002.0,
          "close": 62006.01
        },
        {
          "ts": "2026-06-05T11:59:59.999000Z",
          "open": 62006.01,
          "high": 62096.0,
          "low": 61964.98,
          "close": 61964.99
        },
        {
          "ts": "2026-06-05T12:04:59.999000Z",
          "open": 61964.99,
          "high": 61984.0,
          "low": 61647.06,
          "close": 61656.95
        },
        {
          "ts": "2026-06-05T12:09:59.999000Z",
          "open": 61656.96,
          "high": 62192.0,
          "low": 61656.96,
          "close": 62047.06
        },
        {
          "ts": "2026-06-05T12:14:59.999000Z",
          "open": 62047.06,
          "high": 62281.13,
          "low": 62032.0,
          "close": 62148.67
        },
        {
          "ts": "2026-06-05T12:19:59.999000Z",
          "open": 62148.68,
          "high": 62371.27,
          "low": 62148.67,
          "close": 62329.81
        },
        {
          "ts": "2026-06-05T12:24:59.999000Z",
          "open": 62329.81,
          "high": 62457.86,
          "low": 62172.0,
          "close": 62389.99
        },
        {
          "ts": "2026-06-05T12:29:59.999000Z",
          "open": 62389.99,
          "high": 62389.99,
          "low": 62162.06,
          "close": 62219.04
        },
        {
          "ts": "2026-06-05T12:34:59.999000Z",
          "open": 62220.48,
          "high": 62400.0,
          "low": 61753.43,
          "close": 61753.43
        },
        {
          "ts": "2026-06-05T12:39:59.999000Z",
          "open": 61753.43,
          "high": 62069.7,
          "low": 61620.47,
          "close": 61932.45
        },
        {
          "ts": "2026-06-05T12:44:59.999000Z",
          "open": 61932.46,
          "high": 62094.75,
          "low": 61843.17,
          "close": 61974.89
        },
        {
          "ts": "2026-06-05T12:49:59.999000Z",
          "open": 61974.89,
          "high": 62089.87,
          "low": 61884.0,
          "close": 61968.01
        },
        {
          "ts": "2026-06-05T12:54:59.999000Z",
          "open": 61968.01,
          "high": 62060.0,
          "low": 61863.82,
          "close": 61929.42
        },
        {
          "ts": "2026-06-05T12:59:59.999000Z",
          "open": 61929.41,
          "high": 62023.4,
          "low": 61884.03,
          "close": 61959.73
        },
        {
          "ts": "2026-06-05T13:04:59.999000Z",
          "open": 61959.72,
          "high": 62098.0,
          "low": 61922.0,
          "close": 62073.77
        },
        {
          "ts": "2026-06-05T13:09:59.999000Z",
          "open": 62073.77,
          "high": 62172.0,
          "low": 61924.41,
          "close": 61966.64
        },
        {
          "ts": "2026-06-05T13:14:59.999000Z",
          "open": 61966.63,
          "high": 62074.33,
          "low": 61924.01,
          "close": 61985.0
        },
        {
          "ts": "2026-06-05T13:19:59.999000Z",
          "open": 61984.99,
          "high": 62102.0,
          "low": 61892.0,
          "close": 62073.0
        },
        {
          "ts": "2026-06-05T13:24:59.999000Z",
          "open": 62073.0,
          "high": 62315.99,
          "low": 62066.55,
          "close": 62127.4
        },
        {
          "ts": "2026-06-05T13:29:59.999000Z",
          "open": 62127.41,
          "high": 62240.0,
          "low": 62106.01,
          "close": 62116.0
        },
        {
          "ts": "2026-06-05T13:34:59.999000Z",
          "open": 62116.0,
          "high": 62326.0,
          "low": 61905.99,
          "close": 62194.07
        },
        {
          "ts": "2026-06-05T13:39:59.999000Z",
          "open": 62194.07,
          "high": 62266.0,
          "low": 61782.0,
          "close": 61811.99
        },
        {
          "ts": "2026-06-05T13:44:59.999000Z",
          "open": 61812.0,
          "high": 61888.0,
          "low": 61675.49,
          "close": 61846.0
        },
        {
          "ts": "2026-06-05T13:49:59.999000Z",
          "open": 61846.0,
          "high": 61877.99,
          "low": 61260.7,
          "close": 61271.88
        },
        {
          "ts": "2026-06-05T13:54:59.999000Z",
          "open": 61271.88,
          "high": 61388.88,
          "low": 61100.0,
          "close": 61242.72
        },
        {
          "ts": "2026-06-05T13:59:59.999000Z",
          "open": 61242.73,
          "high": 61253.61,
          "low": 60732.35,
          "close": 60732.36
        },
        {
          "ts": "2026-06-05T14:04:59.999000Z",
          "open": 60732.36,
          "high": 61005.2,
          "low": 60578.0,
          "close": 60613.21
        },
        {
          "ts": "2026-06-05T14:09:59.999000Z",
          "open": 60613.22,
          "high": 61227.98,
          "low": 60461.88,
          "close": 61136.31
        },
        {
          "ts": "2026-06-05T14:14:59.999000Z",
          "open": 61136.31,
          "high": 61180.0,
          "low": 60656.92,
          "close": 60865.45
        },
        {
          "ts": "2026-06-05T14:19:59.999000Z",
          "open": 60865.45,
          "high": 61061.28,
          "low": 60700.0,
          "close": 60788.8
        },
        {
          "ts": "2026-06-05T14:24:59.999000Z",
          "open": 60788.8,
          "high": 60956.39,
          "low": 60480.0,
          "close": 60557.83
        },
        {
          "ts": "2026-06-05T14:29:59.999000Z",
          "open": 60557.83,
          "high": 60593.55,
          "low": 60340.0,
          "close": 60394.6
        },
        {
          "ts": "2026-06-05T14:34:59.999000Z",
          "open": 60394.59,
          "high": 60848.53,
          "low": 60334.97,
          "close": 60845.57
        },
        {
          "ts": "2026-06-05T14:39:59.999000Z",
          "open": 60846.0,
          "high": 61195.99,
          "low": 60696.8,
          "close": 60888.01
        },
        {
          "ts": "2026-06-05T14:44:59.999000Z",
          "open": 60888.01,
          "high": 61045.54,
          "low": 60720.5,
          "close": 60845.87
        },
        {
          "ts": "2026-06-05T14:49:59.999000Z",
          "open": 60845.87,
          "high": 61135.19,
          "low": 60799.55,
          "close": 60799.55
        },
        {
          "ts": "2026-06-05T14:54:59.999000Z",
          "open": 60799.55,
          "high": 61076.34,
          "low": 60758.0,
          "close": 60762.01
        },
        {
          "ts": "2026-06-05T14:59:59.999000Z",
          "open": 60762.0,
          "high": 60944.0,
          "low": 60624.0,
          "close": 60868.97
        },
        {
          "ts": "2026-06-05T15:04:59.999000Z",
          "open": 60868.98,
          "high": 61033.99,
          "low": 60628.93,
          "close": 60996.0
        },
        {
          "ts": "2026-06-05T15:09:59.999000Z",
          "open": 60996.0,
          "high": 61003.98,
          "low": 60718.73,
          "close": 60755.32
        },
        {
          "ts": "2026-06-05T15:14:59.999000Z",
          "open": 60755.31,
          "high": 60792.0,
          "low": 60532.86,
          "close": 60609.59
        },
        {
          "ts": "2026-06-05T15:19:59.999000Z",
          "open": 60609.6,
          "high": 60874.0,
          "low": 60506.0,
          "close": 60853.74
        },
        {
          "ts": "2026-06-05T15:24:59.999000Z",
          "open": 60853.73,
          "high": 60962.0,
          "low": 60659.04,
          "close": 60910.0
        },
        {
          "ts": "2026-06-05T15:29:59.999000Z",
          "open": 60910.0,
          "high": 61126.0,
          "low": 60708.47,
          "close": 60790.36
        },
        {
          "ts": "2026-06-05T15:34:59.999000Z",
          "open": 60789.63,
          "high": 60852.9,
          "low": 60534.0,
          "close": 60617.91
        },
        {
          "ts": "2026-06-05T15:39:59.999000Z",
          "open": 60617.91,
          "high": 60660.66,
          "low": 60166.32,
          "close": 60202.6
        },
        {
          "ts": "2026-06-05T15:44:59.999000Z",
          "open": 60202.59,
          "high": 60470.0,
          "low": 60000.0,
          "close": 60370.0
        },
        {
          "ts": "2026-06-05T15:49:59.999000Z",
          "open": 60370.0,
          "high": 60635.0,
          "low": 60192.01,
          "close": 60592.01
        },
        {
          "ts": "2026-06-05T15:54:59.999000Z",
          "open": 60592.0,
          "high": 60611.99,
          "low": 60418.85,
          "close": 60552.0
        },
        {
          "ts": "2026-06-05T15:59:59.999000Z",
          "open": 60551.99,
          "high": 60618.48,
          "low": 60418.85,
          "close": 60438.01
        },
        {
          "ts": "2026-06-05T16:04:59.999000Z",
          "open": 60438.0,
          "high": 60438.0,
          "low": 60186.29,
          "close": 60247.98
        },
        {
          "ts": "2026-06-05T16:09:59.999000Z",
          "open": 60247.98,
          "high": 60508.39,
          "low": 60003.62,
          "close": 60052.48
        },
        {
          "ts": "2026-06-05T16:14:59.999000Z",
          "open": 60052.47,
          "high": 61085.7,
          "low": 59786.0,
          "close": 60897.63
        },
        {
          "ts": "2026-06-05T16:19:59.999000Z",
          "open": 60897.63,
          "high": 61151.33,
          "low": 60720.59,
          "close": 60969.66
        },
        {
          "ts": "2026-06-05T16:24:59.999000Z",
          "open": 60969.48,
          "high": 61547.24,
          "low": 60950.0,
          "close": 61222.96
        },
        {
          "ts": "2026-06-05T16:29:59.999000Z",
          "open": 61222.96,
          "high": 61263.42,
          "low": 60886.55,
          "close": 60926.89
        },
        {
          "ts": "2026-06-05T16:34:59.999000Z",
          "open": 60926.89,
          "high": 61062.0,
          "low": 60710.01,
          "close": 60812.63
        },
        {
          "ts": "2026-06-05T16:39:59.999000Z",
          "open": 60812.63,
          "high": 60988.0,
          "low": 60803.68,
          "close": 60964.58
        },
        {
          "ts": "2026-06-05T16:44:59.999000Z",
          "open": 60964.59,
          "high": 60977.59,
          "low": 60746.0,
          "close": 60832.49
        },
        {
          "ts": "2026-06-05T16:49:59.999000Z",
          "open": 60832.49,
          "high": 61190.47,
          "low": 60806.74,
          "close": 61148.0
        },
        {
          "ts": "2026-06-05T16:54:59.999000Z",
          "open": 61148.0,
          "high": 61395.18,
          "low": 61098.0,
          "close": 61385.33
        },
        {
          "ts": "2026-06-05T16:59:59.999000Z",
          "open": 61385.33,
          "high": 61475.12,
          "low": 61302.56,
          "close": 61394.39
        },
        {
          "ts": "2026-06-05T17:04:59.999000Z",
          "open": 61394.38,
          "high": 61508.85,
          "low": 61205.34,
          "close": 61385.15
        },
        {
          "ts": "2026-06-05T17:09:59.999000Z",
          "open": 61385.15,
          "high": 61435.74,
          "low": 61220.01,
          "close": 61367.04
        },
        {
          "ts": "2026-06-05T17:14:59.999000Z",
          "open": 61367.04,
          "high": 61367.04,
          "low": 60930.8,
          "close": 61061.06
        },
        {
          "ts": "2026-06-05T17:19:59.999000Z",
          "open": 61061.07,
          "high": 61077.09,
          "low": 60794.0,
          "close": 60841.66
        },
        {
          "ts": "2026-06-05T17:24:59.999000Z",
          "open": 60841.66,
          "high": 60974.8,
          "low": 60742.24,
          "close": 60817.37
        },
        {
          "ts": "2026-06-05T17:29:59.999000Z",
          "open": 60817.37,
          "high": 60848.0,
          "low": 60660.0,
          "close": 60697.27
        },
        {
          "ts": "2026-06-05T17:34:59.999000Z",
          "open": 60697.27,
          "high": 60901.99,
          "low": 60688.0,
          "close": 60877.0
        },
        {
          "ts": "2026-06-05T17:39:59.999000Z",
          "open": 60877.0,
          "high": 60906.0,
          "low": 60764.0,
          "close": 60894.03
        },
        {
          "ts": "2026-06-05T17:44:59.999000Z",
          "open": 60894.03,
          "high": 61151.67,
          "low": 60746.0,
          "close": 60755.83
        },
        {
          "ts": "2026-06-05T17:49:59.999000Z",
          "open": 60755.82,
          "high": 60833.19,
          "low": 60664.01,
          "close": 60672.34
        },
        {
          "ts": "2026-06-05T17:54:59.999000Z",
          "open": 60672.33,
          "high": 60849.23,
          "low": 60672.33,
          "close": 60794.0
        },
        {
          "ts": "2026-06-05T17:59:59.999000Z",
          "open": 60794.0,
          "high": 60832.0,
          "low": 60700.74,
          "close": 60813.99
        },
        {
          "ts": "2026-06-05T18:04:59.999000Z",
          "open": 60814.0,
          "high": 60950.0,
          "low": 60710.0,
          "close": 60749.01
        },
        {
          "ts": "2026-06-05T18:09:59.999000Z",
          "open": 60749.0,
          "high": 60896.0,
          "low": 60736.0,
          "close": 60736.01
        },
        {
          "ts": "2026-06-05T18:14:59.999000Z",
          "open": 60736.01,
          "high": 60796.17,
          "low": 60612.0,
          "close": 60624.35
        },
        {
          "ts": "2026-06-05T18:19:59.999000Z",
          "open": 60624.36,
          "high": 60664.0,
          "low": 60449.22,
          "close": 60449.22
        },
        {
          "ts": "2026-06-05T18:24:59.999000Z",
          "open": 60449.22,
          "high": 60554.8,
          "low": 60296.02,
          "close": 60323.65
        },
        {
          "ts": "2026-06-05T18:29:59.999000Z",
          "open": 60323.64,
          "high": 60346.0,
          "low": 60108.03,
          "close": 60158.0
        },
        {
          "ts": "2026-06-05T18:34:59.999000Z",
          "open": 60158.01,
          "high": 60292.0,
          "low": 60100.0,
          "close": 60250.03
        },
        {
          "ts": "2026-06-05T18:39:59.999000Z",
          "open": 60249.26,
          "high": 60323.48,
          "low": 59968.0,
          "close": 60309.96
        },
        {
          "ts": "2026-06-05T18:44:59.999000Z",
          "open": 60309.96,
          "high": 60340.09,
          "low": 59668.0,
          "close": 59952.0
        },
        {
          "ts": "2026-06-05T18:49:59.999000Z",
          "open": 59952.0,
          "high": 59972.0,
          "low": 59669.6,
          "close": 59785.68
        },
        {
          "ts": "2026-06-05T18:54:59.999000Z",
          "open": 59785.68,
          "high": 59805.97,
          "low": 59170.0,
          "close": 59207.42
        },
        {
          "ts": "2026-06-05T18:59:59.999000Z",
          "open": 59207.42,
          "high": 59649.99,
          "low": 59141.0,
          "close": 59395.99
        },
        {
          "ts": "2026-06-05T19:04:59.999000Z",
          "open": 59396.0,
          "high": 59612.67,
          "low": 59145.0,
          "close": 59415.99
        },
        {
          "ts": "2026-06-05T19:09:59.999000Z",
          "open": 59415.99,
          "high": 59521.73,
          "low": 59276.0,
          "close": 59411.99
        },
        {
          "ts": "2026-06-05T19:14:59.999000Z",
          "open": 59412.0,
          "high": 59547.84,
          "low": 59293.92,
          "close": 59392.25
        },
        {
          "ts": "2026-06-05T19:19:59.999000Z",
          "open": 59392.0,
          "high": 59414.0,
          "low": 59130.91,
          "close": 59241.86
        },
        {
          "ts": "2026-06-05T19:24:59.999000Z",
          "open": 59241.85,
          "high": 59611.67,
          "low": 59205.12,
          "close": 59610.77
        },
        {
          "ts": "2026-06-05T19:29:59.999000Z",
          "open": 59610.77,
          "high": 59869.98,
          "low": 59576.47,
          "close": 59858.27
        },
        {
          "ts": "2026-06-05T19:34:59.999000Z",
          "open": 59858.28,
          "high": 59869.45,
          "low": 59485.45,
          "close": 59707.19
        },
        {
          "ts": "2026-06-05T19:39:59.999000Z",
          "open": 59707.2,
          "high": 59826.47,
          "low": 59626.16,
          "close": 59806.79
        },
        {
          "ts": "2026-06-05T19:44:59.999000Z",
          "open": 59806.8,
          "high": 59897.32,
          "low": 59560.0,
          "close": 59752.15
        },
        {
          "ts": "2026-06-05T19:49:59.999000Z",
          "open": 59752.14,
          "high": 60453.69,
          "low": 59744.0,
          "close": 60215.47
        },
        {
          "ts": "2026-06-05T19:54:59.999000Z",
          "open": 60215.48,
          "high": 60428.17,
          "low": 60139.31,
          "close": 60216.92
        },
        {
          "ts": "2026-06-05T19:59:59.999000Z",
          "open": 60217.92,
          "high": 60459.41,
          "low": 60114.08,
          "close": 60300.24
        },
        {
          "ts": "2026-06-05T20:04:59.999000Z",
          "open": 60300.24,
          "high": 60454.0,
          "low": 60016.27,
          "close": 60083.99
        }
      ],
      "accepted_markers": [
        {
          "ts": "2026-06-02T08:49:59.999000Z",
          "side": "short",
          "price": 69801.3,
          "proposal_id": "pp_f0e5fde0a172e4abc895918d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 750.0
        },
        {
          "ts": "2026-06-02T08:49:59.999000Z",
          "side": "long",
          "price": 69801.3,
          "proposal_id": "pp_0f0288196309dd74213ceaf0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 749.96
        },
        {
          "ts": "2026-06-02T09:04:59.999000Z",
          "side": "long",
          "price": 69597.09,
          "proposal_id": "pp_e8e5bc5b50257fe2146688e8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 749.88
        },
        {
          "ts": "2026-06-02T09:04:59.999000Z",
          "side": "long",
          "price": 69597.09,
          "proposal_id": "pp_6016538369a7248fd4d45807",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 749.84
        },
        {
          "ts": "2026-06-02T09:19:59.999000Z",
          "side": "short",
          "price": 69612.75,
          "proposal_id": "pp_8566a6829aaa03dc6f71543c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0721,
          "notional": 721.04
        },
        {
          "ts": "2026-06-02T09:24:59.999000Z",
          "side": "long",
          "price": 69489.99,
          "proposal_id": "pp_d1e9a046fef9bceb1a63b680",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 749.56
        },
        {
          "ts": "2026-06-02T09:29:59.999000Z",
          "side": "short",
          "price": 69399.1,
          "proposal_id": "pp_182580f55868e0ad3e1242c3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 749.48
        },
        {
          "ts": "2026-06-02T09:29:59.999000Z",
          "side": "long",
          "price": 69399.1,
          "proposal_id": "pp_6016538369a7248fd4d45807",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 749.44
        },
        {
          "ts": "2026-06-02T09:39:59.999000Z",
          "side": "long",
          "price": 69475.31,
          "proposal_id": "pp_6016538369a7248fd4d45807",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 749.23
        },
        {
          "ts": "2026-06-02T10:09:59.999000Z",
          "side": "long",
          "price": 69636.0,
          "proposal_id": "pp_981c092b48787c76f11ef633",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 749.33
        },
        {
          "ts": "2026-06-02T10:14:59.999000Z",
          "side": "short",
          "price": 69657.99,
          "proposal_id": "pp_97133692697e625d742f816c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 749.43
        },
        {
          "ts": "2026-06-02T10:24:59.999000Z",
          "side": "short",
          "price": 69544.39,
          "proposal_id": "pp_9eacb761666be9645ff1a164",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0705,
          "notional": 704.64
        },
        {
          "ts": "2026-06-02T10:29:59.999000Z",
          "side": "long",
          "price": 69646.01,
          "proposal_id": "pp_b38edda024e126592abe9305",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0501,
          "notional": 500.63
        },
        {
          "ts": "2026-06-02T10:34:59.999000Z",
          "side": "long",
          "price": 69512.0,
          "proposal_id": "pp_d3cae8adb7a57dfdadaf53ba",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 749.07
        },
        {
          "ts": "2026-06-02T10:39:59.999000Z",
          "side": "short",
          "price": 69496.0,
          "proposal_id": "pp_2ebd4203d9ae986abedc844b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0568,
          "notional": 567.75
        },
        {
          "ts": "2026-06-02T10:49:59.999000Z",
          "side": "short",
          "price": 69480.0,
          "proposal_id": "pp_cf9ff44cc80dfad4ed118cde",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0616,
          "notional": 615.41
        },
        {
          "ts": "2026-06-02T10:54:59.999000Z",
          "side": "long",
          "price": 69662.12,
          "proposal_id": "pp_973a782b527acebae031698c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 748.66
        },
        {
          "ts": "2026-06-02T10:54:59.999000Z",
          "side": "long",
          "price": 69662.12,
          "proposal_id": "pp_b38edda024e126592abe9305",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0514,
          "notional": 512.72
        },
        {
          "ts": "2026-06-02T11:09:59.999000Z",
          "side": "long",
          "price": 69602.0,
          "proposal_id": "pp_0fa51f71bffc8c488bf879bf",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 748.5
        },
        {
          "ts": "2026-06-02T11:14:59.999000Z",
          "side": "long",
          "price": 69552.0,
          "proposal_id": "pp_410c8f931b13c4dc61f85c71",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 748.36
        },
        {
          "ts": "2026-06-02T11:19:59.999000Z",
          "side": "long",
          "price": 69450.01,
          "proposal_id": "pp_6f78b9d03311fc664c6d480a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0523,
          "notional": 521.95
        },
        {
          "ts": "2026-06-02T11:19:59.999000Z",
          "side": "long",
          "price": 69450.01,
          "proposal_id": "pp_03abc67a30a5b249dbc83abf",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 748.02
        },
        {
          "ts": "2026-06-02T11:34:59.999000Z",
          "side": "long",
          "price": 69430.0,
          "proposal_id": "pp_3a19709bbabaefc8df4f9a58",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 747.93
        },
        {
          "ts": "2026-06-02T11:49:59.999000Z",
          "side": "long",
          "price": 69536.01,
          "proposal_id": "pp_d208d0398022e18d85f3b357",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 747.93
        },
        {
          "ts": "2026-06-02T12:04:59.999000Z",
          "side": "long",
          "price": 69490.01,
          "proposal_id": "pp_5e7083e872e8206127c4d16a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 747.78
        },
        {
          "ts": "2026-06-02T12:09:59.999000Z",
          "side": "long",
          "price": 69468.63,
          "proposal_id": "pp_08ad903e1fc3ec38e9e818c0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 747.49
        },
        {
          "ts": "2026-06-02T12:09:59.999000Z",
          "side": "long",
          "price": 69468.63,
          "proposal_id": "pp_508e2d5dc2617ba5f6ea182a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 747.44
        },
        {
          "ts": "2026-06-02T12:14:59.999000Z",
          "side": "long",
          "price": 69343.99,
          "proposal_id": "pp_cfa86d21f24477f17b7072dd",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0721,
          "notional": 718.09
        },
        {
          "ts": "2026-06-02T12:14:59.999000Z",
          "side": "long",
          "price": 69343.99,
          "proposal_id": "pp_508e2d5dc2617ba5f6ea182a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 747.11
        },
        {
          "ts": "2026-06-02T12:29:59.999000Z",
          "side": "long",
          "price": 69286.03,
          "proposal_id": "pp_e1b03f12e8e5350cbc823019",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 746.98
        },
        {
          "ts": "2026-06-02T12:34:59.999000Z",
          "side": "long",
          "price": 69173.84,
          "proposal_id": "pp_508e2d5dc2617ba5f6ea182a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 746.67
        },
        {
          "ts": "2026-06-02T12:34:59.999000Z",
          "side": "short",
          "price": 69173.84,
          "proposal_id": "pp_7d0a55cd12c1952b02119e8e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 746.63
        },
        {
          "ts": "2026-06-02T12:59:59.999000Z",
          "side": "short",
          "price": 69010.42,
          "proposal_id": "pp_2179ebd632a36a4ec3f30b2d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 746.44
        },
        {
          "ts": "2026-06-02T13:04:59.999000Z",
          "side": "short",
          "price": 69106.01,
          "proposal_id": "pp_dab2203b7ef23ae478044844",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0576,
          "notional": 573.06
        },
        {
          "ts": "2026-06-02T13:04:59.999000Z",
          "side": "long",
          "price": 69106.01,
          "proposal_id": "pp_0e933332109cc93d5f7f7584",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 746.33
        },
        {
          "ts": "2026-06-02T13:14:59.999000Z",
          "side": "long",
          "price": 68918.81,
          "proposal_id": "pp_0e933332109cc93d5f7f7584",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 746.12
        },
        {
          "ts": "2026-06-02T13:19:59.999000Z",
          "side": "short",
          "price": 68994.0,
          "proposal_id": "pp_dfe49ac1d542a863cb1d283b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 746.19
        },
        {
          "ts": "2026-06-02T13:34:59.999000Z",
          "side": "long",
          "price": 68957.1,
          "proposal_id": "pp_31ea8ada37642566fa662ce2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 746.13
        },
        {
          "ts": "2026-06-02T13:39:59.999000Z",
          "side": "long",
          "price": 68880.71,
          "proposal_id": "pp_fbea59e4e8c10d86903fb9c2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 745.93
        },
        {
          "ts": "2026-06-02T13:44:59.999000Z",
          "side": "long",
          "price": 68879.76,
          "proposal_id": "pp_4db045ab847cda6934590216",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0555,
          "notional": 552.17
        },
        {
          "ts": "2026-06-02T13:54:59.999000Z",
          "side": "long",
          "price": 68795.93,
          "proposal_id": "pp_3ae6927c75c6780439243338",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0731,
          "notional": 727.17
        },
        {
          "ts": "2026-06-02T13:59:59.999000Z",
          "side": "short",
          "price": 68811.91,
          "proposal_id": "pp_2746cd7b87a8e3f9d67106f0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 745.48
        },
        {
          "ts": "2026-06-02T14:04:59.999000Z",
          "side": "long",
          "price": 68635.99,
          "proposal_id": "pp_7ba26b1a2ed865b150b879a3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 745.28
        },
        {
          "ts": "2026-06-02T14:09:59.999000Z",
          "side": "long",
          "price": 68433.5,
          "proposal_id": "pp_e32659ebcfb4439c97a1cdd6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 745.2
        },
        {
          "ts": "2026-06-02T14:09:59.999000Z",
          "side": "short",
          "price": 68433.5,
          "proposal_id": "pp_7d0a55cd12c1952b02119e8e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 745.16
        },
        {
          "ts": "2026-06-02T14:14:59.999000Z",
          "side": "short",
          "price": 68584.0,
          "proposal_id": "pp_24e27ddba51a6aebd368bce6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0503,
          "notional": 500.15
        },
        {
          "ts": "2026-06-02T14:14:59.999000Z",
          "side": "long",
          "price": 68584.0,
          "proposal_id": "pp_e32659ebcfb4439c97a1cdd6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 745.07
        },
        {
          "ts": "2026-06-02T14:19:59.999000Z",
          "side": "long",
          "price": 68333.36,
          "proposal_id": "pp_4c6c8df4398f67ef8fbcf40d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.96
        },
        {
          "ts": "2026-06-02T14:19:59.999000Z",
          "side": "long",
          "price": 68333.36,
          "proposal_id": "pp_e32659ebcfb4439c97a1cdd6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.92
        },
        {
          "ts": "2026-06-02T14:24:59.999000Z",
          "side": "short",
          "price": 68006.32,
          "proposal_id": "pp_8d902578fa5c1b3166c24d23",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0532,
          "notional": 527.63
        },
        {
          "ts": "2026-06-02T14:24:59.999000Z",
          "side": "long",
          "price": 68006.32,
          "proposal_id": "pp_e32659ebcfb4439c97a1cdd6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.45
        },
        {
          "ts": "2026-06-02T14:29:59.999000Z",
          "side": "short",
          "price": 67884.28,
          "proposal_id": "pp_b164f2686e287d2f52a5005e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.35
        },
        {
          "ts": "2026-06-02T14:29:59.999000Z",
          "side": "long",
          "price": 67884.28,
          "proposal_id": "pp_e32659ebcfb4439c97a1cdd6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.31
        },
        {
          "ts": "2026-06-02T14:34:59.999000Z",
          "side": "short",
          "price": 68069.72,
          "proposal_id": "pp_5b215005c1416c68f5aa4f28",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0594,
          "notional": 589.16
        },
        {
          "ts": "2026-06-02T14:39:59.999000Z",
          "side": "long",
          "price": 68084.0,
          "proposal_id": "pp_ba215339cb8dec1a74a981b6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.25
        },
        {
          "ts": "2026-06-02T14:49:59.999000Z",
          "side": "short",
          "price": 68246.51,
          "proposal_id": "pp_134e8d8a7333f5c1b6eb9dd0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0544,
          "notional": 539.33
        },
        {
          "ts": "2026-06-02T14:54:59.999000Z",
          "side": "short",
          "price": 68102.09,
          "proposal_id": "pp_b3f85dbab5d30f8788975fd4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.0
        },
        {
          "ts": "2026-06-02T15:04:59.999000Z",
          "side": "short",
          "price": 67930.47,
          "proposal_id": "pp_9d0b8ce05b184981c7820c73",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.059,
          "notional": 585.0
        },
        {
          "ts": "2026-06-02T15:09:59.999000Z",
          "side": "short",
          "price": 68004.01,
          "proposal_id": "pp_fb47cacc5a4ec2e4b8a7aaf2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0621,
          "notional": 615.94
        },
        {
          "ts": "2026-06-02T15:19:59.999000Z",
          "side": "short",
          "price": 67703.23,
          "proposal_id": "pp_0f37762f9d1dd7511b3e608a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0595,
          "notional": 590.86
        },
        {
          "ts": "2026-06-02T15:24:59.999000Z",
          "side": "long",
          "price": 67599.11,
          "proposal_id": "pp_0ed2c508cb806810235d20c3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0556,
          "notional": 552.3
        },
        {
          "ts": "2026-06-02T15:34:59.999000Z",
          "side": "long",
          "price": 67246.92,
          "proposal_id": "pp_0ed2c508cb806810235d20c3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0556,
          "notional": 552.3
        },
        {
          "ts": "2026-06-02T15:34:59.999000Z",
          "side": "short",
          "price": 67246.92,
          "proposal_id": "pp_7d0a55cd12c1952b02119e8e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.43
        },
        {
          "ts": "2026-06-02T15:49:59.999000Z",
          "side": "long",
          "price": 67174.23,
          "proposal_id": "pp_27ebef85b84ffaa9d596c89a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.14
        },
        {
          "ts": "2026-06-02T16:04:59.999000Z",
          "side": "short",
          "price": 67436.56,
          "proposal_id": "pp_1d3e232cedbf13a3cd5604c0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0555,
          "notional": 550.89
        },
        {
          "ts": "2026-06-02T16:14:59.999000Z",
          "side": "short",
          "price": 67928.45,
          "proposal_id": "pp_c77bf31e86820984943ed404",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0746,
          "notional": 740.37
        },
        {
          "ts": "2026-06-02T16:14:59.999000Z",
          "side": "short",
          "price": 67928.45,
          "proposal_id": "pp_1d3e232cedbf13a3cd5604c0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0555,
          "notional": 550.86
        },
        {
          "ts": "2026-06-02T16:29:59.999000Z",
          "side": "long",
          "price": 67863.72,
          "proposal_id": "pp_570915decf0f60f131863865",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0584,
          "notional": 579.93
        },
        {
          "ts": "2026-06-02T16:39:59.999000Z",
          "side": "long",
          "price": 67610.0,
          "proposal_id": "pp_df07cc1857ac374e5c8f6d2b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0659,
          "notional": 654.17
        },
        {
          "ts": "2026-06-02T16:39:59.999000Z",
          "side": "short",
          "price": 67610.0,
          "proposal_id": "pp_1d3e232cedbf13a3cd5604c0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0555,
          "notional": 550.79
        },
        {
          "ts": "2026-06-02T16:54:59.999000Z",
          "side": "long",
          "price": 67545.67,
          "proposal_id": "pp_31fe94f68bdb38adabb57cf8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.03
        },
        {
          "ts": "2026-06-02T17:09:59.999000Z",
          "side": "long",
          "price": 67446.89,
          "proposal_id": "pp_e33de7783bb8abed0897945c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 743.86
        },
        {
          "ts": "2026-06-02T17:24:59.999000Z",
          "side": "long",
          "price": 67801.53,
          "proposal_id": "pp_22fc585d707dd7fa556d6c4f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 744.06
        },
        {
          "ts": "2026-06-02T17:34:59.999000Z",
          "side": "long",
          "price": 67622.01,
          "proposal_id": "pp_eca1656a72f95cdfa17f25e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 743.82
        },
        {
          "ts": "2026-06-02T17:49:59.999000Z",
          "side": "long",
          "price": 67454.44,
          "proposal_id": "pp_5454f9f3b1cff368516ba0a9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 743.59
        },
        {
          "ts": "2026-06-02T18:29:59.999000Z",
          "side": "long",
          "price": 67301.56,
          "proposal_id": "pp_7f41698ed7cecfb835e566a1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 743.37
        },
        {
          "ts": "2026-06-02T18:34:59.999000Z",
          "side": "short",
          "price": 67290.02,
          "proposal_id": "pp_ff568759edaf3178854e1c20",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0515,
          "notional": 510.78
        },
        {
          "ts": "2026-06-02T18:49:59.999000Z",
          "side": "long",
          "price": 67286.0,
          "proposal_id": "pp_0a7cbef450f9415c134bebab",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 743.46
        },
        {
          "ts": "2026-06-02T18:54:59.999000Z",
          "side": "long",
          "price": 67124.21,
          "proposal_id": "pp_e279b5c62f277e24e9d736fe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 743.13
        },
        {
          "ts": "2026-06-02T18:54:59.999000Z",
          "side": "long",
          "price": 67124.21,
          "proposal_id": "pp_7f41698ed7cecfb835e566a1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 743.09
        },
        {
          "ts": "2026-06-02T18:59:59.999000Z",
          "side": "short",
          "price": 67341.99,
          "proposal_id": "pp_c6cee2d67331e1dc28fe2745",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0504,
          "notional": 499.18
        },
        {
          "ts": "2026-06-02T18:59:59.999000Z",
          "side": "long",
          "price": 67341.99,
          "proposal_id": "pp_7f41698ed7cecfb835e566a1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 743.21
        },
        {
          "ts": "2026-06-02T19:14:59.999000Z",
          "side": "long",
          "price": 67344.89,
          "proposal_id": "pp_1f142488646cc548ca99ea13",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 743.14
        },
        {
          "ts": "2026-06-02T19:19:59.999000Z",
          "side": "long",
          "price": 67183.62,
          "proposal_id": "pp_1c69e347bdc8c91f4b8d3ffb",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 742.81
        },
        {
          "ts": "2026-06-02T19:19:59.999000Z",
          "side": "long",
          "price": 67183.62,
          "proposal_id": "pp_e4a970f1d2c9eab7f39144f0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 742.77
        },
        {
          "ts": "2026-06-02T19:29:59.999000Z",
          "side": "short",
          "price": 66978.2,
          "proposal_id": "pp_5c280ac8557265a6bb6f93d8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0648,
          "notional": 641.16
        },
        {
          "ts": "2026-06-02T19:29:59.999000Z",
          "side": "long",
          "price": 66978.2,
          "proposal_id": "pp_e4a970f1d2c9eab7f39144f0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 742.39
        },
        {
          "ts": "2026-06-02T19:34:59.999000Z",
          "side": "short",
          "price": 66590.0,
          "proposal_id": "pp_397a3275c9a649ef43cc8d89",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0722,
          "notional": 715.03
        },
        {
          "ts": "2026-06-02T19:34:59.999000Z",
          "side": "long",
          "price": 66590.0,
          "proposal_id": "pp_e4a970f1d2c9eab7f39144f0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 742.26
        },
        {
          "ts": "2026-06-02T19:39:59.999000Z",
          "side": "short",
          "price": 66773.66,
          "proposal_id": "pp_d80d0a0fbfd1ec814f093c70",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 741.58
        },
        {
          "ts": "2026-06-02T19:44:59.999000Z",
          "side": "long",
          "price": 66925.61,
          "proposal_id": "pp_e8101f2e13aeb7cfa1bf4348",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 741.98
        },
        {
          "ts": "2026-06-02T19:44:59.999000Z",
          "side": "long",
          "price": 66925.61,
          "proposal_id": "pp_e4a970f1d2c9eab7f39144f0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 741.94
        },
        {
          "ts": "2026-06-02T19:54:59.999000Z",
          "side": "short",
          "price": 67202.0,
          "proposal_id": "pp_a4cd423b9e6caa8813416b6b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0661,
          "notional": 654.63
        },
        {
          "ts": "2026-06-02T19:54:59.999000Z",
          "side": "long",
          "price": 67202.0,
          "proposal_id": "pp_e4a970f1d2c9eab7f39144f0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 742.28
        },
        {
          "ts": "2026-06-02T20:09:59.999000Z",
          "side": "long",
          "price": 67441.45,
          "proposal_id": "pp_8eb827056126d9561144b5f8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 742.03
        },
        {
          "ts": "2026-06-02T20:19:59.999000Z",
          "side": "long",
          "price": 67135.99,
          "proposal_id": "pp_072fdc6fd7d893f9362287ba",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 741.75
        },
        {
          "ts": "2026-06-02T20:24:59.999000Z",
          "side": "long",
          "price": 67019.98,
          "proposal_id": "pp_679b0bbe082bc93de4271c3f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 741.47
        },
        {
          "ts": "2026-06-02T20:34:59.999000Z",
          "side": "short",
          "price": 67186.0,
          "proposal_id": "pp_58da8652ffc969f1afda5d32",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0647,
          "notional": 639.64
        },
        {
          "ts": "2026-06-02T20:49:59.999000Z",
          "side": "short",
          "price": 67490.0,
          "proposal_id": "pp_676ad9ac84ccf09c66763417",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.062,
          "notional": 612.75
        },
        {
          "ts": "2026-06-02T20:49:59.999000Z",
          "side": "long",
          "price": 67490.0,
          "proposal_id": "pp_679b0bbe082bc93de4271c3f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 741.41
        },
        {
          "ts": "2026-06-02T21:04:59.999000Z",
          "side": "long",
          "price": 67576.0,
          "proposal_id": "pp_f2cb867e1fac5d6062608f2b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 741.27
        },
        {
          "ts": "2026-06-02T21:19:59.999000Z",
          "side": "short",
          "price": 67689.99,
          "proposal_id": "pp_40456aeeea627ccd1d67ba91",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0614,
          "notional": 606.41
        },
        {
          "ts": "2026-06-02T21:29:59.999000Z",
          "side": "short",
          "price": 67887.99,
          "proposal_id": "pp_0bd65c072fd1713887a8b37f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0647,
          "notional": 639.93
        },
        {
          "ts": "2026-06-02T21:29:59.999000Z",
          "side": "short",
          "price": 67887.99,
          "proposal_id": "pp_40456aeeea627ccd1d67ba91",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0614,
          "notional": 606.41
        },
        {
          "ts": "2026-06-02T21:44:59.999000Z",
          "side": "long",
          "price": 67732.0,
          "proposal_id": "pp_daa6b8adf290765b2bb05ccb",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 741.32
        },
        {
          "ts": "2026-06-02T21:49:59.999000Z",
          "side": "long",
          "price": 67609.02,
          "proposal_id": "pp_c6e4f3cd323370847214ec37",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 741.43
        },
        {
          "ts": "2026-06-02T21:54:59.999000Z",
          "side": "long",
          "price": 67526.0,
          "proposal_id": "pp_a3258f9ce8b71a5dbac27a2e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.056,
          "notional": 553.42
        },
        {
          "ts": "2026-06-02T22:04:59.999000Z",
          "side": "long",
          "price": 67369.99,
          "proposal_id": "pp_b8a4518b02d9556d9ac81313",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.89
        },
        {
          "ts": "2026-06-02T22:04:59.999000Z",
          "side": "short",
          "price": 67369.99,
          "proposal_id": "pp_d94c4db79603d11d71475527",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.85
        },
        {
          "ts": "2026-06-02T22:19:59.999000Z",
          "side": "short",
          "price": 67059.25,
          "proposal_id": "pp_510db9d4ff05170e141feb77",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0615,
          "notional": 607.58
        },
        {
          "ts": "2026-06-02T22:19:59.999000Z",
          "side": "short",
          "price": 67059.25,
          "proposal_id": "pp_d94c4db79603d11d71475527",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.76
        },
        {
          "ts": "2026-06-02T22:24:59.999000Z",
          "side": "short",
          "price": 67370.0,
          "proposal_id": "pp_388ac9ba52fb76bc902ca03d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0668,
          "notional": 659.43
        },
        {
          "ts": "2026-06-02T22:24:59.999000Z",
          "side": "short",
          "price": 67370.0,
          "proposal_id": "pp_d94c4db79603d11d71475527",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.34
        },
        {
          "ts": "2026-06-02T22:34:59.999000Z",
          "side": "long",
          "price": 67061.64,
          "proposal_id": "pp_588e0b980bb82343b9a37279",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.64
        },
        {
          "ts": "2026-06-02T22:34:59.999000Z",
          "side": "short",
          "price": 67061.64,
          "proposal_id": "pp_d94c4db79603d11d71475527",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.6
        },
        {
          "ts": "2026-06-02T22:44:59.999000Z",
          "side": "short",
          "price": 66956.01,
          "proposal_id": "pp_b9f174e833f1a1439ada5cc7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0697,
          "notional": 688.26
        },
        {
          "ts": "2026-06-02T22:49:59.999000Z",
          "side": "long",
          "price": 66760.01,
          "proposal_id": "pp_486ba5952cbfba7304a7ae5b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.7
        },
        {
          "ts": "2026-06-02T22:49:59.999000Z",
          "side": "short",
          "price": 66760.01,
          "proposal_id": "pp_d94c4db79603d11d71475527",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.65
        },
        {
          "ts": "2026-06-02T22:54:59.999000Z",
          "side": "short",
          "price": 66575.41,
          "proposal_id": "pp_f6b9f403161355894a504f1d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0599,
          "notional": 591.86
        },
        {
          "ts": "2026-06-02T22:54:59.999000Z",
          "side": "short",
          "price": 66575.41,
          "proposal_id": "pp_d94c4db79603d11d71475527",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.58
        },
        {
          "ts": "2026-06-02T23:04:59.999000Z",
          "side": "short",
          "price": 66325.07,
          "proposal_id": "pp_d4403cd58586c8c0e31047fc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0563,
          "notional": 556.04
        },
        {
          "ts": "2026-06-02T23:04:59.999000Z",
          "side": "long",
          "price": 66325.07,
          "proposal_id": "pp_d20d7894900030cf3c7d0fb6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0525,
          "notional": 518.36
        },
        {
          "ts": "2026-06-02T23:09:59.999000Z",
          "side": "long",
          "price": 66482.0,
          "proposal_id": "pp_d20d7894900030cf3c7d0fb6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0525,
          "notional": 518.2
        },
        {
          "ts": "2026-06-02T23:19:59.999000Z",
          "side": "short",
          "price": 66538.0,
          "proposal_id": "pp_fc69b19dfc871ae0d73f07ba",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.91
        },
        {
          "ts": "2026-06-02T23:29:59.999000Z",
          "side": "short",
          "price": 66443.99,
          "proposal_id": "pp_b7b527976cd36edfd2bc9a9c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0625,
          "notional": 617.49
        },
        {
          "ts": "2026-06-02T23:34:59.999000Z",
          "side": "long",
          "price": 66548.01,
          "proposal_id": "pp_9d260ddeb1f4a1a052eb7978",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0561,
          "notional": 554.25
        },
        {
          "ts": "2026-06-02T23:44:59.999000Z",
          "side": "long",
          "price": 66724.34,
          "proposal_id": "pp_0cd249e7dde491fe13f80607",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.33
        },
        {
          "ts": "2026-06-02T23:49:59.999000Z",
          "side": "short",
          "price": 66777.63,
          "proposal_id": "pp_67837b35e735644a2934b4e0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.4
        },
        {
          "ts": "2026-06-02T23:59:59.999000Z",
          "side": "short",
          "price": 66760.83,
          "proposal_id": "pp_3a4a4affd135fdcced51c4c4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.34
        },
        {
          "ts": "2026-06-03T00:04:59.999000Z",
          "side": "short",
          "price": 66744.56,
          "proposal_id": "pp_44301e431823a171fe550284",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.07,
          "notional": 690.48
        },
        {
          "ts": "2026-06-03T00:14:59.999000Z",
          "side": "short",
          "price": 66822.01,
          "proposal_id": "pp_91bbe93fe3e6f548a4fc5e86",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 740.16
        },
        {
          "ts": "2026-06-03T00:19:59.999000Z",
          "side": "short",
          "price": 67085.72,
          "proposal_id": "pp_f250c4513085847248718221",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0727,
          "notional": 716.77
        },
        {
          "ts": "2026-06-03T00:19:59.999000Z",
          "side": "long",
          "price": 67085.72,
          "proposal_id": "pp_15e60d427fd4585026dad0b4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 739.62
        },
        {
          "ts": "2026-06-03T00:24:59.999000Z",
          "side": "short",
          "price": 66884.37,
          "proposal_id": "pp_0efbde770ff42e3474b5059b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 739.36
        },
        {
          "ts": "2026-06-03T00:34:59.999000Z",
          "side": "short",
          "price": 67030.0,
          "proposal_id": "pp_1baf037ac1dd824c40a0c85b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 739.54
        },
        {
          "ts": "2026-06-03T00:39:59.999000Z",
          "side": "short",
          "price": 67049.42,
          "proposal_id": "pp_4e96d7bc5887abda995294dc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 739.27
        },
        {
          "ts": "2026-06-03T00:49:59.999000Z",
          "side": "short",
          "price": 66981.93,
          "proposal_id": "pp_8cbe63c87c1433d10be23942",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 739.23
        },
        {
          "ts": "2026-06-03T00:54:59.999000Z",
          "side": "long",
          "price": 67024.59,
          "proposal_id": "pp_5bbb7391153b2912a7fcaa4f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 739.17
        },
        {
          "ts": "2026-06-03T01:04:59.999000Z",
          "side": "short",
          "price": 66926.01,
          "proposal_id": "pp_50371984eeb8f31ccf0f1737",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 738.94
        },
        {
          "ts": "2026-06-03T01:04:59.999000Z",
          "side": "long",
          "price": 66926.01,
          "proposal_id": "pp_863c725deb2cdd07805eeda8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 738.9
        },
        {
          "ts": "2026-06-03T01:14:59.999000Z",
          "side": "short",
          "price": 66829.16,
          "proposal_id": "pp_3cb1d8802daa389ecf37ee9e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 738.67
        },
        {
          "ts": "2026-06-03T01:19:59.999000Z",
          "side": "short",
          "price": 66878.01,
          "proposal_id": "pp_ac854f726d9ade6c9e3aebbe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 738.63
        },
        {
          "ts": "2026-06-03T01:29:59.999000Z",
          "side": "long",
          "price": 67024.01,
          "proposal_id": "pp_547e3b7ca543e6c401c1d07f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0567,
          "notional": 558.15
        },
        {
          "ts": "2026-06-03T01:34:59.999000Z",
          "side": "short",
          "price": 66896.0,
          "proposal_id": "pp_9b5f4db8b25aa863dfb3c76f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 738.31
        },
        {
          "ts": "2026-06-03T01:39:59.999000Z",
          "side": "long",
          "price": 66633.39,
          "proposal_id": "pp_b52d6fe7d9ae4ea58cae5ead",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0617,
          "notional": 607.36
        },
        {
          "ts": "2026-06-03T01:39:59.999000Z",
          "side": "long",
          "price": 66633.39,
          "proposal_id": "pp_863c725deb2cdd07805eeda8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 738.25
        },
        {
          "ts": "2026-06-03T01:54:59.999000Z",
          "side": "long",
          "price": 66994.75,
          "proposal_id": "pp_5ad6d9da63ef329abd0ecaa1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 738.5
        },
        {
          "ts": "2026-06-03T01:54:59.999000Z",
          "side": "long",
          "price": 66994.75,
          "proposal_id": "pp_863c725deb2cdd07805eeda8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 738.46
        },
        {
          "ts": "2026-06-03T02:04:59.999000Z",
          "side": "long",
          "price": 66880.01,
          "proposal_id": "pp_03d2ff87ad44b8c9cb5453cb",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0738,
          "notional": 726.13
        },
        {
          "ts": "2026-06-03T02:04:59.999000Z",
          "side": "long",
          "price": 66880.01,
          "proposal_id": "pp_94421f6fd0e4494f734d5897",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 738.01
        },
        {
          "ts": "2026-06-03T02:19:59.999000Z",
          "side": "long",
          "price": 66919.04,
          "proposal_id": "pp_7168475f6ae886a659f5055d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0583,
          "notional": 573.49
        },
        {
          "ts": "2026-06-03T02:24:59.999000Z",
          "side": "long",
          "price": 66680.0,
          "proposal_id": "pp_afdee1d672172533ef7471ff",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 737.59
        },
        {
          "ts": "2026-06-03T02:24:59.999000Z",
          "side": "long",
          "price": 66680.0,
          "proposal_id": "pp_94421f6fd0e4494f734d5897",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 737.55
        },
        {
          "ts": "2026-06-03T02:39:59.999000Z",
          "side": "short",
          "price": 66826.01,
          "proposal_id": "pp_52b39fd0585a0ac20268cd5a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0632,
          "notional": 621.72
        },
        {
          "ts": "2026-06-03T02:54:59.999000Z",
          "side": "long",
          "price": 66700.01,
          "proposal_id": "pp_94421f6fd0e4494f734d5897",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 737.61
        },
        {
          "ts": "2026-06-03T03:09:59.999000Z",
          "side": "short",
          "price": 66417.34,
          "proposal_id": "pp_11d0e08b5b2e44d076fc11f7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 737.2
        },
        {
          "ts": "2026-06-03T03:09:59.999000Z",
          "side": "long",
          "price": 66417.34,
          "proposal_id": "pp_e2dfafc20affe4d75a97aec3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 737.16
        },
        {
          "ts": "2026-06-03T03:19:59.999000Z",
          "side": "short",
          "price": 66396.0,
          "proposal_id": "pp_d66d89f6a2f1ae01e2af5712",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0619,
          "notional": 608.63
        },
        {
          "ts": "2026-06-03T03:29:59.999000Z",
          "side": "short",
          "price": 66147.81,
          "proposal_id": "pp_e88ac1ea02be8fdf70703b57",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0606,
          "notional": 595.8
        },
        {
          "ts": "2026-06-03T03:29:59.999000Z",
          "side": "long",
          "price": 66147.81,
          "proposal_id": "pp_e2dfafc20affe4d75a97aec3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.84
        },
        {
          "ts": "2026-06-03T03:44:59.999000Z",
          "side": "long",
          "price": 65755.01,
          "proposal_id": "pp_e2dfafc20affe4d75a97aec3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.76
        },
        {
          "ts": "2026-06-03T03:44:59.999000Z",
          "side": "short",
          "price": 65755.01,
          "proposal_id": "pp_06c341e1d43ebf32697f309e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.71
        },
        {
          "ts": "2026-06-03T03:54:59.999000Z",
          "side": "short",
          "price": 65936.67,
          "proposal_id": "pp_17f16b8a77e9c15e087f0bbb",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0515,
          "notional": 505.99
        },
        {
          "ts": "2026-06-03T03:54:59.999000Z",
          "side": "long",
          "price": 65936.67,
          "proposal_id": "pp_e2dfafc20affe4d75a97aec3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.64
        },
        {
          "ts": "2026-06-03T04:04:59.999000Z",
          "side": "short",
          "price": 66496.01,
          "proposal_id": "pp_6edefe36cee1442e39f07249",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.67
        },
        {
          "ts": "2026-06-03T04:04:59.999000Z",
          "side": "long",
          "price": 66496.01,
          "proposal_id": "pp_aa21f0bf301ee16bf17e20f0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.63
        },
        {
          "ts": "2026-06-03T04:19:59.999000Z",
          "side": "short",
          "price": 66359.99,
          "proposal_id": "pp_10666a6775618fc70a88b10a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0561,
          "notional": 550.78
        },
        {
          "ts": "2026-06-03T04:34:59.999000Z",
          "side": "short",
          "price": 66464.64,
          "proposal_id": "pp_d1b0b86a37fd5fdefef7bba7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.54
        },
        {
          "ts": "2026-06-03T04:49:59.999000Z",
          "side": "short",
          "price": 66451.2,
          "proposal_id": "pp_ac68c2a2ee70c3e21fac7ea3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.46
        },
        {
          "ts": "2026-06-03T05:04:59.999000Z",
          "side": "short",
          "price": 67013.26,
          "proposal_id": "pp_bc3dd12fe3905275f00d0cc3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.46
        },
        {
          "ts": "2026-06-03T05:04:59.999000Z",
          "side": "long",
          "price": 67013.26,
          "proposal_id": "pp_450264fd84553764c453a085",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.42
        },
        {
          "ts": "2026-06-03T05:14:59.999000Z",
          "side": "short",
          "price": 67135.99,
          "proposal_id": "pp_d522d966d63031c7d2a428f3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.15
        },
        {
          "ts": "2026-06-03T05:29:59.999000Z",
          "side": "short",
          "price": 67103.06,
          "proposal_id": "pp_5a07c888562011318a724b43",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.09
        },
        {
          "ts": "2026-06-03T05:34:59.999000Z",
          "side": "short",
          "price": 66958.0,
          "proposal_id": "pp_72de2da3f2ea278ac036d384",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 736.01
        },
        {
          "ts": "2026-06-03T05:34:59.999000Z",
          "side": "long",
          "price": 66958.0,
          "proposal_id": "pp_450264fd84553764c453a085",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 735.97
        },
        {
          "ts": "2026-06-03T05:49:59.999000Z",
          "side": "short",
          "price": 67103.96,
          "proposal_id": "pp_4c74090a5b9c29bea7ffd2be",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 735.77
        },
        {
          "ts": "2026-06-03T05:54:59.999000Z",
          "side": "short",
          "price": 67322.91,
          "proposal_id": "pp_6b61374d0b3af52592b2ae4e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 735.74
        },
        {
          "ts": "2026-06-03T05:54:59.999000Z",
          "side": "long",
          "price": 67322.91,
          "proposal_id": "pp_450264fd84553764c453a085",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 735.7
        },
        {
          "ts": "2026-06-03T06:09:59.999000Z",
          "side": "long",
          "price": 67204.01,
          "proposal_id": "pp_3e7a14f67c76fd84f30c42cb",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 735.72
        },
        {
          "ts": "2026-06-03T06:14:59.999000Z",
          "side": "long",
          "price": 67160.0,
          "proposal_id": "pp_1caaed82107c5980bc3e9fc7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 735.47
        },
        {
          "ts": "2026-06-03T06:24:59.999000Z",
          "side": "long",
          "price": 67340.93,
          "proposal_id": "pp_b53b1767f06014eadac0a831",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 735.5
        },
        {
          "ts": "2026-06-03T06:29:59.999000Z",
          "side": "short",
          "price": 67253.63,
          "proposal_id": "pp_92b21231dd7fcc74a9fa8b50",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 735.49
        },
        {
          "ts": "2026-06-03T06:34:59.999000Z",
          "side": "long",
          "price": 67464.87,
          "proposal_id": "pp_2707954a8b0a70fc65776d68",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0567,
          "notional": 555.44
        },
        {
          "ts": "2026-06-03T06:34:59.999000Z",
          "side": "short",
          "price": 67464.87,
          "proposal_id": "pp_176259bf15414cf29d9ba256",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0507,
          "notional": 497.27
        },
        {
          "ts": "2026-06-03T06:44:59.999000Z",
          "side": "long",
          "price": 67316.83,
          "proposal_id": "pp_8b9253056ad00fe56c8982f8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0649,
          "notional": 636.13
        },
        {
          "ts": "2026-06-03T06:49:59.999000Z",
          "side": "long",
          "price": 67207.17,
          "proposal_id": "pp_be64c24f8e97b27ef6a2a11a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0715,
          "notional": 700.24
        },
        {
          "ts": "2026-06-03T06:54:59.999000Z",
          "side": "short",
          "price": 67059.99,
          "proposal_id": "pp_38c7e42e2d1ee306d4b1da7b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 734.66
        },
        {
          "ts": "2026-06-03T06:54:59.999000Z",
          "side": "short",
          "price": 67059.99,
          "proposal_id": "pp_176259bf15414cf29d9ba256",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0507,
          "notional": 496.95
        },
        {
          "ts": "2026-06-03T07:09:59.999000Z",
          "side": "short",
          "price": 67049.99,
          "proposal_id": "pp_546f0fba3bb0997f6cfad0b2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 734.56
        },
        {
          "ts": "2026-06-03T07:19:59.999000Z",
          "side": "long",
          "price": 67268.01,
          "proposal_id": "pp_93321dd1272e94caaf9a0222",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 734.24
        },
        {
          "ts": "2026-06-03T07:19:59.999000Z",
          "side": "long",
          "price": 67268.01,
          "proposal_id": "pp_eeb71ef50d00d6eb6df63673",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 734.2
        },
        {
          "ts": "2026-06-03T07:34:59.999000Z",
          "side": "long",
          "price": 67260.01,
          "proposal_id": "pp_0059930172115882e4ef39e9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 734.11
        },
        {
          "ts": "2026-06-03T07:44:59.999000Z",
          "side": "long",
          "price": 67208.49,
          "proposal_id": "pp_76b324b8b0bcbcf6330fee1f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 733.75
        },
        {
          "ts": "2026-06-03T07:44:59.999000Z",
          "side": "long",
          "price": 67208.49,
          "proposal_id": "pp_eeb71ef50d00d6eb6df63673",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 733.71
        },
        {
          "ts": "2026-06-03T07:59:59.999000Z",
          "side": "long",
          "price": 67220.03,
          "proposal_id": "pp_753b9a09c9f2b1698695dac3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 733.63
        },
        {
          "ts": "2026-06-03T08:14:59.999000Z",
          "side": "short",
          "price": 67070.0,
          "proposal_id": "pp_4a064218bc4d79c24c4c8eb8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0638,
          "notional": 624.1
        },
        {
          "ts": "2026-06-03T08:14:59.999000Z",
          "side": "long",
          "price": 67070.0,
          "proposal_id": "pp_3ad93caed73e1c9a2be67066",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.064,
          "notional": 625.77
        },
        {
          "ts": "2026-06-03T08:29:59.999000Z",
          "side": "short",
          "price": 67027.6,
          "proposal_id": "pp_d346ed5c35f1a179b0af1198",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0685,
          "notional": 670.01
        },
        {
          "ts": "2026-06-03T08:34:59.999000Z",
          "side": "long",
          "price": 67111.43,
          "proposal_id": "pp_dfc9ae755a52e533d9ff037b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 733.08
        },
        {
          "ts": "2026-06-03T08:39:59.999000Z",
          "side": "long",
          "price": 66979.19,
          "proposal_id": "pp_f7a6d2f266dbf2a66bc98e55",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 732.91
        },
        {
          "ts": "2026-06-03T08:49:59.999000Z",
          "side": "long",
          "price": 67118.88,
          "proposal_id": "pp_49e84f32370ee486d0894be5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 732.96
        },
        {
          "ts": "2026-06-03T08:54:59.999000Z",
          "side": "long",
          "price": 67068.74,
          "proposal_id": "pp_60a12e4ac467fe43c28c715a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 732.78
        },
        {
          "ts": "2026-06-03T09:09:59.999000Z",
          "side": "long",
          "price": 67079.99,
          "proposal_id": "pp_2058146e40c6ac967540288d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 732.71
        },
        {
          "ts": "2026-06-03T09:14:59.999000Z",
          "side": "long",
          "price": 66962.05,
          "proposal_id": "pp_a54b0457739e655280c6e24d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 732.41
        },
        {
          "ts": "2026-06-03T09:14:59.999000Z",
          "side": "long",
          "price": 66962.05,
          "proposal_id": "pp_5ecfc1e7dac80076a0aee006",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 732.37
        },
        {
          "ts": "2026-06-03T09:24:59.999000Z",
          "side": "short",
          "price": 66824.55,
          "proposal_id": "pp_c2cb11ea18cd81383511255f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0634,
          "notional": 618.39
        },
        {
          "ts": "2026-06-03T09:24:59.999000Z",
          "side": "long",
          "price": 66824.55,
          "proposal_id": "pp_5ecfc1e7dac80076a0aee006",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 732.01
        },
        {
          "ts": "2026-06-03T09:39:59.999000Z",
          "side": "long",
          "price": 66754.91,
          "proposal_id": "pp_962590f0e1335c0b17b2d16f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.98
        },
        {
          "ts": "2026-06-03T09:49:59.999000Z",
          "side": "long",
          "price": 67023.02,
          "proposal_id": "pp_7385cb574bd68ceb0d2274e0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.9
        },
        {
          "ts": "2026-06-03T09:49:59.999000Z",
          "side": "long",
          "price": 67023.02,
          "proposal_id": "pp_5ecfc1e7dac80076a0aee006",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.86
        },
        {
          "ts": "2026-06-03T09:54:59.999000Z",
          "side": "long",
          "price": 67129.63,
          "proposal_id": "pp_5ecfc1e7dac80076a0aee006",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 732.04
        },
        {
          "ts": "2026-06-03T09:54:59.999000Z",
          "side": "short",
          "price": 67129.63,
          "proposal_id": "pp_3d2e52c34fea7ae932c56f5b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0551,
          "notional": 537.46
        },
        {
          "ts": "2026-06-03T10:09:59.999000Z",
          "side": "short",
          "price": 67440.0,
          "proposal_id": "pp_b02c32e29daecffedb6755a2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.99
        },
        {
          "ts": "2026-06-03T10:09:59.999000Z",
          "side": "long",
          "price": 67440.0,
          "proposal_id": "pp_269eb8dfc71d082c48c5b1a5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.95
        },
        {
          "ts": "2026-06-03T10:14:59.999000Z",
          "side": "short",
          "price": 67305.99,
          "proposal_id": "pp_61e5b6e5c74264667dc3509c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.74
        },
        {
          "ts": "2026-06-03T10:19:59.999000Z",
          "side": "long",
          "price": 67204.4,
          "proposal_id": "pp_f1095bc85083c3c5b689eee3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.84
        },
        {
          "ts": "2026-06-03T10:29:59.999000Z",
          "side": "long",
          "price": 67318.0,
          "proposal_id": "pp_bc3a2011d7dccbfcca9a50e4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.75
        },
        {
          "ts": "2026-06-03T10:34:59.999000Z",
          "side": "long",
          "price": 67328.57,
          "proposal_id": "pp_3dab882c2cb25e78d93c178f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.77
        },
        {
          "ts": "2026-06-03T10:44:59.999000Z",
          "side": "long",
          "price": 67234.15,
          "proposal_id": "pp_83a4235fd20f3102dd6be009",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.62
        },
        {
          "ts": "2026-06-03T10:49:59.999000Z",
          "side": "long",
          "price": 67230.0,
          "proposal_id": "pp_22d0a6ec2101df9bfcc978a9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.45
        },
        {
          "ts": "2026-06-03T10:59:59.999000Z",
          "side": "long",
          "price": 67294.52,
          "proposal_id": "pp_2b0a12aef03a2f29845fa9e2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.42
        },
        {
          "ts": "2026-06-03T11:04:59.999000Z",
          "side": "long",
          "price": 67257.99,
          "proposal_id": "pp_3788804ceac16a3cc5a3398c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.36
        },
        {
          "ts": "2026-06-03T11:14:59.999000Z",
          "side": "long",
          "price": 67341.5,
          "proposal_id": "pp_01aa57f676f25f54f4f10264",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.32
        },
        {
          "ts": "2026-06-03T11:19:59.999000Z",
          "side": "long",
          "price": 67350.0,
          "proposal_id": "pp_ef811bfabd31a7492b1704b1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.31
        },
        {
          "ts": "2026-06-03T11:29:59.999000Z",
          "side": "long",
          "price": 67329.99,
          "proposal_id": "pp_2494f59a7cd2f187f3ac880f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 731.22
        },
        {
          "ts": "2026-06-03T11:34:59.999000Z",
          "side": "long",
          "price": 67172.0,
          "proposal_id": "pp_b7d293e5cd8bf1bb5b258fc4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 730.93
        },
        {
          "ts": "2026-06-03T11:34:59.999000Z",
          "side": "long",
          "price": 67172.0,
          "proposal_id": "pp_fe75a6b75325a83c66e89473",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 730.89
        },
        {
          "ts": "2026-06-03T11:49:59.999000Z",
          "side": "long",
          "price": 67095.06,
          "proposal_id": "pp_44a1ec9f00118d2015e97d00",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 730.61
        },
        {
          "ts": "2026-06-03T11:49:59.999000Z",
          "side": "long",
          "price": 67095.06,
          "proposal_id": "pp_fe75a6b75325a83c66e89473",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 730.57
        },
        {
          "ts": "2026-06-03T12:04:59.999000Z",
          "side": "long",
          "price": 67106.0,
          "proposal_id": "pp_f5442420f6424d1068ec35ca",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 730.31
        },
        {
          "ts": "2026-06-03T12:04:59.999000Z",
          "side": "long",
          "price": 67106.0,
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 730.26
        },
        {
          "ts": "2026-06-03T12:14:59.999000Z",
          "side": "long",
          "price": 66972.76,
          "proposal_id": "pp_91fdad2355fc49cb388160fa",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 730.0
        },
        {
          "ts": "2026-06-03T12:14:59.999000Z",
          "side": "long",
          "price": 66972.76,
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.96
        },
        {
          "ts": "2026-06-03T12:19:59.999000Z",
          "side": "long",
          "price": 66844.0,
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.68
        },
        {
          "ts": "2026-06-03T12:19:59.999000Z",
          "side": "short",
          "price": 66844.0,
          "proposal_id": "pp_aee824fb6bb72566aa69135d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0565,
          "notional": 550.14
        },
        {
          "ts": "2026-06-03T12:24:59.999000Z",
          "side": "long",
          "price": 66892.01,
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.51
        },
        {
          "ts": "2026-06-03T12:29:59.999000Z",
          "side": "long",
          "price": 67032.01,
          "proposal_id": "pp_e68e79e210a5ae64fff87f75",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.64
        },
        {
          "ts": "2026-06-03T12:29:59.999000Z",
          "side": "long",
          "price": 67032.01,
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.6
        },
        {
          "ts": "2026-06-03T12:39:59.999000Z",
          "side": "short",
          "price": 66862.71,
          "proposal_id": "pp_5da7fed058fc767f2c010c12",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.29
        },
        {
          "ts": "2026-06-03T12:39:59.999000Z",
          "side": "long",
          "price": 66862.71,
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.25
        },
        {
          "ts": "2026-06-03T12:49:59.999000Z",
          "side": "long",
          "price": 67021.86,
          "proposal_id": "pp_234c01e819ad174f07a15d7d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.06
        },
        {
          "ts": "2026-06-03T12:54:59.999000Z",
          "side": "long",
          "price": 67076.0,
          "proposal_id": "pp_2e59c350d314b333b619a4b8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.14
        },
        {
          "ts": "2026-06-03T13:04:59.999000Z",
          "side": "long",
          "price": 67048.0,
          "proposal_id": "pp_24edab8e1875766a10c2b9e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.08
        },
        {
          "ts": "2026-06-03T13:09:59.999000Z",
          "side": "long",
          "price": 67070.02,
          "proposal_id": "pp_655f8a176d742f320539678c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.0
        },
        {
          "ts": "2026-06-03T13:19:59.999000Z",
          "side": "long",
          "price": 67219.98,
          "proposal_id": "pp_05ef41da5b2ebeb76b0a2ee0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.05
        },
        {
          "ts": "2026-06-03T13:24:59.999000Z",
          "side": "short",
          "price": 67107.7,
          "proposal_id": "pp_037deee0c3a071d2eb5badd4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.0
        },
        {
          "ts": "2026-06-03T13:29:59.999000Z",
          "side": "long",
          "price": 66838.01,
          "proposal_id": "pp_fcc20f87ed221cee376bf952",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 728.93
        },
        {
          "ts": "2026-06-03T13:29:59.999000Z",
          "side": "long",
          "price": 66838.01,
          "proposal_id": "pp_e6f4f856a51e2305cbf6b0e9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 728.89
        },
        {
          "ts": "2026-06-03T13:34:59.999000Z",
          "side": "long",
          "price": 67124.01,
          "proposal_id": "pp_e68b48993fcdab7f160aee97",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0512,
          "notional": 498.22
        },
        {
          "ts": "2026-06-03T13:34:59.999000Z",
          "side": "long",
          "price": 67124.01,
          "proposal_id": "pp_e6f4f856a51e2305cbf6b0e9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 729.12
        },
        {
          "ts": "2026-06-03T13:39:59.999000Z",
          "side": "long",
          "price": 66981.64,
          "proposal_id": "pp_dcab2e5b4ff2addef05b1f88",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 728.78
        },
        {
          "ts": "2026-06-03T13:39:59.999000Z",
          "side": "long",
          "price": 66981.64,
          "proposal_id": "pp_e6f4f856a51e2305cbf6b0e9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 728.74
        },
        {
          "ts": "2026-06-03T13:44:59.999000Z",
          "side": "long",
          "price": 66744.27,
          "proposal_id": "pp_ebdb918a7783b3fa9c8442f9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 728.33
        },
        {
          "ts": "2026-06-03T13:44:59.999000Z",
          "side": "long",
          "price": 66744.27,
          "proposal_id": "pp_e6f4f856a51e2305cbf6b0e9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 728.29
        },
        {
          "ts": "2026-06-03T13:54:59.999000Z",
          "side": "long",
          "price": 66940.01,
          "proposal_id": "pp_92ce0076553430baa5445651",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 728.61
        },
        {
          "ts": "2026-06-03T13:54:59.999000Z",
          "side": "long",
          "price": 66940.01,
          "proposal_id": "pp_e6f4f856a51e2305cbf6b0e9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 728.57
        },
        {
          "ts": "2026-06-03T14:04:59.999000Z",
          "side": "long",
          "price": 66777.11,
          "proposal_id": "pp_4ce2469e87873a89fce2026f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 728.15
        },
        {
          "ts": "2026-06-03T14:04:59.999000Z",
          "side": "long",
          "price": 66777.11,
          "proposal_id": "pp_c2d9e9951207c5dde111ec73",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 728.11
        },
        {
          "ts": "2026-06-03T14:19:59.999000Z",
          "side": "long",
          "price": 66694.0,
          "proposal_id": "pp_cc959b5b691ff0b2242e6233",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 727.96
        },
        {
          "ts": "2026-06-03T14:34:59.999000Z",
          "side": "long",
          "price": 66770.02,
          "proposal_id": "pp_a245d35cf06db99bebd1bbe5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 727.94
        },
        {
          "ts": "2026-06-03T14:49:59.999000Z",
          "side": "long",
          "price": 66819.74,
          "proposal_id": "pp_37ca4412d14468c5f8c3cd5e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 727.9
        },
        {
          "ts": "2026-06-03T15:04:59.999000Z",
          "side": "long",
          "price": 66760.0,
          "proposal_id": "pp_061c2c94487e1bac92b395f7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 727.77
        },
        {
          "ts": "2026-06-03T15:09:59.999000Z",
          "side": "long",
          "price": 66580.94,
          "proposal_id": "pp_5ea7b3260bcb21d89f100487",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 727.34
        },
        {
          "ts": "2026-06-03T15:09:59.999000Z",
          "side": "long",
          "price": 66580.94,
          "proposal_id": "pp_d99b5394406d7492d2f63a92",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 727.3
        },
        {
          "ts": "2026-06-03T15:19:59.999000Z",
          "side": "long",
          "price": 66356.49,
          "proposal_id": "pp_229b5b4dc8169aea67ffc9fe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 726.89
        },
        {
          "ts": "2026-06-03T15:19:59.999000Z",
          "side": "long",
          "price": 66356.49,
          "proposal_id": "pp_d99b5394406d7492d2f63a92",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 726.85
        },
        {
          "ts": "2026-06-03T15:29:59.999000Z",
          "side": "long",
          "price": 66597.74,
          "proposal_id": "pp_abbcc8ee3a3b3322f3d4c36b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 727.17
        },
        {
          "ts": "2026-06-03T15:29:59.999000Z",
          "side": "long",
          "price": 66597.74,
          "proposal_id": "pp_d99b5394406d7492d2f63a92",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 727.13
        },
        {
          "ts": "2026-06-03T15:34:59.999000Z",
          "side": "long",
          "price": 66349.99,
          "proposal_id": "pp_d99b5394406d7492d2f63a92",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 726.7
        },
        {
          "ts": "2026-06-03T15:34:59.999000Z",
          "side": "short",
          "price": 66349.99,
          "proposal_id": "pp_aee824fb6bb72566aa69135d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0565,
          "notional": 547.9
        },
        {
          "ts": "2026-06-03T15:49:59.999000Z",
          "side": "long",
          "price": 66309.19,
          "proposal_id": "pp_d99b5394406d7492d2f63a92",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 726.42
        },
        {
          "ts": "2026-06-03T15:59:59.999000Z",
          "side": "long",
          "price": 66076.01,
          "proposal_id": "pp_d99b5394406d7492d2f63a92",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 726.18
        },
        {
          "ts": "2026-06-03T16:04:59.999000Z",
          "side": "short",
          "price": 66179.23,
          "proposal_id": "pp_06c341e1d43ebf32697f309e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 726.29
        },
        {
          "ts": "2026-06-03T16:24:59.999000Z",
          "side": "short",
          "price": 65633.69,
          "proposal_id": "pp_06c341e1d43ebf32697f309e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 726.26
        },
        {
          "ts": "2026-06-03T16:29:59.999000Z",
          "side": "short",
          "price": 65606.94,
          "proposal_id": "pp_26f8b90cec6f27cc85df28ad",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0541,
          "notional": 523.42
        },
        {
          "ts": "2026-06-03T16:39:59.999000Z",
          "side": "long",
          "price": 65897.41,
          "proposal_id": "pp_b4a6103372e2cb4940ff4d3c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 725.75
        },
        {
          "ts": "2026-06-03T16:39:59.999000Z",
          "side": "short",
          "price": 65897.41,
          "proposal_id": "pp_06c341e1d43ebf32697f309e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 725.7
        },
        {
          "ts": "2026-06-03T16:54:59.999000Z",
          "side": "long",
          "price": 65950.0,
          "proposal_id": "pp_9a3630a22e3bb4970cdfe91f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 725.67
        },
        {
          "ts": "2026-06-03T17:09:59.999000Z",
          "side": "long",
          "price": 65750.62,
          "proposal_id": "pp_0b34f24818a0d479968b0c31",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 725.42
        },
        {
          "ts": "2026-06-03T17:24:59.999000Z",
          "side": "long",
          "price": 65819.11,
          "proposal_id": "pp_45fe31b61f97f6436a675879",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0563,
          "notional": 544.11
        },
        {
          "ts": "2026-06-03T17:34:59.999000Z",
          "side": "long",
          "price": 66164.01,
          "proposal_id": "pp_45fe31b61f97f6436a675879",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0563,
          "notional": 544.02
        },
        {
          "ts": "2026-06-03T17:34:59.999000Z",
          "side": "short",
          "price": 66164.01,
          "proposal_id": "pp_06c341e1d43ebf32697f309e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 725.25
        },
        {
          "ts": "2026-06-03T17:49:59.999000Z",
          "side": "long",
          "price": 65954.28,
          "proposal_id": "pp_315b8755c74a6d894fe86b75",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 725.05
        },
        {
          "ts": "2026-06-03T17:54:59.999000Z",
          "side": "long",
          "price": 65894.0,
          "proposal_id": "pp_1ed70a3c8935d267dff68ef0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 725.22
        },
        {
          "ts": "2026-06-03T18:04:59.999000Z",
          "side": "long",
          "price": 66014.01,
          "proposal_id": "pp_3c9dc7b4b7ee8246e1faa610",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 725.19
        },
        {
          "ts": "2026-06-03T18:09:59.999000Z",
          "side": "long",
          "price": 66054.24,
          "proposal_id": "pp_af84d758f28274a65b258b65",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 725.24
        },
        {
          "ts": "2026-06-03T18:14:59.999000Z",
          "side": "long",
          "price": 65972.81,
          "proposal_id": "pp_7e4b14e9f405405ad2010e23",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 725.02
        },
        {
          "ts": "2026-06-03T18:19:59.999000Z",
          "side": "long",
          "price": 65813.84,
          "proposal_id": "pp_283652b7446a6a045531b73a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 724.62
        },
        {
          "ts": "2026-06-03T18:19:59.999000Z",
          "side": "long",
          "price": 65813.84,
          "proposal_id": "pp_db5caf66eb13e399ca78318f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 724.58
        },
        {
          "ts": "2026-06-03T18:34:59.999000Z",
          "side": "long",
          "price": 65866.09,
          "proposal_id": "pp_3ed77131032665061c08fc08",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 724.54
        },
        {
          "ts": "2026-06-03T18:44:59.999000Z",
          "side": "long",
          "price": 66044.17,
          "proposal_id": "pp_c168401cbcb525757ec0fa68",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 724.81
        },
        {
          "ts": "2026-06-03T18:44:59.999000Z",
          "side": "long",
          "price": 66044.17,
          "proposal_id": "pp_db5caf66eb13e399ca78318f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 724.77
        },
        {
          "ts": "2026-06-03T18:59:59.999000Z",
          "side": "long",
          "price": 66036.57,
          "proposal_id": "pp_acbfe9c3ce76fe253b29baef",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 724.69
        },
        {
          "ts": "2026-06-03T19:14:59.999000Z",
          "side": "long",
          "price": 65970.02,
          "proposal_id": "pp_879cdbbe000d3f2aa2df469e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 724.39
        },
        {
          "ts": "2026-06-03T19:14:59.999000Z",
          "side": "long",
          "price": 65970.02,
          "proposal_id": "pp_78b08bff3e937b656c8e8129",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 724.35
        },
        {
          "ts": "2026-06-03T19:24:59.999000Z",
          "side": "long",
          "price": 65745.11,
          "proposal_id": "pp_92a7d5f0063223916c942e1d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 724.03
        },
        {
          "ts": "2026-06-03T19:24:59.999000Z",
          "side": "long",
          "price": 65745.11,
          "proposal_id": "pp_78b08bff3e937b656c8e8129",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.98
        },
        {
          "ts": "2026-06-03T19:29:59.999000Z",
          "side": "long",
          "price": 65658.18,
          "proposal_id": "pp_f0339e53d861f1d195237b2f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.64
        },
        {
          "ts": "2026-06-03T19:29:59.999000Z",
          "side": "long",
          "price": 65658.18,
          "proposal_id": "pp_78b08bff3e937b656c8e8129",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.6
        },
        {
          "ts": "2026-06-03T19:44:59.999000Z",
          "side": "long",
          "price": 65764.01,
          "proposal_id": "pp_0787913d97acc7d72e4ffcc9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.61
        },
        {
          "ts": "2026-06-03T19:54:59.999000Z",
          "side": "long",
          "price": 65359.31,
          "proposal_id": "pp_891ca08d9129231ec95eb05c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.27
        },
        {
          "ts": "2026-06-03T19:54:59.999000Z",
          "side": "long",
          "price": 65359.31,
          "proposal_id": "pp_78b08bff3e937b656c8e8129",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.23
        },
        {
          "ts": "2026-06-03T20:09:59.999000Z",
          "side": "long",
          "price": 65389.99,
          "proposal_id": "pp_a38fc751323c34c7f7e4f6e4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.18
        },
        {
          "ts": "2026-06-03T20:14:59.999000Z",
          "side": "long",
          "price": 65580.01,
          "proposal_id": "pp_0c88c09809bbafc02b70a547",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.27
        },
        {
          "ts": "2026-06-03T20:19:59.999000Z",
          "side": "long",
          "price": 65340.84,
          "proposal_id": "pp_07fa30b31e0e0d21fd990ae5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0555,
          "notional": 534.61
        },
        {
          "ts": "2026-06-03T20:34:59.999000Z",
          "side": "short",
          "price": 65486.0,
          "proposal_id": "pp_6ebfde6a688bc998c8c10622",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.051,
          "notional": 492.09
        },
        {
          "ts": "2026-06-03T20:44:59.999000Z",
          "side": "long",
          "price": 65190.63,
          "proposal_id": "pp_a38fc751323c34c7f7e4f6e4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.0
        },
        {
          "ts": "2026-06-03T20:44:59.999000Z",
          "side": "short",
          "price": 65190.63,
          "proposal_id": "pp_06c341e1d43ebf32697f309e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 722.96
        },
        {
          "ts": "2026-06-03T20:59:59.999000Z",
          "side": "long",
          "price": 65007.27,
          "proposal_id": "pp_b84ea0f3408308339b158572",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 722.91
        },
        {
          "ts": "2026-06-03T20:59:59.999000Z",
          "side": "long",
          "price": 65007.27,
          "proposal_id": "pp_a38fc751323c34c7f7e4f6e4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 722.87
        },
        {
          "ts": "2026-06-03T21:04:59.999000Z",
          "side": "short",
          "price": 65277.15,
          "proposal_id": "pp_f5a1365c0eb78a8b008b4a47",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.26
        },
        {
          "ts": "2026-06-03T21:04:59.999000Z",
          "side": "long",
          "price": 65277.15,
          "proposal_id": "pp_c3fc413f45c1e1da30c86d9b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0555,
          "notional": 535.47
        },
        {
          "ts": "2026-06-03T21:09:59.999000Z",
          "side": "short",
          "price": 65528.01,
          "proposal_id": "pp_16efcc1d8ef128d40a3e3de3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0612,
          "notional": 589.53
        },
        {
          "ts": "2026-06-03T21:24:59.999000Z",
          "side": "long",
          "price": 65526.71,
          "proposal_id": "pp_c3fc413f45c1e1da30c86d9b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0555,
          "notional": 535.24
        },
        {
          "ts": "2026-06-03T21:29:59.999000Z",
          "side": "long",
          "price": 65522.01,
          "proposal_id": "pp_7b9764255af5a286aefd4e32",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 723.05
        },
        {
          "ts": "2026-06-03T21:44:59.999000Z",
          "side": "long",
          "price": 65518.0,
          "proposal_id": "pp_5c0838dafea9641b8fb282a1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 722.64
        },
        {
          "ts": "2026-06-03T21:44:59.999000Z",
          "side": "long",
          "price": 65518.0,
          "proposal_id": "pp_c3fc413f45c1e1da30c86d9b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0555,
          "notional": 535.01
        },
        {
          "ts": "2026-06-03T21:49:59.999000Z",
          "side": "long",
          "price": 65774.78,
          "proposal_id": "pp_2eb1f0b28de199929b68f511",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 722.98
        },
        {
          "ts": "2026-06-03T21:49:59.999000Z",
          "side": "long",
          "price": 65774.78,
          "proposal_id": "pp_c3fc413f45c1e1da30c86d9b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0555,
          "notional": 535.26
        },
        {
          "ts": "2026-06-03T22:04:59.999000Z",
          "side": "short",
          "price": 65543.71,
          "proposal_id": "pp_e8a7358d7508ac4bb4a9572a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0548,
          "notional": 528.3
        },
        {
          "ts": "2026-06-03T22:04:59.999000Z",
          "side": "long",
          "price": 65543.71,
          "proposal_id": "pp_1fcdad4024826b17b37ded12",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 722.47
        },
        {
          "ts": "2026-06-03T22:19:59.999000Z",
          "side": "long",
          "price": 65275.05,
          "proposal_id": "pp_a5416d6d0893fecdbf06bc9d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0632,
          "notional": 608.32
        },
        {
          "ts": "2026-06-03T22:19:59.999000Z",
          "side": "long",
          "price": 65275.05,
          "proposal_id": "pp_1fcdad4024826b17b37ded12",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 722.34
        },
        {
          "ts": "2026-06-03T22:24:59.999000Z",
          "side": "long",
          "price": 65234.01,
          "proposal_id": "pp_3ad79cafd66afb4b112cb0e9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 721.88
        },
        {
          "ts": "2026-06-03T22:24:59.999000Z",
          "side": "long",
          "price": 65234.01,
          "proposal_id": "pp_1fcdad4024826b17b37ded12",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 721.84
        },
        {
          "ts": "2026-06-03T22:39:59.999000Z",
          "side": "long",
          "price": 65020.48,
          "proposal_id": "pp_f958954389f82ed2b05084f7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 721.34
        },
        {
          "ts": "2026-06-03T22:39:59.999000Z",
          "side": "long",
          "price": 65020.48,
          "proposal_id": "pp_1fcdad4024826b17b37ded12",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 721.29
        },
        {
          "ts": "2026-06-03T22:54:59.999000Z",
          "side": "short",
          "price": 64828.01,
          "proposal_id": "pp_3b8ef22959b4b5d699b49ddd",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0617,
          "notional": 593.57
        },
        {
          "ts": "2026-06-03T23:04:59.999000Z",
          "side": "long",
          "price": 64650.0,
          "proposal_id": "pp_84752f0e9ef3aa22eee4125e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 720.77
        },
        {
          "ts": "2026-06-03T23:09:59.999000Z",
          "side": "short",
          "price": 64482.42,
          "proposal_id": "pp_ffa15b76c03519e91bb5a26f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0725,
          "notional": 697.28
        },
        {
          "ts": "2026-06-03T23:19:59.999000Z",
          "side": "long",
          "price": 64503.12,
          "proposal_id": "pp_cdf984df65c346a99b379d99",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 720.66
        },
        {
          "ts": "2026-06-03T23:24:59.999000Z",
          "side": "short",
          "price": 64382.26,
          "proposal_id": "pp_f84ca9c253c0404327649d3f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0664,
          "notional": 637.97
        },
        {
          "ts": "2026-06-03T23:34:59.999000Z",
          "side": "long",
          "price": 64528.74,
          "proposal_id": "pp_6f7985a7c0f9c1286e5d94b2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 720.61
        },
        {
          "ts": "2026-06-03T23:39:59.999000Z",
          "side": "long",
          "price": 64312.51,
          "proposal_id": "pp_956a8e0b02ff6cdbd16e2b2f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 720.34
        },
        {
          "ts": "2026-06-03T23:39:59.999000Z",
          "side": "long",
          "price": 64312.51,
          "proposal_id": "pp_0c063a6314eadf3a72132996",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0599,
          "notional": 575.01
        },
        {
          "ts": "2026-06-03T23:54:59.999000Z",
          "side": "long",
          "price": 64094.0,
          "proposal_id": "pp_956a69d218e666e2759d484c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 720.04
        },
        {
          "ts": "2026-06-04T00:09:59.999000Z",
          "side": "long",
          "price": 64327.99,
          "proposal_id": "pp_7c8b1a358e86ddd7750d7cf6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 720.16
        },
        {
          "ts": "2026-06-04T00:24:59.999000Z",
          "side": "long",
          "price": 64016.0,
          "proposal_id": "pp_a593935c7799d62dbef1136d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 719.67
        },
        {
          "ts": "2026-06-04T00:24:59.999000Z",
          "side": "long",
          "price": 64016.0,
          "proposal_id": "pp_27fe38b1a5303bc1d5a150fe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0568,
          "notional": 544.71
        },
        {
          "ts": "2026-06-04T00:29:59.999000Z",
          "side": "short",
          "price": 63358.01,
          "proposal_id": "pp_c675c58263c3132ed2dace71",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0731,
          "notional": 700.88
        },
        {
          "ts": "2026-06-04T00:29:59.999000Z",
          "side": "long",
          "price": 63358.01,
          "proposal_id": "pp_27fe38b1a5303bc1d5a150fe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0568,
          "notional": 544.37
        },
        {
          "ts": "2026-06-04T00:34:59.999000Z",
          "side": "short",
          "price": 63719.04,
          "proposal_id": "pp_db42d1143552e60f981a2753",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0604,
          "notional": 579.31
        },
        {
          "ts": "2026-06-04T00:34:59.999000Z",
          "side": "long",
          "price": 63719.04,
          "proposal_id": "pp_27fe38b1a5303bc1d5a150fe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0568,
          "notional": 544.3
        },
        {
          "ts": "2026-06-04T00:39:59.999000Z",
          "side": "long",
          "price": 63127.29,
          "proposal_id": "pp_6df600d5d25c7f1f4c7bd0ac",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 719.09
        },
        {
          "ts": "2026-06-04T00:39:59.999000Z",
          "side": "long",
          "price": 63127.29,
          "proposal_id": "pp_27fe38b1a5303bc1d5a150fe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0568,
          "notional": 544.27
        },
        {
          "ts": "2026-06-04T00:44:59.999000Z",
          "side": "short",
          "price": 63595.33,
          "proposal_id": "pp_82458ad9a6b04292f78a1d08",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0747,
          "notional": 716.61
        },
        {
          "ts": "2026-06-04T00:44:59.999000Z",
          "side": "long",
          "price": 63595.33,
          "proposal_id": "pp_27fe38b1a5303bc1d5a150fe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0568,
          "notional": 544.67
        },
        {
          "ts": "2026-06-04T00:49:59.999000Z",
          "side": "long",
          "price": 63252.01,
          "proposal_id": "pp_a007c885daabfc624fb68fe9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 719.31
        },
        {
          "ts": "2026-06-04T00:54:59.999000Z",
          "side": "short",
          "price": 63178.07,
          "proposal_id": "pp_5e34cf09b16fea78a0b34f1d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 719.63
        },
        {
          "ts": "2026-06-04T01:04:59.999000Z",
          "side": "long",
          "price": 63387.18,
          "proposal_id": "pp_7b44ea0f6525b9832255137f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 719.67
        },
        {
          "ts": "2026-06-04T01:09:59.999000Z",
          "side": "long",
          "price": 63316.0,
          "proposal_id": "pp_cc85a4044be9d8422c878b8d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 719.47
        },
        {
          "ts": "2026-06-04T01:19:59.999000Z",
          "side": "short",
          "price": 62885.64,
          "proposal_id": "pp_e8aaa079fd3233061fb238d5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0603,
          "notional": 577.38
        },
        {
          "ts": "2026-06-04T01:19:59.999000Z",
          "side": "short",
          "price": 62885.64,
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 718.69
        },
        {
          "ts": "2026-06-04T01:34:59.999000Z",
          "side": "long",
          "price": 62905.21,
          "proposal_id": "pp_90136edf3910e7b279bbe20d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 718.6
        },
        {
          "ts": "2026-06-04T01:49:59.999000Z",
          "side": "long",
          "price": 62508.75,
          "proposal_id": "pp_2aaa04ec8ae889d04407c353",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.07,
          "notional": 669.98
        },
        {
          "ts": "2026-06-04T01:54:59.999000Z",
          "side": "short",
          "price": 62247.34,
          "proposal_id": "pp_477a406c7904666628a12e6e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0566,
          "notional": 542.45
        },
        {
          "ts": "2026-06-04T01:59:59.999000Z",
          "side": "short",
          "price": 62178.1,
          "proposal_id": "pp_6a10e4653396b9743a53c924",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0704,
          "notional": 674.05
        },
        {
          "ts": "2026-06-04T02:04:59.999000Z",
          "side": "short",
          "price": 61466.67,
          "proposal_id": "pp_cd4d76c45fef7f1faccf86ff",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0542,
          "notional": 519.85
        },
        {
          "ts": "2026-06-04T02:04:59.999000Z",
          "side": "short",
          "price": 61466.67,
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 718.82
        },
        {
          "ts": "2026-06-04T02:09:59.999000Z",
          "side": "short",
          "price": 62022.25,
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 718.18
        },
        {
          "ts": "2026-06-04T02:14:59.999000Z",
          "side": "long",
          "price": 62402.13,
          "proposal_id": "pp_862a315e59198a57984480ea",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 717.75
        },
        {
          "ts": "2026-06-04T02:14:59.999000Z",
          "side": "short",
          "price": 62402.13,
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 717.71
        },
        {
          "ts": "2026-06-04T02:24:59.999000Z",
          "side": "short",
          "price": 63026.88,
          "proposal_id": "pp_8618d49e31da341a640bd290",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 717.77
        },
        {
          "ts": "2026-06-04T02:24:59.999000Z",
          "side": "short",
          "price": 63026.88,
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 717.73
        },
        {
          "ts": "2026-06-04T02:39:59.999000Z",
          "side": "short",
          "price": 63347.43,
          "proposal_id": "pp_d6ed538f6b0ce7378657537d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 717.38
        },
        {
          "ts": "2026-06-04T02:44:59.999000Z",
          "side": "short",
          "price": 63410.0,
          "proposal_id": "pp_1605503935ba95fc4b5268c9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 716.91
        },
        {
          "ts": "2026-06-04T02:54:59.999000Z",
          "side": "short",
          "price": 63287.43,
          "proposal_id": "pp_d7c81fcb82fb1b6803172233",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 716.88
        },
        {
          "ts": "2026-06-04T02:59:59.999000Z",
          "side": "long",
          "price": 63231.99,
          "proposal_id": "pp_04eda0e4e1817281852774cb",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0591,
          "notional": 564.71
        },
        {
          "ts": "2026-06-04T03:04:59.999000Z",
          "side": "short",
          "price": 63714.05,
          "proposal_id": "pp_c5234c2785fbe16cd2ce95d1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 716.49
        },
        {
          "ts": "2026-06-04T03:09:59.999000Z",
          "side": "short",
          "price": 63813.08,
          "proposal_id": "pp_8a5dcfa760f90f6fb83c421a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 716.86
        },
        {
          "ts": "2026-06-04T03:19:59.999000Z",
          "side": "short",
          "price": 64075.99,
          "proposal_id": "pp_0e03a7ce86e92d83aee980d3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 716.48
        },
        {
          "ts": "2026-06-04T03:24:59.999000Z",
          "side": "short",
          "price": 63907.72,
          "proposal_id": "pp_e75baffefd74c164a3a3ccbc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 716.32
        },
        {
          "ts": "2026-06-04T03:34:59.999000Z",
          "side": "long",
          "price": 64454.0,
          "proposal_id": "pp_e07f058a3178936959be2f59",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0705,
          "notional": 672.9
        },
        {
          "ts": "2026-06-04T03:34:59.999000Z",
          "side": "short",
          "price": 64454.0,
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 715.56
        },
        {
          "ts": "2026-06-04T05:04:59.999000Z",
          "side": "long",
          "price": 64022.75,
          "proposal_id": "pp_48df99f323c7b62b66db4578",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0706,
          "notional": 673.42
        },
        {
          "ts": "2026-06-04T05:09:59.999000Z",
          "side": "short",
          "price": 63828.17,
          "proposal_id": "pp_12c22b0815a39c421fa97c96",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0518,
          "notional": 493.77
        },
        {
          "ts": "2026-06-04T05:09:59.999000Z",
          "side": "long",
          "price": 63828.17,
          "proposal_id": "pp_7b024c284407510abeaf6a3e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0668,
          "notional": 637.17
        },
        {
          "ts": "2026-06-04T05:24:59.999000Z",
          "side": "short",
          "price": 63826.0,
          "proposal_id": "pp_1285299eaa6d8d7fc560e06d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 715.26
        },
        {
          "ts": "2026-06-04T05:34:59.999000Z",
          "side": "long",
          "price": 64226.0,
          "proposal_id": "pp_01970f5f410b2661248543a0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 715.21
        },
        {
          "ts": "2026-06-04T05:34:59.999000Z",
          "side": "long",
          "price": 64226.0,
          "proposal_id": "pp_7b024c284407510abeaf6a3e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0668,
          "notional": 637.03
        },
        {
          "ts": "2026-06-04T05:49:59.999000Z",
          "side": "short",
          "price": 64098.0,
          "proposal_id": "pp_eeadb3ef00b2f48d90a8e4bd",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 714.99
        },
        {
          "ts": "2026-06-04T05:54:59.999000Z",
          "side": "long",
          "price": 64033.99,
          "proposal_id": "pp_f39fa6c1eab9784d610ad2bc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0702,
          "notional": 668.84
        },
        {
          "ts": "2026-06-04T06:04:59.999000Z",
          "side": "short",
          "price": 64152.49,
          "proposal_id": "pp_ef9aeb2c714c0285c81aa643",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 714.62
        },
        {
          "ts": "2026-06-04T06:09:59.999000Z",
          "side": "long",
          "price": 64233.99,
          "proposal_id": "pp_065ee25381fb75fac3a4084b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 714.7
        },
        {
          "ts": "2026-06-04T06:19:59.999000Z",
          "side": "long",
          "price": 64366.01,
          "proposal_id": "pp_7e7e2ed555456e468a3d012c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 714.42
        },
        {
          "ts": "2026-06-04T06:24:59.999000Z",
          "side": "short",
          "price": 64267.26,
          "proposal_id": "pp_13536dcb0dc018da6a9364ac",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0662,
          "notional": 630.62
        },
        {
          "ts": "2026-06-04T06:34:59.999000Z",
          "side": "long",
          "price": 64146.27,
          "proposal_id": "pp_15b96976864d8336bd153b8d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 714.12
        },
        {
          "ts": "2026-06-04T06:39:59.999000Z",
          "side": "long",
          "price": 64368.0,
          "proposal_id": "pp_d0e7d97a70385e707b88fc71",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0597,
          "notional": 568.39
        },
        {
          "ts": "2026-06-04T06:49:59.999000Z",
          "side": "long",
          "price": 64184.01,
          "proposal_id": "pp_006740112a10d527aade2f5d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 713.93
        },
        {
          "ts": "2026-06-04T06:54:59.999000Z",
          "side": "long",
          "price": 64082.0,
          "proposal_id": "pp_e9546f949cb91c8640bf80e4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 713.72
        },
        {
          "ts": "2026-06-04T06:59:59.999000Z",
          "side": "long",
          "price": 64027.99,
          "proposal_id": "pp_da2a53a7a2b0bb22facd5d5c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 713.49
        },
        {
          "ts": "2026-06-04T07:04:59.999000Z",
          "side": "long",
          "price": 63895.99,
          "proposal_id": "pp_a52ebb92e8f1a879a59583e7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 713.26
        },
        {
          "ts": "2026-06-04T07:09:59.999000Z",
          "side": "long",
          "price": 63895.97,
          "proposal_id": "pp_a6d738112b58aa9594fada61",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 713.04
        },
        {
          "ts": "2026-06-04T07:14:59.999000Z",
          "side": "long",
          "price": 63811.2,
          "proposal_id": "pp_47e7a780d21be30b942150a0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 712.63
        },
        {
          "ts": "2026-06-04T07:14:59.999000Z",
          "side": "long",
          "price": 63811.2,
          "proposal_id": "pp_5864349ca40385fa7f2b12f7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.075,
          "notional": 712.59
        },
        {
          "ts": "2026-06-04T07:19:59.999000Z",
          "side": "long",
          "price": 63527.99,
          "proposal_id": "pp_bf1b18aa50ba0a22401abd69",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.09
        },
        {
          "ts": "2026-06-04T07:19:59.999000Z",
          "side": "long",
          "price": 63527.99,
          "proposal_id": "pp_5864349ca40385fa7f2b12f7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.08
        },
        {
          "ts": "2026-06-04T07:34:59.999000Z",
          "side": "long",
          "price": 63789.6,
          "proposal_id": "pp_d2d746a4e84c13e122117ba1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.17
        },
        {
          "ts": "2026-06-04T07:34:59.999000Z",
          "side": "long",
          "price": 63789.6,
          "proposal_id": "pp_5864349ca40385fa7f2b12f7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.16
        },
        {
          "ts": "2026-06-04T07:49:59.999000Z",
          "side": "long",
          "price": 63899.99,
          "proposal_id": "pp_2fd5cfcc4b645e84a1a9703e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.16
        },
        {
          "ts": "2026-06-04T07:59:59.999000Z",
          "side": "long",
          "price": 63603.15,
          "proposal_id": "pp_cc53ca9c2a8d7a031eaf77fc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.05
        },
        {
          "ts": "2026-06-04T07:59:59.999000Z",
          "side": "long",
          "price": 63603.15,
          "proposal_id": "pp_5864349ca40385fa7f2b12f7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.04
        },
        {
          "ts": "2026-06-04T08:04:59.999000Z",
          "side": "long",
          "price": 63881.99,
          "proposal_id": "pp_9fe4137fa31af30722eac83d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.13
        },
        {
          "ts": "2026-06-04T08:04:59.999000Z",
          "side": "long",
          "price": 63881.99,
          "proposal_id": "pp_e2f17d97257256d87e742ca0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.12
        },
        {
          "ts": "2026-06-04T08:09:59.999000Z",
          "side": "long",
          "price": 63482.0,
          "proposal_id": "pp_52db481ea0e1375c3552b827",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.01
        },
        {
          "ts": "2026-06-04T08:09:59.999000Z",
          "side": "long",
          "price": 63482.0,
          "proposal_id": "pp_e2f17d97257256d87e742ca0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 356.0
        },
        {
          "ts": "2026-06-04T08:24:59.999000Z",
          "side": "long",
          "price": 63552.0,
          "proposal_id": "pp_ec32d146c6eac1f2f24d2f13",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.87
        },
        {
          "ts": "2026-06-04T08:24:59.999000Z",
          "side": "long",
          "price": 63552.0,
          "proposal_id": "pp_e2f17d97257256d87e742ca0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.86
        },
        {
          "ts": "2026-06-04T08:39:59.999000Z",
          "side": "long",
          "price": 63544.32,
          "proposal_id": "pp_f3f4accc54e8b6920ecd54d2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.84
        },
        {
          "ts": "2026-06-04T08:54:59.999000Z",
          "side": "long",
          "price": 63615.33,
          "proposal_id": "pp_ac0147519f6b0f64a32d5ff9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.84
        },
        {
          "ts": "2026-06-04T09:09:59.999000Z",
          "side": "long",
          "price": 63390.01,
          "proposal_id": "pp_f122cc3d72d9c85125befa41",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.028,
          "notional": 265.69
        },
        {
          "ts": "2026-06-04T09:09:59.999000Z",
          "side": "long",
          "price": 63390.01,
          "proposal_id": "pp_3215cd6b09f270360be305fa",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.7
        },
        {
          "ts": "2026-06-04T09:19:59.999000Z",
          "side": "long",
          "price": 63120.0,
          "proposal_id": "pp_462132938cc39fe4c2d54bd6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.032,
          "notional": 303.47
        },
        {
          "ts": "2026-06-04T09:19:59.999000Z",
          "side": "long",
          "price": 63120.0,
          "proposal_id": "pp_3215cd6b09f270360be305fa",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.57
        },
        {
          "ts": "2026-06-04T09:29:59.999000Z",
          "side": "long",
          "price": 62863.99,
          "proposal_id": "pp_3bc4f3b65bf94522e7dcd608",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0272,
          "notional": 257.99
        },
        {
          "ts": "2026-06-04T09:29:59.999000Z",
          "side": "long",
          "price": 62863.99,
          "proposal_id": "pp_3215cd6b09f270360be305fa",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.45
        },
        {
          "ts": "2026-06-04T09:44:59.999000Z",
          "side": "long",
          "price": 62899.44,
          "proposal_id": "pp_36f40a7226cb314451834523",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0276,
          "notional": 261.68
        },
        {
          "ts": "2026-06-04T09:59:59.999000Z",
          "side": "long",
          "price": 63266.0,
          "proposal_id": "pp_553fe8dc13f4c8fca6e9b776",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.52
        },
        {
          "ts": "2026-06-04T09:59:59.999000Z",
          "side": "long",
          "price": 63266.0,
          "proposal_id": "pp_3215cd6b09f270360be305fa",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.51
        },
        {
          "ts": "2026-06-04T10:04:59.999000Z",
          "side": "short",
          "price": 63046.0,
          "proposal_id": "pp_2f1bc8b594ab2d9b7b05b34d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0364,
          "notional": 345.27
        },
        {
          "ts": "2026-06-04T10:04:59.999000Z",
          "side": "long",
          "price": 63046.0,
          "proposal_id": "pp_ec1f2787be91e6c2f970f6ec",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.38
        },
        {
          "ts": "2026-06-04T10:14:59.999000Z",
          "side": "long",
          "price": 62872.58,
          "proposal_id": "pp_0cf9bf88b1e023c58145058f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0295,
          "notional": 279.95
        },
        {
          "ts": "2026-06-04T10:19:59.999000Z",
          "side": "long",
          "price": 62978.3,
          "proposal_id": "pp_ec1f2787be91e6c2f970f6ec",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.31
        },
        {
          "ts": "2026-06-04T10:29:59.999000Z",
          "side": "short",
          "price": 62501.51,
          "proposal_id": "pp_c1a8514f06934a5e1cea8543",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.033,
          "notional": 312.23
        },
        {
          "ts": "2026-06-04T10:29:59.999000Z",
          "side": "long",
          "price": 62501.51,
          "proposal_id": "pp_ec1f2787be91e6c2f970f6ec",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.19
        },
        {
          "ts": "2026-06-04T10:34:59.999000Z",
          "side": "long",
          "price": 62709.83,
          "proposal_id": "pp_08be3bd729d4cfbd0c94ff76",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0268,
          "notional": 253.8
        },
        {
          "ts": "2026-06-04T10:49:59.999000Z",
          "side": "long",
          "price": 62410.5,
          "proposal_id": "pp_94249b5cf38fe7a3eab7036c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.08
        },
        {
          "ts": "2026-06-04T11:04:59.999000Z",
          "side": "long",
          "price": 62602.03,
          "proposal_id": "pp_e20534dd048dd9940e63fae4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.1
        },
        {
          "ts": "2026-06-04T11:09:59.999000Z",
          "side": "short",
          "price": 62310.0,
          "proposal_id": "pp_5f038de4f515f1a55de2d58d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0293,
          "notional": 277.16
        },
        {
          "ts": "2026-06-04T11:14:59.999000Z",
          "side": "long",
          "price": 62272.6,
          "proposal_id": "pp_6760d3957caa75a60c0d45c9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.97
        },
        {
          "ts": "2026-06-04T11:24:59.999000Z",
          "side": "short",
          "price": 62569.99,
          "proposal_id": "pp_bc5f275c7ff6ae84fdb8b967",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0327,
          "notional": 309.59
        },
        {
          "ts": "2026-06-04T11:29:59.999000Z",
          "side": "short",
          "price": 62617.38,
          "proposal_id": "pp_50ca0111cd1a89c824474306",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.027,
          "notional": 255.78
        },
        {
          "ts": "2026-06-04T11:34:59.999000Z",
          "side": "long",
          "price": 62538.55,
          "proposal_id": "pp_6760d3957caa75a60c0d45c9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.9
        },
        {
          "ts": "2026-06-04T11:39:59.999000Z",
          "side": "long",
          "price": 62383.75,
          "proposal_id": "pp_847f07ea35ffecb6abfd1a32",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.88
        },
        {
          "ts": "2026-06-04T11:39:59.999000Z",
          "side": "long",
          "price": 62383.75,
          "proposal_id": "pp_6760d3957caa75a60c0d45c9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.87
        },
        {
          "ts": "2026-06-04T11:54:59.999000Z",
          "side": "long",
          "price": 62424.0,
          "proposal_id": "pp_541e03a026cb96b7074b0ea8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.86
        },
        {
          "ts": "2026-06-04T12:09:59.999000Z",
          "side": "short",
          "price": 62467.85,
          "proposal_id": "pp_ade63d80cdc1612d20782ac8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0344,
          "notional": 325.35
        },
        {
          "ts": "2026-06-04T12:19:59.999000Z",
          "side": "long",
          "price": 62666.81,
          "proposal_id": "pp_9df78c240e1511e3c6a95836",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.85
        },
        {
          "ts": "2026-06-04T12:19:59.999000Z",
          "side": "long",
          "price": 62666.81,
          "proposal_id": "pp_a2b6dc9e84d0519a510e4fa5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.84
        },
        {
          "ts": "2026-06-04T12:24:59.999000Z",
          "side": "short",
          "price": 63294.32,
          "proposal_id": "pp_a93720c044c344f6af02141d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0356,
          "notional": 337.21
        },
        {
          "ts": "2026-06-04T12:24:59.999000Z",
          "side": "long",
          "price": 63294.32,
          "proposal_id": "pp_a2b6dc9e84d0519a510e4fa5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.95
        },
        {
          "ts": "2026-06-04T12:34:59.999000Z",
          "side": "long",
          "price": 63492.86,
          "proposal_id": "pp_1ca50d118ab67a69cb2cbe71",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.88
        },
        {
          "ts": "2026-06-04T12:39:59.999000Z",
          "side": "short",
          "price": 63686.0,
          "proposal_id": "pp_32ef4f2ddc5a1776a9aea363",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.94
        },
        {
          "ts": "2026-06-04T12:49:59.999000Z",
          "side": "long",
          "price": 63910.9,
          "proposal_id": "pp_eeeb6ef1d7793ffadbfbe086",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.01
        },
        {
          "ts": "2026-06-04T12:54:59.999000Z",
          "side": "short",
          "price": 63825.79,
          "proposal_id": "pp_6e447940d5b7e336415f4623",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0355,
          "notional": 336.09
        },
        {
          "ts": "2026-06-04T13:04:59.999000Z",
          "side": "long",
          "price": 63700.0,
          "proposal_id": "pp_9fa86ac9666c4f7d912fa268",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.89
        },
        {
          "ts": "2026-06-04T13:09:59.999000Z",
          "side": "long",
          "price": 63627.0,
          "proposal_id": "pp_28a98766eea2a3cb18f2f867",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.91
        },
        {
          "ts": "2026-06-04T13:19:59.999000Z",
          "side": "long",
          "price": 63271.69,
          "proposal_id": "pp_6061680a4ee935e48a36975c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.76
        },
        {
          "ts": "2026-06-04T13:19:59.999000Z",
          "side": "long",
          "price": 63271.69,
          "proposal_id": "pp_ebad1b95b2cf4d61a3fd81d1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.75
        },
        {
          "ts": "2026-06-04T13:34:59.999000Z",
          "side": "long",
          "price": 63734.43,
          "proposal_id": "pp_bd60095ca7d9f580f2f878b5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.91
        },
        {
          "ts": "2026-06-04T13:34:59.999000Z",
          "side": "long",
          "price": 63734.43,
          "proposal_id": "pp_ebad1b95b2cf4d61a3fd81d1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.9
        },
        {
          "ts": "2026-06-04T13:39:59.999000Z",
          "side": "short",
          "price": 64150.0,
          "proposal_id": "pp_a7535eff3c4c6ebdbdf92834",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.05
        },
        {
          "ts": "2026-06-04T13:39:59.999000Z",
          "side": "long",
          "price": 64150.0,
          "proposal_id": "pp_ebad1b95b2cf4d61a3fd81d1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.04
        },
        {
          "ts": "2026-06-04T13:44:59.999000Z",
          "side": "short",
          "price": 63798.61,
          "proposal_id": "pp_7f3ce07db719a0733a12c43e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.033,
          "notional": 312.47
        },
        {
          "ts": "2026-06-04T13:49:59.999000Z",
          "side": "long",
          "price": 63829.42,
          "proposal_id": "pp_de6fc8f6a816330d0b8a9ee2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 355.04
        },
        {
          "ts": "2026-06-04T13:59:59.999000Z",
          "side": "long",
          "price": 64230.0,
          "proposal_id": "pp_c87dc9639bb4e123ba2388fa",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.96
        },
        {
          "ts": "2026-06-04T14:04:59.999000Z",
          "side": "short",
          "price": 64065.68,
          "proposal_id": "pp_f71b43dc5748651493e9fda2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0317,
          "notional": 299.69
        },
        {
          "ts": "2026-06-04T14:09:59.999000Z",
          "side": "long",
          "price": 64301.99,
          "proposal_id": "pp_4b4363838de20985fa1b68d6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.96
        },
        {
          "ts": "2026-06-04T14:14:59.999000Z",
          "side": "short",
          "price": 64365.73,
          "proposal_id": "pp_961b3df57e95a6963f6c6901",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.97
        },
        {
          "ts": "2026-06-04T14:24:59.999000Z",
          "side": "long",
          "price": 64176.01,
          "proposal_id": "pp_b916508d7e090c66c7b6ec80",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.93
        },
        {
          "ts": "2026-06-04T14:29:59.999000Z",
          "side": "long",
          "price": 64144.0,
          "proposal_id": "pp_ea1be122e8c3d257806aa025",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.95
        },
        {
          "ts": "2026-06-04T14:39:59.999000Z",
          "side": "long",
          "price": 63902.5,
          "proposal_id": "pp_4293e064aece1610b688c59b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.88
        },
        {
          "ts": "2026-06-04T14:44:59.999000Z",
          "side": "long",
          "price": 64000.91,
          "proposal_id": "pp_afdc9a7c3b4a6c1a05a50e48",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0281,
          "notional": 266.19
        },
        {
          "ts": "2026-06-04T14:54:59.999000Z",
          "side": "long",
          "price": 63840.0,
          "proposal_id": "pp_6a3664ab7e6e07e2ddf9ff60",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0333,
          "notional": 315.01
        },
        {
          "ts": "2026-06-04T14:59:59.999000Z",
          "side": "long",
          "price": 63958.97,
          "proposal_id": "pp_9150cc6738f13e864a8df4ce",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0311,
          "notional": 293.87
        },
        {
          "ts": "2026-06-04T15:09:59.999000Z",
          "side": "long",
          "price": 64327.24,
          "proposal_id": "pp_3af2a4f195915d2d7b9f5cf6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.88
        },
        {
          "ts": "2026-06-04T15:09:59.999000Z",
          "side": "long",
          "price": 64327.24,
          "proposal_id": "pp_e99ab2c727acfe306d0a5b37",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.87
        },
        {
          "ts": "2026-06-04T15:19:59.999000Z",
          "side": "long",
          "price": 64122.0,
          "proposal_id": "pp_5e1e4fd58ae6fba9585a6ca1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0307,
          "notional": 290.06
        },
        {
          "ts": "2026-06-04T15:19:59.999000Z",
          "side": "long",
          "price": 64122.0,
          "proposal_id": "pp_e99ab2c727acfe306d0a5b37",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.73
        },
        {
          "ts": "2026-06-04T15:24:59.999000Z",
          "side": "long",
          "price": 63970.0,
          "proposal_id": "pp_693ca00df5a2fc40f07110f4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.62
        },
        {
          "ts": "2026-06-04T15:24:59.999000Z",
          "side": "long",
          "price": 63970.0,
          "proposal_id": "pp_e99ab2c727acfe306d0a5b37",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.61
        },
        {
          "ts": "2026-06-04T15:39:59.999000Z",
          "side": "long",
          "price": 63874.01,
          "proposal_id": "pp_80ce9d7eee5637cd1f9bc340",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.57
        },
        {
          "ts": "2026-06-04T15:49:59.999000Z",
          "side": "long",
          "price": 63754.0,
          "proposal_id": "pp_ef8025cb3d078420205d82d3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.5
        },
        {
          "ts": "2026-06-04T15:54:59.999000Z",
          "side": "long",
          "price": 63772.34,
          "proposal_id": "pp_d0eed46f4a1e791ef7926e67",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.46
        },
        {
          "ts": "2026-06-04T16:04:59.999000Z",
          "side": "long",
          "price": 63729.12,
          "proposal_id": "pp_16613d7093078aea45dd915b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.44
        },
        {
          "ts": "2026-06-04T16:09:59.999000Z",
          "side": "long",
          "price": 63786.0,
          "proposal_id": "pp_c09f898e2f5dbc1b84be4ec0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.42
        },
        {
          "ts": "2026-06-04T16:19:59.999000Z",
          "side": "long",
          "price": 63716.85,
          "proposal_id": "pp_ba7c212a5cacb3c6f27cd68b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.4
        },
        {
          "ts": "2026-06-04T16:24:59.999000Z",
          "side": "long",
          "price": 63804.48,
          "proposal_id": "pp_7830cf16c236164a007779dc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.38
        },
        {
          "ts": "2026-06-04T16:34:59.999000Z",
          "side": "long",
          "price": 63476.04,
          "proposal_id": "pp_f176ef1c3531f6db99808f95",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.27
        },
        {
          "ts": "2026-06-04T16:34:59.999000Z",
          "side": "long",
          "price": 63476.04,
          "proposal_id": "pp_5a66d3c1827d498c9d5e3922",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0273,
          "notional": 257.68
        },
        {
          "ts": "2026-06-04T16:39:59.999000Z",
          "side": "long",
          "price": 63742.01,
          "proposal_id": "pp_78b1786d1cfe7c92eff81cdb",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.33
        },
        {
          "ts": "2026-06-04T16:39:59.999000Z",
          "side": "long",
          "price": 63742.01,
          "proposal_id": "pp_5a66d3c1827d498c9d5e3922",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0273,
          "notional": 257.73
        },
        {
          "ts": "2026-06-04T16:54:59.999000Z",
          "side": "long",
          "price": 63664.01,
          "proposal_id": "pp_32270071571d1292ab4cba78",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.29
        },
        {
          "ts": "2026-06-04T16:59:59.999000Z",
          "side": "long",
          "price": 63563.51,
          "proposal_id": "pp_6dbf0617f3aeeac4b334f2c7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.24
        },
        {
          "ts": "2026-06-04T17:04:59.999000Z",
          "side": "long",
          "price": 63523.99,
          "proposal_id": "pp_1badfdfcdb58cb965c5f5be5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.18
        },
        {
          "ts": "2026-06-04T17:14:59.999000Z",
          "side": "long",
          "price": 63591.99,
          "proposal_id": "pp_a67c96657d3500a18d59ae9b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.17
        },
        {
          "ts": "2026-06-04T17:19:59.999000Z",
          "side": "long",
          "price": 63259.87,
          "proposal_id": "pp_4e568eee9fbc8744a7193a37",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.06
        },
        {
          "ts": "2026-06-04T17:19:59.999000Z",
          "side": "long",
          "price": 63259.87,
          "proposal_id": "pp_7d6d6262f77148fd219d814e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0309,
          "notional": 291.98
        },
        {
          "ts": "2026-06-04T17:34:59.999000Z",
          "side": "long",
          "price": 63083.99,
          "proposal_id": "pp_c7c9b5d0d10c9e999b7010a1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.95
        },
        {
          "ts": "2026-06-04T17:34:59.999000Z",
          "side": "long",
          "price": 63083.99,
          "proposal_id": "pp_7d6d6262f77148fd219d814e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0309,
          "notional": 291.89
        },
        {
          "ts": "2026-06-04T17:49:59.999000Z",
          "side": "long",
          "price": 63090.27,
          "proposal_id": "pp_6d5326599a01c1cbc25673c4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.92
        },
        {
          "ts": "2026-06-04T17:54:59.999000Z",
          "side": "long",
          "price": 63598.0,
          "proposal_id": "pp_d68c18e92bdf4246761e37b9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 354.01
        },
        {
          "ts": "2026-06-04T17:54:59.999000Z",
          "side": "long",
          "price": 63598.0,
          "proposal_id": "pp_7d6d6262f77148fd219d814e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0309,
          "notional": 291.94
        },
        {
          "ts": "2026-06-04T18:04:59.999000Z",
          "side": "long",
          "price": 63344.0,
          "proposal_id": "pp_da85d5bd1b76c4a159a40bd6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.89
        },
        {
          "ts": "2026-06-04T18:04:59.999000Z",
          "side": "long",
          "price": 63344.0,
          "proposal_id": "pp_1908485c8e6f84a85d5aeeb1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0348,
          "notional": 328.79
        },
        {
          "ts": "2026-06-04T18:19:59.999000Z",
          "side": "long",
          "price": 63388.01,
          "proposal_id": "pp_8d45846787b946e9a4b94f1d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0328,
          "notional": 309.64
        },
        {
          "ts": "2026-06-04T18:29:59.999000Z",
          "side": "short",
          "price": 63896.27,
          "proposal_id": "pp_acce201c5f94cf6c45e57243",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0287,
          "notional": 271.25
        },
        {
          "ts": "2026-06-04T18:29:59.999000Z",
          "side": "long",
          "price": 63896.27,
          "proposal_id": "pp_1908485c8e6f84a85d5aeeb1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0348,
          "notional": 328.86
        },
        {
          "ts": "2026-06-04T18:44:59.999000Z",
          "side": "short",
          "price": 63924.93,
          "proposal_id": "pp_f7cd2e3dc10b708b25ca9671",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0289,
          "notional": 272.73
        },
        {
          "ts": "2026-06-04T18:59:59.999000Z",
          "side": "long",
          "price": 63819.62,
          "proposal_id": "pp_fb6f0d4c69d383aacdedf755",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.94
        },
        {
          "ts": "2026-06-04T19:09:59.999000Z",
          "side": "long",
          "price": 63685.5,
          "proposal_id": "pp_1a1c8afea3f6cf943ba077b7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0342,
          "notional": 322.35
        },
        {
          "ts": "2026-06-04T19:14:59.999000Z",
          "side": "long",
          "price": 63886.33,
          "proposal_id": "pp_fa04dc98e89a61e5d7e15252",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.87
        },
        {
          "ts": "2026-06-04T19:19:59.999000Z",
          "side": "long",
          "price": 63981.12,
          "proposal_id": "pp_1aff0a9d44e13bc24894c938",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0341,
          "notional": 321.69
        },
        {
          "ts": "2026-06-04T19:29:59.999000Z",
          "side": "long",
          "price": 64128.0,
          "proposal_id": "pp_2bc970ecc658478f20869855",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0327,
          "notional": 308.36
        },
        {
          "ts": "2026-06-04T19:34:59.999000Z",
          "side": "long",
          "price": 63965.44,
          "proposal_id": "pp_1aff0a9d44e13bc24894c938",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0341,
          "notional": 321.66
        },
        {
          "ts": "2026-06-04T19:49:59.999000Z",
          "side": "long",
          "price": 63726.0,
          "proposal_id": "pp_47d75439f2e12a0b37a950f3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.78
        },
        {
          "ts": "2026-06-04T19:49:59.999000Z",
          "side": "long",
          "price": 63726.0,
          "proposal_id": "pp_1aff0a9d44e13bc24894c938",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0341,
          "notional": 321.55
        },
        {
          "ts": "2026-06-04T19:59:59.999000Z",
          "side": "long",
          "price": 63629.38,
          "proposal_id": "pp_02cf4cbed194e9aed41d2aa4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.67
        },
        {
          "ts": "2026-06-04T19:59:59.999000Z",
          "side": "long",
          "price": 63629.38,
          "proposal_id": "pp_1aff0a9d44e13bc24894c938",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0341,
          "notional": 321.45
        },
        {
          "ts": "2026-06-04T20:04:59.999000Z",
          "side": "long",
          "price": 63393.08,
          "proposal_id": "pp_9792c6463a033a8bb2c1b39a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.56
        },
        {
          "ts": "2026-06-04T20:04:59.999000Z",
          "side": "long",
          "price": 63393.08,
          "proposal_id": "pp_7b29b6d7a169a1aaa33ea937",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0275,
          "notional": 259.67
        },
        {
          "ts": "2026-06-04T20:19:59.999000Z",
          "side": "long",
          "price": 63370.63,
          "proposal_id": "pp_771c47cd66b4857ac0d424b3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.53
        },
        {
          "ts": "2026-06-04T20:29:59.999000Z",
          "side": "long",
          "price": 63341.0,
          "proposal_id": "pp_40a443255b210b4240f3e407",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.44
        },
        {
          "ts": "2026-06-04T20:29:59.999000Z",
          "side": "long",
          "price": 63341.0,
          "proposal_id": "pp_7b29b6d7a169a1aaa33ea937",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0275,
          "notional": 259.58
        },
        {
          "ts": "2026-06-04T20:44:59.999000Z",
          "side": "long",
          "price": 63560.93,
          "proposal_id": "pp_9bc1c980d384e89c70fe1469",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.5
        },
        {
          "ts": "2026-06-04T20:44:59.999000Z",
          "side": "long",
          "price": 63560.93,
          "proposal_id": "pp_7b29b6d7a169a1aaa33ea937",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0275,
          "notional": 259.63
        },
        {
          "ts": "2026-06-04T20:59:59.999000Z",
          "side": "long",
          "price": 63638.4,
          "proposal_id": "pp_3ab9151779851a07ff207543",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.49
        },
        {
          "ts": "2026-06-04T21:09:59.999000Z",
          "side": "short",
          "price": 63847.0,
          "proposal_id": "pp_2c1c1789c99bcaa82a0d434b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0252,
          "notional": 237.83
        },
        {
          "ts": "2026-06-04T21:14:59.999000Z",
          "side": "long",
          "price": 63804.82,
          "proposal_id": "pp_c33261d2911e165f453f72fc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.53
        },
        {
          "ts": "2026-06-04T21:19:59.999000Z",
          "side": "long",
          "price": 63676.02,
          "proposal_id": "pp_85e41397abdb599e214bb12d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.5
        },
        {
          "ts": "2026-06-04T21:19:59.999000Z",
          "side": "long",
          "price": 63676.02,
          "proposal_id": "pp_c33261d2911e165f453f72fc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.49
        },
        {
          "ts": "2026-06-04T21:24:59.999000Z",
          "side": "long",
          "price": 63555.48,
          "proposal_id": "pp_77d71b4949557b3a1cac2bcc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.4
        },
        {
          "ts": "2026-06-04T21:24:59.999000Z",
          "side": "long",
          "price": 63555.48,
          "proposal_id": "pp_c33261d2911e165f453f72fc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.39
        },
        {
          "ts": "2026-06-04T21:34:59.999000Z",
          "side": "long",
          "price": 63427.99,
          "proposal_id": "pp_4d23b5e6bde413d7e3a35144",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.29
        },
        {
          "ts": "2026-06-04T21:34:59.999000Z",
          "side": "long",
          "price": 63427.99,
          "proposal_id": "pp_c33261d2911e165f453f72fc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.28
        },
        {
          "ts": "2026-06-04T21:44:59.999000Z",
          "side": "long",
          "price": 63496.0,
          "proposal_id": "pp_1e5ec2edd49cebe5ff554a38",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.19
        },
        {
          "ts": "2026-06-04T21:44:59.999000Z",
          "side": "long",
          "price": 63496.0,
          "proposal_id": "pp_c33261d2911e165f453f72fc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.18
        },
        {
          "ts": "2026-06-04T21:59:59.999000Z",
          "side": "long",
          "price": 63286.21,
          "proposal_id": "pp_b1b3b0cd7ca8f7301704f04e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.08
        },
        {
          "ts": "2026-06-04T21:59:59.999000Z",
          "side": "long",
          "price": 63286.21,
          "proposal_id": "pp_c33261d2911e165f453f72fc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.07
        },
        {
          "ts": "2026-06-04T22:14:59.999000Z",
          "side": "long",
          "price": 63292.0,
          "proposal_id": "pp_e064433387e1ef89f12c1b84",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.05
        },
        {
          "ts": "2026-06-04T22:29:59.999000Z",
          "side": "long",
          "price": 63352.14,
          "proposal_id": "pp_77b1ad3521ea5033983cca13",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.04
        },
        {
          "ts": "2026-06-04T22:44:59.999000Z",
          "side": "short",
          "price": 63504.15,
          "proposal_id": "pp_49cff0e14273a247ddaf34f2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0322,
          "notional": 303.5
        },
        {
          "ts": "2026-06-04T22:44:59.999000Z",
          "side": "long",
          "price": 63504.15,
          "proposal_id": "pp_f78c2cc97efce2378e67e29f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0322,
          "notional": 303.14
        },
        {
          "ts": "2026-06-04T22:59:59.999000Z",
          "side": "long",
          "price": 63735.43,
          "proposal_id": "pp_f78c2cc97efce2378e67e29f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0322,
          "notional": 303.09
        },
        {
          "ts": "2026-06-04T23:04:59.999000Z",
          "side": "short",
          "price": 63837.34,
          "proposal_id": "pp_0e01ce7da2c7468bab9f6dd1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0298,
          "notional": 280.78
        },
        {
          "ts": "2026-06-04T23:19:59.999000Z",
          "side": "long",
          "price": 63382.01,
          "proposal_id": "pp_aeead4f8d8a9011d5df51f20",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.06
        },
        {
          "ts": "2026-06-04T23:19:59.999000Z",
          "side": "long",
          "price": 63382.01,
          "proposal_id": "pp_dd4b810634730a9d424cf3a3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.05
        },
        {
          "ts": "2026-06-04T23:34:59.999000Z",
          "side": "long",
          "price": 63616.0,
          "proposal_id": "pp_ab76cd09261a0a548a953d9f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.12
        },
        {
          "ts": "2026-06-04T23:34:59.999000Z",
          "side": "long",
          "price": 63616.0,
          "proposal_id": "pp_dd4b810634730a9d424cf3a3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.11
        },
        {
          "ts": "2026-06-04T23:49:59.999000Z",
          "side": "long",
          "price": 63771.84,
          "proposal_id": "pp_dd4b810634730a9d424cf3a3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.13
        },
        {
          "ts": "2026-06-04T23:54:59.999000Z",
          "side": "long",
          "price": 63862.0,
          "proposal_id": "pp_91cdd2fc758aef95dd277cb7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.16
        },
        {
          "ts": "2026-06-05T00:09:59.999000Z",
          "side": "long",
          "price": 63823.2,
          "proposal_id": "pp_4b4f857dd52a524bea48dc2a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.11
        },
        {
          "ts": "2026-06-05T00:14:59.999000Z",
          "side": "long",
          "price": 63662.77,
          "proposal_id": "pp_bfe503c6a6caa346420f862b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.06
        },
        {
          "ts": "2026-06-05T00:19:59.999000Z",
          "side": "long",
          "price": 63686.2,
          "proposal_id": "pp_3d3736a41d9ad5c98563dc44",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.01
        },
        {
          "ts": "2026-06-05T00:24:59.999000Z",
          "side": "long",
          "price": 63840.12,
          "proposal_id": "pp_e2dda6897238fe6a7328db34",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 353.07
        },
        {
          "ts": "2026-06-05T00:24:59.999000Z",
          "side": "long",
          "price": 63840.12,
          "proposal_id": "pp_fc7edd44c487e2310b37e168",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0256,
          "notional": 241.01
        },
        {
          "ts": "2026-06-05T00:39:59.999000Z",
          "side": "long",
          "price": 63862.7,
          "proposal_id": "pp_af3f5b6809f390e80219ecd6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.98
        },
        {
          "ts": "2026-06-05T00:39:59.999000Z",
          "side": "long",
          "price": 63862.7,
          "proposal_id": "pp_fc7edd44c487e2310b37e168",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0256,
          "notional": 240.95
        },
        {
          "ts": "2026-06-05T00:44:59.999000Z",
          "side": "long",
          "price": 63697.94,
          "proposal_id": "pp_6fb96a6f4ba6faabae09104d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.9
        },
        {
          "ts": "2026-06-05T00:44:59.999000Z",
          "side": "long",
          "price": 63697.94,
          "proposal_id": "pp_fc7edd44c487e2310b37e168",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0256,
          "notional": 240.9
        },
        {
          "ts": "2026-06-05T00:54:59.999000Z",
          "side": "long",
          "price": 63524.01,
          "proposal_id": "pp_ef0c479f04ed803038de663c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.82
        },
        {
          "ts": "2026-06-05T00:54:59.999000Z",
          "side": "long",
          "price": 63524.01,
          "proposal_id": "pp_fc7edd44c487e2310b37e168",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0256,
          "notional": 240.84
        },
        {
          "ts": "2026-06-05T01:04:59.999000Z",
          "side": "short",
          "price": 63070.85,
          "proposal_id": "pp_d838f06248dfd4128dd0d8f6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.73
        },
        {
          "ts": "2026-06-05T01:04:59.999000Z",
          "side": "long",
          "price": 63070.85,
          "proposal_id": "pp_0b3a2ecceb28e39eece929bd",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.72
        },
        {
          "ts": "2026-06-05T01:09:59.999000Z",
          "side": "short",
          "price": 63212.64,
          "proposal_id": "pp_9547d3ea72890cc99dd6ed61",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0305,
          "notional": 286.39
        },
        {
          "ts": "2026-06-05T01:14:59.999000Z",
          "side": "long",
          "price": 63361.92,
          "proposal_id": "pp_830f41218e13ad3ee7b690b9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.7
        },
        {
          "ts": "2026-06-05T01:19:59.999000Z",
          "side": "long",
          "price": 63356.0,
          "proposal_id": "pp_8638d1eb6cfbfa32352c993c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.65
        },
        {
          "ts": "2026-06-05T01:24:59.999000Z",
          "side": "long",
          "price": 63313.99,
          "proposal_id": "pp_f75d9da51572451f74fbaec1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.54
        },
        {
          "ts": "2026-06-05T01:24:59.999000Z",
          "side": "long",
          "price": 63313.99,
          "proposal_id": "pp_0b3a2ecceb28e39eece929bd",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.53
        },
        {
          "ts": "2026-06-05T01:39:59.999000Z",
          "side": "long",
          "price": 63307.92,
          "proposal_id": "pp_3db44f09833e5792bd5fa8d2",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0314,
          "notional": 295.26
        },
        {
          "ts": "2026-06-05T01:54:59.999000Z",
          "side": "long",
          "price": 63338.23,
          "proposal_id": "pp_f74de029a06e767a9d41fa77",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.49
        },
        {
          "ts": "2026-06-05T02:09:59.999000Z",
          "side": "long",
          "price": 63226.52,
          "proposal_id": "pp_d0336f4a5e2f2fe7b74a7bec",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.45
        },
        {
          "ts": "2026-06-05T02:19:59.999000Z",
          "side": "long",
          "price": 63019.54,
          "proposal_id": "pp_cc82e8176fda16fe302d1753",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.34
        },
        {
          "ts": "2026-06-05T02:19:59.999000Z",
          "side": "long",
          "price": 63019.54,
          "proposal_id": "pp_d7ea3f795aa8b7274fe0ca31",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0285,
          "notional": 267.57
        },
        {
          "ts": "2026-06-05T02:24:59.999000Z",
          "side": "long",
          "price": 62920.0,
          "proposal_id": "pp_c4ea5db6d38ff2f46cea7fb8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.24
        },
        {
          "ts": "2026-06-05T02:24:59.999000Z",
          "side": "long",
          "price": 62920.0,
          "proposal_id": "pp_cc82e8176fda16fe302d1753",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.23
        },
        {
          "ts": "2026-06-05T02:29:59.999000Z",
          "side": "long",
          "price": 62705.48,
          "proposal_id": "pp_845471139453910c57371a31",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.13
        },
        {
          "ts": "2026-06-05T02:29:59.999000Z",
          "side": "long",
          "price": 62705.48,
          "proposal_id": "pp_cc82e8176fda16fe302d1753",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.12
        },
        {
          "ts": "2026-06-05T02:44:59.999000Z",
          "side": "long",
          "price": 62742.01,
          "proposal_id": "pp_3f94fe7027ef2e170fdb27cf",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0363,
          "notional": 341.22
        },
        {
          "ts": "2026-06-05T02:59:59.999000Z",
          "side": "short",
          "price": 62617.72,
          "proposal_id": "pp_35242d098709fe714cf5ed30",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0306,
          "notional": 287.09
        },
        {
          "ts": "2026-06-05T03:04:59.999000Z",
          "side": "short",
          "price": 62594.0,
          "proposal_id": "pp_30dc9aac322e172d1ecfd412",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 352.0
        },
        {
          "ts": "2026-06-05T03:14:59.999000Z",
          "side": "short",
          "price": 62379.62,
          "proposal_id": "pp_09f689e28caa7537c217f7ff",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0292,
          "notional": 274.29
        },
        {
          "ts": "2026-06-05T03:19:59.999000Z",
          "side": "short",
          "price": 62780.0,
          "proposal_id": "pp_d505005edee2f712fff915a8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.93
        },
        {
          "ts": "2026-06-05T03:19:59.999000Z",
          "side": "long",
          "price": 62780.0,
          "proposal_id": "pp_6c8be172824e99ca7fc2f776",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0314,
          "notional": 295.12
        },
        {
          "ts": "2026-06-05T03:24:59.999000Z",
          "side": "short",
          "price": 62659.81,
          "proposal_id": "pp_47cafc6a6035942b25a9d451",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.86
        },
        {
          "ts": "2026-06-05T03:34:59.999000Z",
          "side": "long",
          "price": 62820.01,
          "proposal_id": "pp_3e4b17fd27f34cae03ec7ffe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0297,
          "notional": 278.64
        },
        {
          "ts": "2026-06-05T03:34:59.999000Z",
          "side": "long",
          "price": 62820.01,
          "proposal_id": "pp_6c8be172824e99ca7fc2f776",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0339,
          "notional": 318.45
        },
        {
          "ts": "2026-06-05T03:44:59.999000Z",
          "side": "long",
          "price": 62665.41,
          "proposal_id": "pp_09713241f95e14730dc191bf",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0357,
          "notional": 334.94
        },
        {
          "ts": "2026-06-05T03:44:59.999000Z",
          "side": "long",
          "price": 62665.41,
          "proposal_id": "pp_6c8be172824e99ca7fc2f776",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0339,
          "notional": 318.35
        },
        {
          "ts": "2026-06-05T03:59:59.999000Z",
          "side": "long",
          "price": 62730.0,
          "proposal_id": "pp_509d00175a4ac186bd5efc9c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0344,
          "notional": 323.0
        },
        {
          "ts": "2026-06-05T04:04:59.999000Z",
          "side": "long",
          "price": 62630.01,
          "proposal_id": "pp_6215ec19bc67e876e93073da",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0305,
          "notional": 286.04
        },
        {
          "ts": "2026-06-05T04:09:59.999000Z",
          "side": "long",
          "price": 62922.93,
          "proposal_id": "pp_0d58e3016373df7931c99b7d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.68
        },
        {
          "ts": "2026-06-05T04:09:59.999000Z",
          "side": "long",
          "price": 62922.93,
          "proposal_id": "pp_626a9c934fdf6647ac1cc91e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.67
        },
        {
          "ts": "2026-06-05T04:19:59.999000Z",
          "side": "long",
          "price": 62698.01,
          "proposal_id": "pp_453357fdb8697c4d79732e25",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0318,
          "notional": 297.74
        },
        {
          "ts": "2026-06-05T04:19:59.999000Z",
          "side": "long",
          "price": 62698.01,
          "proposal_id": "pp_626a9c934fdf6647ac1cc91e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.54
        },
        {
          "ts": "2026-06-05T04:29:59.999000Z",
          "side": "long",
          "price": 63240.32,
          "proposal_id": "pp_74ac4c0478e6945a9b414ec5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0326,
          "notional": 305.33
        },
        {
          "ts": "2026-06-05T04:29:59.999000Z",
          "side": "long",
          "price": 63240.32,
          "proposal_id": "pp_626a9c934fdf6647ac1cc91e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.63
        },
        {
          "ts": "2026-06-05T04:44:59.999000Z",
          "side": "short",
          "price": 63025.12,
          "proposal_id": "pp_e8d000c6c9ed45c4351f17b7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0325,
          "notional": 305.01
        },
        {
          "ts": "2026-06-05T04:44:59.999000Z",
          "side": "long",
          "price": 63025.12,
          "proposal_id": "pp_626a9c934fdf6647ac1cc91e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.51
        },
        {
          "ts": "2026-06-05T04:54:59.999000Z",
          "side": "long",
          "price": 63318.67,
          "proposal_id": "pp_626a9c934fdf6647ac1cc91e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.45
        },
        {
          "ts": "2026-06-05T04:59:59.999000Z",
          "side": "short",
          "price": 63615.23,
          "proposal_id": "pp_68d2a81024a179ffcd44bf71",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.5
        },
        {
          "ts": "2026-06-05T05:04:59.999000Z",
          "side": "short",
          "price": 63418.88,
          "proposal_id": "pp_cb89a8228a544516f329b1b5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.55
        },
        {
          "ts": "2026-06-05T05:14:59.999000Z",
          "side": "long",
          "price": 63384.33,
          "proposal_id": "pp_0287dee1eb3ee34ae096492e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0325,
          "notional": 304.91
        },
        {
          "ts": "2026-06-05T05:19:59.999000Z",
          "side": "long",
          "price": 63336.86,
          "proposal_id": "pp_eed63b9dedc8b2ea68ce89fe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0323,
          "notional": 302.38
        },
        {
          "ts": "2026-06-05T05:29:59.999000Z",
          "side": "long",
          "price": 63510.02,
          "proposal_id": "pp_08f6e47e99c5be461d9d030c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0316,
          "notional": 296.42
        },
        {
          "ts": "2026-06-05T05:34:59.999000Z",
          "side": "short",
          "price": 63341.68,
          "proposal_id": "pp_0b01f6ce197b74a2e4af37d7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.56
        },
        {
          "ts": "2026-06-05T05:39:59.999000Z",
          "side": "long",
          "price": 63170.35,
          "proposal_id": "pp_56213711bdabf545fc52e23a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0292,
          "notional": 274.05
        },
        {
          "ts": "2026-06-05T05:44:59.999000Z",
          "side": "short",
          "price": 62893.14,
          "proposal_id": "pp_bfb9aed8b85364dc41060d3b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.52
        },
        {
          "ts": "2026-06-05T05:44:59.999000Z",
          "side": "long",
          "price": 62893.14,
          "proposal_id": "pp_edac99ead0a309894a4598a9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0298,
          "notional": 278.93
        },
        {
          "ts": "2026-06-05T05:49:59.999000Z",
          "side": "short",
          "price": 62780.02,
          "proposal_id": "pp_ce46177a5f8bdec7de59bfa7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.45
        },
        {
          "ts": "2026-06-05T05:59:59.999000Z",
          "side": "short",
          "price": 62329.35,
          "proposal_id": "pp_4aacd588ca12fa2631f22523",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.57
        },
        {
          "ts": "2026-06-05T05:59:59.999000Z",
          "side": "long",
          "price": 62329.35,
          "proposal_id": "pp_edac99ead0a309894a4598a9",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0298,
          "notional": 278.97
        },
        {
          "ts": "2026-06-05T06:04:59.999000Z",
          "side": "long",
          "price": 62175.99,
          "proposal_id": "pp_3df7f993faf97629fd3e3e29",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0257,
          "notional": 240.78
        },
        {
          "ts": "2026-06-05T06:09:59.999000Z",
          "side": "long",
          "price": 62444.0,
          "proposal_id": "pp_3b9f02c5a5827cd4e2dc4b28",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0285,
          "notional": 267.37
        },
        {
          "ts": "2026-06-05T06:09:59.999000Z",
          "side": "long",
          "price": 62444.0,
          "proposal_id": "pp_bbee74c1983d2d6a94936a47",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.032,
          "notional": 299.99
        },
        {
          "ts": "2026-06-05T06:14:59.999000Z",
          "side": "long",
          "price": 62082.93,
          "proposal_id": "pp_ab391eca66ae9dd9774d8e8d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.35
        },
        {
          "ts": "2026-06-05T06:14:59.999000Z",
          "side": "long",
          "price": 62082.93,
          "proposal_id": "pp_bbee74c1983d2d6a94936a47",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.032,
          "notional": 299.88
        },
        {
          "ts": "2026-06-05T06:24:59.999000Z",
          "side": "long",
          "price": 61462.49,
          "proposal_id": "pp_1b6877bc359eaa9eb87d9656",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0288,
          "notional": 270.18
        },
        {
          "ts": "2026-06-05T06:24:59.999000Z",
          "side": "long",
          "price": 61462.49,
          "proposal_id": "pp_bbee74c1983d2d6a94936a47",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.032,
          "notional": 299.75
        },
        {
          "ts": "2026-06-05T06:39:59.999000Z",
          "side": "long",
          "price": 61808.0,
          "proposal_id": "pp_a8caa57cce2008432e4b5fa6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.23
        },
        {
          "ts": "2026-06-05T06:44:59.999000Z",
          "side": "long",
          "price": 62146.11,
          "proposal_id": "pp_79b881c2937ee6c035d7a2eb",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.32
        },
        {
          "ts": "2026-06-05T06:54:59.999000Z",
          "side": "long",
          "price": 61991.25,
          "proposal_id": "pp_85929d81515ace949ec8e605",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.33
        },
        {
          "ts": "2026-06-05T06:59:59.999000Z",
          "side": "long",
          "price": 61946.57,
          "proposal_id": "pp_bbee74c1983d2d6a94936a47",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.032,
          "notional": 299.81
        },
        {
          "ts": "2026-06-05T07:09:59.999000Z",
          "side": "short",
          "price": 61539.8,
          "proposal_id": "pp_b796c407e7c3b685c5855c9d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 351.08
        },
        {
          "ts": "2026-06-05T07:09:59.999000Z",
          "side": "long",
          "price": 61539.8,
          "proposal_id": "pp_dc71148fab87e340a4453e1a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0302,
          "notional": 283.15
        },
        {
          "ts": "2026-06-05T07:24:59.999000Z",
          "side": "long",
          "price": 61837.45,
          "proposal_id": "pp_e30bfa06663e7d0a659c1641",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.97
        },
        {
          "ts": "2026-06-05T07:29:59.999000Z",
          "side": "short",
          "price": 62252.95,
          "proposal_id": "pp_d124e9522e3a54bc4f18e3dd",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0347,
          "notional": 324.95
        },
        {
          "ts": "2026-06-05T07:34:59.999000Z",
          "side": "short",
          "price": 62445.84,
          "proposal_id": "pp_d64d15f583d66694ad0e724a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0367,
          "notional": 343.52
        },
        {
          "ts": "2026-06-05T07:39:59.999000Z",
          "side": "short",
          "price": 62768.0,
          "proposal_id": "pp_2328457d419acaf5e6196ca1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.98
        },
        {
          "ts": "2026-06-05T07:39:59.999000Z",
          "side": "long",
          "price": 62768.0,
          "proposal_id": "pp_dc71148fab87e340a4453e1a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0302,
          "notional": 283.06
        },
        {
          "ts": "2026-06-05T07:54:59.999000Z",
          "side": "long",
          "price": 62940.52,
          "proposal_id": "pp_f7d26361cdbea6ce806bf913",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.92
        },
        {
          "ts": "2026-06-05T08:09:59.999000Z",
          "side": "long",
          "price": 62761.78,
          "proposal_id": "pp_494b0ed05016896dbef3399f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.86
        },
        {
          "ts": "2026-06-05T08:24:59.999000Z",
          "side": "short",
          "price": 62703.5,
          "proposal_id": "pp_cc9d0f7d3d8260107f74f285",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0368,
          "notional": 344.69
        },
        {
          "ts": "2026-06-05T08:39:59.999000Z",
          "side": "long",
          "price": 62533.31,
          "proposal_id": "pp_9bf7dd0f27275739f324ce21",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.84
        },
        {
          "ts": "2026-06-05T08:54:59.999000Z",
          "side": "long",
          "price": 62391.38,
          "proposal_id": "pp_fef53e5d1ebc6afbd63db73a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.73
        },
        {
          "ts": "2026-06-05T08:54:59.999000Z",
          "side": "long",
          "price": 62391.38,
          "proposal_id": "pp_1bcaab898a94c2c7dd8073d3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0352,
          "notional": 329.01
        },
        {
          "ts": "2026-06-05T09:09:59.999000Z",
          "side": "long",
          "price": 62745.15,
          "proposal_id": "pp_3506b27dc1ae5b984173057b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.81
        },
        {
          "ts": "2026-06-05T09:09:59.999000Z",
          "side": "long",
          "price": 62745.15,
          "proposal_id": "pp_49b22a07dd8d35c8d950ea88",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0352,
          "notional": 329.69
        },
        {
          "ts": "2026-06-05T09:14:59.999000Z",
          "side": "long",
          "price": 63099.64,
          "proposal_id": "pp_49b22a07dd8d35c8d950ea88",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0352,
          "notional": 329.78
        },
        {
          "ts": "2026-06-05T09:14:59.999000Z",
          "side": "long",
          "price": 63099.64,
          "proposal_id": "pp_1bcaab898a94c2c7dd8073d3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0352,
          "notional": 329.18
        },
        {
          "ts": "2026-06-05T09:39:59.999000Z",
          "side": "long",
          "price": 62814.34,
          "proposal_id": "pp_571893ef3197cc88a4e3ca93",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.78
        },
        {
          "ts": "2026-06-05T09:39:59.999000Z",
          "side": "long",
          "price": 62814.34,
          "proposal_id": "pp_49b22a07dd8d35c8d950ea88",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0352,
          "notional": 329.66
        },
        {
          "ts": "2026-06-05T09:54:59.999000Z",
          "side": "long",
          "price": 62863.42,
          "proposal_id": "pp_a40c6505e0a0ed1df3482fb4",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.76
        },
        {
          "ts": "2026-06-05T10:09:59.999000Z",
          "side": "long",
          "price": 62680.81,
          "proposal_id": "pp_3bbf6d7521b7c4ce5e85332c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.7
        },
        {
          "ts": "2026-06-05T10:19:59.999000Z",
          "side": "long",
          "price": 62570.69,
          "proposal_id": "pp_6cab44be35caca30f8b8e559",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.64
        },
        {
          "ts": "2026-06-05T10:24:59.999000Z",
          "side": "long",
          "price": 62538.35,
          "proposal_id": "pp_f29bf433860cf81c0632da18",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0336,
          "notional": 313.68
        },
        {
          "ts": "2026-06-05T10:34:59.999000Z",
          "side": "long",
          "price": 62565.63,
          "proposal_id": "pp_acbba55cb6ec7a53adafca9b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.57
        },
        {
          "ts": "2026-06-05T10:39:59.999000Z",
          "side": "long",
          "price": 62387.26,
          "proposal_id": "pp_30f6c3496414e14d49c990ee",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.48
        },
        {
          "ts": "2026-06-05T10:39:59.999000Z",
          "side": "long",
          "price": 62387.26,
          "proposal_id": "pp_7ffe62b11af58b5842804ce8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0303,
          "notional": 283.29
        },
        {
          "ts": "2026-06-05T10:44:59.999000Z",
          "side": "long",
          "price": 62675.51,
          "proposal_id": "pp_ff7a8688de397e03d2b9c6dd",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.53
        },
        {
          "ts": "2026-06-05T10:44:59.999000Z",
          "side": "long",
          "price": 62675.51,
          "proposal_id": "pp_7ffe62b11af58b5842804ce8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0303,
          "notional": 283.33
        },
        {
          "ts": "2026-06-05T10:54:59.999000Z",
          "side": "long",
          "price": 62546.08,
          "proposal_id": "pp_f51812c1a2395ef1c38e766f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.43
        },
        {
          "ts": "2026-06-05T10:54:59.999000Z",
          "side": "long",
          "price": 62546.08,
          "proposal_id": "pp_7ffe62b11af58b5842804ce8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0303,
          "notional": 283.25
        },
        {
          "ts": "2026-06-05T11:04:59.999000Z",
          "side": "long",
          "price": 62406.0,
          "proposal_id": "pp_1a9a91465b0d22ddf43386b5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.34
        },
        {
          "ts": "2026-06-05T11:04:59.999000Z",
          "side": "long",
          "price": 62406.0,
          "proposal_id": "pp_8b3ffc57aff6eab20eacaeca",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.33
        },
        {
          "ts": "2026-06-05T11:19:59.999000Z",
          "side": "long",
          "price": 62491.91,
          "proposal_id": "pp_adea38db4d8dd9e71b099680",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.23
        },
        {
          "ts": "2026-06-05T11:19:59.999000Z",
          "side": "long",
          "price": 62491.91,
          "proposal_id": "pp_8b3ffc57aff6eab20eacaeca",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.22
        },
        {
          "ts": "2026-06-05T11:24:59.999000Z",
          "side": "long",
          "price": 62344.88,
          "proposal_id": "pp_e3adc8a5d533a7b0175fc822",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.12
        },
        {
          "ts": "2026-06-05T11:24:59.999000Z",
          "side": "long",
          "price": 62344.88,
          "proposal_id": "pp_8b3ffc57aff6eab20eacaeca",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.11
        },
        {
          "ts": "2026-06-05T11:39:59.999000Z",
          "side": "long",
          "price": 62295.99,
          "proposal_id": "pp_a1a3ff8df7e3c689a9588c4f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.08
        },
        {
          "ts": "2026-06-05T11:44:59.999000Z",
          "side": "long",
          "price": 62114.4,
          "proposal_id": "pp_179d189f785068cc70a84e34",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.03
        },
        {
          "ts": "2026-06-05T11:49:59.999000Z",
          "side": "long",
          "price": 62189.17,
          "proposal_id": "pp_8b3ffc57aff6eab20eacaeca",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.97
        },
        {
          "ts": "2026-06-05T11:59:59.999000Z",
          "side": "short",
          "price": 61964.99,
          "proposal_id": "pp_7580fe8b7504767f60967ee7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.87
        },
        {
          "ts": "2026-06-05T11:59:59.999000Z",
          "side": "long",
          "price": 61964.99,
          "proposal_id": "pp_8b3ffc57aff6eab20eacaeca",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.86
        },
        {
          "ts": "2026-06-05T12:04:59.999000Z",
          "side": "long",
          "price": 61656.95,
          "proposal_id": "pp_41d676b2d184c8bc1b589ba1",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.85
        },
        {
          "ts": "2026-06-05T12:04:59.999000Z",
          "side": "long",
          "price": 61656.95,
          "proposal_id": "pp_659c69f29f25a91eefff6631",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.84
        },
        {
          "ts": "2026-06-05T12:09:59.999000Z",
          "side": "long",
          "price": 62047.06,
          "proposal_id": "pp_659c69f29f25a91eefff6631",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.94
        },
        {
          "ts": "2026-06-05T12:09:59.999000Z",
          "side": "short",
          "price": 62047.06,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.93
        },
        {
          "ts": "2026-06-05T12:19:59.999000Z",
          "side": "short",
          "price": 62329.81,
          "proposal_id": "pp_c8187420179f09b2cd00705d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0359,
          "notional": 334.74
        },
        {
          "ts": "2026-06-05T12:24:59.999000Z",
          "side": "short",
          "price": 62389.99,
          "proposal_id": "pp_071eb62be0bdd112bf2cf0c6",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.91
        },
        {
          "ts": "2026-06-05T12:34:59.999000Z",
          "side": "long",
          "price": 61753.43,
          "proposal_id": "pp_a292aae4fe98da10b0133fa3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.04
        },
        {
          "ts": "2026-06-05T12:34:59.999000Z",
          "side": "long",
          "price": 61753.43,
          "proposal_id": "pp_659c69f29f25a91eefff6631",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.03
        },
        {
          "ts": "2026-06-05T12:49:59.999000Z",
          "side": "long",
          "price": 61968.01,
          "proposal_id": "pp_4a3a873f5f3f87954c23f916",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.05
        },
        {
          "ts": "2026-06-05T13:04:59.999000Z",
          "side": "long",
          "price": 62073.77,
          "proposal_id": "pp_6cd24a2b07c1f89bc73fbee8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.05
        },
        {
          "ts": "2026-06-05T13:09:59.999000Z",
          "side": "long",
          "price": 61966.64,
          "proposal_id": "pp_cece35767ff48487f53cc48a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.12
        },
        {
          "ts": "2026-06-05T13:19:59.999000Z",
          "side": "long",
          "price": 62073.0,
          "proposal_id": "pp_48e77ed4c46738386e3bc158",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.1
        },
        {
          "ts": "2026-06-05T13:24:59.999000Z",
          "side": "long",
          "price": 62127.4,
          "proposal_id": "pp_66152ff1a89d4d6c6dbc1cde",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.12
        },
        {
          "ts": "2026-06-05T13:34:59.999000Z",
          "side": "long",
          "price": 62194.07,
          "proposal_id": "pp_910c22da37d8723215816356",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 350.12
        },
        {
          "ts": "2026-06-05T13:39:59.999000Z",
          "side": "long",
          "price": 61811.99,
          "proposal_id": "pp_18e2f2f9b648aa888d6d1713",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.98
        },
        {
          "ts": "2026-06-05T13:39:59.999000Z",
          "side": "long",
          "price": 61811.99,
          "proposal_id": "pp_14450d8ccc806803db2cd7cd",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.97
        },
        {
          "ts": "2026-06-05T13:49:59.999000Z",
          "side": "long",
          "price": 61271.88,
          "proposal_id": "pp_af7e45bf2068d01b68de70ff",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.82
        },
        {
          "ts": "2026-06-05T13:49:59.999000Z",
          "side": "long",
          "price": 61271.88,
          "proposal_id": "pp_14450d8ccc806803db2cd7cd",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.81
        },
        {
          "ts": "2026-06-05T13:59:59.999000Z",
          "side": "long",
          "price": 60732.36,
          "proposal_id": "pp_58bfc8376ac959ff8ff5417a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0312,
          "notional": 290.82
        },
        {
          "ts": "2026-06-05T13:59:59.999000Z",
          "side": "long",
          "price": 60732.36,
          "proposal_id": "pp_14450d8ccc806803db2cd7cd",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.66
        },
        {
          "ts": "2026-06-05T14:09:59.999000Z",
          "side": "long",
          "price": 61136.31,
          "proposal_id": "pp_1ad8d8cad905399fce8e2470",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0359,
          "notional": 334.49
        },
        {
          "ts": "2026-06-05T14:09:59.999000Z",
          "side": "long",
          "price": 61136.31,
          "proposal_id": "pp_9a7470d3f0169a3b960218d7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0268,
          "notional": 250.23
        },
        {
          "ts": "2026-06-05T14:14:59.999000Z",
          "side": "long",
          "price": 60865.45,
          "proposal_id": "pp_9b722b516b3867d2029d8918",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.65
        },
        {
          "ts": "2026-06-05T14:14:59.999000Z",
          "side": "long",
          "price": 60865.45,
          "proposal_id": "pp_9a7470d3f0169a3b960218d7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0268,
          "notional": 250.12
        },
        {
          "ts": "2026-06-05T14:24:59.999000Z",
          "side": "long",
          "price": 60557.83,
          "proposal_id": "pp_6b9fe1bb50f81810f749fdb0",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.47
        },
        {
          "ts": "2026-06-05T14:24:59.999000Z",
          "side": "long",
          "price": 60557.83,
          "proposal_id": "pp_9a7470d3f0169a3b960218d7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0268,
          "notional": 249.99
        },
        {
          "ts": "2026-06-05T14:39:59.999000Z",
          "side": "long",
          "price": 60888.01,
          "proposal_id": "pp_4b9bb478b73d9a2a9f36c95e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.67
        },
        {
          "ts": "2026-06-05T14:39:59.999000Z",
          "side": "long",
          "price": 60888.01,
          "proposal_id": "pp_9a7470d3f0169a3b960218d7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0268,
          "notional": 250.13
        },
        {
          "ts": "2026-06-05T14:54:59.999000Z",
          "side": "long",
          "price": 60762.01,
          "proposal_id": "pp_8ebbc0a61811845e0787a5c3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.61
        },
        {
          "ts": "2026-06-05T15:09:59.999000Z",
          "side": "long",
          "price": 60755.32,
          "proposal_id": "pp_77841037827c34b229889a40",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.59
        },
        {
          "ts": "2026-06-05T15:39:59.999000Z",
          "side": "long",
          "price": 60202.6,
          "proposal_id": "pp_ea8bbe374917805489a70414",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.029,
          "notional": 270.08
        },
        {
          "ts": "2026-06-05T15:39:59.999000Z",
          "side": "long",
          "price": 60202.6,
          "proposal_id": "pp_77841037827c34b229889a40",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.4
        },
        {
          "ts": "2026-06-05T15:54:59.999000Z",
          "side": "long",
          "price": 60552.0,
          "proposal_id": "pp_18c392e9a97a77ccacdaf80a",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0331,
          "notional": 308.14
        },
        {
          "ts": "2026-06-05T16:04:59.999000Z",
          "side": "long",
          "price": 60247.98,
          "proposal_id": "pp_dc29063b6dc82b592406b97e",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.36
        },
        {
          "ts": "2026-06-05T16:14:59.999000Z",
          "side": "long",
          "price": 60897.63,
          "proposal_id": "pp_ed59bbf8da23ead11b2c600d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.17
        },
        {
          "ts": "2026-06-05T16:14:59.999000Z",
          "side": "short",
          "price": 60897.63,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.16
        },
        {
          "ts": "2026-06-05T16:24:59.999000Z",
          "side": "short",
          "price": 61222.96,
          "proposal_id": "pp_52eb4668c4e6098c2f1ac5ca",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0278,
          "notional": 258.91
        },
        {
          "ts": "2026-06-05T16:24:59.999000Z",
          "side": "short",
          "price": 61222.96,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.17
        },
        {
          "ts": "2026-06-05T16:39:59.999000Z",
          "side": "long",
          "price": 60964.58,
          "proposal_id": "pp_cb78eeaa9c9d0a78765be673",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.19
        },
        {
          "ts": "2026-06-05T16:54:59.999000Z",
          "side": "short",
          "price": 61385.33,
          "proposal_id": "pp_d6c0f3d87cc623b7a7cf8f67",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.26
        },
        {
          "ts": "2026-06-05T17:09:59.999000Z",
          "side": "long",
          "price": 61367.04,
          "proposal_id": "pp_3f8bef46b5a81754ca07062c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.25
        },
        {
          "ts": "2026-06-05T17:14:59.999000Z",
          "side": "long",
          "price": 61061.06,
          "proposal_id": "pp_7b329c559813d214ef451ebc",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.14
        },
        {
          "ts": "2026-06-05T17:29:59.999000Z",
          "side": "long",
          "price": 60697.27,
          "proposal_id": "pp_39e03d914ed731377abbb4cf",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.026,
          "notional": 242.38
        },
        {
          "ts": "2026-06-05T17:44:59.999000Z",
          "side": "long",
          "price": 60755.83,
          "proposal_id": "pp_0d7169f4441dcd59efcbc0fe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.04
        },
        {
          "ts": "2026-06-05T17:59:59.999000Z",
          "side": "long",
          "price": 60813.99,
          "proposal_id": "pp_62344e6a933d61a23216f1c7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.03
        },
        {
          "ts": "2026-06-05T18:14:59.999000Z",
          "side": "long",
          "price": 60624.35,
          "proposal_id": "pp_d6303a21edec0539b60d8e7b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.97
        },
        {
          "ts": "2026-06-05T18:19:59.999000Z",
          "side": "long",
          "price": 60449.22,
          "proposal_id": "pp_9d89e7478f673675c8ff2756",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.1
        },
        {
          "ts": "2026-06-05T18:24:59.999000Z",
          "side": "long",
          "price": 60323.65,
          "proposal_id": "pp_f31a9ba546e99b96dfb4bb09",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0264,
          "notional": 245.99
        },
        {
          "ts": "2026-06-05T18:29:59.999000Z",
          "side": "long",
          "price": 60158.0,
          "proposal_id": "pp_e753d0c581e005db025c6e71",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0329,
          "notional": 305.95
        },
        {
          "ts": "2026-06-05T18:29:59.999000Z",
          "side": "short",
          "price": 60158.0,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.92
        },
        {
          "ts": "2026-06-05T18:44:59.999000Z",
          "side": "long",
          "price": 59952.0,
          "proposal_id": "pp_879c122c0c9ddd63f3baa9a8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.92
        },
        {
          "ts": "2026-06-05T18:44:59.999000Z",
          "side": "short",
          "price": 59952.0,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.91
        },
        {
          "ts": "2026-06-05T18:49:59.999000Z",
          "side": "long",
          "price": 59785.68,
          "proposal_id": "pp_1da6988576d19cf9e7e6f2df",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.83
        },
        {
          "ts": "2026-06-05T18:54:59.999000Z",
          "side": "long",
          "price": 59207.42,
          "proposal_id": "pp_e1e0c515beacc2351cfdb068",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.83
        },
        {
          "ts": "2026-06-05T18:54:59.999000Z",
          "side": "short",
          "price": 59207.42,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.82
        },
        {
          "ts": "2026-06-05T18:59:59.999000Z",
          "side": "long",
          "price": 59395.99,
          "proposal_id": "pp_bce48195182a1acc340cbff3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0286,
          "notional": 266.42
        },
        {
          "ts": "2026-06-05T18:59:59.999000Z",
          "side": "short",
          "price": 59395.99,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.81
        },
        {
          "ts": "2026-06-05T19:14:59.999000Z",
          "side": "long",
          "price": 59392.25,
          "proposal_id": "pp_5f6e43a8baa7cda053bdea2f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.79
        },
        {
          "ts": "2026-06-05T19:29:59.999000Z",
          "side": "short",
          "price": 59858.27,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.8
        },
        {
          "ts": "2026-06-05T19:34:59.999000Z",
          "side": "short",
          "price": 59707.19,
          "proposal_id": "pp_900e4508eeb5afe27b27a49c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0338,
          "notional": 314.78
        },
        {
          "ts": "2026-06-05T19:49:59.999000Z",
          "side": "long",
          "price": 60215.47,
          "proposal_id": "pp_d1580fc9a60b196c1097294d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.61
        },
        {
          "ts": "2026-06-05T19:49:59.999000Z",
          "side": "short",
          "price": 60215.47,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.6
        },
        {
          "ts": "2026-06-05T20:04:59.999000Z",
          "side": "short",
          "price": 60083.99,
          "proposal_id": "pp_6af3f80c99ac2b3d005beeb3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0325,
          "notional": 302.5
        }
      ],
      "closed_markers": [
        {
          "opened_ts": "2026-06-02T08:49:59.999000Z",
          "closed_ts": "2026-06-02T09:04:59.999000Z",
          "side": "short",
          "entry_price": 69801.3,
          "exit_price": 69597.09,
          "pnl_usd": 1.6317,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f0e5fde0a172e4abc895918d"
        },
        {
          "opened_ts": "2026-06-02T08:49:59.999000Z",
          "closed_ts": "2026-06-02T09:04:59.999000Z",
          "side": "long",
          "entry_price": 69801.3,
          "exit_price": 69657.97,
          "pnl_usd": -2.1024,
          "exit_reason": "sl",
          "proposal_id": "pp_0f0288196309dd74213ceaf0"
        },
        {
          "opened_ts": "2026-06-02T09:04:59.999000Z",
          "closed_ts": "2026-06-02T09:19:59.999000Z",
          "side": "long",
          "entry_price": 69597.09,
          "exit_price": 69612.75,
          "pnl_usd": -0.3937,
          "exit_reason": "time_stop",
          "proposal_id": "pp_e8e5bc5b50257fe2146688e8"
        },
        {
          "opened_ts": "2026-06-02T09:04:59.999000Z",
          "closed_ts": "2026-06-02T09:24:59.999000Z",
          "side": "long",
          "entry_price": 69597.09,
          "exit_price": 69446.1575,
          "pnl_usd": -2.1885,
          "exit_reason": "sl",
          "proposal_id": "pp_6016538369a7248fd4d45807"
        },
        {
          "opened_ts": "2026-06-02T09:19:59.999000Z",
          "closed_ts": "2026-06-02T09:29:59.999000Z",
          "side": "short",
          "entry_price": 69612.75,
          "exit_price": 69395.82857142857,
          "pnl_usd": 1.7061,
          "exit_reason": "tp",
          "proposal_id": "pp_8566a6829aaa03dc6f71543c"
        },
        {
          "opened_ts": "2026-06-02T09:24:59.999000Z",
          "closed_ts": "2026-06-02T09:29:59.999000Z",
          "side": "long",
          "entry_price": 69489.99,
          "exit_price": 69338.94375,
          "pnl_usd": -2.1914,
          "exit_reason": "sl",
          "proposal_id": "pp_d1e9a046fef9bceb1a63b680"
        },
        {
          "opened_ts": "2026-06-02T09:29:59.999000Z",
          "closed_ts": "2026-06-02T09:39:59.999000Z",
          "side": "short",
          "entry_price": 69399.1,
          "exit_price": 69551.73444444445,
          "pnl_usd": -2.2105,
          "exit_reason": "sl",
          "proposal_id": "pp_182580f55868e0ad3e1242c3"
        },
        {
          "opened_ts": "2026-06-02T09:29:59.999000Z",
          "closed_ts": "2026-06-02T10:09:59.999000Z",
          "side": "long",
          "entry_price": 69399.1,
          "exit_price": 69628.05166666668,
          "pnl_usd": 1.9104,
          "exit_reason": "tp",
          "proposal_id": "pp_6016538369a7248fd4d45807"
        },
        {
          "opened_ts": "2026-06-02T09:39:59.999000Z",
          "closed_ts": "2026-06-02T10:14:59.999000Z",
          "side": "long",
          "entry_price": 69475.31,
          "exit_price": 69702.57909090909,
          "pnl_usd": 1.889,
          "exit_reason": "tp",
          "proposal_id": "pp_6016538369a7248fd4d45807"
        },
        {
          "opened_ts": "2026-06-02T10:09:59.999000Z",
          "closed_ts": "2026-06-02T10:24:59.999000Z",
          "side": "long",
          "entry_price": 69636.0,
          "exit_price": 69544.39,
          "pnl_usd": -1.5478,
          "exit_reason": "time_stop",
          "proposal_id": "pp_981c092b48787c76f11ef633"
        },
        {
          "opened_ts": "2026-06-02T10:14:59.999000Z",
          "closed_ts": "2026-06-02T10:29:59.999000Z",
          "side": "short",
          "entry_price": 69657.99,
          "exit_price": 69646.01,
          "pnl_usd": -0.4332,
          "exit_reason": "time_stop",
          "proposal_id": "pp_97133692697e625d742f816c"
        },
        {
          "opened_ts": "2026-06-02T10:29:59.999000Z",
          "closed_ts": "2026-06-02T10:34:59.999000Z",
          "side": "long",
          "entry_price": 69646.01,
          "exit_price": 69504.68785714285,
          "pnl_usd": -1.3913,
          "exit_reason": "sl",
          "proposal_id": "pp_b38edda024e126592abe9305"
        },
        {
          "opened_ts": "2026-06-02T10:24:59.999000Z",
          "closed_ts": "2026-06-02T10:39:59.999000Z",
          "side": "short",
          "entry_price": 69544.39,
          "exit_price": 69496.0,
          "pnl_usd": -0.0382,
          "exit_reason": "time_stop",
          "proposal_id": "pp_9eacb761666be9645ff1a164"
        },
        {
          "opened_ts": "2026-06-02T10:34:59.999000Z",
          "closed_ts": "2026-06-02T10:49:59.999000Z",
          "side": "long",
          "entry_price": 69512.0,
          "exit_price": 69480.0,
          "pnl_usd": -0.9066,
          "exit_reason": "time_stop",
          "proposal_id": "pp_d3cae8adb7a57dfdadaf53ba"
        },
        {
          "opened_ts": "2026-06-02T10:39:59.999000Z",
          "closed_ts": "2026-06-02T10:54:59.999000Z",
          "side": "short",
          "entry_price": 69496.0,
          "exit_price": 69629.87928571428,
          "pnl_usd": -1.5195,
          "exit_reason": "sl",
          "proposal_id": "pp_2ebd4203d9ae986abedc844b"
        },
        {
          "opened_ts": "2026-06-02T10:49:59.999000Z",
          "closed_ts": "2026-06-02T10:54:59.999000Z",
          "side": "short",
          "entry_price": 69480.0,
          "exit_price": 69600.29785714285,
          "pnl_usd": -1.5271,
          "exit_reason": "sl",
          "proposal_id": "pp_cf9ff44cc80dfad4ed118cde"
        },
        {
          "opened_ts": "2026-06-02T10:54:59.999000Z",
          "closed_ts": "2026-06-02T11:09:59.999000Z",
          "side": "long",
          "entry_price": 69662.12,
          "exit_price": 69602.0,
          "pnl_usd": -1.2076,
          "exit_reason": "time_stop",
          "proposal_id": "pp_973a782b527acebae031698c"
        },
        {
          "opened_ts": "2026-06-02T10:54:59.999000Z",
          "closed_ts": "2026-06-02T11:14:59.999000Z",
          "side": "long",
          "entry_price": 69662.12,
          "exit_price": 69533.21642857142,
          "pnl_usd": -1.3333,
          "exit_reason": "sl",
          "proposal_id": "pp_b38edda024e126592abe9305"
        },
        {
          "opened_ts": "2026-06-02T11:09:59.999000Z",
          "closed_ts": "2026-06-02T11:19:59.999000Z",
          "side": "long",
          "entry_price": 69602.0,
          "exit_price": 69482.37357142857,
          "pnl_usd": -1.8478,
          "exit_reason": "sl",
          "proposal_id": "pp_0fa51f71bffc8c488bf879bf"
        },
        {
          "opened_ts": "2026-06-02T11:14:59.999000Z",
          "closed_ts": "2026-06-02T11:19:59.999000Z",
          "side": "long",
          "entry_price": 69552.0,
          "exit_price": 69438.47214285715,
          "pnl_usd": -1.7828,
          "exit_reason": "sl",
          "proposal_id": "pp_410c8f931b13c4dc61f85c71"
        },
        {
          "opened_ts": "2026-06-02T11:19:59.999000Z",
          "closed_ts": "2026-06-02T11:34:59.999000Z",
          "side": "long",
          "entry_price": 69450.01,
          "exit_price": 69430.0,
          "pnl_usd": -0.5418,
          "exit_reason": "time_stop",
          "proposal_id": "pp_6f78b9d03311fc664c6d480a"
        },
        {
          "opened_ts": "2026-06-02T11:34:59.999000Z",
          "closed_ts": "2026-06-02T11:49:59.999000Z",
          "side": "long",
          "entry_price": 69430.0,
          "exit_price": 69536.01,
          "pnl_usd": 0.581,
          "exit_reason": "time_stop",
          "proposal_id": "pp_3a19709bbabaefc8df4f9a58"
        },
        {
          "opened_ts": "2026-06-02T11:49:59.999000Z",
          "closed_ts": "2026-06-02T12:04:59.999000Z",
          "side": "long",
          "entry_price": 69536.01,
          "exit_price": 69447.59642857143,
          "pnl_usd": -1.5119,
          "exit_reason": "sl",
          "proposal_id": "pp_d208d0398022e18d85f3b357"
        },
        {
          "opened_ts": "2026-06-02T11:19:59.999000Z",
          "closed_ts": "2026-06-02T12:09:59.999000Z",
          "side": "long",
          "entry_price": 69450.01,
          "exit_price": 69337.24714285714,
          "pnl_usd": -1.7755,
          "exit_reason": "sl",
          "proposal_id": "pp_03abc67a30a5b249dbc83abf"
        },
        {
          "opened_ts": "2026-06-02T12:04:59.999000Z",
          "closed_ts": "2026-06-02T12:09:59.999000Z",
          "side": "long",
          "entry_price": 69490.01,
          "exit_price": 69397.045,
          "pnl_usd": -1.5612,
          "exit_reason": "sl",
          "proposal_id": "pp_5e7083e872e8206127c4d16a"
        },
        {
          "opened_ts": "2026-06-02T12:09:59.999000Z",
          "closed_ts": "2026-06-02T12:14:59.999000Z",
          "side": "long",
          "entry_price": 69468.63,
          "exit_price": 69364.45928571429,
          "pnl_usd": -1.6815,
          "exit_reason": "sl",
          "proposal_id": "pp_08ad903e1fc3ec38e9e818c0"
        },
        {
          "opened_ts": "2026-06-02T12:09:59.999000Z",
          "closed_ts": "2026-06-02T12:14:59.999000Z",
          "side": "long",
          "entry_price": 69468.63,
          "exit_price": 69364.45928571429,
          "pnl_usd": -1.6814,
          "exit_reason": "sl",
          "proposal_id": "pp_508e2d5dc2617ba5f6ea182a"
        },
        {
          "opened_ts": "2026-06-02T12:14:59.999000Z",
          "closed_ts": "2026-06-02T12:29:59.999000Z",
          "side": "long",
          "entry_price": 69343.99,
          "exit_price": 69286.03,
          "pnl_usd": -1.1388,
          "exit_reason": "time_stop",
          "proposal_id": "pp_cfa86d21f24477f17b7072dd"
        },
        {
          "opened_ts": "2026-06-02T12:14:59.999000Z",
          "closed_ts": "2026-06-02T12:34:59.999000Z",
          "side": "long",
          "entry_price": 69343.99,
          "exit_price": 69234.70071428572,
          "pnl_usd": -1.7378,
          "exit_reason": "sl",
          "proposal_id": "pp_508e2d5dc2617ba5f6ea182a"
        },
        {
          "opened_ts": "2026-06-02T12:29:59.999000Z",
          "closed_ts": "2026-06-02T12:34:59.999000Z",
          "side": "long",
          "entry_price": 69286.03,
          "exit_price": 69165.33571428571,
          "pnl_usd": -1.8615,
          "exit_reason": "sl",
          "proposal_id": "pp_e1b03f12e8e5350cbc823019"
        },
        {
          "opened_ts": "2026-06-02T12:34:59.999000Z",
          "closed_ts": "2026-06-02T12:59:59.999000Z",
          "side": "long",
          "entry_price": 69173.84,
          "exit_price": 69049.76357142857,
          "pnl_usd": -1.8993,
          "exit_reason": "sl",
          "proposal_id": "pp_508e2d5dc2617ba5f6ea182a"
        },
        {
          "opened_ts": "2026-06-02T12:34:59.999000Z",
          "closed_ts": "2026-06-02T13:04:59.999000Z",
          "side": "short",
          "entry_price": 69173.84,
          "exit_price": 68987.72535714286,
          "pnl_usd": 1.4489,
          "exit_reason": "tp",
          "proposal_id": "pp_7d0a55cd12c1952b02119e8e"
        },
        {
          "opened_ts": "2026-06-02T12:59:59.999000Z",
          "closed_ts": "2026-06-02T13:04:59.999000Z",
          "side": "short",
          "entry_price": 69010.42,
          "exit_price": 69145.79357142857,
          "pnl_usd": -2.0241,
          "exit_reason": "sl",
          "proposal_id": "pp_2179ebd632a36a4ec3f30b2d"
        },
        {
          "opened_ts": "2026-06-02T13:04:59.999000Z",
          "closed_ts": "2026-06-02T13:14:59.999000Z",
          "side": "long",
          "entry_price": 69106.01,
          "exit_price": 68959.99571428572,
          "pnl_usd": -2.1367,
          "exit_reason": "sl",
          "proposal_id": "pp_0e933332109cc93d5f7f7584"
        },
        {
          "opened_ts": "2026-06-02T13:04:59.999000Z",
          "closed_ts": "2026-06-02T13:19:59.999000Z",
          "side": "short",
          "entry_price": 69106.01,
          "exit_price": 68886.98857142856,
          "pnl_usd": 1.3864,
          "exit_reason": "tp",
          "proposal_id": "pp_dab2203b7ef23ae478044844"
        },
        {
          "opened_ts": "2026-06-02T13:19:59.999000Z",
          "closed_ts": "2026-06-02T13:34:59.999000Z",
          "side": "short",
          "entry_price": 68994.0,
          "exit_price": 68957.1,
          "pnl_usd": -0.1606,
          "exit_reason": "time_stop",
          "proposal_id": "pp_dfe49ac1d542a863cb1d283b"
        },
        {
          "opened_ts": "2026-06-02T13:34:59.999000Z",
          "closed_ts": "2026-06-02T13:39:59.999000Z",
          "side": "long",
          "entry_price": 68957.1,
          "exit_price": 68817.20142857144,
          "pnl_usd": -2.0733,
          "exit_reason": "sl",
          "proposal_id": "pp_31ea8ada37642566fa662ce2"
        },
        {
          "opened_ts": "2026-06-02T13:14:59.999000Z",
          "closed_ts": "2026-06-02T13:44:59.999000Z",
          "side": "long",
          "entry_price": 68918.81,
          "exit_price": 68770.98642857143,
          "pnl_usd": -2.16,
          "exit_reason": "sl",
          "proposal_id": "pp_0e933332109cc93d5f7f7584"
        },
        {
          "opened_ts": "2026-06-02T13:39:59.999000Z",
          "closed_ts": "2026-06-02T13:54:59.999000Z",
          "side": "long",
          "entry_price": 68880.71,
          "exit_price": 68795.93,
          "pnl_usd": -1.4776,
          "exit_reason": "time_stop",
          "proposal_id": "pp_fbea59e4e8c10d86903fb9c2"
        },
        {
          "opened_ts": "2026-06-02T13:44:59.999000Z",
          "closed_ts": "2026-06-02T13:59:59.999000Z",
          "side": "long",
          "entry_price": 68879.76,
          "exit_price": 68811.91,
          "pnl_usd": -0.958,
          "exit_reason": "time_stop",
          "proposal_id": "pp_4db045ab847cda6934590216"
        },
        {
          "opened_ts": "2026-06-02T13:54:59.999000Z",
          "closed_ts": "2026-06-02T14:04:59.999000Z",
          "side": "long",
          "entry_price": 68795.93,
          "exit_price": 68648.78428571428,
          "pnl_usd": -2.1007,
          "exit_reason": "sl",
          "proposal_id": "pp_3ae6927c75c6780439243338"
        },
        {
          "opened_ts": "2026-06-02T13:59:59.999000Z",
          "closed_ts": "2026-06-02T14:09:59.999000Z",
          "side": "short",
          "entry_price": 68811.91,
          "exit_price": 68596.67392857143,
          "pnl_usd": 1.7727,
          "exit_reason": "tp",
          "proposal_id": "pp_2746cd7b87a8e3f9d67106f0"
        },
        {
          "opened_ts": "2026-06-02T14:04:59.999000Z",
          "closed_ts": "2026-06-02T14:09:59.999000Z",
          "side": "long",
          "entry_price": 68635.99,
          "exit_price": 68481.21285714286,
          "pnl_usd": -2.2396,
          "exit_reason": "sl",
          "proposal_id": "pp_7ba26b1a2ed865b150b879a3"
        },
        {
          "opened_ts": "2026-06-02T14:09:59.999000Z",
          "closed_ts": "2026-06-02T14:14:59.999000Z",
          "side": "long",
          "entry_price": 68433.5,
          "exit_price": 68687.45535714286,
          "pnl_usd": 2.2065,
          "exit_reason": "tp",
          "proposal_id": "pp_e32659ebcfb4439c97a1cdd6"
        },
        {
          "opened_ts": "2026-06-02T14:09:59.999000Z",
          "closed_ts": "2026-06-02T14:14:59.999000Z",
          "side": "short",
          "entry_price": 68433.5,
          "exit_price": 68602.80357142857,
          "pnl_usd": -2.4024,
          "exit_reason": "sl",
          "proposal_id": "pp_7d0a55cd12c1952b02119e8e"
        },
        {
          "opened_ts": "2026-06-02T14:14:59.999000Z",
          "closed_ts": "2026-06-02T14:19:59.999000Z",
          "side": "short",
          "entry_price": 68584.0,
          "exit_price": 68314.58928571429,
          "pnl_usd": 1.5896,
          "exit_reason": "tp",
          "proposal_id": "pp_24e27ddba51a6aebd368bce6"
        },
        {
          "opened_ts": "2026-06-02T14:14:59.999000Z",
          "closed_ts": "2026-06-02T14:19:59.999000Z",
          "side": "long",
          "entry_price": 68584.0,
          "exit_price": 68404.39285714286,
          "pnl_usd": -2.51,
          "exit_reason": "sl",
          "proposal_id": "pp_e32659ebcfb4439c97a1cdd6"
        },
        {
          "opened_ts": "2026-06-02T14:19:59.999000Z",
          "closed_ts": "2026-06-02T14:24:59.999000Z",
          "side": "long",
          "entry_price": 68333.36,
          "exit_price": 68143.53,
          "pnl_usd": -2.6282,
          "exit_reason": "sl",
          "proposal_id": "pp_4c6c8df4398f67ef8fbcf40d"
        },
        {
          "opened_ts": "2026-06-02T14:19:59.999000Z",
          "closed_ts": "2026-06-02T14:24:59.999000Z",
          "side": "long",
          "entry_price": 68333.36,
          "exit_price": 68143.53,
          "pnl_usd": -2.6281,
          "exit_reason": "sl",
          "proposal_id": "pp_e32659ebcfb4439c97a1cdd6"
        },
        {
          "opened_ts": "2026-06-02T14:24:59.999000Z",
          "closed_ts": "2026-06-02T14:29:59.999000Z",
          "side": "short",
          "entry_price": 68006.32,
          "exit_price": 67691.51607142857,
          "pnl_usd": 2.0467,
          "exit_reason": "tp",
          "proposal_id": "pp_8d902578fa5c1b3166c24d23"
        },
        {
          "opened_ts": "2026-06-02T14:24:59.999000Z",
          "closed_ts": "2026-06-02T14:29:59.999000Z",
          "side": "long",
          "entry_price": 68006.32,
          "exit_price": 67796.45071428572,
          "pnl_usd": -2.8557,
          "exit_reason": "sl",
          "proposal_id": "pp_e32659ebcfb4439c97a1cdd6"
        },
        {
          "opened_ts": "2026-06-02T14:29:59.999000Z",
          "closed_ts": "2026-06-02T14:34:59.999000Z",
          "side": "short",
          "entry_price": 67884.28,
          "exit_price": 68116.34285714285,
          "pnl_usd": -3.1028,
          "exit_reason": "sl",
          "proposal_id": "pp_b164f2686e287d2f52a5005e"
        },
        {
          "opened_ts": "2026-06-02T14:29:59.999000Z",
          "closed_ts": "2026-06-02T14:39:59.999000Z",
          "side": "long",
          "entry_price": 67884.28,
          "exit_price": 68232.37428571428,
          "pnl_usd": 3.2584,
          "exit_reason": "tp",
          "proposal_id": "pp_e32659ebcfb4439c97a1cdd6"
        },
        {
          "opened_ts": "2026-06-02T14:34:59.999000Z",
          "closed_ts": "2026-06-02T14:49:59.999000Z",
          "side": "short",
          "entry_price": 68069.72,
          "exit_price": 68246.51,
          "pnl_usd": -1.972,
          "exit_reason": "time_stop",
          "proposal_id": "pp_5b215005c1416c68f5aa4f28"
        },
        {
          "opened_ts": "2026-06-02T14:39:59.999000Z",
          "closed_ts": "2026-06-02T14:54:59.999000Z",
          "side": "long",
          "entry_price": 68084.0,
          "exit_price": 68102.09,
          "pnl_usd": -0.3604,
          "exit_reason": "time_stop",
          "proposal_id": "pp_ba215339cb8dec1a74a981b6"
        },
        {
          "opened_ts": "2026-06-02T14:49:59.999000Z",
          "closed_ts": "2026-06-02T15:04:59.999000Z",
          "side": "short",
          "entry_price": 68246.51,
          "exit_price": 67856.56571428571,
          "pnl_usd": 2.6771,
          "exit_reason": "tp",
          "proposal_id": "pp_134e8d8a7333f5c1b6eb9dd0"
        },
        {
          "opened_ts": "2026-06-02T14:54:59.999000Z",
          "closed_ts": "2026-06-02T15:09:59.999000Z",
          "side": "short",
          "entry_price": 68102.09,
          "exit_price": 68004.01,
          "pnl_usd": 0.5135,
          "exit_reason": "time_stop",
          "proposal_id": "pp_b3f85dbab5d30f8788975fd4"
        },
        {
          "opened_ts": "2026-06-02T15:04:59.999000Z",
          "closed_ts": "2026-06-02T15:19:59.999000Z",
          "side": "short",
          "entry_price": 67930.47,
          "exit_price": 67703.23,
          "pnl_usd": 1.5182,
          "exit_reason": "time_stop",
          "proposal_id": "pp_9d0b8ce05b184981c7820c73"
        },
        {
          "opened_ts": "2026-06-02T15:09:59.999000Z",
          "closed_ts": "2026-06-02T15:24:59.999000Z",
          "side": "short",
          "entry_price": 68004.01,
          "exit_price": 67592.845,
          "pnl_usd": 3.2621,
          "exit_reason": "tp",
          "proposal_id": "pp_fb47cacc5a4ec2e4b8a7aaf2"
        },
        {
          "opened_ts": "2026-06-02T15:19:59.999000Z",
          "closed_ts": "2026-06-02T15:34:59.999000Z",
          "side": "short",
          "entry_price": 67703.23,
          "exit_price": 67304.61035714285,
          "pnl_usd": 3.0357,
          "exit_reason": "tp",
          "proposal_id": "pp_0f37762f9d1dd7511b3e608a"
        },
        {
          "opened_ts": "2026-06-02T15:24:59.999000Z",
          "closed_ts": "2026-06-02T15:34:59.999000Z",
          "side": "long",
          "entry_price": 67599.11,
          "exit_price": 67342.70357142857,
          "pnl_usd": -2.5091,
          "exit_reason": "sl",
          "proposal_id": "pp_0ed2c508cb806810235d20c3"
        },
        {
          "opened_ts": "2026-06-02T15:34:59.999000Z",
          "closed_ts": "2026-06-02T15:49:59.999000Z",
          "side": "short",
          "entry_price": 67246.92,
          "exit_price": 67492.53357142858,
          "pnl_usd": -3.2773,
          "exit_reason": "sl",
          "proposal_id": "pp_7d0a55cd12c1952b02119e8e"
        },
        {
          "opened_ts": "2026-06-02T15:49:59.999000Z",
          "closed_ts": "2026-06-02T16:04:59.999000Z",
          "side": "long",
          "entry_price": 67174.23,
          "exit_price": 67436.56,
          "pnl_usd": 2.3479,
          "exit_reason": "time_stop",
          "proposal_id": "pp_27ebef85b84ffaa9d596c89a"
        },
        {
          "opened_ts": "2026-06-02T15:34:59.999000Z",
          "closed_ts": "2026-06-02T16:14:59.999000Z",
          "side": "long",
          "entry_price": 67246.92,
          "exit_price": 67615.34035714286,
          "pnl_usd": 2.6116,
          "exit_reason": "tp",
          "proposal_id": "pp_0ed2c508cb806810235d20c3"
        },
        {
          "opened_ts": "2026-06-02T16:04:59.999000Z",
          "closed_ts": "2026-06-02T16:14:59.999000Z",
          "side": "short",
          "entry_price": 67436.56,
          "exit_price": 67654.28142857143,
          "pnl_usd": -2.1917,
          "exit_reason": "sl",
          "proposal_id": "pp_1d3e232cedbf13a3cd5604c0"
        },
        {
          "opened_ts": "2026-06-02T16:14:59.999000Z",
          "closed_ts": "2026-06-02T16:29:59.999000Z",
          "side": "short",
          "entry_price": 67928.45,
          "exit_price": 67863.72,
          "pnl_usd": 0.1502,
          "exit_reason": "time_stop",
          "proposal_id": "pp_c77bf31e86820984943ed404"
        },
        {
          "opened_ts": "2026-06-02T16:14:59.999000Z",
          "closed_ts": "2026-06-02T16:39:59.999000Z",
          "side": "short",
          "entry_price": 67928.45,
          "exit_price": 67571.02892857142,
          "pnl_usd": 2.4853,
          "exit_reason": "tp",
          "proposal_id": "pp_1d3e232cedbf13a3cd5604c0"
        },
        {
          "opened_ts": "2026-06-02T16:29:59.999000Z",
          "closed_ts": "2026-06-02T16:39:59.999000Z",
          "side": "long",
          "entry_price": 67863.72,
          "exit_price": 67615.77214285714,
          "pnl_usd": -2.5538,
          "exit_reason": "sl",
          "proposal_id": "pp_570915decf0f60f131863865"
        },
        {
          "opened_ts": "2026-06-02T16:39:59.999000Z",
          "closed_ts": "2026-06-02T16:54:59.999000Z",
          "side": "long",
          "entry_price": 67610.0,
          "exit_price": 67545.67,
          "pnl_usd": -1.1131,
          "exit_reason": "time_stop",
          "proposal_id": "pp_df07cc1857ac374e5c8f6d2b"
        },
        {
          "opened_ts": "2026-06-02T16:54:59.999000Z",
          "closed_ts": "2026-06-02T17:09:59.999000Z",
          "side": "long",
          "entry_price": 67545.67,
          "exit_price": 67446.89,
          "pnl_usd": -1.6461,
          "exit_reason": "time_stop",
          "proposal_id": "pp_31fe94f68bdb38adabb57cf8"
        },
        {
          "opened_ts": "2026-06-02T17:09:59.999000Z",
          "closed_ts": "2026-06-02T17:24:59.999000Z",
          "side": "long",
          "entry_price": 67446.89,
          "exit_price": 67780.76107142857,
          "pnl_usd": 3.1243,
          "exit_reason": "tp",
          "proposal_id": "pp_e33de7783bb8abed0897945c"
        },
        {
          "opened_ts": "2026-06-02T17:24:59.999000Z",
          "closed_ts": "2026-06-02T17:34:59.999000Z",
          "side": "long",
          "entry_price": 67801.53,
          "exit_price": 67611.06428571428,
          "pnl_usd": -2.6482,
          "exit_reason": "sl",
          "proposal_id": "pp_22fc585d707dd7fa556d6c4f"
        },
        {
          "opened_ts": "2026-06-02T17:34:59.999000Z",
          "closed_ts": "2026-06-02T17:49:59.999000Z",
          "side": "long",
          "entry_price": 67622.01,
          "exit_price": 67449.775,
          "pnl_usd": -2.4524,
          "exit_reason": "sl",
          "proposal_id": "pp_eca1656a72f95cdfa17f25e5"
        },
        {
          "opened_ts": "2026-06-02T17:49:59.999000Z",
          "closed_ts": "2026-06-02T18:29:59.999000Z",
          "side": "long",
          "entry_price": 67454.44,
          "exit_price": 67289.06214285715,
          "pnl_usd": -2.3807,
          "exit_reason": "sl",
          "proposal_id": "pp_5454f9f3b1cff368516ba0a9"
        },
        {
          "opened_ts": "2026-06-02T16:39:59.999000Z",
          "closed_ts": "2026-06-02T18:34:59.999000Z",
          "side": "short",
          "entry_price": 67610.0,
          "exit_price": 67254.75392857143,
          "pnl_usd": 2.481,
          "exit_reason": "tp",
          "proposal_id": "pp_1d3e232cedbf13a3cd5604c0"
        },
        {
          "opened_ts": "2026-06-02T18:34:59.999000Z",
          "closed_ts": "2026-06-02T18:49:59.999000Z",
          "side": "short",
          "entry_price": 67290.02,
          "exit_price": 67286.0,
          "pnl_usd": -0.3526,
          "exit_reason": "time_stop",
          "proposal_id": "pp_ff568759edaf3178854e1c20"
        },
        {
          "opened_ts": "2026-06-02T18:29:59.999000Z",
          "closed_ts": "2026-06-02T18:54:59.999000Z",
          "side": "long",
          "entry_price": 67301.56,
          "exit_price": 67169.3607142857,
          "pnl_usd": -2.0177,
          "exit_reason": "sl",
          "proposal_id": "pp_7f41698ed7cecfb835e566a1"
        },
        {
          "opened_ts": "2026-06-02T18:49:59.999000Z",
          "closed_ts": "2026-06-02T18:54:59.999000Z",
          "side": "long",
          "entry_price": 67286.0,
          "exit_price": 67171.86357142858,
          "pnl_usd": -1.8187,
          "exit_reason": "sl",
          "proposal_id": "pp_0a7cbef450f9415c134bebab"
        },
        {
          "opened_ts": "2026-06-02T18:54:59.999000Z",
          "closed_ts": "2026-06-02T18:59:59.999000Z",
          "side": "long",
          "entry_price": 67124.21,
          "exit_price": 67293.51821428572,
          "pnl_usd": 1.3171,
          "exit_reason": "tp",
          "proposal_id": "pp_e279b5c62f277e24e9d736fe"
        },
        {
          "opened_ts": "2026-06-02T18:54:59.999000Z",
          "closed_ts": "2026-06-02T18:59:59.999000Z",
          "side": "long",
          "entry_price": 67124.21,
          "exit_price": 67293.51821428572,
          "pnl_usd": 1.317,
          "exit_reason": "tp",
          "proposal_id": "pp_7f41698ed7cecfb835e566a1"
        },
        {
          "opened_ts": "2026-06-02T18:59:59.999000Z",
          "closed_ts": "2026-06-02T19:14:59.999000Z",
          "side": "short",
          "entry_price": 67341.99,
          "exit_price": 67344.89,
          "pnl_usd": -0.3959,
          "exit_reason": "time_stop",
          "proposal_id": "pp_c6cee2d67331e1dc28fe2745"
        },
        {
          "opened_ts": "2026-06-02T18:59:59.999000Z",
          "closed_ts": "2026-06-02T19:19:59.999000Z",
          "side": "long",
          "entry_price": 67341.99,
          "exit_price": 67219.07,
          "pnl_usd": -1.914,
          "exit_reason": "sl",
          "proposal_id": "pp_7f41698ed7cecfb835e566a1"
        },
        {
          "opened_ts": "2026-06-02T19:14:59.999000Z",
          "closed_ts": "2026-06-02T19:19:59.999000Z",
          "side": "long",
          "entry_price": 67344.89,
          "exit_price": 67217.75571428571,
          "pnl_usd": -1.9603,
          "exit_reason": "sl",
          "proposal_id": "pp_1f142488646cc548ca99ea13"
        },
        {
          "opened_ts": "2026-06-02T19:19:59.999000Z",
          "closed_ts": "2026-06-02T19:29:59.999000Z",
          "side": "long",
          "entry_price": 67183.62,
          "exit_price": 67049.98357142857,
          "pnl_usd": -2.0346,
          "exit_reason": "sl",
          "proposal_id": "pp_1c69e347bdc8c91f4b8d3ffb"
        },
        {
          "opened_ts": "2026-06-02T19:19:59.999000Z",
          "closed_ts": "2026-06-02T19:29:59.999000Z",
          "side": "long",
          "entry_price": 67183.62,
          "exit_price": 67049.98357142857,
          "pnl_usd": -2.0345,
          "exit_reason": "sl",
          "proposal_id": "pp_e4a970f1d2c9eab7f39144f0"
        },
        {
          "opened_ts": "2026-06-02T19:29:59.999000Z",
          "closed_ts": "2026-06-02T19:34:59.999000Z",
          "side": "short",
          "entry_price": 66978.2,
          "exit_price": 66752.44571428571,
          "pnl_usd": 1.6802,
          "exit_reason": "tp",
          "proposal_id": "pp_5c280ac8557265a6bb6f93d8"
        },
        {
          "opened_ts": "2026-06-02T19:29:59.999000Z",
          "closed_ts": "2026-06-02T19:34:59.999000Z",
          "side": "long",
          "entry_price": 66978.2,
          "exit_price": 66827.69714285714,
          "pnl_usd": -2.225,
          "exit_reason": "sl",
          "proposal_id": "pp_e4a970f1d2c9eab7f39144f0"
        },
        {
          "opened_ts": "2026-06-02T19:34:59.999000Z",
          "closed_ts": "2026-06-02T19:39:59.999000Z",
          "side": "short",
          "entry_price": 66590.0,
          "exit_price": 66771.45857142858,
          "pnl_usd": -2.4847,
          "exit_reason": "sl",
          "proposal_id": "pp_397a3275c9a649ef43cc8d89"
        },
        {
          "opened_ts": "2026-06-02T19:34:59.999000Z",
          "closed_ts": "2026-06-02T19:44:59.999000Z",
          "side": "long",
          "entry_price": 66590.0,
          "exit_price": 66862.18785714285,
          "pnl_usd": 2.4773,
          "exit_reason": "tp",
          "proposal_id": "pp_e4a970f1d2c9eab7f39144f0"
        },
        {
          "opened_ts": "2026-06-02T19:39:59.999000Z",
          "closed_ts": "2026-06-02T19:44:59.999000Z",
          "side": "short",
          "entry_price": 66773.66,
          "exit_price": 66960.28214285715,
          "pnl_usd": -2.6288,
          "exit_reason": "sl",
          "proposal_id": "pp_d80d0a0fbfd1ec814f093c70"
        },
        {
          "opened_ts": "2026-06-02T19:44:59.999000Z",
          "closed_ts": "2026-06-02T19:54:59.999000Z",
          "side": "long",
          "entry_price": 66925.61,
          "exit_price": 67228.6475,
          "pnl_usd": 2.8032,
          "exit_reason": "tp",
          "proposal_id": "pp_e8101f2e13aeb7cfa1bf4348"
        },
        {
          "opened_ts": "2026-06-02T19:44:59.999000Z",
          "closed_ts": "2026-06-02T19:54:59.999000Z",
          "side": "long",
          "entry_price": 66925.61,
          "exit_price": 67228.6475,
          "pnl_usd": 2.803,
          "exit_reason": "tp",
          "proposal_id": "pp_e4a970f1d2c9eab7f39144f0"
        },
        {
          "opened_ts": "2026-06-02T19:54:59.999000Z",
          "closed_ts": "2026-06-02T20:09:59.999000Z",
          "side": "short",
          "entry_price": 67202.0,
          "exit_price": 67436.795,
          "pnl_usd": -2.7782,
          "exit_reason": "sl",
          "proposal_id": "pp_a4cd423b9e6caa8813416b6b"
        },
        {
          "opened_ts": "2026-06-02T20:09:59.999000Z",
          "closed_ts": "2026-06-02T20:19:59.999000Z",
          "side": "long",
          "entry_price": 67441.45,
          "exit_price": 67203.89571428571,
          "pnl_usd": -3.1702,
          "exit_reason": "sl",
          "proposal_id": "pp_8eb827056126d9561144b5f8"
        },
        {
          "opened_ts": "2026-06-02T19:54:59.999000Z",
          "closed_ts": "2026-06-02T20:24:59.999000Z",
          "side": "long",
          "entry_price": 67202.0,
          "exit_price": 66967.205,
          "pnl_usd": -3.1501,
          "exit_reason": "sl",
          "proposal_id": "pp_e4a970f1d2c9eab7f39144f0"
        },
        {
          "opened_ts": "2026-06-02T20:19:59.999000Z",
          "closed_ts": "2026-06-02T20:34:59.999000Z",
          "side": "long",
          "entry_price": 67135.99,
          "exit_price": 67186.0,
          "pnl_usd": -0.0038,
          "exit_reason": "time_stop",
          "proposal_id": "pp_072fdc6fd7d893f9362287ba"
        },
        {
          "opened_ts": "2026-06-02T20:24:59.999000Z",
          "closed_ts": "2026-06-02T20:49:59.999000Z",
          "side": "long",
          "entry_price": 67019.98,
          "exit_price": 67403.05428571427,
          "pnl_usd": 3.682,
          "exit_reason": "tp",
          "proposal_id": "pp_679b0bbe082bc93de4271c3f"
        },
        {
          "opened_ts": "2026-06-02T20:34:59.999000Z",
          "closed_ts": "2026-06-02T20:49:59.999000Z",
          "side": "short",
          "entry_price": 67186.0,
          "exit_price": 67456.7357142857,
          "pnl_usd": -3.0573,
          "exit_reason": "sl",
          "proposal_id": "pp_58da8652ffc969f1afda5d32"
        },
        {
          "opened_ts": "2026-06-02T20:49:59.999000Z",
          "closed_ts": "2026-06-02T21:04:59.999000Z",
          "side": "short",
          "entry_price": 67490.0,
          "exit_price": 67576.0,
          "pnl_usd": -1.2404,
          "exit_reason": "time_stop",
          "proposal_id": "pp_676ad9ac84ccf09c66763417"
        },
        {
          "opened_ts": "2026-06-02T21:04:59.999000Z",
          "closed_ts": "2026-06-02T21:19:59.999000Z",
          "side": "long",
          "entry_price": 67576.0,
          "exit_price": 67689.99,
          "pnl_usd": 0.6945,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f2cb867e1fac5d6062608f2b"
        },
        {
          "opened_ts": "2026-06-02T20:49:59.999000Z",
          "closed_ts": "2026-06-02T21:29:59.999000Z",
          "side": "long",
          "entry_price": 67490.0,
          "exit_price": 67824.93285714285,
          "pnl_usd": 3.1233,
          "exit_reason": "tp",
          "proposal_id": "pp_679b0bbe082bc93de4271c3f"
        },
        {
          "opened_ts": "2026-06-02T21:19:59.999000Z",
          "closed_ts": "2026-06-02T21:29:59.999000Z",
          "side": "short",
          "entry_price": 67689.99,
          "exit_price": 67886.77428571429,
          "pnl_usd": -2.2177,
          "exit_reason": "sl",
          "proposal_id": "pp_40456aeeea627ccd1d67ba91"
        },
        {
          "opened_ts": "2026-06-02T21:29:59.999000Z",
          "closed_ts": "2026-06-02T21:44:59.999000Z",
          "side": "short",
          "entry_price": 67887.99,
          "exit_price": 67732.0,
          "pnl_usd": 0.9905,
          "exit_reason": "time_stop",
          "proposal_id": "pp_0bd65c072fd1713887a8b37f"
        },
        {
          "opened_ts": "2026-06-02T21:29:59.999000Z",
          "closed_ts": "2026-06-02T21:49:59.999000Z",
          "side": "short",
          "entry_price": 67887.99,
          "exit_price": 67609.74214285715,
          "pnl_usd": 2.0306,
          "exit_reason": "tp",
          "proposal_id": "pp_40456aeeea627ccd1d67ba91"
        },
        {
          "opened_ts": "2026-06-02T21:44:59.999000Z",
          "closed_ts": "2026-06-02T21:54:59.999000Z",
          "side": "long",
          "entry_price": 67732.0,
          "exit_price": 67576.01214285714,
          "pnl_usd": -2.2633,
          "exit_reason": "sl",
          "proposal_id": "pp_daa6b8adf290765b2bb05ccb"
        },
        {
          "opened_ts": "2026-06-02T21:49:59.999000Z",
          "closed_ts": "2026-06-02T22:04:59.999000Z",
          "side": "long",
          "entry_price": 67609.02,
          "exit_price": 67452.86357142858,
          "pnl_usd": -2.2686,
          "exit_reason": "sl",
          "proposal_id": "pp_c6e4f3cd323370847214ec37"
        },
        {
          "opened_ts": "2026-06-02T21:54:59.999000Z",
          "closed_ts": "2026-06-02T22:04:59.999000Z",
          "side": "long",
          "entry_price": 67526.0,
          "exit_price": 67367.13571428572,
          "pnl_usd": -1.717,
          "exit_reason": "sl",
          "proposal_id": "pp_a3258f9ce8b71a5dbac27a2e"
        },
        {
          "opened_ts": "2026-06-02T22:04:59.999000Z",
          "closed_ts": "2026-06-02T22:19:59.999000Z",
          "side": "long",
          "entry_price": 67369.99,
          "exit_price": 67212.65571428572,
          "pnl_usd": -2.2859,
          "exit_reason": "sl",
          "proposal_id": "pp_b8a4518b02d9556d9ac81313"
        },
        {
          "opened_ts": "2026-06-02T22:04:59.999000Z",
          "closed_ts": "2026-06-02T22:19:59.999000Z",
          "side": "short",
          "entry_price": 67369.99,
          "exit_price": 67133.98857142858,
          "pnl_usd": 2.0396,
          "exit_reason": "tp",
          "proposal_id": "pp_d94c4db79603d11d71475527"
        },
        {
          "opened_ts": "2026-06-02T22:19:59.999000Z",
          "closed_ts": "2026-06-02T22:24:59.999000Z",
          "side": "short",
          "entry_price": 67059.25,
          "exit_price": 67229.55,
          "pnl_usd": -1.9987,
          "exit_reason": "sl",
          "proposal_id": "pp_510db9d4ff05170e141feb77"
        },
        {
          "opened_ts": "2026-06-02T22:19:59.999000Z",
          "closed_ts": "2026-06-02T22:24:59.999000Z",
          "side": "short",
          "entry_price": 67059.25,
          "exit_price": 67229.55,
          "pnl_usd": -2.4367,
          "exit_reason": "sl",
          "proposal_id": "pp_d94c4db79603d11d71475527"
        },
        {
          "opened_ts": "2026-06-02T22:24:59.999000Z",
          "closed_ts": "2026-06-02T22:34:59.999000Z",
          "side": "short",
          "entry_price": 67370.0,
          "exit_price": 67102.3025,
          "pnl_usd": 2.1257,
          "exit_reason": "tp",
          "proposal_id": "pp_388ac9ba52fb76bc902ca03d"
        },
        {
          "opened_ts": "2026-06-02T22:24:59.999000Z",
          "closed_ts": "2026-06-02T22:34:59.999000Z",
          "side": "short",
          "entry_price": 67370.0,
          "exit_price": 67102.3025,
          "pnl_usd": 2.3865,
          "exit_reason": "tp",
          "proposal_id": "pp_d94c4db79603d11d71475527"
        },
        {
          "opened_ts": "2026-06-02T22:34:59.999000Z",
          "closed_ts": "2026-06-02T22:44:59.999000Z",
          "side": "long",
          "entry_price": 67061.64,
          "exit_price": 66879.82142857142,
          "pnl_usd": -2.5635,
          "exit_reason": "sl",
          "proposal_id": "pp_588e0b980bb82343b9a37279"
        },
        {
          "opened_ts": "2026-06-02T22:34:59.999000Z",
          "closed_ts": "2026-06-02T22:49:59.999000Z",
          "side": "short",
          "entry_price": 67061.64,
          "exit_price": 66788.91214285714,
          "pnl_usd": 2.4564,
          "exit_reason": "tp",
          "proposal_id": "pp_d94c4db79603d11d71475527"
        },
        {
          "opened_ts": "2026-06-02T22:44:59.999000Z",
          "closed_ts": "2026-06-02T22:49:59.999000Z",
          "side": "short",
          "entry_price": 66956.01,
          "exit_price": 66667.00392857142,
          "pnl_usd": 2.4546,
          "exit_reason": "tp",
          "proposal_id": "pp_b9f174e833f1a1439ada5cc7"
        },
        {
          "opened_ts": "2026-06-02T22:49:59.999000Z",
          "closed_ts": "2026-06-02T22:54:59.999000Z",
          "side": "long",
          "entry_price": 66760.01,
          "exit_price": 66551.54714285713,
          "pnl_usd": -2.8684,
          "exit_reason": "sl",
          "proposal_id": "pp_486ba5952cbfba7304a7ae5b"
        },
        {
          "opened_ts": "2026-06-02T22:49:59.999000Z",
          "closed_ts": "2026-06-02T22:54:59.999000Z",
          "side": "short",
          "entry_price": 66760.01,
          "exit_price": 66447.31571428571,
          "pnl_usd": 2.9136,
          "exit_reason": "tp",
          "proposal_id": "pp_d94c4db79603d11d71475527"
        },
        {
          "opened_ts": "2026-06-02T22:54:59.999000Z",
          "closed_ts": "2026-06-02T23:04:59.999000Z",
          "side": "short",
          "entry_price": 66575.41,
          "exit_price": 66224.70785714286,
          "pnl_usd": 2.6739,
          "exit_reason": "tp",
          "proposal_id": "pp_f6b9f403161355894a504f1d"
        },
        {
          "opened_ts": "2026-06-02T22:54:59.999000Z",
          "closed_ts": "2026-06-02T23:04:59.999000Z",
          "side": "short",
          "entry_price": 66575.41,
          "exit_price": 66224.70785714286,
          "pnl_usd": 3.3458,
          "exit_reason": "tp",
          "proposal_id": "pp_d94c4db79603d11d71475527"
        },
        {
          "opened_ts": "2026-06-02T23:04:59.999000Z",
          "closed_ts": "2026-06-02T23:09:59.999000Z",
          "side": "short",
          "entry_price": 66325.07,
          "exit_price": 66590.4542857143,
          "pnl_usd": -2.6419,
          "exit_reason": "sl",
          "proposal_id": "pp_d4403cd58586c8c0e31047fc"
        },
        {
          "opened_ts": "2026-06-02T23:04:59.999000Z",
          "closed_ts": "2026-06-02T23:19:59.999000Z",
          "side": "long",
          "entry_price": 66325.07,
          "exit_price": 66723.14642857143,
          "pnl_usd": 2.7224,
          "exit_reason": "tp",
          "proposal_id": "pp_d20d7894900030cf3c7d0fb6"
        },
        {
          "opened_ts": "2026-06-02T23:09:59.999000Z",
          "closed_ts": "2026-06-02T23:29:59.999000Z",
          "side": "long",
          "entry_price": 66482.0,
          "exit_price": 66199.63428571429,
          "pnl_usd": -2.5896,
          "exit_reason": "sl",
          "proposal_id": "pp_d20d7894900030cf3c7d0fb6"
        },
        {
          "opened_ts": "2026-06-02T23:19:59.999000Z",
          "closed_ts": "2026-06-02T23:34:59.999000Z",
          "side": "short",
          "entry_price": 66538.0,
          "exit_price": 66548.01,
          "pnl_usd": -0.6671,
          "exit_reason": "time_stop",
          "proposal_id": "pp_fc69b19dfc871ae0d73f07ba"
        },
        {
          "opened_ts": "2026-06-02T23:29:59.999000Z",
          "closed_ts": "2026-06-02T23:44:59.999000Z",
          "side": "short",
          "entry_price": 66443.99,
          "exit_price": 66724.34,
          "pnl_usd": -3.0685,
          "exit_reason": "time_stop",
          "proposal_id": "pp_b7b527976cd36edfd2bc9a9c"
        },
        {
          "opened_ts": "2026-06-02T23:34:59.999000Z",
          "closed_ts": "2026-06-02T23:49:59.999000Z",
          "side": "long",
          "entry_price": 66548.01,
          "exit_price": 66777.63,
          "pnl_usd": 1.4967,
          "exit_reason": "time_stop",
          "proposal_id": "pp_9d260ddeb1f4a1a052eb7978"
        },
        {
          "opened_ts": "2026-06-02T23:44:59.999000Z",
          "closed_ts": "2026-06-02T23:59:59.999000Z",
          "side": "long",
          "entry_price": 66724.34,
          "exit_price": 66760.83,
          "pnl_usd": -0.1504,
          "exit_reason": "time_stop",
          "proposal_id": "pp_0cd249e7dde491fe13f80607"
        },
        {
          "opened_ts": "2026-06-02T23:49:59.999000Z",
          "closed_ts": "2026-06-03T00:04:59.999000Z",
          "side": "short",
          "entry_price": 66777.63,
          "exit_price": 66744.56,
          "pnl_usd": -0.1886,
          "exit_reason": "time_stop",
          "proposal_id": "pp_67837b35e735644a2934b4e0"
        },
        {
          "opened_ts": "2026-06-02T23:59:59.999000Z",
          "closed_ts": "2026-06-03T00:14:59.999000Z",
          "side": "short",
          "entry_price": 66760.83,
          "exit_price": 66822.01,
          "pnl_usd": -1.2337,
          "exit_reason": "time_stop",
          "proposal_id": "pp_3a4a4affd135fdcced51c4c4"
        },
        {
          "opened_ts": "2026-06-03T00:04:59.999000Z",
          "closed_ts": "2026-06-03T00:19:59.999000Z",
          "side": "short",
          "entry_price": 66744.56,
          "exit_price": 66991.32714285715,
          "pnl_usd": -3.0707,
          "exit_reason": "sl",
          "proposal_id": "pp_44301e431823a171fe550284"
        },
        {
          "opened_ts": "2026-06-03T00:14:59.999000Z",
          "closed_ts": "2026-06-03T00:19:59.999000Z",
          "side": "short",
          "entry_price": 66822.01,
          "exit_price": 67042.56571428571,
          "pnl_usd": -2.9981,
          "exit_reason": "sl",
          "proposal_id": "pp_91bbe93fe3e6f548a4fc5e86"
        },
        {
          "opened_ts": "2026-06-03T00:19:59.999000Z",
          "closed_ts": "2026-06-03T00:24:59.999000Z",
          "side": "long",
          "entry_price": 67085.72,
          "exit_price": 66870.05357142858,
          "pnl_usd": -2.9324,
          "exit_reason": "sl",
          "proposal_id": "pp_15e60d427fd4585026dad0b4"
        },
        {
          "opened_ts": "2026-06-03T00:19:59.999000Z",
          "closed_ts": "2026-06-03T00:34:59.999000Z",
          "side": "short",
          "entry_price": 67085.72,
          "exit_price": 66762.22035714285,
          "pnl_usd": 2.9188,
          "exit_reason": "tp",
          "proposal_id": "pp_f250c4513085847248718221"
        },
        {
          "opened_ts": "2026-06-03T00:24:59.999000Z",
          "closed_ts": "2026-06-03T00:39:59.999000Z",
          "side": "short",
          "entry_price": 66884.37,
          "exit_price": 67102.40071428572,
          "pnl_usd": -2.9647,
          "exit_reason": "sl",
          "proposal_id": "pp_0efbde770ff42e3474b5059b"
        },
        {
          "opened_ts": "2026-06-03T00:34:59.999000Z",
          "closed_ts": "2026-06-03T00:49:59.999000Z",
          "side": "short",
          "entry_price": 67030.0,
          "exit_price": 66981.93,
          "pnl_usd": -0.0243,
          "exit_reason": "time_stop",
          "proposal_id": "pp_1baf037ac1dd824c40a0c85b"
        },
        {
          "opened_ts": "2026-06-03T00:39:59.999000Z",
          "closed_ts": "2026-06-03T00:54:59.999000Z",
          "side": "short",
          "entry_price": 67049.42,
          "exit_price": 67024.59,
          "pnl_usd": -0.2807,
          "exit_reason": "time_stop",
          "proposal_id": "pp_4e96d7bc5887abda995294dc"
        },
        {
          "opened_ts": "2026-06-03T00:49:59.999000Z",
          "closed_ts": "2026-06-03T01:04:59.999000Z",
          "side": "short",
          "entry_price": 66981.93,
          "exit_price": 66926.01,
          "pnl_usd": 0.0627,
          "exit_reason": "time_stop",
          "proposal_id": "pp_8cbe63c87c1433d10be23942"
        },
        {
          "opened_ts": "2026-06-03T00:54:59.999000Z",
          "closed_ts": "2026-06-03T01:04:59.999000Z",
          "side": "long",
          "entry_price": 67024.59,
          "exit_price": 66850.13428571429,
          "pnl_usd": -2.4783,
          "exit_reason": "sl",
          "proposal_id": "pp_5bbb7391153b2912a7fcaa4f"
        },
        {
          "opened_ts": "2026-06-03T01:04:59.999000Z",
          "closed_ts": "2026-06-03T01:14:59.999000Z",
          "side": "long",
          "entry_price": 66926.01,
          "exit_price": 66747.23642857143,
          "pnl_usd": -2.5279,
          "exit_reason": "sl",
          "proposal_id": "pp_863c725deb2cdd07805eeda8"
        },
        {
          "opened_ts": "2026-06-03T01:04:59.999000Z",
          "closed_ts": "2026-06-03T01:19:59.999000Z",
          "side": "short",
          "entry_price": 66926.01,
          "exit_price": 66878.01,
          "pnl_usd": -0.0242,
          "exit_reason": "time_stop",
          "proposal_id": "pp_50371984eeb8f31ccf0f1737"
        },
        {
          "opened_ts": "2026-06-03T01:14:59.999000Z",
          "closed_ts": "2026-06-03T01:29:59.999000Z",
          "side": "short",
          "entry_price": 66829.16,
          "exit_price": 67007.63857142857,
          "pnl_usd": -2.5267,
          "exit_reason": "sl",
          "proposal_id": "pp_3cb1d8802daa389ecf37ee9e"
        },
        {
          "opened_ts": "2026-06-03T01:19:59.999000Z",
          "closed_ts": "2026-06-03T01:34:59.999000Z",
          "side": "short",
          "entry_price": 66878.01,
          "exit_price": 66896.0,
          "pnl_usd": -0.7527,
          "exit_reason": "time_stop",
          "proposal_id": "pp_ac854f726d9ade6c9e3aebbe"
        },
        {
          "opened_ts": "2026-06-03T01:29:59.999000Z",
          "closed_ts": "2026-06-03T01:39:59.999000Z",
          "side": "long",
          "entry_price": 67024.01,
          "exit_price": 66864.71928571428,
          "pnl_usd": -1.7451,
          "exit_reason": "sl",
          "proposal_id": "pp_547e3b7ca543e6c401c1d07f"
        },
        {
          "opened_ts": "2026-06-03T01:34:59.999000Z",
          "closed_ts": "2026-06-03T01:39:59.999000Z",
          "side": "short",
          "entry_price": 66896.0,
          "exit_price": 66664.99142857143,
          "pnl_usd": 1.9958,
          "exit_reason": "tp",
          "proposal_id": "pp_9b5f4db8b25aa863dfb3c76f"
        },
        {
          "opened_ts": "2026-06-03T01:39:59.999000Z",
          "closed_ts": "2026-06-03T01:54:59.999000Z",
          "side": "long",
          "entry_price": 66633.39,
          "exit_price": 66876.11678571429,
          "pnl_usd": 1.7569,
          "exit_reason": "tp",
          "proposal_id": "pp_b52d6fe7d9ae4ea58cae5ead"
        },
        {
          "opened_ts": "2026-06-03T01:39:59.999000Z",
          "closed_ts": "2026-06-03T01:54:59.999000Z",
          "side": "long",
          "entry_price": 66633.39,
          "exit_price": 66876.11678571429,
          "pnl_usd": 2.1356,
          "exit_reason": "tp",
          "proposal_id": "pp_863c725deb2cdd07805eeda8"
        },
        {
          "opened_ts": "2026-06-03T01:54:59.999000Z",
          "closed_ts": "2026-06-03T02:04:59.999000Z",
          "side": "long",
          "entry_price": 66994.75,
          "exit_price": 66820.235,
          "pnl_usd": -2.4776,
          "exit_reason": "sl",
          "proposal_id": "pp_5ad6d9da63ef329abd0ecaa1"
        },
        {
          "opened_ts": "2026-06-03T01:54:59.999000Z",
          "closed_ts": "2026-06-03T02:04:59.999000Z",
          "side": "long",
          "entry_price": 66994.75,
          "exit_price": 66820.235,
          "pnl_usd": -2.4775,
          "exit_reason": "sl",
          "proposal_id": "pp_863c725deb2cdd07805eeda8"
        },
        {
          "opened_ts": "2026-06-03T02:04:59.999000Z",
          "closed_ts": "2026-06-03T02:19:59.999000Z",
          "side": "long",
          "entry_price": 66880.01,
          "exit_price": 66919.04,
          "pnl_usd": -0.1208,
          "exit_reason": "time_stop",
          "proposal_id": "pp_03d2ff87ad44b8c9cb5453cb"
        },
        {
          "opened_ts": "2026-06-03T02:04:59.999000Z",
          "closed_ts": "2026-06-03T02:24:59.999000Z",
          "side": "long",
          "entry_price": 66880.01,
          "exit_price": 66703.37785714286,
          "pnl_usd": -2.5026,
          "exit_reason": "sl",
          "proposal_id": "pp_94421f6fd0e4494f734d5897"
        },
        {
          "opened_ts": "2026-06-03T02:19:59.999000Z",
          "closed_ts": "2026-06-03T02:24:59.999000Z",
          "side": "long",
          "entry_price": 66919.04,
          "exit_price": 66745.02714285713,
          "pnl_usd": -1.9214,
          "exit_reason": "sl",
          "proposal_id": "pp_7168475f6ae886a659f5055d"
        },
        {
          "opened_ts": "2026-06-03T02:24:59.999000Z",
          "closed_ts": "2026-06-03T02:39:59.999000Z",
          "side": "long",
          "entry_price": 66680.0,
          "exit_price": 66826.01,
          "pnl_usd": 1.0619,
          "exit_reason": "time_stop",
          "proposal_id": "pp_afdee1d672172533ef7471ff"
        },
        {
          "opened_ts": "2026-06-03T02:39:59.999000Z",
          "closed_ts": "2026-06-03T02:54:59.999000Z",
          "side": "short",
          "entry_price": 66826.01,
          "exit_price": 66700.01,
          "pnl_usd": 0.706,
          "exit_reason": "time_stop",
          "proposal_id": "pp_52b39fd0585a0ac20268cd5a"
        },
        {
          "opened_ts": "2026-06-03T02:24:59.999000Z",
          "closed_ts": "2026-06-03T03:09:59.999000Z",
          "side": "long",
          "entry_price": 66680.0,
          "exit_price": 66500.285,
          "pnl_usd": -2.541,
          "exit_reason": "sl",
          "proposal_id": "pp_94421f6fd0e4494f734d5897"
        },
        {
          "opened_ts": "2026-06-03T02:54:59.999000Z",
          "closed_ts": "2026-06-03T03:09:59.999000Z",
          "side": "long",
          "entry_price": 66700.01,
          "exit_price": 66539.54857142856,
          "pnl_usd": -2.3277,
          "exit_reason": "sl",
          "proposal_id": "pp_94421f6fd0e4494f734d5897"
        },
        {
          "opened_ts": "2026-06-03T03:09:59.999000Z",
          "closed_ts": "2026-06-03T03:19:59.999000Z",
          "side": "short",
          "entry_price": 66417.34,
          "exit_price": 66560.17571428571,
          "pnl_usd": -2.1383,
          "exit_reason": "sl",
          "proposal_id": "pp_11d0e08b5b2e44d076fc11f7"
        },
        {
          "opened_ts": "2026-06-03T03:09:59.999000Z",
          "closed_ts": "2026-06-03T03:29:59.999000Z",
          "side": "long",
          "entry_price": 66417.34,
          "exit_price": 66274.50428571428,
          "pnl_usd": -2.1382,
          "exit_reason": "sl",
          "proposal_id": "pp_e2dfafc20affe4d75a97aec3"
        },
        {
          "opened_ts": "2026-06-03T03:19:59.999000Z",
          "closed_ts": "2026-06-03T03:29:59.999000Z",
          "side": "short",
          "entry_price": 66396.0,
          "exit_price": 66178.57607142857,
          "pnl_usd": 1.5366,
          "exit_reason": "tp",
          "proposal_id": "pp_d66d89f6a2f1ae01e2af5712"
        },
        {
          "opened_ts": "2026-06-03T03:29:59.999000Z",
          "closed_ts": "2026-06-03T03:44:59.999000Z",
          "side": "short",
          "entry_price": 66147.81,
          "exit_price": 65902.10464285714,
          "pnl_usd": 1.7662,
          "exit_reason": "tp",
          "proposal_id": "pp_e88ac1ea02be8fdf70703b57"
        },
        {
          "opened_ts": "2026-06-03T03:29:59.999000Z",
          "closed_ts": "2026-06-03T03:44:59.999000Z",
          "side": "long",
          "entry_price": 66147.81,
          "exit_price": 65984.00642857143,
          "pnl_usd": -2.3773,
          "exit_reason": "sl",
          "proposal_id": "pp_e2dfafc20affe4d75a97aec3"
        },
        {
          "opened_ts": "2026-06-03T03:44:59.999000Z",
          "closed_ts": "2026-06-03T03:54:59.999000Z",
          "side": "long",
          "entry_price": 65755.01,
          "exit_price": 65572.05357142857,
          "pnl_usd": -2.6025,
          "exit_reason": "sl",
          "proposal_id": "pp_e2dfafc20affe4d75a97aec3"
        },
        {
          "opened_ts": "2026-06-03T03:44:59.999000Z",
          "closed_ts": "2026-06-03T03:54:59.999000Z",
          "side": "short",
          "entry_price": 65755.01,
          "exit_price": 65480.57535714285,
          "pnl_usd": 2.5222,
          "exit_reason": "tp",
          "proposal_id": "pp_06c341e1d43ebf32697f309e"
        },
        {
          "opened_ts": "2026-06-03T03:54:59.999000Z",
          "closed_ts": "2026-06-03T04:04:59.999000Z",
          "side": "short",
          "entry_price": 65936.67,
          "exit_price": 66153.36357142856,
          "pnl_usd": -2.0424,
          "exit_reason": "sl",
          "proposal_id": "pp_17f16b8a77e9c15e087f0bbb"
        },
        {
          "opened_ts": "2026-06-03T03:54:59.999000Z",
          "closed_ts": "2026-06-03T04:04:59.999000Z",
          "side": "long",
          "entry_price": 65936.67,
          "exit_price": 66261.71035714286,
          "pnl_usd": 3.0788,
          "exit_reason": "tp",
          "proposal_id": "pp_e2dfafc20affe4d75a97aec3"
        },
        {
          "opened_ts": "2026-06-03T04:04:59.999000Z",
          "closed_ts": "2026-06-03T04:19:59.999000Z",
          "side": "short",
          "entry_price": 66496.01,
          "exit_price": 66359.99,
          "pnl_usd": 0.9544,
          "exit_reason": "time_stop",
          "proposal_id": "pp_6edefe36cee1442e39f07249"
        },
        {
          "opened_ts": "2026-06-03T04:19:59.999000Z",
          "closed_ts": "2026-06-03T04:34:59.999000Z",
          "side": "short",
          "entry_price": 66359.99,
          "exit_price": 66464.64,
          "pnl_usd": -1.2817,
          "exit_reason": "time_stop",
          "proposal_id": "pp_10666a6775618fc70a88b10a"
        },
        {
          "opened_ts": "2026-06-03T04:34:59.999000Z",
          "closed_ts": "2026-06-03T04:49:59.999000Z",
          "side": "short",
          "entry_price": 66464.64,
          "exit_price": 66451.2,
          "pnl_usd": -0.4035,
          "exit_reason": "time_stop",
          "proposal_id": "pp_d1b0b86a37fd5fdefef7bba7"
        },
        {
          "opened_ts": "2026-06-03T04:04:59.999000Z",
          "closed_ts": "2026-06-03T05:04:59.999000Z",
          "side": "long",
          "entry_price": 66496.01,
          "exit_price": 66884.16071428571,
          "pnl_usd": 3.7474,
          "exit_reason": "tp",
          "proposal_id": "pp_aa21f0bf301ee16bf17e20f0"
        },
        {
          "opened_ts": "2026-06-03T04:49:59.999000Z",
          "closed_ts": "2026-06-03T05:04:59.999000Z",
          "side": "short",
          "entry_price": 66451.2,
          "exit_price": 66694.61,
          "pnl_usd": -3.25,
          "exit_reason": "sl",
          "proposal_id": "pp_ac68c2a2ee70c3e21fac7ea3"
        },
        {
          "opened_ts": "2026-06-03T05:04:59.999000Z",
          "closed_ts": "2026-06-03T05:14:59.999000Z",
          "side": "short",
          "entry_price": 67013.26,
          "exit_price": 67241.25285714286,
          "pnl_usd": -3.0579,
          "exit_reason": "sl",
          "proposal_id": "pp_bc3dd12fe3905275f00d0cc3"
        },
        {
          "opened_ts": "2026-06-03T05:14:59.999000Z",
          "closed_ts": "2026-06-03T05:29:59.999000Z",
          "side": "short",
          "entry_price": 67135.99,
          "exit_price": 67103.06,
          "pnl_usd": -0.191,
          "exit_reason": "time_stop",
          "proposal_id": "pp_d522d966d63031c7d2a428f3"
        },
        {
          "opened_ts": "2026-06-03T05:04:59.999000Z",
          "closed_ts": "2026-06-03T05:34:59.999000Z",
          "side": "long",
          "entry_price": 67013.26,
          "exit_price": 66785.26714285713,
          "pnl_usd": -3.0578,
          "exit_reason": "sl",
          "proposal_id": "pp_450264fd84553764c453a085"
        },
        {
          "opened_ts": "2026-06-03T05:29:59.999000Z",
          "closed_ts": "2026-06-03T05:34:59.999000Z",
          "side": "short",
          "entry_price": 67103.06,
          "exit_price": 66821.20678571428,
          "pnl_usd": 2.5397,
          "exit_reason": "tp",
          "proposal_id": "pp_5a07c888562011318a724b43"
        },
        {
          "opened_ts": "2026-06-03T05:34:59.999000Z",
          "closed_ts": "2026-06-03T05:49:59.999000Z",
          "side": "short",
          "entry_price": 66958.0,
          "exit_price": 67103.96,
          "pnl_usd": -2.1564,
          "exit_reason": "time_stop",
          "proposal_id": "pp_72de2da3f2ea278ac036d384"
        },
        {
          "opened_ts": "2026-06-03T05:34:59.999000Z",
          "closed_ts": "2026-06-03T05:54:59.999000Z",
          "side": "long",
          "entry_price": 66958.0,
          "exit_price": 67263.21785714287,
          "pnl_usd": 2.8028,
          "exit_reason": "tp",
          "proposal_id": "pp_450264fd84553764c453a085"
        },
        {
          "opened_ts": "2026-06-03T05:49:59.999000Z",
          "closed_ts": "2026-06-03T05:54:59.999000Z",
          "side": "short",
          "entry_price": 67103.96,
          "exit_price": 67290.14357142858,
          "pnl_usd": -2.5933,
          "exit_reason": "sl",
          "proposal_id": "pp_4c74090a5b9c29bea7ffd2be"
        },
        {
          "opened_ts": "2026-06-03T05:54:59.999000Z",
          "closed_ts": "2026-06-03T06:09:59.999000Z",
          "side": "short",
          "entry_price": 67322.91,
          "exit_price": 67204.01,
          "pnl_usd": 0.7476,
          "exit_reason": "time_stop",
          "proposal_id": "pp_6b61374d0b3af52592b2ae4e"
        },
        {
          "opened_ts": "2026-06-03T05:54:59.999000Z",
          "closed_ts": "2026-06-03T06:14:59.999000Z",
          "side": "long",
          "entry_price": 67322.91,
          "exit_price": 67125.08714285714,
          "pnl_usd": -2.7136,
          "exit_reason": "sl",
          "proposal_id": "pp_450264fd84553764c453a085"
        },
        {
          "opened_ts": "2026-06-03T06:09:59.999000Z",
          "closed_ts": "2026-06-03T06:24:59.999000Z",
          "side": "long",
          "entry_price": 67204.01,
          "exit_price": 67340.93,
          "pnl_usd": 0.9471,
          "exit_reason": "time_stop",
          "proposal_id": "pp_3e7a14f67c76fd84f30c42cb"
        },
        {
          "opened_ts": "2026-06-03T06:14:59.999000Z",
          "closed_ts": "2026-06-03T06:29:59.999000Z",
          "side": "long",
          "entry_price": 67160.0,
          "exit_price": 67253.63,
          "pnl_usd": 0.4737,
          "exit_reason": "time_stop",
          "proposal_id": "pp_1caaed82107c5980bc3e9fc7"
        },
        {
          "opened_ts": "2026-06-03T06:24:59.999000Z",
          "closed_ts": "2026-06-03T06:34:59.999000Z",
          "side": "long",
          "entry_price": 67340.93,
          "exit_price": 67185.41642857142,
          "pnl_usd": -2.2501,
          "exit_reason": "sl",
          "proposal_id": "pp_b53b1767f06014eadac0a831"
        },
        {
          "opened_ts": "2026-06-03T06:29:59.999000Z",
          "closed_ts": "2026-06-03T06:34:59.999000Z",
          "side": "short",
          "entry_price": 67253.63,
          "exit_price": 67405.9092857143,
          "pnl_usd": -2.217,
          "exit_reason": "sl",
          "proposal_id": "pp_92b21231dd7fcc74a9fa8b50"
        },
        {
          "opened_ts": "2026-06-03T06:34:59.999000Z",
          "closed_ts": "2026-06-03T06:44:59.999000Z",
          "side": "long",
          "entry_price": 67464.87,
          "exit_price": 67303.96285714285,
          "pnl_usd": -1.7413,
          "exit_reason": "sl",
          "proposal_id": "pp_2707954a8b0a70fc65776d68"
        },
        {
          "opened_ts": "2026-06-03T06:34:59.999000Z",
          "closed_ts": "2026-06-03T06:49:59.999000Z",
          "side": "short",
          "entry_price": 67464.87,
          "exit_price": 67223.50928571427,
          "pnl_usd": 1.4061,
          "exit_reason": "tp",
          "proposal_id": "pp_176259bf15414cf29d9ba256"
        },
        {
          "opened_ts": "2026-06-03T06:44:59.999000Z",
          "closed_ts": "2026-06-03T06:54:59.999000Z",
          "side": "long",
          "entry_price": 67316.83,
          "exit_price": 67166.22857142857,
          "pnl_usd": -1.9003,
          "exit_reason": "sl",
          "proposal_id": "pp_8b9253056ad00fe56c8982f8"
        },
        {
          "opened_ts": "2026-06-03T06:49:59.999000Z",
          "closed_ts": "2026-06-03T06:54:59.999000Z",
          "side": "long",
          "entry_price": 67207.17,
          "exit_price": 67057.64,
          "pnl_usd": -2.0831,
          "exit_reason": "sl",
          "proposal_id": "pp_be64c24f8e97b27ef6a2a11a"
        },
        {
          "opened_ts": "2026-06-03T06:54:59.999000Z",
          "closed_ts": "2026-06-03T07:09:59.999000Z",
          "side": "short",
          "entry_price": 67059.99,
          "exit_price": 67049.99,
          "pnl_usd": -0.4414,
          "exit_reason": "time_stop",
          "proposal_id": "pp_38c7e42e2d1ee306d4b1da7b"
        },
        {
          "opened_ts": "2026-06-03T06:54:59.999000Z",
          "closed_ts": "2026-06-03T07:19:59.999000Z",
          "side": "short",
          "entry_price": 67059.99,
          "exit_price": 67211.83857142858,
          "pnl_usd": -1.498,
          "exit_reason": "sl",
          "proposal_id": "pp_176259bf15414cf29d9ba256"
        },
        {
          "opened_ts": "2026-06-03T07:09:59.999000Z",
          "closed_ts": "2026-06-03T07:19:59.999000Z",
          "side": "short",
          "entry_price": 67049.99,
          "exit_price": 67193.25928571429,
          "pnl_usd": -2.1205,
          "exit_reason": "sl",
          "proposal_id": "pp_546f0fba3bb0997f6cfad0b2"
        },
        {
          "opened_ts": "2026-06-03T07:19:59.999000Z",
          "closed_ts": "2026-06-03T07:34:59.999000Z",
          "side": "long",
          "entry_price": 67268.01,
          "exit_price": 67260.01,
          "pnl_usd": -0.638,
          "exit_reason": "time_stop",
          "proposal_id": "pp_93321dd1272e94caaf9a0222"
        },
        {
          "opened_ts": "2026-06-03T07:19:59.999000Z",
          "closed_ts": "2026-06-03T07:44:59.999000Z",
          "side": "long",
          "entry_price": 67268.01,
          "exit_price": 67116.77714285714,
          "pnl_usd": -2.2013,
          "exit_reason": "sl",
          "proposal_id": "pp_eeb71ef50d00d6eb6df63673"
        },
        {
          "opened_ts": "2026-06-03T07:34:59.999000Z",
          "closed_ts": "2026-06-03T07:44:59.999000Z",
          "side": "long",
          "entry_price": 67260.01,
          "exit_price": 67115.47428571428,
          "pnl_usd": -2.1281,
          "exit_reason": "sl",
          "proposal_id": "pp_0059930172115882e4ef39e9"
        },
        {
          "opened_ts": "2026-06-03T07:44:59.999000Z",
          "closed_ts": "2026-06-03T07:59:59.999000Z",
          "side": "long",
          "entry_price": 67208.49,
          "exit_price": 67220.03,
          "pnl_usd": -0.4243,
          "exit_reason": "time_stop",
          "proposal_id": "pp_76b324b8b0bcbcf6330fee1f"
        },
        {
          "opened_ts": "2026-06-03T07:44:59.999000Z",
          "closed_ts": "2026-06-03T08:14:59.999000Z",
          "side": "long",
          "entry_price": 67208.49,
          "exit_price": 67074.76642857144,
          "pnl_usd": -2.0101,
          "exit_reason": "sl",
          "proposal_id": "pp_eeb71ef50d00d6eb6df63673"
        },
        {
          "opened_ts": "2026-06-03T07:59:59.999000Z",
          "closed_ts": "2026-06-03T08:14:59.999000Z",
          "side": "long",
          "entry_price": 67220.03,
          "exit_price": 67099.60857142857,
          "pnl_usd": -1.8645,
          "exit_reason": "sl",
          "proposal_id": "pp_753b9a09c9f2b1698695dac3"
        },
        {
          "opened_ts": "2026-06-03T08:14:59.999000Z",
          "closed_ts": "2026-06-03T08:29:59.999000Z",
          "side": "short",
          "entry_price": 67070.0,
          "exit_price": 67027.6,
          "pnl_usd": -0.0735,
          "exit_reason": "time_stop",
          "proposal_id": "pp_4a064218bc4d79c24c4c8eb8"
        },
        {
          "opened_ts": "2026-06-03T08:29:59.999000Z",
          "closed_ts": "2026-06-03T08:34:59.999000Z",
          "side": "short",
          "entry_price": 67027.6,
          "exit_price": 67125.16,
          "pnl_usd": -1.4777,
          "exit_reason": "sl",
          "proposal_id": "pp_d346ed5c35f1a179b0af1198"
        },
        {
          "opened_ts": "2026-06-03T08:34:59.999000Z",
          "closed_ts": "2026-06-03T08:39:59.999000Z",
          "side": "long",
          "entry_price": 67111.43,
          "exit_price": 67006.82142857142,
          "pnl_usd": -1.6925,
          "exit_reason": "sl",
          "proposal_id": "pp_dfc9ae755a52e533d9ff037b"
        },
        {
          "opened_ts": "2026-06-03T08:39:59.999000Z",
          "closed_ts": "2026-06-03T08:49:59.999000Z",
          "side": "long",
          "entry_price": 66979.19,
          "exit_price": 67144.64642857143,
          "pnl_usd": 1.2608,
          "exit_reason": "tp",
          "proposal_id": "pp_f7a6d2f266dbf2a66bc98e55"
        },
        {
          "opened_ts": "2026-06-03T08:49:59.999000Z",
          "closed_ts": "2026-06-03T08:54:59.999000Z",
          "side": "long",
          "entry_price": 67118.88,
          "exit_price": 67001.33,
          "pnl_usd": -1.8334,
          "exit_reason": "sl",
          "proposal_id": "pp_49e84f32370ee486d0894be5"
        },
        {
          "opened_ts": "2026-06-03T08:54:59.999000Z",
          "closed_ts": "2026-06-03T09:09:59.999000Z",
          "side": "long",
          "entry_price": 67068.74,
          "exit_price": 67079.99,
          "pnl_usd": -0.4267,
          "exit_reason": "time_stop",
          "proposal_id": "pp_60a12e4ac467fe43c28c715a"
        },
        {
          "opened_ts": "2026-06-03T08:14:59.999000Z",
          "closed_ts": "2026-06-03T09:14:59.999000Z",
          "side": "long",
          "entry_price": 67070.0,
          "exit_price": 66956.12857142858,
          "pnl_usd": -1.5318,
          "exit_reason": "sl",
          "proposal_id": "pp_3ad93caed73e1c9a2be67066"
        },
        {
          "opened_ts": "2026-06-03T09:09:59.999000Z",
          "closed_ts": "2026-06-03T09:14:59.999000Z",
          "side": "long",
          "entry_price": 67079.99,
          "exit_price": 66956.51571428572,
          "pnl_usd": -1.8982,
          "exit_reason": "sl",
          "proposal_id": "pp_2058146e40c6ac967540288d"
        },
        {
          "opened_ts": "2026-06-03T09:14:59.999000Z",
          "closed_ts": "2026-06-03T09:24:59.999000Z",
          "side": "long",
          "entry_price": 66962.05,
          "exit_price": 66835.80428571429,
          "pnl_usd": -1.9301,
          "exit_reason": "sl",
          "proposal_id": "pp_a54b0457739e655280c6e24d"
        },
        {
          "opened_ts": "2026-06-03T09:14:59.999000Z",
          "closed_ts": "2026-06-03T09:24:59.999000Z",
          "side": "long",
          "entry_price": 66962.05,
          "exit_price": 66835.80428571429,
          "pnl_usd": -1.93,
          "exit_reason": "sl",
          "proposal_id": "pp_5ecfc1e7dac80076a0aee006"
        },
        {
          "opened_ts": "2026-06-03T09:24:59.999000Z",
          "closed_ts": "2026-06-03T09:39:59.999000Z",
          "side": "short",
          "entry_price": 66824.55,
          "exit_price": 66754.91,
          "pnl_usd": 0.1807,
          "exit_reason": "time_stop",
          "proposal_id": "pp_c2cb11ea18cd81383511255f"
        },
        {
          "opened_ts": "2026-06-03T09:24:59.999000Z",
          "closed_ts": "2026-06-03T09:49:59.999000Z",
          "side": "long",
          "entry_price": 66824.55,
          "exit_price": 66700.52428571429,
          "pnl_usd": -1.9076,
          "exit_reason": "sl_and_tp_same_bar_pessimistic_sl",
          "proposal_id": "pp_5ecfc1e7dac80076a0aee006"
        },
        {
          "opened_ts": "2026-06-03T09:39:59.999000Z",
          "closed_ts": "2026-06-03T09:49:59.999000Z",
          "side": "long",
          "entry_price": 66754.91,
          "exit_price": 66935.9825,
          "pnl_usd": 1.4365,
          "exit_reason": "tp",
          "proposal_id": "pp_962590f0e1335c0b17b2d16f"
        },
        {
          "opened_ts": "2026-06-03T09:49:59.999000Z",
          "closed_ts": "2026-06-03T09:54:59.999000Z",
          "side": "long",
          "entry_price": 67023.02,
          "exit_price": 67210.94321428573,
          "pnl_usd": 1.5032,
          "exit_reason": "tp",
          "proposal_id": "pp_7385cb574bd68ceb0d2274e0"
        },
        {
          "opened_ts": "2026-06-03T09:49:59.999000Z",
          "closed_ts": "2026-06-03T09:54:59.999000Z",
          "side": "long",
          "entry_price": 67023.02,
          "exit_price": 67210.94321428573,
          "pnl_usd": 1.5031,
          "exit_reason": "tp",
          "proposal_id": "pp_5ecfc1e7dac80076a0aee006"
        },
        {
          "opened_ts": "2026-06-03T09:54:59.999000Z",
          "closed_ts": "2026-06-03T10:09:59.999000Z",
          "side": "long",
          "entry_price": 67129.63,
          "exit_price": 67332.72571428573,
          "pnl_usd": 1.6657,
          "exit_reason": "tp",
          "proposal_id": "pp_5ecfc1e7dac80076a0aee006"
        },
        {
          "opened_ts": "2026-06-03T09:54:59.999000Z",
          "closed_ts": "2026-06-03T10:09:59.999000Z",
          "side": "short",
          "entry_price": 67129.63,
          "exit_price": 67265.02714285714,
          "pnl_usd": -1.4871,
          "exit_reason": "sl",
          "proposal_id": "pp_3d2e52c34fea7ae932c56f5b"
        },
        {
          "opened_ts": "2026-06-03T10:09:59.999000Z",
          "closed_ts": "2026-06-03T10:14:59.999000Z",
          "side": "long",
          "entry_price": 67440.0,
          "exit_price": 67293.98857142858,
          "pnl_usd": -2.1337,
          "exit_reason": "sl",
          "proposal_id": "pp_269eb8dfc71d082c48c5b1a5"
        },
        {
          "opened_ts": "2026-06-03T10:09:59.999000Z",
          "closed_ts": "2026-06-03T10:19:59.999000Z",
          "side": "short",
          "entry_price": 67440.0,
          "exit_price": 67220.98285714285,
          "pnl_usd": 1.8282,
          "exit_reason": "tp",
          "proposal_id": "pp_b02c32e29daecffedb6755a2"
        },
        {
          "opened_ts": "2026-06-03T10:14:59.999000Z",
          "closed_ts": "2026-06-03T10:29:59.999000Z",
          "side": "short",
          "entry_price": 67305.99,
          "exit_price": 67318.0,
          "pnl_usd": -0.6794,
          "exit_reason": "time_stop",
          "proposal_id": "pp_61e5b6e5c74264667dc3509c"
        },
        {
          "opened_ts": "2026-06-03T10:19:59.999000Z",
          "closed_ts": "2026-06-03T10:34:59.999000Z",
          "side": "long",
          "entry_price": 67204.4,
          "exit_price": 67328.57,
          "pnl_usd": 0.8033,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f1095bc85083c3c5b689eee3"
        },
        {
          "opened_ts": "2026-06-03T10:29:59.999000Z",
          "closed_ts": "2026-06-03T10:44:59.999000Z",
          "side": "long",
          "entry_price": 67318.0,
          "exit_price": 67234.15,
          "pnl_usd": -1.4603,
          "exit_reason": "time_stop",
          "proposal_id": "pp_bc3a2011d7dccbfcca9a50e4"
        },
        {
          "opened_ts": "2026-06-03T10:34:59.999000Z",
          "closed_ts": "2026-06-03T10:49:59.999000Z",
          "side": "long",
          "entry_price": 67328.57,
          "exit_price": 67230.0,
          "pnl_usd": -1.6201,
          "exit_reason": "time_stop",
          "proposal_id": "pp_3dab882c2cb25e78d93c178f"
        },
        {
          "opened_ts": "2026-06-03T10:44:59.999000Z",
          "closed_ts": "2026-06-03T10:59:59.999000Z",
          "side": "long",
          "entry_price": 67234.15,
          "exit_price": 67294.52,
          "pnl_usd": 0.1082,
          "exit_reason": "time_stop",
          "proposal_id": "pp_83a4235fd20f3102dd6be009"
        },
        {
          "opened_ts": "2026-06-03T10:49:59.999000Z",
          "closed_ts": "2026-06-03T11:04:59.999000Z",
          "side": "long",
          "entry_price": 67230.0,
          "exit_price": 67257.99,
          "pnl_usd": -0.2441,
          "exit_reason": "time_stop",
          "proposal_id": "pp_22d0a6ec2101df9bfcc978a9"
        },
        {
          "opened_ts": "2026-06-03T10:59:59.999000Z",
          "closed_ts": "2026-06-03T11:14:59.999000Z",
          "side": "long",
          "entry_price": 67294.52,
          "exit_price": 67341.5,
          "pnl_usd": -0.0379,
          "exit_reason": "time_stop",
          "proposal_id": "pp_2b0a12aef03a2f29845fa9e2"
        },
        {
          "opened_ts": "2026-06-03T11:04:59.999000Z",
          "closed_ts": "2026-06-03T11:19:59.999000Z",
          "side": "long",
          "entry_price": 67257.99,
          "exit_price": 67350.0,
          "pnl_usd": 0.452,
          "exit_reason": "time_stop",
          "proposal_id": "pp_3788804ceac16a3cc5a3398c"
        },
        {
          "opened_ts": "2026-06-03T11:14:59.999000Z",
          "closed_ts": "2026-06-03T11:29:59.999000Z",
          "side": "long",
          "entry_price": 67341.5,
          "exit_price": 67329.99,
          "pnl_usd": -0.6735,
          "exit_reason": "time_stop",
          "proposal_id": "pp_01aa57f676f25f54f4f10264"
        },
        {
          "opened_ts": "2026-06-03T11:19:59.999000Z",
          "closed_ts": "2026-06-03T11:34:59.999000Z",
          "side": "long",
          "entry_price": 67350.0,
          "exit_price": 67240.725,
          "pnl_usd": -1.735,
          "exit_reason": "sl",
          "proposal_id": "pp_ef811bfabd31a7492b1704b1"
        },
        {
          "opened_ts": "2026-06-03T11:29:59.999000Z",
          "closed_ts": "2026-06-03T11:34:59.999000Z",
          "side": "long",
          "entry_price": 67329.99,
          "exit_price": 67237.57642857144,
          "pnl_usd": -1.552,
          "exit_reason": "sl",
          "proposal_id": "pp_2494f59a7cd2f187f3ac880f"
        },
        {
          "opened_ts": "2026-06-03T11:34:59.999000Z",
          "closed_ts": "2026-06-03T11:49:59.999000Z",
          "side": "long",
          "entry_price": 67172.0,
          "exit_price": 67075.33,
          "pnl_usd": -1.6001,
          "exit_reason": "sl",
          "proposal_id": "pp_b7d293e5cd8bf1bb5b258fc4"
        },
        {
          "opened_ts": "2026-06-03T11:34:59.999000Z",
          "closed_ts": "2026-06-03T11:49:59.999000Z",
          "side": "long",
          "entry_price": 67172.0,
          "exit_price": 67075.33,
          "pnl_usd": -1.6,
          "exit_reason": "sl",
          "proposal_id": "pp_fe75a6b75325a83c66e89473"
        },
        {
          "opened_ts": "2026-06-03T11:49:59.999000Z",
          "closed_ts": "2026-06-03T12:04:59.999000Z",
          "side": "long",
          "entry_price": 67095.06,
          "exit_price": 67010.5607142857,
          "pnl_usd": -1.4681,
          "exit_reason": "sl",
          "proposal_id": "pp_44a1ec9f00118d2015e97d00"
        },
        {
          "opened_ts": "2026-06-03T11:49:59.999000Z",
          "closed_ts": "2026-06-03T12:04:59.999000Z",
          "side": "long",
          "entry_price": 67095.06,
          "exit_price": 67010.5607142857,
          "pnl_usd": -1.468,
          "exit_reason": "sl",
          "proposal_id": "pp_fe75a6b75325a83c66e89473"
        },
        {
          "opened_ts": "2026-06-03T12:04:59.999000Z",
          "closed_ts": "2026-06-03T12:14:59.999000Z",
          "side": "long",
          "entry_price": 67106.0,
          "exit_price": 67018.41785714285,
          "pnl_usd": -1.5009,
          "exit_reason": "sl",
          "proposal_id": "pp_f5442420f6424d1068ec35ca"
        },
        {
          "opened_ts": "2026-06-03T12:04:59.999000Z",
          "closed_ts": "2026-06-03T12:14:59.999000Z",
          "side": "long",
          "entry_price": 67106.0,
          "exit_price": 67018.41785714285,
          "pnl_usd": -1.5008,
          "exit_reason": "sl",
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6"
        },
        {
          "opened_ts": "2026-06-03T12:14:59.999000Z",
          "closed_ts": "2026-06-03T12:19:59.999000Z",
          "side": "long",
          "entry_price": 66972.76,
          "exit_price": 66878.24357142857,
          "pnl_usd": -1.5777,
          "exit_reason": "sl",
          "proposal_id": "pp_91fdad2355fc49cb388160fa"
        },
        {
          "opened_ts": "2026-06-03T12:14:59.999000Z",
          "closed_ts": "2026-06-03T12:19:59.999000Z",
          "side": "long",
          "entry_price": 66972.76,
          "exit_price": 66878.24357142857,
          "pnl_usd": -1.5776,
          "exit_reason": "sl",
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6"
        },
        {
          "opened_ts": "2026-06-03T12:19:59.999000Z",
          "closed_ts": "2026-06-03T12:24:59.999000Z",
          "side": "short",
          "entry_price": 66844.0,
          "exit_price": 66945.3607142857,
          "pnl_usd": -1.2468,
          "exit_reason": "sl",
          "proposal_id": "pp_aee824fb6bb72566aa69135d"
        },
        {
          "opened_ts": "2026-06-03T12:19:59.999000Z",
          "closed_ts": "2026-06-03T12:29:59.999000Z",
          "side": "long",
          "entry_price": 66844.0,
          "exit_price": 66996.04107142857,
          "pnl_usd": 1.1124,
          "exit_reason": "tp",
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6"
        },
        {
          "opened_ts": "2026-06-03T12:24:59.999000Z",
          "closed_ts": "2026-06-03T12:29:59.999000Z",
          "side": "long",
          "entry_price": 66892.01,
          "exit_price": 67047.04035714285,
          "pnl_usd": 1.1436,
          "exit_reason": "tp",
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6"
        },
        {
          "opened_ts": "2026-06-03T12:29:59.999000Z",
          "closed_ts": "2026-06-03T12:39:59.999000Z",
          "side": "long",
          "entry_price": 67032.01,
          "exit_price": 66918.44642857142,
          "pnl_usd": -1.7834,
          "exit_reason": "sl",
          "proposal_id": "pp_e68e79e210a5ae64fff87f75"
        },
        {
          "opened_ts": "2026-06-03T12:29:59.999000Z",
          "closed_ts": "2026-06-03T12:39:59.999000Z",
          "side": "long",
          "entry_price": 67032.01,
          "exit_price": 66918.44642857142,
          "pnl_usd": -1.7833,
          "exit_reason": "sl",
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6"
        },
        {
          "opened_ts": "2026-06-03T12:39:59.999000Z",
          "closed_ts": "2026-06-03T12:49:59.999000Z",
          "side": "short",
          "entry_price": 66862.71,
          "exit_price": 67000.31142857144,
          "pnl_usd": -2.0478,
          "exit_reason": "sl",
          "proposal_id": "pp_5da7fed058fc767f2c010c12"
        },
        {
          "opened_ts": "2026-06-03T12:39:59.999000Z",
          "closed_ts": "2026-06-03T12:54:59.999000Z",
          "side": "long",
          "entry_price": 66862.71,
          "exit_price": 67069.11214285715,
          "pnl_usd": 1.7042,
          "exit_reason": "tp",
          "proposal_id": "pp_0167c37ba6d588d8cee1eec6"
        },
        {
          "opened_ts": "2026-06-03T12:49:59.999000Z",
          "closed_ts": "2026-06-03T13:04:59.999000Z",
          "side": "long",
          "entry_price": 67021.86,
          "exit_price": 67048.0,
          "pnl_usd": -0.2624,
          "exit_reason": "time_stop",
          "proposal_id": "pp_234c01e819ad174f07a15d7d"
        },
        {
          "opened_ts": "2026-06-03T12:54:59.999000Z",
          "closed_ts": "2026-06-03T13:09:59.999000Z",
          "side": "long",
          "entry_price": 67076.0,
          "exit_price": 67070.02,
          "pnl_usd": -0.6119,
          "exit_reason": "time_stop",
          "proposal_id": "pp_2e59c350d314b333b619a4b8"
        },
        {
          "opened_ts": "2026-06-03T13:04:59.999000Z",
          "closed_ts": "2026-06-03T13:19:59.999000Z",
          "side": "long",
          "entry_price": 67048.0,
          "exit_price": 67219.98,
          "pnl_usd": 1.3233,
          "exit_reason": "time_stop",
          "proposal_id": "pp_24edab8e1875766a10c2b9e5"
        },
        {
          "opened_ts": "2026-06-03T13:09:59.999000Z",
          "closed_ts": "2026-06-03T13:24:59.999000Z",
          "side": "long",
          "entry_price": 67070.02,
          "exit_price": 67107.7,
          "pnl_usd": -0.1372,
          "exit_reason": "time_stop",
          "proposal_id": "pp_655f8a176d742f320539678c"
        },
        {
          "opened_ts": "2026-06-03T13:19:59.999000Z",
          "closed_ts": "2026-06-03T13:29:59.999000Z",
          "side": "long",
          "entry_price": 67219.98,
          "exit_price": 67068.075,
          "pnl_usd": -2.1943,
          "exit_reason": "sl",
          "proposal_id": "pp_05ef41da5b2ebeb76b0a2ee0"
        },
        {
          "opened_ts": "2026-06-03T13:24:59.999000Z",
          "closed_ts": "2026-06-03T13:29:59.999000Z",
          "side": "short",
          "entry_price": 67107.7,
          "exit_price": 66890.13357142857,
          "pnl_usd": 1.8167,
          "exit_reason": "tp",
          "proposal_id": "pp_037deee0c3a071d2eb5badd4"
        },
        {
          "opened_ts": "2026-06-03T13:29:59.999000Z",
          "closed_ts": "2026-06-03T13:34:59.999000Z",
          "side": "long",
          "entry_price": 66838.01,
          "exit_price": 67067.27321428571,
          "pnl_usd": 1.9536,
          "exit_reason": "tp",
          "proposal_id": "pp_fcc20f87ed221cee376bf952"
        },
        {
          "opened_ts": "2026-06-03T13:29:59.999000Z",
          "closed_ts": "2026-06-03T13:34:59.999000Z",
          "side": "long",
          "entry_price": 66838.01,
          "exit_price": 67067.27321428571,
          "pnl_usd": 1.9535,
          "exit_reason": "tp",
          "proposal_id": "pp_e6f4f856a51e2305cbf6b0e9"
        },
        {
          "opened_ts": "2026-06-03T13:34:59.999000Z",
          "closed_ts": "2026-06-03T13:39:59.999000Z",
          "side": "long",
          "entry_price": 67124.01,
          "exit_price": 66957.52857142857,
          "pnl_usd": -1.6094,
          "exit_reason": "sl",
          "proposal_id": "pp_e68b48993fcdab7f160aee97"
        },
        {
          "opened_ts": "2026-06-03T13:34:59.999000Z",
          "closed_ts": "2026-06-03T13:39:59.999000Z",
          "side": "long",
          "entry_price": 67124.01,
          "exit_price": 66957.52857142857,
          "pnl_usd": -2.3552,
          "exit_reason": "sl",
          "proposal_id": "pp_e6f4f856a51e2305cbf6b0e9"
        },
        {
          "opened_ts": "2026-06-03T13:39:59.999000Z",
          "closed_ts": "2026-06-03T13:44:59.999000Z",
          "side": "long",
          "entry_price": 66981.64,
          "exit_price": 66810.08857142857,
          "pnl_usd": -2.4131,
          "exit_reason": "sl",
          "proposal_id": "pp_dcab2e5b4ff2addef05b1f88"
        },
        {
          "opened_ts": "2026-06-03T13:39:59.999000Z",
          "closed_ts": "2026-06-03T13:44:59.999000Z",
          "side": "long",
          "entry_price": 66981.64,
          "exit_price": 66810.08857142857,
          "pnl_usd": -2.413,
          "exit_reason": "sl",
          "proposal_id": "pp_e6f4f856a51e2305cbf6b0e9"
        },
        {
          "opened_ts": "2026-06-03T13:44:59.999000Z",
          "closed_ts": "2026-06-03T13:54:59.999000Z",
          "side": "long",
          "entry_price": 66744.27,
          "exit_price": 67014.26571428572,
          "pnl_usd": 2.4,
          "exit_reason": "tp",
          "proposal_id": "pp_ebdb918a7783b3fa9c8442f9"
        },
        {
          "opened_ts": "2026-06-03T13:44:59.999000Z",
          "closed_ts": "2026-06-03T13:54:59.999000Z",
          "side": "long",
          "entry_price": 66744.27,
          "exit_price": 67014.26571428572,
          "pnl_usd": 2.3999,
          "exit_reason": "tp",
          "proposal_id": "pp_e6f4f856a51e2305cbf6b0e9"
        },
        {
          "opened_ts": "2026-06-03T13:54:59.999000Z",
          "closed_ts": "2026-06-03T14:04:59.999000Z",
          "side": "long",
          "entry_price": 66940.01,
          "exit_price": 66756.13642857142,
          "pnl_usd": -2.5478,
          "exit_reason": "sl",
          "proposal_id": "pp_92ce0076553430baa5445651"
        },
        {
          "opened_ts": "2026-06-03T13:54:59.999000Z",
          "closed_ts": "2026-06-03T14:04:59.999000Z",
          "side": "long",
          "entry_price": 66940.01,
          "exit_price": 66756.13642857142,
          "pnl_usd": -2.5477,
          "exit_reason": "sl",
          "proposal_id": "pp_e6f4f856a51e2305cbf6b0e9"
        },
        {
          "opened_ts": "2026-06-03T14:04:59.999000Z",
          "closed_ts": "2026-06-03T14:19:59.999000Z",
          "side": "long",
          "entry_price": 66777.11,
          "exit_price": 66694.0,
          "pnl_usd": -1.4524,
          "exit_reason": "time_stop",
          "proposal_id": "pp_4ce2469e87873a89fce2026f"
        },
        {
          "opened_ts": "2026-06-03T14:19:59.999000Z",
          "closed_ts": "2026-06-03T14:34:59.999000Z",
          "side": "long",
          "entry_price": 66694.0,
          "exit_price": 66770.02,
          "pnl_usd": 0.2838,
          "exit_reason": "time_stop",
          "proposal_id": "pp_cc959b5b691ff0b2242e6233"
        },
        {
          "opened_ts": "2026-06-03T14:34:59.999000Z",
          "closed_ts": "2026-06-03T14:49:59.999000Z",
          "side": "long",
          "entry_price": 66770.02,
          "exit_price": 66819.74,
          "pnl_usd": -0.0039,
          "exit_reason": "time_stop",
          "proposal_id": "pp_a245d35cf06db99bebd1bbe5"
        },
        {
          "opened_ts": "2026-06-03T14:49:59.999000Z",
          "closed_ts": "2026-06-03T15:04:59.999000Z",
          "side": "long",
          "entry_price": 66819.74,
          "exit_price": 66760.0,
          "pnl_usd": -1.1967,
          "exit_reason": "time_stop",
          "proposal_id": "pp_37ca4412d14468c5f8c3cd5e"
        },
        {
          "opened_ts": "2026-06-03T14:04:59.999000Z",
          "closed_ts": "2026-06-03T15:09:59.999000Z",
          "side": "long",
          "entry_price": 66777.11,
          "exit_price": 66579.9992857143,
          "pnl_usd": -2.6953,
          "exit_reason": "sl",
          "proposal_id": "pp_c2d9e9951207c5dde111ec73"
        },
        {
          "opened_ts": "2026-06-03T15:04:59.999000Z",
          "closed_ts": "2026-06-03T15:09:59.999000Z",
          "side": "long",
          "entry_price": 66760.0,
          "exit_price": 66588.23285714287,
          "pnl_usd": -2.4183,
          "exit_reason": "sl",
          "proposal_id": "pp_061c2c94487e1bac92b395f7"
        },
        {
          "opened_ts": "2026-06-03T15:09:59.999000Z",
          "closed_ts": "2026-06-03T15:19:59.999000Z",
          "side": "long",
          "entry_price": 66580.94,
          "exit_price": 66406.30071428572,
          "pnl_usd": -2.4533,
          "exit_reason": "sl",
          "proposal_id": "pp_5ea7b3260bcb21d89f100487"
        },
        {
          "opened_ts": "2026-06-03T15:09:59.999000Z",
          "closed_ts": "2026-06-03T15:19:59.999000Z",
          "side": "long",
          "entry_price": 66580.94,
          "exit_price": 66406.30071428572,
          "pnl_usd": -2.4532,
          "exit_reason": "sl",
          "proposal_id": "pp_d99b5394406d7492d2f63a92"
        },
        {
          "opened_ts": "2026-06-03T15:19:59.999000Z",
          "closed_ts": "2026-06-03T15:29:59.999000Z",
          "side": "long",
          "entry_price": 66356.49,
          "exit_price": 66627.20142857142,
          "pnl_usd": 2.4203,
          "exit_reason": "tp",
          "proposal_id": "pp_229b5b4dc8169aea67ffc9fe"
        },
        {
          "opened_ts": "2026-06-03T15:19:59.999000Z",
          "closed_ts": "2026-06-03T15:29:59.999000Z",
          "side": "long",
          "entry_price": 66356.49,
          "exit_price": 66627.20142857142,
          "pnl_usd": 2.4202,
          "exit_reason": "tp",
          "proposal_id": "pp_d99b5394406d7492d2f63a92"
        },
        {
          "opened_ts": "2026-06-03T15:29:59.999000Z",
          "closed_ts": "2026-06-03T15:34:59.999000Z",
          "side": "long",
          "entry_price": 66597.74,
          "exit_price": 66409.99142857143,
          "pnl_usd": -2.5954,
          "exit_reason": "sl",
          "proposal_id": "pp_abbcc8ee3a3b3322f3d4c36b"
        },
        {
          "opened_ts": "2026-06-03T15:29:59.999000Z",
          "closed_ts": "2026-06-03T15:34:59.999000Z",
          "side": "long",
          "entry_price": 66597.74,
          "exit_price": 66409.99142857143,
          "pnl_usd": -2.5952,
          "exit_reason": "sl",
          "proposal_id": "pp_d99b5394406d7492d2f63a92"
        },
        {
          "opened_ts": "2026-06-03T15:34:59.999000Z",
          "closed_ts": "2026-06-03T15:49:59.999000Z",
          "side": "long",
          "entry_price": 66349.99,
          "exit_price": 66148.76071428572,
          "pnl_usd": -2.749,
          "exit_reason": "sl",
          "proposal_id": "pp_d99b5394406d7492d2f63a92"
        },
        {
          "opened_ts": "2026-06-03T15:49:59.999000Z",
          "closed_ts": "2026-06-03T15:59:59.999000Z",
          "side": "long",
          "entry_price": 66309.19,
          "exit_price": 66106.37857142858,
          "pnl_usd": -2.7666,
          "exit_reason": "sl",
          "proposal_id": "pp_d99b5394406d7492d2f63a92"
        },
        {
          "opened_ts": "2026-06-03T15:34:59.999000Z",
          "closed_ts": "2026-06-03T16:04:59.999000Z",
          "side": "short",
          "entry_price": 66349.99,
          "exit_price": 66048.14607142858,
          "pnl_usd": 2.0816,
          "exit_reason": "tp",
          "proposal_id": "pp_aee824fb6bb72566aa69135d"
        },
        {
          "opened_ts": "2026-06-03T15:59:59.999000Z",
          "closed_ts": "2026-06-03T16:24:59.999000Z",
          "side": "long",
          "entry_price": 66076.01,
          "exit_price": 65872.2007142857,
          "pnl_usd": -2.7845,
          "exit_reason": "sl",
          "proposal_id": "pp_d99b5394406d7492d2f63a92"
        },
        {
          "opened_ts": "2026-06-03T16:04:59.999000Z",
          "closed_ts": "2026-06-03T16:24:59.999000Z",
          "side": "short",
          "entry_price": 66179.23,
          "exit_price": 65861.08321428571,
          "pnl_usd": 2.9468,
          "exit_reason": "tp",
          "proposal_id": "pp_06c341e1d43ebf32697f309e"
        },
        {
          "opened_ts": "2026-06-03T16:24:59.999000Z",
          "closed_ts": "2026-06-03T16:39:59.999000Z",
          "side": "short",
          "entry_price": 65633.69,
          "exit_price": 65897.11714285714,
          "pnl_usd": -3.4596,
          "exit_reason": "sl",
          "proposal_id": "pp_06c341e1d43ebf32697f309e"
        },
        {
          "opened_ts": "2026-06-03T16:29:59.999000Z",
          "closed_ts": "2026-06-03T16:39:59.999000Z",
          "side": "short",
          "entry_price": 65606.94,
          "exit_price": 65870.94571428571,
          "pnl_usd": -2.4988,
          "exit_reason": "sl",
          "proposal_id": "pp_26f8b90cec6f27cc85df28ad"
        },
        {
          "opened_ts": "2026-06-03T16:39:59.999000Z",
          "closed_ts": "2026-06-03T16:54:59.999000Z",
          "side": "long",
          "entry_price": 65897.41,
          "exit_price": 65950.0,
          "pnl_usd": 0.0349,
          "exit_reason": "time_stop",
          "proposal_id": "pp_b4a6103372e2cb4940ff4d3c"
        },
        {
          "opened_ts": "2026-06-03T16:54:59.999000Z",
          "closed_ts": "2026-06-03T17:09:59.999000Z",
          "side": "long",
          "entry_price": 65950.0,
          "exit_price": 65750.62,
          "pnl_usd": -2.7381,
          "exit_reason": "time_stop",
          "proposal_id": "pp_9a3630a22e3bb4970cdfe91f"
        },
        {
          "opened_ts": "2026-06-03T17:09:59.999000Z",
          "closed_ts": "2026-06-03T17:24:59.999000Z",
          "side": "long",
          "entry_price": 65750.62,
          "exit_price": 65819.11,
          "pnl_usd": 0.2116,
          "exit_reason": "time_stop",
          "proposal_id": "pp_0b34f24818a0d479968b0c31"
        },
        {
          "opened_ts": "2026-06-03T16:39:59.999000Z",
          "closed_ts": "2026-06-03T17:34:59.999000Z",
          "side": "short",
          "entry_price": 65897.41,
          "exit_price": 66156.96214285714,
          "pnl_usd": -3.4026,
          "exit_reason": "sl",
          "proposal_id": "pp_06c341e1d43ebf32697f309e"
        },
        {
          "opened_ts": "2026-06-03T17:24:59.999000Z",
          "closed_ts": "2026-06-03T17:34:59.999000Z",
          "side": "long",
          "entry_price": 65819.11,
          "exit_price": 66141.66678571429,
          "pnl_usd": 2.2584,
          "exit_reason": "tp",
          "proposal_id": "pp_45fe31b61f97f6436a675879"
        },
        {
          "opened_ts": "2026-06-03T17:34:59.999000Z",
          "closed_ts": "2026-06-03T17:49:59.999000Z",
          "side": "long",
          "entry_price": 66164.01,
          "exit_price": 65965.30571428571,
          "pnl_usd": -2.0418,
          "exit_reason": "sl",
          "proposal_id": "pp_45fe31b61f97f6436a675879"
        },
        {
          "opened_ts": "2026-06-03T17:34:59.999000Z",
          "closed_ts": "2026-06-03T17:54:59.999000Z",
          "side": "short",
          "entry_price": 66164.01,
          "exit_price": 65865.95357142856,
          "pnl_usd": 2.7232,
          "exit_reason": "tp",
          "proposal_id": "pp_06c341e1d43ebf32697f309e"
        },
        {
          "opened_ts": "2026-06-03T17:49:59.999000Z",
          "closed_ts": "2026-06-03T18:04:59.999000Z",
          "side": "long",
          "entry_price": 65954.28,
          "exit_price": 66014.01,
          "pnl_usd": 0.1128,
          "exit_reason": "time_stop",
          "proposal_id": "pp_315b8755c74a6d894fe86b75"
        },
        {
          "opened_ts": "2026-06-03T17:54:59.999000Z",
          "closed_ts": "2026-06-03T18:09:59.999000Z",
          "side": "long",
          "entry_price": 65894.0,
          "exit_price": 66054.24,
          "pnl_usd": 1.2197,
          "exit_reason": "time_stop",
          "proposal_id": "pp_1ed70a3c8935d267dff68ef0"
        },
        {
          "opened_ts": "2026-06-03T18:09:59.999000Z",
          "closed_ts": "2026-06-03T18:14:59.999000Z",
          "side": "long",
          "entry_price": 66054.24,
          "exit_price": 65887.73785714286,
          "pnl_usd": -2.372,
          "exit_reason": "sl",
          "proposal_id": "pp_af84d758f28274a65b258b65"
        },
        {
          "opened_ts": "2026-06-03T18:04:59.999000Z",
          "closed_ts": "2026-06-03T18:19:59.999000Z",
          "side": "long",
          "entry_price": 66014.01,
          "exit_price": 65843.19285714286,
          "pnl_usd": -2.4204,
          "exit_reason": "sl",
          "proposal_id": "pp_3c9dc7b4b7ee8246e1faa610"
        },
        {
          "opened_ts": "2026-06-03T18:14:59.999000Z",
          "closed_ts": "2026-06-03T18:19:59.999000Z",
          "side": "long",
          "entry_price": 65972.81,
          "exit_price": 65809.215,
          "pnl_usd": -2.3416,
          "exit_reason": "sl",
          "proposal_id": "pp_7e4b14e9f405405ad2010e23"
        },
        {
          "opened_ts": "2026-06-03T18:19:59.999000Z",
          "closed_ts": "2026-06-03T18:34:59.999000Z",
          "side": "long",
          "entry_price": 65813.84,
          "exit_price": 65866.09,
          "pnl_usd": 0.0318,
          "exit_reason": "time_stop",
          "proposal_id": "pp_283652b7446a6a045531b73a"
        },
        {
          "opened_ts": "2026-06-03T18:19:59.999000Z",
          "closed_ts": "2026-06-03T18:44:59.999000Z",
          "side": "long",
          "entry_price": 65813.84,
          "exit_price": 66063.26321428572,
          "pnl_usd": 2.2026,
          "exit_reason": "tp",
          "proposal_id": "pp_db5caf66eb13e399ca78318f"
        },
        {
          "opened_ts": "2026-06-03T18:34:59.999000Z",
          "closed_ts": "2026-06-03T18:44:59.999000Z",
          "side": "long",
          "entry_price": 65866.09,
          "exit_price": 66096.22642857143,
          "pnl_usd": 1.9881,
          "exit_reason": "tp",
          "proposal_id": "pp_3ed77131032665061c08fc08"
        },
        {
          "opened_ts": "2026-06-03T18:44:59.999000Z",
          "closed_ts": "2026-06-03T18:59:59.999000Z",
          "side": "long",
          "entry_price": 66044.17,
          "exit_price": 66036.57,
          "pnl_usd": -0.627,
          "exit_reason": "time_stop",
          "proposal_id": "pp_c168401cbcb525757ec0fa68"
        },
        {
          "opened_ts": "2026-06-03T18:44:59.999000Z",
          "closed_ts": "2026-06-03T19:14:59.999000Z",
          "side": "long",
          "entry_price": 66044.17,
          "exit_price": 65902.74571428572,
          "pnl_usd": -2.0956,
          "exit_reason": "sl",
          "proposal_id": "pp_db5caf66eb13e399ca78318f"
        },
        {
          "opened_ts": "2026-06-03T18:59:59.999000Z",
          "closed_ts": "2026-06-03T19:14:59.999000Z",
          "side": "long",
          "entry_price": 66036.57,
          "exit_price": 65970.02,
          "pnl_usd": -1.2738,
          "exit_reason": "time_stop",
          "proposal_id": "pp_acbfe9c3ce76fe253b29baef"
        },
        {
          "opened_ts": "2026-06-03T19:14:59.999000Z",
          "closed_ts": "2026-06-03T19:24:59.999000Z",
          "side": "long",
          "entry_price": 65970.02,
          "exit_price": 65846.2492857143,
          "pnl_usd": -1.9024,
          "exit_reason": "sl",
          "proposal_id": "pp_879cdbbe000d3f2aa2df469e"
        },
        {
          "opened_ts": "2026-06-03T19:14:59.999000Z",
          "closed_ts": "2026-06-03T19:24:59.999000Z",
          "side": "long",
          "entry_price": 65970.02,
          "exit_price": 65846.2492857143,
          "pnl_usd": -1.9023,
          "exit_reason": "sl",
          "proposal_id": "pp_78b08bff3e937b656c8e8129"
        },
        {
          "opened_ts": "2026-06-03T19:24:59.999000Z",
          "closed_ts": "2026-06-03T19:29:59.999000Z",
          "side": "long",
          "entry_price": 65745.11,
          "exit_price": 65612.16214285714,
          "pnl_usd": -2.0071,
          "exit_reason": "sl",
          "proposal_id": "pp_92a7d5f0063223916c942e1d"
        },
        {
          "opened_ts": "2026-06-03T19:24:59.999000Z",
          "closed_ts": "2026-06-03T19:29:59.999000Z",
          "side": "long",
          "entry_price": 65745.11,
          "exit_price": 65612.16214285714,
          "pnl_usd": -2.007,
          "exit_reason": "sl",
          "proposal_id": "pp_78b08bff3e937b656c8e8129"
        },
        {
          "opened_ts": "2026-06-03T19:29:59.999000Z",
          "closed_ts": "2026-06-03T19:44:59.999000Z",
          "side": "long",
          "entry_price": 65658.18,
          "exit_price": 65764.01,
          "pnl_usd": 0.6237,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f0339e53d861f1d195237b2f"
        },
        {
          "opened_ts": "2026-06-03T19:29:59.999000Z",
          "closed_ts": "2026-06-03T19:54:59.999000Z",
          "side": "long",
          "entry_price": 65658.18,
          "exit_price": 65528.718571428566,
          "pnl_usd": -1.9695,
          "exit_reason": "sl",
          "proposal_id": "pp_78b08bff3e937b656c8e8129"
        },
        {
          "opened_ts": "2026-06-03T19:44:59.999000Z",
          "closed_ts": "2026-06-03T19:54:59.999000Z",
          "side": "long",
          "entry_price": 65764.01,
          "exit_price": 65637.66785714285,
          "pnl_usd": -1.9329,
          "exit_reason": "sl",
          "proposal_id": "pp_0787913d97acc7d72e4ffcc9"
        },
        {
          "opened_ts": "2026-06-03T19:54:59.999000Z",
          "closed_ts": "2026-06-03T20:09:59.999000Z",
          "side": "long",
          "entry_price": 65359.31,
          "exit_price": 65389.99,
          "pnl_usd": -0.2029,
          "exit_reason": "time_stop",
          "proposal_id": "pp_891ca08d9129231ec95eb05c"
        },
        {
          "opened_ts": "2026-06-03T19:54:59.999000Z",
          "closed_ts": "2026-06-03T20:14:59.999000Z",
          "side": "long",
          "entry_price": 65359.31,
          "exit_price": 65566.5007142857,
          "pnl_usd": 1.7502,
          "exit_reason": "tp",
          "proposal_id": "pp_78b08bff3e937b656c8e8129"
        },
        {
          "opened_ts": "2026-06-03T20:14:59.999000Z",
          "closed_ts": "2026-06-03T20:19:59.999000Z",
          "side": "long",
          "entry_price": 65580.01,
          "exit_price": 65411.57785714285,
          "pnl_usd": -2.4001,
          "exit_reason": "sl",
          "proposal_id": "pp_0c88c09809bbafc02b70a547"
        },
        {
          "opened_ts": "2026-06-03T20:19:59.999000Z",
          "closed_ts": "2026-06-03T20:34:59.999000Z",
          "side": "long",
          "entry_price": 65340.84,
          "exit_price": 65486.0,
          "pnl_usd": 0.7867,
          "exit_reason": "time_stop",
          "proposal_id": "pp_07fa30b31e0e0d21fd990ae5"
        },
        {
          "opened_ts": "2026-06-03T20:09:59.999000Z",
          "closed_ts": "2026-06-03T20:44:59.999000Z",
          "side": "long",
          "entry_price": 65389.99,
          "exit_price": 65232.82,
          "pnl_usd": -2.2806,
          "exit_reason": "sl",
          "proposal_id": "pp_a38fc751323c34c7f7e4f6e4"
        },
        {
          "opened_ts": "2026-06-03T20:34:59.999000Z",
          "closed_ts": "2026-06-03T20:44:59.999000Z",
          "side": "short",
          "entry_price": 65486.0,
          "exit_price": 65220.35107142857,
          "pnl_usd": 1.6271,
          "exit_reason": "tp",
          "proposal_id": "pp_6ebfde6a688bc998c8c10622"
        },
        {
          "opened_ts": "2026-06-03T20:44:59.999000Z",
          "closed_ts": "2026-06-03T20:59:59.999000Z",
          "side": "long",
          "entry_price": 65190.63,
          "exit_price": 65007.87857142857,
          "pnl_usd": -2.5691,
          "exit_reason": "sl",
          "proposal_id": "pp_a38fc751323c34c7f7e4f6e4"
        },
        {
          "opened_ts": "2026-06-03T20:44:59.999000Z",
          "closed_ts": "2026-06-03T20:59:59.999000Z",
          "side": "short",
          "entry_price": 65190.63,
          "exit_price": 64916.502857142856,
          "pnl_usd": 2.4978,
          "exit_reason": "tp",
          "proposal_id": "pp_06c341e1d43ebf32697f309e"
        },
        {
          "opened_ts": "2026-06-03T20:59:59.999000Z",
          "closed_ts": "2026-06-03T21:04:59.999000Z",
          "side": "long",
          "entry_price": 65007.27,
          "exit_price": 65314.40892857142,
          "pnl_usd": 2.8734,
          "exit_reason": "tp",
          "proposal_id": "pp_b84ea0f3408308339b158572"
        },
        {
          "opened_ts": "2026-06-03T20:59:59.999000Z",
          "closed_ts": "2026-06-03T21:04:59.999000Z",
          "side": "long",
          "entry_price": 65007.27,
          "exit_price": 65314.40892857142,
          "pnl_usd": 2.8732,
          "exit_reason": "tp",
          "proposal_id": "pp_a38fc751323c34c7f7e4f6e4"
        },
        {
          "opened_ts": "2026-06-03T21:04:59.999000Z",
          "closed_ts": "2026-06-03T21:09:59.999000Z",
          "side": "short",
          "entry_price": 65277.15,
          "exit_price": 65486.23142857143,
          "pnl_usd": -2.859,
          "exit_reason": "sl",
          "proposal_id": "pp_f5a1365c0eb78a8b008b4a47"
        },
        {
          "opened_ts": "2026-06-03T21:09:59.999000Z",
          "closed_ts": "2026-06-03T21:24:59.999000Z",
          "side": "short",
          "entry_price": 65528.01,
          "exit_price": 65526.71,
          "pnl_usd": -0.4305,
          "exit_reason": "time_stop",
          "proposal_id": "pp_16efcc1d8ef128d40a3e3de3"
        },
        {
          "opened_ts": "2026-06-03T21:04:59.999000Z",
          "closed_ts": "2026-06-03T21:29:59.999000Z",
          "side": "long",
          "entry_price": 65277.15,
          "exit_price": 65590.77214285714,
          "pnl_usd": 2.1711,
          "exit_reason": "tp",
          "proposal_id": "pp_c3fc413f45c1e1da30c86d9b"
        },
        {
          "opened_ts": "2026-06-03T21:24:59.999000Z",
          "closed_ts": "2026-06-03T21:44:59.999000Z",
          "side": "long",
          "entry_price": 65526.71,
          "exit_price": 65317.635714285716,
          "pnl_usd": -2.1092,
          "exit_reason": "sl",
          "proposal_id": "pp_c3fc413f45c1e1da30c86d9b"
        },
        {
          "opened_ts": "2026-06-03T21:29:59.999000Z",
          "closed_ts": "2026-06-03T21:44:59.999000Z",
          "side": "long",
          "entry_price": 65522.01,
          "exit_price": 65325.52285714286,
          "pnl_usd": -2.7105,
          "exit_reason": "sl",
          "proposal_id": "pp_7b9764255af5a286aefd4e32"
        },
        {
          "opened_ts": "2026-06-03T21:44:59.999000Z",
          "closed_ts": "2026-06-03T21:49:59.999000Z",
          "side": "long",
          "entry_price": 65518.0,
          "exit_price": 65848.80892857142,
          "pnl_usd": 3.1067,
          "exit_reason": "tp",
          "proposal_id": "pp_5c0838dafea9641b8fb282a1"
        },
        {
          "opened_ts": "2026-06-03T21:44:59.999000Z",
          "closed_ts": "2026-06-03T21:49:59.999000Z",
          "side": "long",
          "entry_price": 65518.0,
          "exit_price": 65848.80892857142,
          "pnl_usd": 2.3001,
          "exit_reason": "tp",
          "proposal_id": "pp_c3fc413f45c1e1da30c86d9b"
        },
        {
          "opened_ts": "2026-06-03T21:49:59.999000Z",
          "closed_ts": "2026-06-03T22:04:59.999000Z",
          "side": "long",
          "entry_price": 65774.78,
          "exit_price": 65539.81214285715,
          "pnl_usd": -3.1249,
          "exit_reason": "sl",
          "proposal_id": "pp_2eb1f0b28de199929b68f511"
        },
        {
          "opened_ts": "2026-06-03T21:49:59.999000Z",
          "closed_ts": "2026-06-03T22:04:59.999000Z",
          "side": "long",
          "entry_price": 65774.78,
          "exit_price": 65539.81214285715,
          "pnl_usd": -2.3136,
          "exit_reason": "sl",
          "proposal_id": "pp_c3fc413f45c1e1da30c86d9b"
        },
        {
          "opened_ts": "2026-06-03T22:04:59.999000Z",
          "closed_ts": "2026-06-03T22:19:59.999000Z",
          "side": "short",
          "entry_price": 65543.71,
          "exit_price": 65167.49607142858,
          "pnl_usd": 2.6362,
          "exit_reason": "tp",
          "proposal_id": "pp_e8a7358d7508ac4bb4a9572a"
        },
        {
          "opened_ts": "2026-06-03T22:04:59.999000Z",
          "closed_ts": "2026-06-03T22:19:59.999000Z",
          "side": "long",
          "entry_price": 65543.71,
          "exit_price": 65292.90071428572,
          "pnl_usd": -3.3065,
          "exit_reason": "sl",
          "proposal_id": "pp_1fcdad4024826b17b37ded12"
        },
        {
          "opened_ts": "2026-06-03T22:19:59.999000Z",
          "closed_ts": "2026-06-03T22:24:59.999000Z",
          "side": "long",
          "entry_price": 65275.05,
          "exit_price": 65049.20857142857,
          "pnl_usd": -2.5609,
          "exit_reason": "sl",
          "proposal_id": "pp_a5416d6d0893fecdbf06bc9d"
        },
        {
          "opened_ts": "2026-06-03T22:19:59.999000Z",
          "closed_ts": "2026-06-03T22:24:59.999000Z",
          "side": "long",
          "entry_price": 65275.05,
          "exit_price": 65049.20857142857,
          "pnl_usd": -3.041,
          "exit_reason": "sl",
          "proposal_id": "pp_1fcdad4024826b17b37ded12"
        },
        {
          "opened_ts": "2026-06-03T22:24:59.999000Z",
          "closed_ts": "2026-06-03T22:39:59.999000Z",
          "side": "long",
          "entry_price": 65234.01,
          "exit_price": 65001.525714285715,
          "pnl_usd": -3.1141,
          "exit_reason": "sl",
          "proposal_id": "pp_3ad79cafd66afb4b112cb0e9"
        },
        {
          "opened_ts": "2026-06-03T22:24:59.999000Z",
          "closed_ts": "2026-06-03T22:39:59.999000Z",
          "side": "long",
          "entry_price": 65234.01,
          "exit_price": 65001.525714285715,
          "pnl_usd": -3.1139,
          "exit_reason": "sl",
          "proposal_id": "pp_1fcdad4024826b17b37ded12"
        },
        {
          "opened_ts": "2026-06-03T22:39:59.999000Z",
          "closed_ts": "2026-06-03T22:54:59.999000Z",
          "side": "long",
          "entry_price": 65020.48,
          "exit_price": 64828.01,
          "pnl_usd": -2.6763,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f958954389f82ed2b05084f7"
        },
        {
          "opened_ts": "2026-06-03T22:39:59.999000Z",
          "closed_ts": "2026-06-03T23:04:59.999000Z",
          "side": "long",
          "entry_price": 65020.48,
          "exit_price": 64773.49142857143,
          "pnl_usd": -3.2809,
          "exit_reason": "sl",
          "proposal_id": "pp_1fcdad4024826b17b37ded12"
        },
        {
          "opened_ts": "2026-06-03T22:54:59.999000Z",
          "closed_ts": "2026-06-03T23:09:59.999000Z",
          "side": "short",
          "entry_price": 64828.01,
          "exit_price": 64471.426785714284,
          "pnl_usd": 2.8197,
          "exit_reason": "tp",
          "proposal_id": "pp_3b8ef22959b4b5d699b49ddd"
        },
        {
          "opened_ts": "2026-06-03T23:04:59.999000Z",
          "closed_ts": "2026-06-03T23:19:59.999000Z",
          "side": "long",
          "entry_price": 64650.0,
          "exit_price": 64403.96142857143,
          "pnl_usd": -3.2836,
          "exit_reason": "sl",
          "proposal_id": "pp_84752f0e9ef3aa22eee4125e"
        },
        {
          "opened_ts": "2026-06-03T23:09:59.999000Z",
          "closed_ts": "2026-06-03T23:24:59.999000Z",
          "side": "short",
          "entry_price": 64482.42,
          "exit_price": 64382.26,
          "pnl_usd": 0.5601,
          "exit_reason": "time_stop",
          "proposal_id": "pp_ffa15b76c03519e91bb5a26f"
        },
        {
          "opened_ts": "2026-06-03T23:19:59.999000Z",
          "closed_ts": "2026-06-03T23:34:59.999000Z",
          "side": "long",
          "entry_price": 64503.12,
          "exit_price": 64528.74,
          "pnl_usd": -0.2543,
          "exit_reason": "time_stop",
          "proposal_id": "pp_cdf984df65c346a99b379d99"
        },
        {
          "opened_ts": "2026-06-03T23:24:59.999000Z",
          "closed_ts": "2026-06-03T23:39:59.999000Z",
          "side": "short",
          "entry_price": 64382.26,
          "exit_price": 64312.51,
          "pnl_usd": 0.2127,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f84ca9c253c0404327649d3f"
        },
        {
          "opened_ts": "2026-06-03T23:34:59.999000Z",
          "closed_ts": "2026-06-03T23:39:59.999000Z",
          "side": "long",
          "entry_price": 64528.74,
          "exit_price": 64285.59642857143,
          "pnl_usd": -3.2557,
          "exit_reason": "sl",
          "proposal_id": "pp_6f7985a7c0f9c1286e5d94b2"
        },
        {
          "opened_ts": "2026-06-03T23:39:59.999000Z",
          "closed_ts": "2026-06-03T23:54:59.999000Z",
          "side": "long",
          "entry_price": 64312.51,
          "exit_price": 64094.0,
          "pnl_usd": -2.9877,
          "exit_reason": "time_stop",
          "proposal_id": "pp_956a8e0b02ff6cdbd16e2b2f"
        },
        {
          "opened_ts": "2026-06-03T23:54:59.999000Z",
          "closed_ts": "2026-06-04T00:09:59.999000Z",
          "side": "long",
          "entry_price": 64094.0,
          "exit_price": 64327.99,
          "pnl_usd": 2.0886,
          "exit_reason": "time_stop",
          "proposal_id": "pp_956a69d218e666e2759d484c"
        },
        {
          "opened_ts": "2026-06-03T23:39:59.999000Z",
          "closed_ts": "2026-06-04T00:24:59.999000Z",
          "side": "long",
          "entry_price": 64312.51,
          "exit_price": 64060.61928571429,
          "pnl_usd": -2.6834,
          "exit_reason": "sl",
          "proposal_id": "pp_0c063a6314eadf3a72132996"
        },
        {
          "opened_ts": "2026-06-04T00:09:59.999000Z",
          "closed_ts": "2026-06-04T00:24:59.999000Z",
          "side": "long",
          "entry_price": 64327.99,
          "exit_price": 64090.13428571429,
          "pnl_usd": -3.2029,
          "exit_reason": "sl",
          "proposal_id": "pp_7c8b1a358e86ddd7750d7cf6"
        },
        {
          "opened_ts": "2026-06-04T00:24:59.999000Z",
          "closed_ts": "2026-06-04T00:29:59.999000Z",
          "side": "long",
          "entry_price": 64016.0,
          "exit_price": 63808.932857142856,
          "pnl_usd": -2.8676,
          "exit_reason": "sl",
          "proposal_id": "pp_a593935c7799d62dbef1136d"
        },
        {
          "opened_ts": "2026-06-04T00:24:59.999000Z",
          "closed_ts": "2026-06-04T00:29:59.999000Z",
          "side": "long",
          "entry_price": 64016.0,
          "exit_price": 63808.932857142856,
          "pnl_usd": -2.1705,
          "exit_reason": "sl",
          "proposal_id": "pp_27fe38b1a5303bc1d5a150fe"
        },
        {
          "opened_ts": "2026-06-04T00:29:59.999000Z",
          "closed_ts": "2026-06-04T00:34:59.999000Z",
          "side": "short",
          "entry_price": 63358.01,
          "exit_price": 63594.25142857143,
          "pnl_usd": -3.139,
          "exit_reason": "sl",
          "proposal_id": "pp_c675c58263c3132ed2dace71"
        },
        {
          "opened_ts": "2026-06-04T00:29:59.999000Z",
          "closed_ts": "2026-06-04T00:34:59.999000Z",
          "side": "long",
          "entry_price": 63358.01,
          "exit_price": 63712.372142857144,
          "pnl_usd": 2.6364,
          "exit_reason": "tp",
          "proposal_id": "pp_27fe38b1a5303bc1d5a150fe"
        },
        {
          "opened_ts": "2026-06-04T00:34:59.999000Z",
          "closed_ts": "2026-06-04T00:39:59.999000Z",
          "side": "short",
          "entry_price": 63719.04,
          "exit_price": 63337.76678571429,
          "pnl_usd": 3.0319,
          "exit_reason": "tp",
          "proposal_id": "pp_db42d1143552e60f981a2753"
        },
        {
          "opened_ts": "2026-06-04T00:34:59.999000Z",
          "closed_ts": "2026-06-04T00:39:59.999000Z",
          "side": "long",
          "entry_price": 63719.04,
          "exit_price": 63464.85785714286,
          "pnl_usd": -2.5795,
          "exit_reason": "sl",
          "proposal_id": "pp_27fe38b1a5303bc1d5a150fe"
        },
        {
          "opened_ts": "2026-06-04T00:39:59.999000Z",
          "closed_ts": "2026-06-04T00:44:59.999000Z",
          "side": "long",
          "entry_price": 63127.29,
          "exit_price": 63572.184642857144,
          "pnl_usd": 4.5285,
          "exit_reason": "tp",
          "proposal_id": "pp_6df600d5d25c7f1f4c7bd0ac"
        },
        {
          "opened_ts": "2026-06-04T00:39:59.999000Z",
          "closed_ts": "2026-06-04T00:44:59.999000Z",
          "side": "long",
          "entry_price": 63127.29,
          "exit_price": 63572.184642857144,
          "pnl_usd": 3.4276,
          "exit_reason": "tp",
          "proposal_id": "pp_27fe38b1a5303bc1d5a150fe"
        },
        {
          "opened_ts": "2026-06-04T00:44:59.999000Z",
          "closed_ts": "2026-06-04T00:49:59.999000Z",
          "side": "long",
          "entry_price": 63595.33,
          "exit_price": 63274.16428571429,
          "pnl_usd": -3.1592,
          "exit_reason": "sl",
          "proposal_id": "pp_27fe38b1a5303bc1d5a150fe"
        },
        {
          "opened_ts": "2026-06-04T00:44:59.999000Z",
          "closed_ts": "2026-06-04T00:54:59.999000Z",
          "side": "short",
          "entry_price": 63595.33,
          "exit_price": 63113.58142857143,
          "pnl_usd": 4.891,
          "exit_reason": "tp",
          "proposal_id": "pp_82458ad9a6b04292f78a1d08"
        },
        {
          "opened_ts": "2026-06-04T00:49:59.999000Z",
          "closed_ts": "2026-06-04T01:04:59.999000Z",
          "side": "long",
          "entry_price": 63252.01,
          "exit_price": 63387.18,
          "pnl_usd": 0.9977,
          "exit_reason": "time_stop",
          "proposal_id": "pp_a007c885daabfc624fb68fe9"
        },
        {
          "opened_ts": "2026-06-04T00:54:59.999000Z",
          "closed_ts": "2026-06-04T01:09:59.999000Z",
          "side": "short",
          "entry_price": 63178.07,
          "exit_price": 63316.0,
          "pnl_usd": -2.1108,
          "exit_reason": "time_stop",
          "proposal_id": "pp_5e34cf09b16fea78a0b34f1d"
        },
        {
          "opened_ts": "2026-06-04T01:04:59.999000Z",
          "closed_ts": "2026-06-04T01:19:59.999000Z",
          "side": "long",
          "entry_price": 63387.18,
          "exit_price": 63027.01642857143,
          "pnl_usd": -4.6289,
          "exit_reason": "sl",
          "proposal_id": "pp_7b44ea0f6525b9832255137f"
        },
        {
          "opened_ts": "2026-06-04T01:09:59.999000Z",
          "closed_ts": "2026-06-04T01:19:59.999000Z",
          "side": "long",
          "entry_price": 63316.0,
          "exit_price": 62940.154285714285,
          "pnl_usd": -4.8104,
          "exit_reason": "sl",
          "proposal_id": "pp_cc85a4044be9d8422c878b8d"
        },
        {
          "opened_ts": "2026-06-04T01:19:59.999000Z",
          "closed_ts": "2026-06-04T01:34:59.999000Z",
          "side": "short",
          "entry_price": 62885.64,
          "exit_price": 62905.21,
          "pnl_usd": -0.6127,
          "exit_reason": "time_stop",
          "proposal_id": "pp_e8aaa079fd3233061fb238d5"
        },
        {
          "opened_ts": "2026-06-04T01:34:59.999000Z",
          "closed_ts": "2026-06-04T01:49:59.999000Z",
          "side": "long",
          "entry_price": 62905.21,
          "exit_price": 62508.75,
          "pnl_usd": -5.0679,
          "exit_reason": "time_stop",
          "proposal_id": "pp_90136edf3910e7b279bbe20d"
        },
        {
          "opened_ts": "2026-06-04T01:19:59.999000Z",
          "closed_ts": "2026-06-04T01:54:59.999000Z",
          "side": "short",
          "entry_price": 62885.64,
          "exit_price": 62314.74428571428,
          "pnl_usd": 5.9855,
          "exit_reason": "tp",
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550"
        },
        {
          "opened_ts": "2026-06-04T01:49:59.999000Z",
          "closed_ts": "2026-06-04T01:59:59.999000Z",
          "side": "long",
          "entry_price": 62508.75,
          "exit_price": 62166.256428571425,
          "pnl_usd": -4.1734,
          "exit_reason": "sl",
          "proposal_id": "pp_2aaa04ec8ae889d04407c353"
        },
        {
          "opened_ts": "2026-06-04T01:54:59.999000Z",
          "closed_ts": "2026-06-04T02:04:59.999000Z",
          "side": "short",
          "entry_price": 62247.34,
          "exit_price": 61752.63785714285,
          "pnl_usd": 3.9042,
          "exit_reason": "tp",
          "proposal_id": "pp_477a406c7904666628a12e6e"
        },
        {
          "opened_ts": "2026-06-04T01:59:59.999000Z",
          "closed_ts": "2026-06-04T02:04:59.999000Z",
          "side": "short",
          "entry_price": 62178.1,
          "exit_price": 61701.09357142857,
          "pnl_usd": 4.6655,
          "exit_reason": "tp",
          "proposal_id": "pp_6a10e4653396b9743a53c924"
        },
        {
          "opened_ts": "2026-06-04T02:04:59.999000Z",
          "closed_ts": "2026-06-04T02:09:59.999000Z",
          "side": "short",
          "entry_price": 61466.67,
          "exit_price": 61818.92642857142,
          "pnl_usd": -3.3691,
          "exit_reason": "sl",
          "proposal_id": "pp_cd4d76c45fef7f1faccf86ff"
        },
        {
          "opened_ts": "2026-06-04T02:04:59.999000Z",
          "closed_ts": "2026-06-04T02:09:59.999000Z",
          "side": "short",
          "entry_price": 61466.67,
          "exit_price": 61818.92642857142,
          "pnl_usd": -4.6586,
          "exit_reason": "sl",
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550"
        },
        {
          "opened_ts": "2026-06-04T02:09:59.999000Z",
          "closed_ts": "2026-06-04T02:14:59.999000Z",
          "side": "short",
          "entry_price": 62022.25,
          "exit_price": 62424.58285714286,
          "pnl_usd": -5.1974,
          "exit_reason": "sl",
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550"
        },
        {
          "opened_ts": "2026-06-04T02:14:59.999000Z",
          "closed_ts": "2026-06-04T02:24:59.999000Z",
          "side": "long",
          "entry_price": 62402.13,
          "exit_price": 63030.6375,
          "pnl_usd": 6.6908,
          "exit_reason": "tp",
          "proposal_id": "pp_862a315e59198a57984480ea"
        },
        {
          "opened_ts": "2026-06-04T02:14:59.999000Z",
          "closed_ts": "2026-06-04T02:24:59.999000Z",
          "side": "short",
          "entry_price": 62402.13,
          "exit_price": 62821.134999999995,
          "pnl_usd": -5.3574,
          "exit_reason": "sl",
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550"
        },
        {
          "opened_ts": "2026-06-04T02:24:59.999000Z",
          "closed_ts": "2026-06-04T02:39:59.999000Z",
          "side": "short",
          "entry_price": 63026.88,
          "exit_price": 63347.43,
          "pnl_usd": -4.1889,
          "exit_reason": "time_stop",
          "proposal_id": "pp_8618d49e31da341a640bd290"
        },
        {
          "opened_ts": "2026-06-04T02:24:59.999000Z",
          "closed_ts": "2026-06-04T02:44:59.999000Z",
          "side": "short",
          "entry_price": 63026.88,
          "exit_price": 63476.274999999994,
          "pnl_usd": -5.6559,
          "exit_reason": "sl",
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550"
        },
        {
          "opened_ts": "2026-06-04T02:39:59.999000Z",
          "closed_ts": "2026-06-04T02:54:59.999000Z",
          "side": "short",
          "entry_price": 63347.43,
          "exit_price": 63287.43,
          "pnl_usd": 0.1414,
          "exit_reason": "time_stop",
          "proposal_id": "pp_d6ed538f6b0ce7378657537d"
        },
        {
          "opened_ts": "2026-06-04T02:44:59.999000Z",
          "closed_ts": "2026-06-04T02:59:59.999000Z",
          "side": "short",
          "entry_price": 63410.0,
          "exit_price": 63231.99,
          "pnl_usd": 1.4749,
          "exit_reason": "time_stop",
          "proposal_id": "pp_1605503935ba95fc4b5268c9"
        },
        {
          "opened_ts": "2026-06-04T02:54:59.999000Z",
          "closed_ts": "2026-06-04T03:04:59.999000Z",
          "side": "short",
          "entry_price": 63287.43,
          "exit_price": 63739.88785714286,
          "pnl_usd": -5.6628,
          "exit_reason": "sl",
          "proposal_id": "pp_d7c81fcb82fb1b6803172233"
        },
        {
          "opened_ts": "2026-06-04T02:59:59.999000Z",
          "closed_ts": "2026-06-04T03:09:59.999000Z",
          "side": "long",
          "entry_price": 63231.99,
          "exit_price": 63889.40571428571,
          "pnl_usd": 5.4477,
          "exit_reason": "tp",
          "proposal_id": "pp_04eda0e4e1817281852774cb"
        },
        {
          "opened_ts": "2026-06-04T03:04:59.999000Z",
          "closed_ts": "2026-06-04T03:19:59.999000Z",
          "side": "short",
          "entry_price": 63714.05,
          "exit_price": 64075.99,
          "pnl_usd": -4.6076,
          "exit_reason": "time_stop",
          "proposal_id": "pp_c5234c2785fbe16cd2ce95d1"
        },
        {
          "opened_ts": "2026-06-04T03:09:59.999000Z",
          "closed_ts": "2026-06-04T03:24:59.999000Z",
          "side": "short",
          "entry_price": 63813.08,
          "exit_price": 63907.72,
          "pnl_usd": -1.6008,
          "exit_reason": "time_stop",
          "proposal_id": "pp_8a5dcfa760f90f6fb83c421a"
        },
        {
          "opened_ts": "2026-06-04T03:19:59.999000Z",
          "closed_ts": "2026-06-04T03:34:59.999000Z",
          "side": "short",
          "entry_price": 64075.99,
          "exit_price": 64440.822857142855,
          "pnl_usd": -4.6168,
          "exit_reason": "sl",
          "proposal_id": "pp_0e03a7ce86e92d83aee980d3"
        },
        {
          "opened_ts": "2026-06-04T03:24:59.999000Z",
          "closed_ts": "2026-06-04T03:34:59.999000Z",
          "side": "short",
          "entry_price": 63907.72,
          "exit_price": 64249.14071428571,
          "pnl_usd": -4.3641,
          "exit_reason": "sl",
          "proposal_id": "pp_e75baffefd74c164a3a3ccbc"
        },
        {
          "opened_ts": "2026-06-04T03:34:59.999000Z",
          "closed_ts": "2026-06-04T05:04:59.999000Z",
          "side": "long",
          "entry_price": 64454.0,
          "exit_price": 64133.035,
          "pnl_usd": -3.8556,
          "exit_reason": "sl",
          "proposal_id": "pp_e07f058a3178936959be2f59"
        },
        {
          "opened_ts": "2026-06-04T03:34:59.999000Z",
          "closed_ts": "2026-06-04T05:09:59.999000Z",
          "side": "short",
          "entry_price": 64454.0,
          "exit_price": 63972.552500000005,
          "pnl_usd": 4.8083,
          "exit_reason": "tp",
          "proposal_id": "pp_a2963ab9d7c9de971ebbb550"
        },
        {
          "opened_ts": "2026-06-04T05:04:59.999000Z",
          "closed_ts": "2026-06-04T05:09:59.999000Z",
          "side": "long",
          "entry_price": 64022.75,
          "exit_price": 63809.27857142857,
          "pnl_usd": -2.7504,
          "exit_reason": "sl",
          "proposal_id": "pp_48df99f323c7b62b66db4578"
        },
        {
          "opened_ts": "2026-06-04T05:09:59.999000Z",
          "closed_ts": "2026-06-04T05:24:59.999000Z",
          "side": "short",
          "entry_price": 63828.17,
          "exit_price": 63826.0,
          "pnl_usd": -0.3535,
          "exit_reason": "time_stop",
          "proposal_id": "pp_12c22b0815a39c421fa97c96"
        },
        {
          "opened_ts": "2026-06-04T05:09:59.999000Z",
          "closed_ts": "2026-06-04T05:34:59.999000Z",
          "side": "long",
          "entry_price": 63828.17,
          "exit_price": 64160.29892857143,
          "pnl_usd": 2.8376,
          "exit_reason": "tp",
          "proposal_id": "pp_7b024c284407510abeaf6a3e"
        },
        {
          "opened_ts": "2026-06-04T05:24:59.999000Z",
          "closed_ts": "2026-06-04T05:34:59.999000Z",
          "side": "short",
          "entry_price": 63826.0,
          "exit_price": 64042.69928571428,
          "pnl_usd": -2.9649,
          "exit_reason": "sl",
          "proposal_id": "pp_1285299eaa6d8d7fc560e06d"
        },
        {
          "opened_ts": "2026-06-04T05:34:59.999000Z",
          "closed_ts": "2026-06-04T05:49:59.999000Z",
          "side": "long",
          "entry_price": 64226.0,
          "exit_price": 64098.0,
          "pnl_usd": -1.9618,
          "exit_reason": "time_stop",
          "proposal_id": "pp_01970f5f410b2661248543a0"
        },
        {
          "opened_ts": "2026-06-04T05:34:59.999000Z",
          "closed_ts": "2026-06-04T05:54:59.999000Z",
          "side": "long",
          "entry_price": 64226.0,
          "exit_price": 63996.02785714286,
          "pnl_usd": -2.7588,
          "exit_reason": "sl",
          "proposal_id": "pp_7b024c284407510abeaf6a3e"
        },
        {
          "opened_ts": "2026-06-04T05:49:59.999000Z",
          "closed_ts": "2026-06-04T06:04:59.999000Z",
          "side": "short",
          "entry_price": 64098.0,
          "exit_price": 64152.49,
          "pnl_usd": -1.1441,
          "exit_reason": "time_stop",
          "proposal_id": "pp_eeadb3ef00b2f48d90a8e4bd"
        },
        {
          "opened_ts": "2026-06-04T05:54:59.999000Z",
          "closed_ts": "2026-06-04T06:09:59.999000Z",
          "side": "long",
          "entry_price": 64033.99,
          "exit_price": 64233.99,
          "pnl_usd": 1.5874,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f39fa6c1eab9784d610ad2bc"
        },
        {
          "opened_ts": "2026-06-04T06:04:59.999000Z",
          "closed_ts": "2026-06-04T06:19:59.999000Z",
          "side": "short",
          "entry_price": 64152.49,
          "exit_price": 64385.01071428571,
          "pnl_usd": -3.1261,
          "exit_reason": "sl",
          "proposal_id": "pp_ef9aeb2c714c0285c81aa643"
        },
        {
          "opened_ts": "2026-06-04T06:09:59.999000Z",
          "closed_ts": "2026-06-04T06:24:59.999000Z",
          "side": "long",
          "entry_price": 64233.99,
          "exit_price": 64267.26,
          "pnl_usd": -0.1658,
          "exit_reason": "time_stop",
          "proposal_id": "pp_065ee25381fb75fac3a4084b"
        },
        {
          "opened_ts": "2026-06-04T06:19:59.999000Z",
          "closed_ts": "2026-06-04T06:34:59.999000Z",
          "side": "long",
          "entry_price": 64366.01,
          "exit_price": 64153.72428571429,
          "pnl_usd": -2.8921,
          "exit_reason": "sl",
          "proposal_id": "pp_7e7e2ed555456e468a3d012c"
        },
        {
          "opened_ts": "2026-06-04T06:24:59.999000Z",
          "closed_ts": "2026-06-04T06:39:59.999000Z",
          "side": "short",
          "entry_price": 64267.26,
          "exit_price": 64368.0,
          "pnl_usd": -1.4615,
          "exit_reason": "time_stop",
          "proposal_id": "pp_13536dcb0dc018da6a9364ac"
        },
        {
          "opened_ts": "2026-06-04T06:34:59.999000Z",
          "closed_ts": "2026-06-04T06:49:59.999000Z",
          "side": "long",
          "entry_price": 64146.27,
          "exit_price": 64184.01,
          "pnl_usd": -0.1154,
          "exit_reason": "time_stop",
          "proposal_id": "pp_15b96976864d8336bd153b8d"
        },
        {
          "opened_ts": "2026-06-04T06:39:59.999000Z",
          "closed_ts": "2026-06-04T06:54:59.999000Z",
          "side": "long",
          "entry_price": 64368.0,
          "exit_price": 64158.70285714286,
          "pnl_usd": -2.2744,
          "exit_reason": "sl",
          "proposal_id": "pp_d0e7d97a70385e707b88fc71"
        },
        {
          "opened_ts": "2026-06-04T06:49:59.999000Z",
          "closed_ts": "2026-06-04T06:59:59.999000Z",
          "side": "long",
          "entry_price": 64184.01,
          "exit_price": 64007.37357142857,
          "pnl_usd": -2.5002,
          "exit_reason": "sl",
          "proposal_id": "pp_006740112a10d527aade2f5d"
        },
        {
          "opened_ts": "2026-06-04T06:54:59.999000Z",
          "closed_ts": "2026-06-04T07:04:59.999000Z",
          "side": "long",
          "entry_price": 64082.0,
          "exit_price": 63905.035,
          "pnl_usd": -2.5062,
          "exit_reason": "sl",
          "proposal_id": "pp_e9546f949cb91c8640bf80e4"
        },
        {
          "opened_ts": "2026-06-04T06:59:59.999000Z",
          "closed_ts": "2026-06-04T07:09:59.999000Z",
          "side": "long",
          "entry_price": 64027.99,
          "exit_price": 63857.76928571428,
          "pnl_usd": -2.432,
          "exit_reason": "sl",
          "proposal_id": "pp_da2a53a7a2b0bb22facd5d5c"
        },
        {
          "opened_ts": "2026-06-04T07:04:59.999000Z",
          "closed_ts": "2026-06-04T07:14:59.999000Z",
          "side": "long",
          "entry_price": 63895.99,
          "exit_price": 63724.032857142854,
          "pnl_usd": -2.4545,
          "exit_reason": "sl",
          "proposal_id": "pp_a52ebb92e8f1a879a59583e7"
        },
        {
          "opened_ts": "2026-06-04T07:09:59.999000Z",
          "closed_ts": "2026-06-04T07:14:59.999000Z",
          "side": "long",
          "entry_price": 63895.97,
          "exit_price": 63722.33928571429,
          "pnl_usd": -2.4724,
          "exit_reason": "sl",
          "proposal_id": "pp_a6d738112b58aa9594fada61"
        },
        {
          "opened_ts": "2026-06-04T07:14:59.999000Z",
          "closed_ts": "2026-06-04T07:19:59.999000Z",
          "side": "long",
          "entry_price": 63811.2,
          "exit_price": 63642.14357142857,
          "pnl_usd": -2.4225,
          "exit_reason": "sl",
          "proposal_id": "pp_47e7a780d21be30b942150a0"
        },
        {
          "opened_ts": "2026-06-04T07:14:59.999000Z",
          "closed_ts": "2026-06-04T07:19:59.999000Z",
          "side": "long",
          "entry_price": 63811.2,
          "exit_price": 63642.14357142857,
          "pnl_usd": -2.4223,
          "exit_reason": "sl",
          "proposal_id": "pp_5864349ca40385fa7f2b12f7"
        },
        {
          "opened_ts": "2026-06-04T07:19:59.999000Z",
          "closed_ts": "2026-06-04T07:34:59.999000Z",
          "side": "long",
          "entry_price": 63527.99,
          "exit_price": 63801.28785714285,
          "pnl_usd": 1.2648,
          "exit_reason": "tp",
          "proposal_id": "pp_bf1b18aa50ba0a22401abd69"
        },
        {
          "opened_ts": "2026-06-04T07:19:59.999000Z",
          "closed_ts": "2026-06-04T07:34:59.999000Z",
          "side": "long",
          "entry_price": 63527.99,
          "exit_price": 63801.28785714285,
          "pnl_usd": 1.2648,
          "exit_reason": "tp",
          "proposal_id": "pp_5864349ca40385fa7f2b12f7"
        },
        {
          "opened_ts": "2026-06-04T07:34:59.999000Z",
          "closed_ts": "2026-06-04T07:49:59.999000Z",
          "side": "long",
          "entry_price": 63789.6,
          "exit_price": 63899.99,
          "pnl_usd": 0.3492,
          "exit_reason": "time_stop",
          "proposal_id": "pp_d2d746a4e84c13e122117ba1"
        },
        {
          "opened_ts": "2026-06-04T07:34:59.999000Z",
          "closed_ts": "2026-06-04T07:59:59.999000Z",
          "side": "long",
          "entry_price": 63789.6,
          "exit_price": 63605.68928571428,
          "pnl_usd": -1.2939,
          "exit_reason": "sl",
          "proposal_id": "pp_5864349ca40385fa7f2b12f7"
        },
        {
          "opened_ts": "2026-06-04T07:49:59.999000Z",
          "closed_ts": "2026-06-04T07:59:59.999000Z",
          "side": "long",
          "entry_price": 63899.99,
          "exit_price": 63722.49214285714,
          "pnl_usd": -1.2564,
          "exit_reason": "sl",
          "proposal_id": "pp_2fd5cfcc4b645e84a1a9703e"
        },
        {
          "opened_ts": "2026-06-04T07:59:59.999000Z",
          "closed_ts": "2026-06-04T08:04:59.999000Z",
          "side": "long",
          "entry_price": 63603.15,
          "exit_price": 63876.817500000005,
          "pnl_usd": 1.265,
          "exit_reason": "tp",
          "proposal_id": "pp_cc53ca9c2a8d7a031eaf77fc"
        },
        {
          "opened_ts": "2026-06-04T07:59:59.999000Z",
          "closed_ts": "2026-06-04T08:04:59.999000Z",
          "side": "long",
          "entry_price": 63603.15,
          "exit_price": 63876.817500000005,
          "pnl_usd": 1.2649,
          "exit_reason": "tp",
          "proposal_id": "pp_5864349ca40385fa7f2b12f7"
        },
        {
          "opened_ts": "2026-06-04T08:04:59.999000Z",
          "closed_ts": "2026-06-04T08:09:59.999000Z",
          "side": "long",
          "entry_price": 63881.99,
          "exit_price": 63684.54214285714,
          "pnl_usd": -1.3678,
          "exit_reason": "sl",
          "proposal_id": "pp_9fe4137fa31af30722eac83d"
        },
        {
          "opened_ts": "2026-06-04T08:04:59.999000Z",
          "closed_ts": "2026-06-04T08:09:59.999000Z",
          "side": "long",
          "entry_price": 63881.99,
          "exit_price": 63684.54214285714,
          "pnl_usd": -1.3678,
          "exit_reason": "sl",
          "proposal_id": "pp_e2f17d97257256d87e742ca0"
        },
        {
          "opened_ts": "2026-06-04T08:09:59.999000Z",
          "closed_ts": "2026-06-04T08:24:59.999000Z",
          "side": "long",
          "entry_price": 63482.0,
          "exit_price": 63259.65,
          "pnl_usd": -1.5139,
          "exit_reason": "sl",
          "proposal_id": "pp_52db481ea0e1375c3552b827"
        },
        {
          "opened_ts": "2026-06-04T08:09:59.999000Z",
          "closed_ts": "2026-06-04T08:24:59.999000Z",
          "side": "long",
          "entry_price": 63482.0,
          "exit_price": 63259.65,
          "pnl_usd": -1.5139,
          "exit_reason": "sl",
          "proposal_id": "pp_e2f17d97257256d87e742ca0"
        },
        {
          "opened_ts": "2026-06-04T08:24:59.999000Z",
          "closed_ts": "2026-06-04T08:39:59.999000Z",
          "side": "long",
          "entry_price": 63552.0,
          "exit_price": 63544.32,
          "pnl_usd": -0.3099,
          "exit_reason": "time_stop",
          "proposal_id": "pp_ec32d146c6eac1f2f24d2f13"
        },
        {
          "opened_ts": "2026-06-04T08:39:59.999000Z",
          "closed_ts": "2026-06-04T08:54:59.999000Z",
          "side": "long",
          "entry_price": 63544.32,
          "exit_price": 63615.33,
          "pnl_usd": 0.1308,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f3f4accc54e8b6920ecd54d2"
        },
        {
          "opened_ts": "2026-06-04T08:24:59.999000Z",
          "closed_ts": "2026-06-04T09:09:59.999000Z",
          "side": "long",
          "entry_price": 63552.0,
          "exit_price": 63303.21142857143,
          "pnl_usd": -1.66,
          "exit_reason": "sl",
          "proposal_id": "pp_e2f17d97257256d87e742ca0"
        },
        {
          "opened_ts": "2026-06-04T08:54:59.999000Z",
          "closed_ts": "2026-06-04T09:09:59.999000Z",
          "side": "long",
          "entry_price": 63615.33,
          "exit_price": 63372.720714285715,
          "pnl_usd": -1.6239,
          "exit_reason": "sl",
          "proposal_id": "pp_ac0147519f6b0f64a32d5ff9"
        },
        {
          "opened_ts": "2026-06-04T09:09:59.999000Z",
          "closed_ts": "2026-06-04T09:19:59.999000Z",
          "side": "long",
          "entry_price": 63390.01,
          "exit_price": 63141.96,
          "pnl_usd": -1.2389,
          "exit_reason": "sl",
          "proposal_id": "pp_f122cc3d72d9c85125befa41"
        },
        {
          "opened_ts": "2026-06-04T09:09:59.999000Z",
          "closed_ts": "2026-06-04T09:19:59.999000Z",
          "side": "long",
          "entry_price": 63390.01,
          "exit_price": 63141.96,
          "pnl_usd": -1.6586,
          "exit_reason": "sl",
          "proposal_id": "pp_3215cd6b09f270360be305fa"
        },
        {
          "opened_ts": "2026-06-04T09:19:59.999000Z",
          "closed_ts": "2026-06-04T09:29:59.999000Z",
          "side": "long",
          "entry_price": 63120.0,
          "exit_price": 62897.15857142857,
          "pnl_usd": -1.299,
          "exit_reason": "sl",
          "proposal_id": "pp_462132938cc39fe4c2d54bd6"
        },
        {
          "opened_ts": "2026-06-04T09:19:59.999000Z",
          "closed_ts": "2026-06-04T09:29:59.999000Z",
          "side": "long",
          "entry_price": 63120.0,
          "exit_price": 62897.15857142857,
          "pnl_usd": -1.522,
          "exit_reason": "sl",
          "proposal_id": "pp_3215cd6b09f270360be305fa"
        },
        {
          "opened_ts": "2026-06-04T09:29:59.999000Z",
          "closed_ts": "2026-06-04T09:44:59.999000Z",
          "side": "long",
          "entry_price": 62863.99,
          "exit_price": 62899.44,
          "pnl_usd": -0.048,
          "exit_reason": "time_stop",
          "proposal_id": "pp_3bc4f3b65bf94522e7dcd608"
        },
        {
          "opened_ts": "2026-06-04T09:29:59.999000Z",
          "closed_ts": "2026-06-04T09:59:59.999000Z",
          "side": "long",
          "entry_price": 62863.99,
          "exit_price": 63182.75178571428,
          "pnl_usd": 1.5358,
          "exit_reason": "tp",
          "proposal_id": "pp_3215cd6b09f270360be305fa"
        },
        {
          "opened_ts": "2026-06-04T09:44:59.999000Z",
          "closed_ts": "2026-06-04T09:59:59.999000Z",
          "side": "long",
          "entry_price": 62899.44,
          "exit_price": 63205.582500000004,
          "pnl_usd": 1.0774,
          "exit_reason": "tp",
          "proposal_id": "pp_36f40a7226cb314451834523"
        },
        {
          "opened_ts": "2026-06-04T09:59:59.999000Z",
          "closed_ts": "2026-06-04T10:04:59.999000Z",
          "side": "long",
          "entry_price": 63266.0,
          "exit_price": 63050.8,
          "pnl_usd": -1.476,
          "exit_reason": "sl",
          "proposal_id": "pp_553fe8dc13f4c8fca6e9b776"
        },
        {
          "opened_ts": "2026-06-04T09:59:59.999000Z",
          "closed_ts": "2026-06-04T10:04:59.999000Z",
          "side": "long",
          "entry_price": 63266.0,
          "exit_price": 63050.8,
          "pnl_usd": -1.4759,
          "exit_reason": "sl",
          "proposal_id": "pp_3215cd6b09f270360be305fa"
        },
        {
          "opened_ts": "2026-06-04T10:04:59.999000Z",
          "closed_ts": "2026-06-04T10:14:59.999000Z",
          "side": "long",
          "entry_price": 63046.0,
          "exit_price": 62825.085,
          "pnl_usd": -1.5118,
          "exit_reason": "sl",
          "proposal_id": "pp_ec1f2787be91e6c2f970f6ec"
        },
        {
          "opened_ts": "2026-06-04T10:04:59.999000Z",
          "closed_ts": "2026-06-04T10:19:59.999000Z",
          "side": "short",
          "entry_price": 63046.0,
          "exit_price": 62978.3,
          "pnl_usd": 0.1118,
          "exit_reason": "time_stop",
          "proposal_id": "pp_2f1bc8b594ab2d9b7b05b34d"
        },
        {
          "opened_ts": "2026-06-04T10:14:59.999000Z",
          "closed_ts": "2026-06-04T10:29:59.999000Z",
          "side": "long",
          "entry_price": 62872.58,
          "exit_price": 62655.305,
          "pnl_usd": -1.1774,
          "exit_reason": "sl",
          "proposal_id": "pp_0cf9bf88b1e023c58145058f"
        },
        {
          "opened_ts": "2026-06-04T10:19:59.999000Z",
          "closed_ts": "2026-06-04T10:29:59.999000Z",
          "side": "long",
          "entry_price": 62978.3,
          "exit_price": 62755.71928571429,
          "pnl_usd": -1.5223,
          "exit_reason": "sl",
          "proposal_id": "pp_ec1f2787be91e6c2f970f6ec"
        },
        {
          "opened_ts": "2026-06-04T10:29:59.999000Z",
          "closed_ts": "2026-06-04T10:34:59.999000Z",
          "side": "short",
          "entry_price": 62501.51,
          "exit_price": 62724.845,
          "pnl_usd": -1.3499,
          "exit_reason": "sl",
          "proposal_id": "pp_c1a8514f06934a5e1cea8543"
        },
        {
          "opened_ts": "2026-06-04T10:34:59.999000Z",
          "closed_ts": "2026-06-04T10:49:59.999000Z",
          "side": "long",
          "entry_price": 62709.83,
          "exit_price": 62476.88857142857,
          "pnl_usd": -1.1331,
          "exit_reason": "sl",
          "proposal_id": "pp_08be3bd729d4cfbd0c94ff76"
        },
        {
          "opened_ts": "2026-06-04T10:49:59.999000Z",
          "closed_ts": "2026-06-04T11:04:59.999000Z",
          "side": "long",
          "entry_price": 62410.5,
          "exit_price": 62602.03,
          "pnl_usd": 0.8234,
          "exit_reason": "time_stop",
          "proposal_id": "pp_94249b5cf38fe7a3eab7036c"
        },
        {
          "opened_ts": "2026-06-04T11:04:59.999000Z",
          "closed_ts": "2026-06-04T11:09:59.999000Z",
          "side": "long",
          "entry_price": 62602.03,
          "exit_price": 62351.54,
          "pnl_usd": -1.6872,
          "exit_reason": "sl",
          "proposal_id": "pp_e20534dd048dd9940e63fae4"
        },
        {
          "opened_ts": "2026-06-04T10:29:59.999000Z",
          "closed_ts": "2026-06-04T11:14:59.999000Z",
          "side": "long",
          "entry_price": 62501.51,
          "exit_price": 62278.175,
          "pnl_usd": -1.5356,
          "exit_reason": "sl",
          "proposal_id": "pp_ec1f2787be91e6c2f970f6ec"
        },
        {
          "opened_ts": "2026-06-04T11:09:59.999000Z",
          "closed_ts": "2026-06-04T11:24:59.999000Z",
          "side": "short",
          "entry_price": 62310.0,
          "exit_price": 62569.63214285714,
          "pnl_usd": -1.3627,
          "exit_reason": "sl",
          "proposal_id": "pp_5f038de4f515f1a55de2d58d"
        },
        {
          "opened_ts": "2026-06-04T11:14:59.999000Z",
          "closed_ts": "2026-06-04T11:29:59.999000Z",
          "side": "long",
          "entry_price": 62272.6,
          "exit_price": 62646.91321428571,
          "pnl_usd": 1.8674,
          "exit_reason": "tp",
          "proposal_id": "pp_6760d3957caa75a60c0d45c9"
        },
        {
          "opened_ts": "2026-06-04T11:24:59.999000Z",
          "closed_ts": "2026-06-04T11:34:59.999000Z",
          "side": "short",
          "entry_price": 62569.99,
          "exit_price": 62828.532857142854,
          "pnl_usd": -1.5114,
          "exit_reason": "sl",
          "proposal_id": "pp_bc5f275c7ff6ae84fdb8b967"
        },
        {
          "opened_ts": "2026-06-04T11:29:59.999000Z",
          "closed_ts": "2026-06-04T11:39:59.999000Z",
          "side": "short",
          "entry_price": 62617.38,
          "exit_price": 62242.76357142857,
          "pnl_usd": 1.3384,
          "exit_reason": "tp",
          "proposal_id": "pp_50ca0111cd1a89c824474306"
        },
        {
          "opened_ts": "2026-06-04T11:34:59.999000Z",
          "closed_ts": "2026-06-04T11:39:59.999000Z",
          "side": "long",
          "entry_price": 62538.55,
          "exit_price": 62278.412142857145,
          "pnl_usd": -1.7424,
          "exit_reason": "sl",
          "proposal_id": "pp_6760d3957caa75a60c0d45c9"
        },
        {
          "opened_ts": "2026-06-04T11:39:59.999000Z",
          "closed_ts": "2026-06-04T11:54:59.999000Z",
          "side": "long",
          "entry_price": 62383.75,
          "exit_price": 62424.0,
          "pnl_usd": -0.0372,
          "exit_reason": "time_stop",
          "proposal_id": "pp_847f07ea35ffecb6abfd1a32"
        },
        {
          "opened_ts": "2026-06-04T11:54:59.999000Z",
          "closed_ts": "2026-06-04T12:09:59.999000Z",
          "side": "long",
          "entry_price": 62424.0,
          "exit_price": 62467.85,
          "pnl_usd": -0.0169,
          "exit_reason": "time_stop",
          "proposal_id": "pp_541e03a026cb96b7074b0ea8"
        },
        {
          "opened_ts": "2026-06-04T11:39:59.999000Z",
          "closed_ts": "2026-06-04T12:19:59.999000Z",
          "side": "long",
          "entry_price": 62383.75,
          "exit_price": 62780.59857142857,
          "pnl_usd": 1.9913,
          "exit_reason": "tp",
          "proposal_id": "pp_6760d3957caa75a60c0d45c9"
        },
        {
          "opened_ts": "2026-06-04T12:09:59.999000Z",
          "closed_ts": "2026-06-04T12:19:59.999000Z",
          "side": "short",
          "entry_price": 62467.85,
          "exit_price": 62708.015,
          "pnl_usd": -1.4949,
          "exit_reason": "sl",
          "proposal_id": "pp_ade63d80cdc1612d20782ac8"
        },
        {
          "opened_ts": "2026-06-04T12:19:59.999000Z",
          "closed_ts": "2026-06-04T12:24:59.999000Z",
          "side": "long",
          "entry_price": 62666.81,
          "exit_price": 63003.39178571428,
          "pnl_usd": 1.6398,
          "exit_reason": "tp",
          "proposal_id": "pp_9df78c240e1511e3c6a95836"
        },
        {
          "opened_ts": "2026-06-04T12:19:59.999000Z",
          "closed_ts": "2026-06-04T12:24:59.999000Z",
          "side": "long",
          "entry_price": 62666.81,
          "exit_price": 63003.39178571428,
          "pnl_usd": 1.6397,
          "exit_reason": "tp",
          "proposal_id": "pp_a2b6dc9e84d0519a510e4fa5"
        },
        {
          "opened_ts": "2026-06-04T12:24:59.999000Z",
          "closed_ts": "2026-06-04T12:34:59.999000Z",
          "side": "short",
          "entry_price": 63294.32,
          "exit_price": 63562.61357142857,
          "pnl_usd": -1.6823,
          "exit_reason": "sl",
          "proposal_id": "pp_a93720c044c344f6af02141d"
        },
        {
          "opened_ts": "2026-06-04T12:24:59.999000Z",
          "closed_ts": "2026-06-04T12:39:59.999000Z",
          "side": "long",
          "entry_price": 63294.32,
          "exit_price": 63696.760357142855,
          "pnl_usd": 1.9906,
          "exit_reason": "tp",
          "proposal_id": "pp_a2b6dc9e84d0519a510e4fa5"
        },
        {
          "opened_ts": "2026-06-04T12:34:59.999000Z",
          "closed_ts": "2026-06-04T12:49:59.999000Z",
          "side": "long",
          "entry_price": 63492.86,
          "exit_price": 63910.9,
          "pnl_usd": 2.0704,
          "exit_reason": "time_stop",
          "proposal_id": "pp_1ca50d118ab67a69cb2cbe71"
        },
        {
          "opened_ts": "2026-06-04T12:39:59.999000Z",
          "closed_ts": "2026-06-04T12:54:59.999000Z",
          "side": "short",
          "entry_price": 63686.0,
          "exit_price": 63825.79,
          "pnl_usd": -1.0453,
          "exit_reason": "time_stop",
          "proposal_id": "pp_32ef4f2ddc5a1776a9aea363"
        },
        {
          "opened_ts": "2026-06-04T12:49:59.999000Z",
          "closed_ts": "2026-06-04T13:04:59.999000Z",
          "side": "long",
          "entry_price": 63910.9,
          "exit_price": 63700.0,
          "pnl_usd": -1.4377,
          "exit_reason": "time_stop",
          "proposal_id": "pp_eeeb6ef1d7793ffadbfbe086"
        },
        {
          "opened_ts": "2026-06-04T12:54:59.999000Z",
          "closed_ts": "2026-06-04T13:09:59.999000Z",
          "side": "short",
          "entry_price": 63825.79,
          "exit_price": 63627.0,
          "pnl_usd": 0.7947,
          "exit_reason": "time_stop",
          "proposal_id": "pp_6e447940d5b7e336415f4623"
        },
        {
          "opened_ts": "2026-06-04T13:04:59.999000Z",
          "closed_ts": "2026-06-04T13:19:59.999000Z",
          "side": "long",
          "entry_price": 63700.0,
          "exit_price": 63410.25142857143,
          "pnl_usd": -1.8805,
          "exit_reason": "sl",
          "proposal_id": "pp_9fa86ac9666c4f7d912fa268"
        },
        {
          "opened_ts": "2026-06-04T13:09:59.999000Z",
          "closed_ts": "2026-06-04T13:19:59.999000Z",
          "side": "long",
          "entry_price": 63627.0,
          "exit_price": 63332.95285714286,
          "pnl_usd": -1.9064,
          "exit_reason": "sl",
          "proposal_id": "pp_28a98766eea2a3cb18f2f867"
        },
        {
          "opened_ts": "2026-06-04T13:19:59.999000Z",
          "closed_ts": "2026-06-04T13:34:59.999000Z",
          "side": "long",
          "entry_price": 63271.69,
          "exit_price": 63715.97928571429,
          "pnl_usd": 2.225,
          "exit_reason": "tp",
          "proposal_id": "pp_6061680a4ee935e48a36975c"
        },
        {
          "opened_ts": "2026-06-04T13:19:59.999000Z",
          "closed_ts": "2026-06-04T13:34:59.999000Z",
          "side": "long",
          "entry_price": 63271.69,
          "exit_price": 63715.97928571429,
          "pnl_usd": 2.225,
          "exit_reason": "tp",
          "proposal_id": "pp_ebad1b95b2cf4d61a3fd81d1"
        },
        {
          "opened_ts": "2026-06-04T13:34:59.999000Z",
          "closed_ts": "2026-06-04T13:39:59.999000Z",
          "side": "long",
          "entry_price": 63734.43,
          "exit_price": 64172.838214285715,
          "pnl_usd": 2.1751,
          "exit_reason": "tp",
          "proposal_id": "pp_bd60095ca7d9f580f2f878b5"
        },
        {
          "opened_ts": "2026-06-04T13:34:59.999000Z",
          "closed_ts": "2026-06-04T13:39:59.999000Z",
          "side": "long",
          "entry_price": 63734.43,
          "exit_price": 64172.838214285715,
          "pnl_usd": 2.1751,
          "exit_reason": "tp",
          "proposal_id": "pp_ebad1b95b2cf4d61a3fd81d1"
        },
        {
          "opened_ts": "2026-06-04T13:39:59.999000Z",
          "closed_ts": "2026-06-04T13:44:59.999000Z",
          "side": "long",
          "entry_price": 64150.0,
          "exit_price": 63834.37357142857,
          "pnl_usd": -2.0131,
          "exit_reason": "sl",
          "proposal_id": "pp_ebad1b95b2cf4d61a3fd81d1"
        },
        {
          "opened_ts": "2026-06-04T13:39:59.999000Z",
          "closed_ts": "2026-06-04T13:49:59.999000Z",
          "side": "short",
          "entry_price": 64150.0,
          "exit_price": 63676.56035714286,
          "pnl_usd": 2.3541,
          "exit_reason": "tp",
          "proposal_id": "pp_a7535eff3c4c6ebdbdf92834"
        },
        {
          "opened_ts": "2026-06-04T13:44:59.999000Z",
          "closed_ts": "2026-06-04T13:59:59.999000Z",
          "side": "short",
          "entry_price": 63798.61,
          "exit_price": 64104.88071428571,
          "pnl_usd": -1.7344,
          "exit_reason": "sl",
          "proposal_id": "pp_7f3ce07db719a0733a12c43e"
        },
        {
          "opened_ts": "2026-06-04T13:49:59.999000Z",
          "closed_ts": "2026-06-04T14:04:59.999000Z",
          "side": "long",
          "entry_price": 63829.42,
          "exit_price": 64285.284999999996,
          "pnl_usd": 2.2694,
          "exit_reason": "tp",
          "proposal_id": "pp_de6fc8f6a816330d0b8a9ee2"
        },
        {
          "opened_ts": "2026-06-04T14:04:59.999000Z",
          "closed_ts": "2026-06-04T14:09:59.999000Z",
          "side": "short",
          "entry_price": 64065.68,
          "exit_price": 64380.17857142857,
          "pnl_usd": -1.6959,
          "exit_reason": "sl",
          "proposal_id": "pp_f71b43dc5748651493e9fda2"
        },
        {
          "opened_ts": "2026-06-04T13:59:59.999000Z",
          "closed_ts": "2026-06-04T14:14:59.999000Z",
          "side": "long",
          "entry_price": 64230.0,
          "exit_price": 64365.73,
          "pnl_usd": 0.4839,
          "exit_reason": "time_stop",
          "proposal_id": "pp_c87dc9639bb4e123ba2388fa"
        },
        {
          "opened_ts": "2026-06-04T14:09:59.999000Z",
          "closed_ts": "2026-06-04T14:24:59.999000Z",
          "side": "long",
          "entry_price": 64301.99,
          "exit_price": 64176.01,
          "pnl_usd": -0.9617,
          "exit_reason": "time_stop",
          "proposal_id": "pp_4b4363838de20985fa1b68d6"
        },
        {
          "opened_ts": "2026-06-04T14:14:59.999000Z",
          "closed_ts": "2026-06-04T14:29:59.999000Z",
          "side": "short",
          "entry_price": 64365.73,
          "exit_price": 64144.0,
          "pnl_usd": 0.9566,
          "exit_reason": "time_stop",
          "proposal_id": "pp_961b3df57e95a6963f6c6901"
        },
        {
          "opened_ts": "2026-06-04T14:24:59.999000Z",
          "closed_ts": "2026-06-04T14:39:59.999000Z",
          "side": "long",
          "entry_price": 64176.01,
          "exit_price": 63902.5,
          "pnl_usd": -1.7788,
          "exit_reason": "time_stop",
          "proposal_id": "pp_b916508d7e090c66c7b6ec80"
        },
        {
          "opened_ts": "2026-06-04T14:29:59.999000Z",
          "closed_ts": "2026-06-04T14:44:59.999000Z",
          "side": "long",
          "entry_price": 64144.0,
          "exit_price": 64000.91,
          "pnl_usd": -1.058,
          "exit_reason": "time_stop",
          "proposal_id": "pp_ea1be122e8c3d257806aa025"
        },
        {
          "opened_ts": "2026-06-04T14:39:59.999000Z",
          "closed_ts": "2026-06-04T14:54:59.999000Z",
          "side": "long",
          "entry_price": 63902.5,
          "exit_price": 63840.0,
          "pnl_usd": -0.6132,
          "exit_reason": "time_stop",
          "proposal_id": "pp_4293e064aece1610b688c59b"
        },
        {
          "opened_ts": "2026-06-04T14:44:59.999000Z",
          "closed_ts": "2026-06-04T14:59:59.999000Z",
          "side": "long",
          "entry_price": 64000.91,
          "exit_price": 63958.97,
          "pnl_usd": -0.3741,
          "exit_reason": "time_stop",
          "proposal_id": "pp_afdc9a7c3b4a6c1a05a50e48"
        },
        {
          "opened_ts": "2026-06-04T14:54:59.999000Z",
          "closed_ts": "2026-06-04T15:09:59.999000Z",
          "side": "long",
          "entry_price": 63840.0,
          "exit_price": 64211.57142857143,
          "pnl_usd": 1.5972,
          "exit_reason": "tp",
          "proposal_id": "pp_6a3664ab7e6e07e2ddf9ff60"
        },
        {
          "opened_ts": "2026-06-04T14:59:59.999000Z",
          "closed_ts": "2026-06-04T15:09:59.999000Z",
          "side": "long",
          "entry_price": 63958.97,
          "exit_price": 64318.10964285714,
          "pnl_usd": 1.4297,
          "exit_reason": "tp",
          "proposal_id": "pp_9150cc6738f13e864a8df4ce"
        },
        {
          "opened_ts": "2026-06-04T15:09:59.999000Z",
          "closed_ts": "2026-06-04T15:19:59.999000Z",
          "side": "long",
          "entry_price": 64327.24,
          "exit_price": 64088.90214285714,
          "pnl_usd": -1.581,
          "exit_reason": "sl",
          "proposal_id": "pp_3af2a4f195915d2d7b9f5cf6"
        },
        {
          "opened_ts": "2026-06-04T15:09:59.999000Z",
          "closed_ts": "2026-06-04T15:19:59.999000Z",
          "side": "long",
          "entry_price": 64327.24,
          "exit_price": 64088.90214285714,
          "pnl_usd": -1.581,
          "exit_reason": "sl",
          "proposal_id": "pp_e99ab2c727acfe306d0a5b37"
        },
        {
          "opened_ts": "2026-06-04T15:19:59.999000Z",
          "closed_ts": "2026-06-04T15:24:59.999000Z",
          "side": "long",
          "entry_price": 64122.0,
          "exit_price": 63900.07571428572,
          "pnl_usd": -1.2215,
          "exit_reason": "sl",
          "proposal_id": "pp_5e1e4fd58ae6fba9585a6ca1"
        },
        {
          "opened_ts": "2026-06-04T15:19:59.999000Z",
          "closed_ts": "2026-06-04T15:24:59.999000Z",
          "side": "long",
          "entry_price": 64122.0,
          "exit_price": 63900.07571428572,
          "pnl_usd": -1.4938,
          "exit_reason": "sl",
          "proposal_id": "pp_e99ab2c727acfe306d0a5b37"
        },
        {
          "opened_ts": "2026-06-04T15:24:59.999000Z",
          "closed_ts": "2026-06-04T15:39:59.999000Z",
          "side": "long",
          "entry_price": 63970.0,
          "exit_price": 63874.01,
          "pnl_usd": -0.7981,
          "exit_reason": "time_stop",
          "proposal_id": "pp_693ca00df5a2fc40f07110f4"
        },
        {
          "opened_ts": "2026-06-04T15:24:59.999000Z",
          "closed_ts": "2026-06-04T15:49:59.999000Z",
          "side": "long",
          "entry_price": 63970.0,
          "exit_price": 63740.57,
          "pnl_usd": -1.5378,
          "exit_reason": "sl",
          "proposal_id": "pp_e99ab2c727acfe306d0a5b37"
        },
        {
          "opened_ts": "2026-06-04T15:39:59.999000Z",
          "closed_ts": "2026-06-04T15:54:59.999000Z",
          "side": "long",
          "entry_price": 63874.01,
          "exit_price": 63772.34,
          "pnl_usd": -0.8303,
          "exit_reason": "time_stop",
          "proposal_id": "pp_80ce9d7eee5637cd1f9bc340"
        },
        {
          "opened_ts": "2026-06-04T15:49:59.999000Z",
          "closed_ts": "2026-06-04T16:04:59.999000Z",
          "side": "long",
          "entry_price": 63754.0,
          "exit_price": 63729.12,
          "pnl_usd": -0.4042,
          "exit_reason": "time_stop",
          "proposal_id": "pp_ef8025cb3d078420205d82d3"
        },
        {
          "opened_ts": "2026-06-04T15:54:59.999000Z",
          "closed_ts": "2026-06-04T16:09:59.999000Z",
          "side": "long",
          "entry_price": 63772.34,
          "exit_price": 63786.0,
          "pnl_usd": -0.1899,
          "exit_reason": "time_stop",
          "proposal_id": "pp_d0eed46f4a1e791ef7926e67"
        },
        {
          "opened_ts": "2026-06-04T16:04:59.999000Z",
          "closed_ts": "2026-06-04T16:19:59.999000Z",
          "side": "long",
          "entry_price": 63729.12,
          "exit_price": 63716.85,
          "pnl_usd": -0.3341,
          "exit_reason": "time_stop",
          "proposal_id": "pp_16613d7093078aea45dd915b"
        },
        {
          "opened_ts": "2026-06-04T16:09:59.999000Z",
          "closed_ts": "2026-06-04T16:24:59.999000Z",
          "side": "long",
          "entry_price": 63786.0,
          "exit_price": 63804.48,
          "pnl_usd": -0.1631,
          "exit_reason": "time_stop",
          "proposal_id": "pp_c09f898e2f5dbc1b84be4ec0"
        },
        {
          "opened_ts": "2026-06-04T16:19:59.999000Z",
          "closed_ts": "2026-06-04T16:34:59.999000Z",
          "side": "long",
          "entry_price": 63716.85,
          "exit_price": 63522.479999999996,
          "pnl_usd": -1.3469,
          "exit_reason": "sl",
          "proposal_id": "pp_ba7c212a5cacb3c6f27cd68b"
        },
        {
          "opened_ts": "2026-06-04T16:24:59.999000Z",
          "closed_ts": "2026-06-04T16:34:59.999000Z",
          "side": "long",
          "entry_price": 63804.48,
          "exit_price": 63610.15428571429,
          "pnl_usd": -1.3451,
          "exit_reason": "sl",
          "proposal_id": "pp_7830cf16c236164a007779dc"
        },
        {
          "opened_ts": "2026-06-04T16:34:59.999000Z",
          "closed_ts": "2026-06-04T16:39:59.999000Z",
          "side": "long",
          "entry_price": 63476.04,
          "exit_price": 63745.58678571429,
          "pnl_usd": 1.2387,
          "exit_reason": "tp",
          "proposal_id": "pp_f176ef1c3531f6db99808f95"
        },
        {
          "opened_ts": "2026-06-04T16:34:59.999000Z",
          "closed_ts": "2026-06-04T16:39:59.999000Z",
          "side": "long",
          "entry_price": 63476.04,
          "exit_price": 63745.58678571429,
          "pnl_usd": 0.901,
          "exit_reason": "tp",
          "proposal_id": "pp_5a66d3c1827d498c9d5e3922"
        },
        {
          "opened_ts": "2026-06-04T16:39:59.999000Z",
          "closed_ts": "2026-06-04T16:54:59.999000Z",
          "side": "long",
          "entry_price": 63742.01,
          "exit_price": 63664.01,
          "pnl_usd": -0.6993,
          "exit_reason": "time_stop",
          "proposal_id": "pp_78b1786d1cfe7c92eff81cdb"
        },
        {
          "opened_ts": "2026-06-04T16:39:59.999000Z",
          "closed_ts": "2026-06-04T16:59:59.999000Z",
          "side": "long",
          "entry_price": 63742.01,
          "exit_price": 63546.68428571429,
          "pnl_usd": -0.9831,
          "exit_reason": "sl",
          "proposal_id": "pp_5a66d3c1827d498c9d5e3922"
        },
        {
          "opened_ts": "2026-06-04T16:54:59.999000Z",
          "closed_ts": "2026-06-04T17:04:59.999000Z",
          "side": "long",
          "entry_price": 63664.01,
          "exit_price": 63466.59285714286,
          "pnl_usd": -1.3643,
          "exit_reason": "sl",
          "proposal_id": "pp_32270071571d1292ab4cba78"
        },
        {
          "opened_ts": "2026-06-04T16:59:59.999000Z",
          "closed_ts": "2026-06-04T17:14:59.999000Z",
          "side": "long",
          "entry_price": 63563.51,
          "exit_price": 63591.99,
          "pnl_usd": -0.107,
          "exit_reason": "time_stop",
          "proposal_id": "pp_6dbf0617f3aeeac4b334f2c7"
        },
        {
          "opened_ts": "2026-06-04T17:04:59.999000Z",
          "closed_ts": "2026-06-04T17:19:59.999000Z",
          "side": "long",
          "entry_price": 63523.99,
          "exit_price": 63328.88214285714,
          "pnl_usd": -1.3535,
          "exit_reason": "sl",
          "proposal_id": "pp_1badfdfcdb58cb965c5f5be5"
        },
        {
          "opened_ts": "2026-06-04T17:14:59.999000Z",
          "closed_ts": "2026-06-04T17:19:59.999000Z",
          "side": "long",
          "entry_price": 63591.99,
          "exit_price": 63410.59785714286,
          "pnl_usd": -1.2759,
          "exit_reason": "sl",
          "proposal_id": "pp_a67c96657d3500a18d59ae9b"
        },
        {
          "opened_ts": "2026-06-04T17:19:59.999000Z",
          "closed_ts": "2026-06-04T17:34:59.999000Z",
          "side": "long",
          "entry_price": 63259.87,
          "exit_price": 63066.76357142857,
          "pnl_usd": -1.3463,
          "exit_reason": "sl",
          "proposal_id": "pp_4e568eee9fbc8744a7193a37"
        },
        {
          "opened_ts": "2026-06-04T17:19:59.999000Z",
          "closed_ts": "2026-06-04T17:34:59.999000Z",
          "side": "long",
          "entry_price": 63259.87,
          "exit_price": 63066.76357142857,
          "pnl_usd": -1.1103,
          "exit_reason": "sl",
          "proposal_id": "pp_7d6d6262f77148fd219d814e"
        },
        {
          "opened_ts": "2026-06-04T17:34:59.999000Z",
          "closed_ts": "2026-06-04T17:49:59.999000Z",
          "side": "long",
          "entry_price": 63083.99,
          "exit_price": 63090.27,
          "pnl_usd": -0.2302,
          "exit_reason": "time_stop",
          "proposal_id": "pp_c7c9b5d0d10c9e999b7010a1"
        },
        {
          "opened_ts": "2026-06-04T17:34:59.999000Z",
          "closed_ts": "2026-06-04T17:54:59.999000Z",
          "side": "long",
          "entry_price": 63083.99,
          "exit_price": 63396.86857142857,
          "pnl_usd": 1.2288,
          "exit_reason": "tp",
          "proposal_id": "pp_7d6d6262f77148fd219d814e"
        },
        {
          "opened_ts": "2026-06-04T17:49:59.999000Z",
          "closed_ts": "2026-06-04T17:54:59.999000Z",
          "side": "long",
          "entry_price": 63090.27,
          "exit_price": 63363.358928571426,
          "pnl_usd": 1.2665,
          "exit_reason": "tp",
          "proposal_id": "pp_6d5326599a01c1cbc25673c4"
        },
        {
          "opened_ts": "2026-06-04T17:54:59.999000Z",
          "closed_ts": "2026-06-04T18:04:59.999000Z",
          "side": "long",
          "entry_price": 63598.0,
          "exit_price": 63385.29714285715,
          "pnl_usd": -1.4495,
          "exit_reason": "sl",
          "proposal_id": "pp_d68c18e92bdf4246761e37b9"
        },
        {
          "opened_ts": "2026-06-04T17:54:59.999000Z",
          "closed_ts": "2026-06-04T18:04:59.999000Z",
          "side": "long",
          "entry_price": 63598.0,
          "exit_price": 63385.29714285715,
          "pnl_usd": -1.1953,
          "exit_reason": "sl",
          "proposal_id": "pp_7d6d6262f77148fd219d814e"
        },
        {
          "opened_ts": "2026-06-04T18:04:59.999000Z",
          "closed_ts": "2026-06-04T18:19:59.999000Z",
          "side": "long",
          "entry_price": 63344.0,
          "exit_price": 63388.01,
          "pnl_usd": -0.0195,
          "exit_reason": "time_stop",
          "proposal_id": "pp_da85d5bd1b76c4a159a40bd6"
        },
        {
          "opened_ts": "2026-06-04T18:04:59.999000Z",
          "closed_ts": "2026-06-04T18:29:59.999000Z",
          "side": "long",
          "entry_price": 63344.0,
          "exit_price": 63669.35214285714,
          "pnl_usd": 1.4421,
          "exit_reason": "tp",
          "proposal_id": "pp_1908485c8e6f84a85d5aeeb1"
        },
        {
          "opened_ts": "2026-06-04T18:19:59.999000Z",
          "closed_ts": "2026-06-04T18:29:59.999000Z",
          "side": "long",
          "entry_price": 63388.01,
          "exit_price": 63732.38321428571,
          "pnl_usd": 1.45,
          "exit_reason": "tp",
          "proposal_id": "pp_8d45846787b946e9a4b94f1d"
        },
        {
          "opened_ts": "2026-06-04T18:29:59.999000Z",
          "closed_ts": "2026-06-04T18:44:59.999000Z",
          "side": "short",
          "entry_price": 63896.27,
          "exit_price": 63924.93,
          "pnl_usd": -0.3251,
          "exit_reason": "time_stop",
          "proposal_id": "pp_acce201c5f94cf6c45e57243"
        },
        {
          "opened_ts": "2026-06-04T18:44:59.999000Z",
          "closed_ts": "2026-06-04T18:59:59.999000Z",
          "side": "short",
          "entry_price": 63924.93,
          "exit_price": 63819.62,
          "pnl_usd": 0.2448,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f7cd2e3dc10b708b25ca9671"
        },
        {
          "opened_ts": "2026-06-04T18:29:59.999000Z",
          "closed_ts": "2026-06-04T19:09:59.999000Z",
          "side": "long",
          "entry_price": 63896.27,
          "exit_price": 63655.427142857145,
          "pnl_usd": -1.4862,
          "exit_reason": "sl",
          "proposal_id": "pp_1908485c8e6f84a85d5aeeb1"
        },
        {
          "opened_ts": "2026-06-04T18:59:59.999000Z",
          "closed_ts": "2026-06-04T19:14:59.999000Z",
          "side": "long",
          "entry_price": 63819.62,
          "exit_price": 63886.33,
          "pnl_usd": 0.1045,
          "exit_reason": "time_stop",
          "proposal_id": "pp_fb6f0d4c69d383aacdedf755"
        },
        {
          "opened_ts": "2026-06-04T19:09:59.999000Z",
          "closed_ts": "2026-06-04T19:19:59.999000Z",
          "side": "long",
          "entry_price": 63685.5,
          "exit_price": 64023.72107142857,
          "pnl_usd": 1.4702,
          "exit_reason": "tp",
          "proposal_id": "pp_1a1c8afea3f6cf943ba077b7"
        },
        {
          "opened_ts": "2026-06-04T19:14:59.999000Z",
          "closed_ts": "2026-06-04T19:29:59.999000Z",
          "side": "long",
          "entry_price": 63886.33,
          "exit_price": 64128.0,
          "pnl_usd": 1.0732,
          "exit_reason": "time_stop",
          "proposal_id": "pp_fa04dc98e89a61e5d7e15252"
        },
        {
          "opened_ts": "2026-06-04T19:29:59.999000Z",
          "closed_ts": "2026-06-04T19:34:59.999000Z",
          "side": "long",
          "entry_price": 64128.0,
          "exit_price": 63907.947857142855,
          "pnl_usd": -1.2894,
          "exit_reason": "sl",
          "proposal_id": "pp_2bc970ecc658478f20869855"
        },
        {
          "opened_ts": "2026-06-04T19:19:59.999000Z",
          "closed_ts": "2026-06-04T19:49:59.999000Z",
          "side": "long",
          "entry_price": 63981.12,
          "exit_price": 63750.861428571436,
          "pnl_usd": -1.399,
          "exit_reason": "sl",
          "proposal_id": "pp_1aff0a9d44e13bc24894c938"
        },
        {
          "opened_ts": "2026-06-04T19:34:59.999000Z",
          "closed_ts": "2026-06-04T19:49:59.999000Z",
          "side": "long",
          "entry_price": 63965.44,
          "exit_price": 63749.467142857146,
          "pnl_usd": -1.3273,
          "exit_reason": "sl",
          "proposal_id": "pp_1aff0a9d44e13bc24894c938"
        },
        {
          "opened_ts": "2026-06-04T19:49:59.999000Z",
          "closed_ts": "2026-06-04T19:59:59.999000Z",
          "side": "long",
          "entry_price": 63726.0,
          "exit_price": 63549.21642857143,
          "pnl_usd": -1.2468,
          "exit_reason": "sl",
          "proposal_id": "pp_47d75439f2e12a0b37a950f3"
        },
        {
          "opened_ts": "2026-06-04T19:49:59.999000Z",
          "closed_ts": "2026-06-04T19:59:59.999000Z",
          "side": "long",
          "entry_price": 63726.0,
          "exit_price": 63549.21642857143,
          "pnl_usd": -1.1332,
          "exit_reason": "sl",
          "proposal_id": "pp_1aff0a9d44e13bc24894c938"
        },
        {
          "opened_ts": "2026-06-04T19:59:59.999000Z",
          "closed_ts": "2026-06-04T20:04:59.999000Z",
          "side": "long",
          "entry_price": 63629.38,
          "exit_price": 63458.18714285714,
          "pnl_usd": -1.2168,
          "exit_reason": "sl",
          "proposal_id": "pp_02cf4cbed194e9aed41d2aa4"
        },
        {
          "opened_ts": "2026-06-04T19:59:59.999000Z",
          "closed_ts": "2026-06-04T20:04:59.999000Z",
          "side": "long",
          "entry_price": 63629.38,
          "exit_price": 63458.18714285714,
          "pnl_usd": -1.1059,
          "exit_reason": "sl",
          "proposal_id": "pp_1aff0a9d44e13bc24894c938"
        },
        {
          "opened_ts": "2026-06-04T20:04:59.999000Z",
          "closed_ts": "2026-06-04T20:19:59.999000Z",
          "side": "long",
          "entry_price": 63393.08,
          "exit_price": 63370.63,
          "pnl_usd": -0.3904,
          "exit_reason": "time_stop",
          "proposal_id": "pp_9792c6463a033a8bb2c1b39a"
        },
        {
          "opened_ts": "2026-06-04T20:04:59.999000Z",
          "closed_ts": "2026-06-04T20:29:59.999000Z",
          "side": "long",
          "entry_price": 63393.08,
          "exit_price": 63215.38214285715,
          "pnl_usd": -0.9227,
          "exit_reason": "sl",
          "proposal_id": "pp_7b29b6d7a169a1aaa33ea937"
        },
        {
          "opened_ts": "2026-06-04T20:19:59.999000Z",
          "closed_ts": "2026-06-04T20:29:59.999000Z",
          "side": "long",
          "entry_price": 63370.63,
          "exit_price": 63186.07214285714,
          "pnl_usd": -1.2948,
          "exit_reason": "sl",
          "proposal_id": "pp_771c47cd66b4857ac0d424b3"
        },
        {
          "opened_ts": "2026-06-04T20:29:59.999000Z",
          "closed_ts": "2026-06-04T20:44:59.999000Z",
          "side": "long",
          "entry_price": 63341.0,
          "exit_price": 63602.9225,
          "pnl_usd": 1.1964,
          "exit_reason": "tp",
          "proposal_id": "pp_40a443255b210b4240f3e407"
        },
        {
          "opened_ts": "2026-06-04T20:29:59.999000Z",
          "closed_ts": "2026-06-04T20:44:59.999000Z",
          "side": "long",
          "entry_price": 63341.0,
          "exit_price": 63602.9225,
          "pnl_usd": 0.8787,
          "exit_reason": "tp",
          "proposal_id": "pp_7b29b6d7a169a1aaa33ea937"
        },
        {
          "opened_ts": "2026-06-04T20:44:59.999000Z",
          "closed_ts": "2026-06-04T20:59:59.999000Z",
          "side": "long",
          "entry_price": 63560.93,
          "exit_price": 63638.4,
          "pnl_usd": 0.1657,
          "exit_reason": "time_stop",
          "proposal_id": "pp_9bc1c980d384e89c70fe1469"
        },
        {
          "opened_ts": "2026-06-04T20:44:59.999000Z",
          "closed_ts": "2026-06-04T21:09:59.999000Z",
          "side": "long",
          "entry_price": 63560.93,
          "exit_price": 63813.997142857144,
          "pnl_usd": 0.839,
          "exit_reason": "tp",
          "proposal_id": "pp_7b29b6d7a169a1aaa33ea937"
        },
        {
          "opened_ts": "2026-06-04T20:59:59.999000Z",
          "closed_ts": "2026-06-04T21:14:59.999000Z",
          "side": "long",
          "entry_price": 63638.4,
          "exit_price": 63804.82,
          "pnl_usd": 0.6593,
          "exit_reason": "time_stop",
          "proposal_id": "pp_3ab9151779851a07ff207543"
        },
        {
          "opened_ts": "2026-06-04T21:09:59.999000Z",
          "closed_ts": "2026-06-04T21:19:59.999000Z",
          "side": "short",
          "entry_price": 63847.0,
          "exit_price": 63609.21035714286,
          "pnl_usd": 0.7074,
          "exit_reason": "tp",
          "proposal_id": "pp_2c1c1789c99bcaa82a0d434b"
        },
        {
          "opened_ts": "2026-06-04T21:14:59.999000Z",
          "closed_ts": "2026-06-04T21:19:59.999000Z",
          "side": "long",
          "entry_price": 63804.82,
          "exit_price": 63654.87928571428,
          "pnl_usd": -1.0959,
          "exit_reason": "sl",
          "proposal_id": "pp_c33261d2911e165f453f72fc"
        },
        {
          "opened_ts": "2026-06-04T21:19:59.999000Z",
          "closed_ts": "2026-06-04T21:24:59.999000Z",
          "side": "long",
          "entry_price": 63676.02,
          "exit_price": 63520.91214285714,
          "pnl_usd": -1.1262,
          "exit_reason": "sl",
          "proposal_id": "pp_85e41397abdb599e214bb12d"
        },
        {
          "opened_ts": "2026-06-04T21:19:59.999000Z",
          "closed_ts": "2026-06-04T21:24:59.999000Z",
          "side": "long",
          "entry_price": 63676.02,
          "exit_price": 63520.91214285714,
          "pnl_usd": -1.1262,
          "exit_reason": "sl",
          "proposal_id": "pp_c33261d2911e165f453f72fc"
        },
        {
          "opened_ts": "2026-06-04T21:24:59.999000Z",
          "closed_ts": "2026-06-04T21:34:59.999000Z",
          "side": "long",
          "entry_price": 63555.48,
          "exit_price": 63401.247142857144,
          "pnl_usd": -1.1227,
          "exit_reason": "sl",
          "proposal_id": "pp_77d71b4949557b3a1cac2bcc"
        },
        {
          "opened_ts": "2026-06-04T21:24:59.999000Z",
          "closed_ts": "2026-06-04T21:34:59.999000Z",
          "side": "long",
          "entry_price": 63555.48,
          "exit_price": 63401.247142857144,
          "pnl_usd": -1.1226,
          "exit_reason": "sl",
          "proposal_id": "pp_c33261d2911e165f453f72fc"
        },
        {
          "opened_ts": "2026-06-04T21:34:59.999000Z",
          "closed_ts": "2026-06-04T21:44:59.999000Z",
          "side": "long",
          "entry_price": 63427.99,
          "exit_price": 63269.86357142857,
          "pnl_usd": -1.1457,
          "exit_reason": "sl",
          "proposal_id": "pp_4d23b5e6bde413d7e3a35144"
        },
        {
          "opened_ts": "2026-06-04T21:34:59.999000Z",
          "closed_ts": "2026-06-04T21:44:59.999000Z",
          "side": "long",
          "entry_price": 63427.99,
          "exit_price": 63269.86357142857,
          "pnl_usd": -1.1457,
          "exit_reason": "sl",
          "proposal_id": "pp_c33261d2911e165f453f72fc"
        },
        {
          "opened_ts": "2026-06-04T21:44:59.999000Z",
          "closed_ts": "2026-06-04T21:59:59.999000Z",
          "side": "long",
          "entry_price": 63496.0,
          "exit_price": 63326.514285714286,
          "pnl_usd": -1.2076,
          "exit_reason": "sl",
          "proposal_id": "pp_1e5ec2edd49cebe5ff554a38"
        },
        {
          "opened_ts": "2026-06-04T21:44:59.999000Z",
          "closed_ts": "2026-06-04T21:59:59.999000Z",
          "side": "long",
          "entry_price": 63496.0,
          "exit_price": 63326.514285714286,
          "pnl_usd": -1.2076,
          "exit_reason": "sl",
          "proposal_id": "pp_c33261d2911e165f453f72fc"
        },
        {
          "opened_ts": "2026-06-04T21:59:59.999000Z",
          "closed_ts": "2026-06-04T22:14:59.999000Z",
          "side": "long",
          "entry_price": 63286.21,
          "exit_price": 63292.0,
          "pnl_usd": -0.2325,
          "exit_reason": "time_stop",
          "proposal_id": "pp_b1b3b0cd7ca8f7301704f04e"
        },
        {
          "opened_ts": "2026-06-04T22:14:59.999000Z",
          "closed_ts": "2026-06-04T22:29:59.999000Z",
          "side": "long",
          "entry_price": 63292.0,
          "exit_price": 63352.14,
          "pnl_usd": 0.0707,
          "exit_reason": "time_stop",
          "proposal_id": "pp_e064433387e1ef89f12c1b84"
        },
        {
          "opened_ts": "2026-06-04T21:59:59.999000Z",
          "closed_ts": "2026-06-04T22:44:59.999000Z",
          "side": "long",
          "entry_price": 63286.21,
          "exit_price": 63545.03178571429,
          "pnl_usd": 1.1791,
          "exit_reason": "tp",
          "proposal_id": "pp_c33261d2911e165f453f72fc"
        },
        {
          "opened_ts": "2026-06-04T22:29:59.999000Z",
          "closed_ts": "2026-06-04T22:44:59.999000Z",
          "side": "long",
          "entry_price": 63352.14,
          "exit_price": 63504.15,
          "pnl_usd": 0.5823,
          "exit_reason": "time_stop",
          "proposal_id": "pp_77b1ad3521ea5033983cca13"
        },
        {
          "opened_ts": "2026-06-04T22:44:59.999000Z",
          "closed_ts": "2026-06-04T22:59:59.999000Z",
          "side": "short",
          "entry_price": 63504.15,
          "exit_price": 63697.13428571429,
          "pnl_usd": -1.1499,
          "exit_reason": "sl",
          "proposal_id": "pp_49cff0e14273a247ddaf34f2"
        },
        {
          "opened_ts": "2026-06-04T22:44:59.999000Z",
          "closed_ts": "2026-06-04T23:04:59.999000Z",
          "side": "long",
          "entry_price": 63504.15,
          "exit_price": 63793.62642857143,
          "pnl_usd": 1.1545,
          "exit_reason": "tp",
          "proposal_id": "pp_f78c2cc97efce2378e67e29f"
        },
        {
          "opened_ts": "2026-06-04T22:59:59.999000Z",
          "closed_ts": "2026-06-04T23:19:59.999000Z",
          "side": "long",
          "entry_price": 63735.43,
          "exit_price": 63559.13142857143,
          "pnl_usd": -1.0657,
          "exit_reason": "sl",
          "proposal_id": "pp_f78c2cc97efce2378e67e29f"
        },
        {
          "opened_ts": "2026-06-04T23:04:59.999000Z",
          "closed_ts": "2026-06-04T23:19:59.999000Z",
          "side": "short",
          "entry_price": 63837.34,
          "exit_price": 63569.81821428571,
          "pnl_usd": 0.9661,
          "exit_reason": "tp",
          "proposal_id": "pp_0e01ce7da2c7468bab9f6dd1"
        },
        {
          "opened_ts": "2026-06-04T23:19:59.999000Z",
          "closed_ts": "2026-06-04T23:34:59.999000Z",
          "side": "long",
          "entry_price": 63382.01,
          "exit_price": 63628.74071428571,
          "pnl_usd": 1.1096,
          "exit_reason": "tp",
          "proposal_id": "pp_aeead4f8d8a9011d5df51f20"
        },
        {
          "opened_ts": "2026-06-04T23:19:59.999000Z",
          "closed_ts": "2026-06-04T23:34:59.999000Z",
          "side": "long",
          "entry_price": 63382.01,
          "exit_price": 63628.74071428571,
          "pnl_usd": 1.1096,
          "exit_reason": "tp",
          "proposal_id": "pp_dd4b810634730a9d424cf3a3"
        },
        {
          "opened_ts": "2026-06-04T23:34:59.999000Z",
          "closed_ts": "2026-06-04T23:49:59.999000Z",
          "side": "long",
          "entry_price": 63616.0,
          "exit_price": 63771.84,
          "pnl_usd": 0.6002,
          "exit_reason": "time_stop",
          "proposal_id": "pp_ab76cd09261a0a548a953d9f"
        },
        {
          "opened_ts": "2026-06-04T23:34:59.999000Z",
          "closed_ts": "2026-06-04T23:54:59.999000Z",
          "side": "long",
          "entry_price": 63616.0,
          "exit_price": 63858.841428571424,
          "pnl_usd": 1.0831,
          "exit_reason": "tp",
          "proposal_id": "pp_dd4b810634730a9d424cf3a3"
        },
        {
          "opened_ts": "2026-06-04T23:54:59.999000Z",
          "closed_ts": "2026-06-05T00:09:59.999000Z",
          "side": "long",
          "entry_price": 63862.0,
          "exit_price": 63721.51571428571,
          "pnl_usd": -1.0417,
          "exit_reason": "sl",
          "proposal_id": "pp_91cdd2fc758aef95dd277cb7"
        },
        {
          "opened_ts": "2026-06-05T00:09:59.999000Z",
          "closed_ts": "2026-06-05T00:14:59.999000Z",
          "side": "long",
          "entry_price": 63823.2,
          "exit_price": 63688.89214285714,
          "pnl_usd": -1.0079,
          "exit_reason": "sl",
          "proposal_id": "pp_4b4f857dd52a524bea48dc2a"
        },
        {
          "opened_ts": "2026-06-04T23:49:59.999000Z",
          "closed_ts": "2026-06-05T00:19:59.999000Z",
          "side": "long",
          "entry_price": 63771.84,
          "exit_price": 63629.77571428571,
          "pnl_usd": -1.0515,
          "exit_reason": "sl",
          "proposal_id": "pp_dd4b810634730a9d424cf3a3"
        },
        {
          "opened_ts": "2026-06-05T00:14:59.999000Z",
          "closed_ts": "2026-06-05T00:24:59.999000Z",
          "side": "long",
          "entry_price": 63662.77,
          "exit_price": 63867.59714285714,
          "pnl_usd": 0.8711,
          "exit_reason": "tp",
          "proposal_id": "pp_bfe503c6a6caa346420f862b"
        },
        {
          "opened_ts": "2026-06-05T00:19:59.999000Z",
          "closed_ts": "2026-06-05T00:24:59.999000Z",
          "side": "long",
          "entry_price": 63686.2,
          "exit_price": 63893.921071428565,
          "pnl_usd": 0.8866,
          "exit_reason": "tp",
          "proposal_id": "pp_3d3736a41d9ad5c98563dc44"
        },
        {
          "opened_ts": "2026-06-05T00:24:59.999000Z",
          "closed_ts": "2026-06-05T00:39:59.999000Z",
          "side": "long",
          "entry_price": 63840.12,
          "exit_price": 63697.54928571429,
          "pnl_usd": -1.0533,
          "exit_reason": "sl",
          "proposal_id": "pp_e2dda6897238fe6a7328db34"
        },
        {
          "opened_ts": "2026-06-05T00:24:59.999000Z",
          "closed_ts": "2026-06-05T00:39:59.999000Z",
          "side": "long",
          "entry_price": 63840.12,
          "exit_price": 63697.54928571429,
          "pnl_usd": -0.719,
          "exit_reason": "sl",
          "proposal_id": "pp_fc7edd44c487e2310b37e168"
        },
        {
          "opened_ts": "2026-06-05T00:39:59.999000Z",
          "closed_ts": "2026-06-05T00:44:59.999000Z",
          "side": "long",
          "entry_price": 63862.7,
          "exit_price": 63715.18357142857,
          "pnl_usd": -1.0801,
          "exit_reason": "sl",
          "proposal_id": "pp_af3f5b6809f390e80219ecd6"
        },
        {
          "opened_ts": "2026-06-05T00:39:59.999000Z",
          "closed_ts": "2026-06-05T00:44:59.999000Z",
          "side": "long",
          "entry_price": 63862.7,
          "exit_price": 63715.18357142857,
          "pnl_usd": -0.7373,
          "exit_reason": "sl",
          "proposal_id": "pp_fc7edd44c487e2310b37e168"
        },
        {
          "opened_ts": "2026-06-05T00:44:59.999000Z",
          "closed_ts": "2026-06-05T00:54:59.999000Z",
          "side": "long",
          "entry_price": 63697.94,
          "exit_price": 63551.56642857143,
          "pnl_usd": -1.0756,
          "exit_reason": "sl",
          "proposal_id": "pp_6fb96a6f4ba6faabae09104d"
        },
        {
          "opened_ts": "2026-06-05T00:44:59.999000Z",
          "closed_ts": "2026-06-05T00:54:59.999000Z",
          "side": "long",
          "entry_price": 63697.94,
          "exit_price": 63551.56642857143,
          "pnl_usd": -0.7342,
          "exit_reason": "sl",
          "proposal_id": "pp_fc7edd44c487e2310b37e168"
        },
        {
          "opened_ts": "2026-06-05T00:54:59.999000Z",
          "closed_ts": "2026-06-05T01:04:59.999000Z",
          "side": "long",
          "entry_price": 63524.01,
          "exit_price": 63364.080714285716,
          "pnl_usd": -1.1529,
          "exit_reason": "sl",
          "proposal_id": "pp_ef0c479f04ed803038de663c"
        },
        {
          "opened_ts": "2026-06-05T00:54:59.999000Z",
          "closed_ts": "2026-06-05T01:04:59.999000Z",
          "side": "long",
          "entry_price": 63524.01,
          "exit_price": 63364.080714285716,
          "pnl_usd": -0.787,
          "exit_reason": "sl",
          "proposal_id": "pp_fc7edd44c487e2310b37e168"
        },
        {
          "opened_ts": "2026-06-05T01:04:59.999000Z",
          "closed_ts": "2026-06-05T01:09:59.999000Z",
          "side": "short",
          "entry_price": 63070.85,
          "exit_price": 63252.637142857144,
          "pnl_usd": -1.2812,
          "exit_reason": "sl",
          "proposal_id": "pp_d838f06248dfd4128dd0d8f6"
        },
        {
          "opened_ts": "2026-06-05T01:04:59.999000Z",
          "closed_ts": "2026-06-05T01:14:59.999000Z",
          "side": "long",
          "entry_price": 63070.85,
          "exit_price": 63343.53071428571,
          "pnl_usd": 1.2604,
          "exit_reason": "tp",
          "proposal_id": "pp_0b3a2ecceb28e39eece929bd"
        },
        {
          "opened_ts": "2026-06-05T01:09:59.999000Z",
          "closed_ts": "2026-06-05T01:19:59.999000Z",
          "side": "short",
          "entry_price": 63212.64,
          "exit_price": 63400.50928571429,
          "pnl_usd": -1.066,
          "exit_reason": "sl",
          "proposal_id": "pp_9547d3ea72890cc99dd6ed61"
        },
        {
          "opened_ts": "2026-06-05T01:14:59.999000Z",
          "closed_ts": "2026-06-05T01:24:59.999000Z",
          "side": "long",
          "entry_price": 63361.92,
          "exit_price": 63169.055714285714,
          "pnl_usd": -1.3381,
          "exit_reason": "sl",
          "proposal_id": "pp_830f41218e13ad3ee7b690b9"
        },
        {
          "opened_ts": "2026-06-05T01:19:59.999000Z",
          "closed_ts": "2026-06-05T01:24:59.999000Z",
          "side": "long",
          "entry_price": 63356.0,
          "exit_price": 63158.35,
          "pnl_usd": -1.3646,
          "exit_reason": "sl",
          "proposal_id": "pp_8638d1eb6cfbfa32352c993c"
        },
        {
          "opened_ts": "2026-06-05T01:24:59.999000Z",
          "closed_ts": "2026-06-05T01:39:59.999000Z",
          "side": "long",
          "entry_price": 63313.99,
          "exit_price": 63307.92,
          "pnl_usd": -0.2982,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f75d9da51572451f74fbaec1"
        },
        {
          "opened_ts": "2026-06-05T01:39:59.999000Z",
          "closed_ts": "2026-06-05T01:54:59.999000Z",
          "side": "long",
          "entry_price": 63307.92,
          "exit_price": 63338.23,
          "pnl_usd": -0.0801,
          "exit_reason": "time_stop",
          "proposal_id": "pp_3db44f09833e5792bd5fa8d2"
        },
        {
          "opened_ts": "2026-06-05T01:54:59.999000Z",
          "closed_ts": "2026-06-05T02:09:59.999000Z",
          "side": "long",
          "entry_price": 63338.23,
          "exit_price": 63226.52,
          "pnl_usd": -0.8861,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f74de029a06e767a9d41fa77"
        },
        {
          "opened_ts": "2026-06-05T01:24:59.999000Z",
          "closed_ts": "2026-06-05T02:19:59.999000Z",
          "side": "long",
          "entry_price": 63313.99,
          "exit_price": 63115.33928571428,
          "pnl_usd": -1.3705,
          "exit_reason": "sl",
          "proposal_id": "pp_0b3a2ecceb28e39eece929bd"
        },
        {
          "opened_ts": "2026-06-05T02:09:59.999000Z",
          "closed_ts": "2026-06-05T02:19:59.999000Z",
          "side": "long",
          "entry_price": 63226.52,
          "exit_price": 63037.19857142857,
          "pnl_usd": -1.3197,
          "exit_reason": "sl",
          "proposal_id": "pp_d0336f4a5e2f2fe7b74a7bec"
        },
        {
          "opened_ts": "2026-06-05T02:19:59.999000Z",
          "closed_ts": "2026-06-05T02:24:59.999000Z",
          "side": "long",
          "entry_price": 63019.54,
          "exit_price": 62846.567142857144,
          "pnl_usd": -1.2313,
          "exit_reason": "sl",
          "proposal_id": "pp_cc82e8176fda16fe302d1753"
        },
        {
          "opened_ts": "2026-06-05T02:19:59.999000Z",
          "closed_ts": "2026-06-05T02:24:59.999000Z",
          "side": "long",
          "entry_price": 63019.54,
          "exit_price": 62846.567142857144,
          "pnl_usd": -0.9351,
          "exit_reason": "sl",
          "proposal_id": "pp_d7ea3f795aa8b7274fe0ca31"
        },
        {
          "opened_ts": "2026-06-05T02:24:59.999000Z",
          "closed_ts": "2026-06-05T02:29:59.999000Z",
          "side": "long",
          "entry_price": 62920.0,
          "exit_price": 62741.94142857143,
          "pnl_usd": -1.261,
          "exit_reason": "sl",
          "proposal_id": "pp_c4ea5db6d38ff2f46cea7fb8"
        },
        {
          "opened_ts": "2026-06-05T02:24:59.999000Z",
          "closed_ts": "2026-06-05T02:29:59.999000Z",
          "side": "long",
          "entry_price": 62920.0,
          "exit_price": 62741.94142857143,
          "pnl_usd": -1.261,
          "exit_reason": "sl",
          "proposal_id": "pp_cc82e8176fda16fe302d1753"
        },
        {
          "opened_ts": "2026-06-05T02:29:59.999000Z",
          "closed_ts": "2026-06-05T02:44:59.999000Z",
          "side": "long",
          "entry_price": 62705.48,
          "exit_price": 62742.01,
          "pnl_usd": -0.059,
          "exit_reason": "time_stop",
          "proposal_id": "pp_845471139453910c57371a31"
        },
        {
          "opened_ts": "2026-06-05T02:44:59.999000Z",
          "closed_ts": "2026-06-05T02:59:59.999000Z",
          "side": "long",
          "entry_price": 62742.01,
          "exit_price": 62617.72,
          "pnl_usd": -0.9319,
          "exit_reason": "time_stop",
          "proposal_id": "pp_3f94fe7027ef2e170fdb27cf"
        },
        {
          "opened_ts": "2026-06-05T02:29:59.999000Z",
          "closed_ts": "2026-06-05T03:04:59.999000Z",
          "side": "long",
          "entry_price": 62705.48,
          "exit_price": 62524.34928571429,
          "pnl_usd": -1.2812,
          "exit_reason": "sl",
          "proposal_id": "pp_cc82e8176fda16fe302d1753"
        },
        {
          "opened_ts": "2026-06-05T02:59:59.999000Z",
          "closed_ts": "2026-06-05T03:14:59.999000Z",
          "side": "short",
          "entry_price": 62617.72,
          "exit_price": 62379.62,
          "pnl_usd": 0.8763,
          "exit_reason": "time_stop",
          "proposal_id": "pp_35242d098709fe714cf5ed30"
        },
        {
          "opened_ts": "2026-06-05T03:04:59.999000Z",
          "closed_ts": "2026-06-05T03:19:59.999000Z",
          "side": "short",
          "entry_price": 62594.0,
          "exit_price": 62791.897142857146,
          "pnl_usd": -1.3769,
          "exit_reason": "sl",
          "proposal_id": "pp_30dc9aac322e172d1ecfd412"
        },
        {
          "opened_ts": "2026-06-05T03:14:59.999000Z",
          "closed_ts": "2026-06-05T03:19:59.999000Z",
          "side": "short",
          "entry_price": 62379.62,
          "exit_price": 62574.705,
          "pnl_usd": -1.0635,
          "exit_reason": "sl",
          "proposal_id": "pp_09f689e28caa7537c217f7ff"
        },
        {
          "opened_ts": "2026-06-05T03:19:59.999000Z",
          "closed_ts": "2026-06-05T03:24:59.999000Z",
          "side": "long",
          "entry_price": 62780.0,
          "exit_price": 62563.764285714286,
          "pnl_usd": -1.2378,
          "exit_reason": "sl",
          "proposal_id": "pp_6c8be172824e99ca7fc2f776"
        },
        {
          "opened_ts": "2026-06-05T03:19:59.999000Z",
          "closed_ts": "2026-06-05T03:34:59.999000Z",
          "side": "short",
          "entry_price": 62780.0,
          "exit_price": 62820.01,
          "pnl_usd": -0.4882,
          "exit_reason": "time_stop",
          "proposal_id": "pp_d505005edee2f712fff915a8"
        },
        {
          "opened_ts": "2026-06-05T03:24:59.999000Z",
          "closed_ts": "2026-06-05T03:34:59.999000Z",
          "side": "short",
          "entry_price": 62659.81,
          "exit_price": 62886.12214285714,
          "pnl_usd": -1.5347,
          "exit_reason": "sl",
          "proposal_id": "pp_47cafc6a6035942b25a9d451"
        },
        {
          "opened_ts": "2026-06-05T03:34:59.999000Z",
          "closed_ts": "2026-06-05T03:44:59.999000Z",
          "side": "long",
          "entry_price": 62820.01,
          "exit_price": 62603.21928571429,
          "pnl_usd": -1.1706,
          "exit_reason": "sl",
          "proposal_id": "pp_3e4b17fd27f34cae03ec7ffe"
        },
        {
          "opened_ts": "2026-06-05T03:34:59.999000Z",
          "closed_ts": "2026-06-05T03:44:59.999000Z",
          "side": "long",
          "entry_price": 62820.01,
          "exit_price": 62603.21928571429,
          "pnl_usd": -1.3378,
          "exit_reason": "sl",
          "proposal_id": "pp_6c8be172824e99ca7fc2f776"
        },
        {
          "opened_ts": "2026-06-05T03:44:59.999000Z",
          "closed_ts": "2026-06-05T03:59:59.999000Z",
          "side": "long",
          "entry_price": 62665.41,
          "exit_price": 62730.0,
          "pnl_usd": 0.094,
          "exit_reason": "time_stop",
          "proposal_id": "pp_09713241f95e14730dc191bf"
        },
        {
          "opened_ts": "2026-06-05T03:59:59.999000Z",
          "closed_ts": "2026-06-05T04:04:59.999000Z",
          "side": "long",
          "entry_price": 62730.0,
          "exit_price": 62534.89857142857,
          "pnl_usd": -1.2469,
          "exit_reason": "sl",
          "proposal_id": "pp_509d00175a4ac186bd5efc9c"
        },
        {
          "opened_ts": "2026-06-05T03:44:59.999000Z",
          "closed_ts": "2026-06-05T04:09:59.999000Z",
          "side": "long",
          "entry_price": 62665.41,
          "exit_price": 62979.42857142857,
          "pnl_usd": 1.3565,
          "exit_reason": "tp",
          "proposal_id": "pp_6c8be172824e99ca7fc2f776"
        },
        {
          "opened_ts": "2026-06-05T04:04:59.999000Z",
          "closed_ts": "2026-06-05T04:09:59.999000Z",
          "side": "long",
          "entry_price": 62630.01,
          "exit_price": 62931.58285714286,
          "pnl_usd": 1.1628,
          "exit_reason": "tp",
          "proposal_id": "pp_6215ec19bc67e876e93073da"
        },
        {
          "opened_ts": "2026-06-05T04:09:59.999000Z",
          "closed_ts": "2026-06-05T04:19:59.999000Z",
          "side": "long",
          "entry_price": 62922.93,
          "exit_price": 62702.73857142857,
          "pnl_usd": -1.4944,
          "exit_reason": "sl",
          "proposal_id": "pp_0d58e3016373df7931c99b7d"
        },
        {
          "opened_ts": "2026-06-05T04:09:59.999000Z",
          "closed_ts": "2026-06-05T04:19:59.999000Z",
          "side": "long",
          "entry_price": 62922.93,
          "exit_price": 62702.73857142857,
          "pnl_usd": -1.4944,
          "exit_reason": "sl",
          "proposal_id": "pp_626a9c934fdf6647ac1cc91e"
        },
        {
          "opened_ts": "2026-06-05T04:19:59.999000Z",
          "closed_ts": "2026-06-05T04:29:59.999000Z",
          "side": "long",
          "entry_price": 62698.01,
          "exit_price": 63024.387500000004,
          "pnl_usd": 1.3266,
          "exit_reason": "tp",
          "proposal_id": "pp_453357fdb8697c4d79732e25"
        },
        {
          "opened_ts": "2026-06-05T04:19:59.999000Z",
          "closed_ts": "2026-06-05T04:29:59.999000Z",
          "side": "long",
          "entry_price": 62698.01,
          "exit_price": 63024.387500000004,
          "pnl_usd": 1.5663,
          "exit_reason": "tp",
          "proposal_id": "pp_626a9c934fdf6647ac1cc91e"
        },
        {
          "opened_ts": "2026-06-05T04:29:59.999000Z",
          "closed_ts": "2026-06-05T04:44:59.999000Z",
          "side": "long",
          "entry_price": 63240.32,
          "exit_price": 63017.952142857146,
          "pnl_usd": -1.3026,
          "exit_reason": "sl",
          "proposal_id": "pp_74ac4c0478e6945a9b414ec5"
        },
        {
          "opened_ts": "2026-06-05T04:29:59.999000Z",
          "closed_ts": "2026-06-05T04:44:59.999000Z",
          "side": "long",
          "entry_price": 63240.32,
          "exit_price": 63017.952142857146,
          "pnl_usd": -1.5001,
          "exit_reason": "sl",
          "proposal_id": "pp_626a9c934fdf6647ac1cc91e"
        },
        {
          "opened_ts": "2026-06-05T04:44:59.999000Z",
          "closed_ts": "2026-06-05T04:54:59.999000Z",
          "side": "short",
          "entry_price": 63025.12,
          "exit_price": 63233.705,
          "pnl_usd": -1.2382,
          "exit_reason": "sl",
          "proposal_id": "pp_e8d000c6c9ed45c4351f17b7"
        },
        {
          "opened_ts": "2026-06-05T04:44:59.999000Z",
          "closed_ts": "2026-06-05T04:59:59.999000Z",
          "side": "long",
          "entry_price": 63025.12,
          "exit_price": 63337.997500000005,
          "pnl_usd": 1.4814,
          "exit_reason": "tp",
          "proposal_id": "pp_626a9c934fdf6647ac1cc91e"
        },
        {
          "opened_ts": "2026-06-05T04:54:59.999000Z",
          "closed_ts": "2026-06-05T05:04:59.999000Z",
          "side": "long",
          "entry_price": 63318.67,
          "exit_price": 63656.30607142857,
          "pnl_usd": 1.6105,
          "exit_reason": "tp",
          "proposal_id": "pp_626a9c934fdf6647ac1cc91e"
        },
        {
          "opened_ts": "2026-06-05T04:59:59.999000Z",
          "closed_ts": "2026-06-05T05:14:59.999000Z",
          "side": "short",
          "entry_price": 63615.23,
          "exit_price": 63384.33,
          "pnl_usd": 1.0122,
          "exit_reason": "time_stop",
          "proposal_id": "pp_68d2a81024a179ffcd44bf71"
        },
        {
          "opened_ts": "2026-06-05T05:04:59.999000Z",
          "closed_ts": "2026-06-05T05:19:59.999000Z",
          "side": "short",
          "entry_price": 63418.88,
          "exit_price": 63336.86,
          "pnl_usd": 0.191,
          "exit_reason": "time_stop",
          "proposal_id": "pp_cb89a8228a544516f329b1b5"
        },
        {
          "opened_ts": "2026-06-05T05:14:59.999000Z",
          "closed_ts": "2026-06-05T05:29:59.999000Z",
          "side": "long",
          "entry_price": 63384.33,
          "exit_price": 63510.02,
          "pnl_usd": 0.3759,
          "exit_reason": "time_stop",
          "proposal_id": "pp_0287dee1eb3ee34ae096492e"
        },
        {
          "opened_ts": "2026-06-05T05:19:59.999000Z",
          "closed_ts": "2026-06-05T05:34:59.999000Z",
          "side": "long",
          "entry_price": 63336.86,
          "exit_price": 63341.68,
          "pnl_usd": -0.2038,
          "exit_reason": "time_stop",
          "proposal_id": "pp_eed63b9dedc8b2ea68ce89fe"
        },
        {
          "opened_ts": "2026-06-05T05:29:59.999000Z",
          "closed_ts": "2026-06-05T05:39:59.999000Z",
          "side": "long",
          "entry_price": 63510.02,
          "exit_price": 63281.36571428571,
          "pnl_usd": -1.2895,
          "exit_reason": "sl",
          "proposal_id": "pp_08f6e47e99c5be461d9d030c"
        },
        {
          "opened_ts": "2026-06-05T05:34:59.999000Z",
          "closed_ts": "2026-06-05T05:44:59.999000Z",
          "side": "short",
          "entry_price": 63341.68,
          "exit_price": 62993.64892857143,
          "pnl_usd": 1.668,
          "exit_reason": "tp",
          "proposal_id": "pp_0b01f6ce197b74a2e4af37d7"
        },
        {
          "opened_ts": "2026-06-05T05:39:59.999000Z",
          "closed_ts": "2026-06-05T05:44:59.999000Z",
          "side": "long",
          "entry_price": 63170.35,
          "exit_price": 62949.315714285716,
          "pnl_usd": -1.1644,
          "exit_reason": "sl",
          "proposal_id": "pp_56213711bdabf545fc52e23a"
        },
        {
          "opened_ts": "2026-06-05T05:44:59.999000Z",
          "closed_ts": "2026-06-05T05:49:59.999000Z",
          "side": "long",
          "entry_price": 62893.14,
          "exit_price": 62663.91428571429,
          "pnl_usd": -1.2258,
          "exit_reason": "sl",
          "proposal_id": "pp_edac99ead0a309894a4598a9"
        },
        {
          "opened_ts": "2026-06-05T05:44:59.999000Z",
          "closed_ts": "2026-06-05T05:59:59.999000Z",
          "side": "short",
          "entry_price": 62893.14,
          "exit_price": 62549.30142857143,
          "pnl_usd": 1.6581,
          "exit_reason": "tp",
          "proposal_id": "pp_bfb9aed8b85364dc41060d3b"
        },
        {
          "opened_ts": "2026-06-05T05:49:59.999000Z",
          "closed_ts": "2026-06-05T05:59:59.999000Z",
          "side": "short",
          "entry_price": 62780.02,
          "exit_price": 62415.18785714285,
          "pnl_usd": 1.7788,
          "exit_reason": "tp",
          "proposal_id": "pp_ce46177a5f8bdec7de59bfa7"
        },
        {
          "opened_ts": "2026-06-05T05:59:59.999000Z",
          "closed_ts": "2026-06-05T06:04:59.999000Z",
          "side": "long",
          "entry_price": 62329.35,
          "exit_price": 62055.64857142857,
          "pnl_usd": -1.4342,
          "exit_reason": "sl",
          "proposal_id": "pp_edac99ead0a309894a4598a9"
        },
        {
          "opened_ts": "2026-06-05T05:59:59.999000Z",
          "closed_ts": "2026-06-05T06:09:59.999000Z",
          "side": "short",
          "entry_price": 62329.35,
          "exit_price": 62603.05142857142,
          "pnl_usd": -1.8075,
          "exit_reason": "sl",
          "proposal_id": "pp_4aacd588ca12fa2631f22523"
        },
        {
          "opened_ts": "2026-06-05T06:04:59.999000Z",
          "closed_ts": "2026-06-05T06:09:59.999000Z",
          "side": "long",
          "entry_price": 62175.99,
          "exit_price": 62595.2775,
          "pnl_usd": 1.4431,
          "exit_reason": "tp",
          "proposal_id": "pp_3df7f993faf97629fd3e3e29"
        },
        {
          "opened_ts": "2026-06-05T06:09:59.999000Z",
          "closed_ts": "2026-06-05T06:14:59.999000Z",
          "side": "long",
          "entry_price": 62444.0,
          "exit_price": 62162.474285714285,
          "pnl_usd": -1.406,
          "exit_reason": "sl",
          "proposal_id": "pp_3b9f02c5a5827cd4e2dc4b28"
        },
        {
          "opened_ts": "2026-06-05T06:09:59.999000Z",
          "closed_ts": "2026-06-05T06:14:59.999000Z",
          "side": "long",
          "entry_price": 62444.0,
          "exit_price": 62162.474285714285,
          "pnl_usd": -1.5775,
          "exit_reason": "sl",
          "proposal_id": "pp_bbee74c1983d2d6a94936a47"
        },
        {
          "opened_ts": "2026-06-05T06:14:59.999000Z",
          "closed_ts": "2026-06-05T06:24:59.999000Z",
          "side": "long",
          "entry_price": 62082.93,
          "exit_price": 61788.38642857143,
          "pnl_usd": -1.9305,
          "exit_reason": "sl",
          "proposal_id": "pp_ab391eca66ae9dd9774d8e8d"
        },
        {
          "opened_ts": "2026-06-05T06:14:59.999000Z",
          "closed_ts": "2026-06-05T06:24:59.999000Z",
          "side": "long",
          "entry_price": 62082.93,
          "exit_price": 61788.38642857143,
          "pnl_usd": -1.6476,
          "exit_reason": "sl",
          "proposal_id": "pp_bbee74c1983d2d6a94936a47"
        },
        {
          "opened_ts": "2026-06-05T06:24:59.999000Z",
          "closed_ts": "2026-06-05T06:39:59.999000Z",
          "side": "long",
          "entry_price": 61462.49,
          "exit_price": 61808.0,
          "pnl_usd": 1.3162,
          "exit_reason": "time_stop",
          "proposal_id": "pp_1b6877bc359eaa9eb87d9656"
        },
        {
          "opened_ts": "2026-06-05T06:24:59.999000Z",
          "closed_ts": "2026-06-05T06:44:59.999000Z",
          "side": "long",
          "entry_price": 61462.49,
          "exit_price": 62007.370357142856,
          "pnl_usd": 2.4325,
          "exit_reason": "tp",
          "proposal_id": "pp_bbee74c1983d2d6a94936a47"
        },
        {
          "opened_ts": "2026-06-05T06:39:59.999000Z",
          "closed_ts": "2026-06-05T06:54:59.999000Z",
          "side": "long",
          "entry_price": 61808.0,
          "exit_price": 61991.25,
          "pnl_usd": 0.7779,
          "exit_reason": "time_stop",
          "proposal_id": "pp_a8caa57cce2008432e4b5fa6"
        },
        {
          "opened_ts": "2026-06-05T06:44:59.999000Z",
          "closed_ts": "2026-06-05T06:59:59.999000Z",
          "side": "long",
          "entry_price": 62146.11,
          "exit_price": 61946.57,
          "pnl_usd": -1.3915,
          "exit_reason": "time_stop",
          "proposal_id": "pp_79b881c2937ee6c035d7a2eb"
        },
        {
          "opened_ts": "2026-06-05T06:54:59.999000Z",
          "closed_ts": "2026-06-05T07:09:59.999000Z",
          "side": "long",
          "entry_price": 61991.25,
          "exit_price": 61570.285,
          "pnl_usd": -2.6493,
          "exit_reason": "sl",
          "proposal_id": "pp_85929d81515ace949ec8e605"
        },
        {
          "opened_ts": "2026-06-05T06:59:59.999000Z",
          "closed_ts": "2026-06-05T07:09:59.999000Z",
          "side": "long",
          "entry_price": 61946.57,
          "exit_price": 61537.10357142857,
          "pnl_usd": -2.2066,
          "exit_reason": "sl",
          "proposal_id": "pp_bbee74c1983d2d6a94936a47"
        },
        {
          "opened_ts": "2026-06-05T07:09:59.999000Z",
          "closed_ts": "2026-06-05T07:24:59.999000Z",
          "side": "short",
          "entry_price": 61539.8,
          "exit_price": 61943.071428571435,
          "pnl_usd": -2.564,
          "exit_reason": "sl",
          "proposal_id": "pp_b796c407e7c3b685c5855c9d"
        },
        {
          "opened_ts": "2026-06-05T07:09:59.999000Z",
          "closed_ts": "2026-06-05T07:29:59.999000Z",
          "side": "long",
          "entry_price": 61539.8,
          "exit_price": 62144.70714285714,
          "pnl_usd": 2.5708,
          "exit_reason": "tp",
          "proposal_id": "pp_dc71148fab87e340a4453e1a"
        },
        {
          "opened_ts": "2026-06-05T07:24:59.999000Z",
          "closed_ts": "2026-06-05T07:34:59.999000Z",
          "side": "long",
          "entry_price": 61837.45,
          "exit_price": 62404.5775,
          "pnl_usd": 2.9556,
          "exit_reason": "tp",
          "proposal_id": "pp_e30bfa06663e7d0a659c1641"
        },
        {
          "opened_ts": "2026-06-05T07:29:59.999000Z",
          "closed_ts": "2026-06-05T07:39:59.999000Z",
          "side": "short",
          "entry_price": 62252.95,
          "exit_price": 62640.47285714286,
          "pnl_usd": -2.2665,
          "exit_reason": "sl",
          "proposal_id": "pp_d124e9522e3a54bc4f18e3dd"
        },
        {
          "opened_ts": "2026-06-05T07:34:59.999000Z",
          "closed_ts": "2026-06-05T07:39:59.999000Z",
          "side": "short",
          "entry_price": 62445.84,
          "exit_price": 62797.335,
          "pnl_usd": -2.1913,
          "exit_reason": "sl",
          "proposal_id": "pp_d64d15f583d66694ad0e724a"
        },
        {
          "opened_ts": "2026-06-05T07:39:59.999000Z",
          "closed_ts": "2026-06-05T07:54:59.999000Z",
          "side": "short",
          "entry_price": 62768.0,
          "exit_price": 62940.52,
          "pnl_usd": -1.2279,
          "exit_reason": "time_stop",
          "proposal_id": "pp_2328457d419acaf5e6196ca1"
        },
        {
          "opened_ts": "2026-06-05T07:54:59.999000Z",
          "closed_ts": "2026-06-05T08:09:59.999000Z",
          "side": "long",
          "entry_price": 62940.52,
          "exit_price": 62761.78,
          "pnl_usd": -1.2597,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f7d26361cdbea6ce806bf913"
        },
        {
          "opened_ts": "2026-06-05T08:09:59.999000Z",
          "closed_ts": "2026-06-05T08:24:59.999000Z",
          "side": "long",
          "entry_price": 62761.78,
          "exit_price": 62703.5,
          "pnl_usd": -0.5889,
          "exit_reason": "time_stop",
          "proposal_id": "pp_494b0ed05016896dbef3399f"
        },
        {
          "opened_ts": "2026-06-05T08:24:59.999000Z",
          "closed_ts": "2026-06-05T08:39:59.999000Z",
          "side": "short",
          "entry_price": 62703.5,
          "exit_price": 62533.31,
          "pnl_usd": 0.677,
          "exit_reason": "time_stop",
          "proposal_id": "pp_cc9d0f7d3d8260107f74f285"
        },
        {
          "opened_ts": "2026-06-05T07:39:59.999000Z",
          "closed_ts": "2026-06-05T08:54:59.999000Z",
          "side": "long",
          "entry_price": 62768.0,
          "exit_price": 62419.71357142857,
          "pnl_usd": -1.783,
          "exit_reason": "sl",
          "proposal_id": "pp_dc71148fab87e340a4453e1a"
        },
        {
          "opened_ts": "2026-06-05T08:39:59.999000Z",
          "closed_ts": "2026-06-05T08:54:59.999000Z",
          "side": "long",
          "entry_price": 62533.31,
          "exit_price": 62391.38,
          "pnl_usd": -1.0594,
          "exit_reason": "time_stop",
          "proposal_id": "pp_9bf7dd0f27275739f324ce21"
        },
        {
          "opened_ts": "2026-06-05T08:54:59.999000Z",
          "closed_ts": "2026-06-05T09:09:59.999000Z",
          "side": "long",
          "entry_price": 62391.38,
          "exit_price": 62700.86107142857,
          "pnl_usd": 1.4767,
          "exit_reason": "tp",
          "proposal_id": "pp_fef53e5d1ebc6afbd63db73a"
        },
        {
          "opened_ts": "2026-06-05T08:54:59.999000Z",
          "closed_ts": "2026-06-05T09:09:59.999000Z",
          "side": "long",
          "entry_price": 62391.38,
          "exit_price": 62700.86107142857,
          "pnl_usd": 1.3852,
          "exit_reason": "tp",
          "proposal_id": "pp_1bcaab898a94c2c7dd8073d3"
        },
        {
          "opened_ts": "2026-06-05T09:09:59.999000Z",
          "closed_ts": "2026-06-05T09:14:59.999000Z",
          "side": "long",
          "entry_price": 62745.15,
          "exit_price": 63052.8675,
          "pnl_usd": 1.4574,
          "exit_reason": "tp",
          "proposal_id": "pp_3506b27dc1ae5b984173057b"
        },
        {
          "opened_ts": "2026-06-05T09:09:59.999000Z",
          "closed_ts": "2026-06-05T09:14:59.999000Z",
          "side": "long",
          "entry_price": 62745.15,
          "exit_price": 63052.8675,
          "pnl_usd": 1.3696,
          "exit_reason": "tp",
          "proposal_id": "pp_49b22a07dd8d35c8d950ea88"
        },
        {
          "opened_ts": "2026-06-05T09:14:59.999000Z",
          "closed_ts": "2026-06-05T09:39:59.999000Z",
          "side": "long",
          "entry_price": 63099.64,
          "exit_price": 62878.90142857143,
          "pnl_usd": -1.401,
          "exit_reason": "sl",
          "proposal_id": "pp_49b22a07dd8d35c8d950ea88"
        },
        {
          "opened_ts": "2026-06-05T09:14:59.999000Z",
          "closed_ts": "2026-06-05T09:39:59.999000Z",
          "side": "long",
          "entry_price": 63099.64,
          "exit_price": 62878.90142857143,
          "pnl_usd": -1.3984,
          "exit_reason": "sl",
          "proposal_id": "pp_1bcaab898a94c2c7dd8073d3"
        },
        {
          "opened_ts": "2026-06-05T09:39:59.999000Z",
          "closed_ts": "2026-06-05T09:54:59.999000Z",
          "side": "long",
          "entry_price": 62814.34,
          "exit_price": 62863.42,
          "pnl_usd": 0.011,
          "exit_reason": "time_stop",
          "proposal_id": "pp_571893ef3197cc88a4e3ca93"
        },
        {
          "opened_ts": "2026-06-05T09:54:59.999000Z",
          "closed_ts": "2026-06-05T10:09:59.999000Z",
          "side": "long",
          "entry_price": 62863.42,
          "exit_price": 62680.81,
          "pnl_usd": -1.282,
          "exit_reason": "time_stop",
          "proposal_id": "pp_a40c6505e0a0ed1df3482fb4"
        },
        {
          "opened_ts": "2026-06-05T09:39:59.999000Z",
          "closed_ts": "2026-06-05T10:19:59.999000Z",
          "side": "long",
          "entry_price": 62814.34,
          "exit_price": 62584.332142857136,
          "pnl_usd": -1.4543,
          "exit_reason": "sl",
          "proposal_id": "pp_49b22a07dd8d35c8d950ea88"
        },
        {
          "opened_ts": "2026-06-05T10:09:59.999000Z",
          "closed_ts": "2026-06-05T10:24:59.999000Z",
          "side": "long",
          "entry_price": 62680.81,
          "exit_price": 62538.35,
          "pnl_usd": -1.0601,
          "exit_reason": "time_stop",
          "proposal_id": "pp_3bbf6d7521b7c4ce5e85332c"
        },
        {
          "opened_ts": "2026-06-05T10:19:59.999000Z",
          "closed_ts": "2026-06-05T10:34:59.999000Z",
          "side": "long",
          "entry_price": 62570.69,
          "exit_price": 62565.63,
          "pnl_usd": -0.2913,
          "exit_reason": "time_stop",
          "proposal_id": "pp_6cab44be35caca30f8b8e559"
        },
        {
          "opened_ts": "2026-06-05T10:24:59.999000Z",
          "closed_ts": "2026-06-05T10:39:59.999000Z",
          "side": "long",
          "entry_price": 62538.35,
          "exit_price": 62387.26,
          "pnl_usd": -0.9931,
          "exit_reason": "time_stop",
          "proposal_id": "pp_f29bf433860cf81c0632da18"
        },
        {
          "opened_ts": "2026-06-05T10:34:59.999000Z",
          "closed_ts": "2026-06-05T10:39:59.999000Z",
          "side": "long",
          "entry_price": 62565.63,
          "exit_price": 62420.731428571424,
          "pnl_usd": -1.0748,
          "exit_reason": "sl",
          "proposal_id": "pp_acbba55cb6ec7a53adafca9b"
        },
        {
          "opened_ts": "2026-06-05T10:39:59.999000Z",
          "closed_ts": "2026-06-05T10:44:59.999000Z",
          "side": "long",
          "entry_price": 62387.26,
          "exit_price": 62611.96642857143,
          "pnl_usd": 0.9995,
          "exit_reason": "tp",
          "proposal_id": "pp_30f6c3496414e14d49c990ee"
        },
        {
          "opened_ts": "2026-06-05T10:39:59.999000Z",
          "closed_ts": "2026-06-05T10:44:59.999000Z",
          "side": "long",
          "entry_price": 62387.26,
          "exit_price": 62611.96642857143,
          "pnl_usd": 0.8079,
          "exit_reason": "tp",
          "proposal_id": "pp_7ffe62b11af58b5842804ce8"
        },
        {
          "opened_ts": "2026-06-05T10:44:59.999000Z",
          "closed_ts": "2026-06-05T10:54:59.999000Z",
          "side": "long",
          "entry_price": 62675.51,
          "exit_price": 62515.65357142857,
          "pnl_usd": -1.1569,
          "exit_reason": "sl",
          "proposal_id": "pp_ff7a8688de397e03d2b9c6dd"
        },
        {
          "opened_ts": "2026-06-05T10:44:59.999000Z",
          "closed_ts": "2026-06-05T10:54:59.999000Z",
          "side": "long",
          "entry_price": 62675.51,
          "exit_price": 62515.65357142857,
          "pnl_usd": -0.9351,
          "exit_reason": "sl",
          "proposal_id": "pp_7ffe62b11af58b5842804ce8"
        },
        {
          "opened_ts": "2026-06-05T10:54:59.999000Z",
          "closed_ts": "2026-06-05T11:04:59.999000Z",
          "side": "long",
          "entry_price": 62546.08,
          "exit_price": 62389.255000000005,
          "pnl_usd": -1.1415,
          "exit_reason": "sl",
          "proposal_id": "pp_f51812c1a2395ef1c38e766f"
        },
        {
          "opened_ts": "2026-06-05T10:54:59.999000Z",
          "closed_ts": "2026-06-05T11:04:59.999000Z",
          "side": "long",
          "entry_price": 62546.08,
          "exit_price": 62389.255000000005,
          "pnl_usd": -0.9226,
          "exit_reason": "sl",
          "proposal_id": "pp_7ffe62b11af58b5842804ce8"
        },
        {
          "opened_ts": "2026-06-05T11:04:59.999000Z",
          "closed_ts": "2026-06-05T11:19:59.999000Z",
          "side": "long",
          "entry_price": 62406.0,
          "exit_price": 62251.970714285715,
          "pnl_usd": -1.1274,
          "exit_reason": "sl",
          "proposal_id": "pp_1a9a91465b0d22ddf43386b5"
        },
        {
          "opened_ts": "2026-06-05T11:04:59.999000Z",
          "closed_ts": "2026-06-05T11:19:59.999000Z",
          "side": "long",
          "entry_price": 62406.0,
          "exit_price": 62251.970714285715,
          "pnl_usd": -1.1274,
          "exit_reason": "sl",
          "proposal_id": "pp_8b3ffc57aff6eab20eacaeca"
        },
        {
          "opened_ts": "2026-06-05T11:19:59.999000Z",
          "closed_ts": "2026-06-05T11:24:59.999000Z",
          "side": "long",
          "entry_price": 62491.91,
          "exit_price": 62326.54571428572,
          "pnl_usd": -1.1895,
          "exit_reason": "sl",
          "proposal_id": "pp_adea38db4d8dd9e71b099680"
        },
        {
          "opened_ts": "2026-06-05T11:19:59.999000Z",
          "closed_ts": "2026-06-05T11:24:59.999000Z",
          "side": "long",
          "entry_price": 62491.91,
          "exit_price": 62326.54571428572,
          "pnl_usd": -1.1894,
          "exit_reason": "sl",
          "proposal_id": "pp_8b3ffc57aff6eab20eacaeca"
        },
        {
          "opened_ts": "2026-06-05T11:24:59.999000Z",
          "closed_ts": "2026-06-05T11:39:59.999000Z",
          "side": "long",
          "entry_price": 62344.88,
          "exit_price": 62295.99,
          "pnl_usd": -0.5372,
          "exit_reason": "time_stop",
          "proposal_id": "pp_e3adc8a5d533a7b0175fc822"
        },
        {
          "opened_ts": "2026-06-05T11:24:59.999000Z",
          "closed_ts": "2026-06-05T11:44:59.999000Z",
          "side": "long",
          "entry_price": 62344.88,
          "exit_price": 62167.71142857143,
          "pnl_usd": -1.2575,
          "exit_reason": "sl",
          "proposal_id": "pp_8b3ffc57aff6eab20eacaeca"
        },
        {
          "opened_ts": "2026-06-05T11:39:59.999000Z",
          "closed_ts": "2026-06-05T11:49:59.999000Z",
          "side": "long",
          "entry_price": 62295.99,
          "exit_price": 62111.15714285714,
          "pnl_usd": -1.3013,
          "exit_reason": "sl",
          "proposal_id": "pp_a1a3ff8df7e3c689a9588c4f"
        },
        {
          "opened_ts": "2026-06-05T11:44:59.999000Z",
          "closed_ts": "2026-06-05T11:59:59.999000Z",
          "side": "long",
          "entry_price": 62114.4,
          "exit_price": 61964.99,
          "pnl_usd": -1.1045,
          "exit_reason": "time_stop",
          "proposal_id": "pp_179d189f785068cc70a84e34"
        },
        {
          "opened_ts": "2026-06-05T11:49:59.999000Z",
          "closed_ts": "2026-06-05T11:59:59.999000Z",
          "side": "long",
          "entry_price": 62189.17,
          "exit_price": 61993.21357142857,
          "pnl_usd": -1.3652,
          "exit_reason": "sl",
          "proposal_id": "pp_8b3ffc57aff6eab20eacaeca"
        },
        {
          "opened_ts": "2026-06-05T11:59:59.999000Z",
          "closed_ts": "2026-06-05T12:04:59.999000Z",
          "side": "short",
          "entry_price": 61964.99,
          "exit_price": 61681.21357142857,
          "pnl_usd": 1.3399,
          "exit_reason": "tp",
          "proposal_id": "pp_7580fe8b7504767f60967ee7"
        },
        {
          "opened_ts": "2026-06-05T11:59:59.999000Z",
          "closed_ts": "2026-06-05T12:04:59.999000Z",
          "side": "long",
          "entry_price": 61964.99,
          "exit_price": 61775.805714285714,
          "pnl_usd": -1.3305,
          "exit_reason": "sl",
          "proposal_id": "pp_8b3ffc57aff6eab20eacaeca"
        },
        {
          "opened_ts": "2026-06-05T12:04:59.999000Z",
          "closed_ts": "2026-06-05T12:09:59.999000Z",
          "side": "long",
          "entry_price": 61656.95,
          "exit_price": 61959.29857142857,
          "pnl_usd": 1.4532,
          "exit_reason": "tp",
          "proposal_id": "pp_41d676b2d184c8bc1b589ba1"
        },
        {
          "opened_ts": "2026-06-05T12:04:59.999000Z",
          "closed_ts": "2026-06-05T12:09:59.999000Z",
          "side": "long",
          "entry_price": 61656.95,
          "exit_price": 61959.29857142857,
          "pnl_usd": 1.4531,
          "exit_reason": "tp",
          "proposal_id": "pp_659c69f29f25a91eefff6631"
        },
        {
          "opened_ts": "2026-06-05T12:09:59.999000Z",
          "closed_ts": "2026-06-05T12:19:59.999000Z",
          "side": "short",
          "entry_price": 62047.06,
          "exit_price": 62281.72714285714,
          "pnl_usd": -1.5859,
          "exit_reason": "sl",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T12:09:59.999000Z",
          "closed_ts": "2026-06-05T12:24:59.999000Z",
          "side": "long",
          "entry_price": 62047.06,
          "exit_price": 62399.06071428571,
          "pnl_usd": 1.7228,
          "exit_reason": "tp",
          "proposal_id": "pp_659c69f29f25a91eefff6631"
        },
        {
          "opened_ts": "2026-06-05T12:19:59.999000Z",
          "closed_ts": "2026-06-05T12:34:59.999000Z",
          "side": "short",
          "entry_price": 62329.81,
          "exit_price": 61968.58964285714,
          "pnl_usd": 1.6889,
          "exit_reason": "tp",
          "proposal_id": "pp_c8187420179f09b2cd00705d"
        },
        {
          "opened_ts": "2026-06-05T12:24:59.999000Z",
          "closed_ts": "2026-06-05T12:34:59.999000Z",
          "side": "short",
          "entry_price": 62389.99,
          "exit_price": 62011.504642857144,
          "pnl_usd": 1.8603,
          "exit_reason": "tp",
          "proposal_id": "pp_071eb62be0bdd112bf2cf0c6"
        },
        {
          "opened_ts": "2026-06-05T12:34:59.999000Z",
          "closed_ts": "2026-06-05T12:49:59.999000Z",
          "side": "long",
          "entry_price": 61753.43,
          "exit_price": 61968.01,
          "pnl_usd": 0.9538,
          "exit_reason": "time_stop",
          "proposal_id": "pp_a292aae4fe98da10b0133fa3"
        },
        {
          "opened_ts": "2026-06-05T12:49:59.999000Z",
          "closed_ts": "2026-06-05T13:04:59.999000Z",
          "side": "long",
          "entry_price": 61968.01,
          "exit_price": 62073.77,
          "pnl_usd": 0.3349,
          "exit_reason": "time_stop",
          "proposal_id": "pp_4a3a873f5f3f87954c23f916"
        },
        {
          "opened_ts": "2026-06-05T12:34:59.999000Z",
          "closed_ts": "2026-06-05T13:09:59.999000Z",
          "side": "long",
          "entry_price": 61753.43,
          "exit_price": 62164.06035714286,
          "pnl_usd": 2.065,
          "exit_reason": "tp",
          "proposal_id": "pp_659c69f29f25a91eefff6631"
        },
        {
          "opened_ts": "2026-06-05T13:04:59.999000Z",
          "closed_ts": "2026-06-05T13:19:59.999000Z",
          "side": "long",
          "entry_price": 62073.77,
          "exit_price": 62073.0,
          "pnl_usd": -0.2669,
          "exit_reason": "time_stop",
          "proposal_id": "pp_6cd24a2b07c1f89bc73fbee8"
        },
        {
          "opened_ts": "2026-06-05T13:09:59.999000Z",
          "closed_ts": "2026-06-05T13:24:59.999000Z",
          "side": "long",
          "entry_price": 61966.64,
          "exit_price": 62127.4,
          "pnl_usd": 0.6457,
          "exit_reason": "time_stop",
          "proposal_id": "pp_cece35767ff48487f53cc48a"
        },
        {
          "opened_ts": "2026-06-05T13:19:59.999000Z",
          "closed_ts": "2026-06-05T13:34:59.999000Z",
          "side": "long",
          "entry_price": 62073.0,
          "exit_price": 62194.07,
          "pnl_usd": 0.4203,
          "exit_reason": "time_stop",
          "proposal_id": "pp_48e77ed4c46738386e3bc158"
        },
        {
          "opened_ts": "2026-06-05T13:24:59.999000Z",
          "closed_ts": "2026-06-05T13:39:59.999000Z",
          "side": "long",
          "entry_price": 62127.4,
          "exit_price": 61866.07571428572,
          "pnl_usd": -1.7353,
          "exit_reason": "sl",
          "proposal_id": "pp_66152ff1a89d4d6c6dbc1cde"
        },
        {
          "opened_ts": "2026-06-05T13:34:59.999000Z",
          "closed_ts": "2026-06-05T13:39:59.999000Z",
          "side": "long",
          "entry_price": 62194.07,
          "exit_price": 61929.49285714286,
          "pnl_usd": -1.752,
          "exit_reason": "sl",
          "proposal_id": "pp_910c22da37d8723215816356"
        },
        {
          "opened_ts": "2026-06-05T13:39:59.999000Z",
          "closed_ts": "2026-06-05T13:49:59.999000Z",
          "side": "long",
          "entry_price": 61811.99,
          "exit_price": 61529.122142857144,
          "pnl_usd": -1.8641,
          "exit_reason": "sl",
          "proposal_id": "pp_18e2f2f9b648aa888d6d1713"
        },
        {
          "opened_ts": "2026-06-05T13:39:59.999000Z",
          "closed_ts": "2026-06-05T13:49:59.999000Z",
          "side": "long",
          "entry_price": 61811.99,
          "exit_price": 61529.122142857144,
          "pnl_usd": -1.864,
          "exit_reason": "sl",
          "proposal_id": "pp_14450d8ccc806803db2cd7cd"
        },
        {
          "opened_ts": "2026-06-05T13:49:59.999000Z",
          "closed_ts": "2026-06-05T13:59:59.999000Z",
          "side": "long",
          "entry_price": 61271.88,
          "exit_price": 61008.012142857144,
          "pnl_usd": -1.7689,
          "exit_reason": "sl",
          "proposal_id": "pp_af7e45bf2068d01b68de70ff"
        },
        {
          "opened_ts": "2026-06-05T13:49:59.999000Z",
          "closed_ts": "2026-06-05T13:59:59.999000Z",
          "side": "long",
          "entry_price": 61271.88,
          "exit_price": 61008.012142857144,
          "pnl_usd": -1.7688,
          "exit_reason": "sl",
          "proposal_id": "pp_14450d8ccc806803db2cd7cd"
        },
        {
          "opened_ts": "2026-06-05T13:59:59.999000Z",
          "closed_ts": "2026-06-05T14:09:59.999000Z",
          "side": "long",
          "entry_price": 60732.36,
          "exit_price": 61165.95,
          "pnl_usd": 1.8582,
          "exit_reason": "tp",
          "proposal_id": "pp_58bfc8376ac959ff8ff5417a"
        },
        {
          "opened_ts": "2026-06-05T13:59:59.999000Z",
          "closed_ts": "2026-06-05T14:09:59.999000Z",
          "side": "long",
          "entry_price": 60732.36,
          "exit_price": 61165.95,
          "pnl_usd": 2.2341,
          "exit_reason": "tp",
          "proposal_id": "pp_14450d8ccc806803db2cd7cd"
        },
        {
          "opened_ts": "2026-06-05T14:09:59.999000Z",
          "closed_ts": "2026-06-05T14:14:59.999000Z",
          "side": "long",
          "entry_price": 61136.31,
          "exit_price": 60785.98214285714,
          "pnl_usd": -2.1676,
          "exit_reason": "sl",
          "proposal_id": "pp_1ad8d8cad905399fce8e2470"
        },
        {
          "opened_ts": "2026-06-05T14:09:59.999000Z",
          "closed_ts": "2026-06-05T14:14:59.999000Z",
          "side": "long",
          "entry_price": 61136.31,
          "exit_price": 60785.98214285714,
          "pnl_usd": -1.6216,
          "exit_reason": "sl",
          "proposal_id": "pp_9a7470d3f0169a3b960218d7"
        },
        {
          "opened_ts": "2026-06-05T14:14:59.999000Z",
          "closed_ts": "2026-06-05T14:24:59.999000Z",
          "side": "long",
          "entry_price": 60865.45,
          "exit_price": 60490.33071428571,
          "pnl_usd": -2.4171,
          "exit_reason": "sl",
          "proposal_id": "pp_9b722b516b3867d2029d8918"
        },
        {
          "opened_ts": "2026-06-05T14:14:59.999000Z",
          "closed_ts": "2026-06-05T14:24:59.999000Z",
          "side": "long",
          "entry_price": 60865.45,
          "exit_price": 60490.33071428571,
          "pnl_usd": -1.7291,
          "exit_reason": "sl",
          "proposal_id": "pp_9a7470d3f0169a3b960218d7"
        },
        {
          "opened_ts": "2026-06-05T14:24:59.999000Z",
          "closed_ts": "2026-06-05T14:39:59.999000Z",
          "side": "long",
          "entry_price": 60557.83,
          "exit_price": 61167.626071428575,
          "pnl_usd": 3.257,
          "exit_reason": "tp",
          "proposal_id": "pp_6b9fe1bb50f81810f749fdb0"
        },
        {
          "opened_ts": "2026-06-05T14:24:59.999000Z",
          "closed_ts": "2026-06-05T14:39:59.999000Z",
          "side": "long",
          "entry_price": 60557.83,
          "exit_price": 61167.626071428575,
          "pnl_usd": 2.3299,
          "exit_reason": "tp",
          "proposal_id": "pp_9a7470d3f0169a3b960218d7"
        },
        {
          "opened_ts": "2026-06-05T14:39:59.999000Z",
          "closed_ts": "2026-06-05T14:54:59.999000Z",
          "side": "long",
          "entry_price": 60888.01,
          "exit_price": 60762.01,
          "pnl_usd": -0.9858,
          "exit_reason": "time_stop",
          "proposal_id": "pp_4b9bb478b73d9a2a9f36c95e"
        },
        {
          "opened_ts": "2026-06-05T14:54:59.999000Z",
          "closed_ts": "2026-06-05T15:09:59.999000Z",
          "side": "long",
          "entry_price": 60762.01,
          "exit_price": 60755.32,
          "pnl_usd": -0.3007,
          "exit_reason": "time_stop",
          "proposal_id": "pp_8ebbc0a61811845e0787a5c3"
        },
        {
          "opened_ts": "2026-06-05T14:39:59.999000Z",
          "closed_ts": "2026-06-05T15:39:59.999000Z",
          "side": "long",
          "entry_price": 60888.01,
          "exit_price": 60433.41714285714,
          "pnl_usd": -2.0551,
          "exit_reason": "sl",
          "proposal_id": "pp_9a7470d3f0169a3b960218d7"
        },
        {
          "opened_ts": "2026-06-05T15:09:59.999000Z",
          "closed_ts": "2026-06-05T15:39:59.999000Z",
          "side": "long",
          "entry_price": 60755.32,
          "exit_price": 60340.34285714286,
          "pnl_usd": -2.65,
          "exit_reason": "sl",
          "proposal_id": "pp_77841037827c34b229889a40"
        },
        {
          "opened_ts": "2026-06-05T15:39:59.999000Z",
          "closed_ts": "2026-06-05T15:54:59.999000Z",
          "side": "long",
          "entry_price": 60202.6,
          "exit_price": 60552.0,
          "pnl_usd": 1.3649,
          "exit_reason": "time_stop",
          "proposal_id": "pp_ea8bbe374917805489a70414"
        },
        {
          "opened_ts": "2026-06-05T15:54:59.999000Z",
          "closed_ts": "2026-06-05T16:04:59.999000Z",
          "side": "long",
          "entry_price": 60552.0,
          "exit_price": 60199.765,
          "pnl_usd": -2.0236,
          "exit_reason": "sl",
          "proposal_id": "pp_18c392e9a97a77ccacdaf80a"
        },
        {
          "opened_ts": "2026-06-05T15:39:59.999000Z",
          "closed_ts": "2026-06-05T16:14:59.999000Z",
          "side": "long",
          "entry_price": 60202.6,
          "exit_price": 59833.81785714286,
          "pnl_usd": -2.4024,
          "exit_reason": "sl_and_tp_same_bar_pessimistic_sl",
          "proposal_id": "pp_77841037827c34b229889a40"
        },
        {
          "opened_ts": "2026-06-05T16:04:59.999000Z",
          "closed_ts": "2026-06-05T16:14:59.999000Z",
          "side": "long",
          "entry_price": 60247.98,
          "exit_price": 59910.21857142857,
          "pnl_usd": -2.2206,
          "exit_reason": "sl_and_tp_same_bar_pessimistic_sl",
          "proposal_id": "pp_dc29063b6dc82b592406b97e"
        },
        {
          "opened_ts": "2026-06-05T16:14:59.999000Z",
          "closed_ts": "2026-06-05T16:24:59.999000Z",
          "side": "long",
          "entry_price": 60897.63,
          "exit_price": 61519.923214285714,
          "pnl_usd": 3.3062,
          "exit_reason": "tp",
          "proposal_id": "pp_ed59bbf8da23ead11b2c600d"
        },
        {
          "opened_ts": "2026-06-05T16:14:59.999000Z",
          "closed_ts": "2026-06-05T16:24:59.999000Z",
          "side": "short",
          "entry_price": 60897.63,
          "exit_price": 61312.49214285714,
          "pnl_usd": -2.6405,
          "exit_reason": "sl",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T16:24:59.999000Z",
          "closed_ts": "2026-06-05T16:39:59.999000Z",
          "side": "short",
          "entry_price": 61222.96,
          "exit_price": 60964.58,
          "pnl_usd": 0.8985,
          "exit_reason": "time_stop",
          "proposal_id": "pp_52eb4668c4e6098c2f1ac5ca"
        },
        {
          "opened_ts": "2026-06-05T16:39:59.999000Z",
          "closed_ts": "2026-06-05T16:54:59.999000Z",
          "side": "long",
          "entry_price": 60964.58,
          "exit_price": 61385.33,
          "pnl_usd": 2.1481,
          "exit_reason": "time_stop",
          "proposal_id": "pp_cb78eeaa9c9d0a78765be673"
        },
        {
          "opened_ts": "2026-06-05T16:54:59.999000Z",
          "closed_ts": "2026-06-05T17:09:59.999000Z",
          "side": "short",
          "entry_price": 61385.33,
          "exit_price": 61367.04,
          "pnl_usd": -0.1579,
          "exit_reason": "time_stop",
          "proposal_id": "pp_d6c0f3d87cc623b7a7cf8f67"
        },
        {
          "opened_ts": "2026-06-05T17:09:59.999000Z",
          "closed_ts": "2026-06-05T17:14:59.999000Z",
          "side": "long",
          "entry_price": 61367.04,
          "exit_price": 60966.92214285715,
          "pnl_usd": -2.5391,
          "exit_reason": "sl",
          "proposal_id": "pp_3f8bef46b5a81754ca07062c"
        },
        {
          "opened_ts": "2026-06-05T17:14:59.999000Z",
          "closed_ts": "2026-06-05T17:29:59.999000Z",
          "side": "long",
          "entry_price": 61061.06,
          "exit_price": 60697.27,
          "pnl_usd": -2.342,
          "exit_reason": "time_stop",
          "proposal_id": "pp_7b329c559813d214ef451ebc"
        },
        {
          "opened_ts": "2026-06-05T17:29:59.999000Z",
          "closed_ts": "2026-06-05T17:44:59.999000Z",
          "side": "long",
          "entry_price": 60697.27,
          "exit_price": 60755.83,
          "pnl_usd": 0.0521,
          "exit_reason": "time_stop",
          "proposal_id": "pp_39e03d914ed731377abbb4cf"
        },
        {
          "opened_ts": "2026-06-05T17:44:59.999000Z",
          "closed_ts": "2026-06-05T17:59:59.999000Z",
          "side": "long",
          "entry_price": 60755.83,
          "exit_price": 60813.99,
          "pnl_usd": 0.0723,
          "exit_reason": "time_stop",
          "proposal_id": "pp_0d7169f4441dcd59efcbc0fe"
        },
        {
          "opened_ts": "2026-06-05T17:59:59.999000Z",
          "closed_ts": "2026-06-05T18:14:59.999000Z",
          "side": "long",
          "entry_price": 60813.99,
          "exit_price": 60624.35,
          "pnl_usd": -1.3502,
          "exit_reason": "time_stop",
          "proposal_id": "pp_62344e6a933d61a23216f1c7"
        },
        {
          "opened_ts": "2026-06-05T16:24:59.999000Z",
          "closed_ts": "2026-06-05T18:19:59.999000Z",
          "side": "short",
          "entry_price": 61222.96,
          "exit_price": 60548.85357142857,
          "pnl_usd": 3.5827,
          "exit_reason": "tp",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T18:14:59.999000Z",
          "closed_ts": "2026-06-05T18:24:59.999000Z",
          "side": "long",
          "entry_price": 60624.35,
          "exit_price": 60397.29357142857,
          "pnl_usd": -1.5687,
          "exit_reason": "sl",
          "proposal_id": "pp_d6303a21edec0539b60d8e7b"
        },
        {
          "opened_ts": "2026-06-05T18:19:59.999000Z",
          "closed_ts": "2026-06-05T18:29:59.999000Z",
          "side": "long",
          "entry_price": 60449.22,
          "exit_price": 60222.23142857143,
          "pnl_usd": -1.5727,
          "exit_reason": "sl",
          "proposal_id": "pp_9d89e7478f673675c8ff2756"
        },
        {
          "opened_ts": "2026-06-05T18:24:59.999000Z",
          "closed_ts": "2026-06-05T18:29:59.999000Z",
          "side": "long",
          "entry_price": 60323.65,
          "exit_price": 60109.33714285714,
          "pnl_usd": -1.0584,
          "exit_reason": "sl",
          "proposal_id": "pp_f31a9ba546e99b96dfb4bb09"
        },
        {
          "opened_ts": "2026-06-05T18:29:59.999000Z",
          "closed_ts": "2026-06-05T18:44:59.999000Z",
          "side": "long",
          "entry_price": 60158.0,
          "exit_price": 59946.909999999996,
          "pnl_usd": -1.303,
          "exit_reason": "sl",
          "proposal_id": "pp_e753d0c581e005db025c6e71"
        },
        {
          "opened_ts": "2026-06-05T18:29:59.999000Z",
          "closed_ts": "2026-06-05T18:44:59.999000Z",
          "side": "short",
          "entry_price": 60158.0,
          "exit_price": 59841.365,
          "pnl_usd": 1.5748,
          "exit_reason": "tp",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T18:44:59.999000Z",
          "closed_ts": "2026-06-05T18:49:59.999000Z",
          "side": "long",
          "entry_price": 59952.0,
          "exit_price": 59699.12285714286,
          "pnl_usd": -1.7334,
          "exit_reason": "sl",
          "proposal_id": "pp_879c122c0c9ddd63f3baa9a8"
        },
        {
          "opened_ts": "2026-06-05T18:44:59.999000Z",
          "closed_ts": "2026-06-05T18:54:59.999000Z",
          "side": "short",
          "entry_price": 59952.0,
          "exit_price": 59572.684285714284,
          "pnl_usd": 1.9458,
          "exit_reason": "tp",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T18:49:59.999000Z",
          "closed_ts": "2026-06-05T18:54:59.999000Z",
          "side": "long",
          "entry_price": 59785.68,
          "exit_price": 59521.345714285715,
          "pnl_usd": -1.8039,
          "exit_reason": "sl",
          "proposal_id": "pp_1da6988576d19cf9e7e6f2df"
        },
        {
          "opened_ts": "2026-06-05T18:54:59.999000Z",
          "closed_ts": "2026-06-05T18:59:59.999000Z",
          "side": "long",
          "entry_price": 59207.42,
          "exit_price": 59628.59642857143,
          "pnl_usd": 2.2198,
          "exit_reason": "tp",
          "proposal_id": "pp_e1e0c515beacc2351cfdb068"
        },
        {
          "opened_ts": "2026-06-05T18:54:59.999000Z",
          "closed_ts": "2026-06-05T18:59:59.999000Z",
          "side": "short",
          "entry_price": 59207.42,
          "exit_price": 59488.20428571429,
          "pnl_usd": -1.9158,
          "exit_reason": "sl",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T18:59:59.999000Z",
          "closed_ts": "2026-06-05T19:14:59.999000Z",
          "side": "long",
          "entry_price": 59395.99,
          "exit_price": 59392.25,
          "pnl_usd": -0.2166,
          "exit_reason": "time_stop",
          "proposal_id": "pp_bce48195182a1acc340cbff3"
        },
        {
          "opened_ts": "2026-06-05T18:59:59.999000Z",
          "closed_ts": "2026-06-05T19:29:59.999000Z",
          "side": "short",
          "entry_price": 59395.99,
          "exit_price": 59701.046428571426,
          "pnl_usd": -2.0531,
          "exit_reason": "sl",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T19:14:59.999000Z",
          "closed_ts": "2026-06-05T19:29:59.999000Z",
          "side": "long",
          "entry_price": 59392.25,
          "exit_price": 59858.27,
          "pnl_usd": 2.4752,
          "exit_reason": "time_stop",
          "proposal_id": "pp_5f6e43a8baa7cda053bdea2f"
        },
        {
          "opened_ts": "2026-06-05T19:29:59.999000Z",
          "closed_ts": "2026-06-05T19:49:59.999000Z",
          "side": "short",
          "entry_price": 59858.27,
          "exit_price": 60223.56642857142,
          "pnl_usd": -2.3902,
          "exit_reason": "sl",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T19:34:59.999000Z",
          "closed_ts": "2026-06-05T19:49:59.999000Z",
          "side": "short",
          "entry_price": 59707.19,
          "exit_price": 60081.430714285714,
          "pnl_usd": -2.2091,
          "exit_reason": "sl",
          "proposal_id": "pp_900e4508eeb5afe27b27a49c"
        },
        {
          "opened_ts": "2026-06-05T19:49:59.999000Z",
          "closed_ts": "2026-06-05T20:04:59.999000Z",
          "side": "long",
          "entry_price": 60215.47,
          "exit_price": 60083.99,
          "pnl_usd": -1.0226,
          "exit_reason": "time_stop",
          "proposal_id": "pp_d1580fc9a60b196c1097294d"
        }
      ],
      "lifecycle_available": true,
      "lifecycle_unavailable_reason": null,
      "exit_reason_counts": {
        "time_stop": 191,
        "sl": 355,
        "tp": 166,
        "sl_and_tp_same_bar_pessimistic_sl": 3
      },
      "recent_accepted": [
        {
          "ts": "2026-06-05T17:44:59.999000Z",
          "side": "long",
          "price": 60755.83,
          "proposal_id": "pp_0d7169f4441dcd59efcbc0fe",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.04
        },
        {
          "ts": "2026-06-05T17:59:59.999000Z",
          "side": "long",
          "price": 60813.99,
          "proposal_id": "pp_62344e6a933d61a23216f1c7",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.03
        },
        {
          "ts": "2026-06-05T18:14:59.999000Z",
          "side": "long",
          "price": 60624.35,
          "proposal_id": "pp_d6303a21edec0539b60d8e7b",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.97
        },
        {
          "ts": "2026-06-05T18:19:59.999000Z",
          "side": "long",
          "price": 60449.22,
          "proposal_id": "pp_9d89e7478f673675c8ff2756",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 349.1
        },
        {
          "ts": "2026-06-05T18:24:59.999000Z",
          "side": "long",
          "price": 60323.65,
          "proposal_id": "pp_f31a9ba546e99b96dfb4bb09",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0264,
          "notional": 245.99
        },
        {
          "ts": "2026-06-05T18:29:59.999000Z",
          "side": "long",
          "price": 60158.0,
          "proposal_id": "pp_e753d0c581e005db025c6e71",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0329,
          "notional": 305.95
        },
        {
          "ts": "2026-06-05T18:29:59.999000Z",
          "side": "short",
          "price": 60158.0,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.92
        },
        {
          "ts": "2026-06-05T18:44:59.999000Z",
          "side": "long",
          "price": 59952.0,
          "proposal_id": "pp_879c122c0c9ddd63f3baa9a8",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.92
        },
        {
          "ts": "2026-06-05T18:44:59.999000Z",
          "side": "short",
          "price": 59952.0,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.91
        },
        {
          "ts": "2026-06-05T18:49:59.999000Z",
          "side": "long",
          "price": 59785.68,
          "proposal_id": "pp_1da6988576d19cf9e7e6f2df",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.83
        },
        {
          "ts": "2026-06-05T18:54:59.999000Z",
          "side": "long",
          "price": 59207.42,
          "proposal_id": "pp_e1e0c515beacc2351cfdb068",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.83
        },
        {
          "ts": "2026-06-05T18:54:59.999000Z",
          "side": "short",
          "price": 59207.42,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.82
        },
        {
          "ts": "2026-06-05T18:59:59.999000Z",
          "side": "long",
          "price": 59395.99,
          "proposal_id": "pp_bce48195182a1acc340cbff3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0286,
          "notional": 266.42
        },
        {
          "ts": "2026-06-05T18:59:59.999000Z",
          "side": "short",
          "price": 59395.99,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.81
        },
        {
          "ts": "2026-06-05T19:14:59.999000Z",
          "side": "long",
          "price": 59392.25,
          "proposal_id": "pp_5f6e43a8baa7cda053bdea2f",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.79
        },
        {
          "ts": "2026-06-05T19:29:59.999000Z",
          "side": "short",
          "price": 59858.27,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.8
        },
        {
          "ts": "2026-06-05T19:34:59.999000Z",
          "side": "short",
          "price": 59707.19,
          "proposal_id": "pp_900e4508eeb5afe27b27a49c",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0338,
          "notional": 314.78
        },
        {
          "ts": "2026-06-05T19:49:59.999000Z",
          "side": "long",
          "price": 60215.47,
          "proposal_id": "pp_d1580fc9a60b196c1097294d",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.61
        },
        {
          "ts": "2026-06-05T19:49:59.999000Z",
          "side": "short",
          "price": 60215.47,
          "proposal_id": "pp_49741cbe925707e5a31733e5",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0375,
          "notional": 348.6
        },
        {
          "ts": "2026-06-05T20:04:59.999000Z",
          "side": "short",
          "price": 60083.99,
          "proposal_id": "pp_6af3f80c99ac2b3d005beeb3",
          "reason": "accept_multi_tf_aligned",
          "fraction": 0.0325,
          "notional": 302.5
        }
      ],
      "recent_closed": [
        {
          "opened_ts": "2026-06-05T17:29:59.999000Z",
          "closed_ts": "2026-06-05T17:44:59.999000Z",
          "side": "long",
          "entry_price": 60697.27,
          "exit_price": 60755.83,
          "pnl_usd": 0.0521,
          "exit_reason": "time_stop",
          "proposal_id": "pp_39e03d914ed731377abbb4cf"
        },
        {
          "opened_ts": "2026-06-05T17:44:59.999000Z",
          "closed_ts": "2026-06-05T17:59:59.999000Z",
          "side": "long",
          "entry_price": 60755.83,
          "exit_price": 60813.99,
          "pnl_usd": 0.0723,
          "exit_reason": "time_stop",
          "proposal_id": "pp_0d7169f4441dcd59efcbc0fe"
        },
        {
          "opened_ts": "2026-06-05T17:59:59.999000Z",
          "closed_ts": "2026-06-05T18:14:59.999000Z",
          "side": "long",
          "entry_price": 60813.99,
          "exit_price": 60624.35,
          "pnl_usd": -1.3502,
          "exit_reason": "time_stop",
          "proposal_id": "pp_62344e6a933d61a23216f1c7"
        },
        {
          "opened_ts": "2026-06-05T16:24:59.999000Z",
          "closed_ts": "2026-06-05T18:19:59.999000Z",
          "side": "short",
          "entry_price": 61222.96,
          "exit_price": 60548.85357142857,
          "pnl_usd": 3.5827,
          "exit_reason": "tp",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T18:14:59.999000Z",
          "closed_ts": "2026-06-05T18:24:59.999000Z",
          "side": "long",
          "entry_price": 60624.35,
          "exit_price": 60397.29357142857,
          "pnl_usd": -1.5687,
          "exit_reason": "sl",
          "proposal_id": "pp_d6303a21edec0539b60d8e7b"
        },
        {
          "opened_ts": "2026-06-05T18:19:59.999000Z",
          "closed_ts": "2026-06-05T18:29:59.999000Z",
          "side": "long",
          "entry_price": 60449.22,
          "exit_price": 60222.23142857143,
          "pnl_usd": -1.5727,
          "exit_reason": "sl",
          "proposal_id": "pp_9d89e7478f673675c8ff2756"
        },
        {
          "opened_ts": "2026-06-05T18:24:59.999000Z",
          "closed_ts": "2026-06-05T18:29:59.999000Z",
          "side": "long",
          "entry_price": 60323.65,
          "exit_price": 60109.33714285714,
          "pnl_usd": -1.0584,
          "exit_reason": "sl",
          "proposal_id": "pp_f31a9ba546e99b96dfb4bb09"
        },
        {
          "opened_ts": "2026-06-05T18:29:59.999000Z",
          "closed_ts": "2026-06-05T18:44:59.999000Z",
          "side": "long",
          "entry_price": 60158.0,
          "exit_price": 59946.909999999996,
          "pnl_usd": -1.303,
          "exit_reason": "sl",
          "proposal_id": "pp_e753d0c581e005db025c6e71"
        },
        {
          "opened_ts": "2026-06-05T18:29:59.999000Z",
          "closed_ts": "2026-06-05T18:44:59.999000Z",
          "side": "short",
          "entry_price": 60158.0,
          "exit_price": 59841.365,
          "pnl_usd": 1.5748,
          "exit_reason": "tp",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T18:44:59.999000Z",
          "closed_ts": "2026-06-05T18:49:59.999000Z",
          "side": "long",
          "entry_price": 59952.0,
          "exit_price": 59699.12285714286,
          "pnl_usd": -1.7334,
          "exit_reason": "sl",
          "proposal_id": "pp_879c122c0c9ddd63f3baa9a8"
        },
        {
          "opened_ts": "2026-06-05T18:44:59.999000Z",
          "closed_ts": "2026-06-05T18:54:59.999000Z",
          "side": "short",
          "entry_price": 59952.0,
          "exit_price": 59572.684285714284,
          "pnl_usd": 1.9458,
          "exit_reason": "tp",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T18:49:59.999000Z",
          "closed_ts": "2026-06-05T18:54:59.999000Z",
          "side": "long",
          "entry_price": 59785.68,
          "exit_price": 59521.345714285715,
          "pnl_usd": -1.8039,
          "exit_reason": "sl",
          "proposal_id": "pp_1da6988576d19cf9e7e6f2df"
        },
        {
          "opened_ts": "2026-06-05T18:54:59.999000Z",
          "closed_ts": "2026-06-05T18:59:59.999000Z",
          "side": "long",
          "entry_price": 59207.42,
          "exit_price": 59628.59642857143,
          "pnl_usd": 2.2198,
          "exit_reason": "tp",
          "proposal_id": "pp_e1e0c515beacc2351cfdb068"
        },
        {
          "opened_ts": "2026-06-05T18:54:59.999000Z",
          "closed_ts": "2026-06-05T18:59:59.999000Z",
          "side": "short",
          "entry_price": 59207.42,
          "exit_price": 59488.20428571429,
          "pnl_usd": -1.9158,
          "exit_reason": "sl",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T18:59:59.999000Z",
          "closed_ts": "2026-06-05T19:14:59.999000Z",
          "side": "long",
          "entry_price": 59395.99,
          "exit_price": 59392.25,
          "pnl_usd": -0.2166,
          "exit_reason": "time_stop",
          "proposal_id": "pp_bce48195182a1acc340cbff3"
        },
        {
          "opened_ts": "2026-06-05T18:59:59.999000Z",
          "closed_ts": "2026-06-05T19:29:59.999000Z",
          "side": "short",
          "entry_price": 59395.99,
          "exit_price": 59701.046428571426,
          "pnl_usd": -2.0531,
          "exit_reason": "sl",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T19:14:59.999000Z",
          "closed_ts": "2026-06-05T19:29:59.999000Z",
          "side": "long",
          "entry_price": 59392.25,
          "exit_price": 59858.27,
          "pnl_usd": 2.4752,
          "exit_reason": "time_stop",
          "proposal_id": "pp_5f6e43a8baa7cda053bdea2f"
        },
        {
          "opened_ts": "2026-06-05T19:29:59.999000Z",
          "closed_ts": "2026-06-05T19:49:59.999000Z",
          "side": "short",
          "entry_price": 59858.27,
          "exit_price": 60223.56642857142,
          "pnl_usd": -2.3902,
          "exit_reason": "sl",
          "proposal_id": "pp_49741cbe925707e5a31733e5"
        },
        {
          "opened_ts": "2026-06-05T19:34:59.999000Z",
          "closed_ts": "2026-06-05T19:49:59.999000Z",
          "side": "short",
          "entry_price": 59707.19,
          "exit_price": 60081.430714285714,
          "pnl_usd": -2.2091,
          "exit_reason": "sl",
          "proposal_id": "pp_900e4508eeb5afe27b27a49c"
        },
        {
          "opened_ts": "2026-06-05T19:49:59.999000Z",
          "closed_ts": "2026-06-05T20:04:59.999000Z",
          "side": "long",
          "entry_price": 60215.47,
          "exit_price": 60083.99,
          "pnl_usd": -1.0226,
          "exit_reason": "time_stop",
          "proposal_id": "pp_d1580fc9a60b196c1097294d"
        }
      ],
      "sources": [
        "chronos-source://HISTORICAL_BACKBONE_REPLAY/runs/short_btc_full_backbone_after_sentinel_polarity_fix_20260607T213719Z/per_symbol/BTCUSDT/feed_rows.jsonl",
        "chronos-source://HISTORICAL_BACKBONE_REPLAY/runs/short_btc_full_backbone_after_sentinel_polarity_fix_20260607T213719Z/per_symbol/BTCUSDT/wally_proposals.jsonl",
        "chronos-source://HISTORICAL_BACKBONE_REPLAY/runs/short_btc_full_backbone_after_sentinel_polarity_fix_20260607T213719Z/per_symbol/BTCUSDT/sentinel_decisions.jsonl",
        "chronos-source://HISTORICAL_BACKBONE_REPLAY/runs/short_btc_full_backbone_after_sentinel_polarity_fix_20260607T213719Z/per_symbol/BTCUSDT/closed_positions.jsonl",
        "chronos-source://HISTORICAL_BACKBONE_REPLAY/runs/short_btc_full_backbone_after_sentinel_polarity_fix_20260607T213719Z/consolidated/summary_metrics.json",
        "chronos-source://HISTORICAL_BACKBONE_REPLAY/runs/short_btc_full_backbone_after_sentinel_polarity_fix_20260607T213719Z/side_distribution_report.json",
        "chronos-source://HISTORICAL_BACKBONE_REPLAY/runs/short_btc_full_backbone_after_sentinel_polarity_fix_20260607T213719Z/before_after_sentinel_fix_comparison.json"
      ]
    }
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
  renderLayers(); renderFlow(); renderChains(); renderAgents(); initFilters(); renderQualityReview(); renderBtcReview();
});


function fmt(v, suffix = '') {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) + suffix : v.toFixed(Math.abs(v) < 1 ? 4 : 2) + suffix;
  return String(v) + suffix;
}
function kpi(label, value) { return el('div', {class:'kpi'}, [el('strong',{text:fmt(value)}), el('span',{text:label})]); }
function renderTable(rows, columns) {
  const table = el('table', {class:'mini-table'});
  table.append(el('thead', {}, [el('tr', {}, columns.map(c => el('th', {text:c.label})))]));
  table.append(el('tbody', {}, rows.map(r => el('tr', {}, columns.map(c => el('td', {text:fmt(r[c.key])}))))));
  return table;
}
function renderQualityReview() {
  const q = ARCHITECTURE.review_data && ARCHITECTURE.review_data.tibot_quality_audit;
  if (!q || !document.querySelector('[data-quality-kpis]')) return;
  document.querySelector('[data-quality-kpis]').append(
    kpi('Usable bots', q.bot_counts.usable), kpi('Watch bots', q.bot_counts.watch), kpi('Blocked bots', q.bot_counts.blocked), kpi('Missing metrics', q.bot_counts.missing_metric)
  );
  document.querySelector('[data-quality-note]').textContent = `${q.metric_mismatch_note} Mismatch checks: ${q.mismatch_counts.checks}; validation-not-test: ${q.mismatch_counts.validation_metric_not_test}; bot-dir stubs: ${q.mismatch_counts.bot_dir_missing_stub}.`;
  const cols=[{key:'family',label:'Family'},{key:'category',label:'Category'},{key:'avg_primary_metric',label:'Avg metric'},{key:'usable',label:'Usable'},{key:'watch',label:'Watch'},{key:'blocked',label:'Blocked'}];
  document.querySelector('[data-strong-groups]').append(renderTable(q.strongest_groups, cols));
  document.querySelector('[data-weak-groups]').append(renderTable(q.weakest_groups, cols));
}
function renderSideCard(name, side, before, after) {
  const node = el('div',{class:'bar-card'},[el('strong',{text:name})]);
  const rows = after ? [
    ['proposals', after.proposals], ['accepted', after.accepted], ['rejected', after.rejected], ['closed', after.closed], ['wins', after.wins], ['pnl', after.realized_pnl_exit_fee_net_usd]
  ] : [];
  rows.forEach(([k,v]) => node.append(el('p',{class:'muted',text:`${k}: ${fmt(v)}`})));
  if (before) node.append(el('p',{class:'muted',text:`Before accepted: ${fmt(before.accepted)} · rejected: ${fmt(before.rejected)}`}));
  return node;
}
function renderBtcReview() {
  const b = ARCHITECTURE.review_data && ARCHITECTURE.review_data.sentinel_btc_short_validation;
  if (!b || !document.querySelector('[data-btc-metrics]')) return;
  document.querySelector('[data-btc-window]').textContent = `${b.window.start} → ${b.window.end}`;
  const m=b.metrics;
  document.querySelector('[data-btc-metrics]').append(kpi('Final equity', m.final_equity), kpi('Return %', m.return_pct), kpi('Max DD %', m.max_drawdown_pct), kpi('Win rate', m.win_rate), kpi('Profit factor', m.profit_factor), kpi('Realized PnL', m.realized_pnl), kpi('Total fees', m.total_fees), kpi('Trades', m.total_trades));
  const sideRows=['long','short'].map(s=>({side:s, proposals:b.proposal_counts_by_side[s]||0, accepted:b.accepted_by_side[s]||0, rejected:(b.decision_counts_by_side[`${s}_reject`]||0), closed:b.closed_by_side[s]||0, pnl:b.pnl_by_side[s] && b.pnl_by_side[s].realized_pnl_exit_fee_net_usd}));
  document.querySelector('[data-side-counts]').append(renderTable(sideRows,[{key:'side',label:'Side'},{key:'proposals',label:'Wally proposals'},{key:'accepted',label:'Accepted'},{key:'rejected',label:'Rejected'},{key:'closed',label:'Closed'},{key:'pnl',label:'PnL'}]));
  const ba=document.querySelector('[data-before-after]');
  if (b.before_after_side_distribution) ['long','short'].forEach(s=>ba.append(renderSideCard(s.toUpperCase(),s,b.before_after_side_distribution.before&&b.before_after_side_distribution.before[s],b.before_after_side_distribution.after&&b.before_after_side_distribution.after[s]))); else ba.textContent='Before/after report unavailable.';
  renderBtcChart(b);
  document.querySelector('[data-recent-accepted]').append(renderTable(b.recent_accepted,[{key:'ts',label:'Time'},{key:'side',label:'Side'},{key:'price',label:'Entry'},{key:'notional',label:'Notional'}]));
  document.querySelector('[data-recent-closed]').append(renderTable(b.recent_closed,[{key:'closed_ts',label:'Closed'},{key:'side',label:'Side'},{key:'exit_price',label:'Exit'},{key:'pnl_usd',label:'PnL'},{key:'exit_reason',label:'Reason'}]));
}
function renderBtcChart(b) {
  const svg=document.querySelector('[data-btc-chart]'), state=document.querySelector('[data-chart-state]');
  if (!svg) return;
  const candles=b.candles||[];
  if (!candles.length) { state.textContent=b.ohlcv_unavailable_reason||'OHLCV unavailable.'; return; }
  const W=1200,H=420,pad=36; svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  const lows=candles.map(c=>c.low), highs=candles.map(c=>c.high), min=Math.min(...lows), max=Math.max(...highs);
  const x=i=>pad+i*(W-pad*2)/Math.max(1,candles.length-1), y=v=>H-pad-(v-min)*(H-pad*2)/(max-min||1);
  svg.innerHTML='';
  for(let g=0;g<5;g++){const yy=pad+g*(H-pad*2)/4; svg.append(el('line',{x1:pad,y1:yy,x2:W-pad,y2:yy,stroke:'#1d3554','stroke-width':'1'}));}
  candles.forEach((c,i)=>{ const xx=x(i), col=c.close>=c.open?'#7ee787':'#f97373'; svg.append(el('line',{x1:xx,y1:y(c.low),x2:xx,y2:y(c.high),stroke:col,'stroke-width':'1'})); svg.append(el('line',{x1:xx-2,y1:y(c.open),x2:xx,y2:y(c.open),stroke:col,'stroke-width':'1.3'})); svg.append(el('line',{x1:xx,y1:y(c.close),x2:xx+2,y2:y(c.close),stroke:col,'stroke-width':'1.3'})); });
  const indexByTs=new Map(candles.map((c,i)=>[c.ts,i]));
  (b.accepted_markers||[]).forEach(m=>{ const i=indexByTs.get(m.ts); if(i===undefined||!m.price)return; const color=m.side==='long'?'#7ee787':'#f97373'; const yy=y(m.price), xx=x(i); svg.append(el('circle',{cx:xx,cy:yy,r:m.side==='long'?4:3.5,fill:color,opacity:'0.75'})); });
  (b.closed_markers||[]).forEach((m,n)=>{ if(n%5!==0) return; const i=indexByTs.get(m.closed_ts); if(i===undefined||!m.exit_price)return; const xx=x(i), yy=y(m.exit_price); svg.append(el('text',{x:xx,y:yy,fill:'#f6c177','font-size':'10','text-anchor':'middle',text:'×'})); });
  state.textContent=`OHLCV available: ${candles.length} candles. Overlay: ${b.accepted_markers.length} accepted entries (${b.accepted_by_side.long||0} long, ${b.accepted_by_side.short||0} short) and ${b.closed_markers.length} lifecycle closes; close markers are thinned visually to reduce clutter.`;
}
