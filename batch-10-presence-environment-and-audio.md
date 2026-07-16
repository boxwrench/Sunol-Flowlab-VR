# Batch 10 Implementation Plan: Presence, Environment, and Audio

**Status:** Not started — predecessor gates remain open
**Depends on:** Core apparatus, instrumentation, readability, and spectator flow accepted  
**May run in parallel with:** Asset and audio preparation after Batch 03, but final integration occurs here  
**Primary gate:** The scene reads as a stylized drinking-water plant, preserves instrument dominance and parallax, and maintains the Quest performance target.

> This batch must also follow [the hybrid jar-test design direction](docs/DESIGN_DIRECTION_JAR_TEST_HYBRID.md). The design brief governs product intent and presentation meaning; this batch remains authoritative for timing, scope, tests, evidence, and acceptance.

## Goal

Add the minimum environmental and audio context needed for presence without turning the project into a plant walkthrough or spending the frame budget on scenery.

## Agent execution rules

- Read `CLAUDE.md`, the current repository tree, `package.json`, and relevant tests before proposing edits.
- Summarize the current architecture and any conflicts with this plan before writing code.
- Use one implementation owner per worktree. A second agent may review, but must not edit concurrently.
- Implement only this batch. Do not pull later-batch work forward because it appears convenient.
- Preserve the `/sim`, `/render`, `/xr`, and `/app` ownership boundaries.
- Keep simulation state outside React. Do not add React state updates to the hot simulation path.
- Report uncertainty instead of inventing package APIs, especially for the pinned `@react-three/xr` version.
- Produce evidence: changed files, commands run, test output, performance measurements where applicable, known limitations, and remaining hot-path allocations.
- Do not mark the batch complete until every acceptance criterion has objective evidence.

## Art-direction constraints

- Stylized low-poly modular geometry.
- Only what can be seen from the experiment station.
- The hero observation tank remains the primary visual; active control and selected canonical jar are secondary, followed by instruments, static jar summaries, and environment.
- Flat or lightly shaded materials.
- Baked/fake lighting; no dynamic shadows.
- Sparse textures and repeated modules.
- No locomotion or explorable facility.
- Optional panorama only after the low-poly foreground works.

## Workstream 10A - Modular environment kit

### Work package 10A.1 - Asset budget and scene composition plan

Before building assets, create a one-page plan covering:

- visible camera/head movement envelope;
- hero, near, middle, and distant zones;
- target draw-call allowance for the environment;
- material count;
- texture sizes and decoded-memory estimate;
- LOD or silhouette strategy;
- list of exact modules needed.

Reject any asset that is not visible or useful from the station.

### Work package 10A.2 - Grounding geometry

Build:

- real 3D floor around the table;
- nearby equipment base or deck;
- simple structural frame/columns;
- one short handrail/catwalk section.

Purpose: believable near-field parallax and scale reference.

### Work package 10A.3 - Process identity modules

Build a restrained set:

- large pipes and elbows;
- partial flocculation or sedimentation basin silhouette;
- one repeated pipe/column module;
- one distant pump, day tank, or process-skid silhouette only if it strengthens identity;
- sparse utility signage and indicator lights.

Merge or instance repeated geometry where practical.

### Work package 10A.4 - One slow mechanical element

Choose one:

- distant paddle/flocculator silhouette;
- slow mixer;
- subtle basin surface movement.

Requirements:

- low update cost;
- slow enough not to distract;
- can respond subtly to process phase if useful;
- no simulation claim beyond atmosphere.

## Workstream 10B - Audio and process-responsive atmosphere

### Work package 10B.1 - Event sounds

Add restrained sounds for:

- dose detent;
- start button;
- refill handle;
- tear-off sheet;
- measurement event;
- plot/gauge motion where useful.

Keep sounds short, mechanical, and consistent with stylized equipment.

### Work package 10B.2 - Process sounds

Add phase-linked layers:

- energetic rapid-mix texture;
- gentler flocculation motion;
- quieter settling ambience;
- brief measurement cue;
- refill water/mechanical cue.

No sound layer should be required to understand the process.

Audio may clarify authoritative events but must not imply better flocculation or clarity than the completed result produced.

### Work package 10B.3 - Ambient opening with clarity

Prototype a subtle ambience change as relative optical load falls, driven by the authoritative band record through a display/audio transform.

Requirements:

