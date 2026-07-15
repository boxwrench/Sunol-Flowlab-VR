# Contributing

Thank you for helping make drinking-water treatment concepts approachable.

## Before contributing

Read [the implementation-plan index](IMPLEMENTATION_PLAN.md), [architecture](docs/ARCHITECTURE.md), and [public-data boundary](docs/DATA_BOUNDARY.md). This project is an educational phenomenological model, not operational guidance or a calibrated treatment model.

## Development workflow

1. Use Node.js 24.12.x and npm 11.18.x.
2. Install with `npm ci`; do not hand-edit `package-lock.json`.
3. Keep changes within the `/sim`, `/render`, `/xr`, and `/app` dependency boundaries.
4. Add a targeted test for every behavior change.
5. Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` when those checks apply.
6. Keep simulation-tuning changes separate from dependency or XR-interaction changes.

Use public, licensed, or self-created references only. Do not submit real facility-sensitive material, proprietary operating values, official branding, or content implying endorsement.

## Reporting scientific or technical concerns

Open an issue describing the observed behavior, expected educational interpretation, reproduction steps, and supporting public source. Clearly distinguish a plausibility concern from a software defect. Do not include sensitive plant information.

By contributing, you agree that your contribution is provided under the repository's MIT License.
