# Sunol FlowLab VR

[![CI](https://github.com/boxwrench/Sunol-Flowlab-VR/actions/workflows/ci.yml/badge.svg)](https://github.com/boxwrench/Sunol-Flowlab-VR/actions/workflows/ci.yml)

Sunol FlowLab VR is an open-source personal educational portfolio project for people interested in drinking-water treatment. It uses a VR-first tabletop coagulation experiment and a desktop spectator mode to show a qualitative idea: treatment response has an optimum, and both underdose and overdose can leave poorer water clarity.

This is a **phenomenological coagulation model**, not dose-prediction software, operational guidance, CFD, or a calibrated model of a real plant. The setting and values are representative and fictionalized.

## Project status

Implementation is in progress through accepted Batch 06, with Batch 07 and
Batch 08 now at technical-candidate status. Batch 00 is substantially complete,
Batch 01A is accepted, and the local physical portion of Batch 01B is accepted
on Quest 3; its hosted-URL smoke gate remains open. Reduced Batch 02A remains
the immutable statistical prototype baseline. Batch 03 is
[accepted with a documented fresh-recognition waiver](docs/BATCH_03_ACCEPTANCE.md),
Batch 04 is accepted with documented physical-test waivers, Batch 05 passed
seated Quest integration, and
[Batch 06 passed its complete seated treatment-cycle gate](docs/BATCH_06_ACCEPTANCE.md).
The remaining Batch 07 instrument/control verdict and Batch 08 headset
readability/comparison verdict are intentionally combined into one seated Quest
review. Batches 09–11 remain unstarted. See [PROGRESS.md](PROGRESS.md), the
[Batch 07 candidate packet](docs/BATCH_07_ACCEPTANCE.md), the
[Batch 08 technical candidate packet](docs/BATCH_08_CANDIDATE.md), and the
[implementation-plan index](IMPLEMENTATION_PLAN.md).

The approved presentation direction is a [hybrid six-jar test bench and hero observation tank](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md): one live authoritative simulation, six static canonical preset summaries, and a complete plot/log covering all eleven dose values.

The current candidate runs one deterministic seven-phase treatment cycle with
ready-only dose and Start controls, physical locked-state feedback, a 90-degree
one immutable completed result, deterministic refill, a labeled relative-
turbidity gauge, a complete 0–10 plot/log, persistent static canonical
summaries, and bounded treatment-result ghost recording/playback. Batch 08 adds
allocation-free display smoothing and a labeled past-run needle on the gauge.

The implemented [treatment-result ghost design](docs/GHOST_REPLAY_DESIGN.md)
records the authoritative relative optical-load history for restrained
previous-run comparison. It does not replay particles or recompute the
simulation. Batch 07 owns recording, compatibility, small-library persistence,
and playback. Batch 08 consumes only the app-owned replay view for its
subordinate past-run gauge needle; it adds no second tank, ghost particles, or
transparent ghost layer. The selected display choices are recorded in
[docs/TUNING.md](docs/TUNING.md).

The current automated checkpoint passes 22 repository-contract tests, 133
Vitest tests across 29 files, all six rendered-browser scenarios, the canonical
and nine-seed eleven-dose regression corpus, type checking, lint, production
build, and the standalone simulation benchmark. The compatible-ghost desktop
capture reports 55 development draw calls. These desktop checks do not replace
the remaining combined Quest review.

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
npm run acceptance:03d
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run benchmark
npm run test:browser
```

The desktop browser suite requires Playwright Chromium. The physical Quest
development route and accepted Batch 06 seated evidence are documented;
hosted-route, endurance, thermal, and release checks remain later manual gates.

The physical XR route and Quest debugging workflow are documented in
[docs/DEVICE_TESTING.md](docs/DEVICE_TESTING.md). The combined harness is
`npm run acceptance:08:quest`: `review-ready` stages the bounded comparison,
`watch-combined` records the physical trial and rolling performance, and
`watch-controls` records replay/refill/clear command evidence. The single
remaining seated session follows the combined Batch 07/08 checklist in
[docs/UX_VALIDATION.md](docs/UX_VALIDATION.md); neither candidate is marked
accepted until that verdict is recorded.

## Architecture and contribution

The deterministic simulation stays independent of React, Three.js, and WebXR. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing module boundaries. Public-data restrictions are binding and documented in [docs/DATA_BOUNDARY.md](docs/DATA_BOUNDARY.md).

Contributions from water professionals, educators, designers, and developers are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).

## License

Licensed under the [MIT License](LICENSE).
