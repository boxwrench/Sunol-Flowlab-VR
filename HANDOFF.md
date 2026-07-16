# Session Handoff

Updated: 2026-07-15

## Resume point

- Repository: <https://github.com/boxwrench/Sunol-Flowlab-VR>
- Branch: `main`
- Published baseline before this increment: `f1c4e13` (`feat: validate Batch 03 apparatus presentation`)
- Current increment: approved modeling/replay research integration plus repository coherence and stale-guidance cleanup
- Active plan authority: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and its ordered `batch-00` through `batch-11` Markdown files
- The superseded Godot plan is isolated under `docs/archive/` for provenance. Its stale duplicate Batch 03 snapshot was removed; use only the active indexed Batch 03 plan.

## What is working

- Public MIT repository governance and contributor/safety documentation
- Exact, lockfile-pinned React, Three.js, React Three Fiber, and WebXR toolchain
- Chrome localhost development route using the bundled IWER Meta Quest 3 emulator
- Explicit **Enter VR** flow with automatic XR session offers disabled
- Verified emulated immersive entry and both controller poses
- Deterministic fixed-step simulation clock and seeded PRNG
- App-owned `SimulationRuntime` with start, pause, reset, rendered stepping, and headless stepping
- Fixed-capacity 500-particle typed-array state with normalized floc size, irreversible settlement, and no hot-step allocation
- Pure deterministic dose efficiency, four-phase aggregation/settling, and one authoritative 12-band normalized record (legacy source identifier: turbidity)
- Read-only one-draw-call instanced particle rendering with visible floc growth and settling, without lifecycle ownership or per-frame React state
- Preallocated performance telemetry, Chrome heap reporting, and machine-readable headless benchmark
- Automated module-boundary regression tests, a desktop Playwright smoke test, and a minimal GitHub Actions workflow
- Visible startup error boundary
- Approved hybrid presentation direction: one live authoritative hero tank, six static canonical preset jars, and a complete eleven-dose plot/log
- Accepted uninterrupted 310-second post-fix Chrome observation with stable heap, 500 particles, three draw calls, and zero console errors
- Accepted Batch 02A canonical and nine-seed 11-dose sweeps with a single Dose 5 minimum and both tail margins above threshold
- Accepted full 43-second browser/text-state/visual path and schema-2 production phenomenon benchmark
- Band-driven hero observation tank, static six-jar recognition blockout, and deterministic low/optimum/high desktop presets
- Unlabeled proof mode and authoritative clearing-front diagnostics
- Authorized physical Quest 3 route over ADB reverse with secure-context and
  `navigator.xr` confirmation
- Physical immersive entry, both handed controllers, select input, development
  target selection, Chrome remote inspection, baseline metrics, and clean
  session exit
- Apparatus placement beyond the WebXR floor origin, with an automated 1.25 m
  minimum-clearance regression
- Table-mounted static jar-test rack based on project-owner operator feedback,
  followed by open rectangular jar and rim geometry based on the second review
- Project-owner operator acceptance of the final physical Quest composition,
  plus a 120 FPS, 8.70 ms p95, 22-draw-call live rolling snapshot
- Approved final-version modeling contract: mass-authoritative deterministic
  aggregation, default `Df = 2.0`, fractal-derived capped settling, one
  projected-area relative optical-load authority, and explicit population-health
  validation, routed to Batch 03 Workstream 03D
- Approved treatment-result ghost contract: app-owned 10 Hz authoritative-band
  recording, versioned compatibility metadata, bounded linear interpolation,
  measured small-library persistence, and read-only subordinate replay, routed
  to Batches 07-08 without particle recording or simulation recomputation
- One consolidated post-research Batch 03 plan, plan-wide `main` branch policy,
  current official Node 24-based CI actions, and no duplicate active mechanics plan

