import { DEFAULT_PHENOMENON_CONFIG } from '../sim'
import { isDoseIndex, type DoseIndex } from './commands'
import {
  CANONICAL_SIMULATION_SEED,
  type SimulationRuntime,
} from './SimulationRuntime'
import {
  createTrialResultV1,
  type TreatmentPhaseTimeline,
  type TrialResultV1,
} from './trialResult'

export type TrialPhase =
  | 'READY'
  | 'RAPID_MIX'
  | 'FLOCCULATION'
  | 'SETTLING'
  | 'MEASURING'
  | 'COMPLETE'
  | 'REFILLING'

export type TrialEvent =
  | { readonly type: 'SET_DOSE'; readonly dose: DoseIndex }
  | { readonly type: 'START' }
  | { readonly type: 'PHASE_TIMER_ELAPSED' }
  | { readonly type: 'MEASUREMENT_FINISHED' }
  | { readonly type: 'REFILL_REQUESTED' }
  | { readonly type: 'REFILL_FINISHED' }
  | { readonly type: 'FORCE_RESET_DEV_ONLY' }

export type TrialEventType = TrialEvent['type']

export interface TreatmentCycleConfig {
  readonly schemaVersion: 1
  readonly phaseTimeline: TreatmentPhaseTimeline
  readonly completeHold: 'until-refill'
  readonly refillSeconds: number
  readonly globalTimeScale: number
}

export interface TrialTransitionRule {
  readonly from: TrialPhase
  readonly event: TrialEventType
  readonly to: TrialPhase
  readonly sideEffect: string
}

export interface TrialControlAvailability {
  readonly doseEnabled: boolean
  readonly startEnabled: boolean
  readonly refillEnabled: boolean
}

export interface TreatmentCycleRecord {
  readonly accepted: boolean
  readonly eventType: string
  readonly from: TrialPhase
  readonly to: TrialPhase
  readonly dose: DoseIndex
  readonly reason: string | null
  readonly resultId: string | null
  readonly result: TrialResultV1 | null
}

export type TreatmentCycleLogger = (record: TreatmentCycleRecord) => void

const coagulation = DEFAULT_PHENOMENON_CONFIG.coagulation
const rapidMixEnd = coagulation.rapidMixSeconds
const flocculationEnd = rapidMixEnd + coagulation.flocculationSeconds
const settlingEnd = flocculationEnd + coagulation.settlingSeconds

export const DEFAULT_TREATMENT_CYCLE_CONFIG: TreatmentCycleConfig =
  Object.freeze({
    schemaVersion: 1,
    phaseTimeline: Object.freeze({
      rapidMixEnd,
      flocculationEnd,
      settlingEnd,
      measurementTime: settlingEnd + coagulation.measurementSeconds,
    }),
    completeHold: 'until-refill',
    refillSeconds: 2,
    globalTimeScale: 1,
  })

const REGULAR_TRANSITIONS: readonly TrialTransitionRule[] = [
  {
    from: 'READY',
    event: 'SET_DOSE',
    to: 'READY',
    sideEffect: 'select validated integer dose',
  },
  {
    from: 'READY',
    event: 'START',
    to: 'RAPID_MIX',
    sideEffect: 'deterministically reset and start the simulation',
  },
  {
    from: 'RAPID_MIX',
    event: 'PHASE_TIMER_ELAPSED',
    to: 'FLOCCULATION',
    sideEffect: 'follow the authoritative simulation schedule',
  },
  {
    from: 'FLOCCULATION',
    event: 'PHASE_TIMER_ELAPSED',
    to: 'SETTLING',
    sideEffect: 'follow the authoritative simulation schedule',
  },
  {
    from: 'SETTLING',
    event: 'PHASE_TIMER_ELAPSED',
    to: 'MEASURING',
    sideEffect: 'activate the fixed measurement cue',
  },
  {
    from: 'MEASURING',
    event: 'MEASUREMENT_FINISHED',
    to: 'COMPLETE',
    sideEffect: 'freeze one immutable authoritative result',
  },
  {
    from: 'COMPLETE',
    event: 'REFILL_REQUESTED',
    to: 'REFILLING',
    sideEffect: 'clear active result and restore identical raw water',
  },
  {
    from: 'REFILLING',
    event: 'REFILL_FINISHED',
    to: 'READY',
    sideEffect: 'unlock controls after the refill hold',
  },
]

