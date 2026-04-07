# Console Alignment Report

Authority: working canon review
Updated: 2026-03-28

## Purpose

This report compares FireUX console files like-for-like by role so console canon, acceptable variance, and real drift are easy to inspect.

Strong rule:

Consoles may differ by scope, branding, and content, but not by core runtime mechanics.

## Scope Types

Current console scopes in active use:
- Project
- Kitchen
- Portfolio
- Supplier

These scopes share one console system but resolve different runtime entities.

## Canon

A console is the authenticated operational workspace for one active runtime scope.

Shared rules:
- Every console uses the shared console shell.
- Every console resolves an active runtime.
- Every console has an entry route and an overview route.
- Shared nav/meta conventions stay consistent.

Allowed variance:
- Scope
- Branding
- Wording
- Content
- Dev-only tooling

Disallowed drift:
- Duplicated runtime resolution logic
- App-specific console mechanics
- Inconsistent entry behavior

## Shared Shell

These files define the common console system used across scopes:

- Core console shell: `packages/core/fireux-core/src/runtime/layouts/console.vue`
- Core console root route: `packages/core/fireux-core/src/runtime/pages/console/index.vue`
- Console navbar: `packages/core/fireux-core/src/runtime/components/layouts/console/Navbar.vue`
- Console family helper: `packages/core/fireux-core/src/runtime/composables/fireux/app/routing/consoleRoutes.ts`
- Console nav helper: `packages/core/fireux-core/src/runtime/composables/fireux/app/routing/useConsoleNav.ts`
- Shared config baseline: `packages/core/fireux-core/src/config/app/fireux.config.ts`

## Like-for-Like Counterparts

### 1. Console Root Entry

Purpose:
- Redirect `/console` to the first available console family.

Canonical file:
- `packages/core/fireux-core/src/runtime/pages/console/index.vue`

Project override:
- `projects/fireux/fireux-app/app/pages/console/index.vue`

Status:
- Aligned in behavior.
- Shared shell and app-config-driven visibility model are consistent.

### 2. Scope Entry Routes

Purpose:
- Resolve the active runtime for a scope.
- Redirect to `overview` when a runtime exists.
- Redirect to `create` when no runtime exists.

Project scope:
- `packages/core/fireux-core/src/runtime/pages/console/projects/index.vue`

Kitchen scope canon:
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/index.vue`

Kitchen scope app override:
- `projects/misebox/misebox-app/app/pages/console/kitchen/index.vue`

Kitchen scope tenant override:
- `projects/misebox/niederhorn/app/pages/console/kitchen/index.vue`
- `projects/misebox/la-tap-berne/app/pages/console/kitchen/index.vue`

Portfolio scope:
- `packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/index.vue`

Supplier scope:
- `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/index.vue`

Status:
- Same responsibility across all scopes.
- Main page ownership is now consolidated by entity owner layer.

Important drift:
- Kitchen scope still has tenant/app wrappers that can drift from the extension-owned canon.
- Supplier runtime state is still less normalized than project, kitchen, and portfolio.

### 3. Scope Overview Routes

Purpose:
- Render the active runtime workspace.
- Use shared `layout: 'console'` and nav meta.
- Show scope-specific operational summary.

Project scope:
- `packages/core/fireux-core/src/runtime/pages/console/projects/overview.vue`

Kitchen scope canon:
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/overview.vue`

Kitchen scope app override:
- `projects/misebox/misebox-app/app/pages/console/kitchen/overview.vue`

Kitchen scope tenant override:
- `projects/misebox/niederhorn/app/pages/console/kitchen/overview.vue`
- `projects/misebox/la-tap-berne/app/pages/console/kitchen/overview.vue`

Portfolio scope:
- `packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/overview.vue`

Supplier scope:
- `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/overview.vue`

Status:
- Aligned in shape.
- Differences are mostly title text, wording, and dev-only output.

