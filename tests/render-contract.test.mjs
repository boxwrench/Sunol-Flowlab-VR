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
