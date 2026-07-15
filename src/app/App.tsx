import { useEffect, useRef, useState } from 'react'

import { FoundationScene } from '../render/FoundationScene'
import { xrStore } from '../xr/store'
import { MetricsOverlay } from './MetricsOverlay'
import { developmentPerformance } from './performance'
import { SimulationDriver } from './SimulationDriver'
import { SimulationRuntime } from './SimulationRuntime'

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
