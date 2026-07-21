# Batch 12 Implementation Plan: California-First Reference Library

**Status:** Candidate — implementation and desktop interaction pass; seated Quest review pending  
**Depends on:** Released v0.1.0 baseline  
**Release target:** Post-v0.1 / v0.2 candidate

## Goal

Add a compact physical reference library to the operator's left without
changing the coagulation model or treatment loop. A two-shelf wood bookcase is
angled toward the seated origin; four clickable instructional books open one
temporary in-world reader:

1. Coagulation & Flocculation
2. How Jar Testing Works
3. Interpreting Jar-Test Results
4. Enhanced Coagulation

The reader supplies concise original text, bounded paging, a visible source
citation, a source link, and a Close action.

## Source authority

Use California public-sector drinking-water material first. Use AWWA only when
the material is publicly accessible or permission permits inclusion. Use EPA
for the federal enhanced-coagulation treatment technique.

The complete source and inclusion record is
[REFERENCE_LIBRARY_SOURCES.md](../REFERENCE_LIBRARY_SOURCES.md). No commercial
book pages, subscription video, or third-party media are copied into the app.

## Architecture

- `src/app/referenceLibrary.ts` owns immutable reference content, validated
  discrete commands, selected-book state, and bounded page navigation.
- `src/app/XrShellApp.tsx` owns the current selection and external source
  action.
- `src/render/ReferenceLibrary.tsx` owns the instanced bookcase, physical book
  volumes, reader geometry, generated text textures, and pointer presentation.
- `src/sim` and the authoritative relative-optical-load record do not change.
- Reference selection never pauses, advances, or mutates the treatment cycle.

## Interaction

- Look left for the labeled bookcase, point at any instructional book cover,
  and press Select.
- Use Back and Next to move through three short pages.
- Use Source to open the cited public document in a normal browser context.
- Use Close to remove the reader and restore the unobstructed laboratory.
- Selecting another book replaces the current reader content and returns to
  page one.

The reader is intentionally centered and close while open. It temporarily
covers part of the apparatus because reading is the active task; it is not a
persistent floating control panel.

## Explicit non-goals

- No model retuning or new process mechanics.
- No operating instructions or dose recommendations.
- No copied textbook content.
- No paid or subscription AWWA media.
- No generalized document browser, PDF renderer, webview, or content-management
  system.
- No bundled video until a relevant source has confirmed redistribution and
  playback rights.

## Automated evidence

- Unit tests cover the four-book catalog, command validation, paging bounds,
  and close/reset behavior.
- Browser coverage opens Enhanced Coagulation, reaches the last page without
  overflow, rejects the removed Model Limitations identifier, and closes.
- The required bundled browser client exercises real canvas selection, paging,
  and Close input while checking rendered state and console errors. Screenshot
  inspection confirms the revised bookcase reads as a distinct left-side
  library and keeps the reader centered while open.
- The production build and existing treatment-cycle regressions must remain
  green.

## Human acceptance gate

In one seated Quest session, confirm:

1. all four books are visible as a separate reference area;
2. controller pointing can open each book;
3. page body text and source attribution are comfortable to read;
4. Back, Next, Source, and Close are understandable and reachable;
5. the temporary reader placement is acceptable;
6. closing restores the existing treatment view;
7. normal dose, Start, scenery, mute, and refill interactions remain intact.

Batch 12 is accepted only after the owner supplies this headset verdict.
