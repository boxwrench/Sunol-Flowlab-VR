import { describe, expect, it } from 'vitest'

import { endpointOpticalLoad } from '../sim'
import { SimulationRuntime } from './SimulationRuntime'
import {
  DEFAULT_TREATMENT_CYCLE_CONFIG,
  TRIAL_TRANSITION_TABLE,
  TreatmentCycleController,
  controlsForTrialPhase,
  transitionForTrialEvent,
  type TrialEventType,
  type TrialPhase,
} from './TreatmentCycle'

const PHASES: readonly TrialPhase[] = [
  'READY',
  'RAPID_MIX',
  'FLOCCULATION',
  'SETTLING',
  'MEASURING',
  'COMPLETE',
  'REFILLING',
]

const EVENTS: readonly TrialEventType[] = [
  'SET_DOSE',
  'START',
  'PHASE_TIMER_ELAPSED',
  'MEASUREMENT_FINISHED',
  'REFILL_REQUESTED',
  'REFILL_FINISHED',
  'FORCE_RESET_DEV_ONLY',
]

describe('Batch 06 transition contract', () => {
  it('makes every legal transition explicit and rejects every absent pair', () => {
    for (const phase of PHASES) {
      for (const event of EVENTS) {
        const expected = TRIAL_TRANSITION_TABLE.find(
          (rule) => rule.from === phase && rule.event === event,
        )
        expect(transitionForTrialEvent(phase, event)).toBe(expected ?? null)
      }
    }

    expect(transitionForTrialEvent('READY', 'START')?.to).toBe('RAPID_MIX')
    expect(
      transitionForTrialEvent('MEASURING', 'MEASUREMENT_FINISHED')?.to,
    ).toBe('COMPLETE')
    expect(transitionForTrialEvent('COMPLETE', 'REFILL_REQUESTED')?.to).toBe(
      'REFILLING',
    )
    expect(transitionForTrialEvent('REFILLING', 'REFILL_FINISHED')?.to).toBe(
      'READY',
    )
  })

  it('exposes physical control availability only in legal phases', () => {
    expect(controlsForTrialPhase('READY')).toEqual({
      doseEnabled: true,
      startEnabled: true,
      refillEnabled: false,
    })
    expect(controlsForTrialPhase('COMPLETE')).toEqual({
      doseEnabled: false,
      startEnabled: false,
      refillEnabled: true,
    })
    for (const phase of PHASES.filter(
      (candidate) => candidate !== 'READY' && candidate !== 'COMPLETE',
    )) {
      expect(controlsForTrialPhase(phase)).toEqual({
        doseEnabled: false,
        startEnabled: false,
        refillEnabled: false,
      })
    }
  })
})

