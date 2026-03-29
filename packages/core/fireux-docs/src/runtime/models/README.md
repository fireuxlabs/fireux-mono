# Models Directory

Authority: Operational
Updated: 2026-03-29
Scope: `packages/*/fireux-*/src/runtime/models` and child directories under `models/*`.

Learn how FireUX runtime models are classified, how they are stored, and how future model decisions should be explained.

## Models Directory

`runtime/models/` contains the runtime model layer for FireUX packages.

This directory can contain:
- canonical root entities
- stored overlays for entities that genuinely have scoped truth
- app-hosted console overlays over root entities
- scoped operational entities owned by a console
- model support contracts that belong with runtime models

## Model Families

### Identity

Who is using the system.

Examples:
- `User`
- `Chef`
- `Agent`
- `Professional`

Identity models normally use root plus overlay storage:
- root canonical record
- app-scoped overlay only when real scoped stored state exists

Preferred model-file shape for identity models:
- `XModel`
- `AppXModel`
- `X`
- `AppX`
- `XCreateInput`
- `XUpdateInput`

### Console-backed Domain

Where people operate.

Examples:
- `Kitchen`
- `Portfolio`
- `Supplier`
- `Project`

Console-backed canon:
- root public entity
- app-scoped operational console overlay
- app-owned child records beneath that overlay when operational children exist

Public create creates the root public entity.
Console create ensures the app overlay and may create root first when missing.

Useful simplifier:
- `root` = the canonical public entity
- `not root` = either the app overlay or app-owned child records under it

Important:
- the console itself is not a root entity
- the app hosts a console over the public entity
- public richness can vary by family:
  - `Kitchen` can be rich and public-facing
  - `Portfolio` can be intentionally thin because much of its data is confidential
  - `Project` and `Supplier` can sit somewhere in between

Examples:
- `kitchens/<kitchenId>`
- `apps/<appId>/kitchens/<kitchenId>`
- `apps/<appId>/kitchens/<kitchenId>/menus/<menuId>`
- `apps/<appId>/kitchens/<kitchenId>/orders/<orderId>`
- `portfolios/<portfolioId>`
- `apps/<appId>/portfolios/<portfolioId>`
- `apps/<appId>/portfolios/<portfolioId>/properties/<propertyId>`
- `suppliers/<supplierId>`
- `apps/<appId>/suppliers/<supplierId>`
- `projects/<projectId>`
- `apps/<appId>/projects/<projectId>`

This is the current console canon.

### Console Ownership And Operator Profiles

For console-backed domains, the stored console ownership pattern is shared:

- the app-hosted overlay is the console record
- console authority is user-based through:
  - `admin_ids`
  - `join_requests`
  - `console_enabled`

Optional family-specific operator profiles do not replace that overlay pattern.

Examples:
- `Kitchen` may require or prefer `Chef` for live operation and presentation
- `Project` may later add a `ProjectLeader`-style profile
- `Portfolio` or `Supplier` may later add role-specific operator profiles

Current rule:
- operator profiles are prerequisites, enrichment, or presentation layers
- operator profiles are not the primary stored ownership model for the console overlay

Root ownership hints may still exist where useful:
- `Project.owner_user_id`
- domain claim fields such as `Place.claimed_by`

Those do not replace app-hosted overlay authority.

### System

What makes FireUX run.

Examples:
- `App`
- `Ecosystem`
- `Module`

System models are usually stored once at root.
If a console manages them, it should normally do so through a facade first, not by inventing a second stored overlay.

Preferred model-file shape for system models:
- `XModel`
- `X`
- `XCreateInput`
- `XUpdateInput`

### Domain Root

What exists independently of a console.

Examples:
- `Place`
- `Company`
- `Ingredient`
- `Job`
- `BlogPost`
- `Product`
- `Module`

These stay canonical at root unless real scoped stored truth appears later.

Root-first entities may still be filtered by app or ecosystem without duplicating storage.

Preferred scoping fields for root-first publishable/owned entities:
- `source_app_id`
- `source_ecosystem_id`
- `owner_type`
- `owner_id`
- `visibility`

Important:
- an app page showing "my jobs", "my products", or "my blog posts" does not justify app-local storage on its own
- keep the canonical record at root and filter at read time
- only introduce app-local storage when real local workflow state appears

### Scoped

What only exists because a console owns it.

A scoped model must declare:
- what console owns it
- whether it links to a root entity
- whether it is purely local to the console

