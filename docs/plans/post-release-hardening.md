# Post-release Hardening and v0.2.0 Release

**Status:** Planned for v0.2.0; correctness findings confirmed, implementation not started  
**Baseline:** `v0.1.0` at `191f352`; current `main` also contains accepted
Batch 12 library and visual polish  
**Primary gate:** repeated same-dose trials across application reloads remain
distinct and persisted metadata reports the package version without changing
the accepted process result

## Confirmed findings

The persistence collision is reproducible from the current ownership model:

- `TreatmentCycleController` starts `trialSequence` at zero for every new
  controller and increments it on Start;
- `createTrialResultV1` builds the ID from config hash, canonical seed, dose,
  and that session-local sequence;
- `ExperimentMemory.append` returns `false` for an existing ID;
- `Batch07ExperimentController` finalizes and saves a ghost only when that
  append succeeds.

Therefore, the first trial at a repeated dose after reload can collide with the
prior first trial, leaving the new result and ghost out of persisted memory.
The treatment result itself remains scientifically identical and valid; only
record identity is wrong.

The version mismatch is also confirmed: `package.json` reports `0.1.0` while
`APP_PROJECT_VERSION` is hard-coded as `0.0.0` and supplied to
`ExperimentMemory`.

## Work package 1 - Globally unique record identity

Move record identity to an application-owned injected dependency:

```ts
export type TrialIdFactory = () => string
```

- Production composition supplies `() => crypto.randomUUID()`.
- Unit and integration tests supply a deterministic fake.
- `createTrialResultV1` receives a validated ID instead of deriving identity
  from the deterministic treatment sequence.
- Existing persisted IDs remain valid and require no migration.
- Ghost records continue to use the completed result ID, so log and ghost
  identity remain aligned.
- If secure random UUID generation is unavailable, fail clearly at the
  application boundary; do not fall back to timestamps or make simulation
  randomness nondeterministic.

Required regression:

1. Complete Dose 5 using one application/controller instance.
2. Preserve its storage and construct a fresh instance, representing reload.
3. Complete Dose 5 again as the first new trial.
4. Assert different IDs, two experiment points, and two distinct ghost
   candidates or records.
5. Assert the two scientific results are otherwise equal.

Add focused unit coverage at the treatment-cycle and experiment-controller
boundaries plus one rendered-browser reload-and-repeat scenario.

## Work package 2 - One project-version source

- Inject the version from `package.json` into application code through the
  Vite build configuration.
- Replace the hard-coded `APP_PROJECT_VERSION = '0.0.0'` value.
- Add a contract test proving package, development, production, and Pages builds
  expose the same version.
- Restore existing `0.0.0` logs without data loss. On the next successful
  write, persisted metadata may advance to the current package version while
  preserving every result.
- Keep simulation/config versions separate; the package version must not alter
  ghost compatibility or scientific results.

The package version becomes `0.2.0` only during the release cut after the
hardening and final validation gates pass.

## Work package 3 - Selected v0.2.0 release line

Current `main` is automatically deployed by GitHub Pages and already includes
accepted user-visible library and art changes after the `v0.1.0` tag.

The owner selected the current-main `v0.2.0` path:

- Apply the two correctness fixes to `main`.
- Treat the already accepted library and visual polish as the v0.2 feature set.
- Add release notes covering both those features and the hardening fixes.
- Tag the fully validated current-main commit `v0.2.0`.
- Keep the published `v0.1.0` tag and artifacts available as the rollback
  baseline.

A separate `v0.1.1` maintenance branch is not planned.

## Work package 4 - Naming cleanup

After both correctness fixes pass in separate commits, perform a no-behavior
rename if it will not delay the release:

- `Batch07ExperimentController` -> `ExperimentController`
- `Batch07Driver` -> `ExperimentFrameDriver`
- `Batch07Snapshot` -> `ExperimentSnapshot`
- `Batch07CommandResult` -> `AppCommandResult`
- `dispatch_batch07_command` -> `dispatch_app_command`
- “Batch 06 controller” error text -> product-domain wording

Update tests and development bridges atomically. Do not combine these renames
with identity generation, version injection, simulation tuning, or dependency
upgrades. If the rename creates release risk, defer it.

## Work package 5 - Composition maintenance

`App.tsx` owns several legitimate responsibilities and is now 387 lines. Do
not add a framework or global store. After the release, extract only concrete
seams when they reduce repeated wiring:

- `useFlowLabRuntime()`
- `useVisibilityInterruption()`
- `DevelopmentBridge`
- `ExperimentApparatus`

This is maintenance scope, not a prerequisite for the identity fix.

## Submission and media tasks

- Upload the narrated Quest demonstration to YouTube, initially Unlisted if
  preferred.
- Verify playback in Quest Browser and desktop Chrome.
- Replace the README’s GitHub Release asset watch link with the YouTube watch
  URL. Keep the release asset only if it is explicitly labeled as a download.
- Add a compact **Built With** line near the README top.
- Add a dedicated, factual **How GPT-5.6 was used** subsection distinguishing
  product/research critique from Codex’s repository implementation role.

No YouTube media is embedded in the application runtime.

## Structured user-feedback gate

Recruit:

- two water operators;
- one water educator or trainer;
- two people without treatment experience.

Ask each participant to complete three trials without coaching. Record:

- whether they find Start and understand Refill;
- whether they recognize the U-shaped result;
- whether they understand jars as static summaries;
- whether they discover and correctly describe replay;
- whether “Relative Turbidity” is mistaken for a calibrated plant value.

Then ask what changing dose did, which trial was best and why, what the jars and
replay represented, what was confusing, and what they would try next. Keep
observed behavior separate from stated opinion.

## Deferred second module

Rapid filtration is the leading discovery candidate: one narrow lesson using
relative loading, media-depth capture, headloss, breakthrough, and backwash.
It remains phenomenological and must not provide operating guidance.

Do not implement filtration until the feedback gate is reviewed and the owner
approves a separate plan. Do not create a shared FlowLab engine first. Build the
second module far enough to reveal what is actually common, then extract only
proven shared infrastructure.

## Acceptance criteria

- Same-dose first trials before and after reload have different record IDs.
- Both results remain in the complete experiment log and both can produce
  distinct ghost records subject to the existing bounded library policy.
- Scientific result fields remain deterministic and regression-identical.
- Existing experiment and ghost data restore without loss.
- Persisted project metadata matches the selected package version.
- The model config hash, dose sweep, timing, optical-load authority, visuals,
  and Quest interaction remain unchanged.
- Full unit, contract, browser, type, lint, format, standard build, Pages build,
  acceptance sweep, and benchmark checks pass.
- The selected release number accurately describes the code included.

## Explicit non-goals

- no coagulation retuning;
- no new chemistry controls;
- no change to trial timing or optical-load mapping;
- no database, cloud sync, IndexedDB, or generalized storage layer;
- no dependency upgrades in the correctness commits;
- no mobile or APK work;
- no filtration implementation or universal engine in this release.
