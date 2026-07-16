import { SeededRng } from './rng'

export interface ParticleBounds {
  readonly minX: number
  readonly maxX: number
  readonly minY: number
  readonly maxY: number
  readonly minZ: number
  readonly maxZ: number
}

export interface ParticleState {
  readonly capacity: number
  activeCount: number
  readonly positionX: Float32Array
  readonly positionY: Float32Array
  readonly positionZ: Float32Array
  readonly velocityX: Float32Array
  readonly velocityY: Float32Array
  readonly velocityZ: Float32Array
  /** Unitless aggregate mass. Active primary particles begin at mass 1. */
  readonly mass: Float32Array
  /** Cached simulation diameter, always derived from authoritative mass. */
  readonly diameter: Float32Array
  /** 0 means suspended and 1 means settled; inactive slots also use 0. */
  readonly settled: Uint8Array
  readonly active: Uint8Array
}

export interface ReadonlyNumericArray {
  readonly length: number
  readonly [index: number]: number
}

export interface ParticleStateView {
  readonly capacity: number
  readonly activeCount: number
  readonly positionX: ReadonlyNumericArray
  readonly positionY: ReadonlyNumericArray
  readonly positionZ: ReadonlyNumericArray
  readonly velocityX: ReadonlyNumericArray
  readonly velocityY: ReadonlyNumericArray
  readonly velocityZ: ReadonlyNumericArray
  readonly mass: ReadonlyNumericArray
  readonly diameter: ReadonlyNumericArray
  readonly settled: ReadonlyNumericArray
  readonly active: ReadonlyNumericArray
}

export const PARTICLE_SUSPENDED = 0 as const
export const PARTICLE_SETTLED = 1 as const

export interface AggregateGeometryConfig {
  readonly primaryParticleMass: number
  readonly primaryParticleDiameter: number
  readonly fractalDimension: number
}

export const DEFAULT_AGGREGATE_GEOMETRY_CONFIG: Readonly<AggregateGeometryConfig> =
  Object.freeze({
    primaryParticleMass: 1,
    primaryParticleDiameter: 0.1,
    fractalDimension: 2,
  })

/** Relative tolerance used when auditing the cached mass-derived diameter. */
export const MASS_DIAMETER_RELATIVE_TOLERANCE = 1e-6

export const DEFAULT_PARTICLE_BOUNDS: ParticleBounds = Object.freeze({
  minX: -0.7,
  maxX: 0.7,
  minY: 0.05,
  maxY: 1.15,
  minZ: -0.35,
  maxZ: 0.35,
})

export function createParticleState(capacity: number): ParticleState {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new RangeError('Particle capacity must be a positive integer')
  }

  return {
    capacity,
    activeCount: 0,
    positionX: new Float32Array(capacity),
    positionY: new Float32Array(capacity),
    positionZ: new Float32Array(capacity),
    velocityX: new Float32Array(capacity),
    velocityY: new Float32Array(capacity),
    velocityZ: new Float32Array(capacity),
    mass: new Float32Array(capacity),
    diameter: new Float32Array(capacity),
    settled: new Uint8Array(capacity),
    active: new Uint8Array(capacity),
  }
}

export function resetParticleState(
  state: ParticleState,
  seed: number,
  activeCount = state.capacity,
  bounds: ParticleBounds = DEFAULT_PARTICLE_BOUNDS,
): void {
  validateReset(state, activeCount, bounds)
  const rng = new SeededRng(seed)
  for (let index = 0; index < state.capacity; index += 1) {
    const active = index < activeCount
    state.active[index] = active ? 1 : 0
    state.settled[index] = PARTICLE_SUSPENDED

    if (!active) {
      state.positionX[index] = 0
      state.positionY[index] = 0
      state.positionZ[index] = 0
      state.velocityX[index] = 0
      state.velocityY[index] = 0
      state.velocityZ[index] = 0
      state.mass[index] = 0
      state.diameter[index] = 0
      continue
    }

    state.positionX[index] = rng.nextRange(bounds.minX, bounds.maxX)
    state.positionY[index] = rng.nextRange(bounds.minY, bounds.maxY)
    state.positionZ[index] = rng.nextRange(bounds.minZ, bounds.maxZ)
    state.velocityX[index] = rng.nextRange(-0.02, 0.02)
    state.velocityY[index] = rng.nextRange(-0.01, 0.01)
    state.velocityZ[index] = rng.nextRange(-0.02, 0.02)
    state.mass[index] = DEFAULT_AGGREGATE_GEOMETRY_CONFIG.primaryParticleMass
    state.diameter[index] =
      DEFAULT_AGGREGATE_GEOMETRY_CONFIG.primaryParticleDiameter
  }

  state.activeCount = activeCount
}

