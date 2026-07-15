import { stepParticleDrift } from './drift'
import { FixedStepClock } from './fixedStep'
import { createParticleState, resetParticleState } from './particleState'

export interface HeadlessBenchmarkOptions {
  readonly particleCount: number
  readonly steps: number
  readonly seed: number
  readonly fixedTimestepSeconds: number
}

export interface HeadlessBenchmarkReport {
  readonly schemaVersion: 1
  readonly particleCount: number
  readonly steps: number
  readonly seed: number
  readonly fixedTimestepSeconds: number
  readonly totalMs: number
  readonly averageStepMs: number
  readonly p95StepMs: number
  readonly activeParticles: number
  readonly stateArrayAllocations: 7
  readonly finite: boolean
}

export const DEFAULT_BENCHMARK_OPTIONS: HeadlessBenchmarkOptions = Object.freeze({
  particleCount: 500,
  steps: 10_000,
  seed: 0x5f3759df,
  fixedTimestepSeconds: 1 / 60,
})

export function runHeadlessBenchmark(
  options: HeadlessBenchmarkOptions = DEFAULT_BENCHMARK_OPTIONS,
  now: () => number = () => performance.now(),
): HeadlessBenchmarkReport {
  validateOptions(options)
  const state = createParticleState(options.particleCount)
  resetParticleState(state, options.seed)
  const clock = new FixedStepClock(options.fixedTimestepSeconds)
  const samples = new Float64Array(options.steps)
  const step = (timestepSeconds: number) => stepParticleDrift(state, timestepSeconds)

  const benchmarkStart = now()
  for (let index = 0; index < options.steps; index += 1) {
    const stepStart = now()
    clock.stepHeadless(1, step)
    samples[index] = now() - stepStart
  }
  const totalMs = now() - benchmarkStart

  const sortedSamples = Array.from(samples).sort((a, b) => a - b)
  let sampleTotal = 0
  for (let index = 0; index < samples.length; index += 1) sampleTotal += samples[index]

  return {
    schemaVersion: 1,
    particleCount: options.particleCount,
    steps: options.steps,
    seed: options.seed,
    fixedTimestepSeconds: options.fixedTimestepSeconds,
    totalMs,
    averageStepMs: sampleTotal / options.steps,
    p95StepMs: sortedSamples[Math.ceil(options.steps * 0.95) - 1],
    activeParticles: state.activeCount,
    stateArrayAllocations: 7,
    finite: stateIsFinite(state),
  }
}

function stateIsFinite(state: ReturnType<typeof createParticleState>): boolean {
  for (let index = 0; index < state.capacity; index += 1) {
    if (
      !Number.isFinite(state.positionX[index]) || !Number.isFinite(state.positionY[index]) ||
      !Number.isFinite(state.positionZ[index]) || !Number.isFinite(state.velocityX[index]) ||
      !Number.isFinite(state.velocityY[index]) || !Number.isFinite(state.velocityZ[index])
    ) return false
  }
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

