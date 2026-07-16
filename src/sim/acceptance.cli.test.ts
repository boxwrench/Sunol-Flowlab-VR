import { expect, it } from 'vitest'

import { runHeadlessBenchmark } from './benchmark'
import { runDoseSweep } from './doseSweep'

const CANONICAL_SEED = 0x5f3759df
const ACCEPTANCE_SEEDS = Array.from(
  { length: 9 },
  (_, offset) => CANONICAL_SEED + offset,
)

it('prints compact Workstream 03D acceptance evidence', () => {
  const reports = ACCEPTANCE_SEEDS.map((seed) => runDoseSweep(seed))
  for (const report of reports) expect(report.failures).toEqual([])
  const canonical = reports[0]
  const benchmark = runHeadlessBenchmark()
  expect(benchmark.finite).toBe(true)

  const evidence = {
    schemaVersion: 1,
    configHash: canonical.configHash,
    canonicalSeed: CANONICAL_SEED,
    canonical: canonical.results.map((result) => ({
      dose: result.dose,
      endpointOpticalLoad: result.endpointOpticalLoad,
      clarityReachedAtSimulationTime: result.clarityReachedAtSimulationTime,
      activeAggregateCount: result.population.activeAggregateCount,
      suspendedAggregateCount: result.population.suspendedAggregateCount,
      settledAggregateCount: result.population.settledAggregateCount,
      meanAggregateMass: result.population.meanAggregateMass,
      maximumAggregateMass: result.population.maximumAggregateMass,
      maximumAggregateDiameter: result.population.maximumAggregateDiameter,
      largestAggregateMassFraction:
        result.population.largestAggregateMassFraction,
      minimumVisibleSuspendedAggregatesDuringSettling:
        result.population.minimumVisibleSuspendedAggregatesDuringSettling,
    })),
    seedCorpus: reports.map((report) => ({
      seed: report.seed,
      minimumDose: report.minimumDose,
      minimumOpticalLoad: report.minimumOpticalLoad,
      tailMargins: report.tailMargins,
      minimumActiveAggregateCount: Math.min(
        ...report.results.map(
          (result) => result.population.activeAggregateCount,
        ),
      ),
      minimumVisibleSuspendedAggregatesDuringSettling: Math.min(
        ...report.results.map(
          (result) =>
            result.population.minimumVisibleSuspendedAggregatesDuringSettling,
        ),
      ),
      maximumLargestAggregateMassFraction: Math.max(
        ...report.results.map(
          (result) => result.population.largestAggregateMassFraction,
        ),
      ),
    })),
    benchmark,
  }
  console.info(JSON.stringify(evidence))
}, 30_000)
