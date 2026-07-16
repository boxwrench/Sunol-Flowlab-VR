import { describe, expect, it } from 'vitest'

import {
  calculatePopulationDiagnostics,
  countVisibleSuspendedAggregates,
  totalParticleMass,
} from './populationDiagnostics'
import {
  PARTICLE_SETTLED,
  createParticleState,
  resetParticleState,
  setParticleMass,
} from './particleState'

describe('population-health diagnostics', () => {
  it('reports mass, population, diameter, and visibility from active slots', () => {
    const state = createParticleState(4)
    resetParticleState(state, 1)
    setParticleMass(state, 0, 4)
    setParticleMass(state, 1, 2)
    state.active[3] = 0
    state.mass[3] = 0
    state.diameter[3] = 0
    state.activeCount = 3
    state.settled[1] = PARTICLE_SETTLED

    const diagnostics = calculatePopulationDiagnostics(state, 8, 2)

    expect(totalParticleMass(state)).toBe(7)
    expect(countVisibleSuspendedAggregates(state)).toBe(2)
    expect(diagnostics).toMatchObject({
      initialTotalMass: 8,
      totalAggregateMass: 7,
      massConservationError: 1,
      activeAggregateCount: 3,
      suspendedAggregateCount: 2,
      settledAggregateCount: 1,
      meanAggregateMass: 7 / 3,
      maximumAggregateMass: 4,
      largestAggregateMassFraction: 0.5,
      visibleSuspendedAggregateCount: 2,
      minimumVisibleSuspendedAggregatesDuringSettling: 2,
    })
    expect(diagnostics.maximumAggregateDiameter).toBeCloseTo(0.2)
  })

  it('rejects invalid diagnostic baselines', () => {
    const state = createParticleState(1)
    resetParticleState(state, 2)
    expect(() => calculatePopulationDiagnostics(state, 0, 1)).toThrow(
      RangeError,
    )
    expect(() => calculatePopulationDiagnostics(state, 1, -1)).toThrow(
      RangeError,
    )
  })
})
