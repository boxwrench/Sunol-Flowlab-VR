import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('binding Batch 00 contracts are present and mutually consistent', async () => {
  const [authority, decisions, contracts, regression, visuals, data] =
    await Promise.all([
      read('CLAUDE.md'),
      read('docs/DECISIONS.md'),
      read('docs/CONTRACTS.md'),
      read('docs/REGRESSION_CONTRACT.md'),
      read('docs/VISUAL_BEHAVIOR.md'),
      read('docs/DATA_BOUNDARY.md'),
    ])

  assert.match(authority, /Coagulation only/)
  assert.match(authority, /500 representative particles/)
  assert.match(decisions, /One turbidity authority/)
  assert.match(
    contracts,
    /type DoseIndex = 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10/,
  )
  assert.match(contracts, /SET_DOSE/)
  assert.match(regression, /0x5f3759df/)
  assert.match(regression, /detents 0 and 10/)
  assert.match(visuals, /Strong top-down clearing/)
  assert.match(data, /personal educational portfolio project/)
  assert.match(data, /phenomenological coagulation model/)
})
