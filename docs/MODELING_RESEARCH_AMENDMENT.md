# Coagulation and Flocculation Modeling Research Amendment

**Repository path:** `docs/MODELING_RESEARCH_AMENDMENT.md`  
**Status:** Approved version 1 modeling decision  
**Applies to:** Sunol FlowLab VR coagulation, flocculation, settling, optical-load, and simulation-determinism work  
**Supersedes:** Conflicting version 1 implementation guidance in the modeling research report  
**Related document:** `docs/GHOST_REPLAY_DESIGN.md`

---

## 1. Purpose

The modeling research supports the existing Sunol FlowLab VR architecture.

Version 1 will continue to use a deterministic representative-particle aggregation model. This amendment defines the approved implementation details and resolves ambiguities around:

- fractal floc size, density, and settling;
- authoritative particle state;
- collision and merge behavior;
- relative optical load;
- optical-load behavior during aggregation;
- dose-response interpretation;
- deterministic hot-loop math;
- seeded randomness;
- aggregate growth limits;
- validation and acceptance.

This is a refinement of the current model, not a redesign.

Where this amendment and the earlier research report differ, this amendment governs version 1 implementation.

Replay recording, persistence, and playback are governed by `docs/GHOST_REPLAY_DESIGN.md`.

---

## 2. Version 1 Model Decision

Version 1 uses a refined representative-particle aggregation model.

The approved process chain is:

```text
relative dose
    ↓
dimensionless sticking efficiency
    ↓
phase-dependent particle encounters
    ↓
mass-conserving aggregation
    ↓
fractal-derived floc diameter
    ↓
fractal-derived effective density
    ↓
capped size-dependent settling
    ↓
vertically binned suspended optical load
    ↓
water appearance, clearing front, gauge, plot, saved result, and replay samples
```

The model is:

- deterministic within a versioned build;
- phenomenological;
- mass conserving;
- visually inspectable;
- suitable for browser-based VR;
- intentionally non-calibrated.

It does not predict real dose, real NTU, or treatment-plant performance.

---

## 3. Coagulation and Flocculation Roles

Coagulation and flocculation remain distinct in the model.

### Coagulation abstraction

Relative dose controls effective sticking probability.

This represents the net result of particle destabilization without simulating:

- zeta potential;
- pH-dependent speciation;
- charge reversal;
- alkalinity;
- natural organic matter;
- coagulant precipitation.

### Flocculation abstraction

Mixing and phase behavior control encounter frequency.

Successful encounters can create larger aggregates. Aggregate growth must be an outcome of authoritative merges rather than a phase-only visual effect.

The intended educational chain is:

```text
dose changes effective sticking
    ↓
favorable encounters create larger aggregates
    ↓
larger aggregates settle faster
    ↓
settling removes suspended optical load
    ↓
clarity improves
```

---

## 4. Fractal Floc Size

Aggregate mass is authoritative.

Aggregate diameter is derived from mass:

\[
D = D_p\left(\frac{m}{m_p}\right)^{1/D_f}
\]

where:

- \(D\) is aggregate diameter;
- \(D_p\) is primary-particle diameter;
- \(m\) is aggregate mass;
- \(m_p\) is primary-particle mass;
- \(D_f\) is the configured fractal dimension.

For the version 1 default:

\[
D_f = 2.0
\]

the relationship simplifies to:

\[
D = D_p\sqrt{\frac{m}{m_p}}
\]

This simplification is useful because it avoids `Math.pow` in the simulation hot loop.

### Parameter interpretation

The fractal dimension is a literature-informed educational parameter.

It must not be presented as a validated value for a specific:

- coagulant;
- source water;
- jar-test procedure;
- facility;
- operating condition.

A research range of approximately:

\[
1.7 \le D_f \le 2.2
\]

may be evaluated in development, but version 1 defaults to \(D_f=2.0\).

---

## 5. Effective Density and Settling

Effective excess density decreases as aggregate size increases:

