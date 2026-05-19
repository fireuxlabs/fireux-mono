# Console Entry Concept

Authority: Operational
Updated: 2026-05-16
Scope: console-backed entry flow across `pages/`, `components/`, `composables/`, and `models`.

Learn how FireUX console-backed families are entered, where family choice happens, and how public entry differs from console entry.

## Console Entry Concept

Console-backed families share one entry pattern:
- `/console`
- `/console/X`
- `/console/X/overview`
- `/X`
- `/X/create`
- `/console/X/create`

These are not unrelated routes.
They are one concept with different entry depths.

## Shared Pattern

### 1) Choose Family

`/console`

This is the app-level console hub.

Meaning:
- choose which console-backed family to enter
- do not choose a specific entity instance yet
- only show the families the current app explicitly exposes

Examples:
- `Kitchen`
- `Property`
- `Portfolio`
- `Supplier`
- `Project`

Visibility source of truth:
- app config declares visible families through `consoles`
- app config uses singular canonical family keys such as `project`, `property`, `kitchen`, `portfolio`, and `supplier`
- core maps canonical family keys to route segments such as `/console/project`, `/console/property`, `/console/kitchen`, `/console/portfolio`, and `/console/supplier`
- `/console` does not infer visible families by scanning every registered console route
- an app with `consoles: []` should not expose console entry at all
- a product CTA must not point at another family just because that route exists
- a family listed in `consoles` must have a real route family; otherwise it is proposed, not current canon

### 2) Choose Target In A Mode

`/console/X`

This is the family-specific chooser.

Meaning:
- enter the family
- choose a target in the active mode
- switch runtime mode when needed
- choose create or claim when appropriate

This route is console entry, not yet the operational workspace.

Vocabulary at this layer:
- family key = `project`, `property`, `kitchen`, `portfolio`, `supplier`
- route segment = `project`, `property`, `kitchen`, `portfolio`, `supplier`
- target = the selected root entity in that family
- workspace = the console shell once a target is selected

Do not add another business layer here.
If a family often has one target versus many, that is cardinality, not a new console architecture.

Meaning by mode:
- `live`: show authorized operator targets for that family
- `test`: show writable targets that prove the intended real shape
- `demo`: show curated read-only targets for development, demos, and UX exploration

The route answers:
- which console family is active
- which mode is active
- which targets are available in that mode
- which target should be entered next

Mode source canon:
- real/live is the source-of-truth target shape
- test is the writable proving ground for that shape
- demo is a read-only aid, not authority
- demo data bends toward test/real shape; runtime code must not bend around stale demo data
- demo/test/live targets should expose the same minimum console target shape for family entry, header, and overview

Live authority canon:
- `operator_ids` is the current console authority field.
- app-scoped console families query `apps/{appId}/{family}` with `operator_ids array-contains uid`, then fetch only the authorized root target docs.
- project console authority is root-level: query `projects` with `operator_ids array-contains uid`.
- broad root collection reads plus client-side filtering are not authority.
- writes must re-check authority in mutations; Firestore rules must enforce the same model before shipping.
- `team_ids` is transitional compatibility only.

### 2b) Selected Target Overview

`/console/X/overview`

This is the first child page inside the selected workspace.

Meaning:
- one target is already selected in runtime state
- the operator is now inside that target's workspace
- the page gives a stable overview and jump-off point for child routes

This route is not the family chooser.
It is the overview of the selected target inside the workspace.

`/console/X` and `/console/X/overview` are shared console semantics managed by
the core console spine. When comparing domain children across families, list
them separately from domain-specific operation routes such as menus, info, team,
orders, messages, or rooms.

### 3) Public Family Surface

`/X`

This is the public family surface.

Meaning:
- public discovery
- public collection browsing
- public learn-more and public detail routes

This surface may also embed the same chooser used by `/console/X`.

If it does, the chooser meaning stays the same.
Only the shell changes:
- public page shell on `/X`
- console full-screen entry shell on `/console/X`

## Create Split

### Public Create

`/X/create`

Meaning:
- create the public entity

This creates or ensures the canonical public record.

