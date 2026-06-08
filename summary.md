# Axone Dashboard Update — Tibot Quality + Sentinel BTC Decisions

Generated: 2026-06-08T00:45:50.540660+00:00

Output directory: `WEB_DASHBOARD/axone_dashboard/` inside Guy workspace.

## Added
- Tibot quality audit review panel with usable/watch/blocked counts, metric mismatch note, strongest groups, weakest groups, and redacted source paths.
- Sentinel BTC short-validation panel for `2026-06-02T08:49:59.999Z` → `2026-06-05T20:05:00Z`.
- Static BTC 5m OHLCV chart from Chronos `feed_rows.jsonl`, with accepted Sentinel long/short entries overlaid and lifecycle close markers where available.
- Wally proposal counts, Sentinel accepted/rejected counts by side, performance metrics, PnL by side, and before/after side distribution.

## Key BTC metrics
- Final equity: 9294.44
- Return %: -7.0556
- Max DD %: 4.2116
- Win rate: 0.3315
- Profit factor: 0.5158
- Realized PnL: -419.5981
- Total fees: 571.4274

## Static safety
No backend, external runtime API calls, secrets, upstream writes, scheduler changes, paper/live execution, retraining, replay, or optimisation were added.
