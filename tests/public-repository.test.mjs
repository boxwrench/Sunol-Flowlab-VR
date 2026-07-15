import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('public repository has licensing, safety, contribution, and plan authority', async () => {
  const [license, readme, contributing, security, plan, architecture] = await Promise.all([
    read('LICENSE'), read('README.md'), read('CONTRIBUTING.md'), read('SECURITY.md'),
    read('IMPLEMENTATION_PLAN.md'), read('docs/ARCHITECTURE.md'),
  ])

  assert.match(license, /^MIT License/)
  assert.match(readme, /drinking-water treatment/)
  assert.match(readme, /not dose-prediction software/)
  assert.match(contributing, /Do not submit real facility-sensitive material/)
  assert.match(security, /must not connect to SCADA/)
  assert.match(plan, /superseded source artifact/)
  assert.match(architecture, /sim.*browser.*React.*Three\.js.*rendering.*XR/s)
})

test('session handoff identifies the authoritative plan, open device gate, and validation route', async () => {
  const handoff = await read('HANDOFF.md')

  assert.match(handoff, /Active plan authority: \[IMPLEMENTATION_PLAN\.md\]/)
  assert.match(handoff, /Do not mark real-device criteria complete/)
  assert.match(handoff, /npm test/)
  assert.match(handoff, /Recommended next session/)
})
