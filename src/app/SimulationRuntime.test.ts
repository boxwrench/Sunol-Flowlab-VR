import { describe, expect, it } from 'vitest'

import { endpointOpticalLoad } from '../sim'
import { SimulationRuntime } from './SimulationRuntime'

describe('SimulationRuntime', () => {
  it('owns start, pause, reset, and fixed-step advancement', () => {
    const runtime = new SimulationRuntime(4, 123, 0.01, 5)
    const initialX = Array.from(runtime.state.positionX)

    expect(runtime.isRunning).toBe(false)
    expect(runtime.step(0.02)).toBe(0)
    runtime.start()
    expect(runtime.isRunning).toBe(true)
    expect(runtime.step(0.02)).toBe(2)
    expect(Array.from(runtime.state.positionX)).not.toEqual(initialX)

    runtime.pause()
    expect(runtime.isRunning).toBe(false)
    expect(runtime.step(0.02)).toBe(0)
  })

  it('resets deterministically without replacing state storage', () => {
    const runtime = new SimulationRuntime(4, 456)
    const positionX = runtime.state.positionX
    const initialX = Array.from(positionX)

    runtime.start()
    runtime.stepHeadless(10)
    runtime.reset(456)

    expect(runtime.isRunning).toBe(false)
    expect(runtime.state.positionX).toBe(positionX)
    expect(Array.from(runtime.state.positionX)).toEqual(initialX)
    expect(runtime.step(1)).toBe(0)
  })

  it('owns dose, phenomenon stepping, and optical-load storage', () => {
    const runtime = new SimulationRuntime(500, 123, 1 / 60, 5, 0)
    const bands = runtime.opticalLoadBands.values
    runtime.stepHeadless(2580)
    const underdose = endpointOpticalLoad(runtime.opticalLoadBands)

    runtime.reset(123, 5)
    runtime.stepHeadless(2580)
    const optimum = endpointOpticalLoad(runtime.opticalLoadBands)

    expect(runtime.dose).toBe(5)
    expect(runtime.opticalLoadBands.values).toBe(bands)
    expect(optimum).toBeLessThan(underdose)
    expect(runtime.clarityReachedAtSimulationTime).not.toBeNull()
  })
})
