import { describe, expect, it } from 'vitest'

import { XR_AUTO_SESSION_OFFER, XR_DEVELOPMENT_HOST, XR_EMULATOR_PROFILE } from './config'

describe('desktop XR preflight configuration', () => {
  it('uses the confirmed target headset profile on localhost', () => {
    expect(XR_EMULATOR_PROFILE).toBe('metaQuest3')
    expect(XR_DEVELOPMENT_HOST).toBe('localhost')
  })

  it('requires an explicit user gesture instead of auto-offering a session', () => {
    expect(XR_AUTO_SESSION_OFFER).toBe(false)
  })
})

