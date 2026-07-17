# Batch 03 Workstream 03D Technical Acceptance

**Status:** Technical, Quest, and blinded outcome gates passed; apparatus-recognition repair remains open
**Accepted configuration:** fnv1a32-e8bf13e7
**Canonical seed:** 0x5f3759df
**Date:** 2026-07-15

## Outcome

Workstream 03D replaces the Batch 02A statistical prototype with the approved
mass-authoritative version 1 process model. The candidate passes the numerical,
architecture, population-health, performance, browser, and evidence-generation
gates required before external review.

This is technical acceptance of the process-model workstream, not final Batch
03 acceptance. The blinded apparatus-recognition and blinded outcome-
comparison gates remain open. The replacement-model Quest visibility gate
passed after this technical packet was first issued.

## Implemented model

- Ten fixed-capacity particle arrays make aggregate mass authoritative and cache
  mass-derived diameter; inactive slots are zeroed.
- Primary particles begin at unit mass and diameter 0.1. Diameter follows
  D = 0.1 * M^(1 / Df) with the accepted default Df = 2.0.
- A rotating, stable upper-triangular schedule visits every unordered slot pair
  once per 499 steps without duplicate evaluation or hot-step allocation.
- Successful merges conserve mass, retain the lower slot, use mass-weighted
  position and velocity, and contribute to a deterministic merge digest.
- Aggregate mass is capped at 8 by prohibiting larger merges. Version 1 has no
  fragmentation, regrowth, or free list.
- Fractal-derived settling is capped and generally faster for larger
  aggregates. Accepted speeds use base 0.001, diameter drive scale 0.009, and
  maximum 0.05 per second.
- The sole process authority is suspended projected area, sum(D^2), normalized
  to the initial trial load and exposed as one reusable 12-band record.
- Dose efficiency is a precomputed eleven-value Gaussian teaching abstraction
  centered on Dose 5 with sigma 3; it is not a physical dosing equation.
- Permanent diagnostics record mass error; active, suspended, and settled
  counts; mean and maximum mass; maximum diameter; largest-mass fraction; and
  the minimum visible suspended population during settling.

No spatial hash, free list, simulation merge-event metadata, ghost runtime,
Batch 04 feature, or hosted deployment was added.

## Accepted configuration and bounds

| Field                                   |                   Value |
| --------------------------------------- | ----------------------: |
| Config schema                           |                       3 |
| Config hash                             |        fnv1a32-e8bf13e7 |
| Representative primary particles        |                     500 |
| Fixed timestep                          |             1/60 second |
| Phase schedule                          | 6 / 15 / 20 / 2 seconds |
| Total trial steps                       |                   2,580 |
| Default fractal dimension               |                     2.0 |
| Primary mass / diameter                 |                 1 / 0.1 |
| Collision-radius multiplier             |                    1.15 |
| Maximum aggregate mass                  |                       8 |
| Dose optimum / Gaussian sigma           |                   5 / 3 |
| Optical-load bands                      |                      12 |
| Mass-conservation tolerance             |                    1e-6 |
| Minimum active aggregates               |                      75 |
| Minimum visible suspended aggregates    |                      40 |
| Maximum largest-aggregate mass fraction |                      2% |

All values are unitless or compressed teaching parameters. They do not claim
calibrated chemistry, NTU, real coagulant dose, plant prediction, or operating
guidance.

## Canonical eleven-dose sweep

| Dose | Endpoint optical load | Active | Suspended | Settled | Mean mass | Max mass | Min visible | Clear time |
| ---: | --------------------: | -----: | --------: | ------: | --------: | -------: | ----------: | ---------: |
|    0 |              0.737589 |    429 |       351 |      78 |     1.166 |        6 |         351 |      never |
|    1 |              0.687943 |    315 |       246 |      69 |     1.587 |        8 |         246 |   37.567 s |
|    2 |              0.539007 |    196 |       140 |      56 |     2.551 |        8 |         140 |   33.183 s |
|    3 |              0.508274 |    144 |        92 |      52 |     3.472 |        8 |          92 |   31.117 s |
|    4 |              0.510638 |    110 |        70 |      40 |     4.545 |        8 |          70 |   30.583 s |
|    5 |              0.501182 |    105 |        65 |      40 |     4.762 |        8 |          65 |   30.717 s |
|    6 |              0.510638 |    110 |        70 |      40 |     4.545 |        8 |          70 |   30.583 s |
|    7 |              0.508274 |    144 |        92 |      52 |     3.472 |        8 |          92 |   31.117 s |
|    8 |              0.539007 |    196 |       140 |      56 |     2.551 |        8 |         140 |   33.183 s |
|    9 |              0.687943 |    315 |       246 |      69 |     1.587 |        8 |         246 |   37.567 s |
|   10 |              0.737589 |    429 |       351 |      78 |     1.166 |        6 |         351 |      never |

