---
title: Project
description: Project model canon for infrastructure ownership, linked system objects, and early draft checks.
projectObjects:
  - Project
  - App
  - Ecosystem
---

Authority: Operational
Updated: 2026-04-18

`Project` belongs in the runtime `models` spine.

It is the top-level FireUX system shape for infrastructure ownership.

This is not the same thing as an `Ecosystem`.

- `Project` is the infrastructure and runtime boundary.
- `Ecosystem` is the optional FireUX system or brand boundary.
- `App` is the deployable unit that lives inside a project.

That means one project can host:

- ecosystem apps
- standalone apps
- white-label apps

## Project Chapters

This page is chapter `1` for `Project`.

Until the project stack has stable family docs of its own, the chapter order
should stay boring and follow the FireUX runtime spine.

1. [Project](/docs/project)
   specific `Project` chapter
2. [Concepts](/docs/src/runtime/concepts/stacks/project)
   stack and console meaning for `Project`
3. [Assets](/docs/src/runtime/assets)
   assets branch rules when `Project` needs owned media or delivery assets
4. [Components](/docs/src/runtime/components)
   runtime component responsibilities around `Project`
5. [Composables](/docs/src/runtime/composables)
   fetch, runtime state, and adapter placement
6. [Layouts](/docs/src/runtime/layouts)
   layout ownership when project routes need a distinct shell
7. [Middleware](/docs/src/runtime/middleware)
   middleware rules when project entry needs routing or access gates
8. [Models](/docs/src/runtime/models)
   branch-level model placement and ownership
9. [Pages](/docs/pages/project)
   project-specific route and page slice
10. [Plugins](/docs/src/runtime/plugins)
    plugin placement if the project stack needs runtime registration
11. [Public](/docs/src/runtime/public)
    static public assets or files owned by the project stack
12. [Server](/docs/src/runtime/server)
    server seams and runtime endpoints around `Project`
13. [Utils](/docs/src/runtime/utils)
    low-level helpers that should not drift into higher branches

Add family docs later only when they are real enough to hold steady.

## Current Project Canon

For the current FireUX system model, the first project-owned object set is:

- `Project`
- `App`
- `Ecosystem`

Rule of thumb:

- `Project` is the root record.
- `App` points to a project with `project_id`.
- `Ecosystem` points to a project with `project_id`.
- root `projects/<projectId>` owns project identity and console access
- `operator_ids` and `owner_user_id` belong on the root project
- `slug` belongs on the root project for public routing
- app-scoped project overlays must not duplicate root operator access

## What The Draft Check Looks For

The first draft check is intentionally small.

It verifies:

- the `Project` model exists as a root system model
- `App` declares direct project linkage
- `Ecosystem` declares direct project linkage
- any extra model that now declares `project_id` is surfaced for review

This is a draft checker, not a migration tool.

Its job is to tell us whether repo truth is still matching this page before we try to automate anything larger.
