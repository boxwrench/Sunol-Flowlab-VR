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

    expect(report).toEqual({
      schemaVersion: 1,
      particleCount: 500,
      steps: 120,
      seed: 123,
      fixedTimestepSeconds: 1 / 60,
      totalMs: 241,
      averageStepMs: 1,
      p95StepMs: 1,
      activeParticles: 500,
      stateArrayAllocations: 7,
      finite: true,
    })
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
