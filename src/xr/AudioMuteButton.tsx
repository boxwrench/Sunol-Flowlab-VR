import type { ThreeEvent } from '@react-three/fiber'
import { useState, type ReactNode } from 'react'

import type { ProcessAudioCommand } from '../app/ProcessAudio'

interface AudioMuteButtonProps {
  readonly emitCommand: (command: ProcessAudioCommand) => void
  readonly label: ReactNode
  readonly muted: boolean
}

export function AudioMuteButton({
  emitCommand,
  label,
  muted,
}: AudioMuteButtonProps) {
  const [hovered, setHovered] = useState(false)

  function toggle(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    emitCommand({ type: 'TOGGLE_MUTE' })
  }

  return (
    <group position={[0.11, 0, -0.05]} scale={0.58}>
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.26, 0.07, 0.22]} />
        <meshStandardMaterial color={'#263f3c'} roughness={0.76} />
      </mesh>
      <mesh
        position={[0, 0.085, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={toggle}
      >
        <boxGeometry args={[0.18, 0.06, 0.14]} />
        <meshStandardMaterial
          color={muted ? '#c6814d' : hovered ? '#8de4dc' : '#65cfc7'}
          emissive={muted ? '#55260d' : '#174f4d'}
          emissiveIntensity={hovered ? 0.7 : 0.42}
          roughness={0.45}
        />
      </mesh>
      {label}
    </group>
  )
}
