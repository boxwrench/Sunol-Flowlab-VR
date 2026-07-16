# Sunol FlowLab VR Project Authority

## Product boundary

Version 1 is **Sunol FlowLab VR: Coagulation only**: one live authoritative simulation in a hero observation tank, one six-jar rack of static canonical dose presets, one world scale, and one scene. It is VR-first, with a desktop spectator experience at the same URL. The shipped experience uses physical instrumentation rather than floating application panels.

The simulation is a phenomenological teaching model. It is not a dose-prediction tool, CFD model, calibrated plant simulator, or source of operating guidance. The initial Quest 2-class performance posture is 500 representative particles; increasing toward 1,000 requires measurements on a real target headset.

Do not build a universal FlowLab engine until a second process module ships.

## Engineering authority

- `/src/sim` owns deterministic state, seeded randomness, relative optical load, and headless sweeps. It must not import React, Three.js, browser rendering, or XR code.
- `/src/render` owns Three.js/React Three Fiber presentation and consumes simulation output. It must not derive independent process values.
- `/src/xr` owns XR session/input handling and emits discrete application commands only.
- `/src/app` owns lifecycle, mode selection, orchestration, and spectator entry. It does not own per-particle state.
- React state updates are forbidden in the hot simulation loop.
- Per-frame allocation requires an explicit documented reason.
- One vertically binned relative optical-load record is authoritative for water appearance, clearing front, gauge, score, plot, persistence, static jars, and ghost replay. It is dimensionless and must not be labeled as calibrated NTU.
- The mounted plot and versioned experiment log are the complete memory for all eleven doses. The six jars are static summaries for canonical presets 0, 2, 4, 6, 8, and 10 only.

The stable command and data contracts are defined in `docs/CONTRACTS.md`; regression rules are in `docs/REGRESSION_CONTRACT.md`. The Markdown series indexed by `IMPLEMENTATION_PLAN.md` is the active plan authority.

The final version 1 process model is governed by `docs/MODELING_RESEARCH_AMENDMENT.md`. Workstream 03D must make mass authoritative, derive diameter with default `Df = 2.0`, conserve mass through stable deterministic merges, use capped fractal-derived settling, and calculate optical load from suspended `sum(D^2)`. Rendered morphology remains non-authoritative. Version 1 has no free list; spatial hashing requires profiling evidence. The accepted Batch 02A statistical model remains a historical comparison baseline until 03D passes.

Treatment-result replay is governed by `docs/GHOST_REPLAY_DESIGN.md`. Version 1 records authoritative optical-load bands at 10 Hz and replays them through an app-owned clock with bounded linear interpolation. It does not record particles or rerun the simulation. Recording, compatibility, storage, and playback belong to `/src/app`; `/src/render` consumes a subordinate read-only replay view. Do not add compression, a generalized storage layer, IndexedDB, WebAssembly, fixed-point math, cloud sync, or cross-device lockstep without the documented measurement or product trigger.

## Toolchain policy

Use Node.js 24.12.x with npm 11.18.x. Runtime and development packages are pinned exactly in `package.json`; the XR-sensitive anchor is `@react-three/xr` 6.6.30. Its bundled IWER emulator is the desktop XR preflight path. Dependency upgrades are isolated changes and are never combined with simulation tuning or XR interaction fixes.

## Data and release policy

Only public, licensed, or self-created source material may enter the project. `docs/DATA_BOUNDARY.md` is binding. The repository is public under the MIT License. Public descriptions use "personal educational portfolio project" and "phenomenological coagulation model."
