import { isDoseIndex, type AppCommand, type DoseIndex } from './commands'

export type Batch05TrialLifecycle = 'ready' | 'running' | 'interrupted'

export interface Batch05CommandTarget {
  readonly isRunning: boolean
  pause(): void
  reset(seed: number | undefined, dose: DoseIndex): void
  start(): void
}

export interface Batch05CommandRecord {
  readonly accepted: boolean
  readonly commandType: string
  readonly dose: DoseIndex
  readonly lifecycle: Batch05TrialLifecycle
  readonly reason: string | null
}

export type Batch05CommandLogger = (record: Batch05CommandRecord) => void

export class Batch05CommandAdapter {
  private selectedDoseValue: DoseIndex
  private lifecycleValue: Batch05TrialLifecycle = 'ready'

  constructor(
    private readonly target: Batch05CommandTarget,
    initialDose: DoseIndex = 5,
    private readonly log: Batch05CommandLogger = () => undefined,
  ) {
    if (!isDoseIndex(initialDose)) {
      throw new RangeError('Initial dose must be an integer from 0 through 10')
    }
    this.selectedDoseValue = initialDose
  }

  get selectedDose(): DoseIndex {
    return this.selectedDoseValue
  }

  get lifecycle(): Batch05TrialLifecycle {
    return this.lifecycleValue
  }

  dispatch(input: unknown): Batch05CommandRecord {
    if (!isCommandObject(input))
      return this.reject('INVALID', 'invalid command')

    if (input.type === 'SET_DOSE') {
      if (!isDoseIndex(input.dose)) {
        return this.reject(
          'SET_DOSE',
          'dose must be an integer from 0 through 10',
        )
      }
      if (this.lifecycleValue !== 'ready') {
        return this.reject('SET_DOSE', 'dose can only change while ready')
      }
      this.selectedDoseValue = input.dose
      return this.accept(input.type)
    }

    if (input.type === 'START_TRIAL') {
      if (this.lifecycleValue === 'running') {
        return this.reject(input.type, 'trial is already running')
      }
      if (this.lifecycleValue === 'ready') {
        this.target.reset(undefined, this.selectedDoseValue)
      }
      this.target.start()
      this.lifecycleValue = 'running'
      return this.accept(input.type)
    }

    return this.reject(input.type, 'command is outside the Batch 05 adapter')
  }

  interrupt(): void {
    if (this.lifecycleValue !== 'running') return
    this.target.pause()
    this.lifecycleValue = 'interrupted'
  }

  resetToReady(): void {
    this.target.reset(undefined, this.selectedDoseValue)
    this.lifecycleValue = 'ready'
  }

  private accept(commandType: AppCommand['type']): Batch05CommandRecord {
    const record = this.record(true, commandType, null)
    this.log(record)
    return record
  }

  private reject(commandType: string, reason: string): Batch05CommandRecord {
    const record = this.record(false, commandType, reason)
    this.log(record)
    return record
  }

  private record(
    accepted: boolean,
    commandType: string,
    reason: string | null,
  ): Batch05CommandRecord {
    return {
      accepted,
      commandType,
      dose: this.selectedDoseValue,
      lifecycle: this.lifecycleValue,
      reason,
    }
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
