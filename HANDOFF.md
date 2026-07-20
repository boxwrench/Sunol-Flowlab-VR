# Session Handoff

Updated: 2026-07-19

## Resume point

- Repository: <https://github.com/boxwrench/Sunol-Flowlab-VR>
- Branch: main
- Published branch: main; use `git log -1 --oneline` for the current increment
- Working tree: combined Batch 07/08 technical-candidate increment; inspect
  `git status --short` and `git log -1 --oneline`
- `AGENTS.md` is repository-local authority and intentionally ignored at the
  repository root
- Current milestone: Batch 07 and Batch 08 technical candidates; one combined
  Quest visual/control/comparison verdict remains open
- Portfolio-evaluation recommendations are staged without expanding Batch 07:
  final media/transparency evidence in Batch 08, repository front-door work in
  Batch 09, and bundle/deployment/branding verification in Batch 11
- Post-v1 mechanistic coagulation is preserved as research-only in
  [docs/POST_V1_MECHANISTIC_COAGULATION_RESEARCH.md](docs/POST_V1_MECHANISTIC_COAGULATION_RESEARCH.md);
  it adds no version 1 code, command, state, schema, or Batch 07–11 scope
- Active plan authority: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and
  its ordered batch-00 through batch-11 Markdown files
- Batch 03 technical evidence:
  [docs/BATCH_03_03D_TECHNICAL_ACCEPTANCE.md](docs/BATCH_03_03D_TECHNICAL_ACCEPTANCE.md);
  closing decision: [docs/BATCH_03_ACCEPTANCE.md](docs/BATCH_03_ACCEPTANCE.md)
- Batch 04 closing evidence:
  [docs/BATCH_04_ACCEPTANCE.md](docs/BATCH_04_ACCEPTANCE.md)
- Batch 05 closing evidence:
  [docs/BATCH_05_ACCEPTANCE.md](docs/BATCH_05_ACCEPTANCE.md)
- Batch 06 closing evidence:
  [docs/BATCH_06_ACCEPTANCE.md](docs/BATCH_06_ACCEPTANCE.md)
- Batch 07 candidate evidence:
  [docs/BATCH_07_ACCEPTANCE.md](docs/BATCH_07_ACCEPTANCE.md)
- Batch 08 candidate evidence and display choices:
  [docs/BATCH_08_CANDIDATE.md](docs/BATCH_08_CANDIDATE.md) and
  [docs/TUNING.md](docs/TUNING.md)

Resume on main with Batch 07 as an unaccepted candidate. Batches 03 through 06
are accepted. Batch 07 implementation, local automated/rendered evidence, and a
successful 114.21 FPS / 9.50 ms p95 operator-started Dose 5 run are complete.
On 2026-07-19 the owner deferred the remaining human readability,
comprehension, and physical-control review, then authorized Batch 08 technical
work and one combined Quest review. The 2026-07-20 technical run passed, but
the human review rejected the unlabeled instruments and tank lines. The revised
candidate retains allocation-free optical-band smoothing, removes the sensor
and in-tank markers, and adds labeled physical instrumentation plus a past-run
gauge needle. Neither batch is accepted yet. Do not pull
Batch 09, environment, deployment, or release scope into this gate.

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
- Development review controls provide legal Start, complete-only Refill, and a
  clearly named Force Reset without moving lifecycle ownership out of the
  app-domain controller. Proof mode hides them.
- One table-mounted six-jar bench with open rectangular vessels. The jars are
  static canonical presets for doses 0, 2, 4, 6, 8, and 10. Batch 07 now feeds
  each completed canonical jar its latest immutable summary; missing results
  retain the frozen raw-water fill. They are not six live simulations.
- The versioned experiment log and mounted plot are the complete memory for all
  eleven dose values and repeated trials. Static jars remain summaries only.
- Unlabeled proof mode and regenerated randomized low/optimum/high review
  captures.
- Local physical Quest route previously accepted over ADB reverse for immersive
  entry, both controllers, select input, remote inspection, and clean exit.
- Project-owner operator acceptance of start placement, table height,
  rectangular jar shape, and hero-tank hierarchy on Quest.
- The Batch 05 XR route composes exactly one app-owned `SimulationRuntime` into
  the shared live hero-tank renderer while retaining the Batch 04 controls,
  posture transforms, floor/reference frame, and static six-jar rack.
- The current app-owned Batch 06 controller accepts ready-state integer dose
  changes, runs the explicit seven-phase sequence, rejects invalid/non-ready
  commands with a log record, pauses on XR/visibility interruption, and resumes
  without hidden catch-up. The Batch 05 adapter remains only as historical test
  coverage and is no longer composed into either route.
- One exactly-once immutable `TrialResultV1` captures the authoritative
  12-band endpoint at 43 simulation seconds. COMPLETE water and instruments
  read from that frozen result rather than the paused runtime.
