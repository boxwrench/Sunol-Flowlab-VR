import type { OpticalLoadBandsView } from '../sim'
import type { KeyValueStorage } from './experimentMemory'
import type { SimulationRuntime } from './SimulationRuntime'
import type { TreatmentPhaseTimeline, TrialResultV1 } from './trialResult'

export const TREATMENT_GHOST_SCHEMA_VERSION = 1
export const TREATMENT_GHOST_SAMPLE_RATE_HZ = 10
export const GHOST_LIBRARY_STORAGE_KEY = 'sunol-flowlab:ghost-library:v1'
export const DEFAULT_GHOST_LIBRARY_LIMIT = 3

export interface TreatmentGhostV1 {
  readonly schemaVersion: 1
  readonly simVersion: string
  readonly opticalProxyVersion: string
  readonly trialId: string
  readonly createdAt: string
  readonly seed: number
  readonly doseIndex: number
  readonly rawWaterConfigId: string
  readonly simulationConfigHash: string
  readonly sampleRateHz: number
  readonly durationSeconds: number
  readonly sampleCount: number
  readonly bandCount: number
  readonly bandEdges: Readonly<Float32Array>
  readonly samples: Readonly<Float32Array>
  readonly phaseTimeline: TreatmentPhaseTimeline
  readonly endpointOpticalLoad: number
}

export interface GhostRecordingMetadata {
  readonly simVersion: string
  readonly opticalProxyVersion: string
  readonly seed: number
  readonly doseIndex: number
  readonly rawWaterConfigId: string
  readonly simulationConfigHash: string
  readonly phaseTimeline: TreatmentPhaseTimeline
}

export type GhostRecorderStatus =
  'idle' | 'recording' | 'candidate-ready' | 'cadence-gap' | 'invalid'

export class TreatmentGhostRecorder {
  private readonly samples: Float32Array
  private readonly bandEdges: Float32Array
  private metadata: GhostRecordingMetadata | null = null
  private sampleCountValue = 0
  private nextSampleTime = 0
  private statusValue: GhostRecorderStatus = 'idle'
  private lastErrorValue: string | null = null

