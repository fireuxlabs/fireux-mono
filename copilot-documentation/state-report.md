# FireUX Mono — State Report (2025-09-05)

Scope for this report

- Focus: packages and apps first, then App object, Core user/App user, and Profiles.
- Out of scope (deferred): “objects” domain (e.g., Dish, Ingredient, etc.), unless needed to unblock packages/apps.

## Executive summary

- Composables are auto-imported across all packages. Models are explicit-import only. Enforced via ESLint + CI guard. Done.
- `configureModels` calls removed from all modules (core/tenants/extensions). Kept as no-op only where we may later emit global .d.ts. Done.
- Path aliases exist for all model namespaces (core, tenants, jobs, places). Missing core alias for Misebox was added. Done.
- Package typecheck: extensions (jobs/places) pass after small ambient shims. Misebox still has some type refs under “objects” (deferred per scope). Partial.
- App typecheck: currently failing on Nuxt app globals and @nuxt/content types. Straightforward fix: add Nuxt types to app tsconfigs and install/use @nuxt/content only where needed. Pending.

## Packages snapshot (current wiring)

- fireux-core
  - Composables: auto-imported (runtime/composables/\*\*). Key: `useApp`, `useAppUser`.
  - Models: explicit via `#fireux-core-models/*` (e.g., `core/app.model.ts`, profiles contracts).
  - Module: `configureModels` removed; components/layouts/pages/server/plugins/runtime intact.
  - Consumers (apps/tenants/extensions) get `useApp` and `useAppUser` via auto-import at runtime.

- fireux-jobs (extension)
  - Composables: auto-imported. Ambient `env.d.ts` added to make `useApp`, `useAppUser`, `useObject`, etc., visible to isolated tsc.
  - Models: explicit via `#fireux-jobs-models/*`.
  - Module: `configureModels` removed (no model auto-import).

- fireux-places (extension)
  - Composables: auto-imported. Ambient `env.d.ts` added for browser `google` to satisfy Places API composables.
  - Models: explicit via `#fireux-places-models/*`.
  - Module: `configureModels` removed.

- Tenants (fireux-fireux, fireux-misebox, fireux-cleanbox)
  - Composables: auto-imported; models not auto-imported.
  - Models: explicit via `#fireux-*-models/*`. Misebox also has `#fireux-core-models/*` alias to use core types where needed.
  - Module: `configureModels` removed; layouts/pages/plugins/server/runtime as aligned previously.

## Apps snapshot (typecheck + Nuxt globals)

- Current `pnpm -w typecheck:apps` status: FAIL due to
  - Missing Nuxt global typing for `defineAppConfig` in `app/app.config.ts`.
  - Missing `@nuxt/content` types in `content.config.ts` where imported.
- Quick fixes to align apps
  - In each app tsconfig (projects/_/_/tsconfig.json), add:
    - `compilerOptions.types: ["nuxt", "nuxt/schema"]` (and any app-used modules, e.g., `@nuxt/content` if present).
  - If `@nuxt/content` is actively used by the app: add it to the app’s dependencies and ensure its types are included.
  - If `@nuxt/content` is not required: remove/comment its import(s) in `content.config.ts` to pass typecheck.

## App object (useApp): interplay & scope

- Source of truth
  - Interface: `#fireux-core-models/core/app.model.ts` (core models).
  - Composable: `packages/core/fireux-core/src/runtime/composables/app/useApp.ts`.
- Behavior
  - Provides `app`, `apps`, `isInitialized`, and helpers (e.g., `updateDescription`, `updateSocialLinks`, `updateAdmins`).
  - Reads app identity from runtime config (appId) and Firebase to orchestrate app-level data.
- Scope
  - Runtime: auto-imported for apps/tenants via core module.
  - Packages: extensions that reference it during isolated tsc rely on small `env.d.ts` shims (no deep imports) — keeps packages decoupled.

## Core user + App user (useAppUser): interplay & scope

- Source of truth
  - Composable: `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser.ts`.
- Behavior
  - Exposes `appUser`, `isAppUser`, `hasProfile`, `ensureAppUser`, and updates for app-user profile data. Integrates Firebase auth and app config.
- Scope
  - Runtime: auto-imported via core module; used in core header/dashboard guards, tenant layouts, and feature pages.
  - Packages: ambient shims in extensions (e.g., jobs) make it visible to typecheck without deep imports.

## Profiles: interplay & scope

- Base contracts live in core (e.g., `Profile`, `ProfileConfig` under core models). These are imported explicitly via `#fireux-core-models/*`.
- Domain profiles live in their owning package (e.g., `Employer` in jobs) and are imported via their package alias (e.g., `#fireux-jobs-models/*`).
- Composables like `useProfile` are in core and are consumed by packages/apps by passing the appropriate profile config.
- Models are never auto-imported; all packages use explicit-imports via aliases (enforced).

## Guardrails & conventions

- ESLint: flat config rule blocks any `addImportsDir(.../runtime/models)` within `src/config/**/*.ts`.
- CI guard: `tools/scripts/guard-model-autoimport.sh` (wired as `pnpm guard:models`) prevents model auto-import regressions.
- Aliases maintained in each package’s `tsconfig.json` for its own models and referenced packages.

## Gaps and follow-ups (packages/apps only; profiles minimal; objects deferred)

1. Apps
   - Add Nuxt types to each app’s tsconfig: `types: ["nuxt", "nuxt/schema"]`.
   - Resolve `@nuxt/content`: install and include types where used, or remove/guard usage if not needed.
2. Profiles (minimal)
   - Where tenant/extension profile files reference non-existent local shared types, switch to explicit imports from core via `#fireux-core-models/*`.
   - Keep “objects” migration for later as agreed.
3. Package ambient shims
   - If any other package’s isolated tsc complains about runtime auto-imported composables, add a focused `src/runtime/env.d.ts` similar to jobs/places.

## Acceptance checks

- Packages
  - pnpm -w build:packages → PASS (recent runs green).
  - pnpm -w typecheck:packages → PASS for core/jobs/places; Misebox shows remaining “objects” model refs (deferred). Expected Partial.
- Apps
  - pnpm -w typecheck:apps → FAIL due to Nuxt globals and `@nuxt/content` types. Should PASS after adding types and resolving content usage.
- Guardrails
  - pnpm run guard:models → No forbidden model auto-imports found.
  - eslint . → enforces no model auto-imports in src/config.

## What changed recently (high level)

- Removed all `configureModels` imports/calls in modules (core/tenants/extensions).
- Standardized `configureComposables` to only auto-import `./runtime/composables/**`.
- Added ESLint rule + CI guard to prevent model auto-imports.
- Added ambient shims for jobs/places (and minimal for misebox) to fix isolated package typechecks.
- Added `#fireux-core-models/*` alias to Misebox package.

## Next actions (small, high-signal)

1. Apps: add Nuxt types to tsconfig and decide on `@nuxt/content` usage (install or remove).
2. Profiles-only cleanup in Misebox: replace any legacy shared-type imports with core model aliases (skip objects).
3. Re-run typechecks; expect apps PASS, packages PASS except deferred objects.

— End of report —
