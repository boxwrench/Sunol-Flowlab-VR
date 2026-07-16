import {
  DEFAULT_AGGREGATION_CONFIG,
  createMergeDiagnostics,
  resetMergeDiagnostics,
  stepDeterministicAggregation,
  validateAggregationConfig,
  type AggregationConfig,
  type MergeDiagnosticsState,
} from './aggregation'
import {
  DEFAULT_COAGULATION_CONFIG,
  stepCoagulation,
  totalTreatmentSteps,
  treatmentPhaseAtStep,
  type CoagulationConfig,
} from './coagulation'
import {
  DEFAULT_DOSE_EFFICIENCY_CONFIG,
  createDoseEfficiencyTable,
  fillDoseEfficiencyTable,
  type DoseDetent,
  type DoseEfficiencyConfig,
} from './doseEfficiency'
import {
  DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
  createParticleState,
  resetParticleState,
  validateAggregateGeometryConfig,
  type AggregateGeometryConfig,
  type ParticleState,
} from './particleState'
import {
  calculatePopulationDiagnostics,
  countVisibleSuspendedAggregates,
  totalParticleMass,
  type PopulationDiagnostics,
} from './populationDiagnostics'
import {
  DEFAULT_OPTICAL_LOAD_CONFIG,
  createOpticalLoadBands,
  endpointOpticalLoad,
  resetOpticalLoadBands,
  sampleOpticalLoadBands,
  upperColumnOpticalLoad,
  type OpticalLoadBandsState,
  type OpticalLoadConfig,
} from './opticalLoad'

export interface PhenomenonConfig {
  readonly schemaVersion: 3
  readonly particleCount: number
  readonly fixedTimestepSeconds: number
  readonly coagulation: Readonly<CoagulationConfig>
  readonly aggregation: Readonly<AggregationConfig>
  readonly geometry: Readonly<AggregateGeometryConfig>
  readonly doseEfficiency: Readonly<DoseEfficiencyConfig>
  readonly opticalLoad: Readonly<OpticalLoadConfig>
}

export interface PhenomenonWorkspace {
  readonly particles: ParticleState
  readonly bands: OpticalLoadBandsState
  readonly doseEfficiencies: Float32Array
  readonly mergeDiagnostics: MergeDiagnosticsState
  dose: DoseDetent
  efficiency: number
  seed: number
  stepIndex: number
  clarityReachedAtSimulationTime: number | null
  initialTotalMass: number
  minimumVisibleSuspendedAggregatesDuringSettling: number
}

export interface PhenomenonTrialResult {
  readonly dose: DoseDetent
  readonly seed: number
  readonly endpointOpticalLoad: number
  readonly bandSnapshot: readonly number[]
  readonly clarityReachedAtSimulationTime: number | null
  readonly population: PopulationDiagnostics
  readonly mergeCount: number
  readonly mergeDigest: number
  readonly completedAtSimulationTime: number
  readonly configHash: string
}

export const DEFAULT_PHENOMENON_CONFIG: Readonly<PhenomenonConfig> =
  Object.freeze({
    schemaVersion: 3,
    particleCount: 500,
    fixedTimestepSeconds: 1 / 60,
    coagulation: DEFAULT_COAGULATION_CONFIG,
    aggregation: DEFAULT_AGGREGATION_CONFIG,
    geometry: DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
    doseEfficiency: DEFAULT_DOSE_EFFICIENCY_CONFIG,
    opticalLoad: DEFAULT_OPTICAL_LOAD_CONFIG,
  })

export function createPhenomenonWorkspace(
  config: Readonly<PhenomenonConfig> = DEFAULT_PHENOMENON_CONFIG,
): PhenomenonWorkspace {
  validatePhenomenonConfig(config)
  return {
    particles: createParticleState(config.particleCount),
    bands: createOpticalLoadBands(config.opticalLoad),
    doseEfficiencies: createDoseEfficiencyTable(config.doseEfficiency),
    mergeDiagnostics: createMergeDiagnostics(),
    dose: config.doseEfficiency.optimumDose,
    efficiency: 0,
    seed: 0,
    stepIndex: 0,
    clarityReachedAtSimulationTime: null,
    initialTotalMass: config.particleCount,
    minimumVisibleSuspendedAggregatesDuringSettling: config.particleCount,
  }
}

export function resetPhenomenonWorkspace(
  workspace: PhenomenonWorkspace,
  dose: DoseDetent,
  seed: number,
  config: Readonly<PhenomenonConfig> = DEFAULT_PHENOMENON_CONFIG,
): void {
  validatePhenomenonConfig(config)
  if (workspace.particles.capacity !== config.particleCount)
    throw new RangeError('Phenomenon workspace capacity does not match config')
  workspace.dose = dose
  fillDoseEfficiencyTable(workspace.doseEfficiencies, config.doseEfficiency)
  workspace.efficiency = workspace.doseEfficiencies[dose]
  workspace.seed = seed
  workspace.stepIndex = 0
  workspace.clarityReachedAtSimulationTime = null
  resetMergeDiagnostics(workspace.mergeDiagnostics)
  resetParticleState(
    workspace.particles,
    seed,
    workspace.particles.capacity,
    undefined,
    config.geometry,
  )
  resetOpticalLoadBands(
    workspace.bands,
    workspace.particles,
    config.opticalLoad,
  )
  workspace.initialTotalMass = totalParticleMass(workspace.particles)
  workspace.minimumVisibleSuspendedAggregatesDuringSettling =
    workspace.particles.activeCount
}

