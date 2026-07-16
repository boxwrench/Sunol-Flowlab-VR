# Stable Contracts

These are boundary contracts for parallel implementation. They do not imply that the corresponding runtime features already exist.

The process quantity named below is a dimensionless **relative optical load**, not calibrated turbidity or NTU. Historical Batch 02A evidence retains its original turbidity terminology for provenance. Workstream 03D removed those legacy identifiers from forward source and uses one relative optical-load record; future persisted schemas must use the current name and may not introduce a second calculation.

```ts
export type DoseIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type CanonicalDosePreset = 0 | 2 | 4 | 6 | 8 | 10

export type AppCommand =
  | { type: 'SET_DOSE'; dose: DoseIndex }
  | { type: 'START_TRIAL' }
  | { type: 'RESET_TRIAL' }
  | { type: 'CLEAR_EXPERIMENT_LOG' }

export interface RelativeOpticalLoadBands {
  readonly values: Readonly<Float32Array>
  readonly min: 0
  readonly max: 1
  readonly sampledAtSimulationTime: number
}

export interface TreatmentPhaseTimeline {
  readonly rapidMixEnd: number
  readonly flocculationEnd: number
  readonly settlingEnd: number
  readonly measurementTime: number
}

export interface TrialResultV1 {
  readonly schemaVersion: 1
  readonly id: string
  readonly dose: DoseIndex
  readonly seed: number
  readonly rawWaterConfigId: string
  readonly opticalProxyVersion: string
  readonly endpointOpticalLoad: number
  readonly bandSnapshot: readonly number[]
  readonly phaseTimeline: TreatmentPhaseTimeline
  readonly completedAtSimulationTime: number
  readonly configHash: string
}

export interface TreatmentGhostV1 {
  readonly schemaVersion: 1
  readonly simVersion: string
  readonly opticalProxyVersion: string
  readonly trialId: string
  readonly createdAt: string
  readonly seed: number
  readonly doseIndex: DoseIndex
  readonly rawWaterConfigId: string
  readonly simulationConfigHash: string
  readonly sampleRateHz: number
  readonly durationSeconds: number
  readonly bandCount: number
  readonly bandEdges: Readonly<Float32Array>
  readonly samples: Readonly<Float32Array>
  readonly phaseTimeline: TreatmentPhaseTimeline
  readonly endpointOpticalLoad: number
}

export type GhostPlaybackCommand =
  | { type: 'PLAY_GHOST'; trialId: string }
  | { type: 'PAUSE_GHOST' }
  | { type: 'SEEK_GHOST'; elapsedSeconds: number }
  | { type: 'RESET_GHOST' }
  | { type: 'DELETE_GHOST'; trialId: string }

export interface CanonicalJarSummary {
  readonly dose: CanonicalDosePreset
  readonly trialId: string
  readonly endpointOpticalLoad: number
  readonly displayClarity: number
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

The plot and versioned experiment log are the complete history for DoseIndex 0 through 10. Canonical jar summaries are application-owned, update once when a completed result exactly matches 0, 2, 4, 6, 8, or 10, and remain static between completions. Odd-dose results never update a jar. Summary display values derive from TrialResultV1, contain no clock or process behavior, clear with the experiment log, and rebuild deterministically from persisted completed results.

Persistence is owned outside `/src/sim`. Every stored document has an integer `schemaVersion`; unsupported future versions fail closed, corrupt input is discarded safely, and stored results never alter raw-water initialization.

Treatment ghosts use sample-major flat storage with exactly `sampleCount * bandCount` finite normalized values. Recording and playback are app-owned, use the same optical-load samples as every live consumer, and never mutate or recompute the live simulation. The plot and experiment log remain the complete trial memory; a size-limited ghost library is a separately deletable subset for comparison.
