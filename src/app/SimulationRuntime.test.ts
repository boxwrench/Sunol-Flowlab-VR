import { describe, expect, it } from 'vitest'

import { SimulationRuntime } from './SimulationRuntime'

describe('SimulationRuntime', () => {
  it('owns start, pause, reset, and fixed-step advancement', () => {
    const runtime = new SimulationRuntime(4, 123, 0.01, 5)
    const initialX = Array.from(runtime.state.positionX)

    expect(runtime.step(0.02)).toBe(0)
    runtime.start()
    expect(runtime.step(0.02)).toBe(2)
    expect(Array.from(runtime.state.positionX)).not.toEqual(initialX)

    runtime.pause()
    expect(runtime.step(0.02)).toBe(0)
  })

  it('resets deterministically without replacing state storage', () => {
    const runtime = new SimulationRuntime(4, 456)
    const positionX = runtime.state.positionX
    const initialX = Array.from(positionX)

    runtime.start()
    runtime.stepHeadless(10)
    runtime.reset(456)

    expect(runtime.state.positionX).toBe(positionX)
    expect(Array.from(runtime.state.positionX)).toEqual(initialX)
    expect(runtime.step(1)).toBe(0)
  })
})
