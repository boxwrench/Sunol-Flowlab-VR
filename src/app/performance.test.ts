import { describe, expect, it } from 'vitest'

import {
  PerformanceMonitor,
  createPerformanceReport,
  readBrowserHeapBytes,
} from './performance'

describe('PerformanceMonitor', () => {
  it('reports averages, p95, current scene counters, and optional heap', () => {
    const monitor = new PerformanceMonitor(4)
    monitor.recordSimulationStep(1)
    monitor.recordRenderFrame(10, 2, 500, 4)
    monitor.recordSimulationStep(2)
    monitor.recordRenderFrame(20, 4, 500, 5)
    monitor.recordSimulationStep(3)
    monitor.recordRenderFrame(30, 6, 499, 6)
    expect(monitor.snapshot(12_345)).toEqual({
      averageFps: 50,
      averageFrameMs: 20,
      p95FrameMs: 30,
      averageSimulationStepMs: 2,
      averageInstanceSyncMs: 4,
      activeParticles: 499,
      drawCalls: 6,
      sampleCount: 3,
      heapUsedBytes: 12_345,
    })
  })

  it('uses a fixed-size rolling buffer', () => {
    const monitor = new PerformanceMonitor(2)
    monitor.recordSimulationStep(1)
    monitor.recordRenderFrame(10, 1, 1, 1)
    monitor.recordSimulationStep(2)
    monitor.recordRenderFrame(20, 2, 1, 1)
    monitor.recordSimulationStep(3)
    monitor.recordRenderFrame(30, 3, 1, 1)
    expect(monitor.snapshot()).toMatchObject({
      sampleCount: 2,
      averageFrameMs: 25,
    })
  })

  it('reads Chrome heap data defensively', () => {
    expect(readBrowserHeapBytes({ memory: { usedJSHeapSize: 123 } })).toBe(123)
    expect(readBrowserHeapBytes({})).toBeNull()
    expect(readBrowserHeapBytes({ memory: { usedJSHeapSize: -1 } })).toBeNull()
  })

  it('exports a compact report with caller-supplied build metadata', () => {
    const monitor = new PerformanceMonitor(1)
    monitor.recordSimulationStep(1)
    monitor.recordRenderFrame(16, 2, 500, 4)
    const report = createPerformanceReport(monitor, 'test-agent', 'test', 2048)
    expect(report).toMatchObject({
      userAgent: 'test-agent',
      buildMode: 'test',
      metrics: { heapUsedBytes: 2048 },
    })
    expect(Number.isNaN(Date.parse(report.capturedAt))).toBe(false)
  })

  it('rejects invalid capacities and samples', () => {
    expect(() => new PerformanceMonitor(0)).toThrow(RangeError)
    const monitor = new PerformanceMonitor()
    expect(() => monitor.recordRenderFrame(-1, 0, 0, 0)).toThrow(RangeError)
    expect(() => monitor.recordSimulationStep(-1)).toThrow(RangeError)
  })
})
