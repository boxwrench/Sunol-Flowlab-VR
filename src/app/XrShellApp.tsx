import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { XrShellScene } from '../render/XrShellScene'
import { PhysicalInstrumentation } from '../render/PhysicalInstrumentation'
import { endpointOpticalLoad } from '../sim'
import { DoseLever } from '../xr/DoseLever'
import type {
  DetentControlState,
  StartButtonState,
} from '../xr/interactionState'
import { requireXrShellPosture } from '../xr/layout'
import { StartButton } from '../xr/StartButton'
import {
  XrShellInputMonitor,
  type XrShellInputSnapshot,
} from '../xr/XrShellInputMonitor'
import { xrStore } from '../xr/store'
import type { AppCommand, DoseIndex } from './commands'
import {
  Batch07ExperimentController,
  browserStorage,
  type Batch07CommandResult,
} from './Batch07ExperimentController'
import { Batch07Driver } from './Batch07Driver'
import { MetricsOverlay } from './MetricsOverlay'
import { developmentPerformance } from './performance'
import {
  CANONICAL_SIMULATION_SEED,
  SimulationRuntime,
} from './SimulationRuntime'
import {
  DEFAULT_TREATMENT_CYCLE_CONFIG,
  TreatmentCycleController,
  type TreatmentCycleRecord,
} from './TreatmentCycle'

declare global {
  interface Window {
    dispatch_xr_shell_command?: (
      command: unknown,
    ) => TreatmentCycleRecord | Batch07CommandResult
    render_xr_shell_to_text?: () => string
    reset_xr_trial_to_ready?: () => void
  }
}

interface XrShellSnapshot extends XrShellInputSnapshot {
  commandCount: number
  dose: DoseIndex
  lastCommand: AppCommand | null
  lastCommandResult: TreatmentCycleRecord | Batch07CommandResult | null
  leverHandedness: string
  leverPhase: string
  posture: string
  rejectedCommandCount: number
  startButtonHandedness: string
  startButtonPhase: string
  startCommandCount: number
}

const COMMAND_LOG_CAPACITY = 64

