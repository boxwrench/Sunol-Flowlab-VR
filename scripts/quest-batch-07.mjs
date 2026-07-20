import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const CDP_URL = 'http://127.0.0.1:9222'
const TARGET_URL =
  'http://127.0.0.1:5173/?mode=xr-shell&posture=seated&calibration=off'
const action = process.argv[2] ?? 'status'
const argument = process.argv[3]
const frameBudgetMs = 1_000 / 72
const combinedReportPath = path.resolve(
  'test-results/quest-batch-08-combined-latest.json',
)
const controlsReportPath = path.resolve(
  'test-results/quest-batch-08-controls-latest.json',
)
let exitCode = 0

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
  const panorama = argument === 'sunol' ? 'sunol' : 'hetchy'
  const requestedSound = process.argv[4]
  const sound =
    requestedSound === 'quiet' || requestedSound === 'warm'
      ? requestedSound
      : 'classic'
  await page.goto(`${TARGET_URL}&panorama=${panorama}&sound=${sound}`, {
    waitUntil: 'domcontentloaded',
  })
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
  for (const dose of [0, 2, 4, 5, 6, 8, 10]) {
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
} else if (action === 'review-ready') {
  print(await prepareCombinedReview(page))
} else if (action === 'start') {
  const before = await snapshot(page)
  const result = await page.evaluate(() =>
    window.dispatch_xr_shell_command?.({ type: 'START_TRIAL' }),
  )
  requireAccepted(result, 'START_TRIAL')
  print({ before, after: await snapshot(page) })
} else if (action === 'watch') {
  print(await watchCompletion(page))
} else if (action === 'watch-combined') {
  const report = await watchCombinedCompletion(page)
  await writeReport(combinedReportPath, report)
  if (!report.technicalPass) exitCode = 1
  print({ reportPath: combinedReportPath, ...report })
} else if (action === 'watch-controls') {
  const report = await watchCombinedControls(page)
  await writeReport(controlsReportPath, report)
  if (!report.technicalPass) exitCode = 1
  print({ reportPath: controlsReportPath, ...report })
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
    'Use status, restart [hetchy|sunol] [classic|quiet|warm], stage-review, review-ready, prepare <dose>, start, watch, watch-combined, watch-controls, replay, clear, or refill',
  )
}

process.exit(exitCode)

async function prepareCombinedReview(targetPage) {
  const staged = []
  let current = await snapshot(targetPage)
  for (const dose of [0, 2, 4, 5, 6, 8, 10]) {
    const alreadyPlotted = current.state.batch07.plottedResults.some(
      (point) => point.dose === dose,
    )
    if (alreadyPlotted) continue
    staged.push(await completeInstantTrial(targetPage, dose))
    current = await snapshot(targetPage)
  }
  if (current.state.batch07.ghostCount === 0)
    staged.push(await completeInstantTrial(targetPage, 5))

  const prepared = await targetPage.evaluate(() => {
    window.reset_xr_trial_to_ready?.()
    const selectedDose = window.dispatch_xr_shell_command?.({
      type: 'SET_DOSE',
      dose: 5,
    })
    const state = JSON.parse(window.render_xr_shell_to_text?.() ?? '{}')
    const trialId = state.batch07?.selectedGhostTrialId
    if (selectedDose?.accepted !== true || typeof trialId !== 'string')
      return { selectedDose, trialId }
    const played = window.dispatch_xr_shell_command?.({
      type: 'PLAY_GHOST',
      trialId,
    })
    window.advanceTime?.(1_000)
    const paused = window.dispatch_xr_shell_command?.({ type: 'PAUSE_GHOST' })
    const sought = window.dispatch_xr_shell_command?.({
      type: 'SEEK_GHOST',
      elapsedSeconds: 35,
    })
    return { selectedDose, trialId, played, paused, sought }
  })
  for (const [command, result] of [
    ['SET_DOSE', prepared.selectedDose],
    ['PLAY_GHOST', prepared.played],
    ['PAUSE_GHOST', prepared.paused],
    ['SEEK_GHOST', prepared.sought],
  ])
    requireAccepted(result, command)

  current = await snapshot(targetPage)
  assertReady(current.state, 5)
  const availableDoses = new Set(
    current.state.batch07.plottedResults.map((point) => point.dose),
  )
  if (![0, 2, 4, 5, 6, 8, 10].every((dose) => availableDoses.has(dose)))
    throw new Error('Combined review memory is missing a canonical dose')
  if (
    current.state.batch07.playback.status !== 'paused' ||
    Math.abs(current.state.batch07.playback.elapsedSeconds - 35) > 0.01 ||
    current.state.batch08.ghostComparison.status !== 'paused'
  )
    throw new Error(
      `Combined comparison was not parked at 35 seconds: ${JSON.stringify(current.state.batch07.playback)}`,
    )
  return {
    staged,
    checklist: [
      'Read the mounted phase, dose, score, plot, and replay instruments without prompting.',
      'Compare the live gauge with the labeled cyan past-run needle.',
      'Confirm all six canonical jars show a readable cloudiness spectrum.',
      'Use physical controls to start the live dose-5 trial.',
      'After completion, exercise replay play/pause/reset, refill, and clear.',
    ],
    current,
  }
}

