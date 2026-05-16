---
title: Project Pages
description: FireUX project page surfaces, route ownership, and page-level runtime meaning.
---

# Project Pages

Authority: Operational
Updated: 2026-04-18
Scope: FireUX `Project` page surfaces under the runtime `pages` branch.

This page documents the `Project` pages slice.
It is not the main `Project` doc.

Use these docs for the other `Project` views:

- `packages/core/fireux-docs/src/runtime/models/project/README.md`
  model truth
- `packages/core/fireux-docs/src/runtime/concepts/stacks/project/README.md`
  stack truth

Use this page only for the route and page-surface side of `Project`.

## What This Page Owns

This page should explain:

- which `Project` routes exist
- who owns those routes
- which routes are public versus console
- which routes are family entry shells versus selected-target workspace pages
- which lower seams those pages hand off to

It should not redefine:

- the `Project` model
- the full `Project` stack
- general console canon

## Current Project Page Meaning

For FireUX, `Project` pages are unusual because the main project console pages are app-owned rather than domain-package owned.

That means `Project` page ownership should be read like this:

- shared console layout and generic console runtime seam live in core
- main `Project` console page delivery may live in the consuming app
- project page shells still need to follow shared FireUX console-entry canon

## Current Project Route Surfaces

The main current `Project` route surfaces are:

- `/projects`
  public generic collection surface
- `/projects/[slug]`
  public detail surface using project `slug`
- `/console/project`
  console family entry and user-scoped target selection
- `/console/project/overview`
  selected-target workspace overview

Additional project child pages may exist beneath the selected workspace.

Sibling page rule:

- public project routing should use sibling route files such as `projects/index.vue` and `projects/[slug].vue`
- do not pair `projects.vue` with `projects/[id].vue` unless the parent explicitly renders `<NuxtPage />`

## FireUX Page Rule For Project

For `Project`, pages should stay especially clear about:

- route ownership
- project selection versus active workspace
- page shell versus lower runtime seam

Project pages should not quietly absorb:

- stored project truth
- project runtime loading rules
- stack rules that belong in the `Project` stack doc

## Short Version

`runtime/pages/project/README.md` is the page-slice doc for `Project`.

Use it for route ownership and page meaning.
Use the model and stack docs for everything else.
