# Stacks Concept

Authority: Operational
Updated: 2026-04-18
Scope: FireUX entity-stack meaning across `models/`, `composables/`, `components/`, `pages/`, `server/`, and docs.

This page documents the FireUX `stacks` concept.

`stacks` is a FireUX cross-layer concept and belongs under `runtime/concepts/`.
It does not define a new Nuxt runtime branch.

## What This Concept Is

A stack is the expected cross-layer runtime shape around a FireUX entity system.

Examples:

- `Project`
- `App`
- `Ecosystem`

A stack is not just a model.
A stack is also not just a page tree.

It is the contract for which runtime surfaces should exist around that entity and how that entity maintains canon across those surfaces.

## Why FireUX Needs It

FireUX entities often span:

- model truth
- CRUD seams
- relationship and authority seams
- interface seams
- components
- pages
- console pages
- server seams
- docs and drift checks

Without a stack concept, those truths get spread across branch docs, model docs, and concept docs with no single entity-level contract.

## Core Rule

A stack doc should describe the expected runtime surfaces around one entity system.

It should not replace:

- the branch docs
- the model docs
- shared lower docs such as CRUD notes when those are reused across stacks

Instead, it should connect them.

## Canon Terms

### Model Truth

What the entity is as stored truth.

This belongs in `runtime/models/<entity>/README.md`.

### Stack Truth

What runtime surfaces are expected around that entity.

This belongs in `runtime/concepts/stacks/<entity>/README.md`.

### Stack Surface

One expected runtime layer around the entity, such as:

- model
- CRUD seam
- interface
- pages
- console pages
- server seam
- docs route

### Shared CRUD

CRUD lives under `stacks/` because FireUX stacks are real systems, not isolated records.

That means:

- shared `create`, `read`, and `update` canon can live under `runtime/concepts/stacks/crud/`
- entity stack docs can then reference that shared CRUD canon instead of repeating it

### Three Stack Truths

For console-backed stacks, one entity system often has three different truths:

- the thing exists
- the thing can be operated
- the thing can be connected to someone

These are not the same thing.

In FireUX terms, that usually means:

- public entity truth
- console or operational truth
- relationship or membership truth

This is stack truth, not a separate architecture.

### Public Entity Truth

The entity exists as canonical system truth.

Examples:

- `kitchens/<id>`
- `portfolios/<id>`
- `suppliers/<id>`
- `projects/<id>`

### Console Or Operational Truth

The entity can be operated inside a specific app or runtime workspace.

Examples:

- `apps/<appId>/kitchens/<id>`
- `apps/<appId>/portfolios/<id>`
- `apps/<appId>/suppliers/<id>`

For system-owned families such as `Project`, the exact operational seam may be runtime- or console-shaped rather than a classic app overlay, but it is still part of stack truth.

### Relationship Truth

The entity is linked to a person, team, profile, company, or membership layer.

Examples:

- chef to kitchen
- manager to portfolio
- operator to supplier
- member or admin to project

Relationship truth does not automatically mean operational authority.

That distinction belongs inside stack canon.

## Runtime Surfaces Involved

This concept may span:

- `runtime/models/`
- `runtime/composables/`
- `runtime/components/`
- `runtime/pages/`
- `runtime/server/`
- runtime docs routes and draft checks

## Shared Contract

A stack doc should answer:

- if this entity exists in FireUX, which runtime surfaces are expected around it
- how that stack separates public, operational, and relationship truth when those are distinct
- which of those surfaces are real canon
- which are still early or draft canon

It should stay sharp about surface expectations and avoid turning into a branch tutorial.

## Current Repo Status

This is early canon.

`Project` is the first stack because it is already forcing coordination across:

- model truth
- linked system objects
- CRUD expectations
- relationship and authority expectations
- docs aliasing
- draft checking

Other stacks can follow after the pattern is stable.

## What Does Not Belong Here

A stack doc should not become:

- a dump of every file path in the repo
- a branch README
- a model field reference
- a giant implementation spec for every stack at once

## Short Version

A stack is the FireUX cross-layer contract for one entity system.

That contract may include:

- model truth
- CRUD truth
- relationship and authority truth
- interface and page surfaces
- docs and drift checks

It lives under `runtime/concepts/` because it spans many runtime branches at once.
