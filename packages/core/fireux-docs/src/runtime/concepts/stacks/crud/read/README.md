# Read Concept

Authority: Operational
Updated: 2026-04-11
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

Useful simplifier:

- `root` read = canonical entity read
- `not root` read = either app-scoped overlay read or scoped child read

Important:

- the console itself is not a root entity
- app-scoped read is the hosted console over a public entity

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

## Canon Spine

Current canon for domain/entity reads:

- `useXFetch.ts`
  - fetch one root `X`
- `useXCollection.ts`
  - fetch many root `X`
- `useXInterface.ts`
  - shape fetched truth for UI use
- optional `useXProfileView.ts`
  - build a richer dedicated profile view model when the profile surface needs
    more than the thin interface seam should carry

Important:

- `useXDocument.ts` is not a generic cross-repo canon seam
- if a domain keeps a `useXDocument.ts` file, treat it as a local helper, not as the primary read primitive
- the primary cross-repo read primitives are `useXFetch`, `useXCollection`, and `useXInterface`
- `useXProfileView` is currently an early second-layer seam, not a universal
  base primitive

Hydration rule:

- hydration is a read concern, never a model concern
- root models store root fields and explicit links such as `place_id`
- `useXFetch` and `useXCollection` stay plain by default
- hydration is allowed only when a root entity is explicitly backed by another root entity
- current declared example:
  - `Kitchen` may hydrate from `Place`
- future entities may do the same only when the dependency is explicit and documented

## Read Primitives

### Single Read

Read one record or one resolved detail source.

Common seam:

- `use*Fetch.ts`

Contract:

- fetch one thing
- make the truth layer clear
- return a stable detail surface for the consumer
- optionally hydrate only when that domain has an explicitly declared linked-root dependency
- do not use this seam for collection reads

### Collection Read

Read many records for browse, search, list, or manager surfaces.

Common seams:

- `use*Collection.ts`

Contract:

- browse many things
- stay clear about collection scope
- do not pretend a collection fetch is a detail fetch
- optionally hydrate only when that domain has an explicitly declared linked-root dependency

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
- let components choose the fields they need from the returned interface object
- allow thin families to reuse the base `interface` object for all display seams
- allow richer families to specialize `pill`, `cell`, `preview`, or `profile` where that family genuinely needs it
- do not become a hidden write target

Family note:

- shared `useXInterface` family canon now lives in `runtime/concepts/stacks/crud/read/useXInterface/`
- use that doc set when deciding whether a seam is Family 1, 2, or 3

### Profile View Read

Expose a richer dedicated profile model when a profile surface genuinely needs
more than the thin interface seam should carry.

Common seam:

- `use*ProfileView.ts`

Contract:

- compose already-fetched truth
- compose the thin interface card when useful
- return one stable model for `Profile.vue`
- stay read-only
- do not replace `useXInterface`

Status note:

- this is early canon, not a fully frozen universal seam yet
- shared guidance now lives in
  `runtime/concepts/stacks/crud/read/useXProfileView/`

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

### App-scoped Read

Read the app-scoped operational layer.

Examples:

- `apps/<appId>/kitchens/<id>`
- `apps/<appId>/suppliers/<id>`
- `apps/<appId>/portfolios/<id>`

For console-backed domains, this is the same thing as reading the hosted console for that entity inside an app.

### Scoped Child Read

Read children owned by a console or parent operational record.

Examples:

- `apps/<appId>/kitchens/<id>/recipes/<recipeId>`
- `apps/<appId>/kitchens/<id>/orders/<orderId>`
- `apps/<appId>/portfolios/<id>/documents/<documentId>`
- `apps/<appId>/portfolios/<id>/tasks/<taskId>`
- `apps/<appId>/portfolios/<id>/properties/<propertyId>`

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

For ecosystem apps with a registry split:

- read `project` and `ecosystem` from `(default)`
- read canonical `apps` and ordinary operational collections from the named operational database

Do not blur:

- registry/public-mirror reads
- operational domain reads

## Current Read Families

Canon read families are now simpler:

### Canon Single Fetch

Behavior:

- fetch one root record
- expose one resolved record ref
- expose `pending`

Common seam:

- `useXFetch.ts`

### Canon Collection Fetch

Behavior:

- fetch many root records
- expose the plural collection
- expose `count`
- expose `pending`

Common seam:

- `useXCollection.ts`

### Interface / View Shaping

Behavior:

- shape fetched truth for UI use
- normalize titles, images, pills, cards, and search text

Common seam:

- `useXInterface.ts`

### Explicit Hydration Helper

Behavior:

