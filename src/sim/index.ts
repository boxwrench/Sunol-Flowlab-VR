export {
  DEFAULT_BENCHMARK_OPTIONS,
  runHeadlessBenchmark,
  type HeadlessBenchmarkOptions,
  type HeadlessBenchmarkReport,
} from './benchmark'
export { stepParticleDrift } from './drift'
export {
  FixedStepClock,
  type FixedStepSnapshot,
  type StepFunction,
} from './fixedStep'
export {
  DEFAULT_PARTICLE_BOUNDS,
  createParticleState,
  resetParticleState,
  type ParticleBounds,
  type ParticleState,
} from './particleState'
export type { ParticleStateView } from './particleState'
export { SeededRng } from './rng'

export const DEFAULT_PARTICLE_CAPACITY = 500
