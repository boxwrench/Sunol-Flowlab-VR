# Implementation Plan Authority

The active implementation plan is the ordered Markdown batch series:

1. [Batch 00 - Pre-build contracts](batch-00-prebuild-contracts.md)
2. [Batch 01 - Foundation and WebXR preflight](batch-01-foundation-and-xr-preflight.md)
3. [Batch 02 - Deterministic simulation foundation](batch-02-deterministic-simulation-foundation.md)
4. [Batch 03 - Desktop phenomenon proof](batch-03-desktop-phenomenon-proof.md)
5. [Batch 04 - Standalone XR interaction shell](batch-04-standalone-xr-interaction-shell.md)
6. [Batch 05 - Simulation and XR integration](batch-05-simulation-xr-integration.md)
7. [Batch 06 - Treatment-cycle state machine](batch-06-treatment-cycle-state-machine.md)
8. [Batch 07 - Physical instrumentation and persistence](batch-07-physical-instrumentation-and-persistence.md)
9. [Batch 08 - Headset readability and clearing front](batch-08-headset-readability-and-clearing-front.md)
10. [Batch 09 - Desktop spectator experience](batch-09-desktop-spectator-experience.md)
11. [Batch 10 - Presence, environment, and audio](batch-10-presence-environment-and-audio.md)
12. [Batch 11 - Release hardening and deployment](batch-11-release-hardening-and-deployment.md)

## Approved design direction

[Hybrid Jar Test Bench and Hero Observation Tank](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md) governs product intent and presentation meaning. The [original PDF brief](docs/Sunol%20FlowLab%20VR%20Design%20Brief.pdf) is retained beside the repository-native Markdown version. This index and the individual batch plans remain authoritative for implementation timing, scope, tests, evidence, and acceptance.

The staged v1 composition is:

- one live authoritative simulation in a visually dominant hero observation tank;
- one six-jar rack representing canonical dose presets 0, 2, 4, 6, 8, and 10;
- one physical 11-detent control preserving every integer DoseIndex from 0 through 10;
- static write-on-completion jar summaries only for exact canonical doses;
- one complete dose-response plot and versioned experiment log containing history for all eleven doses;
- recognition validation from an unlabeled composition screenshot before instrumentation is finalized.

The jar rack never requires six live simulations and never replaces the complete plot or experiment log.

## Current status

| Batch | Status                 | Gate                                                                      |
| ----- | ---------------------- | ------------------------------------------------------------------------- |
| 00    | Substantially complete | Physical Quest route remains open                                         |
| 01A   | Nearly complete        | Uninterrupted five-minute post-fix rerun                                  |
| 01B   | Blocked                | Physical Quest 3 and hosted smoke route                                   |
| 02    | Not started            | Named runtime-ownership package complete; Batch 01A rendered gate remains |
| 03–11 | Not started            | Predecessor gates                                                         |

`Sunol FlowLab Implementation Plan.pdf` describes a pre-existing Godot plant-simulation repository and does not match this greenfield WebXR repository. It is retained as a superseded source artifact and is non-binding. `batch-03-desktop-phenomenon-proof (1).md` is a retained legacy duplicate snapshot; it may not match the active Batch 03 plan and is non-authoritative.

Batch 01A has an app-owned deterministic runtime, read-only rendering consumption, permanent telemetry, and a measured 500-particle foundation. Its rendered gate remains open until the uninterrupted post-fix observation is recorded. Batch 01B and every real-device acceptance criterion remain open until verified on the physical headset.

Batch 02 now prioritizes the minimum deterministic substrate for the 11-dose phenomenon proof. Generalized collision, pooling, mass/density, and merge-animation machinery belong to conditional Batch 02B work and require benchmark or visible-behavior evidence.

The hybrid direction maps runtime ownership to Batch 01A closure; hero-tank and jar-rack blockout plus recognition validation to Batch 03; interaction to Batch 04; integration to Batches 05-06; static jar summaries and complete memory to Batch 07; readability to Batch 08; spectator presentation to Batch 09; presence to Batch 10; and release evidence to Batch 11.
