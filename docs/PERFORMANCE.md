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

| Elapsed | Heap | Average frame | p95 frame | Simulation | Instance sync |
| --- | ---: | ---: | ---: | ---: | ---: |
| baseline | 71.2 MB | 8.35 ms | 15.6 ms | 0.083 ms | 0.034 ms |
| ~50 s | 64.4 MB | 5.62 ms | 11.4 ms | 0.006 ms | 0.016 ms |
| ~100 s | 64.9 MB | 5.66 ms | 9.7 ms | 0.003 ms | 0.017 ms |
| ~150 s | 65.0 MB | 5.75 ms | 8.9 ms | 0.005 ms | 0.020 ms |
| ~200 s | 64.6 MB | 5.81 ms | 10.1 ms | 0.007 ms | 0.021 ms |
| ~250 s | 64.0 MB | 6.03 ms | 9.5 ms | 0.006 ms | 0.021 ms |

Near the end of the window, the emulator presentation surface became blank without a new application error and recovered immediately on reload. The only recorded console error predated the observation and reported that an XR session offer had been superseded. The app now disables automatic session offers and retains its explicit **Enter VR** action. The flat memory trend is accepted as evidence; an uninterrupted five-minute post-fix presentation rerun remains pending because work was paused for publication.

Real Quest measurements remain device-blocked. The Batch 01A rendered gate also remains open until the post-fix uninterrupted rerun captures its final metrics report.
