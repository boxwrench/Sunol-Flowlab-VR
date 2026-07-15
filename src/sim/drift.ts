import {
  DEFAULT_PARTICLE_BOUNDS,
  type ParticleBounds,
  type ParticleState,
} from './particleState'

export function stepParticleDrift(
  state: ParticleState,
  timestepSeconds: number,
  bounds: ParticleBounds = DEFAULT_PARTICLE_BOUNDS,
): void {
  if (!Number.isFinite(timestepSeconds) || timestepSeconds <= 0) {
    throw new RangeError('Particle timestep must be a positive finite number')
  }

  for (let index = 0; index < state.capacity; index += 1) {
    if (state.active[index] === 0) continue

    state.positionX[index] = advanceAxis(
      state.positionX[index],
      state.velocityX,
      index,
      timestepSeconds,
      bounds.minX,
      bounds.maxX,
    )
    state.positionY[index] = advanceAxis(
      state.positionY[index],
      state.velocityY,
      index,
      timestepSeconds,
      bounds.minY,
      bounds.maxY,
    )
    state.positionZ[index] = advanceAxis(
      state.positionZ[index],
      state.velocityZ,
      index,
      timestepSeconds,
      bounds.minZ,
      bounds.maxZ,
    )
  }
}

function advanceAxis(
  position: number,
  velocity: Float32Array,
  index: number,
  timestepSeconds: number,
  minimum: number,
  maximum: number,
): number {
  let next = position + velocity[index] * timestepSeconds
  if (next < minimum) {
    next = minimum + (minimum - next)
    velocity[index] = Math.abs(velocity[index])
  } else if (next > maximum) {
    next = maximum - (next - maximum)
    velocity[index] = -Math.abs(velocity[index])
  }

  return Math.min(maximum, Math.max(minimum, next))
}
