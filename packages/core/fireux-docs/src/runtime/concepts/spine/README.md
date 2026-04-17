# Spine Concept

Authority: Operational
Updated: 2026-04-17
Scope: FireUX runtime-spine meaning across branch docs and cross-layer docs.

This page documents the FireUX `spine` concept.
It does not explain general Nuxt runtime structure.

Use Nuxt documentation for plain Nuxt runtime mechanics.
Use this page for how FireUX bolts canon on top of that runtime shape.

## What This Concept Is

The spine is the FireUX extension layer over the plain Nuxt runtime spine.

Nuxt gives the technical runtime branches:

- `assets/`
- `components/`
- `composables/`
- `layouts/`
- `middleware/`
- `models/`
- `pages/`
- `plugins/`
- `public/`
- `server/`
- `utils/`

FireUX keeps that shape, then adds cross-layer meaning on top of it.

That bolt-on meaning is what `spine/` explains.

## Why FireUX Needs It

Without a spine concept, docs easily blur together:

- branch usage docs
- cross-layer meaning
- model truth
- entity-stack truth

The spine concept keeps one thing clear:

- branch docs explain what a branch is for
- spine docs explain how FireUX interprets those branches together

## Core Rule

`spine/` is where FireUX explains how the runtime branches behave as a coordinated system.

It should not become:

- a duplicate of every branch README
- a Nuxt tutorial
- an entity stack index

## Current Spine Branches

Current early spine docs include:

- `spine/pages/`

More spine branches can be added only when FireUX meaning clearly needs a cross-layer explanation beyond the branch README itself.

## Shared Contract

The spine contract is:

- Nuxt owns the base runtime shape
- FireUX owns the extra canon layered on top
- branch docs explain local branch rules
- spine docs explain cross-layer meaning for those branches

## What Does Not Belong Here

This concept should not become:

- model truth
- entity stack truth
- CRUD authority
- route inventories

Those belong elsewhere.

## Short Version

The spine is how FireUX bolts canon onto the plain Nuxt runtime spine.

It explains branch meaning at the system level, not the branch-file level.
