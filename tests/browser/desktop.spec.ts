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
  await expect(page.getByLabel('Treatment cycle controls')).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
  await expect(
    page
      .getByLabel('Development performance metrics')
      .getByText('28 draw calls'),
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

test('desktop treatment cycle starts, completes, refills, and resets deterministically', async ({
  page,
}, testInfo) => {
  await page.goto('/')

  const state = () =>
    page.evaluate(() => JSON.parse(window.render_game_to_text?.() ?? '{}'))

  expect(await state()).toMatchObject({
    phase: 'READY',
    running: false,
    selectedDose: 5,
    simulationTimeSeconds: 0,
  })

  await page.getByRole('button', { name: 'Start' }).click()
  await page.evaluate(() => window.advanceTime?.(100))
  const running = await state()
  expect(running.phase).toBe('RAPID_MIX')
  expect(running.running).toBe(true)
  expect(running.simulationTimeSeconds).toBeGreaterThanOrEqual(0.1)
  expect(running.simulationTimeSeconds).toBeLessThan(0.5)

  await page.getByRole('button', { name: 'Force Reset' }).click()
  const reset = await state()
  expect(reset.running).toBe(false)
  expect(reset.phase).toBe('READY')
  expect(reset.simulationPhase).toBe('rapidMix')
  expect(reset.simulationTimeSeconds).toBe(0)
  expect(reset.activeParticles).toBe(500)

  await page.getByRole('button', { name: 'Start' }).click()
  await page.evaluate(() => window.advanceTime?.(41_000))
  const measuring = await state()
  expect(measuring).toMatchObject({
    phase: 'MEASURING',
    result: null,
    resultCount: 0,
  })
  expect(measuring.simulationTimeSeconds).toBeGreaterThanOrEqual(41)
  expect(measuring.simulationTimeSeconds).toBeLessThan(43)
  await page.locator('canvas').screenshot({
    path: testInfo.outputPath('batch-06-measuring.png'),
  })
  await page.evaluate(() => window.advanceTime?.(2_000))
  const complete = await state()
  expect(complete).toMatchObject({
    phase: 'COMPLETE',
    presentationOpticalSource: 'trial-result',
    resultCount: 1,
    running: false,
    simulationTimeSeconds: 43,
  })
  expect(complete.result).toMatchObject({
    schemaVersion: 1,
    dose: 5,
    endpointOpticalLoad: 0.5011820349166183,
  })
  await page.locator('canvas').screenshot({
    path: testInfo.outputPath('batch-06-complete.png'),
  })

  await page.getByRole('button', { name: 'Refill' }).click()
  expect(await state()).toMatchObject({
    activeParticles: 500,
    phase: 'REFILLING',
    result: null,
    simulationTimeSeconds: 0,
  })
  await page.locator('canvas').screenshot({
    path: testInfo.outputPath('batch-06-refilling.png'),
  })
  await page.evaluate(() => window.advanceTime?.(2_000))
  expect(await state()).toMatchObject({
    phase: 'READY',
    selectedDose: 5,
    simulationTimeSeconds: 0,
  })
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

test('XR route runs the shared treatment cycle with locked controls and refill', async ({
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
    mode: 'treatment-cycle',
    activeParticles: 500,
    commandCount: 0,
    dose: 5,
    phase: 'READY',
    running: false,
    sessionActive: false,
    simulationConfigHash: 'fnv1a32-e8bf13e7',
    simulationDose: 5,
    startCommandCount: 0,
  })

  const setDose = await page.evaluate(() =>
    window.dispatch_xr_shell_command?.({ type: 'SET_DOSE', dose: 0 }),
  )
  expect(setDose).toMatchObject({
    accepted: true,
    dose: 0,
    eventType: 'SET_DOSE',
    from: 'READY',
    to: 'READY',
  })
  expect(await state()).toMatchObject({
    dose: 0,
    simulationDose: 5,
    phase: 'READY',
  })

  await page.locator('canvas').click({ position: { x: 542, y: 256 } })

  await expect.poll(async () => (await state()).commandCount).toBe(2)
  expect(await state()).toMatchObject({
    lastCommand: { type: 'START_TRIAL' },
    phase: 'RAPID_MIX',
    running: true,
    simulationDose: 0,
    startButtonPhase: 'locked',
    startCommandCount: 1,
  })

  expect(await state()).toMatchObject({
    controlAvailability: {
      doseEnabled: false,
      refillEnabled: false,
      startEnabled: false,
    },
    leverPhase: 'locked',
  })
  await page.evaluate(() => window.advanceTime?.(41_000))
  const xrMeasuring = await state()
  expect(xrMeasuring).toMatchObject({
    phase: 'MEASURING',
    result: null,
    resultCount: 0,
  })
  expect(xrMeasuring.simulationTimeSeconds).toBeGreaterThanOrEqual(41)
  expect(xrMeasuring.simulationTimeSeconds).toBeLessThan(43)
  await page.evaluate(() => window.advanceTime?.(2_000))
  const completed = await state()
  expect(completed.phase).toBe('COMPLETE')
  expect(completed.presentationOpticalSource).toBe('trial-result')
  expect(completed.simulationTimeSeconds).toBe(43)
  expect(completed.endpointOpticalLoad).toBeCloseTo(0.7375886586965295, 12)
  expect(completed.mergeCount).toBeGreaterThan(0)
  expect(completed.mergesPerSecond).toBeGreaterThan(0)
  expect(completed.resultCount).toBe(1)
  expect(completed.result).toMatchObject({
    schemaVersion: 1,
    dose: 0,
    endpointOpticalLoad: 0.7375886586965295,
  })
  const readPerformanceReport = () =>
    page.evaluate(() =>
      JSON.parse(window.render_performance_to_text?.() ?? '{}'),
    )
  await expect
    .poll(async () => (await readPerformanceReport()).metrics?.activeParticles)
    .toBe(completed.activeParticles)
  const performanceReport = await readPerformanceReport()
  expect(performanceReport.metrics.activeParticles).toBe(
    completed.activeParticles,
  )
  expect(performanceReport.metrics.sampleCount).toBeGreaterThan(0)
  expect(performanceReport.metrics.drawCalls).toBeGreaterThan(20)
  expect(
    performanceReport.metrics.averageSimulationStepMs,
  ).toBeGreaterThanOrEqual(0)
  expect(
    performanceReport.metrics.averageInstanceSyncMs,
  ).toBeGreaterThanOrEqual(0)

  const refill = await page.evaluate(() =>
    window.dispatch_xr_shell_command?.({ type: 'RESET_TRIAL' }),
  )
  expect(refill).toMatchObject({
    accepted: true,
    from: 'COMPLETE',
    to: 'REFILLING',
  })
  expect(await state()).toMatchObject({
    activeParticles: 500,
    dose: 0,
    phase: 'REFILLING',
    result: null,
    running: false,
    simulationDose: 0,
    simulationTimeSeconds: 0,
  })
  await page.evaluate(() => window.advanceTime?.(2_000))
  expect(await state()).toMatchObject({
    controlAvailability: {
      doseEnabled: true,
      refillEnabled: false,
      startEnabled: true,
    },
    phase: 'READY',
  })
  expect(
    await page.evaluate(() =>
      window.dispatch_xr_shell_command?.({ type: 'SET_DOSE', dose: 10 }),
    ),
  ).toMatchObject({ accepted: true, dose: 10 })
})
