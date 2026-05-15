# Concepts Directory

Authority: Operational
Updated: 2026-05-15
Scope: `packages/core/fireux-docs/src/runtime/concepts/*`.

Learn how FireUX runtime concepts are documented when they span more than one runtime branch.

## Concepts Directory

`runtime/concepts/` is the FireUX cross-layer concept spine.

It is how FireUX bolts extra canon on top of the plain Nuxt runtime spine.

Use this directory when a concept spans:

- more than one runtime branch
- more than one technical owner
- more than one entity surface

This is not a replacement for `runtime/pages/`, `runtime/components/`, `runtime/composables/`, or `runtime/models/`.
It is the layer that explains how those branches cooperate in FireUX.

## Current Shape

The current concept map is:

- `console/`
  console-backed entry, selection, and workspace meaning
- `dashboard-canon.md`
  authenticated user and profile-extension dashboard meaning
- `demo-data-canon.md`
  demo identity, profile fixture, app membership, and collection source behaviour
- `firestore-rules-canon.md`
  manual Firestore rules workflow for app databases during preflight, demo, and shipping phases
- `spine/`
  how FireUX extends the plain Nuxt runtime spine
- `stacks/`
  entity systems and their canon across runtime layers
- `connect/`
  relationship and authority meaning across those systems

This keeps the main FireUX runtime ideas visible:

- the console is a major first-class concept
- the dashboard is the user/profile-extension area
- the spine is the FireUX bolt-on to Nuxt runtime structure
- stacks describe entities as runtime systems rather than isolated files

## Meaning Of Each Concept Group

### `console/`

Console is a real concept because console-backed families span:

- app-level hub routing
- family-specific chooser pages
- selected-target workspaces
- mode selection
- public create versus console create

### `dashboard-canon.md`

Dashboard is a real concept because user/profile work spans:

- the shared dashboard layout
- user profile pages
- profile extension pages
- the top-left profile selector
- profile create/ensure flows

Current dashboard profile identities are `user`, `professional`, `chef`, and `agent`.
Dashboard is not a console family.

### `demo-data-canon.md`

Demo data is a real concept because demo records can touch:

- root identity
- profile extensions
- app membership overlays
- product demo providers
- live/test/demo collection source modes

The core rule is that demo data bends toward live and test shape. Live collection reads stay live unless demo mode is explicit.

### `firestore-rules-canon.md`

Firestore rules are currently managed manually in Firebase/Firestore for each app database.

Dev and preflight databases may temporarily use open rules while product shape is moving. Those rules are not production rules, and every real client/staging/production ship must replace them with scoped public, signed-in, admin, and membership rules.

### `spine/`

Spine is a real concept because FireUX extends the plain Nuxt runtime spine with extra cross-layer meaning.

Examples:

- what pages mean beyond file routing
- how branch docs and concept docs relate
- where FireUX adds canon that Nuxt does not provide

### `stacks/`

Stacks are real concepts because FireUX entities behave like runtime systems.

A stack may include:

- model truth
- read truth
- create, read, and update contracts
- interface and component surfaces
- page and console surfaces
- docs and drift checks

That is why stacks can contain shared CRUD docs and entity-specific stack docs.

### `connect/`

Connect remains a real concept because relationship and authority still cut across:

- public entity truth
- console overlays
- membership and profile links
- permissions and operator assumptions

## What Belongs Here

- cross-cutting runtime behaviour canon
- FireUX-specific contracts that span multiple runtime layers
- terminology that should not live only in branch docs or model docs

## What Does Not Belong Here

- package-local implementation notes
- per-page route notes
- per-component styling or local UI guidance
- model family canon that already belongs in `runtime/models/`

## Roadmap To Reconciliation

1. Keep `console/`, `spine/`, and `stacks/` as the main organizing buckets.
2. Keep branch docs as branch docs.
3. Keep model docs as model docs.
4. Use concepts only when FireUX meaning crosses those boundaries.

## Short Version

`runtime/concepts/` is the FireUX bolt-on layer over the Nuxt runtime spine.

Right now, the clearest buckets are:

- `console/`
- `spine/`
- `stacks/`

with `connect/` still acting as a shared relationship and authority concept across them.
