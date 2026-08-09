# Entities

Updated: 2026-08-04
Ref: d232cc731
Role: map, not canon

## Purpose

Map how FireUX decides whether a concept is an Entity, parent-owned Record,
embedded Shape, reusable Primitive, or organizational Bucket. The executable
declarations and entity guard are authority; this map explains how to reason
about them and where current coverage is incomplete.

## Related maps

- Firestore stack: `docs/concepts/firestore-entity.md`
- Console family: `docs/concepts/family-console-entity.md`
- Public index: `docs/concepts/family-public-index.md`
- Public detail: `docs/concepts/family-public-detail.md`
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
5. Does it need its own public route, console surface, or collection stack?
6. Could a Record or Shape satisfy the current need?

If parent deletion makes the concept meaningless, begin with a Record or Shape.
Promote it only when independent behavior proves the need.

## Declaration axes

Every declaration made with `defineFireuxEntity()` answers these axes:

| Axis         | Current vocabulary                                                                                            | Question answered                              |
| ------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `kind`       | entity, record, shape, primitive, bucket, to-confirm                                                          | What sort of concept is it?                    |
| `family`     | one or more named FireUX families                                                                             | Which siblings should be compared?             |
| `identity`   | root, parent-scoped, none, to-confirm                                                                         | Where does canonical identity live?            |
| `authority`  | owning App database, identity database, ecosystem identity database, FireUX control plane, parent, to-confirm | Who owns lifecycle truth?                      |
| `appSupport` | none, access record, membership record, operational record, profile delta, to-confirm                         | What non-identity App record may accompany it? |
| `publicRead` | none, direct root, projection, to-confirm                                                                     | How, if at all, may public readers see it?     |
| `status`     | confirmed, to-confirm                                                                                         | Has the current classification been reviewed?  |
| `console`    | boolean                                                                                                       | Is it a Console Entity?                        |
| `parent`     | optional Entity name                                                                                          | Which Entity owns a parent-scoped declaration? |

Identity and public readability are independent. A root Entity can be private;
a parent-scoped Entity can have a bounded public projection.

## Executable matrix

The current declared Entities are:

| Entity           | Family                    | Identity       | Authority                   | App support       | Public read | Console |
| ---------------- | ------------------------- | -------------- | --------------------------- | ----------------- | ----------- | ------- |
| App              | core, system              | root           | owning App database         | none              | projection  | no      |
| Ecosystem        | system                    | root           | Ecosystem identity database | none              | projection  | no      |
| User             | core, identity            | root           | identity database           | membership record | projection  | no      |
| Project          | system, console entity    | root           | FireUX control plane        | none              | none        | yes     |
| Job              | content                   | root           | owning App database         | none              | projection  | no      |
| Place            | place                     | root           | owning App database         | none              | projection  | no      |
| MarketplaceStore | commerce                  | App-scoped     | parent                      | none              | projection  | no      |
| Kitchen          | kitchen, console entity   | root           | owning App database         | access record     | projection  | yes     |
| KitchenMenu      | menu, kitchen             | Kitchen-scoped | parent                      | none              | projection  | no      |
| Recipe           | kitchen                   | Kitchen-scoped | parent                      | none              | none        | no      |
| Dish             | kitchen, menu             | Kitchen-scoped | parent                      | none              | none        | no      |
| KitchenOrder     | kitchen, ordering         | Kitchen-scoped | parent                      | none              | none        | no      |
| Menu             | menu                      | root           | owning App database         | none              | projection  | no      |
| Supplier         | supplier, console entity  | root           | owning App database         | access record     | to-confirm  | yes     |
| Portfolio        | portfolio, console entity | root           | owning App database         | access record     | to-confirm  | yes     |
| Property         | property, console entity  | root           | owning App database         | access record     | projection  | yes     |

The current declared Records are:

