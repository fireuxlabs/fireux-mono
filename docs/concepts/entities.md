# Entities

Updated: 2026-07-22
Ref: 796952bf0
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

| Kind | Meaning |
| --- | --- |
| `entity` | A first-class domain thing whose identity matters over time |
| `record` | Stored support truth owned by another Entity |
| `shape` | Embedded or transport data with no independent lifecycle |
| `primitive` | Reusable low-level value type |
| `bucket` | Organizational folder, never domain truth |
| `to-confirm` | Classification is deliberately unresolved |

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

| Axis | Current vocabulary | Question answered |
| --- | --- | --- |
| `kind` | entity, record, shape, primitive, bucket, to-confirm | What sort of concept is it? |
| `family` | one or more named FireUX families | Which siblings should be compared? |
| `identity` | root, parent-scoped, none, to-confirm | Where does canonical identity live? |
| `authority` | owning App database, identity database, ecosystem identity database, FireUX control plane, parent, to-confirm | Who owns lifecycle truth? |
| `appSupport` | none, access record, membership record, operational record, profile delta, to-confirm | What non-identity App record may accompany it? |
| `publicRead` | none, direct root, projection, to-confirm | How, if at all, may public readers see it? |
| `status` | confirmed, to-confirm | Has the current classification been reviewed? |
| `console` | boolean | Is it a Console Entity? |
| `parent` | optional Entity name | Which Entity owns a parent-scoped declaration? |

Identity and public readability are independent. A root Entity can be private;
a parent-scoped Entity can have a bounded public projection.

## Executable matrix

The current declared Entities are:

| Entity | Family | Identity | Authority | App support | Public read | Console |
| --- | --- | --- | --- | --- | --- | --- |
| App | core, system | root | owning App database | none | projection | no |
| Ecosystem | system | root | Ecosystem identity database | none | projection | no |
| User | core, identity | root | identity database | membership record | projection | no |
| Project | system, console entity | root | FireUX control plane | none | none | yes |
| Job | content | root | owning App database | none | projection | no |
| Kitchen | kitchen, console entity | root | owning App database | access record | projection | yes |
| KitchenMenu | menu, kitchen | Kitchen-scoped | parent | none | projection | no |
| Menu | menu | root | owning App database | none | projection | no |
| Supplier | supplier, console entity | root | owning App database | access record | to-confirm | yes |
| Portfolio | portfolio, console entity | root | owning App database | access record | to-confirm | yes |
| Property | property, console entity | root | owning App database | access record | projection | yes |

The current declared Records are:

| Record | Parent | Public read | Why it is not an Entity |
| --- | --- | --- | --- |
| MenuSourceUpload | Kitchen | none | It is source material for a Kitchen workflow |
| MenuSection | KitchenMenu | none | It groups MenuItem records inside one Menu |
| MenuItem | MenuSection | none | It is one parent-owned catalogue row |

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

### Identity plus membership

User is public identity. UserApp is App-owned membership/entitlement and
UserPrivate is private account support. Neither support record is another User.

The visible Dev/Admin/Premium/Free access badge is derived presentation. It is
not stored on User and never replaces server or Rules authority.

UserApp stores App governance (`role: user | admin`), an explicit Premium
grant, and onboarding lifecycle separately. A configured developer with a
valid membership resolves to Dev, an Admin resolves to Admin, then explicit
Premium and Free follow. Dev and Admin include Premium product capability, but
only the stored Admin role grants App administration. Empty profile and
Console-target indexes may be absent at rest; readers normalize them without
turning the indexes into authority.

### Root doorway plus scoped source

Menu is a root public doorway. KitchenMenu is a distinct Kitchen-scoped Entity
that owns structured content. A Menu may point to a KitchenMenu; publishing does
not turn them into one identity or justify copying the scoped tree into root.

### Parent-owned records

MenuSection and MenuItem can have stable document ids without independent
Entity lifecycle. Kitchen team join requests, document links, financial facts,
and similar parent-owned support should remain Records unless product behavior
proves otherwise.

### Public projections

Directory entries, card DTOs, and other denormalized read models are transport
Shapes or Records, not competing Entities. A public route consumes an allowed
projection; it does not establish raw root-read authority.

## Useful non-Entity examples

- `FinancialMoney`: Primitive.
- `FinancialFact`: immutable App-owned Record derived from a source operation.
- `KitchenSale`: Kitchen-owned Record derived from a completed KitchenOrder.
- `UserApp`, `UserPrivate`, and App access rows: support Records.
- `AppDirectoryEntry` and `EcosystemDirectoryEntry`: public projection Shapes
  or Records.
- Menu choice, fulfilment policy, and presentation objects: Shapes unless a
  separate lifecycle is later proved.

## Coverage boundary

The repository contains domain concepts whose models, routes, or collections
predate executable entity declarations. Examples include Place, Company,
Ingredient, profile roots, Dish, KitchenOrder, Customer, Station, Task, and
Blog content.

Their existence is real; their FireUX Entity classification is not yet declared
by the matrix. Treat each as `to-confirm` for classification work. Do not
bulk-promote them from route or folder symmetry.

The matrix already records these explicit questions:

| Concept | State | Question |
| --- | --- | --- |
| Recipe | `to-confirm` | Does it remain Kitchen-scoped operational truth or gain root identity? |
| Product | `to-confirm` | Is it root identity with Supplier and Kitchen wrappers? |
| Supplier/Place relationship | `to-confirm` | Is Supplier company-level, site-level, or related to several Places? |

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

| Difference | State | Required direction |
| --- | --- | --- |
| Existing domain concepts exceed the executable matrix | `drift` | Review one owning package at a time; declare the concept or name it as Record, Shape, Primitive, or to-confirm |
| Kitchen legacy App rows duplicate Kitchen identity/style | `migration` | Move identity to the canonical Kitchen root and leave App support access-only after verified data cutover |
| Supplier and Portfolio public-read contracts are unresolved | `to-confirm` | Define bounded public DTOs before claiming public family parity |
| Recipe independent identity is unresolved | `to-confirm` | Keep it Kitchen-scoped until an independent lifecycle is proved |
| Product wrapper relationship is unresolved | `to-confirm` | Confirm root Product before formalizing Supplier Item or Kitchen Dish relationships around it |
| Supplier-to-Place relationship is unresolved | `to-confirm` | Decide company-level versus site-level Supplier meaning before adding an edge |
| Directory publication implementation history lived in this map | `drift` | Keep entity classification here and move current publication mechanics to source, guards, or a focused directory map if it becomes a recurring family |

## Alignment roadmap

### Now

1. Require an entity checkpoint before adding model/page/composable ceremony.
2. Keep declaration axes explicit and public readability separate from root
   identity.
3. Keep Records and Shapes small until independent lifecycle proves promotion.

### Next

1. Reconcile existing undeclared domain concepts one owning package at a time.
2. Complete the Kitchen root/App-support identity migration.
3. Resolve Recipe, Product, and Supplier/Place from product behavior rather
   than folder symmetry.
4. Define Supplier and Portfolio bounded public-read contracts.

### Later

1. Extend the matrix only after models, authority, and public behavior agree.
2. Add guard semantics only for repeated classification failures, not
   unresolved product decisions.
3. Create a focused directory-publication family map only if that mechanism
   remains a recurring cross-package concern.

## Guardrails

- Do not call every stored object an Entity.
- Do not use root as a synonym for public.
- Do not use scoped as a synonym for App support.
- Do not duplicate identity into access records.
- Do not add inverse relationship arrays by default.
- Do not let documentation confirm a concept absent from its source
  declaration and matrix.
