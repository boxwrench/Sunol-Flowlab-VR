# Batch 07 Implementation Plan: Physical Instrumentation and Experiment Memory

**Status:** Not started — Batch 06 is accepted; implementation requires explicit authorization
**Depends on:** Batch 06 accepted  
**May run in parallel with:** Instrument geometry and data wiring after interfaces freeze  
**Primary gate:** The apparatus explains itself physically, records exactly one result per trial, persists the curve, and can record and replay a compatible prior treatment result without mutating the live simulation or requiring software chrome.

> This batch must also follow [the hybrid jar-test design direction](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md). The design brief governs product intent and presentation meaning; this batch remains authoritative for timing, scope, tests, evidence, and acceptance.

> Instruments, plots, persistence, and static jar summaries consume the dimensionless relative optical-load record governed by [the modeling research amendment](docs/MODELING_RESEARCH_AMENDMENT.md). User-facing labels must not imply calibrated NTU or real-dose guidance.

> Treatment-ghost recording, compatibility, persistence, deletion, and playback follow [the approved ghost replay design](docs/GHOST_REPLAY_DESIGN.md). Version 1 records bands, not particles, and never re-runs the simulation for playback.

## Goal

Turn the complete treatment loop into an understandable experimental instrument through diegetic controls, readouts, plotting, and persistent experiment memory.

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

## Core rule

Every display derives from the same authoritative relative optical-load band record captured by Batch 06. Different display mappings are allowed; independent process calculations are not. The mounted dose-response plot and versioned experiment log are the sole complete memory for all doses 0 through 10. The six jars are static summaries for canonical presets 0, 2, 4, 6, 8, and 10 only.

## Workstream 07A - Read-only physical instrumentation

### Work package 07A.1 - Dose scale and control labeling

- Add engraved or raised detent marks for 0-10.
- Provide a clear pointer/alignment mark.
- Ensure labels remain readable at normal working distance in VR.
- Avoid decimal or real chemical-dose units that imply calibration.
- Use a restrained physical label that communicates relative dose.

### Work package 07A.2 - Trial-status indicator

Choose one restrained physical approach:

- mechanical timer;
- phase lights;
- a rotating phase drum;
- or a small combination.

Requirements:

- consumes state-machine phase only;
- no floating software panel;
- distinguishes ready, active treatment, measuring, complete, and refilling;
- does not compete visually with the tank.

### Work package 07A.3 - Relative treatment-result gauge

- Build a physical gauge face and needle.
- Map authoritative endpoint optical load through a documented display transform.
- Animate the needle only during measurement.
- Use relative labels or an explicitly internal scale, not fake calibrated NTU.
- Add test hooks to compare gauge target with trial result.

### Work package 07A.4 - Nephelometer geometry

- Add emitter and 90-degree side detector geometry around the sample zone.
- Keep the beam/event temporary and inexpensive.
- Detector glow maps from the same sample data used for result capture.
- Avoid volumetric beam effects and stacked transparency.

### Work package 07A.5 - Mounted dose-response plot

Build a physical board that:

- displays detents 0-10 on the horizontal axis;
- uses the same relative optical-load scale as the gauge mapping;
- plots one point per completed trial;
- supports repeated testing at one dose through an explicit policy, such as latest result, average, or multiple small points;
- clearly reveals the U-shape as data accumulates;
- remains legible at arm’s length.

Document the repeated-dose policy before implementation.

The plot must accept every integer dose. Odd-dose trials remain fully visible and persisted even though no canonical jar summary changes.

### Work package 07A.6 - Static canonical jar summaries

Implement application-owned, write-on-completion summaries for canonical doses 0, 2, 4, 6, 8, and 10.

Intended record:

    interface CanonicalJarSummary {
      readonly dose: 0 | 2 | 4 | 6 | 8 | 10
      readonly trialId: string
      readonly endpointOpticalLoad: number
      readonly displayClarity: number
    }

Rules:

- update only after an immutable completed result exactly matches a canonical dose;
- use the latest completed result for that canonical dose;
- derive displayClarity through a documented transform of the authoritative result;
- update one matching jar once and store the associated result ID;
- leave all jars unchanged for odd-dose results;
- remain static between completed-result updates;
- contain no simulation clock, moving particles, per-frame process logic, or independent optical-load calculation;
- clear when experiment history clears;
- rebuild deterministically from the persisted experiment log on restore rather than becoming a second history source.

Allowed presentations include a restrained clarity gradient, settled-material silhouette, tested marker, or small result token. They remain subordinate to the hero tank and complete plot.

