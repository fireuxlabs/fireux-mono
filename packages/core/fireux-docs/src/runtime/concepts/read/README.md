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

## Read Primitives

### Single Read

Read one record or one resolved detail source.

Common seam:
- `use*Fetch.ts`

Contract:
- fetch one thing
- make the truth layer clear
- return a stable detail surface for the consumer

Important:
- not every `use*Fetch.ts` in the repo is a direct one-doc reader
- some older `use*Fetch.ts` files are collection-backed or composite read facades
- when that happens, the file must make its fetch family explicit rather than pretending to be a direct doc fetch

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

## Current `use*Fetch` Implementation Families

The top-level pressure is still sameness:
- `use*Fetch.ts` should feel like one team wrote it

But repeated differences in the repo prove a few real implementation families.

### Direct Single Fetch

Behavior:
- bind or fetch one canonical record
- expose a single resolved record ref
- usually exposes `pending`, sometimes `error`

Examples:
- `useAppFetch`
- `useUserFetch`
- `useUserByHandleFetch`
- `useRecipeFetch`
- `usePlacesFetch`

### Collection-backed Selector Fetch

Behavior:
- read a collection once
- expose the plural collection
- also expose a singular selector seam so callers do not all `find()` locally

Expected pattern:
- plural collection surface such as `products` or `orders`
- singular selector such as `product(id)` or `order(id)`

Examples:
- `usePortfolioFetch`
- `useSupplierFetch`
- `useIngredientFetch`
- `useKitchenIngredientFetch`
- `useKitchenOrderFetch`
- `useKitchenOrdersFetch`
- `useOrdersForKitchenFetch`

### Dual Read Facade

Behavior:
- expose both collection and single-record read seams
- often hydrates a canonical record with linked truth
- used where one entity already has a stable list-plus-detail read contract

Examples:
- `useCompanyFetch`
- `useKitchenFetch`
- `useBlogFetch`

### Identity Overlay Fetch

Behavior:
- read both core identity truth and app overlay truth
- expose core and overlay collections separately
- when using collection-backed identity reads, expose core and app selectors explicitly

Examples:
- `useChefFetch`
- `useAgentFetch`
- `useProfessionalFetch`
- generic base seam: `useProfileFetch`

### Composite Scoped Reader

Behavior:
- read multiple scoped child collections or merge multiple read paths
- return a resolved operational surface rather than pretending to be a single doc

Examples:
- `useKitchenMenuStackFetch`
- `useKitchenSupplierFetch`

## Current `use*Fetch` Matrix

| File | Family | Truth layer | Notes |
| --- | --- | --- | --- |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch.ts` | Direct single fetch | System | One app record with pending state |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts` | Identity overlay fetch | Identity | Generic base seam for profile core + app overlay |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserByHandleFetch.ts` | Direct single fetch | Identity | Single-user resolver via handle, then canonical user fetch |
| `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch.ts` | Direct single fetch | Identity | Core user plus app user overlay |
| `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/fetch/useBlogFetch.ts` | Dual read facade | Public entity / managed | Sorted collection plus slug fetch |
| `packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/fetch/useCompanyFetch.ts` | Dual read facade | Public entity | Place-backed list and single hydrated company |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/fetch/useJobFetch.ts` | Direct single fetch | Public entity / managed | Single job hydrated with kitchen read model |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentFetch.ts` | Identity overlay fetch | Identity | Core and app agent collections plus selectors |
| `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalFetch.ts` | Identity overlay fetch | Identity | Core and app professional collections plus selectors |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/fetch/useIngredientFetch.ts` | Collection-backed selector fetch | Scoped child | Global ingredient collection plus selector |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch.ts` | Dual read facade | Public entity | Place-backed list and single hydrated kitchen |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefFetch.ts` | Identity overlay fetch | Identity | Core and app chef collections plus selectors |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/ingredients/fetch/useKitchenIngredientFetch.ts` | Collection-backed selector fetch | Scoped child | Kitchen ingredient collection plus selector |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/orders/fetch/useKitchenOrderFetch.ts` | Collection-backed selector fetch | Scoped child | Kitchen-scoped order collection plus selector |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/orders/fetch/useKitchenOrdersFetch.ts` | Collection-backed selector fetch | Scoped child | Kitchen order view via orders package plus selector |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/recipe/fetch/useRecipeFetch.ts` | Direct single fetch | Scoped child | Single recipe inside selected or explicit kitchen scope |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/stack/fetch/useKitchenMenuStackFetch.ts` | Composite scoped reader | Scoped child | Multi-collection kitchen stack read |
| `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/suppliers/fetch/useKitchenSupplierFetch.ts` | Composite scoped reader | Scoped child + overlay | Link collection merged with canonical supplier records |
| `packages/extensions/fireux-orders/src/runtime/composables/useOrdersForKitchenFetch.ts` | Collection-backed selector fetch | Scoped child | Scope-aware kitchen orders plus legacy merge and selector |
| `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/fetch/usePlacesFetch.ts` | Direct single fetch | Public entity | Singular place helper despite plural filename |
| `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/fetch/useProductFetch.ts` | Collection-backed selector fetch | Public entity / managed | Product collection plus selector |
| `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/fetch/usePortfolioFetch.ts` | Collection-backed selector fetch | Public entity / workspace | Portfolio collection plus selector |
| `packages/extensions/fireux-suppliers/src/runtime/composables/supplier/useSupplierFetch.ts` | Collection-backed selector fetch | Public entity / workspace | Hydrated supplier collection plus selector |

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
- `usePlacesFetch` still carries a plural filename even though it is a direct single helper
- some read-model helpers, such as runtime kitchen computed state, need careful placement between overlay truth and convenience state
- some composite scoped readers, such as kitchen supplier and kitchen stack reads, may want future naming cleanup once the fetch canon settles

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
