# Batch 08 Acceptance Packet

Date: 2026-07-20

Status: **Accepted.** The technical candidate and combined seated Quest
readability/comprehension gate pass.

## Implemented

- Retained the authoritative 12-band layout and existing accepted water
  color/opacity mapping.
- Added allocation-free, display-only exponential band smoothing with a
  0.16-second time constant and immediate epoch reset.
- Refactored the existing clearing-front diagnostic into a shared normalized-
  band transform without changing its output.
- Replaced the human-rejected in-tank prior-front marker with a labeled cyan
  past-run needle on the relative-turbidity gauge.
- Removed the unlabeled emitter, beam, detector, and result lamp from the tank.
- Replaced primitive phase lamps with a plain-text phase readout and added
  readable instrument/control labels.
- Exposed concise Batch 08 comparison state through the existing development
  text hook.
- Added unit, ownership, browser-state, screenshot, and draw-call regression
  evidence.

## Intentionally unchanged

- No simulation tuning or accepted configuration/hash change.
- No particle-count increase, ghost particles, second tank, replay
  recomputation, layered ghost gradient, or additional transparency.
- No environment, spectator, deployment, or later-batch work.
- No claim that desktop screenshots prove stereo readability or Quest cost.

## Technical evidence

- Normalized clearing-front extraction is shared by live diagnostics and replay
  presentation.
- Ghost interpolation remains app-owned and leaves live time, particles,
  randomness, and result count unchanged.
- Display smoothing owns one reusable `Float32Array` and performs no per-frame
  allocation.
- Past-run comparison remains a read-only render of app-owned replay values and
  has no simulation or playback-runtime ownership.
- The compatible-ghost desktop capture reports 55 development draw calls under
  the enforced ceiling of 71.
- The required bundled browser client completed Dose 5 at endpoint
  `0.5011820349166183` with no console-error artifact.

## Verification completed

- `npm test`: 22 repository-contract tests and 134 Vitest tests pass across 29
  Vitest files.
- `npm run test:browser`: all six Playwright scenarios pass and emit the Batch
  08 phase, endpoint, and compatible-ghost captures.
- `npm run acceptance:03d`: the canonical and nine-seed eleven-dose corpus
  remains accepted under config `fnv1a32-e8bf13e7`.
- `npm run benchmark`: 2,580 steps complete in 22.5512 ms total, 0.008643 ms
  average, and 0.021400 ms p95; the canonical endpoint remains
  `0.5011820349166183`.
- `npm run typecheck`, `npm run lint`, changed-file Prettier, and
  `git diff --check`: pass.
- `npm run build`: 360 modules transform and production build passes. Existing
  non-failing emulator-asset chunk warnings remain.

The repository-wide Prettier command also sees the untracked local `.agents/`
skill scaffold. Those user-owned files are outside this increment and remain
untouched; every tracked or newly added Batch 07/08 file passes Prettier.

## Combined human validation

The combined seated Quest review established:

1. remaining Batch 07 instrument/jar readability and physical replay, refill,
   replacement, and clear behavior;
2. clear top-down progression, visible floc growth/settling, and agreement among
   the tank, gauge, plot, and static jar summaries;
3. the labeled past-run gauge needle is understood as a recorded result and
   never as a second live simulation;
4. common seated head angles remain legible with acceptable transparency
   ordering; and
5. live-plus-ghost performance retains the 72 FPS posture through the expensive
   visible phases.

The first review returned actionable comprehension issues rather than a pass.
Iterative worn-headset fixes added plain-language labels, removed misleading
geometry, retuned seated placement, centered/scaled controls, aligned jar
labels, and established visible transparent dark/medium/light result tiers.
After the final START label, the project owner stated the batch was good.

Standing, portfolio media selection, and non-operator review remain outside
this accepted seated gate.

The combined device harness is available as
`npm run acceptance:08:quest -- review-ready`, followed by
`watch-combined` and `watch-controls`. It writes bounded technical reports
to `test-results/` while leaving the readability and comprehension decision
to the project-owner operator.

## Gate decision

Batch 08 is accepted by the project owner through the combined Batch 07/08
Quest verdict. No acceptance tag is created by this documentation update.