- The human-rejected emitter, beam, detector, result lamp, phase lamps, and
  in-tank prior-front marker have been removed. A plain-text phase readout and
  labeled instruments replace them. A two-second inlet stream marks
  deterministic refill and controls unlock only after it finishes.
- The physically accepted dose interaction uses a smaller operator-facing arc,
  a near-side direct-grab target, and locally generated instanced labels 0
  through 10. It maps constrained movement to all eleven validated integer
  DoseIndex values; interaction state remains separate from dose.
- Pointer capture belongs to the whole physical lever handle, including its
  spherical grab end and transparent 0.13 m grab target. The control emits
  SET_DOSE only on a changed detent and snaps to an integer on release.
- The Start control has idle, hovered, pressed, released, and locked states and
  emits exactly one START_TRIAL command per press, with held presses suppressed.
- The XR integration records controller/session presence, handedness,
  interaction phases, accepted/rejected command counts, authoritative runtime
  diagnostics, merge rate, optical load, and rolling render telemetry for
  remote inspection without introducing simulation ownership in `/src/xr`.
- Batch 07 implements app-owned 10 Hz treatment-ghost recording, bounded
  localStorage persistence, compatibility validation, and independent playback.
  Batch 08 adds render-local optical smoothing and a labeled subordinate
  past-run gauge needle. There is no particle replay or replay recomputation.

## Current evidence

- 22 repository-contract tests pass, including XR ownership, integration
  composition, detent, pointer-
  capture, and Start-latch source contracts.
- 134 Vitest tests across 29 files pass, including the full transition matrix,
  legal/illegal commands, fixed timing, centralized time scale, exactly-once
  immutable result, result/runtime isolation, deterministic refill,
  interruption/long-stall recovery, all eleven detents, lock suppression, and
  one-emission-per-press Start behavior.
- Canonical, reverse-order, reset-purity, and nine-seed sweeps pass.
- Mass/diameter invariants, deterministic merge history, fractal settling,
  optical-load authority, local transport, population bounds, and the
  10,000-step finite-state path pass.
- Type checking, lint, formatting, production build, and diff checks pass.
- The closing standalone production-path benchmark runs 2,580 steps in
  23.9372 ms, averaging 0.009185 ms with 0.022100 ms p95.
- The canonical optimum completes with 105 active, 65 suspended, and 40 settled
  aggregates; mean mass 4.761905; maximum mass 8; 1.6% largest-mass fraction;
  endpoint optical load 0.501182; and zero mass error.
- Across nine seeds, the observed worst cases are 93 active aggregates, 55
  visible suspended aggregates, 1.6% largest-mass fraction, and zero mass error.
- The bundled browser client completed the same optimum state with a readable
  clearing front and no console errors.
- Five Playwright browser tests pass. Shared desktop and XR scenarios prove
  READY through COMPLETE, fixed measurement/result capture, result-backed
  endpoint presentation, deterministic REFILLING back to READY, locked controls,
  exact endpoints, and synchronized diagnostics. Existing comparison/proof
  scenarios still pass.
- The pre/post eleven-dose sweep has identical endpoints at every detent and
  the complete nine-seed corpus still passes under config
  `fnv1a32-e8bf13e7`.
- The bundled browser client separately clicked the rendered Start control and
  recorded one START_TRIAL, then grabbed the spherical lever handle and
  recorded a snapped release with no console/page error.
- The physical Batch 05 seated session restarted the exact XR page into a fresh
  active immersive session, tracked both controllers during endpoint review,
  routed a deliberate dose movement and one physical Start, and completed the
  canonical 43-second Dose 5 trial at the exact accepted state: 105 active, 65
  suspended, 40 settled, 395 merges, and endpoint optical load 0.501182.
- The Batch 05 Dose 5 controller-idle final window reported 118.45 FPS, 8.44 ms
  average, 8.80 ms p95, 0.007 ms simulation, 0.084 ms instance sync, and 24.5 MB
  heap. Controller-on Dose 0/10 windows reported 116.88 FPS and a worst 10.20 ms
  p95 with 100–102 draw calls and the same 24.5 MB heap.
- The seated project-owner operator reported that the integrated scene “looked
  good” and passed low/optimum/high qualitative separation, stereo and
  transparency presentation, floc visibility, wall appearance, common viewing
  angles, and visible hitching. Standing and endurance were not repeated or
  claimed.
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
- The external operator and non-operator both selected C as the clearest result
  and A/B as less effective, found the qualitative outcome legible, and rejected
  predictive overclaim. The blinded outcome-comparison gate passes.
- Apparatus recognition did not pass: the operator called the six vessels
  “Empty jars,” and the non-operator read them as possible “chemicals?” Both
  still identified the large tank as primary and understood water treatment.

The production build retains the expected non-failing large-chunk warnings from
the emulator environment assets.

## Work Package 03R.1 accepted foundation and Batch 07 behavior

