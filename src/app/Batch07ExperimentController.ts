import { isDoseIndex, type AppCommand } from './commands'
import { clearingFrontDepthFromValues, endpointOpticalLoad } from '../sim'
import { ExperimentMemory, type KeyValueStorage } from './experimentMemory'
import type { SimulationRuntime } from './SimulationRuntime'
import {
  DEFAULT_GHOST_LIBRARY_LIMIT,
  TreatmentGhostLibrary,
  TreatmentGhostPlayback,
  TreatmentGhostRecorder,
  compatibilityForGhost,
  ghostTargetForRuntime,
  type TreatmentGhostV1,
} from './treatmentGhost'
import type {
  TreatmentCycleController,
  TreatmentCycleRecord,
} from './TreatmentCycle'
import { OPTICAL_PROXY_VERSION, RAW_WATER_CONFIG_ID } from './trialResult'

export const APP_PROJECT_VERSION = '0.0.0'
export const SIMULATION_VERSION = 'phenomenon-v1'

export interface Batch07CommandResult {
  readonly accepted: boolean
  readonly type: string
  readonly reason: string | null
}

export interface Batch07Snapshot {
  readonly experimentPointCount: number
  readonly plottedResults: readonly {
    readonly trialId: string
    readonly dose: number
    readonly relativeOpticalLoad: number
  }[]
  readonly canonicalSummaries: ReturnType<
    ExperimentMemory['snapshot']
  >['canonicalSummaries']
  readonly experimentStatus: string
  readonly ghostCount: number
  readonly ghostLibraryStatus: string
  readonly ghostSerializedBytes: number
  readonly selectedGhostTrialId: string | null
  readonly pendingGhostTrialId: string | null
  readonly playback: {
    readonly trialId: string | null
    readonly status: string
    readonly elapsedSeconds: number
    readonly durationSeconds: number
    readonly phase: string
    readonly endpointOpticalLoad: number | null
  }
}

export interface ReplayComparisonView {
  status: string
  clearingFrontDepth: number
}

type Now = () => string
type ChangeListener = () => void

export class Batch07ExperimentController {
  readonly memory: ExperimentMemory
  readonly recorder: TreatmentGhostRecorder
  readonly library: TreatmentGhostLibrary
  readonly playback: TreatmentGhostPlayback
  readonly instrumentView: { relativeOpticalLoad: number }
  readonly replayInstrumentView: {
    status: string
    elapsedSeconds: number
    durationSeconds: number
    relativeOpticalLoad: number | null
  }
  readonly replayComparisonView: ReplayComparisonView

  private pendingCandidateValue: TreatmentGhostV1 | null = null
  private selectedGhostTrialIdValue: string | null = null

  constructor(
    private readonly runtime: SimulationRuntime,
    storage: KeyValueStorage | null,
    private readonly onChange: ChangeListener = () => undefined,
    private readonly now: Now = () => new Date().toISOString(),
    ghostLimit = DEFAULT_GHOST_LIBRARY_LIMIT,
  ) {
    const bandCount = runtime.opticalLoadBands.values.length
    this.memory = new ExperimentMemory(storage, APP_PROJECT_VERSION, now)
    this.recorder = new TreatmentGhostRecorder(
      bandCount,
      runtime.phaseTimeline.measurementTime,
    )
    this.library = new TreatmentGhostLibrary(storage, ghostLimit)
    this.playback = new TreatmentGhostPlayback(bandCount)
    this.instrumentView = {
      relativeOpticalLoad: endpointOpticalLoad(runtime.opticalLoadBands),
    }
    this.replayInstrumentView = {
      status: this.playback.status,
      elapsedSeconds: this.playback.elapsedSeconds,
      durationSeconds: this.playback.durationSeconds,
      relativeOpticalLoad: null,
    }
    this.replayComparisonView = {
      status: this.playback.status,
      clearingFrontDepth: 0,
    }
    this.selectedGhostTrialIdValue =
      this.library.records.at(-1)?.trialId ?? null
    runtime.setOpticalLoadStepObserver((bands) => {
      this.instrumentView.relativeOpticalLoad = endpointOpticalLoad(bands)
      this.recorder.observe(bands)
    })
  }

  get pendingCandidate(): TreatmentGhostV1 | null {
    return this.pendingCandidateValue
  }

