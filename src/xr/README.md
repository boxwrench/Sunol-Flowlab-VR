# XR module

This directory owns XR sessions and physical-input adapters. It may emit only
the discrete commands defined by `src/app/commands.ts` or development-only
preflight facts consumed by `src/app`; it must not import simulation
internals.

The local and hosted seated Quest 3 routes, physical controls, corrected player
origin, and bounded repeat-cycle/re-entry check are accepted. Final media and
release publication remain outside this module.
