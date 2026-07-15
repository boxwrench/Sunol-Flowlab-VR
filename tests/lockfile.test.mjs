import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('lockfile preserves the exact root dependency contract', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  )
  const lock = JSON.parse(
    await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'),
  )
  const root = lock.packages['']

  assert.equal(lock.lockfileVersion, 3)
  assert.deepEqual(root.dependencies, manifest.dependencies)
  assert.deepEqual(root.devDependencies, manifest.devDependencies)
  assert.equal(root.engines.node, manifest.engines.node)
})
