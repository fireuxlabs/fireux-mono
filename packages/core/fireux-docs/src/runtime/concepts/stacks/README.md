# Stacks Concept

Authority: Operational
Updated: 2026-05-17
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

## Pattern-First Rule

Before adding an entity-specific file, route, or composable, ask which existing stack family it belongs to.

The default expectation is deliberate repetition:

```text
XModel          stores truth
useXFetch      reads one
useXCollection reads many
useXInterface  shapes UI
useXCreate     creates
useXUpdate     patches
useXDelete     removes
useXEnsure     bootstraps
useXConsole    selects and operates a workspace
dashboard      manages identity/profile extensions
```

The surrounding runtime surfaces then follow the same family:

- collection manager surfaces through the entity's organism collection manager when a browse/manage UI exists
- card/profile surfaces through the shared `Pill`, `Cell`, `Preview`, and `Profile` vocabulary where useful
- console adapters only for workspace/console entities
- dashboard/profile routes only for signed-in user identity and profile-extension work

Missing seams are alignment clues. They should usually prompt a small shared stack cleanup before app-local invention.

If a new repeated pattern appears, promote it into `docs/fireux-canon.md` and the relevant stack/concept doc before it spreads as copy-paste.

Use `pnpm audit:usex` to print a report-only map of current `useX` stack seams. The audit is intentionally non-blocking while existing entity stacks are being normalized.

## Public Entity Route Add-Ons

Shared entity routes should stay simple first: plural collection at `/xs`, public detail at `/xs/:publicKey`, and public operator bridge at `/xs/:publicKey/operator`.

Console entity routes use singular family roots, such as `/console/property` and `/console/property/overview`.

App-specific public experiences can add a named child route when the experience is real domain behaviour rather than a generic detail page. For example, BuenoHost uses `/properties/:slug/info` for public property information instead of overloading the property detail page.

Do not use `/admin` as a public entity operation route. Public target-operation bridges use `/operator`; app/platform administration uses admin language only inside actual admin surfaces.

When a child experience has a home plus sections, keep that distinction in runtime helpers rather than page-local filters. Prefer helpers like `getXHome()` and `getXSections()` so layouts, detail pages, QR targets, and smoke routes consume the same shape.

## Mode Matrix

The same stack DNA can appear in different modes. Do not force every mode to have every seam.

| Mode | What it means | Expected stack shape | Current examples |
| --- | --- | --- | --- |
| Root entity | Canonical stored thing | model, fetch-one, collection-many, interface, writes where allowed, collection/card surfaces where browsable | `App`, `Blog`, `Chef`, `Company`, `Dish`, `Ecosystem`, `Job`, `Kitchen`, `Portfolio`, `Product`, `Professional`, `Recipe`, `Supplier`, `User` |
| Console workspace entity | Root entity that can be selected and operated | root stack plus console selection/runtime surfaces | `Kitchen`, `Supplier`, `Portfolio`, `Project` |
| Identity/profile capability | Something a signed-in user can be or manage about themself | dashboard/profile routes and profile create/update/ensure; no console family by default | `Professional`, `Chef`, `Agent`, base `Profile` |
| App membership overlay | App-specific membership and capability for a user | app-user collection/update helpers and membership UI; not a root entity stack | `AppUser` |
| Scoped child entity | Operational record owned by a parent entity/workspace | parent-aware collection/fetch/writes; interface/card surfaces only where useful | `Task`, `Document`, `Compliance`, `PropertyUnit`, `PortfolioTask`, `PortfolioDocument`, `KitchenMise`, `KitchenOrder` |
| Root plus scoped usage | Root truth linked into a workspace by a scoped usage record | root collection/interface plus scoped relationship helper | `Ingredient` root plus `KitchenIngredient` usage records |
| System/adapter seam | Runtime helper around stack behaviour, not a stored domain entity | ensure/selection/adapter helpers; no full entity UI stack required | `Console`, `Firestore`, selection helpers |

## Create And Edit Modes

CRUD uses shared Firestore primitives, but user-facing create/edit flows are allowed to differ by mode.

| Mode | What it means | Current examples |
| --- | --- | --- |
| `quick-create` | Small form creates a real record immediately | `Company`, `Place`, `Ingredient`, simple profile/entity creates |
| `ensure-create` | Bootstrap/setup-if-missing and safe to rerun | `User`, `Profile`, `App`, `Ecosystem`, console target setup where canon allows |
| `draft-preview-create` | Local draft state, preview, then publish/create | `Product` |
| `onboarding-create` | Multi-step setup that may create an entity plus supporting config/assets | `App`, product onboarding flows |
| `simple-edit` | One root record is patched through entity update helpers | `Company`, `Place`, `Kitchen`, `Supplier`, `Portfolio`, `Job`, `Blog`, `Dish`, `Recipe` |
| `split-overlay-edit` | Edit is split because root truth and overlay truth are different records | `User` core/app edit, profile capability edits, root/scoped usage entities |
| `scoped-console-edit` | Edit happens inside a selected workspace and must carry parent/console context | `Kitchen`, `Supplier`, `Portfolio`, project/portfolio child records |

These modes explain why a stack can be conforming without being identical. A child record or adapter can be healthy with fewer seams if the missing seams are not part of its mode.

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
