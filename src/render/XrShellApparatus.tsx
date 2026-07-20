import type { ReactNode } from 'react'

import {
  JarTestBench,
  type CanonicalJarSummaryPresentation,
} from './JarTestBench'
import { XR_CONTROL_DECK_LOCAL_X_METERS } from './layout'

interface XrShellApparatusProps {
  readonly calibrationEyeHeightMeters: number
  readonly controlReachMeters: number
  readonly children?: ReactNode
  readonly canonicalJarSummaries?: readonly CanonicalJarSummaryPresentation[]
  readonly heroTank: ReactNode
  readonly instrumentation?: ReactNode
  readonly showCalibrationMarker: boolean
}

export function XrShellApparatus({
  calibrationEyeHeightMeters,
  controlReachMeters,
  children,
  canonicalJarSummaries = [],
  heroTank,
  instrumentation,
  showCalibrationMarker,
}: XrShellApparatusProps) {
  return (
    <group>
      {heroTank}
      <JarTestBench summaries={canonicalJarSummaries} />
      {instrumentation}
      <group
        position={[XR_CONTROL_DECK_LOCAL_X_METERS, 0, 1.8 - controlReachMeters]}
      >
        {children}
      </group>
      {showCalibrationMarker ? (
        <CalibrationMarker eyeHeightMeters={calibrationEyeHeightMeters} />
      ) : null}
    </group>
  )
}

function CalibrationMarker({
  eyeHeightMeters,
}: {
  readonly eyeHeightMeters: number
}) {
  return (
    <group position={[-2.15, 0, 0.25]}>
      <mesh position={[0, eyeHeightMeters / 2, 0]}>
        <boxGeometry args={[0.018, eyeHeightMeters, 0.018]} />
        <meshStandardMaterial color={'#ffbd59'} roughness={0.5} />
      </mesh>
      <mesh position={[0, eyeHeightMeters, 0]}>
        <sphereGeometry args={[0.045, 12, 8]} />
        <meshStandardMaterial
          color={'#ffbd59'}
          emissive={'#7a3f12'}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0.18, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.012, 0.36, 0.012]} />
        <meshStandardMaterial color={'#65d8cf'} />
      </mesh>
    </group>
  )
}
