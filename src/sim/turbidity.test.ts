import { describe, expect, it } from 'vitest'

import { createParticleState, resetParticleState } from './particleState'
import {
  createTurbidityBands,
  endpointTurbidity,
  resetTurbidityBands,
  sampleTurbidityBands,
} from './turbidity'

describe('authoritative turbidity bands', () => {
  it('resets reproducibly and keeps all values normalized', () => {
    const particles = createParticleState(500)
    const bands = createTurbidityBands()
    resetParticleState(particles, 0x5f3759df)
    resetTurbidityBands(bands, particles)
    const first = Array.from(bands.values)

    particles.normalizedSize.fill(1)
    particles.settled.fill(1)
    sampleTurbidityBands(bands, particles, 1, 43)
    expect(endpointTurbidity(bands)).toBeLessThan(0.3)

    resetParticleState(particles, 0x5f3759df)
    resetTurbidityBands(bands, particles)
    expect(Array.from(bands.values)).toEqual(first)
    for (const value of bands.values) {
      expect(Number.isFinite(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })

  it('responds to particle size and settlement rather than dose alone', () => {
    const particles = createParticleState(100)
    const bands = createTurbidityBands()
    resetParticleState(particles, 42)
    resetTurbidityBands(bands, particles)
    sampleTurbidityBands(bands, particles, 0.8, 1)
    const rawParticleOutcome = endpointTurbidity(bands)

    particles.normalizedSize.fill(0.9)
    sampleTurbidityBands(bands, particles, 0.8, 2)
    const aggregatedOutcome = endpointTurbidity(bands)
    particles.settled.fill(1)
    sampleTurbidityBands(bands, particles, 0.8, 3)
    const settledOutcome = endpointTurbidity(bands)

    expect(aggregatedOutcome).toBeLessThan(rawParticleOutcome)
    expect(settledOutcome).toBeLessThanOrEqual(aggregatedOutcome)
    expect(bands.sampledAtSimulationTime).toBe(3)
  })

  it('reuses its authoritative value and scratch arrays', () => {
    const particles = createParticleState(10)
    const bands = createTurbidityBands()
    const values = bands.values
    const initialLoads = bands.initialLoads
    const currentLoads = bands.currentLoads
    resetParticleState(particles, 7)
    resetTurbidityBands(bands, particles)
    sampleTurbidityBands(bands, particles, 1, 1)

    expect(bands.values).toBe(values)
    expect(bands.initialLoads).toBe(initialLoads)
    expect(bands.currentLoads).toBe(currentLoads)
  })
})
