# Entities

Updated: 2026-11-09
Ref: ac88daacf
Role: map, not canon

## Purpose

Map how FireUX uses Entity, parent-owned Record, embedded Shape, reusable
Primitive, and organizational Bucket. Current models, readers, writers and
consumers establish behavior; this map is descriptive guidance, not a runtime
registry.

## Related maps

- Firestore stack: `docs/concepts/firestore-entity.md`
- Workspace family: `docs/concepts/family-workspace-entity.md`
- Entity Collection Page: `docs/concepts/family-entity-collection-page.md`
- Entity detail: `docs/concepts/family-entity-detail.md`
- Menu family: `docs/concepts/family-menu.md`
- Finance records: `docs/concepts/finance.md`
- Pages and routes: `docs/concepts/pages.md`

## Working vocabulary

| Kind         | Meaning                                                     |
| ------------ | ----------------------------------------------------------- |
| `entity`     | A first-class domain thing whose identity matters over time |
| `record`     | Stored support truth owned by another Entity                |
| `shape`      | Embedded or transport data with no independent lifecycle    |
| `primitive`  | Reusable low-level value type                               |
| `bucket`     | Organizational folder, never domain truth                   |
| `to-confirm` | Classification is deliberately unresolved                   |

A collection, route, model, id, or component does not prove Entity status.
Firestore stores FireUX concepts; it does not decide what an Entity is.

## Entity checkpoint

Before introducing Entity ceremony, answer:

1. What is the concept called in plain product language?
2. Does it remain meaningful if its parent is deleted?
3. Does it need independent lifecycle or authority?
4. Is it referenced by several parents as the same thing?
5. Does it need its own detail route, Workspace surface, or collection stack?
6. Could a Record or Shape satisfy the current need?

If parent deletion makes the concept meaningless, begin with a Record or Shape.
Promote it only when independent behavior proves the need.

## Where the facts live

The terms above are a discussion aid; models do not need a shared
classification object. Stored fields and paths live with their owning model.
Readers and commands establish the actual read and write behavior. Routes and
Workspace composition establish which surfaces exist.

A root Entity document is its canonical readable Entity. Information that
cannot be returned with that Entity must live physically under its honest
owner, such as Auth, App access, Team, Finance, or an operational child. The
model does not need a second read-classification record.

## Classification map

The following classification map is a reading aid. Current owning source
establishes each record's actual shape and behavior:

| Entity           | Family                      | Identity       | App support       | Workspace |
| ---------------- | --------------------------- | -------------- | ----------------- | --------- |
| App              | core, system                | root           | none              | no        |
| Ecosystem        | system                      | root           | none              | no        |
| User             | core, identity              | root           | membership record | no        |
| Project          | system, workspace entity    | root           | none              | yes       |
| Job              | content                     | root           | none              | no        |
| Place            | place                       | root           | none              | no        |
| Business         | business, workspace entity  | root           | none              | yes       |
| MarketplaceStore | commerce                    | root           | none              | no        |
| Kitchen          | kitchen, workspace entity   | root           | none              | yes       |
| Menu             | menu, kitchen               | Kitchen-scoped | none              | no        |
| Recipe           | kitchen                     | Kitchen-scoped | none              | no        |
| KitchenPrepItem  | kitchen                     | Kitchen-scoped | none              | no        |
| Dish             | kitchen, menu               | Kitchen-scoped | none              | no        |
| KitchenOrder     | kitchen, ordering           | Kitchen-scoped | none              | no        |
| Supplier         | supplier, workspace entity  | root           | none              | yes       |
| Portfolio        | portfolio, workspace entity | root           | none              | yes       |
| Property         | property, workspace entity  | root           | none              | yes       |

Examples of parent-owned Records:

