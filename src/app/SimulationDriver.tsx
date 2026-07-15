import { useFrame } from '@react-three/fiber'

import { developmentPerformance } from './performance'
import type { SimulationRuntime } from './SimulationRuntime'

interface SimulationDriverProps {
  readonly runtime: SimulationRuntime
}

export function SimulationDriver({ runtime }: SimulationDriverProps) {
  useFrame((_, elapsedSeconds) => {
    const start = performance.now()
    runtime.step(elapsedSeconds)
    developmentPerformance.recordSimulationStep(performance.now() - start)
  }, -1)

  return null
}
