import { useEffect, useState } from 'react'

import { createPerformanceReport, developmentPerformance } from './performance'

export function MetricsOverlay() {
  const [metrics, setMetrics] = useState(() => developmentPerformance.snapshot())

  useEffect(() => {
    const timer = window.setInterval(() => setMetrics(developmentPerformance.snapshot()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  function exportReport() {
    const report = createPerformanceReport(
      developmentPerformance,
      navigator.userAgent,
      import.meta.env.MODE,
    )
    console.info('Sunol FlowLab VR performance report', JSON.stringify(report))
  }

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
      <button type="button" onClick={exportReport}>Export report to console</button>
    </aside>
  )
}

