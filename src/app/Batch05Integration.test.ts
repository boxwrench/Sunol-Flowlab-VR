import { describe, expect, it } from 'vitest'

import {
  DEFAULT_PHENOMENON_CONFIG,
  endpointOpticalLoad,
  runPhenomenonTrial,
  totalTreatmentSteps,
} from '../sim'
import { Batch05CommandAdapter } from './Batch05CommandAdapter'
import {
  CANONICAL_SIMULATION_SEED,
  SimulationRuntime,
} from './SimulationRuntime'

const TOTAL_TRIAL_STEPS = totalTreatmentSteps(
  DEFAULT_PHENOMENON_CONFIG.fixedTimestepSeconds,
  DEFAULT_PHENOMENON_CONFIG.coagulation,
)

describe('Batch 05 desktop/XR simulation parity', () => {
  it.each([0, 5, 10] as const)(
    'matches the headless authoritative result at dose %i',
    (dose) => {
      const expected = runPhenomenonTrial(dose, CANONICAL_SIMULATION_SEED)
      const runtime = new SimulationRuntime()
      const adapter = new Batch05CommandAdapter(runtime)

      expect(adapter.dispatch({ type: 'SET_DOSE', dose }).accepted).toBe(true)
      expect(adapter.dispatch({ type: 'START_TRIAL' }).accepted).toBe(true)
      runtime.stepHeadless(TOTAL_TRIAL_STEPS)

      expect(runtime.configHash).toBe(expected.configHash)
      expect(runtime.dose).toBe(dose)
      expect(endpointOpticalLoad(runtime.opticalLoadBands)).toBe(
        expected.endpointOpticalLoad,
      )
      expect(Array.from(runtime.opticalLoadBands.values)).toEqual(
        expected.bandSnapshot,
      )
      expect(runtime.mergeCount).toBe(expected.mergeCount)
      expect(runtime.populationDiagnostics).toEqual(expected.population)
    },
  )

  it('produces the same endpoint at 60 Hz and 120 Hz presentation cadence', () => {
    const at60Hz = runAtFrameRate(60)
    const at120Hz = runAtFrameRate(120)

    expect(at60Hz.configHash).toBe('fnv1a32-e8bf13e7')
    expect(at120Hz).toEqual(at60Hz)
  })

  it('pauses cleanly and bounds catch-up after an interruption', () => {
    const runtime = new SimulationRuntime()
    const positionStorage = runtime.state.positionX
    const adapter = new Batch05CommandAdapter(runtime)

    adapter.dispatch({ type: 'START_TRIAL' })
    expect(runtime.step(1 / 60)).toBe(1)
    adapter.interrupt()
    const interruptedAt = runtime.simulationTimeSeconds

    expect(runtime.step(60)).toBe(0)
    expect(runtime.simulationTimeSeconds).toBe(interruptedAt)

    adapter.dispatch({ type: 'START_TRIAL' })
    expect(runtime.step(60)).toBe(5)
    expect(runtime.simulationTimeSeconds).toBeCloseTo(interruptedAt + 5 / 60)

    adapter.resetToReady()
    expect(adapter.lifecycle).toBe('ready')
    expect(runtime.simulationTimeSeconds).toBe(0)
    expect(runtime.state.positionX).toBe(positionStorage)
  })
})

function runAtFrameRate(frameRate: number) {
  const runtime = new SimulationRuntime()
  const adapter = new Batch05CommandAdapter(runtime)
  adapter.dispatch({ type: 'START_TRIAL' })

  const frameCount = frameRate * 43
  for (let frame = 0; frame < frameCount; frame += 1) {
    runtime.step(1 / frameRate)
  }

  return {
    bands: Array.from(runtime.opticalLoadBands.values),
    configHash: runtime.configHash,
    endpoint: endpointOpticalLoad(runtime.opticalLoadBands),
    mergeCount: runtime.mergeCount,
    population: runtime.populationDiagnostics,
    sampledAtSimulationTime: runtime.simulationTimeSeconds,
  }
}
