# Read Concept

Authority: Operational
Updated: 2026-03-23
Scope: runtime read behaviour across `pages/`, `components/`, and `composables/`.

Learn how FireUX read behaviour works at runtime, what kind of truth is being read, and how resolved read shapes should be exposed.

## Read Concept

Read is a runtime concept, not just a detail page and not just a fetch composable.

Read spans:
- `runtime/pages/` for entry and audience
- `runtime/components/` for browse, preview, detail, and management surfaces
- `runtime/composables/` for fetch, collection, interface, and computed seams
- sometimes `runtime/models/` to distinguish stored truth from hydrated or derived data

Use this README as the read authority.
Use the technical directories as supporting views.

## Core Principle

The main read question is not:
- where is the detail page?

The main read questions are:
- what kind of thing are we reading?
- which truth layer is it coming from?
- how resolved is the data by the time the UI sees it?

That means read canon should keep clear separation between:
- canonical stored truth
- app-scoped overlay truth
- scoped child truth
- hydrated or resolved convenience data
- computed read models

Do not confuse:
- a resolved view
- a preview card shape
- a hydrated linked field
- a computed convenience value

with the stored record that actually exists in Firestore.

## Read Primitives

### Single Read

Read one record or one resolved detail source.

Common seam:
- `use*Fetch.ts`

Contract:
- fetch one thing
- make the truth layer clear
- return a stable detail surface for the consumer

### Collection Read

Read many records for browse, search, list, or manager surfaces.

Common seams:
- `use*Collection.ts`
- some plural `use*Fetch.ts` helpers where the repo has older naming

Contract:
- browse many things
- stay clear about collection scope
- do not pretend a collection fetch is a detail fetch

### Interface / View Read

Expose a stable resolved shape for UI use.

Common seam:
- `use*Interface.ts`

Contract:
- normalize read output for the UI
- expose a predictable base interface shape
- expose the same top-level seams everywhere:
  - `interface`
  - `pill`
  - `cell`
  - `preview`
  - `profile`
  - `searchText`
- let components choose the fields they need from the returned interface object
- allow thin families to reuse the base `interface` object for all display seams
- allow richer families to specialize `pill`, `cell`, `preview`, or `profile` where that family genuinely needs it
- do not become a hidden write target

### Computed / Read-model

Expose derived convenience state on top of fetched truth.

Common seam:
- `use*Computed.ts`

Contract:
- derive convenience data only
- stay explicit that the result is computed, not stored truth

## Truth Layers

### Public Entity Read

Read the canonical public record.

Examples:
- `companies/<id>`
- `kitchens/<id>`
- `places/<id>`
- `suppliers/<id>`
- `portfolios/<id>`

### Console Overlay Read

Read the app-scoped operational layer.

Examples:
- `apps/<appId>/kitchens/<id>`
- `apps/<appId>/suppliers/<id>`
- `apps/<appId>/portfolios/<id>`

### Scoped Child Read

Read children owned by a console or parent operational record.

Examples:
- kitchen recipes
- kitchen orders
- portfolio documents
- portfolio tasks
- property units

### Identity Read

Read who the user is in the system.

Examples:
- `User`
- `Chef`
- `Agent`
- `Professional`

### System Read

Read system bootstrap or platform-owned records.

Examples:
- `App`
- `Project`
- `Ecosystem`

## Alignment Strategy

Read alignment follows the same pressure pattern as the rest of CRUD:
- start by asking whether the same seam can work the same way everywhere
- where repeated domain nuance breaks that sameness, define a family
- once a family is real, keep it internally consistent

So the baseline goal is not:
- every entity must look identical

The actual goal is:
- every entity should start from the same read contract pressure
- every repeated presentation nuance should become a family
- no entity should be special alone without a reason

This is especially true for `use*Interface.ts`.

All interface seams should expose the same top-level API.
But they do not all need the same richness.

## Current Interface Families

### Place-based Public Entity

Public real-world thing with place, media, contact, and identity.

Typical shape:
- rich `interface`
- real `pill`
- real `cell`
- real `preview`
- real `profile`

Entities:
- `Place`
- `Company`
- `Kitchen`

### Identity / People Profile

Person-facing public identity or profile surface.

