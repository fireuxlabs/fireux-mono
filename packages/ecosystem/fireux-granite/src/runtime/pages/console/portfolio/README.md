# Console Portfolio Pages

Authority: Operational
Updated: 2026-03-26
Scope: `packages/ecosystem/fireux-granite/src/runtime/pages/console/portfolio/*`.

This folder owns the operational portfolio console workspace delivered through Granite.

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for the shared console-entry concept.
This README only explains the portfolio-console delta.

## Current Routes

- `index.vue`
- `overview.vue`
- `create.vue`
- `dev.vue`

## Local Contract

- this folder is operational, not public
- Granite owns this page delivery shell
- `Portfolio` remains the domain runtime anchor beneath that shell
- `index.vue` is the family-specific chooser in console shell
- `create.vue` belongs to the console create family
- `overview.vue` is workspace delivery
- `dev.vue` is local development support and not part of route canon

Portfolio-console delta:
- console create ensures `apps/<appId>/portfolios/<portfolioId>`
- console create creates the root portfolio first when missing
- console create seeds console authority for the current user
- portfolio children should read as one portfolio-scoped console system even when delivered through Granite
- Granite should handle branding and shell concerns, not redefine portfolio domain truth

## Short Version

This folder is the Granite-delivered portfolio console workspace.
Treat it as shell delivery for the `Portfolio` console, not as a separate Granite domain model.
