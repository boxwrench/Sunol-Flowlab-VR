import { describe, expect, it } from 'vitest'

import type { KeyValueStorage } from './experimentMemory'
import { Batch07ExperimentController } from './Batch07ExperimentController'
import { SimulationRuntime } from './SimulationRuntime'
import { TreatmentCycleController } from './TreatmentCycle'

class MemoryStorage implements KeyValueStorage {
  readonly values = new Map<string, string>()
  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
  removeItem(key: string): void {
    this.values.delete(key)
  }
}

function createHarness(storage = new MemoryStorage(), ghostLimit = 3) {
  const runtime = new SimulationRuntime()
  const experimentRef: { current: Batch07ExperimentController | null } = {
    current: null,
  }
  const cycle = new TreatmentCycleController(runtime, 5, undefined, (record) =>
    experimentRef.current?.handleCycleRecord(record),
  )
  const experiment = new Batch07ExperimentController(
    runtime,
    storage,
    () => undefined,
    () => '2026-07-17T00:00:00.000Z',
    ghostLimit,
  )
  experimentRef.current = experiment
  return { runtime, cycle, experiment, storage }
}

function completeTrial(
  harness: ReturnType<typeof createHarness>,
  dose: number,
): void {
  harness.experiment.dispatch(harness.cycle, { type: 'SET_DOSE', dose })
  harness.experiment.dispatch(harness.cycle, { type: 'START_TRIAL' })
  harness.cycle.advanceHeadless(harness.runtime.remainingTreatmentSteps)
}

describe('Batch07ExperimentController', () => {
  it('captures one log point, canonical summary, and ghost per completion only', () => {
    const harness = createHarness()
    completeTrial(harness, 4)
    expect(harness.experiment.snapshot()).toMatchObject({
      experimentPointCount: 1,
      ghostCount: 1,
    })
    expect(harness.experiment.memory.canonicalSummaries).toHaveLength(1)
    expect(harness.experiment.memory.canonicalSummaries[0]?.dose).toBe(4)

    harness.experiment.dispatch(harness.cycle, { type: 'RESET_TRIAL' })
    harness.cycle.advance(2)
    expect(harness.experiment.snapshot().experimentPointCount).toBe(1)
    expect(harness.experiment.snapshot().ghostCount).toBe(1)
  })

  it('logs odd doses without changing canonical jars and restores from storage', () => {
    const harness = createHarness()
    completeTrial(harness, 3)
    expect(harness.experiment.memory.log.points[0]?.dose).toBe(3)
    expect(harness.experiment.memory.canonicalSummaries).toHaveLength(0)

    const restored = createHarness(harness.storage)
    expect(restored.experiment.snapshot()).toMatchObject({
      experimentPointCount: 1,
      ghostCount: 1,
    })
    expect(restored.experiment.memory.canonicalSummaries).toHaveLength(0)
  })

  it('clears experiment history and summaries without deleting ghosts', () => {
    const harness = createHarness()
    completeTrial(harness, 0)
    const result = harness.experiment.dispatch(harness.cycle, {
      type: 'CLEAR_EXPERIMENT_LOG',
    })
    expect(result.accepted).toBe(true)
    expect(harness.experiment.snapshot()).toMatchObject({
      experimentPointCount: 0,
      ghostCount: 1,
    })
    expect(harness.experiment.memory.canonicalSummaries).toHaveLength(0)
  })

  it('plays a compatible ghost without changing live state', () => {
    const harness = createHarness()
    completeTrial(harness, 6)
    const ghost = harness.experiment.library.records[0]
    const time = harness.runtime.simulationTimeSeconds
    const positions = Array.from(harness.runtime.state.positionX)
    const count = harness.cycle.resultCount
    const result = harness.experiment.dispatch(harness.cycle, {
      type: 'PLAY_GHOST',
      trialId: ghost.trialId,
    })
    expect(result.accepted).toBe(true)
    harness.experiment.advancePlayback(20)
    expect(harness.experiment.playback.view.elapsedSeconds).toBe(20)
    expect(harness.runtime.simulationTimeSeconds).toBe(time)
    expect(Array.from(harness.runtime.state.positionX)).toEqual(positions)
    expect(harness.cycle.resultCount).toBe(count)
  })

  it('holds an explicit pending candidate when the library limit is reached', () => {
    const harness = createHarness(undefined, 1)
    completeTrial(harness, 0)
    harness.experiment.dispatch(harness.cycle, { type: 'RESET_TRIAL' })
    harness.cycle.advance(2)
    completeTrial(harness, 10)
    expect(harness.experiment.library.status).toBe('limit-reached')
    expect(harness.experiment.pendingCandidate?.doseIndex).toBe(10)
    expect(
      harness.experiment.dispatch(harness.cycle, {
        type: 'REPLACE_OLDEST_GHOST',
      }).accepted,
    ).toBe(true)
    expect(harness.experiment.library.records[0]?.doseIndex).toBe(10)
    expect(harness.experiment.pendingCandidate).toBeNull()
    expect(harness.experiment.memory.log.points).toHaveLength(2)
  })
})
