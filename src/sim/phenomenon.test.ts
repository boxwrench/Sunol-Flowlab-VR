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
    const finalSizes = Array.from(workspace.particles.normalizedSize)

    runPhenomenonTrial(0, 123, undefined, workspace)
    const replay = runPhenomenonTrial(5, 0x5f3759df, undefined, workspace)
    expect(replay.endpointTurbidity).toBe(first.endpointTurbidity)
    expect(replay.bandSnapshot).toEqual(first.bandSnapshot)
    expect(Array.from(workspace.particles.positionY)).toEqual(finalPositions)
    expect(Array.from(workspace.particles.normalizedSize)).toEqual(finalSizes)
  })

  it('keeps long-run state finite, bounded, and settled state binary', () => {
    const workspace = createPhenomenonWorkspace()
    resetPhenomenonWorkspace(workspace, 5, 77)
    while (stepPhenomenonWorkspace(workspace)) {
      // Exercise the full fixed-step path.
    }

    for (let index = 0; index < workspace.particles.capacity; index += 1) {
      expect(Number.isFinite(workspace.particles.positionY[index])).toBe(true)
      expect(Number.isFinite(workspace.particles.normalizedSize[index])).toBe(
        true,
      )
      expect(workspace.particles.normalizedSize[index]).toBeGreaterThan(0)
      expect(workspace.particles.normalizedSize[index]).toBeLessThanOrEqual(1)
      expect([0, 1]).toContain(workspace.particles.settled[index])
    }
    expect(workspace.bands.sampledAtSimulationTime).toBeCloseTo(43)
  })

  it('uses a stable versioned config hash', () => {
    const first = hashPhenomenonConfig()
    expect(first).toMatch(/^fnv1a32-[0-9a-f]{8}$/)
    expect(hashPhenomenonConfig()).toBe(first)
    expect(DEFAULT_PHENOMENON_CONFIG.schemaVersion).toBe(1)
  })
})
