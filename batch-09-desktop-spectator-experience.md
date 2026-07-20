# Batch 09 Implementation Plan: Browser Presentation and Capture

**Status:** Ready to begin — Batches 07 and 08 are accepted  
**Depends on:** Accepted Batches 07-08 instrumentation and readability  
**May run in parallel with:** Batch 10 environment and audio preparation  
**Primary gate:** The same build is usable in Quest immersive WebXR and in the Chrome/Chromium browser simulation, and a repeatable operator-led task sequence can be captured with a concise narration.

> This batch follows [the hybrid jar-test design direction](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md). The design brief governs product intent and presentation meaning; this plan governs Batch 09 scope, tests, evidence, and acceptance.

## Goal

Make the existing browser simulation a clear desktop presentation and establish a simple recording workflow. The project owner performs the real low/optimum/high tasks while Codex captures the session. A short narration explains the purpose, dose-response result, hero tank, jar summaries, and plot.

Batch 09 does not create a separate spectator product, cinematic autoplay system, or prerecorded fallback experience.

## Supported viewing targets

Version 1 has exactly two viewing targets:

1. Meta Quest Browser entering immersive WebXR.
2. Current Chrome, or an equivalent Chromium-based desktop browser, running the existing in-browser VR simulation/IWER presentation.

Mobile browsers, Firefox, WebKit/Safari, and a broad secondary-browser matrix are outside version 1 support and acceptance.

## Agent execution rules

- Read `CLAUDE.md`, the current repository tree, `package.json`, and relevant tests before proposing edits.
- Summarize the current architecture and any conflicts with this plan before writing code.
- Implement only this batch. Do not pull final environment, audio, deployment, or release work forward.
- Preserve the `/sim`, `/render`, `/xr`, and `/app` ownership boundaries.
- Keep simulation state outside React and do not add React state updates to the hot simulation path.
- Reuse the real trial commands, state machine, optical-load authority, instruments, jars, and plot.
- Produce evidence: changed files, commands, test output, browser captures, known limitations, and any relevant performance measurements.
- Do not mark the batch complete until every acceptance criterion has objective evidence.

## Presentation principles

- Same application and simulation at the same URL for desktop and Quest.
- One live hero tank, six static canonical jar summaries, and one complete plot/log.
- The desktop presentation may use the bundled IWER view; it does not need desktop grab parity.
- Normal in-scene labels remain the primary explanation of controls and instruments.
- Narration supplements the scene; it does not justify unclear or unlabeled controls.
- Capture should be straightforward and repeatable, not an autonomous film-production system.

## Work package 09.1 - Entry and mode behavior

- Keep one obvious `Enter VR` action when immersive WebXR is available.
- Keep the Chrome/Chromium browser simulation usable without a headset.
- Handle rejected or failed XR entry without leaving the browser presentation unusable.
- Preserve a usable browser view after returning from an XR session.
- Do not add mobile-specific layout, input, or fallback behavior.

## Work package 09.2 - Operator-led recording sequence

Define a short, repeatable task card using the real controls and trial lifecycle:

1. establish the apparatus and explain the experiment;
2. run an underdose trial and show its result;
3. refill;
4. run the near-optimum trial and show improved clarity;
5. refill;
6. run an overdose trial and show the poorer result;
7. finish on the complete dose-response plot and jar-test spectrum.

The project owner performs these tasks in the browser simulation or Quest. Codex records the session and may provide deterministic setup or reset commands, but must not substitute fake results, a separate simulation, or a hidden autoplay controller.

Recording setup must state whether it uses a clean experiment log or deliberately staged canonical history. Odd-dose results must remain represented by the complete plot/log without changing noncanonical jars.

## Work package 09.3 - Browser framing and capture readiness

- Choose one clear Chrome/Chromium framing that keeps the hero tank, controls, gauge, plot, and jar rack readable.
- Confirm a clean 16:9 capture without development metrics or unrelated browser chrome.
- Keep task transitions easy to follow while the operator works normally.
- Add only minimal capture helpers that are demonstrably necessary.
- Treat Batch 09 recordings as diagnostic or draft presentation evidence.
- Record the final portfolio footage only after Batch 10 visual and audio polish is accepted.