| Record            | Parent           | Why it is not an Entity                                                |
| ----------------- | ---------------- | ---------------------------------------------------------------------- |
| MenuSourceUpload  | Kitchen          | It is source material for a Kitchen workflow                           |
| MenuSection       | Menu             | It groups MenuItem records inside one Menu                             |
| MenuItem          | MenuSection      | It is one parent-owned catalogue row                                   |
| KitchenSale       | KitchenOrder     | It is the immutable one-to-one result of Order completion              |
| CustomerProfile   | User             | It stores User-owned ordering preferences, not another person identity |
| CustomerOrderLink | User             | It points to an Order without copying mutable Order lifecycle state    |
| MarketplaceOffer  | MarketplaceStore | It has no lifecycle outside its Store                                  |
| MarketplaceOrder  | MarketplaceStore | It is operational fulfilment truth for one Store                       |

This map does not enforce ownership or storage behavior. Inspect the owning
model, reader and command for those facts. Do not recreate a runtime registry.

## Confirmed relationship patterns

### Entities with Workspace surfaces

Business, Project, Kitchen, Supplier, Portfolio and Property expose
Workspace management surfaces. They remain domain Entities, not instances of a
second Workspace Entity model. Their real routes, readers and commands establish
the available surface; a metadata boolean would not create it.

Public/detail components and Workspace components consume the same owning
Entity's supported readers and commands, with the appropriate projections and
authorization. An Entity without its own Workspace can still be used within
another Entity's Workspace. Recipe, for example, retains its Kitchen-scoped
identity while Kitchen's Recipes capability manages it.

Shared Workspace code owns selection, navigation and structural presentation.
Domain owners retain their models, records, commands and authority. Kitchen and
Project use signed-in App membership and a domain-owned access record bound to
that membership's creation stamp. Supplier, Portfolio and Property use the same
access contract; selected IDs and Team role labels do not grant access.
Marketplace Store retains its named owner/team/moderation authority. AppUser has
no Entity arrays or primary selections.

Project-building relates downward through `Project -> Ecosystem -> App`.
Ecosystem carries `project_id`; App carries only `ecosystem_id`. FireUX may use
that chain to discover an App's domain Entities, while those Entities remain
ignorant of Project, App, and Ecosystem.

Where a domain retains a `management` relationship, it does not relocate the
Entity or replace the domain's current authorization checks. Do not require
that field on every Workspace Entity: Kitchen's current model has no
`management` field. A selected target must resolve a valid root and pass its
owning access contract. A universal Team-record gate must not be inferred from
the presence of a Workspace.

### Business and Place

Business is an independent Workspace Entity in `fireux-businesses`. Its root
owns organisation identity and explicit `place_ids`; locations remain Place-owned.
A Business can have no locations or several locations. Company is no longer an
active separate package or role. Supplier links through `business_id` and uses the
Business's explicitly linked Place for its location-backed profile. Job uses
`business_id` for employer identity and its own `place_id` for the work location.
Business subscription is an entitlement and is separate from Business identity.

Legacy Company records require the reviewed data cutover described in
`packages/extensions/fireux-businesses/docs/ai/businesses-context.md`.

Use the Business context's current source and verification guidance for this
relationship; historical migration artifacts are not current executable checks.

### Identity plus membership

User is canonical identity. UserAccount is private support owned by the Core
User domain, not a third Entity or capability. AppUser is separately App-owned
membership, role and subscription.

User setup is owned by Core `user/composables/account/useUserSetup.ts`.
It derives identity, private-account consent and current-App membership needs
from their separate readers. `/auth` uses that decision to choose the return
route; only the explicit setup action invokes the trusted account, identity and
App membership commands. A ready but incomplete User still needs explicit setup:
`isUserIdentityComplete` reuses canonical handle and display-name validation.
An existing User can join another App without
recreating identity or repeating current consent. Guest Workspace access stays
available without membership.

`User` is the public identity projection; `UserDocument` describes stored
identity with audit stamps and no stored id. `UserAccount` describes private
email, terms evidence and audit stamps. It has no unused preferences or fake
blank-record defaults. Appearance remains owned by native colour mode.
Private AI background belongs to `UserContext` at
`users/{uid}/private/context`, not the public User projection.
See Core's `user-setup`, `user-setup-completion` and
`user-membership-lifecycle` tests for the setup boundary.

Role and subscription are independent AppUser facts. Presentation may show
them, but it never stores a combined access tier on User or AppUser and never
replaces server or Rules authority.