It does not mean:
- create console authority
- ensure the console overlay

### Console Create

`/console/X/create`

Meaning:
- create or ensure the console overlay
- create the public entity first if it is missing

This is the operational onboarding path for the console-backed family.

User-facing entry CTA labels may still say `Create X`.
The route context carries the real meaning:
- `/X/create` = public create
- `/console/X/create` = console create

## Shared Canon

The canonical shape is:
- `/console` = choose family
- `/console/X` = family entry and target selection seam
- `/console/X/overview` = selected-target workspace overview
- `/X` = public discovery plus the same chooser when useful
- `/X/create` = public facade create
- `/console/X/create` = console create

The canonical mode rule is:
- `live`, `test`, and `demo` are runtime modes, not separate console architectures
- `live` is authority, `test` proves the writable path, and `demo` teaches without writing
- explicit `/demo` routes may still exist as transitional or convenience seams
- those seams should only set runtime mode and then enter the normal console routes

The canonical visibility rule is:
- app config decides whether `/console` exists as a user-facing entry
- app config decides which families appear there
- route presence alone does not make a family visible in a given app
- app visibility without a matching route family is invalid current canon
- if a console is needed for inspection, add the smallest scaffold before removing accidental old access

The canonical ownership rule is:
- the shared console layout and generic runtime seam live in core
- `Project` main console pages may live in the consuming app
- domain console main pages live with their domain package when the domain owns the route family
- app and ecosystem packages may still own branded child routes or delivery wrappers when needed

The canonical route-file shape is:
- `pages/console/<family>/index.vue` is the family entry surface.
- `pages/console/<family>/overview.vue` is the selected target overview.
- `pages/console/<family>/create.vue` is the create/setup entry when the family supports it.
- Simple current or scaffold pages can stay as files directly under the family folder.
- Complex operation pages use child folders with `index.vue` and detail routes, following the Kitchen pattern.
- The family folder name is singular even when the entry surface lists many targets.

The canonical family entry component shape is:
- use `ConsoleEntityIndex` from `fireux-core` for the repeated live/demo/test target-selection shell.
- keep domain data hooks, cards, collection managers, and create/ensure behaviour in the owning family.
- do not copy the whole target-selection shell into every console family.

## Kitchen As Reference Variant

`Kitchen` is the clearest current implementation of this concept.

Why:
- `/console/kitchen` and `/kitchens` already share the same chooser
- the chooser behaves differently only at the create step
- `/kitchens/create` is public create
- `/console/kitchen/create` is console create

So kitchen should be treated as:
- not just one domain
- but the current reference implementation of console-entry behaviour

## Canon Enforcement Rule

Console docs must not claim an app/family is aligned unless the route tree exists.

Minimum current-canon checklist:
- Tier1 doc names the family key and route segment
- route files exist under the owning package/app
- app config exposes the family only when the app should show it
- app registry smoke routes cover the family when the app is smoked locally
- child routes are listed using the real route tree, not guessed from product copy

If any checklist item is missing, write `proposed`, `scaffold`, or `future`.

## What Belongs In Local Delta Docs

The concept doc should explain:
- family choice
- family chooser
- runtime mode choice
- family-entry behavior across demo/test/real
- selected-target workspace overview
- public create versus console create

The local family docs should explain only the delta.

Examples:
- `Kitchen`
  - Chef profile gating
  - kitchen console mode and selected kitchen id
  - demo kitchen scenario ids
  - family-specific demo/test/live delta, such as Deano Smash as read-only demo and Daniel's test kitchen as writable proof
- `Supplier`
  - company/operator assumptions
  - supplier demo/test/live target and catalogue/product deltas
- `Portfolio`
  - manager/team assumptions
  - portfolio demo/test/live target and property/client/unit deltas
- `Project`
  - project membership assumptions
  - project demo/test/live target and system metadata deltas

## Short Version

Console-backed families all follow one entry pattern.

The shared concept is:
- choose family
- enter the family and resolve mode in runtime
- choose the target from that family entry seam
- land in the selected target overview
- split public create from console create

Kitchen is the current reference implementation of that pattern.
