import { describe, expect, it } from 'vitest'

import {
  DEFAULT_PARTICLE_BOUNDS,
  createParticleState,
  resetParticleState,
} from './particleState'

describe('seeded particle initialization', () => {
  it('reproduces identical arrays for the same seed', () => {
    const first = createParticleState(500)
    const second = createParticleState(500)
    resetParticleState(first, 0x5f3759df)
    resetParticleState(second, 0x5f3759df)

    expect(first.positionX).toEqual(second.positionX)
    expect(first.positionY).toEqual(second.positionY)
    expect(first.positionZ).toEqual(second.positionZ)
    expect(first.velocityX).toEqual(second.velocityX)
  })

  it('produces meaningfully different positions for another seed', () => {
    const first = createParticleState(500)
    const second = createParticleState(500)
    resetParticleState(first, 101)
    resetParticleState(second, 202)

    let different = 0
    for (let index = 0; index < first.capacity; index += 1) {
      if (first.positionX[index] !== second.positionX[index]) different += 1
    }
    expect(different).toBeGreaterThan(490)
  })

  it('keeps every initialized value finite and inside the tank bounds', () => {
    const state = createParticleState(500)
    resetParticleState(state, 42)

    for (let index = 0; index < state.activeCount; index += 1) {
      expect(state.positionX[index]).toBeGreaterThanOrEqual(
        DEFAULT_PARTICLE_BOUNDS.minX,
      )
      expect(state.positionX[index]).toBeLessThanOrEqual(
        DEFAULT_PARTICLE_BOUNDS.maxX,
      )
      expect(state.positionY[index]).toBeGreaterThanOrEqual(
        DEFAULT_PARTICLE_BOUNDS.minY,
      )
      expect(state.positionY[index]).toBeLessThanOrEqual(
        DEFAULT_PARTICLE_BOUNDS.maxY,
      )
      expect(state.positionZ[index]).toBeGreaterThanOrEqual(
        DEFAULT_PARTICLE_BOUNDS.minZ,
      )
      expect(state.positionZ[index]).toBeLessThanOrEqual(
        DEFAULT_PARTICLE_BOUNDS.maxZ,
      )
      expect(Number.isFinite(state.velocityX[index])).toBe(true)
    }
  })

  it('resets in place and clears inactive slots', () => {
    const state = createParticleState(500)
    const positionX = state.positionX
    const active = state.active
    resetParticleState(state, 7)
    resetParticleState(state, 8, 125)

    expect(state.positionX).toBe(positionX)
    expect(state.active).toBe(active)
    expect(state.activeCount).toBe(125)
    expect(state.active[124]).toBe(1)
    expect(state.active[125]).toBe(0)
    expect(state.positionX[125]).toBe(0)
  })

  it('rejects invalid capacities, counts, seeds, and bounds', () => {
    expect(() => createParticleState(0)).toThrow(RangeError)
    const state = createParticleState(2)
    expect(() => resetParticleState(state, 1, 3)).toThrow(RangeError)
    expect(() => resetParticleState(state, Number.NaN)).toThrow(RangeError)
    expect(() =>
      resetParticleState(state, 1, 2, {
        ...DEFAULT_PARTICLE_BOUNDS,
        minX: 1,
        maxX: 1,
      }),
    ).toThrow(RangeError)
  })
})
