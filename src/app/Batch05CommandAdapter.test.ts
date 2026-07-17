import { describe, expect, it, vi } from 'vitest'

import {
  Batch05CommandAdapter,
  type Batch05CommandTarget,
} from './Batch05CommandAdapter'

function createTarget(): Batch05CommandTarget {
  let running = false
  return {
    get isRunning() {
      return running
    },
    pause: vi.fn(() => {
      running = false
    }),
    reset: vi.fn(() => {
      running = false
    }),
    start: vi.fn(() => {
      running = true
    }),
  }
}

describe('Batch05CommandAdapter', () => {
  it('updates only the ready-state dose and starts through the target', () => {
    const target = createTarget()
    const adapter = new Batch05CommandAdapter(target)

    expect(adapter.dispatch({ type: 'SET_DOSE', dose: 8 })).toMatchObject({
      accepted: true,
      dose: 8,
      lifecycle: 'ready',
    })
    expect(target.reset).not.toHaveBeenCalled()

    expect(adapter.dispatch({ type: 'START_TRIAL' })).toMatchObject({
      accepted: true,
      dose: 8,
      lifecycle: 'running',
    })
    expect(target.reset).toHaveBeenCalledWith(undefined, 8)
    expect(target.start).toHaveBeenCalledOnce()
  })

  it('rejects malformed, out-of-range, and non-ready dose commands', () => {
    const target = createTarget()
    const records = vi.fn()
    const adapter = new Batch05CommandAdapter(target, 5, records)

    expect(adapter.dispatch({ type: 'SET_DOSE', dose: 2.5 }).accepted).toBe(
      false,
    )
    expect(adapter.dispatch({ type: 'SET_DOSE', dose: 11 }).accepted).toBe(
      false,
    )
    expect(adapter.dispatch({ type: 'START_TRIAL' }).accepted).toBe(true)
    expect(adapter.dispatch({ type: 'SET_DOSE', dose: 3 })).toMatchObject({
      accepted: false,
      dose: 5,
      reason: 'dose can only change while ready',
    })
    expect(adapter.dispatch({ type: 'RESET_TRIAL' }).accepted).toBe(false)
    expect(adapter.dispatch(null).accepted).toBe(false)
    expect(records).toHaveBeenCalledTimes(6)
  })

  it('pauses on interruption and resumes without resetting the trial', () => {
    const target = createTarget()
    const adapter = new Batch05CommandAdapter(target)

    adapter.dispatch({ type: 'START_TRIAL' })
    adapter.interrupt()
    expect(adapter.lifecycle).toBe('interrupted')
    expect(target.pause).toHaveBeenCalledOnce()

    expect(adapter.dispatch({ type: 'START_TRIAL' })).toMatchObject({
      accepted: true,
      lifecycle: 'running',
    })
    expect(target.reset).toHaveBeenCalledOnce()
    expect(target.start).toHaveBeenCalledTimes(2)
  })
})
