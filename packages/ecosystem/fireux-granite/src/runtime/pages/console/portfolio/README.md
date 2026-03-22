# Console Portfolio Pages

Authority: Operational
Updated: 2026-03-22
Scope: `packages/ecosystem/fireux-granite/src/runtime/pages/console/portfolio/*`.

This folder owns the operational portfolio console workspace delivered through Granite.

## Current Routes

- `index.vue`
- `overview.vue`
- `create.vue`
- `dev.vue`

## Local Contract

- this folder is operational, not public
- `create.vue` belongs to the console create family
- `overview.vue` and `index.vue` are workspace entry surfaces
- `dev.vue` is local development support and not part of route canon

Console creation canon:
- ensure `/apps/<appId>/portfolios/<portfolioId>`
- create the root portfolio first when missing
- act as the operational onboarding path for portfolios

## Aligned With

Console create family examples:
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/create.vue`
- `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/create.vue`

## Not Aligned Yet

- create-system props and return flows still vary by console
- Granite currently owns this console delivery, which is acceptable, but still means the portfolio create surface is not packaged beside the base portfolio public pages
- current portfolio create still shares the same create system as the public portfolio route
- current runtime writes the root portfolio record, but explicit app overlay behavior is not yet separated clearly in the implementation

## Short Version

This folder is the portfolio console workspace.
Treat `create.vue` as the console ensure-create example, and keep the rest as portfolio-specific operational delivery.
