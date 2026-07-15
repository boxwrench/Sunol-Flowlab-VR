# Stable Contracts

These are boundary contracts for parallel implementation. They do not imply that the corresponding runtime features already exist.

```ts
export type DoseIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type AppCommand =
  | { type: 'SET_DOSE'; dose: DoseIndex }
  | { type: 'START_TRIAL' }
  | { type: 'RESET_TRIAL' }
  | { type: 'CLEAR_EXPERIMENT_LOG' }

export interface TurbidityBands {
  readonly values: Readonly<Float32Array>
  readonly min: 0
  readonly max: 1
  readonly sampledAtSimulationTime: number
}

export interface TrialResultV1 {
  readonly schemaVersion: 1
  readonly id: string
  readonly dose: DoseIndex
  readonly seed: number
  readonly endpointTurbidity: number
  readonly bandSnapshot: readonly number[]
  readonly completedAtSimulationTime: number
  readonly configHash: string
}

export interface DeterministicResetInput {
  readonly seed: number
  readonly configHash: string
  readonly fixedTimestepSeconds: number
}

export interface PerformanceMetrics {
  readonly averageFps: number
  readonly averageFrameMs: number
  readonly p95FrameMs: number
  readonly simulationStepMs: number
  readonly instanceSyncMs: number
  readonly activeParticles: number
  readonly drawCalls: number
}
```

Runtime input validation must reject non-integer or out-of-range doses even when TypeScript types are bypassed. Reset with identical inputs must restore identical initial arrays without reallocating their capacity.

Persistence is owned outside `/src/sim`. Every stored document has an integer `schemaVersion`; unsupported future versions fail closed, corrupt input is discarded safely, and stored results never alter raw-water initialization.
