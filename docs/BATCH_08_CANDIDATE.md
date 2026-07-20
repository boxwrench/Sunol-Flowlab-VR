# Batch 08 Technical Candidate Packet

Date: 2026-07-19

Status: **Technical candidate; not accepted.** The project owner authorized a
scheduling exception that batches Batch 08 machine-verifiable work before the
remaining Batch 07 human verdict. One combined Quest review now owns both open
human gates.

## Implemented

- Retained the authoritative 12-band layout and existing accepted water
  color/opacity mapping.
- Added allocation-free, display-only exponential band smoothing with a
  0.16-second time constant and immediate epoch reset.
- Refactored the existing clearing-front diagnostic into a shared normalized-
  band transform without changing its output.
- Added one opaque prior-front marker driven by the app-owned interpolated ghost
  playback view.
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
- The ghost marker is one opaque mesh and has no simulation or playback-runtime
  import.
- The compatible-ghost desktop capture reports 55 development draw calls under
  the enforced ceiling of 71.
- The required bundled browser client completed Dose 5 at endpoint
  `0.5011820349166183` with no console-error artifact.

## Verification completed

- `npm test`: 21 repository-contract tests and 133 Vitest tests pass across 30
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

## Open combined gate

The combined seated Quest review must establish:

1. remaining Batch 07 instrument/jar readability and physical replay, refill,
   replacement, and clear behavior;
2. clear top-down progression, visible floc growth/settling, and agreement among
   the tank, gauge, plot, and static jar summaries;
3. the prior-front marker is visible but subordinate and is understood as a
   recorded result;
4. common seated head angles remain legible with acceptable transparency
   ordering; and
5. live-plus-ghost performance retains the 72 FPS posture through the expensive
   visible phases.

Standing, portfolio media selection, and non-operator review may be recorded in
the same session if practical. They are not inferred from earlier seated
evidence.

The combined device harness is available as
`npm run acceptance:08:quest -- review-ready`, followed by
`watch-combined` and `watch-controls`. It writes bounded technical reports
to `test-results/` while leaving the readability and comprehension decision
to the project-owner operator.

## Gate decision

Do not mark Batch 07 or Batch 08 accepted and do not create either accepted tag
until the combined human checklist has a recorded verdict. Proposed Batch 08
commit remains `refine: tune headset clearing and ghost readability`; proposed
accepted tag remains `headset-readability-proven`.
