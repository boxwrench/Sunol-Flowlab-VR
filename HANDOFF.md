# Session Handoff

Updated: 2026-07-15

## Resume point

- Repository: <https://github.com/boxwrench/Sunol-Flowlab-VR>
- Branch: `main`
- Published baseline before this increment: `bed6438` (`Archive superseded planning artifacts`)
- Current increment: Batch 01A rendered-stability closeout
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
- Fixed-capacity 500-particle typed-array state with bounded drift
- Read-only one-draw-call instanced particle rendering without lifecycle ownership or per-frame React state
- Preallocated performance telemetry, Chrome heap reporting, and machine-readable headless benchmark
- Automated module-boundary regression tests, a desktop Playwright smoke test, and a minimal GitHub Actions workflow
- Visible startup error boundary
- Approved hybrid presentation direction: one live authoritative hero tank, six static canonical preset jars, and a complete eleven-dose plot/log
- Accepted uninterrupted 310-second post-fix Chrome observation with stable heap, 500 particles, three draw calls, and zero console errors

The current local validation includes 12 passing repository contract tests, 33 passing Vitest tests, a passing Playwright desktop smoke test, type checking, lint, formatting, production build, and the 500-particle benchmark. The copied 20-page design PDF matches the supplied source SHA-256 exactly and was visually reviewed before integration. The production build reports expected non-failing large-chunk warnings from emulator environment assets.

## Open gates and constraints

- The Quest 3 has Developer Mode enabled but was not physically available. Do not mark real-device criteria complete until tested on the headset.
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

1. Confirm the CI workflow passes after the next publication; ordinary CI intentionally excludes emulator interaction and physical Quest testing.
2. Begin reduced Batch 02A with minimum particle/floc size, suspended/settled state, and deterministic dose-efficiency mapping for detents 0 through 10.
3. Preserve reset purity, fixed-step determinism, fixed-capacity storage, and the approved hybrid presentation semantics from the first Batch 02A change.
4. Require measured evidence before adding Batch 02B spatial hashing, pooling, mass/density fidelity, or merge-animation metadata.
5. Keep all physical Quest criteria open unless explicitly resolved; archived source artifacts remain non-authoritative.

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
