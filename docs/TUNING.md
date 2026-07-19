# Batch 08 Display Tuning Record

Date: 2026-07-19

## Status and change classification

The project owner authorized Batch 08 technical work to run before the open
Batch 07 human verdict so both batches can use one combined Quest review. This
is a scheduling exception, not retroactive Batch 07 acceptance. Batch 07 and
Batch 08 remain unaccepted until the combined worn-headset gate passes or an
explicit waiver is recorded.

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

The selected Batch 08 comparison is one short, opaque cyan marker showing the
prior recording's clearing-front depth. It consumes a mutable read-only view
maintained by the app-owned playback clock. It is hidden when no ghost is
loaded, remains visually subordinate to the tank and live floc, and adds:

- no ghost particles or morphology;
- no second simulation or tank;
- no replay recomputation;
- no transparent layer; and
- one draw call while visible.

The existing physical ghost controls continue to communicate selection,
playing/paused/ended state, and progress. The combined human review must confirm
that the marker reads as a prior recorded result rather than a second live
process.

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

| Source                            |       Draws | Visibility              |
| --------------------------------- | ----------: | ----------------------- |
| Rear and middle optical gradients |           2 | Always                  |
| Hero-tank side walls              |           2 | Always                  |
| Six canonical jar fills           | 1 instanced | Always                  |
| Six canonical jar walls           | 1 instanced | Always                  |
| Nephelometer beam                 |           1 | Measuring only          |
| Refill stream and ring            |           2 | Refilling only          |
| Prior clearing-front marker       |    1 opaque | Compatible ghost loaded |

The compatible-ghost browser capture reported 55 development draw calls,
below the enforced ceiling of 71. Its virtual-time frame samples are not a
physical performance claim. Quest live-plus-ghost p95 timing and stereo
transparency ordering remain in the combined gate.

## Combined human gate

Use the single checklist in [UX_VALIDATION.md](UX_VALIDATION.md). It closes the
remaining Batch 07 physical-instrument/readability rows and the Batch 08
headset/comparison rows together. Do not tag either batch from desktop evidence
alone.