- perform extra linked reads where a root entity is explicitly backed by another root entity
- stay visibly special
- do not redefine the canon seam

Examples:

- kitchen helpers that hydrate `Kitchen` from `Place`

Important:

- generic `useXDocument.ts` is not part of the canon spine
- if such helpers exist, they should be treated as local read helpers, not as the standard pattern

## Current `use*Fetch` Matrix

| File                                                                                                                                          | Family                                     | Truth layer               | Notes                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------- | ----------------------------------------------------------------------------------- |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch.ts`                                            | Direct single fetch                        | System                    | One app record with pending state                                                   |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts`                                    | Identity overlay fetch                     | Identity                  | Generic base seam for profile core + app overlay                                    |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserByHandleFetch.ts`                                  | Direct single fetch                        | Identity                  | Single-user resolver via handle, then canonical user fetch                          |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch.ts`                                          | Direct single fetch                        | Identity                  | Core user plus app user overlay                                                     |
| `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/fetch/useBlogFetch.ts`                                        | Dual read facade                           | Public entity / managed   | Sorted collection plus slug fetch                                                   |
| `packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/fetch/useCompanyFetch.ts`                              | Dual read facade                           | Public entity             | Place-backed list and single hydrated company                                       |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/fetch/useJobFetch.ts`                                          | Direct single fetch                        | Public entity / managed   | Single job hydrated with kitchen read model                                         |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/fetch/useAgentFetch.ts`                              | Identity overlay fetch                     | Identity                  | Core and app agent collections plus selectors                                       |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/fetch/useProfessionalFetch.ts`                | Identity overlay fetch                     | Identity                  | Core and app professional collections plus selectors                                |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/fetch/useIngredientFetch.ts`                         | Collection-backed selector fetch           | Scoped child              | Global ingredient collection plus selector                                          |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch.ts`                               | Canon single fetch + allowed hydration     | Public entity             | Single kitchen fetch; may hydrate from `Place` because kitchen root is place-backed |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenCollection.ts`                          | Canon root collection read + allowed hydration | Public entity          | Kitchen collection; may hydrate from `Place` because kitchen root is place-backed   |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/fetch/useChefFetch.ts`                            | Identity overlay fetch                     | Identity                  | Core and app chef collections plus selectors                                        |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/ingredients/fetch/useKitchenIngredients.ts`     | Collection-backed selector fetch           | Scoped child              | Kitchen ingredient collection plus selector                                         |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/orders/fetch/useKitchenOrderFetch.ts`           | Collection-backed selector fetch           | Scoped child              | Kitchen-scoped order collection plus selector                                       |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/orders/fetch/useKitchenOrdersFetch.ts`          | Collection-backed selector fetch           | Scoped child              | Kitchen order view via orders package plus selector                                 |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/recipe/fetch/useRecipeFetch.ts`                         | Direct single fetch                        | Scoped child              | Single recipe inside selected or explicit kitchen scope                             |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/suppliers/fetch/useKitchenSupplierFetch.ts`     | Composite scoped reader                    | Scoped child + overlay    | Link collection merged with canonical supplier records                              |
| `packages/extensions/fireux-orders/src/runtime/composables/useOrdersForKitchenFetch.ts`                                                       | Collection-backed selector fetch           | Scoped child              | Scope-aware kitchen orders plus legacy merge and selector                           |
| `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/fetch/usePlaceFetch.ts`                                     | Direct single fetch                        | Public entity             | Canonical singular Place fetch seam                                                 |
| `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/fetch/useProductFetch.ts`                               | Collection-backed selector fetch           | Public entity / managed   | Product collection plus selector                                                    |
| `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/fetch/usePortfolioFetch.ts`                         | Canon single fetch                         | Public entity / workspace | Single portfolio fetch                                                              |
| `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/fetch/usePortfolioCollection.ts`                    | Canon collection fetch                     | Public entity / workspace | Portfolio collection                                                                |
| `packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/fetch/useSupplierFetch.ts`                            | Canon single fetch                         | Public entity / workspace | Single supplier fetch                                                               |
| `packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/fetch/useSupplierCollection.ts`                       | Canon collection fetch                     | Public entity / workspace | Supplier collection                                                                 |

## Alignment Strategy

Read alignment follows the same pressure pattern as the rest of CRUD:

- start by asking whether the same seam can work the same way everywhere
- where repeated domain nuance breaks that sameness, define a family
- once a family is real, keep it internally consistent

So the baseline goal is not:

- every file must be byte-for-byte identical

The actual goal is:

- every entity should start from the same canon seam
- every repeated hydration nuance should be declared explicitly
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