## Workstream 07B - Experiment actions and persistence

### Work package 07B.1 - Experiment-log domain model

Define a versioned schema, for example:

```ts
interface ExperimentLogV1 {
  schemaVersion: 1
  projectVersion: string
  points: TrialResult[]
  updatedAt: string
}
```

Requirements:

- validate on load;
- reject or migrate malformed/old data safely;
- keep persistence outside simulation state;
- never allow stored points to alter a new trial’s raw-water reset;
- enforce one append per completed result ID or equivalent deduplication key.

### Work package 07B.2 - localStorage persistence

- Save after a valid completed trial.
- Restore on app start.
- Restore the complete plot from all results and rebuild each static canonical jar summary from the latest matching canonical result.
- Handle unavailable storage and quota errors gracefully.
- Add schema version and migration hook.
- Avoid writing every frame.
- Add tests for empty, valid, corrupt, and future-version data.

### Work package 07B.3 - Refill/reset handle

- Replace temporary development refill trigger with a reliable physical handle or control.
- Accept input only in appropriate phases, normally `COMPLETE`.
- Start the existing `REFILLING` sequence.
- Prevent the handle from clearing experiment history.
- Provide clear mechanical affordance and optional sound/haptic cue.

### Work package 07B.4 - Tear-off plot sheet

- Add a physical tab/grab region.
- Detect a deliberate pull gesture or simpler reliable equivalent.
- Animate removal of the current sheet.
- Clear the persisted experiment log at the defined commit point.
- Reveal a fresh blank sheet.
- Clear all static canonical jar summaries at the same commit point as the plot and persisted log.
- Prevent accidental clears from hover or minor movement.
- Provide an undo only if it can remain fully diegetic and simple; otherwise require a deliberate threshold and accept the clear as final.

### Work package 07B.5 - Data-consistency assertions

Add automated checks proving:

- gauge target maps from the captured band record;
- plot value maps from the same captured band record;
- persisted result equals the trial result;
- one completed trial adds exactly one point;
- refill adds no point;
- app restart restores the same plotted values;
- tear-off clear removes stored and visible points together.
- canonical completion updates exactly one matching jar once;
- odd-dose completion updates no jar while still updating the complete plot and log;
- restored canonical summaries reference the same completed results as persistence;
- history clearing removes plot points and canonical summaries together.

## Workstream 07C - Instrument layout and comprehension

### Work package 07C.1 - Layout and comprehension test

Test:

- dose marks visible while operating the control;
- phase indicator understandable without text overlay;
- tank remains the visual focus;
- gauge and plot are readable but not dominant;
- canonical jars read as preset summaries rather than complete history or six live experiments;
- refill and clear-log controls cannot be confused;
- a new visitor can complete a second trial after seeing the first result;
- players begin deliberately changing dose to seek a lower plotted result.

Use short observation sessions rather than explanatory tutorials.

## Workstream 07D - Treatment-result ghost recording and playback

The ghost library is a bounded comparison aid, not the complete experiment memory. The plot and experiment log still retain every completed trial; the library retains only a configured subset of recorded histories.

### Work package 07D.1 - App-owned fixed-rate recorder

- Observe the same authoritative relative optical-load band view as live presentation.
- Record at 10 Hz using simulation or application elapsed time, never render-frame count.
- Use fixed-capacity or otherwise bounded Float32 storage sized from the phase schedule and band count; do not allocate per sample.
- Preserve sample-major layout with exactly `sampleCount * bandCount` values.
- Capture band edges, phase timeline, endpoint result, seed, dose, raw-water config, simulation config hash, simulation version, and optical-proxy version.
- Finalize one candidate ghost from one completed trial without changing the completed result or simulation state.

### Work package 07D.2 - Schema and compatibility boundary

- Validate schema version, metadata, sample count, finite normalized values, band layout, sample rate, duration, and endpoint agreement before accepting a record.
- Classify records as directly compatible, tested-migration compatible, legacy-summary-only, or incompatible.
- Never silently compare ghosts with different optical-proxy versions, raw-water configuration, band layout, normalization, or materially different phase schedules.
- Preserve a result summary when safe even if full playback is unavailable.
- Treat corrupt or truncated data as recoverable application data failure, not a simulation failure.

### Work package 07D.3 - Measured small-library persistence

