# Batch 09 Implementation Plan: Desktop Spectator Experience

**Status:** Not started — predecessor gates remain open
**Depends on:** Batches 06-08 stable; Batch 07 plot available  
**May run in parallel with:** Final environment asset preparation and audio preparation  
**Primary gate:** A person without a headset understands the project, sees the U-shaped dose response, and reaches the main portfolio takeaway in under one minute from the root URL.

> This batch must also follow [the hybrid jar-test design direction](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md). The design brief governs product intent and presentation meaning; this batch remains authoritative for timing, scope, tests, evidence, and acceptance.

> “Replay” of the scripted spectator sequence means rerunning its orchestration from a clean state. A treatment-result ghost is the separate recorded-band feature governed by [the ghost replay design](docs/GHOST_REPLAY_DESIGN.md); do not conflate the two or use ghost playback to fake a live trial.

## Goal

Create a lightweight, scripted desktop experience that reuses the real simulation and instrumentation rather than substituting a video or separate fake logic.

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

## Spectator principles

- Same deployed root URL as VR.
- Same simulation, phase state machine, relative optical-load authority, gauge mapping, and plot logic.
- Same hybrid hierarchy: one live hero tank, six static canonical preset jars, and one complete plot for all doses.
- No headset required.
- Scripted comprehension is required; full mouse parity is optional.
- Camera and pacing may be spectator-specific.
- Audible autoplay is not assumed; visuals must work muted.

## Work package 09.1 - Mode selection and capability detection

- Detect XR support and session availability.
- Default to desktop spectator scene on normal browsers.
- Show one obvious `Enter VR` control only when supported.
- Handle rejected XR permission and session failure without leaving spectator mode.
- Preserve the desktop route after returning from an XR session.
- Add mobile-browser fallback behavior.

## Work package 09.2 - Scripted demo controller

Implement a spectator-only orchestration layer that uses the real trial APIs:

1. reset to blank or intentionally staged plot;
2. run canonical underdose;
3. record the result;
4. refill identical raw water;
5. run canonical near optimum;
6. record the result;
7. refill;
8. run canonical overdose;
9. record the result;
10. reveal the resulting curve and hold.

The complete plot, not the canonical jars, carries the three-trial story. If the near-optimum trial uses odd dose 5, it must appear in the plot and ephemeral log while leaving all jar summaries unchanged.

Requirements:

- cannot change chemistry constants;
- can use approved spectator time scaling only if the same phase order and relative behavior remain;
- logs and handles interruptions;
- supports replay from a clean deterministic state;
- does not corrupt the visitor’s persistent manual experiment log unless a clear policy is chosen.

Recommended persistence policy: spectator demo uses an isolated ephemeral log; interactive VR uses the persistent visitor log.

## Work package 09.3 - Camera storyboard

Use a repeatable camera language across all three trials:

- apparatus establishing view;
- dose-control close-up;
- tank profile or quarter view for floc and clearing front;
- gauge/plot result view;
- final curve reveal.
- optional static jar-summary close-up only when it helps explain canonical presets without implying complete memory.

Keep the same core tank angle across conditions so differences read as process behavior, not cinematography.

Document target beat durations and total runtime. Aim for under one minute without making phase changes unreadable.

## Work package 09.4 - Muted-first audio behavior

- Start spectator visuals without requiring sound.
- Provide a simple user-gesture path to enable audio.
- Do not block the demo behind an audio modal.
- Handle browser autoplay rejection gracefully.
- Keep captions or minimal physical status cues sufficient when muted.

Final audio assets arrive in Batch 10, but the permission/unlock architecture belongs here.

## Work package 09.5 - Minimal spectator controls

Provide only controls that improve portfolio use:

- replay;
- pause/resume if needed;
- skip to next canonical trial if it remains visually unobtrusive;
- audio enable/mute;
- Enter VR when supported.

Prefer a restrained webpage shell outside the immersive scene for browser-required controls. The in-world no-chrome rule applies to the product interaction, but browser session entry and accessibility controls may exist as minimal page controls.

## Work package 09.6 - Screen-recording readiness

- Establish deterministic framing and timing.
- Provide a clean capture mode without development metrics.
- Verify common 16:9 recording output.
- Ensure text and plot are readable at portfolio-video resolution.
- Add a stable replay trigger and build/version indicator outside capture framing or in metadata.

## Work package 09.7 - Browser and device matrix

Test at minimum:

- primary desktop browser;
- secondary desktop browser;
- mobile browser without XR;
- Quest Browser before entering VR;
- unsupported XR scenario;
- rejected audio autoplay;
- reduced-performance laptop if available.

Record load time, first meaningful visual, demo completion, and any graphics differences.

## Work package 09.8 - Comprehension test

Ask new viewers after one autoplay cycle:

- What was the experiment testing?
- Which dose worked best?
- What did the particles do?
- What did the plot show?
- What do the jars represent, and how do they relate to the hero tank?
- Would they know how to enter VR if available?

Pass when viewers can explain the main idea without a spoken tutorial.

## Explicit non-goals

- No full desktop recreation of VR grabbing.
- No keyboard-driven plant simulator.
- No separate simplified chemistry model.
- No pre-rendered video as the only fallback.
- No final plant environment integration in this batch.
- No marketing website beyond the minimum application shell.

## Required tests and evidence

- scripted sequence integration tests;
- deterministic replay test;
- ephemeral-vs-persistent log isolation test;
- XR capability/session failure tests;
- autoplay rejection handling;
- browser smoke-test matrix;
- final under-one-minute recording;
- comprehension-test notes.

## Review-agent checklist

- Does spectator mode use the same real simulation and results?
- Is the sequence understandable while muted?
- Is Enter VR obvious but not obstructive?
- Does the demo avoid polluting persistent visitor data?
- Is the camera consistent across dose conditions?
- Can an unsupported or failed XR session recover cleanly?
- Has desktop parity expanded scope unnecessarily?

## Acceptance criteria

- Root URL provides a coherent desktop spectator experience.
- The complete low/optimum/high sequence and U-curve reveal finish in roughly one minute or less.
- Odd-dose results remain visible in the complete plot even when no canonical jar summary updates.
- The hero tank reads as the live experiment and jars read as static canonical presets.
- The experience works without audio and enables audio after user gesture.
- A viewer can explain the experiment and identify the optimum without instructions.
- XR entry is available where supported and failure returns safely to spectator mode.
- The sequence is stable enough for portfolio screen recording.

## Suggested commit

`feat: add deterministic desktop spectator demonstration`

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
