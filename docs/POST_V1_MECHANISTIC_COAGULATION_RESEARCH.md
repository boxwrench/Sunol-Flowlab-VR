# Post-v1 Mechanistic Coagulation Research Contract

**Status:** Approved research direction; not authorized for implementation  
**Earliest implementation boundary:** After the accepted version 1 release  
**Product posture:** Fictionalized educational model, never operating guidance

## Purpose

Version 1 intentionally uses a precomputed phenomenological dose-efficiency
curve. This post-v1 research direction asks whether a later coagulation module
can make the underdose–optimum–overdose response emerge from a bounded chain of
aqueous chemistry and colloid electrokinetics:

    synthetic raw-water condition plus coagulant dose
      -> buffered pH and alkalinity response
      -> hydrolysis/precipitate regime surrogate
      -> charge-neutralization and sweep-floc contributions
      -> attachment efficiency
      -> the deterministic encounter-and-merge core

The educational objective is not to predict a plant dose. It is to show why a
useful condition can shift when a synthetic water's pH, alkalinity, charge
demand, or organic character changes.

## Authority and version boundary

- This document does not alter the accepted version 1 model, configuration hash,
  regression corpus, replay schema, batch plan, or release gate.
- Batches 07 through 11 must finish against the accepted version 1 authority.
- The Gaussian dose-response abstraction remains binding for version 1.
- No post-v1 chemistry state, command, instrument, label, or persistence field
  may enter version 1 as a convenient preview.
- A later implementation requires a separately authorized plan, new
  configuration/schema versions, side-by-side evidence, and explicit product-
  owner approval.
- This work remains a coagulation-specific teaching model. It does not authorize
  a universal FlowLab engine.

## Terminology

The proposed subject is primarily aqueous coagulation chemistry and colloid
electrokinetics. “Electrochemistry” alone is too broad.

Any initial charge, zeta, streaming-current, DOC, UV254, pH, alkalinity, dose,
or cost display must be labeled as a fictionalized teaching quantity unless a
later source-and-units review explicitly approves representative physical units.
No output may be presented as a setpoint, compliance decision, or recommended
chemical feed.

## Teaching claims worth pursuing

The research may attempt to teach:

- alum hydrolysis consumes alkalinity and can depress pH;
- coagulant dose and pH influence the relative importance of charge
  neutralization and hydroxide-precipitate sweep flocculation;
- insufficient destabilization can leave particles stable;
- excess dose can cause charge reversal and restabilization within an
  appropriate charge-neutralization regime;
- sweep floc can remain effective through precipitate enmeshment even when a
  charge-only explanation is insufficient;
- raw-water conditions can move or broaden the useful treatment region;
- mixing intensity changes encounter opportunity and, after explicit breakage
  exists, the balance between aggregation and floc damage;
- a streaming-current signal is an operational proxy whose useful target is
  established for a particular water and process, not universally zero;
- particle-clarity and organic-removal objectives can differ.

The research must not claim:

- a mechanistic charge-reversal model merely because a bell-shaped curve was
  replaced;
- that zeta potential alone determines collision efficiency;
- that one fractal-dimension direction applies to all coagulants, waters, shear
  histories, or measurement methods;
- that an SCD directly measures laboratory zeta potential;
- that one pH range, dose, SCD value, or treatment outcome transfers to a real
  facility;
- regulatory compliance, calibrated residuals, DBP formation, or operating
  guidance.

## Proposed model decomposition

### 1. Synthetic raw-water configuration

Start with a small versioned family of fictional waters rather than a free-form
chemistry editor. Candidate authoritative inputs are:

- initial pH;
- alkalinity or buffer capacity;
- ionic-strength proxy;
- particulate charge-demand proxy;
- representative particle concentration and size distribution;
- optional DOC and UV254 only in the later enhanced-coagulation extension.

Every configuration must be visibly fictional, deterministic, bounded, and
unconnected to facility data.

### 2. Alkalinity and buffered pH

Alum acidity may begin from a product-basis-specific stoichiometric alkalinity
consumption. The commonly cited hydrated-alum rule of approximately 0.45–0.5
mass units of alkalinity as CaCO3 per mass unit of alum is a starting check, not
the pH model.

pH must come from a bounded acid/base and carbonate-buffer calculation or an
equally justified equilibrium surrogate. It must not be computed as a fixed
linear pH decrement per dose. Tests must cover alkalinity conservation,
electroneutrality or the chosen reduced invariant, monotonic acid demand, finite
solutions, and low-buffer edge behavior.

### 3. Hydrolysis and precipitate-regime surrogate

Do not attempt a complete aluminium speciation solver first. Define the smallest
versioned surrogate that produces two independently inspectable quantities:

- charge-neutralizing capacity available to particle surfaces;
- hydroxide-precipitate/enmeshment capacity available for sweep floc.

Both may depend on dose and buffered pH. Their shapes and domains require
literature comparison against alum stability-diagram behavior. The surrogate
must fail closed outside its documented teaching domain.

