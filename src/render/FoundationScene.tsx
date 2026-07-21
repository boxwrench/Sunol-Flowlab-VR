import { Canvas } from '@react-three/fiber'
import { XR } from '@react-three/xr'
import type { ReactNode } from 'react'

import type { ParticleStateView } from '../sim'
import { xrStore } from '../xr/store'
import { HeroObservationTank } from './HeroObservationTank'
import {
  JarTestBench,
  type CanonicalJarSummaryPresentation,
} from './JarTestBench'
import {
  APPARATUS_WORLD_POSITION,
  DESKTOP_CAMERA_POSITION,
  DESKTOP_CAMERA_TARGET,
} from './layout'
import type { ParticleFrameRecorder } from './ParticleCloud'
import type { OpticalLoadBandsPresentation } from './OpticalLoadGradient'
import { LabLighting } from './LabLighting'
import { PlantEnvironment, type LabPanoramaId } from './PlantEnvironment'

interface FoundationSceneProps {
  readonly animateParticleTransitions?: boolean
  readonly children?: ReactNode
  readonly canonicalJarSummaries?: readonly CanonicalJarSummaryPresentation[]
  readonly instrumentation?: ReactNode
  readonly particleState: ParticleStateView
  readonly opticalLoadBands: OpticalLoadBandsPresentation
  readonly panorama?: LabPanoramaId
  readonly preserveDrawingBuffer?: boolean
  readonly presentationEpoch?: number
  readonly recordParticleFrame: ParticleFrameRecorder
}

export function FoundationScene({
  animateParticleTransitions = true,
  children,
  canonicalJarSummaries = [],
  instrumentation,
  particleState,
  opticalLoadBands,
  panorama = 'hetchy',
  preserveDrawingBuffer = false,
  presentationEpoch = 0,
  recordParticleFrame,
}: FoundationSceneProps) {
  return (
    <Canvas
      camera={{ position: [...DESKTOP_CAMERA_POSITION], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ preserveDrawingBuffer }}
      onCreated={({ camera }) => camera.lookAt(...DESKTOP_CAMERA_TARGET)}
    >
      <XR store={xrStore}>
        {children}
        <color attach="background" args={['#081719']} />
        <LabLighting />
        <PlantEnvironment panorama={panorama} />
        <group position={[...APPARATUS_WORLD_POSITION]}>
          <HeroObservationTank
            animateParticleTransitions={animateParticleTransitions}
            particleState={particleState}
            presentationEpoch={presentationEpoch}
            opticalLoadBands={opticalLoadBands}
            recordParticleFrame={recordParticleFrame}
          />
          <JarTestBench summaries={canonicalJarSummaries} />
          {instrumentation}
        </group>
      </XR>
    </Canvas>
  )
}
