---
title: Project
description: Project model canon for infrastructure ownership, linked system objects, and early draft checks.
projectObjects:
  - Project
  - App
  - Ecosystem
---

Authority: Operational
Updated: 2026-04-17

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

## Current Project Canon

For the current FireUX system model, the first project-owned object set is:

- `Project`
- `App`
- `Ecosystem`

Rule of thumb:

- `Project` is the root record.
- `App` points to a project with `project_id`.
- `Ecosystem` points to a project with `project_id`.

## What The Draft Check Looks For

The first draft check is intentionally small.

It verifies:

- the `Project` model exists as a root system model
- `App` declares direct project linkage
- `Ecosystem` declares direct project linkage
- any extra model that now declares `project_id` is surfaced for review

This is a draft checker, not a migration tool.

Its job is to tell us whether repo truth is still matching this page before we try to automate anything larger.
