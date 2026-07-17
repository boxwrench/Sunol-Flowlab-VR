import { useEffect, useState } from 'react'

import {
  createPerformanceReport,
  developmentPerformance,
  readBrowserHeapBytes,
} from './performance'

declare global {
  interface Window {
    render_performance_to_text?: () => string
  }
}

export function MetricsOverlay() {
  const [metrics, setMetrics] = useState(() =>
    developmentPerformance.snapshot(readBrowserHeapBytes()),
  )

  useEffect(() => {
    window.render_performance_to_text = () =>
      JSON.stringify(
        createPerformanceReport(
          developmentPerformance,
          navigator.userAgent,
          import.meta.env.MODE,
          readBrowserHeapBytes(),
        ),
      )
    const timer = window.setInterval(
      () => setMetrics(developmentPerformance.snapshot(readBrowserHeapBytes())),
      1000,
    )
    return () => {
      window.clearInterval(timer)
      delete window.render_performance_to_text
    }
  }, [])

  function exportReport() {
    const report = createPerformanceReport(
      developmentPerformance,
      navigator.userAgent,
      import.meta.env.MODE,
      readBrowserHeapBytes(),
    )
    console.info('Sunol FlowLab VR performance report', JSON.stringify(report))
  }

  const heap =
    metrics.heapUsedBytes === null
      ? 'heap unavailable'
      : `${(metrics.heapUsedBytes / 1_048_576).toFixed(1)} MB heap`

  return (
    <aside className="metrics" aria-label="Development performance metrics">
      <strong>Development metrics</strong>
      <span>{metrics.averageFps.toFixed(1)} fps</span>
      <span>{metrics.averageFrameMs.toFixed(2)} ms avg</span>
      <span>{metrics.p95FrameMs.toFixed(2)} ms p95</span>
      <span>{metrics.averageSimulationStepMs.toFixed(3)} ms simulation</span>
      <span>{metrics.averageInstanceSyncMs.toFixed(3)} ms instance sync</span>
      <span>{metrics.activeParticles} particles</span>
      <span>{metrics.drawCalls} draw calls</span>
      <span>{heap}</span>
      <button type="button" onClick={exportReport}>
        Export report to console
      </button>
    </aside>
  )
}
