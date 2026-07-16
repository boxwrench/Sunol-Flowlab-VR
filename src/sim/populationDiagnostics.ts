import {
  PARTICLE_SETTLED,
  PARTICLE_SUSPENDED,
  type ParticleState,
} from './particleState'

export interface PopulationDiagnostics {
  readonly initialTotalMass: number
  readonly totalAggregateMass: number
  readonly massConservationError: number
  readonly activeAggregateCount: number
  readonly suspendedAggregateCount: number
  readonly settledAggregateCount: number
  readonly meanAggregateMass: number
  readonly maximumAggregateMass: number
  readonly maximumAggregateDiameter: number
  readonly largestAggregateMassFraction: number
  readonly visibleSuspendedAggregateCount: number
  readonly minimumVisibleSuspendedAggregatesDuringSettling: number
}

export const MAXIMUM_LARGEST_AGGREGATE_MASS_FRACTION = 0.02
export const MINIMUM_ACTIVE_AGGREGATE_COUNT = 75
export const MINIMUM_VISIBLE_SUSPENDED_AGGREGATES = 40
export const MASS_CONSERVATION_TOLERANCE = 1e-6

export function totalParticleMass(state: ParticleState): number {
  let total = 0
  for (let index = 0; index < state.capacity; index += 1)
    if (state.active[index] === 1) total += state.mass[index]
  return total
}

export function countVisibleSuspendedAggregates(state: ParticleState): number {
  let count = 0
  for (let index = 0; index < state.capacity; index += 1)
    if (
      state.active[index] === 1 &&
      state.settled[index] === PARTICLE_SUSPENDED
    )
      count += 1
  return count
}

export function calculatePopulationDiagnostics(
  state: ParticleState,
  initialTotalMass: number,
  minimumVisibleSuspendedAggregatesDuringSettling: number,
): PopulationDiagnostics {
  if (!Number.isFinite(initialTotalMass) || initialTotalMass <= 0)
    throw new RangeError('Initial total mass must be positive and finite')
  if (
    !Number.isInteger(minimumVisibleSuspendedAggregatesDuringSettling) ||
    minimumVisibleSuspendedAggregatesDuringSettling < 0
  )
    throw new RangeError(
      'Minimum visible suspended population must be non-negative',
    )

  let activeAggregateCount = 0
  let suspendedAggregateCount = 0
  let settledAggregateCount = 0
  let totalAggregateMass = 0
  let maximumAggregateMass = 0
  let maximumAggregateDiameter = 0
  for (let index = 0; index < state.capacity; index += 1) {
    if (state.active[index] === 0) continue
    activeAggregateCount += 1
    if (state.settled[index] === PARTICLE_SETTLED) settledAggregateCount += 1
    else suspendedAggregateCount += 1
    const mass = state.mass[index]
    totalAggregateMass += mass
    maximumAggregateMass = Math.max(maximumAggregateMass, mass)
    maximumAggregateDiameter = Math.max(
      maximumAggregateDiameter,
      state.diameter[index],
    )
  }

  return {
    initialTotalMass,
    totalAggregateMass,
    massConservationError: Math.abs(totalAggregateMass - initialTotalMass),
    activeAggregateCount,
    suspendedAggregateCount,
    settledAggregateCount,
    meanAggregateMass:
      activeAggregateCount === 0
        ? 0
        : totalAggregateMass / activeAggregateCount,
    maximumAggregateMass,
    maximumAggregateDiameter,
    largestAggregateMassFraction: maximumAggregateMass / initialTotalMass,
    visibleSuspendedAggregateCount: suspendedAggregateCount,
    minimumVisibleSuspendedAggregatesDuringSettling,
  }
}
