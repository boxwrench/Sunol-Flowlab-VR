import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

const affectedBatches = [
  'batch-01-foundation-and-xr-preflight.md',
  'batch-03-desktop-phenomenon-proof.md',
  'batch-04-standalone-xr-interaction-shell.md',
  'batch-05-simulation-xr-integration.md',
  'batch-06-treatment-cycle-state-machine.md',
  'batch-07-physical-instrumentation-and-persistence.md',
  'batch-08-headset-readability-and-clearing-front.md',
  'batch-09-desktop-spectator-experience.md',
  'batch-10-presence-environment-and-audio.md',
  'batch-11-release-hardening-and-deployment.md',
]

test('hybrid design direction is present and wired into governing plans', async () => {
  const [brief, plan, foundation, phenomenon, instrumentation] =
    await Promise.all([
      read('docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md'),
      read('IMPLEMENTATION_PLAN.md'),
      read('batch-01-foundation-and-xr-preflight.md'),
      read('batch-03-desktop-phenomenon-proof.md'),
      read('batch-07-physical-instrumentation-and-persistence.md'),
    ])
  const pdf = await stat(
    new URL('../docs/Sunol FlowLab VR Design Brief.pdf', import.meta.url),
  )

  assert.ok(pdf.size > 10_000)
  assert.match(plan, /Approved design direction/)
  assert.match(
    brief,
    /plot and versioned experiment log are the sole complete records/,
  )
  assert.match(brief, /static physical comparisons/)
  assert.match(foundation, /Work package 01A\.7 - Runtime ownership correction/)
  assert.match(phenomenon, /docs\/UX_VALIDATION\.md/)
  assert.match(
    instrumentation,
    /Work package 07A\.6 - Static canonical jar summaries/,
  )

  const batchSources = await Promise.all(affectedBatches.map(read))
  for (const source of batchSources) {
    assert.match(source, /docs\/DESIGN_DIRECTION_JAR_TEST_HYBRID\.md/)
  }
})