Dose 5 is the principal minimum. Both tail margins are 0.236407, both
extremes remain above the clarity gate, and the one small allowed shoulder
reversal on each side is below 0.03. Natural and reverse dose orders reproduce
the same endpoints and band snapshots within the 1e-7 contract tolerance.
Total aggregate mass remains exactly 500 in the recorded runs.

## Nine-seed acceptance corpus

| Seed       | Minimum dose | Minimum load | Tail margin | Min active | Min visible | Largest fraction |
| ---------- | -----------: | -----------: | ----------: | ---------: | ----------: | ---------------: |
| 0x5f3759df |            5 |     0.501182 |    0.236407 |        105 |          65 |             1.6% |
| 0x5f3759e0 |            5 |     0.447059 |    0.296471 |        107 |          65 |             1.6% |
| 0x5f3759e1 |            4 |     0.438257 |    0.312349 |        110 |          68 |             1.6% |
| 0x5f3759e2 |            4 |     0.501176 |    0.225882 |        104 |          67 |             1.6% |
| 0x5f3759e3 |            5 |     0.483491 |    0.231132 |        108 |          68 |             1.6% |
| 0x5f3759e4 |            4 |     0.504878 |    0.239024 |        113 |          71 |             1.6% |
| 0x5f3759e5 |            4 |     0.425837 |    0.287081 |         93 |          55 |             1.6% |
| 0x5f3759e6 |            4 |     0.511682 |    0.275701 |        100 |          62 |             1.6% |
| 0x5f3759e7 |            5 |     0.436620 |    0.335681 |        106 |          66 |             1.6% |

All 99 trials pass the curve, range, clarity, population, and mass gates. The
median minimum remains within one detent of Dose 5. The observed worst cases
are 93 active aggregates, 55 visible suspended aggregates, 1.6% of initial mass
in the largest aggregate, and zero mass error.

## Batch 02A comparison

The Batch 02A packet remains immutable historical evidence. Its endpoint used a
statistical unresolved-fines blend and is not numerically interchangeable with
the 03D projected-area authority, so absolute endpoint values must not be read
as a calibrated improvement.

| Property            | Batch 02A prototype               | Workstream 03D replacement                      |
| ------------------- | --------------------------------- | ----------------------------------------------- |
| Config hash         | fnv1a32-056c0563                  | fnv1a32-e8bf13e7                                |
| Aggregate authority | Normalized representative size    | Conserved mass plus derived diameter            |
| Aggregation         | Statistical growth                | Stable deterministic pair encounters and merges |
| Optical authority   | Unresolved-fines blend plus bands | Suspended sum(D^2) plus bands                   |
| Canonical minimum   | Dose 5                            | Dose 5                                          |
| Tail margins        | 0.550568 / 0.476090               | 0.236407 / 0.236407                             |
| Population result   | 500 active slots throughout       | 105 active at canonical optimum                 |
| Particle arrays     | 9                                 | 10                                              |
| Full-path benchmark | 28.1278 ms                        | 70.3864 ms conservative standalone run          |

The replacement adds causal mass and merge behavior at a small measured cost.
Its conservative benchmark still averages only 0.026997 ms per fixed step with
0.076100 ms p95. The O(n^2) schedule is therefore retained; no evidence
justifies spatial hashing.

## Verification and evidence

The final local gate passed:

    npm test
    npm run acceptance:03d
    npm run benchmark
    npm run typecheck
    npm run lint
    npm run format:check
    npm run build

