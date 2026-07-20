import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const read = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), 'utf8')

test('XR source stays outside simulation ownership', async () => {
  const directory = new URL('../src/xr/', import.meta.url)
  const names = await readdir(directory)
  const sources = await Promise.all(
    names
      .filter((name) => name.endsWith('.ts') || name.endsWith('.tsx'))
      .filter((name) => !name.endsWith('.test.ts'))
      .map(async (name) => ({
        name,
        source: await readFile(new URL(name, directory), 'utf8'),
      })),
  )

  for (const { name, source } of sources) {
    assert.doesNotMatch(
      source,
      /from '\.\.\/sim|SimulationRuntime|FixedStepClock/,
      name + ' imports or owns simulation state',
    )
  }
})

test('dose lever exposes eleven validated detents and pointer capture', async () => {
  const [model, lever] = await Promise.all([
    read('../src/xr/interactionState.ts'),
    read('../src/xr/DoseLever.tsx'),
  ])

  assert.match(lever, /Array\.from\(\{ length: 11 \}/)
  assert.match(lever, /setPointerCapture/)
  assert.match(lever, /releasePointerCapture/)
  assert.match(lever, /function DialLabels/)
  assert.match(lever, /LABEL_SEGMENT_COUNT/)
  assert.match(lever, /sphereGeometry args=\{\[0\.13/)
  assert.match(lever, /scale=\{0\.75\}/)
  assert.match(lever, /position=\{\[-0\.3, 0, -0\.2\]\}/)
  assert.match(lever, /Math\.atan2\(localPoint\.x, localPoint\.z\)/)
  assert.match(model, /requireDoseIndex\(Math\.round/)
  assert.match(model, /type: 'SET_DOSE'/)
  assert.match(model, /dose === state\.lastEmittedDose/)
  assert.doesNotMatch(lever, /useFrame/)
})

test('Start control is a discrete single-emission latch', async () => {
  const [model, button] = await Promise.all([
    read('../src/xr/interactionState.ts'),
    read('../src/xr/StartButton.tsx'),
  ])

  assert.match(button, /setPointerCapture/)
  assert.match(button, /releasePointerCapture/)
  assert.match(button, /scale=\{0\.75\}/)
  assert.match(button, /position=\{\[0\.3, 0, 0\]\}/)
  assert.match(model, /state\.phase === 'pressed'/)
  assert.match(model, /state\.phase === 'locked'/)
  assert.match(button, /setStartButtonLocked/)
  assert.match(model, /type: 'START_TRIAL'/)
  assert.doesNotMatch(button, /useFrame/)
})
