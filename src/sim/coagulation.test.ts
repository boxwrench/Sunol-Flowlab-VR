import { describe, expect, it } from 'vitest'

import {
  settlingSpeedForDiameter,
  stepCoagulation,
  totalTreatmentSteps,
  treatmentPhaseAtStep,
} from './coagulation'
import {
  createParticleState,
  massFromDiameter,
  resetParticleState,
  setParticleMass,
} from './particleState'

describe('simplified aggregation and settling', () => {
  it('uses integer boundaries for the accepted 43-second phase schedule', () => {
    const dt = 1 / 60
    expect(treatmentPhaseAtStep(0, dt)).toBe('rapidMix')
    expect(treatmentPhaseAtStep(359, dt)).toBe('rapidMix')
    expect(treatmentPhaseAtStep(360, dt)).toBe('flocculation')
    expect(treatmentPhaseAtStep(1259, dt)).toBe('flocculation')
    expect(treatmentPhaseAtStep(1260, dt)).toBe('settling')
    expect(treatmentPhaseAtStep(2459, dt)).toBe('settling')
    expect(treatmentPhaseAtStep(2460, dt)).toBe('measurement')
    expect(treatmentPhaseAtStep(2579, dt)).toBe('measurement')
    expect(treatmentPhaseAtStep(2580, dt)).toBe('complete')
    expect(totalTreatmentSteps(dt)).toBe(2580)
  })

  it('keeps flocculation transport mass-neutral for the aggregation kernel', () => {
    const state = createParticleState(1)
    resetParticleState(state, 1)
    const mass = state.mass[0]
    const diameter = state.diameter[0]
    stepCoagulation(state, 'flocculation', 1 / 60, 1)
    expect(state.mass[0]).toBe(mass)
    expect(state.diameter[0]).toBe(diameter)
  })

  it('settles larger floc faster and makes settlement irreversible', () => {
    const small = createParticleState(1)
    const large = createParticleState(1)
    resetParticleState(small, 4)
    resetParticleState(large, 4)
    small.positionY[0] = 0.5
    large.positionY[0] = 0.5
    setParticleMass(small, 0, massFromDiameter(0.1))
    setParticleMass(large, 0, massFromDiameter(0.25))

    stepCoagulation(small, 'settling', 1, 0.4)
    stepCoagulation(large, 'settling', 1, 1)
    expect(large.positionY[0]).toBeLessThan(small.positionY[0])
    expect(settlingSpeedForDiameter(0.25)).toBeGreaterThan(
      settlingSpeedForDiameter(0.1),
    )

    large.positionY[0] = 0.051
    stepCoagulation(large, 'settling', 1, 1)
    expect(large.settled[0]).toBe(1)
    expect(large.positionY[0]).toBeCloseTo(0.05)
    expect(large.mass[0]).toBeCloseTo(massFromDiameter(0.25))
    stepCoagulation(large, 'rapidMix', 1 / 60, 1)
    expect(large.positionY[0]).toBeCloseTo(0.05)
  })

  it('rejects invalid hot-path inputs', () => {
    const state = createParticleState(1)
    resetParticleState(state, 1)
    expect(() => stepCoagulation(state, 'settling', 0, 1)).toThrow(RangeError)
    expect(() => stepCoagulation(state, 'settling', 1 / 60, 2)).toThrow(
      RangeError,
    )
  })
})
