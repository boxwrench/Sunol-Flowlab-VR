# Implementation Plan Authority

This file is the active delivery index for released Sunol FlowLab VR v0.1 and
approved post-release work. Detailed plans live in
[docs/plans](docs/plans/README.md); validation records and design authorities
are indexed from [docs/README.md](docs/README.md).

## Current release status

Sunol FlowLab VR v0.1.0 is released. The public GitHub Pages experience,
corrected seated height, low/optimum/high repeat cycle, refills, immersive
re-entry, direct Quest-view recording, and narrated release cut passed owner
review.

| Batch | Status                 | Closing gate                                                                |
| ----- | ---------------------- | --------------------------------------------------------------------------- |
| 00    | Substantially complete | Contracts, toolchain, data boundary, and hosted route established           |
| 01A   | Accepted               | Deterministic rendered foundation and stability observation passed          |
| 01B   | Accepted               | Local and hosted Quest WebXR routes passed                                  |
| 02A   | Accepted               | Deterministic eleven-dose phenomenon proof passed                           |
| 02B   | Deferred               | Spatial hashing and pooling remain evidence-gated                           |
| 03    | Accepted               | Final model and apparatus accepted with documented recognition waiver       |
| 04    | Accepted               | Physical Quest dose and Start interaction passed with documented waivers    |
| 05    | Accepted               | Desktop/XR simulation integration and parity passed                         |
| 06    | Accepted               | Complete treatment cycle, refill, and lifecycle handling passed             |
| 07    | Accepted               | Instrumentation, persistence, and experiment memory passed                  |
| 08    | Accepted               | Headset readability and result comparison passed                            |
| 09    | Accepted               | Owner-operated narrated Quest demonstration passed                          |
| 10    | Accepted               | Laboratory, scenery, dashboard, and audio passed                            |
| 11    | Released               | Public experience, video, notes, and v0.1.0 release complete                |
| 12    | Accepted               | California-first library and three visual-polish passes passed Quest review |

## Next roadmap

Work proceeds in this order:

1. **Submission and media polish:** upload the narrated demonstration to
   YouTube, verify playback in Quest Browser and desktop Chrome, replace the
   forced-download README link, add a compact **Built With** line, and give
   GPT-5.6 Thinking its own accurate README subsection.
2. **Persisted trial identity:** replace the session-local result sequence in
   record IDs with an injected application-owned ID factory. Production uses
   `crypto.randomUUID()`; tests use deterministic fakes. The scientific result
   remains deterministic.
3. **Runtime project version:** inject the package version into the application
   build and add a contract proving persisted logs use the package version
   rather than the current hard-coded `0.0.0`.
4. **v0.2.0 release target:** the owner selected `v0.2.0` because current
   `main` already contains the accepted reference library and visual polish
   and deploys automatically. Update the package version, release notes, and tag
   only after hardening and final validation pass.
5. **No-behavior naming cleanup:** after the correctness fixes, retire permanent
   `Batch07*`, `dispatch_batch07_command`, and stale Batch 06 error names in a
   separate commit. Do not mix this rename with identity or version changes.
6. **Structured user study:** observe two water operators, one educator or
   trainer, and two non-operators completing three trials without coaching.
   Record behavior separately from opinions.
7. **Second-module discovery:** only after user evidence, scope a narrow
   phenomenological rapid-filter lesson around loading, headloss, breakthrough,
   and backwash. Do not extract a universal FlowLab engine before that second
   module reveals genuinely shared infrastructure.

The detailed correctness and release gates are in the
[post-release hardening plan](docs/plans/post-release-hardening.md).

## Ordered batch plans

1. [Batch 00 - Pre-build contracts](docs/plans/batch-00-prebuild-contracts.md)
2. [Batch 01 - Foundation and WebXR preflight](docs/plans/batch-01-foundation-and-xr-preflight.md)
3. [Batch 02 - Deterministic simulation foundation](docs/plans/batch-02-deterministic-simulation-foundation.md)
4. [Batch 03 - Desktop phenomenon proof](docs/plans/batch-03-desktop-phenomenon-proof.md)
5. [Batch 04 - Standalone XR interaction shell](docs/plans/batch-04-standalone-xr-interaction-shell.md)
6. [Batch 05 - Simulation and XR integration](docs/plans/batch-05-simulation-xr-integration.md)
7. [Batch 06 - Treatment-cycle state machine](docs/plans/batch-06-treatment-cycle-state-machine.md)
8. [Batch 07 - Physical instrumentation and persistence](docs/plans/batch-07-physical-instrumentation-and-persistence.md)
9. [Batch 08 - Headset readability and clearing front](docs/plans/batch-08-headset-readability-and-clearing-front.md)
10. [Batch 09 - Browser presentation and capture](docs/plans/batch-09-desktop-spectator-experience.md)
11. [Batch 10 - Presence, environment, and audio](docs/plans/batch-10-presence-environment-and-audio.md)
12. [Batch 11 - Release hardening and deployment](docs/plans/batch-11-release-hardening-and-deployment.md)
13. [Batch 12 - California-first reference library](docs/plans/batch-12-reference-library.md)
14. [Post-release hardening and v0.2.0 release](docs/plans/post-release-hardening.md)

Batch files preserve scoped implementation intent, non-goals, and acceptance
criteria. Their historical language is evidence of the planned sequence; the
status table above is the current authority when an older batch paragraph
describes a gate that has since closed.

## Binding design and model direction

The [hybrid jar-test bench and hero observation tank](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md)
governs product meaning:

- one live authoritative simulation in the hero tank;
- six static canonical jar summaries for doses 0, 2, 4, 6, 8, and 10;
- one eleven-detent physical dose control;
- one mounted plot and versioned experiment log as complete memory.

The [modeling research amendment](docs/MODELING_RESEARCH_AMENDMENT.md) governs
the v0.1 process model. Mass is authoritative, merges are deterministic and
mass-conserving, diameter follows the approved fractal relationship, settling
is capped, and suspended projected area supplies the dimensionless relative
optical-load authority.

The [treatment-result ghost design](docs/GHOST_REPLAY_DESIGN.md) governs saved
comparison results. The application records optical-load bands at 10 Hz and
replays them with bounded interpolation. It does not record particles or rerun
the simulation.

## Scope boundaries

- Coagulation is the only v0.1 process module.
- Quest immersive WebXR and Chrome/Chromium desktop viewing are the supported
  targets.
- Mobile layouts and a sideloadable APK are deferred. Narration is release
  media and is not part of the interactive runtime.
- No calibrated NTU, operating guidance, plant prediction, CFD, or universal
  FlowLab engine is authorized.
- Batch 12 adds cited educational reading without changing simulation authority,
  process behavior, or operating-guidance boundaries.
- Post-release identity and metadata fixes must not retune the model, alter
  accepted presentation, or add a process module.
- Filtration remains discovery scope until the structured user study is
  complete and the owner explicitly approves a bounded implementation plan.
- Post-v0.1 mechanistic research remains governed by
  [docs/POST_V1_MECHANISTIC_COAGULATION_RESEARCH.md](docs/POST_V1_MECHANISTIC_COAGULATION_RESEARCH.md).

The superseded Godot-era plan remains in [docs/archive](docs/archive/README.md)
for provenance and is non-binding.
