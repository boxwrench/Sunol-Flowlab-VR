# Dose-Sweep Regression Contract

The permanent renderer-free sweep runs detents 0 through 10 from identical raw water with a fixed timestep and phase schedule.

## Initial baseline policy

- Configured optimum: detent 5.
- Canonical seed: `0x5f3759df`.
- Fast suite: canonical seed on every commit.
- Extended suite: 9 seeds (`0x5f3759df` through `0x5f3759e7`) before accepting simulation tuning.
- Numeric repeatability tolerance: absolute endpoint difference at most `1e-7` for identical seed, dose, config, runtime, and timestep.
- Runtime ceiling: 30 seconds for the canonical 11-dose headless sweep on the documented development machine.

## Passing properties

- The canonical minimum and the median minimum across the seed corpus are within one detent of the configured optimum.
- Endpoint relative optical load at detents 0 and 10 is at least 15% of the normalized scale worse than the sweep minimum. Historical Batch 02A artifacts call this endpoint turbidity.
- The curve has one principal basin. At most one shoulder reversal per side is allowed, and each reversal must be no larger than `0.03` normalized optical load.
- Every endpoint and band value is finite and in `[0, 1]`.
- The optimum reaches the configured upper-column clarity threshold earlier than both extremes.
- Re-running in another dose order produces the same per-dose results within tolerance.
- Reset purity proves that prior trials do not affect a later result.

These initial thresholds may change only after the desktop phenomenon prototype supplies reviewable curve and visual evidence. An approved change updates this document, the accepted config, and the baseline artifact together.

## Failure artifact

A failure writes JSON containing the seed, config hash, timestep, phase durations, eleven endpoints, band summaries, minimum index, tail margins, reversals, runtime, and failed assertions. A human-readable Markdown table or SVG curve accompanies extended-validation failures.

## Accepted Batch 02A baseline

The first accepted implementation uses config hash `fnv1a32-056c0563`. Its canonical minimum is Dose 5, tail margins are 0.550568 and 0.476090, and both shoulders have zero reversals. Natural and reverse orders are identical, and the nine-seed corpus passes. The complete curve, configuration, benchmark, browser evidence, and limitations are recorded in [the Batch 02A acceptance packet](BATCH_02A_ACCEPTANCE.md).

This baseline remains immutable historical evidence while Workstream 03D implements the [approved modeling research amendment](MODELING_RESEARCH_AMENDMENT.md). The replacement does not become the accepted baseline merely because its code lands.

## Workstream 03D replacement gates

The accepted mass-authoritative model must continue to pass every dose-shape, order-independence, reset-purity, range, runtime, and population property below on every change. Its config has a new hash and side-by-side closing artifact; the Batch 02A packet is not overwritten.

It must additionally demonstrate:

- total mass conservation within a documented floating-point tolerance;
- cached diameter consistency with authoritative mass;
- reproducible initial state, merge history or digest, active state, endpoint bands, and trial result for identical supported inputs;
- generally faster but capped settling for larger aggregates;
- no premature population collapse across the approved seed corpus;
- recorded active, suspended, and settled counts, mean and maximum mass, maximum diameter, largest-mass fraction, and visible suspended-floc count;
- approximately conserved whole-tank relative optical load during aggregation with settling disabled and `Df = 2.0`;
- the expected pre-settling optical-load direction for at least one tested non-default fractal dimension;
- local and band transport changes that do not create a second global process calculation;
- finite, bounded particle state with no `NaN` or Infinity after at least 10,000 fixed steps.

The largest-aggregate mass-fraction bound is selected through deterministic and visual testing and recorded with the replacement config. No undocumented threshold or exact endpoint is accepted solely to make the curve pass.

## Accepted Workstream 03D replacement

Configuration fnv1a32-e8bf13e7 passes the canonical and nine-seed suites.
The canonical principal minimum is Dose 5, both tail margins are 0.236407,
and each permitted shoulder reversal is below 0.03. The seed corpus observes
a minimum of 93 active aggregates, a minimum of 55 visible suspended
aggregates during settling, a maximum largest-aggregate fraction of 1.6%,
and zero recorded mass error.

The permanent population bounds are at least 75 active aggregates, at least 40
visible suspended aggregates during settling, no more than 2% of initial mass
in one aggregate, and mass error no greater than 1e-6. The complete old/new
curve, population, benchmark, browser, allocation, architecture, and open-gate
evidence is recorded in
[the Workstream 03D technical acceptance packet](BATCH_03_03D_TECHNICAL_ACCEPTANCE.md).
