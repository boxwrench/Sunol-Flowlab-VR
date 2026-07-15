import { describe, expect, it } from 'vitest'

import { isDoseIndex, requireDoseIndex } from './commands'

describe('dose command boundary', () => {
  it('accepts every integer detent', () => {
    for (let dose = 0; dose <= 10; dose += 1) {
      expect(isDoseIndex(dose)).toBe(true)
      expect(requireDoseIndex(dose)).toBe(dose)
    }
  })

  it.each([-1, 11, 2.5, Number.NaN, '5', null])('rejects invalid dose %s', (dose) => {
    expect(isDoseIndex(dose)).toBe(false)
    expect(() => requireDoseIndex(dose)).toThrow(RangeError)
  })
})

