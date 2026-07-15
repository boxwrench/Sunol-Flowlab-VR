# Sunol FlowLab VR Project Authority

## Product boundary

Version 1 is **Sunol FlowLab VR: Coagulation only**: one tabletop tank, one world scale, and one scene. It is VR-first, with a desktop spectator experience at the same URL. The shipped experience uses physical instrumentation rather than floating application panels.

The simulation is a phenomenological teaching model. It is not a dose-prediction tool, CFD model, calibrated plant simulator, or source of operating guidance. The initial Quest 2-class performance posture is 500 representative particles; increasing toward 1,000 requires measurements on a real target headset.

Do not build a universal FlowLab engine until a second process module ships.

## Engineering authority

- `/src/sim` owns deterministic state, seeded randomness, turbidity, and headless sweeps. It must not import React, Three.js, browser rendering, or XR code.
- `/src/render` owns Three.js/React Three Fiber presentation and consumes simulation output. It must not derive independent process values.
- `/src/xr` owns XR session/input handling and emits discrete application commands only.
- `/src/app` owns lifecycle, mode selection, orchestration, and spectator entry. It does not own per-particle state.
- React state updates are forbidden in the hot simulation loop.
- Per-frame allocation requires an explicit documented reason.
- One turbidity-band record is authoritative for water appearance, clearing front, gauge, score, plot, and ghost replay.

The stable command and data contracts are defined in `docs/CONTRACTS.md`; regression rules are in `docs/REGRESSION_CONTRACT.md`. The Markdown series indexed by `IMPLEMENTATION_PLAN.md` is the active plan authority.

## Toolchain policy

Use Node.js 24.12.x with npm 11.18.x. Runtime and development packages are pinned exactly in `package.json`; the XR-sensitive anchor is `@react-three/xr` 6.6.30. Its bundled IWER emulator is the desktop XR preflight path. Dependency upgrades are isolated changes and are never combined with simulation tuning or XR interaction fixes.

## Data and release policy

Only public, licensed, or self-created source material may enter the project. `docs/DATA_BOUNDARY.md` is binding. The repository is public under the MIT License. Public descriptions use "personal educational portfolio project" and "phenomenological coagulation model."

