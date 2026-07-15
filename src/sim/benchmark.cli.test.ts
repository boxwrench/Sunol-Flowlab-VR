import { expect, it } from 'vitest'

import { DEFAULT_BENCHMARK_OPTIONS, runHeadlessBenchmark } from './benchmark'

it('runs the default headless benchmark', () => {
  const report = runHeadlessBenchmark(DEFAULT_BENCHMARK_OPTIONS)
  console.info(JSON.stringify(report))
  expect(report.finite).toBe(true)
  expect(report.activeParticles).toBe(500)
})
