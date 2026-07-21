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
- Hosted follow-up found the per-origin viewer height approximately 20 cm too
  high. Commit `d37e27f` added a seated-only -0.20 m XR player-origin offset
  without moving the lab or desktop camera. The owner accepted the corrected
  height, then completed hosted Dose 0, Dose 5, and Dose 10 trials with refills
  plus XR exit/re-entry and reported a pass.
- Repository curation moved the twelve detailed batch plans from the root into
  `docs/plans/`, replaced stale status-heavy plan and handoff prose with concise
  current indexes, categorized `docs/README.md`, and refreshed the deployed
  architecture summary. Three unused transitional app modules and their
  superseded adapter-only tests were removed; the valuable Batch 05 parity and
  interruption checks now exercise the current `TreatmentCycleController`.
- Removed the unused `@react-three/drei` direct dependency and its 33
  transitive packages, plus one superseded pre-v0.1 README screenshot. Ignored
  build output, test captures, logs, and TypeScript cache were cleared locally.
  Git history remains the recovery path for pruned tracked files.

# Batch 12 reference-library working notes

- Original Batch 12 prompt: Add clickable reference books about coagulation and
  jar testing that open in-app video or readable text, using California or AWWA
  sources and replacing model limitations with enhanced coagulation.
- Started from released v0.1.0 commit `191f352` with only user-owned
  `.agents/` untracked.
- Added a California-first four-book content contract, physical book stand,
  temporary in-world reader, bounded paging, source links, and Close.
- Focused unit tests, type checking, a browser scenario, and the required
  bundled-client real canvas interactions pass. Screenshots were inspected
  after initial placement and after the centered-reader revision.
- Full validation passes: 26 repository contracts, 31 Vitest files with 140
  tests, typecheck, lint, standard and Pages production builds, 03D acceptance,
  benchmark, formatting, and seven single-worker Chromium scenarios.
- Restored the browser command to its documented single-worker policy after two
  parallel seven-WebGL runs advanced real-time playback during deterministic
  assertions. No timing assertion was weakened.
- Loaded the current candidate on the connected Quest 3 through the local
  reverse route and confirmed the development state exposes the closed
  reference library at READY. Human controller/readability review remains.
- No model, simulation authority, treatment timing, persistence, or v0.1
  release artifact changed. No third-party document or video is bundled.
- Replaced the first loose-book stand with a recognizable two-shelf wood
  bookcase placed to the seated operator's left and angled toward the origin.
  Added distinct book volumes, page edges, a physical library plaque, and a
  static lower row of lab notes while keeping the reader's accepted centered
  world placement independent from the shelf transform.
- The required browser client visually confirms the bookcase, opened reader,
  and second page. Real canvas input opens, advances, and closes the book with
  matching `render_game_to_text` state and no console-error artifacts. The
  post-revision contract/unit suite, lint, typecheck, production build, and all
  seven single-worker Chromium scenarios pass.
- At owner direction, moved only the bookcase 0.30 m farther left and 0.30 m
  forward toward the seated origin, from world `(-1.85, 0.20, -1.05)` to
  `(-2.15, 0.20, -0.75)`. The temporary reader retains its centered world
  placement. Browser screenshots confirm the clearer separation, and real
  canvas input still opens and closes the relocated book without console errors.
- Headset review found that intermediate placement still intersected the long
  side bench. Moved the bookcase another 0.90 m forward to world
  `(-2.15, 0.20, 0.15)` and changed its yaw from `0.95` to `1.40` radians so it
  remains aimed at the seated origin. The browser view now shows clear space
  between the bookcase, side bench, and jar-test table; a visible book still
  opens and closes with matching text state and no console errors.
- The owner confirmed that the collision-clear bookcase placement works.

# Post-v0.1 visual-polish working notes

- The owner authorized three separate review passes: materials/color variation,
  then baked/fake lighting, then sparse textures. Each layer receives its own
  headset verdict before the next begins.
- Art pass 1 changes only material response and palette. Split the lab's box
  instances into matte structure/cabinetry and satin work-surface/equipment
  draws; introduced warmer ceiling/counter colors, stronger window-frame
  contrast, cabinet variation, and three restrained analyzer/screen variants.
  Lighting, shadows, textures, geometry, simulation, and apparatus values are
  unchanged.
- The material distinction adds exactly one instanced draw and one shared
  material, moving the audited environment budget from five to six of each
  without adding triangles or texture memory. Focused budget, architecture,
  and type checks pass; the required browser screenshot shows intact label,
  tank, jar, and instrument contrast with no console errors.
- Headset review found flicker where the darker wall pillars met the ceiling.
  The cause was pre-existing geometry overlap made visible by the stronger
  palette: pillars and window headers extended 0.03 m into the ceiling, and the
  front wall extended 0.07 m into it. All now terminate exactly at the 3.17 m
  ceiling underside. A regression audit fixes the four vertical seam values at
  3.17 m; three successive browser frames show a closed, stable junction with
  no console-error artifacts. Art pass 2 remains unstarted.
