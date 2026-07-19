import { describe, expect, it } from 'vitest'

import {
  OPTICAL_LOAD_DISPLAY_SMOOTHING_SECONDS,
  displaySmoothingAlpha,
} from './OpticalLoadGradient'

describe('Batch 8 optical-load display smoothing', () => {
  it('uses a bounded exponential response and supports immediate reset', () => {
    expect(displaySmoothingAlpha(0)).toBe(0)
    expect(displaySmoothingAlpha(-1)).toBe(0)
    expect(
      displaySmoothingAlpha(OPTICAL_LOAD_DISPLAY_SMOOTHING_SECONDS),
    ).toBeCloseTo(1 - Math.exp(-1))
    expect(displaySmoothingAlpha(1, 0)).toBe(1)
    expect(displaySmoothingAlpha(10)).toBeGreaterThan(0.99)
  })
})
