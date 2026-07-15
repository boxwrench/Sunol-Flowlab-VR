# Performance and Device Evidence

## 2026-07-14 - Chrome Quest 3 emulator preflight

- Mode: development, Chrome localhost, IWER Meta Quest 3 profile
- Runtime: Node.js 24.12.0, Vite 8.1.4, Three.js 0.165.0, `@react-three/xr` 6.6.30
- Scene: one wireframe tank placeholder, grid, two lights
- Result: immersive emulator session entered; left and right controller panels and poses rendered
- Console errors after a clean session: 0
- Automated checks at this point: 6 repository-contract tests and 8 unit tests passed; typecheck, lint, and production build passed

This proves the desktop development workflow and package compatibility only. It does not measure stereo correctness, controller ergonomics, tracking, headset thermals, frame rate, or memory on the physical Quest 3.

## 2026-07-14 - Headless foundation benchmark

- Workload: 500 particles, 10,000 fixed steps at 1/60 second, canonical seed `0x5f3759df`
- Total: 58.8326 ms
- Average step: 0.00572081 ms
- p95 step: 0.0062 ms
- Final active particles: 500
- State-array allocations: 7 fixed typed arrays
- Final state finite: yes

Command: `npm run benchmark`. The JSON line in command output is the machine-readable artifact. Timing is a development-machine observation, not a release threshold.

## Hot-path allocation audit

- Simulation step: no object, array, closure, PRNG, or typed-array allocation.
- Fixed-step callback: memoized once by the renderer.
- Particle upload: one memoized `Matrix4` reused for all instances.
- Metrics recording: three preallocated rolling arrays; snapshot sorting allocates only during the one-second development overlay refresh or explicit export.
- Expected remaining per-frame work: two timer reads around simulation, one timer read after instance upload, 500 matrix writes, and React Three Fiber/Three.js internal rendering work.

## 2026-07-14 - Chrome rendered memory observation

Chrome's optional `performance.memory.usedJSHeapSize` counter was added to development telemetry and observed with 500 rendered particles and three draw calls. After startup and garbage collection, heap use remained in a narrow 64.0-65.0 MB range from approximately 50 through 250 seconds; the recovered surface reported 66.1 MB. Particle and draw-call counts remained stable, with no evidence of unbounded heap growth.

| Elapsed  |    Heap | Average frame | p95 frame | Simulation | Instance sync |
| -------- | ------: | ------------: | --------: | ---------: | ------------: |
| baseline | 71.2 MB |       8.35 ms |   15.6 ms |   0.083 ms |      0.034 ms |
| ~50 s    | 64.4 MB |       5.62 ms |   11.4 ms |   0.006 ms |      0.016 ms |
| ~100 s   | 64.9 MB |       5.66 ms |    9.7 ms |   0.003 ms |      0.017 ms |
| ~150 s   | 65.0 MB |       5.75 ms |    8.9 ms |   0.005 ms |      0.020 ms |
| ~200 s   | 64.6 MB |       5.81 ms |   10.1 ms |   0.007 ms |      0.021 ms |
| ~250 s   | 64.0 MB |       6.03 ms |    9.5 ms |   0.006 ms |      0.021 ms |

Near the end of the window, the emulator presentation surface became blank without a new application error and recovered immediately on reload. The only recorded console error predated the observation and reported that an XR session offer had been superseded. The app now disables automatic session offers and retains its explicit **Enter VR** action. The flat memory trend was accepted as evidence, but the presentation interruption required the post-fix rerun recorded below.

## 2026-07-15 - Post-fix uninterrupted Chrome observation

The desktop idle path was rerun in a visible Chrome window with the IWER Meta Quest 3 profile installed and automatic session offers disabled. The explicit **Enter VR** control was intentionally left untouched because Track 1A measures the rendered desktop harness; emulator immersive entry and controllers were already established separately. The presentation remained intact for 310 seconds with no console errors, no automatic XR offer, 500 particles, and three draw calls throughout.

| Elapsed  |    Heap | Average frame | p95 frame | Simulation | Instance sync |
| -------- | ------: | ------------: | --------: | ---------: | ------------: |
| baseline | 34.9 MB |      16.66 ms |  16.90 ms |   0.009 ms |      0.012 ms |
| ~50 s    | 35.5 MB |      16.66 ms |  17.00 ms |   0.009 ms |      0.011 ms |
| ~95 s    | 35.2 MB |      16.66 ms |  16.90 ms |   0.006 ms |      0.010 ms |
| ~140 s   | 35.5 MB |      16.66 ms |  16.90 ms |   0.009 ms |      0.014 ms |
| ~185 s   | 35.3 MB |      16.66 ms |  17.10 ms |   0.009 ms |      0.010 ms |
| ~230 s   | 35.2 MB |       5.55 ms |  12.00 ms |   0.004 ms |      0.005 ms |
| ~275 s   | 35.2 MB |       4.30 ms |   5.80 ms |   0.003 ms |      0.010 ms |
| ~310 s   | 35.3 MB |       4.31 ms |   5.70 ms |   0.002 ms |      0.006 ms |

The visible presentation cadence changed during the observation from a 60 Hz cap to a higher-rate compositor path; the table preserves both regimes instead of averaging them together. The valid run never dropped below the initial 60 FPS cadence. Heap remained within 34.9-35.5 MB with no upward trend.

The final exported 300-frame rolling report was captured at `2026-07-15T15:14:54.092Z` in development mode:

| Report field            |            Value |
| ----------------------- | ---------------: |
| Average FPS             |       229.550846 |
| Average frame           |      4.356333 ms |
| p95 frame               |      5.600000 ms |
| Average simulation step |      0.002667 ms |
| Average instance sync   |      0.009333 ms |
| Active particles        |              500 |
| Draw calls              |                3 |
| Rolling sample count    |              300 |
| Heap used               | 37,314,210 bytes |

The exported user-agent identifies Oculus Browser on Quest 3 because it is supplied by the IWER emulation profile. This remains desktop Chrome evidence, not a physical-headset measurement. Track 1A's rendered stability gate is accepted. Real Quest performance remains device-blocked.

## 2026-07-15 - Batch 02A production phenomenon benchmark

The benchmark schema now covers the full accepted Dose 5 phenomenon path rather than foundation drift alone: 500 particles, 2,580 fixed steps, four phases totaling 43 simulated seconds, normalized size and settled state, and authoritative 12-band turbidity sampling.

| Metric                |       Value |
| --------------------- | ----------: |
| Schema                |           2 |
| Total                 |  28.1278 ms |
| Average step          | 0.010807 ms |
| p95 step              | 0.023800 ms |
| Active particles      |         500 |
| Particle-state arrays |           9 |
| Turbidity arrays      |           3 |
| Endpoint turbidity    |    0.200000 |
| Final state finite    |         yes |

The canonical 11-dose sweep completed in 214.22 ms during focused validation, and the nine-seed acceptance corpus completed in 1.78 seconds. Both are far below the 30-second canonical sweep ceiling on the development machine.

The phenomenon step allocates no arrays, objects, closures, PRNGs, or rendering values. Its nine particle arrays and three turbidity value/scratch arrays are fixed and reused. Completed result snapshots, failure JSON, Markdown tables, and sorted benchmark samples allocate outside the hot step. No evidence justifies Batch 02B spatial hashing, pooling, collision, mass/density, or merge-animation work. Full evidence is in [the Batch 02A acceptance packet](BATCH_02A_ACCEPTANCE.md).
