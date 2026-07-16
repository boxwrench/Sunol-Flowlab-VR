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

Batch files describe scope and gates, not branches that are assumed to exist. The current repository branch is `main`. Use a scoped feature branch or isolated worktree only when explicitly coordinated for a concrete increment; branch names in old plan history are non-authoritative.

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

## Approved modeling direction

[The coagulation and flocculation modeling research amendment](docs/MODELING_RESEARCH_AMENDMENT.md) governs the final version 1 process model wherever it conflicts with the accepted Batch 02A prototype guidance. Batch 02A remains an evidence baseline; Workstream 03D owns the bounded replacement with mass-authoritative aggregation, fractal-derived diameter and density, capped size-dependent settling, and one projected-area relative optical-load authority.

This approval does not authorize a universal engine. Version 1 has no free list, spatial hashing remains profiling-gated, and the model remains phenomenological rather than calibrated dose, NTU, mechanistic chemistry, or plant prediction.

## Approved replay direction

[The treatment-result ghost replay design](docs/GHOST_REPLAY_DESIGN.md) governs version 1 recording and playback. A ghost stores the authoritative optical-load history at 10 Hz with versioned compatibility metadata, then uses an application-owned playback clock and linear interpolation. It is a clarity/result replay, not particle replay or simulation recomputation.

The work remains staged: Workstream 03D exposes the authoritative samples; Batch 06 supplies the completed result and phase timeline; Batch 07 owns recording, compatibility, measured small-library persistence, deletion, and playback runtime; Batch 08 owns a restrained subordinate visual comparison. The complete plot and experiment log remain the only complete memory across all trials; saved ghosts are a limited, separately managed subset.

## Current status

| Batch | Status                 | Gate                                                 |
| ----- | ---------------------- | ---------------------------------------------------- |
| 00    | Substantially complete | Hosted HTTPS route remains open                      |
| 01A   | Accepted               | Uninterrupted post-fix rendered observation recorded |
| 01B   | Partially accepted     | Local Quest route passed; hosted smoke remains open  |
| 02A   | Accepted               | Deterministic 11-dose phenomenon proof recorded      |
| 02B   | Deferred               | Spatial hash and render metadata still need evidence |
| 03    | In progress            | 03D model refinement; human review open and parked   |
| 04–11 | Not started            | Predecessor gates                                    |

An [earlier Godot implementation plan](docs/archive/Sunol%20FlowLab%20Implementation%20Plan%20%28superseded%20Godot%29.pdf) is retained only as a superseded source artifact for provenance and is non-binding for this greenfield WebXR repository. The stale duplicate Batch 03 snapshot and superseded pre-research mechanics were removed from the active tree; Git history preserves them. Only [the indexed Batch 03 plan](batch-03-desktop-phenomenon-proof.md) is authoritative.

Batch 01A has an app-owned deterministic runtime, read-only rendering consumption, permanent telemetry, a measured 500-particle foundation, and an accepted uninterrupted 310-second post-fix Chrome observation. The local physical portion of Batch 01B passed on Quest 3 through ADB reverse: immersive entry, both controllers, select input, target selection, remote inspection, baseline metrics, and clean session exit were observed. Batch 01B remains open only for its separately authorized hosted-HTTPS smoke deployment.

Batch 02A is accepted in [its closing packet](docs/BATCH_02A_ACCEPTANCE.md): the canonical minimum is Dose 5, both tail margins exceed the regression threshold, the extended nine-seed suite passes, and the complete 500-particle phenomenon path remains well inside the desktop benchmark ceiling. That statistical substrate remains the comparison baseline. The approved modeling amendment now supplies the product-model justification for mass-authoritative deterministic merging and derived density in Workstream 03D. It explicitly rejects a version 1 free list; spatial hashing and merge-animation metadata remain deferred pending evidence.

Batch 03 now has an independently runnable desktop proof, one band-driven
optical-load gradient surface, a dominant hero tank, six static canonical jar blockouts,
deterministic low/optimum/high presets, clearing-front diagnostics, and an
unlabeled proof mode. Automated and visual evidence is recorded in
[the Batch 03 progress packet](docs/BATCH_03_PROGRESS.md). The next active work
is the approved Workstream 03D model refinement. The required external
recognition response and comparative low/optimum/high human review remain open
but are intentionally parked while the model changes.

The hybrid direction maps runtime ownership to Batch 01A closure; hero-tank and jar-rack blockout plus recognition validation to Batch 03; interaction to Batch 04; integration to Batches 05-06; static jar summaries, complete memory, and treatment-ghost recording/playback runtime to Batch 07; live-versus-ghost readability to Batch 08; spectator presentation to Batch 09; presence to Batch 10; and release evidence to Batch 11.
