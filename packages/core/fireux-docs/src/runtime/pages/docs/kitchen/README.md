---
title: Kitchen Pages
description: FireUX kitchen page surfaces, route ownership, and page-level runtime meaning.
---

# Kitchen Pages

Authority: Operational
Updated: 2026-04-19
Scope: FireUX `Kitchen` page surfaces under the runtime `pages` branch.

This page documents the `Kitchen` pages slice.
It is not the main `Kitchen` doc.

Use these docs for the other `Kitchen` views:

- `packages/core/fireux-docs/src/runtime/models/kitchen/README.md`
  model truth
- `packages/core/fireux-docs/src/runtime/concepts/stacks/kitchen/README.md`
  stack truth

Use this page only for the route and page-surface side of `Kitchen`.

## Current Kitchen Page Meaning

For FireUX, `Kitchen` pages are split between:

- public kitchen pages
- kitchen console family entry
- selected-target workspace pages

Kitchen is also the clearest current reference implementation of the shared console-entry pattern.

## Current Kitchen Route Surfaces

The main current `Kitchen` route surfaces are:

- `/kitchens`
  public family surface
- `/kitchens/[slug]`
  public kitchen detail
- `/kitchens/[slug]/menus`
  public kitchen menu surface
- `/kitchens/[slug]/menus/[menuId]`
  public kitchen menu detail
- `/console/kitchen`
  console family entry and target selection
- `/console/kitchen/overview`
  selected-target workspace overview

## FireUX Page Rule For Kitchen

For `Kitchen`, pages should stay especially clear about:

- public page versus console page
- family entry versus active workspace
- page shell versus lower runtime seam

Kitchen pages should not quietly absorb:

- stored kitchen truth
- console authority rules
- interface/presenter logic that belongs in composables

## Short Version

`runtime/pages/docs/kitchen/README.md` is the page-slice doc for `Kitchen`.

Use it for route ownership and page meaning.
Use the model and stack docs for everything else.
