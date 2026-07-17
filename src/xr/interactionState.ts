import {
  requireDoseIndex,
  type AppCommand,
  type DoseIndex,
} from '../app/commands'

export const DOSE_LEVER_MIN_ANGLE = (-50 * Math.PI) / 180
export const DOSE_LEVER_MAX_ANGLE = (50 * Math.PI) / 180

export type XrControlHandedness = 'left' | 'right' | 'none'

export type DetentInteractionPhase =
  'idle' | 'hovered' | 'engaged' | 'moving' | 'snapped' | 'locked'

export interface DetentInteractionState {
  readonly phase: DetentInteractionPhase
  readonly pointerId: number | null
  readonly handedness: XrControlHandedness
}

export interface DetentControlState {
  readonly interaction: DetentInteractionState
  readonly dose: DoseIndex
  readonly lastEmittedDose: DoseIndex
}

export type ButtonInteractionPhase =
  'idle' | 'hovered' | 'pressed' | 'released' | 'locked'

export interface StartButtonState {
  readonly phase: ButtonInteractionPhase
  readonly pointerId: number | null
  readonly handedness: XrControlHandedness
}

export interface CommandTransition<TState> {
  readonly state: TState
  readonly command?: AppCommand
}

const IDLE_INTERACTION: DetentInteractionState = {
  phase: 'idle',
  pointerId: null,
  handedness: 'none',
}

export function angleToDoseIndex(angle: number): DoseIndex {
  if (!Number.isFinite(angle)) {
    throw new RangeError('Lever angle must be finite')
  }
  const clamped = Math.min(
    DOSE_LEVER_MAX_ANGLE,
    Math.max(DOSE_LEVER_MIN_ANGLE, angle),
  )
  const normalized =
    (clamped - DOSE_LEVER_MIN_ANGLE) /
    (DOSE_LEVER_MAX_ANGLE - DOSE_LEVER_MIN_ANGLE)
  return requireDoseIndex(Math.round(normalized * 10))
}

export function doseIndexToAngle(dose: DoseIndex): number {
  return (
    DOSE_LEVER_MIN_ANGLE +
    (dose / 10) * (DOSE_LEVER_MAX_ANGLE - DOSE_LEVER_MIN_ANGLE)
  )
}

export function createDetentControlState(dose: DoseIndex): DetentControlState {
  return {
    dose,
    interaction: IDLE_INTERACTION,
    lastEmittedDose: dose,
  }
}

export function hoverDetentControl(
  state: DetentControlState,
  hovered: boolean,
): DetentControlState {
  if (state.interaction.phase === 'locked') return state
  if (state.interaction.pointerId !== null) return state
  return {
    ...state,
    interaction: {
      ...IDLE_INTERACTION,
      phase: hovered ? 'hovered' : 'idle',
    },
  }
}

export function engageDetentControl(
  state: DetentControlState,
  pointerId: number,
  handedness: XrControlHandedness,
): DetentControlState {
  if (state.interaction.phase === 'locked') return state
  return {
    ...state,
    interaction: {
      phase: 'engaged',
      pointerId,
      handedness,
    },
  }
}

export function moveDetentControl(
  state: DetentControlState,
  angle: number,
): CommandTransition<DetentControlState> {
  if (
    state.interaction.phase === 'locked' ||
    state.interaction.pointerId === null
  ) {
    return { state }
  }
  return moveToDose(state, angleToDoseIndex(angle))
}

export function selectDetent(
  state: DetentControlState,
  dose: DoseIndex,
): CommandTransition<DetentControlState> {
  if (state.interaction.phase === 'locked') return { state }
  return moveToDose(state, requireDoseIndex(dose))
}

export function releaseDetentControl(
  state: DetentControlState,
  pointerId: number,
): DetentControlState {
  if (
    state.interaction.phase === 'locked' ||
    state.interaction.pointerId !== pointerId
  ) {
    return state
  }
  return {
    ...state,
    interaction: {
      phase: 'snapped',
      pointerId: null,
      handedness: 'none',
    },
  }
}

export function syncDetentControl(
  state: DetentControlState,
  dose: DoseIndex,
): DetentControlState {
  const nextDose = requireDoseIndex(dose)
  if (state.dose === nextDose && state.lastEmittedDose === nextDose)
    return state
  return {
    ...state,
    dose: nextDose,
    lastEmittedDose: nextDose,
  }
}

export function setDetentControlLocked(
  state: DetentControlState,
  locked: boolean,
): DetentControlState {
  return {
    ...state,
    interaction: locked
      ? { phase: 'locked', pointerId: null, handedness: 'none' }
      : IDLE_INTERACTION,
  }
}

export function createStartButtonState(): StartButtonState {
  return {
    phase: 'idle',
    pointerId: null,
    handedness: 'none',
  }
}

export function hoverStartButton(
  state: StartButtonState,
  hovered: boolean,
): StartButtonState {
  if (state.phase === 'locked' || state.phase === 'pressed') return state
  return {
    phase: hovered ? 'hovered' : 'idle',
    pointerId: null,
    handedness: 'none',
  }
}

export function pressStartButton(
  state: StartButtonState,
  pointerId: number,
  handedness: XrControlHandedness,
): CommandTransition<StartButtonState> {
  if (state.phase === 'locked' || state.phase === 'pressed') return { state }
  return {
    command: { type: 'START_TRIAL' },
    state: {
      phase: 'pressed',
      pointerId,
      handedness,
    },
  }
}

export function releaseStartButton(
  state: StartButtonState,
  pointerId: number,
): StartButtonState {
  if (state.phase === 'locked' || state.pointerId !== pointerId) return state
  return {
    phase: 'released',
    pointerId: null,
    handedness: 'none',
  }
}

export function setStartButtonLocked(
  state: StartButtonState,
  locked: boolean,
): StartButtonState {
  return locked
    ? { phase: 'locked', pointerId: null, handedness: 'none' }
    : createStartButtonState()
}

function moveToDose(
  state: DetentControlState,
  dose: DoseIndex,
): CommandTransition<DetentControlState> {
  if (
    dose === state.dose &&
    dose === state.lastEmittedDose &&
    state.interaction.phase === 'moving'
  ) {
    return { state }
  }
  const nextState: DetentControlState = {
    dose,
    interaction: {
      ...state.interaction,
      phase: 'moving',
    },
    lastEmittedDose: dose,
  }
  if (dose === state.lastEmittedDose) return { state: nextState }
  return {
    command: { type: 'SET_DOSE', dose },
    state: nextState,
  }
}
