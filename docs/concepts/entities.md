# Entities

Updated: 2026-08-23
Ref: d1a7d5eec
Role: map, not canon

## Purpose

Map how FireUX decides whether a concept is an Entity, parent-owned Record,
embedded Shape, reusable Primitive, or organizational Bucket. The executable
declarations and entity guard are authority; this map explains how to reason
about them and where current coverage is incomplete.

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

## Declaration axes

Every declaration made with `defineFireuxEntity()` answers these axes:

| Axis         | Current vocabulary                                                                                          | Question answered                                |
| ------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `kind`       | entity, record, shape, primitive, bucket, to-confirm                                                        | What sort of concept is it?                      |
| `family`     | one or more named FireUX families                                                                           | Which siblings should be compared?               |
| `identity`   | root, parent-scoped, none, to-confirm                                                                       | Where does canonical identity live?              |
| `authority`  | App database, domain database, identity database, ecosystem identity database, FireUX control plane, parent | Who owns lifecycle truth?                        |
| `appSupport` | none, membership record, profile delta, to-confirm                                                          | What genuine App-owned support may accompany it? |
| `workspace`  | boolean                                                                                                     | Is it a Workspace Entity?                        |
| `parent`     | optional Entity name                                                                                        | Which Entity owns a parent-scoped declaration?   |

A root Entity document is its canonical readable Entity. Information that
cannot be returned with that Entity must live physically under its honest
owner, such as Auth, App access, Team, Finance, or an operational child. The
Entity declaration does not carry a second read-classification axis.

## Executable matrix

The current declared Entities are:

| Entity           | Family                      | Identity       | Authority                   | App support       | Workspace |
| ---------------- | --------------------------- | -------------- | --------------------------- | ----------------- | --------- |
| App              | core, system                | root           | App database                | none              | no        |
| Ecosystem        | system                      | root           | Ecosystem identity database | none              | no        |
| User             | core, identity              | root           | identity database           | membership record | no        |
| Project          | system, workspace entity    | root           | FireUX control plane        | none              | yes       |
| Job              | content                     | root           | domain database             | none              | no        |
| Place            | place                       | root           | domain database             | none              | no        |
| MarketplaceStore | commerce, workspace entity  | root           | domain database             | none              | yes       |
| Kitchen          | kitchen, workspace entity   | root           | domain database             | none              | yes       |
| KitchenMenu      | menu, kitchen               | Kitchen-scoped | parent                      | none              | no        |
| Recipe           | kitchen                     | Kitchen-scoped | parent                      | none              | no        |
| KitchenPrepItem  | kitchen                     | Kitchen-scoped | parent                      | none              | no        |
| Dish             | kitchen, menu               | Kitchen-scoped | parent                      | none              | no        |
| KitchenOrder     | kitchen, ordering           | Kitchen-scoped | parent                      | none              | no        |
| Menu             | menu                        | root           | domain database             | none              | no        |
| Supplier         | supplier, workspace entity  | root           | domain database             | none              | yes       |
| Portfolio        | portfolio, workspace entity | root           | domain database             | none              | yes       |
| Property         | property, workspace entity  | root           | domain database             | none              | yes       |

The current declared Records are:

| Record            | Parent           | Why it is not an Entity                                                    |
| ----------------- | ---------------- | -------------------------------------------------------------------------- |
| Company           | Place            | It is an exact same-id role marker; Place owns identity and location truth |
| MenuSourceUpload  | Kitchen          | It is source material for a Kitchen workflow                               |
| MenuSection       | KitchenMenu      | It groups MenuItem records inside one Menu                                 |
| MenuItem          | MenuSection      | It is one parent-owned catalogue row                                       |
| KitchenSale       | KitchenOrder     | It is the immutable one-to-one result of Order completion                  |
| CustomerProfile   | User             | It stores User-owned ordering preferences, not another person identity     |
| CustomerOrderLink | User             | It points to an Order without copying mutable Order lifecycle state        |
| MarketplaceOffer  | MarketplaceStore | It has no lifecycle outside its Store                                      |
| MarketplaceOrder  | MarketplaceStore | It is operational fulfilment truth for one Store                           |

The executable source is `scripts/_lib/entity-matrix.mjs`; the guard is
`scripts/guards/entity-matrix.mjs`. The matrix intentionally imports no runtime
mega-registry into Core.

## Confirmed relationship patterns

### Root Workspace ownership

Project, Kitchen, Supplier, Portfolio, Property, and Marketplace Store are
root Workspace Entities. Each owns `team/{uid}`, `team-requests/{uid}`, its
operations, and any protected support beneath its root document. The Team
record grants Workspace authority; its document id is the User uid.

`management` may associate the root with an App or the ecosystem Workspace,
but that relationship never relocates the Entity or creates a same-id App
access record. A selected target must resolve one valid root, management
relationship, AppUser membership where an App is involved, and Team record (or
the explicit App-admin override).

### Root plus same-id role

