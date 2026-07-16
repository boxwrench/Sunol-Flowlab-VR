import {
  DEFAULT_PHENOMENON_CONFIG,
  DEFAULT_PARTICLE_CAPACITY,
  FixedStepClock,
  createPhenomenonWorkspace,
  resetPhenomenonWorkspace,
  stepPhenomenonWorkspace,
  treatmentPhaseAtStep,
  type DoseDetent,
  type PhenomenonConfig,
  type ParticleStateView,
  type OpticalLoadBandsView,
  type TreatmentPhase,
} from '../sim'

export const CANONICAL_SIMULATION_SEED = 0x5f3759df

export class SimulationRuntime {
  readonly state: ParticleStateView
  readonly opticalLoadBands: OpticalLoadBandsView

  private readonly config: Readonly<PhenomenonConfig>
  private readonly workspace
  private readonly clock: FixedStepClock

  constructor(
    capacity = DEFAULT_PARTICLE_CAPACITY,
    seed = CANONICAL_SIMULATION_SEED,
    fixedTimestepSeconds = 1 / 60,
    maxCatchUpSteps = 5,
    dose: DoseDetent = DEFAULT_PHENOMENON_CONFIG.doseEfficiency.optimumDose,
  ) {
    this.config = Object.freeze({
      ...DEFAULT_PHENOMENON_CONFIG,
      particleCount: capacity,
      fixedTimestepSeconds,
    })
    this.workspace = createPhenomenonWorkspace(this.config)
    this.state = this.workspace.particles
    this.opticalLoadBands = this.workspace.bands
    this.clock = new FixedStepClock(fixedTimestepSeconds, maxCatchUpSteps)
    this.reset(seed, dose)
  }

  start(): void {
    this.clock.start()
  }

  pause(): void {
    this.clock.pause()
  }

  reset(
    seed = CANONICAL_SIMULATION_SEED,
    dose: DoseDetent = this.workspace.dose,
  ): void {
    resetPhenomenonWorkspace(this.workspace, dose, seed, this.config)
    this.clock.reset()
  }

  get dose(): DoseDetent {
    return this.workspace.dose
  }

  get phase(): TreatmentPhase {
    return treatmentPhaseAtStep(
      this.workspace.stepIndex,
      this.config.fixedTimestepSeconds,
      this.config.coagulation,
    )
  }

  get simulationTimeSeconds(): number {
    return this.workspace.bands.sampledAtSimulationTime
  }

  get clarityReachedAtSimulationTime(): number | null {
    return this.workspace.clarityReachedAtSimulationTime
  }

  step(elapsedSeconds: number): number {
    return this.clock.advance(elapsedSeconds, this.stepSimulation)
  }

  stepHeadless(count: number): void {
    this.clock.stepHeadless(count, this.stepSimulation)
  }

  private readonly stepSimulation = (timestepSeconds: number): void => {
    if (timestepSeconds !== this.config.fixedTimestepSeconds)
      throw new RangeError('Runtime and phenomenon timesteps must match')
    stepPhenomenonWorkspace(this.workspace, this.config)
  }
}
