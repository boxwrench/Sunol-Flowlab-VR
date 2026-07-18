import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
import { SimulationRuntime } from './SimulationRuntime'
import {
  DEFAULT_TREATMENT_CYCLE_CONFIG,
  TreatmentCycleController,
} from './TreatmentCycle'
import { TreatmentCycleDriver } from './TreatmentCycleDriver'
import { XrShellApp } from './XrShellApp'

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
  const mode = new URLSearchParams(window.location.search).get('mode')
  return mode === 'xr-shell' ? <XrShellApp /> : <PhenomenonApp />
}

function PhenomenonApp() {
  const urlParameters = new URLSearchParams(window.location.search)
  const presentationMode = urlParameters.get('mode') === 'proof'
  const reviewCaptureMode = urlParameters.get('capture') === 'review'
  const [entryError, setEntryError] = useState<string | null>(null)
  const [, setStatusRevision] = useState(0)
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
  const cycleRef = useRef<TreatmentCycleController | null>(null)
  if (cycleRef.current === null) {
    cycleRef.current = new TreatmentCycleController(
      runtime,
      5,
      DEFAULT_TREATMENT_CYCLE_CONFIG,
      () => setStatusRevision((revision) => revision + 1),
    )
  }
  const cycle = cycleRef.current
  const completedOpticalLoadBands = useMemo(
    () =>
      cycle.result === null
        ? null
        : Object.freeze({ values: cycle.result.bandSnapshot }),
    [cycle.result],
  )
  const presentationOpticalLoadBands =
    completedOpticalLoadBands ?? runtime.opticalLoadBands
  const presentationEndpointOpticalLoad =
    cycle.result?.endpointOpticalLoad ??
    endpointOpticalLoad(runtime.opticalLoadBands)

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
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden')
        cycle.interrupt('document hidden')
      else cycle.resumeAfterInterruption()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      cycle.interrupt('app unmounted')
    }
  }, [cycle])

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
        selectedDose: cycle.selectedDose,
        phase: cycle.phase,
        simulationPhase: runtime.phase,
        interrupted: cycle.isInterrupted,
        controlAvailability: cycle.controlAvailability,
        refillElapsedSeconds: cycle.refillElapsedSeconds,
        presentationEpoch: cycle.presentationEpoch,
        resultCount: cycle.resultCount,
        result: cycle.result,
        presentationOpticalSource:
          cycle.result === null ? 'live-runtime' : 'trial-result',
        lastFailure: cycle.lastFailure,
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
        endpointOpticalLoad:
          cycle.result?.endpointOpticalLoad ??
          endpointOpticalLoad(runtime.opticalLoadBands),
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
      if (cycle.phase === 'REFILLING') cycle.advance(milliseconds / 1000)
      else cycle.advanceHeadless(Math.round(milliseconds / (1000 / 60)))
    }
    window.render_xr_preflight_to_text = () =>
      JSON.stringify(xrPreflightRef.current)
    return () => {
      delete window.render_game_to_text
      delete window.advanceTime
      delete window.render_xr_preflight_to_text
    }
  }, [cycle, runtime])

  function runComparisonPreset(dose: DoseDetent): void {
    cycle.forceResetDevOnly()
    cycle.dispatchCommand({ type: 'SET_DOSE', dose })
    cycle.dispatchCommand({ type: 'START_TRIAL' })
  }

  function startTrial(): void {
    cycle.dispatchCommand({ type: 'START_TRIAL' })
  }

  function requestRefill(): void {
    cycle.dispatchCommand({ type: 'RESET_TRIAL' })
  }

  function forceResetTrial(): void {
    cycle.forceResetDevOnly()
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
          <p>Deterministic treatment-cycle proof</p>
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
                aria-pressed={cycle.selectedDose === dose}
                onClick={() => runComparisonPreset(dose)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={'simulation-review-row'}>
            <span role={'status'} aria-live={'polite'}>
              Phase {cycle.phase} · Dose {cycle.selectedDose}
            </span>
            <div
              className={'simulation-controls'}
              role={'group'}
              aria-label={'Treatment cycle controls'}
            >
              <button
                id={'trial-start'}
                type={'button'}
                disabled={!cycle.controlAvailability.startEnabled}
                onClick={startTrial}
              >
                Start
              </button>
              <button
                id={'trial-refill'}
                type={'button'}
                disabled={!cycle.controlAvailability.refillEnabled}
                onClick={requestRefill}
              >
                Refill
              </button>
              <button
                id={'trial-reset'}
                type={'button'}
                onClick={forceResetTrial}
              >
                Force Reset
              </button>
            </div>
          </div>
        </nav>
      ) : null}
      {import.meta.env.DEV && !presentationMode ? <MetricsOverlay /> : null}
      <FoundationScene
        animateParticleTransitions={!reviewCaptureMode}
        measurementPhase={
          cycle.phase === 'MEASURING'
            ? 'measuring'
            : cycle.phase === 'COMPLETE'
              ? 'complete'
              : cycle.phase === 'REFILLING'
                ? 'refilling'
                : 'idle'
        }
        measurementRelativeOpticalLoad={presentationEndpointOpticalLoad}
        particleState={runtime.state}
        opticalLoadBands={presentationOpticalLoadBands}
        preserveDrawingBuffer={reviewCaptureMode}
        presentationEpoch={cycle.presentationEpoch}
        recordParticleFrame={recordParticleFrame}
      >
        <TreatmentCycleDriver cycle={cycle} />
        {import.meta.env.DEV ? (
          <ControllerPreflight recordEvent={recordXrPreflightEvent} />
        ) : null}
      </FoundationScene>
    </main>
  )
}
