# Portfolios Pages

Authority: Operational
Updated: 2026-03-22
Scope: `packages/extensions/fireux-properties/src/runtime/pages/portfolios/*`.

This folder owns the public `Portfolio` route tree.

## Current Routes

- `index.vue`
- `create.vue`
- `learn-more.vue`

## Local Contract

- `index.vue` and `learn-more.vue` are public portfolio pages
- `create.vue` is the public root-create page for `Portfolio`
- `console/portfolio/create.vue` is the operational console create page

Console creation canon:
- public create makes the root portfolio record
- console create ensures the app portfolio overlay and may create root first when missing

## Aligned With

Public console root-create examples:
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/create.vue`
- `packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/create.vue`

## Not Aligned Yet

- public and console portfolio create still reuse the same create system
- current portfolio creation writes the root portfolio record, but the explicit app overlay behavior is not yet separated cleanly at the page level
- this public folder does not yet have a portfolio detail route

## Short Version

Treat `portfolios/create.vue` as the public root-create page for the portfolio console.
The console route should own overlay enablement.
