import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, InstancedMesh, Matrix4 } from 'three'

import type { ParticleStateView } from '../sim'

const PRIMARY_PARTICLE_DIAMETER = 0.1
const PRIMARY_PARTICLE_DISPLAY_RADIUS_METERS = 0.01
const POSITION_FOLLOW_SECONDS = 0.06
const SCALE_FOLLOW_SECONDS = 0.16
const MERGE_EXIT_SECONDS = 0.24
const PARTICLE_COLOR = new Color('#c7ded8')
const BACKGROUND_COLOR = new Color('#081719')

interface ParticlePresentationState {
  readonly positionX: Float32Array
  readonly positionY: Float32Array
  readonly positionZ: Float32Array
  readonly scale: Float32Array
  readonly exitScale: Float32Array
  readonly exitSecondsRemaining: Float32Array
  readonly wasActive: Uint8Array
  previousActiveCount: number
}

export function particleDisplayRadius(diameter: number): number {
  if (!Number.isFinite(diameter) || diameter <= 0) return 0
  return (
    PRIMARY_PARTICLE_DISPLAY_RADIUS_METERS *
    (diameter / PRIMARY_PARTICLE_DIAMETER)
  )
}

function makePresentationState(capacity: number): ParticlePresentationState {
  return {
    positionX: new Float32Array(capacity),
    positionY: new Float32Array(capacity),
    positionZ: new Float32Array(capacity),
    scale: new Float32Array(capacity),
    exitScale: new Float32Array(capacity),
    exitSecondsRemaining: new Float32Array(capacity),
    wasActive: new Uint8Array(capacity),
    previousActiveCount: 0,
  }
}

function followBlend(deltaSeconds: number, timeConstantSeconds: number) {
  return 1 - Math.exp(-Math.min(deltaSeconds, 0.05) / timeConstantSeconds)
}

export type ParticleFrameRecorder = (
  frameMs: number,
  instanceSyncMs: number,
  activeParticles: number,
  drawCalls: number,
) => void

interface ParticleCloudProps {
  readonly animateTransitions?: boolean
  readonly presentationEpoch?: number
  readonly state: ParticleStateView
  readonly recordFrame: ParticleFrameRecorder
}

export function ParticleCloud({
  animateTransitions = true,
  presentationEpoch = 0,
  state,
  recordFrame,
}: ParticleCloudProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const transform = useMemo(() => new Matrix4(), [])
  const instanceColor = useMemo(() => new Color(), [])
  const presentation = useMemo(
    () => makePresentationState(state.capacity),
    [state.capacity],
  )
  const previousPresentationEpoch = useRef(presentationEpoch)

  useFrame(({ gl }, deltaSeconds) => {
    const syncStart = performance.now()
    const mesh = meshRef.current
    if (mesh === null) return
    const resetDetected =
      !animateTransitions ||
      presentationEpoch !== previousPresentationEpoch.current ||
      state.activeCount > presentation.previousActiveCount
    const positionBlend = followBlend(deltaSeconds, POSITION_FOLLOW_SECONDS)
    const scaleBlend = followBlend(deltaSeconds, SCALE_FOLLOW_SECONDS)
    let instance = 0
    for (let index = 0; index < state.capacity; index += 1) {
      const active = state.active[index] !== 0
      const wasActive = presentation.wasActive[index] !== 0

      if (resetDetected) {
        presentation.exitSecondsRemaining[index] = 0
        presentation.wasActive[index] = active ? 1 : 0
        if (!active) continue
        presentation.positionX[index] = state.positionX[index]
        presentation.positionY[index] = state.positionY[index]
        presentation.positionZ[index] = state.positionZ[index]
        presentation.scale[index] = particleDisplayRadius(state.diameter[index])
      } else if (active) {
        const targetScale = particleDisplayRadius(state.diameter[index])
        if (!wasActive) {
          presentation.positionX[index] = state.positionX[index]
          presentation.positionY[index] = state.positionY[index]
          presentation.positionZ[index] = state.positionZ[index]
          presentation.scale[index] = targetScale
        } else {
          presentation.positionX[index] +=
            (state.positionX[index] - presentation.positionX[index]) *
            positionBlend
          presentation.positionY[index] +=
            (state.positionY[index] - presentation.positionY[index]) *
            positionBlend
          presentation.positionZ[index] +=
            (state.positionZ[index] - presentation.positionZ[index]) *
            positionBlend
          presentation.scale[index] +=
            (targetScale - presentation.scale[index]) * scaleBlend
        }
        presentation.exitSecondsRemaining[index] = 0
        presentation.wasActive[index] = 1
      } else if (wasActive) {
        presentation.wasActive[index] = 0
        presentation.exitScale[index] = presentation.scale[index]
        presentation.exitSecondsRemaining[index] = MERGE_EXIT_SECONDS
      } else if (presentation.exitSecondsRemaining[index] > 0) {
        presentation.exitSecondsRemaining[index] = Math.max(
          0,
          presentation.exitSecondsRemaining[index] - deltaSeconds,
        )
      } else {
        continue
      }

      const exitFraction = active
        ? 1
        : presentation.exitSecondsRemaining[index] / MERGE_EXIT_SECONDS
      if (exitFraction <= 0) continue
      const scale = active
        ? presentation.scale[index]
        : presentation.exitScale[index] * exitFraction
      transform.makeScale(scale, scale, scale)
      transform.setPosition(
        presentation.positionX[index],
        presentation.positionY[index],
        presentation.positionZ[index],
      )
      mesh.setMatrixAt(instance, transform)
      instanceColor
        .copy(PARTICLE_COLOR)
        .lerp(BACKGROUND_COLOR, (1 - exitFraction) * 0.8)
      mesh.setColorAt(instance, instanceColor)
      instance += 1
    }
    presentation.previousActiveCount = state.activeCount
    previousPresentationEpoch.current = presentationEpoch
    mesh.count = instance
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor !== null) mesh.instanceColor.needsUpdate = true
    recordFrame(
      deltaSeconds * 1000,
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
