# Tibot Interactive Bot Explorer — Guy Dashboard

## Completed
- Updated read-only interactive Tibot dashboard at `WEB_DASHBOARD/axone_dashboard/tibot_interactive/index.html`.
- Added per-bot overlay toggles persisted in `localStorage`:
  - ON by default: raw OHLCV candles; gann_swing/class label markers.
  - OFF by default: gann_swing step line; gann_swing_change/top-bottom markers; gann_swing_age/gann_count/close_rel_gann_change secondary overlays; target; model prediction; probability_up heatmap.
- Per-bot `app_data.json` payloads still assemble in `build_dashboard.py`; per-chart JSON now carries `gann_features` from `datasets_active/<SYMBOL>_<TF>_gann_swing.pkl` when present.
- Time alignment is timestamp-based; overlays filter against the selected candle range and share the OHLCV x-axis.

## Generated artifacts
- `index.html` — static dashboard UI with no external libraries.
- `build_dashboard.py` — local read-only artifact scanner/builder; writes only under this Guy dashboard folder.
- `app_data.json` — UI class/family/bot hierarchy.
- `dashboard_status.json` — includes `gann_swing_overlay_available: true` and toggle defaults.
- `source_registry.json` — exact source files used per bot/view.
- `data/*.json` — derived per-bot chart payloads.

## Other touched dashboards
- `DASHBOARDS/short_btc_validation_trade_review_20260607/btc_validation_chart.html` — rebuilt with OHLCV buttons and gann_swing overlay traces.
- `DASHBOARDS/gann_swing_regression_diagnostic_20260612/index.html` — new self-contained side-by-side diagnostic view.

## Diagnostic URL/path
- `file:///Users/axone/.openclaw/agents/guy/workspace/DASHBOARDS/gann_swing_regression_diagnostic_20260612/index.html`

## Verification
- `build_dashboard.py`: ran successfully; 415 bots scanned.
- Deploy variant synced byte-identically for `build_dashboard.py`, `index.html`, `app_data.json`, `dashboard_status.json`; `data/` copied.
- Python compile: OK.
- Static BTC validation chart rebuilt successfully.

## Safety notes
- No Tibot, Chronos, Kerry, Wally, Sentinel, Darwin, Karen, bot, strategy, risk, live, or historical files were modified.
- No model files or datasets were modified; inference caches live only under Guy `DATA/`.