Do not build an automated camera storyboard before final visuals are settled.

## Work package 09.4 - Narration

Prepare a concise voiceover or live-narration script aligned to the operator task card. It should explain:

- this is a phenomenological coagulation model, not operating guidance;
- the dose control and Start action;
- formation and settling of floc in the live hero tank;
- why both underdose and overdose perform worse than the optimum;
- that the plot/log cover every tested dose;
- that the six jars are static summaries for canonical doses 0, 2, 4, 6, 8, and 10;
- how to enter immersive VR on Quest.

Keep the narration short enough to fit one natural task demonstration. Captions or a transcript should accompany the final published recording, but final audio production belongs after Batch 10.

## Work package 09.5 - Targeted validation

Test only the supported viewing paths:

- current stable Chrome on Windows using the bundled browser VR simulation/IWER path;
- the target Quest model in Quest Browser, including user-initiated immersive entry;
- Chromium-based desktop cross-check only when a Chrome-specific issue is suspected;
- rejected XR entry and return from XR;
- clean and existing local experiment data.

Record load success, clear entry, task completion, result/plot consistency, console errors, and capture readability. Do not create a mobile, Firefox, Safari, or general device matrix.

## Work package 09.6 - Repository front door preparation

- Describe the two supported viewing targets accurately in `README.md`.
- Add a small architecture/data-flow diagram if it materially improves comprehension.
- Retain and verify the CI badge and responsible model description.
- Prepare locations and accessibility text for final still/video media.
- Defer final screenshots, recorded footage, captions, and media selection until Batch 10 visuals and audio are accepted.
- Do not publish a demo URL until Batch 11 deployment is verified.

## Explicit non-goals

- No mobile support or mobile fallback.
- No Firefox, Safari/WebKit, or broad compatibility program.
- No separate spectator-only simulation or application.
- No scripted autoplay, cinematic camera controller, spectator replay, pause, or skip controls.
- No full desktop recreation of VR grabbing.
- No prerecorded video as a runtime fallback.
- No final environment, final audio, deployment, or marketing website.
- No final portfolio recording before Batch 10 acceptance.

## Required tests and evidence

- Chrome/Chromium browser-simulation smoke test and screenshot inspection;
- Quest immersive entry, task interaction, and safe exit/recovery check;
- low/optimum/high operator task-card rehearsal using authoritative results;
- plot/log and canonical-jar consistency check;
- clean-data and existing-data capture setup checks;
- narration draft timed against one rehearsal;
- one diagnostic 16:9 recording or capture sample;
- README support-target and link check.

## Review checklist

- Are Quest immersive WebXR and the Chrome/Chromium browser simulation the only claimed viewing targets?
- Does the browser path use the same real simulation and results?
- Can the owner perform the recording task card without special cinematic controls?
- Do the hero tank, jars, gauge, and complete plot retain their accepted meanings?
- Does the narration explain the experiment without overstating calibration or operating relevance?
- Can failed XR entry return safely to the browser presentation?
- Has final footage been correctly deferred until visual and audio polish are accepted?

## Acceptance criteria

- The root application supports the Chrome/Chromium browser simulation and user-initiated Quest immersive WebXR.
- The owner can complete the low/optimum/high recording task card using real controls and authoritative results.
- The browser framing is readable in a clean 16:9 capture.
- The plot/log and canonical jars retain their distinct complete-memory and static-summary roles.
- XR entry failure and XR exit leave a usable browser presentation.
- A concise, technically responsible narration draft is timed to the task sequence.
- Mobile and unsupported-browser behavior are neither implemented nor claimed.
- Final polished recording remains scheduled after Batch 10 acceptance.

## Suggested commit

`docs: focus batch 9 on browser presentation and capture`

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
10. Task card, narration draft, and capture evidence.
11. Proposed commit message and whether the batch gate passed.
