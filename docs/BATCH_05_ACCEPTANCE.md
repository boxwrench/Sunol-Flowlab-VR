# Batch 05 Acceptance Packet

Date: 2026-07-16

Status: Parked at a review-ready checkpoint. Implementation and software
evidence are complete; physical Quest 3 acceptance remains open.

## 1. What changed

- Added an app-owned Batch 05 command adapter between the accepted XR controls
  and `SimulationRuntime`.
- Routed validated `SET_DOSE` only while the temporary lifecycle is ready.
- Routed `START_TRIAL` to deterministic reset/start from ready and to resume
  after an XR or visibility interruption.
- Replaced the XR shell's duplicated empty-tank geometry with the existing
  `HeroObservationTank`, `ParticleCloud`, and `OpticalLoadGradient` renderers.
- Added one app-owned runtime to the XR route while preserving the independently
  runnable desktop proof route.
- Added read-only integration diagnostics for lifecycle, config, seed, dose,
  phase, population, merge count/rate, optical load, and rolling performance.
- Paused the runtime on XR session loss, document hiding, and unmount; retained
  capped catch-up and deterministic reset without replacing typed-array storage.

## 2. What intentionally did not change

- No source in `src/sim` and no accepted simulation constant changed.
- No XR interaction state machine, control geometry, posture transform, or
  accepted Batch 04 command shape changed.
- The six canonical jars remain one static rack with one frozen raw-water fill
  each. They consume no live particle, clock, or optical-load state.
- No seven-state treatment lifecycle, gauge, plot, log, persistence, canonical
  jar completion, ghost recording/playback, measurement beam, reset handle,
  final clearing-front tuning, environment, audio, hosted deployment, or
  particle-count increase was added.

## 3. Files

Added:

- `src/app/Batch05CommandAdapter.ts`
- `src/app/Batch05CommandAdapter.test.ts`
- `src/app/Batch05Integration.test.ts`
- `docs/BATCH_05_ACCEPTANCE.md`

Modified implementation and tests:

- `src/app/MetricsOverlay.tsx`
- `src/app/SimulationRuntime.ts`
- `src/app/XrShellApp.tsx`
- `src/render/XrShellApparatus.tsx`
- `src/render/XrShellScene.tsx`
- `tests/browser/desktop.spec.ts`
- `tests/module-boundaries.test.mjs`

Documentation changes are listed in section 9.

Removed: the duplicated `EmptyHeroTank` implementation inside
`XrShellApparatus.tsx`; no file was removed.

## 4. Commands and results

Pre-integration at commit `3f1bccd`:

- Node `v24.12.0`; npm `11.18.0`.
- `npm run acceptance:03d`: pass; config `fnv1a32-e8bf13e7`, canonical and
  nine-seed suites unchanged.
- `npm test`: 19/19 repository contracts and 92/92 Vitest tests in 21 files.
- `npm run benchmark`: 2,580 steps passed with endpoint `0.5011820349166183`.
- Batch 04 physical shell baseline: 119.7 FPS, 8.36 ms average, 8.90 ms p95,
  86 controller-inclusive draw calls, and 57.5 MB heap.

Current integrated candidate:

- `npm test`: 20/20 repository contracts and 100/100 Vitest tests in 23 files.
- `npm run test:browser`: 5/5 Chromium scenarios.
- `npm run acceptance:03d`: canonical and nine-seed suites pass; config and all
  canonical endpoints are unchanged.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run format:check`: pass.
- `npm run build`: pass with only the previously documented non-failing
  emulator-asset chunk warnings.
- `git diff --check`: pass.

One first browser rerun failed only because the new performance assertion
assumed a 300-frame ring immediately after synchronous headless advancement.
The check now waits for the next actual render synchronization and requires a
non-empty report; the rerun passes. This was test timing, not an application
failure.

## 5. Pre/post dose-sweep comparison

Canonical seed: `0x5f3759df` (`1597463007`). Configuration:
`fnv1a32-e8bf13e7`.

| Dose | Pre-integration endpoint | Integrated endpoint | Difference |
| ---: | -----------------------: | ------------------: | ---------: |
|    0 |                 0.737589 |            0.737589 |   0.000000 |
|    1 |                 0.687943 |            0.687943 |   0.000000 |
|    2 |                 0.539007 |            0.539007 |   0.000000 |
|    3 |                 0.508274 |            0.508274 |   0.000000 |
|    4 |                 0.510638 |            0.510638 |   0.000000 |
|    5 |                 0.501182 |            0.501182 |   0.000000 |
|    6 |                 0.510638 |            0.510638 |   0.000000 |
|    7 |                 0.508274 |            0.508274 |   0.000000 |
|    8 |                 0.539007 |            0.539007 |   0.000000 |
|    9 |                 0.687943 |            0.687943 |   0.000000 |
|   10 |                 0.737589 |            0.737589 |   0.000000 |

The permanent integration tests additionally compare exact band arrays,
population diagnostics, merge counts, and config hashes for Doses 0, 5, and 10.
Separate 60 Hz and 120 Hz presentation-cadence runs produce identical complete
results.

## 6. Quest metrics and presentation gate

The attached Quest 3 loaded the exact seated candidate at
`http://127.0.0.1:5173/?mode=xr-shell&posture=seated&calibration=off` through ADB
reverse. Before immersive entry, its flat browser panel reported a stable
300-frame window at 30.0 FPS, 33.34 ms average, 33.90 ms p95, 0.006 ms
simulation, 0.300 ms instance synchronization, 500 particles, 43 draw calls,
and 24.5 MB heap. This is a browser-panel checkpoint, not immersive Quest
acceptance.

