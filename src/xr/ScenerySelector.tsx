import type { ThreeEvent } from '@react-three/fiber'
import { useState, type ReactNode } from 'react'

import type { LabPanoramaId } from '../render/PlantEnvironment'

interface ScenerySelectorProps {
  readonly emitSelection: (panorama: LabPanoramaId) => void
  readonly hetchyLabel: ReactNode
  readonly selected: LabPanoramaId
  readonly sunolLabel: ReactNode
}

export function ScenerySelector({
  emitSelection,
  hetchyLabel,
  selected,
  sunolLabel,
}: ScenerySelectorProps) {
  const [hovered, setHovered] = useState<LabPanoramaId | null>(null)

  function select(event: ThreeEvent<PointerEvent>, panorama: LabPanoramaId) {
    event.stopPropagation()
    emitSelection(panorama)
  }

  return (
    <group position={[0.36, 0, -0.03]} scale={0.62}>
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.48, 0.07, 0.24]} />
        <meshStandardMaterial color={'#263f3c'} roughness={0.76} />
      </mesh>
      {(['hetchy', 'sunol'] as const).map((panorama, index) => (
        <mesh
          key={panorama}
          position={[index === 0 ? -0.115 : 0.115, 0.085, 0]}
          onPointerEnter={() => setHovered(panorama)}
          onPointerLeave={() => setHovered(null)}
          onPointerDown={(event) => select(event, panorama)}
        >
          <boxGeometry args={[0.2, 0.06, 0.15]} />
          <meshStandardMaterial
            color={
              selected === panorama
                ? '#e7b85d'
                : hovered === panorama
                  ? '#8de4dc'
                  : '#65cfc7'
            }
            emissive={selected === panorama ? '#68430e' : '#174f4d'}
            emissiveIntensity={hovered === panorama ? 0.7 : 0.42}
            roughness={0.45}
          />
        </mesh>
      ))}
      {hetchyLabel}
      {sunolLabel}
    </group>
  )
}
