export {
  DEFAULT_BENCHMARK_OPTIONS,
  runHeadlessBenchmark,
  type HeadlessBenchmarkOptions,
  type HeadlessBenchmarkReport,
} from './benchmark'
export { stepParticleDrift } from './drift'
export {
  DEFAULT_COAGULATION_CONFIG,
  stepCoagulation,
  totalTreatmentSteps,
  treatmentPhaseAtStep,
  type CoagulationConfig,
  type TreatmentPhase,
} from './coagulation'
export {
  DEFAULT_DOSE_EFFICIENCY_CONFIG,
  calculateDoseEfficiency,
  validateDoseDetent,
  validateDoseEfficiencyConfig,
  type DoseDetent,
  type DoseEfficiencyConfig,
} from './doseEfficiency'
export {
  ALL_DOSE_DETENTS,
  formatDoseSweepFailure,
  formatDoseSweepMarkdown,
  runDoseSweep,
  type DoseSweepReport,
} from './doseSweep'
export {
  FixedStepClock,
  type FixedStepSnapshot,
  type StepFunction,
} from './fixedStep'
export {
  DEFAULT_PARTICLE_BOUNDS,
  DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
  MASS_DIAMETER_RELATIVE_TOLERANCE,
  PARTICLE_SETTLED,
  PARTICLE_SUSPENDED,
  createParticleState,
  diameterFromMass,
  massFromDiameter,
  particleDiameterIsConsistent,
  resetParticleState,
  setParticleMass,
  type AggregateGeometryConfig,
  type ParticleBounds,
  type ParticleState,
} from './particleState'
export type { ParticleStateView } from './particleState'
export { SeededRng } from './rng'
export {
  DEFAULT_PHENOMENON_CONFIG,
  createPhenomenonWorkspace,
  hashPhenomenonConfig,
  resetPhenomenonWorkspace,
  runPhenomenonTrial,
  stepPhenomenonWorkspace,
  type PhenomenonConfig,
  type PhenomenonTrialResult,
  type PhenomenonWorkspace,
} from './phenomenon'
export {
  DEFAULT_TURBIDITY_CONFIG,
  clearingFrontDiagnostics,
  createTurbidityBands,
  endpointTurbidity,
  resetTurbidityBands,
  sampleTurbidityBands,
  upperColumnTurbidity,
  type ClearingFrontDiagnostics,
  type TurbidityBandsState,
  type TurbidityBandsView,
  type TurbidityConfig,
} from './turbidity'

export const DEFAULT_PARTICLE_CAPACITY = 500
