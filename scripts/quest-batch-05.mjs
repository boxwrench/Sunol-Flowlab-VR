import { chromium } from 'playwright'

const CDP_URL = 'http://127.0.0.1:9222'
const TARGET_URL =
  'http://127.0.0.1:5173/?mode=xr-shell&posture=seated&calibration=off'
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
  print(await readSnapshot(page))
} else if (action === 'start') {
  const result = await page.evaluate(() =>
    window.dispatch_xr_shell_command?.({ type: 'START_TRIAL' }),
  )
  if (result?.accepted !== true) {
    throw new Error(`START_TRIAL was rejected: ${JSON.stringify(result)}`)
  }
  print(await readSnapshot(page))
} else if (action === 'instant') {
  const dose = requireDose(doseArgument)
  await resetAndSetDose(page, dose)
  const result = await page.evaluate(() =>
    window.dispatch_xr_shell_command?.({ type: 'START_TRIAL' }),
  )
  if (result?.accepted !== true) {
    throw new Error(`START_TRIAL was rejected: ${JSON.stringify(result)}`)
  }
  await page.evaluate(() => window.advanceTime?.(43_000))
  await waitForRenderedState(page, 43)
  print(await readSnapshot(page))
} else if (action === 'watch') {
  print(await watchTrial(page))
} else {
  throw new Error(
    `Unknown action ${action}; use status, restart, prepare, start, instant, or watch`,
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
      throw new Error('Batch 05 development controls are unavailable')
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
  const deadline = Date.now() + 90_000
  const samples = []
  let trialStarted = false
  let lastPhase = null

  while (Date.now() < deadline) {
    const snapshot = await readSnapshot(targetPage)
    const { state } = snapshot
    if (state.running === true || state.simulationTimeSeconds > 0) {
      trialStarted = true
    }
    if (trialStarted && state.phase !== lastPhase) {
      samples.push(snapshot)
      lastPhase = state.phase
    }
    if (trialStarted && state.simulationTimeSeconds >= 43) {
      await waitForRenderedState(targetPage, 43)
      return { final: await readSnapshot(targetPage), samples }
    }
    await delay(250)
  }

  throw new Error(
    trialStarted
      ? 'The observed trial did not reach 43 seconds'
      : 'No physical or remote START_TRIAL arrived within 90 seconds',
  )
}

async function waitForRenderedState(targetPage, minimumTimeSeconds) {
  await targetPage.waitForFunction(
    (minimumTime) => {
      const state = JSON.parse(window.render_xr_shell_to_text?.() ?? '{}')
      const performance = JSON.parse(
        window.render_performance_to_text?.() ?? '{}',
      )
      return (
        state.simulationTimeSeconds >= minimumTime &&
        performance.metrics?.activeParticles === state.activeParticles
      )
    },
    minimumTimeSeconds,
    { timeout: 10_000 },
  )
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
