import { Canvas } from '@react-three/fiber'
import { XR } from '@react-three/xr'
import type { ReactNode } from 'react'

import type { ParticleStateView } from '../sim'
import { xrStore } from '../xr/store'
import { ParticleCloud, type ParticleFrameRecorder } from './ParticleCloud'

interface FoundationSceneProps {
  readonly children?: ReactNode
  readonly particleState: ParticleStateView
  readonly recordParticleFrame: ParticleFrameRecorder
}

export function FoundationScene({
  children,
  particleState,
  recordParticleFrame,
}: FoundationSceneProps) {
  return (
    <Canvas camera={{ position: [0, 1.4, 3], fov: 48 }} dpr={[1, 1.5]}>
      <XR store={xrStore}>
        {children}
        <color attach="background" args={['#071416']} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 4, 3]} intensity={2} />
        <ParticleCloud
          state={particleState}
          recordFrame={recordParticleFrame}
        />
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[1.45, 1.2, 0.75]} />
          <meshStandardMaterial
            color="#1d7778"
            transparent
            opacity={0.14}
            depthWrite={false}
          />
        </mesh>
        <gridHelper args={[8, 16, '#315b59', '#173332']} />
      </XR>
    </Canvas>
  )
}
