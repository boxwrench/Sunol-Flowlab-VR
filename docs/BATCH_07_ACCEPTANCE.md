# Batch 07 Candidate Acceptance Packet

Date: 2026-07-17  
Gate status updated: 2026-07-19

Status: **Candidate; not yet accepted.** All local automated, deterministic,
architecture, persistence, rendered-browser, and build gates pass. Seated Quest
readability, comprehension, and physical-control checks remain the only open
acceptance gate; the immersive performance row has passed.

On 2026-07-19 the project owner explicitly deferred the remaining human review
so that safe candidate hardening could be batched. Later that day, the owner
authorized Batch 08 technical work as a scheduling exception and directed one
combined Quest review for both batches. This is not a pass, waiver, or Batch 07
acceptance.

## What changed

- Added an app-owned, versioned experiment log that appends each immutable trial
  ID once, restores from localStorage, preserves all integer doses and repeated
  trials, and fails safely for unavailable, corrupt, future, and quota-limited
  storage.
- Added deterministic static summaries for canonical doses 0, 2, 4, 6, 8, and 10. Each jar uses the latest matching completed result; odd doses never update
  a jar; restore and clear rebuild from the complete log.
- Added a physical five-state phase indicator, relative-result gauge, mounted
  0–10 plot, 90-degree nephelometer geometry, complete-only refill handle, and a
  two-press tear-sheet history clear.
- Added a fixed-capacity 10 Hz recorder that captures 431 samples by 12 bands,
  band edges, phase timeline, result metadata, and endpoint metadata without
  particle recording or per-sample allocation.
- Added validation and compatibility handling for current, tested-migration,
  legacy-summary, malformed, truncated, and incompatible ghost records.
- Added a three-record measured localStorage library with explicit deletion,
  pending-candidate, and oldest-record replacement behavior.
- Added independent app-owned play, pause, seek, reset, interpolation, endpoint,
  and delete behavior. Physical controls expose selection, status, and progress;
  playback never advances the live simulation.
- Added a seated Quest CDP harness for candidate restart, efficient 0/5/10
  review staging, preparation, completion/memory validation, replay
  independence, clear, refill, and metrics. Staged records are test setup, not
  evidence of natural operator dose selection.

## What intentionally did not change

- No simulation equation, dose curve, seed, particle capacity, merge, settling,
  optical-load calculation, phase schedule, or accepted config hash changed.
- No particle replay, simulation recomputation, compression, IndexedDB,
  generalized storage layer, cloud sync, WebAssembly, or fixed-point math.
- No Batch 08 live-versus-ghost water overlay or final visual polish.
- No calibrated NTU, chemical-dose units, plant data, setpoints, or operating
  guidance.
- Experiment-history clear and ghost deletion remain separate actions.

## Files in the candidate

Added:

- `src/app/experimentMemory.ts` and its tests;
- `src/app/treatmentGhost.ts` and its tests;
- `src/app/Batch07ExperimentController.ts`, its tests, and
  `src/app/Batch07Driver.tsx`;
- `src/render/PhysicalInstrumentation.tsx` and its tests;
- `scripts/quest-batch-07.mjs`; and
- this acceptance packet.

Modified:

- app orchestration, runtime observation, XR shell, and command contracts under
  `src/app`;
- foundation/XR scene composition, jar summaries, and nephelometer geometry
  under `src/render`;
- browser and architecture contracts;
- `package.json`, the Batch 07 plan, roadmap, README, handoff, progress, and
  governing contract/decision/performance/UX documentation.

The separate accepted alpha-zeta research-contract refinement in
`docs/POST_V1_MECHANISTIC_COAGULATION_RESEARCH.md` remains preserved in the
working tree but is not Batch 07 runtime scope.

## Selected policies

- Plot: every completion is retained and drawn. Repeated doses receive a small
  deterministic horizontal display offset; values are never averaged or
  replaced.
- Canonical jars: latest matching completion only; they are summaries, not
  history.
- Ghost library: auto-save through three records, then retain one pending
  candidate for deliberate deletion or oldest-record replacement.
- Destructive physical actions: experiment clear and ghost delete each require
  two deliberate presses.

## Verification completed

