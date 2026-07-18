import { Canvas } from '@react-three/fiber'
import { XR } from '@react-three/xr'
import type { ReactNode } from 'react'

import type { ParticleStateView } from '../sim'
import { XR_SHELL_POSTURE_LAYOUTS, type XrShellPosture } from '../xr/layout'
import { xrStore } from '../xr/store'
import { HeroObservationTank } from './HeroObservationTank'
import { XrShellApparatus } from './XrShellApparatus'
import {
  APPARATUS_WORLD_POSITION,
  DESKTOP_CAMERA_POSITION,
  DESKTOP_CAMERA_TARGET,
} from './layout'
import type { ParticleFrameRecorder } from './ParticleCloud'
import type { MeasurementPresentationPhase } from './MeasurementCue'
import type { OpticalLoadBandsPresentation } from './OpticalLoadGradient'

interface XrShellSceneProps {
  readonly children?: ReactNode
  readonly measurementPhase?: MeasurementPresentationPhase
  readonly measurementRelativeOpticalLoad?: number
  readonly opticalLoadBands: OpticalLoadBandsPresentation
  readonly particleState: ParticleStateView
  readonly posture: XrShellPosture
  readonly presentationEpoch?: number
  readonly recordParticleFrame: ParticleFrameRecorder
  readonly sceneChildren?: ReactNode
  readonly showCalibrationMarker?: boolean
}

export function XrShellScene({
  children,
  measurementPhase = 'idle',
  measurementRelativeOpticalLoad = 0,
  opticalLoadBands,
  particleState,
  posture,
  presentationEpoch = 0,
  recordParticleFrame,
  sceneChildren,
  showCalibrationMarker = false,
}: XrShellSceneProps) {
  const layout = XR_SHELL_POSTURE_LAYOUTS[posture]
  return (
    <Canvas
      camera={{ position: [...DESKTOP_CAMERA_POSITION], fov: 42 }}
      dpr={[1, 1.5]}
      onCreated={({ camera }) => camera.lookAt(...DESKTOP_CAMERA_TARGET)}
    >
      <XR store={xrStore}>
        <color attach={'background'} args={['#081719']} />
        <ambientLight intensity={1.35} />
        <directionalLight position={[2, 4, 3]} intensity={2.2} />
        {sceneChildren}
        <group position={[...APPARATUS_WORLD_POSITION]}>
          <XrShellApparatus
            calibrationEyeHeightMeters={layout.calibrationEyeHeightMeters}
            controlReachMeters={layout.neutralReachMeters}
            heroTank={
              <HeroObservationTank
                measurementPhase={measurementPhase}
                measurementRelativeOpticalLoad={measurementRelativeOpticalLoad}
                particleState={particleState}
                opticalLoadBands={opticalLoadBands}
                presentationEpoch={presentationEpoch}
                recordParticleFrame={recordParticleFrame}
              />
            }
            showCalibrationMarker={showCalibrationMarker}
          >
            <group
              position={[0, layout.controlMountHeightMeters, 0]}
              rotation={[Math.PI / 12, 0, 0]}
            >
              {children}
            </group>
          </XrShellApparatus>
          <gridHelper args={[8, 16, '#315b59', '#173332']} />
        </group>
      </XR>
    </Canvas>
  )
}
