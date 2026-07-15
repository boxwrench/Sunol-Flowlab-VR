import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const manifest = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
)

test('XR-sensitive runtime dependencies use exact compatible versions', () => {
  const expected = {
    '@react-three/drei': '10.7.7',
    '@react-three/fiber': '9.6.1',
    '@react-three/xr': '6.6.30',
    react: '19.2.7',
    'react-dom': '19.2.7',
    three: '0.165.0',
  }
  assert.deepEqual(manifest.dependencies, expected)
  for (const version of Object.values(manifest.dependencies))
    assert.match(version, /^\d+\.\d+\.\d+$/)
})

test('runtime and package-manager policy are pinned', () => {
  assert.equal(manifest.packageManager, 'npm@11.18.0')
  assert.equal(manifest.engines.node, '>=24.12.0 <25')
  assert.equal(manifest.engines.npm, '>=11.18.0 <12')
})
