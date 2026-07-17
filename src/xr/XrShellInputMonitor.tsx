import { useXR, useXRInputSourceState } from '@react-three/xr'
import { useEffect } from 'react'

export interface XrShellInputSnapshot {
  readonly sessionActive: boolean
  readonly leftControllerDetected: boolean
  readonly rightControllerDetected: boolean
}

interface XrShellInputMonitorProps {
  readonly recordSnapshot: (snapshot: XrShellInputSnapshot) => void
}

export function XrShellInputMonitor({
  recordSnapshot,
}: XrShellInputMonitorProps) {
  const session = useXR((state) => state.session)
  const leftController = useXRInputSourceState('controller', 'left')
  const rightController = useXRInputSourceState('controller', 'right')

  useEffect(() => {
    recordSnapshot({
      sessionActive: session !== undefined,
      leftControllerDetected: leftController !== undefined,
      rightControllerDetected: rightController !== undefined,
    })
  }, [leftController, recordSnapshot, rightController, session])

  return null
}
