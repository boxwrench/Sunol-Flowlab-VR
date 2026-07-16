import { describe, expect, it } from 'vitest'

import {
  DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
  DEFAULT_PARTICLE_BOUNDS,
  PARTICLE_SETTLED,
  PARTICLE_SUSPENDED,
  createParticleState,
  diameterFromMass,
  massFromDiameter,
  particleDiameterIsConsistent,
  resetParticleState,
  setParticleMass,
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
    expect(first.mass).toEqual(second.mass)
    expect(first.diameter).toEqual(second.diameter)
    expect(first.settled).toEqual(second.settled)
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
      expect(state.mass[index]).toBe(
        DEFAULT_AGGREGATE_GEOMETRY_CONFIG.primaryParticleMass,
      )
      expect(state.diameter[index]).toBeCloseTo(
        DEFAULT_AGGREGATE_GEOMETRY_CONFIG.primaryParticleDiameter,
      )
      expect(particleDiameterIsConsistent(state, index)).toBe(true)
      expect(state.settled[index]).toBe(PARTICLE_SUSPENDED)
    }
  })

  it('resets in place and clears inactive slots', () => {
    const state = createParticleState(500)
    const positionX = state.positionX
    const mass = state.mass
    const diameter = state.diameter
    const settled = state.settled
    const active = state.active
    resetParticleState(state, 7)
    setParticleMass(state, 0, 4)
    state.settled[0] = PARTICLE_SETTLED
    setParticleMass(state, 499, 4)
    state.settled[499] = PARTICLE_SETTLED
    resetParticleState(state, 8, 125)

    expect(state.positionX).toBe(positionX)
    expect(state.mass).toBe(mass)
    expect(state.diameter).toBe(diameter)
    expect(state.settled).toBe(settled)
    expect(state.active).toBe(active)
    expect(state.activeCount).toBe(125)
    expect(state.active[124]).toBe(1)
    expect(state.active[125]).toBe(0)
    expect(state.positionX[125]).toBe(0)
    expect(state.mass[0]).toBe(
      DEFAULT_AGGREGATE_GEOMETRY_CONFIG.primaryParticleMass,
    )
    expect(particleDiameterIsConsistent(state, 0)).toBe(true)
    expect(state.settled[0]).toBe(PARTICLE_SUSPENDED)
    expect(state.mass[499]).toBe(0)
    expect(state.diameter[499]).toBe(0)
    expect(particleDiameterIsConsistent(state, 499)).toBe(true)
    expect(state.settled[499]).toBe(PARTICLE_SUSPENDED)
  })

  it('derives cached diameter from authoritative mass at default Df 2', () => {
    const state = createParticleState(2)
    resetParticleState(state, 17)
    setParticleMass(state, 0, 9)

    expect(state.mass[0]).toBe(9)
    expect(state.diameter[0]).toBeCloseTo(0.3)
    expect(diameterFromMass(9)).toBeCloseTo(0.3)
    expect(massFromDiameter(0.3)).toBeCloseTo(9)
    expect(particleDiameterIsConsistent(state, 0)).toBe(true)

    state.diameter[0] = 0.4
    expect(particleDiameterIsConsistent(state, 0)).toBe(false)
  })

  it('rejects invalid mass without corrupting the existing invariant', () => {
    const state = createParticleState(1)
    resetParticleState(state, 19)
    expect(() => setParticleMass(state, 0, Number.NaN)).toThrow(RangeError)
    expect(state.mass[0]).toBe(1)
    expect(particleDiameterIsConsistent(state, 0)).toBe(true)
  })

  it('supports the documented development range without changing the default path', () => {
    const config = {
      ...DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
      fractalDimension: 1.8,
    }
    const diameter = diameterFromMass(9, config)
    expect(diameter).toBeCloseTo(0.1 * 9 ** (1 / 1.8))
    expect(massFromDiameter(diameter, config)).toBeCloseTo(9)
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
