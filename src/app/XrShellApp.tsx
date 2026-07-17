import { useCallback, useEffect, useRef, useState } from 'react'

import { XrShellScene } from '../render/XrShellScene'
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
import { requireDoseIndex, type AppCommand, type DoseIndex } from './commands'
import { MetricsOverlay } from './MetricsOverlay'
import { developmentPerformance } from './performance'

declare global {
  interface Window {
    render_xr_shell_to_text?: () => string
  }
}

interface XrShellSnapshot extends XrShellInputSnapshot {
  commandCount: number
  dose: DoseIndex
  lastCommand: AppCommand | null
  leverHandedness: string
  leverPhase: string
  posture: string
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
  const commandLogRef = useRef<Array<AppCommand | undefined>>(
    new Array(COMMAND_LOG_CAPACITY),
  )
  const commandLogWriteIndexRef = useRef(0)
  const snapshotRef = useRef<XrShellSnapshot>({
    commandCount: 0,
    dose: 5,
    lastCommand: null,
    leftControllerDetected: false,
    leverHandedness: 'none',
    leverPhase: 'idle',
    posture,
    rightControllerDetected: false,
    sessionActive: false,
    startButtonHandedness: 'none',
    startButtonPhase: 'idle',
    startCommandCount: 0,
  })

  const emitCommand = useCallback((command: AppCommand) => {
    const snapshot = snapshotRef.current
    if (command.type === 'SET_DOSE') {
      const dose = requireDoseIndex(command.dose)
      snapshot.dose = dose
      setSelectedDose(dose)
    } else if (command.type === 'START_TRIAL') {
      snapshot.startCommandCount += 1
    } else {
      return
    }
    commandLogRef.current[commandLogWriteIndexRef.current] = command
    commandLogWriteIndexRef.current =
      (commandLogWriteIndexRef.current + 1) % COMMAND_LOG_CAPACITY
    snapshot.commandCount += 1
    snapshot.lastCommand = command
    setStatusRevision((revision) => revision + 1)
    if (import.meta.env.DEV) {
      console.info('Sunol FlowLab XR shell command', JSON.stringify(command))
    }
  }, [])

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

  const recordInputSnapshot = useCallback((input: XrShellInputSnapshot) => {
    Object.assign(snapshotRef.current, input)
    setStatusRevision((revision) => revision + 1)
  }, [])

  const recordFrame = useCallback((frameMs: number, drawCalls: number) => {
    developmentPerformance.recordRenderFrame(frameMs, 0, 0, drawCalls)
  }, [])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const renderState = () =>
      JSON.stringify({
        coordinateSystem:
          'meters; local-floor origin at viewer start; +Y upward; apparatus toward -Z',
        mode: 'xr-interaction-shell',
        ...snapshotRef.current,
      })
    window.render_game_to_text = renderState
    window.render_xr_shell_to_text = renderState
    window.advanceTime = (milliseconds) => {
      if (!Number.isFinite(milliseconds) || milliseconds < 0) {
        throw new RangeError('Advance time must be finite and non-negative')
      }
    }
    return () => {
      delete window.render_game_to_text
      delete window.render_xr_shell_to_text
      delete window.advanceTime
    }
  }, [])

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
        <p>Standalone XR interaction shell</p>
        <button className={'enter-vr'} type={'button'} onClick={enterVr}>
          Enter VR
        </button>
        <p className={'emulator-note'}>
          {posture === 'seated' ? 'Seated' : 'Standing'} calibration · empty
          treatment shell
        </p>
        {entryError === null ? null : <p role={'alert'}>{entryError}</p>}
      </div>

      {import.meta.env.DEV ? (
        <>
          <aside
            className={'comparison-controls'}
            aria-label={'XR shell command status'}
            data-revision={statusRevision}
          >
            <span>
              Dose {selectedDose} · {snapshot.leverPhase} ·{' '}
              {snapshot.leverHandedness} hand
            </span>
            <span>
              Start commands {snapshot.startCommandCount} · total commands{' '}
              {snapshot.commandCount}
            </span>
          </aside>
          <MetricsOverlay />
        </>
      ) : null}

      <XrShellScene
        posture={posture}
        recordFrame={recordFrame}
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
