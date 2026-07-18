import { chromium } from 'playwright'

const CDP_URL = 'http://127.0.0.1:9222'
const TARGET_URL =
  'http://127.0.0.1:5173/?mode=xr-shell&posture=seated&calibration=off'
const EXPECTED_PHASES = [
  'RAPID_MIX',
  'FLOCCULATION',
  'SETTLING',
  'MEASURING',
  'COMPLETE',
]
const action = process.argv[2] ?? 'status'
const doseArgument = process.argv[3]

const browser = await chromium.connectOverCDP(CDP_URL)
const pages = browser.contexts().flatMap((context) => context.pages())
const seatedPage = pages.find((candidate) =>
  candidate.url().includes('mode=xr-shell&posture=seated&calibration=off'),
)
const page =
  seatedPage ??
  (action === 'restart'
    ? (pages.find((candidate) =>
        candidate.url().startsWith('http://127.0.0.1:5173/'),
      ) ??
      pages.find((candidate) => candidate.url().startsWith('chrome-error://')))
    : undefined)

if (page === undefined) {
  throw new Error(
    `Quest Browser does not have ${TARGET_URL} open; CDP exposed ${pages
      .map((candidate) => candidate.url())
      .join(', ')}`,
  )
}

if (action === 'status') {
  print(await readSnapshot(page))
} else if (action === 'restart') {
  for (const candidate of pages) {
    if (candidate !== page && candidate.url().includes('mode=xr-shell')) {
      await candidate.close().catch(() => undefined)
    }
  }
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
  print(await readSnapshot(page))
} else if (action === 'prepare') {
  const dose = requireDose(doseArgument)
  await resetAndSetDose(page, dose)
  const snapshot = await readSnapshot(page)
  assertReady(snapshot.state, dose)
  print(snapshot)
} else if (action === 'start') {
  const result = await page.evaluate(() =>
    window.dispatch_xr_shell_command?.({ type: 'START_TRIAL' }),
  )
  if (result?.accepted !== true) {
    throw new Error(`START_TRIAL was rejected: ${JSON.stringify(result)}`)
  }
  print(await readSnapshot(page))
} else if (action === 'watch') {
  print(await watchTrial(page))
} else if (action === 'refill') {
  print(await runRefill(page))
} else {
  throw new Error(
    `Unknown action ${action}; use status, restart, prepare, start, watch, or refill`,
  )
}

// This is a development-only CDP client. Exit without closing the remotely
// owned Quest Browser process after the synchronous report has been written.
process.exit(0)

async function resetAndSetDose(targetPage, dose) {
  const result = await targetPage.evaluate((selectedDose) => {
    if (
      window.reset_xr_trial_to_ready === undefined ||
      window.dispatch_xr_shell_command === undefined
    ) {
      throw new Error('Batch 06 development controls are unavailable')
    }
    window.reset_xr_trial_to_ready()
    return window.dispatch_xr_shell_command({
      type: 'SET_DOSE',
      dose: selectedDose,
    })
  }, dose)
  if (result.accepted !== true) {
    throw new Error(`SET_DOSE was rejected: ${JSON.stringify(result)}`)
  }
}

async function trustedClick(targetPage, locator) {
  const bounds = await locator.boundingBox()
  if (bounds === null) throw new Error('Enter VR button has no screen bounds')
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

async function watchTrial(targetPage) {
  const deadline = Date.now() + 120_000
  const samples = []
  let trialStarted = false
  let lastPhase = null
  let resultCountAtStart = null

  while (Date.now() < deadline) {
    const snapshot = await readSnapshot(targetPage)
    const { state } = snapshot
    if (state.phase !== 'READY') {
      if (!trialStarted) resultCountAtStart = state.resultCount
      trialStarted = true
    }
    if (trialStarted && state.phase !== lastPhase) {
      samples.push(snapshot)
      lastPhase = state.phase
    }
    if (state.phase === 'COMPLETE') {
      const phases = samples.map((sample) => sample.state.phase)
      assertPhaseSequence(phases)
      assertComplete(state, resultCountAtStart + 1)
      return { final: snapshot, phases, samples }
    }
    await delay(100)
  }

  throw new Error(
    trialStarted
      ? 'The observed trial did not reach COMPLETE within 120 seconds'
      : 'No physical or remote START_TRIAL arrived within 120 seconds',
  )
}

async function runRefill(targetPage) {
  const before = await readSnapshot(targetPage)
  assertComplete(before.state)
  const result = await targetPage.evaluate(() =>
    window.dispatch_xr_shell_command?.({ type: 'RESET_TRIAL' }),
  )
  if (result?.accepted !== true) {
    throw new Error(`RESET_TRIAL was rejected: ${JSON.stringify(result)}`)
  }
  const refilling = await readSnapshot(targetPage)
  if (refilling.state.phase !== 'REFILLING') {
    throw new Error(`Expected REFILLING, received ${refilling.state.phase}`)
  }
  await targetPage.waitForFunction(
    () =>
      JSON.parse(window.render_xr_shell_to_text?.() ?? '{}').phase === 'READY',
    undefined,
    { polling: 100, timeout: 5_000 },
  )
  const ready = await readSnapshot(targetPage)
  assertReady(ready.state, before.state.selectedDose ?? before.state.dose)
  return { before, refilling, ready }
}

function assertPhaseSequence(phases) {
  if (JSON.stringify(phases) !== JSON.stringify(EXPECTED_PHASES)) {
    throw new Error(
      `Expected phase sequence ${EXPECTED_PHASES.join(' -> ')}, received ${phases.join(' -> ')}`,
    )
  }
}

function assertComplete(state, expectedResultCount) {
  const validResultCount =
    expectedResultCount === undefined
      ? Number.isInteger(state.resultCount) && state.resultCount >= 1
      : state.resultCount === expectedResultCount
  if (
    state.phase !== 'COMPLETE' ||
    state.simulationTimeSeconds !== 43 ||
    !validResultCount ||
    state.result?.schemaVersion !== 1 ||
    state.result?.completedAtSimulationTime !== 43 ||
    state.presentationOpticalSource !== 'trial-result' ||
    state.controlAvailability?.refillEnabled !== true
  ) {
    throw new Error(`Malformed COMPLETE state: ${JSON.stringify(state)}`)
  }
}

function assertReady(state, dose) {
  const observedDose = state.selectedDose ?? state.dose
  if (
    state.phase !== 'READY' ||
    observedDose !== dose ||
    state.simulationTimeSeconds !== 0 ||
    state.activeParticles !== 500 ||
    state.result !== null ||
    state.presentationOpticalSource !== 'live-runtime' ||
    state.controlAvailability?.doseEnabled !== true ||
    state.controlAvailability?.startEnabled !== true
  ) {
    throw new Error(`Malformed READY state: ${JSON.stringify(state)}`)
  }
}

async function readSnapshot(targetPage) {
  return targetPage.evaluate(() => ({
    performance: JSON.parse(window.render_performance_to_text?.() ?? '{}'),
    state: JSON.parse(window.render_xr_shell_to_text?.() ?? '{}'),
    visibilityState: document.visibilityState,
  }))
}

function requireDose(value) {
  const dose = Number(value)
  if (!Number.isInteger(dose) || dose < 0 || dose > 10) {
    throw new RangeError('Dose must be an integer from 0 through 10')
  }
  return dose
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}
