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

Still required for the Batch 01A gate: a five-minute rendered Chrome idle/heap observation and a captured post-render metrics report. Real Quest measurements remain device-blocked.

