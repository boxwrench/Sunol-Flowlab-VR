import {
  DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
  PARTICLE_SUSPENDED,
  setParticleMass,
  validateAggregateGeometryConfig,
  type AggregateGeometryConfig,
  type ParticleState,
} from './particleState'

export interface AggregationConfig {
  /**
   * Unitless multiplier applied to the sum of authoritative aggregate radii
   * when determining whether a scheduled pair is close enough to encounter.
   */
  readonly collisionRadiusMultiplier: number
  /** Merge prohibition used to preserve a readable representative population. */
  readonly maximumAggregateMass: number
}

export interface MergeDiagnosticsState {
  mergeCount: number
  candidatePairEvaluations: number
  mergeDigest: number
}

export const DEFAULT_AGGREGATION_CONFIG: Readonly<AggregationConfig> =
  Object.freeze({
    collisionRadiusMultiplier: 1.15,
    maximumAggregateMass: 8,
  })

const FNV_OFFSET_BASIS = 0x811c9dc5

export function createMergeDiagnostics(): MergeDiagnosticsState {
  return {
    mergeCount: 0,
    candidatePairEvaluations: 0,
    mergeDigest: FNV_OFFSET_BASIS,
  }
}

export function resetMergeDiagnostics(
  diagnostics: MergeDiagnosticsState,
): void {
  diagnostics.mergeCount = 0
  diagnostics.candidatePairEvaluations = 0
  diagnostics.mergeDigest = FNV_OFFSET_BASIS
}

/**
 * Evaluates one stable diagonal of the upper-triangular slot-pair matrix.
 *
 * Over capacity - 1 consecutive steps every unordered slot pair is scheduled
 * exactly once. The traversal allocates nothing, emits no duplicate pair
 * within a step, and keeps survivor selection stable at the lower slot index.
 */
export function stepDeterministicAggregation(
  state: ParticleState,
  stepIndex: number,
  seed: number,
  stickingEfficiency: number,
  diagnostics: MergeDiagnosticsState,
  config: Readonly<AggregationConfig> = DEFAULT_AGGREGATION_CONFIG,
  geometry: Readonly<AggregateGeometryConfig> = DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
): void {
  validateAggregationInputs(
    stepIndex,
    seed,
    stickingEfficiency,
    config,
    geometry,
  )
  if (state.capacity < 2 || state.activeCount < 2) return

  const offset = 1 + (stepIndex % (state.capacity - 1))
  const finalFirstIndex = state.capacity - offset
  for (let first = 0; first < finalFirstIndex; first += 1) {
    const second = first + offset
    if (
      state.active[first] === 0 ||
      state.active[second] === 0 ||
      state.settled[first] !== PARTICLE_SUSPENDED ||
      state.settled[second] !== PARTICLE_SUSPENDED
    )
      continue

    diagnostics.candidatePairEvaluations += 1
    if (!aggregatesOverlap(state, first, second, config)) continue
    if (state.mass[first] + state.mass[second] > config.maximumAggregateMass)
      continue
    if (keyedUnitInterval(seed, stepIndex, first, second) >= stickingEfficiency)
      continue
    mergeParticlePair(state, first, second, geometry)
    diagnostics.mergeCount += 1
    diagnostics.mergeDigest = appendMergeDigest(
      diagnostics.mergeDigest,
      stepIndex,
      first,
      second,
      state.mass[first],
    )
  }
}

export function mergeParticlePair(
  state: ParticleState,
  survivor: number,
  consumed: number,
  geometry: Readonly<AggregateGeometryConfig> = DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
): void {
  validateMergePair(state, survivor, consumed)
  const survivorMass = state.mass[survivor]
  const consumedMass = state.mass[consumed]
  const mergedMass = survivorMass + consumedMass
  const survivorWeight = survivorMass / mergedMass
  const consumedWeight = consumedMass / mergedMass

  state.positionX[survivor] =
    state.positionX[survivor] * survivorWeight +
    state.positionX[consumed] * consumedWeight
  state.positionY[survivor] =
    state.positionY[survivor] * survivorWeight +
    state.positionY[consumed] * consumedWeight
  state.positionZ[survivor] =
    state.positionZ[survivor] * survivorWeight +
    state.positionZ[consumed] * consumedWeight
  state.velocityX[survivor] =
    state.velocityX[survivor] * survivorWeight +
    state.velocityX[consumed] * consumedWeight
  state.velocityY[survivor] =
    state.velocityY[survivor] * survivorWeight +
    state.velocityY[consumed] * consumedWeight
  state.velocityZ[survivor] =
    state.velocityZ[survivor] * survivorWeight +
    state.velocityZ[consumed] * consumedWeight
  setParticleMass(state, survivor, mergedMass, geometry)

  state.active[consumed] = 0
  state.settled[consumed] = PARTICLE_SUSPENDED
  state.positionX[consumed] = 0
  state.positionY[consumed] = 0
  state.positionZ[consumed] = 0
  state.velocityX[consumed] = 0
  state.velocityY[consumed] = 0
  state.velocityZ[consumed] = 0
  state.mass[consumed] = 0
  state.diameter[consumed] = 0
  state.activeCount -= 1
}

