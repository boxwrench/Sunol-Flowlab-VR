import type { ReactNode } from 'react'

import { JarTestBench } from './JarTestBench'

interface XrShellApparatusProps {
  readonly calibrationEyeHeightMeters: number
  readonly controlReachMeters: number
  readonly children?: ReactNode
  readonly heroTank: ReactNode
  readonly showCalibrationMarker: boolean
}

export function XrShellApparatus({
  calibrationEyeHeightMeters,
  controlReachMeters,
  children,
  heroTank,
  showCalibrationMarker,
}: XrShellApparatusProps) {
  return (
    <group>
      {heroTank}
      <JarTestBench />
      <group position={[0, 0, 1.8 - controlReachMeters]}>{children}</group>
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
