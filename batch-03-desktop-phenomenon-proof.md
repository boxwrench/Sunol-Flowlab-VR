# Batch 03 Implementation Plan: Desktop Phenomenon Proof

**Status:** Workstream 03D technically accepted; replacement-model Quest gate passed; external human gates open
**Depends on:** Batch 02A accepted; Batch 00 regression and visual contracts available  
**Primary gate:** The approved mass-authoritative model produces a deterministic, population-healthy U-shaped response whose low, near-optimal, and high outcomes remain visibly distinct in the retained desktop apparatus.

This plan is governed by:

- [the hybrid jar-test design direction](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md) for product meaning and presentation;
- [the modeling research amendment](docs/MODELING_RESEARCH_AMENDMENT.md) for final version 1 process behavior;
- [the regression contract](docs/REGRESSION_CONTRACT.md) for numerical acceptance;
- [the ghost replay design](docs/GHOST_REPLAY_DESIGN.md) only for the read-only samples a later app-owned recorder will consume.

The original pre-research Batch 03 mechanics plan is preserved in Git history, not as parallel active guidance.

## Goal

Replace the accepted Batch 02A statistical substrate with the smallest deterministic, mass-conserving representative-particle model that preserves the educational lesson and the proven presentation:

```text
relative dose
    ↓
effective sticking
    ↓
aggregate growth
    ↓
size-dependent settling
    ↓
relative optical-load removal
    ↓
underdose–optimum–overdose comparison
```

This remains a phenomenological teaching model. It does not predict real dose, NTU, chemistry, or plant performance.

## Current baseline

The retained presentation baseline includes:

- one independently runnable desktop proof;
- one dominant hero observation tank;
- one read-only band-driven gradient surface;
- one table-mounted rack of six open rectangular canonical jars;
- deterministic low, optimum, and high development presets;
- clearing-front diagnostics from the authoritative band record;
- one unlabeled proof route and randomized review packet;
- accepted project-owner operator composition feedback and short Quest evidence.

[The Batch 03 progress packet](docs/BATCH_03_PROGRESS.md) records that evidence. It is comparison evidence for the pre-03D model, not acceptance of the final version 1 process behavior.

The external apparatus-recognition and blinded low/optimum/high reviews remain
required. Workstream 03D replacement captures are now ready, so those reviews
may resume; the old outcome captures cannot accept changed process behavior.

## Execution rules

- Preserve `/src/app`, `/src/sim`, `/src/render`, and `/src/xr` ownership boundaries.
- Keep simulation state, stepping, optical-load calculation, and headless sweeps outside React and rendering.
- Preserve fixed timestep, seeded randomness, reset-in-place storage, stable ordering, and the 500-particle target.
- Make one bounded implementation change at a time and run the canonical sweep after every behavior change.
- Tune one parameter group at a time; commit accepted configuration in source, not browser storage.
- Keep the desktop proof runnable without a headset.
- Preserve the hero tank as the only live process view and the six jars as static geometry in this batch.
- Do not start Batch 04 or later simulation integration until this batch passes.

## Workstream 03D - Approved version 1 model refinement

### Work package 03D.1 - Authoritative mass and derived diameter - complete

- Add fixed-capacity mass and diameter arrays to authoritative particle state.
- Make mass authoritative and derive cached diameter from mass with default `Df = 2.0`.
- Enforce finite positive mass and diameter consistency within a documented tolerance.
- Keep simulation diameter, collision radius, and rendered radius separate.
- Preserve deterministic seeded initialization and reset arrays in place.
- Keep consumed slots inactive until reset; version 1 has no free list.

Required tests:

- deterministic initialization and reset;
- mass/diameter invariants;
- finite state and inactive-slot behavior;
- no new simulation-to-UI dependency or hot-step allocation.

### Work package 03D.2 - Deterministic encounters and merges - complete

- Precompute the eleven dose-efficiency values outside the hot loop.
- Traverse particles and candidate pairs in stable order and prevent duplicate pair evaluation.
- Select the surviving slot deterministically.
- Conserve mass and use mass-weighted velocity for every successful merge.
- Base collision distance on authoritative aggregate radii plus one normalized interaction multiplier.
- Use the simplest allocation-free encounter traversal that meets the 500-particle budget.
- Add spatial hashing only when profiling shows pair evaluation is a material cost and prove that it preserves results.

Required tests:

- deterministic pair ordering and merge history or digest;
- total mass conservation;
- consumed-slot deactivation;
- mass-weighted velocity;
- identical supported inputs produce identical active state and endpoint bands.

### Work package 03D.3 - Fractal settling and growth bound - complete

- Derive effective excess density and capped settling from mass-derived diameter.
- Use the default `Df = 2.0` simplified path, with settling approximately linear in diameter after constants are combined.
- Require larger active aggregates generally to settle faster while remaining bounded.
- Select and document a maximum mass or diameter through deterministic and visual evidence.
- Treat the limit as merge prohibition, not fragmentation or a claimed breakage model.
- Keep rendered porosity, irregularity, softness, and size exaggeration non-authoritative.

