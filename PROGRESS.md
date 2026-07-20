Original prompt: batch 7

# Batch 7 working notes

- 2026-07-17: Began from accepted Batch 6 at `9df0497`; current `main` also
  contains the published post-v1 research contract at `63c577f`.
- Preserving the accepted, uncommitted alpha-zeta research-contract refinement
  while Batch 7 proceeds.
- Batch 7 authority requires app-owned experiment history, canonical summaries,
  bounded 10 Hz treatment ghosts, independent playback, and physical apparatus
  controls derived from the existing relative-optical-load authority.
- Implemented `ExperimentMemory`: versioned localStorage validation, exactly-once
  append, complete all-dose history, latest canonical-summary derivation, clear,
  and graceful corrupt/future/quota handling. Targeted tests: 5 passed.
- Implemented bounded treatment ghosts: 10 Hz fixed-capacity recording,
  validation/migration classes, measured localStorage library, explicit limit
  replacement/deletion, and independent deterministic playback. Domain and
  integration tests: 16 passed; Batch 5/6 lifecycle regressions also pass.
- Wired desktop and XR to one Batch 7 controller. Added physical phase lamps,
  relative-load gauge, 0–10 mounted plot with repeated-result policy, refill
  handle, two-press tear sheet, small ghost controls, static canonical-jar
  summaries, and 90-degree detector geometry. Typecheck and targeted render
  tests pass.
- Full repository suite passes: 22 contract tests and 134 Vitest tests. All six
  rendered Playwright scenarios pass, including restart persistence, canonical
  restore, history clear, independent ghost replay, deletion, and XR Start.
- Simulation acceptance and benchmark pass without model drift. The current
  production build transforms 360 modules. Desktop instrumentation reports 51
  ready, 53 complete, and 55 compatible-ghost-comparison draw calls. One
  12-band, 43-second, 10 Hz ghost measures 50.9–54.9 KB as JSON; the configured
  three-record library is about 165 KB.
- Quest 3 remains connected and exposes the seated route. The first immersive
  restart attempt timed out because user presence/foreground entry was not
  available; no physical Batch 7 performance or comprehension claim is made.
- Added `acceptance:07:quest -- stage-review` to seed 0/5/10 comparison memory
  before the short worn-headset review. It accelerates deterministic setup only;
  natural dose-search comprehension remains a human observation.
- Entered the staged seated Quest route successfully. The operator selected and
  physically started Dose 5; one exact result appended, the fourth ghost became
  pending at the three-record limit, both controllers tracked, and the complete
  rolling window held 114.21 FPS with 9.50 ms p95. The owner called it a “good
  start” and paused the visual review until tomorrow before the replay, refill,
  clear-sheet, comprehension, and final-verdict checks.
- On 2026-07-19 the owner explicitly deferred the remaining human Quest gate.
  The gate remains open; it was not passed or waived, and Batch 08 remains
  unstarted.
- Batched candidate hardening tightened the exported application-command type
  guard so unknown command names, invalid dose detents, missing ghost IDs, and
  non-finite seek times cannot be represented as valid `AppCommand` values.
  Focused regression coverage and type checking pass.
- Later on 2026-07-19 the owner authorized Batch 08 technical work before the
  open Batch 07 human verdict and requested one combined human review. This is a
  scheduling exception, not Batch 07 acceptance.
- Added display-only 0.16-second optical-band smoothing with immediate epoch
  reset. The recorder and all process consumers retain unsmoothed authoritative
  samples; no simulation config or endpoint changed.
- Added one opaque prior clearing-front marker driven by the app-owned replay
  view. It adds no ghost particles, second tank, replay recomputation, or
  transparency layer. The rendered compatible-ghost checkpoint reports 55
  development draw calls.
- Added automated low/optimum/high, flocculation, settling, measurement, refill,
  and compatible-ghost capture points. The required bundled browser client
  completed Dose 5 with exact endpoint state and no console-error artifact.
- Added one combined Quest review harness. It non-destructively stages all six
  canonical doses plus Dose 5, parks replay at 35 seconds, records the
  physical trial phase/performance evidence, and separately records accepted
  replay/refill/clear commands. Reports remain technical evidence and cannot
  supply the open human verdict.
- On 2026-07-20 the combined live run passed technically: both controllers,
  every phase, one appended result, no alerts, 107.02 FPS worst rolling
  average, and 12.50 ms worst rolling p95. The human gate returned issues:
  unlabeled dial/plot/replay controls, unclear replay purpose, an unexplained
  detector cube, and misleading cyan/amber tank lines.
