# Entity Report

Authority: working canon audit
Updated: 2026-03-16

## Purpose

This report audits entity design across FireUX Mono so entity canon, allowed variation, and real drift are visible in one place.

Strong rule:

An entity should have one clear primary residence, one clear identity rule, one clear data-loading pattern, and one clear set of supported surfaces. When the repo intentionally breaks that pattern, it should be explicit whether the exception is a profile overlay, a runtime-scoped composite, or a read-only scenario record.

## Executive Summary

The repo is more aligned than it first appears.

The main system already follows a stable pattern:
- Canonical entities live in one package that owns their model, fetch layer, mutations, pages, and interface helpers.
- Index pages are mostly client-side Firestore surfaces built around CTA plus CollectionManager.
- Runtime-selected console entities use explicit runtime state rather than ad hoc route params.
- Profile-style entities intentionally split into core and app overlay docs and then hydrate through shared profile collection utilities.

Most of the remaining complexity comes from four specific causes, not from a broken entity system:
- Profile overlays are mixed in with normal entities during horizontal scans.
- Kitchen runtime data includes nested operational entities that are not meant to behave like top-level universal entities.
- Property read-only scenarios include several realistic records that are not yet canonical production entities.
- A few ecosystem-specific or legacy surfaces still exist as scaffolds, re-exports, or partial implementations.

Highest-priority drift found in this audit:
1. Recipe in Misebox is scaffolded as a page/component family without a confirmed model residence in the current package tree.
2. Supplier and some profile entities still expose duplicate-looking residences through re-export wrappers, which makes horizontal comparison noisier than the underlying architecture really is.
3. CTA and index-page patterns are mostly aligned but not yet uniformly normalized around EntityIndexCta across all entity families.
4. Runtime consoles for project, kitchen, and portfolio use normalized state files, while supplier console behavior is still profile-console driven rather than a first-class runtime selection state.
5. Properties includes meaningful demo-only entities such as tenant, lease, maintenance, and financial transaction/signal records that should not yet be treated as production canon.

## Canon Rules Used In This Audit

Tier1 and Tier2 sources used:
- docs/fireux-canon.md
- docs/runtime-contract.md
- docs/README.md
- packages/extensions/fireux-jobs/docs/contract.md
- packages/extensions/fireux-kitchens/docs/contract.md
- packages/extensions/fireux-suppliers/docs/contract.md

Audit rules derived from those sources:
- Extensions own domain logic.
- Runtime state is the single source of truth for active console/runtime selection.
- No silent fallback across identity or runtime modes.
- Entity index pages using Index plus CollectionManager are client-side Firestore surfaces.
- Public and internal identity should be explicit: slug when intentionally public, id when operational/internal.
- Named exceptions are allowed, but they should remain visible as exceptions rather than becoming accidental canon.

## Entity Inventory Table

| Family | Primary Entities | Primary Residence | Status |
| --- | --- | --- | --- |
| Core system | App, User, Profile, Ecosystem, Project | packages/core/fireux-core | Canonical |
| Kitchens | Kitchen, Ingredient, KitchenIngredient, Dish, Menu, KitchenMiseTask, Chef | packages/extensions/fireux-kitchens | Canonical with runtime composites |
| Jobs | Job, Agent, Professional | packages/extensions/fireux-jobs | Canonical with profile overlays |
| Suppliers | Supplier | packages/extensions/fireux-suppliers | Canonical with profile overlays |
| Places | Place | packages/extensions/fireux-places | Canonical |
| Companies | Company | packages/extensions/fireux-companies | Canonical |
| Products | Product | packages/extensions/fireux-products | Canonical |
| Blogs | BlogPost | packages/extensions/fireux-blogs | Canonical |
| Documents | Document, DocumentLink | packages/extensions/fireux-documents | Canonical |
| Compliance | ComplianceRecord, ComplianceItemType | packages/extensions/fireux-compliance | Canonical |
| Tasks | Task | packages/extensions/fireux-tasks | Canonical |
| Properties | Portfolio, Property, Unit, Client | packages/extensions/fireux-properties | Canonical |
| Property scenarios | Tenant, Lease, MaintenanceTicket, FinancialSignals, FinancialTransaction | fireux-properties read-only scenarios | Read-only/demo only |
| Orders | Order | packages/extensions/fireux-orders | Canonical but scope-specific |
| Misebox recipes | Recipe | packages/ecosystem/fireux-misebox | Partial/scaffold |

