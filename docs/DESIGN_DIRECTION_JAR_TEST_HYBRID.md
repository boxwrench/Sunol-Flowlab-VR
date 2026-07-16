# Hybrid Jar Test Bench and Hero Observation Tank

Status: Approved design direction, staged implementation

Source artifact: [Sunol FlowLab VR Design Brief.pdf](Sunol%20FlowLab%20VR%20Design%20Brief.pdf)

Applies to product presentation, visual hierarchy, interaction meaning, instrumentation, rendering, and the future roadmap. [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) and the individual batch plans remain authoritative for implementation order, blockers, scope, tests, evidence, acceptance, and completion.

Historical source identifiers using “turbidity” refer to a dimensionless relative optical-load signal. [The modeling research amendment](MODELING_RESEARCH_AMENDMENT.md) governs its authoritative calculation and excludes calibrated NTU claims.

## 1. Purpose

Sunol FlowLab VR retains the recognizable visual language of a traditional six-jar test without limiting the central experience to six small vessels. The approved direction pairs a classic six-jar comparison bench with one larger hero observation tank.

The jars establish what the experiment is. The hero tank shows why the experiment matters.

The station contains:

- a recognizable six-jar rack;
- one larger hero observation tank;
- a physical 11-detent relative-dose control;
- a separate deliberate Start control;
- restrained physical instrumentation;
- a mounted dose-response plot;
- a fictionalized water-treatment environment.

The experience remains phenomenological, deterministic, fictionalized, educational, non-calibrated, and unsuitable for operational guidance or chemical-dose prediction.

## 2. Authority

This brief governs product intent, presentation meaning, visual hierarchy, interaction meaning, apparatus composition, source-of-truth rules, and sensory constraints. It does not independently schedule work.

Authority flows from:

1. CLAUDE.md and architecture contracts;
2. IMPLEMENTATION_PLAN.md;
3. the governing batch plan;
4. this design-direction brief;
5. implementation.

When timing or scope appears to conflict, the governing batch plan wins. Every affected batch must reference this brief directly.

## 3. Core experience

The hero tank is the primary live visualization. It must make raw-water haze, rapid mixing, flocculation, floc growth, size-dependent settling, the clearing front, residual suspended material, and the difference among underdose, near-optimum dose, and overdose readable.

The six jars support rather than compete with the hero tank. The intended mental model is recognizable jar-test apparatus, select a relative dose, observe the process at a larger readable scale, then measure and compare the result.

## 4. Six-jar apparatus

The jar rack provides authenticity, canonical dose selection, and simplified comparison. It is not the complete experiment history and does not contain six concurrent simulations.

### 4.1 Canonical dose presets

| Jar | Relative dose |
| --: | ------------: |
|   1 |             0 |
|   2 |             2 |
|   3 |             4 |
|   4 |             6 |
|   5 |             8 |
|   6 |            10 |

The complete DoseIndex contract remains every integer from 0 through 10. Odd values remain selectable through the primary physical control. The jars are convenient canonical presets, not storage locations for every dose.

### 4.2 Canonical comparison summaries

A completed trial may update a jar summary only when the dose exactly matches that jar's canonical preset. Suitable summaries include final relative haze, simplified settled-material appearance, a tested indicator, a small result token, or a restrained clarity gradient.

Canonical summaries are static physical comparisons. They are not separate simulations and must not contain their own clock, continuously moving particles, independent optical-load calculations, per-frame process logic, or renderer-derived outcomes.

## 5. Complete experiment memory

The mounted dose-response plot and versioned experiment log are the sole complete records of experiment history. They support all eleven integer dose values.

A saved treatment-result ghost is a limited, separately managed comparison record governed by [the ghost replay design](GHOST_REPLAY_DESIGN.md). It does not replace the complete plot/log, imply that every trial was saved, or turn a canonical jar into a replay surface. Clearing experiment history and deleting saved ghosts are distinct deliberate actions unless a later tested “clear all local data” control labels both effects explicitly.

An odd-dose trial updates the hero tank, gauge, complete plot, and experiment log while leaving canonical jars unchanged. An exact canonical-dose trial also updates its one matching jar summary.

Preferred terms are canonical jars, canonical comparison samples, dose presets, and comparison summaries. Do not describe the jars as eleven-dose storage or complete experiment memory.

## 6. Hero observation tank

The hero tank presents the currently selected live trial, makes floc and vertical settling readable, supports measurement, and remains visually dominant over the jars, instruments, plot, and environment.

It is a stylized observation chamber inspired by jar-test behavior, not a literal plant basin. Its scale exists for readability and visual storytelling, not to imply calibrated performance.