The current local validation includes 16 passing repository contract tests, 67 passing Vitest tests across 15 files, canonical and nine-seed dose sweeps, reverse-order equality, type checking, lint, formatting, production build, a production-path benchmark, three passing desktop browser tests, deterministic low/optimum/high endpoint captures, an inspected unlabeled apparatus capture, and a 60 FPS 12-second real-time desktop apparatus observation with zero console errors. The physical Quest preflight recorded a stable 120 FPS rolling snapshot, 8.33 ms average and 9.00 ms p95 frame time, both controllers and select events, and clean session exit. Full physical evidence is in [docs/PERFORMANCE.md](docs/PERFORMANCE.md#2026-07-15---physical-quest-3-local-preflight); Batch 02A evidence is in [docs/BATCH_02A_ACCEPTANCE.md](docs/BATCH_02A_ACCEPTANCE.md); current Batch 03 evidence and open gates are in [docs/BATCH_03_PROGRESS.md](docs/BATCH_03_PROGRESS.md). The production build retains the expected non-failing large-chunk warnings from emulator environment assets.

## Open gates and constraints

- The local physical Quest route is accepted. Device serial
  `2G0YC5ZG0M052K` was authorized in ADB state `device`; immersive entry,
  controller input, remote inspection, metrics, and exit passed. This does not
  accept later ergonomics, readability, thermal, endurance, or release gates.
- The first Batch 03 headset review began inside the hero tank. The revised
  placement was reported as "pretty good." The owner then requested a
  table-mounted jar-test rack, and reported that correction as "pretty good."
  The latest operator correction replaces the cylindrical blockout with open
  rectangular jars; the owner accepted that final physical candidate. External
  blind recognition and blinded outcome review remain open.
- The accepted post-fix desktop observation kept Chrome heap within 34.9-35.5 MB for 310 uninterrupted seconds with 500 particles, three draw calls, and no console errors. The final exported report is recorded in `docs/PERFORMANCE.md`.
- A hosted HTTPS deployment is not authorized yet. Localhost and the documented ADB reverse route are the approved development paths.
- Public-data and fictionalization restrictions in [docs/DATA_BOUNDARY.md](docs/DATA_BOUNDARY.md) are binding.
- Before visual acceptance, record the required unlabeled-screenshot recognition check in `docs/UX_VALIDATION.md`; at least one operator or educator must participate, with a nonoperator preferred as an additional participant.
- The external recognition and blinded outcome reviews are intentionally parked
  until Workstream 03D produces replacement behavior captures. They remain open
  acceptance gates and have not been waived.

## Architecture constraints

Keep the existing boundaries in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md):

```text
src/sim/     deterministic process state and behavior; no browser or UI dependencies
src/render/  read-only visualization of authoritative simulation output
src/xr/      WebXR session and physical-input adapters
src/app/     runtime lifecycle, validated commands, modes, telemetry, and composition
```

Do not place chemistry, relative optical load, scoring, or measurement calculations in rendering or XR code. Rendering cannot create, reset, or advance simulation state and cannot import the app layer. Do not move hot simulation state into React state. Preserve fixed-step determinism, seeded randomness, fixed-capacity storage, and measured allocation discipline.

The hybrid presentation direction does not create six simulations. The hero tank is the only live process view. Canonical jars at doses 0, 2, 4, 6, 8, and 10 are application-owned static completion summaries. The plot and trial log are the sole complete memory for all doses 0 through 10, including odd doses.

Treatment ghosts are a separately managed limited subset of recorded result
histories, not complete memory. Recording, schema checks, persistence, and
playback timing stay in `/src/app`; rendering consumes a read-only replay view.
Do not implement ghost particles, replay by recomputation, or ghost runtime work
inside the current Workstream 03D model change.

## Recommended next session

1. Implement Workstream 03D one package at a time, beginning with authoritative
   mass and derived diameter plus their invariants.
2. Preserve the Batch 02A curve and evidence as the comparison baseline; accept
   a replacement only after the new canonical and nine-seed suites pass.
3. Keep spatial hashing and merge-animation metadata deferred absent evidence;
   do not add a version 1 free list.
4. Keep treatment-ghost implementation staged for Batches 07-08; Workstream 03D
   only exposes the authoritative samples required by the later app recorder.
5. Regenerate low/optimum/high captures after model replacement, then resume the
   parked external recognition and blinded outcome reviews before accepting Batch 03.
6. Keep the hosted deployment and later headset-specific ergonomics, readability,
   thermal, endurance, and release gates open; archived source artifacts remain
   non-authoritative.

## Commands

```powershell
npm ci
npm test
npm run benchmark
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run test:browser
npm run dev
```

Open `http://localhost:5173` in Chrome for the Quest 3 emulator. For repeat
physical-device testing, follow [docs/DEVICE_TESTING.md](docs/DEVICE_TESTING.md).
