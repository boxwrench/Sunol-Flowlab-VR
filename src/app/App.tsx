import { useEffect, useRef, useState } from 'react'

import { FoundationScene } from '../render/FoundationScene'
import {
  clearingFrontDiagnostics,
  endpointTurbidity,
  type DoseDetent,
} from '../sim'
import { xrStore } from '../xr/store'
import { MetricsOverlay } from './MetricsOverlay'
import { developmentPerformance } from './performance'
import { SimulationDriver } from './SimulationDriver'
import { SimulationRuntime } from './SimulationRuntime'

declare global {
  interface Window {
    render_game_to_text?: () => string
    advanceTime?: (milliseconds: number) => void
  }
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
  const presentationMode =
    new URLSearchParams(window.location.search).get('mode') === 'proof'
  const [entryError, setEntryError] = useState<string | null>(null)
  const [selectedDose, setSelectedDose] = useState<DoseDetent>(5)
  const runtimeRef = useRef<SimulationRuntime | null>(null)
  if (runtimeRef.current === null) runtimeRef.current = new SimulationRuntime()
  const runtime = runtimeRef.current

  useEffect(() => {
    runtime.start()
    return () => runtime.pause()
  }, [runtime])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.render_game_to_text = () => {
      const clearing = clearingFrontDiagnostics(runtime.turbidityBands)
      return JSON.stringify({
        coordinateSystem: 'meters; origin tank center-bottom; +Y upward',
        mode: 'phenomenon-trial',
        dose: runtime.dose,
        phase: runtime.phase,
        simulationTimeSeconds: runtime.simulationTimeSeconds,
        activeParticles: runtime.state.activeCount,
        endpointTurbidity: endpointTurbidity(runtime.turbidityBands),
        topClearFraction: clearing.topClearFraction,
        clearingFrontDepth: clearing.clearingFrontDepth,
        upperZoneTurbidity: clearing.upperZoneTurbidity,
        clarityReachedAtSimulationTime: runtime.clarityReachedAtSimulationTime,
      })
    }
    window.advanceTime = (milliseconds) => {
      if (!Number.isFinite(milliseconds) || milliseconds < 0)
        throw new RangeError('Advance time must be finite and non-negative')
      runtime.pause()
      runtime.stepHeadless(Math.round(milliseconds / (1000 / 60)))
    }
    return () => {
      delete window.render_game_to_text
      delete window.advanceTime
    }
  }, [runtime])

  function runComparisonPreset(dose: DoseDetent): void {
    runtime.reset(undefined, dose)
    runtime.start()
    setSelectedDose(dose)
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
          <div>
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
        </nav>
      ) : null}
      {import.meta.env.DEV && !presentationMode ? <MetricsOverlay /> : null}
      <FoundationScene
        particleState={runtime.state}
        turbidityBands={runtime.turbidityBands}
        recordParticleFrame={recordParticleFrame}
      >
        <SimulationDriver runtime={runtime} />
      </FoundationScene>
    </main>
  )
}
