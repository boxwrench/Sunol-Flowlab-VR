# Treatment-Result Ghost Replay Design

**Repository path:** `docs/GHOST_REPLAY_DESIGN.md`  
**Status:** Approved version 1 replay and persistence direction  
**Applies to:** Recording, storage, playback, compatibility, and presentation of prior treatment runs  
**Related document:** `docs/MODELING_RESEARCH_AMENDMENT.md`

---

## 1. Purpose

Sunol FlowLab VR may present a previous treatment run as a ghost for comparison, review, or demonstration.

Version 1 will implement a **treatment-result ghost**, not a complete particle-level simulation replay.

The ghost records and replays the authoritative vertical optical-load history produced by the simulation.

This design intentionally avoids replay-by-recomputation because recomputation would depend on:

- exact simulation code;
- exact operation ordering;
- random-number consumption;
- browser-engine behavior;
- simulation-version compatibility.

Recorded output is small, stable, and sufficient for the educational comparison.

---

## 2. Core Decision

Version 1 ghosts use record-and-replay of authoritative optical-load bands.

Approved flow:

```text
authoritative simulation bands
    ↓
fixed-rate application recorder
    ↓
versioned treatment-ghost record
    ↓
playback clock and linear interpolation
    ↓
ghost water appearance, clearing front, gauge trace, and result comparison
```

Ghost playback does not rerun the coagulation simulation.

The simulation owns the authoritative band values.

The application layer owns:

- recording;
- serialization;
- persistence;
- playback timing;
- compatibility checks.

The rendering layer consumes replay state but does not derive process values.

---

## 3. What a Treatment-Result Ghost Represents

A treatment-result ghost can reproduce:

- relative water haze by height;
- clearing-front movement;
- gauge history;
- dose-response or result trace;
- phase timing;
- endpoint relative optical load;
- the broad visual progression of the treatment result.

A treatment-result ghost does not reproduce:

- exact particle trajectories;
- exact collision pairs;
- exact merge history;
- identical floc shapes;
- identical settling snowfall;
- a complete physical simulation state.

The product should call this feature:

- treatment-result ghost;
- clarity ghost;
- previous-run overlay;
- recorded treatment replay.

Avoid implying that it is a full simulation replay.

---

## 4. Authoritative Source

The recorder consumes the same authoritative band record used by:

- hero-tank water appearance;
- clearing-front calculation;
- nephelometer presentation;
- physical gauge;
- dose-response plot;
- persisted trial result;
- canonical jar summaries.

The replay system must not:

- recalculate optical load;
- derive clarity from rendered particles;
- reconstruct results from dose alone;
- run a second settling model;
- invent an independent clearing front.

The modeling and replay systems share one process truth.

---

## 5. Recording Rate

Version 1 records at:

\[
10\ \text{samples per second}
\]

unless profiling or perceptual testing supports a lower rate.

The simulation may run at a higher fixed timestep. The recorder decimates the authoritative band output to the configured recording rate.

Ten hertz is appropriate because optical-load and clearing-front changes are slow relative to render-frame motion.

The recorder must use simulation or application elapsed time, not render-frame count, so recording remains stable when frame rate changes.

---

## 6. Replay Interpolation

Version 1 uses linear interpolation between stored samples.

For neighboring samples \(A\) and \(B\):

\[
V(t)=(1-u)A+uB
\]

where \(u\) is the normalized playback position between sample times.

Linear interpolation is selected because it is:

- stable;
- bounded by recorded values;
- inexpensive;
- easy to test;
- sufficient for slowly changing optical-load bands.

Version 1 does not require:

- Hermite interpolation;
- spline interpolation;
- predicted derivatives;
- simulated particle motion.

Interpolation must not overshoot below zero or above the valid normalized range.

---

## 7. Ghost Record Schema

A treatment ghost should contain enough metadata to explain, validate, and replay the recording.

Recommended structure:

```ts
interface TreatmentGhost {
  readonly schemaVersion: number
  readonly simVersion: string
  readonly opticalProxyVersion: string

  readonly trialId: string
  readonly createdAt: string

  readonly seed: number
  readonly doseIndex: number
  readonly rawWaterConfigId: string
  readonly simulationConfigHash: string

  readonly sampleRateHz: number
  readonly durationSeconds: number

  readonly bandCount: number
  readonly bandEdges: Float32Array
  readonly samples: Float32Array

  readonly phaseTimeline: {
    readonly rapidMixEnd: number
    readonly flocculationEnd: number
    readonly settlingEnd: number
    readonly measurementTime: number
  }

  readonly endpointOpticalLoad: number
}
```

### Sample layout

`Samples` should use a documented flat layout, such as:

```text
sample 0 band 0
sample 0 band 1
...
sample 0 band N-1
sample 1 band 0
...
```

The expected length is:

```ts
sampleCount * bandCount
```

The record may also contain a compact result summary, but the sample array remains the playback authority.

---

## 8. Version and Compatibility Metadata

Every ghost must include:

- schema version;
- simulation version;
- optical-proxy version;
- band count;
- band edges;
- sample rate;
- simulation configuration identifier or stable hash.

