import {
  endpointOpticalLoad,
  type DoseDetent,
  type OpticalLoadBandsView,
} from '../sim'

export const RAW_WATER_CONFIG_ID = 'raw-water-v1'
export const OPTICAL_PROXY_VERSION = 'relative-optical-load-v1'

export interface TreatmentPhaseTimeline {
  readonly rapidMixEnd: number
  readonly flocculationEnd: number
  readonly settlingEnd: number
  readonly measurementTime: number
}

export interface TrialResultV1 {
  readonly schemaVersion: 1
  readonly id: string
  readonly dose: DoseDetent
  readonly seed: number
  readonly rawWaterConfigId: string
  readonly opticalProxyVersion: string
  readonly endpointOpticalLoad: number
  readonly bandSnapshot: readonly number[]
  readonly phaseTimeline: TreatmentPhaseTimeline
  readonly completedAtSimulationTime: number
  readonly configHash: string
}

export interface TrialResultSource {
  readonly configHash: string
  readonly dose: DoseDetent
  readonly opticalLoadBands: OpticalLoadBandsView
  readonly seed: number
  readonly simulationTimeSeconds: number
}

export function createTrialResultV1(
  source: TrialResultSource,
  timeline: TreatmentPhaseTimeline,
  sequence: number,
): TrialResultV1 {
  if (!Number.isInteger(sequence) || sequence < 1)
    throw new RangeError('Trial result sequence must be a positive integer')
  validateTimeline(timeline)
  if (!Number.isInteger(source.seed))
    throw new RangeError('Trial result seed must be an integer')
  if (!Number.isFinite(source.simulationTimeSeconds))
    throw new RangeError('Trial completion time must be finite')
  if (source.simulationTimeSeconds !== timeline.measurementTime) {
    throw new RangeError('Trial result must be captured at the fixed endpoint')
  }
  if (source.configHash.length === 0)
    throw new RangeError('Trial result config hash is required')

  const endpoint = endpointOpticalLoad(source.opticalLoadBands)
  if (!isNormalized(endpoint))
    throw new RangeError('Trial endpoint optical load must be normalized')
  const bands = Array.from(source.opticalLoadBands.values)
  if (bands.length === 0 || bands.some((value) => !isNormalized(value))) {
    throw new RangeError('Trial result bands must be finite and normalized')
  }

  const phaseTimeline = Object.freeze({ ...timeline })
  const bandSnapshot = Object.freeze(bands)
  return Object.freeze({
    schemaVersion: 1 as const,
    id: `trial-${source.configHash}-${source.seed.toString(16)}-d${source.dose}-r${sequence}`,
    dose: source.dose,
    seed: source.seed,
    rawWaterConfigId: RAW_WATER_CONFIG_ID,
    opticalProxyVersion: OPTICAL_PROXY_VERSION,
    endpointOpticalLoad: endpoint,
    bandSnapshot,
    phaseTimeline,
    completedAtSimulationTime: source.simulationTimeSeconds,
    configHash: source.configHash,
  })
}

function validateTimeline(timeline: TreatmentPhaseTimeline): void {
  const values = [
    timeline.rapidMixEnd,
    timeline.flocculationEnd,
    timeline.settlingEnd,
    timeline.measurementTime,
  ]
  if (values.some((value) => !Number.isFinite(value) || value <= 0))
    throw new RangeError('Treatment phase times must be positive and finite')
  if (
    timeline.rapidMixEnd >= timeline.flocculationEnd ||
    timeline.flocculationEnd >= timeline.settlingEnd ||
    timeline.settlingEnd >= timeline.measurementTime
  ) {
    throw new RangeError('Treatment phase timeline must be strictly ordered')
  }
}

function isNormalized(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1
}
