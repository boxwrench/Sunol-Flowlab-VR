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
  readonly minimumEfficiency: number
  readonly maximumEfficiency: number
  readonly underdoseFalloffPerDetent: number
  readonly overdoseFalloffPerDetent: number
}

export const DEFAULT_DOSE_EFFICIENCY_CONFIG: Readonly<DoseEfficiencyConfig> =
  Object.freeze({
    optimumDose: 5,
    minimumEfficiency: 0.15,
    maximumEfficiency: 1,
    underdoseFalloffPerDetent: 0.12,
    overdoseFalloffPerDetent: 0.1,
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
 * Returns normalized treatment effectiveness in [minimumEfficiency,
 * maximumEfficiency]. The function is pure and presentation-independent.
 */
export function calculateDoseEfficiency(
  dose: DoseDetent,
  config: Readonly<DoseEfficiencyConfig> = DEFAULT_DOSE_EFFICIENCY_CONFIG,
): number {
  validateDoseDetent(dose)
  validateDoseEfficiencyConfig(config)

  const distance = dose - config.optimumDose
  const falloff =
    distance < 0
      ? config.underdoseFalloffPerDetent
      : config.overdoseFalloffPerDetent
  const unboundedEfficiency =
    config.maximumEfficiency - Math.abs(distance) * falloff

  return Math.min(
    config.maximumEfficiency,
    Math.max(config.minimumEfficiency, unboundedEfficiency),
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
    !Number.isFinite(config.minimumEfficiency) ||
    !Number.isFinite(config.maximumEfficiency) ||
    config.minimumEfficiency < 0 ||
    config.maximumEfficiency > 1 ||
    config.minimumEfficiency >= config.maximumEfficiency
  ) {
    throw new RangeError(
      'Dose efficiency bounds must be finite, within [0, 1], and increasing',
    )
  }

  if (
    !Number.isFinite(config.underdoseFalloffPerDetent) ||
    config.underdoseFalloffPerDetent <= 0 ||
    !Number.isFinite(config.overdoseFalloffPerDetent) ||
    config.overdoseFalloffPerDetent <= 0
  ) {
    throw new RangeError('Dose efficiency falloff must be positive and finite')
  }
}
