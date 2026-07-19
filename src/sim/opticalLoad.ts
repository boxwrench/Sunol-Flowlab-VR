import {
  DEFAULT_PARTICLE_BOUNDS,
  PARTICLE_SETTLED,
  type ParticleBounds,
  type ParticleState,
} from './particleState'

export interface OpticalLoadConfig {
  readonly bandCount: number
  readonly excludedBottomBands: number
  readonly upperClarityBandCount: number
  readonly upperClarityThreshold: number
}

export interface OpticalLoadBandsState {
  readonly values: Float32Array
  readonly min: 0
  readonly max: 1
  sampledAtSimulationTime: number
  globalRelativeLoad: number
  initialTotalLoad: number
  currentTotalLoad: number
  readonly initialLoads: Float64Array
  readonly currentLoads: Float64Array
}

export interface OpticalLoadBandsView {
  readonly values: Readonly<Float32Array>
  readonly min: 0
  readonly max: 1
  readonly sampledAtSimulationTime: number
  readonly globalRelativeLoad: number
  readonly initialTotalLoad: number
  readonly currentTotalLoad: number
  readonly initialLoads: Readonly<Float64Array>
  readonly currentLoads: Readonly<Float64Array>
}

export interface ClearingFrontDiagnostics {
  readonly topClearFraction: number
  readonly clearingFrontDepth: number
  readonly upperZoneOpticalLoad: number
}

export const DEFAULT_OPTICAL_LOAD_CONFIG: Readonly<OpticalLoadConfig> =
  Object.freeze({
    bandCount: 12,
    excludedBottomBands: 2,
    upperClarityBandCount: 4,
    upperClarityThreshold: 0.35,
  })

export function createOpticalLoadBands(
  config: Readonly<OpticalLoadConfig> = DEFAULT_OPTICAL_LOAD_CONFIG,
): OpticalLoadBandsState {
  validateOpticalLoadConfig(config)
  return {
    values: new Float32Array(config.bandCount),
    min: 0,
    max: 1,
    sampledAtSimulationTime: 0,
    globalRelativeLoad: 0,
    initialTotalLoad: 0,
    currentTotalLoad: 0,
    initialLoads: new Float64Array(config.bandCount),
    currentLoads: new Float64Array(config.bandCount),
  }
}

export function resetOpticalLoadBands(
  bands: OpticalLoadBandsState,
  particles: ParticleState,
  config: Readonly<OpticalLoadConfig> = DEFAULT_OPTICAL_LOAD_CONFIG,
  bounds: ParticleBounds = DEFAULT_PARTICLE_BOUNDS,
): void {
  validateBandStorage(bands, config)
  bands.initialLoads.fill(0)
  bands.currentLoads.fill(0)
  let initialTotalLoad = 0
  for (let index = 0; index < particles.capacity; index += 1) {
    if (
      particles.active[index] === 0 ||
      particles.settled[index] === PARTICLE_SETTLED
    )
      continue
    const load = opticalLoadContribution(particles.diameter[index])
    bands.initialLoads[bandIndex(particles.positionY[index], config, bounds)] +=
      load
    initialTotalLoad += load
  }

  bands.currentLoads.set(bands.initialLoads)
  bands.initialTotalLoad = initialTotalLoad
  bands.currentTotalLoad = initialTotalLoad
  bands.globalRelativeLoad = initialTotalLoad === 0 ? 0 : 1
  writeNormalizedBands(bands, config)
  bands.sampledAtSimulationTime = 0
}

export function sampleOpticalLoadBands(
  bands: OpticalLoadBandsState,
  particles: ParticleState,
  simulationTime: number,
  config: Readonly<OpticalLoadConfig> = DEFAULT_OPTICAL_LOAD_CONFIG,
  bounds: ParticleBounds = DEFAULT_PARTICLE_BOUNDS,
): void {
  validateBandStorage(bands, config)
  if (!Number.isFinite(simulationTime) || simulationTime < 0)
    throw new RangeError(
      'Optical-load sample time must be finite and non-negative',
    )

  bands.currentLoads.fill(0)
  let currentTotalLoad = 0
  for (let index = 0; index < particles.capacity; index += 1) {
    if (
      particles.active[index] === 0 ||
      particles.settled[index] === PARTICLE_SETTLED
    )
      continue
    const load = opticalLoadContribution(particles.diameter[index])
    bands.currentLoads[bandIndex(particles.positionY[index], config, bounds)] +=
      load
    currentTotalLoad += load
  }

  bands.currentTotalLoad = currentTotalLoad
  bands.globalRelativeLoad =
    bands.initialTotalLoad === 0 ? 0 : currentTotalLoad / bands.initialTotalLoad
  writeNormalizedBands(bands, config)
  bands.sampledAtSimulationTime = simulationTime
}

