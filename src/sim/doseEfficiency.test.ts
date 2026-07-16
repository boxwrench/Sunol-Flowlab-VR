import { describe, expect, it } from 'vitest'

import {
  DEFAULT_DOSE_EFFICIENCY_CONFIG,
  calculateDoseEfficiency,
  createDoseEfficiencyTable,
  fillDoseEfficiencyTable,
  type DoseDetent,
  type DoseEfficiencyConfig,
} from './doseEfficiency'

const ALL_DOSES: readonly DoseDetent[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

describe('phenomenological dose efficiency', () => {
  it('has one optimum with poorer underdose and overdose effectiveness', () => {
    const efficiencies = ALL_DOSES.map((dose) => calculateDoseEfficiency(dose))

    expect(efficiencies[5]).toBe(1)
    expect(efficiencies[0]).toBeLessThan(efficiencies[5])
    expect(efficiencies[10]).toBeLessThan(efficiencies[5])

    for (let dose = 1; dose <= 5; dose += 1)
      expect(efficiencies[dose]).toBeGreaterThan(efficiencies[dose - 1])
    for (let dose = 6; dose <= 10; dose += 1)
      expect(efficiencies[dose]).toBeLessThan(efficiencies[dose - 1])
  })

  it('supports a configured optimum and Gaussian useful-dose window', () => {
    const config: DoseEfficiencyConfig = {
      optimumDose: 3,
      maximumEfficiency: 0.9,
      doseWindowSigma: 2,
    }

    expect(calculateDoseEfficiency(3, config)).toBeCloseTo(0.9)
    expect(calculateDoseEfficiency(2, config)).toBeCloseTo(
      0.9 * Math.exp(-0.25),
    )
    expect(calculateDoseEfficiency(4, config)).toBeCloseTo(
      calculateDoseEfficiency(2, config),
    )
    expect(calculateDoseEfficiency(10, config)).toBeLessThan(0.001)
  })

  it('always returns finite values within the configured bounds', () => {
    const config: DoseEfficiencyConfig = {
      optimumDose: 5,
      maximumEfficiency: 0.8,
      doseWindowSigma: 0.25,
    }

    for (const dose of ALL_DOSES) {
      const efficiency = calculateDoseEfficiency(dose, config)
      expect(Number.isFinite(efficiency)).toBe(true)
      expect(efficiency).toBeGreaterThanOrEqual(0)
      expect(efficiency).toBeLessThanOrEqual(config.maximumEfficiency)
    }
  })

  it('is deterministic and does not mutate its configuration', () => {
    const before = { ...DEFAULT_DOSE_EFFICIENCY_CONFIG }
    const first = ALL_DOSES.map((dose) => calculateDoseEfficiency(dose))
    const second = ALL_DOSES.map((dose) => calculateDoseEfficiency(dose))

    expect(second).toEqual(first)
    expect(DEFAULT_DOSE_EFFICIENCY_CONFIG).toEqual(before)
  })

  it('precomputes all eleven detents into reusable storage', () => {
    const table = createDoseEfficiencyTable()
    expect(table).toHaveLength(11)
    for (const dose of ALL_DOSES)
      expect(table[dose]).toBeCloseTo(calculateDoseEfficiency(dose))

    const storage = table
    fillDoseEfficiencyTable(table, DEFAULT_DOSE_EFFICIENCY_CONFIG)
    expect(table).toBe(storage)
    expect(() => fillDoseEfficiencyTable(new Float32Array(10))).toThrow(
      RangeError,
    )
  })

  it.each([-1, 11, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid runtime dose %s',
    (dose) => {
      expect(() => calculateDoseEfficiency(dose as DoseDetent)).toThrow(
        RangeError,
      )
    },
  )

  it.each([
    { maximumEfficiency: 1.1 },
    { maximumEfficiency: 0 },
    { doseWindowSigma: 0 },
    { doseWindowSigma: Number.POSITIVE_INFINITY },
  ])('rejects invalid configuration %o', (override) => {
    const config = {
      ...DEFAULT_DOSE_EFFICIENCY_CONFIG,
      ...override,
    } as DoseEfficiencyConfig

    expect(() => calculateDoseEfficiency(5, config)).toThrow(RangeError)
  })
})
