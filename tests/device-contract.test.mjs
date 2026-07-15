import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('Quest test contract names an authorized device and reproducible local route', async () => {
  const contract = await readFile(
    new URL('../docs/DEVICE_TESTING.md', import.meta.url),
    'utf8',
  )

  assert.match(contract, /Meta Quest 3/)
  assert.match(contract, /Developer Mode: enabled/)
  assert.match(contract, /adb reverse tcp:5173 tcp:5173/)
  assert.match(contract, /immersive-vr/)
  assert.match(contract, /both controller poses\/select input/)
  assert.match(contract, /hosted HTTPS smoke URL/)
})
