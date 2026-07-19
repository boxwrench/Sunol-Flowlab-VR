import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

export interface GhostComparisonPresentationView {
  status: string
  clearingFrontDepth: number
}

interface TreatmentGhostComparisonProps {
  readonly view: GhostComparisonPresentationView
}

const WATER_TOP_Y = 1.18
const WATER_BOTTOM_Y = 0.04

export function ghostClearingFrontY(clearingFrontDepth: number): number {
  const depth = Math.min(1, Math.max(0, clearingFrontDepth))
  return WATER_TOP_Y - depth * (WATER_TOP_Y - WATER_BOTTOM_Y)
}

export function TreatmentGhostComparison({
  view,
}: TreatmentGhostComparisonProps) {
  const markerRef = useRef<Mesh>(null)

  useFrame(() => {
    const marker = markerRef.current
    if (marker === null) return
    marker.visible = view.status !== 'empty'
    marker.position.y = ghostClearingFrontY(view.clearingFrontDepth)
  })

  return (
    <mesh ref={markerRef} position={[0, WATER_TOP_Y, 0.405]} visible={false}>
      <boxGeometry args={[1.12, 0.006, 0.008]} />
      <meshStandardMaterial
        color={'#4fa3aa'}
        emissive={'#1f5960'}
        emissiveIntensity={0.25}
        roughness={0.35}
      />
    </mesh>
  )
}
