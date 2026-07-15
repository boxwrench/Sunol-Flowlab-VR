# Batch 03 Desktop Proof Progress

**Status:** In progress; automated presentation slice complete, human gates open
**Baseline:** `5d2ff8c`
**Date:** 2026-07-15

## Implemented

- One open, visually dominant hero observation tank.
- One shader-driven gradient surface backed by a preallocated 12-byte texture
  that consumes the authoritative turbidity-band view.
- Existing one-draw-call instanced particles retained as event cues, including
  authoritative floc-size scaling and settlement.
- One static six-jar rack for canonical doses 0, 2, 4, 6, 8, and 10. The rack
  receives no simulation, turbidity, result, or clock input.
- Development comparison resets for relative doses 0, 5, and 10 using the same
  canonical seed and 43-second schedule.
- An unlabeled `?mode=proof` route that hides headings, metrics, controls, and
  dose labels for recognition review.
- Clearing-front diagnostics derived from the same authoritative band record:
  top clear fraction, normalized front depth, upper-zone turbidity, and first
  clarity-target time.
- A deterministic `window.advanceTime` development hook and expanded
  `window.render_game_to_text` state for browser validation.

## Objective evidence

- Repository contracts: 15 passing.
- Vitest: 64 passing tests across 14 files.
- Playwright: 3 passing desktop tests, including the three-preset U-shape and
  unlabeled proof mode.
- Type checking, lint, formatting, production build, and diff checks pass.
- Production-path benchmark:
  - 500 particles;
  - 2,580 fixed steps;
  - 28.38 ms total;
  - 0.0109 ms average step;
  - 0.0236 ms p95 step;
  - 9 particle arrays and 3 turbidity arrays;
  - endpoint turbidity 0.200000;
  - finite result.
- Browser-client state at 43 seconds:
  - Dose 0: 0.750568 endpoint turbidity.
  - Dose 5: 0.200000 endpoint turbidity.
  - Dose 10: 0.676090 endpoint turbidity.
- The isolated unlabeled proof capture was visually inspected. The hero tank is
  dominant, the six jars are distinct and secondary, and no console-error
  artifact was produced.
- A normal real-time 12-second Chromium/SwiftShader observation recorded 60.0
  FPS, 16.67 ms average frame time, 18.00 ms p95, 0.023 ms average simulation
  time, 0.006 ms average instance synchronization, 500 particles, 20 draw
  calls, 23.4 MB JavaScript heap, and zero console errors.

## Architecture and cost notes

Rendering remains a read-only consumer. The gradient allocates its texture,
pixel buffer, and shader material once, then updates 12 bytes per frame. The jar
rack uses three static instanced meshes for vessel walls, rims, and paddles.
No renderer calculates dose efficiency, turbidity, endpoints, clearing
diagnostics, or simulation state.

The larger production bundle still emits the previously documented non-failing
Vite chunk-size warnings from emulator environment assets. No new performance
evidence justifies Batch 02B collision, pooling, density, or spatial-hash work.

## Open gates

- Record at least one blinded water-treatment operator or educator response in
  [UX_VALIDATION.md](UX_VALIDATION.md). Preferably add a non-operator response.
- Complete the blinded low/optimum/high visual rubric with an operator-informed
  reviewer and a non-operator reviewer; confirm the best outcome is identifiable
  without labels or a plot.
- The local physical Quest preflight is accepted separately in
  [PERFORMANCE.md](PERFORMANCE.md#2026-07-15---physical-quest-3-local-preflight).
  Batch 03 still requires its own later headset readability and performance
  evidence after presentation and interaction are integrated.

Batch 03 is not accepted until its human-comprehension gates and remaining
performance evidence are recorded.
