export interface PerformanceSnapshot {
  readonly averageFps: number
  readonly averageFrameMs: number
  readonly p95FrameMs: number
  readonly averageSimulationStepMs: number
  readonly averageInstanceSyncMs: number
  readonly activeParticles: number
  readonly drawCalls: number
  readonly sampleCount: number
  readonly heapUsedBytes: number | null
}

export interface PerformanceReport {
  readonly capturedAt: string
  readonly userAgent: string
  readonly buildMode: string
  readonly metrics: PerformanceSnapshot
}

export class PerformanceMonitor {
  private readonly frameSamples: Float64Array
  private readonly simulationSamples: Float64Array
  private readonly syncSamples: Float64Array
  private nextSample = 0
  private samplesRecorded = 0
  private activeParticles = 0
  private drawCalls = 0

  constructor(sampleCapacity = 300) {
    if (!Number.isInteger(sampleCapacity) || sampleCapacity < 1) {
      throw new RangeError('Performance sample capacity must be a positive integer')
    }
    this.frameSamples = new Float64Array(sampleCapacity)
    this.simulationSamples = new Float64Array(sampleCapacity)
    this.syncSamples = new Float64Array(sampleCapacity)
  }

  record(
    frameMs: number,
    simulationStepMs: number,
    instanceSyncMs: number,
    activeParticles: number,
    drawCalls: number,
  ): void {
    if (
      !isNonNegativeFinite(frameMs) || !isNonNegativeFinite(simulationStepMs) ||
      !isNonNegativeFinite(instanceSyncMs) || !Number.isInteger(activeParticles) ||
      activeParticles < 0 || !Number.isInteger(drawCalls) || drawCalls < 0
    ) {
      throw new RangeError('Performance samples must be finite and non-negative')
    }
    this.frameSamples[this.nextSample] = frameMs
    this.simulationSamples[this.nextSample] = simulationStepMs
    this.syncSamples[this.nextSample] = instanceSyncMs
    this.activeParticles = activeParticles
    this.drawCalls = drawCalls
    this.nextSample = (this.nextSample + 1) % this.frameSamples.length
    this.samplesRecorded += 1
  }

  snapshot(heapUsedBytes: number | null = null): PerformanceSnapshot {
    const count = Math.min(this.samplesRecorded, this.frameSamples.length)
    if (count === 0) {
      return {
        averageFps: 0, averageFrameMs: 0, p95FrameMs: 0,
        averageSimulationStepMs: 0, averageInstanceSyncMs: 0,
        activeParticles: this.activeParticles, drawCalls: this.drawCalls, sampleCount: 0,
        heapUsedBytes,
      }
    }
    const frames = Array.from(this.frameSamples.subarray(0, count)).sort((a, b) => a - b)
    const averageFrameMs = average(this.frameSamples, count)
    return {
      averageFps: averageFrameMs === 0 ? 0 : 1000 / averageFrameMs,
      averageFrameMs,
      p95FrameMs: frames[Math.ceil(count * 0.95) - 1],
      averageSimulationStepMs: average(this.simulationSamples, count),
      averageInstanceSyncMs: average(this.syncSamples, count),
      activeParticles: this.activeParticles,
      drawCalls: this.drawCalls,
      sampleCount: count,
      heapUsedBytes,
    }
  }
}

export function readBrowserHeapBytes(source: unknown = performance): number | null {
  if (typeof source !== 'object' || source === null || !('memory' in source)) return null
  const memory = source.memory
  if (typeof memory !== 'object' || memory === null || !('usedJSHeapSize' in memory)) return null
  const value = memory.usedJSHeapSize
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

export function createPerformanceReport(
  monitor: PerformanceMonitor,
  userAgent: string,
  buildMode: string,
  heapUsedBytes: number | null = null,
): PerformanceReport {
  return { capturedAt: new Date().toISOString(), userAgent, buildMode, metrics: monitor.snapshot(heapUsedBytes) }
}

export const developmentPerformance = new PerformanceMonitor()

function average(values: Float64Array, count: number): number {
  let total = 0
  for (let index = 0; index < count; index += 1) total += values[index]
  return total / count
}

function isNonNegativeFinite(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

