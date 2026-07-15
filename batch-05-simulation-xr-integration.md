# Batch 05 Implementation Plan: Simulation and XR Integration

**Status:** Not started — predecessor gates remain open
**Branch:** `batch-05-xr-integration`  
**Depends on:** Batch 03 and Batch 04 both accepted  
**May run in parallel with:** Review, parity-test preparation, trace analysis  
**Primary gate:** The proven desktop simulation runs inside the proven XR apparatus with the same qualitative behavior, deterministic results, and acceptable Quest performance.

## Goal

Combine two already-proven systems without redesigning either one. Integration should expose mismatches, not become an excuse to refactor simulation behavior and XR interaction simultaneously.

## Agent execution rules

- Read `CLAUDE.md`, the current repository tree, `package.json`, and relevant tests before proposing edits.
- Summarize the current architecture and any conflicts with this plan before writing code.
- Use one implementation owner per worktree. A second agent may review, but must not edit concurrently.
- Implement only this batch. Do not pull later-batch work forward because it appears convenient.
- Preserve the `/sim`, `/render`, `/xr`, and `/app` ownership boundaries.
- Keep simulation state outside React. Do not add React state updates to the hot simulation path.
- Report uncertainty instead of inventing package APIs, especially for the pinned `@react-three/xr` version.
- Produce evidence: changed files, commands run, test output, performance measurements where applicable, known limitations, and remaining hot-path allocations.
- Do not mark the batch complete until every acceptance criterion has objective evidence.

## Integration principles

- `/sim` remains unaware of React, Three.js, and XR.
- `/xr` continues to emit discrete commands only.
- `/render` consumes simulation output and owns instance synchronization.
- `/app` coordinates the selected dose, simulation lifecycle, desktop/XR mode, and scene composition.
- Desktop and XR paths share one treatment implementation.

## Work package 05.1 - Integration contract review

Before edits:

- compare the actual Batch 03 simulation API with the Batch 04 command API;
- identify adapter needs;
- freeze the simulation config and accepted baseline curve for the duration of integration;
- capture a pre-integration desktop sweep artifact;
- capture a pre-integration XR shell performance trace.

Do not begin by changing either interface. Prefer a small adapter in `/app`.

## Work package 05.2 - App command adapter

Implement controlled command routing:

- `SET_DOSE` updates the ready-state dose only;
- `START_TRIAL` invokes the existing development trial runner or temporary start hook;
- invalid commands are rejected and logged;
- dose remains integer and clamped by type/runtime validation;
- command handling is testable without a headset.

This batch may use a temporary limited lifecycle until Batch 06 supplies the full state machine.

## Work package 05.3 - Place the simulation in the XR tank

- Align simulation coordinates with tank geometry through one documented transform.
- Avoid applying world transforms independently to each particle.
- Place the existing `InstancedMesh` renderer in the XR scene.
- Add the existing gradient turbidity quad.
- Preserve the desktop proof route unchanged.
- Ensure tank dimensions and particle scale read at arm’s length.

## Work package 05.4 - Render synchronization

- Reuse one instance-sync path across desktop and XR.
- Measure simulation step and instance upload separately.
- Avoid copying full particle arrays into React state.
- Avoid creating per-frame arrays or per-particle Three.js objects.
- Update only active instance matrices and necessary shader uniforms.
- Confirm render interpolation or merge tweening does not alter simulation results.

## Work package 05.5 - Transparency and depth-order validation

Test the minimum transparent stack:

- open-top glass walls;
- one gradient quad;
- particles;
- no additional water volume mesh unless proven necessary.

Check:

- left and right eye consistency;
- sorting artifacts from common viewing angles;
- floc visibility against the quad;
- tank wall opacity and thickness;
- overdraw and draw-call impact.

Simplify visual layers before considering architectural changes.

## Work package 05.6 - Desktop/XR parity tests

For canonical seeds and doses:

- run the same fixed simulation steps headlessly and in the integrated app;
- compare endpoint turbidity and band summaries;
- verify XR frame rate does not change simulation timestep or measurement endpoint;
- confirm desktop and XR render paths consume the same state;
- verify no headset-specific chemistry constants exist.

The visual result may differ because of stereo and display characteristics, but the simulation result must not.

## Work package 05.7 - Quest profiling

Capture at 500 particles through all current trial phases:

- average FPS;
- average and p95 frame time;
- simulation step time;
- instance synchronization/upload time;
- active particle count;
- merges per second;
- draw calls;
- JS heap trend and visible GC hitches;
- transparency-related GPU symptoms where observable.

Compare against the Batch 04 shell baseline and identify the incremental cost of simulation/render integration.

## Work package 05.8 - Integration hardening

- Handle XR session enter/exit without losing deterministic reset capability.
- Ensure pausing or visibility changes do not create runaway catch-up.
- Ensure desktop mode still starts cleanly when XR is unavailable.
- Add an integration smoke test route or automated browser test where practical.
- Update `docs/PERFORMANCE.md` with before/after metrics.

## Stop conditions

Stop and isolate the cause when:

- the desktop sweep changes during integration;
- XR frame timing changes the endpoint result;
- a second turbidity calculation appears;
- performance fails because of unnecessary transparent layers;
- an interaction bug prompts a simulation rewrite;
- a simulation issue prompts changing the XR control API.

## Explicit non-goals

- No full seven-state treatment cycle.
- No gauge, plot, persistence, reset handle, or measurement beam.
- No final clearing-front tuning.
- No plant environment or audio.
- No particle-count increase.

## Required tests and evidence

- pre/post 11-dose sweep comparison;
- command adapter unit tests;
- desktop/XR endpoint parity checks;
- production build;
- Quest trace and metric report;
- stereo screenshots or recorded viewing-angle checks;
- allocation audit for instance synchronization;
- confirmation desktop proof route remains functional.

## Review-agent checklist

- Did integration preserve both prior proofs?
- Is there exactly one simulation implementation for desktop and XR?
- Are world/tank transforms applied efficiently?
- Are instance arrays being copied or allocated unnecessarily?
- Did any new turbidity computation appear in rendering or app code?
- Is performance loss explained by measured components?
- Were visuals simplified before proposing deeper rewrites?

## Acceptance criteria

- Same seed, dose, and config produce the same simulation outputs in desktop and XR paths.
- Canonical low/optimum/high outcomes remain qualitatively correct in the headset.
- Dose control and start input remain reliable.
- One turbidity authority remains enforced.
- Quest performance at 500 particles is acceptable with sufficient headroom for instrumentation.
- Desktop proof remains independently runnable.
- No unresolved ambiguity remains between interaction, simulation, and rendering defects.

## Suggested tag and commit

- Commit: `feat: integrate proven coagulation simulation into XR apparatus`
- Accepted tag: `xr-integration-proven`

## Required closing acceptance packet

The implementation agent must provide:

1. What changed.
2. What intentionally did not change.
3. Files added, removed, and modified.
4. Commands run and exact results.
5. Dose-sweep comparison when simulation behavior changed.
6. Desktop or Quest metrics when rendering or XR behavior changed.
7. Known defects, compromises, and deferred decisions.
8. Remaining allocations or expensive operations in per-frame paths.
9. Documentation updated.
10. Proposed commit message and whether the batch gate passed.
