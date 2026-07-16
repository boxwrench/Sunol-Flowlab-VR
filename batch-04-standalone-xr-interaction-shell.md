# Batch 04 Implementation Plan: Standalone XR Interaction Shell

**Status:** Not started — predecessor gates remain open
**Depends on:** Batch 03 accepted; local Batch 01B route accepted; Batch 00 command contract fixed  
**May run in parallel with:** Review and interaction-test preparation only  
**Primary gate:** A user can reliably select one of 11 integer doses and press Start on the target Quest while maintaining 72 fps with useful headroom.

> This batch must also follow [the hybrid jar-test design direction](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md). The design brief governs product intent and presentation meaning; this batch remains authoritative for timing, scope, tests, evidence, and acceptance.

## Goal

Prove physical interaction and ergonomics without any treatment physics. This isolates XR problems from chemistry and rendering problems.

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

## Scope architecture

The XR shell may consume and log only discrete commands:

```ts
SET_DOSE(0..10)
START_TRIAL
```

It must not import simulation internals or render treatment particles.

## Work package 04.1 - Minimal XR apparatus scene

- Create a comfortable tabletop scene with a simple floor/reference frame.
- Add an empty hero observation tank placeholder, static six-jar canonical preset rack, and control mounting area.
- Establish standing and seated starting transforms.
- Keep lighting and materials deliberately simple.
- Add a development calibration marker for reach, eye height, and table height.

## Work package 04.2 - Interaction state model

Define explicit interaction states such as:

- idle;
- hovered;
- grabbed/engaged;
- moving between detents;
- snapped;
- locked/disabled;
- button pressed/released.

Requirements:

- interaction state is separate from dose value;
- analog control movement is converted to an integer detent before emitting app commands;
- command emission is debounced and logged;
- no floating-point dose reaches application state;
- left and right input sources are supported.

## Work package 04.3 - Hinge lever prototype

Build the preferred lever first:

- one constrained rotational axis;
- mechanical travel limits;
- 11 evenly mapped detents;
- snap behavior selected through actual headset testing;
- visible pointer or engraved marks;
- release behavior that cannot leave the control between detents;
- optional light haptic tick only when crossing into a new detent.

Test alternatives deliberately:

1. continuous movement with snap on release;
2. immediate snap while held;
3. nearest-detent magnetic behavior.

Record which is most reliable rather than defending the original design.

## Work package 04.4 - Rotary-wheel escape hatch

Time-box the lever investigation. If it fails reliability criteria, implement a large detented rotary wheel using the same `DoseIndex` command contract.

The fallback is accepted when it is:

- easier to constrain;
- equally legible;
- usable seated and standing;
- reliable with both hands;
- less prone to jitter or accidental detent changes.

Do not carry both controls into the shipped scene unless accessibility testing demonstrates a real need.

## Work package 04.5 - Optional canonical jar preset selection

- Treat jars as presets for doses 0, 2, 4, 6, 8, and 10 only.
- Route every jar selection through the same validated SET_DOSE command as the physical control.
- Reflect the selected preset on the 11-detent control without bypassing or weakening the full 0-10 contract.
- Keep the jar rack static; do not add simulation state, moving particles, optical-load data, completed summaries, or experiment history.
- Accept jar selection only if it is reliable and does not confuse users about the hero tank being the single live trial.

This interaction is optional for v1. The primary 11-detent control remains authoritative and sufficient.

## Work package 04.6 - Start button

- Add one large pressable control.
- Use clear travel, return, and activation thresholds.
- Emit one `START_TRIAL` per deliberate press.
- Prevent repeated events while held.
- Add optional stronger haptic pulse and simple mechanical sound hook.
- Keep button behavior independent from any treatment state machine.

## Work package 04.7 - Ergonomic validation

Test on the real headset:

- standing and seated table height;
- neutral reach without leaning;
- left- and right-hand use;
- accidental contact while reaching for the other control;
- label readability at working distance;
- ability to select detents 0, 5, and 10 without overshoot;
- repeated sequence of random requested detents.

Record measurements and observations in `docs/DECISIONS.md` or `docs/XR_INTERACTION.md`.

## Work package 04.8 - Reliability test protocol

Perform a structured test, for example:

- 50 requested detent selections across the full range;
- count incorrect final detents;
- count unintended extra command emissions;
- count dropped button activations;
- repeat with each hand;
- repeat seated and standing;
- record average task time only as a diagnostic, not the main gate.

Suggested gate, subject to user testing:

- no floating dose values;
- at least 98% correct detent selection in controlled testing;
- no accidental command storms;
- start button activates exactly once per deliberate press.

## Work package 04.9 - Quest performance capture

Capture:

- average FPS and frame time;
- p95 frame time;
- draw calls;
- controller/input update observations;
- JS heap trend;
- device, browser, and build versions.

The empty shell should hold 72 fps with substantial headroom. A marginal pass here predicts failure after simulation integration.

## Explicit non-goals

- No treatment particles or optical-load gradient.
- No simulation imports.
- No phase locking based on trial state.
- No gauge, plot, refill handle, or tear-off sheet.
- No live jar simulations, canonical jar summaries, or jar-owned experiment history.
- No hand tracking.
- No detailed environment art.
- No desktop spectator interactions.

## Batch 03 interface boundary

- Separate worktree and branch.
- Batch 04 cannot modify `/sim`.
- The accepted Batch 03 model cannot modify the dose command contract without a coordinated contract change.
- Merge only after both branches pass their own gates.
- Integration begins only in Batch 05.

## Review-agent checklist

- Does every physical movement resolve to one integer detent?
- Are interaction APIs valid for the pinned XR version?
- Is the lever being over-defended despite poor reliability?
- Can the control be used seated and standing with either hand?
- Is haptic use sparse and event-based?
- Does the scene retain enough frame-time headroom for Batch 5?
- Has any treatment logic leaked into `/xr`?

## Acceptance criteria

- Every dose detent can be selected reliably on the target Quest.
- The chosen control is either the lever or documented rotary fallback.
- No unconstrained float dose enters application state.
- Start button emits exactly one command per deliberate press.
- Any implemented canonical jar selection emits the matching validated even DoseIndex and leaves the primary 11-detent contract intact.
- Left/right and seated/standing use are acceptable.
- The scene sustains 72 fps with useful headroom.
- XR interaction APIs and decisions are documented against the pinned version.

## Suggested tag and commit

- Commit: `feat(xr): prove detented dose control and start input`
- Accepted tag: `xr-shell-proven`

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
