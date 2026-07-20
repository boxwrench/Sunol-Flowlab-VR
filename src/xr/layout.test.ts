import { describe, expect, it } from 'vitest'

import { requireXrShellPosture, XR_SHELL_POSTURE_LAYOUTS } from './layout'

describe('XR shell posture layouts', () => {
  it('uses the physically accepted neutral control deck for both postures', () => {
    expect(XR_SHELL_POSTURE_LAYOUTS.standing.controlMountHeightMeters).toBe(0.8)
    expect(XR_SHELL_POSTURE_LAYOUTS.seated.controlMountHeightMeters).toBe(0.8)
    expect(XR_SHELL_POSTURE_LAYOUTS.standing.neutralReachMeters).toBe(0.48)
    expect(XR_SHELL_POSTURE_LAYOUTS.seated.neutralReachMeters).toBe(0.48)
  })

  it('retains posture-specific eye-height calibration', () => {
    expect(XR_SHELL_POSTURE_LAYOUTS.standing.calibrationEyeHeightMeters).toBe(
      1.68,
    )
    expect(XR_SHELL_POSTURE_LAYOUTS.seated.calibrationEyeHeightMeters).toBe(1.2)
  })

  it('lowers only the seated player origin for the hosted height correction', () => {
    expect(XR_SHELL_POSTURE_LAYOUTS.seated.playerOriginHeightOffsetMeters).toBe(
      -0.2,
    )
    expect(
      XR_SHELL_POSTURE_LAYOUTS.standing.playerOriginHeightOffsetMeters,
    ).toBe(0)
  })

  it('defaults unknown posture values to standing', () => {
    expect(requireXrShellPosture('seated')).toBe('seated')
    expect(requireXrShellPosture('standing')).toBe('standing')
    expect(requireXrShellPosture('unknown')).toBe('standing')
    expect(requireXrShellPosture(null)).toBe('standing')
  })
})
