# Session Handoff

Updated: 2026-07-16

## Resume point

- Repository: <https://github.com/boxwrench/Sunol-Flowlab-VR>
- Isolated worktree: C:\tmp\Sunol-Flowlab-VR-batch04
- Branch: batch-04-xr-shell, currently unpublished and uncommitted
- Base/published branch: main at 2f72e89
- Current milestone: Batch 04 accepted in the isolated worktree; review and
  commit remain
- Active plan authority: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and
  its ordered batch-00 through batch-11 Markdown files
- Batch 03 technical evidence:
  [docs/BATCH_03_03D_TECHNICAL_ACCEPTANCE.md](docs/BATCH_03_03D_TECHNICAL_ACCEPTANCE.md);
  its remaining blinded human review is explicitly parked, not accepted
- Batch 04 closing evidence:
  [docs/BATCH_04_ACCEPTANCE.md](docs/BATCH_04_ACCEPTANCE.md)

Resume only in the isolated Batch 04 worktree. Do not recreate these changes on
main or begin Batch 05 before reviewing and committing the accepted candidate.
Batch 03 remains a separate predecessor decision.

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
- A separate Batch 04 XR-only mode composes a deliberately empty apparatus
  shell with standing and seated transforms, a floor/reference frame, empty
  hero tank, static six-jar rack, calibration marker, dose lever, and Start
  button. It imports no simulation runtime or treatment state.
- The physically accepted dose interaction uses a smaller operator-facing arc,
  a near-side direct-grab target, and locally generated instanced labels 0
  through 10. It maps constrained movement to all eleven validated integer
  DoseIndex values; interaction state remains separate from dose.
- Pointer capture belongs to the whole physical lever handle, including its
  spherical grab end and transparent 0.13 m grab target. The control emits
  SET_DOSE only on a changed detent and snaps to an integer on release.
- The Start control has idle, hovered, pressed, released, and locked states and
  emits exactly one START_TRIAL command per press, with held presses suppressed.
- The XR shell records controller/session presence, handedness, interaction
  phases, command counts, last command, and rolling render telemetry for remote
  inspection without introducing simulation ownership.
- Approved treatment-result ghost design remains staged for Batches 07-08.
  There is no ghost runtime, particle replay, or replay recomputation.

## Current evidence

- 19 repository-contract tests pass, including XR ownership, detent, pointer-
  capture, and Start-latch source contracts.
- 92 Vitest tests across 21 files pass, including all eleven detents,
  mechanical travel clamping, duplicate suppression, direct snapping, locking,
  release behavior, and one-emission-per-press Start behavior.
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
- Five Playwright browser tests pass. The new XR-shell test proves that the
  standalone mode exposes no particle or optical-load state, emits exactly one
  START_TRIAL from the rendered button, and reaches the lever snapped state
  without an extra command. The four existing desktop/review tests still pass.
- The bundled browser client separately clicked the rendered Start control and
  recorded one START_TRIAL, then grabbed the spherical lever handle and
  recorded a snapped release with no console/page error.
- The final physical Batch 04 session tracked both controllers, recorded 84
  validated commands and seven deliberate Start commands, and received an
  explicit seated operator pass for size, neutral reach, number readability,
  direct grab, integer detents, and Start behavior.
- The final fully tracked snapshot reported 119.7 FPS, 8.36 ms average,
  8.90 ms p95, 86 controller-inclusive draw calls, and 57.5 MB heap. The final
  monitored window reported 120.0 FPS, 8.60 ms p95, and zero active alerts,
  runtime exceptions, console errors, or browser log errors.
- Typecheck, lint, formatting, and diff integrity were rerun at the closing point
  and pass. The full unit/browser suites and production build pass after the
  final physical revisions.
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

Batch 03 is not accepted. Its replacement images are ready, but the project
owner explicitly parked these remaining human-review items:

1. A blinded external water-treatment operator or educator apparatus-
   recognition response, preferably plus a non-operator response.
2. A blinded low/optimum/high outcome review by an operator-informed reviewer
   and a non-operator.

When that work is deliberately resumed, use
[docs/BATCH_03_REVIEW_PACKET.md](docs/BATCH_03_REVIEW_PACKET.md) and record
responses in [docs/UX_VALIDATION.md](docs/UX_VALIDATION.md). Do not treat the
owner-authorized Batch 04 scheduling exception as Batch 03 acceptance.

The local physical Quest route is accepted for connectivity, interaction,
composition, final-model visibility, and short rolling performance. The
measurement is recorded in [docs/PERFORMANCE.md](docs/PERFORMANCE.md). It is
not thermal, endurance, later interaction ergonomics, or release evidence.

Batch 04 is accepted in its closing packet after two rejected physical
ergonomics candidates and one accepted final revision. The seated project-owner
operator accepted control size, neutral reach, number readability, near-side
direct grab, integer detents, and deliberate Start behavior. Both controllers
tracked, performance held substantial headroom over 72 FPS, and remote
monitoring found no active errors.

The owner explicitly waived a standing repeat and the separately scored
50-request protocol. These are recorded acceptance exceptions, not claims of
observed evidence. The accepted deck transform is shared by both posture
presets; later headset/release testing may repeat standing use if practical.

At final handoff, the Batch 04 Vite server is stopped and ADB reverse/debug
forwards are removed. No background process or device tunnel should be assumed.

A hosted HTTPS deployment is not authorized. Localhost and the documented ADB
reverse route remain the approved development paths. Thermal/endurance, later
headset ergonomics beyond this Batch 04 protocol, ghost runtime, hosted
deployment, and release gates remain later work.

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
Do not import simulation state into the Batch 04 shell, start Batch 05
integration before its predecessor decision, add ghost runtime, or authorize
hosted deployment from this branch.

## Recommended next session

1. Resume in C:\tmp\Sunol-Flowlab-VR-batch04, inspect the accepted dirty
   worktree and closing packet, and preserve all candidate changes.
2. Review the final diff and commit with the proposed Batch 04 message when
   authorized.
3. Keep Batch 03's blind review parked unless the owner separately resumes it.
4. Do not begin Batch 05 until Batch 03 is accepted or the owner makes another
   explicit scheduling decision.
5. If later testing repeats the waived standing protocol and reveals a defect,
   repair the smallest demonstrated interaction/layout issue and update the
   acceptance packet.

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
    npm run dev -- --host 127.0.0.1 --port 5174
    adb devices
    adb reverse tcp:5174 tcp:5174

Open http://127.0.0.1:5174/?mode=xr-shell in Quest Browser after restoring the
reverse tunnel. Use posture=seated for the seated layout. For the broader
physical-device route, follow [docs/DEVICE_TESTING.md](docs/DEVICE_TESTING.md).
