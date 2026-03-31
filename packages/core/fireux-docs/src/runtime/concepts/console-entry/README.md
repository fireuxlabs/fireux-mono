# Console Entry Concept

Authority: Operational
Updated: 2026-03-30
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
- `/console` does not infer visible families by scanning every registered console route
- an app with `consoleFamilies: []` should not expose console entry at all

### 2) Choose Instance Or Mode

`/console/X`

This is the family-specific chooser.

Meaning:
- enter the family
- choose a live instance when needed
- choose create
- set runtime mode when coming from demo entry seams

This route is console entry, not yet the operational workspace.

### 2b) Shared Overview

`/console/X/overview`

This is the shared console overview seam.

Meaning:
- if one target is available, auto-select it
- if many targets are available, show the all-target overview
- if zero live targets exist, fall through to create
- keep the same overview route whether the runtime mode is `live` or `read-only`

The route answers:
- which console family is active

Runtime state answers:
- which target or scenario is selected
- whether the console is writable

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
- `/console/X` = family entry and selection seam
- `/console/X/overview` = shared operator overview
- `/X` = public discovery plus the same chooser when useful
- `/X/create` = public facade create
- `/console/X/create` = console create

The canonical mode rule is:
- `live` and `read-only` are runtime modes, not separate console architectures
- explicit `/read-only` routes may still exist as transitional or convenience seams
- those seams should only set runtime mode and then enter the normal console routes

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
- runtime mode choice
- shared overview behavior
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
- enter the family and resolve mode in runtime
- use overview as the shared operator seam
- split public create from console create

Kitchen is the current reference implementation of that pattern.
