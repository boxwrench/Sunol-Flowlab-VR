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

## Batch 07 seated combined review — pending

Use one combined seated Quest review to conserve operator time. Confirm that:

1. the tank remains the visual focus while the phase readout, gauge, and
   0–10 plot are readable;
2. the six jars read as static canonical summaries rather than six live tanks
   or the complete history;
3. measurement moves the relative gauge and a completed trial creates one plot
   point and updates only its exact canonical jar;
4. refill, the two-press tear sheet, and the separate ghost controls cannot be
   confused;
5. ghost selection, play/pause, progress, reset, ended, delete, and pending-
   replacement feedback are understandable without software chrome;
6. the operator is naturally inclined to change dose and seek a lower plotted
   result; and
7. no visible hitching, uncomfortable reach, or seated readability problem is
   present.

At this checkpoint Batch 07 remained unaccepted pending a project-owner
verdict. Under the later scheduling exception, this checklist was combined with
the Batch 08 comparison/readability review below; the final verdict is recorded
at the end of this document.

### 2026-07-17 partial session

The project-owner operator entered the exact seated Quest route with the
0/5/10 comparison staged. Without being told which dose was best, the operator
selected Dose 5 and started one physical trial. This is consistent with using
the visible minimum as the next experiment, but the operator's reasoning and
the overall readability verdict were not collected before the session paused.

The run completed with one Start, no rejected commands, both controllers
tracked, exactly one new plotted result, and a pending fourth ghost at the
three-record limit. The owner said it was a “good start” and requested that the
visual test continue tomorrow. This is partial evidence, not acceptance.

Resume with items 1–5 and 7 above, including physical ghost play/pause/reset,
pending replacement, refill, and deliberate two-press sheet clearing. Record
why Dose 5 was selected and the final pass/issues verdict.

### 2026-07-19 combined Batch 07/08 review authorization

The project owner first deferred the remaining human gate, then authorized
Batch 08 technical work and one combined human review. The partial session
remains partial evidence; no pending row is treated as passed or waived.

In one seated Quest session, complete the Batch 07 items above and also confirm:

1. clear water progresses downward from the top while floc remains visible
   below the clearing region;
2. low, optimum, and high outcomes remain distinct and agree with the gauge,
   plot, and static canonical summaries;
3. the cyan past-run gauge needle is visible from common head angles, remains
   subordinate to the live needle, and is understood as a recorded result;
4. play, pause, reset, seek/end, and incompatible/empty states never look like
   a second live simulation;
5. seated stereo transparency ordering and label readability remain acceptable;
   and
6. live-plus-ghost rolling performance remains above 72 FPS through
   flocculation, settling, measuring, complete, and refill.

Record the operator's Dose 5 reasoning, any confusing instrument or marker, the
worst rolling p95 frame time/draw calls, and one final `pass` or issue list for
the combined gate. Standing and a fresh non-operator review may be included if
practical, but are not inferred from the seated verdict.

Use the bounded review harness for the same session:

```powershell
npm run acceptance:08:quest -- review-ready
npm run acceptance:08:quest -- watch-combined
npm run acceptance:08:quest -- watch-controls
```

Run each watcher before the corresponding physical action. The first report
captures phase order, controller presence, memory changes, and 72 FPS/p95
rolling evidence. The second captures accepted physical replay
selection/play/pause/reset/delete, pending replacement, refill, and clear
commands plus their storage boundaries. Neither report substitutes for the
operator's plain-language interpretation or final verdict.

### 2026-07-20 combined review — issue verdict and remediation

The project-owner operator completed a physically started Dose 5 run. The
technical watcher passed with both controllers detected, the complete phase
sequence, one appended result, no alerts, a worst rolling average of 107.02
FPS, and a worst rolling p95 of 12.50 ms.

The human comprehension gate did not pass. The operator inferred that the large
dial represented turbidity because it dropped during treatment, but could not
identify the plot, the replay controls or their purpose, the detector cube, or
the cyan and amber tank lines without explanation. Reset was discovered only
by experimentation. The tank lines read incorrectly as vertical turbidity
levels and were judged unnecessary. The physical-control watcher then timed
out without accepted replay/refill/clear evidence; this is retained as an open
row, not represented as operator error.

The owner requested normal in-scene text, removal of the light sensor, removal
of phase lamps, a JAR TEST bench label, and a stronger jar cloudiness spectrum.
Remediation removes the emitter/beam/detector/result lamp and the cyan in-tank
prior-front line; replaces lamps with PHASE text; labels the relative-turbidity
dial, plot, replay, refill, clear, and destructive controls; moves past-run
comparison to a labeled cyan gauge needle; and stages all six canonical doses
so the jar spectrum remains derived from completed authoritative results.

The request to label the dial NTU conflicts with the binding uncalibrated,
dimensionless model boundary. The candidate therefore uses RELATIVE TURBIDITY;
no calibrated NTU claim is introduced. The combined human gate remains open
pending one focused readability/control rerun.

Follow-up seated review accepted the labeled apparatus direction but requested
continued spatial tuning. The backboard moved right, forward, and inward; the
dose and Start controls were reduced to 75% and their midpoint was aligned with
the WebXR start origin. The amber tested-jar diamonds were not understood, so
they were removed. The reviewer expected the canonical jars to communicate
dose outcomes through brown water, so their result-driven display now spans
dark brown at the poorer endpoints through light tan near the optimum.

The next check found the result chart overlapping the relative-turbidity dial
and the jar dose numbers visually misaligned. The chart is now smaller and
right-anchored. Jar numbers use exact jar-center coordinates, and the brown
internal fluids are transparent while preserving the requested symmetric
dark/medium/light outcome ordering.

In-headset follow-up found that the transparent continuous colors still looked
the same. The display transform now uses three separated result tiers rather
than a subtle continuous blend; this is a readability correction, not a change
to stored results or the process model.

Remote inspection then found the live rack had no canonical summaries because
the clear-results control test had removed them; only odd-dose trials 3, 5, and
9 remained. The identical raw-water jars were therefore the documented empty-
memory fallback, not a failed color upload. The review harness restaged
authoritative 0/2/4/6/8/10 completions before the next visual verdict.

### 2026-07-20 final combined verdict

The final seated-facing START plaque was added after the staged canonical jar
summaries were restored. The project owner then stated that the batch was good.
This records a pass for the combined Batch 07/08 human gate after the iterative
issue/fix sequence above. Standing, non-operator, endurance, hosted, and release
claims are not inferred from this seated verdict.

### 2026-07-20 Batch 10 lab, dashboard, and audio verdict

The project owner iteratively reviewed the complete laboratory candidate in a
live seated Quest 3 session. The accepted scene uses a real four-wall lab and
ceiling, owner-created Sunol and Hetchy panoramic scenery visible through real
windows, lab benches and instruments, and one compact physical dashboard. Dose,
Start, Mute, and the two-position scenery selector are labeled with text laid
flat on the dashboard or button faces. The result backboard, operator-relative
apparatus position, dashboard size, and dashboard placement reflect the final
headset-directed spatial adjustments.

The owner accepted the text and stated the product was essentially ready for a
v0.1 release. Generated ambience, periodic mechanical/bubble details, and sparse
music remain subordinate and share one physical Mute control. Narration and
additional product ideas are explicitly deferred. This records the seated Batch
10 human visual/audio gate as passed. Hosted-URL verification, final release
capture, endurance, and non-operator review remain separate release evidence.
