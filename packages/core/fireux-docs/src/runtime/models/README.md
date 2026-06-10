# Models Directory

Authority: Operational
Updated: 2026-06-03
Scope: `packages/*/fireux-*/src/runtime/models` and child directories under `models/*`.

Learn how FireUX runtime models are classified, how they are stored, and how future model decisions should be explained.

Current repo truth:
- the main model families are normalized around simple stored-shape contracts
- model files describe stored things, not hydrated or read-time composites
- combined read shapes belong in fetch, runtime, and interface seams
- app initialization authority lives in app-local `AppUser` membership records; root app admin arrays are mirrors

## Models Directory

`runtime/models/` contains the runtime model layer for FireUX packages.

This directory can contain:
- canonical root entities
- stored app-scoped records for entities that genuinely have scoped truth
- app-scoped records over root entities
- scoped operational entities owned by an app-scoped domain
- model support contracts that belong with runtime models

Shared primitive model support lives in core model files such as `core/time.model.ts`, `core/style.model.ts`, and `core/money.model.ts`.
Domain models can compose primitives like `Weekday`, `TimeWindow`, `WeeklyTimeWindows`, `WeeklySchedule`, `PageStyle`, and `CurrencyDisplayFormat`, but should not redefine them.

Schedule meaning belongs to the stored field, not the primitive:
- Place business/opening hours describe when the venue is open.
- Kitchen opening/service hours describe when the kitchen operation is available.
- Menu availability, when added, should describe when a specific menu is served.

## Model Families

### Identity

Who is using the system.

Examples:
- `User`
- `Chef`
- `Agent`
- `Professional`

Identity models normally use root plus app overlay storage:
- root canonical record
- app overlay record only when app-specific capability, membership, or presentation state exists

Identity app records are overlays, not root-plus-app operational topology.
Do not add `app_scope_state` or `app_scope_app_id` to `User`, profile roots, `AppUser`, or app profile overlays.

Preferred model-file shape for identity models:
- `XModel`
- `AppXModel`
- `X`
- `AppX`
- `XCreateInput`
- `XUpdateInput`

Example:
- `UserModel`
- `AppUserModel`
- `User`
- `AppUser`

Typical app-user overlay capability fields include:
- `role`
- `is_premium`
- `console_enabled`
- `console_scopes`

### App-Scoped Domain

Where people operate.

Examples:
- `Kitchen`
- `Portfolio`
- `Supplier`
- `Project`

This family does not include `User` or identity profiles.

App-scoped canon:
- root public entity
- app-scoped operational record
- app-owned child records beneath that record when operational children exist
- root facade app relationship fields:
  - `app_scope_state`
  - `app_scope_app_id`

Public create creates the root public entity.
App-scoped create ensures the app record and may create root first when missing.

Useful simplifier:
- `root` = the canonical public entity
- `not root` = either the app-scoped record or app-owned child records under it

Important:
- the app-scoped record is not a root entity
- the app hosts operational state over the public entity
- public richness can vary by family:
  - `Kitchen` can be rich and public-facing
  - `Portfolio` can be intentionally thin because much of its data is confidential
  - `Project` and `Supplier` can sit somewhere in between

Examples:
- `kitchens/<kitchenId>`
- `apps/<appId>/kitchens/<kitchenId>`
- `kitchens/<kitchenId>/menus/<menuId>`
- `kitchens/<kitchenId>/dishes/<dishId>`
- `apps/<appId>/kitchens/<kitchenId>/mise/<taskId>`
- `apps/<appId>/kitchens/<kitchenId>/orders/<orderId>`
- `portfolios/<portfolioId>`
- `apps/<appId>/portfolios/<portfolioId>`
- `apps/<appId>/portfolios/<portfolioId>/properties/<propertyId>`
- `suppliers/<supplierId>`
- `apps/<appId>/suppliers/<supplierId>`
- `projects/<projectId>`
- `apps/<appId>/projects/<projectId>`

This is the current root-plus-app canon.

### App-Scoped Ownership And Operator Profiles

