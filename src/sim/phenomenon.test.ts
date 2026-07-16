import { describe, expect, it } from 'vitest'

import {
  DEFAULT_PHENOMENON_CONFIG,
  createPhenomenonWorkspace,
  hashPhenomenonConfig,
  resetPhenomenonWorkspace,
  runPhenomenonTrial,
  stepPhenomenonWorkspace,
} from './phenomenon'

describe('deterministic phenomenon trial', () => {
  it('reproduces endpoints, bands, and particle state from identical reset inputs', () => {
    const workspace = createPhenomenonWorkspace()
    const first = runPhenomenonTrial(5, 0x5f3759df, undefined, workspace)
    const finalPositions = Array.from(workspace.particles.positionY)
    const finalDiameters = Array.from(workspace.particles.diameter)
    const finalActive = Array.from(workspace.particles.active)
    const finalMergeDiagnostics = { ...workspace.mergeDiagnostics }

    runPhenomenonTrial(0, 123, undefined, workspace)
    const replay = runPhenomenonTrial(5, 0x5f3759df, undefined, workspace)
    expect(replay.endpointOpticalLoad).toBe(first.endpointOpticalLoad)
    expect(replay.bandSnapshot).toEqual(first.bandSnapshot)
    expect(Array.from(workspace.particles.positionY)).toEqual(finalPositions)
    expect(Array.from(workspace.particles.diameter)).toEqual(finalDiameters)
    expect(Array.from(workspace.particles.active)).toEqual(finalActive)
    expect(workspace.mergeDiagnostics).toEqual(finalMergeDiagnostics)
  })

  it('keeps long-run state finite, bounded, and settled state binary', () => {
    const workspace = createPhenomenonWorkspace()
    resetPhenomenonWorkspace(workspace, 5, 77)
    while (stepPhenomenonWorkspace(workspace)) {
      // Exercise the full fixed-step path.
    }

    for (let index = 0; index < workspace.particles.capacity; index += 1) {
      expect(Number.isFinite(workspace.particles.positionY[index])).toBe(true)
      expect(Number.isFinite(workspace.particles.mass[index])).toBe(true)
      expect(Number.isFinite(workspace.particles.diameter[index])).toBe(true)
      if (workspace.particles.active[index] === 1) {
        expect(workspace.particles.mass[index]).toBeGreaterThan(0)
        expect(workspace.particles.diameter[index]).toBeGreaterThan(0)
      } else {
        expect(workspace.particles.mass[index]).toBe(0)
        expect(workspace.particles.diameter[index]).toBe(0)
      }
      expect([0, 1]).toContain(workspace.particles.settled[index])
    }
    expect(workspace.bands.sampledAtSimulationTime).toBeCloseTo(43)
  })

  it('conserves total aggregate mass through a complete production trial', () => {
    const workspace = createPhenomenonWorkspace()
    resetPhenomenonWorkspace(workspace, 5, 0x5f3759df)
    const initialMass = workspace.particles.mass.reduce(
      (total, mass) => total + mass,
      0,
    )
    while (stepPhenomenonWorkspace(workspace)) {
      // Exercise production transport, aggregation, settling, and sampling.
    }
    const finalMass = workspace.particles.mass.reduce(
      (total, mass) => total + mass,
      0,
    )
    expect(finalMass).toBeCloseTo(initialMass, 6)
    expect(workspace.mergeDiagnostics.mergeCount).toBeGreaterThan(0)
  })

  it('uses a stable versioned config hash', () => {
    const first = hashPhenomenonConfig()
    expect(first).toMatch(/^fnv1a32-[0-9a-f]{8}$/)
    expect(hashPhenomenonConfig()).toBe(first)
    expect(DEFAULT_PHENOMENON_CONFIG.schemaVersion).toBe(3)
  })
})
