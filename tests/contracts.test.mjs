import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('binding Batch 00 contracts are present and mutually consistent', async () => {
  const [
    authority,
    decisions,
    contracts,
    regression,
    visuals,
    data,
    modeling,
    ghostReplay,
    batch03,
    batch07,
    batch08,
  ] = await Promise.all([
    read('CLAUDE.md'),
    read('docs/DECISIONS.md'),
    read('docs/CONTRACTS.md'),
    read('docs/REGRESSION_CONTRACT.md'),
    read('docs/VISUAL_BEHAVIOR.md'),
    read('docs/DATA_BOUNDARY.md'),
    read('docs/MODELING_RESEARCH_AMENDMENT.md'),
    read('docs/GHOST_REPLAY_DESIGN.md'),
    read('batch-03-desktop-phenomenon-proof.md'),
    read('batch-07-physical-instrumentation-and-persistence.md'),
    read('batch-08-headset-readability-and-clearing-front.md'),
  ])

  assert.match(authority, /Coagulation only/)
  assert.match(authority, /500 representative particles/)
  assert.match(decisions, /One relative optical-load authority/)
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
  assert.match(modeling, /Aggregate mass is authoritative/)
  assert.match(modeling, /No free list in version 1/)
  assert.match(modeling, /Spatial hashing remains optional and evidence gated/)
  assert.match(ghostReplay, /treatment-result ghost/)
  assert.match(ghostReplay, /10 Hz/)
  assert.match(ghostReplay, /Ghost playback does not rerun/)
  assert.match(contracts, /interface TreatmentGhostV1/)
  assert.match(batch03, /Workstream 03D/)
  assert.match(batch03, /Workstream 03D technically accepted/)
  assert.match(batch03, /replacement-model Quest gates open/)
  assert.match(batch07, /Workstream 07D - Treatment-result ghost/)
  assert.match(batch08, /Work package 08.9 - Treatment-ghost visual comparison/)
})
