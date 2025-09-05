# Composables vs Models Report

Date: 2025-09-05

## Executive summary

- Models are domain data contracts (interfaces, types, and small config objects). They are imported explicitly and should not be auto-imported.
- Composables are behavior units (CRUD, computed helpers, routing, admin metrics) intended for Nuxt auto-import.
- Recommendation: keep models as a standalone runtime folder (`runtime/models`) with path aliases for developer ergonomics, and limit auto-import to `runtime/composables/**` only.

## Inventory (current state in repo)

### Core (packages/core/fireux-core)

- runtime/models: profile.model.ts, product.model.ts, core/_.model.ts, objects/_.model.ts, utils/\*.ts
- runtime/composables: extensive CRUD and domain helpers across app, admin, firestore, firebase, etc.
- Config: core module auto-imports composables; models are not auto-imported (aligned).

### Tenants

- fireux-misebox: many models under runtime/models (core/MiseApp.model.ts, objects/_.model.ts, profiles/_.model.ts). Composables under runtime/composables/\*\*.
- fireux-cleanbox: currently no models in repo; has route composables.
- fireux-fireux: no models at present.

### Extensions

- fireux-jobs: models under runtime/models (Job.model.ts, profiles/\*.model.ts) and many composables.
- fireux-places: models and composables present.

## Usage patterns observed

- Models primarily export TypeScript interfaces/types and small config constants (e.g., `recipeConfig`).
- Composables depend on models for typing but not vice versa. Example: useJobs.ts defines `ObjectConfig` locally and returns CRUD hooks; Job.model.ts defines the data shape only.
- Some files duplicate minimal FirestoreObject shape locally to avoid deep imports.

## Decision and alignment strategy

1. Treat models as standalone (not auto-imported)

- Pros: clear boundary, avoids polluting Nuxt auto-import space, no accidental tree-shaking surprises, explicit imports improve readability.
- Cons: developers must import types explicitly; mitigated with path aliases.

2. Auto-import composables only

- Keep only:
  - addImportsDir(resolver.resolve('./runtime/composables'))
  - addImportsDir(resolver.resolve('./runtime/composables/\*\*'))
- Remove `addImportsDir('./runtime/models')` across tenants (done) and core/jobs (done).

3. Provide path aliases for models

- In each package tsconfig.json, expose `#<pkg>-models/*` to `./src/runtime/models/*`.
- Already present: misebox, cleanbox, places, jobs, core. Added now: fireux-fireux.

4. Documentation

- Make this policy explicit in `copilot-documentation/composables-model-report.md` and reference in the tenants alignment doc.

## Acceptance checks to validate policy

- Typecheck passes across all packages with models imported explicitly when used.
- No auto-imported model types in `.nuxt/imports.d.ts` or components.d.ts.
- Dev UX: editor resolves aliases `#fireux-*-models/*` without relative deep paths.

## Next steps (follow-up PR)

- Sweep for any composables relying on previously auto-imported model types and switch them to explicit imports using the aliases.
- Add an ESLint rule or a small guard script to flag `addImportsDir('./runtime/models')` usage in any package to prevent regressions.
