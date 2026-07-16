import { useCallback, useEffect, useRef, useState } from 'react'

import { FoundationScene } from '../render/FoundationScene'
import {
  clearingFrontDiagnostics,
  endpointOpticalLoad,
  type DoseDetent,
} from '../sim'
import { xrStore } from '../xr/store'
import {
  ControllerPreflight,
  type XrPreflightEvent,
} from '../xr/ControllerPreflight'
import { MetricsOverlay } from './MetricsOverlay'
import { developmentPerformance } from './performance'
import { SimulationDriver } from './SimulationDriver'
import { SimulationRuntime } from './SimulationRuntime'

declare global {
  interface Window {
    render_game_to_text?: () => string
    advanceTime?: (milliseconds: number) => void
    render_xr_preflight_to_text?: () => string
  }
}

interface XrPreflightSnapshot {
  sessionActive: boolean
  leftControllerDetected: boolean
  rightControllerDetected: boolean
  leftSelectCount: number
  rightSelectCount: number
  targetSelectCount: number
}

const COMPARISON_PRESETS: ReadonlyArray<{
  readonly dose: DoseDetent
  readonly label: string
}> = [
  { dose: 0, label: 'Underdose 0' },
  { dose: 5, label: 'Optimum 5' },
  { dose: 10, label: 'Overdose 10' },
]

function recordParticleFrame(
  frameMs: number,
  instanceSyncMs: number,
  activeParticles: number,
  drawCalls: number,
): void {
  developmentPerformance.recordRenderFrame(
    frameMs,
    instanceSyncMs,
    activeParticles,
    drawCalls,
  )
}