\[
\Delta\rho(D)
=

\Delta\rho_p
\left(\frac{D}{D_p}\right)^{D_f-3}
\]

Settling velocity uses a capped fractal-modified Stokes relationship:

\[
v_s
=

\min
\left(
v_{\max},
k_s
\frac{
g\,\Delta\rho(D)\,D^2
}{
18\mu
}
\right)
\]

After substituting the fractal density relationship:

\[
v_s \propto D^{D_f-1}
\]

For \(D_f=2\):

\[
v_s \propto D
\]

Version 1 may therefore implement an equivalent capped linear-in-diameter settling rule after configuration constants are combined.

This prevents large flocs from accelerating unrealistically while preserving the lesson that larger aggregates generally settle faster.

### Required settling properties

- Larger active aggregates generally settle faster than smaller ones.
- Settling velocity remains capped.
- Settled aggregates stop contributing to water-column optical load.
- Settling does not destroy mass.
- Version 1 does not include resuspension or hindered-settling equations.

---

## 6. Simulation Parameters and Visual Appearance

The simulation fractal dimension must not be used as an art-direction control.

### Simulation fractal dimension controls

- mass-to-diameter scaling;
- effective density;
- settling velocity;
- optical-load response during aggregation.

### Rendered floc appearance controls

- apparent porosity;
- edge irregularity;
- softness;
- color variation;
- visual exaggeration;
- perceived fluffiness or wispiness.

Rendered floc may look open or irregular without changing authoritative simulation values.

Visual styling must not alter:

- mass;
- simulation diameter;
- collision radius;
- relative optical load;
- settling speed;
- trial result.

---

## 7. Authoritative Particle State

Recommended state:

```ts
interface ParticleState {
  readonly capacity: number

  readonly active: Uint8Array
  readonly settled: Uint8Array

  readonly posX: Float32Array
  readonly posY: Float32Array
  readonly posZ: Float32Array

  readonly velX: Float32Array
  readonly velY: Float32Array
  readonly velZ: Float32Array

  readonly mass: Float32Array
  readonly diameter: Float32Array
}
```

Mass is authoritative.

Diameter may be cached for performance, but it must always be derived from mass.

Effective density and settling velocity should be derived when needed unless profiling demonstrates a reason to cache them.

Required invariant:

```ts
diameter[i] === diameterFromMass(mass[i], config)
```

within the documented floating-point tolerance.

The implementation must not allow independently mutable mass, diameter, effective density, and settling velocity to drift apart.

---

## 8. Merge Behavior

When two active suspended aggregates successfully merge:

1. select one deterministic surviving slot;
2. conserve total mass;
3. calculate merged velocity using mass weighting;
4. derive the new diameter from merged mass;
5. deactivate the consumed slot;
6. leave total system mass unchanged.

Example:

```ts
const massI = state.mass[i]
const massJ = state.mass[j]
const mergedMass = massI + massJ

state.velX[i] = (state.velX[i] * massI + state.velX[j] * massJ) / mergedMass

state.velY[i] = (state.velY[i] * massI + state.velY[j] * massJ) / mergedMass

state.velZ[i] = (state.velZ[i] * massI + state.velZ[j] * massJ) / mergedMass

state.mass[i] = mergedMass
state.diameter[i] = diameterFromMass(mergedMass, config)

state.active[j] = 0
```

The exact code may differ, but deterministic slot selection and mass conservation are required.

### No free list in version 1

A free list is not required because the current treatment cycle:

- starts with a fixed particle population;
- merges or settles particles;
- does not create replacement particles;
- does not fragment aggregates;
- does not inject new material during a trial.

Inactive slots remain inactive until reset.

A free list should be introduced only when a shipped feature creates new particle slots.

---

## 9. Collision Distance

Collision distance must be based on authoritative aggregate size:

\[
r_{\mathrm{collision}}
=

k_c(r_i+r_j)
\]