- Removed the light-sensor geometry and both tank lines. Replaced phase lamps
  with text, labeled the relative-turbidity gauge, dose/result plot, past-run
  replay controls, refill, clear, and destructive actions, and moved past-run
  comparison to a labeled cyan gauge needle.
- Labeled the rack JAR TEST, staged all six canonical doses, and expanded their
  authoritative display-clarity range for a visibly stronger static
  cloudiness spectrum. The requested NTU unit was not used because the model
  remains dimensionless and uncalibrated.
- Follow-up seated feedback found the instrument backboard too close to the
  hero tank. Shifted the complete backboard 0.38 m to apparatus-local X 2.10 m,
  preserving its height, labels, and control layout.
- A second seated adjustment brings the backboard 0.36 m toward the operator
  to apparatus-local Z 0.48 m and increases its inward yaw from -0.22 to -0.72
  radians so its face addresses the seated position.
- A final small placement pass brings the backboard another 0.14 m forward to
  local Z 0.62 m. Uniformly scaled the DoseLever and StartButton root groups to
  75%, preserving their control centers, discrete commands, and relative
  placement.
- Centered the seated starting position between the controls by moving their
  centers to symmetric X -0.30/+0.30 m positions and offsetting their shared
  deck -0.40 m to cancel the apparatus world offset. Removed the unexplained
  amber tested-jar diamonds and changed the authoritative jar-summary
  presentation from green/mint to a dark-brown through light-tan dose-result
  spectrum.
- Reduced the mounted result chart to 72% and shifted it right to clear the
  relative-turbidity dial. Replaced the jar rack's approximate combined dose
  string with six labels driven by the exact jar-center formula. Made the
  brown internal fills transparent at 0.80 opacity with depth writes disabled;
  doses 0/10 remain darkest, 2/8 medium, and 4/6 lightest.
- In-headset review found the transparent continuous jar colors
  indistinguishable. Replaced the subtle interpolation with three strongly
  separated render-only result tiers and raised fill opacity slightly to 0.82;
  authoritative summaries and stored endpoints remain unchanged.
- The first tiered capture was still flattened by the beige jar-wall overlay.
  Reduced the wall to 0.08 opacity and widened the fluid palette to near-black
  brown, medium brown, and pale gold for headset legibility.
- Live Quest inspection explained the apparent missing spectrum: the
  clear-results exercise had removed every canonical summary, and the remaining
  log held only odd doses 3/5/9, so all jars correctly showed the same raw-water
  fallback. Re-ran `review-ready` to stage authoritative 0/2/4/6/8/10 results;
  the live page now exposes all six canonical summaries at READY.
- Added a seated-facing START plaque to the physical button base. The required
  browser client visually confirms it and the XR interaction regression passes.
- The project owner stated the batch was good after requesting the START label.
  Record the combined Batch 07/08 human gate as accepted; no acceptance tags
  were created.

## Current TODO

- Begin Batch 09 only as a separate scoped increment. Its supported viewing
  targets are Quest immersive WebXR and the Chrome/Chromium browser simulation;
  mobile and broad cross-browser support are out of scope.
- Use an owner-operated low/optimum/high task card for capture and prepare a
  concise narration. Do not build cinematic autoplay or record final polished
  footage before Batch 10 visual/audio acceptance.
- Batch 09 preflight with the required bundled browser client loaded healthy
  authoritative READY state, but its default 16:9 headless frame was heavily
  occluded by the ground plane. The generic client also could not create an
  immersive runtime. Treat readable browser capture framing as real Batch 09
  work and use the established IWER/browser test path for immersive preflight.
- Standing, endurance, hosted deployment, and release work remain open in their
  governing later batches.

# Batch 10 working notes

- 2026-07-20: The project owner explicitly reordered the work so Batch 10
  visuals precede Batch 09 framing, screenshots, narration rehearsal, and final
  recording. This is a scheduling exception, not a Batch 09 acceptance.
- Added the one-page environment budget and composition plan at
  `docs/BATCH_10_ENVIRONMENT_BUDGET.md`.
- Added one shared render-only `PlantEnvironment` for desktop and XR: real
  floor, raised deck, structural columns, short safety rail, large L-shaped
  pipe run, partial basin, labeled slow flocculator silhouette, and no textures,
  shadows, simulation imports, or per-frame allocations.
