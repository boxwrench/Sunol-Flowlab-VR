# Batch 00 Implementation Plan: Pre-build Contracts

**Status:** Planned  
**Branch:** `batch-00-contracts`  
**Depends on:** Project brief only  
**May run in parallel with:** Visual reference gathering, public-data review, package verification  
**Primary gate:** No serious feature implementation begins until the versioned stack, architecture boundaries, regression contract, and public-data boundary are recorded.

## Goal

Convert the design brief into a small set of versioned, testable repository contracts so later agents cannot silently redesign the product or invent incompatible APIs.

## Outcomes

At the end of this batch, the repository has:

- a confirmed Coagulation-only product boundary;
- exact dependency versions and a lockfile;
- explicit module ownership rules;
- a dose command contract using integer detents `0..10`;
- a written definition of a passing 11-dose curve;
- a one-page visual behavior target for underdose, near optimum, and overdose;
- a public-data and branding boundary suitable for an AI-assisted public portfolio project;
- a verified path to Quest testing over HTTPS.

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

## Preconditions and orientation

Before editing:

1. Inspect the repository root and identify whether scaffolding already exists.
2. Read any existing `CLAUDE.md`, `README.md`, decisions, package manifests, and deployment files.
3. List contradictions between the current repository and the v2.3 project brief.
4. Do not delete working code merely to match a preferred folder layout. Record migrations as later work unless they are required to establish the contracts.

## Scope

### Work package 00.1 - Confirm product and release boundary

Record these as non-negotiable v1 constraints in `CLAUDE.md`:

- Repository builds **Sunol FlowLab VR: Coagulation only**.
- One tabletop tank, one world scale, one scene.
- VR-first with desktop spectator mode from the same URL.
- Physical instrumentation only in the shipped experience.
- Phenomenological coagulation model, not dose prediction, CFD, or plant simulation.
- Quest 2-class constraints are the initial performance posture.
- Start at 500 representative particles. Approximately 1,000 is earned only after real Quest profiling.
- No universal FlowLab engine until a second module ships.

**Deliverable:** Updated product authority section in `CLAUDE.md`.

### Work package 00.2 - Pin the toolchain

Inspect current stable versions and choose exact compatible versions for:

- Node.js runtime policy;
- package manager and version;
- Vite;
- React;
- TypeScript;
- `three`;
- `@react-three/fiber`;
- `@react-three/drei`;
- `@react-three/xr`;
- test runner and browser-test tooling;
- linting and formatting tools.

Requirements:

- Use exact versions for XR-sensitive dependencies.
- Generate and commit the package lockfile.
- Record the pinned `@react-three/xr` version prominently in `CLAUDE.md` and `README.md`.
- Record the integrated emulator path supported by the pinned XR version.
- Add an upgrade rule: dependency upgrades are isolated changes and never combined with simulation tuning or XR interaction fixes.

**Deliverables:** `package.json`, lockfile, runtime/version policy, documentation note.

### Work package 00.3 - Define architecture ownership

Create or update `docs/DECISIONS.md` with a short decision record covering:

```text
/src/sim      deterministic simulation, seeded RNG, spatial hash, turbidity, headless sweeps
/src/render   Three.js/R3F rendering that consumes simulation output
/src/xr       XR store, controller input, physical interactions, discrete commands
/src/app      lifecycle, mode selection, orchestration, spectator entry
```

Record these invariants:

- `/sim` imports no React, Three.js, browser rendering, or XR code.
- `/render` cannot calculate independent process values.
- `/xr` emits discrete commands such as `SET_DOSE(4)` and `START_TRIAL`.
- `/app` coordinates lifecycle but does not own per-particle state.
- No `setState` in the simulation loop.
- No allocations in hot paths without an explicit documented reason.
- One turbidity-band record is the authority for water appearance, clearing front, gauge, score, plot, and ghost replay.

**Deliverable:** Architecture decision record with allowed and prohibited dependency directions.

### Work package 00.4 - Define command and data contracts

Document the minimum stable interfaces that parallel work may rely on:

```ts
type DoseIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

type AppCommand =
  | { type: 'SET_DOSE'; dose: DoseIndex }
  | { type: 'START_TRIAL' }
  | { type: 'RESET_TRIAL' }
  | { type: 'CLEAR_EXPERIMENT_LOG' }
```

Also define:

- trial result shape;
- turbidity-band array shape and normalization range;
- deterministic reset inputs;
- expected performance metric record;
- ownership of persistence schema versions.