export function XrShellApp() {
  const urlParameters = new URLSearchParams(window.location.search)
  const posture = requireXrShellPosture(urlParameters.get('posture'))
  const showCalibrationMarker =
    import.meta.env.DEV && urlParameters.get('calibration') !== 'off'
  const [entryError, setEntryError] = useState<string | null>(null)
  const [statusRevision, setStatusRevision] = useState(0)
  const runtimeRef = useRef<SimulationRuntime | null>(null)
  if (runtimeRef.current === null) runtimeRef.current = new SimulationRuntime()
  const runtime = runtimeRef.current
  const experimentRef = useRef<Batch07ExperimentController | null>(null)
  if (experimentRef.current === null) {
    experimentRef.current = new Batch07ExperimentController(
      runtime,
      browserStorage(),
      () => setStatusRevision((revision) => revision + 1),
    )
  }
  const experiment = experimentRef.current
  const cycleRef = useRef<TreatmentCycleController | null>(null)
  if (cycleRef.current === null) {
    cycleRef.current = new TreatmentCycleController(
      runtime,
      5,
      DEFAULT_TREATMENT_CYCLE_CONFIG,
      (record) => {
        experiment.handleCycleRecord(record)
        if (!record.accepted) {
          console.warn(
            'Sunol FlowLab rejected treatment-cycle event',
            JSON.stringify(record),
          )
        } else if (import.meta.env.DEV) {
          console.info(
            'Sunol FlowLab accepted treatment-cycle event',
            JSON.stringify(record),
          )
        }
        setStatusRevision((revision) => revision + 1)
      },
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
  const experimentSnapshot = experiment.snapshot()
  const commandLogRef = useRef<Array<AppCommand | undefined>>(
    new Array(COMMAND_LOG_CAPACITY),
  )
  const commandLogWriteIndexRef = useRef(0)
  const snapshotRef = useRef<XrShellSnapshot>({
    commandCount: 0,
    dose: 5,
    lastCommand: null,
    lastCommandResult: null,
    leftControllerDetected: false,
    leverHandedness: 'none',
    leverPhase: 'idle',
    posture,
    rejectedCommandCount: 0,
    rightControllerDetected: false,
    sessionActive: false,
    startButtonHandedness: 'none',
    startButtonPhase: 'idle',
    startCommandCount: 0,
  })

  const dispatchCommand = useCallback(
    (input: unknown): TreatmentCycleRecord | Batch07CommandResult => {
      const result = experiment.dispatch(cycle, input)
      const snapshot = snapshotRef.current
      snapshot.lastCommandResult = result
      snapshot.dose = cycle.selectedDose

      if (!result.accepted) {
        snapshot.rejectedCommandCount += 1
      } else {
        const command = input as AppCommand
        commandLogRef.current[commandLogWriteIndexRef.current] = command
        commandLogWriteIndexRef.current =
          (commandLogWriteIndexRef.current + 1) % COMMAND_LOG_CAPACITY
        snapshot.commandCount += 1
        snapshot.lastCommand = command
        if (command.type === 'START_TRIAL') {
          snapshot.startCommandCount += 1
        }
      }

      setStatusRevision((revision) => revision + 1)
      return result
    },
    [cycle, experiment],
  )

  const emitCommand = useCallback(
    (command: AppCommand) => {
      dispatchCommand(command)
    },
    [dispatchCommand],
  )

  const recordDetentState = useCallback((state: DetentControlState) => {
    snapshotRef.current.leverPhase = state.interaction.phase
    snapshotRef.current.leverHandedness = state.interaction.handedness
    setStatusRevision((revision) => revision + 1)
  }, [])

  const recordStartButtonState = useCallback((state: StartButtonState) => {
    snapshotRef.current.startButtonPhase = state.phase
    snapshotRef.current.startButtonHandedness = state.handedness
    setStatusRevision((revision) => revision + 1)
  }, [])

  const recordInputSnapshot = useCallback(
    (input: XrShellInputSnapshot) => {
      const snapshot = snapshotRef.current
      if (snapshot.sessionActive && !input.sessionActive) {
        cycle.interrupt('XR session ended')
      } else if (!snapshot.sessionActive && input.sessionActive) {
        cycle.resumeAfterInterruption()
      }
      Object.assign(snapshot, input)
      setStatusRevision((revision) => revision + 1)
    },
    [cycle],
  )

  const recordParticleFrame = useCallback(
    (
      frameMs: number,
      instanceSyncMs: number,
      activeParticles: number,
      drawCalls: number,
    ) => {
      developmentPerformance.recordRenderFrame(
        frameMs,
        instanceSyncMs,
        activeParticles,
        drawCalls,
      )
    },
    [],
  )

  useEffect(() => {
    const interruptForVisibility = () => {
      if (document.visibilityState === 'hidden') {
        cycle.interrupt('document hidden')
      } else {
        cycle.resumeAfterInterruption()
      }
      setStatusRevision((revision) => revision + 1)
    }
    document.addEventListener('visibilitychange', interruptForVisibility)
    return () => {
      document.removeEventListener('visibilitychange', interruptForVisibility)
      cycle.interrupt('app unmounted')
    }
  }, [cycle])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const renderState = () => {
      const population = runtime.populationDiagnostics
      return JSON.stringify({
        coordinateSystem:
          'meters; local-floor origin at viewer start; apparatus translated once to world position; simulation coordinates are tank-local',
        mode: 'treatment-cycle',
        ...snapshotRef.current,
        phase: cycle.phase,
        simulationPhase: runtime.phase,
        interrupted: cycle.isInterrupted,
        controlAvailability: cycle.controlAvailability,
        refillElapsedSeconds: cycle.refillElapsedSeconds,
        presentationEpoch: cycle.presentationEpoch,
        resultCount: cycle.resultCount,
        result: cycle.result,
        batch07: experiment.snapshot(),
        batch08: {
          ghostComparison: experiment.replayComparisonView,
        },
        presentationOpticalSource:
          cycle.result === null ? 'live-runtime' : 'trial-result',
        lastFailure: cycle.lastFailure,
        running: runtime.isRunning,
        simulationSeed: CANONICAL_SIMULATION_SEED,
        simulationConfigHash: runtime.configHash,
        simulationDose: runtime.dose,
        simulationTimeSeconds: runtime.simulationTimeSeconds,
        activeParticles: runtime.state.activeCount,
        suspendedAggregates: population.suspendedAggregateCount,
        settledAggregates: population.settledAggregateCount,
        mergeCount: runtime.mergeCount,
        mergesPerSecond: runtime.mergeRatePerSecond,
        endpointOpticalLoad:
          cycle.result?.endpointOpticalLoad ??
          endpointOpticalLoad(runtime.opticalLoadBands),
        globalRelativeOpticalLoad: runtime.opticalLoadBands.globalRelativeLoad,
      })
    }
    window.render_game_to_text = renderState
    window.render_xr_shell_to_text = renderState
    window.dispatch_xr_shell_command = dispatchCommand
    window.reset_xr_trial_to_ready = () => {
      cycle.forceResetDevOnly()
      const snapshot = snapshotRef.current
      snapshot.dose = cycle.selectedDose
      setStatusRevision((revision) => revision + 1)
    }
    window.advanceTime = (milliseconds) => {
      if (!Number.isFinite(milliseconds) || milliseconds < 0) {
        throw new RangeError('Advance time must be finite and non-negative')
      }
      if (cycle.phase === 'REFILLING') cycle.advance(milliseconds / 1000)
      else cycle.advanceHeadless(Math.round(milliseconds / (1000 / 60)))
      experiment.advancePlayback(milliseconds / 1000)
    }
    return () => {
      delete window.dispatch_xr_shell_command
      delete window.render_game_to_text
      delete window.render_xr_shell_to_text
      delete window.reset_xr_trial_to_ready
      delete window.advanceTime
    }
  }, [cycle, dispatchCommand, experiment, runtime])

  async function enterVr() {
    setEntryError(null)
    try {
      const session = await xrStore.enterVR()
      if (session === undefined) {
        setEntryError('Immersive VR is not available in this browser.')
      }
    } catch (error) {
      setEntryError(
        error instanceof Error
          ? error.message
          : 'Immersive VR entry was rejected.',
      )
    }
  }

  const snapshot = snapshotRef.current
  const instrumentation = (
    <PhysicalInstrumentation
      canonicalSummaries={experimentSnapshot.canonicalSummaries}
      ghosts={experiment.library.records.map((ghost) => ({
        trialId: ghost.trialId,
        doseIndex: ghost.doseIndex,
      }))}
      instrumentView={experiment.instrumentView}
      onClearHistory={() => dispatchCommand({ type: 'CLEAR_EXPERIMENT_LOG' })}
      onDeleteGhost={(trialId) =>
        dispatchCommand({ type: 'DELETE_GHOST', trialId })
      }
      onPauseGhost={() => dispatchCommand({ type: 'PAUSE_GHOST' })}
      onPlayGhost={(trialId) =>
        dispatchCommand({ type: 'PLAY_GHOST', trialId })
      }
      onRefill={() => dispatchCommand({ type: 'RESET_TRIAL' })}
      onReplaceOldestGhost={() =>
        dispatchCommand({ type: 'REPLACE_OLDEST_GHOST' })
      }
      onResetGhost={() => dispatchCommand({ type: 'RESET_GHOST' })}
      onSelectGhost={(trialId) =>
        dispatchCommand({ type: 'SELECT_GHOST', trialId })
      }
      pendingGhostTrialId={experimentSnapshot.pendingGhostTrialId}
      phase={cycle.phase}
      replayView={experiment.replayInstrumentView}
      plotPoints={experimentSnapshot.plottedResults}
      refillEnabled={cycle.controlAvailability.refillEnabled}
      selectedGhostTrialId={experimentSnapshot.selectedGhostTrialId}
    />
  )

  return (
    <main className={'app-shell'}>
      <div className={'app-heading'}>
        <h1>Sunol FlowLab VR</h1>
        <p>Deterministic treatment-cycle proof</p>
        <button className={'enter-vr'} type={'button'} onClick={enterVr}>
          Enter VR
        </button>
        <p className={'emulator-note'}>
          {posture === 'seated' ? 'Seated' : 'Standing'} calibration · one live
          hero-tank simulation
        </p>
        {entryError === null ? null : <p role={'alert'}>{entryError}</p>}
      </div>

      {import.meta.env.DEV ? (
        <>
          <aside
            className={'comparison-controls'}
            aria-label={'XR integration command status'}
            data-revision={statusRevision}
          >
            <span>
              Dose {cycle.selectedDose} · {snapshot.leverPhase} ·{' '}
              {snapshot.leverHandedness} hand · {cycle.phase}
            </span>
            <span>
              Start commands {snapshot.startCommandCount} · accepted{' '}
              {snapshot.commandCount} · rejected {snapshot.rejectedCommandCount}
            </span>
          </aside>
          <MetricsOverlay />
        </>
      ) : null}

      <XrShellScene
        canonicalJarSummaries={experimentSnapshot.canonicalSummaries}
        ghostComparisonView={experiment.replayComparisonView}
        instrumentation={instrumentation}
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
        opticalLoadBands={presentationOpticalLoadBands}
        particleState={runtime.state}
        posture={posture}
        presentationEpoch={cycle.presentationEpoch}
        recordParticleFrame={recordParticleFrame}
        sceneChildren={<Batch07Driver cycle={cycle} experiment={experiment} />}
        showCalibrationMarker={showCalibrationMarker}
      >
        <DoseLever
          dose={cycle.selectedDose}
          emitCommand={emitCommand}
          locked={!cycle.controlAvailability.doseEnabled}
          recordState={recordDetentState}
        />
        <StartButton
          emitCommand={emitCommand}
          locked={!cycle.controlAvailability.startEnabled}
          recordState={recordStartButtonState}
        />
        <XrShellInputMonitor recordSnapshot={recordInputSnapshot} />
      </XrShellScene>
    </main>
  )
}
