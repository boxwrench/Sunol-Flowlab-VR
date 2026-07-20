# Architecture

## Purpose

Sunol FlowLab VR is one deployable WebXR application with a portable,
deterministic simulation core. Educational process behavior remains testable
without React, Three.js, WebGL, or a headset.

## Repository layout

```text
src/
  sim/       deterministic state and headless process behavior
  app/       lifecycle, commands, results, persistence, replay, and audio
  render/    React Three Fiber views of authoritative state
  xr/        WebXR session and physical-input adapters
tests/       repository contracts and rendered-browser scenarios
scripts/     capture and physical Quest review harnesses
public/      shipped self-created panorama and favicon assets
docs/
  plans/     ordered implementation plans
  evidence/  retained acceptance captures
  images/    current public documentation media
  archive/   explicitly superseded source material
```

Root files are limited to the public project front door, current plan/handoff,
toolchain configuration, governance, and license.

## Module boundaries

Allowed dependencies:

```text
app -> sim
app -> render
app -> xr
render -> sim (read-only types and state views)
xr -> app command types
```

Forbidden dependencies:

- `sim` to browser, React, Three.js, rendering, XR, persistence, or
  application lifecycle;
- `render` to independent chemistry, optical-load, scoring, or measurement
  calculations;
- `xr` to particle state or treatment mechanics;
- hot simulation state to React component state.

## Runtime data flow

Physical or pointer input becomes a validated discrete command. The application
layer applies it to lifecycle/domain code. `SimulationRuntime` owns the
deterministic state and fixed-step clock, while an app-owned frame driver
advances that runtime inside the React Three Fiber canvas. Rendering receives a
read-only state view and synchronizes reusable Three.js objects.

Relative optical-load bands produced by `src/sim` are the sole process source
for hero-tank appearance, instruments, completed results, static canonical jar
summaries, persistence, and replay. This record is dimensionless and is not
calibrated NTU.

The hero tank is the only live process presentation. Canonical jars are
application-owned, write-on-completion summaries. The mounted dose-response
plot and versioned experiment log retain complete memory for all eleven doses.

## Treatment-result replay

An application-owned recorder samples the authoritative optical-load bands at
10 Hz and creates a versioned treatment-ghost record with phase and
compatibility metadata. Persistence and schema migration remain outside
`src/sim`.

An application-owned playback clock performs sample lookup and bounded linear
interpolation. Rendering receives a read-only replay view. The accepted
presentation uses the saved endpoint as a subordinate past-run gauge needle; it
does not reconstruct particles, calculate a second result, or place a
comparison level inside the tank.

## Determinism and performance

- Fixed timestep and capped catch-up prevent display timing from changing
  results.
- Seeded randomness is centralized; `Math.random()` is forbidden in
  `src/sim`.
- Particle capacity is fixed and storage is typed and preallocated.
- React state is not updated per particle or per simulation step.
- Per-frame allocations and added transparent layers require measured
  justification.
- Headless tests and benchmarks run without DOM or WebGL.

## Lifecycle and errors

Invalid external commands fail at the app boundary. Visibility changes and XR
session interruptions pause the treatment cycle without hidden catch-up.
Persistence validates schema versions and cannot mutate simulation
initialization. Missing, corrupt, truncated, quota-blocked, or incompatible
records degrade to a clear refusal or legacy summary. Rendering failures
produce a visible application error instead of a silent blank canvas.

## Current deployed state

The public root loads the seated Sunol laboratory in Chrome/Chromium and offers
one explicit **Enter VR** action in Quest Browser. It uses one 500-particle
authoritative simulation, physical instrumentation, a static six-jar rack, a
complete result plot, bounded result replay, selectable scenery, and generated
audio.

The local and hosted Quest routes, final visual/audio presentation, corrected
seated height, Dose 0/5/10 repeat cycle, refills, and immersive re-entry are
accepted on Quest 3. The remaining v0.1 release work is the final demonstration
video, release notes, and tag.

See [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) for current status and
[docs/README.md](README.md) for design and validation evidence.
