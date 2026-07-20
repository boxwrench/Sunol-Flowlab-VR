import { Canvas } from '@react-three/fiber'
import { XR, XROrigin } from '@react-three/xr'
import type { ReactNode } from 'react'

import type { ParticleStateView } from '../sim'
import { XR_SHELL_POSTURE_LAYOUTS, type XrShellPosture } from '../xr/layout'
import { xrStore } from '../xr/store'
import { HeroObservationTank } from './HeroObservationTank'
import type { CanonicalJarSummaryPresentation } from './JarTestBench'
import { XrShellApparatus } from './XrShellApparatus'
import {
  APPARATUS_WORLD_POSITION,
  DESKTOP_CAMERA_POSITION,
  XR_SHELL_DESKTOP_CAMERA_TARGET,
} from './layout'
import type { ParticleFrameRecorder } from './ParticleCloud'
import type { OpticalLoadBandsPresentation } from './OpticalLoadGradient'
import { PlantEnvironment, type LabPanoramaId } from './PlantEnvironment'
import { ControlDashboard } from './ControlDashboard'

interface XrShellSceneProps {
  readonly children?: ReactNode
  readonly canonicalJarSummaries?: readonly CanonicalJarSummaryPresentation[]
  readonly instrumentation?: ReactNode
  readonly opticalLoadBands: OpticalLoadBandsPresentation
  readonly particleState: ParticleStateView
  readonly panorama?: LabPanoramaId
  readonly posture: XrShellPosture
  readonly presentationEpoch?: number
  readonly recordParticleFrame: ParticleFrameRecorder
  readonly sceneChildren?: ReactNode
  readonly showCalibrationMarker?: boolean
}

export function XrShellScene({
  children,
  canonicalJarSummaries = [],
  instrumentation,
  opticalLoadBands,
  particleState,
  panorama = 'hetchy',
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
      onCreated={({ camera }) =>
        camera.lookAt(...XR_SHELL_DESKTOP_CAMERA_TARGET)
      }
    >
      <XR store={xrStore}>
        <XROrigin position={[0, layout.playerOriginHeightOffsetMeters, 0]} />
        <color attach={'background'} args={['#081719']} />
        <ambientLight intensity={1.1} />
        <directionalLight position={[2, 4, 3]} intensity={1.7} />
        <PlantEnvironment panorama={panorama} />
        {sceneChildren}
        <group position={[...APPARATUS_WORLD_POSITION]}>
          <XrShellApparatus
            calibrationEyeHeightMeters={layout.calibrationEyeHeightMeters}
            canonicalJarSummaries={canonicalJarSummaries}
            controlReachMeters={layout.neutralReachMeters}
            heroTank={
              <HeroObservationTank
                particleState={particleState}
                opticalLoadBands={opticalLoadBands}
                presentationEpoch={presentationEpoch}
                recordParticleFrame={recordParticleFrame}
              />
            }
            instrumentation={instrumentation}
            showCalibrationMarker={showCalibrationMarker}
          >
            <group
              position={[0, layout.controlMountHeightMeters, 0]}
              rotation={[Math.PI / 12, 0, 0]}
            >
              <ControlDashboard>{children}</ControlDashboard>
            </group>
          </XrShellApparatus>
        </group>
      </XR>
    </Canvas>
  )
}
