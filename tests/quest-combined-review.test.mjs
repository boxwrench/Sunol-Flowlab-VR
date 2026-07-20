import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('combined Quest review stages comparison state and records bounded evidence', async () => {
  const [harness, packageJson] = await Promise.all([
    read('scripts/quest-batch-07.mjs'),
    read('package.json'),
  ])

  assert.match(harness, /action === 'review-ready'/)
  assert.match(harness, /action === 'watch-combined'/)
  assert.match(harness, /action === 'watch-controls'/)
  assert.match(harness, /for \(const dose of \[0, 2, 4, 5, 6, 8, 10\]\)/)
  assert.match(harness, /elapsedSeconds: 35/)
  assert.match(harness, /frameBudgetMs = 1_000 \/ 72/)
  assert.match(harness, /minimumAverageFps < 72/)
  assert.match(harness, /memoryDisposition/)
  assert.match(harness, /idempotent-repeat/)
  assert.match(
    harness,
    /'RAPID_MIX',[\s\S]*'FLOCCULATION',[\s\S]*'SETTLING',[\s\S]*'MEASURING'/,
  )
  assert.match(harness, /quest-batch-08-combined-latest\.json/)
  assert.match(harness, /quest-batch-08-controls-latest\.json/)

  for (const command of [
    'SELECT_GHOST',
    'PLAY_GHOST',
    'PAUSE_GHOST',
    'RESET_GHOST',
    'DELETE_GHOST',
    'RESET_TRIAL',
    'CLEAR_EXPERIMENT_LOG',
    'REPLACE_OLDEST_GHOST',
  ])
    assert.match(harness, new RegExp(`'${command}'`))

  const scripts = JSON.parse(packageJson).scripts
  assert.equal(
    scripts['acceptance:08:quest'],
    'node scripts/quest-batch-07.mjs',
  )
})