| Record           | Parent           | Public read | Why it is not an Entity                                                    |
| ---------------- | ---------------- | ----------- | -------------------------------------------------------------------------- |
| Company          | Place            | projection  | It is an exact same-id role marker; Place owns identity and location truth |
| MenuSourceUpload | Kitchen          | none        | It is source material for a Kitchen workflow                               |
| MenuSection      | KitchenMenu      | none        | It groups MenuItem records inside one Menu                                 |
| MenuItem         | MenuSection      | none        | It is one parent-owned catalogue row                                       |
| KitchenSale      | KitchenOrder     | none        | It is the immutable one-to-one result of Order completion                  |
| CustomerProfile  | User             | none        | It stores App-scoped ordering preferences, not another person identity     |
| CustomerOrderLink | User            | none        | It points to an Order without copying mutable Order lifecycle state         |
| MarketplaceOffer | MarketplaceStore | projection  | It has no lifecycle outside its Store                                      |
| MarketplaceOrder | MarketplaceStore | none        | It is private operational fulfilment truth for one Store                   |

The executable source is `scripts/_lib/entity-matrix.mjs`; the guard is
`scripts/guards/entity-matrix.mjs`. The matrix intentionally imports no runtime
mega-registry into Core.

## Confirmed relationship patterns

### Root plus App support

Kitchen, Supplier, Portfolio, and Property have one canonical root Entity and a
separate same-id App access record. The App record may contain bounded access
such as `operator_ids`, `team_ids`, and join requests. It is not a second Entity
identity and must not become a copied profile.

Joined reads require both valid halves and correct App scope. Missing or
mismatched support must fail closed rather than produce a selectable partial
target.

### Root plus same-id role

Place is the shared location Entity. Company is a root-stored, same-id Place
role Record whose exact persisted payload is only canonical creation and update
stamps. A Company marker is valid only with its valid same-id Place; it stores
no copied Place identity and has no App support or independent lifecycle.

Live, Demo, and Test use the same Place and Company model contracts. Scenario
wrappers may pair those roots for deterministic presentation, but they are not
alternate entity shapes. Public Company reads first validate the role marker
and then return the bounded exact Place projection; that transport DTO is not
either root.

Promote Company to an independent Entity only if product behavior establishes
legal or lifecycle truth that survives a Place, or a Company must own several
replaceable Places. Supplier currently links through `company_id` to this
Company role and then to the same-id Place; Supplier does not add a synonymous
`place_id`.

Run `scripts/audit-place-company-supplier.mjs` against an owning ecosystem
database to verify the complete relationship without writing data.

### Identity plus membership

User is public identity. AppUser is App-owned membership/entitlement and
UserAccount is private account support. Neither support record is another User.

The visible Dev/Admin/Premium/Free access badge is derived presentation. It is
not stored on User and never replaces server or Rules authority.

AppUser stores App governance (`role: user | admin`), an explicit Premium
grant, and onboarding lifecycle separately. A configured developer with a
valid membership resolves to Dev, an Admin resolves to Admin, then explicit
Premium and Free follow. Dev and Admin include Premium product capability, but
only the stored Admin role grants App administration. Empty profile and
Console-target indexes may be absent at rest; readers normalize them without
turning the indexes into authority.

Public User projections preserve the same split. Global runtimes may enumerate
the canonical User catalogue. Tenant runtimes first enumerate exact valid
AppUser memberships for their configured App, then hydrate only those canonical
User identities. Root `User.app_ids` is denormalized identity metadata, not
tenant-directory selection authority, and tenant detail routes apply the same
membership decision as their list.

### Root doorway plus scoped source

Menu is a root public doorway. KitchenMenu is a distinct Kitchen-scoped Entity
that owns structured content. A Menu may point to a KitchenMenu; publishing does
not turn them into one identity or justify copying the scoped tree into root.

### Parent-owned records

Recipe and Dish have independent lifecycles inside their owning Kitchen, so
they are parent-scoped Entities rather than root identities. Recipe owns
authored preparation content. Dish owns reusable food identity and media.

