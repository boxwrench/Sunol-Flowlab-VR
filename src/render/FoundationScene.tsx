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
import type { MeasurementPresentationPhase } from './MeasurementCue'
import type { OpticalLoadBandsPresentation } from './OpticalLoadGradient'
import type { GhostComparisonPresentationView } from './TreatmentGhostComparison'

interface FoundationSceneProps {
  readonly animateParticleTransitions?: boolean
  readonly children?: ReactNode
  readonly canonicalJarSummaries?: readonly CanonicalJarSummaryPresentation[]
  readonly instrumentation?: ReactNode
  readonly ghostComparisonView?: GhostComparisonPresentationView
  readonly measurementPhase?: MeasurementPresentationPhase
  readonly measurementRelativeOpticalLoad?: number
  readonly particleState: ParticleStateView
  readonly opticalLoadBands: OpticalLoadBandsPresentation
  readonly preserveDrawingBuffer?: boolean
  readonly presentationEpoch?: number
  readonly recordParticleFrame: ParticleFrameRecorder
}

export function FoundationScene({
  animateParticleTransitions = true,
  children,
  canonicalJarSummaries = [],
  instrumentation,
  ghostComparisonView,
  measurementPhase = 'idle',
  measurementRelativeOpticalLoad = 0,
  particleState,
  opticalLoadBands,
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
        <ambientLight intensity={1.35} />
        <directionalLight position={[2, 4, 3]} intensity={2.2} />
        <group position={[...APPARATUS_WORLD_POSITION]}>
          <HeroObservationTank
            animateParticleTransitions={animateParticleTransitions}
            measurementPhase={measurementPhase}
            measurementRelativeOpticalLoad={measurementRelativeOpticalLoad}
            ghostComparisonView={ghostComparisonView}
            particleState={particleState}
            presentationEpoch={presentationEpoch}
            opticalLoadBands={opticalLoadBands}
            recordParticleFrame={recordParticleFrame}
          />
          <JarTestBench summaries={canonicalJarSummaries} />
          {instrumentation}
          <gridHelper args={[8, 16, '#315b59', '#173332']} />
        </group>
      </XR>
    </Canvas>
  )
}
