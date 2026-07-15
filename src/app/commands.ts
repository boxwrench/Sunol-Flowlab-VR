export type DoseIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type AppCommand =
  | { type: 'SET_DOSE'; dose: DoseIndex }
  | { type: 'START_TRIAL' }
  | { type: 'RESET_TRIAL' }
  | { type: 'CLEAR_EXPERIMENT_LOG' }

export function isDoseIndex(value: unknown): value is DoseIndex {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 10
  )
}

export function requireDoseIndex(value: unknown): DoseIndex {
  if (!isDoseIndex(value)) {
    throw new RangeError('Dose must be an integer from 0 through 10')
  }

  return value
}
