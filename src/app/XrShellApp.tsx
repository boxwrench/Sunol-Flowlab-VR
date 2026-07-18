import { useCallback, useEffect, useRef, useState } from 'react'

import { XrShellScene } from '../render/XrShellScene'
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
import {
  Batch05CommandAdapter,
  type Batch05CommandRecord,
  type Batch05TrialLifecycle,
} from './Batch05CommandAdapter'
import type { AppCommand, DoseIndex } from './commands'
import { MetricsOverlay } from './MetricsOverlay'
import { developmentPerformance } from './performance'
import { SimulationDriver } from './SimulationDriver'
import {
  CANONICAL_SIMULATION_SEED,
  SimulationRuntime,
} from './SimulationRuntime'

declare global {
  interface Window {
    dispatch_xr_shell_command?: (command: unknown) => Batch05CommandRecord
    render_xr_shell_to_text?: () => string
    reset_xr_trial_to_ready?: () => void
  }
}

interface XrShellSnapshot extends XrShellInputSnapshot {
  commandCount: number
  dose: DoseIndex
  lastCommand: AppCommand | null
  lastCommandResult: Batch05CommandRecord | null
  leverHandedness: string
  leverPhase: string
  lifecycle: Batch05TrialLifecycle
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
  const [selectedDose, setSelectedDose] = useState<DoseIndex>(5)
  const [statusRevision, setStatusRevision] = useState(0)
  const runtimeRef = useRef<SimulationRuntime | null>(null)
  if (runtimeRef.current === null) runtimeRef.current = new SimulationRuntime()
  const runtime = runtimeRef.current
  const adapterRef = useRef<Batch05CommandAdapter | null>(null)
  if (adapterRef.current === null) {
    adapterRef.current = new Batch05CommandAdapter(runtime, 5, (record) => {
      if (!record.accepted) {
        console.warn(
          'Sunol FlowLab rejected XR command',
          JSON.stringify(record),
        )
      } else if (import.meta.env.DEV) {
        console.info(
          'Sunol FlowLab accepted XR command',
          JSON.stringify(record),
        )
      }
    })
  }
  const adapter = adapterRef.current
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
    lifecycle: 'ready',
    posture,
    rejectedCommandCount: 0,
    rightControllerDetected: false,
    sessionActive: false,
    startButtonHandedness: 'none',
    startButtonPhase: 'idle',
    startCommandCount: 0,
  })

  const dispatchCommand = useCallback(
    (input: unknown): Batch05CommandRecord => {
      const result = adapter.dispatch(input)
      const snapshot = snapshotRef.current
      snapshot.lastCommandResult = result
      snapshot.lifecycle = adapter.lifecycle
      snapshot.dose = adapter.selectedDose

      if (!result.accepted) {
        snapshot.rejectedCommandCount += 1
      } else {
        const command = input as AppCommand
        commandLogRef.current[commandLogWriteIndexRef.current] = command
        commandLogWriteIndexRef.current =
          (commandLogWriteIndexRef.current + 1) % COMMAND_LOG_CAPACITY
        snapshot.commandCount += 1
        snapshot.lastCommand = command
        if (command.type === 'SET_DOSE') {
          setSelectedDose(command.dose)
        } else if (command.type === 'START_TRIAL') {
          snapshot.startCommandCount += 1
        }
      }

      setStatusRevision((revision) => revision + 1)
      return result
    },
    [adapter],
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
        adapter.interrupt()
        snapshot.lifecycle = adapter.lifecycle
      }
      Object.assign(snapshot, input)
      setStatusRevision((revision) => revision + 1)
    },
    [adapter],
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
      if (document.visibilityState !== 'hidden') return
      adapter.interrupt()
      snapshotRef.current.lifecycle = adapter.lifecycle
      setStatusRevision((revision) => revision + 1)
    }
    document.addEventListener('visibilitychange', interruptForVisibility)
    return () => {
      document.removeEventListener('visibilitychange', interruptForVisibility)
      adapter.interrupt()
    }
  }, [adapter])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const renderState = () => {
      const population = runtime.populationDiagnostics
      return JSON.stringify({
        coordinateSystem:
          'meters; local-floor origin at viewer start; apparatus translated once to world position; simulation coordinates are tank-local',
        mode: 'simulation-xr-integration',
        ...snapshotRef.current,
        lifecycle: adapter.lifecycle,
        running: runtime.isRunning,
        simulationSeed: CANONICAL_SIMULATION_SEED,
        simulationConfigHash: runtime.configHash,
        simulationDose: runtime.dose,
        simulationTimeSeconds: runtime.simulationTimeSeconds,
        phase: runtime.phase,
        activeParticles: runtime.state.activeCount,
        suspendedAggregates: population.suspendedAggregateCount,
        settledAggregates: population.settledAggregateCount,
        mergeCount: runtime.mergeCount,
        mergesPerSecond: runtime.mergeRatePerSecond,
        endpointOpticalLoad: endpointOpticalLoad(runtime.opticalLoadBands),
        globalRelativeOpticalLoad: runtime.opticalLoadBands.globalRelativeLoad,
      })
    }
    window.render_game_to_text = renderState
    window.render_xr_shell_to_text = renderState
    window.dispatch_xr_shell_command = dispatchCommand
    window.reset_xr_trial_to_ready = () => {
      adapter.resetToReady()
      const snapshot = snapshotRef.current
      snapshot.lifecycle = adapter.lifecycle
      snapshot.dose = adapter.selectedDose
      setSelectedDose(adapter.selectedDose)
      setStatusRevision((revision) => revision + 1)
    }
    window.advanceTime = (milliseconds) => {
      if (!Number.isFinite(milliseconds) || milliseconds < 0) {
        throw new RangeError('Advance time must be finite and non-negative')
      }
      runtime.stepHeadless(Math.round(milliseconds / (1000 / 60)))
    }
    return () => {
      delete window.dispatch_xr_shell_command
      delete window.render_game_to_text
      delete window.render_xr_shell_to_text
      delete window.reset_xr_trial_to_ready
      delete window.advanceTime
    }
  }, [adapter, dispatchCommand, runtime])

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

  return (
    <main className={'app-shell'}>
      <div className={'app-heading'}>
        <h1>Sunol FlowLab VR</h1>
        <p>Simulation and XR integration proof</p>
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
              Dose {selectedDose} · {snapshot.leverPhase} ·{' '}
              {snapshot.leverHandedness} hand · {snapshot.lifecycle}
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
        opticalLoadBands={runtime.opticalLoadBands}
        particleState={runtime.state}
        posture={posture}
        recordParticleFrame={recordParticleFrame}
        sceneChildren={<SimulationDriver runtime={runtime} />}
        showCalibrationMarker={showCalibrationMarker}
      >
        <DoseLever
          dose={selectedDose}
          emitCommand={emitCommand}
          recordState={recordDetentState}
        />
        <StartButton
          emitCommand={emitCommand}
          recordState={recordStartButtonState}
        />
        <XrShellInputMonitor recordSnapshot={recordInputSnapshot} />
      </XrShellScene>
    </main>
  )
}