- `npm test`: 21 repository-contract tests and 133 Vitest tests pass across 30
  Vitest files.
- The application-command boundary rejects unknown commands, invalid dose
  detents, missing ghost IDs, and non-finite seek payloads.
- `npm run test:browser`: all six Playwright scenarios pass.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run format:check`: pass.
- `npm run acceptance:03d`: canonical and nine-seed eleven-dose corpus pass
  under `fnv1a32-e8bf13e7`.
- `npm run benchmark`: 2,580 steps in 29.4614 ms total, 0.011264 ms average,
  0.028700 ms p95; canonical endpoint remains `0.5011820349166183`.
- `npm run build`: 360 modules transform and production build passes. Existing
  non-failing emulator-asset chunk warnings remain.
- Required web-game client ready and XR Start captures completed with no console
  error artifact; both screenshots and the completed-memory screenshot were
  visually inspected.

## Measured storage and desktop rendering

- One 43-second, 10 Hz, 12-band JSON ghost measures 50.9–54.9 KB depending on
  sample values. Three records are approximately 165 KB, so IndexedDB and
  compression are not justified for the configured library.
- Desktop headless rendered checkpoints report 51 draw calls ready, 53 draw
  calls complete, and 55 with the Batch 08 prior-front comparison visible. The
  browser suite enforces a ceiling of 71.
- The physical digit and gauge tick geometry is instanced; the earlier
  unoptimized 115-draw-call desktop candidate was rejected before acceptance.

## Per-frame work

- `Batch07Driver` advances the existing cycle and independent playback clock.
- The runtime step observer updates one mutable authoritative gauge value and
  writes into preallocated recorder storage. It allocates no sample object.
- Playback interpolates into one preallocated Float32 band view.
- Gauge, replay progress, and replay status update existing Three.js objects.
- Log, summary, schema, serialized-array, and React revision allocations occur
  only at discrete commands, restore, completion, or finalization.

## Known limitations and open evidence

- The exact seated Quest route now has a successful partial operator session.
  Dose 5 completed at 114.21 FPS and 9.50 ms p95 after the operator selected it
  from staged 0/5/10 data. The owner called this a “good start” and paused before
  the physical replay/refill/clear sequence and final readability verdict.
- The owner-authorized Batch 08 technical candidate now adds one subordinate
  opaque prior-front marker. Its human interpretation and live-plus-ghost Quest
  cost remain in the combined Batch 07/08 gate.
- Standing, endurance, thermal, hosted deployment, and release evidence remain
  outside this gate.

## Requirement audit

| Requirement                               | Evidence                            | State   |
| ----------------------------------------- | ----------------------------------- | ------- |
| One result per completion                 | unit, integration, browser restart  | Pass    |
| Complete all-dose/repeat memory           | schema and marker tests             | Pass    |
| Canonical exact/odd/latest/restore/clear  | domain and browser tests            | Pass    |
| Gauge/plot share result authority         | exact mapping tests                 | Pass    |
| Corrupt/future/quota storage safety       | domain tests                        | Pass    |
| 10 Hz flat recording and endpoint bands   | 431×12 recorder tests               | Pass    |
| Compatibility and migration classes       | current/migrated/legacy/error tests | Pass    |
| Playback controls and interpolation       | exact/bounded/end tests             | Pass    |
| Playback leaves live simulation unchanged | domain, integration, browser        | Pass    |
| Three-record limit/delete/replace         | measured library tests              | Pass    |
| Physical instrumentation present          | inspected desktop/XR captures       | Pass    |
| Seated readability and comprehension      | project-owner worn-headset review   | Pending |
| Physical refill/clear/replay controls     | project-owner worn-headset review   | Pending |
| Immersive Quest performance               | seated rolling metrics              | Pass    |

## Gate decision

Do not tag or mark Batch 07 accepted yet. Proposed closing commit remains
`feat: add instrumentation, persistence, and treatment-result ghosts`; proposed
accepted tag remains `instrumentation-complete` after the three pending Quest
rows pass or receive explicit documented waivers.

The remaining rows now belong to the combined Batch 07/08 checklist in
`docs/UX_VALIDATION.md`. Do not tag Batch 07 from Batch 08 desktop evidence.