## Entity-By-Entity Audit

### Core system

Core entities are the cleanest and most legible part of the repo.

Observed pattern:
- Models live under core runtime models.
- Fetch composables live under core Firestore fetch paths.
- Shared indexes use a CTA plus CollectionManager pattern.
- Apps now follow the intended canon: shared core page, client-side collection manager, no separate console-runtime semantics.

Assessment:
- Strongly aligned.
- Good reference pattern for future normalization.

### Kitchens

Kitchen is canonical, but it contains both top-level and runtime-composite entities.

Top-level or globally legible entities:
- Kitchen
- Ingredient
- Chef

Runtime-composite entities:
- Menu
- Dish
- KitchenIngredient
- KitchenMiseTask
- Kitchen order flows

Important distinction:
- Kitchen is a console runtime family with explicit state and mode handling.
- Menu and dish are operational children of the active runtime, not independent ecosystem-wide top-level records in the same sense as App, Place, or Company.

Assessment:
- Canonical structure is sound.
- Horizontal entity audits should continue treating kitchen children as runtime composites, not universal entity families.

### Jobs, Agent, Professional

Jobs is a normal canonical entity. Agent and Professional are profile overlays.

Observed pattern:
- Contract explicitly declares Job, Agent, and Professional as core entities for the jobs domain.
- The fetch layer hydrates via useProfileCollection and merges global plus local app overlays.
- Creation follows the same two-layer pattern: core profile doc first, app overlay doc second when tenant/app scoped.

Assessment:
- Architecturally coherent.
- Should remain documented as profile overlays to avoid being mistaken for duplicated entities.

### Supplier

Supplier behaves like the jobs profile overlays more than like a standalone runtime entity.

Observed pattern:
- Supplier contract is clear.
- Supplier fetch is profile-collection based and merges core plus app overlays.
- Some paths use profile residence while others use supplier re-export wrappers.

Assessment:
- Canonical enough to operate.
- Still noisier than necessary in path structure and package presentation.

### Places, Companies, Products, Blogs, Documents, Compliance, Tasks

These families mostly follow the expected package-owned entity pattern.

Observed pattern:
- Single owning package.
- Model plus fetch layer plus mutations plus pages.
- Collection-manager-based index surfaces.
- Less conceptual drift than kitchens or profile overlays.

Assessment:
- Good examples of standard package-owned entities.

### Properties

Portfolio, Property, Unit, and Client are the canonical property-domain entities currently implemented.

Observed pattern:
- Portfolio is the active console runtime family.
- Property and Unit are canonical records in the property domain.
- Client is canonical but already blends direct Firestore and scenario-derived normalization logic.

Assessment:
- Canonical set is viable.
- The read-only scenario layer has grown large enough that it now needs to stay explicitly fenced from production canon.

### Read-only property scenario entities

These are meaningful records, but they are not yet production-canonical entities in this repo:
- Tenant
- Lease
- MaintenanceTicket
- FinancialSignals
- FinancialTransaction

Evidence:
- They exist as explicit types under read-only scenario shared types.
- Client collection logic derives usable client records from scenario tenants and leases when runtime mode is read-only.
- Finance and incidents pages visibly describe their source as read-only scenario data or future portfolio subpaths.

Assessment:
- Useful and intentional.
- Should remain labeled as scenario-only until real model residence, fetch composables, mutation entrypoints, and Firestore path canon exist.

### Orders

Order exists as a real entity family but spans two operational contexts:
- kitchen operational order behavior
- extension-level checkout/order workflow behavior

Assessment:
- Acceptable if one is treated as the operational source and the other as workflow/presentation support.
- Worth watching so the concept does not split into competing order canons.

### Misebox Recipe

Recipe is the clearest incomplete family in the repo.

Observed pattern:
- Misebox has recipe pages, recipe UI cards, collection manager, interface helpers, and CRUD-named composables.
- The recipes index currently returns an empty computed collection.
- File searches did not confirm a current model residence under the expected runtime models path.

