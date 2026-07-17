export type XrShellPosture = 'standing' | 'seated'

export interface XrShellPostureLayout {
  readonly controlMountHeightMeters: number
  readonly calibrationEyeHeightMeters: number
  readonly neutralReachMeters: number
}

export const XR_SHELL_POSTURE_LAYOUTS: Readonly<
  Record<XrShellPosture, XrShellPostureLayout>
> = {
  standing: {
    controlMountHeightMeters: 0.8,
    calibrationEyeHeightMeters: 1.68,
    neutralReachMeters: 0.48,
  },
  seated: {
    controlMountHeightMeters: 0.8,
    calibrationEyeHeightMeters: 1.2,
    neutralReachMeters: 0.48,
  },
}

export function requireXrShellPosture(value: unknown): XrShellPosture {
  return value === 'seated' ? 'seated' : 'standing'
}
