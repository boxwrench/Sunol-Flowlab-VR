import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Color, Group, InstancedMesh, Matrix4, Vector3 } from 'three'

import type { AppCommand, DoseIndex } from '../app/commands'
import {
  createDetentControlState,
  doseIndexToAngle,
  engageDetentControl,
  hoverDetentControl,
  moveDetentControl,
  releaseDetentControl,
  selectDetent,
  setDetentControlLocked,
  syncDetentControl,
  type DetentControlState,
  type XrControlHandedness,
} from './interactionState'

interface DoseLeverProps {
  readonly dose: DoseIndex
  readonly emitCommand: (command: AppCommand) => void
  readonly locked: boolean
  readonly recordState: (state: DetentControlState) => void
}

interface DetentTick {
  readonly angle: number
  readonly dose: DoseIndex
  readonly position: readonly [number, number, number]
}

const DETENT_RADIUS_METERS = 0.26
const LABEL_RADIUS_METERS = 0.32
const LABEL_DIGIT_WIDTH_METERS = 0.024
const LABEL_DIGIT_HEIGHT_METERS = 0.04
const LABEL_SEGMENT_THICKNESS_METERS = 0.005
const LABEL_DIGIT_ADVANCE_METERS = 0.032

type LabelSegment = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'

const DIGIT_SEGMENTS: Readonly<Record<string, readonly LabelSegment[]>> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'd', 'e', 'g'],
  '3': ['a', 'b', 'c', 'd', 'g'],
  '4': ['b', 'c', 'f', 'g'],
  '5': ['a', 'c', 'd', 'f', 'g'],
  '6': ['a', 'c', 'd', 'e', 'f', 'g'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
}

const LABEL_SEGMENT_COUNT = Array.from({ length: 11 }, (_, dose) =>
  String(dose)
    .split('')
    .reduce((count, digit) => count + DIGIT_SEGMENTS[digit].length, 0),
).reduce((total, count) => total + count, 0)

const LABEL_COLOR = new Color('#e2fff8')
const SELECTED_LABEL_COLOR = new Color('#ffcf7d')

export function DoseLever({
  dose,
  emitCommand,
  locked,
  recordState,
}: DoseLeverProps) {
  const mountRef = useRef<Group>(null)
  const localPoint = useMemo(() => new Vector3(), [])
  const stateRef = useRef(createDetentControlState(dose))
  const [visualState, setVisualState] = useState(stateRef.current)
  const ticks = useMemo<readonly DetentTick[]>(
    () =>
      Array.from({ length: 11 }, (_, index) => {
        const tickDose = index as DoseIndex
        const angle = doseIndexToAngle(tickDose)
        return {
          angle,
          dose: tickDose,
          position: [
            Math.sin(angle) * DETENT_RADIUS_METERS,
            0.055,
            Math.cos(angle) * DETENT_RADIUS_METERS,
          ],
        }
      }),
    [],
  )

  useEffect(() => {
    const nextState = syncDetentControl(stateRef.current, dose)
    commitState(nextState)
  }, [dose])

  useEffect(() => {
    commitState(setDetentControlLocked(stateRef.current, locked))
  }, [locked])

  function commitState(nextState: DetentControlState, command?: AppCommand) {
    if (nextState !== stateRef.current) {
      stateRef.current = nextState
      setVisualState(nextState)
      recordState(nextState)
    }
    if (command !== undefined) emitCommand(command)
  }

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    event.eventObject.setPointerCapture?.(event.pointerId)
    const engaged = engageDetentControl(
      stateRef.current,
      event.pointerId,
      handednessFromEvent(event),
    )
    commitState(engaged)
  }

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (stateRef.current.interaction.pointerId !== event.pointerId) return
    const mount = mountRef.current
    if (mount === null) return
    localPoint.copy(event.point)
    mount.worldToLocal(localPoint)
    const angle = Math.atan2(localPoint.x, localPoint.z)
    const transition = moveDetentControl(stateRef.current, angle)
    commitState(transition.state, transition.command)
  }

  function handlePointerRelease(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    event.eventObject.releasePointerCapture?.(event.pointerId)
    commitState(releaseDetentControl(stateRef.current, event.pointerId))
  }

  function handleTickSelection(
    event: ThreeEvent<PointerEvent>,
    tickDose: DoseIndex,
  ) {
    event.stopPropagation()
    const engaged = engageDetentControl(
      stateRef.current,
      event.pointerId,
      handednessFromEvent(event),
    )
    const transition = selectDetent(engaged, tickDose)
    commitState(
      releaseDetentControl(transition.state, event.pointerId),
      transition.command,
    )
  }

  const active = visualState.interaction.pointerId !== null
  const leverColor = locked ? '#667773' : active ? '#ffbd59' : '#65d8cf'

  return (
    <group ref={mountRef} position={[-0.37, 0, -0.05]} scale={0.5625}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 32]} />
        <meshStandardMaterial color={'#263f3c'} roughness={0.78} />
      </mesh>

      {ticks.map((tick) => (
        <mesh
          key={tick.dose}
          position={[...tick.position]}
          rotation={[0, tick.angle, 0]}
          onPointerDown={(event) => handleTickSelection(event, tick.dose)}
        >
          <boxGeometry
            args={[
              tick.dose === dose ? 0.055 : tick.dose % 5 === 0 ? 0.045 : 0.03,
              tick.dose === dose ? 0.055 : 0.04,
              tick.dose % 5 === 0 ? 0.1 : 0.08,
            ]}
          />
          <meshStandardMaterial
            color={
              tick.dose === dose
                ? '#ffbd59'
                : tick.dose % 5 === 0
                  ? '#e2fff8'
                  : '#89afa7'
            }
            emissive={tick.dose === dose ? '#7a3f12' : '#162d2b'}
            emissiveIntensity={tick.dose === dose ? 0.55 : 0.2}
          />
        </mesh>
      ))}
      <DialLabels selectedDose={dose} />

      <group
        rotation={[0, doseIndexToAngle(visualState.dose), 0]}
        onPointerEnter={() =>
          commitState(hoverDetentControl(stateRef.current, true))
        }
        onPointerLeave={() =>
          commitState(hoverDetentControl(stateRef.current, false))
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerRelease}
        onPointerCancel={handlePointerRelease}
      >
        <mesh position={[0, 0.09, 0.16]}>
          <boxGeometry args={[0.06, 0.07, 0.32]} />
          <meshStandardMaterial
            color={leverColor}
            emissive={active ? '#7a3f12' : '#174f4d'}
            emissiveIntensity={0.45}
            roughness={0.45}
          />
        </mesh>
        <mesh position={[0, 0.13, 0.36]}>
          <sphereGeometry args={[0.085, 20, 12]} />
          <meshStandardMaterial
            color={leverColor}
            emissive={active ? '#7a3f12' : '#174f4d'}
            emissiveIntensity={0.45}
            roughness={0.38}
          />
        </mesh>
        <mesh position={[0, 0.13, 0.36]}>
          <sphereGeometry args={[0.13, 16, 10]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            colorWrite={false}
          />
        </mesh>
      </group>
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.11, 24]} />
        <meshStandardMaterial color={'#a8c8c1'} roughness={0.4} />
      </mesh>
      {locked ? (
        <mesh position={[0, 0.17, 0.18]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.28, 0.035, 0.035]} />
          <meshStandardMaterial color={'#b78345'} roughness={0.5} />
        </mesh>
      ) : null}
    </group>
  )
}