Free is the effective product default when no AppUser exists. This lets public
Workspace surfaces present and enforce the Free experience without inventing
identity or membership. `hasMembership` remains false and role remains absent.
Pro and Business subscriptions provide the Pro feature level. Business adds
capacity. Actual gates remain capability-owned.

AppUser stores App governance (`role: user | admin | dev`), subscription
(`free | pro | business`), with no onboarding flag. A stored Dev role has
developer authority and explicitly intended Admin capabilities without
implying Pro. Workspace target access lives in domain-owned records bound to
App membership creation; AppUser carries no Entity indexes or selection.

User readers preserve the same split. Global runtimes may enumerate
the canonical User catalogue. Tenant runtimes first enumerate exact valid
AppUser memberships for their configured App, then resolve only those canonical
User identities. User-owned App locators support discovery; canonical AppUser membership
remains tenant-directory selection authority. Tenant detail routes apply the
same membership decision as their list.

### Subscription naming migration

`readAppUserSubscription` in Core's App model reads legacy `premium` as `pro`.
New subscription commands and App capacity configuration use `pro`. Unknown
subscription values grant no membership authority. The authored membership
Rules accept both names for the migration period.

Roll out the dual-name Rules and readers before releasing canonical `pro`
writers. For each authorized App database, capture exact preimages and document
update times for `apps/{appId}/users/{uid}` records whose subscription is
`premium`. An approved migration changes only that field to `pro`, with
preconditions against concurrent edits. Keep role and all audit stamps,
especially `created.at`, unchanged. Domain access is bound to that timestamp.
Verify each postimage, entitlement and capacity result before retiring legacy
reads or Rules allowance. Repeating an approved migration skips records
already at `pro` and stops on conflicting updates. Source changes do not
authorize a Rules deployment or stored-data migration.

Business identity is independent of the Business plan. A Business may use Free.
The Business upgrade must collect additional business details. Its field schema,
record owner and relationship to the acting App membership require an accepted
contract before an intake can write or grant entitlement. The retired Company
records are same-id Place roles, not an existing Business intake destination.

### Kitchen-owned Menu identity

Menu is one Kitchen-scoped Entity at `kitchens/{kitchenId}/menus/{menuId}`.
Its publication command updates that same record; public routes project it
without creating a second root Menu identity. See [Menu family](family-menu.md)
and `menu/models/menu-storage.model.ts` in `fireux-kitchens`.

### Parent-owned records

Recipe, KitchenPrepItem, and Dish have independent lifecycles inside their
owning Kitchen, so they are parent-scoped Entities rather than root identities.
Recipe owns authored preparation content. KitchenPrepItem owns a reusable
intermediate product's inputs, yield, and method. Dish owns reusable food
identity and media.

MenuSection, MenuItem, and KitchenStation can have stable document ids without
independent Entity lifecycle. Kitchen Team requests, document links, financial
facts, and similar parent-owned support should remain Records unless product
behavior proves otherwise. KitchenStation is owned below Kitchen; its stable
local id lets Team and Mise records refer to it without turning it into
independent identity or access authority.

### Directory and presentation views

Directory entries, card DTOs, and other denormalized read models are transport
Shapes or Records, not competing Entities. They may reduce payload or assemble
presentation, but they do not rename, filter, or replace the canonical root
Entity as a privacy mechanism.

## Useful non-Entity examples

- `FinancialMoney`: Primitive.
- `FinancialFact`: immutable App-owned Record derived from a source operation.
- `KitchenSale`: Kitchen-owned Record derived from a completed KitchenOrder.
- `AppUser`, `UserAccount`, and App access rows: support Records.
- `EcosystemDirectoryEntry`: directory Shape built from an Ecosystem, its App
  count, and its detail link. Its contract lives with
  [Ecosystem models](../../packages/core/fireux-core/src/runtime/ecosystem/models/ecosystem-directory.ts). See the
  [directory projection](../../packages/core/fireux-core/src/runtime/ecosystem/server/directory/projection.ts).
- Menu choice, fulfilment policy, and presentation objects: Shapes unless a
  separate lifecycle is later proved.

## Coverage boundary

