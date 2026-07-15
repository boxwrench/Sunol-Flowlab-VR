import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

test('simulation sources do not import UI/XR libraries or use Math.random', async () => {
  const directory = new URL('../src/sim/', import.meta.url)
  const names = await readdir(directory)
  const sources = await Promise.all(
    names
      .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
      .map((name) => readFile(new URL(name, directory), 'utf8')),
  )
  const source = sources.join('\n')

  assert.doesNotMatch(source, /from ['"](?:react|three|@react-three\/)/)
  assert.doesNotMatch(source, /Math\.random\s*\(/)
  assert.equal(path.extname('particleState.ts'), '.ts')
})

