# Sunol FlowLab VR

Sunol FlowLab VR is an open-source educational experience for people interested in drinking-water treatment. It uses a VR-first tabletop coagulation experiment and a desktop spectator mode to show a qualitative idea: treatment response has an optimum, and both underdose and overdose can leave poorer water clarity.

This is a **phenomenological coagulation model**, not dose-prediction software, operational guidance, CFD, or a calibrated model of a real plant. The setting and values are representative and fictionalized.

## Project status

Implementation is in progress. Batch 00 is substantially complete, Batch 01A is accepted, and the local physical portion of Batch 01B is accepted on Quest 3; its hosted-URL smoke gate remains open. Reduced Batch 02A proves the deterministic 11-dose phenomenon with app-owned state, authoritative turbidity bands, browser evidence, and an accepted nine-seed regression suite. Batch 02B performance machinery is deferred. Batch 03 desktop presentation is in progress with a band-driven hero tank, static six-jar blockout, deterministic comparison presets, clearing diagnostics, and a clean recognition-review mode; its external recognition and human visual-comparison gates remain open. See [the physical Quest evidence](docs/PERFORMANCE.md#2026-07-15---physical-quest-3-local-preflight), [the Batch 03 progress packet](docs/BATCH_03_PROGRESS.md), [PROGRESS.md](PROGRESS.md), and the [implementation-plan index](IMPLEMENTATION_PLAN.md).

The approved presentation direction is a [hybrid six-jar test bench and hero observation tank](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md): one live authoritative simulation, six static canonical preset summaries, and a complete plot/log covering all eleven dose values.

## Built With

- **OpenAI Codex**
- **GPT-5.6 Thinking**
- WebXR
- React
- TypeScript
- Three.js
- React Three Fiber
- Vite
- Vitest
- Playwright
- Node.js

## How Codex and GPT-5.6 Were Used

Sunol FlowLab VR was built through an AI-assisted development workflow using both **OpenAI Codex** and **GPT-5.6 Thinking**.

### OpenAI Codex

Codex worked directly with the repository and was used to:

- scaffold and implement the WebXR application;
- create the deterministic simulation foundation;
- refactor simulation ownership out of the rendering layer;
- write and run unit, architecture, and repository-contract tests;
- build performance telemetry and headless benchmarks;
- review code against the project's architecture rules;
- update implementation plans, handoff notes, and technical documentation;
- break larger milestones into small, testable repository changes.

Work was divided into narrow batches with explicit scope, tests, non-goals, and completion evidence. Codex-generated changes were reviewed before being accepted.

### GPT-5.6 Thinking

GPT-5.6 was used for the higher-level product and engineering work around the implementation, including:

- turning the original idea into a focused product concept;
- reviewing the repository architecture and identifying boundary problems;
- designing the hybrid six-jar bench and hero observation tank;
- deciding how the project should balance realism, readability, and headset performance;
- challenging unnecessary scope and premature engine design;
- developing the implementation roadmap and acceptance criteria;
- reviewing feedback from other models and consolidating it into repository-ready briefs;
- helping explain the project clearly for operators, developers, and hackathon judges.

### Human Role

The project direction and treatment knowledge came from my experience working in drinking-water treatment.

I made the final decisions about:

- what the simulation should teach;
- which treatment behaviors were appropriate to simplify;
- what could be presented responsibly;
- which AI recommendations to accept or reject;
- whether generated code and documentation matched the intended experience.

Codex and GPT-5.6 accelerated the engineering and design process, but they did not replace operator judgment, testing, or human review.

## Development Approach

The project was not generated from one large prompt. It was built in small increments:

1. Define the product and safety boundaries.
2. Establish the architecture and pinned toolchain.
3. Implement deterministic simulation primitives.
4. Add tests and performance evidence.
5. Review the result.
6. Correct architecture drift before adding more features.
7. Continue into the next bounded implementation batch.

This workflow made the AI contribution traceable and kept the project from expanding into a general-purpose simulator before the central educational idea was proven.

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
