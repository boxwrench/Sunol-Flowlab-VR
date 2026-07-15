import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { InstancedMesh, Matrix4 } from 'three'

import { developmentPerformance } from '../app/performance'
import {
  DEFAULT_PARTICLE_CAPACITY,
  FixedStepClock,
  createParticleState,
  resetParticleState,
  stepParticleDrift,
} from '../sim'

const PARTICLE_SCALE = 0.012
const CANONICAL_SEED = 0x5f3759df

export function ParticleCloud() {
  const meshRef = useRef<InstancedMesh>(null)
  const transform = useMemo(() => new Matrix4(), [])
  const state = useMemo(() => {
    const created = createParticleState(DEFAULT_PARTICLE_CAPACITY)
    resetParticleState(created, CANONICAL_SEED)
    return created
  }, [])
  const clock = useMemo(() => {
    const created = new FixedStepClock(1 / 60, 5)
    created.start()
    return created
  }, [])
  const stepSimulation = useMemo(
    () => (timestepSeconds: number) => stepParticleDrift(state, timestepSeconds),
    [state],
  )

  useFrame(({ gl }, elapsedSeconds) => {
    const simulationStart = performance.now()
    clock.advance(elapsedSeconds, stepSimulation)
    const simulationEnd = performance.now()

    const mesh = meshRef.current
    if (mesh === null) return
    let instance = 0
    for (let index = 0; index < state.capacity; index += 1) {
      if (state.active[index] === 0) continue
      transform.makeScale(PARTICLE_SCALE, PARTICLE_SCALE, PARTICLE_SCALE)
      transform.setPosition(state.positionX[index], state.positionY[index], state.positionZ[index])
      mesh.setMatrixAt(instance, transform)
      instance += 1
    }
    mesh.count = instance
    mesh.instanceMatrix.needsUpdate = true
    const syncEnd = performance.now()

    developmentPerformance.record(
      elapsedSeconds * 1000,
      simulationEnd - simulationStart,
      syncEnd - simulationEnd,
      instance,
      gl.info.render.calls,
    )
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, state.capacity]} frustumCulled={false}>
      <sphereGeometry args={[1, 5, 4]} />
      <meshStandardMaterial color="#c7ded8" roughness={0.75} />
    </instancedMesh>
  )
}

