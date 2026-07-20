# Batch 08 Display Tuning Record

Date: 2026-07-20

## Status and change classification

The project owner authorized Batch 08 technical work to run before the then-open
Batch 07 human verdict so both batches could use one combined Quest review. The
iterative worn-headset review has now passed, and Batches 07 and 08 are
accepted.

Every implementation change in this increment is **display tuning**. No dose
curve, seed, phase timing, aggregation, settling, particle capacity, optical-
load calculation, endpoint, or accepted simulation configuration changed.

## Selected optical presentation

| Decision               | Selected value                                  | Reason                                                                                       |
| ---------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Band count             | 12                                              | Existing authoritative layout is readable and already recorded by the accepted ghost schema. |
| Vertical interpolation | GPU linear filtering                            | Existing one-column `DataTexture` avoids stepped boundaries without adding surfaces.         |
| Temporal smoothing     | Exponential, 0.16-second time constant          | Suppresses frame-to-frame band flicker while remaining responsive.                           |
| Reset/refill behavior  | Immediate snap when `presentationEpoch` changes | Prevents old treatment appearance from bleeding into raw-water reset.                        |
| Color/opacity response | Existing accepted shader mapping retained       | Prior Quest review called the water presentation good; further color tuning lacked evidence. |
| Particle count         | 500                                             | No profiling evidence justifies an increase.                                                 |

The smoothing buffer is render-local, preallocated, and allocation-free in
`useFrame`. The 10 Hz recorder continues to store unsmoothed authoritative band
samples. Smoothing cannot alter a completed result, plot point, jar summary,
gauge target, or ghost record.

## Treatment-ghost comparison

The initial short cyan clearing-front marker failed the 2026-07-20 worn-headset
comprehension check: it read as an unrealistic vertical turbidity level. The
selected remediation is a labeled cyan past-run needle on the relative-
turbidity gauge. It consumes the saved recording's authoritative endpoint,
remains visually subordinate to the live needle, and adds:

- no ghost particles or morphology;
- no second simulation or tank;
- no replay recomputation;
- no transparent layer; and
- no comparison geometry inside the hero tank.

The physical ghost controls carry plain-language labels. The project-owner
combined verdict accepted their final seated presentation.

## Instrument and jar readability

The same review found that primitive-only affordances did not explain the phase,
plot, replay, refill, reset, or clear-history actions. The remediation uses
locally generated canvas-texture labels: PHASE, RELATIVE TURBIDITY, DOSE vs FINAL
TURBIDITY, LOWER = CLEARER, and explicit action labels. No network font or
floating application panel is introduced.

The rack is labeled JAR TEST. Canonical jar colors still consume only completed
authoritative summaries. After continuous interpolation washed out in the
headset, the render-only transform now classifies the clamped
`(displayClarity - 0.25) / 0.25` value into deliberately separated dark
(`< 0.25`), medium (`< 0.90`, displayed at 0.32), and light tiers. The stored 0.26–0.49 range
therefore reads as an unambiguous dark-brown through light-tan spectrum. The
unexplained amber tested-result diamonds were removed after seated review. The
color transform does not modify results, persistence, the plot, or the gauge.

Follow-up review requested transparent internal fluids and exact label
alignment. The six fill instances now use one 0.82-opacity, depth-write-disabled
material; their authoritative dark/medium/light brown colors remain unchanged.
Each dose number is rendered from the same canonical index/X formula as its jar
instead of relying on approximate spacing in one text string.

The vessel-wall overlay is neutral and only 0.08 opacity so it cannot wash the
three internal-fluid tiers toward the same beige.

The follow-up seated review found the instrument backboard too close to the
hero tank. Its apparatus-local X position moves from 1.72 m to 2.10 m, opening
a clear visual gap on the tank's right. A second review asked that it also come
toward and face the operator: local Z moves from 0.12 m to 0.48 m and yaw moves
from -0.22 to -0.72 radians. Instrument height and internal control layout stay
unchanged.

The next seated adjustment moves the backboard another 0.14 m toward the
operator to local Z 0.62 m. The accepted dose dial and Start control retain
their center positions and command behavior while each root visual/interaction
group is uniformly scaled to 75%.

The mounted dose-versus-final-turbidity chart is scaled to 72% and shifted
right, creating a positive gap from the relative-turbidity dial while retaining
all eleven dose positions and completed-result points.

The dose and Start control centers move from -0.22/+0.38 m to symmetric
-0.30/+0.30 m positions without changing their separation. Because the
apparatus is world-offset +0.40 m, the shared control-deck parent receives a
-0.40 m local X offset. The resulting control midpoint is exactly the WebXR
starting origin.

## Automated comparison matrix

The rendered-browser suite now captures named evidence for:

- Dose 0, 5, and 10 endpoints from the same raw-water configuration;
- flocculation, settling, measuring, complete, and refill phases;
- a compatible ghost at 35 seconds of independent playback; and
- empty versus populated experiment memory and canonical summaries.

The fixed desktop camera is a front-quarter view. Seated stereo, common head
angles, final label readability, and reviewer comprehension remain in the
combined Quest gate because a flat capture cannot establish those claims.

## Transparency and draw-call audit

The source-level transparent draw sources remain bounded:

| Source                            |       Draws | Visibility     |
| --------------------------------- | ----------: | -------------- |
| Rear and middle optical gradients |           2 | Always         |
| Hero-tank side walls              |           2 | Always         |
| Six canonical jar fills           | 1 instanced | Always         |
| Six canonical jar walls           | 1 instanced | Always         |
| Refill stream and ring            |           2 | Refilling only |

The previous compatible-ghost browser capture reported 55 development draw
calls, below the enforced ceiling of 71. The rejected marker and beam have
since been removed; normal-text meshes and the gauge needle replace them. Its
virtual-time frame samples are not a physical performance claim. Quest
live-plus-ghost p95 timing and stereo readability remain in the focused rerun.

## Combined human gate

Use the single checklist in [UX_VALIDATION.md](UX_VALIDATION.md). It closes the
remaining Batch 07 physical-instrument/readability rows and the Batch 08
headset/comparison rows together. Do not tag either batch from desktop evidence
alone.
