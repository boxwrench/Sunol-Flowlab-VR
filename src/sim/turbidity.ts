import {
  DEFAULT_PARTICLE_BOUNDS,
  PARTICLE_SETTLED,
  type ParticleBounds,
  type ParticleState,
} from './particleState'

export interface TurbidityConfig {
  readonly bandCount: number
  readonly rawTurbidity: number
  readonly treatmentRange: number
  readonly efficiencyExponent: number
  readonly globalLoadWeight: number
  readonly excludedBottomBands: number
  readonly upperClarityBandCount: number
  readonly upperClarityThreshold: number
}

export interface TurbidityBandsState {
  readonly values: Float32Array
  readonly min: 0
  readonly max: 1
  sampledAtSimulationTime: number
  readonly initialLoads: Float64Array
  readonly currentLoads: Float64Array
}

export interface TurbidityBandsView {
  readonly values: Readonly<Float32Array>
  readonly min: 0
  readonly max: 1
  readonly sampledAtSimulationTime: number
}

export interface ClearingFrontDiagnostics {
  readonly topClearFraction: number
  readonly clearingFrontDepth: number
  readonly upperZoneTurbidity: number
}

export const DEFAULT_TURBIDITY_CONFIG: Readonly<TurbidityConfig> =
  Object.freeze({
    bandCount: 12,
    rawTurbidity: 0.92,
    treatmentRange: 0.72,
    efficiencyExponent: 1.5,
    globalLoadWeight: 0.35,
    excludedBottomBands: 2,
    upperClarityBandCount: 4,
    upperClarityThreshold: 0.35,
  })

export function createTurbidityBands(
  config: Readonly<TurbidityConfig> = DEFAULT_TURBIDITY_CONFIG,
): TurbidityBandsState {
  validateTurbidityConfig(config)
  return {
    values: new Float32Array(config.bandCount),
    min: 0,
    max: 1,
    sampledAtSimulationTime: 0,
    initialLoads: new Float64Array(config.bandCount),
    currentLoads: new Float64Array(config.bandCount),
  }
}

export function resetTurbidityBands(
  bands: TurbidityBandsState,
  particles: ParticleState,
  config: Readonly<TurbidityConfig> = DEFAULT_TURBIDITY_CONFIG,
  bounds: ParticleBounds = DEFAULT_PARTICLE_BOUNDS,
): void {
  validateBandStorage(bands, config)
  bands.initialLoads.fill(0)
  bands.currentLoads.fill(0)
  for (let index = 0; index < particles.capacity; index += 1) {
    if (particles.active[index] === 0) continue
    bands.initialLoads[bandIndex(particles.positionY[index], config, bounds)] +=
      opticalLoad(particles.normalizedSize[index])
  }
  bands.values.fill(config.rawTurbidity)
  bands.sampledAtSimulationTime = 0
}

export function sampleTurbidityBands(
  bands: TurbidityBandsState,
  particles: ParticleState,
  efficiency: number,
  simulationTime: number,
  config: Readonly<TurbidityConfig> = DEFAULT_TURBIDITY_CONFIG,
  bounds: ParticleBounds = DEFAULT_PARTICLE_BOUNDS,
): void {
  validateBandStorage(bands, config)
  if (!Number.isFinite(efficiency) || efficiency < 0 || efficiency > 1)
    throw new RangeError('Turbidity efficiency must be within [0, 1]')
  if (!Number.isFinite(simulationTime) || simulationTime < 0)
    throw new RangeError(
      'Turbidity sample time must be finite and non-negative',
    )

  bands.currentLoads.fill(0)
  let initialTotal = 0
  let currentTotal = 0
  for (let band = 0; band < config.bandCount; band += 1)
    initialTotal += bands.initialLoads[band]
  for (let index = 0; index < particles.capacity; index += 1) {
    if (
      particles.active[index] === 0 ||
      particles.settled[index] === PARTICLE_SETTLED
    )
      continue
    const load = opticalLoad(particles.normalizedSize[index])
    bands.currentLoads[bandIndex(particles.positionY[index], config, bounds)] +=
      load
    currentTotal += load
  }

  const globalRatio =
    initialTotal === 0 ? 0 : clamp01(currentTotal / initialTotal)
  const unresolvedFloor = clamp01(
    config.rawTurbidity -
      config.treatmentRange * efficiency ** config.efficiencyExponent,
  )
  for (let band = 0; band < config.bandCount; band += 1) {
    const initialLoad = bands.initialLoads[band]
    const localRatio =
      initialLoad === 0
        ? globalRatio
        : clamp01(bands.currentLoads[band] / initialLoad)
    const loadRatio =
      config.globalLoadWeight * globalRatio +
      (1 - config.globalLoadWeight) * localRatio
    bands.values[band] = clamp01(
      unresolvedFloor + (config.rawTurbidity - unresolvedFloor) * loadRatio,
    )
  }
  bands.sampledAtSimulationTime = simulationTime
}

