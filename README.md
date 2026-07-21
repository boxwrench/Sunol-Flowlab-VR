# Sunol FlowLab VR

[![CI](https://github.com/boxwrench/Sunol-Flowlab-VR/actions/workflows/ci.yml/badge.svg)](https://github.com/boxwrench/Sunol-Flowlab-VR/actions/workflows/ci.yml)
[![Deploy](https://github.com/boxwrench/Sunol-Flowlab-VR/actions/workflows/pages.yml/badge.svg)](https://github.com/boxwrench/Sunol-Flowlab-VR/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A VR-first, hands-on coagulation experiment for learning why the best treatment
dose is not always the largest dose. The current experience also includes an
in-world reference library built around official California and EPA resources.

**[Launch Sunol FlowLab VR](https://boxwrench.github.io/Sunol-Flowlab-VR/)**

![Sunol FlowLab VR coagulation experiment and reference library in a water-quality lab](docs/images/sunol-flowlab-current/shot-0.png)

**[Watch the narrated Quest demonstration](https://github.com/boxwrench/Sunol-Flowlab-VR/releases/download/v0.1.0/sunol-flowlab-vr-v0.1.0-demo.mp4)**

Sunol FlowLab VR is an open-source personal educational portfolio project
inspired by drinking-water treatment. It presents one tabletop experiment in a
fictionalized water-quality laboratory. Choose a relative coagulant dose,
observe floc formation and settling, compare the resulting water clarity, and
build a dose-response curve across repeated trials. A physical reference shelf
adds short in-world primers on coagulation, jar testing, reading results, and
enhanced coagulation, with links to the official source pages.

The experience runs at the same URL in immersive Meta Quest WebXR and as a
desktop spectator simulation in Chrome or Chromium.

## What it demonstrates

Coagulation has an optimum region:

- too little dose leaves particles insufficiently destabilized;
- a near-optimum dose promotes aggregation and settling;
- too much dose can also produce a poorer result.

The live observation tank makes the treatment cycle visible. A physical gauge
and mounted plot summarize the result, while the six-jar rack preserves static
summaries for canonical doses 0, 2, 4, 6, 8, and 10.

The reference library keeps the process lesson close to the apparatus. Each
book opens as a bounded, readable in-world page sequence. Its **WEB** control
opens the corresponding California or EPA resource in the same browser tab;
Browser Back returns to FlowLab for VR re-entry.

This is a **phenomenological coagulation model**, not dose-prediction software,
a calibrated plant model, CFD, or operational guidance. It does not report NTU
and must not be used for operations, engineering design, or treatment
decisions. All displayed values and the laboratory setting are representative
and fictionalized.

## Try the experience

### Meta Quest

1. Open the [hosted experience](https://boxwrench.github.io/Sunol-Flowlab-VR/)
   in Quest Browser.
2. Sit comfortably, then select **Enter VR**.
3. Use a controller to set a dose from 0 through 10.
4. Press **Start** and watch the complete treatment cycle.
5. Read the **Relative Turbidity** gauge and result plot.
6. Refill, choose another dose, and compare the outcomes.
7. Select a book on the reference shelf to review the treatment concepts or
   open its official source page.

The v0.1 experience is designed and tested for seated use on Quest 3. It also
includes a physical mute control and selectable Sunol or Hetchy scenery.

### Desktop Chrome or Chromium

Open the same link in a current Chrome or Chromium-based desktop browser. The
lab renders directly as a spectator experience, and its physical controls can
be operated with pointer input. No mobile-specific experience is provided.

## The experiment

| Instrument               | Purpose                                                      |
| ------------------------ | ------------------------------------------------------------ |
| Dose dial                | Selects one of eleven relative doses, 0 through 10           |
| Start button             | Begins one deterministic treatment trial                     |
| Hero observation tank    | Shows rapid mix, flocculation, settling, and clarification   |
| Relative Turbidity gauge | Displays the dimensionless optical-load result               |
| Results plot             | Preserves the complete dose-response history                 |
| Jar Test rack            | Shows static summaries for doses 0, 2, 4, 6, 8, and 10       |
| Replay controls          | Compare a limited saved result with the current result       |
| Refill control           | Restores the same deterministic raw-water starting condition |
| Reference library        | Opens four short primers and their official source pages     |

One live simulation is authoritative. The jars are summaries rather than six
additional simulations, and the plot and experiment log retain results for all
eleven dose settings.

## Release status

Version 0.1.0 is released. The public experience and owner-operated narrated
Quest demonstration have passed final review. Release validation includes:

- immersive entry and seated review on Meta Quest 3;
- the final laboratory, dashboard, scenery, labeling, and audio review;
- a hosted Dose 0, Dose 5, and Dose 10 repeat cycle with refills;
- immersive exit and re-entry;
- deterministic dose-sweep and simulation regression checks;
- unit, architecture, browser, type, lint, build, and benchmark checks;
- a three-minute direct Quest-view capture with the approved educational
  narration and final jar-spectrum inspection.

See the [v0.1.0 release notes](docs/RELEASE_NOTES_V0.1.0.md). A sideloadable APK
and mobile-specific experience remain intentionally deferred.

The current main branch builds on v0.1.0 with the accepted four-book reference
library and three Quest-reviewed visual-polish passes: stronger material and
color separation, shared low-cost lab lighting, and a subtle deterministic
surface texture. No process-model values, treatment timing, persistence
contracts, or operational claims changed. The library's official resource
record is in
[docs/REFERENCE_LIBRARY_SOURCES.md](docs/REFERENCE_LIBRARY_SOURCES.md).

Detailed evidence is recorded in [PROGRESS.md](PROGRESS.md),
[the implementation plan](IMPLEMENTATION_PLAN.md),
[UX validation](docs/UX_VALIDATION.md), and
[performance notes](docs/PERFORMANCE.md).

## How it works

The application keeps process behavior separate from presentation:

| Area         | Responsibility                                                                           |
| ------------ | ---------------------------------------------------------------------------------------- |
| `src/sim`    | Deterministic state, seeded randomness, aggregation, settling, and relative optical load |
| `src/app`    | Trial lifecycle, orchestration, results, persistence, replay, and audio                  |
| `src/render` | Three.js and React Three Fiber presentation of authoritative state                       |
| `src/xr`     | WebXR sessions and discrete physical input commands                                      |

The simulation uses fixed-capacity representative particles with
mass-conserving deterministic merges. Suspended projected area supplies one
vertically binned, dimensionless relative optical-load record used throughout
the water appearance, gauge, plot, persistence, jar summaries, and result
replay.

Saved replays contain optical-load bands sampled at 10 Hz. They do not record
particles or rerun the simulation. See
[the architecture](docs/ARCHITECTURE.md),
[modeling research amendment](docs/MODELING_RESEARCH_AMENDMENT.md), and
[ghost replay design](docs/GHOST_REPLAY_DESIGN.md).

## Local development

Requirements:

- Node.js 24.12.x
- npm 11.18.x
- current Chrome or Chromium

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`. Development mode includes the Quest 3 IWER
emulator supplied by the pinned XR package. Use `npm run dev:https` when a
same-network headset test requires an HTTPS origin.

Create a production or GitHub Pages build with:

```sh
npm run build
npm run build:pages
```

The physical-device and remote-debugging workflow is documented in
[docs/DEVICE_TESTING.md](docs/DEVICE_TESTING.md).

## Validation

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

The current checkpoint includes 28 repository-contract tests and 143 Vitest
tests, plus seven rendered Chromium scenarios. Quest evidence is
kept separate from automated browser evidence so headset-specific claims remain
traceable.

## How I used Codex

I used OpenAI Codex as a hands-on engineering collaborator working directly in
the repository. I did not ask it to generate a finished application from one
large prompt. Instead, we worked through small implementation batches with a
defined goal, explicit non-goals, automated checks, and a human acceptance gate.

Codex helped me:

- turn the product concept into an implementation plan and stable architecture;
- implement the deterministic coagulation model and WebXR application;
- keep simulation, rendering, application lifecycle, and XR input ownership
  separated;
- write and run unit, regression, architecture, browser, and performance tests;
- operate browser and Quest debugging tools, inspect failures, and propose
  focused corrections;
- maintain technical decisions, evidence, handoff notes, and release
  documentation;
- configure and verify the public GitHub Pages deployment.

The working loop was:

1. I described the treatment lesson or experience problem.
2. Codex inspected the current repository and proposed or implemented a bounded
   change.
3. Automated tests and browser captures checked the implementation.
4. I reviewed the experience in the Quest headset and explained what worked or
   felt wrong.
5. Codex revised the implementation, documented the result, and preserved the
   accepted checkpoint.

That headset feedback materially shaped the product. For example, I identified
that the original instruments, replay controls, tank markers, and jar results
were difficult to interpret. I directed the removal of misleading elements,
requested plain-language labels and stronger jar-cloudiness differences, and
iteratively adjusted the laboratory, dashboard, panorama, control sizes,
position, and viewer height. Codex translated those decisions into tested
repository changes; I made the final acceptance decisions in the headset.

### Human judgment and treatment knowledge

The treatment concept and responsible-use boundaries come from my experience
working in drinking-water treatment. I decided:

- what the simulation should teach;
- which process behaviors could be simplified responsibly;
- which visual explanations were clear or misleading;
- which AI recommendations to accept, reject, or defer;
- when the browser and headset experience was ready to ship.

Codex accelerated implementation and verification, but it did not replace
treatment judgment, physical testing, or product ownership. GPT-5.6 Thinking
also assisted with higher-level product critique, architecture review, and
planning.

## Contributing

Contributions from water professionals, educators, designers, and developers
are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the binding
[public-data boundary](docs/DATA_BOUNDARY.md) before submitting changes.

Please do not contribute sensitive facility information, proprietary operating
values, official branding, or material that implies endorsement.

## License

Sunol FlowLab VR is available under the [MIT License](LICENSE).
