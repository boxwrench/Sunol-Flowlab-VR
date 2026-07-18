export type MeasurementPresentationPhase =
  'idle' | 'measuring' | 'complete' | 'refilling'

interface MeasurementCueProps {
  readonly phase: MeasurementPresentationPhase
  readonly relativeOpticalLoad: number
}

export function MeasurementCue({
  phase,
  relativeOpticalLoad,
}: MeasurementCueProps) {
  const normalizedLoad = Number.isFinite(relativeOpticalLoad)
    ? Math.min(1, Math.max(0, relativeOpticalLoad))
    : 0
  const active = phase === 'measuring' || phase === 'complete'
  const detectorIntensity = active ? 0.45 + normalizedLoad * 1.55 : 0.08

  return (
    <group position={[0, 0.34, 0]}>
      <mesh position={[-0.82, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.12, 16]} />
        <meshStandardMaterial color={'#324b49'} roughness={0.52} />
      </mesh>
      <mesh position={[-0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.032, 0.05, 16]} />
        <meshStandardMaterial
          color={phase === 'measuring' ? '#fff0a8' : '#8e8060'}
          emissive={phase === 'measuring' ? '#ffe062' : '#2a251c'}
          emissiveIntensity={phase === 'measuring' ? 2.2 : 0.12}
        />
      </mesh>

      {phase === 'measuring' ? (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.48, 0.008, 0.008]} />
          <meshBasicMaterial
            color={'#ffe585'}
            transparent
            opacity={0.68}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      <mesh position={[0, 0, 0.4]}>
        <boxGeometry args={[0.1, 0.14, 0.1]} />
        <meshStandardMaterial color={'#324b49'} roughness={0.52} />
      </mesh>
      <mesh position={[0, 0, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.032, 16]} />
        <meshStandardMaterial
          color={active ? '#76e8dc' : '#55726e'}
          emissive={active ? '#35bdb1' : '#182927'}
          emissiveIntensity={detectorIntensity}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0.12, 0.12, 0.4]} visible={phase === 'complete'}>
        <sphereGeometry args={[0.03, 12, 8]} />
        <meshStandardMaterial
          color={'#ffcf7d'}
          emissive={'#d38226'}
          emissiveIntensity={0.8 + normalizedLoad}
          toneMapped={false}
        />
      </mesh>

      <group visible={phase === 'refilling'}>
        <mesh position={[0.46, 0.43, -0.18]}>
          <cylinderGeometry args={[0.012, 0.018, 0.5, 12]} />
          <meshStandardMaterial
            color={'#8ce9df'}
            emissive={'#2c8e89'}
            emissiveIntensity={0.45}
            transparent
            opacity={0.62}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0.46, 0.18, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.045, 0.006, 8, 20]} />
          <meshBasicMaterial
            color={'#a4f2ea'}
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  )
}
