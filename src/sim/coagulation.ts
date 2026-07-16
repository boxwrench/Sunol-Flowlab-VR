import { stepParticleDrift } from './drift'
import {
  DEFAULT_PARTICLE_BOUNDS,
  PARTICLE_SETTLED,
  massFromDiameter,
  setParticleMass,
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
  readonly flocTargetMinimum: number
  readonly flocTargetRange: number
  readonly flocTargetExponent: number
  readonly flocGrowthRatePerSecond: number
  readonly settlingThreshold: number
  readonly settlingBaseSpeedPerSecond: number
  readonly settlingSpeedRangePerSecond: number
}

export const DEFAULT_COAGULATION_CONFIG: Readonly<CoagulationConfig> =
  Object.freeze({
    rapidMixSeconds: 6,
    flocculationSeconds: 15,
    settlingSeconds: 20,
    measurementSeconds: 2,
    flocTargetMinimum: 0.15,
    flocTargetRange: 0.8,
    flocTargetExponent: 1.5,
    flocGrowthRatePerSecond: 0.22,
    settlingThreshold: 0.18,
    settlingBaseSpeedPerSecond: 0.006,
    settlingSpeedRangePerSecond: 0.07,
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
    const target = Math.min(
      1,
      config.flocTargetMinimum +
        config.flocTargetRange * efficiency ** config.flocTargetExponent,
    )
    for (let index = 0; index < state.capacity; index += 1) {
      if (state.active[index] === 0 || state.settled[index] === 1) continue
      const size = state.diameter[index]
      const growth =
        config.flocGrowthRatePerSecond * (target - size) * timestepSeconds
      const nextDiameter = Math.min(target, size + Math.max(0, growth))
      setParticleMass(state, index, massFromDiameter(nextDiameter))
    }
    return
  }

  for (let index = 0; index < state.capacity; index += 1) {
    if (state.active[index] === 0 || state.settled[index] === 1) continue
    const drive = Math.max(
      0,
      Math.min(
        1,
        (state.diameter[index] - config.settlingThreshold) /
          (1 - config.settlingThreshold),
      ),
    )
    const speed =
      config.settlingBaseSpeedPerSecond +
      config.settlingSpeedRangePerSecond * drive * drive
    const nextY = state.positionY[index] - speed * timestepSeconds
    if (nextY <= bounds.minY) settleParticle(state, index, bounds.minY)
    else state.positionY[index] = nextY
  }
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
    !isNonNegativeFinite(config.flocTargetMinimum) ||
    !isNonNegativeFinite(config.flocTargetRange) ||
    !isNonNegativeFinite(config.flocTargetExponent) ||
    !isNonNegativeFinite(config.flocGrowthRatePerSecond) ||
    !isNonNegativeFinite(config.settlingThreshold) ||
    !isNonNegativeFinite(config.settlingBaseSpeedPerSecond) ||
    !isNonNegativeFinite(config.settlingSpeedRangePerSecond)
  )
    throw new RangeError(
      'Coagulation parameters must be finite and non-negative',
    )
  if (
    config.flocTargetMinimum > 1 ||
    config.flocTargetMinimum + config.flocTargetRange > 1 ||
    config.flocTargetExponent === 0 ||
    config.settlingThreshold >= 1
  )
    throw new RangeError('Normalized coagulation parameters are invalid')
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

function isNonNegativeFinite(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}
