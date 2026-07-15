# Batch 08 Implementation Plan: Headset Readability and Clearing-Front Refinement

**Status:** Not started — predecessor gates remain open
**Branch:** `batch-08-clearing-front`  
**Depends on:** Batch 07 accepted  
**May run in parallel with:** Recorded review, user comprehension testing, optional charge-vision spike  
**Primary gate:** At arm’s length in stereo, the player can see floc growth, falling floc, top-down clearing, and a final appearance consistent with the gauge while the Quest sustains the performance target.

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

Capture video or screenshots with build hash and config hash.

## Work package 08.2 - Turbidity-band count and smoothing

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
- whether smoothing applies only to display or also to recorded ghost history;
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
- sorting artifacts.

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

## Required tests and evidence

- pre/post dose-sweep comparison for every simulation-tuning change;
- assertion that display-only changes do not alter endpoint values;
- captured headset comparison matrix;
- comprehension-test notes;
- transparency/draw-call audit;
- Quest performance report;
- accepted final visual and simulation config in `docs/TUNING.md`.

## Review-agent checklist

- Is the clearing front derived directly from band data?
- Did display tuning accidentally alter the measured result?
- Are floc and haze both visible without excessive transparency?
- Is the optimum clearly better without misleading theatrics?
- Do gauge and endpoint appearance agree?
- Were user observations recorded rather than assumed?
- Does the target headset maintain 72 fps through worst-case moments?

## Acceptance criteria

- Clear water visibly progresses downward from the top in the headset.
- Floc visibly grows and settles below the clearing region.
- Low, optimum, and high remain distinguishable.
- Final tank appearance agrees with the gauge and plot result.
- Visuals remain legible from common standing/seated angles.
- One turbidity authority remains intact.
- Quest sustains the required performance target with documented metrics.

## Suggested tag and commit

- Commit: `refine: tune headset clearing front and floc readability`
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
