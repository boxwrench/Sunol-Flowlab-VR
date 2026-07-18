import { describe, expect, it } from 'vitest'

import type { DoseIndex } from '../app/commands'
import {
  DOSE_LEVER_MAX_ANGLE,
  DOSE_LEVER_MIN_ANGLE,
  angleToDoseIndex,
  createDetentControlState,
  createStartButtonState,
  doseIndexToAngle,
  engageDetentControl,
  moveDetentControl,
  pressStartButton,
  releaseDetentControl,
  releaseStartButton,
  selectDetent,
  setDetentControlLocked,
  setStartButtonLocked,
} from './interactionState'

describe('11-detent dose interaction model', () => {
  it('round-trips every integer dose through an evenly spaced lever angle', () => {
    for (let dose = 0; dose <= 10; dose += 1) {
      const detent = dose as DoseIndex
      expect(angleToDoseIndex(doseIndexToAngle(detent))).toBe(detent)
    }
  })

  it('clamps mechanical travel and rejects invalid angles', () => {
    expect(angleToDoseIndex(DOSE_LEVER_MIN_ANGLE - 1)).toBe(0)
    expect(angleToDoseIndex(DOSE_LEVER_MAX_ANGLE + 1)).toBe(10)
    expect(() => angleToDoseIndex(Number.NaN)).toThrow(RangeError)
    expect(() => angleToDoseIndex(Number.POSITIVE_INFINITY)).toThrow(RangeError)
  })

  it('emits one integer command when a held lever crosses a detent', () => {
    let state = engageDetentControl(createDetentControlState(5), 7, 'left')
    const first = moveDetentControl(state, doseIndexToAngle(6))
    expect(first.command).toEqual({ type: 'SET_DOSE', dose: 6 })
    state = first.state

    const duplicate = moveDetentControl(state, doseIndexToAngle(6))
    expect(duplicate.command).toBeUndefined()

    const released = releaseDetentControl(duplicate.state, 7)
    expect(released.interaction.phase).toBe('snapped')
    expect(released.dose).toBe(6)
  })

  it('supports direct snapping without weakening the full detent contract', () => {
    let state = createDetentControlState(0)
    for (let dose = 1; dose <= 10; dose += 1) {
      const transition = selectDetent(state, dose as DoseIndex)
      expect(transition.command).toEqual({ type: 'SET_DOSE', dose })
      state = transition.state
    }
  })

  it('suppresses movement and commands while locked', () => {
    const state = setDetentControlLocked(createDetentControlState(5), true)
    const engaged = engageDetentControl(state, 1, 'right')
    const transition = moveDetentControl(engaged, DOSE_LEVER_MAX_ANGLE)

    expect(engaged).toBe(state)
    expect(transition.state).toBe(state)
    expect(transition.command).toBeUndefined()
  })
})

describe('start button latch', () => {
  it('emits exactly once per deliberate press and resets on release', () => {
    const initial = createStartButtonState()
    const pressed = pressStartButton(initial, 3, 'right')
    expect(pressed.command).toEqual({ type: 'START_TRIAL' })

    const held = pressStartButton(pressed.state, 3, 'right')
    expect(held.command).toBeUndefined()

    const released = releaseStartButton(held.state, 3)
    const pressedAgain = pressStartButton(released, 3, 'right')
    expect(pressedAgain.command).toEqual({ type: 'START_TRIAL' })
  })

  it('suppresses presses while locked and resets cleanly when unlocked', () => {
    const locked = setStartButtonLocked(createStartButtonState(), true)
    const suppressed = pressStartButton(locked, 4, 'left')

    expect(suppressed.state).toBe(locked)
    expect(suppressed.command).toBeUndefined()

    const unlocked = setStartButtonLocked(locked, false)
    const pressed = pressStartButton(unlocked, 4, 'left')
    expect(pressed.command).toEqual({ type: 'START_TRIAL' })
  })
})
