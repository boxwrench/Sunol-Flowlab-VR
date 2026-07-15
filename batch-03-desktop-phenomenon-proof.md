# Batch 03 Implementation Plan: Desktop Phenomenon Proof

**Status:** In progress — presentation slice implemented; human review gates open  
**Branch:** `batch-03-desktop-proof`  
**Depends on:** Batch 02 accepted; Batch 00 regression and visual contracts available  
**May run in parallel with:** Batch 04 in an isolated worktree  
**Primary gate:** Low, near-optimal, and high dose outcomes are numerically U-shaped and visibly distinct on desktop before any XR integration begins.

> This batch must also follow [the hybrid jar-test design direction](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md). The design brief governs product intent and presentation meaning; this batch remains authoritative for timing, scope, tests, evidence, and acceptance.

## Goal

Prove the product’s central teaching claim using a deterministic desktop prototype: dose changes collision success, floc grows, larger floc settles faster, and too little or too much dose leaves worse residual turbidity.

This is the largest product-risk batch. Tuning is the work, not cleanup after the work.

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

## Workstream 03A - Treatment mechanics

### Work package 03A.1 - Dose model

- Add `DoseIndex` input restricted to integers `0..10`.
- Map detent index to normalized model dose through one explicit function.
- Implement configured optimum and dose window.
- Implement bell-shaped collision efficiency, starting with:

```ts
const error = (dose - optimumDose) / doseWindow
const collisionEfficiency = Math.exp(-(error * error))
```

- Route all merge probability through one deterministic PRNG sequence.
- Expose collision efficiency for diagnostics and optional future charge vision.
- Do not add literal electrostatic forces.

Tests:

- efficiency peaks at configured optimum;
- symmetric behavior when configured symmetrically;
- valid bounds from 0 to 1;
- only integer detents enter trial state;
- same seed and dose reproduce merge statistics.

### Work package 03A.2 - Treatment phase motion presets

Add desktop-development phase controls for:

- rapid mix: short, energetic circulation;
- flocculation: slower, collision-promoting motion;
- settling: reduced lateral motion plus gravity/settling;
- ready/reset state.

This is not yet the full Batch 6 state machine. It may be a simple development runner that executes phases in sequence for a trial.

### Work package 03A.3 - Stokes-inspired settling

Implement phenomenological settling based on the size-squared insight:

- downward velocity scales with diameter squared and effective density difference;
- maximum settling velocity cap;
- mild drag;
- effective density decreases as floc grows;
- maximum diameter cap;
- boundary handling at tank floor;
- settled material no longer contributes like suspended fine mass.

Tests:

- larger otherwise-equal particles settle faster;
- cap prevents explosive motion;
- effective density remains valid;
- fine particles remain suspended long enough to preserve underdose haze;
- no claim or unit implies calibrated plant prediction.

### Work package 03A.4 - Three comparison trial presets

Create development presets for:

- underdose;
- near-optimum dose;
- overdose.

Presets must use the same raw-water seed, temperature/default viscosity, durations, and measurement endpoint. Only dose differs.

## Workstream 03B - Turbidity authority and rendering

### Work package 03B.1 - Turbidity-band calculation

- Divide the tank into 12-16 horizontal bands.
- Calculate suspended concentration by band.
- Use size weighting that emphasizes fine suspended particles and avoids counting settled large floc as equivalent haze.
- Define a normalized internal turbidity range.
- Record band history at a configurable low frequency suitable for later ghost replay.
- Add a fixed sample-zone or weighted upper-column endpoint metric.

Requirements:

- this band record is the only process authority;
- no renderer, gauge, plot, or score may calculate its own turbidity;
- visual transforms may differ from measurement transforms but consume the same record.

### Work package 03B.2 - Gradient turbidity quad

- Add one shader-driven gradient quad behind the tank.
- Upload one small band-value uniform array or tiny texture.
- Interpolate between bands.
- Provide configurable color and nonlinear alpha response.
- Avoid 12-16 stacked transparent meshes.
- Keep particles visible as events while the quad supplies cloudiness and the clearing front.

### Work package 03B.3 - Minimal desktop tank and camera

- Add only enough tank geometry to judge the phenomenon.
- Use thin, open-topped walls and restrained transparency.
- Provide a stable profile/quarter camera that makes the clearing front visible.
- Keep the desktop proof independently runnable after later XR work.

### Work package 03B.4 - Clearing-front diagnostics

Derive diagnostic values from the band record:

- top clear fraction;
- depth at which clarity crosses a threshold;
- time to a configured upper-band clarity target;
- endpoint upper-zone turbidity.

Use these for testing and tuning, not as a second process model.

### Work package 03B.5 - Hybrid apparatus blockout and recognition validation

- Block out one visually dominant hero observation tank and one recognizable six-jar rack.
- Treat the rack as static canonical preset geometry for doses 0, 2, 4, 6, 8, and 10.
- Preserve all eleven integer dose values through the primary control; do not imply the jars contain complete history.
- Keep the mounted plot reserved as the complete visual memory for all doses in Batch 07.
- Do not create six live simulations, moving jar particles, or jar-owned turbidity.
- Capture one unlabeled screenshot once the composition reads clearly.
- Show it to at least one water-treatment operator or educator and preferably one non-operator before instrumentation is finalized.
- Ask what the apparatus represents and what they expect to do before explaining the project.
- Record responses in docs/UX_VALIDATION.md.
- Reconsider the composition if the jar-test connection, comparative-experiment purpose, hero-tank dominance, or one-live-simulation relationship is unclear.

