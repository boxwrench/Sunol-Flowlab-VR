import { describe, expect, it } from 'vitest'

import {
  ALL_DOSE_DETENTS,
  formatDoseSweepFailure,
  formatDoseSweepMarkdown,
  runDoseSweep,
} from './doseSweep'

const CANONICAL_SEED = 0x5f3759df
const REVERSE_DOSE_ORDER = [...ALL_DOSE_DETENTS].reverse()

describe('permanent eleven-dose regression sweep', () => {
  it('proves the canonical underdose-optimum-overdose basin', () => {
    const report = runDoseSweep(CANONICAL_SEED)
    console.info(formatDoseSweepMarkdown(report))
    console.info(formatDoseSweepFailure(report))

    expect(report.failures).toEqual([])
    expect(Math.abs(report.minimumDose - 5)).toBeLessThanOrEqual(1)
    expect(report.tailMargins[0]).toBeGreaterThanOrEqual(0.15)
    expect(report.tailMargins[1]).toBeGreaterThanOrEqual(0.15)
    expect(report.runtimeMs).toBeLessThan(30_000)
  })

  it('is dose-order independent within the numeric tolerance', () => {
    const natural = runDoseSweep(CANONICAL_SEED)
    const reverse = runDoseSweep(CANONICAL_SEED, REVERSE_DOSE_ORDER)

    for (const dose of ALL_DOSE_DETENTS) {
      expect(reverse.results[dose].endpointOpticalLoad).toBeCloseTo(
        natural.results[dose].endpointOpticalLoad,
        7,
      )
      expect(reverse.results[dose].bandSnapshot).toEqual(
        natural.results[dose].bandSnapshot,
      )
    }
  })

  it('passes the extended nine-seed acceptance corpus', () => {
    const minimumDoses: number[] = []
    for (let offset = 0; offset < 9; offset += 1) {
      const report = runDoseSweep(CANONICAL_SEED + offset)
      expect(report.failures, formatDoseSweepFailure(report)).toEqual([])
      minimumDoses.push(report.minimumDose)
    }
    minimumDoses.sort((a, b) => a - b)
    expect(Math.abs(minimumDoses[4] - 5)).toBeLessThanOrEqual(1)
  })

  it('rejects incomplete or duplicate sweep orders', () => {
    expect(() => runDoseSweep(CANONICAL_SEED, [0, 1])).toThrow(RangeError)
    expect(() =>
      runDoseSweep(CANONICAL_SEED, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9]),
    ).toThrow(RangeError)
  })
})
