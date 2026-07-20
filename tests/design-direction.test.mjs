import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

const affectedBatches = [
  'docs/plans/batch-01-foundation-and-xr-preflight.md',
  'docs/plans/batch-03-desktop-phenomenon-proof.md',
  'docs/plans/batch-04-standalone-xr-interaction-shell.md',
  'docs/plans/batch-05-simulation-xr-integration.md',
  'docs/plans/batch-06-treatment-cycle-state-machine.md',
  'docs/plans/batch-07-physical-instrumentation-and-persistence.md',
  'docs/plans/batch-08-headset-readability-and-clearing-front.md',
  'docs/plans/batch-09-desktop-spectator-experience.md',
  'docs/plans/batch-10-presence-environment-and-audio.md',
  'docs/plans/batch-11-release-hardening-and-deployment.md',
]

test('hybrid design direction is present and wired into governing plans', async () => {
  const [brief, plan, foundation, phenomenon, instrumentation] =
    await Promise.all([
      read('docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md'),
      read('IMPLEMENTATION_PLAN.md'),
      read('docs/plans/batch-01-foundation-and-xr-preflight.md'),
      read('docs/plans/batch-03-desktop-phenomenon-proof.md'),
      read('docs/plans/batch-07-physical-instrumentation-and-persistence.md'),
    ])
  const pdf = await stat(
    new URL('../docs/Sunol FlowLab VR Design Brief.pdf', import.meta.url),
  )
  const archivedPlan = await stat(
    new URL(
      '../docs/archive/Sunol FlowLab Implementation Plan (superseded Godot).pdf',
      import.meta.url,
    ),
  )

  assert.ok(pdf.size > 10_000)
  assert.ok(archivedPlan.size > 10_000)
  await assert.rejects(() =>
    access(
      new URL(
        '../docs/plans/batch-03-desktop-phenomenon-proof (1).md',
        import.meta.url,
      ),
    ),
  )
  assert.match(plan, /Binding design and model direction/)
  assert.match(
    brief,
    /plot and versioned experiment log are the sole complete records/,
  )
  assert.match(brief, /static physical comparisons/)
  assert.match(foundation, /Work package 01A\.7 - Runtime ownership correction/)
  assert.match(phenomenon, /\.\.\/UX_VALIDATION\.md/)
  assert.match(
    instrumentation,
    /Work package 07A\.6 - Static canonical jar summaries/,
  )

  const batchSources = await Promise.all(affectedBatches.map(read))
  for (const source of batchSources) {
    assert.match(source, /\.\.\/DESIGN_DIRECTION_JAR_TEST_HYBRID\.md/)
  }
})
