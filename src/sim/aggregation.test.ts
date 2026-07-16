import { describe, expect, it } from 'vitest'

import {
  createMergeDiagnostics,
  mergeParticlePair,
  stepDeterministicAggregation,
} from './aggregation'
import { stepCoagulation } from './coagulation'
import {
  DEFAULT_PARTICLE_BOUNDS,
  createParticleState,
  particleDiameterIsConsistent,
  resetParticleState,
  setParticleMass,
} from './particleState'

describe('deterministic mass-conserving aggregation', () => {
  it('schedules every unordered slot pair once per offset cycle', () => {
    const state = createParticleState(5)
    resetParticleState(state, 1)
    const diagnostics = createMergeDiagnostics()

    for (let step = 0; step < state.capacity - 1; step += 1)
      stepDeterministicAggregation(state, step, 1, 0, diagnostics)

    expect(diagnostics.candidatePairEvaluations).toBe(10)
    expect(diagnostics.mergeCount).toBe(0)
    expect(state.activeCount).toBe(5)
  })

  it('conserves mass and applies mass-weighted position and velocity', () => {
    const state = createParticleState(2)
    resetParticleState(state, 2)
    setParticleMass(state, 0, 1)
    setParticleMass(state, 1, 3)
    state.positionX[0] = 0
    state.positionX[1] = 0.4
    state.velocityX[0] = -0.2
    state.velocityX[1] = 0.6

    mergeParticlePair(state, 0, 1)

    expect(state.activeCount).toBe(1)
    expect(state.mass[0]).toBe(4)
    expect(state.positionX[0]).toBeCloseTo(0.3)
    expect(state.velocityX[0]).toBeCloseTo(0.4)
    expect(particleDiameterIsConsistent(state, 0)).toBe(true)
    expect(state.active[1]).toBe(0)
    expect(state.mass[1]).toBe(0)
    expect(state.diameter[1]).toBe(0)
    expect(state.positionX[1]).toBe(0)
    expect(state.velocityX[1]).toBe(0)
  })

  it('reproduces the same merge digest and final state', () => {
    const first = createParticleState(16)
    const second = createParticleState(16)
    resetParticleState(first, 77)
    resetParticleState(second, 77)
    first.positionX.fill(0)
    first.positionY.fill(0.5)
    first.positionZ.fill(0)
    second.positionX.set(first.positionX)
    second.positionY.set(first.positionY)
    second.positionZ.set(first.positionZ)
    const firstDiagnostics = createMergeDiagnostics()
    const secondDiagnostics = createMergeDiagnostics()

    for (let step = 0; step < 20; step += 1) {
      stepDeterministicAggregation(first, step, 77, 0.55, firstDiagnostics)
      stepDeterministicAggregation(second, step, 77, 0.55, secondDiagnostics)
    }

    expect(secondDiagnostics).toEqual(firstDiagnostics)
    expect(second.active).toEqual(first.active)
    expect(second.mass).toEqual(first.mass)
    expect(second.diameter).toEqual(first.diameter)
    expect(second.velocityX).toEqual(first.velocityX)
  })

  it('uses the lower slot as survivor and rejects invalid merge order', () => {
    const state = createParticleState(2)
    resetParticleState(state, 4)
    expect(() => mergeParticlePair(state, 1, 0)).toThrow(RangeError)

    const diagnostics = createMergeDiagnostics()
    state.positionX.fill(0)
    state.positionY.fill(0.5)
    state.positionZ.fill(0)
    stepDeterministicAggregation(state, 0, 4, 1, diagnostics)
    expect(state.active[0]).toBe(1)
    expect(state.active[1]).toBe(0)
    expect(diagnostics.mergeCount).toBe(1)
  })

  it('prohibits merges beyond the configured growth bound without losing mass', () => {
    const state = createParticleState(2)
    resetParticleState(state, 5)
    setParticleMass(state, 0, 5)
    setParticleMass(state, 1, 4)
    state.positionX.fill(0)
    state.positionY.fill(0.5)
    state.positionZ.fill(0)
    const diagnostics = createMergeDiagnostics()

    stepDeterministicAggregation(state, 0, 5, 1, diagnostics, {
      collisionRadiusMultiplier: 1.15,
      maximumAggregateMass: 8,
    })

    expect(state.activeCount).toBe(2)
    expect(state.mass[0] + state.mass[1]).toBe(9)
    expect(diagnostics.mergeCount).toBe(0)
  })

  it('keeps the bounded production math finite for 10,000 fixed steps', () => {
    const state = createParticleState(500)
    resetParticleState(state, 0x5f3759df)
    const diagnostics = createMergeDiagnostics()
    const initialMass = state.mass.reduce((total, mass) => total + mass, 0)

    for (let step = 0; step < 10_000; step += 1) {
      stepCoagulation(state, 'flocculation', 1 / 60, 1)
      stepDeterministicAggregation(state, step, 0x5f3759df, 1, diagnostics)
    }

    expect(state.mass.reduce((total, mass) => total + mass, 0)).toBeCloseTo(
      initialMass,
      6,
    )
    expect(state.activeCount).toBeGreaterThanOrEqual(Math.ceil(500 / 8))
    for (let index = 0; index < state.capacity; index += 1) {
      expect(Number.isFinite(state.positionX[index])).toBe(true)
      expect(Number.isFinite(state.positionY[index])).toBe(true)
      expect(Number.isFinite(state.positionZ[index])).toBe(true)
      expect(Number.isFinite(state.velocityX[index])).toBe(true)
      expect(Number.isFinite(state.velocityY[index])).toBe(true)
      expect(Number.isFinite(state.velocityZ[index])).toBe(true)
      if (state.active[index] === 0) continue
      expect(state.mass[index]).toBeGreaterThan(0)
      expect(state.mass[index]).toBeLessThanOrEqual(8)
      expect(particleDiameterIsConsistent(state, index)).toBe(true)
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
    }
  })
})