MenuSection, MenuItem, and KitchenStation can have stable document ids without
independent Entity lifecycle. Kitchen team join requests, document links,
financial facts, and similar parent-owned support should remain Records unless
product behavior proves otherwise. KitchenStation is owned below the same-id
AppKitchen support record; its stable local id lets Team and Mise records refer
to it without turning it into independent identity or access authority.

### Public projections

Directory entries, card DTOs, and other denormalized read models are transport
Shapes or Records, not competing Entities. A public route consumes an allowed
projection; it does not establish raw root-read authority.

## Useful non-Entity examples

- `FinancialMoney`: Primitive.
- `FinancialFact`: immutable App-owned Record derived from a source operation.
- `KitchenSale`: Kitchen-owned Record derived from a completed KitchenOrder.
- `AppUser`, `UserAccount`, and App access rows: support Records.
- `AppDirectoryEntry` and `EcosystemDirectoryEntry`: public projection Shapes
  or Records.
- Menu choice, fulfilment policy, and presentation objects: Shapes unless a
  separate lifecycle is later proved.

## Coverage boundary

The repository contains domain concepts whose models, routes, or collections
predate executable entity declarations. Examples include remaining profile
roots outside the confirmed Chef and Driver records, Task, and Blog
content.

Their existence is real; their FireUX Entity classification is not yet declared
by the matrix. Treat each as `to-confirm` for classification work. Do not
bulk-promote them from route or folder symmetry.

Ingredient is now a declared shared culinary root owned by
`fireux-kitchens`. Kitchen and Supplier operational records reference its
stable document id and hydrate only the bounded public projection. Its
canonical `name` is the popular name used by the shared world; language and
translation state are not Ingredient identity.

Recipe and Dish are confirmed Kitchen-scoped Entities. Recipe owns authored
preparation content; Dish owns reusable food identity and media. MenuItem is a
MenuSection-owned placement Record and must reference a Dish from the same
Kitchen. Run `scripts/audit-misebox-recipe-dish-menu-items.mjs` to verify those
scope fields and relationships in Misebox without writing data.

KitchenStation is a confirmed Kitchen-owned operational Record at
`apps/{appId}/kitchens/{kitchenId}/stations/{stationId}`. Run
`scripts/audit-misebox-kitchen-stations.mjs` to verify its AppKitchen parent,
scope, required fields, ordering, and Station references without writing data.

KitchenOrder is a confirmed Kitchen-scoped Entity with a trusted lifecycle.
Completing a ready Order atomically creates its same-id immutable KitchenSale
and FinancialFact. CustomerProfile is an optional App-scoped User profile
Record; CustomerOrderLink is a User-owned, App-scoped pointer that can exist
without that preferences record. Run
`scripts/audit-misebox-orders-sales-customers.mjs` for the read-only integrity
check. Legacy root links are planned by
`scripts/migrate-misebox-customer-order-links.mjs` and require an explicit
confirmation hash plus protected preimage before application.

ChefProfile and DriverProfile are confirmed User-backed Records. Their root
document id is the User uid; public profile reads join the canonical User
rather than copying person identity. Their App documents are non-identity
profile deltas. KitchenTeamMember and KitchenTeamJoinRequest are Kitchen-owned
operational Records. Neither record grants Console authority: AppKitchen
operator and team ids remain the access seam. Run
`scripts/audit-misebox-chef-driver-kitchen-team.mjs` to verify these profile,
membership, Kitchen, and workflow joins without writing data.

Product is a declared commercial root owned by `fireux-products`. It has an
independent lifecycle, route identity, pricing children, authorship, and
provider identity. Supplier Item is a Supplier-owned scoped Record: it must
link to Product with `product_id`, owns the Supplier's offer/SKU/packaging and
procurement terms, and may link to Ingredient when the offer represents
culinary stock. Neither wrapper copies Product or Ingredient identity.
Product document ids are hydrated by Firestore readers and need not be copied
into sparse stored records. A slug is required by a published doorway, not by
an inactive provider-imported Product that has no public route.