Typical shape:
- avatar, display name, title, badges, summary first
- often thinner than place-based public entities
- still exposes the full top-level interface API
- canonical family fields:
  - `id`
  - `to`
  - `avatarUrl`
  - `secondaryAvatarUrl`
  - `displayName`
  - `title`
  - `badges`
  - `summary`
  - `handle`
  - `contactEmail`
  - `contactPhone`
  - `websiteUrl`

Entities:
- `User`
- `Chef`
- `Agent`
- `Professional`

### Organization / Workspace Entity

Non-person organization or workspace identity surface.

Typical shape:
- workspace or organization summary first
- medium richness
- often bridges public entity truth with operational context
- canonical family fields:
  - `id`
  - `to`
  - `avatarUrl`
  - `title`
  - `subtitle`
  - `badges`
  - `summary`
  - `status`
  - `shortName`
  - `ownerLabel`
  - `locationLabel`

Entities:
- `Supplier`
- `Portfolio`
- `App`

### Content / Opportunity

Read-first listing or teaser entity.

Typical shape:
- title, subtitle, image, excerpt, status, badges
- usually flatter than place-based entities
- often optimized for cards, listing, and teaser views
- canonical family fields:
  - `id`
  - `to`
  - `imageUrl`
  - `title`
  - `subtitle`
  - `summary`
  - `status`
  - `badges`

Entities:
- `BlogPost`
- `Product`
- `Job`
- public `Recipe`

### Console Operational Child

Console-owned record used inside work rather than as a public root identity.

Typical shape:
- scoped operational summary first
- may be rich or thin depending on the child entity
- should stay clearly owned by its console or parent runtime
- canonical family fields:
  - `id`
  - `to`
  - `imageUrl`
  - `title`
  - `subtitle`
  - `meta`
  - `status`
  - `badges`
  - `summary`

Entities:
- `Ingredient`
- `Dish`
- `Menu`
- `Mise`
- `Client`
- `Property`
- `Document`
- `ComplianceRecord`
- `Task`
- console `Recipe`

## Current `use*Interface` Implementation Families

The families above describe presentation jobs.
The implementation families below describe how the `use*Interface.ts` file itself behaves.

### Single-shape Mapper

Behavior:
- map one target into one base interface shape
- `pill`, `cell`, `preview`, and `profile` usually return that same shape
- components choose which fields to render

Examples:
- `App`
- `User`
- `BlogPost`
- `Product`
- `Job`
- `Portfolio`
- `Client`
- `Property`
- `Document`
- `ComplianceRecord`
- `Task`

### Joined Mapper

Behavior:
- first resolve or merge more than one source
- usually core record plus linked user or related identity context
- still returns one main interface shape

Examples:
- `Chef`
- `Agent`
- `Professional`
- `Supplier`

### Rich Projection Mapper

Behavior:
- `interface` is the base shape
- `pill`, `cell`, `preview`, or `profile` are real specialized projections
- used where one entity genuinely has multiple stable display projections

Examples:
- `Place`
- `Company`
- `Kitchen`
- `Ingredient`
- `Dish`
- `Menu`
- `Mise`

### Legacy Edge

Behavior:
- an older extra seam exists outside the main interface contract
- this should be removed rather than treated as canon

Recent example:
- old recipe `pillProps`

This pass removes that edge and treats the main interface contract as the only real contract.

## Current `use*Interface` Matrix