### 4. Charge-neutralization attachment

Define a particle-charge or zeta proxy from native negative charge demand,
adsorbed positive capacity, pH, and any approved ionic-strength term.

The charge-neutralization attachment contribution may be informed by
DLVO/Fuchs stability-ratio reasoning, but a simple function of absolute zeta is
still a phenomenological surrogate. Collision efficiency also depends on
particle size, ionic strength, van der Waals attraction, hydrodynamics, and
surface chemistry. The implementation and public language must preserve that
distinction.

### 5. Sweep-floc attachment

Sweep floc requires a separate precipitate/enmeshment contribution. It cannot be
created by forcing the charge-neutralization attachment function to remain high
at large dose.

Research must compare separate or blended mechanism formulations and retain
diagnostics for each contribution. The final effective attachment probability
must remain bounded, deterministic, and inspectable.

### 6. Existing aggregation core

The accepted stable pair ordering, deterministic randomness, mass-conserving
merge operation, fixed-capacity storage, and projected-area optical-load
authority should be reused where their contracts remain valid.

The core is not assumed to be literally unchanged. Time-varying chemistry,
particle-dependent attachment, precipitate mass, morphology state, or breakage
would require explicit state and regression changes rather than hidden values in
rendering.

### 7. Regime-dependent morphology

Fractal dimension, density, strength, and regrowth behavior may differ across
coagulation mechanisms, but their direction is evidence-gated. Published
results are sensitive to water, coagulant, dose, shear history, and the fractal
measurement method.

No regime-specific Df value enters authoritative state until a research matrix
shows that it improves the intended lesson, preserves stable settling behavior,
and can be described without false physical precision. Rendered morphology may
remain a subordinate teaching cue.

### 8. G, encounter rate, and breakage

Mixing intensity may later affect an orthokinetic encounter term. Explicit
breakage must replace, not masquerade as, the version 1 growth bound before the
experience teaches a Camp-number trade-off.

Breakage requires deterministic fragments or erosion behavior, mass
conservation, population-health bounds, repeatability, and profiling. It must
not be smuggled into the existing maximum-mass rule.

### 9. Instruments

A laboratory charge/zeta teaching readout and a streaming-current detector may
consume the same authoritative chemistry state through separate documented
transforms.

- The laboratory readout represents the model's charge truth.
- The SCD represents a correlated process signal with lag, scale, offset, and
  water-specific target behavior.
- A useful SCD target is derived from the synthetic jar-test condition; it is
  not universally zero.
- Neither instrument calculates treatment independently.

### 10. Enhanced-coagulation extension

DOC/UV254 and the Edwards-style adsorption model are a separate extension after
the particulate mechanism is accepted. They are not “free” additions.

This extension would add a second treatment objective, organic-character inputs,
hydroxide adsorption capacity, pH dependence, new observables, and regulatory-
adjacent language. It requires its own safety review and may not score a single
universal “correct” treatment.

The EPA enhanced-coagulation framework concerns TOC removal for DBP-precursor
control and includes water-specific requirements, alternative criteria, jar
testing, and secondary effects. The application must not reduce it to a generic
recommended pH band.

## Staged research program

### R0 — Literature and claim matrix

- Acquire and review the primary sources below and any necessary corrections.
- Record each proposed equation, source domain, units, assumptions, and intended
  teaching claim.
- Separate established relationship, reduced surrogate, tuned parameter, and
  purely visual cue.
- Define the synthetic-water domain and explicit out-of-domain behavior.

Gate: every authoritative variable and arrow in the proposed chain has a source
or an explicitly labeled phenomenological rationale.

### R1 — Buffered pH and alkalinity notebook

- Implement a headless research prototype outside the production runtime.
- Test product-basis stoichiometry, carbonate buffering, low/high alkalinity,
  bounded pH, and deterministic reset.
- Compare against hand calculations and published examples.

Gate: pH emerges from the chosen buffer model and never from a fixed pH-per-dose
subtraction.

### R2 — Hydrolysis/regime surrogate

- Produce charge-neutralizing and precipitate-capacity surfaces over the
  approved synthetic dose/pH domain.
- Compare qualitative regions with established alum coagulation diagrams.
- Record uncertainty and out-of-domain exclusions.

Gate: charge neutralization and sweep are separately visible in diagnostics and
cannot be confused with one bell-shaped lookup.

### R3 — Attachment model

- Evaluate multiple defensible charge-attachment forms.
- Evaluate separate sweep-enmeshment forms.
- Test boundedness, monotonic subrelationships, deterministic ordering, and
  sensitivity to charge demand, pH, alkalinity, and ionic-strength proxy.

Gate: the selected formulation explains why its optimum moves and identifies
which parts remain phenomenological.

### R4 — Emergent response validation