Run `scripts/audit-misebox-product-supplier-items.mjs` to verify Product,
Ingredient, Supplier, Supplier Ingredient, and Supplier Item links in the
Misebox owner database without writing data.

Kitchen root identity, its required Place, same-id AppKitchen access, and User
Console target pointers are verified by
`scripts/audit-misebox-kitchen-authority.mjs`. Kitchen root IDs remain stable
operational identity; authored public slugs resolve through the bounded Kitchen
server route seam. Confirmed inert AppKitchen access ids are planned and
preimage-protected by `scripts/migrate-misebox-kitchen-authority.mjs`; the
script requires an explicit confirmation hash before changing data.

## Storage and route implications

- Root identity does not guarantee a public index or raw public read.
- Parent-scoped identity does not prevent a bounded public doorway.
- Root Entities may have parent-owned operational children.
- Scoped Records should not receive root Collection Manager or page ceremony
  merely to reuse UI.
- Model and composable folder placement follows the declared owner; folders do
  not create ownership.
- App support records must use declared support paths and contain only their
  allowed non-identity delta.
- Cross-root relationships prefer canonical ids over copied Entity objects or
  inverse child arrays unless a separate projection owns that optimization.

Exact Firestore stack shape is mapped in
`docs/concepts/firestore-entity.md`. Exact public route behavior belongs in the
Public Index and Public Detail family maps.

## Delta register

| Difference                                                     | State        | Required direction                                                                                                                                                  |
| -------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing domain concepts exceed the executable matrix          | `drift`      | Review one owning package at a time; declare the concept or name it as Record, Shape, Primitive, or to-confirm                                                      |
| Place plus same-id Company role                                | `accepted`   | Place owns shared location identity; Company remains an exact stamps-only role marker and public reads reuse the Place projection                                   |
| Kitchen root + Place + App support composition                 | `accepted`   | Every Kitchen requires its linked Place; Kitchen owns operational identity/configuration, Place owns location presentation, and App support owns access only        |
| Supplier and Portfolio public-read contracts are unresolved    | `to-confirm` | Define bounded public DTOs before claiming public family parity                                                                                                     |
| Recipe and Dish Kitchen ownership                              | `accepted`   | Keep both as Kitchen-scoped Entities; Recipe owns authored preparation content, Dish owns reusable food identity/media, and MenuItem owns placement                  |
| Kitchen Order, Sale, and Customer link ownership               | `accepted`   | KitchenOrder owns lifecycle; KitchenSale is its immutable result; App-scoped Customer links point to Orders without duplicating their status                         |
| Product root plus Supplier Item relationship                   | `accepted`   | Product owns commercial identity and ProductPrice children; Supplier Item is a Supplier-owned offer Record with required `product_id` and optional `ingredient_id`   |
| Supplier location chain                                        | `accepted`   | Use Supplier → Company → same-id Place. A future depot or dispatch-site relationship must be proved separately rather than adding a synonymous Supplier `place_id`. |
| Directory publication implementation history lived in this map | `drift`      | Keep entity classification here and move current publication mechanics to source, guards, or a focused directory map if it becomes a recurring family               |

## Alignment roadmap

### Now

1. Require an entity checkpoint before adding model/page/composable ceremony.
2. Keep declaration axes explicit and public readability separate from root
   identity.
3. Keep Records and Shapes small until independent lifecycle proves promotion.

### Next

1. Reconcile existing undeclared domain concepts one owning package at a time.
2. Complete the Kitchen root/App-support identity migration.
3. Define Supplier and Portfolio bounded read contracts.

### Later

1. Extend the matrix only after models, authority, and public behavior agree.
2. Add guard semantics only for repeated classification failures, not
   unresolved product decisions.

## Guardrails

- Do not call every stored object an Entity.
- Do not use root as a synonym for public.
- Do not use scoped as a synonym for App support.
- Do not duplicate identity into access records.
- Do not add inverse relationship arrays by default.
- Do not let documentation confirm a concept absent from its source
  declaration and matrix.