For app-scoped domains, the stored ownership pattern is shared:

- the app-hosted record is the scoped record
- app authority is user-based through:
  - `operator_ids`
  - `join_requests`
- when a family needs fast personal console selection, app membership may carry explicit `console_scopes` entries such as `kitchen:<kitchenId>`
- membership indexes are candidate lists; scoped records still carry the relationship and authority detail

Optional family-specific operator profiles do not replace that app-scoped pattern.

Examples:
- `Kitchen` may require or prefer `Chef` for live operation and presentation
- `Project` may later add a `ProjectLeader`-style profile
- `Portfolio` or `Supplier` may later add role-specific operator profiles

Current rule:
- operator profiles are prerequisites, enrichment, or presentation layers
- operator profiles are not the primary stored ownership model for the app-scoped record

Root ownership hints may still exist where useful:
- `Project.owner_user_id`
- domain claim fields such as `Place.claimed_by`

Those do not replace app-hosted scoped authority.

### System

What makes FireUX run.

Examples:
- `App`
- `Ecosystem`
- `Module`

System models are usually stored once at root.
If a runtime surface manages them, it should normally do so through a facade first, not by inventing a second stored app-scoped record.

For ecosystem apps that keep both `(default)` and a named operational database, the current storage split is:

- `(default)` = system registry and public mirror
  - singular `project`
  - singular `ecosystem`
- named ecosystem database = operational collections and canonical `apps`

Important:
- do not treat `(default)` as the home for ordinary operational domain collections
- `App` stays canonical at `/apps/<appId>` in the named operational database
- the named operational database should carry the day-to-day domain collections
- initialization is app-local: `apps/<appId>/users/<uid>.role == 'admin'` is the admin authority
- `apps/<appId>.admin_ids` may mirror the admin set for fast reads, but it is not the authority source
- if no app-local admin membership exists, the app needs initialization even when the root app record exists

Core identity has a separate storage rule:
- `users/<uid>` is the canonical ecosystem identity record
- canonical identity stores display name, handle, avatar, email, bio, and profile-level fields
- profile root collections linked to users follow the same ecosystem identity database rule
- `apps/<appId>/users/<uid>` is an app membership/role overlay
- `apps/<appId>/<profileCollection>/<uid>` is an app profile overlay
- standalone product apps may use their own app database for operational collections, but should still read/write root identity through the parent ecosystem identity database
- tenant apps may share the same physical database as the ecosystem, but identity and membership remain separate model layers

Preferred model-file shape for system models:
- `XModel`
- `X`
- `XCreateInput`
- `XUpdateInput`

### Communication

How people talk to an app, operator, provider, host, or workspace.

Examples:
- `Conversation`
- `ConversationMessage`

Communication canon:
- conversation root records live at `conversations/<conversationId>`
- message child records live at `conversations/<conversationId>/messages/<messageId>`
- apps provide `app_id`, `kind`, and `related_entity` context
- product apps do not create app-local chat/enquiry storage for the same behaviour

Current conversation kinds:
- `property_enquiry`
- `guest_support`
- `provider_lead`
- `general`

Public enquiry creation is allowed as a product surface, but shipping rules must restrict reads and follow-up writes to participants, app operators, or trusted server endpoints.

### Domain Root

What exists independently of an app-scoped record.

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

What only exists because an app-scoped domain owns it.

A scoped model must declare:
- what app-scoped domain owns it
- whether it links to a root entity
- whether it is purely local to the app scope

Examples:
- Kitchen-scoped under `apps/<appId>/kitchens/<kitchenId>/...`:
  `Menu`, `Dish`, `Recipe`, `KitchenOrder`, `KitchenTeamMember`, `KitchenMiseTask`
- Portfolio-scoped under `apps/<appId>/portfolios/<portfolioId>/...`:
  `Property`, `Unit`, `Client`, `Document`, `DocumentLink`, `ComplianceRecord`, `Task`

Preferred model-file shape for scoped models:
- `XModel`
- `X`
- `XCreateInput`
- `XUpdateInput`

