import { isDoseIndex, type DoseIndex } from './commands'
import type { TrialResultV1 } from './trialResult'

export const EXPERIMENT_LOG_STORAGE_KEY = 'sunol-flowlab:experiment-log:v1'
export const EXPERIMENT_LOG_SCHEMA_VERSION = 1
export const CANONICAL_DOSES = [0, 2, 4, 6, 8, 10] as const

export type CanonicalDose = (typeof CANONICAL_DOSES)[number]

export interface ExperimentLogV1 {
  readonly schemaVersion: 1
  readonly projectVersion: string
  readonly points: readonly TrialResultV1[]
  readonly updatedAt: string
}

export interface CanonicalJarSummary {
  readonly dose: CanonicalDose
  readonly trialId: string
  readonly endpointOpticalLoad: number
  readonly displayClarity: number
}

export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type ExperimentMemoryStatus =
  | 'ready'
  | 'restored'
  | 'empty'
  | 'corrupt-discarded'
  | 'future-version-discarded'
  | 'storage-unavailable'
  | 'write-failed'

export interface ExperimentMemorySnapshot {
  readonly log: ExperimentLogV1
  readonly canonicalSummaries: readonly CanonicalJarSummary[]
  readonly status: ExperimentMemoryStatus
  readonly lastError: string | null
}

type Now = () => string

export class ExperimentMemory {
  private logValue: ExperimentLogV1
  private statusValue: ExperimentMemoryStatus = 'empty'
  private lastErrorValue: string | null = null

  constructor(
    private readonly storage: KeyValueStorage | null,
    private readonly projectVersion: string,
    private readonly now: Now = () => new Date().toISOString(),
  ) {
    this.logValue = createEmptyExperimentLog(projectVersion, now())
    this.restore()
  }

  get log(): ExperimentLogV1 {
    return this.logValue
  }

  get canonicalSummaries(): readonly CanonicalJarSummary[] {
    return deriveCanonicalJarSummaries(this.logValue.points)
  }

  get status(): ExperimentMemoryStatus {
    return this.statusValue
  }

  get lastError(): string | null {
    return this.lastErrorValue
  }

  snapshot(): ExperimentMemorySnapshot {
    return Object.freeze({
      log: this.logValue,
      canonicalSummaries: this.canonicalSummaries,
      status: this.statusValue,
      lastError: this.lastErrorValue,
    })
  }

  append(result: TrialResultV1): boolean {
    if (!isTrialResultV1(result))
      throw new RangeError('Cannot append a malformed trial result')
    if (this.logValue.points.some((point) => point.id === result.id))
      return false

    this.logValue = freezeExperimentLog({
      schemaVersion: 1,
      projectVersion: this.projectVersion,
      points: [...this.logValue.points, result],
      updatedAt: this.now(),
    })
    if (this.persist()) this.statusValue = 'ready'
    return true
  }

  clear(): boolean {
    const previous = this.logValue
    this.logValue = createEmptyExperimentLog(this.projectVersion, this.now())
    if (this.storage === null) {
      this.statusValue = 'storage-unavailable'
      return true
    }
    try {
      this.storage.removeItem(EXPERIMENT_LOG_STORAGE_KEY)
      this.statusValue = 'empty'
      this.lastErrorValue = null
      return true
    } catch (error) {
      this.logValue = previous
      this.fail('write-failed', error)
      return false
    }
  }

  private restore(): void {
    if (this.storage === null) {
      this.statusValue = 'storage-unavailable'
      return
    }
    let serialized: string | null
    try {
      serialized = this.storage.getItem(EXPERIMENT_LOG_STORAGE_KEY)
    } catch (error) {
      this.fail('storage-unavailable', error)
      return
    }
    if (serialized === null) {
      this.statusValue = 'empty'
      return
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(serialized)
    } catch (error) {
      this.discardStored('corrupt-discarded', error)
      return
    }
    if (hasFutureSchemaVersion(parsed)) {
      this.discardStored(
        'future-version-discarded',
        new Error('Unsupported future experiment-log schema'),
      )
      return
    }
    const restored = migrateExperimentLog(parsed, this.projectVersion)
    if (restored === null) {
      this.discardStored(
        'corrupt-discarded',
        new Error('Malformed experiment log'),
      )
      return
    }
    this.logValue = restored
    this.statusValue = 'restored'
    this.lastErrorValue = null
  }

  private persist(): boolean {
    if (this.storage === null) {
      this.statusValue = 'storage-unavailable'
      return true
    }
    try {
      this.storage.setItem(
        EXPERIMENT_LOG_STORAGE_KEY,
        JSON.stringify(this.logValue),
      )
      this.lastErrorValue = null
      return true
    } catch (error) {
      this.fail('write-failed', error)
      return false
    }
  }

  private discardStored(
    status: Extract<
      ExperimentMemoryStatus,
      'corrupt-discarded' | 'future-version-discarded'
    >,
    error: unknown,
  ): void {
    try {
      this.storage?.removeItem(EXPERIMENT_LOG_STORAGE_KEY)
    } catch {
      // Recovery must not turn corrupt application data into a simulation fault.
    }
    this.fail(status, error)
  }

