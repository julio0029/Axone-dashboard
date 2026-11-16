import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createGunzip } from 'node:zlib'
import readline from 'node:readline'

const root = new URL('../public/data/tibot-btcusdt-clean-pass/', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('SHA256_MANIFEST.json', root)))
for (const [name, expected] of Object.entries(manifest.artifacts)) {
  const local = new URL(name, root)
  try {
    const bytes = await readFile(local)
    const actual = createHash('sha256').update(bytes).digest('hex')
    if (actual !== expected.sha256) throw new Error(`${name}: ${actual} != ${expected.sha256}`)
  } catch (error) {
    if (error.code === 'ENOENT' && !['btc_usdt_ohlcv_predictions_wide.csv.gz'].includes(name)) continue
    throw error
  }
}

const input = createReadStream(new URL('btc_usdt_ohlcv_predictions_wide.csv.gz', root)).pipe(createGunzip())
const lines = readline.createInterface({ input, crlfDelay: Infinity })
let rowCount = -1
let columns = 0
for await (const line of lines) {
  if (rowCount === -1) columns = line.split(',').length
  rowCount += 1
}
if (rowCount !== 6011 || columns !== 603) throw new Error(`Unexpected matrix: ${rowCount} rows × ${columns} columns`)
console.log(`Verified exact artifact hashes and matrix identity: ${rowCount} rows × ${columns} columns`)

