# Tibot Interactive Bot Explorer — Guy Dashboard

## Completed
- Created a read-only interactive Tibot dashboard at `WEB_DASHBOARD/tibot_interactive/index.html`.
- First view shows exactly two clickable bot-class boxes: `prediction` and `classification`.
- Class click opens clickable family boxes with aggregate metrics, symbol/timeframe coverage, and blocked counts.
- Family click opens an initially empty chart panel with required `symbol` and `timeframe` selectors.
- Once symbol/timeframe are selected, the chart shows:
  - raw OHLCV candlesticks from Chronos historical artifacts when available,
  - training output/target layer from Tibot dataset artifacts when available,
  - actual bot prediction derived by running the packaged Tibot model read-only against its local training dataset when possible.
- Added interactive period controls and mouse-wheel zoom.

## Generated artifacts
- `index.html` — static dashboard UI with no external libraries.
- `build_dashboard.py` — local read-only artifact scanner/builder; writes only under this Guy dashboard folder.
- `app_data.json` — UI class/family/bot hierarchy.
- `dashboard_status.json` — discovered classes/families/symbols/timeframes plus blocked/unavailable notes.
- `source_registry.json` — exact source files used per bot/view.
- `data/*.json` — derived per-bot chart payloads.

## Discovery results
- Bot packages scanned: 375
- UI classes: `classification`, `prediction`
- Chart payloads generated: 207
- Bots with explicit blocked/unavailable notes: 168
  - Most blocked cases are missing training datasets, GENERAL/malformed symbol-timeframe mappings, or missing OHLCV.

## Verification
- JSON parse: OK (`210` generated JSON files parsed).
- Python compile: OK (`build_dashboard.py`).
- Dashboard JavaScript syntax check: OK (`node --check`).
- Static safety scan: OK — no external HTTP fetches, broker/order libraries, scheduler patterns, or upstream write patterns in dashboard code.
- Write confinement: OK — all `212` files are under `guy-source://WEB_DASHBOARD/tibot_interactive/`.

## Safety notes
- No Tibot, Chronos, Kerry, Wally, Sentinel, Darwin, Karen, bot, strategy, risk, live, or historical files were modified.
- No trading, paper/live execution, external API, scheduler, retraining, replay, optimisation, or production promotion was performed.
- Missing/malformed inputs are shown as blocked/unavailable; no data is fabricated.
