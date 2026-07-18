# Batch 08 Implementation Plan: Headset Readability and Clearing-Front Refinement

**Status:** Not started — predecessor gates remain open
**Depends on:** Batch 07 accepted  
**May run in parallel with:** Recorded review, user comprehension testing, optional charge-vision spike  
**Primary gate:** At arm’s length in stereo, the player can see floc growth, falling floc, top-down clearing, a final appearance consistent with the gauge, and a subordinate compatible prior-result ghost while the Quest sustains the performance target.

> This batch must also follow [the hybrid jar-test design direction](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md). The design brief governs product intent and presentation meaning; this batch remains authoritative for timing, scope, tests, evidence, and acceptance.

> The clearing front and every clarity display remain transforms of the relative optical-load bands governed by [the modeling research amendment](docs/MODELING_RESEARCH_AMENDMENT.md). Visual smoothing and exaggeration cannot alter the authoritative process record.

> Treatment-ghost visuals consume the app-owned read-only replay view governed by [the ghost replay design](docs/GHOST_REPLAY_DESIGN.md). They remain subordinate to the active trial and never introduce ghost particles or duplicate physics.

## Goal

Tune the already-correct treatment loop for visual comprehension in the real headset. This batch may change display transforms and accepted simulation tuning only through controlled regression review.

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

## Change-control rule

Separate tuning into two categories:

1. **Simulation tuning:** changes endpoint behavior, sweep curve, aggregation, or settling. Requires rerunning the complete regression contract and approving a new baseline if intentional.
2. **Display tuning:** changes shader color/alpha, scale, smoothing, or camera-independent visual mapping while consuming the same band authority. Must not change recorded results.

Every change must be labeled as one category before implementation.

## Work package 08.1 - Establish a headset comparison matrix

Create a repeatable test matrix covering:

- underdose, optimum, overdose;
- front/profile, quarter, and slightly elevated viewing angles;
- seated and standing eye heights;
- early flocculation, late flocculation, early settling, endpoint;
- bright and dim scene-lighting variants if relevant;
- clean experiment sheet and partially populated plot.
- empty and populated static canonical jar summaries;
- hero-tank dominance with the full six-jar rack visible.

Capture video or screenshots with build hash and config hash.

Produce one clean portfolio-ready hero still and one short representative motion
clip from the accepted build for later Batch 09 README and repository use. Keep
the exports compact, provenance-recorded, and free of development metrics; do
not publish an obsolete intermediate visual merely to fill the README.

## Work package 08.2 - Optical-load band count and smoothing

Evaluate the existing 12-16 band range:

- visible banding artifacts;
- shader uniform/update cost;
- clearing-front crispness;
- latency between particle movement and visual response;
- stereo consistency.

Choose and document:

- final band count;
- vertical interpolation method;
- temporal smoothing method and time constant;
- keep temporal smoothing display-only; the 10 Hz ghost recorder stores authoritative unsmoothed band samples and identifies their optical-proxy version;
- behavior during refill/reset.

Do not add layered translucent meshes.

## Work package 08.3 - Visual response mapping

Tune display-only transforms for:

- clear-water color;
- turbid-water color;
- alpha/opacity curve;
- nonlinear concentration response;
- top-band readability;
- contrast with floc particles;
- contrast with instrument labels and background.

Gauge and plot numeric mapping may differ in scale but must preserve ordering and derive from the same data.

Canonical jar summaries use their documented completed-result transform and remain static. Display tuning must not turn them into live process views or make them compete with the hero tank.

## Work package 08.4 - Clearing-front legibility

Refine the top-down read by testing:

- threshold definition for diagnostic front depth;
- temporal smoothing that avoids flicker without lagging too far;
- visual gradient width;
- whether the upper clear region reads from all common angles;
- whether falling floc remains visible below the front;
- endpoint timing relative to the front position.

Avoid a separate animated front object that can disagree with the band data.

## Work package 08.5 - Particle and floc visual scale

Tune:

- fine-particle visible size;
- floc diameter display mapping;
- merge tween duration;
- floc material/shape categories;
- brightness or color cues that improve readability without implying literal chemistry;
- maximum visible floc size.

Keep the physical particle count at 500 unless profiling and a written decision justify a controlled increase.

## Work package 08.6 - Transparency reduction

Audit:

- tank wall opacity and thickness;
- quad placement;
- particle material transparency;
- detector/beam effects;
- overlapping instrument glass;
- stacked canonical jar walls and jar-summary gradients;
- sorting artifacts.

Record the number and worst overlap of transparent surfaces during each
expensive phase. Treat additional transparent layers and any increase above 500
particles as measurement-gated changes, not default polish.

Simplification order when performance or clarity fails:

