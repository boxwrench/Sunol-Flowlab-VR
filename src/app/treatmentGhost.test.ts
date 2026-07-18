import { describe, expect, it } from 'vitest'

import { SimulationRuntime } from './SimulationRuntime'
import { TreatmentCycleController } from './TreatmentCycle'
import {
  GHOST_LIBRARY_STORAGE_KEY,
  TREATMENT_GHOST_SAMPLE_RATE_HZ,
  TreatmentGhostLibrary,
  TreatmentGhostPlayback,
  TreatmentGhostRecorder,
  compatibilityForGhost,
  decodeTreatmentGhost,
  ghostTargetForRuntime,
  type TreatmentGhostV1,
} from './treatmentGhost'
import {
  OPTICAL_PROXY_VERSION,
  RAW_WATER_CONFIG_ID,
  type TrialResultV1,
} from './trialResult'
import type { KeyValueStorage } from './experimentMemory'

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
    this.values.delete(key)
  }
}

interface RecordedTrial {
  readonly runtime: SimulationRuntime
  readonly cycle: TreatmentCycleController
  readonly result: TrialResultV1
  readonly ghost: TreatmentGhostV1
}

function recordTrial(dose = 5): RecordedTrial {
  const runtime = new SimulationRuntime()
  const cycle = new TreatmentCycleController(runtime)
  cycle.dispatchCommand({ type: 'SET_DOSE', dose })
  cycle.dispatchCommand({ type: 'START_TRIAL' })
  const recorder = new TreatmentGhostRecorder(
    runtime.opticalLoadBands.values.length,
    runtime.phaseTimeline.measurementTime,
  )
  recorder.start(
    {
      simVersion: 'phenomenon-v1',
      opticalProxyVersion: OPTICAL_PROXY_VERSION,
      seed: runtime.seed,
      doseIndex: runtime.dose,
      rawWaterConfigId: RAW_WATER_CONFIG_ID,
      simulationConfigHash: runtime.configHash,
      phaseTimeline: runtime.phaseTimeline,
    },
    runtime.opticalLoadBands,
  )
  while (runtime.remainingTreatmentSteps > 0) {
    cycle.advanceHeadless(1)
    recorder.observe(runtime.opticalLoadBands)
  }
  if (cycle.result === null) throw new Error('Expected completed trial')
  const ghost = recorder.finalize(cycle.result, '2026-07-17T00:00:00.000Z')
  if (ghost === null) throw new Error(recorder.lastError ?? 'Expected ghost')
  return { runtime, cycle, result: cycle.result, ghost }
}

function serializedGhost(ghost: TreatmentGhostV1): Record<string, unknown> {
  return {
    ...ghost,
    bandEdges: Array.from(ghost.bandEdges),
    samples: Array.from(ghost.samples),
  }
}

describe('TreatmentGhostRecorder', () => {
  it('records authoritative bands at 10 Hz in bounded sample-major storage', () => {
    const { ghost, result } = recordTrial(5)
    expect(ghost.sampleRateHz).toBe(TREATMENT_GHOST_SAMPLE_RATE_HZ)
    expect(ghost.sampleCount).toBe(431)
    expect(ghost.samples).toHaveLength(431 * 12)
    expect(ghost.bandEdges).toHaveLength(13)
    expect(Array.from(ghost.samples.slice(-12))).toEqual(result.bandSnapshot)
    expect(ghost.endpointOpticalLoad).toBe(result.endpointOpticalLoad)
    expect(ghost.trialId).toBe(result.id)
  })

  it('fails closed when application sampling misses the fixed cadence', () => {
    const runtime = new SimulationRuntime()
    const recorder = new TreatmentGhostRecorder(
      runtime.opticalLoadBands.values.length,
      runtime.phaseTimeline.measurementTime,
    )
    recorder.start(
      {
        simVersion: 'phenomenon-v1',
        opticalProxyVersion: OPTICAL_PROXY_VERSION,
        seed: runtime.seed,
        doseIndex: runtime.dose,
        rawWaterConfigId: RAW_WATER_CONFIG_ID,
        simulationConfigHash: runtime.configHash,
        phaseTimeline: runtime.phaseTimeline,
      },
      runtime.opticalLoadBands,
    )
    runtime.stepHeadless(13)
    recorder.observe(runtime.opticalLoadBands)
    expect(recorder.status).toBe('cadence-gap')
    expect(recorder.lastError).toMatch(/missed/)
  })
})

