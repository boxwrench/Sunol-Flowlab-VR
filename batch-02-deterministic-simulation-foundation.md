# Batch 02 Implementation Plan: Deterministic Simulation Foundation

**Status:** Planned  
**Branch:** `batch-02-sim-core`  
**Depends on:** Batch 01A accepted  
**May run in parallel with:** Isolated XR shell planning, tests, benchmark work  
**Primary gate:** A headless, deterministic, allocation-conscious particle system supports mixing, neighbor queries, and pooled merging without React, Three.js, or XR dependencies.

## Goal

Build the reusable simulation substrate required for the desktop phenomenon proof. This batch creates mechanics infrastructure, not the final coagulation behavior.

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

## Proposed module map

Adjust names only after inspecting the repository:

```text
src/sim/
  config.ts
  types.ts
  rng.ts
  state.ts
  reset.ts
  fixedStep.ts
  pool.ts
  flowField.ts
  boundaries.ts
  spatialHash.ts
  collisions.ts
  merge.ts
  metrics.ts
  index.ts
  __tests__/
```

## Stable simulation interfaces

Define a small public API similar to:

```ts
interface Simulation {
  readonly state: SimulationState
  reset(seed: number): void
  step(dt: number): void
  setTimeScale(value: number): void
  getMetrics(): SimulationMetrics
}
```

Keep internals mutable and pooled for performance, but expose only controlled views or read-only references to consumers.

## Work package 02.1 - Particle-state layout

Create fixed-capacity storage for:

- position X/Y/Z;
- velocity X/Y/Z;
- diameter;
- mass;
- effective density;
- appearance/type category;
- active flag;
- merge tween metadata;
- optional stable particle ID for diagnostics.

Requirements:

- typed arrays or equivalent reusable storage;
- clear units or normalized coordinate conventions;
- no object-per-particle allocation in the hot path;
- capacity separate from active count;
- test helper for inspecting one particle without leaking implementation ownership to render code.

## Work package 02.2 - Pool and slot recycling

Implement:

- free-slot stack or equivalent pool;
- deterministic allocation order;
- activation and deactivation;
- reset without recreating all arrays;
- diagnostic counts for active, inactive, allocated, and recycled slots.

Tests:

- allocate to capacity;
- reject or safely report exhaustion;
- recycle a slot and reuse it deterministically;
- repeated merge/reset cycles do not increase allocation count.

## Work package 02.3 - Tank boundaries and initial water state

- Define a normalized tank volume.
- Initialize a configurable polydisperse raw-water population from a seed.
- Keep the default profile intentionally provisional.
- Implement stable boundary handling for all walls, floor, and open top.
- Avoid tunneling or explosive velocity correction.
- Add invariant checks for finite values and in-bounds positions.

Do not tune the final visual raw-water profile here.

## Work package 02.4 - Procedural mixing and fine-particle drift

Implement a cheap motion model with:

- deterministic procedural flow or analytic circulation;
- configurable mix intensity;
- low-amplitude Brownian-like drift for fine particles;
- phase-independent hooks so Batch 3 can later vary motion by treatment phase;
- one global time-scale multiplier rather than unrelated force multipliers.

Tests:

- zero intensity results in no flow-field acceleration;
- same seed/config produces the same trajectory metrics;
- velocity remains capped or stable over long runs;
- no per-particle random generator allocation.

## Work package 02.5 - Uniform spatial hash

Implement a uniform grid appropriate to the tank and sticky-radius scale:

- configurable cell size;
- reusable head/next arrays or preallocated cell lists;
- deterministic rebuild;
- neighbor traversal over the current and adjacent cells as required;
- no all-pairs fallback in production code;
- metrics for cells used, candidates examined, and neighbor checks.

Tests:

- neighbors in same and adjacent cells are found;
- distant particles are excluded;
- boundary cells behave correctly;
- duplicate pair processing is prevented or explicitly controlled;
- candidate count scales substantially below all-pairs for 500 particles.

## Work package 02.6 - Collision eligibility and pooled merge primitive

Implement a general merge primitive without the final dose-dependent probability:

- detect eligible proximity events;
- determine one survivor and one recycled slot deterministically;
- transfer mass immediately;
- compute mass-weighted position and velocity correctly;
- calculate target diameter with a documented phenomenological mapping;
- store merge tween start/target/time metadata;
- recycle the freed slot immediately;
- cap diameter using a provisional config value;
- update effective density through a hook that Batch 3 can tune.

Do not add electrostatic forces or final collision efficiency yet.

Tests:

- mass conserved within tolerance;
- momentum-like weighted velocity behaves as intended;
- active count drops by one;
- slot is immediately reusable;
- no duplicate merge of an inactive particle;
- repeated merges stay finite and within caps.

## Work package 02.7 - Headless benchmark and allocation audit

Create a benchmark entry point that can run without rendering:

- reset 500 particles;
- execute a fixed number of steps;
- report total time, average step time, p95 step time, neighbor checks, active count, and allocations observed;
- support accelerated stepping much faster than wall-clock time;
- output machine-readable JSON for later regression use.

Run long enough to expose pool exhaustion, numeric instability, or memory growth.

## Work package 02.8 - Documentation

Update:

- `docs/DECISIONS.md` with state-layout and spatial-hash choices;
- `README.md` with headless test/benchmark commands;
- `docs/PERFORMANCE.md` with desktop benchmark machine details;
- code comments only where they preserve non-obvious invariants.

## Explicit non-goals

- No dose-dependent sticking probability.
- No rapid-mix/flocculation/settling phases.
- No turbidity bands.
- No gradient quad.
- No XR code.
- No gauges, plots, or persistence.
- No real CFD, strict Stokes solver, electrostatics, breakup, or shear model.

## Required tests

- deterministic initialization and stepping;
- pool lifecycle and exhaustion;
- boundary invariants;
- spatial-hash correctness and pair uniqueness;
- merge mass conservation and slot recycling;
- no `NaN`/infinite values in long headless runs;
- import-boundary test proving `/sim` has no React, Three.js, or XR dependencies;
- benchmark output schema test.

## Review-agent checklist

- Is there any hidden all-pairs neighbor path?
- Are particle objects allocated inside the frame loop?
- Are random values reproducible and centralized?
- Does the renderer need to know simulation internals it should not own?
- Is merge animation visual metadata separated from mass transfer timing?
- Can the simulation step faster than real time without a browser?
- Has final treatment tuning leaked into this infrastructure batch?

## Acceptance criteria

- Headless runs are deterministic.
- Particle state remains outside React and rendering.
- Mixing and drift work without numeric instability.
- Spatial hash replaces all-pairs neighbor search.
- Merges conserve configured quantities and recycle slots immediately.
- Benchmark shows no unbounded memory growth and records hot-path metrics.
- The simulation is ready for Batch 3 to add dose, settling, turbidity, and tuning without architectural rewrites.

## Suggested commit

`feat(sim): add deterministic pooled particle foundation`

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