where:

- \(r_i\) and \(r_j\) are simulation aggregate radii;
- \(k_c\) is a normalized interaction multiplier.

The following must remain separate:

1. simulation diameter;
2. collision radius;
3. rendered radius.

Rendered floc may be enlarged for readability without increasing physical collision probability.

---

## 10. Dose and Sticking Efficiency

Relative dose controls a dimensionless effective sticking probability:

\[
\alpha(d)
=

\alpha_{\max}
\exp
\left[
-\left(
\frac{d-d^*}{\sigma_d}
\right)^2
\right]
\]

where:

- \(d\) is the selected integer dose index;
- \(d^*\) is the configured optimum;
- \(\sigma_d\) controls the useful dose window;
- \(\alpha_{\max}\) is maximum effective sticking probability.

This function is phenomenological.

It represents:

- poor destabilization at low dose;
- favorable aggregation near the optimum;
- reduced effective aggregation at excessive dose.

### Precomputed dose table

There are only eleven valid dose indices.

The eleven sticking-efficiency values should be calculated once when simulation configuration is created or stored as a validated lookup table:

```ts
type DoseIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

interface DoseEfficiencyTable {
  readonly values: Float32Array // length 11
}
```

`Math.exp` must not be called repeatedly in the simulation hot loop.

### Overdose interpretation

Version 1 does not separately model:

- charge reversal;
- excess coagulant solids;
- residual aluminum;
- coagulant precipitation;
- floc weakening;
- pH-dependent chemistry.

Both underdose and overdose are represented primarily as reduced effective aggregation efficiency.

Approved description:

> Excessive relative dose produces a phenomenological reduction in effective treatment performance.

The model must not be described as a mechanistic charge-reversal simulation.

---

## 11. Seeded Randomness and Deterministic Ordering

Authoritative simulation code must not use `Math.random()`.

The simulation must use a seeded deterministic random source.

Required rules:

- identical build, configuration, seed, and inputs produce identical results within the supported runtime contract;
- particle iteration order is stable;
- collision-pair ordering is stable;
- duplicate pair evaluation is prevented;
- unordered object or map iteration must not control authoritative outcomes;
- reset restores the initial random state.

### Collision-randomness options

A sequential seeded PRNG is acceptable when call order is stable and covered by tests.

A keyed deterministic collision value may be used when branch-dependent PRNG consumption becomes difficult to reason about:

```ts
function collisionRandom(
  seed: number,
  stepIndex: number,
  particleA: number,
  particleB: number,
): number
```

A keyed value should be based on the ordered pair:

```text
min(particleA, particleB), max(particleA, particleB)
```

Do not refactor a working sequential PRNG solely to add keyed randomness. Adopt it only when it materially improves determinism, testing, or implementation clarity.

---

## 12. Deterministic Hot-Loop Math

Version 1 should avoid implementation-dependent transcendental operations in the hot loop.

Approved practices:

- use `diameter * diameter` rather than `Math.pow(diameter, 2)`;
- use `Math.sqrt` for the \(D_f=2\) mass-to-diameter relationship;
- precompute all eleven dose-efficiency values;
- use stable operation ordering;
- use fixed-timestep stepping;
- keep values away from invalid or extreme numeric ranges;
- reject NaN and Infinity through tests and assertions.

With \(D_f=2\), the model does not require hot-loop `Math.pow`, `Math.exp`, or `Math.log`.

### Determinism contract

Version 1 requires deterministic behavior within a versioned build and supported runtime configuration.

Version 1 does not promise:

- permanent bit identity across all browser engines;
- bit identity across arbitrary browser versions;
- cross-device lockstep;
- replay-by-recomputation compatibility across changed simulation builds.

Desktop-versus-Quest state hashes may be captured as diagnostic evidence, but matching hashes are not a release requirement unless the project later adopts a stricter cross-device contract.

---

## 13. Relative Optical Load

Version 1 uses suspended projected simulation area as the optical-load proxy.

