# FireUX Console Canon

Updated: 2026-03-02
Status: single source of truth (console-only)

## Scope

This file defines FireUX console behavior only (`/console/**`).
Dashboard canon is intentionally out of scope.

## Hard Rules

1. Console is runtime-scoped and state-driven.
2. Console routes must not select runtime scope with `:id`.
3. No implicit or fallback runtime selection.
4. Legacy compatibility redirects are not used.

## Canonical Console Routes

### Hub

- `/console` -> `packages/core/fireux-core/src/runtime/pages/console/index.vue`

### FireUX App Runtime

- `/console/app` -> `packages/ecosystem/fireux-fireux/src/runtime/pages/console/app/index.vue`

### Granite Portfolio Runtime

- `/console/portfolio` -> `packages/ecosystem/fireux-granite/src/runtime/pages/console/portfolio/index.vue`
- `/console/portfolio/properties` -> `packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/properties.vue`
- `/console/portfolio/compliance` -> `packages/extensions/fireux-compliance/src/runtime/pages/console/portfolio/compliance.vue`
- `/console/portfolio/documents` -> `packages/extensions/fireux-documents/src/runtime/pages/console/portfolio/documents.vue`
- `/console/portfolio/tasks` -> `packages/extensions/fireux-tasks/src/runtime/pages/console/portfolio/tasks.vue`

### Misebox Kitchen Runtime

- `/console/kitchen` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/index.vue`
- `/console/kitchen/team` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/team.vue`
- `/console/kitchen/stations` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/stations.vue`
- `/console/kitchen/recipes` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue`
- `/console/kitchen/haccp` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/haccp.vue`
- `/console/kitchen/dishes` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/dishes.vue`
- `/console/kitchen/suppliers` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers.vue`
- `/console/kitchen/ingredients` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients.vue`
- `/console/kitchen/purchase-orders` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/purchase-orders.vue`
- `/console/kitchen/menu` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/menu.vue`
- `/console/kitchen/orders` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/orders.vue`
- `/console/kitchen/training` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/training.vue`
- `/console/kitchen/mise` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/mise.vue`

## Console Function Index

### Core Console Shell + Routing

- `useConsoleNav` -> `packages/core/fireux-core/src/runtime/composables/fireux/app/routing/presets.ts`
- `useDefaultNav` -> `packages/core/fireux-core/src/runtime/composables/fireux/app/routing/presets.ts`
- `useLandingNav` -> `packages/core/fireux-core/src/runtime/composables/fireux/app/routing/presets.ts`
- `useDevNav` -> `packages/core/fireux-core/src/runtime/composables/fireux/app/routing/presets.ts`

### FireUX App Runtime

- `useRuntimeApp` -> `packages/core/fireux-core/src/runtime/composables/fireux/app/runtime-app/useRuntimeApp.ts`

### Kitchen Runtime

- `useRuntimeKitchen` -> `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchen.ts`
- `useRuntimeKitchenSelection` -> `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/state.ts`
- `useRuntimeKitchenContext` -> `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenContext.ts`
- `useRuntimeKitchenDocument` -> `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenDocument.ts`
- `useRuntimeKitchenData` -> `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenData.ts`

### Portfolio Runtime

- `useRuntimePortfolio` -> `packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts`
- `useRuntimePortfolioSelection` -> `packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/state.ts`
- `useRuntimePortfolioContext` -> `packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolioContext.ts`
- `useRuntimePortfolioPath` -> `packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts`

### Ecosystem Console Nav Helpers

- `useKitchenConsoleNav` -> `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/routing/useKitchenConsoleNav.ts`
- `useGraniteConsoleNav` -> `packages/ecosystem/fireux-granite/src/runtime/composables/fireux/app/routing/useGraniteConsoleNav.ts`

## Console Layout Files

- `packages/core/fireux-core/src/runtime/layouts/console.vue`
- `packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-console.vue`
- `packages/ecosystem/fireux-granite/src/runtime/layouts/granite-console.vue`

## Change Log

- 2026-03-02: Canon switched to console-only scope (dashboard content removed from this file).
- 2026-03-02: Added route and function path index for all console surfaces.
