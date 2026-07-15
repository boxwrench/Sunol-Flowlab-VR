import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('XR preflight records both controllers and select without simulation ownership', async () => {
  const source = await readFile(
    new URL('../src/xr/ControllerPreflight.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /useXRInputSourceState\('controller', 'left'\)/)
  assert.match(source, /useXRInputSourceState\('controller', 'right'\)/)
  assert.equal((source.match(/'selectstart'/g) ?? []).length, 2)
  assert.match(source, /type: 'target-select'/)
  assert.doesNotMatch(source, /from '..\/sim|SimulationRuntime|FixedStepClock/)
})
