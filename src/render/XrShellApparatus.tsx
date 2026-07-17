import type { ReactNode } from 'react'

import { JarTestBench } from './JarTestBench'
import { HERO_TANK_LOCAL_POSITION } from './layout'

interface XrShellApparatusProps {
  readonly calibrationEyeHeightMeters: number
  readonly controlReachMeters: number
  readonly children?: ReactNode
  readonly showCalibrationMarker: boolean
}

export function XrShellApparatus({
  calibrationEyeHeightMeters,
  controlReachMeters,
  children,
  showCalibrationMarker,
}: XrShellApparatusProps) {
  return (
    <group>
      <EmptyHeroTank />
      <JarTestBench />
      <group position={[0, 0, 1.8 - controlReachMeters]}>{children}</group>
      {showCalibrationMarker ? (
        <CalibrationMarker eyeHeightMeters={calibrationEyeHeightMeters} />
      ) : null}
    </group>
  )
}

function EmptyHeroTank() {
  return (
    <group position={[...HERO_TANK_LOCAL_POSITION]}>
      <mesh position={[0, -0.025, 0]}>
        <boxGeometry args={[1.55, 0.05, 0.85]} />
        <meshStandardMaterial color={'#183d3c'} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.6, -0.41]}>
        <boxGeometry args={[1.55, 1.25, 0.025]} />
        <meshStandardMaterial
          color={'#477e79'}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-0.75, 0.6, 0]}>
        <boxGeometry args={[0.025, 1.25, 0.82]} />
        <meshStandardMaterial
          color={'#8fc8c1'}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.75, 0.6, 0]}>
        <boxGeometry args={[0.025, 1.25, 0.82]} />
        <meshStandardMaterial
          color={'#8fc8c1'}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      {[-0.77, 0.77].flatMap((x) =>
        [-0.42, 0.42].map((z) => (
          <mesh key={x + ':' + z} position={[x, 0.61, z]}>
            <boxGeometry args={[0.035, 1.27, 0.035]} />
            <meshStandardMaterial color={'#75aaa4'} roughness={0.45} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0, 0.42]}>
        <boxGeometry args={[1.57, 0.04, 0.04]} />
        <meshStandardMaterial color={'#75aaa4'} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0, -0.42]}>
        <boxGeometry args={[1.57, 0.04, 0.04]} />
        <meshStandardMaterial color={'#75aaa4'} roughness={0.45} />
      </mesh>
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