describe('TreatmentCycleController', () => {
  it('runs all seven phases and captures exactly one immutable result', () => {
    const runtime = new SimulationRuntime()
    const records: string[] = []
    const cycle = new TreatmentCycleController(
      runtime,
      5,
      DEFAULT_TREATMENT_CYCLE_CONFIG,
      (record) => {
        if (record.accepted) records.push(`${record.from}->${record.to}`)
      },
    )

    expect(cycle.phase).toBe('READY')
    expect(cycle.dispatchCommand({ type: 'SET_DOSE', dose: 0 }).accepted).toBe(
      true,
    )
    expect(cycle.dispatchCommand({ type: 'START_TRIAL' })).toMatchObject({
      accepted: true,
      from: 'READY',
      to: 'RAPID_MIX',
    })
    expect(cycle.dispatchCommand({ type: 'START_TRIAL' })).toMatchObject({
      accepted: false,
      reason: 'event is illegal during RAPID_MIX',
    })
    expect(cycle.dispatchCommand({ type: 'SET_DOSE', dose: 2 })).toMatchObject({
      accepted: false,
      dose: 0,
    })
    expect(cycle.dispatchCommand({ type: 'RESET_TRIAL' })).toMatchObject({
      accepted: false,
      reason: 'event is illegal during RAPID_MIX',
    })

    expect(cycle.advanceHeadless(runtime.remainingTreatmentSteps)).toBe(2580)
    expect(cycle.phase).toBe('COMPLETE')
    expect(runtime.isRunning).toBe(false)
    expect(cycle.resultCount).toBe(1)
    expect(cycle.result).toMatchObject({
      schemaVersion: 1,
      dose: 0,
      seed: 0x5f3759df,
      rawWaterConfigId: 'raw-water-v1',
      opticalProxyVersion: 'relative-optical-load-v1',
      endpointOpticalLoad: 0.7375886586965295,
      completedAtSimulationTime: 43,
      configHash: 'fnv1a32-e8bf13e7',
    })
    expect(cycle.result?.bandSnapshot).toEqual(
      Array.from(runtime.opticalLoadBands.values),
    )
    expect(cycle.result?.phaseTimeline).toEqual({
      rapidMixEnd: 6,
      flocculationEnd: 21,
      settlingEnd: 41,
      measurementTime: 43,
    })
    expect(Object.isFrozen(cycle.result)).toBe(true)
    expect(Object.isFrozen(cycle.result?.bandSnapshot)).toBe(true)
    expect(Object.isFrozen(cycle.result?.phaseTimeline)).toBe(true)
    const capturedFirstBand = cycle.result?.bandSnapshot[0]
    ;(runtime.opticalLoadBands.values as Float32Array)[0] = 0
    expect(cycle.result?.bandSnapshot[0]).toBe(capturedFirstBand)
    expect(cycle.advanceHeadless(100)).toBe(0)
    expect(cycle.resultCount).toBe(1)
    expect(records).toContain('RAPID_MIX->FLOCCULATION')
    expect(records).toContain('FLOCCULATION->SETTLING')
    expect(records).toContain('SETTLING->MEASURING')
    expect(records).toContain('MEASURING->COMPLETE')
  })

  it('refills deterministically, clears active result, and unlocks after hold', () => {
    const runtime = new SimulationRuntime()
    const positionStorage = runtime.state.positionX
    const cycle = new TreatmentCycleController(runtime)

    cycle.dispatchCommand({ type: 'START_TRIAL' })
    const initialX = Array.from(runtime.state.positionX)
    cycle.advanceHeadless(runtime.remainingTreatmentSteps)
    const first = cycle.result
    expect(first).not.toBeNull()

    expect(cycle.dispatchCommand({ type: 'RESET_TRIAL' })).toMatchObject({
      accepted: true,
      from: 'COMPLETE',
      to: 'REFILLING',
    })
    expect(cycle.result).toBeNull()
    expect(runtime.state.positionX).toBe(positionStorage)
    expect(Array.from(runtime.state.positionX)).toEqual(initialX)
    expect(runtime.simulationTimeSeconds).toBe(0)
    expect(cycle.controlAvailability.startEnabled).toBe(false)

    cycle.advance(1.99)
    expect(cycle.phase).toBe('REFILLING')
    cycle.advance(0.01)
    expect(cycle.phase).toBe('READY')
    expect(cycle.controlAvailability).toMatchObject({
      doseEnabled: true,
      startEnabled: true,
    })

    cycle.dispatchCommand({ type: 'START_TRIAL' })
    expect(Array.from(runtime.state.positionX)).toEqual(initialX)
    cycle.advanceHeadless(runtime.remainingTreatmentSteps)
    const second = cycle.result
    expect(second).not.toBeNull()
    expect(second?.id).not.toBe(first?.id)
    expect({ ...second, id: undefined }).toEqual({ ...first, id: undefined })
  })

  it('pauses and resumes without skipping phases or duplicating results', () => {
    const runtime = new SimulationRuntime()
    const cycle = new TreatmentCycleController(runtime)

    cycle.dispatchCommand({ type: 'START_TRIAL' })
    expect(cycle.advance(60)).toBe(5)
    expect(runtime.droppedSeconds).toBeGreaterThan(59)
    const interruptedAt = runtime.simulationTimeSeconds
    cycle.interrupt('test session loss')
    expect(cycle.isInterrupted).toBe(true)
    expect(cycle.advance(10)).toBe(0)
    expect(runtime.simulationTimeSeconds).toBe(interruptedAt)

    cycle.resumeAfterInterruption()
    expect(cycle.advance(1 / 60)).toBe(1)
    cycle.advanceHeadless(runtime.remainingTreatmentSteps)
    expect(cycle.phase).toBe('COMPLETE')
    expect(cycle.resultCount).toBe(1)
  })

  it('applies one global time scale to process and refill timing', () => {
    const runtime = new SimulationRuntime()
    const cycle = new TreatmentCycleController(runtime, 5, {
      ...DEFAULT_TREATMENT_CYCLE_CONFIG,
      globalTimeScale: 2,
    })

    cycle.dispatchCommand({ type: 'START_TRIAL' })
    expect(cycle.advance(1 / 60)).toBe(2)
    expect(runtime.simulationTimeSeconds).toBeCloseTo(2 / 60, 12)
    cycle.advanceHeadless(runtime.remainingTreatmentSteps)
    expect(cycle.phase).toBe('COMPLETE')

    cycle.dispatchCommand({ type: 'RESET_TRIAL' })
    cycle.advance(0.99)
    expect(cycle.phase).toBe('REFILLING')
    cycle.advance(0.01)
    expect(cycle.phase).toBe('READY')
  })

  it('fails closed to identical raw water when result generation is malformed', () => {
    const runtime = new SimulationRuntime()
    const cycle = new TreatmentCycleController(runtime)

    cycle.dispatchCommand({ type: 'START_TRIAL' })
    runtime.stepHeadless(runtime.remainingTreatmentSteps)
    ;(runtime.opticalLoadBands.values as Float32Array)[0] = Number.NaN
    cycle.advanceHeadless(0)

    expect(cycle.phase).toBe('READY')
    expect(cycle.result).toBeNull()
    expect(cycle.resultCount).toBe(0)
    expect(cycle.lastFailure).toMatch(/normalized/)
    expect(runtime.simulationTimeSeconds).toBe(0)
    expect(runtime.state.activeCount).toBe(500)
    expect(endpointOpticalLoad(runtime.opticalLoadBands)).toBe(1)

    cycle.forceResetDevOnly()
    expect(cycle.lastFailure).toBeNull()
  })

  it('rejects malformed commands and a schedule that diverges from the runtime', () => {
    const runtime = new SimulationRuntime()
    const cycle = new TreatmentCycleController(runtime)
    expect(cycle.dispatchCommand(null).accepted).toBe(false)
    expect(
      cycle.dispatchCommand({ type: 'SET_DOSE', dose: 2.5 }).accepted,
    ).toBe(false)
    expect(cycle.dispatchCommand({ type: 'PAUSE_TRIAL' }).accepted).toBe(false)

    expect(
      () =>
        new TreatmentCycleController(runtime, 5, {
          ...DEFAULT_TREATMENT_CYCLE_CONFIG,
          phaseTimeline: {
            ...DEFAULT_TREATMENT_CYCLE_CONFIG.phaseTimeline,
            measurementTime: 44,
          },
        }),
    ).toThrow(/authoritative simulation schedule/)
  })
})