  private fail(status: ExperimentMemoryStatus, error: unknown): void {
    this.statusValue = status
    this.lastErrorValue =
      error instanceof Error ? error.message : 'Unknown persistence error'
  }
}

export function createEmptyExperimentLog(
  projectVersion: string,
  updatedAt: string,
): ExperimentLogV1 {
  return freezeExperimentLog({
    schemaVersion: 1,
    projectVersion,
    points: [],
    updatedAt,
  })
}

export function displayClarityFromEndpoint(
  endpointOpticalLoad: number,
): number {
  return 1 - clamp01(endpointOpticalLoad)
}

export function gaugeValueFromEndpoint(endpointOpticalLoad: number): number {
  return clamp01(endpointOpticalLoad)
}

export function plotValueFromResult(result: TrialResultV1): number {
  return gaugeValueFromEndpoint(result.endpointOpticalLoad)
}

export function deriveCanonicalJarSummaries(
  points: readonly TrialResultV1[],
): readonly CanonicalJarSummary[] {
  const latest = new Map<CanonicalDose, TrialResultV1>()
  for (const point of points) {
    if (isCanonicalDose(point.dose)) latest.set(point.dose, point)
  }
  return Object.freeze(
    CANONICAL_DOSES.flatMap((dose) => {
      const point = latest.get(dose)
      return point === undefined
        ? []
        : [
            Object.freeze({
              dose,
              trialId: point.id,
              endpointOpticalLoad: point.endpointOpticalLoad,
              displayClarity: displayClarityFromEndpoint(
                point.endpointOpticalLoad,
              ),
            }),
          ]
    }),
  )
}

export function migrateExperimentLog(
  input: unknown,
  currentProjectVersion: string,
): ExperimentLogV1 | null {
  if (!isRecord(input) || input.schemaVersion !== 1) return null
  if (
    typeof input.projectVersion !== 'string' ||
    typeof input.updatedAt !== 'string' ||
    !Array.isArray(input.points) ||
    !input.points.every(isTrialResultV1)
  )
    return null
  const ids = new Set<string>()
  for (const point of input.points) {
    if (ids.has(point.id)) return null
    ids.add(point.id)
  }
  return freezeExperimentLog({
    schemaVersion: 1,
    projectVersion:
      input.projectVersion.length === 0
        ? currentProjectVersion
        : input.projectVersion,
    points: input.points.map(freezeTrialResult),
    updatedAt: input.updatedAt,
  })
}

export function isTrialResultV1(input: unknown): input is TrialResultV1 {
  if (!isRecord(input) || input.schemaVersion !== 1) return false
  if (
    typeof input.id !== 'string' ||
    input.id.length === 0 ||
    !isDoseIndex(input.dose) ||
    !Number.isInteger(input.seed) ||
    typeof input.rawWaterConfigId !== 'string' ||
    input.rawWaterConfigId.length === 0 ||
    typeof input.opticalProxyVersion !== 'string' ||
    input.opticalProxyVersion.length === 0 ||
    !isNormalized(input.endpointOpticalLoad) ||
    !Array.isArray(input.bandSnapshot) ||
    input.bandSnapshot.length === 0 ||
    !input.bandSnapshot.every(isNormalized) ||
    !isTimeline(input.phaseTimeline) ||
    !Number.isFinite(input.completedAtSimulationTime) ||
    typeof input.configHash !== 'string' ||
    input.configHash.length === 0
  )
    return false
  return input.completedAtSimulationTime === input.phaseTimeline.measurementTime
}

function freezeExperimentLog(log: ExperimentLogV1): ExperimentLogV1 {
  return Object.freeze({
    ...log,
    points: Object.freeze(log.points.map(freezeTrialResult)),
  })
}

function freezeTrialResult(result: TrialResultV1): TrialResultV1 {
  if (Object.isFrozen(result)) return result
  return Object.freeze({
    ...result,
    bandSnapshot: Object.freeze([...result.bandSnapshot]),
    phaseTimeline: Object.freeze({ ...result.phaseTimeline }),
  })
}

function isCanonicalDose(dose: DoseIndex): dose is CanonicalDose {
  return (CANONICAL_DOSES as readonly number[]).includes(dose)
}

function isTimeline(value: unknown): value is TrialResultV1['phaseTimeline'] {
  if (!isRecord(value)) return false
  const times = [
    value.rapidMixEnd,
    value.flocculationEnd,
    value.settlingEnd,
    value.measurementTime,
  ]
  return (
    times.every((time) => Number.isFinite(time) && Number(time) > 0) &&
    Number(value.rapidMixEnd) < Number(value.flocculationEnd) &&
    Number(value.flocculationEnd) < Number(value.settlingEnd) &&
    Number(value.settlingEnd) < Number(value.measurementTime)
  )
}

function hasFutureSchemaVersion(input: unknown): boolean {
  return (
    isRecord(input) &&
    typeof input.schemaVersion === 'number' &&
    input.schemaVersion > EXPERIMENT_LOG_SCHEMA_VERSION
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNormalized(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  )
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}
