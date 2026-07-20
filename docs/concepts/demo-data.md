Demo Data spine map
Updated: 2026-07-20
Ref: 8d83d3fa7
Role: map, not canon
<!-- Concurrent edit — 2026-07-20 17:05 CEST — Demo Data Spine pass: map optional console fixtures and their loading boundary. -->

Purpose:
Map the optional read-only data used to exercise consoles without touching a
real or simulation database.

Vertical links:
- Parent: console.md
- Child: firestore-entity.md

Horizontal links:
- entities.md
- debug.md
- runtime-package.md

Current contract:
- Demo Data is a console source, not canonical storage, public content, dev
  preview content, test data, or simulation data.
- A fixture follows the current real entity/record shapes. Real models and
  adapters are authority; the application must never bend around a fixture.
- Reusable fixtures live with their package under `src/runtime/demo`.
- App-only fixtures live with their project under `app/demo`.
- An owning console composable adapter loads fixtures with a dynamic import and
  `useConsoleDemoData`; inactive consoles do not import or evaluate them.
- `useConsoleDemoData` caches a successful local load and exposes
  `idle`, `pending`, `error`, `empty`, or `ready` without remote work.
- Demo is read-only. Fixture modules do not depend on Firestore, Storage,
  Firebase Admin, server code, public adapters, or mutation code.
- Test and simulation sources remain separate because they are allowed to
  exercise writes. Dev fixtures remain with authenticated dev tooling.

Authority and refresh:
- Entity models, DTOs, and console adapters define current shapes.
- `scripts/guards/demo-data.mjs` enforces location, deferred loading, consumer,
  ownership, and dependency boundaries.
- Refresh fixtures in the same change when a real shape used by Demo changes.

Verification:
- Run the Demo Data guard through `pnpm guard`.
- Typecheck every owning package or app whose fixtures or adapters changed.
- Verify an inactive console reports `idle` and does not invoke its loader.
