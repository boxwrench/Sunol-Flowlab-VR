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
- `render` reads simulation state and the authoritative turbidity bands; it does not calculate process outcomes.
- `xr` converts physical input into the discrete commands in `docs/CONTRACTS.md`; it does not import simulation internals.
- `app` routes commands and coordinates lifecycle without putting particle state in React.

Hot paths reuse storage and temporaries. An allocation in a simulation step or per-frame synchronization path must be documented with its measured cost and reason.

## ADR-003: One turbidity authority

The simulation produces one normalized horizontal-band record. Measurement, water appearance, clearing-front diagnostics, instruments, plots, scoring, persistence, and replay consume that record. Display transforms may change color, opacity, or scale but may not create a second process calculation.

## ADR-004: App-owned runtime and read-only rendering

src/app/SimulationRuntime.ts owns particle state, the fixed-step clock, canonical reset, and stepping. An app-owned frame driver connects that runtime to React Three Fiber. Render components receive state views and injected telemetry callbacks; they do not create, reset, or advance simulation state and cannot import src/app.

## ADR-005: Phenomenon-first simulation growth

Batch 02 adds only the particle state, deterministic dose efficiency, simplified aggregation/settling, turbidity bands, and sweep infrastructure needed to prove the underdose–optimum–overdose lesson. Spatial hashing, free-slot pooling, mass/density fidelity, and merge animation metadata require benchmark evidence or an accepted visible-behavior need at the 500-particle target.
