import { useEffect, useRef, useState } from 'react'

import { FoundationScene } from '../render/FoundationScene'
import { endpointTurbidity } from '../sim'
import { xrStore } from '../xr/store'
import { MetricsOverlay } from './MetricsOverlay'
import { developmentPerformance } from './performance'
import { SimulationDriver } from './SimulationDriver'
import { SimulationRuntime } from './SimulationRuntime'

declare global {
  interface Window {
    render_game_to_text?: () => string
  }
}

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
  const [entryError, setEntryError] = useState<string | null>(null)
  const runtimeRef = useRef<SimulationRuntime | null>(null)
  if (runtimeRef.current === null) runtimeRef.current = new SimulationRuntime()
  const runtime = runtimeRef.current

  useEffect(() => {
    runtime.start()
    return () => runtime.pause()
  }, [runtime])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.render_game_to_text = () =>
      JSON.stringify({
        coordinateSystem: 'meters; origin tank center-bottom; +Y upward',
        mode: 'phenomenon-trial',
        dose: runtime.dose,
        phase: runtime.phase,
        simulationTimeSeconds: runtime.simulationTimeSeconds,
        activeParticles: runtime.state.activeCount,
        endpointTurbidity: endpointTurbidity(runtime.turbidityBands),
      })
    return () => {
      delete window.render_game_to_text
    }
  }, [runtime])

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
      <div className="app-heading">
        <h1>Sunol FlowLab VR</h1>
        <p>Deterministic coagulation learning experience - foundation build</p>
        <button className="enter-vr" type="button" onClick={enterVr}>
          Enter VR
        </button>
        <p className="emulator-note">
          Chrome on localhost uses the Quest 3 development emulator.
        </p>
        {entryError === null ? null : <p role="alert">{entryError}</p>}
      </div>
      {import.meta.env.DEV ? <MetricsOverlay /> : null}
      <FoundationScene
        particleState={runtime.state}
        recordParticleFrame={recordParticleFrame}
      >
        <SimulationDriver runtime={runtime} />
      </FoundationScene>
    </main>
  )
}
