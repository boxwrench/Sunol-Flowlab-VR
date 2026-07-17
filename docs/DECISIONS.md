# Architecture Decisions

## ADR-001: Coagulation-only vertical slice

Version 1 proves a single coagulation experiment in one tabletop apparatus. Future modules, shared engine frameworks, predictive chemistry, and full-plant simulation are outside the release boundary.

## ADR-002: Module ownership

Dependency direction is coordinated by `/src/app`:

```text
sim <--- app ---> xr
 ^       |
 |       v
+------ render
```

- `sim` is portable, deterministic TypeScript and has no UI or browser dependency.
- `render` reads simulation state and the authoritative relative optical-load bands; it does not calculate process outcomes.
- `xr` converts physical input into the discrete commands in `docs/CONTRACTS.md`; it does not import simulation internals.
- `app` routes commands and coordinates lifecycle without putting particle state in React.

Hot paths reuse storage and temporaries. An allocation in a simulation step or per-frame synchronization path must be documented with its measured cost and reason.

## ADR-003: One relative optical-load authority

The simulation produces one normalized horizontal-band record. Measurement, water appearance, clearing-front diagnostics, instruments, plots, scoring, persistence, and replay consume that record. Display transforms may change color, opacity, or scale but may not create a second process calculation.

## ADR-004: App-owned runtime and read-only rendering

src/app/SimulationRuntime.ts owns particle state, the fixed-step clock, canonical reset, and stepping. An app-owned frame driver connects that runtime to React Three Fiber. Render components receive state views and injected telemetry callbacks; they do not create, reset, or advance simulation state and cannot import src/app.

## ADR-005: Phenomenon-first simulation growth

Batch 02A added only the particle state, deterministic dose efficiency, simplified aggregation/settling, turbidity bands, and sweep infrastructure needed to prove the underdose–optimum–overdose lesson. That accepted prototype remains historical evidence. The approved version 1 refinement in ADR-008 now supplies a specific educational need for mass-authoritative aggregation, fractal-derived diameter and density, and deterministic merging. Spatial hashing and simulation merge-event metadata still require measured performance or presentation evidence; the accepted render-local smoothing owns no process metadata.

## ADR-006: Hybrid jar-test presentation and memory

The approved experience uses one live authoritative hero tank and six static canonical jar summaries at doses 0, 2, 4, 6, 8, and 10. Before its canonical result exists, each jar may show the same frozen raw-water fill using the hero tank's visual palette so that the apparatus does not look empty. That fill is a static recognition cue, not a result and not a live mirror. A jar is later updated once from an immutable completed result and owns no simulation state, clock, particle state, live optical-load view, or per-frame process logic. Reusing hero-tank geometry or material recipes is allowed; six live render mirrors or runtimes are not. The plot and trial log are the sole complete memory for every dose from 0 through 10; odd-dose trials therefore remain fully recorded without creating a jar. Visual acceptance also requires an unlabeled-screenshot recognition check recorded in `docs/UX_VALIDATION.md`.

## ADR-007: Accepted Batch 02A statistical baseline

Batch 02A models aggregation as independent deterministic growth of representative floc toward a dose-dependent normalized target. Settling speed increases with the square of normalized size above a threshold, and settlement is irreversible. This proves the causal lesson without pairwise collisions, spatial hashing, merging, mass, or density fields.

Authoritative turbidity bands blend suspended-particle optical load with a documented dose-dependent unresolved-fines floor. The floor is a phenomenological teaching stabilizer, not calibrated chemistry. Size and settlement must materially change the bands at fixed dose, endpoints derive only from the band record, and the permanent sweep guards the accepted basin. The accepted config and evidence are in `docs/BATCH_02A_ACCEPTANCE.md`.

This ADR records what Batch 02A proved; it no longer governs the final version 1 implementation where it conflicts with ADR-008. Do not rewrite or discard the accepted baseline while the replacement model is being implemented and compared.

## ADR-008: Mass-authoritative version 1 model

[The approved modeling research amendment](MODELING_RESEARCH_AMENDMENT.md) governs the final version 1 process model. Aggregate mass is authoritative; diameter is derived with a default fractal dimension of `2.0`; effective density and capped settling follow from that relationship; and successful encounters merge mass through stable deterministic ordering. The eleven dose-efficiency values are precomputed, and authoritative simulation code does not use `Math.random()`.

Suspended projected simulation area, `sum(D^2)`, produces one vertically binned relative optical-load record. That record drives every process consumer. The accepted Batch 02A unresolved-fines blend is removed in the replacement model rather than carried forward as a second authority. A growth bound protects population health without claiming a breakage model.

Version 1 has no free list because a trial creates no replacement particles. Spatial hashing remains evidence gated at the 500-particle target. Rendered floc size and morphology may improve readability but cannot alter mass, simulation diameter, collision radius, settling, optical load, or trial results. The accepted Quest repair permits short render-local position, scale, and consumed-particle exit smoothing; it does not add simulation merge-event metadata or a second process authority. The model remains phenomenological and must not be labeled as calibrated dose, NTU, mechanistic charge reversal, or facility prediction.

## ADR-009: Recorded treatment-result ghosts

[The approved ghost replay design](GHOST_REPLAY_DESIGN.md) defines version 1 replay as a recording of the authoritative optical-load band history, not particle state and not simulation recomputation. An app-owned recorder samples at 10 Hz using simulation or application elapsed time. An app-owned playback clock performs bounded linear interpolation while rendering consumes a read-only replay view.

Every ghost carries schema, simulation, optical-proxy, band-layout, raw-water, configuration, phase, and endpoint metadata. Incompatible records are migrated through tested code, reduced to a labeled legacy summary, or refused clearly; they are never silently reinterpreted. Pure ghost playback does not advance or mutate the live simulation.

Version 1 stores a small measured library with graceful quota and deletion behavior. It starts with straightforward Float32 samples and the simplest existing persistence path that passes size and blocking-write measurements. Compression, a generalized storage layer, particle replay, replay by recomputation, WebAssembly, fixed-point math, cloud sync, and cross-device lockstep remain outside scope.
