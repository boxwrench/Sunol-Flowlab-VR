import { describe, expect, it } from 'vitest'

import { ghostClearingFrontY } from './TreatmentGhostComparison'

describe('Batch 8 treatment-ghost comparison', () => {
  it('maps normalized top-down depth to a bounded tank-local height', () => {
    expect(ghostClearingFrontY(0)).toBeCloseTo(1.18)
    expect(ghostClearingFrontY(1)).toBeCloseTo(0.04)
    expect(ghostClearingFrontY(0.5)).toBeCloseTo(0.61)
    expect(ghostClearingFrontY(-1)).toBe(ghostClearingFrontY(0))
    expect(ghostClearingFrontY(2)).toBe(ghostClearingFrontY(1))
  })
})
