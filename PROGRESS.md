Original prompt: batch 7

# Batch 7 working notes

- 2026-07-17: Began from accepted Batch 6 at `9df0497`; current `main` also
  contains the published post-v1 research contract at `63c577f`.
- Preserving the accepted, uncommitted alpha-zeta research-contract refinement
  while Batch 7 proceeds.
- Batch 7 authority requires app-owned experiment history, canonical summaries,
  bounded 10 Hz treatment ghosts, independent playback, and physical apparatus
  controls derived from the existing relative-optical-load authority.
- Implemented `ExperimentMemory`: versioned localStorage validation, exactly-once
  append, complete all-dose history, latest canonical-summary derivation, clear,
  and graceful corrupt/future/quota handling. Targeted tests: 5 passed.
- Implemented bounded treatment ghosts: 10 Hz fixed-capacity recording,
  validation/migration classes, measured localStorage library, explicit limit
  replacement/deletion, and independent deterministic playback. Domain and
  integration tests: 16 passed; Batch 5/6 lifecycle regressions also pass.
- Wired desktop and XR to one Batch 7 controller. Added physical phase lamps,
  relative-load gauge, 0–10 mounted plot with repeated-result policy, refill
  handle, two-press tear sheet, small ghost controls, static canonical-jar
  summaries, and 90-degree detector geometry. Typecheck and targeted render
  tests pass.
- Full repository suite passes: 22 contract tests and 133 Vitest tests. All six
  rendered Playwright scenarios pass, including restart persistence, canonical
  restore, history clear, independent ghost replay, deletion, and XR Start.
- Simulation acceptance and benchmark pass without model drift. The current
  production build transforms 360 modules. Desktop instrumentation reports 51
  ready, 53 complete, and 55 compatible-ghost-comparison draw calls. One
  12-band, 43-second, 10 Hz ghost measures 50.9–54.9 KB as JSON; the configured
  three-record library is about 165 KB.
- Quest 3 remains connected and exposes the seated route. The first immersive
  restart attempt timed out because user presence/foreground entry was not
  available; no physical Batch 7 performance or comprehension claim is made.
- Added `acceptance:07:quest -- stage-review` to seed 0/5/10 comparison memory
  before the short worn-headset review. It accelerates deterministic setup only;
  natural dose-search comprehension remains a human observation.
- Entered the staged seated Quest route successfully. The operator selected and
  physically started Dose 5; one exact result appended, the fourth ghost became
  pending at the three-record limit, both controllers tracked, and the complete
  rolling window held 114.21 FPS with 9.50 ms p95. The owner called it a “good
  start” and paused the visual review until tomorrow before the replay, refill,
  clear-sheet, comprehension, and final-verdict checks.
- On 2026-07-19 the owner explicitly deferred the remaining human Quest gate.
  The gate remains open; it was not passed or waived, and Batch 08 remains
  unstarted.
- Batched candidate hardening tightened the exported application-command type
  guard so unknown command names, invalid dose detents, missing ghost IDs, and
  non-finite seek times cannot be represented as valid `AppCommand` values.
  Focused regression coverage and type checking pass.
- Later on 2026-07-19 the owner authorized Batch 08 technical work before the
  open Batch 07 human verdict and requested one combined human review. This is a
  scheduling exception, not Batch 07 acceptance.
- Added display-only 0.16-second optical-band smoothing with immediate epoch
  reset. The recorder and all process consumers retain unsmoothed authoritative
  samples; no simulation config or endpoint changed.
- Added one opaque prior clearing-front marker driven by the app-owned replay
  view. It adds no ghost particles, second tank, replay recomputation, or
  transparency layer. The rendered compatible-ghost checkpoint reports 55
  development draw calls.
- Added automated low/optimum/high, flocculation, settling, measurement, refill,
  and compatible-ghost capture points. The required bundled browser client
  completed Dose 5 with exact endpoint state and no console-error artifact.
- Added one combined Quest review harness. It non-destructively stages all six
  canonical doses plus Dose 5, parks replay at 35 seconds, records the
  physical trial phase/performance evidence, and separately records accepted
  replay/refill/clear commands. Reports remain technical evidence and cannot
  supply the open human verdict.
- On 2026-07-20 the combined live run passed technically: both controllers,
  every phase, one appended result, no alerts, 107.02 FPS worst rolling
  average, and 12.50 ms worst rolling p95. The human gate returned issues:
  unlabeled dial/plot/replay controls, unclear replay purpose, an unexplained
  detector cube, and misleading cyan/amber tank lines.
- Removed the light-sensor geometry and both tank lines. Replaced phase lamps
  with text, labeled the relative-turbidity gauge, dose/result plot, past-run
  replay controls, refill, clear, and destructive actions, and moved past-run
  comparison to a labeled cyan gauge needle.
- Labeled the rack JAR TEST, staged all six canonical doses, and expanded their
  authoritative display-clarity range for a visibly stronger static
  cloudiness spectrum. The requested NTU unit was not used because the model
  remains dimensionless and uncalibrated.

## Current TODO

- Run one focused seated Quest rerun of the new text labels, jar spectrum,
  past-run gauge comparison, and replay/refill/clear controls. The live-trial
  performance row already has passing 2026-07-20 evidence.
- Do not represent either batch as accepted before that verdict and do not start
  Batch 09.
