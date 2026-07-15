# Batch 02 Implementation Plan: Minimum Phenomenon Substrate

**Status:** Batch 02A accepted — Batch 02B deferred pending evidence  
**Branch:** `batch-02-phenomenon-substrate`  
**Depends on:** Batch 01A accepted, including the uninterrupted rendered observation  
**May run in parallel with:** Isolated XR shell planning and review only  
**Primary gate:** A deterministic 11-dose headless sweep demonstrates a clear underdose–optimum–overdose response with the least mechanics required to make that lesson visible.

## Goal

Prove the educational phenomenon before building generalized particle mechanics. Batch 02A adds only the state and behavior needed to produce and visualize a deterministic U-shaped treatment response. Batch 02B is conditional performance work and is authorized only by measurements from the working phenomenon proof.

This plan follows the product boundary in `CLAUDE.md`: do not build a universal FlowLab engine before a second process module ships.

## Agent execution rules

- Read `CLAUDE.md`, the current repository tree, `package.json`, and relevant tests before proposing edits.
- Preserve the `/sim`, `/render`, `/xr`, and `/app` ownership boundaries.
- `src/app/SimulationRuntime.ts` owns state and clock lifecycle. Rendering receives read-only simulation views.
- Keep hot simulation state outside React and preserve fixed-step determinism, seeded randomness, and fixed-capacity storage.
- Add one behavior at a time with renderer-free tests and a measurable educational purpose.
- Do not add generalized collision infrastructure without benchmark evidence that the simpler model is insufficient.
- Do not mark the batch complete until the 11-dose regression contract has objective evidence.

## Batch 02A — Minimum phenomenon substrate

### Work package 02A.1 — Minimum particle state

Extend the existing fixed-capacity typed-array state only with fields required by the phenomenon:

- representative particle or floc size;
- suspended or settled state;
- the minimum stable diagnostic values needed by the sweep.

Keep units or normalized conventions explicit. Do not add effective density, stable IDs, merge tween metadata, or object-per-particle state unless a later measured need justifies them.

### Work package 02A.2 — Deterministic dose efficiency

Add a small, explicit phenomenological mapping from dose detents 0 through 10 to treatment effectiveness:

- optimum centered at the configured detent;
- poorer effectiveness at underdose and overdose;
- deterministic results for identical seed, dose, config, and timestep;
- no claim of calibrated chemistry or operating guidance.

The mapping must live in `src/sim`, be configurable, and remain independent of presentation.

### Work package 02A.3 — Simplified aggregation and settling

Implement the simplest bounded mechanics that make the lesson visible:

- deterministic floc growth or representative aggregation;
- dose-dependent growth effectiveness;
- settling behavior tied to representative size;
- suspended/settled transitions that remain finite and stable;
- no all-pairs collision system unless the phenomenon cannot be demonstrated without it.

An aggregate may be represented statistically or by deterministic local rules. Physical fidelity is subordinate to clear, consistent educational behavior.

### Work package 02A.4 — Authoritative turbidity bands

Produce the single normalized horizontal-band record defined in `docs/CONTRACTS.md`. The same record must be ready to drive water appearance, clearing front, instruments, scoring, plots, persistence, and replay in later batches.

Tests must prove:

- all values are finite and in `[0, 1]`;
- identical reset inputs reproduce identical bands;
- prior trials cannot affect a later reset;
- rendering does not calculate a second treatment outcome.

### Work package 02A.5 — Permanent 11-dose sweep

Implement the renderer-free sweep in `docs/REGRESSION_CONTRACT.md`:

- detents 0 through 10 from identical raw water;
- canonical seed on every commit;
- extended nine-seed suite before accepting behavior tuning;
- order independence and reset purity;
- machine-readable failure output;
- a compact human-readable curve or table for review.

The first accepted baseline must visibly and numerically demonstrate the principal U-shaped basin before XR integration continues.

### Work package 02A.6 — Evidence and documentation

Record:

- exact config and config hash;
- sweep endpoints and minimum detent;
- runtime and benchmark observations;
- remaining hot-path allocations;
- why each added state field is necessary for the lesson;
- explicit limitations of the phenomenological model.

Update `docs/DECISIONS.md`, `docs/PERFORMANCE.md`, `PROGRESS.md`, and the status table in `IMPLEMENTATION_PLAN.md`.

## Batch 02B — Conditional performance mechanics

Batch 02B is not automatically authorized by completing 02A. Add these mechanics only when profiling or visible behavior supplies evidence:

- a spatial hash if measured neighbor work is material at 500 particles;
- a deterministic free-slot pool when actual particle merging requires slot recycling;
- mass or density fields when they visibly improve aggregation or settling;
- merge tween metadata when the renderer has an accepted transition to display;
- additional allocation diagnostics when current telemetry cannot locate a measured problem.

Before adding one of these, record the baseline workload, the observed bottleneck or visual limitation, the simpler alternatives considered, and the expected acceptance improvement. Re-run the same measurement after implementation.

## Explicit non-goals

- No reusable multi-process engine.
- No generalized collision framework by default.
- No electrostatics, CFD, strict Stokes solver, shear breakup, or calibrated chemistry.
- No XR interaction code.
- No physical gauges, persistence, plant environment, or audio.
- No particle-count increase above 500 without real Quest measurements.

## Required tests

- deterministic initialization, stepping, reset, and dose-order independence;
- particle size and suspended/settled invariants;
- finite long-run state;
- authoritative turbidity-band bounds and repeatability;
- canonical and extended 11-dose regression properties;
- import-boundary tests proving simulation has no UI dependency and rendering owns no lifecycle;
- benchmark output covering the actual phenomenon path.

## Acceptance criteria

- The 11-dose sweep has one clear principal basin near the configured optimum.
- Low, near-optimal, and high dose outcomes are numerically and visibly distinct.
- Same inputs reproduce endpoints and band values within the regression tolerance.
- State remains finite, reset-pure, and independent of React and rendering.
- The default 500-particle path meets the documented desktop benchmark without unbounded memory growth.
- No Batch 02B mechanism exists without recorded benchmark or visual evidence.
- Batch 03 can focus on presentation and tuning rather than inventing the treatment response.

## Suggested commit

`feat(sim): prove deterministic dose-response substrate`

## Acceptance result

Batch 02A passed on 2026-07-15. The complete configuration, canonical curve, nine-seed results, benchmark, allocation audit, browser evidence, limitations, and intentional Batch 02B deferrals are recorded in [the acceptance packet](docs/BATCH_02A_ACCEPTANCE.md).

## Required closing acceptance packet

1. What changed and what intentionally did not change.
2. Files added, removed, and modified.
3. Commands run and exact results.
4. Canonical and extended dose-sweep evidence.
5. Desktop metrics and remaining hot-path allocations.
6. Known defects, compromises, and deferred decisions.
7. Evidence authorizing any Batch 02B mechanism.
8. Documentation updated.
9. Proposed commit message and whether the batch gate passed.