describe('treatment-ghost compatibility', () => {
  it('validates current, migrated, summary-only, malformed, and incompatible records', () => {
    const { runtime, ghost } = recordTrial(4)
    const target = ghostTargetForRuntime(
      runtime,
      OPTICAL_PROXY_VERSION,
      RAW_WATER_CONFIG_ID,
    )
    expect(
      decodeTreatmentGhost(serializedGhost(ghost), target)?.compatibility,
    ).toBe('directly-compatible')

    const legacy = serializedGhost(ghost)
    legacy.schemaVersion = 0
    legacy.simulationVersion = legacy.simVersion
    legacy.configHash = legacy.simulationConfigHash
    delete legacy.simVersion
    delete legacy.simulationConfigHash
    expect(decodeTreatmentGhost(legacy, target)?.compatibility).toBe(
      'tested-migration-compatible',
    )
    expect(
      decodeTreatmentGhost({
        schemaVersion: 0,
        trialId: ghost.trialId,
        doseIndex: ghost.doseIndex,
        endpointOpticalLoad: ghost.endpointOpticalLoad,
      })?.compatibility,
    ).toBe('legacy-summary-only')

    const truncated = serializedGhost(ghost)
    truncated.samples = (truncated.samples as number[]).slice(1)
    expect(decodeTreatmentGhost(truncated)).toBeNull()
    expect(decodeTreatmentGhost({ schemaVersion: 1 })).toBeNull()
    expect(
      compatibilityForGhost(ghost, {
        ...target,
        opticalProxyVersion: 'different-proxy',
      }),
    ).toBe('incompatible')
  })
})

describe('TreatmentGhostPlayback', () => {
  it('plays exact samples, bounded interpolation, pause, seek, reset, and end', () => {
    const { ghost } = recordTrial(0)
    const playback = new TreatmentGhostPlayback(ghost.bandCount)
    playback.load(ghost)
    expect(Array.from(playback.view.values)).toEqual(
      Array.from(ghost.samples.slice(0, ghost.bandCount)),
    )

    playback.seek(0.1)
    expect(Array.from(playback.view.values)).toEqual(
      Array.from(ghost.samples.slice(ghost.bandCount, ghost.bandCount * 2)),
    )
    playback.seek(0.05)
    for (let band = 0; band < ghost.bandCount; band += 1) {
      const value = playback.view.values[band]
      const a = ghost.samples[band]
      const b = ghost.samples[ghost.bandCount + band]
      expect(value).toBeGreaterThanOrEqual(Math.min(a, b))
      expect(value).toBeLessThanOrEqual(Math.max(a, b))
    }

    playback.play()
    playback.advance(1)
    playback.pause()
    const pausedAt = playback.view.elapsedSeconds
    playback.advance(10)
    expect(playback.view.elapsedSeconds).toBe(pausedAt)
    playback.reset()
    expect(playback.view.elapsedSeconds).toBe(0)
    playback.play()
    playback.advance(100)
    expect(playback.view.status).toBe('ended')
    expect(playback.view.elapsedSeconds).toBe(ghost.durationSeconds)
    expect(Array.from(playback.view.values)).toEqual(
      Array.from(ghost.samples.slice(-ghost.bandCount)),
    )
  })

  it('does not advance or mutate the live simulation or emit trial results', () => {
    const { runtime, cycle, ghost } = recordTrial(6)
    const time = runtime.simulationTimeSeconds
    const positions = Array.from(runtime.state.positionX)
    const resultCount = cycle.resultCount
    const playback = new TreatmentGhostPlayback(ghost.bandCount)
    playback.load(ghost)
    playback.play()
    playback.advance(ghost.durationSeconds)
    expect(runtime.simulationTimeSeconds).toBe(time)
    expect(Array.from(runtime.state.positionX)).toEqual(positions)
    expect(cycle.resultCount).toBe(resultCount)
  })
})

describe('TreatmentGhostLibrary', () => {
  it('measures serialized size and handles limit, replacement, delete, restore, and quota failure', () => {
    const storage = new MemoryStorage()
    const first = recordTrial(0).ghost
    const second = recordTrial(5).ghost
    const third = recordTrial(10).ghost
    const library = new TreatmentGhostLibrary(storage, 2)
    expect(library.save(first)).toBe(true)
    expect(library.save(second)).toBe(true)
    expect(library.serializedBytes).toBeGreaterThan(100_000)
    expect(library.save(third)).toBe(false)
    expect(library.status).toBe('limit-reached')
    expect(library.replaceOldest(third)).toBe(true)
    expect(library.records.map((record) => record.trialId)).toEqual([
      second.trialId,
      third.trialId,
    ])

    const restored = new TreatmentGhostLibrary(storage, 2)
    expect(restored.status).toBe('restored')
    expect(restored.delete(second.trialId)).toBe(true)
    expect(restored.records.map((record) => record.trialId)).toEqual([
      third.trialId,
    ])

    storage.failWrites = true
    expect(restored.delete(third.trialId)).toBe(false)
    expect(restored.status).toBe('write-failed')
    expect(restored.records).toHaveLength(1)
    expect(storage.values.has(GHOST_LIBRARY_STORAGE_KEY)).toBe(true)
  })
})