| File                                                                                                                                      | Family                          | Notes                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------- |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts`                               | Organization / workspace entity | System-owned workspace identity                      |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts`                             | Identity / people profile       | Core user identity surface                           |
| `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/utils/view/useRecipeInterface.ts`                      | Content / opportunity           | Public recipe presentation                           |
| `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/utils/view/useBlogInterface.ts`                           | Content / opportunity           | Listing and teaser-first content surface             |
| `packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface.ts`                 | Place-based public entity       | Place-backed public company surface                  |
| `packages/extensions/fireux-compliance/src/runtime/composables/fireux/console/portfolio/Operations/Compliance/utils/view/useComplianceInterface.ts` | Console operational child       | Portfolio-scoped operational record                  |
| `packages/extensions/fireux-documents/src/runtime/composables/fireux/console/portfolio/Operations/Documents/utils/view/useDocumentInterface.ts` | Console operational child       | Portfolio-scoped document record                     |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/utils/view/useJobInterface.ts`                             | Content / opportunity           | Managed opportunity surface                          |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface.ts`                 | Identity / people profile       | Agent public profile surface                         |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface.ts`   | Identity / people profile       | Professional public profile surface                  |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/utils/view/useIngredientInterface.ts`            | Console operational child       | Kitchen-scoped inventory child                       |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface.ts`                  | Place-based public entity       | Place-backed public kitchen surface                  |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface.ts`               | Identity / people profile       | Chef public profile surface                          |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/dish/utils/view/useDishInterface.ts`                | Console operational child       | Kitchen console menu child                           |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/menu/utils/view/useMenuInterface.ts`        | Console operational child       | Kitchen console menu summary                         |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mise/utils/view/useMiseEnPlaceInterface.ts` | Console operational child       | Kitchen console mise child                           |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/recipe/utils/view/useRecipeInterface.ts`            | Console operational child       | Kitchen-owned recipe surface                         |
| `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/utils/view/usePlaceInterface.ts`                        | Place-based public entity       | Canonical public place surface                       |
| `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/utils/view/useProductInterface.ts`                  | Content / opportunity           | Product listing and offering surface                 |
| `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/client/utils/view/useClientInterface.ts`        | Console operational child       | Portfolio-scoped client record                       |
| `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface.ts`            | Organization / workspace entity | Workspace identity, currently thin                   |
| `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/property/utils/view/usePropertyInterface.ts`    | Console operational child       | Portfolio property record                            |
| `packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface.ts`               | Organization / workspace entity | Public organization surface with workspace crossover |
| `packages/extensions/fireux-tasks/src/runtime/composables/fireux/console/portfolio/Operations/Tasks/utils/view/useTaskInterface.ts`       | Console operational child       | Portfolio task record                                |

## Current Edges To Watch

These are not necessarily wrong, but they are the first places to inspect if read alignment starts drifting:

- `Supplier` sits between public organization and console workspace
- `Portfolio` is correctly in the organization/workspace family, but still thinner than it probably wants to be
- `Recipe` is currently split across two distinct presentation jobs:
  - public or content recipe
  - console or kitchen-owned recipe
- console operational children do not all need identical richness, but they should stay clearly scoped and should not quietly imitate place-based public entities

## Current Composable-first Family Map

The current active read pass is fetch-first.

The mirrored working set currently focuses on:

- `use*Fetch.ts`

This is the right read seam to inspect now because it shows:

- which truth layer is being fetched
- whether the seam is direct, collection-backed, dual, or composite
- where consumers are being forced to improvise local selectors

### Identity Read

Read the user, profile, or role-facing identity layer.

Examples:

- `useUserFetch`
- `useChefFetch`
- `useAgentFetch`
- `useProfessionalFetch`

## Read-time Rules

1. `use*Fetch` must make its implementation family explicit.
2. Collection-backed fetchers should expose a singular selector seam instead of forcing local `find()` drift into callers.
3. `use*Collection` should mean many things, not a disguised detail read.
4. `use*Interface` should expose a stable read shape, not become a hidden mutation layer.
5. `use*Computed` should stay derived and should not redefine stored truth.
6. Hydrated fields must stay visibly hydrated.
7. Public truth and app-scoped overlay truth must not get blurred.
8. Scoped child reads should stay owned by their console or parent seam.

## Current Seams To Watch

- generic profile base reads in `fireux-core` are still foundational and need deliberate placement
- Place now uses `usePlaceFetch` as the canonical singular read helper
- some read-model helpers, such as kitchen console computed state, need careful placement between overlay truth and convenience state
- some composite scoped readers, such as kitchen supplier reads, may want future naming cleanup once the fetch canon settles

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
