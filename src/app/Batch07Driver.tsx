import { useFrame } from '@react-three/fiber'

import type { Batch07ExperimentController } from './Batch07ExperimentController'
import { developmentPerformance } from './performance'
import type { TreatmentCycleController } from './TreatmentCycle'

interface Batch07DriverProps {
  readonly cycle: TreatmentCycleController
  readonly experiment: Batch07ExperimentController
}

export function Batch07Driver({ cycle, experiment }: Batch07DriverProps) {
  useFrame((_, elapsedSeconds) => {
    const start = performance.now()
    cycle.advance(elapsedSeconds)
    experiment.advancePlayback(elapsedSeconds)
    developmentPerformance.recordSimulationStep(performance.now() - start)
  }, -1)

  return null
}