- Integrate the research model with a copy of the accepted encounter/merge core.
- Run dose-by-water matrices across a versioned synthetic-water corpus.
- Retain the accepted version 1 default curve as historical comparison, not a
  target that the new model must reproduce exactly.
- Require low/useful/high separation for the default teaching water and
  explainable shifts for alternate waters.

Gate: no hidden configured optimum or output-specific correction recreates the
desired curve.

### R5 — Charge and SCD instrumentation

- Add read-only research views for laboratory charge truth and the distinct SCD
  proxy.
- Test scale, offset, lag, water-specific target selection, and comprehension.

Gate: reviewers understand that SCD is a correlated control signal, not direct
zeta truth or a universal zero target.

### R6 — Mixing and breakage

- Add G-dependent encounter behavior.
- Replace the growth bound only after a deterministic mass-conserving breakage
  design passes.
- Validate shear, size, strength, regrowth, population, and performance
  behavior.

Gate: the interaction teaches a real encounter-versus-breakage trade-off without
creating unstable populations or hidden mass.

### R7 — DOC/enhanced-coagulation study

- Add raw DOC and UV254/SUVA character only after R0–R5 are accepted.
- Reproduce the Edwards model in a standalone verified research implementation.
- Define particulate-clarity, organic-removal, pH, and chemical-use objectives
  without collapsing them into a universal answer.

Gate: the extension is educationally useful, source-verifiable, and cannot be
mistaken for regulatory or plant-specific guidance.

## Architecture consequences for a later implementation

- /src/sim would own all deterministic chemistry state and derived mechanism
  diagnostics.
- /src/app would validate new commands, own lifecycle/config selection, and
  version persistence/replay compatibility.
- /src/render would consume read-only chemistry and instrument views without
  deriving pH, charge, attachment, DOC removal, or setpoints.
- /src/xr would emit discrete validated commands only.
- Chemistry arrays, scalar state, and diagnostics would require documented
  allocation and performance budgets.
- Trial results and treatment ghosts would require new schema, raw-water,
  chemistry-model, phase, and optical-proxy compatibility metadata.
- The accepted version 1 schemas must remain readable or fail clearly; they may
  not be silently reinterpreted as mechanistic chemistry records.

## Safety and data boundary

- Use only public, licensed, self-created, or properly cited research material.
- Use fictionalized synthetic waters and no plant identifiers, operating
  records, SCADA values, or facility setpoints.
- Do not import real plant data to “calibrate” the teaching model.
- Do not label relative optical load as NTU.
- Do not present dose, pH, alkalinity, zeta, SCD, DOC, UV254, or cost outputs as
  recommended operations.
- Public descriptions must state that each link is qualitatively consistent
  with its cited model only within a bounded teaching domain.

## Minimum authorization packet for implementation

Before any production code begins, provide:

1. The R0 claim-and-source matrix.
2. Synthetic-water definitions and units decision.
3. Candidate equations with domains and failure behavior.
4. Side-by-side version 1 and research response surfaces.
5. Determinism, conservation, population, and performance risks.
6. Schema/replay migration plan.
7. Instrument-language and operating-guidance safety review.
8. A bounded implementation sequence approved by the product owner.

## Primary starting sources

- Duan, J. and Gregory, J. (2003), “Coagulation by hydrolysing metal
  salts,” Advances in Colloid and Interface Science 100–102, 475–502.
  https://doi.org/10.1016/S0001-8686(02)00067-2
- Amirtharajah, A. and Mills, K. M. (1982), “Rapid-mix design for
  mechanisms of alum coagulation,” Journal AWWA 74(4), 210–216.
  https://doi.org/10.1002/j.1551-8833.1982.tb04890.x
- Han, M. Y., Lee, H., Lawler, D. F., and Choi, S. (1997), “Collision
  efficiency factor in Brownian coagulation including hydrodynamics and
  interparticle forces,” Water Science and Technology 36(4), 69–75.
  https://doi.org/10.1016/S0273-1223(97)00420-4
- Chakraborti, R. K., Atkinson, J. F., and Van Benschoten, J. E. (2000),
  “Characterization of alum floc by image analysis,” Environmental Science &
  Technology 34(18), 3969–3976.
  https://doi.org/10.1021/es990818o
- Jarvis, P., Jefferson, B., Gregory, J., and Parsons, S. A. (2005), “A
  review of floc strength and breakage,” Water Research 39(14), 3121–3137.
  https://doi.org/10.1016/j.watres.2005.05.022
- Edwards, M. (1997), “Predicting DOC removal during enhanced coagulation,”
  Journal AWWA 89(5), 78–89.
  https://doi.org/10.1002/j.1551-8833.1997.tb08229.x
- US EPA (1999), Enhanced Coagulation and Enhanced Precipitative Softening
  Guidance Manual, EPA 815-R-99-012.
  https://www.epa.gov/dwreginfo/guidance-manuals-surface-water-treatment-rules

These sources establish a research starting point, not an approved equation set
or authorization to implement.
