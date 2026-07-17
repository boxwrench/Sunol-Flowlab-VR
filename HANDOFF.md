# Session Handoff

Updated: 2026-07-15

## Resume point

- Repository: <https://github.com/boxwrench/Sunol-Flowlab-VR>
- Branch: main
- Published HEAD: `2f72e89` (`feat(app): add deterministic review controls`)
- Working tree: the bounded 03R.1 render, browser/contract tests, apparatus-only
  capture path, replacement apparatus image, and evidence updates are
  uncommitted alongside the earlier external-review findings
- Separate untracked file: `AGENTS.md` appeared outside this work, defines
  repository-local authority, and must be preserved unless its owner directs
  otherwise
- Current milestone: Batch 03 Workstream 03D technical acceptance complete;
  Quest and blinded outcome checks passed; the 03R.1 repair candidate is ready
  for fresh jar-recognition review
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
  static canonical presets for doses 0, 2, 4, 6, 8, and 10; one instanced draw
  gives all six the same frozen raw-water fill, and they are not six live
  simulations.
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
- The external operator and non-operator both selected C as the clearest result
  and A/B as less effective, found the qualitative outcome legible, and rejected
  predictive overclaim. The blinded outcome-comparison gate passes.
- Apparatus recognition did not pass: the operator called the six vessels
  “Empty jars,” and the non-operator read them as possible “chemicals?” Both
  still identified the large tank as primary and understood water treatment.

The production build retains the expected non-failing large-chunk warnings from
the emulator environment assets.

## Work Package 03R.1 candidate and remaining validation

The six jars may reuse the hero tank's water, haze, and clearing visual language,
but they must not be live clones of its runtime. The accepted lifecycle is:

1. Before a canonical trial has completed, every jar contains the same frozen
   raw-water fill. This is a static apparatus cue so the vessels do not look
   empty; it is not a treatment result.
2. In the later intended write-on-completion behavior, finishing an exact
   canonical dose 0, 2, 4, 6, 8, or 10 replaces only that jar's fill once with
   a frozen summary derived from the immutable completed `TrialResultV1` and
   `CanonicalJarSummary`.
3. A jar never consumes the current hero-tank particle view, live optical-load
   bands, fixed-step clock, or per-frame updates. Six live mirrors or six
   simulations are forbidden.
4. The mounted plot and experiment log remain the sole complete memory for all
   eleven doses; the six jars remain partial canonical summaries.

03R.1 implements only the initial frozen raw-water fill as one six-instance
draw using shared geometry and material inside the existing open rectangular
vessels. It reuses the hero tank's cloudy-water palette and adds no dose-
specific differences, settled-result claims, `useFrame`, simulation imports,
or process calculation. The existing table, paddles, rims, vessel geometry,
and hero-tank hierarchy are retained.

Recorded implementation evidence for 03R.1:

- a render contract proving six static fills and no runtime/process dependency;
- updated draw-call and browser-error evidence;
- one regenerated unlabeled apparatus image, while the accepted A/B/C outcome
  images remain byte-unchanged;
- visual inspection in desktop framing; no Quest was attached for the optional
  short composition/cost confirmation of the added transparent fill;
- a fresh blinded Part 1 review in which the operator recognizes a jar-test
  comparison, the non-operator preferably recognizes a comparative experiment,
  the hero tank remains primary, and the jars do not imply six live processes.

## Open gates and constraints

Batch 03 is not accepted yet. The bounded repair and affected apparatus
evidence are complete. Repeat Part 1 with a fresh external water-treatment
operator or educator, preferably plus a fresh non-operator. The passed A/B/C
outcome review does not need repetition unless those byte-unchanged images
change. A short Quest composition/cost check remains available when a headset
is next attached.

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

1. Run a fresh blind Part 1 recognition review using the repaired apparatus
   image. Keep the accepted A/B/C images unchanged unless the hero-tank outcome
   presentation changes.
2. If a Quest is connected, perform the short 03R.1 composition/cost
   confirmation for the added transparent fill.
3. Accept Batch 03 only when the jar-test recognition gate passes. Then choose
   the bounded Batch 04 interaction increment.

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