The six jars may reuse the hero tank's water, haze, and clearing visual language,
but they must not be live clones of its runtime. The accepted lifecycle is:

1. Before a canonical trial has completed, every jar contains the same frozen
   raw-water fill. This is a static apparatus cue so the vessels do not look
   empty; it is not a treatment result.
2. Finishing an exact
   canonical dose 0, 2, 4, 6, 8, or 10 replaces only that jar's fill once with
   a frozen summary derived from the immutable completed `TrialResultV1` and
   `CanonicalJarSummary`.
3. A jar never consumes the current hero-tank particle view, live optical-load
   bands, fixed-step clock, or per-frame updates. Six live mirrors or six
   simulations are forbidden.
4. The mounted plot and experiment log remain the sole complete memory for all
   eleven doses; the six jars remain partial canonical summaries.

03R.1 supplied the initial frozen raw-water fill as one six-instance draw using
shared geometry and material. Batch 07 retains that fallback and adds static
app-fed result tokens without adding `useFrame`, simulation imports, or process
calculation to the jar rack. The existing table, paddles, rims, vessel geometry,
and hero-tank hierarchy remain intact.

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

Batch 03 is accepted. The owner explicitly waived the fresh blinded Part 1
recognition rerun after reviewing the completed 03R.1 repair record. The skipped
rerun is not represented as a passed external review. The initial failed
recognition responses, repair evidence, residual risk, and acceptance exception
are retained in [docs/BATCH_03_ACCEPTANCE.md](docs/BATCH_03_ACCEPTANCE.md) and
[docs/UX_VALIDATION.md](docs/UX_VALIDATION.md).

A later fresh recognition review and a short Quest composition/cost check for
the added transparent fill remain optional risk-reduction work, not Batch 03
gates.

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

Batch 05 is accepted. Its seated integration gate covers deterministic parity,
physical command routing, one complete optimum trial, low/high endpoint review,
stereo/transparency presentation, fresh-session reentry, and short rolling
performance. It does not claim standing, thermal/endurance, hosted deployment,
or release acceptance.

Batch 06 is accepted. All automated checks, the unchanged
eleven-dose/nine-seed corpus, production build, required browser-client run, and
inspected RAPID_MIX/MEASURING/COMPLETE/REFILLING desktop captures pass. A fresh
seated Quest run also recorded the exact physical Start, phase order, immutable
result, refill-to-READY state, and 117.2-120.1 FPS later-phase windows with
9.0-9.8 ms p95. A second Dose 5 run reproduced the result without rejected
commands. The seated project-owner operator replied “pass” to the combined
review of phase distinction, lock feedback, measurement conclusion, refill
readability and invitation to repeat, and visible smoothness.

A hosted HTTPS deployment is not authorized. Localhost and the documented ADB
reverse route remain the approved development paths. Thermal/endurance, later
headset ergonomics beyond this Batch 04 protocol, Batch 08 ghost-comparison
presentation, hosted
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
Do not add a second simulation, copy hot arrays into React state, give the jars
live state, pull Batch 08 ghost-comparison visuals forward, or authorize hosted
deployment from this increment.

## Recommended next session

1. Restart the seated Quest route and run
   `npm run acceptance:08:quest -- review-ready` to stage every canonical jar,
   select a compatible ghost, and park the labeled past-run gauge comparison.
2. Run a focused headset check of text readability, the jar spectrum, graph
   meaning, past-run purpose, and replay/refill/clear controls.
3. Record one final pass or issue list. The live-trial phase/performance row
   already passed on 2026-07-20.
4. If the combined gate passes, update both candidate packets, tag Batch 07 and
   Batch 08 at their accepted commits, and only then open Batch 09.

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
    npm run acceptance:06:quest -- status
    npm run acceptance:06:quest -- restart
    npm run acceptance:06:quest -- prepare 5
    npm run acceptance:06:quest -- watch
    npm run acceptance:06:quest -- refill
    npm run acceptance:07:quest -- status
    npm run acceptance:07:quest -- restart
    npm run acceptance:07:quest -- stage-review
    npm run acceptance:07:quest -- prepare 4
    npm run acceptance:07:quest -- watch
    npm run acceptance:07:quest -- replay
    npm run acceptance:07:quest -- clear
    npm run acceptance:07:quest -- refill
    npm run acceptance:08:quest -- review-ready
    npm run acceptance:08:quest -- watch-combined
    npm run acceptance:08:quest -- watch-controls
    npm run dev -- --port 5173
    adb devices
    adb reverse tcp:5173 tcp:5173
    adb forward tcp:9222 localabstract:chrome_devtools_remote

Open
http://127.0.0.1:5173/?mode=xr-shell&posture=seated&calibration=off in Quest
Browser after restoring the reverse tunnel. For the broader physical-device
route, follow [docs/DEVICE_TESTING.md](docs/DEVICE_TESTING.md).
