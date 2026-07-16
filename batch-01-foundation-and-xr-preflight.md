# Batch 01 Implementation Plan: Foundation and WebXR Preflight

**Status:** In progress — Track 1A accepted; Track 1B local device gate accepted, hosted gate open
**Depends on:** Batch 00 contracts substantially complete; hosted-route closure remains part of Track 1B  
**May run in parallel with:** Track 1A and Track 1B only under isolated ownership  
**Primary gate:** The repository can render 500 deterministic particles with permanent metrics, and the actual Quest/WebXR toolchain is proven independently.

> This batch must also follow [the hybrid jar-test design direction](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md). The design brief governs product intent and presentation meaning; this batch remains authoritative for timing, scope, tests, evidence, and acceptance.

## Goal

Prove the two basic technical foundations before building treatment behavior:

1. a stable, measurable desktop rendering and simulation harness; and
2. a minimal real-device WebXR path with controller input and remote debugging.

## Agent execution rules

- Read `CLAUDE.md`, the current repository tree, `package.json`, and relevant tests before proposing edits.
- Summarize the current architecture and any conflicts with this plan before writing code.
- Use one implementation owner per worktree. A second agent may review, but must not edit concurrently.
- Implement only this batch. Do not pull later-batch work forward because it appears convenient.
- Preserve the `/sim`, `/render`, `/xr`, and `/app` ownership boundaries.
- Keep simulation state outside React. Do not add React state updates to the hot simulation path.
- Report uncertainty instead of inventing package APIs, especially for the pinned `@react-three/xr` version.
- Produce evidence: changed files, commands run, test output, performance measurements where applicable, known limitations, and remaining hot-path allocations.
- Do not mark the batch complete until every acceptance criterion has objective evidence.

## Track 1A - Repository and performance harness

### Work package 01A.1 - Scaffold or normalize the application

- Create or validate the Vite + React + TypeScript project.
- Use the package versions and runtime policy fixed in Batch 00.
- Add HTTPS local development suitable for WebXR.
- Establish `/src/sim`, `/src/render`, `/src/xr`, and `/src/app` without adding later feature code.
- Add scripts for development, typecheck, tests, production build, and any benchmark entry point.
- Add a minimal error boundary or visible startup failure state so silent blank scenes are avoided.

**Evidence:** Clean install and production build from a fresh checkout.

### Work package 01A.2 - Fixed-step simulation driver

Implement a plain TypeScript simulation clock with:

- fixed timestep;
- accumulator;
- capped catch-up steps;
- deterministic time progression;
- start, pause, reset, and manual headless stepping hooks;
- no React ownership of the clock state.

The first motion may be simple bounded drift. Do not implement coagulation, settling, or collision logic.

**Tests:**

- exact step count for known elapsed time;
- catch-up cap behavior;
- reset restores time and step count;
- headless stepping works without DOM or WebGL.

### Work package 01A.3 - Seeded particle initialization

- Add a portable seeded PRNG.
- Allocate fixed-capacity typed arrays or pooled structures for 500 particles.
- Generate deterministic initial positions and simple velocities inside a tank-like volume.
- Add a stable reset path that does not reallocate the full state.
- Forbid `Math.random()` inside `/sim`.

**Tests:**

- same seed produces the same initial arrays;
- different seeds produce meaningfully different states;
- reset does not grow capacity or heap use;
- values remain within bounds.

### Work package 01A.4 - One-draw-call particle renderer

- Render all active particles through one `InstancedMesh`.
- Reuse temporary matrices and objects.
- Separate simulation step timing from instance synchronization timing.
- Keep materials simple and opaque in this batch.
- Add a clear method for inactive slots to be omitted without recreating meshes.

**Non-goal:** No glass tank, optical-load gradient, post-processing, or physical instrumentation.

### Work package 01A.5 - Permanent development telemetry

Add a development-only metrics surface that records:

- average FPS;
- average frame time;
- p95 frame time over a documented window;
- simulation-step milliseconds;
- instance synchronization/upload milliseconds;
- active particle count;
- draw calls;
- optional merges-per-second placeholder;
- heap or allocation observations where browser support permits;
- build and device metadata in captured reports.

Metrics must be callable from code and exportable as a compact report. Do not make the UI itself part of the shipped apparatus.

### Work package 01A.6 - Memory and allocation audit

- Run a five-minute desktop idle test.
- Inspect heap trend and garbage-collection hitches.
- Search hot paths for array/object allocation, closures, repeated temporary `Vector3`/`Matrix4` creation, and React rerenders.
- Record every remaining per-frame allocation and whether it is acceptable.

### Work package 01A.7 - Runtime ownership correction

Status: implemented in the foundation; retained as a permanent regression gate.

- Add an app-owned SimulationRuntime that creates and owns authoritative process state and the fixed-step clock.
- Expose start, pause, reset, rendered advance, and headless stepping without React or WebGL ownership.
- Pass externally owned read-only simulation views into rendering.
- Keep simulation creation, reset, and stepping out of src/render.
- Inject render telemetry or route it through a neutral boundary; forbid render imports from src/app.
- Preserve src/sim independence from browser, React, Three.js, and XR dependencies.
- Do not add a generalized engine, event bus, Redux, Zustand, or another global state framework.

