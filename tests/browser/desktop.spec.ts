import { expect, test } from '@playwright/test'

test('desktop foundation loads with explicit VR entry and a render surface', async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Sunol FlowLab VR' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enter VR' })).toBeVisible()
  await expect(page.getByLabel('Development performance metrics')).toBeVisible()
  await expect(page.getByLabel('Comparison presets')).toBeVisible()
  await expect(page.getByLabel('Simulation playback')).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
  await expect(
    page
      .getByLabel('Development performance metrics')
      .getByText('24 draw calls'),
  ).toBeVisible()
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
  expect(browserErrors).toEqual([])
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