  constructor(
    readonly bandCount: number,
    readonly durationSeconds: number,
    readonly sampleRateHz = TREATMENT_GHOST_SAMPLE_RATE_HZ,
  ) {
    if (!Number.isInteger(bandCount) || bandCount < 1)
      throw new RangeError('Ghost band count must be a positive integer')
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0)
      throw new RangeError('Ghost duration must be positive and finite')
    if (!Number.isInteger(sampleRateHz) || sampleRateHz <= 0)
      throw new RangeError('Ghost sample rate must be a positive integer')
    const capacity = Math.round(durationSeconds * sampleRateHz) + 1
    this.samples = new Float32Array(capacity * bandCount)
    this.bandEdges = new Float32Array(bandCount + 1)
    for (let index = 0; index <= bandCount; index += 1)
      this.bandEdges[index] = index / bandCount
  }

  get status(): GhostRecorderStatus {
    return this.statusValue
  }

  get sampleCount(): number {
    return this.sampleCountValue
  }

  get capacitySamples(): number {
    return this.samples.length / this.bandCount
  }

  get lastError(): string | null {
    return this.lastErrorValue
  }

  start(metadata: GhostRecordingMetadata, source: OpticalLoadBandsView): void {
    validateRecordingMetadata(metadata)
    requireBands(source.values, this.bandCount)
    if (
      Math.abs(metadata.phaseTimeline.measurementTime - this.durationSeconds) >
      1e-9
    )
      throw new RangeError('Ghost duration must match the treatment timeline')
    this.metadata = Object.freeze({
      ...metadata,
      phaseTimeline: Object.freeze({ ...metadata.phaseTimeline }),
    })
    this.samples.fill(0)
    this.sampleCountValue = 0
    this.nextSampleTime = 0
    this.statusValue = 'recording'
    this.lastErrorValue = null
    this.writeSample(source.values)
    this.nextSampleTime = 1 / this.sampleRateHz
  }

  observe(source: OpticalLoadBandsView): void {
    if (this.statusValue !== 'recording') return
    requireBands(source.values, this.bandCount)
    const time = source.sampledAtSimulationTime
    if (!Number.isFinite(time) || time < 0) {
      this.invalidate('Ghost sample time must be finite and non-negative')
      return
    }
    const interval = 1 / this.sampleRateHz
    if (time + 1e-7 < this.nextSampleTime) return
    if (time > this.nextSampleTime + interval + 1e-7) {
      this.statusValue = 'cadence-gap'
      this.lastErrorValue =
        'Recorder missed more than one 10 Hz sample interval'
      return
    }
    if (this.sampleCountValue >= this.capacitySamples) {
      this.invalidate('Ghost recorder capacity exceeded')
      return
    }
    this.writeSample(source.values)
    this.nextSampleTime = this.sampleCountValue / this.sampleRateHz
  }

  finalize(result: TrialResultV1, createdAt: string): TreatmentGhostV1 | null {
    if (this.statusValue !== 'recording' || this.metadata === null) return null
    if (
      result.seed !== this.metadata.seed ||
      result.dose !== this.metadata.doseIndex ||
      result.rawWaterConfigId !== this.metadata.rawWaterConfigId ||
      result.opticalProxyVersion !== this.metadata.opticalProxyVersion ||
      result.configHash !== this.metadata.simulationConfigHash
    ) {
      this.invalidate(
        'Completed result does not match ghost recording metadata',
      )
      return null
    }
    if (result.bandSnapshot.length !== this.bandCount) {
      this.invalidate('Completed result band layout does not match recording')
      return null
    }

    const expectedSamples =
      Math.round(this.durationSeconds * this.sampleRateHz) + 1
    if (this.sampleCountValue === expectedSamples - 1) {
      this.writeSample(result.bandSnapshot)
    }
    if (this.sampleCountValue !== expectedSamples) {
      this.invalidate(
        'Ghost recording did not contain the expected 10 Hz samples',
      )
      return null
    }
    const finalOffset = (this.sampleCountValue - 1) * this.bandCount
    for (let band = 0; band < this.bandCount; band += 1) {
      if (
        Math.abs(this.samples[finalOffset + band] - result.bandSnapshot[band]) >
        1e-6
      ) {
        this.invalidate(
          'Final ghost sample does not agree with the trial result bands',
        )
        return null
      }
    }
    if (!isNormalized(result.endpointOpticalLoad)) {
      this.invalidate('Ghost endpoint must be finite and normalized')
      return null
    }

    const ghost: TreatmentGhostV1 = Object.freeze({
      schemaVersion: 1,
      simVersion: this.metadata.simVersion,
      opticalProxyVersion: this.metadata.opticalProxyVersion,
      trialId: result.id,
      createdAt,
      seed: result.seed,
      doseIndex: result.dose,
      rawWaterConfigId: result.rawWaterConfigId,
      simulationConfigHash: result.configHash,
      sampleRateHz: this.sampleRateHz,
      durationSeconds: this.durationSeconds,
      sampleCount: this.sampleCountValue,
      bandCount: this.bandCount,
      bandEdges: this.bandEdges.slice(),
      samples: this.samples.slice(0, this.sampleCountValue * this.bandCount),
      phaseTimeline: Object.freeze({ ...result.phaseTimeline }),
      endpointOpticalLoad: result.endpointOpticalLoad,
    })
    this.statusValue = 'candidate-ready'
    return ghost
  }

  cancel(): void {
    this.metadata = null
    this.sampleCountValue = 0
    this.statusValue = 'idle'
    this.lastErrorValue = null
  }

  private writeSample(values: ArrayLike<number>): void {
    const offset = this.sampleCountValue * this.bandCount
    for (let band = 0; band < this.bandCount; band += 1) {
      const value = values[band]
      if (!isNormalized(value)) {
        this.invalidate('Ghost samples must be finite and normalized')
        return
      }
      this.samples[offset + band] = value
    }
    this.sampleCountValue += 1
  }

  private invalidate(message: string): void {
    this.statusValue = 'invalid'
    this.lastErrorValue = message
  }
}