  handleCycleRecord(record: TreatmentCycleRecord): void {
    if (!record.accepted) return
    if (record.eventType === 'START') {
      this.pendingCandidateValue = null
      this.recorder.start(
        {
          simVersion: SIMULATION_VERSION,
          opticalProxyVersion: OPTICAL_PROXY_VERSION,
          seed: this.runtime.seed,
          doseIndex: this.runtime.dose,
          rawWaterConfigId: RAW_WATER_CONFIG_ID,
          simulationConfigHash: this.runtime.configHash,
          phaseTimeline: this.runtime.phaseTimeline,
        },
        this.runtime.opticalLoadBands,
      )
      this.instrumentView.relativeOpticalLoad = endpointOpticalLoad(
        this.runtime.opticalLoadBands,
      )
    } else if (
      record.eventType === 'MEASUREMENT_FINISHED' &&
      record.result !== null
    ) {
      this.instrumentView.relativeOpticalLoad =
        record.result.endpointOpticalLoad
      const appended = this.memory.append(record.result)
      if (appended) {
        const candidate = this.recorder.finalize(record.result, this.now())
        if (candidate !== null) {
          if (this.library.save(candidate)) {
            this.selectedGhostTrialIdValue = candidate.trialId
          } else {
            this.pendingCandidateValue = candidate
          }
        }
      }
    } else if (record.eventType === 'REFILL_REQUESTED') {
      this.instrumentView.relativeOpticalLoad = endpointOpticalLoad(
        this.runtime.opticalLoadBands,
      )
    } else if (record.eventType === 'FORCE_RESET_DEV_ONLY') {
      this.recorder.cancel()
      this.pendingCandidateValue = null
    }
    this.onChange()
  }

  dispatch(
    cycle: TreatmentCycleController,
    input: unknown,
  ): Batch07CommandResult | TreatmentCycleRecord {
    if (!isRecord(input) || typeof input.type !== 'string')
      return reject('INVALID', 'invalid command')
    switch (input.type) {
      case 'SET_DOSE':
      case 'START_TRIAL':
      case 'RESET_TRIAL':
      case 'PAUSE_TRIAL':
        return cycle.dispatchCommand(input)
      case 'CLEAR_EXPERIMENT_LOG': {
        const accepted = this.memory.clear()
        this.onChange()
        return accepted
          ? accept(input.type)
          : reject(input.type, this.memory.lastError ?? 'history clear failed')
      }
      case 'SELECT_GHOST': {
        if (
          typeof input.trialId !== 'string' ||
          !this.library.records.some(
            (candidate) => candidate.trialId === input.trialId,
          )
        )
          return reject(input.type, 'ghost not found')
        this.selectedGhostTrialIdValue = input.trialId
        this.onChange()
        return accept(input.type)
      }
      case 'PLAY_GHOST': {
        if (typeof input.trialId !== 'string')
          return reject(input.type, 'ghost trial ID is required')
        const ghost = this.library.records.find(
          (candidate) => candidate.trialId === input.trialId,
        )
        if (ghost === undefined) return reject(input.type, 'ghost not found')
        const target = ghostTargetForRuntime(
          this.runtime,
          OPTICAL_PROXY_VERSION,
          RAW_WATER_CONFIG_ID,
        )
        if (compatibilityForGhost(ghost, target) !== 'directly-compatible')
          return reject(input.type, 'ghost is incompatible with this apparatus')
        this.playback.load(ghost)
        this.playback.play()
        this.syncReplayInstrumentView()
        this.selectedGhostTrialIdValue = ghost.trialId
        this.onChange()
        return accept(input.type)
      }
      case 'PAUSE_GHOST':
        this.playback.pause()
        this.syncReplayInstrumentView()
        this.onChange()
        return accept(input.type)
      case 'SEEK_GHOST':
        if (!Number.isFinite(input.elapsedSeconds))
          return reject(input.type, 'ghost seek time must be finite')
        this.playback.seek(Number(input.elapsedSeconds))
        this.syncReplayInstrumentView()
        this.onChange()
        return accept(input.type)
      case 'RESET_GHOST':
        this.playback.reset()
        this.syncReplayInstrumentView()
        this.onChange()
        return accept(input.type)
      case 'DELETE_GHOST': {
        if (typeof input.trialId !== 'string')
          return reject(input.type, 'ghost trial ID is required')
        const accepted = this.library.delete(input.trialId)
        if (accepted && this.playback.view.trialId === input.trialId)
          this.playback.unload()
        this.syncReplayInstrumentView()
        if (accepted && this.selectedGhostTrialIdValue === input.trialId)
          this.selectedGhostTrialIdValue =
            this.library.records.at(-1)?.trialId ?? null
        this.onChange()
        return accepted
          ? accept(input.type)
          : reject(input.type, 'ghost not found or deletion failed')
      }
      case 'REPLACE_OLDEST_GHOST': {
        if (this.pendingCandidateValue === null)
          return reject(input.type, 'no pending ghost candidate')
        const accepted = this.library.replaceOldest(this.pendingCandidateValue)
        if (accepted) {
          this.selectedGhostTrialIdValue = this.pendingCandidateValue.trialId
          this.pendingCandidateValue = null
        }
        this.onChange()
        return accepted
          ? accept(input.type)
          : reject(
              input.type,
              this.library.lastError ?? 'ghost replacement failed',
            )
      }
      default:
        return reject(input.type, 'unsupported application command')
    }
  }

