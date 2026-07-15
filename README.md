# Sunol FlowLab VR

Sunol FlowLab VR is an open-source educational experience for people interested in drinking-water treatment. It uses a VR-first tabletop coagulation experiment and a desktop spectator mode to show a qualitative idea: treatment response has an optimum, and both underdose and overdose can leave poorer water clarity.

This is a **phenomenological coagulation model**, not dose-prediction software, operational guidance, CFD, or a calibrated model of a real plant. The setting and values are representative and fictionalized.

## Project status

Implementation is in progress. Batch 00 is substantially complete, Batch 01A is accepted, and the local physical portion of Batch 01B is accepted on Quest 3; its hosted-URL smoke gate remains open. Reduced Batch 02A proves the deterministic 11-dose phenomenon with app-owned state, authoritative turbidity bands, browser evidence, and an accepted nine-seed regression suite. Batch 02B performance machinery is deferred. Batch 03 desktop presentation is in progress with a band-driven hero tank, static six-jar blockout, deterministic comparison presets, clearing diagnostics, and a clean recognition-review mode; its external recognition and human visual-comparison gates remain open. See [the physical Quest evidence](docs/PERFORMANCE.md#2026-07-15---physical-quest-3-local-preflight), [the Batch 03 progress packet](docs/BATCH_03_PROGRESS.md), [PROGRESS.md](PROGRESS.md), and the [implementation-plan index](IMPLEMENTATION_PLAN.md).

The approved presentation direction is a [hybrid six-jar test bench and hero observation tank](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md): one live authoritative simulation, six static canonical preset summaries, and a complete plot/log covering all eleven dose values.

## Toolchain

- Node.js 24.12.x and npm 11.18.x
- Vite 8.1.4, React 19.2.7, and TypeScript 6.0.3
- Three.js 0.165.0, React Three Fiber 9.6.1, Drei 10.7.7
- **@react-three/xr 6.6.30**
- Vitest 4.1.10 and Playwright 1.61.1

Three.js 0.165.0 is intentionally aligned with the IWER emulator bundled by the pinned XR package so the application and emulator share one compatible Three.js instance. All versions are exact. Dependency upgrades are isolated from simulation tuning and XR interaction changes.

## Getting started

```sh
npm ci
npm run dev
```

Open `http://localhost:5173` in Chrome for the built-in Quest 3 emulator. Use `npm run dev:https` only when an HTTPS origin is needed for same-network device testing.

Validation commands:

```sh
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run benchmark
```

An optional desktop browser smoke test is available through npm run test:browser when Playwright Chromium is installed. Emulator interaction, physical Quest testing, and hosted-route checks remain manual gates.

The physical XR route and Quest debugging workflow are documented in [docs/DEVICE_TESTING.md](docs/DEVICE_TESTING.md).

## Architecture and contribution

The deterministic simulation stays independent of React, Three.js, and WebXR. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing module boundaries. Public-data restrictions are binding and documented in [docs/DATA_BOUNDARY.md](docs/DATA_BOUNDARY.md).

Contributions from water professionals, educators, designers, and developers are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).

## License

Licensed under the [MIT License](LICENSE).