export function App() {
  const urlParameters = new URLSearchParams(window.location.search)
  const presentationMode = urlParameters.get('mode') === 'proof'
  const reviewCaptureMode = urlParameters.get('capture') === 'review'
  const [entryError, setEntryError] = useState<string | null>(null)
  const [selectedDose, setSelectedDose] = useState<DoseDetent>(5)
  const [trialRunning, setTrialRunning] = useState(true)
  const xrPreflightRef = useRef<XrPreflightSnapshot>({
    sessionActive: false,
    leftControllerDetected: false,
    rightControllerDetected: false,
    leftSelectCount: 0,
    rightSelectCount: 0,
    targetSelectCount: 0,
  })
  const runtimeRef = useRef<SimulationRuntime | null>(null)
  if (runtimeRef.current === null) runtimeRef.current = new SimulationRuntime()
  const runtime = runtimeRef.current

  const recordXrPreflightEvent = useCallback(
    (event: XrPreflightEvent): void => {
      const snapshot = xrPreflightRef.current
      switch (event.type) {
        case 'session':
          snapshot.sessionActive = event.active
          break
        case 'controller':
          if (event.handedness === 'left')
            snapshot.leftControllerDetected = event.detected
          else snapshot.rightControllerDetected = event.detected
          break
        case 'select':
          if (event.handedness === 'left') snapshot.leftSelectCount += 1
          else snapshot.rightSelectCount += 1
          break
        case 'target-select':
          snapshot.targetSelectCount += 1
          break
      }
    },
    [],
  )

  useEffect(() => {
    runtime.start()
    return () => runtime.pause()
  }, [runtime])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.render_game_to_text = () => {
      const clearing = clearingFrontDiagnostics(runtime.opticalLoadBands)
      const population = runtime.populationDiagnostics
      return JSON.stringify({
        coordinateSystem: 'meters; origin tank center-bottom; +Y upward',
        mode: 'phenomenon-trial',
        running: runtime.isRunning,
        dose: runtime.dose,
        phase: runtime.phase,
        simulationTimeSeconds: runtime.simulationTimeSeconds,
        activeParticles: runtime.state.activeCount,
        suspendedAggregates: population.suspendedAggregateCount,
        settledAggregates: population.settledAggregateCount,
        meanAggregateMass: population.meanAggregateMass,
        maximumAggregateMass: population.maximumAggregateMass,
        maximumAggregateDiameter: population.maximumAggregateDiameter,
        largestAggregateMassFraction: population.largestAggregateMassFraction,
        minimumVisibleSuspendedAggregatesDuringSettling:
          population.minimumVisibleSuspendedAggregatesDuringSettling,
        endpointOpticalLoad: endpointOpticalLoad(runtime.opticalLoadBands),
        globalRelativeOpticalLoad: runtime.opticalLoadBands.globalRelativeLoad,
        topClearFraction: clearing.topClearFraction,
        clearingFrontDepth: clearing.clearingFrontDepth,
        upperZoneOpticalLoad: clearing.upperZoneOpticalLoad,
        clarityReachedAtSimulationTime: runtime.clarityReachedAtSimulationTime,
      })
    }
    window.advanceTime = (milliseconds) => {
      if (!Number.isFinite(milliseconds) || milliseconds < 0)
        throw new RangeError('Advance time must be finite and non-negative')
      runtime.pause()
      setTrialRunning(false)
      runtime.stepHeadless(Math.round(milliseconds / (1000 / 60)))
    }
    window.render_xr_preflight_to_text = () =>
      JSON.stringify(xrPreflightRef.current)
    return () => {
      delete window.render_game_to_text
      delete window.advanceTime
      delete window.render_xr_preflight_to_text
    }
  }, [runtime])

  function runComparisonPreset(dose: DoseDetent): void {
    runtime.reset(undefined, dose)
    runtime.start()
    setTrialRunning(true)
    setSelectedDose(dose)
  }

  function startTrial(): void {
    runtime.start()
    setTrialRunning(true)
  }

  function stopTrial(): void {
    runtime.pause()
    setTrialRunning(false)
  }

  function resetTrial(): void {
    runtime.reset(undefined, selectedDose)
    setTrialRunning(false)
  }

  async function enterVr() {
    setEntryError(null)
    try {
      const session = await xrStore.enterVR()
      if (session === undefined)
        setEntryError('Immersive VR is not available in this browser.')
    } catch (error) {
      setEntryError(
        error instanceof Error
          ? error.message
          : 'Immersive VR entry was rejected.',
      )
    }
  }

  return (
    <main className="app-shell">
      {presentationMode ? null : (
        <div className="app-heading">
          <h1>Sunol FlowLab VR</h1>
          <p>Deterministic desktop coagulation phenomenon proof</p>
          <button className="enter-vr" type="button" onClick={enterVr}>
            Enter VR
          </button>
          <p className="emulator-note">
            Chrome on localhost uses the Quest 3 development emulator.
          </p>
          {entryError === null ? null : <p role="alert">{entryError}</p>}
        </div>
      )}
      {import.meta.env.DEV && !presentationMode ? (
        <nav className="comparison-controls" aria-label="Comparison presets">
          <span>Same raw water · relative dose</span>
          <div className={'preset-buttons'}>
            {COMPARISON_PRESETS.map(({ dose, label }) => (
              <button
                key={dose}
                id={`preset-${dose}`}
                type="button"
                aria-pressed={selectedDose === dose}
                onClick={() => runComparisonPreset(dose)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={'simulation-review-row'}>
            <span role={'status'} aria-live={'polite'}>
              {trialRunning ? 'Trial running' : 'Trial stopped'}
            </span>
            <div
              className={'simulation-controls'}
              role={'group'}
              aria-label={'Simulation playback'}
            >
              <button
                id={'trial-start'}
                type={'button'}
                disabled={trialRunning}
                onClick={startTrial}
              >
                Start
              </button>
              <button
                id={'trial-stop'}
                type={'button'}
                disabled={!trialRunning}
                onClick={stopTrial}
              >
                Stop
              </button>
              <button id={'trial-reset'} type={'button'} onClick={resetTrial}>
                Reset
              </button>
            </div>
          </div>
        </nav>
      ) : null}
      {import.meta.env.DEV && !presentationMode ? <MetricsOverlay /> : null}
      <FoundationScene
        animateParticleTransitions={!reviewCaptureMode}
        particleState={runtime.state}
        opticalLoadBands={runtime.opticalLoadBands}
        preserveDrawingBuffer={reviewCaptureMode}
        recordParticleFrame={recordParticleFrame}
      >
        <SimulationDriver runtime={runtime} />
        {import.meta.env.DEV ? (
          <ControllerPreflight recordEvent={recordXrPreflightEvent} />
        ) : null}
      </FoundationScene>
    </main>
  )
}