const ALL_PHASES: readonly TrialPhase[] = [
  'READY',
  'RAPID_MIX',
  'FLOCCULATION',
  'SETTLING',
  'MEASURING',
  'COMPLETE',
  'REFILLING',
]

export const TRIAL_TRANSITION_TABLE: readonly TrialTransitionRule[] =
  Object.freeze([
    ...REGULAR_TRANSITIONS,
    ...ALL_PHASES.map((phase) => ({
      from: phase,
      event: 'FORCE_RESET_DEV_ONLY' as const,
      to: 'READY' as const,
      sideEffect: 'development-only deterministic reset',
    })),
  ])

export function controlsForTrialPhase(
  phase: TrialPhase,
): TrialControlAvailability {
  return {
    doseEnabled: phase === 'READY',
    startEnabled: phase === 'READY',
    refillEnabled: phase === 'COMPLETE',
  }
}

export function transitionForTrialEvent(
  phase: TrialPhase,
  eventType: TrialEventType,
): TrialTransitionRule | null {
  return (
    TRIAL_TRANSITION_TABLE.find(
      (transition) =>
        transition.from === phase && transition.event === eventType,
    ) ?? null
  )
}

export class TreatmentCycleController {
  private phaseValue: TrialPhase = 'READY'
  private selectedDoseValue: DoseIndex
  private interruptedValue = false
  private refillElapsedSecondsValue = 0
  private resultValue: TrialResultV1 | null = null
  private resultCountValue = 0
  private trialSequence = 0
  private presentationEpochValue = 0
  private lastFailureValue: string | null = null

  constructor(
    private readonly runtime: SimulationRuntime,
    initialDose: DoseIndex = 5,
    private readonly config: TreatmentCycleConfig = DEFAULT_TREATMENT_CYCLE_CONFIG,
    private readonly onChange: TreatmentCycleLogger = () => undefined,
  ) {
    if (!isDoseIndex(initialDose))
      throw new RangeError('Initial dose must be an integer from 0 through 10')
    validateTreatmentCycleConfig(config)
    requireMatchingTimeline(runtime.phaseTimeline, config.phaseTimeline)
    this.selectedDoseValue = initialDose
    this.runtime.reset(CANONICAL_SIMULATION_SEED, initialDose)
  }

  get phase(): TrialPhase {
    return this.phaseValue
  }

  get selectedDose(): DoseIndex {
    return this.selectedDoseValue
  }

  get result(): TrialResultV1 | null {
    return this.resultValue
  }

  get resultCount(): number {
    return this.resultCountValue
  }

  get isInterrupted(): boolean {
    return this.interruptedValue
  }

  get refillElapsedSeconds(): number {
    return this.refillElapsedSecondsValue
  }

  get presentationEpoch(): number {
    return this.presentationEpochValue
  }

  get lastFailure(): string | null {
    return this.lastFailureValue
  }

  get controlAvailability(): TrialControlAvailability {
    return controlsForTrialPhase(this.phaseValue)
  }

  get phaseTimeline(): TreatmentPhaseTimeline {
    return this.config.phaseTimeline
  }

  dispatchCommand(input: unknown): TreatmentCycleRecord {
    if (!isCommandObject(input))
      return this.reject('INVALID', 'invalid command')
    if (input.type === 'SET_DOSE') {
      if (!isDoseIndex(input.dose))
        return this.reject(
          input.type,
          'dose must be an integer from 0 through 10',
        )
      return this.applyEvent({ type: 'SET_DOSE', dose: input.dose })
    }
    if (input.type === 'START_TRIAL') return this.applyEvent({ type: 'START' })
    if (input.type === 'RESET_TRIAL')
      return this.applyEvent({ type: 'REFILL_REQUESTED' })
    return this.reject(input.type, 'command is outside the Batch 06 controller')
  }

