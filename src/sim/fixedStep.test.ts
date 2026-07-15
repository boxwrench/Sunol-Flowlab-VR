import { describe, expect, it, vi } from 'vitest'

import { FixedStepClock } from './fixedStep'

describe('FixedStepClock', () => {
  it('executes the exact number of accumulated fixed steps', () => {
    const clock = new FixedStepClock(0.01, 10)
    const step = vi.fn()
    clock.start()

    expect(clock.advance(0.025, step)).toBe(2)
    expect(clock.advance(0.025, step)).toBe(3)
    expect(step).toHaveBeenCalledTimes(5)
    expect(step).toHaveBeenLastCalledWith(0.01)
    expect(clock.snapshot()).toMatchObject({
      stepCount: 5,
      simulationTimeSeconds: 0.05,
    })
  })

  it('caps catch-up work and records discarded wall-clock time', () => {
    const clock = new FixedStepClock(0.01, 3)
    const step = vi.fn()
    clock.start()

    expect(clock.advance(0.1, step)).toBe(3)
    expect(clock.snapshot().droppedSeconds).toBeCloseTo(0.07, 12)
  })

  it('does not advance while paused but permits explicit headless steps', () => {
    const clock = new FixedStepClock(0.02)
    const step = vi.fn()

    expect(clock.advance(1, step)).toBe(0)
    clock.stepHeadless(4, step)
    expect(clock.snapshot()).toMatchObject({
      running: false,
      stepCount: 4,
      simulationTimeSeconds: 0.08,
    })
  })

  it('reset restores the complete clock state', () => {
    const clock = new FixedStepClock(0.01)
    clock.start()
    clock.advance(0.017, () => undefined)
    clock.reset()

    expect(clock.snapshot()).toEqual({
      running: false,
      simulationTimeSeconds: 0,
      stepCount: 0,
      accumulatorSeconds: 0,
      droppedSeconds: 0,
    })
  })

  it('rejects invalid configuration and elapsed time', () => {
    expect(() => new FixedStepClock(0)).toThrow(RangeError)
    expect(() => new FixedStepClock(0.01, 0)).toThrow(RangeError)

    const clock = new FixedStepClock()
    clock.start()
    expect(() => clock.advance(Number.NaN, () => undefined)).toThrow(RangeError)
    expect(() => clock.stepHeadless(1.5, () => undefined)).toThrow(RangeError)
  })
})
