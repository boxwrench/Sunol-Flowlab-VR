# Batch 06 Acceptance Packet

Date: 2026-07-17

Status: **Accepted.** Automated, deterministic, architecture, desktop browser,
rendered-state, and physical Quest domain/performance evidence pass. The seated
project-owner operator also passed qualitative phase pacing, lock feedback,
measurement conclusion, refill readability, invitation to repeat, and visible
smoothness.

## 1. What changed

- Added one app-owned explicit treatment-cycle state machine:
  `READY -> RAPID_MIX -> FLOCCULATION -> SETTLING -> MEASURING -> COMPLETE ->
REFILLING -> READY`.
- Bound its phase endpoints to the authoritative simulation schedule: 6 seconds
  rapid mix, 15 seconds flocculation, 20 seconds settling, and 2 seconds
  measuring, with a single default global time scale of 1.
- Added exactly-once immutable `TrialResultV1` capture at 43 simulation
  seconds. The completed water presentation and detector output switch from the
  live runtime to the result's frozen optical-load snapshot.
- Locked dose and Start after a legal start, added physical crossbar feedback,
  rejected late commands, and unlocked only after refill completes.
- Added a minimal physical measurement emitter, beam, detector, and result lamp.
- Added a controlled temporary refill-action hook. Refill immediately restores
  the canonical seed/config raw-water arrays, clears the active result and
  render-local merge smoothing, shows a two-second physical inlet-stream cue,
  and then returns to ready.
- Added bounded lifecycle interruption/resume handling without hidden catch-up,
  duplicate phase events, or duplicate results.
- Replaced the temporary Batch 05 app composition with the same Batch 06
  controller on desktop and XR routes.
- Added a dedicated Quest CDP acceptance harness for restart, preparation,
  physical or remote start observation, exact phase-sequence capture, result
  validation, refill, and ready-state validation.

## 2. What intentionally did not change

- No simulation equation, parameter, seed, particle capacity, merge behavior,
  settling behavior, optical-load calculation, or accepted configuration
  changed.
- No final gauge face, mounted plot, experiment log, persistence, canonical-jar
  completion update, ghost recording/playback, environment art, final audio, or
  chemistry variable was added.
- The six canonical jars remain one static frozen raw-water summary draw and
  never consume the live hero-tank state.
- `PAUSE_TRIAL` and `CLEAR_EXPERIMENT_LOG` remain outside the Batch 06
  controller. Lifecycle pause/resume is controller-owned, and `RESET_TRIAL`
  is temporarily the refill request from `COMPLETE`.
- Standing, endurance, thermal, hosted deployment, and release acceptance are
  not claimed.

## 3. Files added, removed, and modified

Added:

- `src/app/TreatmentCycle.ts`
- `src/app/TreatmentCycle.test.ts`
- `src/app/TreatmentCycleDriver.tsx`
- `src/app/trialResult.ts`
- `src/render/MeasurementCue.tsx`
- `scripts/quest-batch-06.mjs`
- this acceptance packet

Removed: none.

Modified:

- app/runtime composition: `src/app/App.tsx`,
  `src/app/SimulationRuntime.ts`, and `src/app/XrShellApp.tsx`;
- renderer: `src/render/FoundationScene.tsx`,
  `src/render/HeroObservationTank.tsx`,
  `src/render/OpticalLoadGradient.tsx`, `src/render/ParticleCloud.tsx`, and
  `src/render/XrShellScene.tsx`;
- XR controls: `src/xr/DoseLever.tsx`, `src/xr/StartButton.tsx`, and
  `src/xr/interactionState.test.ts`;
- verification and scripts: `tests/browser/desktop.spec.ts`,
  `tests/module-boundaries.test.mjs`, `tests/render-contract.test.mjs`,
  `tests/xr-interaction.test.mjs`,
  `scripts/capture-batch-03-review.mjs`, and `package.json`;
- plan/contracts/progress: `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`,
  `batch-06-treatment-cycle-state-machine.md`, `docs/CONTRACTS.md`, `README.md`,
  `HANDOFF.md`, `docs/PERFORMANCE.md`, and `docs/UX_VALIDATION.md`.

## 4. Commands run and exact results

- `npm test`: 20 repository-contract tests pass; 24 Vitest files and 109
  Vitest tests pass.