Examples:
- `MenuModel`
- `RecipeModel`
- `PropertyModel`
- `DocumentModel`

## Overlay Versus Facade

### App-Scoped Record

A second stored scoped model.

Use an app-scoped record only when scoped truth really exists.

For app-scoped domains, the app-scoped record is the app-hosted stored layer for that root public entity.

Examples:
- `User` + `AppUser`
- `Kitchen` + `AppKitchen`
- `Portfolio` + `AppPortfolio`
- `Supplier` + `AppSupplier`
- `Project` + `AppProject`

Preferred model-file shape for app-scoped domains:
- `XModel`
- `AppXModel`
- `X`
- `AppX`
- `XCreateInput`
- `XUpdateInput`

The `User` model is the current reference pattern:
- `User`
- `AppUser`

App-scoped domain entities should use the same simple dual-model idea as `User`:
- one root canonical model
- one app-scoped model
- no hydrated/read-time composite type in the model file

Field-discipline rule:
- keep the root model honest and compact
- keep the app-scoped model focused on app-hosted governance and access
- if a root model still carries legacy or confidential fields, simplify that in a focused cleanup pass rather than adding extra structural layers
- if a family needs a richer combined read shape, build that in fetch/runtime/interface layers rather than in the model file

Support rule:
- `meta`
  - shared storage/model support canon
- `meta-content`
  - typed content/config canon used by app content files

Do not merge `meta` and `meta-content`.

### Facade

A runtime, read, or app surface over the same root entity.

Use a facade when a runtime surface is managing the entity but there is not yet a second stored scoped truth.

Examples for now:
- `App`
- `Ecosystem`
- `Module`

Do not invent stored models like `AppTenant`, `EcosystemProject`, or `ModuleProject` unless real scoped stored state appears.

UI-only types like pill props should not live under `runtime/models`.
If they are still useful, move them to shared package or runtime types instead.

Example:
- `packages/core/fireux-core/src/types/pill.ts`

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
- stored app-scoped models where scoped truth is real
- runtime facades where managed state is demo-backed or derived
- scoped runtime entity models owned by an app-scoped domain
- model-adjacent runtime types that belong with their model
- shared runtime model support like stamps or small reusable protocols

## File Comment Rule

Each real model file should state:
- family
- storage mode
- path or scope
- owner app scope where relevant
- why the current choice is root, app-scoped, facade, or scoped

Each file should point back to this README so future changes can be made in one place first.

## Aligned In Repo

- `runtime/models/` is already the normal home for FireUX runtime models
- root, app-scoped, facade, and scoped models already coexist in runtime delivery space
- the repo already supports `User` and `Kitchen` as root plus app-scoped patterns
- the repo already supports `App`, `Ecosystem`, and `Module` as root models that may have runtime facades
- the current canon treats `Kitchen`, `Portfolio`, `Supplier`, and `Project` as root plus app-scoped entities
- app-scoped authority defaults to user-owned, with optional family-specific operator profile prerequisites on top

## Not Aligned Yet

- some child directories still reflect older structure rather than the newer family model
- `shared/` and `supporting/` still need tighter boundaries
- some models still mix legacy flat stamps with newer nested stamps
- some paths are still implicit in implementation rather than clearly documented in the file header
- `Project` remains a system-level special case, even though it now follows the shared root-plus-app rule

## Roadmap To Reconciliation

1. Keep runtime models in `runtime/models/`.
2. Use this README as the decision point before changing model families or storage mode.
3. Update touched model files to explain family, storage mode, owner, and path.
4. Use app-scoped records only when stored scoped truth is real.
5. Use facades when a runtime surface is managing a root entity without a second stored model.
6. Normalize the active shipping slice first, not the whole repo at once.

## Short Version

Runtime models belong here.

Each model should clearly say:
- what family it belongs to
- whether it is root, app-scoped, facade, or scoped
- who owns it
- why that decision was made

For app-scoped domains, the clean storage rule is:
- root public entity
- app-hosted scoped record
- app-owned child records beneath that record
