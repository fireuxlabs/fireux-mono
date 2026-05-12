# Console Entry Concept

Authority: Operational
Updated: 2026-04-04
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
- `Portfolio`
- `Supplier`
- `Project`

Visibility source of truth:
- app config declares visible families through `consoleFamilies`
- app config uses canonical family keys such as `projects`, `kitchens`, `portfolios`, and `suppliers`
- core maps canonical family keys to route segments such as `/console/projects`, `/console/kitchen`, `/console/portfolio`, and `/console/supplier`
- `/console` does not infer visible families by scanning every registered console route
- an app with `consoleFamilies: []` should not expose console entry at all

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
- family key = `projects`, `kitchens`, `portfolios`, `suppliers`
- route segment = `projects`, `kitchen`, `portfolio`, `supplier`
- target = the selected root entity in that family
- workspace = the console shell once a target is selected

Do not add another business layer here.
If a family often has one target versus many, that is cardinality, not a new console architecture.

Meaning by mode:
- `demo`: show curated demo targets
- `test`: show test targets
- `live`: show the current user's real targets for that family

The route answers:
- which console family is active
- which mode is active
- which targets are available in that mode
- which target should be entered next

### 2b) Selected Target Overview

`/console/X/overview`

This is the first child page inside the selected workspace.

Meaning:
- one target is already selected in runtime state
- the operator is now inside that target's workspace
- the page gives a stable overview and jump-off point for child pages

This route is not the family chooser.
It is the overview of the selected target inside the workspace.

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
- `live` and `demo` are runtime modes, not separate console architectures
- explicit `/demo` routes may still exist as transitional or convenience seams
- those seams should only set runtime mode and then enter the normal console routes

The canonical visibility rule is:
- app config decides whether `/console` exists as a user-facing entry
- app config decides which families appear there
- route presence alone does not make a family visible in a given app

The canonical ownership rule is:
- the shared console layout and generic runtime seam live in core
- `Project` main console pages may live in the consuming app
- domain console main pages live with their domain package when the domain owns the route family
- app and ecosystem packages may still own branded child pages or delivery wrappers when needed

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
- `Supplier`
  - company/operator assumptions
- `Portfolio`
  - manager/team assumptions
- `Project`
  - project membership assumptions

## Short Version

Console-backed families all follow one entry pattern.

The shared concept is:
- choose family
- enter the family and resolve mode in runtime
- choose the target from that family entry seam
- land in the selected target overview
- split public create from console create

Kitchen is the current reference implementation of that pattern.
