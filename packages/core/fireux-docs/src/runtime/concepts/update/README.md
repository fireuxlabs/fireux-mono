# Update Concept

Authority: Operational
Updated: 2026-03-23
Scope: runtime update behaviour across `pages/`, `components/`, and `composables/`.

Learn how FireUX update behaviour works at runtime, which stored truth is being edited, and how current edit families are supposed to behave.

## Update Concept

Update is a runtime concept, not just an `edit/[id].vue` route and not just an edit form.

Update spans:
- `runtime/pages/` for entry and ownership
- `runtime/components/` for orchestration and guards
- `runtime/composables/` for write truth
- sometimes `runtime/models/` to identify which stored layer is canonical

Use this README as the update authority.
Use the pages and components READMEs as supporting views.

## Core Principle

The main update question is not:
- how does a thing come into existence?

The main update question is:
- which stored truth are we editing?

That means update should stay anchored to the real stored layer:
- public entity
- console overlay
- scoped child record

Do not confuse:
- a facade
- hydrated UI data
- derived fields
- convenience projections

with the stored truth that should actually be written.

## Single-record Update Versus Collection Management

Update canon is primarily about single-record editing.

Collection management is related, but different.

Collection or manager surfaces may:
- browse
- filter
- choose a record
- launch or embed an edit surface

But update canon should stay focused on:
- one record
- one truth layer
- one authorized write path

## Truth Layers

### Public Entity Update

Edit the canonical public record.

Examples:
- `companies/<id>`
- `kitchens/<id>`
- `places/<id>`

This is where public identity and canonical entity truth should be edited.

### Console Overlay Update

Edit the app-scoped operational overlay.

Examples:
- `apps/<appId>/kitchens/<id>`
- `apps/<appId>/portfolios/<id>`
- `apps/<appId>/suppliers/<id>`

This is where app-owned operational state should be edited.

### Scoped Child Update

Edit a child record that exists only because a console owns it.

Examples:
- kitchen-owned operational records
- portfolio-owned operational records
- supplier-owned operational records as that surface grows

These should not be treated like public entity edits.

### Ensure-repair Update

Some ensure-first routes also repair missing or partial state.

Examples:
- `users/create.vue`
- `apps/create.vue`

These are not ordinary edit pages, but behaviourally they can still update broken or incomplete state.

## Page Ownership

### Public Entity Edit

A public or shareable edit surface for a canonical entity.

Current strongest family:
- `packages/extensions/fireux-companies/src/runtime/pages/companies/edit/[id].vue`
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/edit/[id].vue`
- `packages/extensions/fireux-places/src/runtime/pages/places/edit/[id].vue`

### Managed-record Edit

A record edit surface that is valid, but not part of the public-entity edit family.

Current example:
- `packages/extensions/fireux-jobs/src/runtime/pages/jobs/edit/[id].vue`

### Console-owned Update

An edit surface that lives inside a console workspace rather than as a top-level edit route.

Examples:
- supplier management
- kitchen management
- portfolio management

These may use embedded edit organisms instead of dedicated `edit/[id]` pages.

### Identity Update

A dashboard or profile-owned update surface.

Examples:
- `dashboard/chef/profile.vue`
- `dashboard/agent/profile.vue`
- `dashboard/professional/profile.vue`
- user profile and settings surfaces

## Component Orchestration

Update components should usually handle:
- loading or receiving one resolved record
- edit guards or write locks
- preview versus edit presentation where useful
- scoped write actions for the right stored layer

Common patterns already visible in the repo:
- preview first, edit second
- explicit not-found or unavailable states
- separate core versus app edit organisms where overlay truth exists

## Composable Truth

Composable update seams should answer:
- how do we fetch one record?
- how do we resolve the canonical id?
- which collection or overlay path is writable?
- what patch function is valid?
- what layer is read-only or derived?

Update composables should prefer:
- explicit patch helpers
- explicit root versus overlay targeting
- field-level write boundaries where that improves safety

## Current Repo Families

### Public Entity Edit Family

Already clear:
- `Company`
- `Kitchen`
- `Place`

Shared shape:
- page shell
- fetch one
- not-found handling
- preview first
- edit guard
- edit surface after the guard

### Managed-record Edit Family

Currently separate:
- `Job`

This should not be forced into the public entity edit family unless the behavioural truth really matches.

### Console-owned Embedded Update

Already real, but broader and less route-uniform:
- supplier management
- kitchen console edit surfaces
- portfolio console edit surfaces

### Identity Update Family

Already real:
- `Chef`
- `Agent`
- `Professional`
- user profile and settings

## Current Status

Already strong:
- one clear public entity edit family
- one visible managed-record edit family
- embedded console-owned update surfaces are normal and valid

Still to reconcile:
- console overlay update canon should be made more explicit over time
- hydrated or derived fields must keep being separated from stored write targets
- naming and family boundaries can tighten later as the edit pass matures

## Roadmap To Reconciliation

1. Keep update canon here, not only in `pages/` or `components/`.
2. Start with the clearest public entity edit family.
3. Keep managed-record edit separate until behaviour truly matches.
4. Treat console-owned update as valid even when it does not use `edit/[id]`.
5. Push stored-truth decisions into composables, not route shells.
6. Keep public entity, console overlay, and scoped child as the primary update truth layers.

## Short Version

Update is a runtime concept.

The core update question is:
- which stored truth are we editing?

Pages own entry.
Components orchestrate.
Composables define the write truth.

Public entity edit, managed-record edit, console-owned update, and identity update are the current important update families.
