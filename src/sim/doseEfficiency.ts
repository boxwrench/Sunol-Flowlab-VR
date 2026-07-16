/** A discrete teaching-model dose control, not a physical dosing unit. */
export type DoseDetent = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/**
 * Parameters for the normalized, phenomenological dose-response mapping.
 *
 * These values are deliberately unitless. They support an educational
 * underdose-optimum-overdose relationship and must not be interpreted as
 * calibrated chemistry, dose prediction, or operating guidance.
 */
export interface DoseEfficiencyConfig {
  readonly optimumDose: DoseDetent
  readonly maximumEfficiency: number
  readonly doseWindowSigma: number
}

export const DEFAULT_DOSE_EFFICIENCY_CONFIG: Readonly<DoseEfficiencyConfig> =
  Object.freeze({
    optimumDose: 5,
    maximumEfficiency: 1,
    doseWindowSigma: 3,
  })

export const DOSE_DETENT_COUNT = 11

export function createDoseEfficiencyTable(
  config: Readonly<DoseEfficiencyConfig> = DEFAULT_DOSE_EFFICIENCY_CONFIG,
): Float32Array {
  const table = new Float32Array(DOSE_DETENT_COUNT)
  fillDoseEfficiencyTable(table, config)
  return table
}

export function fillDoseEfficiencyTable(
  table: Float32Array,
  config: Readonly<DoseEfficiencyConfig> = DEFAULT_DOSE_EFFICIENCY_CONFIG,
): void {
  if (table.length !== DOSE_DETENT_COUNT)
    throw new RangeError('Dose-efficiency table must contain eleven detents')
  validateDoseEfficiencyConfig(config)
  for (let dose = 0; dose < DOSE_DETENT_COUNT; dose += 1)
    table[dose] = calculateDoseEfficiency(dose as DoseDetent, config)
}

/**
 * Returns Gaussian effective sticking probability in (0, maximumEfficiency].
 * Math.exp is used only while filling the eleven-value configuration table,
 * never in the fixed-step simulation hot loop.
 */
export function calculateDoseEfficiency(
  dose: DoseDetent,
  config: Readonly<DoseEfficiencyConfig> = DEFAULT_DOSE_EFFICIENCY_CONFIG,
): number {
  validateDoseDetent(dose)
  validateDoseEfficiencyConfig(config)

  const normalizedDistance =
    (dose - config.optimumDose) / config.doseWindowSigma
  return (
    config.maximumEfficiency *
    Math.exp(-(normalizedDistance * normalizedDistance))
  )
}

export function validateDoseDetent(dose: number): asserts dose is DoseDetent {
  if (!Number.isInteger(dose) || dose < 0 || dose > 10) {
    throw new RangeError('Dose must be an integer detent from 0 through 10')
  }
}

export function validateDoseEfficiencyConfig(
  config: Readonly<DoseEfficiencyConfig>,
): void {
  validateDoseDetent(config.optimumDose)

  if (
    !Number.isFinite(config.maximumEfficiency) ||
    config.maximumEfficiency <= 0 ||
    config.maximumEfficiency > 1 ||
    !Number.isFinite(config.doseWindowSigma) ||
    config.doseWindowSigma <= 0
  ) {
    throw new RangeError(
      'Dose efficiency maximum and Gaussian window must be positive and finite',
    )
  }
}