1. remove decorative transparent layers;
2. make particles opaque or nearly opaque;
3. reduce tank wall coverage or opacity;
4. simplify beam effect;
5. reduce background competition;
6. only then consider deeper shader changes.

## Work package 08.7 - Structured comprehension testing

Use two audiences:

- operator-informed reviewer;
- non-operator portfolio viewer.

Ask them, without prior explanation:

- Which run worked best?
- What changed inside the tank?
- Did clear water move from the top downward?
- Did larger floc settle faster?
- Did the gauge result agree with the appearance?
- Was any instrument hard to read or visually competing?

Record findings and changes in `docs/TUNING.md`.

## Work package 08.8 - Formal Quest profiling gate

Capture final Batch 8 metrics on the target headset through the most expensive visible moments:

- high merge rate during flocculation;
- many active particles plus cloudy quad;
- settling with instruments visible;
- measurement event;
- refill/reset.

Record average and p95 frame time, simulation time, instance upload, draw calls, heap trend, particle count, and texture memory estimate.

## Work package 08.9 - Treatment-ghost visual comparison

- Consume only the app-owned read-only replay view accepted in Batch 07.
- Test a restrained secondary water-gradient overlay, prior clearing-front marker, ghost gauge trace, previous-result plot line, and phase markers; keep only the smallest combination that improves comparison.
- Keep the active trial visually primary through opacity, line weight, color, and spatial hierarchy.
- Label incompatible raw-water, optical-proxy, band, normalization, or phase configurations instead of presenting an equal-condition comparison.
- Do not show ghost particles, collision events, floc shapes, settling snowfall, or a second live tank.
- Verify that visual interpolation agrees with the replay runtime at sample timestamps and remains bounded between them.
- Profile the worst live-plus-ghost comparison moment on Quest and remove optional layers before increasing render complexity.
- Test whether an operator-informed reviewer and a non-operator understand that the ghost is a previous recorded result rather than a second live simulation.

## Optional contained spike - Charge vision

May begin only if core tuning is stable:

- consumes existing dose/collision state;
- physical toggle only;
- visual halos or color categories only;
- no second chemistry model;
- disabled by default if it harms clarity or performance.

It is not required for this batch to pass.

## Explicit non-goals

- No plant environment art pass.
- No spectator storyboard implementation.
- No new treatment variables.
- No extra transparent water spectacle.
- No particle-count escalation as the first solution.
- No independent clearing-front animation.
- No particle-level ghost, duplicate simulation, replay recomputation, or visually dominant previous-run overlay.

## Required tests and evidence

- pre/post dose-sweep comparison for every simulation-tuning change;
- assertion that display-only changes do not alter endpoint values;
- captured headset comparison matrix;
- accepted portfolio-ready hero still and short motion source with build/config
  identity;
- comprehension-test notes;
- transparency/draw-call audit;
- Quest performance report;
- live-plus-ghost Quest cost and draw/transparent-layer audit;
- compatible, incompatible, paused, sought, endpoint, and playback-ended ghost screenshots;
- reviewer evidence that the previous-run comparison is understood without implying a second live simulation;
- accepted final visual and simulation config in `docs/TUNING.md`.

## Review-agent checklist

- Is the clearing front derived directly from band data?
- Did display tuning accidentally alter the measured result?
- Are floc and haze both visible without excessive transparency?
- Is the optimum clearly better without misleading theatrics?
- Do gauge and endpoint appearance agree?
- Do the jars read as canonical preset summaries rather than complete history or six live simulations?
- Does the hero tank remain the most readable and compelling element?
- Were user observations recorded rather than assumed?
- Does the target headset maintain 72 fps through worst-case moments?
- Is the ghost visibly subordinate, compatible when compared, and sourced only from the app-owned replay view?

## Acceptance criteria

- Clear water visibly progresses downward from the top in the headset.
- Floc visibly grows and settles below the clearing region.
- Low, optimum, and high remain distinguishable.
- Final tank appearance agrees with the gauge and plot result.
- Static canonical jar summaries agree with their completed results without obscuring the complete plot.
- The hero tank remains visually dominant and the jars read as presets, not complete memory.
- Visuals remain legible from common standing/seated angles.
- One relative optical-load authority remains intact.
- A compatible treatment ghost makes prior clearing and result progression comparable without ghost particles, duplicate physics, or live-state mutation.
- Reviewers distinguish the recorded previous result from the active simulation, and incompatible comparisons are labeled rather than implied.
- Quest sustains the required performance target with documented metrics.

## Suggested tag and commit

- Commit: `refine: tune headset clearing, floc, and ghost readability`
- Accepted tag: `headset-readability-proven`

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