export type GhostCompatibility =
  | 'directly-compatible'
  | 'tested-migration-compatible'
  | 'legacy-summary-only'
  | 'incompatible'

export interface GhostCompatibilityTarget {
  readonly opticalProxyVersion: string
  readonly rawWaterConfigId: string
  readonly simulationConfigHash: string
  readonly sampleRateHz: number
  readonly bandCount: number
  readonly bandEdges: ArrayLike<number>
  readonly phaseTimeline: TreatmentPhaseTimeline
}

export interface LegacyGhostSummary {
  readonly compatibility: 'legacy-summary-only'
  readonly trialId: string
  readonly doseIndex: number
  readonly endpointOpticalLoad: number
}

export interface DecodedGhost {
  readonly compatibility:
    'directly-compatible' | 'tested-migration-compatible' | 'incompatible'
  readonly ghost: TreatmentGhostV1
}

export function decodeTreatmentGhost(
  input: unknown,
  target?: GhostCompatibilityTarget,
): DecodedGhost | LegacyGhostSummary | null {
  const migrated = migrateLegacyGhost(input)
  if (migrated !== null) {
    if ('compatibility' in migrated) return migrated
    const compatibility =
      target === undefined
        ? 'tested-migration-compatible'
        : compatibilityForGhost(migrated, target) === 'directly-compatible'
          ? 'tested-migration-compatible'
          : 'incompatible'
    return { compatibility, ghost: migrated }
  }
  const ghost = parseCurrentGhost(input)
  if (ghost === null) return null
  return {
    compatibility:
      target === undefined
        ? 'directly-compatible'
        : compatibilityForGhost(ghost, target),
    ghost,
  }
}

export function compatibilityForGhost(
  ghost: TreatmentGhostV1,
  target: GhostCompatibilityTarget,
): Extract<GhostCompatibility, 'directly-compatible' | 'incompatible'> {
  return ghost.opticalProxyVersion === target.opticalProxyVersion &&
    ghost.rawWaterConfigId === target.rawWaterConfigId &&
    ghost.simulationConfigHash === target.simulationConfigHash &&
    ghost.sampleRateHz === target.sampleRateHz &&
    ghost.bandCount === target.bandCount &&
    arraysEqual(ghost.bandEdges, target.bandEdges) &&
    timelinesEqual(ghost.phaseTimeline, target.phaseTimeline)
    ? 'directly-compatible'
    : 'incompatible'
}

export interface GhostLibraryDocumentV1 {
  readonly schemaVersion: 1
  readonly records: readonly TreatmentGhostV1[]
}

export type GhostLibraryStatus =
  | 'empty'
  | 'ready'
  | 'restored'
  | 'limit-reached'
  | 'corrupt-discarded'
  | 'future-version-discarded'
  | 'storage-unavailable'
  | 'write-failed'

export class TreatmentGhostLibrary {
  private recordsValue: readonly TreatmentGhostV1[] = Object.freeze([])
  private statusValue: GhostLibraryStatus = 'empty'
  private lastErrorValue: string | null = null
  private serializedBytesValue = 0

  constructor(
    private readonly storage: KeyValueStorage | null,
    readonly limit = DEFAULT_GHOST_LIBRARY_LIMIT,
  ) {
    if (!Number.isInteger(limit) || limit < 1)
      throw new RangeError('Ghost library limit must be a positive integer')
    this.restore()
  }

  get records(): readonly TreatmentGhostV1[] {
    return this.recordsValue
  }

  get status(): GhostLibraryStatus {
    return this.statusValue
  }

  get lastError(): string | null {
    return this.lastErrorValue
  }

  get serializedBytes(): number {
    return this.serializedBytesValue
  }