- subtle and non-literal;
- no second process state;
- smooth and allocation-free in the hot path;
- disabled if it distracts or sounds like a score mechanic.

## Workstream 10C - Lighting, materials, and final composition

### Work package 10C.1 - Lighting

- Use simple baked or fake lighting.
- Limit real-time lights.
- No dynamic shadows.
- Add a brief measurement lighting cue only if inexpensive.
- Preserve readable contrast on gauge, plot, labels, particles, and optical-load gradient.
- Preserve canonical jar labels and summaries without letting six jars overpower the hero tank.
- Drive any result-responsive light from authoritative optical load or completed-result data.

### Work package 10C.2 - Materials and palette

Use a restrained palette:

- concrete neutrals;
- muted industrial steel/pipe colors;
- controlled safety accent;
- warm or bright instrument accents;
- water/floc colors that remain distinct.

Prefer flat colors and one or a few shared materials over many unique textures.

### Work package 10C.3 - Apparatus placement and comfort

Revalidate:

- table height;
- seated/standing reach;
- instrument readability;
- background motion competition;
- no background geometry intersects controller space;
- head movement creates believable nearby parallax.

## Optional workstream 10D - Distant 360 panorama

Evaluate only after the low-poly scene passes.

Guardrails:

- monoscopic true 2:1 equirectangular image;
- distant scenery only;
- nearby floor, table, rails, tank, and controls remain real 3D;
- start around 4K and compress to KTX2/Basis;
- one shared `KTX2Loader`, `detectSupport(renderer)` once;
- preserve development void fallback;
- reject panorama if it harms labels, style, load time, or frame rate;
- no video panorama, stereo panorama, photogrammetry runtime scene, splats, or depth reconstruction.

## Work package 10E - Performance simplification pass

Profile after each environment layer. When budget is exceeded, simplify in this order:

1. remove unseen geometry;
2. reduce unique materials and draw calls;
3. remove decorative transparent elements;
4. disable dynamic or phase-linked background motion;
5. reduce texture resolution/compress assets;
6. reduce distant detail or replace with silhouette;
7. reject panorama;
8. only then reconsider core apparatus visuals.

Do not sacrifice the treatment loop to preserve scenery.

## Explicit non-goals

- No walkthrough or locomotion.
- No accurate reconstruction of a real facility.
- No dynamic shadows, realistic water, refraction, caustics, or post-processing.
- No decorative machinery outside the station view.
- No complex asset pipeline.
- No future FlowLab shared environment package yet.

## Required tests and evidence

- before/after Quest profiles for each major environment layer;
- draw-call/material/triangle/texture audit;
- label and instrument contrast screenshots;
- seated/standing comfort check;
- spectator-mode readability check;
- audio permission and mute behavior;
- KTX2 loader reuse test if panorama exists;
- final public-data/provenance review of every asset.

## Review-agent checklist

- Does the scene immediately read as water treatment?
- Does every asset contribute identity, parallax, or atmosphere?
- Are instruments still dominant?
- Is any geometry copied from sensitive real-facility material?
- Are materials, lights, and draw calls restrained?
- Does audio support rather than explain the loop?
- Was the panorama rejected when it failed to add real value?
- Does Quest still maintain the performance target?

## Acceptance criteria

- Scene feels like a small window into a stylized drinking-water plant.
- Real near-field geometry creates believable parallax.
- Instruments, tank, floc, and clearing front remain legible.
- Hero-tank dominance and the canonical-preset meaning of the jar rack survive final lighting and materials.
- Audio and lighting never communicate an outcome that disagrees with the authoritative result.
- Audio adds tactile and process feedback but is not required for comprehension.
- Environment remains intentionally sparse and non-explorable.
- Quest sustains the required performance target with documented final metrics.
- No restricted or misleading real-plant content is present.

## Suggested commit

`feat: add low-poly plant presence and restrained process audio`

## Required closing acceptance packet

The implementation agent must provide:

1. What changed.
2. What intentionally did not change.
3. Files added, removed, and modified.
4. Commands run and exact results.
5. Dose-sweep comparison when simulation behavior changed.
6. Desktop or Quest metrics when rendering or XR behavior changed.
7. Known defects, compromises, and deferred decisions.
8. Remaining allocations or expensive operations in per-frame paths.
9. Documentation updated.
10. Proposed commit message and whether the batch gate passed.