  forceResetDevOnly(): TreatmentCycleRecord {
    return this.applyEvent({ type: 'FORCE_RESET_DEV_ONLY' })
  }

  advance(elapsedSeconds: number): number {
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0)
      throw new RangeError('Elapsed time must be finite and non-negative')
    if (this.interruptedValue) return 0
    const scaledElapsed = elapsedSeconds * this.config.globalTimeScale
    if (isProcessPhase(this.phaseValue)) {
      const steps = this.runtime.step(scaledElapsed)
      this.synchronizeProcessPhase()
      return steps
    }
    if (this.phaseValue === 'REFILLING') {
      this.refillElapsedSecondsValue += scaledElapsed
      if (this.refillElapsedSecondsValue >= this.config.refillSeconds)
        this.applyEvent({ type: 'REFILL_FINISHED' })
    }
    return 0
  }

  advanceHeadless(stepCount: number): number {
    if (!Number.isInteger(stepCount) || stepCount < 0)
      throw new RangeError('Headless step count must be non-negative')
    if (this.interruptedValue || !isProcessPhase(this.phaseValue)) return 0
    const executed = Math.min(stepCount, this.runtime.remainingTreatmentSteps)
    this.runtime.stepHeadless(executed)
    this.synchronizeProcessPhase()
    return executed
  }

  interrupt(reason = 'lifecycle interruption'): void {
    if (this.interruptedValue) return
    this.interruptedValue = true
    this.runtime.pause()
    this.notify({
      accepted: true,
      eventType: 'INTERRUPT',
      from: this.phaseValue,
      to: this.phaseValue,
      dose: this.selectedDoseValue,
      reason,
      resultId: this.resultValue?.id ?? null,
      result: this.resultValue,
    })
  }

  resumeAfterInterruption(): void {
    if (!this.interruptedValue) return
    this.interruptedValue = false
    if (isProcessPhase(this.phaseValue)) this.runtime.start()
    this.notify({
      accepted: true,
      eventType: 'RESUME',
      from: this.phaseValue,
      to: this.phaseValue,
      dose: this.selectedDoseValue,
      reason: null,
      resultId: this.resultValue?.id ?? null,
      result: this.resultValue,
    })
  }

  private applyEvent(event: TrialEvent): TreatmentCycleRecord {
    const transition = transitionForTrialEvent(this.phaseValue, event.type)
    if (transition === null)
      return this.reject(
        event.type,
        `event is illegal during ${this.phaseValue}`,
      )
    const from = this.phaseValue

    if (event.type === 'SET_DOSE') {
      this.selectedDoseValue = event.dose
    } else if (event.type === 'START') {
      this.resultValue = null
      this.lastFailureValue = null
      this.interruptedValue = false
      this.trialSequence += 1
      this.runtime.reset(CANONICAL_SIMULATION_SEED, this.selectedDoseValue)
      this.presentationEpochValue += 1
      this.runtime.start()
    } else if (event.type === 'MEASUREMENT_FINISHED') {
      this.runtime.pause()
      try {
        const result = createTrialResultV1(
          this.runtime,
          this.config.phaseTimeline,
          this.trialSequence,
        )
        this.resultValue = result
        this.resultCountValue += 1
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : 'malformed result generation'
        this.failSafeReset(reason)
        return this.reject(event.type, reason, from)
      }
    } else if (event.type === 'REFILL_REQUESTED') {
      this.runtime.pause()
      this.resultValue = null
      this.refillElapsedSecondsValue = 0
      this.runtime.reset(CANONICAL_SIMULATION_SEED, this.selectedDoseValue)
      this.presentationEpochValue += 1
    } else if (event.type === 'REFILL_FINISHED') {
      this.refillElapsedSecondsValue = 0
    } else if (event.type === 'FORCE_RESET_DEV_ONLY') {
      this.forceResetInternal()
    }

    this.phaseValue = transition.to
    const record: TreatmentCycleRecord = {
      accepted: true,
      eventType: event.type,
      from,
      to: this.phaseValue,
      dose: this.selectedDoseValue,
      reason: null,
      resultId: this.resultValue?.id ?? null,
      result: this.resultValue,
    }
    this.notify(record)
    return record
  }

  private synchronizeProcessPhase(): void {
    const simulationPhase = this.runtime.phase
    while (true) {
      if (this.phaseValue === 'RAPID_MIX' && simulationPhase !== 'rapidMix') {
        this.applyEvent({ type: 'PHASE_TIMER_ELAPSED' })
        continue
      }
      if (
        this.phaseValue === 'FLOCCULATION' &&
        simulationPhase !== 'rapidMix' &&
        simulationPhase !== 'flocculation'
      ) {
        this.applyEvent({ type: 'PHASE_TIMER_ELAPSED' })
        continue
      }
      if (
        this.phaseValue === 'SETTLING' &&
        (simulationPhase === 'measurement' || simulationPhase === 'complete')
      ) {
        this.applyEvent({ type: 'PHASE_TIMER_ELAPSED' })
        continue
      }
      if (this.phaseValue === 'MEASURING' && simulationPhase === 'complete') {
        this.applyEvent({ type: 'MEASUREMENT_FINISHED' })
      }
      return
    }
  }

  private failSafeReset(reason: string): void {
    this.forceResetInternal()
    this.lastFailureValue = reason
    this.phaseValue = 'READY'
  }

  private forceResetInternal(): void {
    this.runtime.pause()
    this.runtime.reset(CANONICAL_SIMULATION_SEED, this.selectedDoseValue)
    this.resultValue = null
    this.lastFailureValue = null
    this.interruptedValue = false
    this.refillElapsedSecondsValue = 0
    this.presentationEpochValue += 1
  }

  private reject(
    eventType: string,
    reason: string,
    from = this.phaseValue,
  ): TreatmentCycleRecord {
    const record: TreatmentCycleRecord = {
      accepted: false,
      eventType,
      from,
      to: this.phaseValue,
      dose: this.selectedDoseValue,
      reason,
      resultId: this.resultValue?.id ?? null,
      result: this.resultValue,
    }
    this.notify(record)
    return record
  }

  private notify(record: TreatmentCycleRecord): void {
    this.onChange(Object.freeze(record))
  }
}

