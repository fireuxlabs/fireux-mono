# Pages Concept

Authority: Operational
Updated: 2026-04-17
Scope: FireUX page meaning across `runtime/pages/`, `runtime/components/`, and `runtime/composables/`.

This page documents the FireUX `pages` concept.
It does not explain general Nuxt page mechanics.

Use `packages/core/fireux-docs/src/runtime/pages/README.md` for the branch view.
Use `packages/core/fireux-docs/src/runtime/concepts/spine/README.md` for the spine view.
Use this page for the cross-layer meaning of pages inside FireUX.

## What This Concept Is

`pages` is a FireUX runtime concept because route meaning spans more than the `pages/` branch alone.

In FireUX, a page is not just a file-based route.
It is an ownership and entry decision that cooperates with components and composables.

## Why FireUX Needs It

FireUX adds rules that plain Nuxt does not give us by itself:

- public versus console versus dashboard versus admin ownership
- family entry versus selected-target workspace
- route shells versus lower runtime seams
- friendly docs aliases versus canonical docs source placement

That is why `pages` is both:

- a technical branch
- a spine concept

## Core Rule

Pages are the route delivery and ownership layer.

Pages should decide:

- who owns the surface
- who the audience is
- which lower seam should actually do the runtime work

Pages should not quietly absorb:

- storage truth
- fetch truth
- UI manager behavior
- local architecture that belongs in components or composables

## Canon Terms

### Route Owner

The runtime layer or package that is responsible for delivering the route.

### Thin Shell

A page that owns the route but hands behavior down to components and composables.

### Family Entry

The first page that chooses or resolves the active target for a family such as `/console/X`.

### Workspace Surface

The selected-target working page such as `/console/X/overview`.

### Friendly Alias

A user-facing route such as `/docs/project` that may point at canon stored elsewhere.

## Runtime Surfaces Involved

This concept usually spans:

- `runtime/pages/`
- `runtime/components/`
- `runtime/composables/`
- sometimes `runtime/server/`
- sometimes `runtime/concepts/console/`

## Shared Contract

For FireUX pages, the shared contract is:

- the page owns delivery
- the page makes route meaning explicit
- the page hands behavior to lower seams
- the page does not redefine source truth that belongs elsewhere

For docs pages, the extra rule is:

- friendly route shape is allowed
- source documentation still has to live in the correct canon branch

## Current Repo Status

This is early but real canon.

The branch doc for `runtime/pages/` now describes FireUX route ownership.
This concept page exists to explain why that ownership is cross-layer rather than just a folder note.

## What Does Not Belong Here

This concept page should not become:

- a Nuxt routing tutorial
- a per-route inventory
- a styling guide
- a full console-entry spec

Those belong in other docs.

## Short Version

`pages` is a FireUX concept because route meaning spans pages, components, and composables.

The FireUX job of a page is ownership and entry, not general Nuxt mechanics.