  advancePlayback(elapsedSeconds: number): void {
    this.playback.advance(elapsedSeconds)
    this.syncReplayInstrumentView()
  }

  snapshot(): Batch07Snapshot {
    const view = this.playback.view
    return Object.freeze({
      experimentPointCount: this.memory.log.points.length,
      plottedResults: Object.freeze(
        this.memory.log.points.map((point) =>
          Object.freeze({
            trialId: point.id,
            dose: point.dose,
            relativeOpticalLoad: point.endpointOpticalLoad,
          }),
        ),
      ),
      canonicalSummaries: this.memory.canonicalSummaries,
      experimentStatus: this.memory.status,
      ghostCount: this.library.records.length,
      ghostLibraryStatus: this.library.status,
      ghostSerializedBytes: this.library.serializedBytes,
      selectedGhostTrialId: this.selectedGhostTrialIdValue,
      pendingGhostTrialId: this.pendingCandidateValue?.trialId ?? null,
      playback: Object.freeze({
        trialId: view.trialId,
        status: view.status,
        elapsedSeconds: view.elapsedSeconds,
        durationSeconds: view.durationSeconds,
        phase: view.phase,
        endpointOpticalLoad: view.endpointOpticalLoad,
      }),
    })
  }

  dispose(): void {
    this.runtime.setOpticalLoadStepObserver(null)
  }

  private syncReplayInstrumentView(): void {
    this.replayInstrumentView.status = this.playback.status
    this.replayInstrumentView.elapsedSeconds = this.playback.elapsedSeconds
    this.replayInstrumentView.durationSeconds = this.playback.durationSeconds
    this.replayInstrumentView.relativeOpticalLoad =
      this.playback.status === 'empty'
        ? null
        : this.playback.view.endpointOpticalLoad
    this.replayComparisonView.status = this.playback.status
    this.replayComparisonView.clearingFrontDepth =
      this.playback.status === 'empty'
        ? 0
        : clearingFrontDepthFromValues(this.playback.bandValues)
  }
}

export function browserStorage(): KeyValueStorage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function isAppCommand(input: unknown): input is AppCommand {
  if (!isRecord(input) || typeof input.type !== 'string') return false
  switch (input.type) {
    case 'SET_DOSE':
      return isDoseIndex(input.dose)
    case 'SELECT_GHOST':
    case 'PLAY_GHOST':
    case 'DELETE_GHOST':
      return typeof input.trialId === 'string'
    case 'SEEK_GHOST':
      return (
        typeof input.elapsedSeconds === 'number' &&
        Number.isFinite(input.elapsedSeconds)
      )
    case 'START_TRIAL':
    case 'PAUSE_TRIAL':
    case 'RESET_TRIAL':
    case 'CLEAR_EXPERIMENT_LOG':
    case 'PAUSE_GHOST':
    case 'RESET_GHOST':
    case 'REPLACE_OLDEST_GHOST':
      return true
    default:
      return false
  }
}

function accept(type: string): Batch07CommandResult {
  return Object.freeze({ accepted: true, type, reason: null })
}

function reject(type: string, reason: string): Batch07CommandResult {
  return Object.freeze({ accepted: false, type, reason })
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null
}
