# FireUX concept map

Updated: 2026-08-23
Ref: d1a7d5eec
Role: map, not canon

## Purpose

Explain FireUX as the platform shape behind the repo.

## Scope

- Core packages.
- Ecosystem packages.
- Extension packages.
- Project app consumers.

## Vertical links

- Parent: fireux-mono.md
- Child: runtime-package.md
- Child: app-config.md
- Child: workspace.md
- Child: firestore-entity.md

## Horizontal links

- nuxt4.md
- nuxt-ui.md
- spine.md
- firestore-rules.md

## Current shape

- FireUX is a modular Nuxt platform.
- Packages expose Nuxt modules and runtime surfaces.
- Apps consume packages through `defineFireuxConfig`.
- Shared domain truth belongs in the owning package.
- Public App, Project, and Ecosystem collections use canonical index and detail
  routes. Detail relationships derive from stored identity fields such as
  `project_id` and `ecosystem_id`; product-specific Ecosystem literature lives
  below the canonical identity route rather than replacing it.

## Package lanes

- Core packages provide shared primitives and runtime foundations.
- Ecosystem packages provide ecosystem identity, config, Firebase binding, and bundled assets.
- Extension packages provide domain runtime surfaces.
- Core owns reusable Firestore Rules primitives; opted-in ecosystems own their
  complete target template and explicit policy deltas.

## Runtime app roles

- `global`: app can expose multiple domains/workspaces.
- `tenant`: canonical root relationships, Team, and AppUser membership resolve
  its Workspace targets; deploy-time configuration does not pin Entity IDs.
  Place-backed Kitchen is resolved through its same-ID Place rather than a
  management field.
- `standalone`: FireUX-owned standalone app mode.

## Current ecosystem ownership

- Misebox owns hospitality work and its Kitchen/Menu composition.
- Werkbox owns cleaning and other non-hospitality practical work. Cleaning is a
  product-neutral category inside Werkbox, not a separate ecosystem.
- Shared Job, Company, Place, Agent, and Professional truth stays in its owning
  extension package rather than either ecosystem package.
- Werkbox uses canonical Project id `werkbox` while retaining the legacy
  `cleanbox-f15bc` Firebase project, `cleanbox` database, `cleanbox` Ecosystem
  id, and `cleanbox-app` main App id. Those remaining physical and stored
  identifiers change only through an explicitly approved remote migration.

## Working rule

Before inventing a local helper, check whether FireUX core already owns the seam.
