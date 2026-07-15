# Batch 11 Implementation Plan: Release Hardening and Deployment

**Status:** Planned  
**Branch:** `batch-11-release`  
**Depends on:** All prior batch gates accepted  
**May run in parallel with:** Independent release review and documentation verification only  
**Primary gate:** A reproducible public release works on Quest, desktop, and mobile fallback, preserves the accepted dose-response behavior, contains no development or sensitive material, and can be rolled back safely.

## Goal

Freeze the accepted feature set, prove the complete system under release conditions, deploy it, document it, and preserve known-good artifacts.

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

## Release freeze rules

After this batch begins:

- no new features;
- no dependency upgrades unless required to fix a release blocker;
- no simulation retuning without full regression review and explicit baseline approval;
- no environment additions;
- every code change must map to a documented release defect;
- release candidate builds are immutable and identified by commit hash.

## Work package 11.1 - Release inventory and blocker triage

Create a checklist of:

- accepted batch gates and tags;
- known defects;
- deferred decisions;
- browser/device support matrix;
- public assets and provenance;
- environment variables and host configuration;
- persistence schema version;
- accepted simulation config hash and dose-sweep baseline.

Classify defects:

- release blocker;
- accepted limitation;
- post-release enhancement.

## Work package 11.2 - Full automated validation

Run from a clean checkout:

- dependency install from lockfile;
- lint/format verification;
- typecheck;
- all unit tests;
- integration tests;
- state-machine tests;
- persistence/migration tests;
- browser smoke tests;
- production build;
- static-host preview test.

Archive command output with the release candidate.

## Work package 11.3 - Final simulation regression

Run:

- canonical 11-dose sweep;
- extended seed-corpus sweep;
- reset/hysteresis test;
- authority-consistency tests;
- runtime ceiling test;
- pre-release comparison against accepted baseline.

Generate release artifacts:

- JSON/CSV curve data;
- human-readable curve image or table;
- config hash;
- commit hash;
- test summary.

Any intentional baseline change requires product-owner approval and updated `docs/TUNING.md`.

## Work package 11.4 - Device and browser release matrix

Test the final hosted candidate on:

- target Quest model and current Quest Browser;
- primary desktop browser;
- secondary desktop browser;
- mobile browser;
- XR unsupported path;
- XR permission denied path;
- audio autoplay denied path;
- persistent data present, absent, corrupt, and future-version cases.

For each, record:

- load success;
- time to first meaningful visual;
- spectator demo completion;
- Enter VR behavior where supported;
- full trial completion;
- persistence and clear-sheet behavior;
- console errors;
- screenshots/video.

## Work package 11.5 - Final Quest performance and endurance

Capture:

- average FPS and frame time;
- p95 frame time;
- simulation time;
- instance upload time;
- active particle count and merge peaks;
- draw calls;
- heap trend/allocation spikes;
- texture sizes and decoded memory estimate;
- load time;
- headset/browser/build versions.

Run:

- five-minute idle;
- repeated full-session experiment loop;
- spectator-to-XR transition and back;
- multiple refills and plot clears;
- session interruption/re-entry.

No unbounded memory growth or progressive performance degradation is acceptable.

## Work package 11.6 - Security, data, and branding audit

Verify:

- no internal documents, tags, layouts, screens, values, metadata, or restricted imagery ship;
- no official logo or endorsement claim appears without approval;
- public copy uses “phenomenological coagulation model” and “personal educational portfolio project”;
- AI-generated and third-party assets have recorded provenance/license status;
- source maps, environment variables, and debug endpoints expose no secrets;
- no live SCADA, intranet, or operational connectivity exists;
- analytics, if any, are documented and privacy-appropriate.

## Work package 11.7 - Production polish audit

- Remove or gate tuning panel and development metrics.
- Remove debug controls, console spam, emulator-only elements, and test routes from public navigation.
- Confirm physical clear-sheet action works for inherited data.
- Confirm spectator mode is the root fallback.
- Confirm Enter VR is obvious where supported.
- Verify labels and controls remain readable after production compression.
- Check error and unsupported states are user-friendly.

## Work package 11.8 - Documentation completion

Update:

- `README.md`: setup, HTTPS development, test, build, deploy, desktop/Quest use;
- `CLAUDE.md`: final pinned versions and architecture authority;
- `docs/DECISIONS.md`: only real resolved forks;
- `docs/TUNING.md`: accepted constants, curve, visual behavior, baseline approval;
- `docs/PERFORMANCE.md`: final device/browser metrics and trace notes;
- `docs/DATA_BOUNDARY.md`: final review date and asset provenance location;
- `CHANGELOG.md`: user-visible milestones only.

Add troubleshooting for:

- XR unavailable;
- session entry failure;
- remote debugging;
- corrupt experiment data;
- local HTTPS setup.

## Work package 11.9 - Deployment and rollback

- Deploy immutable release candidate.
- Verify production URL and asset caching.
- Confirm route behavior and base paths on the chosen host.
- Record deployment ID and commit hash.
- Define rollback to the previous known-good deployment.
- Preserve the accepted desktop proof and final spectator recording.
- Preserve the last accepted dose-sweep artifacts.

## Work package 11.10 - Tag and release notes

After product-owner approval:

- tag `release-candidate` if not already present;
- tag `v1.0.0` on the accepted commit;
- create concise release notes describing the actual shipped loop;
- list known limitations honestly;
- do not advertise deferred features.

## Release blockers

The release cannot proceed with:

- failing dose-sweep contract;
- discrepancy between visible water, gauge, plot, or stored result;
- inability to clear inherited plot data;
- unresolved memory growth;
- Quest performance below the accepted target;
- root URL failing without XR;
- development tuning chrome exposed publicly;
- sensitive or unapproved branding/material;
- non-reproducible build or missing lockfile.

## Independent review checklist

- Can a new visitor understand the desktop experience without instructions?
- Can a Quest user enter VR, choose a dose, run, measure, plot, refill, and repeat?
- Is the U-shaped curve still present and discoverable?
- Are all public claims appropriately phenomenological?
- Do automated and device tests match the release commit?
- Are performance results measured on the real target device?
- Can the deployment be rolled back?
- Are future features absent from release notes and code paths?

## Acceptance criteria

A new visitor can:

1. open the root URL;
2. understand the experiment in desktop spectator mode;
3. enter VR where supported;
4. set one of 11 doses;
5. run the full treatment cycle;
6. see floc form and settle;
7. see clear water move downward;
8. receive a consistent measurement;
9. record and persist a plot point;
10. refill identical raw water and repeat;
11. clear the experiment log physically;
12. discover the U-shaped dose-response curve.

Additionally:

- all tests pass from a clean checkout;
- final Quest performance and endurance gates pass;
- no restricted material or development chrome ships;
- docs, artifacts, deployment record, rollback plan, and release tag are complete.

## Suggested tags and commit

- Commit: `release: harden and deploy Sunol FlowLab VR Coagulation v1.0.0`
- Tags: `release-candidate`, then `v1.0.0`

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