| File | Family | Notes |
| --- | --- | --- |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts` | Organization / workspace entity | System-owned workspace identity |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts` | Identity / people profile | Core user identity surface |
| `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/utils/view/useRecipeInterface.ts` | Content / opportunity | Public recipe presentation |
| `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/utils/view/useBlogInterface.ts` | Content / opportunity | Listing and teaser-first content surface |
| `packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface.ts` | Place-based public entity | Place-backed public company surface |
| `packages/extensions/fireux-compliance/src/runtime/composables/fireux/firestore/compliance/utils/view/useComplianceInterface.ts` | Console operational child | Portfolio-scoped operational record |
| `packages/extensions/fireux-documents/src/runtime/composables/fireux/firestore/documents/utils/view/useDocumentInterface.ts` | Console operational child | Portfolio-scoped document record |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/utils/view/useJobInterface.ts` | Content / opportunity | Managed opportunity surface |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface.ts` | Identity / people profile | Agent public profile surface |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface.ts` | Identity / people profile | Professional public profile surface |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/utils/view/useIngredientInterface.ts` | Console operational child | Kitchen-scoped inventory child |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface.ts` | Place-based public entity | Place-backed public kitchen surface |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface.ts` | Identity / people profile | Chef public profile surface |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/dish/utils/view/useDishInterface.ts` | Console operational child | Runtime kitchen menu child |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/menu/utils/view/useMenuInterface.ts` | Console operational child | Runtime kitchen menu summary |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/mise/utils/view/useMiseEnPlaceInterface.ts` | Console operational child | Runtime kitchen mise child |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/recipe/utils/view/useRecipeInterface.ts` | Console operational child | Kitchen-owned recipe surface |
| `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/utils/view/usePlacesInterface.ts` | Place-based public entity | Canonical public place surface |
| `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/utils/view/useProductInterface.ts` | Content / opportunity | Product listing and offering surface |
| `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/client/utils/view/useClientInterface.ts` | Console operational child | Portfolio-scoped client record |
| `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface.ts` | Organization / workspace entity | Workspace identity, currently thin |
| `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/utils/view/usePropertyInterface.ts` | Console operational child | Portfolio property record |
| `packages/extensions/fireux-suppliers/src/runtime/composables/supplier/useSupplierInterface.ts` | Organization / workspace entity | Public organization surface with workspace crossover |
| `packages/extensions/fireux-tasks/src/runtime/composables/fireux/firestore/tasks/utils/view/useTaskInterface.ts` | Console operational child | Portfolio task record |

## Current Edges To Watch

These are not necessarily wrong, but they are the first places to inspect if read alignment starts drifting:
- `Supplier` sits between public organization and console workspace
- `Portfolio` is correctly in the organization/workspace family, but still thinner than it probably wants to be
- `Recipe` is currently split across two distinct presentation jobs:
  - public or content recipe
  - console or kitchen-owned recipe
- console operational children do not all need identical richness, but they should stay clearly scoped and should not quietly imitate place-based public entities

## Current Composable-first Family Map

The first active read pass is composable-first.

The current mirrored working set focuses on:
- `use*Fetch.ts`
- `use*Collection.ts`
- `use*Interface.ts`
- `use*Computed.ts`
- `use*Record.ts`
- `use*List.ts`

Current primitive buckets in that pass:
- single read
- collection read
- interface or view read
- computed or read-model

Current truth-family buckets in that pass:
- system/bootstrap
- public entity or managed
- console-owned or scoped child
- identity/profile

This is the right first read pass because it shows where truth is actually being fetched and reshaped.

### Identity Read

Read the user, profile, or role-facing identity layer.

Examples:
- `useUserFetch`
- `useChefFetch`
- `useAgentFetch`
- `useProfessionalFetch`

## Read-time Rules

1. `use*Fetch` should mean one thing, not a hidden collection.
2. `use*Collection` should mean many things, not a disguised detail read.
3. `use*Interface` should expose a stable read shape, not become a hidden mutation layer.
4. `use*Computed` should stay derived and should not redefine stored truth.
5. Hydrated fields must stay visibly hydrated.
6. Public truth and app overlay truth must not get blurred.
7. Scoped child reads should stay owned by their console or parent seam.

## Current Seams To Watch

- generic profile base reads in `fireux-core` are still foundational and need deliberate placement
- some plural older names such as `usePlacesFetch` still behave more like collection reads
- some read-model helpers, such as runtime kitchen computed state, need careful placement between overlay truth and convenience state
- some console-owned child families, such as client, property, ingredient, and recipe, still need final family labeling in the read pass

## Roadmap To Reconciliation

1. Classify read composables by primitive first.
2. Then classify them by truth layer.
3. Keep public entity, overlay, scoped child, identity, and system reads distinct.
4. Make `use*Interface` and `use*Computed` predictable across similar entities.
5. Use read canon to tighten update canon later.

## Short Version

Read is about:
- what kind of thing we are reading
- which truth layer it comes from
- how resolved it is before the UI sees it

The current alignment target is not total sameness.
It is a small number of read families with stable contracts.
