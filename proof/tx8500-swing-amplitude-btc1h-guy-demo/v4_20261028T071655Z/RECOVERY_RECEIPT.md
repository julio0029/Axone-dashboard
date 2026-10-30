# Guy recovery receipt — fresh BTCUSDT native 1h swing-amplitude display

- Authorization: `TX20261027-ALL-RESUME / Hermes follow-through Telegram 2846`
- Layer / owner: visualization / Guy
- Observed at: `2026-10-28T07:16:55Z`
- Status: `WAITING_FOR_FRESH_CANONICAL_TO_FROZEN_MODEL_HANDOFF`
- Repository HEAD: `82a58e5047204b4ed2701da7ae26ba437a83ae43`

## Reconciliation

- Existing Guy evidence consists of bounded `v1`, `v2`, and `v3` display artifacts dated 2026-10-26.
- Latest prior receipt: `v3_20261026T082321Z/DISPLAY_RECEIPT.json`
- Latest prior receipt SHA-256: `7d9931be20dd923128bac7fd0b822c432d24b3d9afdeaa3c8dd611cef6a4393e`
- Prior `v3` status: `RENDERED_HISTORICAL_FROZEN_REPLAY_WITH_FRESH_INFERENCE_BLOCKED`.
- Prior numerical values remain historical only: 499 fresh native candles, 24 historical frozen-replay predictions, MAE `0.22974864816276208` log1p units, RMSE `0.27145600363437467` log1p units.
- No fresh prediction series or fresh numerical inference result was found.
- No active Guy `tx8500`, swing-amplitude, render, Playwright, Vite, or HTTP-server process was found. PID: none.
- Existing unrelated dirty file `public/data/wolf_live_48h.json` was observed and not modified.

## Exact read-only commands

```sh
git status --short --branch
git log -8 --oneline --decorate
git remote -v
for f in proof/tx8500-swing-amplitude-btc1h-guy-demo/v*/DISPLAY_RECEIPT.json; do echo "$f"; jq . "$f"; done
rg -n -i "canonical281|TX20261027|frozen.*model|native1h|swing.amplitude|inference" /Users/julesdevaux/.openclaw/agents --glob '!**/node_modules/**' --glob '!**/.git/**' --glob '*.json' --glob '*.md' --glob '*.txt' --glob '*.log' --glob '*.jsonl'
ps -axo pid=,ppid=,etime=,command= | rg -i 'tx8500|swing-amplitude|render\.mjs|playwright|vite|http.server'
find /Users/julesdevaux/.openclaw/agents/tibot/workspace /Users/julesdevaux/.openclaw/agents/chronos/workspace /Volumes/Seagate-14T/axone_research/tibot -type f -newermt '2026-10-27 00:00:00' | rg -i 'swing|amplitude|canonical|281|inference|guy|handoff|TX_20261027|TX20261027'
shasum -a 256 proof/tx8500-swing-amplitude-btc1h-guy-demo/v3_20261026T082321Z/DISPLAY_RECEIPT.json
git rev-parse HEAD
```

## Coordination

Sent to `agent:tibot:main` with OpenClaw run ID `fc728eb1-cf37-4061-8a10-e0c6949291cb`: request for the exact immutable fresh inference handoff path and SHA-256. Delivery status at receipt creation: `pending`.

Tibot confirmation received at `2026-10-28T07:18:20Z`:

- Current state: `BLOCKED_PENDING_CHRONOS_CANONICAL281`.
- Available fresh evidence: Spider's raw 499-row native 1h payload only.
- Missing gate: Chronos parity-verified canonical281 artifact.
- Inference has not run; PID and inference command: none.
- Tibot will supply the immutable handoff path, SHA-256, canonical input/model hashes, numerical output values/counts, timestamps, and PID/command provenance only after the fresh run completes.
- The 2026-10-26 replay remains historical and must not be represented as fresh.

Coordination update received at `2026-10-28T07:19:49Z`:

