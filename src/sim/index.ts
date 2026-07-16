export {
  DEFAULT_AGGREGATION_CONFIG,
  createMergeDiagnostics,
  mergeParticlePair,
  resetMergeDiagnostics,
  stepDeterministicAggregation,
  type AggregationConfig,
  type MergeDiagnosticsState,
} from './aggregation'
export {
  DEFAULT_BENCHMARK_OPTIONS,
  runHeadlessBenchmark,
  type HeadlessBenchmarkOptions,
  type HeadlessBenchmarkReport,
} from './benchmark'
export { stepParticleDrift } from './drift'
export {
  DEFAULT_COAGULATION_CONFIG,
  relativeExcessDensity,
  settlingSpeedForDiameter,
  stepCoagulation,
  totalTreatmentSteps,
  treatmentPhaseAtStep,
  type CoagulationConfig,
  type TreatmentPhase,
} from './coagulation'
export {
  DEFAULT_DOSE_EFFICIENCY_CONFIG,
  DOSE_DETENT_COUNT,
  calculateDoseEfficiency,
  createDoseEfficiencyTable,
  fillDoseEfficiencyTable,
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
  validateAggregateGeometryConfig,
  type AggregateGeometryConfig,
  type ParticleBounds,
  type ParticleState,
} from './particleState'
export type { ParticleStateView } from './particleState'
export { SeededRng } from './rng'
export {
  MASS_CONSERVATION_TOLERANCE,
  MAXIMUM_LARGEST_AGGREGATE_MASS_FRACTION,
  MINIMUM_ACTIVE_AGGREGATE_COUNT,
  MINIMUM_VISIBLE_SUSPENDED_AGGREGATES,
  calculatePopulationDiagnostics,
  countVisibleSuspendedAggregates,
  totalParticleMass,
  type PopulationDiagnostics,
} from './populationDiagnostics'
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
  DEFAULT_OPTICAL_LOAD_CONFIG,
  clearingFrontDiagnostics,
  createOpticalLoadBands,
  endpointOpticalLoad,
  resetOpticalLoadBands,
  sampleOpticalLoadBands,
  sampleZoneOpticalLoad,
  suspendedOpticalLoad,
  upperColumnOpticalLoad,
  type ClearingFrontDiagnostics,
  type OpticalLoadBandsState,
  type OpticalLoadBandsView,
  type OpticalLoadConfig,
} from './opticalLoad'

export const DEFAULT_PARTICLE_CAPACITY = 500
