# Apparatus Recognition Validation

**Status:** Project-owner operator composition and replacement-model Quest review accepted; external blind reviews open
**Governing requirement:** Batch 03 presentation-retention and human-validation gate
**Review route:** `http://127.0.0.1:5173/?mode=proof`

## Purpose

Validate the unlabeled hybrid apparatus before instrumentation is finalized. The
review must establish that the six-jar bench suggests a jar-test comparison,
that the larger hero tank reads as the active observation focus, and that the
composition does not imply six simultaneous live simulations.

## Protocol

Show the proof-mode screenshot without explaining the project or displaying the
dose controls, metrics, title, plot, or labels. Ask:

1. “What do you think this apparatus represents?”
2. “What would you expect to do here?”

Record the blind answers before exposing any live controls. A later live
follow-up may use the development Start, Stop, and Reset controls to inspect
growth and settling. Stop preserves the current deterministic state; Reset
returns the selected dose and canonical seed to time zero and remains stopped.

Seek at least one water-treatment operator or educator. Preferably also seek one
person without water-treatment experience. Record their role, date, exact or
carefully paraphrased responses, and the tested commit.

## Acceptance rubric

- The operator or educator recognizes the jar-test connection.
- The non-operator, if available, recognizes a comparative experiment.
- The hero tank is identified as the active or primary observation area.
- The jars do not appear to be six independent live simulations.
- The rack remains secondary to the hero tank.

If any required signal is missed, revise the composition and repeat the review
before accepting Batch 03.

## Results

The randomized [Batch 03 review packet](BATCH_03_REVIEW_PACKET.md) was
regenerated on 2026-07-15 after Workstream 03D technical acceptance. It
contains one unlabeled apparatus image and three shuffled, completed
low/optimum/high outcomes from configuration fnv1a32-e8bf13e7. The answer key
is retained only in an ignored local test artifact until responses are
recorded.

No participant responses have been recorded yet. The project owner's
operator-informed outcome review may be recorded, but it does not replace the
external blind apparatus-recognition response because the owner already knows
the intended design.

During the first physical Quest review on 2026-07-15, the project owner and
water-treatment operator reported that the initial WebXR viewpoint began inside
the hero tank, making the simulation difficult to view. Review was paused. The
candidate now places the apparatus beyond the WebXR floor origin with at least
1.25 meters of clearance to the nearest tank face while preserving the desktop
camera-to-apparatus offset.

On re-entry, the owner described the revised initial view as "pretty good," so
the inside-tank defect is corrected. The same operator review identified that
the jar-test rack should sit on a table rather than on the floor. The candidate
now places the six-jar rack on a waist-height static table.

On the next physical check, the owner again described the composition as
"pretty good" and noted that jar-test vessels are usually rectangular. The
table correction is therefore retained, and the candidate now uses six
distinct open rectangular vessels and rectangular rims without adding draw
calls. On the final physical check, the owner confirmed the
rectangular-vessel candidate with "yes good." The project-owner operator
composition review is accepted for start placement, table mounting, vessel
shape, and hero-tank priority. This informed review does not replace the open
external blind-recognition requirement.

Workstream 03D replacement captures have now passed browser-error and visual
inspection. The parked reviews may resume. No external participant response has
yet been recorded, so neither apparatus recognition nor outcome comprehension
is accepted.

### Replacement-model Quest review

The project-owner water-treatment operator reviewed the completed Workstream
03D Dose 5 behavior in an active physical Quest session on 2026-07-15. The
first pass was not accepted: settling and clearing were visible, but aggregate
growth was difficult to notice, the optical-load presentation read mainly as a
rear brown plane, and merge transitions could appear as a flicker.

The smallest presentation-only repair retained the authoritative simulation:

- rendered radius now preserves the simulation diameter ratio, making the
  primary-to-maximum aggregate growth range approximately 1:2.83;
- render-local position and scale following plus a short consumed-particle
  exit softened visually abrupt deterministic merges without adding simulation
  merge-event metadata;
- a lighter middle optical slice now reads from the same preallocated 12-band
  texture as the rear slice, adding depth without creating a second process
  authority.

On the physical rerun, the operator reported, “much better . very good for this
stage i think. its a pass.” This accepts the short replacement-model Quest
visibility check. The operator also suggested a possible light-brown-to-
slightly-darker mass cue. That remains optional presentation polish: aggregate
size is the primary mass cue, and any color mapping should stay subtle and must
not imply dose, quality, calibrated turbidity, or a second treatment result.

This informed owner review does not replace the external blind apparatus-
recognition and outcome-comparison gates above.
