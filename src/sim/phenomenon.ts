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
  DEFAULT_TURBIDITY_CONFIG,
  createTurbidityBands,
  endpointTurbidity,
  resetTurbidityBands,
  sampleTurbidityBands,
  upperColumnTurbidity,
  type TurbidityBandsState,
  type TurbidityConfig,
} from './turbidity'

export interface PhenomenonConfig {
  readonly schemaVersion: 2
  readonly particleCount: number
  readonly fixedTimestepSeconds: number
  readonly coagulation: Readonly<CoagulationConfig>
  readonly aggregation: Readonly<AggregationConfig>
  readonly geometry: Readonly<AggregateGeometryConfig>
  readonly doseEfficiency: Readonly<DoseEfficiencyConfig>
  readonly turbidity: Readonly<TurbidityConfig>
}

export interface PhenomenonWorkspace {
  readonly particles: ParticleState
  readonly bands: TurbidityBandsState
  readonly doseEfficiencies: Float32Array
  readonly mergeDiagnostics: MergeDiagnosticsState
  dose: DoseDetent
  efficiency: number
  seed: number
  stepIndex: number
  clarityReachedAtSimulationTime: number | null
}

export interface PhenomenonTrialResult {
  readonly dose: DoseDetent
  readonly seed: number
  readonly endpointTurbidity: number
  readonly bandSnapshot: readonly number[]
  readonly clarityReachedAtSimulationTime: number | null
  readonly settledParticles: number
  readonly meanNormalizedSize: number
  readonly mergeCount: number
  readonly mergeDigest: number
  readonly completedAtSimulationTime: number
  readonly configHash: string
}

export const DEFAULT_PHENOMENON_CONFIG: Readonly<PhenomenonConfig> =
  Object.freeze({
    schemaVersion: 2,
    particleCount: 500,
    fixedTimestepSeconds: 1 / 60,
    coagulation: DEFAULT_COAGULATION_CONFIG,
    aggregation: DEFAULT_AGGREGATION_CONFIG,
    geometry: DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
    doseEfficiency: DEFAULT_DOSE_EFFICIENCY_CONFIG,
    turbidity: DEFAULT_TURBIDITY_CONFIG,
  })

export function createPhenomenonWorkspace(
  config: Readonly<PhenomenonConfig> = DEFAULT_PHENOMENON_CONFIG,
): PhenomenonWorkspace {
  validatePhenomenonConfig(config)
  return {
    particles: createParticleState(config.particleCount),
    bands: createTurbidityBands(config.turbidity),
    doseEfficiencies: createDoseEfficiencyTable(config.doseEfficiency),
    mergeDiagnostics: createMergeDiagnostics(),
    dose: config.doseEfficiency.optimumDose,
    efficiency: 0,
    seed: 0,
    stepIndex: 0,
    clarityReachedAtSimulationTime: null,
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
  resetTurbidityBands(workspace.bands, workspace.particles, config.turbidity)
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
  workspace.stepIndex += 1
  const simulationTime = workspace.stepIndex * config.fixedTimestepSeconds
  sampleTurbidityBands(
    workspace.bands,
    workspace.particles,
    workspace.efficiency,
    simulationTime,
    config.turbidity,
  )
  if (
    workspace.clarityReachedAtSimulationTime === null &&
    upperColumnTurbidity(workspace.bands, config.turbidity) <=
      config.turbidity.upperClarityThreshold
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

  let settledParticles = 0
  let sizeTotal = 0
  for (let index = 0; index < workspace.particles.capacity; index += 1) {
    if (workspace.particles.active[index] === 0) continue
    settledParticles += workspace.particles.settled[index]
    sizeTotal += workspace.particles.diameter[index]
  }
  return {
    dose,
    seed,
    endpointTurbidity: endpointTurbidity(workspace.bands, config.turbidity),
    bandSnapshot: Array.from(workspace.bands.values),
    clarityReachedAtSimulationTime: workspace.clarityReachedAtSimulationTime,
    settledParticles,
    meanNormalizedSize: sizeTotal / workspace.particles.activeCount,
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
  const t = config.turbidity
  const canonical =
    `v=${config.schemaVersion}|particles=${config.particleCount}|dt=${config.fixedTimestepSeconds}` +
    `|phases=${c.rapidMixSeconds},${c.flocculationSeconds},${c.settlingSeconds},${c.measurementSeconds}` +
    `|geometry=${g.primaryParticleMass},${g.primaryParticleDiameter},${g.fractalDimension}` +
    `|aggregation=${a.collisionRadiusMultiplier},${a.maximumAggregateMass}` +
    `|settling=${c.settlingBaseSpeedPerSecond},${c.settlingVelocityScalePerSecond},${c.settlingMaximumSpeedPerSecond}` +
    `|dose=${d.optimumDose},${d.minimumEfficiency},${d.maximumEfficiency},${d.underdoseFalloffPerDetent},${d.overdoseFalloffPerDetent}` +
    `|turbidity=${t.bandCount},${t.rawTurbidity},${t.treatmentRange},${t.efficiencyExponent},${t.globalLoadWeight},${t.excludedBottomBands},${t.upperClarityBandCount},${t.upperClarityThreshold}`
  let hash = 0x811c9dc5
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `fnv1a32-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function validatePhenomenonConfig(config: Readonly<PhenomenonConfig>): void {
  if (config.schemaVersion !== 2)
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