For each vertical band \(b\):

\[
O_b
=

\sum_{i\in b,\ \mathrm{suspended}}
D_i^2
\]

The value is normalized against a configured reference:

\[
T_b
=

\operatorname{clamp}
\left(
\frac{O_b}{O_{\mathrm{reference}}},
0,
1
\right)
\]

The preferred reference is the initial suspended optical load for the trial or raw-water configuration.

The result is a dimensionless **relative optical-load signal**.

It is not NTU.

### Why the mass-area blend is rejected

The earlier research report proposed adding a projected-area term and a suspended-mass term.

Version 1 rejects that blend because area and mass are unlike quantities and should not be added without separate normalization and stronger justification.

The pure projected-area proxy is simpler, more explainable, and produces a useful relationship with the default fractal model.

Preferred interface language:

- relative optical load;
- normalized haze;
- relative clarity;
- treatment result.

Avoid calibrated turbidity or NTU labels.

---

## 14. Optical-Load Behavior During Aggregation

For an aggregate containing \(n\) primary particles:

\[
D=D_pn^{1/D_f}
\]

Its optical-load contribution is:

\[
D^2=D_p^2n^{2/D_f}
\]

For a fixed total number of primary particles divided among similarly sized aggregates, total suspended optical load scales approximately as:

\[
O_{\mathrm{total}}
\propto
n^{2/D_f-1}
\]

### When \(D_f=2\)

\[
2/D_f-1=0
\]

Aggregation alone produces approximately no change in whole-tank suspended optical load.

Flocculation changes aggregate size and settling potential. Most visible clarification occurs when aggregates settle.

This is intentional and desirable for version 1.

### When \(D_f<2\)

\[
2/D_f-1>0
\]

Aggregation may cause a small increase in whole-tank optical load before settling.

This is an expected consequence of more open fractal aggregates, not necessarily noise or a defect.

### When \(D_f>2\)

\[
2/D_f-1<0
\]

Aggregation may cause a small decrease in whole-tank optical load before settling.

### Default decision

Version 1 uses \(D_f=2.0\) unless deterministic and perceptual testing supports another value.

The value must not be changed merely to make floc look more open or visually interesting.

---

## 15. Global, Banded, and Local Optical Load

Telemetry and validation must distinguish:

1. whole-tank suspended optical load;
2. vertically binned optical load;
3. local instrument sample-zone optical load.

### Whole-tank optical load

With settling disabled and \(D_f=2\), whole-tank suspended optical load should remain approximately conserved during mass-conserving aggregation.

### Vertically binned optical load

Individual bands may rise or fall during mixing because aggregates move between regions even when the whole-tank total remains stable.

### Local instrument optical load

The configured measurement region may change as aggregates move through it.

A local rise or fall does not necessarily indicate a change in whole-tank suspended material.

This distinction prevents transport behavior from being misclassified as model noise.

---

## 16. Optical-Load Authority

One authoritative vertical optical-load record drives:

- hero-tank water appearance;
- clearing-front location;
- nephelometer presentation;
- physical gauge;
- dose-response plot;
- persisted trial result;
- static canonical jar summaries;
- treatment-result ghost samples.

Approved data flow:

```text
particle positions, diameters, active state, and settled state
    ↓
authoritative vertical optical-load bands
    ↓
all visual, instrument, plot, persistence, and replay consumers
```

The renderer, gauge, plot, jars, and replay system must not independently calculate process clarity.

---

## 17. Clearing Front

The clearing front is derived from the authoritative vertical optical-load bands.

It must not use:

- a second concentration field;
- a separate settling PDE;
- an independently animated interface;
- a renderer-authored clearing height.

A front location may be extracted using a documented threshold or gradient rule:

```ts
function findClearingFront(bands: Float32Array, threshold: number): number
```

Visual interpolation may smooth the front, but the underlying value must come from the authoritative record.

---

