# Batch 10 Lab Environment Budget and Composition

## View envelope

The seated headset origin remains at world `(0, 0, 0)`. The accepted apparatus
is translated once to `(0.75, 0, -1.8)`, with the controls centered around the
operator and the hero tank beyond them. Lab geometry must remain useful from a
seated head-motion envelope of approximately `+/-0.35 m` laterally,
`1.05-1.55 m` eye height, and `+/-35 degrees` of comfortable head yaw. No
bench, wall, or prop may enter the accepted controller volume.

## Composition zones

| Zone    | Purpose                      | Content                                                                               |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| Hero    | Treatment loop and decisions | Existing tank, controls, instruments, plot, and jar rack; unchanged                   |
| Near    | Grounding and parallax       | Lab floor and perimeter bench edges                                                   |
| Middle  | Laboratory identity          | Beakers, three benchtop analyzers, cabinets, worktops, full ceiling, and light panels |
| Distant | Place and daylight           | Four lab walls with large back and side window openings                               |
| Outside | Distant context only         | Owner-supplied monoscopic panorama, visible through the windows                       |

The first industrial basin candidate was rejected in headset review because the
experience should be situated in a lab. The lab replaces the basin, pipe,
columns, and handrail rather than layering additional scenery over them.

## Render budget

- Environment source draw-call allowance: **5** before controller models.
- Environment material allowance: **5 shared flat/lightly shaded materials**.
- Environment triangle count: approximately **1,114**, including instances.
- The exact owner-provided Hetchy JPG is **3,947,484 compressed bytes** and
  **33,549,312 decoded RGBA bytes** at 5,216 by 1,608 pixels.
- The exact owner-created Sunol JPG option is **3,757,647 compressed bytes** and
  **55,332,856 decoded RGBA bytes** at 8,662 by 1,597 pixels. This is the
  maximum decoded panorama budget.
- One self-created `WATER QUALITY LAB` canvas label adds approximately **1.64
  MB** of uncompressed RGBA texture memory.
- Walls, window frames, benches, analyzers, screens, and ceiling panels share
  one colored instanced box draw.
- Beaker walls and fluids use two bounded instanced draws.
- One small magnetic stir bar is the only environment object updated per frame;
  it mutates one existing group and allocates nothing.

The prior apparatus measured 51 ready-state and 55 compatible-replay development
draw calls. The lab candidate retains the established browser ceilings of 70
ready and 71 with replay; the tests were not relaxed. Physical Quest profiling
remains authoritative for the final performance verdict.

## Exact module list

1. One real floor inside an approximately 8.4 by 8.7 meter room.
2. Four walls; the front wall is behind both supported desktop cameras.
3. Two large rear window openings and one broad opening in each side wall.
4. Three perimeter bench runs with cabinets and worktops.
5. Three low-poly analyzers with bright physical screens.
6. Eight transparent beakers with bounded internal fluid.
7. One full ceiling with three light panels.
8. One labeled lab identifier and one slow bench stirrer.

## Panorama integration contract

The default uses the exact owner-provided `hetchy.jpg`. Its 3.24:1
panoramic-strip projection is not a 2:1 equirectangular sphere, so it is mapped
once to an inward-facing distant cylinder. Opaque lab walls and the full ceiling
reveal it only through the window openings. The panorama is shifted upward by
exactly 10 percent of its mapped height after headset feedback; the floor,
walls, ceiling, benches, apparatus, and window frames remain real 3D.

The owner-created `sunol.jpg` is available for direct comparison with
`?panorama=sunol`; Hetchy remains the default. Each strip uses its own
aspect-correct cylinder height and the accepted 10 percent vertical shift. A
physical two-position Hetchy/Sunol selector on the operator dashboard changes
the visible strip as a discrete app command. The other two owner-provided strips
remain deferred.

Before release, inspect the selected seam and horizon in Quest and compress to
KTX2/Basis using one shared loader if measurements justify retaining the source.
Reject or crop an image if it harms label contrast, orientation, load time, or
frame rate. No video panorama, stereo panorama, photogrammetry, splats, or depth
reconstruction.

## Audio budget and variants

- Audio uses no external files and adds zero compressed asset bytes.
- One deterministic two-second mono noise buffer is allocated lazily on the
  first user gesture: approximately 384 KB at a 48 kHz device sample rate.
- Two persistent filtered noise sources and one sine oscillator provide room
  tone and phase ambience. Gains and filters ramp between app-owned treatment
  phases; audio owns no process state.
- Short-lived oscillator/filter/gain nodes are intentionally allocated only for
  discrete control, measurement, completion, replay, clear, and refill events;
  no nodes are allocated in the render or simulation loops.
- Phase detail uses one recursively scheduled timeout outside both hot loops.
  A deterministic local sequence varies mechanical ticks and synthesized bubble
  chirps at phase-specific intervals; the timer is cleared on mute, hide, phase
  change, and teardown.
- A second bounded timeout schedules sparse synthesized two-note ambient phrases
  every 3.2 to 6.8 seconds. Music remains independent of dose, optical load,
  phase outcome, and score, and allocates no persistent media asset.
- `?sound=classic` is the default conventional mechanical profile.
  `?sound=quiet` halves ambience gains, and `?sound=warm` lowers and softens the
  spectrum for review. No result-scoring clarity transform is present.
- Dose, Start, `MUTE`, and the scenery selector are mounted together on one
  physical operator dashboard rather than floating independently.
- The physical `MUTE` button beside Start is always understandable visually.
  Audio starts only after a user gesture, suspends while the document is hidden,
  and closes on app teardown.
