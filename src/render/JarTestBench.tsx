import { useLayoutEffect, useMemo, useRef } from 'react'
import { DoubleSide, InstancedMesh, Matrix4 } from 'three'

export const CANONICAL_JAR_DOSES = [0, 2, 4, 6, 8, 10] as const

export function JarTestBench() {
  const jarsRef = useRef<InstancedMesh>(null)
  const paddlesRef = useRef<InstancedMesh>(null)
  const rimsRef = useRef<InstancedMesh>(null)
  const transform = useMemo(() => new Matrix4(), [])

  useLayoutEffect(() => {
    const jars = jarsRef.current
    const paddles = paddlesRef.current
    const rims = rimsRef.current
    if (jars === null || paddles === null || rims === null) return

    for (let index = 0; index < CANONICAL_JAR_DOSES.length; index += 1) {
      const x = (index - 2.5) * 0.25
      transform.makeTranslation(x, 0.22, 0)
      jars.setMatrixAt(index, transform)
      transform.makeTranslation(x, 0.48, 0)
      paddles.setMatrixAt(index, transform)
      transform.makeRotationX(Math.PI / 2)
      transform.setPosition(x, 0.4, 0)
      rims.setMatrixAt(index, transform)
    }
    jars.instanceMatrix.needsUpdate = true
    paddles.instanceMatrix.needsUpdate = true
    rims.instanceMatrix.needsUpdate = true
  }, [transform])

  return (
    <group position={[-1.2, 0.02, 0.48]} rotation={[0, 0.08, 0]} scale={1.08}>
      <instancedMesh
        ref={jarsRef}
        args={[undefined, undefined, CANONICAL_JAR_DOSES.length]}
      >
        <cylinderGeometry args={[0.11, 0.105, 0.36, 16, 1, true]} />
        <meshStandardMaterial
          color={'#b7e1da'}
          side={DoubleSide}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </instancedMesh>
      <instancedMesh
        ref={rimsRef}
        args={[undefined, undefined, CANONICAL_JAR_DOSES.length]}
      >
        <torusGeometry args={[0.108, 0.008, 5, 16]} />
        <meshStandardMaterial color={'#c7eee8'} roughness={0.4} />
      </instancedMesh>
      <instancedMesh
        ref={paddlesRef}
        args={[undefined, undefined, CANONICAL_JAR_DOSES.length]}
      >
        <boxGeometry args={[0.018, 0.35, 0.018]} />
        <meshStandardMaterial color={'#a9b5ad'} roughness={0.5} />
      </instancedMesh>

      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.55, 0.04, 0.34]} />
        <meshStandardMaterial color={'#203b39'} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.69, 0]}>
        <boxGeometry args={[1.58, 0.055, 0.12]} />
        <meshStandardMaterial color={'#405d59'} roughness={0.6} />
      </mesh>
      <mesh position={[-0.78, 0.35, 0]}>
        <boxGeometry args={[0.04, 0.7, 0.1]} />
        <meshStandardMaterial color={'#405d59'} roughness={0.6} />
      </mesh>
      <mesh position={[0.78, 0.35, 0]}>
        <boxGeometry args={[0.04, 0.7, 0.1]} />
        <meshStandardMaterial color={'#405d59'} roughness={0.6} />
      </mesh>
    </group>
  )
}
