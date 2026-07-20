import type { ReactNode } from 'react'

export function ControlDashboard({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <group position={[-0.35, 0, 0]}>
      <mesh position={[0, -0.055, -0.06]}>
        <boxGeometry args={[1.125, 0.11, 0.585]} />
        <meshStandardMaterial color={'#304844'} roughness={0.76} />
      </mesh>
      <mesh position={[0, 0.005, 0.2175]}>
        <boxGeometry args={[1.125, 0.055, 0.045]} />
        <meshStandardMaterial color={'#6f8b84'} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.005, -0.3375]}>
        <boxGeometry args={[1.125, 0.055, 0.045]} />
        <meshStandardMaterial color={'#6f8b84'} roughness={0.58} />
      </mesh>
      {children}
    </group>
  )
}
