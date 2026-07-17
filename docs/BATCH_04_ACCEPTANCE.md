# Batch 04 Acceptance Packet

Date: 2026-07-16

Status: Accepted by the project owner with an explicit standing-repeat waiver.

## 1. What changed

- Added a separately routed standalone XR interaction shell.
- Added an empty low-cost apparatus with hero-tank placeholder, static jar
  rack, reference floor, and calibration marker.
- Added explicit detent and Start-button interaction state machines.
- Added an operator-facing hinge lever with eleven labeled integer detents,
  near-side travel, direct-grab volume, pointer capture, and snap-on-release.
- Added a pressable Start control with held-press suppression.
- Added controller/session/handedness state reporting, command logging, and
  render telemetry.
- Added standing/seated layout authority, ultimately sharing the physically
  accepted deck transform while retaining separate eye-height calibration.

## 2. What intentionally did not change

- No simulation source or accepted Batch 03 model changed.
- No treatment particles, optical-load presentation, phase state, scoring,
  gauge, plot, refill handle, sheet, persistence, ghost, or environment art was
  added to the shell.
- No floating-point dose command, hand tracking, locomotion, haptic dependency,
  rotary fallback, or canonical-jar selection was added.
- At Batch 04 acceptance time, the remaining Batch 03 blinded review was
  deferred and not accepted. The project owner subsequently waived the fresh
  repaired-apparatus rerun and accepted Batch 03 in
  [BATCH_03_ACCEPTANCE.md](BATCH_03_ACCEPTANCE.md).

## 3. Files

Added:

- src/app/XrShellApp.tsx
- src/render/XrShellApparatus.tsx
- src/render/XrShellScene.tsx
- src/xr/DoseLever.tsx
- src/xr/StartButton.tsx
- src/xr/XrShellInputMonitor.tsx
- src/xr/interactionState.ts
- src/xr/interactionState.test.ts
- src/xr/layout.ts
- src/xr/layout.test.ts
- tests/xr-interaction.test.mjs
- docs/XR_INTERACTION.md
- docs/BATCH_04_ACCEPTANCE.md

Modified:

- src/app/App.tsx
- tests/browser/desktop.spec.ts
- playwright.config.ts
- IMPLEMENTATION_PLAN.md
- PROGRESS.md
- HANDOFF.md
- batch-04-standalone-xr-interaction-shell.md
- docs/PERFORMANCE.md

Removed: none.

## 4. Commands and results

- npm test: 19/19 repository contracts; 92/92 Vitest tests in 21 files.
- npm run test:browser: 5/5 Chromium tests.
- npm run typecheck: pass.
- npm run lint: pass.
- npm run format:check: pass.
- npm run build: pass; only the already documented non-failing emulator-asset
  chunk-size warnings remain.
- git diff --check: pass.
- Bundled browser client: rendered Start click emitted one START_TRIAL; rendered
  lever-knob click reached snapped with no extra command.

## 5. Dose-sweep comparison

No simulation behavior changed, so a new phenomenon dose sweep is neither
required nor meaningful. The primary command boundary remains validated
DoseIndex 0 through 10, and unit coverage round-trips all eleven detents.

## 6. Quest metrics

The final fully tracked immersive snapshot recorded 119.7 FPS, 8.36 ms average
frame time, 8.90 ms p95, both controllers, 86 draw calls including controller
models, and 57.5 MB JavaScript heap.

A later stable rolling window after controller inactivity recorded 120.0 FPS,
8.33 ms average, 8.60 ms p95, 6 shell-only draw calls, and 64.8 MB heap. The
final monitored eight-second window had no active alert, runtime exception,
console error, or browser log error.

## 7. Known compromises and deferred decisions

- The project owner performed and accepted the final physical interaction
  while seated.
- A standing repeat was explicitly waived by the owner because it could not be
  performed safely at the time. This is a recorded waiver, not fabricated test
  evidence.
- The suggested separately scored 50-request reliability trial was not logged
  independently; the owner accepted the observed physical sweep, 84 validated
  commands, seven deliberate Start presses, and automated detent/latch tests.
- Locomotion remains out of scope. Neutral reach is solved by the accepted
  control transform.
- Haptics, sound, rotary fallback, jar selection, and later instrumentation
  remain optional or deferred.

## 8. Per-frame costs and allocations

The shell owns no simulation step. Per-frame application work is limited to
numeric render telemetry and the renderer draw-call read. Label matrix/color
updates occur only when dose changes; interaction objects allocate only on
discrete input events. Remaining frame work belongs to React Three Fiber,
Three.js, WebXR, and controller-model rendering.

## 9. Documentation

Updated:

- this acceptance packet;
- XR interaction decisions and physical evidence;
- performance/device evidence;
- roadmap status;
- chronological progress;
- session handoff;
- Batch 04 status and scheduling exception.

## 10. Commit and gate

Proposed commit:

    feat(xr): prove detented dose control and start input

Batch 04 gate: passed by the project owner with the standing-repeat and
separately scored 50-request protocol exceptions documented above.