Place is the shared location Entity. Company is a root-stored, same-id Place
role Record whose exact persisted payload is only canonical creation and update
stamps. A Company marker is valid only with its valid same-id Place; it stores
no copied Place identity and has no App support or independent lifecycle.

Live, Demo, and Test use the same Place and Company model contracts. Scenario
wrappers may pair those roots for deterministic presentation, but they are not
alternate entity shapes. Company reads first validate the role marker and then
return its canonical same-id Place; they do not manufacture a second Company
or Place.

Promote Company to an independent Entity only if product behavior establishes
legal or lifecycle truth that survives a Place, or a Company must own several
replaceable Places. Supplier currently links through `company_id` to this
Company role and then to the same-id Place; Supplier does not add a synonymous
`place_id`.

Run `scripts/audit-place-company-supplier.mjs` against an owning ecosystem
database to verify the complete relationship without writing data.

### Identity plus membership

User is canonical identity. AppUser is App-owned membership/entitlement and
UserAccount is private account support. Neither support record is another User.

Role and subscription are independent AppUser facts. Presentation may show
them, but it never stores a combined access tier on User or AppUser and never
replaces server or Rules authority.

Free is the effective product default when no AppUser exists. This lets public
Workspace surfaces present and enforce the Free experience without inventing
identity or membership: `hasMembership` remains false, role remains absent,
Premium and Business subscriptions enable Premium capabilities, while only
Business enables multi-Workspace ownership.

AppUser stores App governance (`role: user | admin | dev`), subscription
(`free | premium | business`), and onboarding lifecycle separately. A stored Dev role has
developer authority and explicitly intended Admin capabilities without
implying Premium. Empty profile and
Workspace-target indexes may be absent at rest; readers normalize them without
turning the indexes into authority.

User readers preserve the same split. Global runtimes may enumerate
the canonical User catalogue. Tenant runtimes first enumerate exact valid
AppUser memberships for their configured App, then resolve only those canonical
User identities. Root `User.app_ids` is denormalized identity metadata, not
tenant-directory selection authority, and tenant detail routes apply the same
membership decision as their list.

### Root doorway plus scoped source

Menu is a root doorway. KitchenMenu is a distinct Kitchen-scoped Entity
that owns structured content. A Menu may point to a KitchenMenu; publishing does
not turn them into one identity or justify copying the scoped tree into root.

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
- `EcosystemDirectoryEntry`: bounded Ecosystem directory transport
  or Records.
- Menu choice, fulfilment policy, and presentation objects: Shapes unless a
  separate lifecycle is later proved.

## Coverage boundary

The repository contains domain concepts whose models, routes, or collections
predate executable entity declarations. Examples include remaining profile
roots outside the confirmed Chef and Driver records, generic Task concepts,
and Blog content.

Their existence is real; their FireUX Entity classification is not yet declared
by the matrix. Treat each as `to-confirm` for classification work. Do not
bulk-promote them from route or folder symmetry.

Ingredient is now a declared shared culinary root owned by
`fireux-kitchens`. Kitchen and Supplier operational records reference its
stable document id and resolve the canonical Ingredient. Its
canonical `name` is the popular name used by the shared world; language and
translation state are not Ingredient identity.

Recipe, KitchenPrepItem, and Dish are confirmed Kitchen-scoped Entities. Recipe
owns authored preparation content; KitchenPrepItem owns a reusable intermediate
product's inputs, yield, and method; Dish owns reusable food identity and media.
MenuItem is a MenuSection-owned placement Record and must reference a Dish from
the same Kitchen. Run `scripts/audit-misebox-recipe-dish-menu-items.mjs` and
`scripts/audit-misebox-kitchen-prep-items.mjs` to verify those scope fields and
relationships in Misebox without writing data.

KitchenStation is a confirmed Kitchen-owned operational Record at
`kitchens/{kitchenId}/stations/{stationId}`. Run
`scripts/audit-misebox-kitchen-stations.mjs` to verify its Kitchen parent,
scope, required fields, ordering, and Station references without writing data.

KitchenMiseTask is a confirmed Kitchen-owned operational Record at
`kitchens/{kitchenId}/mise-tasks/{taskId}`. It owns preparation workflow,
scheduling, checklist and assignment state. `prep_item_ids` links canonical
KitchenPrepItem entities explicitly; other links remain inside the owning
Kitchen or point to canonical Ingredient ids. Run
`scripts/audit-misebox-kitchen-mise.mjs` to verify its stored contract and
relationships without writing data.

KitchenPrepItem is stored at
`kitchens/{kitchenId}/prep-items/{prepItemId}`. The protected
legacy `mise` migration is complete; new code must not restore those duplicate
documents or normalize them as Mise tasks. Keep
`scripts/migrate-misebox-kitchen-prep-items.mjs` as the migration record and
use the read-only audit to detect storage regression.

