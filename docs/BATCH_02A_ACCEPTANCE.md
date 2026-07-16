# Batch 02A Acceptance: Minimum Phenomenon Substrate

> Historical baseline: this packet remains the accepted evidence for the minimum statistical phenomenon substrate. The later [modeling research amendment](MODELING_RESEARCH_AMENDMENT.md) supersedes conflicting version 1 implementation guidance and is routed through Workstream 03D; it does not retroactively erase this prototype result.

Accepted: 2026-07-15

## Outcome

The renderer-free simulation now demonstrates one deterministic underdose-optimum-overdose basin with the minimum mechanics required by Batch 02A. The app-owned runtime advances the same production phenomenon state that the headless sweep and renderer consume.

Added intentionally:

- normalized representative floc size and binary suspended/settled typed arrays;
- pure configurable dose efficiency for detents 0 through 10;
- 6-second rapid mix, 15-second flocculation, 20-second settling, and 2-second measurement phases;
- statistical floc growth and size-squared settling with irreversible settlement;
- one preallocated 12-band authoritative turbidity record;
- canonical, reverse-order, and nine-seed dose sweeps;
- a versioned benchmark over the complete phenomenon path.

Not added: collisions, spatial hashing, free-slot pooling, mass or density fields, merge metadata, generalized simulation interfaces, additional live tanks, instruments, persistence, or XR interactions. Batch 02B remains unauthorized because the accepted path is fast and visually legible without those mechanisms.

## Repository changes

New production modules: `coagulation.ts`, `doseEfficiency.ts`, `doseSweep.ts`, `phenomenon.ts`, and `turbidity.ts`, with dedicated tests. Existing particle state, drift, simulation exports, benchmark, app runtime, development diagnostics, and read-only particle scaling were extended. Architecture/status/evidence documents and boundary tests were synchronized. No file was removed and no dependency changed.

## Accepted configuration

| Field                                   |                    Value |
| --------------------------------------- | -----------------------: |
| Config schema                           |                        1 |
| Config hash                             |       `fnv1a32-056c0563` |
| Canonical seed                          |             `0x5f3759df` |
| Fixed timestep                          |              1/60 second |
| Representative particles                |                      500 |
| Turbidity bands                         |                       12 |
| Configured optimum                      |                   Dose 5 |
| Phase schedule                          |  6 / 15 / 20 / 2 seconds |
| Total steps                             |                    2,580 |
| Dose efficiency bounds                  |              0.15 / 1.00 |
| Underdose / overdose falloff per detent |              0.12 / 0.10 |
| Floc target minimum / range / exponent  |       0.15 / 0.80 / 1.50 |
| Initial normalized size range           |              0.08 / 0.12 |
| Floc growth rate                        |          0.22 per second |
| Settling size threshold                 |                     0.18 |
| Settling base / added speed             | 0.006 / 0.070 per second |
| Raw turbidity / treatment range         |              0.92 / 0.72 |
| Turbidity efficiency exponent           |                     1.50 |
| Global / local optical-load blend       |              0.35 / 0.65 |
| Endpoint zone                           |       Bands 2 through 11 |
| Upper clarity zone / threshold          |       Top 4 bands / 0.35 |

All constants are unitless or compressed teaching parameters. They do not represent calibrated chemistry, physical dosing units, dose prediction, or operating guidance.

## Canonical sweep

| Dose | Endpoint turbidity | Settled | Mean size | Upper clarity time |
| ---: | -----------------: | ------: | --------: | -----------------: |
|    0 |           0.750568 |      71 |  0.343160 |              never |
|    1 |           0.660247 |     108 |  0.437178 |              never |
|    2 |           0.558439 |     178 |  0.542777 |              never |
|    3 |           0.447113 |     266 |  0.658804 |              never |
|    4 |           0.326483 |     407 |  0.784393 |            9.783 s |
|    5 |           0.200000 |     500 |  0.918865 |            6.700 s |
|    6 |           0.305730 |     426 |  0.806205 |            8.133 s |
|    7 |           0.407837 |     308 |  0.699641 |              never |
|    8 |           0.503833 |     226 |  0.599547 |              never |
|    9 |           0.593368 |     150 |  0.506369 |              never |
|   10 |           0.676090 |     100 |  0.420667 |              never |

The minimum is Dose 5. Tail margins are 0.550568 and 0.476090, with zero shoulder reversals. Natural and reverse dose orders reproduce identical endpoints and band snapshots. The nine-seed corpus `0x5f3759df` through `0x5f3759e7` passes the configured minimum, tail, basin, clarity, bounds, and reset-purity rules.

## Performance and allocation evidence

The default 500-particle benchmark covers all 2,580 production phenomenon steps at Dose 5:

| Metric                         |       Value |
| ------------------------------ | ----------: |
| Total                          |  28.1278 ms |
| Average step                   | 0.010807 ms |
| p95 step                       | 0.023800 ms |
| Endpoint turbidity             |    0.200000 |
| Particle-state arrays          |           9 |
| Turbidity value/scratch arrays |           3 |
| Final state finite             |         yes |

The canonical 11-dose sweep completed in 214.22 ms during focused validation; the extended nine-seed suite completed in 1.78 seconds. Timing is development-machine evidence, not a release threshold.

No array, object, PRNG, closure, or renderer allocation occurs inside the phenomenon step. Particle state, band values, and band scratch arrays are allocated once and reused. Final trial results, band snapshots, sorted benchmark samples, Markdown tables, and JSON failure reports allocate only after or outside stepping.

## Browser evidence

The provided Playwright development client completed the production trial at 60 FPS with 500 particles and three draw calls. Text-state and visually inspected screenshots showed:

- 15.650 seconds: flocculation, visibly enlarged suspended floc;
- 31.217 seconds: settling, a readable downward clearing front;
- 43.000 seconds: complete, settled bed and endpoint turbidity 0.200000.

No console error or presentation interruption was reported. This is desktop evidence; physical Quest performance remains a separate open gate.

## Model limitations and field rationale

`normalizedSize` exists because readable aggregation and size-dependent settling are the causal lesson. `settled` exists because irreversible removal from the water column must be explicit and cheap to query. No additional per-particle diagnostic field was necessary.

The unresolved-fines floor is an explicit phenomenological dose-response term blended with suspended particle optical load. It stabilizes the lesson across seeds but is not calibrated chemistry. Particle size and settlement materially affect every band, preventing dose alone from painting the complete result. Local band occupancy remains representative rather than fluid-dynamic, and the model omits collision geometry, shear breakup, electrostatics, viscosity calibration, CFD, and plant-specific prediction.

## Validation

```powershell
npm test
npm run benchmark
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run test:browser
```

- 13 repository contract tests
- 63 Vitest tests across 14 files
- canonical and nine-seed sweep
- reverse-order equality
- typecheck and lint
- production-path benchmark
- full 43-second Playwright/text-state/visual pass

Physical Quest and hosted-route criteria remain open. Windows and ADB did not yet detect the present headset over USB, so no device acceptance claim is included here.
