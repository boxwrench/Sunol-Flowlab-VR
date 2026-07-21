# Session Handoff

Updated: 2026-07-20

## Resume point

- Repository: <https://github.com/boxwrench/Sunol-Flowlab-VR>
- Branch: `main`
- Active plan authority: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- Detailed batch plans: [docs/plans](docs/plans/README.md)
- Current milestone: `v0.1.0` released with hosted experience and narrated
  Quest demonstration
- Public experience:
  <https://boxwrench.github.io/Sunol-Flowlab-VR/>

Inspect `git status --short` and `git log -1 --oneline` before changing the
working tree. The repository-local `AGENTS.md` is intentionally ignored.
The untracked `.agents/` directory is user-owned and must not be staged.

## Accepted product state

Sunol FlowLab VR is one coagulation-only phenomenological teaching experience:

- one live deterministic hero-tank simulation;
- one static six-jar rack for canonical doses 0, 2, 4, 6, 8, and 10;
- one complete mounted plot and versioned experiment log for all eleven doses;
- one physical dashboard for dose, Start, mute, and scenery;
- one four-wall laboratory with owner-created Sunol and Hetchy panoramas;
- generated ambience, periodic lab details, and sparse music;
- seated Quest WebXR and Chrome/Chromium desktop viewing at the same URL.

The local physical Quest route is accepted. The hosted HTTPS deployment is
authorized and live. Hosted Quest entry, the corrected -0.20 m seated origin,
the final visual/audio review, Dose 0/5/10 repeat cycles, refills, and immersive
exit/re-entry passed on Quest 3. A quantified laboratory thermal trace and a
non-operator usability study are not claimed.

## Architecture invariants

- `src/sim` owns deterministic process state and imports no browser, React,
  Three.js, or XR code.
- `src/app` owns lifecycle, orchestration, experiment memory, persistence,
  replay, and audio.
- `src/render` consumes read-only authoritative state.
- `src/xr` owns session/input adapters and emits discrete app commands.
- React state is not used for per-particle or hot-loop state.
- One dimensionless relative optical-load band record drives water appearance,
  gauge, plot, persistence, jar summaries, and replay.
- The signal is not calibrated NTU and the project is not operating guidance.

The accepted simulation config is `fnv1a32-e8bf13e7`, using 500
representative particles and canonical seed `0x5f3759df`.

## Current evidence

- Release notes: [docs/RELEASE_NOTES_V0.1.0.md](docs/RELEASE_NOTES_V0.1.0.md)
- Narrated Quest demonstration:
  <https://github.com/boxwrench/Sunol-Flowlab-VR/releases/download/v0.1.0/sunol-flowlab-vr-v0.1.0-demo.mp4>
- Hosted screenshot:
  [docs/images/sunol-flowlab-v0.1/shot-0.png](docs/images/sunol-flowlab-v0.1/shot-0.png)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- UX and headset verdicts: [docs/UX_VALIDATION.md](docs/UX_VALIDATION.md)
- Performance record: [docs/PERFORMANCE.md](docs/PERFORMANCE.md)
- Data and asset boundary: [docs/DATA_BOUNDARY.md](docs/DATA_BOUNDARY.md)
- Asset provenance: [docs/ASSET_PROVENANCE.md](docs/ASSET_PROVENANCE.md)
- Batch evidence index: [docs/README.md](docs/README.md)

The public root defaults to the seated Sunol experience. The legacy diagnostic
desktop harness remains available only by explicit `?mode=desktop` and is used
by deterministic browser validation. Production does not eagerly request the
IWER emulator-room chunks.

## Release state

The owner-operated low/optimum/high Quest demonstration, synthetic narration,
release notes, and `v0.1.0` publication are complete. Mobile support and a
sideloadable APK remain deferred. Begin any further process modules, simulation
retuning, dependency upgrades, or mechanistic work as explicit post-v0.1 scope.

## Validation

Use Node.js 24.12.x and npm 11.18.x.

```sh
npm test
npm run acceptance:03d
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run build:pages
npm run benchmark
npm run test:browser
```

Physical Quest harness:

```sh
npm run acceptance:08:quest -- review-ready
npm run acceptance:08:quest -- watch-combined
npm run acceptance:08:quest -- watch-controls
```

## Recommended next session

Treat `v0.1.0` as the known-good baseline. Start post-release work only from an
explicitly approved goal, preserve the coagulation-only product boundary, and
keep the published release and GitHub Pages deployment available for rollback.