async function completeInstantTrial(targetPage, dose) {
  const state = await targetPage.evaluate((selectedDose) => {
    window.reset_xr_trial_to_ready?.()
    const selected = window.dispatch_xr_shell_command?.({
      type: 'SET_DOSE',
      dose: selectedDose,
    })
    const started = window.dispatch_xr_shell_command?.({ type: 'START_TRIAL' })
    if (selected?.accepted !== true || started?.accepted !== true)
      return { selected, started }
    window.advanceTime?.(43_000)
    return JSON.parse(window.render_xr_shell_to_text?.() ?? '{}')
  }, dose)
  if (state.phase !== 'COMPLETE' || state.result?.dose !== dose)
    throw new Error(
      `Instant review staging failed at dose ${dose}: ${JSON.stringify(state)}`,
    )
  return {
    dose,
    resultId: state.result.id,
    endpointOpticalLoad: state.result.endpointOpticalLoad,
  }
}

async function watchCombinedCompletion(targetPage) {
  const initial = await snapshot(targetPage)
  assertReady(initial.state, 5)
  const initialPoints = initial.state.batch07.experimentPointCount
  const initialGhosts = initial.state.batch07.ghostCount
  const phases = []
  const samplesByPhase = new Map()
  let lastPhase = initial.state.phase
  const deadline = Date.now() + 300_000

  while (Date.now() < deadline) {
    const current = await snapshot(targetPage)
    addPerformanceSample(samplesByPhase, current)
    if (current.state.phase !== lastPhase) {
      phases.push({
        phase: current.state.phase,
        simulationTimeSeconds: current.state.simulationTimeSeconds,
      })
      lastPhase = current.state.phase
    }
    if (current.state.phase === 'COMPLETE') {
      const observedPhases = phases.map((entry) => entry.phase)
      const expectedPhases = [
        'RAPID_MIX',
        'FLOCCULATION',
        'SETTLING',
        'MEASURING',
        'COMPLETE',
      ]
      if (JSON.stringify(observedPhases) !== JSON.stringify(expectedPhases))
        throw new Error(
          `Unexpected physical phase sequence: ${JSON.stringify(observedPhases)}`,
        )
      const resultId = current.state.result?.id
      const pointAppended =
        current.state.batch07.experimentPointCount === initialPoints + 1
      const idempotentRepeat =
        current.state.batch07.experimentPointCount === initialPoints &&
        typeof resultId === 'string' &&
        initial.state.batch07.plottedResults.some(
          (point) => point.trialId === resultId,
        )
      if (!pointAppended && !idempotentRepeat)
        throw new Error(
          'Combined run produced neither one new plot point nor an idempotent restored result',
        )
      const ghostRecorded =
        initialGhosts < 3
          ? current.state.batch07.ghostCount === initialGhosts + 1
          : current.state.batch07.pendingGhostTrialId !== null
      if (!ghostRecorded && !idempotentRepeat)
        throw new Error('Combined run produced no saved or pending replay')
      const performance = summarizePerformance(samplesByPhase)
      const alerts = []
      for (const phase of expectedPhases.slice(0, -1))
        if (!performance.some((entry) => entry.phase === phase))
          alerts.push(`${phase}: no rolling performance samples captured`)
      for (const phase of performance) {
        if (phase.minimumAverageFps < 72)
          alerts.push(
            `${phase.phase}: rolling average fell below 72 fps (${phase.minimumAverageFps.toFixed(1)})`,
          )
        if (phase.maximumP95FrameMs > frameBudgetMs)
          alerts.push(
            `${phase.phase}: rolling p95 exceeded ${frameBudgetMs.toFixed(2)} ms (${phase.maximumP95FrameMs.toFixed(2)} ms)`,
          )
      }
      const controllersDetected =
        current.state.leftControllerDetected === true &&
        current.state.rightControllerDetected === true
      if (!controllersDetected)
        alerts.push('Both controllers were not detected')
      return {
        kind: 'combined-batch-07-08-trial',
        capturedAt: new Date().toISOString(),
        target: 'Quest 2-class, seated',
        technicalPass: alerts.length === 0,
        alerts,
        controllersDetected,
        memoryDisposition: pointAppended ? 'appended' : 'idempotent-repeat',
        phases,
        performance,
        initial: summarizeSnapshot(initial),
        final: summarizeSnapshot(current),
        humanVerdict:
          'Record the operator verdict in docs/UX_VALIDATION.md; this report is technical evidence only.',
      }
    }
    await delay(100)
  }
  throw new Error(
    'Combined physical trial did not complete within five minutes',
  )
}

