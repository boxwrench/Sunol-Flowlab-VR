import { describe, expect, it } from 'vitest'

import { SimulationRuntime } from './SimulationRuntime'
import {
  ExperimentMemory,
  EXPERIMENT_LOG_STORAGE_KEY,
  deriveCanonicalJarSummaries,
  gaugeValueFromEndpoint,
  plotValueFromResult,
  type KeyValueStorage,
} from './experimentMemory'
import { TreatmentCycleController } from './TreatmentCycle'
import type { TrialResultV1 } from './trialResult'

class MemoryStorage implements KeyValueStorage {
  readonly values = new Map<string, string>()
  failWrites = false

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error('quota exceeded')
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    if (this.failWrites) throw new Error('storage unavailable')
    this.values.delete(key)
  }
}

function completedResult(dose: number): TrialResultV1 {
  const runtime = new SimulationRuntime()
  const cycle = new TreatmentCycleController(runtime)
  cycle.dispatchCommand({ type: 'SET_DOSE', dose })
  cycle.dispatchCommand({ type: 'START_TRIAL' })
  cycle.advanceHeadless(runtime.remainingTreatmentSteps)
  if (cycle.result === null) throw new Error('Expected completed result')
  return cycle.result
}

describe('ExperimentMemory', () => {
  it('appends each completed result exactly once and restores all integer doses', () => {
    const storage = new MemoryStorage()
    let tick = 0
    const now = () => `2026-07-17T00:00:0${tick++}.000Z`
    const memory = new ExperimentMemory(storage, '0.0.0', now)
    const odd = completedResult(3)
    const canonical = completedResult(4)

    expect(memory.append(odd)).toBe(true)
    expect(memory.append(odd)).toBe(false)
    expect(memory.append(canonical)).toBe(true)
    expect(memory.log.points).toHaveLength(2)
    expect(memory.canonicalSummaries).toEqual([
      {
        dose: 4,
        trialId: canonical.id,
        endpointOpticalLoad: canonical.endpointOpticalLoad,
        displayClarity: 1 - canonical.endpointOpticalLoad,
      },
    ])

    const restored = new ExperimentMemory(storage, '0.0.0', now)
    expect(restored.status).toBe('restored')
    expect(restored.log.points.map((point) => point.dose)).toEqual([3, 4])
    expect(restored.canonicalSummaries[0]?.trialId).toBe(canonical.id)
  })

  it('uses the latest canonical completion without treating summaries as history', () => {
    const first = completedResult(2)
    const second = Object.freeze({ ...first, id: `${first.id}-repeat` })
    expect(deriveCanonicalJarSummaries([first, second])).toEqual([
      {
        dose: 2,
        trialId: second.id,
        endpointOpticalLoad: second.endpointOpticalLoad,
        displayClarity: 1 - second.endpointOpticalLoad,
      },
    ])
  })

  it('maps gauge and plot from the exact completed endpoint', () => {
    const result = completedResult(5)
    expect(gaugeValueFromEndpoint(result.endpointOpticalLoad)).toBe(
      result.endpointOpticalLoad,
    )
    expect(plotValueFromResult(result)).toBe(result.endpointOpticalLoad)
  })

  it('clears visible and stored history together without touching ghost data', () => {
    const storage = new MemoryStorage()
    storage.values.set('sunol-flowlab:ghost-library:v1', 'preserve-me')
    const memory = new ExperimentMemory(storage, '0.0.0')
    memory.append(completedResult(0))
    expect(memory.clear()).toBe(true)
    expect(memory.log.points).toHaveLength(0)
    expect(memory.canonicalSummaries).toHaveLength(0)
    expect(storage.values.has(EXPERIMENT_LOG_STORAGE_KEY)).toBe(false)
    expect(storage.values.get('sunol-flowlab:ghost-library:v1')).toBe(
      'preserve-me',
    )
  })

  it('fails safely for corrupt, future, unavailable, and quota-limited storage', () => {
    const corrupt = new MemoryStorage()
    corrupt.values.set(EXPERIMENT_LOG_STORAGE_KEY, '{bad json')
    expect(new ExperimentMemory(corrupt, '0.0.0').status).toBe(
      'corrupt-discarded',
    )
    expect(corrupt.values.has(EXPERIMENT_LOG_STORAGE_KEY)).toBe(false)

    const future = new MemoryStorage()
    future.values.set(
      EXPERIMENT_LOG_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99 }),
    )
    expect(new ExperimentMemory(future, '0.0.0').status).toBe(
      'future-version-discarded',
    )

    const unavailable = new ExperimentMemory(null, '0.0.0')
    expect(unavailable.status).toBe('storage-unavailable')
    expect(unavailable.append(completedResult(1))).toBe(true)
    expect(unavailable.log.points).toHaveLength(1)

    const quota = new MemoryStorage()
    const memory = new ExperimentMemory(quota, '0.0.0')
    quota.failWrites = true
    expect(memory.append(completedResult(6))).toBe(true)
    expect(memory.status).toBe('write-failed')
    expect(memory.lastError).toMatch(/quota/)
    expect(memory.log.points).toHaveLength(1)
  })
})
