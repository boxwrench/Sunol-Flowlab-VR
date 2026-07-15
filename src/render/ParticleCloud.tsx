import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { InstancedMesh, Matrix4 } from 'three'

import type { ParticleStateView } from '../sim'

const PARTICLE_SCALE = 0.012
export type ParticleFrameRecorder = (
  frameMs: number,
  instanceSyncMs: number,
  activeParticles: number,
  drawCalls: number,
) => void

interface ParticleCloudProps {
  readonly state: ParticleStateView
  readonly recordFrame: ParticleFrameRecorder
}

export function ParticleCloud({ state, recordFrame }: ParticleCloudProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const transform = useMemo(() => new Matrix4(), [])

  useFrame(({ gl }, elapsedSeconds) => {
    const syncStart = performance.now()
    const mesh = meshRef.current
    if (mesh === null) return
    let instance = 0
    for (let index = 0; index < state.capacity; index += 1) {
      if (state.active[index] === 0) continue
      const scale = PARTICLE_SCALE * (0.75 + state.normalizedSize[index] * 2.25)
      transform.makeScale(scale, scale, scale)
      transform.setPosition(
        state.positionX[index],
        state.positionY[index],
        state.positionZ[index],
      )
      mesh.setMatrixAt(instance, transform)
      instance += 1
    }
    mesh.count = instance
    mesh.instanceMatrix.needsUpdate = true
    recordFrame(
      elapsedSeconds * 1000,
      performance.now() - syncStart,
      instance,
      gl.info.render.calls,
    )
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, state.capacity]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 5, 4]} />
      <meshStandardMaterial color="#c7ded8" roughness={0.75} />
    </instancedMesh>
  )
}
