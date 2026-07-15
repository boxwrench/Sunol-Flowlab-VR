import {
  DEFAULT_PARTICLE_CAPACITY,
  FixedStepClock,
  createParticleState,
  resetParticleState,
  stepParticleDrift,
  type ParticleStateView,
} from '../sim'

export const CANONICAL_SIMULATION_SEED = 0x5f3759df

export class SimulationRuntime {
  readonly state: ParticleStateView

  private readonly mutableState
  private readonly clock: FixedStepClock

  constructor(
    capacity = DEFAULT_PARTICLE_CAPACITY,
    seed = CANONICAL_SIMULATION_SEED,
    fixedTimestepSeconds = 1 / 60,
    maxCatchUpSteps = 5,
  ) {
    this.mutableState = createParticleState(capacity)
    this.state = this.mutableState
    this.clock = new FixedStepClock(fixedTimestepSeconds, maxCatchUpSteps)
    this.reset(seed)
  }

  start(): void {
    this.clock.start()
  }

  pause(): void {
    this.clock.pause()
  }

  reset(seed = CANONICAL_SIMULATION_SEED): void {
    resetParticleState(this.mutableState, seed)
    this.clock.reset()
  }

  step(elapsedSeconds: number): number {
    return this.clock.advance(elapsedSeconds, this.stepSimulation)
  }

  stepHeadless(count: number): void {
    this.clock.stepHeadless(count, this.stepSimulation)
  }

  private readonly stepSimulation = (timestepSeconds: number): void => {
    stepParticleDrift(this.mutableState, timestepSeconds)
  }
}