The repository contains domain concepts whose models, routes, or collections
are not described in this map. Examples include profile roots, generic Task
concepts, and Blog content.

When a concrete feature needs a classification, establish it from product
behavior and the owning source. Do not infer it from route or folder symmetry.

Ingredient is a shared culinary root owned by `fireux-kitchens`. Kitchen and
Supplier operational records reference its
stable document id and resolve the canonical Ingredient. Its
canonical `name` is the popular name used by the shared world; language and
translation state are not Ingredient identity.

Recipe, KitchenPrepItem, and Dish are confirmed Kitchen-scoped Entities. Recipe
owns authored preparation content; KitchenPrepItem owns a reusable intermediate
product's inputs, yield, and method; Dish owns reusable food identity and media.
MenuItem is a MenuSection-owned placement Record and must reference a Dish from
the same Kitchen. Inspect the owning models, readers and protected commands for
that scope; local source review does not verify stored Misebox records.

KitchenStation is a Kitchen-owned operational Record at
`kitchens/{kitchenId}/stations/{stationId}`. Its
[model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/station.model.ts)
defines its Kitchen id, presentation, active state and ordering; the
[Station read-scope tests](../../packages/extensions/fireux-kitchens/src/test/kitchen/station-read-scope.test.mjs)
exercise the reader's scope and lifecycle.

KitchenPrepItem is stored at
`kitchens/{kitchenId}/prep-items/{prepItemId}`. New code must not restore legacy
duplicate `mise` documents or normalize Prep Items as Mise tasks. The
[Prep Item model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/prep-item.model.ts)
and [scope tests](../../packages/extensions/fireux-kitchens/src/test/kitchen/prep-scope.test.mjs)
describe the current contract; this map does not establish live migration status.

KitchenOrder is a confirmed Kitchen-scoped Entity with a trusted lifecycle.
Completing a ready Order atomically creates its same-id immutable KitchenSale
and FinancialFact. CustomerProfile is an optional User-owned profile Record at
`users/{uid}/profiles/customer`; registered customer identity is AppUser and
guest details stay on the Order. CustomerOrderLink is a User-owned pointer at
`users/{uid}/orders/{orderId}`. Any legacy-link migration needs a current reviewed
plan, protected preimages, concurrency checks and explicit mutation authority;
retired scripts do not authorize or verify a new migration.

ChefProfile and DriverProfile are confirmed User-owned Records at
`users/{uid}/profiles/{kind}`. Presentation reads join canonical User rather
than copying person identity. Genuine App-specific capability state may live
beneath that profile at `app-state/{appId}`. KitchenTeamMember is the canonical roster
record at `kitchens/{kitchenId}/team/{uid}` and may carry Kitchen-specific
operational roles. Workspace access is the separate Kitchen-owned record bound
to the current App membership creation timestamp. KitchenTeamJoinRequest remains
workflow, never authority. Verify each join through its current owning reader
and command; source inspection does not establish live membership integrity.

Product is a commercial root owned by `fireux-products`. It has an
independent lifecycle, route identity, pricing children, authorship, and
App provenance. `source_app_id` partitions tenant catalogues; `visibility`
owns publication state while `active` independently controls commercial
availability. The named database already supplies ecosystem scope. Generic
owner fields are not Product authority. ProductPrice children are the sole
pricing authority, and Product readers join them without embedding prices or a
default price into the root. Supplier Item is a Supplier-owned scoped Record: it must
link to Product with `product_id`, owns the Supplier's offer/SKU/packaging and
procurement terms, and may link to Ingredient when the offer represents
culinary stock. Neither wrapper copies Product or Ingredient identity.
Product document ids are supplied by Firestore readers and need not be copied
into sparse stored records. A slug is required by a published doorway, not by
an inactive provider-imported Product that has no public route.

These Product and Supplier relationships describe source contracts, not a live
integrity audit of the Misebox database.

Kitchen's [current model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts)
contains nested `identity`, capability configuration, audit stamps and optional
internal `context`. The [configuration model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen-configuration.model.ts)
owns theme, ordering, services and tables. Its
[public projection](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/normalize-kitchen.ts)
returns identity and services with the same-id Place, omitting private root
metadata. Team roster and Workspace access retain separate records and authority.
Kitchen root IDs remain stable operational identity; authored slugs resolve
through the [Kitchen server reader](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/read.ts).