  save(record: TreatmentGhostV1): boolean {
    if (parseCurrentGhost(serializeGhost(record)) === null)
      throw new RangeError('Cannot save an invalid treatment ghost')
    if (
      this.recordsValue.some(
        (candidate) => candidate.trialId === record.trialId,
      )
    )
      return false
    if (this.recordsValue.length >= this.limit) {
      this.statusValue = 'limit-reached'
      return false
    }
    return this.commit([...this.recordsValue, record])
  }

  replaceOldest(record: TreatmentGhostV1): boolean {
    if (this.recordsValue.length < this.limit) return this.save(record)
    return this.commit([...this.recordsValue.slice(1), record])
  }

  delete(trialId: string): boolean {
    const next = this.recordsValue.filter(
      (record) => record.trialId !== trialId,
    )
    if (next.length === this.recordsValue.length) return false
    return this.commit(next)
  }

  private restore(): void {
    if (this.storage === null) {
      this.statusValue = 'storage-unavailable'
      return
    }
    let serialized: string | null
    try {
      serialized = this.storage.getItem(GHOST_LIBRARY_STORAGE_KEY)
    } catch (error) {
      this.fail('storage-unavailable', error)
      return
    }
    if (serialized === null) return
    this.serializedBytesValue = new TextEncoder().encode(serialized).byteLength
    let input: unknown
    try {
      input = JSON.parse(serialized)
    } catch (error) {
      this.discard('corrupt-discarded', error)
      return
    }
    if (
      isRecord(input) &&
      typeof input.schemaVersion === 'number' &&
      input.schemaVersion > 1
    ) {
      this.discard(
        'future-version-discarded',
        new Error('Future ghost-library schema'),
      )
      return
    }
    if (
      !isRecord(input) ||
      input.schemaVersion !== 1 ||
      !Array.isArray(input.records)
    ) {
      this.discard('corrupt-discarded', new Error('Malformed ghost library'))
      return
    }
    const records: TreatmentGhostV1[] = []
    for (const candidate of input.records) {
      const decoded = decodeTreatmentGhost(candidate)
      if (
        decoded === null ||
        !('ghost' in decoded) ||
        decoded.compatibility === 'incompatible'
      ) {
        this.discard('corrupt-discarded', new Error('Malformed ghost record'))
        return
      }
      records.push(decoded.ghost)
    }
    if (records.length > this.limit) {
      this.discard(
        'corrupt-discarded',
        new Error('Ghost library exceeds configured limit'),
      )
      return
    }
    this.recordsValue = Object.freeze(records)
    this.statusValue = records.length === 0 ? 'empty' : 'restored'
  }

  private commit(records: readonly TreatmentGhostV1[]): boolean {
    const previous = this.recordsValue
    const serialized = JSON.stringify({
      schemaVersion: 1,
      records: records.map(serializeGhost),
    })
    if (this.storage !== null) {
      try {
        this.storage.setItem(GHOST_LIBRARY_STORAGE_KEY, serialized)
      } catch (error) {
        this.recordsValue = previous
        this.fail('write-failed', error)
        return false
      }
    }
    this.recordsValue = Object.freeze([...records])
    this.serializedBytesValue = new TextEncoder().encode(serialized).byteLength
    this.statusValue =
      this.storage === null
        ? 'storage-unavailable'
        : records.length === 0
          ? 'empty'
          : 'ready'
    this.lastErrorValue = null
    return true
  }

  private discard(
    status: Extract<
      GhostLibraryStatus,
      'corrupt-discarded' | 'future-version-discarded'
    >,
    error: unknown,
  ): void {
    try {
      this.storage?.removeItem(GHOST_LIBRARY_STORAGE_KEY)
    } catch {
      // A failed cleanup remains an isolated application-data error.
    }
    this.fail(status, error)
  }

  private fail(status: GhostLibraryStatus, error: unknown): void {
    this.statusValue = status
    this.lastErrorValue =
      error instanceof Error ? error.message : 'Unknown ghost-library error'
  }
}