export function validateAggregationConfig(
  config: Readonly<AggregationConfig>,
): void {
  if (
    !Number.isFinite(config.collisionRadiusMultiplier) ||
    config.collisionRadiusMultiplier <= 0 ||
    !Number.isFinite(config.maximumAggregateMass) ||
    config.maximumAggregateMass <= 0
  )
    throw new RangeError('Aggregation parameters must be positive and finite')
}

function aggregatesOverlap(
  state: ParticleState,
  first: number,
  second: number,
  config: Readonly<AggregationConfig>,
): boolean {
  const deltaX = state.positionX[first] - state.positionX[second]
  const deltaY = state.positionY[first] - state.positionY[second]
  const deltaZ = state.positionZ[first] - state.positionZ[second]
  const collisionDistance =
    0.5 *
    (state.diameter[first] + state.diameter[second]) *
    config.collisionRadiusMultiplier
  return (
    deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ <=
    collisionDistance * collisionDistance
  )
}

function keyedUnitInterval(
  seed: number,
  stepIndex: number,
  first: number,
  second: number,
): number {
  let value = seed >>> 0
  value = mixUint32(value ^ Math.imul(stepIndex + 1, 0x9e3779b1))
  value = mixUint32(value ^ Math.imul(first + 1, 0x85ebca77))
  value = mixUint32(value ^ Math.imul(second + 1, 0xc2b2ae3d))
  return (value >>> 8) / 0x1000000
}

function mixUint32(value: number): number {
  let mixed = value >>> 0
  mixed ^= mixed >>> 16
  mixed = Math.imul(mixed, 0x7feb352d)
  mixed ^= mixed >>> 15
  mixed = Math.imul(mixed, 0x846ca68b)
  mixed ^= mixed >>> 16
  return mixed >>> 0
}

function appendMergeDigest(
  digest: number,
  stepIndex: number,
  first: number,
  second: number,
  mergedMass: number,
): number {
  let next = digest
  next = fnvWord(next, stepIndex)
  next = fnvWord(next, first)
  next = fnvWord(next, second)
  next = fnvWord(next, Math.round(mergedMass * 1_000_000))
  return next >>> 0
}

function fnvWord(hash: number, word: number): number {
  let next = hash
  for (let shift = 0; shift < 32; shift += 8) {
    next ^= (word >>> shift) & 0xff
    next = Math.imul(next, 0x01000193)
  }
  return next >>> 0
}

function validateAggregationInputs(
  stepIndex: number,
  seed: number,
  stickingEfficiency: number,
  config: Readonly<AggregationConfig>,
  geometry: Readonly<AggregateGeometryConfig>,
): void {
  validateAggregationConfig(config)
  validateAggregateGeometryConfig(geometry)
  if (!Number.isInteger(stepIndex) || stepIndex < 0)
    throw new RangeError('Aggregation step index must be non-negative')
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new RangeError('Aggregation seed must be an unsigned 32-bit integer')
  if (
    !Number.isFinite(stickingEfficiency) ||
    stickingEfficiency < 0 ||
    stickingEfficiency > 1
  )
    throw new RangeError('Sticking efficiency must be within [0, 1]')
}

function validateMergePair(
  state: ParticleState,
  survivor: number,
  consumed: number,
): void {
  if (
    !Number.isInteger(survivor) ||
    !Number.isInteger(consumed) ||
    survivor < 0 ||
    consumed < 0 ||
    survivor >= state.capacity ||
    consumed >= state.capacity ||
    survivor >= consumed ||
    state.active[survivor] === 0 ||
    state.active[consumed] === 0 ||
    state.settled[survivor] !== PARTICLE_SUSPENDED ||
    state.settled[consumed] !== PARTICLE_SUSPENDED
  )
    throw new RangeError(
      'Merge pair must contain ordered active suspended particle slots',
    )
}
