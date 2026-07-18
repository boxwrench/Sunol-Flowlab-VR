import { chromium } from 'playwright'

const CDP_URL = 'http://127.0.0.1:9222'
const TARGET_URL =
  'http://127.0.0.1:5173/?mode=xr-shell&posture=seated&calibration=off'
const action = process.argv[2] ?? 'status'
const argument = process.argv[3]

const browser = await chromium.connectOverCDP(CDP_URL)
const pages = browser.contexts().flatMap((context) => context.pages())
const page =
  pages.find((candidate) =>
    candidate.url().includes('mode=xr-shell&posture=seated'),
  ) ??
  (action === 'restart'
    ? (pages.find((candidate) =>
        candidate.url().startsWith('http://127.0.0.1:5173/'),
      ) ??
      pages.find((candidate) => candidate.url().startsWith('chrome-error://')))
    : undefined)

if (page === undefined) {
  throw new Error(
    `Quest Browser does not expose the seated Batch 7 route; found ${pages
      .map((candidate) => candidate.url())
      .join(', ')}`,
  )
}

if (action === 'status') {
  print(await snapshot(page))
} else if (action === 'restart') {
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' })
  await page.bringToFront()
  await trustedClick(page, page.getByRole('button', { name: 'Enter VR' }))
  await page.waitForFunction(
    () =>
      JSON.parse(window.render_xr_shell_to_text?.() ?? '{}').sessionActive ===
      true,
    undefined,
    { timeout: 10_000 },
  )
  print(await snapshot(page))
} else if (action === 'prepare') {
  const dose = requireDose(argument)
  const result = await page.evaluate((selectedDose) => {
    window.reset_xr_trial_to_ready?.()
    return window.dispatch_xr_shell_command?.({
      type: 'SET_DOSE',
      dose: selectedDose,
    })
  }, dose)
  requireAccepted(result, 'SET_DOSE')
  const current = await snapshot(page)
  assertReady(current.state, dose)
  print(current)
} else if (action === 'stage-review') {
  const staged = []
  for (const dose of [0, 5, 10]) {
    await page.evaluate((selectedDose) => {
      window.reset_xr_trial_to_ready?.()
      const selected = window.dispatch_xr_shell_command?.({
        type: 'SET_DOSE',
        dose: selectedDose,
      })
      if (selected?.accepted !== true)
        throw new Error(`SET_DOSE ${selectedDose} was rejected`)
      const started = window.dispatch_xr_shell_command?.({
        type: 'START_TRIAL',
      })
      if (started?.accepted !== true)
        throw new Error(`START_TRIAL ${selectedDose} was rejected`)
      window.advanceTime?.(43_000)
    }, dose)
    const current = await snapshot(page)
    if (
      current.state.phase !== 'COMPLETE' ||
      current.state.result?.dose !== dose
    )
      throw new Error(
        `Review staging failed at dose ${dose}: ${JSON.stringify(current.state)}`,
      )
    staged.push({
      dose,
      resultId: current.state.result.id,
      endpointOpticalLoad: current.state.result.endpointOpticalLoad,
    })
  }
  const current = await snapshot(page)
  if (
    current.state.batch07.experimentPointCount < 3 ||
    current.state.batch07.ghostCount !== 3 ||
    ![0, 10].every((dose) =>
      current.state.batch07.canonicalSummaries.some(
        (summary) => summary.dose === dose,
      ),
    )
  )
    throw new Error(
      `Review staging produced incomplete memory: ${JSON.stringify(current.state.batch07)}`,
    )
  print({ staged, current })
} else if (action === 'start') {
  const before = await snapshot(page)
  const result = await page.evaluate(() =>
    window.dispatch_xr_shell_command?.({ type: 'START_TRIAL' }),
  )
  requireAccepted(result, 'START_TRIAL')
  print({ before, after: await snapshot(page) })
} else if (action === 'watch') {
  print(await watchCompletion(page))
} else if (action === 'replay') {
  print(await verifyReplayIndependence(page))
} else if (action === 'clear') {
  const before = await snapshot(page)
  const result = await page.evaluate(() =>
    window.dispatch_xr_shell_command?.({ type: 'CLEAR_EXPERIMENT_LOG' }),
  )
  requireAccepted(result, 'CLEAR_EXPERIMENT_LOG')
  const after = await snapshot(page)
  if (
    after.state.batch07.experimentPointCount !== 0 ||
    after.state.batch07.canonicalSummaries.length !== 0 ||
    after.state.batch07.ghostCount !== before.state.batch07.ghostCount
  ) {
    throw new Error(
      `History clear violated its boundary: ${JSON.stringify({ before, after })}`,
    )
  }
  print({ before, after })
} else if (action === 'refill') {
  const result = await page.evaluate(() =>
    window.dispatch_xr_shell_command?.({ type: 'RESET_TRIAL' }),
  )
  requireAccepted(result, 'RESET_TRIAL')
  await page.waitForFunction(
    () =>
      JSON.parse(window.render_xr_shell_to_text?.() ?? '{}').phase === 'READY',
    undefined,
    { polling: 100, timeout: 5_000 },
  )
  print(await snapshot(page))
} else {
  throw new Error(
    'Use status, restart, stage-review, prepare <dose>, start, watch, replay, clear, or refill',
  )
}