- The first seam correction looked unchanged in headset. A live Quest audit
  proved the candidate was not stale: the local seam-fix URL was immersive and
  the fetched source contained the new seam constants and material split. The
  remaining coplanarity was pillar-versus-header, not pillar-versus-ceiling:
  each pillar shared the wall's interior face while extending through the upper
  header band. Rebuilt all nine as 0.06 m shallow trims attached exactly to,
  but sitting proud of, the rear and side wall faces. Surface-join regression
  checks and three successive browser frames pass without errors.
- The owner confirmed that the stronger palette difference is good. No image
  texture maps have been added yet; the visible surface difference in this pass
  comes only from color, roughness, and metalness. Sparse textures remain the
  separately reviewed third art pass.
- After the trim separation passed, the newly proud center pillar obscured the
  centered `WATER QUALITY LAB` plaque. Shifted only the plaque 1.35 m into the
  clear right-hand header bay, preserving its height, scale, and orientation.
  Browser inspection confirms full pillar clearance and no console errors.
- The owner accepted the relocated lab plaque and closed art pass 1.
- Art pass 2 replaces each scene's flat ambient/directional pair with one shared
  Quest-safe hemisphere fill and one warm directional key. Ceiling panels and
  analyzer screens share one self-lit instanced draw; there are no dynamic
  shadows, environment maps, textures, or new per-frame work.
- An initial five-instance contact-shade candidate looked grounded in the
  browser but raised compatible-replay draw calls from the binding ceiling of
  71 to 73. Removed that draw and consolidated the non-luminous lab boxes while
  preserving the accepted palette. The final candidate remains six environment
  draws, six materials, approximately 1,114 triangles, and zero added texture
  bytes; the browser returns to the established 70/71 ceilings.
- The required client screenshot shows readable controls, jar labels, lab sign,
  tank, and self-lit fixtures at authoritative READY state with no console-error
  artifact. Full validation passes: 27 Node contracts, 142 Vitest tests, all
  seven single-worker Chromium scenarios, typecheck, lint, production build,
  and `git diff --check`. Seated Quest lighting review remains the human gate;
  sparse textures are still untouched.
- The owner passed the seated Quest lighting candidate and closed art pass 2.
- Art pass 3 adds one deterministic self-created 64 by 64 warm-neutral surface
  map to the existing shaded lab material. It is visibly restrained on the
  floor and structural faces while leaving fixtures, screens, glass, labels,
  the tank, and jar fluids clean. It adds 16,384 decoded RGBA bytes but no file,
  network request, draw call, material, triangle, or frame-loop work; disposal
  is explicit on environment teardown.
- The required browser capture reports the same 118 development draw calls as
  the accepted lighting candidate at READY, with matching text state and no
  console-error artifact. Full texture-candidate validation passes: 27 Node
  contracts, 143 Vitest tests, all seven single-worker Chromium scenarios,
  typecheck, lint, production build, and `git diff --check`. Seated Quest
  texture review is the remaining art-pass gate.
- The owner passed the seated Quest texture candidate and closed art pass 3.
  Materials/color, lighting, and sparse texture polish are now all accepted.
- The subsequent library interaction review found the shelf too dim and direct
  PDF sources entering Quest Browser's paused-download flow. Brightened the
  existing wood, book-cover, page-edge, and lower-row materials through bounded
  emissive response only; this adds no light, geometry, draw, or material.
- Replaced all four direct runtime PDF targets with official HTML resource
  pages and relabeled the reader control `WEB`. California books now open the
  State Water Board's Safe Drinking Water Plan or Mendocino jar-testing page;
  enhanced coagulation opens EPA's Surface Water guidance-manual page. The
  exact underlying PDFs remain documented for desktop use. No third-party PDF
  viewer, copied document, proxy, or new runtime asset was added.
- The required closed-shelf and opened-reader captures were inspected: the
  stronger library illumination is visible, `WEB` is clear, READY state matches,
  and the closed scene remains at 118 development draw calls. Full validation
  passes: 27 Node contracts, 143 Vitest tests, all seven single-worker Chromium
  scenarios, typecheck, lint, production build, and `git diff --check`.
- Quest review then proved that `window.open` is blocked when invoked from the
  immersive controller event, so `WEB` appeared inert. Replaced the popup with
  same-tab `window.location.assign`; opening a source now intentionally exits
  VR, and Browser Back returns to the app for re-entry.
- The required real-canvas choreography opened Enhanced Coagulation and caused
  the expected navigation-time context teardown at `WEB`. A controlled follow-up
  asserted the exact EPA destination URL and zero console errors. A new source
  contract forbids restoring the popup path. Final validation passes: 28 Node
  contracts, 143 Vitest tests, all seven Chromium scenarios, typecheck, lint,
  production build, and `git diff --check`.
- The owner confirmed the revised Quest library as good. Brightness, in-app
  paging/Close, and same-tab `WEB` navigation are accepted; this closes the
  Batch 12 human gate.

## Batch 12 TODO

- Package the accepted Batch 12 library and visual-polish work as a v0.2
  candidate when authorized.
