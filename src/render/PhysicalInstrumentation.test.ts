import { describe, expect, it } from 'vitest'

import {
  buildPlotMarkers,
  gaugeNeedleAngle,
  pressDeliberateAction,
} from './PhysicalInstrumentation'

describe('Batch 7 physical instrumentation mappings', () => {
  it('maps the normalized authority to a bounded gauge angle', () => {
    expect(gaugeNeedleAngle(0)).toBeCloseTo(Math.PI * 0.36)
    expect(gaugeNeedleAngle(1)).toBeCloseTo(-Math.PI * 0.36)
    expect(gaugeNeedleAngle(-1)).toBe(gaugeNeedleAngle(0))
    expect(gaugeNeedleAngle(2)).toBe(gaugeNeedleAngle(1))
  })

  it('preserves every trial as a plot marker and offsets repeated doses visibly', () => {
    const markers = buildPlotMarkers([
      { trialId: 'a', dose: 3, relativeOpticalLoad: 0.8 },
      { trialId: 'b', dose: 3, relativeOpticalLoad: 0.4 },
      { trialId: 'c', dose: 7, relativeOpticalLoad: 0.5 },
    ])
    expect(markers).toHaveLength(3)
    expect(markers[0].dose).toBe(3)
    expect(markers[1].dose).toBe(3)
    expect(markers[0].x).not.toBe(markers[1].x)
    expect(markers[0].y).toBeGreaterThan(markers[1].y)
    expect(markers[2].dose).toBe(7)
  })

  it('requires two deliberate presses before destructive commit', () => {
    expect(pressDeliberateAction('latched')).toEqual({
      state: 'armed',
      commit: false,
    })
    expect(pressDeliberateAction('armed')).toEqual({
      state: 'latched',
      commit: true,
    })
  })
})
