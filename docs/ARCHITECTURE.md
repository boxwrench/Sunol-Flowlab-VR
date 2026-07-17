# Architecture

## Purpose

Sunol FlowLab VR is one deployable web application with a portable deterministic simulation core. The architecture keeps educational process behavior testable without React, Three.js, WebGL, or a headset.

## Modules

```text
src/
  sim/       deterministic state and headless process behavior
  render/    R3F/Three.js views of authoritative simulation output
  xr/        WebXR session and physical-input adapters
  app/       lifecycle, command routing, modes, and composition
```

Allowed dependencies:

```text
app -> sim
app -> render
app -> xr
render -> sim (read-only types and state views)
xr -> app command types
```

Forbidden dependencies:

- `sim` to browser, React, Three.js, rendering, XR, persistence, or application lifecycle;
- `render` to independent chemistry, optical-load, scoring, or measurement calculations;
- `xr` to particle state or treatment mechanics;
- hot simulation state to React component state.

## Runtime data flow

Physical or spectator input becomes a validated discrete command. The application layer applies it to lifecycle/domain code. src/app/SimulationRuntime.ts owns the deterministic state and fixed-step clock, while an app-owned frame driver advances that runtime inside the React Three Fiber canvas. Rendering receives a read-only state view and synchronizes reusable Three.js objects. Relative optical-load bands produced by the simulation are the sole process source for hero-tank appearance, clearing-front diagnostics, instruments, completed results, static canonical jar summaries, persistence, and replay. Historical Batch 02A code calls this normalized record turbidity; it is not calibrated NTU.

Development-only XR preflight adapters may report session, controller, and
selection facts to app-owned low-frequency telemetry. They do not own or mutate
simulation state and are excluded from production presentation.

The hero tank is the only live process presentation. Canonical jars are application-owned write-on-completion summaries derived from completed results. The complete dose-response plot and versioned experiment log retain all eleven dose values and rebuild canonical summaries on restore; jars are never simulation owners or complete history.

## Treatment-result replay data flow

The simulation exposes the same authoritative optical-load band view used by live presentation. An application-owned recorder samples that view at 10 Hz by simulation or application elapsed time, then creates a versioned treatment-ghost record with phase and compatibility metadata. Persistence and schema migration remain outside `/src/sim`.

An application-owned playback clock performs sample lookup and bounded linear interpolation. Rendering may show a subordinate replay gradient, clearing-front marker, gauge trace, or plot line from a read-only replay view. It does not reconstruct particles, calculate clarity, or own playback time. Pure ghost playback pauses the live simulation; live-versus-ghost comparison keeps the two states separate.

## Determinism and performance

- Fixed timestep and capped catch-up prevent display timing from changing results.
- Seeded randomness is centralized; `Math.random()` is forbidden in `src/sim`.
- Particle capacity is fixed and storage is typed/preallocated.
- Per-frame allocations and additional transparent layers require measured justification.
- Headless tests and benchmarks run without DOM or WebGL.

## Error boundaries

Invalid external commands fail at the app boundary. Unsupported XR and session failure return to a usable desktop mode. Persistence validates schema versions and cannot mutate simulation initialization. Missing, corrupt, truncated, quota-blocked, or incompatible ghost records degrade to a clear refusal or legacy summary without crashing or mutating the live simulation. Rendering failures produce a visible application error rather than a silent blank canvas.

## Current state

Batch 00 is substantially complete and Batch 01A is accepted. The local physical portion of Batch 01B is accepted on Quest 3; the hosted-HTTPS smoke remains open. Batch 02A remains the immutable statistical prototype baseline. Batch 03 Workstream 03D now has technical acceptance for the final version 1 mass-authoritative model: deterministic fixed-capacity merging, fractal-derived diameter and capped settling, one projected-area optical-load authority, population-health diagnostics, canonical and nine-seed sweep evidence, regenerated review captures, and accepted replacement-model Quest visibility. Rendering presents the single optical authority on rear and lighter middle slices and uses only presentation-local merge smoothing. Spatial hashing remains deferred and a free list is excluded. The approved treatment-result ghost is planned for app-owned recording, persistence, and playback in Batch 07 plus restrained presentation in Batch 08; no ghost runtime exists yet. The blinded outcome comparison passed; Batch 03 remains open only for a static jar-content repair and fresh apparatus-recognition review.