Still required before this packet can close:

- immersive entry with both controllers tracked;
- low/optimum/high qualitative result review;
- left/right-eye transparency, depth ordering, floc visibility, wall opacity,
  and common-angle review;
- one full 500-particle trial through all current phases;
- rolling immersive FPS, average/p95 frame time, simulation time, instance
  synchronization, population, merge rate, draw calls, heap trend, visible GC,
  and error observations;
- comparison against the accepted Batch 04 shell baseline;
- XR exit/interruption and deterministic resume/reset confirmation on device.

No physical result is inferred from the passing software or flat-panel checks.
The project owner parked the work for the evening before immersive entry. The
verified Vite process was stopped, the Quest was disconnected, and local ADB
forwards were removed. Resume by restoring the documented local route; do not
treat the earlier loaded flat panel as a surviving session.

## 7. Known compromises and deferred decisions

- Batch 05 uses a deliberately limited `ready`, `running`, and `interrupted`
  lifecycle. Batch 06 owns the full treatment-cycle state machine.
- Dose changes are rejected after Start. There is no in-world reset control in
  this batch; development reload/reset remains available for repeated trials.
- A second Start while already running is rejected and logged. A Start after an
  interruption resumes without resetting.
- The browser-level IWER path is covered by source/unit/rendered tests, but the
  regular desktop Chrome tab used for visual inspection exposed an incompatible
  partial XR runtime and could not supply a new immersive emulator screenshot.
  Physical Quest evidence remains authoritative for stereo.
- Spatial hashing, a free list, simulation merge-event metadata, and increased
  capacity remain excluded because measurements do not justify them.

## 8. Per-frame costs and allocations

- The simulation step remains allocation-free and outside React state.
- `SimulationDriver` performs two timer reads and calls the capped fixed-step
  runtime.
- The shared particle path reuses one memoized `Matrix4`, one memoized `Color`,
  and fixed typed presentation arrays; it writes only active/transition instance
  matrices and colors.
- The optical surface reuses one byte array, one texture, and two materials
  sourced from the same authoritative band view.
- The XR integration adds no per-frame arrays, per-particle Three.js objects,
  React state updates, alternate optical calculation, or per-particle world
  transforms.
- Diagnostic population/config/report objects allocate only on explicit
  development inspection or the one-second metrics overlay refresh, not in the
  simulation/render hot path.

Remaining per-frame cost is simulation stepping, the existing particle
instance synchronization/upload, band-texture byte updates, Three.js/R3F/WebXR
rendering, and controller-model work. The immersive measurement remains open.

## 9. Documentation

Updated or added for the integration checkpoint:

- this packet;
- `batch-05-simulation-xr-integration.md`;
- `IMPLEMENTATION_PLAN.md`;
- `docs/ARCHITECTURE.md`;
- `docs/PERFORMANCE.md`;
- `docs/README.md`;
- `PROGRESS.md`;
- `HANDOFF.md`.

## 10. Commit and gate

Proposed commit:

    feat: integrate proven coagulation simulation into XR apparatus

Batch 05 gate: **open**. Software implementation, deterministic parity,
desktop preservation, lifecycle hardening, allocation audit, and production
build evidence pass. Physical immersive Quest presentation and performance
evidence is still required before acceptance or the `xr-integration-proven` tag.
