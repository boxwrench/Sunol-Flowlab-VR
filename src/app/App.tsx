import { useState } from 'react'

import { FoundationScene } from '../render/FoundationScene'
import { xrStore } from '../xr/store'
import { MetricsOverlay } from './MetricsOverlay'

export function App() {
  const [entryError, setEntryError] = useState<string | null>(null)

  async function enterVr() {
    setEntryError(null)
    try {
      const session = await xrStore.enterVR()
      if (session === undefined) setEntryError('Immersive VR is not available in this browser.')
    } catch (error) {
      setEntryError(error instanceof Error ? error.message : 'Immersive VR entry was rejected.')
    }
  }

  return (
    <main className="app-shell">
      <div className="app-heading">
        <h1>Sunol FlowLab VR</h1>
        <p>Deterministic coagulation learning experience - foundation build</p>
        <button className="enter-vr" type="button" onClick={enterVr}>Enter VR</button>
        <p className="emulator-note">Chrome on localhost uses the Quest 3 development emulator.</p>
        {entryError === null ? null : <p role="alert">{entryError}</p>}
      </div>
      {import.meta.env.DEV ? <MetricsOverlay /> : null}
      <FoundationScene />
    </main>
  )
}

