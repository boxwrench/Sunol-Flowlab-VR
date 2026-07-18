import { useFrame } from '@react-three/fiber'

import { developmentPerformance } from './performance'
import type { TreatmentCycleController } from './TreatmentCycle'

interface TreatmentCycleDriverProps {
  readonly cycle: TreatmentCycleController
}

export function TreatmentCycleDriver({ cycle }: TreatmentCycleDriverProps) {
  useFrame((_, elapsedSeconds) => {
    const start = performance.now()
    cycle.advance(elapsedSeconds)
    developmentPerformance.recordSimulationStep(performance.now() - start)
  }, -1)

  return null
}