Tests:

- import boundaries forbid src/render imports from src/app;
- runtime lifecycle tests prove deterministic create, start, pause, reset, and advance behavior;
- renderer contract tests prove ParticleCloud receives state and does not instantiate FixedStepClock or call authoritative step functions;
- headless tests prove state advances without React, WebGL, or a browser;
- optional development diagnostics may record unexpected React rerenders, but zero renders is not the gate.

**Gate for Track 1A:** No unbounded memory growth, deterministic reset, app-owned runtime lifecycle, read-only rendering consumption, one particle draw call, and a successful production build.

## Track 1B - Minimal WebXR preflight

This track may use a separate branch/worktree. It must not edit simulation architecture beyond consuming the minimal application shell.

### Work package 01B.1 - XR session entry

Status: accepted on the local physical Quest route on 2026-07-15.

- Create the XR store using APIs for the pinned `@react-three/xr` version.
- Add one obvious development entry button.
- Start `immersive-vr` from a secure context.
- Handle unsupported, rejected, and ended sessions without a blank page.
- Record capability detection results.

### Work package 01B.2 - Controller proof

Status: accepted on the local physical Quest route on 2026-07-15.

- Confirm both tracked controllers render or otherwise expose poses.
- Confirm trigger/select input is received.
- Highlight or select one simple test object.
- Log input source handedness and session events in development builds.
- Do not implement grabbing, a lever, haptics, or treatment controls.

### Work package 01B.3 - Emulator and real-headset workflow

Status: accepted on the local physical Quest route on 2026-07-15.

- Verify the integrated emulator supported by the pinned XR package.
- Confirm the deprecated browser extension is not required.
- Open the application in Quest Browser through the selected HTTPS route.
- Verify ADB connection and `chrome://inspect` remote debugging.
- Capture a baseline Quest trace with the trivial scene.
- Record headset, browser, OS, build hash, and package versions in `docs/PERFORMANCE.md`.

### Work package 01B.4 - Hosted smoke deployment

Status: open; no public host has been authorized or selected.

Deploy the minimal build to the intended static host or a disposable equivalent and prove:

- root URL loads on desktop;
- XR entry appears only when supported;
- Quest Browser can enter VR;
- controller select works;
- session exit returns to a usable desktop page.

## Explicit non-goals

- No spatial hash.
- No collision or aggregation.
- No dose model.
- No XR grabbing or constrained controls.
- No glass, transparency, optical-load presentation, plot, or plant environment.
- No particle-count increase above 500.

## Parallelization rules

Track 1A and Track 1B may run concurrently only when:

- each has a separate worktree;
- one shared interface owner controls XR store and app entry changes;
- Track 1B does not change `/sim`;
- changes are reviewed and merged serially;
- the lockfile is not independently modified in both tracks.

## Required tests and evidence

- `npm ci` or the pinned equivalent from a clean checkout.
- typecheck and unit tests.
- production build.
- deterministic seed snapshot or numeric comparison.
- five-minute idle memory observation;
- runtime lifecycle, module-boundary, renderer-contract, and headless behavior tests.
- desktop metric capture at 500 particles.
- Quest screenshot or trace proving session entry and controller input.
- hosted URL smoke-test record.

## Review-agent checklist

- Is React merely assembling the scene?
- Is the simulation clock testable headlessly?
- Is there exactly one visible particle draw call?
- Does instance synchronization avoid repeated temporary allocation?
- Are XR APIs verified against the pinned version rather than copied from stale examples?
- Did the preflight remain disposable and avoid becoming Batch 4 early?
- Are performance metrics permanent infrastructure rather than console-only output?

## Acceptance criteria

### Track 1A

- 500 particles animate smoothly on desktop.
- Same seed reproduces the same initial state.
- Five-minute idle run shows no unbounded memory growth.
- Permanent metrics are visible and exportable in development.
- Production build succeeds.
- Runtime ownership remains in src/app, deterministic behavior remains in src/sim, and src/render remains a read-only consumer.

### Track 1B

- Hosted HTTPS URL enters VR on the target Quest.
- Both controllers are detected and select input registers.
- Remote inspection works.
- Baseline Quest metrics and exact software versions are recorded.
- No unresolved certificate, browser, session-entry, or package-version issue remains.

The local physical subset is accepted: Quest 3 entered immersive VR from the
ADB-reversed loopback route, both controllers and select input registered, the
development target was selected, remote inspection reported stable baseline
metrics, and session exit preserved a usable page. The track is not fully
accepted until the hosted-HTTPS criteria above are exercised on an authorized
deployment.

## Suggested commit

`feat: establish deterministic render harness and WebXR preflight`

## Required closing acceptance packet

The implementation agent must provide:

1. What changed.
2. What intentionally did not change.
3. Files added, removed, and modified.
4. Commands run and exact results.
5. Dose-sweep comparison when simulation behavior changed.
6. Desktop or Quest metrics when rendering or XR behavior changed.
7. Known defects, compromises, and deferred decisions.
8. Remaining allocations or expensive operations in per-frame paths.
9. Documentation updated.
10. Proposed commit message and whether the batch gate passed.