export function diameterFromMass(
  mass: number,
  config: Readonly<AggregateGeometryConfig> = DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
): number {
  validateAggregateGeometryConfig(config)
  if (!Number.isFinite(mass) || mass <= 0)
    throw new RangeError('Aggregate mass must be positive and finite')
  const massRatio = mass / config.primaryParticleMass
  if (config.fractalDimension === 2)
    return config.primaryParticleDiameter * Math.sqrt(massRatio)
  return (
    config.primaryParticleDiameter * massRatio ** (1 / config.fractalDimension)
  )
}

export function massFromDiameter(
  diameter: number,
  config: Readonly<AggregateGeometryConfig> = DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
): number {
  validateAggregateGeometryConfig(config)
  if (!Number.isFinite(diameter) || diameter <= 0)
    throw new RangeError('Aggregate diameter must be positive and finite')
  const diameterRatio = diameter / config.primaryParticleDiameter
  return config.primaryParticleMass * diameterRatio ** config.fractalDimension
}

export function setParticleMass(
  state: ParticleState,
  index: number,
  mass: number,
  config: Readonly<AggregateGeometryConfig> = DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
): void {
  if (!Number.isInteger(index) || index < 0 || index >= state.capacity)
    throw new RangeError('Particle index must fit within capacity')
  const diameter = diameterFromMass(mass, config)
  state.mass[index] = mass
  state.diameter[index] = diameter
}

export function particleDiameterIsConsistent(
  state: ParticleState,
  index: number,
  config: Readonly<AggregateGeometryConfig> = DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
  relativeTolerance = MASS_DIAMETER_RELATIVE_TOLERANCE,
): boolean {
  if (state.active[index] === 0)
    return state.mass[index] === 0 && state.diameter[index] === 0
  const expected = diameterFromMass(state.mass[index], config)
  return (
    Number.isFinite(state.diameter[index]) &&
    Math.abs(state.diameter[index] - expected) <=
      relativeTolerance * Math.max(1, expected)
  )
}

function validateReset(
  state: ParticleState,
  activeCount: number,
  bounds: ParticleBounds,
) {
  if (
    !Number.isInteger(activeCount) ||
    activeCount < 0 ||
    activeCount > state.capacity
  ) {
    throw new RangeError('Active particle count must fit within capacity')
  }

  if (
    !Number.isFinite(bounds.minX) ||
    !Number.isFinite(bounds.maxX) ||
    bounds.minX >= bounds.maxX ||
    !Number.isFinite(bounds.minY) ||
    !Number.isFinite(bounds.maxY) ||
    bounds.minY >= bounds.maxY ||
    !Number.isFinite(bounds.minZ) ||
    !Number.isFinite(bounds.maxZ) ||
    bounds.minZ >= bounds.maxZ
  ) {
    throw new RangeError(
      'Particle bounds must contain finite increasing ranges',
    )
  }
}

function validateAggregateGeometryConfig(
  config: Readonly<AggregateGeometryConfig>,
): void {
  if (
    !Number.isFinite(config.primaryParticleMass) ||
    config.primaryParticleMass <= 0 ||
    !Number.isFinite(config.primaryParticleDiameter) ||
    config.primaryParticleDiameter <= 0 ||
    !Number.isFinite(config.fractalDimension) ||
    config.fractalDimension <= 0
  )
    throw new RangeError(
      'Aggregate geometry parameters must be positive and finite',
    )
}