The canonical jars may remain static unfilled geometry throughout this batch. Static write-on-completion summaries arrive in Batch 07.

## Workstream 03C - Tuning and permanent regression harness

### Work package 03C.1 - Development-only tuning panel

Expose at least:

- optimum dose;
- dose window;
- collision-efficiency shape parameter if retained;
- sticky radius;
- mix intensity by phase;
- phase duration for development trials;
- settling multiplier;
- maximum settling velocity;
- maximum floc diameter;
- density falloff with growth;
- turbidity size weighting;
- visual alpha/color response;
- global time scale.

Requirements:

- dev flag only;
- config can be exported/imported as JSON;
- accepted settings are committed to a normal config file, not hidden in browser storage;
- changing a setting cannot bypass integer dose detents.

### Work package 03C.2 - Headless 11-dose sweep

Build a renderer-free sweep that:

1. resets identical raw water;
2. runs all 11 doses through the same phase schedule;
3. measures at the same endpoint;
4. outputs endpoint turbidity and compact band-history metrics;
5. reports minimum index, tail margins, basin depth, local reversals, execution time, and validity checks;
6. writes a failure artifact when contract assertions fail.

### Work package 03C.3 - Regression assertions

Implement the contract defined in Batch 00. At minimum:

- minimum near configured optimum;
- both extremes worse by an approved margin;
- one principal basin with limited noise;
- deterministic repeatability within tolerance;
- reset purity/no hysteresis;
- all results finite and in range;
- runtime below ceiling;
- optimum clears upper bands earlier or more strongly than both extremes.

Use a canonical seed for fast tests and a small seed corpus for extended validation.

### Work package 03C.4 - Visual tuning protocol

Use a repeatable comparison process:

- capture low, optimum, and high runs with the same camera and duration;
- review side by side;
- have at least one operator-informed reviewer and one non-operator reviewer answer a short rubric;
- record whether they can identify the best run without seeing the dose label or plot;
- record which cues made the difference: floc size, snowfall, clearing front, or endpoint haze;
- tune one parameter group at a time and preserve accepted configs.

Do not allow two agents to tune constants independently.

### Work package 03C.5 - Preserve the desktop artifact

- Add a stable route or mode for the Phase 1 desktop proof.
- Ensure it does not depend on a headset.
- Keep the three comparison trial presets and sweep visualization accessible in development.
- Document how to run and record it.

## Stop conditions

Stop and do not proceed to Batch 5 when any of the following is true:

- the numeric curve passes but the optimum does not visibly look better;
- underdose or overdose becomes visually better through a separate renderer-only trick not reflected in the band authority;
- deterministic reset is broken;
- tuning requires more particles rather than a better turbidity layer;
- the model begins claiming calibrated NTU or real alum dose;
- performance problems are hidden by testing only on a powerful desktop.

## Explicit non-goals

- No XR controls.
- No final treatment state machine.
- No physical gauge or plot board.
- No localStorage.
- No plant environment.
- No temperature control, breakup, or short-circuiting.
- No live jar simulations or canonical jar summaries; the six-jar rack is recognition blockout geometry only.
- No particle-count increase above 500 without a documented reason.

## Required tests and evidence

- unit tests for dose efficiency and settling relationships;
- deterministic trial test;
- 11-dose sweep fast suite;
- extended seed-corpus sweep;
- reset/hysteresis test;
- band-authority tests;
- shader or rendering smoke test;
- exported accepted config;
- curve artifact committed or attached to the acceptance packet;
- three comparable video or screenshot sequences;
- unlabeled hybrid-apparatus screenshot and recognition responses in docs/UX_VALIDATION.md;
- desktop performance metrics and remaining allocations.

## Review-agent checklist

- Is the U-shape caused by the simulation rather than a plot-only transformation?
- Do all turbidity consumers derive from one band record?
- Does large floc settle faster for the intended reason?
- Are visual cues plausible and legible rather than theatrically misleading?
- Is the desktop proof still independent of XR?
- Did any future chemistry or instrument feature slip in?
- Can the full sweep run headlessly after every simulation change?

## Acceptance criteria

- The U-shaped sweep passes the approved numerical contract.
- Same seed and dose reproduce comparable results.
- Low, optimum, and high runs begin from identical raw water.
- An uninformed observer can identify the optimum run without reading an explanation.
- A water-treatment operator or educator recognizes the jar-test connection from an unlabeled screenshot, and a non-operator is sought to validate comparative-experiment comprehension.
- The hero tank remains visually dominant and viewers do not mistake the jars for six simultaneous simulations or complete history.
- Clear water visibly progresses downward in the optimum case.
- The desktop proof remains runnable independently.
- One turbidity-band record drives all current outputs.
- No unresolved model or rendering issue would make XR integration ambiguous.

## Suggested tag and commit

- Commit: `feat(sim): prove desktop coagulation dose response`
- Accepted tag: `desktop-phenomenon-proven`

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
