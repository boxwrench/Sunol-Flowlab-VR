import { describe, expect, it } from 'vitest'

import {
  DEFAULT_COAGULATION_CONFIG,
  stepCoagulation,
  totalTreatmentSteps,
  treatmentPhaseAtStep,
} from './coagulation'
import { createParticleState, resetParticleState } from './particleState'

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

  it('grows representative floc toward a dose-dependent target', () => {
    const weak = createParticleState(1)
    const strong = createParticleState(1)
    resetParticleState(weak, 1)
    resetParticleState(strong, 1)

    for (let step = 0; step < 900; step += 1) {
      stepCoagulation(weak, 'flocculation', 1 / 60, 0.4)
      stepCoagulation(strong, 'flocculation', 1 / 60, 1)
    }

    expect(strong.normalizedSize[0]).toBeGreaterThan(weak.normalizedSize[0])
    expect(strong.normalizedSize[0]).toBeLessThanOrEqual(1)
    expect(weak.normalizedSize[0]).toBeGreaterThan(0)
  })

  it('settles larger floc faster and makes settlement irreversible', () => {
    const small = createParticleState(1)
    const large = createParticleState(1)
    resetParticleState(small, 4)
    resetParticleState(large, 4)
    small.positionY[0] = 0.5
    large.positionY[0] = 0.5
    small.normalizedSize[0] = DEFAULT_COAGULATION_CONFIG.settlingThreshold
    large.normalizedSize[0] = 1

    stepCoagulation(small, 'settling', 1, 0.4)
    stepCoagulation(large, 'settling', 1, 1)
    expect(large.positionY[0]).toBeLessThan(small.positionY[0])

    large.positionY[0] = 0.051
    stepCoagulation(large, 'settling', 1, 1)
    expect(large.settled[0]).toBe(1)
    expect(large.positionY[0]).toBeCloseTo(0.05)
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
