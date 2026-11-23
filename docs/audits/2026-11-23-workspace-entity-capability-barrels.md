# Workspace Entity capability barrels

Use a type-only barrel when a consumer already imports multiple peer record
types from the same capability. Kitchen Prep is the best first example. The
other five Entity families do not need barrels today.

This audit compares GitHub `main` at `3ad6694ec` with the clean local Kitchen
Items Stage 2 branch at `61aa6e584`. Both have the same Prep record files and
Kitchen aggregate. The Menu Section consumer imports the same two record types
on both revisions, although Stage 2 changes the placement schema. The
[Workspace contract](../concepts/workspace.md) and
[Entity model audit](2026-11-23-workspace-entity-models.md) establish the
ownership boundary. Each Entity owns its data and authority. Workspace composes
management screens and navigation.

## Six-Entity comparison

The barrel inventory covers TypeScript `index.ts` files within the six Entity
runtime directories and Kitchen's sibling Menu domain. Kitchen has runtime
component re-exports, Team and Waste tool exports, and Menu and Prep
composable implementations named `index.ts`. None is a type-only record barrel.
Business, Supplier, Project, Portfolio and Property have no `index.ts` in
their Entity runtime trees. A server `index/` folder contains implementation
files for a specific concern.

| Entity    | Existing organisation                                                                                                                                                                                                                                                                                                                                             | Current barrels                   | Recommended capability barrels                                            | Risks                                                                                                                                      | Priority         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| Kitchen   | [Kitchen and Item models](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts), Prep record families and standalone Orders, Tables, Finance and Waste records. Menu has a sibling namespace with its own Section and Entry records.                                                                                             | Runtime UI and tool exports only. | Prep first. Menu Sections is a separate, lower-value candidate.           | A Kitchen-wide barrel hides the aggregate's dependency on optional capabilities. A Menu barrel could imply ownership of Item or Promotion. | First            |
| Business  | [Business](../../packages/extensions/fireux-businesses/src/runtime/business/models/business.model.ts), storage definition and public directory/detail contracts in `models/`. Identity and Team have concrete workflows. Bookings is an [optional extension](../../packages/extensions/fireux-bookings/package.json).                                             | None.                             | None.                                                                     | Bundling Business, directory DTOs and Place would obscure separate owners and access paths.                                                | None             |
| Supplier  | [Root model](../../packages/extensions/fireux-suppliers/src/runtime/supplier/models/Supplier.model.ts) also defines Ingredient and Catalogue records. [Supplier Item](../../packages/extensions/fireux-suppliers/src/runtime/supplier/models/supplier-item.model.ts) and onboarding have separate models. Catalogue, Ingredients and Items have distinct readers. | None.                             | None now. Review placement of Ingredient and Catalogue definitions first. | A barrel would hide unrelated records already sharing one source file. Business, Place and Product retain their own types.                 | Ownership review |
| Project   | [Project](../../packages/extensions/fireux-projects/src/runtime/project/models/project.model.ts), intent models and a [Project-owned join feed](../../packages/extensions/fireux-projects/src/runtime/project/models/project-user-join.model.ts). App and Ecosystem capabilities consume Core models and readers.                                                 | None.                             | None. The join feed already has one source.                               | Re-exporting Core App, Ecosystem or AppUser through Project would misstate authority.                                                      | None             |
| Portfolio | [Portfolio](../../packages/extensions/fireux-properties/src/runtime/portfolio/models/portfolio.model.ts), public directory/detail models and a [Portfolio-owned Client record](../../packages/extensions/fireux-properties/src/runtime/portfolio/models/client.model.ts). Tasks, Documents and Compliance have their own extensions.                              | None.                             | None. Client already groups its own record types.                         | Portfolio-scoped collection paths alone are insufficient grounds to re-export each extension's types.                                      | None             |
| Property  | [Property](../../packages/extensions/fireux-properties/src/runtime/property/models/property.model.ts) includes its manual record and optional Portfolio ID. Directory and onboarding are separate contracts; Reservations has its [own model](../../packages/extensions/fireux-reservations/src/runtime/property/models/reservation.model.ts).                    | None.                             | None.                                                                     | A combined Property/Portfolio barrel would blur peer Entity boundaries. Manual and Reservations evolve independently.                      | None             |

## What the imports show

