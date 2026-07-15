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
  await expect(page.locator('canvas')).toBeVisible()
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
  expect(optimum.endpointTurbidity).toBeLessThan(underdose.endpointTurbidity)
  expect(optimum.endpointTurbidity).toBeLessThan(overdose.endpointTurbidity)
})

test('proof mode leaves an unlabeled canvas for recognition review', async ({
  page,
}) => {
  await page.goto('/?mode=proof')

  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByRole('heading')).toHaveCount(0)
  await expect(page.getByLabel('Comparison presets')).toHaveCount(0)
  await expect(page.getByLabel('Development performance metrics')).toHaveCount(
    0,
  )
})
