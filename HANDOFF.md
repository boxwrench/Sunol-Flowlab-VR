# Session Handoff

Updated: 2026-07-15

## Resume point

- Repository: <https://github.com/boxwrench/Sunol-Flowlab-VR>
- Branch: main
- Published branch: main; use `git log -1 --oneline` for the current increment
- Current milestone: Batch 03 Workstream 03D technical acceptance complete;
  replacement-model Quest check passed; external human review remains open
- Active plan authority: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and
  its ordered batch-00 through batch-11 Markdown files
- Technical closing evidence:
  [docs/BATCH_03_03D_TECHNICAL_ACCEPTANCE.md](docs/BATCH_03_03D_TECHNICAL_ACCEPTANCE.md)

The superseded Godot plan remains isolated under docs/archive for provenance.
Use only the active indexed Markdown plan.

## What is working

- Public MIT repository governance, contribution guidance, safety framing, data
  boundaries, CI, and pinned Node/toolchain policy.
- App-owned SimulationRuntime with deterministic reset, start, pause, rendered
  stepping, and headless stepping. Rendering remains a read-only consumer.
- Fixed-capacity 500-particle state with ten reusable typed arrays,
  authoritative aggregate mass, cached mass-derived diameter, suspended/settled
  state, and zeroed inactive slots.
- Stable allocation-free rotating pair scheduling, deterministic
  mass-conserving merges, mass-weighted survivor motion, an eight-primary-mass
  growth prohibition, and deterministic merge diagnostics.
- Default Df = 2 fractal geometry and capped size-dependent settling.
- One authoritative 12-band relative optical-load record derived from
  suspended projected area. Legacy forward turbidity identifiers have been
  removed; historical Batch 02A documents retain their original terminology.
- Permanent population diagnostics and sweep failures for mass error, active
  population, visible suspended population, largest-mass fraction, diameter,
  and aggregate-mass bounds.
- Accepted configuration fnv1a32-e8bf13e7 with a principal Dose 5 minimum and
  passing canonical and nine-seed eleven-dose sweeps.
- One live hero observation tank, one read-only instanced particle draw, a
  band-driven clearing presentation using rear and lighter middle slices from
  the same authority, and clearing-front diagnostics.
- Authoritative diameter ratios are preserved in rendered floc scale. Short
  render-local position, scale, and consumed-particle exit smoothing improves
  merge readability without adding simulation merge-event state.
- Development review controls provide Start, Stop, and Reset without moving
  lifecycle ownership out of SimulationRuntime. Stop preserves the current
  state; Reset restores the selected dose and canonical seed at time zero and
  remains stopped; Start resumes the current state. Proof mode hides them.
- One table-mounted six-jar bench with open rectangular vessels. The jars are
  static canonical presets for doses 0, 2, 4, 6, 8, and 10; they are not six
  live simulations.
- The future complete plot and experiment log remain the canonical memory for
  all eleven dose values. Static jars are summaries only.
- Unlabeled proof mode and regenerated randomized low/optimum/high review
  captures.
- Local physical Quest route previously accepted over ADB reverse for immersive
  entry, both controllers, select input, remote inspection, and clean exit.
- Project-owner operator acceptance of start placement, table height,
  rectangular jar shape, and hero-tank hierarchy on Quest.
- Approved treatment-result ghost design remains staged for Batches 07-08.
  There is no ghost runtime, particle replay, or replay recomputation.

## Current evidence

- 16 repository-contract tests pass.
- 83 Vitest tests across 19 files pass.
- Canonical, reverse-order, reset-purity, and nine-seed sweeps pass.
- Mass/diameter invariants, deterministic merge history, fractal settling,
  optical-load authority, local transport, population bounds, and the
  10,000-step finite-state path pass.
- Type checking, lint, formatting, production build, and diff checks pass.
- The conservative standalone production-path benchmark runs 2,580 steps in
  70.3864 ms, averaging 0.026997 ms with 0.076100 ms p95.
- The canonical optimum completes with 105 active, 65 suspended, and 40 settled
  aggregates; mean mass 4.761905; maximum mass 8; 1.6% largest-mass fraction;
  endpoint optical load 0.501182; and zero mass error.
