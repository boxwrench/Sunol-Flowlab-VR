const UINT32_RANGE = 0x1_0000_0000
const ZERO_SEED_FALLBACK = 0x6d2b79f5

export class SeededRng {
  private state: number

  constructor(seed: number) {
    this.state = SeededRng.normalizeSeed(seed)
  }

  reset(seed: number) {
    this.state = SeededRng.normalizeSeed(seed)
  }

  nextUint32(): number {
    let value = this.state
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    this.state = value >>> 0
    return this.state
  }

  nextFloat(): number {
    return this.nextUint32() / UINT32_RANGE
  }

  nextRange(minimum: number, maximum: number): number {
    return minimum + (maximum - minimum) * this.nextFloat()
  }

  private static normalizeSeed(seed: number): number {
    if (!Number.isSafeInteger(seed)) {
      throw new RangeError('Seed must be a safe integer')
    }

    const normalized = seed >>> 0
    return normalized === 0 ? ZERO_SEED_FALLBACK : normalized
  }
}