Assessment:
- This is scaffold drift, not full canon.
- It should either be completed into a real entity family or explicitly marked as deferred/experimental.

## Cross-Entity Pattern Audit

### Pattern 1: Package-owned canonical entity

Best examples:
- App
- Place
- Company
- Product
- BlogPost
- Document
- ComplianceRecord
- Task

Common shape:
- one owning package
- clear model file
- fetch composables
- write composables
- interface/view helper
- CTA and CollectionManager surfaces
- index page and detail/edit pages where applicable

Assessment:
- This is the healthiest repeatable pattern in the repo.

### Pattern 2: Profile overlay entity

Examples:
- Agent
- Professional
- Chef
- Supplier

Common shape:
- core profile document
- optional app overlay document
- hydrated through profile collection helpers
- user-attached semantics

Assessment:
- Good pattern, but it needs stronger naming discipline so a horizontal scan immediately reads these as overlays rather than as duplicate independent entities.

### Pattern 3: Runtime composite entity

Examples:
- Menu
- Dish
- KitchenIngredient
- KitchenMiseTask

Common shape:
- active runtime required
- console/runtime page depends on selected scope state
- children rendered through runtime data bundle or runtime-specific helpers

Assessment:
- Correct for kitchen operations.
- Should not be forced into the same audit expectations as top-level global entities.

### Pattern 4: Read-only scenario entity

Examples:
- Tenant
- Lease
- MaintenanceTicket
- FinancialSignals
- FinancialTransaction

Common shape:
- typed scenario data
- no full production model residence
- no mutation canon
- pages can render them in read-only mode

Assessment:
- Valid as scenario realism.
- Risk appears when scenario entities are mistaken for completed production entities.

## Path Alignment Audit

### Aligned paths

Strongly aligned:
- Core system entities under packages/core/fireux-core
- Jobs entities under packages/extensions/fireux-jobs
- Kitchen entities under packages/extensions/fireux-kitchens
- Property entities under packages/extensions/fireux-properties

Why this works:
- package ownership is legible
- path shapes largely match domain boundaries
- fetch and page locations are predictable

### Path noise and drift

#### Supplier

Supplier uses both profile-style and supplier-style pathing through re-exports.

Impact:
- increases audit noise
- obscures the real primary residence
- makes supplier look more duplicated than it is

Recommendation:
- choose one canonical visible residence for Supplier and keep compatibility re-exports thin and temporary

#### Profile overlays generally

Agent, Professional, Chef, and Supplier all conceptually belong to the profile-overlay family, but their path presentation is not perfectly uniform.

Impact:
- harder to compare profile families side by side
- easier to misread overlay docs as competing models

Recommendation:
- standardize visible conventions for profile overlay directories and re-exports

#### Recipe

Recipe surfaces exist in Misebox, but model residence is not clearly present in the current package tree.

Impact:
- breaks the otherwise reliable “model first” scan pattern
- creates ambiguity around whether recipes are real canon, kitchen-derived canon, or ecosystem-only scaffolding

Recommendation:
- either add an explicit model residence and real collection source or remove/defer the route family until it is canonical

## Profile Extension Audit

Profile overlays currently behave as a coherent subclass of entity:
- Agent
- Professional
- Chef
- Supplier

Shared characteristics:
- user-linked identity
- core plus app overlay split
- creation ensure flow rather than pure document create
- hydrated read path rather than raw collection-only path

This is a strong pattern and should be named more explicitly in canon docs as a first-class entity style.

Current weakness:
- profile overlays are implemented coherently but documented and surfaced inconsistently enough that audits still have to reconstruct the pattern manually.

Recommendation:
- add a short reusable “profile overlay entity” pattern note to canon docs and keep all four families aligned to it

## Runtime / Consolable Entity Audit

Current fully recognizable runtime state families:
- Project
- Kitchen
- Portfolio

Shared behavior:
- cookie-backed state
- normalized id plus mode
- explicit set and clear helpers
- live/test/read-only mode semantics

Supplier is different.

Observed behavior:
- supplier console currently builds from profile fetch plus scope-console helpers
- it does not present the same first-class runtime selection state shape as project, kitchen, and portfolio