export function suspendedOpticalLoad(particles: ParticleState): number {
  let total = 0
  for (let index = 0; index < particles.capacity; index += 1) {
    if (
      particles.active[index] === 0 ||
      particles.settled[index] === PARTICLE_SETTLED
    )
      continue
    total += opticalLoadContribution(particles.diameter[index])
  }
  return total
}

export function endpointOpticalLoad(
  bands: OpticalLoadBandsView,
  config: Readonly<OpticalLoadConfig> = DEFAULT_OPTICAL_LOAD_CONFIG,
): number {
  return sampleZoneOpticalLoad(bands, config)
}

export function sampleZoneOpticalLoad(
  bands: OpticalLoadBandsView,
  config: Readonly<OpticalLoadConfig> = DEFAULT_OPTICAL_LOAD_CONFIG,
): number {
  validateBandStorage(bands, config)
  return normalizedZoneLoad(bands, config.excludedBottomBands, config.bandCount)
}

export function upperColumnOpticalLoad(
  bands: OpticalLoadBandsView,
  config: Readonly<OpticalLoadConfig> = DEFAULT_OPTICAL_LOAD_CONFIG,
): number {
  validateBandStorage(bands, config)
  const firstBand = config.bandCount - config.upperClarityBandCount
  return normalizedZoneLoad(bands, firstBand, config.bandCount)
}

export function clearingFrontDiagnostics(
  bands: OpticalLoadBandsView,
  config: Readonly<OpticalLoadConfig> = DEFAULT_OPTICAL_LOAD_CONFIG,
): ClearingFrontDiagnostics {
  validateBandStorage(bands, config)
  const firstUpperBand = config.bandCount - config.upperClarityBandCount
  let clearUpperBands = 0
  for (let band = firstUpperBand; band < config.bandCount; band += 1)
    if (bands.values[band] <= config.upperClarityThreshold) clearUpperBands += 1

  return {
    topClearFraction: clearUpperBands / config.upperClarityBandCount,
    clearingFrontDepth: clearingFrontDepthFromValues(
      bands.values,
      config.upperClarityThreshold,
    ),
    upperZoneOpticalLoad: upperColumnOpticalLoad(bands, config),
  }
}

export function clearingFrontDepthFromValues(
  values: ArrayLike<number>,
  upperClarityThreshold = DEFAULT_OPTICAL_LOAD_CONFIG.upperClarityThreshold,
): number {
  if (values.length === 0)
    throw new RangeError('Clearing-front values must not be empty')
  if (!Number.isFinite(upperClarityThreshold))
    throw new RangeError('Clearing-front threshold must be finite')
  let contiguousClearBands = 0
  for (let band = values.length - 1; band >= 0; band -= 1) {
    if (values[band] > upperClarityThreshold) break
    contiguousClearBands += 1
  }
  return contiguousClearBands / values.length
}

function writeNormalizedBands(
  bands: OpticalLoadBandsState,
  config: Readonly<OpticalLoadConfig>,
): void {
  const referenceLoad =
    bands.initialTotalLoad === 0 ? 1 : bands.initialTotalLoad / config.bandCount
  for (let band = 0; band < config.bandCount; band += 1)
    bands.values[band] = clamp01(bands.currentLoads[band] / referenceLoad)
}

function normalizedZoneLoad(
  bands: OpticalLoadBandsView,
  firstBand: number,
  finalBand: number,
): number {
  let initialLoad = 0
  let currentLoad = 0
  for (let band = firstBand; band < finalBand; band += 1) {
    initialLoad += bands.initialLoads[band]
    currentLoad += bands.currentLoads[band]
  }
  return initialLoad === 0 ? 0 : clamp01(currentLoad / initialLoad)
}

function bandIndex(
  positionY: number,
  config: Readonly<OpticalLoadConfig>,
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

function opticalLoadContribution(diameter: number): number {
  return diameter * diameter
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function validateBandStorage(
  bands: { readonly values: Readonly<Float32Array> },
  config: Readonly<OpticalLoadConfig>,
): void {
  validateOpticalLoadConfig(config)
  if (bands.values.length !== config.bandCount)
    throw new RangeError(
      'Optical-load band storage does not match configuration',
    )
}

function validateOpticalLoadConfig(config: Readonly<OpticalLoadConfig>): void {
  if (!Number.isInteger(config.bandCount) || config.bandCount < 3)
    throw new RangeError(
      'Optical-load band count must be an integer of at least 3',
    )
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
    throw new RangeError('Optical-load measurement configuration is invalid')
}