- Measure raw and serialized size using the actual version 1 trial duration and configured ghost limit.
- Reuse the existing localStorage path only when the measured library fits safely and writes do not noticeably block interaction.
- Adopt IndexedDB only if measured size or blocking writes establish a real need; do not create a generalized storage abstraction first.
- Start with straightforward Float32 serialization and no custom compression or quantization.
- Handle unavailable storage, quota failure, future schemas, and partial writes without silently losing the experiment log or live result.
- Offer explicit deletion or replacement when the configured limit is reached.
- Keep ghost deletion separate from plot/log clearing unless a clearly labeled, deliberately tested “clear all local data” action is later approved.

### Work package 07D.4 - Independent playback runtime

- Own play, pause, seek, reset, sample lookup, interpolation, phase labels, and endpoint handling in `/src/app`.
- Use bounded linear interpolation that returns exact recorded values at sample timestamps and never overshoots `[0, 1]`.
- Expose one read-only replay view for rendering and instrumentation.
- During pure ghost playback, do not advance the live simulation clock, mutate particles, consume simulation randomness, or emit a new trial result.
- During live-versus-ghost comparison, keep live and recorded states separate and validate compatibility first.

### Work package 07D.5 - Minimal library actions

- Route play, pause, seek/reset, selection, and delete through validated application commands.
- Keep the saved count small and the interaction subordinate to running a treatment trial.
- Provide clear compatibility, storage-full, deletion, and playback-ended states.
- Avoid a large searchable library, cloud account, or generalized file manager.

## Explicit non-goals

- No classroom lesson system.
- No floating UI panel.
- No calibrated NTU claim.
- No final plant environment.
- No spectator autoplay sequence.
- No charge-vision unless separately approved as optional work.
- No particle-level replay, replay by simulation recomputation, compression codec, cloud sync, WebAssembly rewrite, fixed-point math, or cross-device lockstep.

## Required tests and evidence

- gauge/plot/source-of-truth unit tests;
- canonical-summary exact-dose, odd-dose no-op, latest-result, restore, and clear tests;
- experiment-log schema and migration tests;
- localStorage failure handling;
- exactly-once append test;
- refill interaction smoke test;
- tear-off deliberate-clear test;
- session restart persistence test;
- 10 Hz recording-cadence and flat band-layout tests;
- ghost endpoint-agreement and metadata-validation tests;
- exact-sample, bounded-interpolation, pause, seek, reset, and playback-end tests;
- proof that playback does not advance or mutate the live simulation;
- current, migrated, legacy-summary, malformed, truncated, and incompatible record tests;
- measured serialized size, configured-library-limit, quota-failure, delete, and replacement evidence;
- supported-browser playback comparison within serialization/interpolation tolerance;
- Quest readability screenshots and interaction observations;
- performance metrics after adding all instruments.

## Review-agent checklist

- Does any instrument calculate its own optical load?
- Is fake precision introduced by labels or units?
- Can inherited data be cleared physically?
- Are the plot and log clearly the complete memory while jars remain static canonical summaries?
- Does any jar own a clock, moving particles, per-frame logic, or independent outcome?
- Can one trial create multiple points?
- Are refill and experiment-log clear separate actions?
- Does persistence stay outside `/sim`?
- Does the recorder consume the existing band authority rather than recalculate optical load?
- Can a corrupt or incompatible ghost fail without affecting the live trial or complete experiment log?
- Does playback remain application-owned and particle-free?
- Are saved ghosts clearly a limited comparison subset rather than complete history?
- Has instrument geometry added excessive draw calls or transparency?

## Acceptance criteria

- Physical dose marks, status indicator, gauge, nephelometer, plot, refill handle, and clear-sheet action are present.
- Every completed trial creates exactly one plotted/persisted result.
- The complete plot and experiment log retain every integer dose from 0 through 10.
- Exact canonical-dose completion updates one static matching jar once; odd-dose completion updates no jar.
- Canonical summaries rebuild from persisted completed results and clear with experiment history.
- Gauge, water appearance, recorded result, and plot agree through the band authority.
- Experiment data survives browser sessions.
- A completed trial can produce one validated 10 Hz treatment ghost whose final sample agrees with its completed result.
- A compatible ghost plays, pauses, seeks, resets, and ends deterministically without advancing or mutating the live simulation.
- Incompatible or corrupt ghosts are refused, migrated, or reduced to a clearly labeled legacy summary without silent reinterpretation.
- The measured small-library persistence path handles its configured limit and quota failure gracefully, with explicit delete or replacement behavior.
- A visitor can deliberately clear inherited data and receive a blank sheet.
- No software chrome is required to operate or understand the experiment.
- Players naturally begin searching for the minimum.

## Suggested tag and commit

- Commit: `feat: add instrumentation, persistence, and treatment-result ghosts`
- Accepted tag: `instrumentation-complete`

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