- Across nine seeds, the observed worst cases are 93 active aggregates, 55
  visible suspended aggregates, 1.6% largest-mass fraction, and zero mass error.
- The bundled browser client completed the same optimum state with a readable
  clearing front and no console errors.
- Four browser interaction tests pass, including the full Stop, deterministic
  Reset, and Start sequence plus proof-mode control exclusion.
- The tracked apparatus and three randomized comparison PNGs were regenerated
  after 03D and visually inspected. Capture-time browser errors were zero. The
  answer key remains ignored under test-results.
- The replacement-model physical Quest rerun passed operator review. At 43
  simulated seconds, 43.006 wall seconds had elapsed; the final 300-frame
  snapshot reported 120.0 FPS, 8.33 ms average, 8.90 ms p95, 74 fully loaded
  stereo draw calls, 37.8 MB heap, both controllers tracked, and no browser or
  page errors.

The production build retains the expected non-failing large-chunk warnings from
the emulator environment assets.

## Open gates and constraints

Batch 03 is not accepted yet. The replacement images are ready, but the
following must still be recorded:

1. A blinded external water-treatment operator or educator apparatus-
   recognition response, preferably plus a non-operator response.
2. A blinded low/optimum/high outcome review by an operator-informed reviewer
   and a non-operator.

Use [docs/BATCH_03_REVIEW_PACKET.md](docs/BATCH_03_REVIEW_PACKET.md) for the
review and record responses in
[docs/UX_VALIDATION.md](docs/UX_VALIDATION.md). Do not show reviewers the local
answer key or the technical packet before they answer.

The local physical Quest route is accepted for connectivity, interaction,
composition, final-model visibility, and short rolling performance. The
measurement is recorded in [docs/PERFORMANCE.md](docs/PERFORMANCE.md). It is
not thermal, endurance, later interaction ergonomics, or release evidence.

A hosted HTTPS deployment is not authorized. Localhost and the documented ADB
reverse route remain the approved development paths. Thermal, endurance, later
headset ergonomics, Batch 04 interaction, ghost runtime, and release gates are
still out of scope.

Public-data and fictionalization restrictions in
[docs/DATA_BOUNDARY.md](docs/DATA_BOUNDARY.md) remain binding. The model is
phenomenological education, not calibrated NTU, dose prediction, plant
simulation, operating guidance, or a connection to SCADA, plant controls,
operational systems, intranet resources, or real operating data.

## Architecture constraints

    src/sim/     deterministic process state and behavior; no browser or UI dependencies
    src/render/  read-only visualization of authoritative simulation output
    src/xr/      WebXR session and physical-input adapters
    src/app/     runtime lifecycle, validated commands, modes, telemetry, and composition

Do not place merging, settling, optical-load, scoring, population, or
measurement calculations in rendering or XR code. Rendering cannot create,
reset, or advance simulation state and cannot import the app layer. Do not move
hot simulation state into React state.

Keep spatial hashing deferred unless a recorded bottleneck justifies it.
Version 1 has no free list. The observed flicker justifies the current bounded
render-local smoothing, but simulation merge-event metadata remains deferred.
Do not start ghost runtime, Batch 04 features, or hosted deployment while
closing the remaining Batch 03 gates.

## Recommended next session

1. Conduct the blinded apparatus and outcome reviews from the regenerated
   packet and record exact or carefully paraphrased responses. For a live
   follow-up after the blind answers are recorded, the desktop review controls
   may pause, reset, and resume the deterministic trial.
2. If reviewers identify a comprehension problem, adjust the smallest
   presentation parameter before changing simulation complexity or particle
   count, then regenerate the packet.
3. Accept Batch 03 only when the external gates pass. Then choose the bounded
   Batch 04 interaction increment.

## Commands

    npm ci
    npm test
    npm run acceptance:03d
    npm run benchmark
    npm run typecheck
    npm run lint
    npm run format:check
    npm run build
    npm run test:browser
    npm run capture:review
    npm run dev

Open http://localhost:5173 in Chrome for the Quest 3 emulator. For physical
device testing, follow [docs/DEVICE_TESTING.md](docs/DEVICE_TESTING.md).
