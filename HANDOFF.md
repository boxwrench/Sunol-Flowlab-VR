# Session Handoff

Updated: 2026-07-14

## Resume point

- Repository: <https://github.com/boxwrench/Sunol-Flowlab-VR>
- Branch: `main`
- Last published commit: `cdc396d` (`Harden Chrome XR telemetry and session entry`)
- Working tree at handoff creation: clean and synchronized with `origin/main`
- Active plan authority: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and its ordered `batch-00` through `batch-11` Markdown files
- The PDF plan is a superseded Godot artifact. The duplicate `batch-03-desktop-phenomenon-proof (1).md` is non-authoritative and must not be used as the plan.

## What is working

- Public MIT repository governance and contributor/safety documentation
- Exact, lockfile-pinned React, Three.js, React Three Fiber, and WebXR toolchain
- Chrome localhost development route using the bundled IWER Meta Quest 3 emulator
- Explicit **Enter VR** flow with automatic XR session offers disabled
- Verified emulated immersive entry and both controller poses
- Deterministic fixed-step simulation clock and seeded PRNG
- Fixed-capacity 500-particle typed-array state with bounded drift
- One-draw-call instanced particle rendering without per-frame React state
- Preallocated performance telemetry, Chrome heap reporting, and machine-readable headless benchmark
- Visible startup error boundary

At the last validation, 8 repository contract tests and 31 Vitest tests passed. Type checking, lint, the production build, and the 500-particle benchmark also passed. The build reports expected non-failing large-chunk warnings from emulator environment assets.

## Open gates and constraints

- The Quest 3 has Developer Mode enabled but was not physically available. Do not mark real-device criteria complete until tested on the headset.
- Chrome heap use stayed flat at approximately 64-65 MB after garbage collection through about 250 seconds with 500 particles and three draw calls.
- The previous five-minute observation ended with an emulator presentation interruption caused by competing automatic session offers. The cause was fixed with `offerSession: false`, but an uninterrupted five-minute post-fix Chrome run and final exported metrics report are still required.
- A hosted HTTPS deployment is not authorized yet. Localhost and the documented ADB reverse route are the approved development paths.
- Public-data and fictionalization restrictions in [docs/DATA_BOUNDARY.md](docs/DATA_BOUNDARY.md) are binding.

## Architecture constraints

Keep the existing boundaries in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md):

```text
src/sim/     deterministic process state and behavior; no browser or UI dependencies
src/render/  read-only visualization of authoritative simulation output
src/xr/      WebXR session and physical-input adapters
src/app/     lifecycle, validated commands, modes, telemetry, and composition
```

Do not place chemistry, turbidity, scoring, or measurement calculations in rendering or XR code. Do not move hot simulation state into React state. Preserve fixed-step determinism, seeded randomness, fixed-capacity storage, and measured allocation discipline.

## Recommended next session

Start with a small documentation-status increment:

1. Add a status table to [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
2. Update the stale project-status text in [README.md](README.md) and the stale current-state text in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
3. Do not remove the duplicate Batch 03 file without confirmation because deletion is destructive.
4. Run the full validation suite and append one line to [PROGRESS.md](PROGRESS.md).

Then rerun the uninterrupted five-minute Chrome emulator observation with the explicit-session fix. Record the final metrics in [docs/PERFORMANCE.md](docs/PERFORMANCE.md). Once that gate is clean, continue with the next incomplete headset-independent behavior in the ordered batch plan; keep physical Quest acceptance criteria open.

## Commands

```powershell
npm ci
npm test
npm run benchmark
npm run typecheck
npm run lint
npm run build
npm run dev
```

Open `http://localhost:5173` in Chrome for the Quest 3 emulator. For later physical-device testing, follow [docs/DEVICE_TESTING.md](docs/DEVICE_TESTING.md).

