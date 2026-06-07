# Axone Architecture Dashboard

Generated: 2026-06-07T19:26:59.021708+00:00

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