## 7. Visual hierarchy

1. Hero observation tank.
2. Active dose control and selected canonical jar.
3. Floc and clearing-front behavior.
4. Measurement gauge and complete result plot.
5. Remaining static canonical jar summaries.
6. Background environment.

## 8. Source-of-truth rule

Validated commands feed one authoritative deterministic simulation. Authoritative optical-load-band and trial-result records then feed the hero tank, canonical jar summaries, gauge, complete plot, measurement cue, audio, haptics, and the application-owned treatment-ghost recorder.

Prohibited behavior includes:

- renderer-only dose outcomes;
- jar clarity calculated separately from a completed result;
- hero-tank behavior that disagrees with the result;
- phase-triggered success effects unsupported by simulation state;
- independent instrument optical-load calculations;
- decorative best-jar effects unsupported by trial data;
- audio or lighting that communicates a better outcome than the simulation produced.

Visual transforms may improve readability only by consuming authoritative outputs.

## 9. Simulation and floc presentation

Actual deterministic aggregation is preferred. When floc merges, simulation state updates authoritative size and motion properties; rendering may tween an event that occurred but may not invent one.

The educational chain is: dose affects collision success, successful collisions create larger floc, larger floc settles faster, suspended material decreases, and clarity improves.

Low and excessive dose must remain visibly poorer than the near-optimum condition.

## 10. Runtime ownership

Before additional treatment behavior, the foundation must preserve these outcomes:

- src/app owns runtime lifecycle and orchestration;
- src/sim owns deterministic state and behavior;
- src/render consumes externally owned read-only views;
- src/xr emits discrete validated commands;
- React does not own continuously changing process state;
- rendering never creates, starts, advances, or resets the simulation;
- rendering never imports app-owned lifecycle or telemetry modules;
- the runtime starts, pauses, resets, advances, and steps headlessly without React or WebGL;
- no generalized engine, event bus, or global state framework is introduced.
- treatment-ghost recording, compatibility, persistence, and playback timing stay in src/app;
- ghost rendering consumes a read-only replay view and never advances or recomputes simulation state.

Boundary, lifecycle, renderer-contract, and headless tests permanently enforce this correction. Unexpected React rerenders may be measured diagnostically, but zero renders is not the primary gate; continuously changing state must not require React ownership.

## 11. Intended static jar-summary implementation

Jar summaries use a write-on-completion model:

1. A completed result exactly matches a canonical dose.
2. The application finds the corresponding jar.
3. A documented display transform consumes the authoritative result.
4. The static jar state updates once and stores the result ID.
5. No continuous jar simulation is created.

A suitable application-owned record is:

    interface CanonicalJarSummary {
      readonly dose: 0 | 2 | 4 | 6 | 8 | 10
      readonly trialId: string
      readonly endpointOpticalLoad: number
      readonly displayClarity: number
    }

Summaries are cleared with experiment-log clearing, restored consistently with persistence, traceable to a completed result, updated only on trial completion, and static between updates.

## 12. Measurement presentation

The nephelometer uses recognizable emitter-and-detector geometry around the sample zone. Initial implementation favors a narrow emissive beam or sample line, brief detector glow, physical gauge response, restrained sound, and intensity mapped from the authoritative sample.

Expensive volumetric or layered transparency effects require a successful hero tank and physical Quest evidence first.

## 13. Rendering and performance

Layered transparency and screen-space overdraw are expected to be more dangerous than 500 particles alone. Prefer opaque instanced particles, one optical-load authority presented through sparse rear and middle slices from the same texture, cheap jar walls, no realistic refraction, and no stacked independent full-tank effects.

Any large transparent effect requires before-and-after average frame time, p95, draw-call, memory, and readability evidence on the target Quest.

React may own composition, discrete transitions, XR lifecycle, completed-trial updates, low-frequency accessibility state, and development configuration. It must not own per-particle state, changing optical-load arrays, clock progression, floc motion, clearing-front animation, or continuously updated gauge motion.

The simulation stays on the main thread until measurements prove it is a meaningful bottleneck. A Web Worker is not currently planned.

Foveation and framebuffer scale are measured configuration tools, not unconditional optimizations. Any reduction must preserve labels, gauge, plot, floc, clearing-front, and interaction readability.

## 14. Interaction

The preferred dose control is a physical 11-detent lever with a documented rotary fallback if headset testing rejects the lever. It emits only integer DoseIndex values.

Selecting a canonical jar may suggest its preset, highlight the matching detent or plot point, load a completed canonical result for review, or prepare the hero tank. It never bypasses command validation.