- `npm run test:browser`: all five Playwright scenarios pass, including the
  shared desktop and XR seven-phase/result/refill paths.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run format:check`: pass.
- `npm run acceptance:03d`: the canonical and nine-seed eleven-dose
  acceptance corpus passes under `fnv1a32-e8bf13e7`.
- `npm run benchmark`: 2,580 steps complete in 23.9372 ms total, averaging
  0.009185 ms with 0.022100 ms p95; the canonical endpoint remains
  `0.5011820349166183`.
- `npm run build`: 355 modules transform and the production build passes. The
  existing non-failing emulator-asset chunk warnings remain.
- The required web-game client clicked Start on the current candidate and
  recorded `RAPID_MIX`, locked controls, 500 particles, live-runtime optical
  presentation, 28 draw calls, and no console/page error artifact. Its
  screenshot was visually inspected.
- Desktop browser captures for `MEASURING`, `COMPLETE`, and `REFILLING`
  were visually inspected. They show the beam/detector, result lamp, and inlet
  stream respectively.

## 5. Dose-sweep comparison

Simulation behavior did not change. Fresh acceptance output retains:

| Dose | Endpoint optical load | Active | Suspended | Settled |
| ---: | --------------------: | -----: | --------: | ------: |
|    0 |              0.737589 |    429 |       351 |      78 |
|    5 |              0.501182 |    105 |        65 |      40 |
|   10 |              0.737589 |    429 |       351 |      78 |

All eleven canonical endpoints and all nine seed-corpus runs pass under the
unchanged config hash. Mass error remains zero.

## 6. Rendering and XR metrics

The final desktop client rapid-mix capture reports 28 draw calls with 500
particles and no browser error. The accelerated desktop acceptance captures
report 29 draw calls for measurement/completion/refill cue states. These are
rendered-state and cost checks, not physical-headset frame-rate evidence.

The exact seated Quest page entered a fresh immersive session on the connected
Quest 3. Both controllers tracked at Start, the right-hand physical button
emitted exactly one command, both controls entered their locked state, and the
harness observed the exact phase sequence:
`RAPID_MIX -> FLOCCULATION -> SETTLING -> MEASURING -> COMPLETE`.

| Snapshot     | Sim time | Average FPS | Average frame | p95 frame | Draw calls |
| :----------- | -------: | ----------: | ------------: | --------: | ---------: |
| Rapid start  |     0.00 |      108.07 |       9.25 ms |  14.10 ms |        122 |
| Flocculation |     6.05 |      117.19 |       8.53 ms |   9.80 ms |        124 |
| Settling     |    21.00 |      118.88 |       8.41 ms |   9.10 ms |        124 |
| Measuring    |    41.00 |      120.06 |       8.33 ms |   9.00 ms |         96 |
| Complete     |    43.00 |      117.64 |       8.50 ms |   9.00 ms |         98 |

The rapid-start window includes the physical press/session transition. Every
later window stays at 117.2-120.1 FPS with 9.0-9.8 ms p95. Heap remained
31.2 MB. COMPLETE contains exactly one immutable result, uses
`presentationOpticalSource: trial-result`, and matches the canonical Dose 5
state: 105 active, 65 suspended, 40 settled, 395 merges, and endpoint
`0.5011820349166183`.

The controlled refill command was accepted from COMPLETE and the following
snapshot proved deterministic READY raw water: 500 active/suspended particles,
zero settled particles and merges, time zero, no active result, live-runtime
presentation, and dose/Start unlocked. The first CDP waiter used page-RAF
polling and timed out even though the XR-loop-driven state reached READY; the
harness now uses fixed 100 ms polling. The seated operator passed the combined
visual review after observing the cycle and refill.

## 7. Known defects, compromises, and deferred decisions

- Batch 06 uses a development-controlled refill trigger because the physical
  refill handle belongs to later instrumentation work. The in-world stream is
  a minimal state cue, not final apparatus art.
- Losing controller tracking during a running trial does not pause the
  autonomous process; no further input is required and controls remain locked.
  XR session loss or document hiding pauses without hidden catch-up.
- Development hot reload may reconstruct the controller at deterministic
  `READY` raw water. It does not attempt to salvage a partially reloaded
  trial.
- An active-trial reset request is rejected. A malformed result fails closed to
  deterministic `READY` raw water and records the failure for diagnostics.
- Final phase readability, water/floc polish, transparency tuning, and clearing-
  front tuning remain Batch 8 work.

## 8. Per-frame allocations and expensive paths

- `TreatmentCycleDriver` performs one controller advance and two timing reads
  per frame; it allocates no objects.
- The existing simulation and instance-sync loops retain their preallocated
  arrays and objects.
- The optical-gradient loop reuses one byte texture buffer and two materials.
  At completion it reads the frozen result band array instead of the live
  runtime array.
- One result object, one band snapshot, one phase-timeline object, and one
  memoized presentation wrapper allocate once per completed trial. Transition
  log records allocate only on discrete events.
- The measurement/refill meshes are declarative scene objects and add no
  per-frame allocation or process calculation.

## 9. Documentation updated

- Stable phase/result/command semantics: `docs/CONTRACTS.md`
- Active roadmap status: `IMPLEMENTATION_PLAN.md`
- Batch plan status: `batch-06-treatment-cycle-state-machine.md`
- Running work record: `PROGRESS.md`
- Closing physical and operator evidence: `docs/PERFORMANCE.md`,
  `docs/UX_VALIDATION.md`, `README.md`, and `HANDOFF.md`.

## 10. Commit and gate decision

Commit message: `feat: add deterministic treatment-cycle state machine`

Accepted tag: `treatment-loop-complete`

Decision: **accepted.** After the exact on-head phase/result/refill evidence was
recorded, the seated project-owner operator replied “pass” to the combined
review of distinct pacing, physical lock feedback, measurement conclusion,
refill readability and invitation to repeat, and visible smoothness.

## Requirement audit

| Requirement                                   | Current evidence                                               | State |
| --------------------------------------------- | -------------------------------------------------------------- | ----- |
| Explicit legal transition table and rejection | exhaustive phase/event unit matrix                             | Pass  |
| Fixed 6/15/20/2 timing and one time scale     | runtime-derived config plus 1x/2x unit coverage                | Pass  |
| Dose/Start lock and double-start prevention   | unit, source, desktop, and XR browser tests                    | Pass  |
| One fixed measurement and immutable result    | exact 43-second capture, frozen/isolated snapshot tests        | Pass  |
| Result-backed completed presentation          | desktop/XR state reports `trial-result`; browser assertions    | Pass  |
| Deterministic refill and render reset         | array-identity/reproducibility tests plus refill capture       | Pass  |
| Lifecycle and long-stall safety               | pause/resume, dropped-time, malformed-result, and wiring tests | Pass  |
| Desktop domain sequence and pacing            | browser flow and inspected captures                            | Pass  |
| Quest domain sequence and performance         | exact on-head phase/result/refill state plus rolling metrics   | Pass  |
| Quest qualitative pacing/readability          | seated project-owner combined review verdict: “pass”           | Pass  |
