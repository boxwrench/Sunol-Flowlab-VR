# Batch 06 Implementation Plan: Complete Treatment-Cycle State Machine

**Status:** Accepted — seated Quest treatment-cycle, readability, refill, and performance gates pass
**Depends on:** Batch 05 accepted  
**May run in parallel with:** State-test authoring, instrument concepts, pacing review  
**Primary gate:** One complete trial has a clear beginning, treatment sequence, fixed measurement, recorded result, and deterministic refill/reset.

> This batch must also follow [the hybrid jar-test design direction](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md). The design brief governs product intent and presentation meaning; this batch remains authoritative for timing, scope, tests, evidence, and acceptance.

> Trial results capture the one relative optical-load authority defined by [the modeling research amendment](docs/MODELING_RESEARCH_AMENDMENT.md). The state machine must not create a second process calculation or relabel the signal as calibrated turbidity.

> This batch exposes the immutable result and phase timeline required by [the ghost replay design](docs/GHOST_REPLAY_DESIGN.md), but it does not record, persist, or play ghosts.

## Goal

Replace development-only trial controls with an explicit domain state machine that makes the experiment coherent, repeatable, and resistant to partial or illegal input.

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

## State model

Use an explicit closed set:

```ts
type TrialPhase =
  | 'READY'
  | 'RAPID_MIX'
  | 'FLOCCULATION'
  | 'SETTLING'
  | 'MEASURING'
  | 'COMPLETE'
  | 'REFILLING'
```

Recommended events:

```ts
type TrialEvent =
  | { type: 'SET_DOSE'; dose: DoseIndex }
  | { type: 'START' }
  | { type: 'PHASE_TIMER_ELAPSED' }
  | { type: 'MEASUREMENT_FINISHED' }
  | { type: 'REFILL_REQUESTED' }
  | { type: 'REFILL_FINISHED' }
  | { type: 'FORCE_RESET_DEV_ONLY' }
```

The exact library or hand-rolled reducer may vary. The transition table must be explicit and testable.

## Work package 06.1 - Transition contract

Create a transition table documenting:

- legal source phase;
- accepted event;
- next phase;
- side effects;
- rejected events;
- user controls enabled/disabled.

Core rules:

- dose may change only in `READY`;
- `START` is accepted only once from `READY`;
- phase progression follows the fixed order;
- measurement occurs once at a fixed endpoint;
- result is immutable after capture;
- refill restores identical raw water and returns to `READY`;
- no surviving floc or timers cross reset;
- XR session pause/resume cannot skip or duplicate phase events.

## Work package 06.2 - Phase configuration and global time scale

Define one config source for:

- rapid-mix duration;
- flocculation duration;
- settling duration;
- measurement cue duration;
- complete hold behavior;
- refill duration;
- global simulation time scale.

Requirements:

- one global time-scale concept from the simulation foundation;
- no unrelated hidden speed multipliers per force term;
- display timing and simulation timing are documented;
- defaults remain tunable until Batch 8 finalizes readability.

## Work package 06.3 - Phase side effects

Bind state transitions to existing simulation controls:

- `RAPID_MIX`: energetic flow and dose-dependent sticking enabled;
- `FLOCCULATION`: gentle mixing and aggregation;
- `SETTLING`: reduced mixing, settling active;
- `MEASURING`: simulation reaches fixed endpoint and freezes or continues only as explicitly designed;
- `COMPLETE`: result available, no duplicate recording;
- `REFILLING`: visual reset sequence while restoring saved raw-water state at the defined moment.

Keep state-machine logic in app/domain code, not inside XR components.

The hero observation tank remains the single live process presentation throughout every phase. Canonical jars never own phase state or timers.

## Work package 06.4 - Dose locking and interaction feedback

- Lock dose control after `START`.
- Provide a mechanical or visual locked state through the physical control, not software chrome.
- Reject late `SET_DOSE` commands with development logging.
- Re-enable the control only after refill completes.
- Prevent double-starts and held-button repeats.