Examples:
- Kitchen-scoped under `apps/<appId>/kitchens/<kitchenId>/...`:
  `Menu`, `Dish`, `Recipe`, `KitchenOrder`, `KitchenTeamMember`, `KitchenMiseTask`, `KitchenCostSnapshot`
- Portfolio-scoped under `apps/<appId>/portfolios/<portfolioId>/...`:
  `Property`, `Unit`, `Client`, `Document`, `DocumentLink`, `ComplianceRecord`, `Task`

## Overlay Versus Facade

### Overlay

A second stored scoped model.

Use an overlay only when scoped truth really exists.

For console-backed domains, the overlay is the app-hosted console for that root public entity.

Examples:
- `User` + `AppUser`
- `Kitchen` + `ConsoleKitchen`
- `Portfolio` + `ConsolePortfolio`
- `Supplier` + `ConsoleSupplier`
- `Project` + `ConsoleProject`

Preferred model-file shape for console-backed domains:
- `XModel`
- `ConsoleXModel`
- `X`
- `ConsoleX`
- `XCreateInput`
- `XUpdateInput`

The `User` model is the current reference pattern:
- `User`
- `AppUser`

Console-backed domain entities should use the same simple dual-model idea as `User`, but with console wording:
- one root canonical model
- one console overlay model

Field-discipline rule:
- keep the root model honest and compact
- keep the console overlay focused on app-hosted governance and access
- if a root model still carries legacy or confidential fields, simplify that in a focused cleanup pass rather than adding extra structural layers
- if a family needs a richer combined read shape, build that in fetch/runtime/interface layers rather than in the model file

Support rule:
- `meta`
  - shared storage/model support canon
- `meta-content`
  - typed content/config canon used by app content files

Do not merge `meta` and `meta-content`.

### Facade

A runtime, read, or console face of the same root entity.

Use a facade when a console is managing the entity but there is not yet a second stored scoped truth.

Examples for now:
- `App`
- `Ecosystem`
- `Module`

Do not invent stored models like `AppTenant`, `EcosystemProject`, or `ModuleProject` unless real scoped stored state appears.

UI-only types like pill props should not live under `runtime/models`.
If they are still useful, move them to shared package or runtime types instead.

## Child Directories

Child directories under `models/*` are in scope for this directory.

Important rule:
- child directory names are package-local organization seams
- they are not the primary canon

The primary canon is:
- family
- storage mode
- owner
- path

Current child-dir notes:
- `profiles/` is a real and useful pattern
- `core/`, `shared/`, and `system/` are package-local organization seams, not the main cross-repo family classification
- `shared/` and `supporting/` can become vague buckets if they are not kept tight

## What Belongs Here

- canonical runtime entity models
- stored overlay models where scoped truth is real
- console facades where managed state is read-only or derived
- scoped runtime entity models owned by a console
- model-adjacent runtime types that belong with their model
- shared runtime model support like stamps or small reusable protocols

## File Comment Rule

Each real model file should state:
- family
- storage mode
- path or scope
- owner console where relevant
- why the current choice is root, overlay, facade, or scoped

Each file should point back to this README so future changes can be made in one place first.

## Aligned In Repo

- `runtime/models/` is already the normal home for FireUX runtime models
- root, overlay, facade, and scoped models already coexist in runtime delivery space
- the repo already supports `User` and `Kitchen` as root plus overlay patterns
- the repo already supports `App`, `Ecosystem`, and `Module` as root models that may have console facades
- console canon now treats `Kitchen`, `Portfolio`, `Supplier`, and `Project` as root plus overlay entities
- console canon now also treats those overlays as user-owned by default, with optional family-specific operator profile prerequisites on top

## Not Aligned Yet

- some child directories still reflect older structure rather than the newer family model
- `shared/` and `supporting/` still need tighter boundaries
- some models still mix legacy flat stamps with newer nested stamps
- some paths are still implicit in implementation rather than clearly documented in the file header
- `Project` remains a system-console special case, even though it now follows the shared root-plus-overlay rule

## Roadmap To Reconciliation

1. Keep runtime models in `runtime/models/`.
2. Use this README as the decision point before changing model families or storage mode.
3. Update touched model files to explain family, storage mode, owner, and path.
4. Use overlays only when stored scoped truth is real.
5. Use facades when a console is managing a root entity without a second stored model.
6. Normalize the active shipping slice first, not the whole repo at once.

## Short Version

Runtime models belong here.

Each model should clearly say:
- what family it belongs to
- whether it is root, overlay, facade, or scoped
- who owns it
- why that decision was made

For console-backed domains, the clean storage rule is:
- root public entity
- app-hosted console overlay
- app-owned child records beneath that overlay
