import { describe, expect, it } from 'vitest'

import { phaseAudioProfile, requireProcessAudioFlavor } from './ProcessAudio'

describe('process audio presentation profiles', () => {
  it('defaults unknown requests to the classic profile', () => {
    expect(requireProcessAudioFlavor(null)).toBe('classic')
    expect(requireProcessAudioFlavor('orchestral')).toBe('classic')
    expect(requireProcessAudioFlavor('quiet')).toBe('quiet')
    expect(requireProcessAudioFlavor('warm')).toBe('warm')
  })

  it('keeps rapid mix more energetic than settling in every flavor', () => {
    for (const flavor of ['classic', 'quiet', 'warm'] as const) {
      const rapidMix = phaseAudioProfile('RAPID_MIX', flavor)
      const settling = phaseAudioProfile('SETTLING', flavor)
      expect(rapidMix.processGain).toBeGreaterThan(settling.processGain)
      expect(rapidMix.processFilterHz).toBeGreaterThan(settling.processFilterHz)
    }
  })

  it('makes quiet lower-gain and warm lower-frequency than classic', () => {
    const classic = phaseAudioProfile('FLOCCULATION', 'classic')
    const quiet = phaseAudioProfile('FLOCCULATION', 'quiet')
    const warm = phaseAudioProfile('FLOCCULATION', 'warm')
    expect(quiet.processGain).toBeLessThan(classic.processGain)
    expect(warm.processFilterHz).toBeLessThan(classic.processFilterHz)
  })
})
