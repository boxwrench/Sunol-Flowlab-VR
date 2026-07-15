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
- Endpoint turbidity at detents 0 and 10 is at least 15% of the normalized scale worse than the sweep minimum.
- The curve has one principal basin. At most one shoulder reversal per side is allowed, and each reversal must be no larger than `0.03` normalized turbidity.
- Every endpoint and band value is finite and in `[0, 1]`.
- The optimum reaches the configured upper-column clarity threshold earlier than both extremes.
- Re-running in another dose order produces the same per-dose results within tolerance.
- Reset purity proves that prior trials do not affect a later result.

These initial thresholds may change only after the desktop phenomenon prototype supplies reviewable curve and visual evidence. An approved change updates this document, the accepted config, and the baseline artifact together.

## Failure artifact

A failure writes JSON containing the seed, config hash, timestep, phase durations, eleven endpoints, band summaries, minimum index, tail margins, reversals, runtime, and failed assertions. A human-readable Markdown table or SVG curve accompanies extended-validation failures.
