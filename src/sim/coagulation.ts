import { stepParticleDrift } from './drift'
import {
  DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
  DEFAULT_PARTICLE_BOUNDS,
  PARTICLE_SETTLED,
  validateAggregateGeometryConfig,
  type AggregateGeometryConfig,
  type ParticleBounds,
  type ParticleState,
} from './particleState'

export type TreatmentPhase =
  'rapidMix' | 'flocculation' | 'settling' | 'measurement' | 'complete'

export interface CoagulationConfig {
  readonly rapidMixSeconds: number
  readonly flocculationSeconds: number
  readonly settlingSeconds: number
  readonly measurementSeconds: number
  readonly settlingBaseSpeedPerSecond: number
  readonly settlingVelocityScalePerSecond: number
  readonly settlingMaximumSpeedPerSecond: number
}

export const DEFAULT_COAGULATION_CONFIG: Readonly<CoagulationConfig> =
  Object.freeze({
    rapidMixSeconds: 6,
    flocculationSeconds: 15,
    settlingSeconds: 20,
    measurementSeconds: 2,
    settlingBaseSpeedPerSecond: 0.001,
    settlingVelocityScalePerSecond: 0.012,
    settlingMaximumSpeedPerSecond: 0.06,
  })

export function totalTreatmentSteps(
  fixedTimestepSeconds: number,
  config: Readonly<CoagulationConfig> = DEFAULT_COAGULATION_CONFIG,
): number {
  validateCoagulationInputs(fixedTimestepSeconds, 1, config)
  return (
    secondsToSteps(config.rapidMixSeconds, fixedTimestepSeconds) +
    secondsToSteps(config.flocculationSeconds, fixedTimestepSeconds) +
    secondsToSteps(config.settlingSeconds, fixedTimestepSeconds) +
    secondsToSteps(config.measurementSeconds, fixedTimestepSeconds)
  )
}

export function treatmentPhaseAtStep(
  stepIndex: number,
  fixedTimestepSeconds: number,
  config: Readonly<CoagulationConfig> = DEFAULT_COAGULATION_CONFIG,
): TreatmentPhase {
  if (!Number.isInteger(stepIndex) || stepIndex < 0)
    throw new RangeError('Treatment step index must be a non-negative integer')
  validateCoagulationInputs(fixedTimestepSeconds, 1, config)
  const rapidMix = secondsToSteps(config.rapidMixSeconds, fixedTimestepSeconds)
  const flocculation =
    rapidMix + secondsToSteps(config.flocculationSeconds, fixedTimestepSeconds)
  const settling =
    flocculation + secondsToSteps(config.settlingSeconds, fixedTimestepSeconds)
  const measurement =
    settling + secondsToSteps(config.measurementSeconds, fixedTimestepSeconds)

  if (stepIndex < rapidMix) return 'rapidMix'
  if (stepIndex < flocculation) return 'flocculation'
  if (stepIndex < settling) return 'settling'
  if (stepIndex < measurement) return 'measurement'
  return 'complete'
}

export function stepCoagulation(
  state: ParticleState,
  phase: TreatmentPhase,
  timestepSeconds: number,
  efficiency: number,
  config: Readonly<CoagulationConfig> = DEFAULT_COAGULATION_CONFIG,
  geometry: Readonly<AggregateGeometryConfig> = DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
  bounds: ParticleBounds = DEFAULT_PARTICLE_BOUNDS,
): void {
  validateCoagulationInputs(timestepSeconds, efficiency, config)

  if (phase === 'rapidMix') {
    stepParticleDrift(state, timestepSeconds, bounds)
    return
  }
  if (phase === 'measurement' || phase === 'complete') return

  if (phase === 'flocculation') {
    stepParticleDrift(state, timestepSeconds, bounds)
    return
  }

  for (let index = 0; index < state.capacity; index += 1) {
    if (state.active[index] === 0 || state.settled[index] === 1) continue
    const speed = settlingSpeedForDiameter(
      state.diameter[index],
      config,
      geometry,
    )
    const nextY = state.positionY[index] - speed * timestepSeconds
    if (nextY <= bounds.minY) settleParticle(state, index, bounds.minY)
    else state.positionY[index] = nextY
  }
}

export function relativeExcessDensity(
  diameter: number,
  geometry: Readonly<AggregateGeometryConfig> = DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
): number {
  validateAggregateGeometryConfig(geometry)
  if (!Number.isFinite(diameter) || diameter <= 0)
    throw new RangeError('Aggregate diameter must be positive and finite')
  const diameterRatio = diameter / geometry.primaryParticleDiameter
  if (geometry.fractalDimension === 2) return 1 / diameterRatio
  return diameterRatio ** (geometry.fractalDimension - 3)
}

export function settlingSpeedForDiameter(
  diameter: number,
  config: Readonly<CoagulationConfig> = DEFAULT_COAGULATION_CONFIG,
  geometry: Readonly<AggregateGeometryConfig> = DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
): number {
  validateCoagulationInputs(1, 1, config)
  validateAggregateGeometryConfig(geometry)
  if (!Number.isFinite(diameter) || diameter <= 0)
    throw new RangeError('Aggregate diameter must be positive and finite')
  const diameterRatio = diameter / geometry.primaryParticleDiameter
  const drive =
    geometry.fractalDimension === 2
      ? diameterRatio
      : relativeExcessDensity(diameter, geometry) *
        diameterRatio *
        diameterRatio
  return Math.min(
    config.settlingMaximumSpeedPerSecond,
    config.settlingBaseSpeedPerSecond +
      config.settlingVelocityScalePerSecond * drive,
  )
}

function secondsToSteps(seconds: number, timestepSeconds: number): number {
  return Math.round(seconds / timestepSeconds)
}

function settleParticle(
  state: ParticleState,
  index: number,
  settledY: number,
): void {
  state.settled[index] = PARTICLE_SETTLED
  state.positionY[index] = settledY
  state.velocityX[index] = 0
  state.velocityY[index] = 0
  state.velocityZ[index] = 0
}

function validateCoagulationInputs(
  timestepSeconds: number,
  efficiency: number,
  config: Readonly<CoagulationConfig>,
): void {
  if (!Number.isFinite(timestepSeconds) || timestepSeconds <= 0)
    throw new RangeError('Coagulation timestep must be positive and finite')
  if (!Number.isFinite(efficiency) || efficiency < 0 || efficiency > 1)
    throw new RangeError('Dose efficiency must be finite and within [0, 1]')

  if (
    !isPositiveFinite(config.rapidMixSeconds) ||
    !isPositiveFinite(config.flocculationSeconds) ||
    !isPositiveFinite(config.settlingSeconds) ||
    !isPositiveFinite(config.measurementSeconds)
  )
    throw new RangeError(
      'Treatment phase durations must be positive and finite',
    )
  if (
    !isNonNegativeFinite(config.settlingBaseSpeedPerSecond) ||
    !isNonNegativeFinite(config.settlingVelocityScalePerSecond) ||
    !isNonNegativeFinite(config.settlingMaximumSpeedPerSecond)
  )
    throw new RangeError(
      'Coagulation parameters must be finite and non-negative',
    )
  if (
    config.settlingMaximumSpeedPerSecond === 0 ||
    config.settlingBaseSpeedPerSecond > config.settlingMaximumSpeedPerSecond
  )
    throw new RangeError('Settling-speed parameters are invalid')
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

function isNonNegativeFinite(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}