Because output is recorded, a simulation update does not automatically invalidate an old ghost.

However, playback must detect incompatible representation changes.

Examples include:

- different band count;
- different band boundaries;
- changed optical-load normalization;
- changed sample layout;
- changed schema.

The application must not silently reinterpret incompatible data.

Approved responses are:

- play normally;
- migrate through a tested migration;
- show as legacy summary only;
- refuse playback with a clear compatibility message.

---

## 9. Simulation Version and Build Drift

Recorded output is selected specifically to survive simulation changes.

A ghost remains a record of what the earlier build produced.

It does not need to match what the current model would produce from the same seed and dose.

Version metadata exists to:

- explain differences;
- support migration;
- identify legacy results;
- avoid false direct comparisons between incompatible models.

The UI should avoid presenting ghosts from incompatible optical-proxy versions as though they are directly comparable.

---

## 10. Storage Size

Raw storage is:

\[
\text{bytes}
=

\text{bandCount}
\times
4
\times
\text{sampleRateHz}
\times
\text{durationSeconds}
\]

For a five-minute trial at 10 Hz:

- 8 bands: approximately 96 KB;
- 12 bands: approximately 144 KB;
- 16 bands: approximately 192 KB.

Actual serialized size depends on the storage format.

This is small enough for a limited version 1 ghost library, but browser quota must be measured rather than assumed.

---

## 11. Version 1 Persistence Strategy

Use the simplest persistence path that already fits the application architecture.

Version 1 should:

- store only a small configured number of ghosts;
- measure serialized size;
- fail gracefully when storage is unavailable or full;
- allow the user to delete saved ghosts;
- preserve metadata with the samples.

Do not introduce a generalized storage layer solely for this feature.

### localStorage

localStorage may be acceptable for a small number of records when:

- existing application persistence already uses it;
- encoding and quota are measured;
- writes do not noticeably block interaction.

Because localStorage stores strings, binary typed arrays require serialization.

### IndexedDB

IndexedDB should be adopted when a real requirement exists for:

- many saved runs;
- larger binary histories;
- nonblocking writes;
- indexing or search;
- long-term ghost libraries.

It is not required for the first implementation.

---

## 12. Compression

Version 1 stores straightforward samples first.

Do not begin with:

- delta encoding;
- variable-length integers;
- int16 quantization;
- periodic compression keyframes;
- custom binary codecs.

Compression should be added only when measured storage size becomes a limitation.

A future compressed format may use:

- periodic absolute keyframes;
- deltas between samples;
- bounded quantization;
- explicit codec version metadata.

Any compression must preserve visible playback quality and endpoint agreement.

---

## 13. Playback Runtime

Ghost playback uses its own application-level playback clock.

The live coagulation simulation does not advance during pure ghost playback.

Playback runtime responsibilities include:

- play;
- pause;
- seek;
- reset;
- sample lookup;
- linear interpolation;
- phase-label updates;
- endpoint handling.

Playback must not mutate live simulation state.

A comparison mode may run a live trial while also reading a prior ghost, but the two states remain separate.

---

## 14. Rendering

The renderer consumes a read-only replay view.

A ghost may drive:

- a secondary water-gradient overlay;
- a previous-run clearing-front marker;
- a ghost gauge needle or trace;
- a previous-result plot line;
- restrained phase markers.

The ghost should remain visually subordinate to the active trial.

It should not require:

- ghost particles;
- replayed collisions;
- a second instanced particle simulation;
- duplicate physics;
- volumetric effects.

The feature should make comparison easier, not double rendering cost.

---

## 15. Comparison Rules

A ghost and live trial may be compared directly only when relevant metadata is compatible.

At minimum compare:

- optical-proxy version;
- raw-water configuration;
- band configuration;
- result normalization;
- treatment phase schedule when timing is important.

If configurations differ, the UI should label the difference rather than imply an equal-condition comparison.

Dose may differ. Comparing dose outcomes is a primary use case.

---

## 16. Determinism and Replay Contract

Ghost playback is deterministic because it plays recorded values rather than recomputing the model.

Given identical stored ghost bytes and the same playback implementation, the visible band values at a given playback time should match within documented interpolation tolerance.

The replay system does not depend on:

- V8 version;
- CPU architecture;
- stochastic collision order;
- transcendental math results;
- current simulation constants.

This is the primary reason record-and-replay is selected.

---

## 17. Replay by Recalculation

Replay by recalculation would store:

- seed;
- dose;
- input events;
- configuration.

It would then rerun the simulation.

Version 1 rejects this approach because a small numeric or ordering difference can change collision outcomes and cause full trajectory divergence.

Recalculation replay should be reconsidered only when all of the following are true:

- there is a real product requirement;
- the simulation is version locked;
- cross-runtime determinism is demonstrated;
- old ghosts are tied to exact compatible builds;
- incompatibility behavior is explicit.

A future version may use a WebAssembly simulation core with a bundled math library if cross-engine bit-level recomputation becomes necessary.

