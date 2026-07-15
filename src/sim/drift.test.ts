import { describe, expect, it } from 'vitest'

import { stepParticleDrift } from './drift'
import { DEFAULT_PARTICLE_BOUNDS, createParticleState, resetParticleState } from './particleState'

describe('bounded particle drift', () => {
  it('advances active particles using their velocities', () => {
    const state = createParticleState(1)
    resetParticleState(state, 1)
    state.positionX[0] = 0
    state.velocityX[0] = 0.25

    stepParticleDrift(state, 0.2)
    expect(state.positionX[0]).toBeCloseTo(0.05, 6)
  })

  it('reflects at tank walls without leaving the volume', () => {
    const state = createParticleState(1)
    resetParticleState(state, 1)
    state.positionX[0] = DEFAULT_PARTICLE_BOUNDS.maxX - 0.001
    state.velocityX[0] = 1

    stepParticleDrift(state, 0.01)
    expect(state.positionX[0]).toBeLessThanOrEqual(DEFAULT_PARTICLE_BOUNDS.maxX)
    expect(state.velocityX[0]).toBeLessThan(0)
  })

  it('does not modify inactive slots', () => {
    const state = createParticleState(2)
    resetParticleState(state, 5, 1)
    state.positionX[1] = 0.3
    state.velocityX[1] = 1

    stepParticleDrift(state, 0.1)
    expect(state.positionX[1]).toBeCloseTo(0.3)
  })

  it('remains finite and bounded over a long run', () => {
    const state = createParticleState(500)
    resetParticleState(state, 0x5f3759df)

    for (let step = 0; step < 10_000; step += 1) stepParticleDrift(state, 1 / 60)
    for (let index = 0; index < state.capacity; index += 1) {
      expect(Number.isFinite(state.positionX[index])).toBe(true)
      expect(state.positionX[index]).toBeGreaterThanOrEqual(DEFAULT_PARTICLE_BOUNDS.minX)
      expect(state.positionX[index]).toBeLessThanOrEqual(DEFAULT_PARTICLE_BOUNDS.maxX)
    }
  })
})

