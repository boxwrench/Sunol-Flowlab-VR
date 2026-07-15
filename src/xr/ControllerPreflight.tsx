import {
  useXR,
  useXRInputSourceEvent,
  useXRInputSourceState,
} from '@react-three/xr'
import { useEffect, useState } from 'react'

export type XrPreflightEvent =
  | { readonly type: 'session'; readonly active: boolean }
  | {
      readonly type: 'controller'
      readonly handedness: 'left' | 'right'
      readonly detected: boolean
    }
  | {
      readonly type: 'select'
      readonly handedness: 'left' | 'right'
    }
  | { readonly type: 'target-select' }

interface ControllerPreflightProps {
  readonly recordEvent: (event: XrPreflightEvent) => void
}

export function ControllerPreflight({ recordEvent }: ControllerPreflightProps) {
  const session = useXR((state) => state.session)
  const leftController = useXRInputSourceState('controller', 'left')
  const rightController = useXRInputSourceState('controller', 'right')
  const [targetSelected, setTargetSelected] = useState(false)

  useEffect(() => {
    recordEvent({ type: 'session', active: session !== undefined })
    if (session === undefined) setTargetSelected(false)
  }, [recordEvent, session])

  useEffect(() => {
    recordEvent({
      type: 'controller',
      handedness: 'left',
      detected: leftController !== undefined,
    })
  }, [leftController, recordEvent])

  useEffect(() => {
    recordEvent({
      type: 'controller',
      handedness: 'right',
      detected: rightController !== undefined,
    })
  }, [recordEvent, rightController])

  useXRInputSourceEvent(
    leftController?.inputSource,
    'selectstart',
    () => recordEvent({ type: 'select', handedness: 'left' }),
    [recordEvent],
  )
  useXRInputSourceEvent(
    rightController?.inputSource,
    'selectstart',
    () => recordEvent({ type: 'select', handedness: 'right' }),
    [recordEvent],
  )

  if (session === undefined) return null

  return (
    <mesh
      position={[0, 1.25, -1.5]}
      onClick={() => {
        setTargetSelected(true)
        recordEvent({ type: 'target-select' })
      }}
    >
      <sphereGeometry args={[0.12, 16, 12]} />
      <meshStandardMaterial
        color={targetSelected ? '#ffbd59' : '#65d8cf'}
        emissive={targetSelected ? '#b55b16' : '#174f4d'}
        emissiveIntensity={0.8}
      />
    </mesh>
  )
}
