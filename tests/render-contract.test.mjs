import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('particle renderer is a read-only state consumer with one instanced mesh', async () => {
  const source = await readFile(
    new URL('../src/render/ParticleCloud.tsx', import.meta.url),
    'utf8',
  )
  const frameCallback = source.slice(source.indexOf('useFrame('))

  assert.equal((source.match(/<instancedMesh\b/g) ?? []).length, 1)
  assert.doesNotMatch(source, /useState/)
  assert.doesNotMatch(frameCallback, /new (?:Matrix4|Vector3|Array)\b/)
  assert.doesNotMatch(source, /(?:create|reset|step)Particle|FixedStepClock/)
  assert.match(source, /state: ParticleStateView/)
  assert.match(source, /state\.normalizedSize\[index\]/)
  assert.match(source, /instanceMatrix\.needsUpdate = true/)
})

test('turbidity renderer uses one preallocated band-driven gradient surface', async () => {
  const source = await readFile(
    new URL('../src/render/TurbidityGradient.tsx', import.meta.url),
    'utf8',
  )
  const frameCallback = source.slice(source.indexOf('useFrame('))

  assert.equal((source.match(/<mesh\b/g) ?? []).length, 1)
  assert.match(source, /bands: TurbidityBandsView/)
  assert.match(source, /new Uint8Array\(bands\.values\.length\)/)
  assert.match(source, /new DataTexture/)
  assert.doesNotMatch(
    frameCallback,
    /new (?:DataTexture|ShaderMaterial|Uint8Array)/,
  )
  assert.doesNotMatch(source, /endpointTurbidity|sampleTurbidityBands|Dose/)
})

test('jar-test bench is a six-preset static geometry consumer', async () => {
  const source = await readFile(
    new URL('../src/render/JarTestBench.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /\[0, 2, 4, 6, 8, 10\] as const/)
  assert.equal((source.match(/<instancedMesh\b/g) ?? []).length, 3)
  assert.doesNotMatch(source, /useFrame|Particle|Turbidity|SimulationRuntime/)
})