A separate deliberate Start control emits exactly one Start command. Refill and history clearing remain separate; refill preserves history, while clearing history also clears plot points and canonical summaries.

## 15. Haptics and audio

Haptics are capability-checked, sparse, event-driven, optional, and outside simulation state. Approved uses include a light detent tick and stronger Start confirmation.

Early batches may expose no-op audio hooks. Final audio remains muted-optional and subordinate to comprehension.

## 16. Environment and lighting

Use restrained low-poly geometry, shared materials, limited real-time lights, no dynamic shadows, and near-field scale cues. The apparatus remains dominant. Any panorama or environment map requires load-time, decoded-memory, Quest performance, contrast, dominance, and provenance review.

## 17. Recognition and comprehension validation

Once the bench and hero-tank composition is blocked out, show one unlabeled screenshot to at least one water-treatment operator or educator and preferably one person without water-treatment experience.

Ask before explaining the project:

- 'What do you think this apparatus represents?'
- 'What would you expect to do here?'

Record responses in docs/UX_VALIDATION.md. Reconsider the composition before instrumentation is finalized if the operator misses the jar-test connection, the non-operator misses comparative experimentation, the jars overpower the hero tank, the relationship is unclear, or viewers expect six simultaneous live simulations.

## 18. Implementation mapping

| Design work                                                           | Governing batch   |
| --------------------------------------------------------------------- | ----------------- |
| Runtime ownership correction                                          | Batch 01A closure |
| Hero tank and jar-rack composition blockout                           | Batch 03          |
| Dose control, Start control, haptics, optional jar presets            | Batch 04          |
| Simulation and XR integration                                         | Batch 05          |
| Complete treatment-cycle behavior                                     | Batch 06          |
| Static jar summaries, complete plot, gauge, nephelometer, persistence | Batch 07          |
| Treatment-ghost recording, compatibility, storage, playback runtime   | Batch 07          |
| Headset readability, clearing-front, and ghost visual comparison      | Batch 08          |
| Desktop spectator presentation                                        | Batch 09          |
| Audio, lighting, environment, measurement polish                      | Batch 10          |
| Approved export and sharing features                                  | Batch 11          |

## 19. Staged implementation

1. Close the foundation: runtime ownership, boundaries, deterministic foundation, performance evidence, and synchronized plans.
2. Prove the phenomenon: dose response, floc, settling, optical-load authority, hero-tank desktop proof, sweep, jar-rack blockout, and recognition validation. Jars may remain static geometry.
3. Prove XR interaction: detented control, Start, haptics, ergonomics, optional jar preset selection, and validated commands.
4. Integrate the treatment cycle: selected dose, runtime, hero tank, phases, measurement, result, refill, and XR state.
5. Add instrumentation and memory: static jar summaries, gauge, complete plot, nephelometer, persistence, refill, physical clear-history action, and the bounded treatment-ghost recorder/playback runtime.
6. Add the subordinate ghost visual comparison during headset readability work.
7. Add presence and polish only after core evidence.

## 20. Version 1 boundary

Version 1 includes one live authoritative simulation, one hero tank, one six-jar canonical preset rack, one 11-detent control, one treatment cycle at a time, static canonical summaries, a complete plot, persistent history, a small treatment-result ghost library, desktop spectator mode, and Quest VR mode.

Version 1 does not require six concurrent simulations, a universal multi-vessel engine, particle-level replay, replay by recomputation, calibrated units, pH or temperature chemistry, hand tracking, volumetric lighting, fluid simulation, CFD, operational recommendations, or a plant walkthrough.

## 21. Future direction

The rack creates a future path toward comparative multi-jar experiments without forcing current architecture to support them. Multiple live jars, additional fictionalized variables, classroom mode, exports, shareable URLs, hand tracking, and multi-user demonstrations remain research ideas rather than commitments.

## 22. Acceptance

The direction succeeds when an operator recognizes the jar-test connection, a non-operator sees a comparative experiment, the hero tank remains dominant, jars read as canonical presets rather than history, dose outcomes are distinct, visuals derive from authoritative behavior, odd-dose results remain in the complete plot and log, all instruments agree, the apparatus works seated and standing, controls emit validated integers, React owns no continuous process state, target Quest performance is sustained, and no effect implies calibrated plant prediction.

## 23. Final decision

Sunol FlowLab VR is neither a literal six-jar simulator nor an abandonment of the iconic jar-test image. A classic six-jar bench provides authenticity and canonical dose selection. One larger hero tank magnifies the selected treatment process. The mounted plot and persisted experiment log hold complete history across all eleven doses; jars provide static summaries only for six canonical presets, and a small saved ghost library provides optional recorded-result comparison without duplicating the simulation.