export type GhostPlaybackStatus = 'empty' | 'paused' | 'playing' | 'ended'

export interface GhostPlaybackView {
  readonly trialId: string | null
  readonly status: GhostPlaybackStatus
  readonly elapsedSeconds: number
  readonly durationSeconds: number
  readonly phase: string
  readonly values: Readonly<Float32Array>
  readonly endpointOpticalLoad: number | null
}

export class TreatmentGhostPlayback {
  private ghost: TreatmentGhostV1 | null = null
  private statusValue: GhostPlaybackStatus = 'empty'
  private elapsedSecondsValue = 0
  private readonly values: Float32Array

  constructor(readonly bandCount: number) {
    this.values = new Float32Array(bandCount)
  }

  get status(): GhostPlaybackStatus {
    return this.statusValue
  }

  get elapsedSeconds(): number {
    return this.elapsedSecondsValue
  }

  get durationSeconds(): number {
    return this.ghost?.durationSeconds ?? 0
  }

  get view(): GhostPlaybackView {
    return {
      trialId: this.ghost?.trialId ?? null,
      status: this.statusValue,
      elapsedSeconds: this.elapsedSecondsValue,
      durationSeconds: this.ghost?.durationSeconds ?? 0,
      phase:
        this.ghost === null
          ? 'NONE'
          : phaseAtTime(this.elapsedSecondsValue, this.ghost.phaseTimeline),
      values: this.values,
      endpointOpticalLoad: this.ghost?.endpointOpticalLoad ?? null,
    }
  }

  load(ghost: TreatmentGhostV1): void {
    if (ghost.bandCount !== this.bandCount)
      throw new RangeError('Playback band layout is incompatible')
    this.ghost = ghost
    this.statusValue = 'paused'
    this.elapsedSecondsValue = 0
    this.writeInterpolatedValues()
  }

  unload(): void {
    this.ghost = null
    this.statusValue = 'empty'
    this.elapsedSecondsValue = 0
    this.values.fill(0)
  }

  play(): void {
    if (this.ghost === null) return
    if (this.statusValue === 'ended') this.elapsedSecondsValue = 0
    this.statusValue = 'playing'
    this.writeInterpolatedValues()
  }

  pause(): void {
    if (this.ghost !== null && this.statusValue === 'playing')
      this.statusValue = 'paused'
  }

  seek(elapsedSeconds: number): void {
    if (this.ghost === null) return
    if (!Number.isFinite(elapsedSeconds))
      throw new RangeError('Ghost seek time must be finite')
    this.elapsedSecondsValue = Math.min(
      this.ghost.durationSeconds,
      Math.max(0, elapsedSeconds),
    )
    this.statusValue =
      this.elapsedSecondsValue === this.ghost.durationSeconds
        ? 'ended'
        : 'paused'
    this.writeInterpolatedValues()
  }

  reset(): void {
    if (this.ghost === null) return
    this.elapsedSecondsValue = 0
    this.statusValue = 'paused'
    this.writeInterpolatedValues()
  }

  advance(elapsedSeconds: number): void {
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0)
      throw new RangeError(
        'Ghost playback advance must be finite and non-negative',
      )
    if (this.ghost === null || this.statusValue !== 'playing') return
    this.elapsedSecondsValue = Math.min(
      this.ghost.durationSeconds,
      this.elapsedSecondsValue + elapsedSeconds,
    )
    if (this.elapsedSecondsValue >= this.ghost.durationSeconds)
      this.statusValue = 'ended'
    this.writeInterpolatedValues()
  }

  private writeInterpolatedValues(): void {
    const ghost = this.ghost
    if (ghost === null) {
      this.values.fill(0)
      return
    }
    const samplePosition = this.elapsedSecondsValue * ghost.sampleRateHz
    const lower = Math.min(
      ghost.sampleCount - 1,
      Math.floor(samplePosition + 1e-9),
    )
    const upper = Math.min(ghost.sampleCount - 1, lower + 1)
    const fraction = Math.min(1, Math.max(0, samplePosition - lower))
    for (let band = 0; band < this.bandCount; band += 1) {
      const a = ghost.samples[lower * this.bandCount + band]
      const b = ghost.samples[upper * this.bandCount + band]
      this.values[band] = clamp01(a + (b - a) * fraction)
    }
  }
}