## 18. Aggregate Growth Bound and Population Health

Version 1 does not include explicit floc breakage.

It may include:

- maximum aggregate diameter;
- maximum aggregate mass;
- merge prohibition above a configured growth limit.

This is a **growth bound**, not a breakage model.

The bound exists to:

- prevent unrealistic aggregate size;
- preserve visible settling floc;
- prevent one aggregate from consuming most system mass;
- keep settling stable;
- protect the educational presentation.

Metrics captured during automated sweeps must include:

- active aggregate count;
- suspended aggregate count;
- settled aggregate count;
- mean aggregate mass;
- maximum aggregate mass;
- maximum aggregate diameter;
- largest aggregate as a fraction of initial total mass;
- number of visible suspended aggregates during settling.

The model should enforce or validate:

\[
\frac{
m_{\mathrm{largest}}
}{
m_{\mathrm{initial,total}}
}
\le f_{\max}
\]

where \(f_{\max}\) is chosen through deterministic and visual testing.

No exact threshold is established by this document.

---

## 19. Spatial Hashing

Spatial hashing remains optional and evidence gated.

At approximately 500 representative particles, complete the desktop phenomenon proof before adding more neighbor-search machinery.

Add spatial hashing only when profiling shows collision-pair evaluation is a meaningful simulation cost.

If introduced, it must preserve:

- deterministic particle iteration;
- deterministic pair ordering;
- no duplicate pairs;
- no per-step object allocation;
- reusable buffers;
- identical results for identical supported inputs.

---

## 20. Required Validation

### 20.1 Mass conservation

\[
\sum_i m_i(t)
=

\sum_i m_i(0)
\]

within documented floating-point tolerance.

### 20.2 Diameter consistency

Every active aggregate diameter remains consistent with authoritative mass.

### 20.3 Deterministic reset and rerun

Identical supported build, configuration, seed, and inputs produce identical:

- initial state;
- merge history;
- active state;
- endpoint bands;
- trial result.

### 20.4 Dose response

The 11-dose sweep demonstrates:

- poor performance at the low extreme;
- a principal best-performing region near the configured optimum;
- poorer performance at the high extreme;
- stable qualitative shape across an approved seed corpus.

Validate inequalities and shape, not exact values.

### 20.5 Settling

Larger aggregates generally settle faster while remaining bounded.

### 20.6 Population health

The sweep verifies:

- no premature population collapse;
- largest aggregate remains below the approved mass fraction;
- enough suspended floc remains visible during settling;
- no invalid slot, mass, diameter, position, or velocity values.

### 20.7 Optical-load consistency

The same endpoint optical-load value appears in:

- authoritative simulation output;
- gauge;
- plot;
- persisted result;
- matching canonical jar summary.

### 20.8 Aggregation-only optical-load test

With settling disabled and \(D_f=2\), whole-tank optical load remains approximately conserved during mass-conserving aggregation.

Tolerance may account for:

- floating-point error;
- growth limits;
- diameter clamps;
- boundary handling.

### 20.9 Non-default fractal-dimension test

For a non-default \(D_f\), compare pre-settling optical-load direction against:

\[
2/D_f-1
\]

Expected direction:

- positive exponent: may rise;
- zero exponent: approximately stable;
- negative exponent: may fall.

### 20.10 Local transport

Band and sample-zone values may change during mixing while the global value remains stable.

### 20.11 Numeric safety

Long-duration tests produce:

- no NaN;
- no Infinity;
- no particle escape;
- finite bounded state after at least 10,000 fixed steps.

### 20.12 Optional cross-device diagnostic

A diagnostic build may hash selected simulation snapshots on desktop and Quest.

Hash disagreement should trigger investigation, but cross-device hash identity is not a version 1 release gate.

---

## 21. Scientific and Perceptual Validation

Scientific validation asks:

