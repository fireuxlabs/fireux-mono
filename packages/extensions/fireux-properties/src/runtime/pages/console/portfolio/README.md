# Console Portfolio Pages

Authority: Operational
Updated: 2026-03-28
Scope: `packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/*`.

This folder owns the operational portfolio console workspace.

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for the shared console-entry concept.
This README only explains the portfolio-console delta.

## Current Routes

- `index.vue`
- `overview.vue`
- `create.vue`
- `test.vue`
- `read-only/index.vue`
- `read-only/[scenarioId].vue`
- `clients.vue`
- `finance.vue`
- `incidents.vue`
- `properties.vue`

## Local Contract

- this folder is operational, not public
- `Portfolio` owns the console route family because it is the portfolio domain runtime anchor
- apps must opt into portfolio visibility through `consoleFamilies`
- `index.vue` is the family-specific chooser in console shell
- `create.vue` belongs to the console create family
- `overview.vue` is workspace delivery
- child routes stay portfolio-scoped even when Granite adds branding and shell framing around them

Portfolio-console delta:
- console create ensures `apps/<appId>/portfolios/<portfolioId>`
- console create creates the root portfolio first when missing
- console create seeds console authority for the current user
- operational child records stay under `apps/<appId>/portfolios/<portfolioId>/...`

## Short Version

This folder is the portfolio-console half of the shared console-entry concept.
Treat Granite as delivery shell, not as the owner of portfolio console truth.