KitchenOrder is a confirmed Kitchen-scoped Entity with a trusted lifecycle.
Completing a ready Order atomically creates its same-id immutable KitchenSale
and FinancialFact. CustomerProfile is an optional User-owned profile Record at
`users/{uid}/profiles/customer`; registered customer identity is AppUser and
guest details stay on the Order. CustomerOrderLink is a User-owned pointer at
`users/{uid}/orders/{orderId}`. Run
`scripts/audit-misebox-orders-sales-customers.mjs` for the read-only integrity
check. Legacy root links are planned by
`scripts/migrate-misebox-customer-order-links.mjs` and require an explicit
confirmation hash plus protected preimage before application.

ChefProfile and DriverProfile are confirmed User-owned Records at
`users/{uid}/profiles/{kind}`. Presentation reads join canonical User rather
than copying person identity. Genuine App-specific capability state may live
beneath that profile at `app-state/{appId}`. KitchenTeamMember is the canonical
Workspace authority at `kitchens/{kitchenId}/team/{uid}` and may also carry
Kitchen-specific operational roles. KitchenTeamJoinRequest remains workflow,
never authority. Run
`scripts/audit-misebox-chef-driver-kitchen-team.mjs` to verify these profile,
membership, Kitchen, and workflow joins without writing data.

Product is a declared commercial root owned by `fireux-products`. It has an
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

Run `scripts/audit-misebox-product-supplier-items.mjs` to verify Product,
Ingredient, Supplier, Supplier Ingredient, and Supplier Item links in the
Misebox owner database without writing data.

Kitchen root shape, its required same-id Place, and root-owned Team are verified by
`scripts/audit-misebox-kitchen-authority.mjs`. Kitchen root IDs remain stable
operational identity; authored slugs resolve through the Kitchen
server route seam. The owner-first migration must retain a protected preimage
and an explicit confirmation hash before changing data.

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
- Workspace-capable roots store the generic `management` relationship, never a
  domain-enumerated Core type: `root`, `workspace`, or `app` with `app_id` only
  in the final mode. Team and operations remain root-owned in every mode.
- Cross-root relationships prefer canonical ids over copied Entity objects or
  inverse child arrays unless a named Directory or presentation view owns that
  optimization.

Exact Firestore stack shape is mapped in
`docs/concepts/firestore-entity.md`. Exact route behavior belongs in the Entity
Directory and Entity Detail family maps.

## Delta register

| Difference                                                     | State      | Required direction                                                                                                                                                                                   |
| -------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing domain concepts exceed the executable matrix          | `drift`    | Review one owning package at a time; declare the concept or name it as Record, Shape, Primitive, or to-confirm                                                                                       |
| Place plus same-id Company role                                | `accepted` | Place owns shared location identity; Company remains an exact stamps-only role marker and Company reads return that canonical Place                                                                  |
| Place read transport                                           | `accepted` | The server exact read returns `{ place: Place }`, then the browser exact-subscribes to that record; index reads page `Place[]`; one `normalizePlace` utility completes sparse stored truth           |
| Kitchen root + Place + Team composition                        | `accepted` | Every Kitchen root contains only id, slug, status, and visibility; the same-id Place owns location identity, Team owns access, and capability records own operational configuration                  |
| Recipe and Dish Kitchen ownership                              | `accepted` | Keep both as Kitchen-scoped Entities; Recipe owns authored preparation content, Dish owns reusable food identity/media, and MenuItem owns placement                                                  |
| Kitchen Order, Sale, and Customer link ownership               | `accepted` | KitchenOrder owns lifecycle; KitchenSale is its immutable result; User-owned Customer links point to Orders without duplicating status, while guest details remain on Order                          |
| Product root plus ProductPrice and Supplier Item relationships | `accepted` | Product owns commercial identity, App provenance and publication; ProductPrice children own pricing; Supplier Item is a Supplier-owned offer with required `product_id` and optional `ingredient_id` |
| Supplier location chain                                        | `accepted` | Use Supplier → Company → same-id Place. A future depot or dispatch-site relationship must be proved separately rather than adding a synonymous Supplier `place_id`.                                  |
| Directory publication implementation history lived in this map | `drift`    | Keep entity classification here and move current publication mechanics to source, guards, or a focused directory map if it becomes a recurring family                                                |

## Alignment roadmap

### Now

1. Require an entity checkpoint before adding model/page/composable ceremony.
2. Keep declaration axes explicit and keep private/support/operational material
   physically outside readable root Entities.
3. Keep Records and Shapes small until independent lifecycle proves promotion.

### Next

1. Reconcile existing undeclared domain concepts one owning package at a time.
2. Complete the owner-first Workspace storage migration.
3. Reconcile remaining duplicate `PublicX` root types with their canonical
   Entity types.

### Later

1. Extend the matrix only after models, authority, and public behavior agree.
2. Add guard semantics only for repeated classification failures, not
   unresolved product decisions.

## Guardrails

- Do not call every stored object an Entity.
- Do not use root as a synonym for public.
- Do not use scoped as a synonym for App ownership.
- Do not duplicate identity into access records.
- Do not add inverse relationship arrays by default.
- Do not let documentation confirm a concept absent from its source
  declaration and matrix.
