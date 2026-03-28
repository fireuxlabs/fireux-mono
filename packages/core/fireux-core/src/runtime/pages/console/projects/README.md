# Console Project Pages

Authority: Operational
Updated: 2026-03-28
Scope: `packages/core/fireux-core/src/runtime/pages/console/projects/*`.

This folder owns the main project console workspace.

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for the shared console-entry concept.
This README only explains the project-console delta.

## Current Routes

- `index.vue`
- `overview.vue`
- `create.vue`
- `test.vue`
- `read-only/index.vue`
- `read-only/[scenarioId].vue`

## Local Contract

- this folder is operational, not public
- `Project` is a system console, so the main console route family is core-owned
- `index.vue` is the family-specific chooser in console shell
- `create.vue` belongs to the console create family
- `overview.vue` is the system project workspace entry
- app-specific project subroutes can still live in app packages when they are delivery-specific children

Project-console delta:
- console create ensures `apps/<appId>/projects/<projectId>`
- console create creates the root project first when missing
- console create seeds user-based console authority for the current user
- read-only and test entry stay route-driven through the shared console runtime helpers

## Short Version

This folder is the project-console half of the shared console-entry concept.
Treat app projects as delivery shells around these core-owned main pages.
