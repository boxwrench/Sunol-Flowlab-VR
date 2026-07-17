import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

async function sourcesIn(relativeDirectory) {
  const directory = new URL(relativeDirectory, import.meta.url)
  const names = await readdir(directory)
  return Promise.all(
    names
      .filter((name) => name.endsWith('.ts') || name.endsWith('.tsx'))
      .filter((name) => !name.endsWith('.test.ts'))
      .map(async (name) => ({
        name,
        source: await readFile(new URL(name, directory), 'utf8'),
      })),
  )
}

test('rendering cannot own simulation lifecycle or import the app layer', async () => {
  const sources = await sourcesIn('../src/render/')
  const forbiddenOwners = [
    'createParticleState',
    'resetParticleState',
    'stepParticleDrift',
    'stepPhenomenonWorkspace',
    'sampleOpticalLoadBands',
    'endpointOpticalLoad',
    'calculateDoseEfficiency',
    'FixedStepClock',
  ]

  for (const { name, source } of sources) {
    assert.equal(
      source.includes("from '../app/"),
      false,
      name + ' imports the app layer',
    )
    for (const owner of forbiddenOwners) {
      assert.equal(
        source.includes(owner),
        false,
        name + ' owns simulation lifecycle',
      )
    }
  }
})

test('the app runtime owns deterministic state and clock lifecycle', async () => {
  const source = await readFile(
    new URL('../src/app/SimulationRuntime.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /createPhenomenonWorkspace/)
  assert.match(source, /new FixedStepClock/)
  assert.match(source, /resetPhenomenonWorkspace/)
  assert.match(source, /stepPhenomenonWorkspace/)
})

test('Batch 05 composes one app-owned runtime into the shared hero tank renderer', async () => {
  const [app, scene, apparatus] = await Promise.all([
    readFile(new URL('../src/app/XrShellApp.tsx', import.meta.url), 'utf8'),
    readFile(
      new URL('../src/render/XrShellScene.tsx', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL('../src/render/XrShellApparatus.tsx', import.meta.url),
      'utf8',
    ),
  ])

  assert.equal((app.match(/new SimulationRuntime\(/g) ?? []).length, 1)
  assert.match(app, /new Batch05CommandAdapter\(runtime/)
  assert.match(scene, /<HeroObservationTank/)
  assert.match(scene, /particleState=\{particleState\}/)
  assert.match(scene, /opticalLoadBands=\{opticalLoadBands\}/)
  assert.doesNotMatch(apparatus, /EmptyHeroTank/)
  assert.equal((apparatus.match(/<JarTestBench\b/g) ?? []).length, 1)
})
