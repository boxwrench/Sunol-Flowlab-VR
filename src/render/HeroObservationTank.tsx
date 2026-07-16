import type { OpticalLoadBandsView, ParticleStateView } from '../sim'
import { HERO_TANK_LOCAL_POSITION } from './layout'
import { ParticleCloud, type ParticleFrameRecorder } from './ParticleCloud'
import { OpticalLoadGradient } from './OpticalLoadGradient'

interface HeroObservationTankProps {
  readonly animateParticleTransitions?: boolean
  readonly particleState: ParticleStateView
  readonly opticalLoadBands: OpticalLoadBandsView
  readonly recordParticleFrame: ParticleFrameRecorder
}

export function HeroObservationTank({
  animateParticleTransitions = true,
  particleState,
  opticalLoadBands,
  recordParticleFrame,
}: HeroObservationTankProps) {
  return (
    <group position={[...HERO_TANK_LOCAL_POSITION]}>
      <OpticalLoadGradient bands={opticalLoadBands} />
      <ParticleCloud
        animateTransitions={animateParticleTransitions}
        state={particleState}
        recordFrame={recordParticleFrame}
      />

      <mesh position={[0, -0.025, 0]}>
        <boxGeometry args={[1.55, 0.05, 0.85]} />
        <meshStandardMaterial color={'#183d3c'} roughness={0.62} />
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
          <mesh key={`${x}:${z}`} position={[x, 0.61, z]}>
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
