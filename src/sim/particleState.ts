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
  /**
   * Unitless representative particle/floc size. Active values are normalized
   * to (0, 1], where 1 is the largest representative size supported by the
   * phenomenon model. Inactive slots use 0.
   */
  readonly normalizedSize: Float32Array
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
  readonly normalizedSize: ReadonlyNumericArray
  readonly settled: ReadonlyNumericArray
  readonly active: ReadonlyNumericArray
}

export const PARTICLE_SUSPENDED = 0 as const
export const PARTICLE_SETTLED = 1 as const

/** Raw-water particles begin near the small end of the normalized size scale. */
export const INITIAL_NORMALIZED_SIZE_MIN = 0.08
export const INITIAL_NORMALIZED_SIZE_MAX = 0.12

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
    normalizedSize: new Float32Array(capacity),
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
  // Keep size sampling independent so adding this state does not change the
  // established seeded position and velocity sequence.
  const sizeRng = new SeededRng((seed ^ 0x9e3779b9) >>> 0)

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
      state.normalizedSize[index] = 0
      continue
    }

    state.positionX[index] = rng.nextRange(bounds.minX, bounds.maxX)
    state.positionY[index] = rng.nextRange(bounds.minY, bounds.maxY)
    state.positionZ[index] = rng.nextRange(bounds.minZ, bounds.maxZ)
    state.velocityX[index] = rng.nextRange(-0.02, 0.02)
    state.velocityY[index] = rng.nextRange(-0.01, 0.01)
    state.velocityZ[index] = rng.nextRange(-0.02, 0.02)
    state.normalizedSize[index] = sizeRng.nextRange(
      INITIAL_NORMALIZED_SIZE_MIN,
      INITIAL_NORMALIZED_SIZE_MAX,
    )
  }

  state.activeCount = activeCount
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