function isProcessPhase(phase: TrialPhase): boolean {
  return (
    phase === 'RAPID_MIX' ||
    phase === 'FLOCCULATION' ||
    phase === 'SETTLING' ||
    phase === 'MEASURING'
  )
}

function validateTreatmentCycleConfig(config: TreatmentCycleConfig): void {
  if (config.schemaVersion !== 1)
    throw new RangeError('Unsupported treatment-cycle config schema')
  if (
    !Number.isFinite(config.refillSeconds) ||
    config.refillSeconds <= 0 ||
    !Number.isFinite(config.globalTimeScale) ||
    config.globalTimeScale <= 0
  ) {
    throw new RangeError('Treatment-cycle timing must be positive and finite')
  }
  if (config.completeHold !== 'until-refill')
    throw new RangeError('Unsupported complete hold behavior')
}

function requireMatchingTimeline(
  runtime: TreatmentPhaseTimeline,
  configured: TreatmentPhaseTimeline,
): void {
  if (
    runtime.rapidMixEnd !== configured.rapidMixEnd ||
    runtime.flocculationEnd !== configured.flocculationEnd ||
    runtime.settlingEnd !== configured.settlingEnd ||
    runtime.measurementTime !== configured.measurementTime
  ) {
    throw new RangeError(
      'Treatment-cycle timeline must match the authoritative simulation schedule',
    )
  }
}

function isCommandObject(
  input: unknown,
): input is { readonly type: string; readonly dose?: unknown } {
  return (
    typeof input === 'object' &&
    input !== null &&
    'type' in input &&
    typeof input.type === 'string'
  )
}
