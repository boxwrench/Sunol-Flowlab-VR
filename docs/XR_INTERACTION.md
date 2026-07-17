# XR Interaction Evidence

## Batch 04 final control decision

Date: 2026-07-16

Target:

- Meta Quest 3, serial 2G0YC5ZG0M052K
- Android 14
- Quest Browser 149.0.0.24.3.1013217646
- local secure loopback through ADB reverse on port 5174
- Three.js 0.165.0 and @react-three/xr 6.6.30

The accepted candidate uses the hinge lever rather than the rotary fallback.
The pinned XR package's default controller supplies both ray and grab pointers.
The application consumes the same React Three Fiber pointer-event contract for
either pointer type and keeps pointer capture on the whole lever handle.

## Physical iteration record

### Initial candidate - rejected

The project owner entered the standalone shell on the physical Quest while
seated. The control deck was too high and too far away, the dial was difficult
to read, and the lever could be operated only with the controller ray rather
than a natural direct grab.

### First revision - rejected

The deck moved 0.14 m lower and approximately 0.34 m closer, tilted 15 degrees
toward the operator, and gained a larger direct-grab volume. Height and dial
visibility improved, but the controls were oversized, the knob remained beyond
comfortable reach, and there were no numeric detent labels.

### Final revision - accepted

The final revision:

- uses a 0.80 m control-deck height and 0.48 m origin-to-deck reach for both
  posture presets;
- retains posture-specific eye-height calibration markers;
- puts the lever working arc on the operator side of the pivot;
- reduces the dial base radius to 0.34 m and detent radius to 0.26 m;
- uses a 0.085 m visible knob with a 0.13 m transparent direct-grab target;
- reduces the Start face radius to 0.11 m;
- displays all labels 0 through 10 with one locally generated instanced
  seven-segment draw rather than a runtime font/network dependency;
- keeps every movement result validated as an integer DoseIndex.

The seated project-owner operator reported the final size, reach, number
readability, and direct interaction as a pass.

## Input and reliability evidence

Remote inspection of the final physical session recorded:

- immersive session active;
- both left and right controllers tracked simultaneously;
- 84 total validated commands during free interaction across the lever range
  and Start control;
- final selected dose 10;
- seven START_TRIAL commands from seven separately deliberate presses;
- no repeated Start command from a held press;
- no floating dose entered application state;
- no active application alert, runtime exception, console error, or browser log
  error during the final monitored capture.

The operator accepted the final interaction after exercising it in the
headset. The originally suggested separately scored 50-request sequence was
not logged as an independent trial. The owner explicitly accepted the observed
interactive sweep plus automated detent coverage as sufficient for this batch.

## Posture decision and waiver

All physical Batch 04 interaction was performed seated, including the
project-owner acceptance. The accepted control-deck transform is now shared by
the seated and standing presets, while their eye-height calibration remains
distinct.

The project owner could not safely perform a standing repeat during this gate
and explicitly instructed the team to skip it and call the batch a pass. The
standing repeat is therefore owner-waived, not represented as observed
standing evidence. Later headset-readability/release work may repeat it without
reopening the Batch 04 software decision unless it reveals a defect.

## Hot-path and allocation note

- Interaction-state transitions allocate only on discrete pointer events.
- Seven-segment label matrices and colors update only when the selected dose
  changes.
- Controller/session detection updates only when XR store identities change.
- The per-frame shell probe performs timer-free numeric telemetry writes and
  reads the renderer draw-call counter.
- No simulation, particle, optical-load, or treatment state is composed.