- Is mass conserved?
- Is the result deterministic under the supported contract?
- Does the 11-dose sweep show the required qualitative response?
- Do larger aggregates settle faster?
- Does optical load behave as expected?
- Do all consumers agree with the authoritative record?

Perceptual validation asks:

- Can users see aggregate growth?
- Can users see differences in settling?
- Can users identify the clearest trial?
- Can users see a clearing front?
- Does the optimum look better without labels?
- Do underdose and overdose both look worse than the optimum?

When scientific behavior is correct but visual differences are unclear, adjust:

- render-size exaggeration;
- visual morphology;
- optical-gradient mapping;
- phase pacing;
- camera composition;
- result presentation.

Do not immediately increase model complexity or particle count.

---

## 22. Version 1 Exclusions

Version 1 excludes:

- calibrated NTU;
- calibrated chemical dose;
- real coagulant chemistry;
- pH;
- alkalinity;
- natural organic matter;
- temperature-dependent chemistry;
- zeta potential;
- explicit charge reversal;
- stochastic fragmentation;
- floc regrowth;
- hindered-settling equations;
- population-balance authority;
- CFD;
- fixed-point math;
- a WebAssembly simulation rewrite;
- cross-device lockstep;
- replay by simulation recomputation;
- universal FlowLab simulation infrastructure.

These may be reconsidered only when a specific product requirement justifies them.

---

## 23. Approved Implementation Changes

1. Keep the representative-particle model.
2. Make aggregate mass authoritative.
3. Derive diameter through the fractal mass relationship.
4. Use \(D_f=2.0\) by default.
5. Simplify the \(D_f=2\) hot-loop math to `sqrt`, multiplication, and division.
6. Derive effective density and capped settling from the fractal model.
7. Separate simulation fractal dimension from rendered floc appearance.
8. Use deterministic mass-conserving merges.
9. Remove the unused version 1 free list.
10. Base collision distance on simulation aggregate size.
11. Keep the Gaussian dose-response abstraction.
12. Precompute all eleven dose-efficiency values.
13. Prohibit `Math.random()` in authoritative simulation code.
14. Preserve stable particle and collision-pair ordering.
15. Use suspended \(\sum D^2\) as relative optical load.
16. Distinguish global, banded, and local optical load.
17. Derive the clearing front from authoritative bands.
18. Use a growth bound rather than explicit breakage.
19. Add population-collapse metrics and tests.
20. Keep spatial hashing gated on profiling.
21. Define determinism within a versioned build rather than across all engines forever.
22. Expose authoritative band samples to the separate ghost-recording system.

---

## 24. Final Decision

Sunol FlowLab VR version 1 uses a deterministic representative-particle aggregation model.

Relative dose controls a phenomenological bell-shaped sticking efficiency. Phase-dependent movement controls encounter frequency. Successful collisions merge aggregate mass deterministically.

Aggregate diameter and effective density follow a fractal relationship. The default simulation fractal dimension is:

\[
D_f=2.0
\]

This produces capped, approximately diameter-proportional settling and allows the simulation hot loop to use portable basic arithmetic and square root rather than repeated transcendental functions.

The simulation calculates one vertically binned relative optical-load record from the projected area of suspended aggregates. At \(D_f=2\), mass-conserving aggregation alone leaves whole-tank optical load approximately unchanged, so most visible clearing occurs when larger aggregates settle.

That authoritative band record drives the water appearance, clearing front, instruments, plot, saved result, canonical jar summaries, and treatment-result ghost recording.

The model intentionally does not simulate calibrated turbidity, real dose, pH-dependent chemistry, mechanistic charge reversal, explicit breakage, hindered settling, CFD, cross-device lockstep, or replay by recomputation.

This is the smallest model that preserves:

- underdose, optimum, and overdose behavior;
- emergent aggregate growth;
- size-dependent settling;
- deterministic supported reruns;
- mass conservation;
- explainable optical-load behavior;
- one process truth;
- browser and Quest feasibility;
- a clear boundary between educational modeling and operational prediction.