export function endpointTurbidity(
  bands: TurbidityBandsView,
  config: Readonly<TurbidityConfig> = DEFAULT_TURBIDITY_CONFIG,
): number {
  validateBandStorage(bands, config)
  let total = 0
  for (
    let band = config.excludedBottomBands;
    band < config.bandCount;
    band += 1
  )
    total += bands.values[band]
  return total / (config.bandCount - config.excludedBottomBands)
}

export function upperColumnTurbidity(
  bands: TurbidityBandsView,
  config: Readonly<TurbidityConfig> = DEFAULT_TURBIDITY_CONFIG,
): number {
  validateBandStorage(bands, config)
  let total = 0
  const firstBand = config.bandCount - config.upperClarityBandCount
  for (let band = firstBand; band < config.bandCount; band += 1)
    total += bands.values[band]
  return total / config.upperClarityBandCount
}

export function clearingFrontDiagnostics(
  bands: TurbidityBandsView,
  config: Readonly<TurbidityConfig> = DEFAULT_TURBIDITY_CONFIG,
): ClearingFrontDiagnostics {
  validateBandStorage(bands, config)
  const firstUpperBand = config.bandCount - config.upperClarityBandCount
  let clearUpperBands = 0
  for (let band = firstUpperBand; band < config.bandCount; band += 1)
    if (bands.values[band] <= config.upperClarityThreshold) clearUpperBands += 1

  let contiguousClearBands = 0
  for (let band = config.bandCount - 1; band >= 0; band -= 1) {
    if (bands.values[band] > config.upperClarityThreshold) break
    contiguousClearBands += 1
  }

  return {
    topClearFraction: clearUpperBands / config.upperClarityBandCount,
    clearingFrontDepth: contiguousClearBands / config.bandCount,
    upperZoneTurbidity: upperColumnTurbidity(bands, config),
  }
}

function bandIndex(
  positionY: number,
  config: Readonly<TurbidityConfig>,
  bounds: ParticleBounds,
): number {
  const normalized = clamp01(
    (positionY - bounds.minY) / (bounds.maxY - bounds.minY),
  )
  return Math.min(
    config.bandCount - 1,
    Math.floor(normalized * config.bandCount),
  )
}

function opticalLoad(normalizedSize: number): number {
  const safeSize = Math.max(0.05, normalizedSize)
  return 1 / (safeSize * safeSize)
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function validateBandStorage(
  bands: { readonly values: Readonly<Float32Array> },
  config: Readonly<TurbidityConfig>,
): void {
  validateTurbidityConfig(config)
  if (bands.values.length !== config.bandCount)
    throw new RangeError('Turbidity band storage does not match configuration')
}

function validateTurbidityConfig(config: Readonly<TurbidityConfig>): void {
  if (!Number.isInteger(config.bandCount) || config.bandCount < 3)
    throw new RangeError(
      'Turbidity band count must be an integer of at least 3',
    )
  if (
    !Number.isFinite(config.rawTurbidity) ||
    config.rawTurbidity < 0 ||
    config.rawTurbidity > 1 ||
    !Number.isFinite(config.treatmentRange) ||
    config.treatmentRange < 0 ||
    config.treatmentRange > config.rawTurbidity ||
    !Number.isFinite(config.efficiencyExponent) ||
    config.efficiencyExponent <= 0 ||
    !Number.isFinite(config.globalLoadWeight) ||
    config.globalLoadWeight < 0 ||
    config.globalLoadWeight > 1
  )
    throw new RangeError('Normalized turbidity configuration is invalid')
  if (
    !Number.isInteger(config.excludedBottomBands) ||
    config.excludedBottomBands < 0 ||
    config.excludedBottomBands >= config.bandCount ||
    !Number.isInteger(config.upperClarityBandCount) ||
    config.upperClarityBandCount < 1 ||
    config.upperClarityBandCount > config.bandCount ||
    !Number.isFinite(config.upperClarityThreshold) ||
    config.upperClarityThreshold < 0 ||
    config.upperClarityThreshold > 1
  )
    throw new RangeError('Turbidity measurement configuration is invalid')
}
