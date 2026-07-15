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

| Batch | Status                 | Gate                                                 |
| ----- | ---------------------- | ---------------------------------------------------- |
| 00    | Substantially complete | Hosted HTTPS route remains open                      |
| 01A   | Accepted               | Uninterrupted post-fix rendered observation recorded |
| 01B   | Partially accepted     | Local Quest route passed; hosted smoke remains open  |
| 02A   | Accepted               | Deterministic 11-dose phenomenon proof recorded      |
| 02B   | Deferred               | Requires measured performance or visible need        |
| 03    | In progress            | External recognition and visual-review gates open    |
| 04–11 | Not started            | Predecessor gates                                    |

An [earlier Godot implementation plan](docs/archive/Sunol%20FlowLab%20Implementation%20Plan%20%28superseded%20Godot%29.pdf) is retained only as a superseded source artifact for provenance and is non-binding for this greenfield WebXR repository. The stale duplicate Batch 03 snapshot was removed; Git history preserves it. Only [the indexed Batch 03 plan](batch-03-desktop-phenomenon-proof.md) is authoritative.

Batch 01A has an app-owned deterministic runtime, read-only rendering consumption, permanent telemetry, a measured 500-particle foundation, and an accepted uninterrupted 310-second post-fix Chrome observation. The local physical portion of Batch 01B passed on Quest 3 through ADB reverse: immersive entry, both controllers, select input, target selection, remote inspection, baseline metrics, and clean session exit were observed. Batch 01B remains open only for its separately authorized hosted-HTTPS smoke deployment.

Batch 02A is accepted in [its closing packet](docs/BATCH_02A_ACCEPTANCE.md): the canonical minimum is Dose 5, both tail margins exceed the regression threshold, the extended nine-seed suite passes, and the complete 500-particle phenomenon path remains well inside the desktop benchmark ceiling. Generalized collision, pooling, mass/density, and merge-animation machinery remain deferred under Batch 02B because no benchmark or visible-behavior evidence justifies them.

Batch 03 now has an independently runnable desktop proof, one band-driven
turbidity surface, a dominant hero tank, six static canonical jar blockouts,
deterministic low/optimum/high presets, clearing-front diagnostics, and an
unlabeled proof mode. Automated and visual evidence is recorded in
[the Batch 03 progress packet](docs/BATCH_03_PROGRESS.md). Acceptance remains
open until the required operator or educator recognition response and the
comparative low/optimum/high human review are recorded.

The hybrid direction maps runtime ownership to Batch 01A closure; hero-tank and jar-rack blockout plus recognition validation to Batch 03; interaction to Batch 04; integration to Batches 05-06; static jar summaries and complete memory to Batch 07; readability to Batch 08; spectator presentation to Batch 09; presence to Batch 10; and release evidence to Batch 11.
