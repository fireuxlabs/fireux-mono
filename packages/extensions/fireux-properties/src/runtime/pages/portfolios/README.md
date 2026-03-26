# Portfolios Pages

Authority: Operational
Updated: 2026-03-26
Scope: `packages/extensions/fireux-properties/src/runtime/pages/portfolios/*`.

This folder owns the public `Portfolio` route tree.

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for the shared console-entry concept.
This README only explains the portfolio delta.

## Current Routes

- `index.vue`
- `create.vue`
- `learn-more.vue`

## Local Contract

- `index.vue` and `learn-more.vue` are public portfolio pages
- `create.vue` is the public root-create page for `Portfolio`
- `console/portfolio/create.vue` is the operational console create page

Portfolio-specific delta:
- the public index can browse portfolios and also enter the same chooser used by `/console/portfolio`
- public create creates or ensures `portfolios/<id>`
- public create does not ensure `apps/<appId>/portfolios/<id>`
- Granite remains the console shell, but `Portfolio` stays the domain runtime anchor

## Short Version

This folder owns the public portfolio side of the shared console-entry concept.
Its delta is:
- public discovery
- public portfolio create
- portfolio is the runtime anchor even when Granite owns the console shell
