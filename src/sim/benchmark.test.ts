import { describe, expect, it } from 'vitest'

import { runHeadlessBenchmark } from './benchmark'

describe('headless benchmark', () => {
  it('reports the stable machine-readable schema over production simulation paths', () => {
    let tick = 0
    const report = runHeadlessBenchmark(
      {
        particleCount: 500,
        steps: 120,
        seed: 123,
        fixedTimestepSeconds: 1 / 60,
      },
      () => tick++,
    )

    expect(report).toMatchObject({
      schemaVersion: 3,
      particleCount: 500,
      steps: 120,
      seed: 123,
      fixedTimestepSeconds: 1 / 60,
      dose: 5,
      totalMs: 241,
      averageStepMs: 1,
      p95StepMs: 1,
      activeParticles: 500,
      stateArrayAllocations: 10,
      opticalLoadArrayAllocations: 3,
      finite: true,
      population: {
        activeAggregateCount: 500,
        suspendedAggregateCount: 500,
        settledAggregateCount: 0,
        maximumAggregateMass: 1,
        largestAggregateMassFraction: 1 / 500,
      },
    })
    expect(report.endpointOpticalLoad).toBeGreaterThan(0)
    expect(report.endpointOpticalLoad).toBeLessThanOrEqual(1)
  })

  it('rejects nonsensical workloads', () => {
    expect(() =>
      runHeadlessBenchmark({
        particleCount: 0,
        steps: 1,
        seed: 1,
        fixedTimestepSeconds: 1 / 60,
      }),
    ).toThrow(RangeError)
    expect(() =>
      runHeadlessBenchmark({
        particleCount: 1,
        steps: 0,
        seed: 1,
        fixedTimestepSeconds: 1 / 60,
      }),
    ).toThrow(RangeError)
  })
})