- The first unconsolidated candidate failed the existing browser ceiling at 79
  ready-state draw calls. Instancing the structural boxes and pipe segments
  reduced the same composition to the established 70 ready / 71 replay
  ceilings; the tests were not relaxed.
- Raised only the Foundation desktop look target to working height. Preserved
  the accepted XR-shell desktop interaction camera after a fixed-coordinate
  canvas regression exposed that the shared camera change had moved Start.
- Reduced the two existing real-time light intensities and labeled the distant
  motion `FLOCCULATION BASIN` so it is not an unexplained decorative symbol.
- The required bundled browser client reports healthy authoritative READY state
  with no error artifact after each visual increment. Its default frame remains
  occluded below the horizon by the gray XR/development ground presentation;
  this is already tracked as later browser-framing work and is not portfolio
  capture evidence.
- Local visual-candidate validation passes: 23 Node contract tests, 135 Vitest
  tests across 29 files, all six Chromium scenarios, typecheck, production
  build, lint, and `git diff --check`.
- Quest 3 `2G0YC5ZG0M052K` is connected with the 5173 reverse and 9222 DevTools
  forward active. The live seated page reports READY, immersive session active,
  500 particles, 120 FPS-class idle cadence, 8.9 ms p95, and no application
  failure. Controllers were not currently detected, so this is preparation
  evidence rather than the controller-inclusive Batch 10 verdict.
- Added an executable static environment audit: five source draws, five
  materials, approximately 326 instanced triangles, no external texture bytes,
  and approximately 1.61 MB for the one self-created generated sign texture.
  Its focused Vitest coverage and the post-audit bundled-client READY/error
  check pass.

## Batch 10 current TODO

- Compare Hetchy and Sunol in seated Quest and select the release panorama.
- Audition classic, quiet, and warm sound profiles; verify Mute, dose, Start,
  phase, measurement, completion, and refill cues remain restrained.
- Record one controller-inclusive Quest performance, reach, and audio-lifecycle
  verdict, then accept or revise Batch 10.

## Batch 10 lab revision

- The first headset review rejected the flocculation-basin setting because the
  experiment should be situated in a lab.
- Replaced the entire industrial environment with a four-wall water-quality lab:
  large rear and side window openings, three perimeter benches, eight
  transparent beakers, three analyzers with physical screens, ceiling panels,
  and one slow magnetic stir bar. The accepted experiment apparatus remains
  unchanged.
- Extended the fourth wall behind both desktop cameras after the first lab
  render correctly showed that the camera had initially been placed outside the
  room.
- The revised lab remains five source draws, five materials, and approximately
  974 triangles. Focused typecheck/unit checks, the bundled-client READY/error
  pass, screenshot inspection, and all six Chromium scenarios pass.
- The window openings currently show the development void. Integrate the
  owner's panorama only after it is attached, inspect it as a 2:1
  equirectangular source, and record provenance.
- The revised lab hot-loaded into the active seated Quest session. Both
  controllers are detected at READY; the stable 300-frame window reports
  119.98 FPS, 9.0 ms p95, 30 draw calls, 500 particles, and no application
  failure. Human composition feedback remains the visual authority.
- Integrated the exact owner-provided 5,216 by 1,608 Hetchy panoramic strip as
  a distant inward-facing cylinder outside the real lab windows. A cylinder is
  intentional because the 3.24:1 source is not a 2:1 equirectangular image.
- Changed the `JAR TEST` marker to a larger solid light plaque with dark text so
  it no longer reads as transparent against the room.
- After headset feedback, raised the panorama one meter and added a complete
  room-spanning ceiling behind the three existing light panels. The ceiling
  shares the instanced structure draw; the audited environment remains five
  source draws and five materials at approximately 1,114 triangles.
- Post-change contract tests, all 136 Vitest tests, typecheck, and lint pass.
  The required bundled browser client rendered healthy authoritative READY
  state with no console-error artifact, and visual inspection confirms the
  panorama is window-bounded and the ceiling closes the room.
- The same candidate is live in the seated Quest session with no application
  failure. Its current 300-frame development sample reports 112.77 average FPS,
  14 ms p95, 36 draw calls, and 500 particles while a compatible ghost replay
  is paused. Controllers were not held during this status sample, so the next
  human interaction pass remains the controller-inclusive authority.