export function ghostTargetForRuntime(
  runtime: SimulationRuntime,
  opticalProxyVersion: string,
  rawWaterConfigId: string,
): GhostCompatibilityTarget {
  const bandCount = runtime.opticalLoadBands.values.length
  const bandEdges = new Float32Array(bandCount + 1)
  for (let index = 0; index <= bandCount; index += 1)
    bandEdges[index] = index / bandCount
  return {
    opticalProxyVersion,
    rawWaterConfigId,
    simulationConfigHash: runtime.configHash,
    sampleRateHz: TREATMENT_GHOST_SAMPLE_RATE_HZ,
    bandCount,
    bandEdges,
    phaseTimeline: runtime.phaseTimeline,
  }
}

function parseCurrentGhost(input: unknown): TreatmentGhostV1 | null {
  if (!isRecord(input) || input.schemaVersion !== 1) return null
  const bandEdges = numericArray(input.bandEdges)
  const samples = numericArray(input.samples)
  if (
    typeof input.simVersion !== 'string' ||
    input.simVersion.length === 0 ||
    typeof input.opticalProxyVersion !== 'string' ||
    input.opticalProxyVersion.length === 0 ||
    typeof input.trialId !== 'string' ||
    input.trialId.length === 0 ||
    typeof input.createdAt !== 'string' ||
    !Number.isInteger(input.seed) ||
    !Number.isInteger(input.doseIndex) ||
    Number(input.doseIndex) < 0 ||
    Number(input.doseIndex) > 10 ||
    typeof input.rawWaterConfigId !== 'string' ||
    input.rawWaterConfigId.length === 0 ||
    typeof input.simulationConfigHash !== 'string' ||
    input.simulationConfigHash.length === 0 ||
    input.sampleRateHz !== TREATMENT_GHOST_SAMPLE_RATE_HZ ||
    !Number.isFinite(input.durationSeconds) ||
    Number(input.durationSeconds) <= 0 ||
    !Number.isInteger(input.sampleCount) ||
    Number(input.sampleCount) < 2 ||
    !Number.isInteger(input.bandCount) ||
    Number(input.bandCount) < 1 ||
    bandEdges === null ||
    samples === null ||
    bandEdges.length !== Number(input.bandCount) + 1 ||
    samples.length !== Number(input.sampleCount) * Number(input.bandCount) ||
    !isTimeline(input.phaseTimeline) ||
    Number(input.durationSeconds) !== input.phaseTimeline.measurementTime ||
    Number(input.sampleCount) !==
      Math.round(Number(input.durationSeconds) * Number(input.sampleRateHz)) +
        1 ||
    !isNormalized(input.endpointOpticalLoad) ||
    !strictBandEdges(bandEdges)
  )
    return null
  return Object.freeze({
    schemaVersion: 1,
    simVersion: input.simVersion,
    opticalProxyVersion: input.opticalProxyVersion,
    trialId: input.trialId,
    createdAt: input.createdAt,
    seed: Number(input.seed),
    doseIndex: Number(input.doseIndex),
    rawWaterConfigId: input.rawWaterConfigId,
    simulationConfigHash: input.simulationConfigHash,
    sampleRateHz: Number(input.sampleRateHz),
    durationSeconds: Number(input.durationSeconds),
    sampleCount: Number(input.sampleCount),
    bandCount: Number(input.bandCount),
    bandEdges,
    samples,
    phaseTimeline: Object.freeze({ ...input.phaseTimeline }),
    endpointOpticalLoad: input.endpointOpticalLoad,
  })
}