These are contracts, not full implementations.

**Deliverable:** `docs/CONTRACTS.md` or equivalent concise section in `docs/DECISIONS.md`.

### Work package 00.5 - Establish the dose-sweep regression contract

Write a property-based contract for the permanent 11-dose sweep. Initial recommended defaults, subject to prototype validation:

- Canonical configured optimum near detent 5.
- Canonical-seed minimum within one detent of configured optimum.
- Median minimum across a small seed corpus within one detent of optimum.
- Both extreme doses materially worse than the minimum.
- One principal basin; small shoulder noise allowed within a documented tolerance.
- Same seed, dose, config, and fixed timestep reproduce the same result within stated numeric tolerance.
- No `NaN`, negative, or out-of-range turbidity values.
- Sweep completes below a generous runtime ceiling.
- Reset purity test proves no history dependence.

Specify:

- canonical seed;
- seed corpus size;
- tolerance policy;
- baseline approval process;
- failure artifact format, preferably JSON plus a human-readable table or SVG/PNG curve;
- which tests run on every commit and which run as extended validation.

**Deliverable:** `docs/REGRESSION_CONTRACT.md`.

### Work package 00.6 - Create the visual behavior reference

Create `docs/VISUAL_BEHAVIOR.md` with a compact target for each condition:

| Condition | Collision read | Floc read | Clearing front | Fixed-endpoint appearance |
|---|---|---|---|---|
| Underdose | Few successful collisions | Fine particles and microfloc | Minimal or diffuse | Persistent uniform haze |
| Near optimum | Rapid successful aggregation | Large readable floc | Strong top-down clearing | Clearly improved upper water |
| Overdose | Reduced sustained sticking | Weak or transient clusters | Limited or late | Residual haze above optimum |

Include:

- target compressed phase-duration ranges;
- notes separating scientific plausibility from cinematic exaggeration;
- an explicit rule that overdose need not look theatrically unique if the dose position and U-curve complete the interpretation;
- a placeholder for operator and non-operator validation notes.

### Work package 00.7 - Establish public-data and branding boundaries

Create `docs/DATA_BOUNDARY.md` with these defaults:

- Public or self-created references only.
- Fictionalized representative plant stage set.
- No SCADA screens, alarm history, P&IDs, as-builts, internal SOPs, plant tags, access-control details, operating values, or sensitive facility layouts.
- No official logo, seal, or endorsement language without written approval.
- External AI tools receive sanitized summaries and public references, not restricted source material.
- Keep a provenance record for external visual assets and AI-generated content.
- Public description uses “personal educational portfolio project” and “phenomenological coagulation model.”

### Work package 00.8 - Confirm the physical test route

Record:

- available Quest model;
- current headset OS and Quest Browser version;
- Developer Mode availability for ADB debugging;
- chosen hosted HTTPS route or secure LAN method;
- desktop browsers targeted for spectator mode;
- person responsible for headset gate approval.

Do not build the XR shell in this batch. This is access and test-path confirmation only.

## Explicit non-goals

- No particle simulation.
- No XR lever or button.
- No tank art.
- No spectator sequence.
- No environment asset production.
- No future-module framework.
- No dependency modernization beyond the pinned project stack.

## Validation

Run or verify:

- clean dependency installation from the lockfile;
- production build if an application scaffold already exists;
- documentation link check or manual review;
- architecture import-direction review;
- schema/typecheck for the documented command contracts if represented in code;
- confirmation that the Quest/HTTPS route is genuinely available.

## Review-agent checklist

- Does any contract imply predictive chemistry or a real plant simulator?
- Are exact XR-sensitive versions pinned?
- Can Batch 3 and Batch 4 work against the same dose command contract without touching each other’s modules?
- Is one turbidity source of truth explicit?
- Are public-data restrictions clear enough for external AI use?
- Are regression rules based on properties rather than one fragile floating-point array?
- Has any later-batch feature slipped into the repository under the guise of setup?

## Acceptance criteria

- `CLAUDE.md` reflects the Coagulation-only authority and all non-negotiable constraints.
- Exact dependencies and lockfile are committed.
- Module ownership and dependency directions are documented.
- Dose and app command contracts are explicit.
- Regression, visual behavior, and data-boundary documents exist and are reviewable.
- A real Quest testing path and HTTPS route are confirmed.
- No unresolved blocker remains that would invalidate Batch 1 or Batch 2 architecture.

## Suggested commit

`docs: lock coagulation contracts and implementation boundaries`

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