process.exit(0)

async function watchCompletion(targetPage) {
  const initial = await snapshot(targetPage)
  const initialPoints = initial.state.batch07.experimentPointCount
  const initialGhosts = initial.state.batch07.ghostCount
  const deadline = Date.now() + 120_000
  const phases = []
  let lastPhase = initial.state.phase
  while (Date.now() < deadline) {
    const current = await snapshot(targetPage)
    if (current.state.phase !== lastPhase) {
      phases.push({
        phase: current.state.phase,
        simulationTimeSeconds: current.state.simulationTimeSeconds,
        performance: current.performance.metrics,
      })
      lastPhase = current.state.phase
    }
    if (current.state.phase === 'COMPLETE') {
      const memory = current.state.batch07
      if (memory.experimentPointCount !== initialPoints + 1)
        throw new Error(
          'Completion did not append exactly one experiment point',
        )
      if (
        memory.ghostCount !== Math.min(3, initialGhosts + 1) &&
        memory.pendingGhostTrialId === null
      )
        throw new Error(
          'Completion produced neither a saved nor pending treatment ghost',
        )
      if (memory.ghostSerializedBytes <= 0 && memory.ghostCount > 0)
        throw new Error('Saved treatment ghost has no measured serialized size')
      const dose = current.state.result?.dose
      const summary = memory.canonicalSummaries.find(
        (candidate) => candidate.dose === dose,
      )
      if (dose % 2 === 0 && summary?.trialId !== current.state.result.id)
        throw new Error(
          'Canonical completion did not update its matching static jar',
        )
      if (dose % 2 === 1 && summary !== undefined)
        throw new Error('Odd-dose completion updated a canonical jar')
      return { initial, phases, final: current }
    }
    await delay(100)
  }
  throw new Error('Batch 7 trial did not reach COMPLETE within 120 seconds')
}

async function verifyReplayIndependence(targetPage) {
  const before = await snapshot(targetPage)
  const trialId = before.state.batch07.selectedGhostTrialId
  if (trialId === null) throw new Error('No compatible ghost is selected')
  const result = await targetPage.evaluate(
    (selectedTrialId) =>
      window.dispatch_xr_shell_command?.({
        type: 'PLAY_GHOST',
        trialId: selectedTrialId,
      }),
    trialId,
  )
  requireAccepted(result, 'PLAY_GHOST')
  await delay(2_000)
  const after = await snapshot(targetPage)
  if (
    after.state.simulationTimeSeconds !== before.state.simulationTimeSeconds ||
    after.state.resultCount !== before.state.resultCount ||
    after.state.batch07.playback.elapsedSeconds <= 0
  ) {
    throw new Error(
      `Replay mutated or failed to advance independently: ${JSON.stringify({ before, after })}`,
    )
  }
  return { before, after }
}

async function snapshot(targetPage) {
  return targetPage.evaluate(() => ({
    performance: JSON.parse(window.render_performance_to_text?.() ?? '{}'),
    state: JSON.parse(window.render_xr_shell_to_text?.() ?? '{}'),
    visibilityState: document.visibilityState,
  }))
}

async function trustedClick(targetPage, locator) {
  const bounds = await locator.boundingBox()
  if (bounds === null) throw new Error('Enter VR button has no bounds')
  const session = await targetPage.context().newCDPSession(targetPage)
  const x = bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  await session.send('Input.dispatchMouseEvent', {
    button: 'left',
    buttons: 1,
    clickCount: 1,
    type: 'mousePressed',
    x,
    y,
  })
  await session.send('Input.dispatchMouseEvent', {
    button: 'left',
    buttons: 0,
    clickCount: 1,
    type: 'mouseReleased',
    x,
    y,
  })
}

function assertReady(state, dose) {
  if (
    state.phase !== 'READY' ||
    state.dose !== dose ||
    state.simulationTimeSeconds !== 0 ||
    state.activeParticles !== 500
  )
    throw new Error(`Malformed READY state: ${JSON.stringify(state)}`)
}

function requireAccepted(result, command) {
  if (result?.accepted !== true)
    throw new Error(`${command} was rejected: ${JSON.stringify(result)}`)
}

function requireDose(input) {
  const dose = Number(input)
  if (!Number.isInteger(dose) || dose < 0 || dose > 10)
    throw new RangeError('Dose must be an integer from 0 through 10')
  return dose
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}
