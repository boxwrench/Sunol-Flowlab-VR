import { Canvas } from '@react-three/fiber'
import { XR } from '@react-three/xr'
import type { ReactNode } from 'react'

import type { OpticalLoadBandsView, ParticleStateView } from '../sim'
import { xrStore } from '../xr/store'
import { HeroObservationTank } from './HeroObservationTank'
import { JarTestBench } from './JarTestBench'
import {
  APPARATUS_WORLD_POSITION,
  DESKTOP_CAMERA_POSITION,
  DESKTOP_CAMERA_TARGET,
} from './layout'
import type { ParticleFrameRecorder } from './ParticleCloud'

interface FoundationSceneProps {
  readonly children?: ReactNode
  readonly particleState: ParticleStateView
  readonly opticalLoadBands: OpticalLoadBandsView
  readonly recordParticleFrame: ParticleFrameRecorder
}

export function FoundationScene({
  children,
  particleState,
  opticalLoadBands,
  recordParticleFrame,
}: FoundationSceneProps) {
  return (
    <Canvas
      camera={{ position: [...DESKTOP_CAMERA_POSITION], fov: 42 }}
      dpr={[1, 1.5]}
      onCreated={({ camera }) => camera.lookAt(...DESKTOP_CAMERA_TARGET)}
    >
      <XR store={xrStore}>
        {children}
        <color attach="background" args={['#081719']} />
        <ambientLight intensity={1.35} />
        <directionalLight position={[2, 4, 3]} intensity={2.2} />
        <group position={[...APPARATUS_WORLD_POSITION]}>
          <HeroObservationTank
            particleState={particleState}
            opticalLoadBands={opticalLoadBands}
            recordParticleFrame={recordParticleFrame}
          />
          <JarTestBench />
          <gridHelper args={[8, 16, '#315b59', '#173332']} />
        </group>
      </XR>
    </Canvas>
  )
}
