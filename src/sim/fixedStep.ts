export interface FixedStepSnapshot {
  readonly running: boolean
  readonly simulationTimeSeconds: number
  readonly stepCount: number
  readonly accumulatorSeconds: number
  readonly droppedSeconds: number
}

export type StepFunction = (fixedTimestepSeconds: number) => void

export class FixedStepClock {
  readonly fixedTimestepSeconds: number
  readonly maxCatchUpSteps: number

  private running = false
  private simulationTimeSeconds = 0
  private stepCount = 0
  private accumulatorSeconds = 0
  private droppedSeconds = 0

  constructor(fixedTimestepSeconds = 1 / 60, maxCatchUpSteps = 5) {
    if (!Number.isFinite(fixedTimestepSeconds) || fixedTimestepSeconds <= 0) {
      throw new RangeError('Fixed timestep must be a positive finite number')
    }
    if (!Number.isInteger(maxCatchUpSteps) || maxCatchUpSteps < 1) {
      throw new RangeError('Maximum catch-up steps must be a positive integer')
    }

    this.fixedTimestepSeconds = fixedTimestepSeconds
    this.maxCatchUpSteps = maxCatchUpSteps
  }

  start() {
    this.running = true
  }

  pause() {
    this.running = false
  }

  reset() {
    this.running = false
    this.simulationTimeSeconds = 0
    this.stepCount = 0
    this.accumulatorSeconds = 0
    this.droppedSeconds = 0
  }

  advance(elapsedSeconds: number, step: StepFunction): number {
    this.validateElapsed(elapsedSeconds)
    if (!this.running) {
      return 0
    }

    const maximumAccumulation = this.fixedTimestepSeconds * this.maxCatchUpSteps
    const accumulated = this.accumulatorSeconds + elapsedSeconds
    if (accumulated > maximumAccumulation) {
      this.droppedSeconds += accumulated - maximumAccumulation
      this.accumulatorSeconds = maximumAccumulation
    } else {
      this.accumulatorSeconds = accumulated
    }

    let executed = 0
    const epsilon = this.fixedTimestepSeconds * 1e-9
    while (
      executed < this.maxCatchUpSteps &&
      this.accumulatorSeconds + epsilon >= this.fixedTimestepSeconds
    ) {
      step(this.fixedTimestepSeconds)
      this.accumulatorSeconds = Math.max(
        0,
        this.accumulatorSeconds - this.fixedTimestepSeconds,
      )
      this.simulationTimeSeconds += this.fixedTimestepSeconds
      this.stepCount += 1
      executed += 1
    }

    return executed
  }

  stepHeadless(count: number, step: StepFunction): void {
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError('Headless step count must be a non-negative integer')
    }

    for (let index = 0; index < count; index += 1) {
      step(this.fixedTimestepSeconds)
      this.simulationTimeSeconds += this.fixedTimestepSeconds
      this.stepCount += 1
    }
  }

  snapshot(): FixedStepSnapshot {
    return {
      running: this.running,
      simulationTimeSeconds: this.simulationTimeSeconds,
      stepCount: this.stepCount,
      accumulatorSeconds: this.accumulatorSeconds,
      droppedSeconds: this.droppedSeconds,
    }
  }

  private validateElapsed(elapsedSeconds: number) {
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
      throw new RangeError('Elapsed time must be a non-negative finite number')
    }
  }
}

