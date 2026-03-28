# Console Entry Concept

Authority: Operational
Updated: 2026-03-28
Scope: console-backed entry flow across `pages/`, `components/`, `composables/`, and `models`.

Learn how FireUX console-backed families are entered, where family choice happens, and how public entry differs from console entry.

## Console Entry Concept

Console-backed families share one entry pattern:
- `/console`
- `/console/X`
- `/X`
- `/X/create`
- `/console/X/create`

These are not five unrelated routes.
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
- `/console` does not infer visible families by scanning every registered console route
- an app with `consoleFamilies: []` should not expose console entry at all

### 2) Choose Instance Or Mode

`/console/X`

This is the family-specific chooser.

Meaning:
- choose a live instance
- choose `test`
- choose `read-only`
- choose create

This route is console entry, not yet the operational workspace.

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
- `/console/X` = choose instance, mode, or create console
- `/X` = public discovery plus the same chooser when useful
- `/X/create` = public facade create
- `/console/X/create` = console create

The canonical visibility rule is:
- app config decides whether `/console` exists as a user-facing entry
- app config decides which families appear there
- route presence alone does not make a family visible in a given app

The canonical ownership rule is:
- system console main pages live in core
- domain console main pages live with their domain package
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
- mode choice
- public create versus console create

The local family docs should explain only the delta.

Examples:
- `Kitchen`
  - Chef profile gating
  - runtime kitchen mode and kitchen id
  - read-only kitchen scenario ids
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
- choose instance or mode
- split public create from console create

Kitchen is the current reference implementation of that pattern.