function DialLabels({ selectedDose }: { readonly selectedDose: DoseIndex }) {
  const meshRef = useRef<InstancedMesh>(null)
  const matrix = useMemo(() => new Matrix4(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (mesh === null) return
    let instance = 0

    for (let dose = 0; dose <= 10; dose += 1) {
      const detent = dose as DoseIndex
      const angle = doseIndexToAngle(detent)
      const labelX = Math.sin(angle) * LABEL_RADIUS_METERS
      const labelZ = Math.cos(angle) * LABEL_RADIUS_METERS
      const digits = String(dose)

      for (let digitIndex = 0; digitIndex < digits.length; digitIndex += 1) {
        const digit = digits[digitIndex]
        const digitX =
          labelX +
          (digitIndex - (digits.length - 1) / 2) * LABEL_DIGIT_ADVANCE_METERS

        for (const segment of DIGIT_SEGMENTS[digit]) {
          const dimensions = labelSegmentDimensions(segment)
          const offset = labelSegmentOffset(segment)
          matrix.makeScale(dimensions[0], 0.006, dimensions[1])
          matrix.setPosition(digitX + offset[0], 0.062, labelZ + offset[1])
          mesh.setMatrixAt(instance, matrix)
          mesh.setColorAt(
            instance,
            dose === selectedDose ? SELECTED_LABEL_COLOR : LABEL_COLOR,
          )
          instance += 1
        }
      }
    }

    mesh.count = instance
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor !== null) mesh.instanceColor.needsUpdate = true
  }, [matrix, selectedDose])

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, LABEL_SEGMENT_COUNT]}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  )
}

function labelSegmentDimensions(
  segment: LabelSegment,
): readonly [number, number] {
  const horizontal = segment === 'a' || segment === 'd' || segment === 'g'
  return horizontal
    ? [LABEL_DIGIT_WIDTH_METERS, LABEL_SEGMENT_THICKNESS_METERS]
    : [LABEL_SEGMENT_THICKNESS_METERS, LABEL_DIGIT_HEIGHT_METERS / 2]
}

function labelSegmentOffset(segment: LabelSegment): readonly [number, number] {
  switch (segment) {
    case 'a':
      return [0, -LABEL_DIGIT_HEIGHT_METERS / 2]
    case 'd':
      return [0, LABEL_DIGIT_HEIGHT_METERS / 2]
    case 'g':
      return [0, 0]
    case 'b':
      return [LABEL_DIGIT_WIDTH_METERS / 2, -LABEL_DIGIT_HEIGHT_METERS / 4]
    case 'c':
      return [LABEL_DIGIT_WIDTH_METERS / 2, LABEL_DIGIT_HEIGHT_METERS / 4]
    case 'e':
      return [-LABEL_DIGIT_WIDTH_METERS / 2, LABEL_DIGIT_HEIGHT_METERS / 4]
    case 'f':
      return [-LABEL_DIGIT_WIDTH_METERS / 2, -LABEL_DIGIT_HEIGHT_METERS / 4]
  }
}

function handednessFromEvent(
  event: ThreeEvent<PointerEvent>,
): XrControlHandedness {
  const pointerState = (
    event as ThreeEvent<PointerEvent> & {
      readonly pointerState?: unknown
    }
  ).pointerState
  if (typeof pointerState !== 'object' || pointerState === null) return 'none'
  if (!('inputSource' in pointerState)) return 'none'
  const inputSource = pointerState.inputSource
  if (typeof inputSource !== 'object' || inputSource === null) return 'none'
  if (!('handedness' in inputSource)) return 'none'
  return inputSource.handedness === 'left' || inputSource.handedness === 'right'
    ? inputSource.handedness
    : 'none'
}