That is not a version 1 task.

---

## 18. WebAssembly and Fixed-Point Math

Version 1 does not move the simulation to WebAssembly for replay determinism.

Version 1 does not adopt fixed-point math.

Those approaches are justified only by requirements such as:

- cross-browser replay by recomputation;
- live cross-device lockstep;
- multiplayer deterministic simulation;
- exact state-hash equality across different runtimes.

Record-and-replay already solves the current ghost requirement with less complexity.

WebAssembly may still be evaluated later for measured performance reasons, but replay alone does not justify the rewrite.

---

## 19. Failure and Recovery Behavior

The application must handle:

- missing ghost data;
- truncated sample arrays;
- invalid metadata;
- unsupported schema versions;
- incompatible band configuration;
- storage quota failure;
- serialization failure;
- deletion during selection;
- playback reaching the end.

A corrupt ghost must not crash the live simulation.

The application should preserve the result summary when possible even if full playback is unavailable.

---

## 20. Required Tests

### 20.1 Recording cadence

A fixed-duration run produces the expected sample count within the documented endpoint rule.

### 20.2 Band layout

Every sample contains exactly `bandCount` values in the documented order.

### 20.3 Endpoint agreement

The final stored sample and `endpointOpticalLoad` agree with the authoritative completed-trial result.

### 20.4 Playback interpolation

Linear interpolation:

- returns exact samples at sample timestamps;
- remains between neighboring values;
- never overshoots the valid range.

### 20.5 Playback independence

Ghost playback does not:

- advance the live simulation clock;
- mutate particle state;
- consume simulation randomness;
- create new trial results.

### 20.6 Persistence round trip

Saving and loading preserves:

- metadata;
- band edges;
- sample count;
- sample values within encoding tolerance;
- endpoint result.

### 20.7 Compatibility handling

Tests cover:

- supported current records;
- legacy compatible records;
- records requiring migration;
- incompatible records;
- malformed records.

### 20.8 Configuration comparison

The UI or application state correctly distinguishes:

- directly comparable ghosts;
- ghosts with different raw-water configuration;
- ghosts with different optical-proxy version;
- ghosts with different band configuration.

### 20.9 Storage limit behavior

When the configured ghost limit or storage budget is reached, the application fails gracefully and offers deletion or replacement rather than silently losing data.

### 20.10 Cross-browser playback

The same stored record should produce the same interpolated band values across supported browsers within floating-point serialization tolerance.

This tests playback portability, not simulation recomputation.

---

## 21. Version 1 Scope

Version 1 includes:

- authoritative band-history recording;
- 10 Hz sampling;
- versioned metadata;
- linear interpolation;
- a small saved ghost library;
- delete and replay behavior;
- compatibility checks;
- result and phase replay;
- restrained visual comparison.

Version 1 does not include:

- exact particle replay;
- exact collision replay;
- replay by recomputation;
- compression codecs;
- Hermite interpolation;
- a large searchable ghost library;
- automatic cloud sync;
- multiplayer lockstep;
- a WebAssembly rewrite;
- fixed-point simulation math.

---

## 22. Revisit Conditions

Revisit compression when measured storage becomes limiting.

Revisit IndexedDB when the product needs many ghosts or larger binary records.

Revisit particle-level recording when user research shows that aggregate motion, not treatment-result comparison, is essential.

Revisit replay by recomputation only when version-locked deterministic simulation becomes a real requirement.

Revisit WebAssembly when:

- profiling shows a real performance need;
- cross-engine state identity is required;
- live deterministic multiuser behavior is planned.

---

## 23. Approved Implementation Changes

1. Define the feature as a treatment-result ghost.
2. Record authoritative optical-load bands rather than particle state.
3. Record at 10 Hz by application or simulation time.
4. Use linear interpolation.
5. Include schema, simulation, optical-proxy, and configuration metadata.
6. Record phase timing and endpoint result.
7. Keep recording and playback ownership in `src/app`.
8. Keep the simulation responsible only for authoritative samples.
9. Keep rendering read-only.
10. Start with uncompressed Float32 samples.
11. Limit the saved ghost count.
12. Measure storage before adding compression or IndexedDB.
13. Reject replay by recomputation for version 1.
14. Defer WebAssembly and fixed-point math.
15. Test persistence, compatibility, endpoint agreement, and playback independence.

---

## 24. Final Decision

Sunol FlowLab VR version 1 uses record-and-replay treatment-result ghosts.

Each ghost stores the authoritative vertical optical-load history, phase timeline, endpoint result, and compatibility metadata. Playback uses a separate application-level clock and bounded linear interpolation.

The ghost reproduces water-column clarity, clearing-front movement, gauge history, and result progression. It does not reproduce exact particles, collisions, floc shapes, or simulation state.

This design is selected because it:

- remains valid across simulation tuning;
- avoids cross-engine floating-point divergence;
- uses little storage;
- preserves one process truth;
- does not duplicate simulation work;
- fits the existing application architecture;
- avoids a premature WebAssembly, fixed-point, or deterministic-lockstep rewrite.