## Work package 06.5 - Fixed measurement event

Implement the event sequence:

1. capture the authoritative relative optical-load band record at the fixed endpoint;
2. flash the nephelometer emitter through the sample zone;
3. glow the side detector based on the same authoritative concentration data;
4. animate a provisional gauge/result output hook;
5. create one immutable `TrialResult`;
6. transition to `COMPLETE`.

The final gauge and plot geometry arrive in Batch 7. This batch provides the event, data, and minimal placeholders.

The completed-result event must also be consumable by Batch 07 static canonical jar summaries and its app-owned treatment-ghost recorder. This batch does not update jars or create ghosts directly, and odd-dose results remain fully valid even though they never map to a canonical jar.

Suggested result shape:

```ts
interface TrialResult {
  schemaVersion: 1
  id: string
  dose: DoseIndex
  seed: number
  rawWaterConfigId: string
  opticalProxyVersion: string
  endpointOpticalLoad: number
  bandSnapshot: readonly number[]
  phaseTimeline: TreatmentPhaseTimeline
  completedAtSimulationTime: number
  configHash: string
}
```

## Work package 06.6 - Refill and deterministic reset

- Add a physical-action hook for later refill handle input.
- During development, allow a controlled temporary trigger.
- Clear timers, transient effects, previous active result, merge tween state, and settled material.
- Restore identical raw-water arrays from the saved seed/config.
- Preserve completed experiment-log data outside the trial state.
- Preserve the complete plot/log and any future canonical jar summaries during refill; only explicit history clearing removes them.
- Confirm the next run at the same dose reproduces the same result.

## Work package 06.7 - Failure and lifecycle handling

Define behavior for:

- XR session interruption;
- browser tab visibility changes;
- unusually long frame stall;
- lost controller input;
- reset request during an active trial;
- malformed result generation;
- development hot reload.

Favor a safe deterministic reset over trying to resume a corrupted partial trial.

## Work package 06.8 - Pacing review

Run complete trials in desktop and XR modes. Record:

- total trial duration;
- whether each phase is perceptually distinct;
- whether users understand when input is locked;
- whether measurement feels like a conclusion;
- whether refill is fast enough to encourage another attempt;
- whether time compression preserves the sequence without feeling frantic.

Do not finalize visual tuning here; capture adjustments for Batch 8.

## Explicit non-goals

- No final gauge face or plot board.
- No localStorage.
- No ghost recording, persistence, playback clock, or replay rendering.
- No tear-off sheet.
- No desktop scripted three-dose sequence.
- No environment art or final audio mix.
- No new chemistry variables.

## Required tests

- complete transition-table unit coverage;
- illegal event rejection;
- dose-lock test;
- double-start prevention;
- exactly-one measurement and result per trial;
- reset purity and same-dose reproducibility;
- timer/catch-up behavior;
- XR session pause/resume or forced-reset test;
- end-to-end trial smoke test in desktop and Quest.

## Review-agent checklist

- Are all states and legal transitions explicit?
- Can an XR component directly mutate simulation phase?
- Is measurement tied to one fixed endpoint?
- Can a result be recorded twice?
- Does refill restore the saved seed rather than a visually similar random state?
- Are speed controls centralized?
- Does lifecycle interruption fail safely?

## Acceptance criteria

- One trial runs uninterrupted through all seven phases.
- Dose locks after start and unlocks only after refill.
- Measurement occurs once at the fixed endpoint and creates one result.
- The immutable completed result remains the only source for the hero tank endpoint, complete plot/log, and any later static canonical summary.
- Refill restores identical raw water with no surviving floc or timers.
- Same seed/dose/config remains reproducible.
- Desktop and Quest both complete the same domain sequence.
- Trial pacing has a clear beginning, middle, conclusion, and invitation to repeat.

## Suggested tag and commit

- Commit: `feat: add deterministic treatment-cycle state machine`
- Accepted tag: `treatment-loop-complete`

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