- Upstream cites Chronos receipt `EVIDENCE/TX20261027_ALL_RESUME_RECOVERY_20261028T071524Z/RECOVERY_RECEIPT.md`, SHA-256 `c5943b1df1e41f1c266cb116b63e87ac2cd2ca77e86fac8370e35e7017125e28`.
- Guy searched the locally visible OpenClaw tree for that exact path; it was not present, so the cited receipt hash is recorded but not independently verified by Guy.
- Verified-source claim supplied upstream: 499 rows spanning `2026-10-05T12:00Z` through `2026-10-26T06:59:59Z`, zero duplicate or missing hours, 89,025 bytes, SHA-256 `27c331c9db3b638006b6dc7fd5d06656c4d4f58466e328db1d0fbd111c7b0853`.
- Chronos result supplied upstream: zero canonical rows; Chronos owns no implementation code.
- Sublime implementation dispatch: run `c413992a-36df-4b12-a3e8-58e37db30c64`, covering raw-to-canonical281, recursive initialization, and parity proof.
- Required chain remains: versioned implementation manifest → Sentinel independent acceptance/parity manifest → canonical artifact → Tibot frozen inference handoff → Guy display.
- Guy acceptance rule: render only a versioned, hash-bound handoff whose canonical input/model hashes, output values/counts, timestamps, and command/PID provenance are independently verifiable.

Fresh raw identity update received at `2026-10-28T07:21:53Z`:

- Upstream cites Chronos `FRESH_RAW_HANDOFF_RECEIPT.md` under `EVIDENCE/TX20261027_ALL_RESUME_RECOVERY_20261028T071643Z`.
- Guy searched the locally visible OpenClaw tree for that exact receipt; it was not present, so its contents are recorded as an upstream claim rather than independently verified by Guy.
- Newly selected Spider sealed raw identity: 499 rows spanning `2026-10-07T12:00Z` through `2026-10-28T06:59:59Z`, zero gaps and zero duplicates, SHA-256 `3c7f24ede5ed2ff0a864a0a8d09716ef393fc274b603d83215db2cd286195442`.
- Reported filesystem sealing: directory mode `0555`; file mode `0444`.
- The earlier 499-row identity with SHA-256 `27c331c9db3b638006b6dc7fd5d06656c4d4f58466e328db1d0fbd111c7b0853` is preserved but superseded for the fresh chain.
- Current canonical state remains zero canonical281 rows; adapter PID: none.
- Display remains gated pending Sentinel-accepted canonical281 parity and Tibot's accepted frozen-inference handoff.

Quarantine directive received at `2026-10-28T07:32:57Z`:

- Sublime packet SHA-256 prefix `3b411030...` is quarantined.
- Reason: it binds the superseded 2026-10-26 raw lineage and a stale cutoff.
- Guy display disposition: `DENY`; no value, chart, provenance claim, or derived output from that packet may enter the fresh display path.
- Display remains gated pending a non-quarantined, versioned, hash-bound, independently accepted frozen-inference handoff tied to the current sealed raw identity.

V2 dispute directive received at `2026-10-28T07:37:01Z`:

- The reported V2 output has disputed package identity under Chronos preflight.
- Guy display disposition: `DENY_PENDING_NEW_SENTINEL_ACCEPTED_LINEAGE`.
- No V2 numerical output, chart, provenance claim, or derivative may be rendered.
- The gate can reopen only for a new versioned lineage independently accepted by Sentinel and subsequently bound to Tibot's frozen-inference handoff.

Final lineage gate update received at `2026-10-28T07:41:53Z`:

- V2 status: `SUPERSEDED`; permanently inadmissible for the fresh display.
- Sole admissible future input: a V3 frozen-inference handoff carrying an explicit Sentinel `PASS`.
- Until that exact handoff is available and its hashes and provenance verify, display status remains `GATED_NO_RENDER`.

## Boundaries and next action

No Axone source, model, strategy, manifest, immutable evidence, live/paper service, or historical display artifact was changed. No deploy, promotion, trade, model load, inference, training, or optimization was performed.

Next action: wait for Tibot's fresh canonical281-to-frozen-model inference handoff; independently verify its file hashes and provenance; then render only the supplied numerical result as fresh, clearly separated from the 2026-10-26 historical replay.