Assessment:
- workable for current behavior
- weaker than the normalized runtime-state families

Recommendation:
- either keep supplier explicitly non-runtime and document that exception, or promote it to a true runtime selection family with state parity

## CTA And Empty-State Audit

### What is working

Entity indexes increasingly follow a strong shared pattern:
- page header
- EntityIndexCta or local CTA
- CollectionManager

Good examples:
- apps index uses EntityIndexCta plus AppCollectionManager
- places index uses EntityIndexCta, PlaceCTA, and PlaceCollectionManager

### What is drifting

Not all entity families are using the same CTA vocabulary.

Observed variants:
- some indexes use EntityIndexCta
- some use only entity-specific CTA components
- some combine both
- some older surfaces still feel individually composed rather than canonically assembled

Assessment:
- not a major architectural problem
- still a meaningful consistency target because CTA plus empty-state behavior shapes how new entities get built

Recommendation:
- settle on a default recipe for entity index pages:
  - page header
  - EntityIndexCta for source/family/count framing
  - optional entity-specific CTA for create/help actions
  - CollectionManager for browsing

## Duplicate Residence And Consolidation Watchlist

### High priority

1. Recipe in Misebox
- UI exists without a clearly confirmed model residence or live collection source.

2. Supplier visible residence
- re-export layering obscures the main path.

3. Supplier runtime exception
- console behavior differs from project/kitchen/portfolio runtime-state pattern.

### Medium priority

4. Profile overlay consistency
- Agent, Professional, Chef, and Supplier should read as one explicit pattern family.

5. Order family boundaries
- kitchen-order behavior and extension-order behavior should remain intentionally separated.

6. CTA normalization
- index pages are close, but not yet fully standardized.

### Low priority

7. Scenario-entity promotion plan
- tenant, lease, maintenance, and financial records need either canon promotion or continued clear demotion to demo-only status.

## Development Q&A

### Is the entity system fundamentally broken?

No. The repo already has a usable canon. The real issue is that three legitimate patterns coexist:
- standard package-owned entities
- profile overlays
- runtime/scenario composites

When those are not labeled clearly, the repo looks more fragmented than it is.

### Which pattern should new entities follow by default?

Default to the package-owned canonical entity pattern unless there is a real reason to be profile-overlay or runtime-composite.

### Which entities are not ready to be treated as full canon?

The clearest current non-canonical or partial families are:
- Recipe in Misebox
- Tenant
- Lease
- MaintenanceTicket
- FinancialSignals
- FinancialTransaction

### Which areas are healthiest and should be copied?

Best reference families today:
- App
- Place
- Company
- Product
- BlogPost
- Document
- ComplianceRecord
- Task

## Resolution Plan

1. Publish a short entity taxonomy in canon docs.
Define and name the four entity styles: canonical package-owned, profile overlay, runtime composite, and read-only scenario.

2. Normalize profile overlay presentation.
Unify visible path conventions for Agent, Professional, Chef, and Supplier, and keep re-export wrappers temporary and thin.

3. Decide Recipe.
Either complete Recipe as a real Misebox entity with model, fetch, and live collection source, or remove/defer the current scaffold.

4. Decide Supplier runtime status.
Either explicitly preserve supplier as a profile-console exception or promote it to the same runtime-state pattern used by project, kitchen, and portfolio.

5. Standardize index page assembly.
Adopt EntityIndexCta plus entity CTA plus CollectionManager as the default index recipe.

6. Fence scenario-only entities.
Keep tenant, lease, maintenance, and financial entities clearly documented as read-only/demo until production path and mutation canon exist.

7. Review order-family ownership.
Make sure kitchen order behavior and extension-level checkout flow remain one coherent source of truth instead of drifting into parallel order systems.

## Audit Method

This report was built from:
- Tier1 and Tier2 canon reads
- extension contract reads
- repo-wide entity inventory scan
- targeted reads of runtime state files
- targeted reads of fetch, create, and index page surfaces
- targeted reads of read-only property scenario types

Interpretation rule used in this report:

The existence of a page or component family alone does not make an entity canonical. For an entity to count as canonical in this audit, it should have a stable identity rule, a visible model residence, a real data-loading path, and a coherent role in runtime or public surfaces.