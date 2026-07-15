# Session Handoff

Updated: 2026-07-15

## Resume point

- Repository: <https://github.com/boxwrench/Sunol-Flowlab-VR>
- Branch: `main`
- Published baseline before this increment: `5d2ff8c` (`feat(sim): prove deterministic dose-response substrate`)
- Current increment: Batch 03 desktop phenomenon presentation and diagnostics
- Active plan authority: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and its ordered `batch-00` through `batch-11` Markdown files
- The superseded Godot plan is isolated under `docs/archive/` for provenance. Its stale duplicate Batch 03 snapshot was removed; use only the active indexed Batch 03 plan.

## What is working

- Public MIT repository governance and contributor/safety documentation
- Exact, lockfile-pinned React, Three.js, React Three Fiber, and WebXR toolchain
- Chrome localhost development route using the bundled IWER Meta Quest 3 emulator
- Explicit **Enter VR** flow with automatic XR session offers disabled
- Verified emulated immersive entry and both controller poses
- Deterministic fixed-step simulation clock and seeded PRNG
- App-owned `SimulationRuntime` with start, pause, reset, rendered stepping, and headless stepping
- Fixed-capacity 500-particle typed-array state with normalized floc size, irreversible settlement, and no hot-step allocation
- Pure deterministic dose efficiency, four-phase aggregation/settling, and one authoritative 12-band turbidity record
- Read-only one-draw-call instanced particle rendering with visible floc growth and settling, without lifecycle ownership or per-frame React state
- Preallocated performance telemetry, Chrome heap reporting, and machine-readable headless benchmark
- Automated module-boundary regression tests, a desktop Playwright smoke test, and a minimal GitHub Actions workflow
- Visible startup error boundary
- Approved hybrid presentation direction: one live authoritative hero tank, six static canonical preset jars, and a complete eleven-dose plot/log
- Accepted uninterrupted 310-second post-fix Chrome observation with stable heap, 500 particles, three draw calls, and zero console errors
- Accepted Batch 02A canonical and nine-seed 11-dose sweeps with a single Dose 5 minimum and both tail margins above threshold
- Accepted full 43-second browser/text-state/visual path and schema-2 production phenomenon benchmark
- Band-driven hero observation tank, static six-jar recognition blockout, and deterministic low/optimum/high desktop presets
- Unlabeled proof mode and authoritative clearing-front diagnostics

The current local validation includes 15 passing repository contract tests, 64 passing Vitest tests across 14 files, canonical and nine-seed dose sweeps, reverse-order equality, type checking, lint, formatting, production build, a 28.38 ms 500-particle production-path benchmark, three passing desktop browser tests, deterministic low/optimum/high endpoint captures, and an inspected unlabeled apparatus capture. Full Batch 02A evidence is in [docs/BATCH_02A_ACCEPTANCE.md](docs/BATCH_02A_ACCEPTANCE.md); current Batch 03 evidence and open gates are in [docs/BATCH_03_PROGRESS.md](docs/BATCH_03_PROGRESS.md). The production build retains the expected non-failing large-chunk warnings from emulator environment assets.

## Open gates and constraints

- The Quest 3 is now physically present, but `adb devices -l` and Windows device discovery return no connected Quest/Android device. Use a known data-capable direct USB cable, unlock/wear the headset, and accept USB/debugging prompts before rerunning the device route. Do not mark real-device criteria complete until ADB reports exactly one device in state `device` and the headset checks pass.
- The accepted post-fix desktop observation kept Chrome heap within 34.9-35.5 MB for 310 uninterrupted seconds with 500 particles, three draw calls, and no console errors. The final exported report is recorded in `docs/PERFORMANCE.md`.
- A hosted HTTPS deployment is not authorized yet. Localhost and the documented ADB reverse route are the approved development paths.
- Public-data and fictionalization restrictions in [docs/DATA_BOUNDARY.md](docs/DATA_BOUNDARY.md) are binding.
- Before visual acceptance, record the required unlabeled-screenshot recognition check in `docs/UX_VALIDATION.md`; at least one operator or educator must participate, with a nonoperator preferred as an additional participant.

## Architecture constraints

Keep the existing boundaries in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md):

```text
src/sim/     deterministic process state and behavior; no browser or UI dependencies
src/render/  read-only visualization of authoritative simulation output
src/xr/      WebXR session and physical-input adapters
src/app/     runtime lifecycle, validated commands, modes, telemetry, and composition
```

Do not place chemistry, turbidity, scoring, or measurement calculations in rendering or XR code. Rendering cannot create, reset, or advance simulation state and cannot import the app layer. Do not move hot simulation state into React state. Preserve fixed-step determinism, seeded randomness, fixed-capacity storage, and measured allocation discipline.

The hybrid presentation direction does not create six simulations. The hero tank is the only live process view. Canonical jars at doses 0, 2, 4, 6, 8, and 10 are application-owned static completion summaries. The plot and trial log are the sole complete memory for all doses 0 through 10, including odd doses.

## Recommended next session

1. Connect and authorize the present Quest 3 until `adb devices -l` reports one device in state `device`; then run the documented reverse, Quest Browser, immersive-entry, controller, and remote-debug checks.
2. Confirm CI passes after publication; ordinary CI intentionally excludes emulator interaction and physical Quest testing.
3. Run the blinded apparatus-recognition protocol in `docs/UX_VALIDATION.md` with at least one operator or educator and preferably one non-operator.
4. Complete the blinded low/optimum/high review and a normal real-time desktop performance observation before accepting Batch 03.
5. Keep Batch 02B spatial hashing, pooling, mass/density fidelity, and merge-animation metadata deferred unless new measurements or visible limitations justify one.
6. Keep hosted deployment and every unverified physical Quest criterion open; archived source artifacts remain non-authoritative.

## Commands

```powershell
npm ci
npm test
npm run benchmark
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run test:browser
npm run dev
```

Open `http://localhost:5173` in Chrome for the Quest 3 emulator. For later physical-device testing, follow [docs/DEVICE_TESTING.md](docs/DEVICE_TESTING.md).