async function watchCombinedControls(targetPage) {
  const initial = await snapshot(targetPage)
  if (initial.state.phase !== 'COMPLETE')
    throw new Error('Run watch-controls from the completed trial state')
  const initialGhosts = initial.state.batch07.ghostCount
  const required = new Set([
    'SELECT_GHOST',
    'PLAY_GHOST',
    'PAUSE_GHOST',
    'RESET_GHOST',
    'DELETE_GHOST',
    'RESET_TRIAL',
    'CLEAR_EXPERIMENT_LOG',
  ])
  if (initial.state.batch07.pendingGhostTrialId !== null)
    required.add('REPLACE_OLDEST_GHOST')
  const observed = []
  let commandCount = initial.state.commandCount
  const deadline = Date.now() + 300_000

  while (Date.now() < deadline) {
    const current = await snapshot(targetPage)
    if (current.state.commandCount !== commandCount) {
      commandCount = current.state.commandCount
      const type = current.state.lastCommand?.type
      if (typeof type === 'string') {
        observed.push({
          type,
          phase: current.state.phase,
          experimentPointCount: current.state.batch07.experimentPointCount,
          ghostCount: current.state.batch07.ghostCount,
          pendingGhostTrialId: current.state.batch07.pendingGhostTrialId,
        })
        required.delete(type)
      }
    }
    const finished =
      required.size === 0 &&
      current.state.phase === 'READY' &&
      current.state.batch07.experimentPointCount === 0
    if (finished) {
      const alerts = []
      if (current.state.batch07.canonicalSummaries.length !== 0)
        alerts.push('Clear left one or more canonical jar summaries')
      if (current.state.batch07.ghostCount !== Math.max(0, initialGhosts - 1))
        alerts.push('Ghost deletion/replacement produced an unexpected count')
      return {
        kind: 'combined-batch-07-08-controls',
        capturedAt: new Date().toISOString(),
        technicalPass: alerts.length === 0,
        alerts,
        observed,
        initial: summarizeSnapshot(initial),
        final: summarizeSnapshot(current),
        humanVerdict:
          'Record whether the physical controls and labels were understandable without prompting.',
      }
    }
    await delay(100)
  }
  throw new Error(
    `Physical control review timed out; still required: ${[...required].join(', ')}`,
  )
}

function addPerformanceSample(samplesByPhase, current) {
  const metrics = current.performance.metrics
  if (
    metrics === undefined ||
    metrics.sampleCount === 0 ||
    current.state.phase === 'READY'
  )
    return
  const samples = samplesByPhase.get(current.state.phase) ?? []
  samples.push({
    averageFps: metrics.averageFps,
    p95FrameMs: metrics.p95FrameMs,
  })
  samplesByPhase.set(current.state.phase, samples)
}

function summarizePerformance(samplesByPhase) {
  return [...samplesByPhase].map(([phase, samples]) => ({
    phase,
    sampleCount: samples.length,
    minimumAverageFps: Math.min(...samples.map((sample) => sample.averageFps)),
    maximumP95FrameMs: Math.max(...samples.map((sample) => sample.p95FrameMs)),
  }))
}

function summarizeSnapshot(value) {
  return {
    phase: value.state.phase,
    dose: value.state.dose,
    simulationTimeSeconds: value.state.simulationTimeSeconds,
    resultId: value.state.result?.id ?? null,
    experimentPointCount: value.state.batch07.experimentPointCount,
    ghostCount: value.state.batch07.ghostCount,
    pendingGhostTrialId: value.state.batch07.pendingGhostTrialId,
    playback: value.state.batch07.playback,
    ghostComparison: value.state.batch08.ghostComparison,
    commandCount: value.state.commandCount,
    rejectedCommandCount: value.state.rejectedCommandCount,
  }
}

async function writeReport(reportPath, report) {
  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
}

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
