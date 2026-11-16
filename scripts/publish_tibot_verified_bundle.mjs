import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const source = process.argv[2]
if (!source) throw new Error('Usage: node scripts/publish_tibot_verified_bundle.mjs <review-bundle>')

const output = path.resolve('public/data/tibot-btcusdt-clean-pass')
await mkdir(output, { recursive: true })

const files = [
  'btc_usdt_ohlcv_predictions_wide.csv.gz',
  'SHA256_MANIFEST.json',
  'INPUT_SHA256_MANIFEST.json',
  'DATA_DICTIONARY.json',
  'reconciliation_summary.json',
  'selected_candidate_metadata.json',
  'no_fit_cells.json',
]

for (const file of files) await copyFile(path.join(source, file), path.join(output, file))

const manifestBytes = await readFile(path.join(source, 'SHA256_MANIFEST.json'))
const identity = {
  transaction: 'TX:20261116-225243',
  evidence_transaction: 'TX:20261116-164642',
  bundle_manifest_sha256: createHash('sha256').update(manifestBytes).digest('hex'),
  source_artifact: 'btc_usdt_ohlcv_predictions_wide.csv.gz',
  delivery: 'Exact gzip-compressed CSV from the verified bundle; 6,011 rows, 594 candidate columns, no sampling or imputation.',
}
await writeFile(path.join(output, 'dashboard_identity.json'), `${JSON.stringify(identity, null, 2)}\n`)

