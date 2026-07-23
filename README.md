# Axone Dashboard

Interactive control deck for the **Axone** multi-agent trading/research system, built and published by the **Guy** agent.

> Dark analytics aesthetic · electric-blue glow · modular glass panels.
> Live at: **https://julio0029.github.io/Axone-dashboard/**

## Pages

- **Axone Architecture** (`/`) — every agent as a clickable node with the live information flow
  (`Kerry → Tibot → Wally → Sentinel → Chronos → Darwin`, Axone orchestrates, Glia ↔ all). Click a
  node to open its dashboard.
- **Kerry · Market Data** (`/#/kerry`) — trading-platform view of the market-data layer: symbol +
  timeframe selectors, interactive candlestick chart with volume & RSI sub-charts, indicator
  overlays (EMA / MA / Bollinger), swing-high/low markers, and a column-toggle table for choosing
  which Kerry calculations render on the chart.
- **Tibot · Suite Review** (`/#/tibot`) — sandbox-only review of the Tibot candidate suite using
  the Chronos read-only dashboard contract. Charts bind raw historical BTCUSDT OHLCV to target /
  predictive-target parquet rows by timestamp and show candidate metrics/guards as reporting-only
  evidence with source paths and SHA-256 hashes.
- Other agent pages are **“Coming soon”** placeholders, scaffolded incrementally.

> ⚠️ The dashboard currently renders **deterministic mock OHLCV** so the UI is fully demonstrable
> offline. Wiring real Axone data exports is the next step (see the scaffold report).

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · ECharts (candlesticks + node graph) ·
react-router (HashRouter, GitHub-Pages-safe).

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # type-check + production bundle into dist/
npm run preview    # serve the production build locally
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes `dist/` to
GitHub Pages. Enable Pages once via **Settings → Pages → Source: GitHub Actions**.

## Data integrity

Guy is **read-only** with respect to all Axone data. This repository is Guy's only write target.
Guy never edits, deletes, or mutates Axone source data, manifests, or any other agent's files.
