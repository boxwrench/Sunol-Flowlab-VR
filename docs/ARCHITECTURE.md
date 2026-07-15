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
- `render` to independent chemistry, turbidity, scoring, or measurement calculations;
- `xr` to particle state or treatment mechanics;
- hot simulation state to React component state.

## Runtime data flow

Physical or spectator input becomes a validated discrete command. The application layer applies it to lifecycle/domain code. src/app/SimulationRuntime.ts owns the deterministic state and fixed-step clock, while an app-owned frame driver advances that runtime inside the React Three Fiber canvas. Rendering receives a read-only state view and synchronizes reusable Three.js objects. Turbidity bands produced by the simulation are the sole process source for water appearance, clearing-front diagnostics, instruments, results, persistence, and replay.

## Determinism and performance

- Fixed timestep and capped catch-up prevent display timing from changing results.
- Seeded randomness is centralized; `Math.random()` is forbidden in `src/sim`.
- Particle capacity is fixed and storage is typed/preallocated.
- Per-frame allocations and additional transparent layers require measured justification.
- Headless tests and benchmarks run without DOM or WebGL.

## Error boundaries

Invalid external commands fail at the app boundary. Unsupported XR and session failure return to a usable desktop mode. Persistence validates schema versions and cannot mutate simulation initialization. Rendering failures produce a visible application error rather than a silent blank canvas.

## Current state

Batch 00 is substantially complete. Batch 01A has a deterministic app-owned runtime, seeded fixed-capacity particle state, one-draw-call particle rendering, permanent telemetry, and benchmark evidence. The uninterrupted five-minute post-fix emulator observation remains open. Batch 01B physical-device and hosted-route validation remains blocked until the Quest 3 is available and deployment is authorized. Batch 02 has not started; its reduced plan targets the minimum 11-dose phenomenon substrate before optional performance mechanics.
