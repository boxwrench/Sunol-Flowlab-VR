import { describe, expect, it } from 'vitest'

import { mergeParticlePair } from './aggregation'
import {
  clearingFrontDepthFromValues,
  clearingFrontDiagnostics,
  createOpticalLoadBands,
  endpointOpticalLoad,
  resetOpticalLoadBands,
  sampleOpticalLoadBands,
  suspendedOpticalLoad,
} from './opticalLoad'
import {
  DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
  createParticleState,
  resetParticleState,
} from './particleState'

describe('authoritative relative optical-load bands', () => {
  it('resets reproducibly and keeps band values normalized', () => {
    const particles = createParticleState(500)
    const bands = createOpticalLoadBands()
    resetParticleState(particles, 0x5f3759df)
    resetOpticalLoadBands(bands, particles)
    const first = Array.from(bands.values)

    particles.settled.fill(1)
    sampleOpticalLoadBands(bands, particles, 43)
    expect(endpointOpticalLoad(bands)).toBe(0)
    expect(bands.globalRelativeLoad).toBe(0)

    resetParticleState(particles, 0x5f3759df)
    resetOpticalLoadBands(bands, particles)
    expect(Array.from(bands.values)).toEqual(first)
    expect(bands.globalRelativeLoad).toBe(1)
    for (const value of bands.values) {
      expect(Number.isFinite(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })

  it('conserves whole-tank load during aggregation at default Df 2', () => {
    const particles = createParticleState(2)
    resetParticleState(particles, 3)
    const initial = suspendedOpticalLoad(particles)
    mergeParticlePair(particles, 0, 1)
    const aggregated = suspendedOpticalLoad(particles)

    expect(aggregated).toBeCloseTo(initial, 7)
  })

  it('follows the expected non-default fractal-dimension direction', () => {
    const openGeometry = {
      ...DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
      fractalDimension: 1.8,
    }
    const compactGeometry = {
      ...DEFAULT_AGGREGATE_GEOMETRY_CONFIG,
      fractalDimension: 2.2,
    }
    const open = createParticleState(2)
    const compact = createParticleState(2)
    resetParticleState(open, 4, 2, undefined, openGeometry)
    resetParticleState(compact, 4, 2, undefined, compactGeometry)
    const openInitial = suspendedOpticalLoad(open)
    const compactInitial = suspendedOpticalLoad(compact)

    mergeParticlePair(open, 0, 1, openGeometry)
    mergeParticlePair(compact, 0, 1, compactGeometry)

    expect(suspendedOpticalLoad(open)).toBeGreaterThan(openInitial)
    expect(suspendedOpticalLoad(compact)).toBeLessThan(compactInitial)
  })

  it('allows local transport to change bands without changing global load', () => {
    const particles = createParticleState(24)
    const bands = createOpticalLoadBands()
    resetParticleState(particles, 42)
    resetOpticalLoadBands(bands, particles)
    const initialBands = Array.from(bands.values)
    particles.positionY.fill(1.1)
    sampleOpticalLoadBands(bands, particles, 1)

    expect(bands.globalRelativeLoad).toBeCloseTo(1, 7)
    expect(Array.from(bands.values)).not.toEqual(initialBands)
    expect(bands.values.at(-1)).toBe(1)
  })

  it('reuses value and scratch arrays while exposing sample metadata', () => {
    const particles = createParticleState(10)
    const bands = createOpticalLoadBands()
    const values = bands.values
    const initialLoads = bands.initialLoads
    const currentLoads = bands.currentLoads
    resetParticleState(particles, 7)
    resetOpticalLoadBands(bands, particles)
    sampleOpticalLoadBands(bands, particles, 1)

    expect(bands.values).toBe(values)
    expect(bands.initialLoads).toBe(initialLoads)
    expect(bands.currentLoads).toBe(currentLoads)
    expect(bands.sampledAtSimulationTime).toBe(1)
    expect(bands.currentTotalLoad).toBeGreaterThan(0)
  })

  it('derives clearing-front diagnostics from authoritative bands', () => {
    const bands = createOpticalLoadBands()
    bands.values.set([
      0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05, 0,
    ])
    bands.initialLoads.fill(1)
    bands.currentLoads.set(bands.values)

    const diagnostics = clearingFrontDiagnostics(bands)

    expect(diagnostics.topClearFraction).toBe(1)
    expect(diagnostics.clearingFrontDepth).toBeCloseTo(7 / 12)
    expect(diagnostics.upperZoneOpticalLoad).toBeCloseTo(0.075)
  })

  it('derives replay clearing-front depth directly from normalized bands', () => {
    expect(
      clearingFrontDepthFromValues(
        new Float32Array([0.8, 0.7, 0.5, 0.2, 0.1, 0.05]),
        0.25,
      ),
    ).toBeCloseTo(3 / 6)
    expect(() => clearingFrontDepthFromValues([])).toThrow(RangeError)
  })
})
