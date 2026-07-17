import { expect, test } from '@playwright/test'

test('desktop foundation loads with explicit VR entry and a render surface', async ({
  page,
}) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Sunol FlowLab VR' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enter VR' })).toBeVisible()
  await expect(page.getByLabel('Development performance metrics')).toBeVisible()
  await expect(page.getByLabel('Comparison presets')).toBeVisible()
  await expect(page.getByLabel('Simulation playback')).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
  const xrPreflight = await page.evaluate(() =>
    JSON.parse(window.render_xr_preflight_to_text?.() ?? '{}'),
  )
  expect(xrPreflight).toMatchObject({
    sessionActive: false,
    leftControllerDetected: false,
    rightControllerDetected: false,
    leftSelectCount: 0,
    rightSelectCount: 0,
    targetSelectCount: 0,
  })
})

test('review controls start, stop, and deterministically reset the trial', async ({
  page,
}) => {
  await page.goto('/')

  const state = () =>
    page.evaluate(() => JSON.parse(window.render_game_to_text?.() ?? '{}'))

  await page.getByRole('button', { name: 'Stop' }).click()
  const stopped = await state()
  expect(stopped.running).toBe(false)
  await page.waitForTimeout(120)
  expect((await state()).simulationTimeSeconds).toBe(
    stopped.simulationTimeSeconds,
  )

  await page.getByRole('button', { name: 'Reset' }).click()
  const reset = await state()
  expect(reset.running).toBe(false)
  expect(reset.phase).toBe('rapidMix')
  expect(reset.simulationTimeSeconds).toBe(0)
  expect(reset.activeParticles).toBe(500)

  await page.getByRole('button', { name: 'Start' }).click()
  await page.waitForTimeout(120)
  const resumed = await state()
  expect(resumed.running).toBe(true)
  expect(resumed.simulationTimeSeconds).toBeGreaterThan(0)
})

test('comparison presets deterministically expose the U-shaped endpoint', async ({
  page,
}) => {
  await page.goto('/')

  async function runPreset(name: string) {
    await page.getByRole('button', { name }).click()
    await page.evaluate(() => window.advanceTime?.(43_000))
    return page.evaluate(() =>
      JSON.parse(window.render_game_to_text?.() ?? '{}'),
    )
  }

  const underdose = await runPreset('Underdose 0')
  const optimum = await runPreset('Optimum 5')
  const overdose = await runPreset('Overdose 10')

  expect(underdose.dose).toBe(0)
  expect(optimum.dose).toBe(5)
  expect(overdose.dose).toBe(10)
  expect(optimum.endpointOpticalLoad).toBeLessThan(
    underdose.endpointOpticalLoad,
  )
  expect(optimum.endpointOpticalLoad).toBeLessThan(overdose.endpointOpticalLoad)
})

test('proof mode leaves an unlabeled canvas for recognition review', async ({
  page,
}) => {
  await page.goto('/?mode=proof')

  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByRole('heading')).toHaveCount(0)
  await expect(page.getByLabel('Comparison presets')).toHaveCount(0)
  await expect(page.getByLabel('Simulation playback')).toHaveCount(0)
  await expect(page.getByLabel('Development performance metrics')).toHaveCount(
    0,
  )
})

test('standalone XR shell emits commands without composing simulation state', async ({
  page,
}) => {
  await page.goto('/?mode=xr-shell&calibration=off')

  await expect(
    page.getByRole('heading', { name: 'Sunol FlowLab VR' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enter VR' })).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()

  const state = () =>
    page.evaluate(() => JSON.parse(window.render_xr_shell_to_text?.() ?? '{}'))

  expect(await state()).toMatchObject({
    mode: 'xr-interaction-shell',
    commandCount: 0,
    dose: 5,
    sessionActive: false,
    startCommandCount: 0,
  })
  expect(await state()).not.toHaveProperty('activeParticles')
  expect(await state()).not.toHaveProperty('opticalLoad')

  await page.locator('canvas').click({ position: { x: 542, y: 256 } })

  await expect.poll(async () => (await state()).commandCount).toBe(1)
  expect(await state()).toMatchObject({
    lastCommand: { type: 'START_TRIAL' },
    startButtonPhase: 'released',
    startCommandCount: 1,
  })

  await page.mouse.move(424, 254)
  await page.mouse.down()
  await page.mouse.up()
  await expect.poll(async () => (await state()).leverPhase).toBe('snapped')
  expect((await state()).commandCount).toBe(1)
})