An AST scan of runtime TypeScript and Vue script blocks found 14 type-only
import statements in `kitchen.model.ts`, 11 from model or record paths. That
is the only root Entity model with this kind of fan-in. Three paths point to
Prep records. The other imports represent different owners, including
Workspace Team, Menu, Recipe and sales. A barrel can simplify the three Prep
lines. The aggregate's optional slots and dependencies are a separate design
question.

[Menu section editing](../../packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuSection.ts)
reads both `MenuEntry` and `MenuSection`. The other joint consumer,
[Menu path resolution](../../packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/utils/paths.ts),
uses the runtime storage constants and should keep its direct imports.

The comparable non-Kitchen import blocks show different responsibilities.
[Business detail](../../packages/extensions/fireux-businesses/src/runtime/business/composables/business/useBusinessDetail.ts)
combines a Business record, a response contract and a Place.
[Supplier detail](../../packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierDetail.ts)
combines Supplier, Business and Place. Project Identity combines its model and
a write intent. Property onboarding combines a handler result with the Property
model. Portfolio's records and reads generally import one model at a time.
These blocks benefit from explicit sources.

## Proposed convention and first slice

- Keep leaf files authoritative. A capability can export selected peer types
  using explicit `export type`. Consumers use relative `import type`. Keep
  single-record consumers, imports within the capability and imports of
  runtime values pointing directly at the defining leaf.
- Start with
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/records/prep/index.ts`.
  Export `KitchenIngredient` from `./ingredients/ingredient`, `Preparation` from
  `./preparations/preparation`, and `KitchenStation` from `./stations/station`.
  Replace only the three Prep imports in `kitchen/models/kitchen.model.ts`
  with one import from `../records/prep`. Keep the station and ingredient
  utility forwards in this slice because their current consumers are outside
  its scope.
- If another real consumer warrants it after Stage 2, consider
  `packages/extensions/fireux-kitchens/src/runtime/menu/records/sections/index.ts`.
  Export `MenuEntry` from `./entry` and `MenuSection` from `./section`. The two
  type imports in `menu/composables/useMenuSection.ts` would become one from
  `../records/sections`. Keep Status, Reference, create/update input types,
  storage and defaults at their leaves for their current callers.

A parent `records/index.ts` needs its own consumer with a legitimate reason
to import types across capabilities. None was found. Leave root `models/`,
Entity roots, flat single-record capability directories, Workspace
presentation, command, reader and composable directories out of this
convention. Keep handler payloads, validation shapes, storage defaults and
presentation state private to their owners or available at their existing
direct import paths.

## Ownership findings independent of barrels

- [Kitchen Promotion](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/records/menus/promotions/promotion.ts)
  lives under `records/menus`, while its [command target](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/promotions/target.ts)
  is a Kitchen-scoped collection. Any future move belongs to the Promotion
  owner. Menu still owns its placements and Item remains Kitchen-owned.
- Supplier Ingredient and Catalogue each have their own storage path despite
  living inside the root Supplier source file. If reorganised, give each
  record its own owner file before considering a barrel. Keep Supplier Item
  distinct from Kitchen Item.
- Review the Kitchen application aggregate separately if optional capability
  types continue to accumulate. It currently reaches through utility readers
  for service and fulfilment shapes. A shorter import list would leave those
  dependencies in place.

## Validation

- With TypeScript 5.9.2 and the root Bundler settings, in-memory versions of
  both proposed indexes resolved from their actual relative callers. The
  re-exports typechecked and emitted no JavaScript imports. Following resolved
  repository source imports and exports from their leaves found no cycle or
  back edge to either caller. The production workspace dependency graph was
  acyclic from all five domain packages and `fireux-workspace`.
- All five domain manifests export the Nuxt module, layer and a
  `./runtime/*` mapping to `./src/runtime/*.ts`. With monorepo aliases
  disabled, the package subpath ending at `records/prep` did not resolve
  through that mapping, while `records/prep/index` did. The same held for
  Menu Sections. A repo alias can therefore mask a broken installed-package
  import. Keep these candidate entry points relative and package-internal.
- Nuxt module registration targets composables and other runtime entry points,
  separate from the proposed indexes under `records/`. FireUX Workspace
  depends on Core and supplies shared management primitives. It does not
  import or re-export these domain records. No package export or registration
  changes are needed for the proposed first slice.