Retired operational artifacts in Git history are historical evidence, not
supported audit commands. Live storage verification requires a current reviewed
read-only procedure. Any data migration separately requires an exact plan,
protected preimages, concurrency checks and explicit authorization under the
[Firestore mutation context](../ai/firestore-mutations-context.md).

## Storage and route implications

- A root Entity document is the canonical readable Entity.
- Route presence and search discovery remain separate product decisions.
- Parent-scoped records follow their parent owner and are not implied by root
  readability.
- Root Entities may have parent-owned operational children.
- Scoped Records should not receive root Collection Manager or page ceremony
  merely to reuse UI.
- Model and composable folder placement follows the declared owner; folders do
  not create ownership.
- Workspace availability does not imply a universal stored `management` field.
  Inspect the domain model and access contract. Where retained, management
  association does not move Team or operational ownership to the App.
- Cross-root relationships prefer canonical ids over copied Entity objects or
  inverse child arrays unless a named Directory or presentation view owns that
  optimization.

Exact Firestore stack shape is mapped in
`docs/concepts/firestore-entity.md`. Exact route behavior belongs in the Entity
Directory and Entity Detail family maps.

## Delta register

| Difference                                                     | State      | Required direction                                                                                                                                                                                   |
| -------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing domain concepts exceed this descriptive map           | `drift`    | Review one owning package when a concrete feature needs the distinction; use source behavior to name its role                                                                                        |
| Independent Business with optional Place links                 | `accepted` | Business owns organisation identity and Workspace; Place owns each linked location                                                                                                                   |
| Place read transport                                           | `accepted` | The server exact read returns `{ place: Place }`, then the browser exact-subscribes to that record; index reads page `Place[]`; one `normalizePlace` utility completes sparse stored truth           |
| Kitchen root + Place + Team composition                        | `accepted` | Kitchen owns nested identity, configuration and audit/private metadata; its public projection joins the same-id Place. Team roster and membership-bound Workspace access retain separate authority.  |
| Recipe and Dish Kitchen ownership                              | `accepted` | Keep both as Kitchen-scoped Entities; Recipe owns authored preparation content, Dish owns reusable food identity/media, and MenuItem owns placement                                                  |
| Kitchen Order, Sale, and Customer link ownership               | `accepted` | KitchenOrder owns lifecycle; KitchenSale is its immutable result; User-owned Customer links point to Orders without duplicating status, while guest details remain on Order                          |
| Product root plus ProductPrice and Supplier Item relationships | `accepted` | Product owns commercial identity, App provenance and publication; ProductPrice children own pricing; Supplier Item is a Supplier-owned offer with required `product_id` and optional `ingredient_id` |
| Supplier location chain                                        | `accepted` | Use Supplier → Business → explicitly linked Place. A future depot or dispatch-site relationship must be proved separately rather than adding a synonymous Supplier `place_id`.                       |
| Directory publication implementation history lived in this map | `drift`    | Keep entity classification here and move current publication mechanics to source, guards, or a focused directory map if it becomes a recurring family                                                |

## Alignment roadmap

### Now

1. Require an entity checkpoint before adding model/page/composable ceremony.
2. Keep private/support/operational material outside readable root Entities;
   do not add a shared classification registry.
3. Keep Records and Shapes small until independent lifecycle proves promotion.

### Next

1. Review ownership only when current product work needs the distinction.
2. Complete the owner-first Workspace storage migration.
3. Reconcile remaining duplicate `PublicX` root types with their canonical
   Entity types.

### Later

1. Extend the map only when source proves a useful distinction.
2. Add guard semantics only for repeated classification failures, not
   unresolved product decisions.

## Guardrails

- Do not call every stored object an Entity.
- Do not use root as a synonym for public.
- Do not use scoped as a synonym for App ownership.
- Do not duplicate identity into access records.
- Do not add inverse relationship arrays by default.
- Do not let documentation establish behavior absent from the owning model,
  reader or command.