function migrateLegacyGhost(
  input: unknown,
): TreatmentGhostV1 | LegacyGhostSummary | null {
  if (!isRecord(input) || input.schemaVersion !== 0) return null
  if (!('samples' in input)) {
    if (
      typeof input.trialId === 'string' &&
      Number.isInteger(input.doseIndex) &&
      isNormalized(input.endpointOpticalLoad)
    ) {
      return Object.freeze({
        compatibility: 'legacy-summary-only',
        trialId: input.trialId,
        doseIndex: Number(input.doseIndex),
        endpointOpticalLoad: input.endpointOpticalLoad,
      })
    }
    return null
  }
  const current = {
    ...input,
    schemaVersion: 1,
    simVersion: input.simulationVersion,
    simulationConfigHash: input.configHash,
  }
  return parseCurrentGhost(current)
}

function serializeGhost(ghost: TreatmentGhostV1): Record<string, unknown> {
  return {
    ...ghost,
    bandEdges: Array.from(ghost.bandEdges),
    samples: Array.from(ghost.samples),
  }
}

function numericArray(input: unknown): Float32Array | null {
  if (!Array.isArray(input) && !(input instanceof Float32Array)) return null
  const values = Float32Array.from(input as ArrayLike<number>)
  return Array.from(values).every(isNormalized) ? values : null
}

function validateRecordingMetadata(metadata: GhostRecordingMetadata): void {
  if (
    metadata.simVersion.length === 0 ||
    metadata.opticalProxyVersion.length === 0 ||
    !Number.isInteger(metadata.seed) ||
    !Number.isInteger(metadata.doseIndex) ||
    metadata.doseIndex < 0 ||
    metadata.doseIndex > 10 ||
    metadata.rawWaterConfigId.length === 0 ||
    metadata.simulationConfigHash.length === 0 ||
    !isTimeline(metadata.phaseTimeline)
  )
    throw new RangeError('Ghost recording metadata is invalid')
}

function requireBands(values: ArrayLike<number>, bandCount: number): void {
  if (values.length !== bandCount)
    throw new RangeError('Ghost band layout changed during recording')
}

function phaseAtTime(time: number, timeline: TreatmentPhaseTimeline): string {
  if (time < timeline.rapidMixEnd) return 'RAPID_MIX'
  if (time < timeline.flocculationEnd) return 'FLOCCULATION'
  if (time < timeline.settlingEnd) return 'SETTLING'
  if (time < timeline.measurementTime) return 'MEASURING'
  return 'COMPLETE'
}

function arraysEqual(a: ArrayLike<number>, b: ArrayLike<number>): boolean {
  if (a.length !== b.length) return false
  for (let index = 0; index < a.length; index += 1)
    if (Math.abs(a[index] - b[index]) > 1e-6) return false
  return true
}

function timelinesEqual(
  a: TreatmentPhaseTimeline,
  b: TreatmentPhaseTimeline,
): boolean {
  return (
    a.rapidMixEnd === b.rapidMixEnd &&
    a.flocculationEnd === b.flocculationEnd &&
    a.settlingEnd === b.settlingEnd &&
    a.measurementTime === b.measurementTime
  )
}

function strictBandEdges(edges: Float32Array): boolean {
  if (Math.abs(edges[0]) > 1e-6 || Math.abs(edges[edges.length - 1] - 1) > 1e-6)
    return false
  for (let index = 1; index < edges.length; index += 1)
    if (edges[index] <= edges[index - 1]) return false
  return true
}

function isTimeline(input: unknown): input is TreatmentPhaseTimeline {
  if (!isRecord(input)) return false
  const values = [
    input.rapidMixEnd,
    input.flocculationEnd,
    input.settlingEnd,
    input.measurementTime,
  ]
  return (
    values.every(
      (value) =>
        typeof value === 'number' && Number.isFinite(value) && value > 0,
    ) &&
    Number(input.rapidMixEnd) < Number(input.flocculationEnd) &&
    Number(input.flocculationEnd) < Number(input.settlingEnd) &&
    Number(input.settlingEnd) < Number(input.measurementTime)
  )
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null
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
  return Math.min(1, Math.max(0, value))
}
