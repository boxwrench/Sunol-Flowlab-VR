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

Physical or spectator input becomes a validated discrete command. The application layer applies it to lifecycle/domain code. src/app/SimulationRuntime.ts owns the deterministic state and fixed-step clock, while an app-owned frame driver advances that runtime inside the React Three Fiber canvas. Rendering receives a read-only state view and synchronizes reusable Three.js objects. Relative optical-load bands produced by the simulation are the sole process source for hero-tank appearance, clearing-front diagnostics, instruments, completed results, static canonical jar summaries, persistence, and replay. This record is dimensionless and is not calibrated NTU.

Development-only XR preflight adapters may report session, controller, and
selection facts to app-owned low-frequency telemetry. They do not own or mutate
simulation state and are excluded from production presentation.

The hero tank is the only live process presentation. Canonical jars are application-owned write-on-completion summaries derived from completed results. The complete dose-response plot and versioned experiment log retain all eleven dose values and rebuild canonical summaries on restore; jars are never simulation owners or complete history.

## Treatment-result replay data flow

The simulation exposes the same authoritative optical-load band view used by live presentation. An application-owned recorder samples that view at 10 Hz by simulation or application elapsed time, then creates a versioned treatment-ghost record with phase and compatibility metadata. Persistence and schema migration remain outside `/src/sim`.

An application-owned playback clock performs sample lookup and bounded linear interpolation. Rendering receives a read-only replay view. The selected v1 presentation uses the saved run's authoritative endpoint as a labeled cyan past-run gauge needle; it does not place a comparison level inside the tank. Rendering does not reconstruct particles, calculate clarity, or own playback time. Pure ghost playback pauses the live simulation; live-versus-ghost comparison keeps the two states separate.

## Determinism and performance

- Fixed timestep and capped catch-up prevent display timing from changing results.
- Seeded randomness is centralized; `Math.random()` is forbidden in `src/sim`.
- Particle capacity is fixed and storage is typed/preallocated.
- Per-frame allocations and additional transparent layers require measured justification.
- Headless tests and benchmarks run without DOM or WebGL.

## Error boundaries

Invalid external commands fail at the app boundary. Unsupported XR and session failure return to a usable desktop mode. Persistence validates schema versions and cannot mutate simulation initialization. Missing, corrupt, truncated, quota-blocked, or incompatible ghost records degrade to a clear refusal or legacy summary without crashing or mutating the live simulation. Rendering failures produce a visible application error rather than a silent blank canvas.

## Current state

Batch 00 is substantially complete and Batch 01A is accepted. The local physical portion of Batch 01B is accepted on Quest 3; the hosted-HTTPS smoke remains open. Batch 02A remains the immutable statistical prototype baseline. Batch 03 is accepted with a documented fresh-recognition waiver: its final version 1 mass-authoritative model, deterministic fixed-capacity merging, fractal-derived diameter and capped settling, one projected-area optical-load authority, population-health diagnostics, canonical and nine-seed sweep evidence, 03R.1 static jar repair, and replacement-model Quest visibility are retained. Rendering presents the single optical authority on rear and lighter middle slices and uses only presentation-local merge smoothing. Spatial hashing remains deferred and a free list is excluded. Batch 04 is accepted.

Batch 05 is accepted with one app-owned `SimulationRuntime`, shared desktop/XR
hero-tank rendering, validated physical commands, lifecycle interruption
handling, deterministic parity, and measured Quest performance. Batch 06 is
accepted with the seven-phase treatment controller, immutable endpoint result,
locked controls and deterministic refill.

Batch 07 is a complete but unaccepted candidate. It adds app-owned experiment
memory, canonical jar summaries, physical instrumentation, 10 Hz treatment-
ghost recording, bounded localStorage persistence, compatibility validation,
and independent playback without particle replay or simulation recomputation.
Automated, rendered-browser, and seated Quest performance evidence pass. The
remaining human readability, comprehension, and physical-control verdict was
explicitly deferred on 2026-07-19; it is not passed or waived. The owner then
authorized Batch 08 technical work under a scheduling exception. Its technical
candidate adds render-local optical-band smoothing. The first combined Quest
review passed the technical watcher but failed instrument comprehension. The
remediation replaces the rejected in-tank prior-front marker with a labeled
past-run gauge needle, removes the unexplained optical sensor, and adds plain-
language labels. A focused Quest rerun now owns both open human gates; Batches
09–11 remain unstarted.
