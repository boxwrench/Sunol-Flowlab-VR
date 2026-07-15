import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('particle renderer uses one instanced mesh and no React hot-loop state', async () => {
  const source = await readFile(new URL('../src/render/ParticleCloud.tsx', import.meta.url), 'utf8')
  const frameCallback = source.slice(source.indexOf('useFrame((_, elapsedSeconds)'))

  assert.equal((source.match(/<instancedMesh\b/g) ?? []).length, 1)
  assert.doesNotMatch(source, /useState/)
  assert.doesNotMatch(frameCallback, /new (?:Matrix4|Vector3|Array)\b/)
  assert.match(source, /instanceMatrix\.needsUpdate = true/)
})