export function stepPhenomenonWorkspace(
  workspace: PhenomenonWorkspace,
  config: Readonly<PhenomenonConfig> = DEFAULT_PHENOMENON_CONFIG,
): boolean {
  const totalSteps = totalTreatmentSteps(
    config.fixedTimestepSeconds,
    config.coagulation,
  )
  if (workspace.stepIndex >= totalSteps) return false
  const phase = treatmentPhaseAtStep(
    workspace.stepIndex,
    config.fixedTimestepSeconds,
    config.coagulation,
  )
  stepCoagulation(
    workspace.particles,
    phase,
    config.fixedTimestepSeconds,
    workspace.efficiency,
    config.coagulation,
    config.geometry,
  )
  if (phase === 'flocculation')
    stepDeterministicAggregation(
      workspace.particles,
      workspace.stepIndex,
      workspace.seed,
      workspace.efficiency,
      workspace.mergeDiagnostics,
      config.aggregation,
      config.geometry,
    )
  if (phase === 'settling')
    workspace.minimumVisibleSuspendedAggregatesDuringSettling = Math.min(
      workspace.minimumVisibleSuspendedAggregatesDuringSettling,
      countVisibleSuspendedAggregates(workspace.particles),
    )
  workspace.stepIndex += 1
  const simulationTime = workspace.stepIndex * config.fixedTimestepSeconds
  sampleOpticalLoadBands(
    workspace.bands,
    workspace.particles,
    simulationTime,
    config.opticalLoad,
  )
  if (
    workspace.clarityReachedAtSimulationTime === null &&
    upperColumnOpticalLoad(workspace.bands, config.opticalLoad) <=
      config.opticalLoad.upperClarityThreshold
  )
    workspace.clarityReachedAtSimulationTime = simulationTime
  return true
}

export function runPhenomenonTrial(
  dose: DoseDetent,
  seed: number,
  config: Readonly<PhenomenonConfig> = DEFAULT_PHENOMENON_CONFIG,
  workspace = createPhenomenonWorkspace(config),
): PhenomenonTrialResult {
  resetPhenomenonWorkspace(workspace, dose, seed, config)
  while (stepPhenomenonWorkspace(workspace, config)) {
    // Fixed-step trial intentionally runs without rendering or wall-clock input.
  }

  return {
    dose,
    seed,
    endpointOpticalLoad: endpointOpticalLoad(
      workspace.bands,
      config.opticalLoad,
    ),
    bandSnapshot: Array.from(workspace.bands.values),
    clarityReachedAtSimulationTime: workspace.clarityReachedAtSimulationTime,
    population: calculatePopulationDiagnostics(
      workspace.particles,
      workspace.initialTotalMass,
      workspace.minimumVisibleSuspendedAggregatesDuringSettling,
    ),
    mergeCount: workspace.mergeDiagnostics.mergeCount,
    mergeDigest: workspace.mergeDiagnostics.mergeDigest,
    completedAtSimulationTime:
      workspace.stepIndex * config.fixedTimestepSeconds,
    configHash: hashPhenomenonConfig(config),
  }
}

export function hashPhenomenonConfig(
  config: Readonly<PhenomenonConfig> = DEFAULT_PHENOMENON_CONFIG,
): string {
  validatePhenomenonConfig(config)
  const c = config.coagulation
  const a = config.aggregation
  const g = config.geometry
  const d = config.doseEfficiency
  const o = config.opticalLoad
  const canonical =
    `v=${config.schemaVersion}|particles=${config.particleCount}|dt=${config.fixedTimestepSeconds}` +
    `|phases=${c.rapidMixSeconds},${c.flocculationSeconds},${c.settlingSeconds},${c.measurementSeconds}` +
    `|geometry=${g.primaryParticleMass},${g.primaryParticleDiameter},${g.fractalDimension}` +
    `|aggregation=${a.collisionRadiusMultiplier},${a.maximumAggregateMass}` +
    `|settling=${c.settlingBaseSpeedPerSecond},${c.settlingVelocityScalePerSecond},${c.settlingMaximumSpeedPerSecond}` +
    `|dose=${d.optimumDose},${d.maximumEfficiency},${d.doseWindowSigma}` +
    `|opticalLoad=${o.bandCount},${o.excludedBottomBands},${o.upperClarityBandCount},${o.upperClarityThreshold}`
  let hash = 0x811c9dc5
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `fnv1a32-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function validatePhenomenonConfig(config: Readonly<PhenomenonConfig>): void {
  if (config.schemaVersion !== 3)
    throw new RangeError('Unsupported phenomenon config schema')
  if (!Number.isInteger(config.particleCount) || config.particleCount < 1)
    throw new RangeError('Phenomenon particle count must be a positive integer')
  if (
    !Number.isFinite(config.fixedTimestepSeconds) ||
    config.fixedTimestepSeconds <= 0
  )
    throw new RangeError('Phenomenon timestep must be positive and finite')
  validateAggregationConfig(config.aggregation)
  validateAggregateGeometryConfig(config.geometry)
}
