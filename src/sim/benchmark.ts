import { type DoseDetent } from './doseEfficiency'
import { FixedStepClock } from './fixedStep'
import {
  DEFAULT_PHENOMENON_CONFIG,
  createPhenomenonWorkspace,
  resetPhenomenonWorkspace,
  stepPhenomenonWorkspace,
} from './phenomenon'
import { particleDiameterIsConsistent } from './particleState'
import {
  calculatePopulationDiagnostics,
  type PopulationDiagnostics,
} from './populationDiagnostics'
import { endpointOpticalLoad } from './opticalLoad'

export interface HeadlessBenchmarkOptions {
  readonly particleCount: number
  readonly steps: number
  readonly seed: number
  readonly fixedTimestepSeconds: number
  readonly dose?: DoseDetent
}

export interface HeadlessBenchmarkReport {
  readonly schemaVersion: 3
  readonly particleCount: number
  readonly steps: number
  readonly seed: number
  readonly fixedTimestepSeconds: number
  readonly dose: DoseDetent
  readonly totalMs: number
  readonly averageStepMs: number
  readonly p95StepMs: number
  readonly activeParticles: number
  readonly stateArrayAllocations: 10
  readonly opticalLoadArrayAllocations: 3
  readonly endpointOpticalLoad: number
  readonly population: PopulationDiagnostics
  readonly finite: boolean
}

export const DEFAULT_BENCHMARK_OPTIONS: HeadlessBenchmarkOptions =
  Object.freeze({
    particleCount: 500,
    steps: 2_580,
    seed: 0x5f3759df,
    fixedTimestepSeconds: 1 / 60,
  })

export function runHeadlessBenchmark(
  options: HeadlessBenchmarkOptions = DEFAULT_BENCHMARK_OPTIONS,
  now: () => number = () => performance.now(),
): HeadlessBenchmarkReport {
  validateOptions(options)
  const dose = options.dose ?? 5
  const config = Object.freeze({
    ...DEFAULT_PHENOMENON_CONFIG,
    particleCount: options.particleCount,
    fixedTimestepSeconds: options.fixedTimestepSeconds,
  })
  const workspace = createPhenomenonWorkspace(config)
  resetPhenomenonWorkspace(workspace, dose, options.seed, config)
  const clock = new FixedStepClock(options.fixedTimestepSeconds)
  const samples = new Float64Array(options.steps)
  const step = () => stepPhenomenonWorkspace(workspace, config)

  const benchmarkStart = now()
  for (let index = 0; index < options.steps; index += 1) {
    const stepStart = now()
    clock.stepHeadless(1, step)
    samples[index] = now() - stepStart
  }
  const totalMs = now() - benchmarkStart
  const population = calculatePopulationDiagnostics(
    workspace.particles,
    workspace.initialTotalMass,
    workspace.minimumVisibleSuspendedAggregatesDuringSettling,
  )

  const sortedSamples = Array.from(samples).sort((a, b) => a - b)
  let sampleTotal = 0
  for (let index = 0; index < samples.length; index += 1)
    sampleTotal += samples[index]

  return {
    schemaVersion: 3,
    particleCount: options.particleCount,
    steps: options.steps,
    seed: options.seed,
    fixedTimestepSeconds: options.fixedTimestepSeconds,
    dose,
    totalMs,
    averageStepMs: sampleTotal / options.steps,
    p95StepMs: sortedSamples[Math.ceil(options.steps * 0.95) - 1],
    activeParticles: workspace.particles.activeCount,
    stateArrayAllocations: 10,
    opticalLoadArrayAllocations: 3,
    endpointOpticalLoad: endpointOpticalLoad(
      workspace.bands,
      config.opticalLoad,
    ),
    population,
    finite: workspaceIsFinite(workspace, config),
  }
}

function workspaceIsFinite(
  workspace: ReturnType<typeof createPhenomenonWorkspace>,
  config: Readonly<typeof DEFAULT_PHENOMENON_CONFIG>,
): boolean {
  const state = workspace.particles
  for (let index = 0; index < state.capacity; index += 1) {
    const isActive = state.active[index] === 1
    if (
      !Number.isFinite(state.positionX[index]) ||
      !Number.isFinite(state.positionY[index]) ||
      !Number.isFinite(state.positionZ[index]) ||
      !Number.isFinite(state.velocityX[index]) ||
      !Number.isFinite(state.velocityY[index]) ||
      !Number.isFinite(state.velocityZ[index]) ||
      !Number.isFinite(state.mass[index]) ||
      (isActive ? state.mass[index] <= 0 : state.mass[index] !== 0) ||
      !Number.isFinite(state.diameter[index]) ||
      (isActive ? state.diameter[index] <= 0 : state.diameter[index] !== 0) ||
      !particleDiameterIsConsistent(state, index, config.geometry) ||
      (state.settled[index] !== 0 && state.settled[index] !== 1)
    )
      return false
  }
  for (const value of workspace.bands.values)
    if (!Number.isFinite(value) || value < 0 || value > 1) return false
  return true
}

function validateOptions(options: HeadlessBenchmarkOptions) {
  if (!Number.isInteger(options.particleCount) || options.particleCount < 1) {
    throw new RangeError('Benchmark particle count must be a positive integer')
  }
  if (!Number.isInteger(options.steps) || options.steps < 1) {
    throw new RangeError('Benchmark steps must be a positive integer')
  }
}
