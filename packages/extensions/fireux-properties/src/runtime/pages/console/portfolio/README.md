# Console Portfolio Pages

Authority: Operational
Scope: `packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/*`

This folder owns the operational portfolio console workspace.

## Current Routes

- `index.vue` — portfolio console entry / chooser
- `overview.vue` — selected portfolio overview
- `create.vue` — portfolio create flow
- `clients.vue` — parked selected portfolio clients route
- `finance.vue` — parked selected portfolio finance route
- `incidents.vue` — parked selected portfolio incidents route
- `properties.vue` — parked selected portfolio properties route

## Local Contract

- This folder is operational, not public.
- Apps must opt into portfolio visibility through console families.
- The shared console layout owns selection guarding.
- Portfolio pages should not add local "No portfolio selected" guards unless they need special behaviour.
- Selected-child pages should use `nav.requiresSelection: true`.
- Parked child pages should use `hidden: true` and `parked: true`.

## Portfolio Console Delta

- Create flow creates `apps/<appId>/portfolios/<portfolioId>` when missing.
- Create flow creates the root portfolio first when missing.
- Create flow seeds console authority for the current user.
- Operational child records stay under `apps/<appId>/portfolios/<portfolioId>/...`.

## Short Version

Portfolio is one member of the shared console family system.

Keep portfolio/property pages aligned with kitchen, supplier, and project consoles:
same shell, same meta contract, same layout-level selection guard.
