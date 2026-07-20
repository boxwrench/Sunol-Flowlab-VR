import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'

import type { AppCommand } from '../app/commands'
import {
  createStartButtonState,
  hoverStartButton,
  pressStartButton,
  releaseStartButton,
  setStartButtonLocked,
  type StartButtonState,
  type XrControlHandedness,
} from './interactionState'

interface StartButtonProps {
  readonly emitCommand: (command: AppCommand) => void
  readonly locked: boolean
  readonly recordState: (state: StartButtonState) => void
}

export function StartButton({
  emitCommand,
  locked,
  recordState,
}: StartButtonProps) {
  const stateRef = useRef(createStartButtonState())
  const [visualState, setVisualState] = useState(stateRef.current)

  useEffect(() => {
    commitState(setStartButtonLocked(stateRef.current, locked))
  }, [locked])

  function commitState(nextState: StartButtonState, command?: AppCommand) {
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
    const transition = pressStartButton(
      stateRef.current,
      event.pointerId,
      handednessFromEvent(event),
    )
    commitState(transition.state, transition.command)
  }

  function handlePointerRelease(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    event.eventObject.releasePointerCapture?.(event.pointerId)
    commitState(releaseStartButton(stateRef.current, event.pointerId))
  }

  const pressed = visualState.phase === 'pressed'
  const hovered = visualState.phase === 'hovered'

  return (
    <group position={[0.3, 0, 0]} scale={0.75}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.145, 0.17, 0.08, 32]} />
        <meshStandardMaterial color={'#263f3c'} roughness={0.75} />
      </mesh>
      <mesh
        position={[0, pressed ? 0.075 : 0.105, 0]}
        onPointerEnter={() =>
          commitState(hoverStartButton(stateRef.current, true))
        }
        onPointerLeave={() =>
          commitState(hoverStartButton(stateRef.current, false))
        }
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerRelease}
        onPointerCancel={handlePointerRelease}
      >
        <cylinderGeometry args={[0.11, 0.11, 0.09, 32]} />
        <meshStandardMaterial
          color={
            locked
              ? '#68736d'
              : pressed
                ? '#7dcf72'
                : hovered
                  ? '#9ae68e'
                  : '#65c55a'
          }
          emissive={pressed ? '#184d19' : '#123a16'}
          emissiveIntensity={pressed ? 0.75 : 0.4}
          roughness={0.42}
        />
      </mesh>
      {locked ? (
        <mesh position={[0, 0.14, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.22, 0.025, 0.035]} />
          <meshStandardMaterial color={'#b78345'} roughness={0.5} />
        </mesh>
      ) : null}
    </group>
  )
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