- Follow-up headset feedback moved the panorama from the provisional one-meter
  lift to an exact 10 percent vertical shift, extended the front wall into the
  ceiling slab to close the last seam, and rebuilt the opaque `JAR TEST` plaque
  as a large physical sign mounted across the rack top for reliable visibility.
- Extended all nine rear and side window mullions from the sill through the
  upper wall band so every visible beam now terminates inside the ceiling slab;
  this changes only existing instance transforms and adds no geometry or draw.
- Added the project-owner-created 8,662 by 1,597 Sunol strip as the bounded
  `?panorama=sunol` comparison while retaining Hetchy as the default. The owner
  confirmed authorship and publication permission. Each strip now uses an
  aspect-correct cylindrical height and the accepted 10 percent vertical shift.
- Added a self-generated audio candidate with no external audio assets: classic,
  quiet, and warm URL-selectable profiles; phase-linked room/process ambience;
  restrained dose, Start, measurement, completion, refill, log-clear, and replay
  cues; and a physical `MUTE` button beside Start.
- Audio is app-owned, lazily unlocked by a user gesture, absent from simulation
  and render ownership, suspended on document hide, and disposed on teardown.
  Persistent process nodes allocate outside the hot loop; short-lived nodes are
  intentionally allocated only for discrete sound events.
- The focused browser interaction check physically toggled Mute off/on and
  confirmed audio initialization without a console-error artifact. A warm-profile
  Start press reported authoritative `RAPID_MIX` and the matching audio phase.
  The full checkpoint now passes 24 contract tests and 139 Vitest tests across
  31 files. Human headset listening remains the sound-quality authority.
- First headset listening found the candidate barely audible and dominated by
  uniform static. Reduced the continuous noise bed, raised master/event levels,
  strengthened dose and Start mechanics, and added deterministic phase-specific
  periodic detail: rapid-mix relay pulses, flocculation bubbles and ticks,
  sparse settling bubbles, measurement chimes, and refill water/bubbles.
- Confirmed the headset had remained on `panorama: hetchy` after the earlier
  Android intent. Extended the Quest restart harness to accept panorama and
  sound arguments, navigated the actual inspected tab, and confirmed the live
  state now reports `panorama: sunol` with classic audio. Navigation correctly
  ended the prior immersive session, so the user must re-enter VR for review.
- Consolidated Dose, Start, Mute, and the new Hetchy/Sunol scenery selector on
  one physical operator dashboard. Dose and Start are each 75 percent of their
  immediately preceding headset-review size. The selector changes the in-scene
  panorama without navigating or ending the XR session.
- Extended the results backboard exactly five percent toward the operator's
  right without moving its left edge, and added sparse synthesized two-note
  ambient phrases to the existing generated soundscape. Music is muted by the
  same physical control and remains independent of treatment results.
- Completed the physical-dashboard headset pass: reduced its footprint to 75
  percent, distributed Dose/Start/Mute/scenery controls across it, moved only
  the dashboard to its owner-directed final horizontal position, and laid all
  dashboard text flat. The apparatus/view offset and scenery-button text were
  tuned separately so the tank remains visible and both labels clear the bezel.
- The project owner accepted the resulting seated lab candidate and selected a
  hosted v0.1.0 WebXR site as the release product. Narration, further concepts,
  and a sideloadable APK are deferred. Release work now owns a frictionless root
  URL, GitHub Pages deployment, hosted Quest verification, final still/video,
  and the v0.1.0 tag.
- Published commit `4ab62c1` through the repository's HTTPS-enforced GitHub
  Pages workflow at `https://boxwrench.github.io/Sunol-Flowlab-VR/`. The bare
  URL now opens the complete seated Sunol experience with one Enter VR action;
  the prior diagnostic desktop controls remain on `?mode=desktop` only.
- The exact repository-subpath preview and deployed origin each loaded one
  canvas and one Enter VR button with no failed requests or console errors.
  Production requested only the main application chunk; the emitted IWER room
  and emulator chunks were not eagerly requested. The hosted final still is
  retained under `docs/images/sunol-flowlab-v0.1/`.
- The project owner opened that exact HTTPS URL in Quest Browser, entered the
  immersive experience, and accepted the hosted candidate as "very good."
  This closes the hosted-entry and final visual/audio review gate. The bounded
  endurance/repeat-cycle check, operator-led video, and v0.1.0 tag remain.