Acceptable variance:
- Tenant-specific heading text
- Scope-specific KPI cards
- Dev-only JSON/debug blocks

### 4. Scope Create Routes

Purpose:
- Provide creation flow when no runtime exists.

Project scope:
- `packages/core/fireux-core/src/runtime/pages/console/projects/create.vue`

Kitchen scope:
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/create.vue`

Portfolio scope:
- `packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/create.vue`

Supplier scope:
- `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/create.vue`

Status:
- Aligned in role.
- Scope-specific implementations are expected.

### 5. Runtime State Counterparts

Purpose:
- Persist the currently active runtime selection.

Project runtime state:
- `packages/core/fireux-core/src/runtime/composables/fireux/app/runtime-project/state.ts`

Kitchen runtime state:
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-console/useKitchenSelection.ts`

Portfolio runtime state:
- `packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-console/usePortfolioSelection.ts`

Supplier runtime model:
- Supplier is more profile-driven than explicit scope-state, so it is similar in intent but not yet shaped exactly like the other runtime-state files.

Status:
- Similar mental model.
- Not fully normalized across scopes.

## Drift Summary

### Real Drift

1. Duplicated kitchen entry logic

Files:
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/index.vue`
- `projects/misebox/misebox-app/app/pages/console/kitchen/index.vue`
- `projects/misebox/niederhorn/app/pages/console/kitchen/index.vue`
- `projects/misebox/la-tap-berne/app/pages/console/kitchen/index.vue`

Why it matters:
- Fixes must be repeated in four places.
- This is the clearest consolidation target.

2. Supplier runtime is less normalized than other scope runtimes

Files:
- `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/index.vue`
- `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/overview.vue`
- `packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/useSupplier.ts`

Why it matters:
- Supplier remains the least normalized console runtime stack.
- It still carries more family-specific runtime behavior than the other consoleable entities.

3. Console visibility is now config-driven and must stay documented that way

Files:
- `packages/core/fireux-core/src/config/app/fireux.config.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/app/routing/useConsoleEntryCta.ts`
- app `nuxt.config.ts` files

Why it matters:
- Route presence alone no longer decides which console families are visible.
- Apps must declare their visible console families explicitly.

Why it matters:
- Supplier behaves like a console scope, but the state/runtime resolution pattern is thinner and less parallel to project/kitchen/portfolio.

### Acceptable Variance

1. Tenant/app wording changes

Files:
- `projects/misebox/misebox-app/app/pages/console/kitchen/overview.vue`
- `projects/misebox/niederhorn/app/pages/console/kitchen/overview.vue`
- `projects/misebox/la-tap-berne/app/pages/console/kitchen/overview.vue`

2. Branding and theme differences

Files:
- `projects/fireux/fireux-app/app/app.config.ts`
- `projects/misebox/misebox-app/app/app.config.ts`
- `projects/misebox/niederhorn/app/app.config.ts`
- `projects/misebox/la-tap-berne/app/app.config.ts`
- `projects/cleanbox/cleanbox-app/app/app.config.ts`
- `projects/granite/granite-app/app/app.config.ts`

3. Dev-only debug output

Files:
- `projects/misebox/misebox-app/app/pages/console/kitchen/overview.vue`
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/overview.vue`

## Verdict

FireUX already has one console system.

The remaining issue is implementation duplication, not architectural confusion.

What is shared and solid:
- One shared console shell
- One shared console mental model
- Scope-based operational workspaces
- Consistent layout/nav/meta expectations

What still needs consolidation:
- Scope entry mechanics
- Kitchen entry duplication across package and tenants
- Some runtime-resolution normalization across project, kitchen, portfolio, and supplier

This is implementation duplication, not architectural confusion.

## Best Next Move

1. Lock this canon in a permanent doc.
2. Consolidate kitchen entry logic into one shared source of truth.
3. Use the kitchen entry cleanup to define the standard pattern for other scope entry files.
4. Leave overview wording and branding differences alone unless they begin affecting mechanics.
