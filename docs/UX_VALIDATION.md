# Apparatus Recognition Validation

**Status:** Batch 03 accepted with repaired-apparatus recognition rerun waived
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

External participant responses are recorded below. The project owner's earlier
operator-informed review remains useful but does not replace these blinded
responses because the owner already knows the intended design.

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

Workstream 03D replacement captures passed browser-error and visual inspection
before the external reviews below.

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

This informed owner review did not replace the external blind gates; the later
external results below govern their acceptance.

### External blinded review results

Two external participants reviewed the packet on 2026-07-15 at commit
`2f72e89`, before receiving the answer key or implementation explanation.

#### Reviewer 1 — water-treatment operator

| Question                                                           | Verbatim response    |
| ------------------------------------------------------------------ | -------------------- |
| What does the apparatus represent?                                 | “floc”               |
| What would you expect to do here?                                  | “sedimentation”      |
| Primary active experiment?                                         | “Big tank”           |
| Meaning of the six small vessels?                                  | “Empty jars”         |
| Best finished-water clarity?                                       | “c”                  |
| Two less-effective outcomes?                                       | “a,b”                |
| Does the best outcome read without labels or a plot?               | “yes”                |
| Plausible qualitative jar-test lesson?                             | “yeah”               |
| Does it imply calibrated prediction, guidance, or excess fidelity? | “i dont know. no”    |
| Most important visual change?                                      | “The jars are empty” |

#### Reviewer 2 — non-operator participant

| Question                                                           | Verbatim response |
| ------------------------------------------------------------------ | ----------------- |
| What does the apparatus represent?                                 | “Dirty water”     |
| What would you expect to do here?                                  | “Clean water”     |
| Primary active experiment?                                         | “The big box”     |
| Meaning of the six small vessels?                                  | “chemicals?”      |
| Best finished-water clarity?                                       | “c”               |
| Two less-effective outcomes?                                       | “a,b”             |
| Does the best outcome read without labels or a plot?               | “yes”             |
| Plausible qualitative jar-test lesson?                             | “yes”             |
| Does it imply calibrated prediction, guidance, or excess fidelity? | “no”              |
| Most important visual change?                                      | “Nice bacground”  |

#### Gate assessment

The blinded outcome-comparison gate passes. Both participants independently
selected C as the clearest outcome, selected A and B as less effective, found
the best result legible without labels, accepted the qualitative treatment
lesson, and did not identify a safety-framing overclaim.

The apparatus-recognition gate does not yet pass. Both participants identified
the large tank as primary and understood water treatment, but the operator did
not explicitly identify a jar-test comparison and described the six vessels as
“Empty jars.” The non-operator described them as possible “chemicals?” rather
than a comparative experiment. This is a specific presentation failure, not a
simulation or outcome failure.

The 03R.1 candidate now gives all six jars the same frozen raw-water fill while
preserving their non-live status, secondary hierarchy, and zero process
ownership. Only the affected apparatus evidence was regenerated; the accepted
A/B/C files remain byte-unchanged. Repeat Part 1 with fresh blinded
participants where practical. The passed outcome gate does not need to be
repeated unless those images change.

#### Owner acceptance exception

On 2026-07-16 the project owner directed the project to skip the fresh blinded
Part 1 rerun and accepted Batch 03. The repaired apparatus therefore has no
independent post-repair recognition result. This is a documented waiver of the
remaining validation gate, not evidence that the repaired jars passed it.

The initial failed responses, the bounded 03R.1 repair, and the residual
recognition risk remain part of the permanent record. A later fresh review may
still be run as optional risk reduction if jar-rack confusion reappears.

## Batch 06 seated treatment-cycle acceptance

On 2026-07-17 the project-owner water-treatment operator completed the combined
seated Quest review after a fresh immersive entry, one deliberate physical
Start, the full real-time treatment sequence, completed measurement, controlled
refill, and a repeat Dose 5 result. The acceptance prompt covered whether the
phases felt distinct, the locked dose and Start controls communicated their
state, the beam and result lamp read as the conclusion, refill read clearly and
invited another trial, and any visible hitching occurred. The owner's verdict
was “pass.”

This informed operator check closes Batch 06 pacing and readability. Standing,
endurance, thermal, hosted-deployment, and release validation were not performed
or inferred.
