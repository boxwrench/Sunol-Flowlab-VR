# Sunol FlowLab VR

Sunol FlowLab VR is an open-source educational experience for people interested in drinking-water treatment. It uses a VR-first tabletop coagulation experiment and a desktop spectator mode to show a qualitative idea: treatment response has an optimum, and both underdose and overdose can leave poorer water clarity.

This is a **phenomenological coagulation model**, not dose-prediction software, operational guidance, CFD, or a calibrated model of a real plant. The setting and values are representative and fictionalized.

## Project status

Implementation is in progress. Batch 00 contracts and the exact toolchain are validated; headset-independent Batch 01A work is underway. Quest 3 device validation remains pending until the physical headset is available. See [PROGRESS.md](PROGRESS.md) and the [implementation-plan index](IMPLEMENTATION_PLAN.md).

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
npm run build
```

The physical XR route and Quest debugging workflow are documented in [docs/DEVICE_TESTING.md](docs/DEVICE_TESTING.md).

## Architecture and contribution

The deterministic simulation stays independent of React, Three.js, and WebXR. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing module boundaries. Public-data restrictions are binding and documented in [docs/DATA_BOUNDARY.md](docs/DATA_BOUNDARY.md).

Contributions from water professionals, educators, designers, and developers are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).

## License

Licensed under the [MIT License](LICENSE).

