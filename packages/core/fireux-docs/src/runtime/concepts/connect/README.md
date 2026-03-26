# Connect Concept

Authority: Operational
Updated: 2026-03-25
Scope: runtime relationship and access behaviour across `pages/`, `components/`, `composables/`, and `models/`.

Learn how FireUX separates public existence, console operation, and relationship linking for console-backed domains.

## Connect Concept

Console-backed domains do not have one truth.

They usually have three:
- the thing exists
- the thing can be operated
- the thing can be connected to someone

Those are not the same thing.

Use this README when a domain starts mixing:
- public entities
- app-hosted console overlays
- profile, membership, ownership, or workplace links

## The Three Truths

### 1) Public Entity

The thing exists as a canonical public record.

Examples:
- `kitchens/<id>`
- `portfolios/<id>`
- `suppliers/<id>`

Meaning:
- this entity exists in the system
- it has canonical identity
- it can be discovered or routed to publicly where that domain allows it

This does not mean:
- the thing has an operational console
- the current user can operate it

### 2) Console Overlay

The thing can be operated in a specific app.

Examples:
- `apps/<appId>/kitchens/<id>`
- `apps/<appId>/portfolios/<id>`
- `apps/<appId>/suppliers/<id>`

Meaning:
- this app hosts the operational console for the entity
- app-scoped governance and private operational state live here

This is where authority should normally come from:
- `admin_ids`
- `join_requests`
- `console_enabled`
- explicit app-scoped governance or membership records

### 3) Relationship Link

The thing is connected to a person, team, company, or profile.

Examples:
- a chef has `kitchen_ids`
- a professional experience entry references a kitchen or company
- a supplier is connected to a company or operator
- a project has members or admins

Meaning:
- there is a relationship
- there may be history, membership, employment, or affiliation

This does not mean:
- console access
- console authority
- operational ownership

## Naming Canon

Use these labels consistently:

- `Create X`
  - create the public entity
- `/console/X/create`
  - ensure the app-hosted console overlay and console authority path
- `Link X`
  - relationship only
- `Add X To Profile`
  - relationship only

User-facing CTA labels may stay simply `Create X` even on `/console/X`.
In that case, the route context carries the distinction:
- `/X/create` = public create
- `/console/X/create` = console create

Avoid these confusions:
- calling a relationship link a create
- calling a public entity create a console create
- treating profile association like console access

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` when the question is about:
- `/console`
- `/console/X`
- `/X`
- public create versus console create entry flow

## Side-effect Rule

A relationship flow may sometimes ensure a public entity record exists if a canonical reference is missing.

Example:
- a work-history flow may ensure `kitchens/<id>` exists so the experience can point at a canonical kitchen

That still does not mean:
- the console overlay exists
- the current user can run that console

## Family Mapping

### Kitchen

- public entity: kitchen
- console overlay: kitchen console
- relationship link: chef association, workplace history, ownership history

### Portfolio

- public entity: portfolio
- console overlay: portfolio console
- relationship link: manager, team, or client association

### Supplier

- public entity: supplier
- console overlay: supplier console
- relationship link: operator, company, or membership association

### Project

- public entity: project
- console overlay: project console
- relationship link: project membership, admin assignment, ecosystem/app relation

## Permission Rule

For console-backed domains:

- public existence is not console access
- relationship is not console access
- console access must come from the console authority layer

If a domain needs a claim rule, membership rule, or admin rule, document it as console authority.
Do not hide it inside profile linkage.

## Short Version

Every console-backed thing has three truths:
- it exists
- it can be operated
- it can be connected to someone

Those are not the same thing.