Required tests:

- monotonic size/settling relationship before the cap;
- growth-bound behavior;
- no mass loss at settlement;
- no invalid positions, velocities, masses, or diameters after at least 10,000 fixed steps.

### Work package 03D.4 - Relative optical-load authority - complete

- Replace the Batch 02A unresolved-fines blend with suspended projected simulation area, `sum(D^2)`, normalized to the trial's initial load.
- Produce one reusable vertical band record and distinguish whole-tank, banded, and local sample-zone values.
- Derive the clearing front, endpoint, water appearance, future instruments, plot, persistence, jars, and replay samples from that record only.
- Migrate source and forward contract identifiers from legacy turbidity naming to relative optical load in one coordinated change.
- Keep display transforms read-only and label the result as relative optical load, normalized haze, relative clarity, or treatment result—not NTU.
- Expose authoritative samples for the later app-owned 10 Hz ghost recorder; do not record, serialize, or play ghosts in `/src/sim`.

Required tests:

- finite normalized bands and deterministic reset;
- aggregation-only whole-tank conservation with settling disabled at `Df = 2.0`;
- expected pre-settling direction for at least one non-default fractal dimension;
- local transport can change bands without changing the whole-tank authority;
- renderer and app code contain no second process calculation.

### Work package 03D.5 - Population health, dose sweep, and performance - complete

- Record active, suspended, and settled counts; mean and maximum mass; maximum diameter; largest-mass fraction; and visible suspended-floc count during settling.
- Select the largest-mass fraction bound through deterministic and visual testing.
- Run the canonical and nine-seed 11-dose suites from identical raw water.
- Preserve one principal basin near Dose 5, worse low/high tails, order independence, and reset purity.
- Compare curve shape, timing, population health, runtime, allocations, and visible behavior with the immutable Batch 02A baseline.
- Benchmark the complete 500-particle production path before adding spatial hashing or increasing particle count.
- Commit the accepted config and a new config hash without overwriting the Batch 02A evidence packet.

Required evidence:

- canonical and nine-seed tables;
- side-by-side old/new curve summary;
- population-health summary;
- benchmark and allocation audit;
- low/optimum/high desktop captures from identical framing;
- desktop browser state and console inspection.

## Presentation retention and human validation

After the model passes scientific and numerical gates:

1. reconnect it to the existing read-only particle and optical-load presentation;
2. verify the table, rectangular jars, hero-tank hierarchy, proof route, and clearing-front diagnostics remain intact;
3. regenerate randomized low/optimum/high review captures;
4. run the apparatus-recognition protocol with at least one external water-treatment operator or educator and preferably one non-operator;
5. run the blinded outcome comparison with an operator-informed reviewer and a non-operator;
6. record responses in [UX_VALIDATION.md](docs/UX_VALIDATION.md).

If scientific behavior is correct but differences are hard to see, adjust render-size exaggeration, visual morphology, optical mapping, phase pacing, or camera composition before increasing model complexity or particle count.

## Stop conditions

Stop before Batch 04 when any of the following is true:

- mass is not conserved or cached diameter can drift from mass;
- deterministic reset, stable ordering, or the permanent dose sweep fails;
- one aggregate collapses the visible population;
- the numerical curve passes but the optimum is not visibly better;
- a renderer-only effect creates or changes the treatment outcome;
- performance problems are hidden by desktop-only testing;
- terminology implies calibrated NTU, real coagulant dose, mechanistic charge reversal, or plant prediction.

## Explicit non-goals

- No XR controls or final treatment-cycle state machine.
- No physical gauge, plot, persistence, or canonical jar summaries.
- No treatment-ghost recorder, library, playback clock, or replay renderer.
- No live jar simulations or multiple live tanks.
- No free list, fragmentation, regrowth, hindered settling, population-balance authority, CFD, or universal engine.
- No spatial hash without a recorded bottleneck.
- No particle-count increase above 500 without measured need and Quest evidence.
- No cross-device lockstep, replay by recomputation, WebAssembly rewrite, or fixed-point math.

## Acceptance criteria

- The mass-authoritative model passes every Workstream 03D invariant and replacement gate in `docs/REGRESSION_CONTRACT.md`.
- Low, optimum, and high trials begin from identical raw water and remain numerically and visibly distinct.
- One relative optical-load band record drives all process outputs.
- The accepted 500-particle path meets the documented runtime and allocation budget.
- The desktop proof remains independently runnable and the Quest apparatus retains its accepted placement and hierarchy.
- External recognition and blinded outcome responses are recorded after replacement captures are generated.
- No unresolved model, presentation, terminology, or performance issue would make Batch 04 or later XR integration ambiguous.

## Closing packet

The [Workstream 03D technical acceptance packet](docs/BATCH_03_03D_TECHNICAL_ACCEPTANCE.md)
records changed behavior, commands and results, old/new sweep evidence,
population metrics, desktop performance, allocations, limitations, captures,
and the open external gates. Do not create the final Batch 03 accepted tag until
the external human gates are recorded.
