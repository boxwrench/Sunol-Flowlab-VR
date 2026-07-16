import { describe, expect, it } from 'vitest'

import { particleDisplayRadius } from './ParticleCloud'

describe('particleDisplayRadius', () => {
  it('preserves the authoritative mass-derived diameter ratio for display', () => {
    const primaryRadius = particleDisplayRadius(0.1)
    const maximumRadius = particleDisplayRadius(Math.sqrt(8) * 0.1)

    expect(primaryRadius).toBeCloseTo(0.01)
    expect(maximumRadius / primaryRadius).toBeCloseTo(Math.sqrt(8))
  })

  it('hides invalid or inactive diameters', () => {
    expect(particleDisplayRadius(0)).toBe(0)
    expect(particleDisplayRadius(Number.NaN)).toBe(0)
  })
})
