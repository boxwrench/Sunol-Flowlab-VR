# Batch 10 Lab Environment Budget and Composition

## View envelope

The seated headset origin remains at world `(0, 0, 0)`. The accepted apparatus
is translated once to `(0.4, 0, -1.8)`, with the controls centered around the
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

The first candidate uses the exact owner-provided `hetchy.jpg`. Its 3.24:1
panoramic-strip projection is not a 2:1 equirectangular sphere, so it is mapped
once to an inward-facing distant cylinder. Opaque lab walls and the full ceiling
reveal it only through the window openings. The panorama is shifted upward by
exactly 10 percent of its mapped height after headset feedback; the floor,
walls, ceiling, benches, apparatus, and window frames remain real 3D.

Before release, confirm owner provenance, inspect the seam and horizon in Quest,
and compress to KTX2/Basis using one shared loader if the source is retained.
The other three owner-provided strips and any physical selector remain deferred
until this projection is accepted. Reject or crop the image if it harms label
contrast, orientation, load time, or frame rate. No video panorama, stereo
panorama, photogrammetry, splats, or depth reconstruction.