- 16 repository-contract tests passed.
- 83 Vitest tests across 19 files passed.
- The canonical and nine-seed suites, reverse-order equality, reset purity,
  10,000-step finite-state path, mass/diameter invariants, optical-load tests,
  and population bounds passed.
- The production build completed with only the already documented non-failing
  emulator-asset chunk warnings.

The bundled browser client completed the canonical Dose 5 trial with 105 active,
65 suspended, and 40 settled aggregates; mean mass 4.761905; max mass 8; max
diameter 0.282843; largest-mass fraction 1.6%; endpoint optical load 0.501182;
global relative load 0.528000; and zero console errors. The settled-bed and
clearing-front presentation remained legible.

The randomized review packet was regenerated at 1280 x 720 after 03D. All four
tracked PNGs were visually inspected, and the capture run reported no browser
or page errors. Low and high are intentionally byte-identical because the
accepted Gaussian dose abstraction is symmetric:

- apparatus-unlabeled.png:
  E2F1AD790C89A1FD7E01F04FC789044B5757EE5249B2A4E43A289DC15160403F
- comparison-a.png:
  5425F0F0127653EDFD21B4EB3611A0ECA4150B53A3A727969138A37801D09C16
- comparison-b.png:
  5425F0F0127653EDFD21B4EB3611A0ECA4150B53A3A727969138A37801D09C16
- comparison-c.png:
  18AA62397B711D8E3F7E77D3E1C949ED07FCA4356170178346D0BF1DD2E3935D

The shuffled answer key remains an ignored local artifact and is not published
in this packet.

## Architecture and safety review

src/sim owns deterministic process behavior and remains free of React,
Three.js, WebXR, browser APIs, and Math.random. SimulationRuntime owns the
workspace and fixed-step clock. Rendering receives read-only particle and
optical-load views and performs no treatment calculation. The import-boundary
tests pass.

The model remains a fictionalized, phenomenological educational abstraction.
No SCADA, plant controls, intranet, operational data, calibrated units, dose
recommendation, or operating instruction was added.

## Post-acceptance presentation repair and device evidence

The first physical Quest review of the technically accepted model exposed a
presentation defect, not a simulation defect: growth was difficult to notice,
the optical load appeared concentrated on the rear plane, and merge
disappearance could flicker. The repaired renderer preserves the authoritative
diameter ratio, follows survivor position and scale over short render-local
intervals, fades consumed particles over 0.24 seconds, and draws a lighter
middle optical slice from the same preallocated 12-band texture as the rear
slice. It adds no simulation merge-event metadata or second optical authority.

The capture route now enables `preserveDrawingBuffer` only for review captures,
reads PNG data directly from the canvas, disables presentation transitions for
deterministic completed-state comparisons, and leaves normal desktop and XR
behavior unchanged. The regenerated low and high images are byte-identical as
expected from the symmetric accepted abstraction.

On the repaired physical Quest rerun, 43 simulated seconds matched 43.006
seconds of wall time. The completed state retained 105 active, 65 suspended,
and 40 settled aggregates. A 300-frame immersive snapshot reported 120.0 FPS,
8.33 ms average, 8.90 ms p95, 0.017 ms simulation, 0.087 ms instance sync, 74
fully loaded stereo draw calls, 37.8 MB heap, both controllers tracked, and no
console or page errors. The project-owner water-treatment operator accepted
the result as “much better” and “a pass.”

## Remaining external gate

The first external review is recorded in [UX_VALIDATION.md](UX_VALIDATION.md).
Both the operator and non-operator correctly selected C as best and A/B as less
effective, so the blinded outcome-comparison gate passes.

The apparatus-recognition gate remains open. The operator described the six
vessels as “Empty jars,” and the non-operator read them as possible
“chemicals?” The next candidate must add a static, non-live jar-content cue,
regenerate the affected apparatus evidence, and pass a fresh blinded Part 1
review. The accepted outcome images do not need regeneration unless the hero-
tank outcome presentation changes.

The earlier physical Quest composition acceptance supports start placement,
table height, rectangular jars, controllers, and hierarchy; the final-model
rerun now also accepts short replacement behavior visibility and rolling
performance. Hosted deployment, endurance, thermals, later headset ergonomics,
Batch 04, and ghost runtime work remain out of scope.
