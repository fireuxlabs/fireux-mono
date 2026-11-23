# Workspace Entity ownership and model audit

Reviewed the checked-in source after Workspace alignment `23616afc3` and
Items-only Delete `d8f77753c`. This is a source audit. “Present” means a route
or an implementation exists. Local lifecycle evidence is cited separately.
No live Firestore inspection was needed.

## Ownership and source convention

| Concept               | Responsibility                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace Entity      | Participates in App-selected Workspace navigation, active-record selection and governed management. Workspace uses the domain's accessible records and commands.             |
| Domain Entity         | Has a meaningful identity and lifecycle. Its storage may be root or parent-scoped. A Menu has its own lifecycle under Kitchen, with its own runtime owner.                   |
| Record                | Belongs to an Entity or another record. Stable IDs and CRUD are compatible with parent ownership. A Menu Section owns entries, and a Kitchen Item is owned by Kitchen.       |
| Capability            | An area of work that exposes readers, tools or commands. It can compose several owners and may be absent from an App.                                                        |
| Model                 | A TypeScript data contract for an Entity, Record or explicitly named reusable shape. Storage descriptors, input contracts, projections and form defaults have separate jobs. |
| Workspace integration | Existing route metadata, the App's `workspaces`, the domain controller and the optional Workspace module/layer. No new registry is required.                                 |

Place canonical contracts being aligned in `runtime/<owner>/models/<name>.model.ts`.
Use the same model for each consumer. Put reactive coordination in
`composables/`, presentation in `components/`, trusted reads and writes in
`server/`, and pure transforms and validation in `utils/`. Workspace
navigation may group siblings. Keep the current Firestore paths.

The [runtime map](../concepts/runtime-filesystem.md) explicitly permits record
definitions under `records/`. That explains the current layout. The proposed
target for canonical record types is `models/`, applied one verified move at
a time with no duplicate type or forwarding file. Existing `server/records/`
and `utils/records/` describe jobs within a technical directory. They do not
need to move for this convention. `models/` may keep genuinely consumed
defaults next to a contract while the owning boundaries are being aligned.
See the [Workspace contract](../concepts/workspace.md#entity-integration) and
[Entity map](../concepts/entities.md).

## Workspace Entity comparison

All six use `defineWorkspace` and `useWorkspace(family)`. Apps choose their
families and install Workspace. Domain controllers supply the permitted
collection. Kitchen and Property also use the route-safe Workspace switch.
The default and narrow Kitchen registrations remain separate.

| Entity and canonical model                                                                               | Shared surfaces                                                                                                                                                  | Domain capability and exposure status                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Business](../../packages/extensions/fireux-businesses/src/runtime/business/models/business.model.ts)    | Identity and Team are functional surfaces in the entrance. No dedicated Overview or Calendar.                                                                    | Locations uses Place links. Bookings is supplied by the optional Bookings extension and selected by Interlaken Bike Tours.                                                                                                                                                                                                                     |
| [Kitchen](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts)         | Identity & Brand, Team, Overview, and Calendar routes in the full layer. Shared Calendar route presence does not prove event coverage.                           | Items has an independently verified API lifecycle. Menus has a verified private draft checkpoint. Services, Promotions, Prep, Stock, Suppliers, Orders, Food Safety, Reports, Settings and QR have full-layer destinations or composed surfaces. Their individual workflows have separate evidence. Public Menu work is a separate checkpoint. |
| [Portfolio](../../packages/extensions/fireux-properties/src/runtime/portfolio/models/portfolio.model.ts) | Identity, Team, Overview and Calendar are present. Calendar data coverage remains unverified here.                                                               | Properties and Financial Signals are present in the owning extension. Compliance, Documents and Tasks have separate opt-in extension pages.                                                                                                                                                                                                    |
| [Project](../../packages/extensions/fireux-projects/src/runtime/project/models/project.model.ts)         | Identity, Team, Overview and Calendar are present. Test routes are supporting surfaces.                                                                          | Apps and Ecosystem are Project destinations coordinating Core-owned records. Ignition and its supporting views belong to the platform App.                                                                                                                                                                                                     |
| [Property](../../packages/extensions/fireux-properties/src/runtime/property/models/property.model.ts)    | Identity, Team and Overview are present. Base Calendar explicitly indicates unavailable events. The Reservations extension supplies the booking-backed Calendar. | Base Reservations is an unavailable placeholder. Real Reservations and availability are registered by the optional Reservations extension.                                                                                                                                                                                                     |
| [Supplier](../../packages/extensions/fireux-suppliers/src/runtime/supplier/models/Supplier.model.ts)     | Identity, Team, Overview and Calendar are present. Calendar event coverage remains unverified here.                                                              | Catalogue, Ingredients and Items have separate operator routes. Supplier Items are commercial offers. Their full lifecycle was not exercised in this audit.                                                                                                                                                                                    |

## Data and authority maps

Paths below are Firestore paths read from source. For child names listed after
a root path, append `/{collection}/{id}` unless noted. Relationships to
other roots retain those roots' separate authority.

- **Business →** `businesses/{businessId}` owns its profile, `team` and
  selected Place references in `place_ids`. It can exist with no Place.
  The public directory and detail readers project linked Place information.
  Business commands own profile, Team and links. Optional Bookings owns
  `bookings`, `booking-locks` and `booking-settings` under Business. Its
  external calendar integration does not establish a base Business Calendar.
  [Business mutation targets](../../packages/extensions/fireux-businesses/src/runtime/business/server/mutation-targets.ts) ·
  [Bookings targets](../../packages/extensions/fireux-bookings/src/runtime/server/business/targets.ts)
- **Kitchen →** `kitchens/{kitchenId}` owns identity and the optional domain
  records below. Root reads validate the canonical Kitchen projection.
  Trusted updates recheck the actor and Kitchen grant. The grant uses
  `kitchen_access`; Team is a separate roster. Place supplies linked venue
  data where available. [Kitchen reader](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/read-kitchen-document.ts) ·
  [Kitchen targets](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/mutation-targets.ts)
- **Portfolio →** `portfolios/{portfolioId}` owns Team, roles and Clients.
  Its Properties view reads separate `properties/{propertyId}` roots through
  Property's `portfolio_id` relationship. Compliance, Documents and Tasks
  extensions own commands and their Portfolio-scoped `compliance-records`,
  `documents`/ `document-links`, and `tasks` respectively. Finance is a
  reporting surface over domain data. [Portfolio reader](../../packages/extensions/fireux-properties/src/runtime/portfolio/server/index/read.ts) ·
  [Portfolio mutation targets](../../packages/extensions/fireux-properties/src/runtime/portfolio/server/mutation-targets.ts)
- **Project →** `projects/{projectId}` owns Team, roles and tests.
  Ecosystem's `project_id` relates it to Project. Apps retain App ownership
  and reference Ecosystem. Project management reads current App membership and
  Project access separately. Ignition remains App-composed. [Project authority](../../packages/extensions/fireux-projects/src/runtime/project/server/authority.ts) ·
  [Project targets](../../packages/extensions/fireux-projects/src/runtime/project/server/targets.ts)
- **Property →** `properties/{propertyId}` owns identity, Team, roles and
  the protected `private/manual` record. It references Place and can run
  without Portfolio. Reservations owns `reservations` and
  `reservation-nights` beneath the selected Property. Property readers and
  mutation targets remain independent of Reservations. [Property targets](../../packages/extensions/fireux-properties/src/runtime/property/server/mutation-targets.ts) ·
  [Reservation model](../../packages/extensions/fireux-reservations/src/runtime/property/models/reservation.model.ts)
- **Supplier →** `suppliers/{supplierId}` owns Team, roles, catalogue
  groupings, ingredient coverage and Item offers in `catalogues`,
  `ingredients` and `items`. Supplier references Business, which can
  reference Place. Supplier Items reference Product and may reference a
  canonical Ingredient. Groupings reference Supplier Items. They do not own
  selling terms. [Supplier targets](../../packages/extensions/fireux-suppliers/src/runtime/supplier/server/mutation-targets.ts) ·
  [Supplier Item](../../packages/extensions/fireux-suppliers/src/runtime/supplier/models/supplier-item.model.ts)

### Kitchen domain dependencies

| Capability              | Authority, model and persistence boundary                                                                                                                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Items                   | Kitchen-owned Item and selling shape at `dishes/{dishId}`. The direct Items page reads the scoped collection and calls Kitchen Item commands. Create and update work without Menus. Delete checks existing Menu/Promotion references without requiring their routes or any records. |
| Menus                   | Domain Entity under `menus/{menuId}`. Sections are Menu records, and placements at `sections/{sectionId}/items/{itemId}` reference Kitchen Items. Menu commands own publication and placement. Menu source uploads are Kitchen workflow records at `menu-uploads/{uploadId}`.       |
| Services                | Kitchen Offering records at `offerings/{offeringId}` configure services and may associate Menus. The service settings map on Kitchen is optional. Ordering consumes eligible published offers where installed.                                                                      |
| Promotions              | Kitchen-owned `promotions/{promotionId}` records reference dishes. The Menus navigation group links to the workflow.                                                                                                                                                                |
| Prep                    | Kitchen owns `prep-items`, `stations` and scoped ingredient links. Shared Ingredient roots are at `ingredients/{ingredientId}`. Active Recipe commands still use Kitchen-scoped `recipes`. The User-owned Recipe target remains a separate migration.                               |
| Stock and Suppliers     | Stock composes purchasing, receiving, inventory and waste views. Kitchen links supplier coverage and consumed Ingredients. Supplier identity and its catalogue remain Supplier-owned. Waste events are Kitchen records.                                                             |
| Orders                  | Kitchen owns order draft and submission state, counters, table tabs/rounds and completed sales. Placement and price resolution may consume Menu and Service when the ordering channel requires them. Kitchen identity and Items do not need those channels.                         |
| Food Safety and Reports | Existing destinations compose their owning records or reporting readers. Reports include Sales, Costs, Service and Waste. A route establishes no separate stored model or feature-completeness claim.                                                                               |
| Settings and QR         | Settings exposes access and provider integration. Sproochli uses the Kitchen-owned integration child. QR consumes an existing guest destination. Neither the Settings group nor QR creates a root Entity.                                                                           |

See the [Items lifecycle evidence](../handoffs/2026-11-23-kitchen-items-lifecycle.md)
and the [Kitchen build order](../handoffs/2026-11-20-kitchen-real-world-build-order.md).
Items-only visibility still differs from the full Misebox editor. The direct
Items route has no Delete button or image upload. That decision is separate
from the verified API boundary.

## Kitchen model inventory and disposition

Paths are relative to `packages/extensions/fireux-kitchens/src/runtime/`.
Grouped rows list files sharing a disposition. The consumer index below
contains source-level references to the current files.

| Current path                                                                                            | Responsibility and owner                                                           | Proposed destination or decision                                                                                                       |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `kitchen/models/kitchen.model.ts`                                                                       | Canonical Kitchen projection.                                                      | Completed filename alignment from `model.ts`.                                                                                          |
| `kitchen/models/item.model.ts`                                                                          | Canonical Kitchen Item and consumed `ItemStorage` metadata.                        | Moved together in the Item checkpoint. The exports and `dishes` path are unchanged.                                                    |
| `kitchen/records/menus/items/item-offer.ts`                                                             | Selling and choice-group shapes owned by Kitchen Items.                            | Consider `kitchen/models/item-offer.model.ts` after the Item move. Keep selling types outside the Kitchen root model.                  |
| `kitchen/records/menus/promotions/promotion.ts`                                                         | Promotion record, write input and guest projection in one file.                    | Separate canonical record and public/input contracts only when working on Promotions. Move the record to Kitchen models in that slice. |
| `kitchen/records/order.ts`, `order-submission.ts`                                                       | Kitchen Order, draft envelope, submission state, and module channel configuration. | Keep the Orders owner. Separate canonical models from channel config and coordination in an Orders slice.                              |
| `kitchen/records/prep/ingredients/ingredient.ts`, `preparations/preparation.ts`, `stations/station.ts`  | Kitchen-local Ingredient link, Preparation and Station records.                    | Align each under Kitchen models as used. Keep the local Ingredient separate from the global Ingredient model.                          |
| `kitchen/records/sale.ts`, `supplier-ingredient.ts`, `table-round.ts`, `table-tab.ts`, `waste-event.ts` | Kitchen-scoped Sale, supplier relationship, table operations and waste records.    | Kitchen models by capability slice. Keep record ownership and existing storage.                                                        |
| `menu/models/menu.model.ts`                                                                             | Canonical Kitchen-scoped Menu and document variant.                                | Keep.                                                                                                                                  |
| `menu/models/menu-storage.model.ts`                                                                     | Menu paths, defaults, command input types, capacity and a type re-export.          | Keep during public Menu work. Review moving storage metadata and input ownership only as one verified consumer cutover.                |
| `menu/records/sections/section.ts`, `entry.ts`                                                          | Menu Section and Entry definitions, storage, defaults and inputs.                  | Later `menu/models/menu-section.model.ts` and `menu/models/menu-entry.model.ts`. Preserve placement references and defaults.           |
| `menu/models/menu-context.model.ts`                                                                     | Route/surface vocabulary.                                                          | Keep near Menu presentation integration when the route owner is next touched.                                                          |
| `menu/models/menu-detail.model.ts`, `menu-directory.response.ts`                                        | Menu public/detail and paginated directory transport projections.                  | Keep with their current consumers through public Menu verification. Later name and place with the read/transport owner.                |
| `menu/models/menu-food.model.ts`                                                                        | Compatibility aliases of Menu manifest content.                                    | Review actual aliases independently before consolidation.                                                                              |
| `menu/models/menu-ordering.model.ts`                                                                    | Menu-facing offering/ordering shapes that compose Kitchen fulfilment types.        | Keep in the consuming integration until the Orders boundary is verified.                                                               |
| `menu/models/menu-review.model.ts`, `menu-source-upload.model.ts`                                       | Review shape and Kitchen-scoped upload record used by Menu workflows.              | Preserve both contracts. Clarify upload ownership when that workflow changes.                                                          |
| `menu/models/pdf-worker.d.ts`                                                                           | Ambient declaration for the PDF client worker.                                     | Place with the worker integration when its TypeScript inclusion is verified.                                                           |
| `menu/server/records/{create,delete,update}.ts`                                                         | Trusted Menu commands.                                                             | Keep with Menu server behavior.                                                                                                        |
| `menu/utils/records/{create-input,file-identity,item-patch,metadata}.ts`                                | Input validation and metadata transforms.                                          | Keep as Menu helpers.                                                                                                                  |
| `ingredient/models/ingredient.model.ts`, `ingredient-taxonomy.ts`                                       | Shared culinary root and its taxonomy/options.                                     | Keep Ingredient root. Move presentation options only if the taxonomy develops distinct consumers.                                      |
| `ingredient/models/ingredient-create-form.ts`, `ingredient-directory.model.ts`                          | Form and directory/detail DTO.                                                     | Keep pending owner-led moves to form and read contracts.                                                                               |
| `recipe/models/model.ts`                                                                                | Active Recipe shape and input used by Kitchen-backed commands.                     | Later filename alignment to `recipe.model.ts`. Keep source and persistence ownership decisions separate.                               |
| `user/models/{chef,customer,driver}.model.ts`                                                           | User-owned Profile contracts.                                                      | Keep with User profiles.                                                                                                               |
| `user/models/driver/{dispatch,kitchen-access}.ts`                                                       | Dispatch payload, filters, and Kitchen-link action contracts.                      | Reassess placement with Driver integration. They do not establish another Workspace Entity.                                            |
| `models/shared/{currency-display,weekday-time}.model.ts`                                                | Shared presentation currency and weekday time shapes.                              | Keep shared while independent owners consume them. Currency formatting does not own currency data.                                     |

## Other Entity models and similarly named files

Paths in each row are relative to that Entity's `models/` directory. Root
model links appear in the comparison above. The optional extensions retain
their own model and persistence boundaries.

| Owner            | Files and responsibility                                                                                                                                                                                                                                                         | Decision                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business         | `business.model.ts` is the root type. `business.entity.ts` is a storage descriptor. `business-collection.model.ts` is directory/detail DTOs and paging constants.                                                                                                                | Keep root and descriptor separate. Rename descriptor and projection in a Business slice with consumers.                                                                 |
| Portfolio        | `portfolio.model.ts` mixes inferred root/defaults, storage, Team and inputs. `client.model.ts` is a scoped record. `portfolio-read.model.ts` holds public projections. `capabilities.ts` supplies display operations and `capability-agents.ts` supplies agent descriptors.      | Keep Client as a canonical type. Remove inference scaffolding from the root in a verified type-only slice. Move projections and exposure metadata with their consumers. |
| Project          | `project.model.ts` has root and public summary. `project-user-join.model.ts` describes `project-user-monitor`. `identity-intent.ts`, `intent.ts`, `landing-intent.ts` are action/recommendation contracts. `agent-capabilities.ts` lists agent descriptor capabilities.          | Keep root and monitor separate. Align intent contracts with their server/Workspace consumers and reuse exact Core stamp types in a later Project slice.                 |
| Property         | `property.model.ts` holds root/defaults, private manual and inputs. `property-index.model.ts` is a directory projection. `property-onboarding.model.ts` is an onboarding response. `capabilities.ts` and `capability-agents.ts` describe exposure.                               | Retain private manual and defaults consumed by the editor. Treat the directory and onboarding types as separate contracts. Align explicit root type separately.         |
| Supplier         | `Supplier.model.ts` holds root/defaults, Team storage, scoped Ingredient/Catalogue types and Item exports. `supplier-item.model.ts` owns the offer record. `supplier-onboarding.model.ts` is a command contract. `capabilities.ts` and `capability-agents.ts` describe exposure. | Later case-only root rename. Keep the Supplier Item separate from Kitchen Item. Split root inference and scoped contracts only after consumers are verified.            |
| Extension models | Compliance `compliance-record.model.ts`, Documents `document.model.ts` and `document-link.model.ts`, Tasks `task.model.ts`, Reservations `reservation.model.ts`, and Bookings `business-bookings.ts`.                                                                            | These models and commands remain with their opt-in extensions.                                                                                                          |

Portfolio, Property and Supplier `capabilities.ts` feed App literature
and landing surfaces. Their `capability-agents.ts` descriptors are consumed
by ecosystem agent composition. Project's `agent-capabilities.ts` likewise
feeds its ecosystem. These are capability exposure and agent routing
contracts, not canonical models or evidence that a command is authorized.
The current App/route registration and trusted server command are the
authorities for exposure and execution respectively.

## Checkpoints and open decisions

1. **A and first B slice.** Inventory ownership and rename only the Kitchen
   root model in this checkpoint. Preserve root source contents. Update its
   runtime type imports, type-contract test, Ignition source references and docs.
2. **B Item slice.** Moved Kitchen's Item type and consumed storage metadata
   together to `kitchen/models/item.model.ts`. The separate selling contract
   stays with its existing consumers.
3. **C.** Address the remaining Kitchen types only when their owner is clear.
   Begin with a non-Menu record. Defer Menu Section/Entry and transport
   moves until the public Menu checkpoint is closed.
4. **D.** Verify Supplier's case-only rename separately. Then work on the
   other Entity owners one at a time. Default names and descriptor vocabulary
   are lower priority than removing incorrect dependencies.
5. **E and F.** Resolve Business Overview and a real Calendar event source.
   Check Calendar behavior in App opt-ins and distinguish Property's
   Reservations dependency. Update the existing canon as each model boundary
   is proven. Avoid an additional conventions guide or registry.

## Direct source reference index

<details>
<summary>Expand checked-in consumers</summary>

Direct relative imports, package imports and resolvable source-path literals
in checked-in TypeScript, JavaScript and Vue files. This excludes transitive
consumers, generated copies and paths assembled dynamically. Ambient declarations
can be included by a TypeScript project with no import.

```text
packages/extensions/fireux-bookings/src/runtime/models/business-bookings.ts
  packages/extensions/fireux-bookings/src/runtime/business/components/Workspace/Availability.vue
  packages/extensions/fireux-bookings/src/runtime/business/components/Workspace/Index.vue
  packages/extensions/fireux-bookings/src/runtime/business/components/Workspace/List.vue
  packages/extensions/fireux-bookings/src/runtime/server/business/store.ts
  packages/extensions/fireux-bookings/src/runtime/utils/availability.ts
  projects/slap/interlaken-bike-tours/server/utils/tour-booking.ts
packages/extensions/fireux-businesses/src/runtime/business/models/business-collection.model.ts
  packages/extensions/fireux-businesses/src/runtime/business/composables/business/useBusinessDetail.ts
  packages/extensions/fireux-businesses/src/runtime/business/composables/useBusinessCollection.ts
  packages/extensions/fireux-businesses/src/runtime/business/server/business/directory.ts
  packages/extensions/fireux-businesses/src/runtime/business/server/business/projection.ts
  packages/extensions/fireux-businesses/src/runtime/server/api/businesses/[businessId].get.ts
packages/extensions/fireux-businesses/src/runtime/business/models/business.entity.ts
  packages/extensions/fireux-businesses/src/runtime/business/composables/business/useBusinessInterface.ts
  packages/extensions/fireux-businesses/src/runtime/business/composables/useBusinessCollection.ts
  packages/extensions/fireux-jobs/src/runtime/job/server/identity/read.ts
  packages/extensions/fireux-jobs/src/runtime/job/server/index/read.ts
  packages/extensions/fireux-jobs/src/runtime/user/components/Professional/Edit/Sections/Experience.vue
packages/extensions/fireux-businesses/src/runtime/business/models/business.model.ts
  packages/extensions/fireux-businesses/src/runtime/business/components/Business/Collection/Manager.vue
  packages/extensions/fireux-businesses/src/runtime/business/components/Workspace/Profile.vue
  packages/extensions/fireux-businesses/src/runtime/business/composables/business/useBusinessDetail.ts
  packages/extensions/fireux-businesses/src/runtime/business/composables/business/useBusinessInterface.ts
  packages/extensions/fireux-businesses/src/runtime/business/composables/firestore/business/utils/useBusinessSeo.ts
  packages/extensions/fireux-businesses/src/runtime/business/composables/useBusinessCollection.ts
  packages/extensions/fireux-businesses/src/runtime/business/composables/useBusinessWorkspace.ts
  packages/extensions/fireux-businesses/src/runtime/business/models/business-collection.model.ts
  packages/extensions/fireux-businesses/src/runtime/business/utils/normalize-business.ts
  packages/extensions/fireux-jobs/src/runtime/job/composables/useJobDetail.ts
  packages/extensions/fireux-jobs/src/runtime/job/models/job-collection.model.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierCollection.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierDetail.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/server/identity/read.ts
packages/extensions/fireux-compliance/src/runtime/portfolio/models/compliance-record.model.ts
  packages/extensions/fireux-compliance/src/runtime/portfolio/components/Workspace/Compliance/Index.vue
  packages/extensions/fireux-compliance/src/runtime/portfolio/composables/compliance/useComplianceInterface.ts
  packages/extensions/fireux-compliance/src/runtime/portfolio/composables/usePortfolioComplianceRecordCollection.ts
  projects/granite/granite-app/app/search-demand.ts
packages/extensions/fireux-documents/src/runtime/portfolio/models/document-link.model.ts
  packages/extensions/fireux-documents/src/runtime/portfolio/components/Workspace/Documents/Index.vue
  packages/extensions/fireux-documents/src/runtime/portfolio/composables/documents/usePortfolioDocumentLinks.ts
  packages/extensions/fireux-documents/src/runtime/portfolio/utils/documents/linkDocumentToEntity.ts
  packages/extensions/fireux-documents/src/runtime/portfolio/utils/documents/validateDocumentLinkTarget.ts
packages/extensions/fireux-documents/src/runtime/portfolio/models/document.model.ts
  packages/extensions/fireux-documents/src/runtime/portfolio/components/Workspace/Documents/Index.vue
  packages/extensions/fireux-documents/src/runtime/portfolio/composables/documents/useDocumentInterface.ts
  packages/extensions/fireux-documents/src/runtime/portfolio/composables/documents/usePortfolioDocuments.ts
packages/extensions/fireux-kitchens/src/runtime/ingredient/models/ingredient-create-form.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Create/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Create/Write.vue
packages/extensions/fireux-kitchens/src/runtime/ingredient/models/ingredient-directory.model.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/composables/firestore/mutations/useIngredientCreate.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/composables/firestore/mutations/useIngredientUpdate.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/composables/useIngredientCollection.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/composables/useIngredientDetail.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/ingredients/useKitchenIngredients.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/ingredients/[id].get.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/ingredients/index.get.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/internal/ingredients/index.get.ts
packages/extensions/fireux-kitchens/src/runtime/ingredient/models/ingredient-taxonomy.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Collection/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Create/Write.vue
  packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Edit/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/ingredient/composables/useIngredientInterface.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/models/ingredient-create-form.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/models/ingredient.model.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/server/category-migration.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/server/curation-input.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/server/curation-storage.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Prep/Ingredients/Add/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Prep/Ingredients/Preview.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Prep/Ingredients/useCatalogue.ts
  packages/extensions/fireux-kitchens/src/test/ingredient-command-internals.test.mjs
  packages/extensions/fireux-kitchens/src/test/ingredient-identity.test.mjs
  packages/extensions/fireux-kitchens/src/test/kitchen/item-commands.test.mjs
  packages/extensions/fireux-kitchens/src/test/recipe-command-internals.test.mjs
packages/extensions/fireux-kitchens/src/runtime/ingredient/models/ingredient.model.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Detail/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/ingredient/composables/useIngredientDetail.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/composables/useIngredientInterface.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/models/ingredient-directory.model.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/server/create.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/server/list-for-curator.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/server/update.ts
  packages/extensions/fireux-kitchens/src/runtime/ingredient/utils/ingredient.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Identity/ListingEdit.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Identity/OperatingHours/Kitchen.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Settings/Integrations/WebsiteMenu.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/useKitchenCollection.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/useKitchenInterface.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/update-input.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/onboarding/kitchen-input.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/types/presentation.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/types/public.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/read-kitchen-document.ts
  packages/extensions/fireux-kitchens/src/test/kitchen/contracts.types.test.ts
  projects/fireux/fireux-app/app/ignition/industry-comparisons.ts
  projects/fireux/fireux-app/app/ignition/misebox-reference.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/menus/items/item-offer.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Items/Pricing.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Items/Pricing/Groups.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item-choices.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item-pricing.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/components/ItemChoices.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuItemChoicePreview.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-detail.model.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/models/item.model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Items/Detail/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Items/Detail/WorkspaceItemDetail.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/items/useKitchenItemRead.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/useKitchenItemCollection.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/items/useKitchenWorkspaceItems.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/server/items/flagship-projection.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/server/mutation-targets.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item-identity.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/components/ItemDetail.vue
  packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/dishes/[dishId]/image.post.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/drinks/description.post.ts
  packages/extensions/fireux-kitchens/src/test/item-reader-internals.test.mjs
  packages/extensions/fireux-kitchens/src/test/kitchen/item/foundation.test.mjs
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/menus/promotions/promotion.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Promotions/Collection/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Promotions/Collection/Row.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/promotions/useKitchenPromotionsContext.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/catalogue.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/promotions/useKitchenWorkspacePromotions.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/server/promotions/read.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/food-catalogue-summary.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/promotions/pricing.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuSection.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-detail.model.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/order-submission.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Orders/Board.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/server/orders/submission.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/order-submission.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/order.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Orders/Ticket.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Orders/Board.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Orders/Editor.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Orders/Ticket.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/orders/useKitchenOrderDraftSave.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/records/order-submission.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/order-submission.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/ordering.ts
  projects/misebox/misebox-app/app/components/Docs/OrderingTicket/Index.vue
  projects/misebox/misebox-app/app/components/Docs/OrderingTicket/Preview.vue
  projects/misebox/misebox-app/app/search-demand/capability-assessments.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/prep/ingredients/ingredient.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-ingredient.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/prep/preparations/preparation.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Prep/Library.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Prep/Preparations/Editor.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Prep/Recipes/Editor.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/preparations/useKitchenPreparationsRead.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/prep/recipes/editor.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/preparation-changes.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/prep/stations/station.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/station.ts
  projects/fireux/fireux-app/app/ignition/industry-comparisons.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/sale.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/server/finance/sale-pricing.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/sale.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/supplier-ingredient.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-supplier-ingredient.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/table-round.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/records/table-tab.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/table-tab.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/table-tab.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/table-tab.ts
packages/extensions/fireux-kitchens/src/runtime/kitchen/records/waste-event.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/waste-event.ts
packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-context.model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/menus/qr.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenu.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuQrPage.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-directory.response.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-ordering.model.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/types.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/catalogue/picks.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/navigation/context.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/navigation/route.ts
  packages/extensions/fireux-kitchens/src/test/food-foundation-journey.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-browse-availability.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-offering-summary.test.mjs
packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-detail.model.ts
  packages/ecosystem/fireux-misebox/src/runtime/components/TemplateOne/ItemCard.vue
  packages/ecosystem/fireux-misebox/src/runtime/models/template-one.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/types/public.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/promotions/pricing.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/components/Browse/Catalogue/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/components/Browse/Item.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/components/Detail/Document/Viewer.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/components/MealDeal.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenu.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuDocument.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-food.model.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/pages/browse.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/server/document/read.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/build.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/document.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/manifest.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/presentation.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/sections.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/sproochli/resolve.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/catalogue/section-links.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/navigation/context.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/ordering/sections.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/menus/service/items.get.ts
  projects/misebox/friiites/app/pages/index.vue
  projects/misebox/misebox-app/app/components/MenuHosting/Published.vue
  projects/misebox/misebox-app/app/composables/useDefaultKioskSkinPreview.ts
  projects/misebox/misebox-app/app/pages/templates/[slug].vue
packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-directory.response.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-ordering-choices.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/components/Cards/Cell.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/components/Cards/Pill.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/components/Cards/Preview.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/components/Collection/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/components/Collection/Results.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/components/ItemDetail.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuCardPresentation.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuDirectory.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/index/context.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/index/food-search.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/index/projection.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/index/read.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/catalogue/discovery.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/catalogue/picks.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/catalogue/venue-groups.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/ordering/offerings.ts
packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-food.model.ts
  No direct static reference found
packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-ordering.model.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-detail.model.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/manifest/choices.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/offerings/projection.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/offering-profile.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/navigation/context.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/ordering/availability.ts
  projects/misebox/misebox-app/app/composables/useDefaultKioskSkinPreview.ts
packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-review.model.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/publication/review.ts
  projects/misebox/misebox-app/shared/types/menu-express.ts
packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-source-upload.model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Menus/Uploads/Detail/File.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/menu/useKitchenMenuPreparation.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/menu/useMenuSourceProcess.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/menus/useKitchenMenuRecordContext.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/menus/useKitchenWorkspaceMenuSources.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/document/file.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/source/uploads.ts
  projects/misebox/misebox-app/test/menu-express-review-file.test.mjs
packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-storage.model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/QR/Panel.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/menus/qr.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/menus/useKitchenWorkspaceMenus.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/menus/useMenuRecordMetadata.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/mutations/useMenuUpdate.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/utils/paths.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useKitchenMenuCollection.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useKitchenMenuRead.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/creation-capacity.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/draft/write.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/index/read.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/records/update.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/records/create-input.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/records/metadata.ts
  packages/extensions/fireux-kitchens/src/test/menu-reader-internals.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-workspace-commands.test.mjs
packages/extensions/fireux-kitchens/src/runtime/menu/models/menu.model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Identity/OperatingHours/Offerings.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Items/Detail/Menus/Menu.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Items/Detail/Menus/Section.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Overview/Collection/Card.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Overview/Collection/Grid.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Overview/Collection/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Overview/Collection/SpecialsCard.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Overview/Collection/useCard.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menus/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Services/Setup/Interaction.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Services/Setup/MenuWindows.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Services/Setup/Menus.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/menu/useKitchenMenuPreparation.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/menu/useMenuSourceProcess.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/catalogue.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/useKitchenWorkspaceMenuSpecials.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/food-catalogue-summary.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/food-service-summary.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/menu-offering-summary.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/menu-website-snippet.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/service-menus.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/service-overview.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useDatedMenuDishRead.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuSection.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-detail.model.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-storage.model.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/document/protected-file.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/document/read.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/document/starter.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/publication/publish.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/records/create.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/records/metadata.ts
packages/extensions/fireux-kitchens/src/runtime/menu/records/sections/entry.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/mutations/useMenuItemMutations.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/utils/paths.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuEntryCollection.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuSection.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/items/write.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/records/item-patch.ts
packages/extensions/fireux-kitchens/src/runtime/menu/records/sections/section.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Items/Detail/Menus/Section.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Menus/Sections/Collection/Row.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menus/Section.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/mutations/useMenuSectionMutations.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/utils/paths.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuSection.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuSectionCollection.ts
packages/extensions/fireux-kitchens/src/runtime/menu/server/records/create.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/source/document.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/menus/index.post.ts
  packages/extensions/fireux-kitchens/src/test/menu-document-preparation.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-record-input-internals.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-workspace-commands.test.mjs
packages/extensions/fireux-kitchens/src/runtime/menu/server/records/delete.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/menus/index.delete.ts
  packages/extensions/fireux-kitchens/src/test/kitchen/menu-metadata.test.mjs
packages/extensions/fireux-kitchens/src/runtime/menu/server/records/update.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/menus/index.patch.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/menus/rename.post.ts
  packages/extensions/fireux-kitchens/src/test/food-foundation-journey.test.mjs
  packages/extensions/fireux-kitchens/src/test/kitchen/menu-metadata.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-name.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-record-input-internals.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-workspace-commands.test.mjs
packages/extensions/fireux-kitchens/src/runtime/menu/utils/records/create-input.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/mutations/useMenuCreate.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/records/create.ts
  packages/extensions/fireux-kitchens/src/test/menu-document-preparation.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-record-input-internals.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-record-shape.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-workspace-commands.test.mjs
packages/extensions/fireux-kitchens/src/runtime/menu/utils/records/file-identity.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Menus/Detail/Document.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Menus/Uploads/Detail/File.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/server/document/protected-file.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/document/read.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/source/read-file.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/source/rows.ts
  packages/extensions/fireux-kitchens/src/test/menu-document-self-service.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-protected-file.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-protected-preview-consumers.test.mjs
  projects/misebox/misebox-app/test/menu-express-review-file.test.mjs
packages/extensions/fireux-kitchens/src/runtime/menu/utils/records/item-patch.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/mutations/useMenuItemMutations.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/items/write.ts
  packages/extensions/fireux-kitchens/src/test/kitchen/menu-content-commands.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-record-input-internals.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-workspace-commands.test.mjs
packages/extensions/fireux-kitchens/src/runtime/menu/utils/records/metadata.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/document/save.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/publication/review.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/records/update.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/source/document.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/utils/records/create-input.ts
  packages/extensions/fireux-kitchens/src/test/food-foundation-journey.test.mjs
  packages/extensions/fireux-kitchens/src/test/kitchen/menu-metadata.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-document-preparation.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-document-self-service.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-name.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-record-input-internals.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-record-shape.test.mjs
  packages/extensions/fireux-kitchens/src/test/menu-workspace-commands.test.mjs
  projects/misebox/misebox-app/test/menu-express.test.mjs
packages/extensions/fireux-kitchens/src/runtime/models/shared/currency-display.model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-presentation.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/components/Browse/Catalogue/Index.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/components/Browse/Item.vue
  packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuDetail.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-detail.model.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/ownership/kitchen-scope.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/types.ts
  packages/extensions/fireux-kitchens/src/runtime/utils/currency-display.ts
packages/extensions/fireux-kitchens/src/runtime/models/shared/weekday-time.model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Services/Setup/Hours.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Services/Setup/Hours/Range.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Services/Setup/MenuWindows.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Services/Setup/ServiceHours.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/promotions/usePromotionEditor.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/menus/useMenuRecordHours.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/ordering/useKitchenOperationHours.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/services/useServiceSetup.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/records/menus/promotions/promotion.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/offering-policy.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/public-offerings.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/service-hours.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-ordering.model.ts
  packages/extensions/fireux-kitchens/src/runtime/menu/models/menu.model.ts
  packages/extensions/fireux-kitchens/src/runtime/utils/weekday-time-config.ts
  packages/extensions/fireux-kitchens/src/runtime/utils/weekday-time-constraints.ts
  packages/extensions/fireux-kitchens/src/runtime/utils/weekday-time-core.ts
  packages/extensions/fireux-kitchens/src/runtime/utils/weekday-time-format.ts
  packages/extensions/fireux-kitchens/src/runtime/utils/weekday-time-next.ts
  packages/extensions/fireux-kitchens/src/runtime/utils/weekday-time-state.ts
packages/extensions/fireux-kitchens/src/runtime/recipe/models/model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Prep/Library.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Prep/Recipes/Editor.vue
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/prep/recipes/editor.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/prep/recipes/form.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/prep/recipes/read.ts
  packages/extensions/fireux-kitchens/src/runtime/recipe/utils/changes.ts
packages/extensions/fireux-kitchens/src/runtime/user/models/chef.model.ts
  packages/extensions/fireux-kitchens/src/runtime/user/utils/chef.ts
packages/extensions/fireux-kitchens/src/runtime/user/models/customer.model.ts
  packages/extensions/fireux-kitchens/src/runtime/user/utils/customer.ts
packages/extensions/fireux-kitchens/src/runtime/user/models/driver.model.ts
  packages/extensions/fireux-kitchens/src/runtime/user/utils/driver.ts
  packages/extensions/fireux-kitchens/src/runtime/user/utils/driver/kitchen-links.ts
packages/extensions/fireux-kitchens/src/runtime/user/models/driver/dispatch.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/internal/driver/dispatch-watch.post.ts
  packages/extensions/fireux-kitchens/src/runtime/user/components/Driver/Delivery/Pings.vue
  packages/extensions/fireux-kitchens/src/runtime/user/composables/driver/useDriverDispatches.ts
  packages/extensions/fireux-kitchens/src/runtime/user/server/driver/dispatch.ts
packages/extensions/fireux-kitchens/src/runtime/user/models/driver/kitchen-access.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/internal/kitchen/driver-access.post.ts
  packages/extensions/fireux-kitchens/src/runtime/user/server/driver/access.ts
  packages/extensions/fireux-kitchens/src/runtime/user/utils/driver/kitchen-links.ts
packages/extensions/fireux-projects/src/runtime/project/models/agent-capabilities.ts
  packages/ecosystem/fireux-fireux/src/runtime/models/workspace-agents.ts
packages/extensions/fireux-projects/src/runtime/project/models/identity-intent.ts
  packages/extensions/fireux-projects/src/runtime/project/components/Workspace/Identity/Write.vue
  packages/extensions/fireux-projects/src/runtime/project/models/intent.ts
packages/extensions/fireux-projects/src/runtime/project/models/intent.ts
  packages/extensions/fireux-projects/src/runtime/project/components/Workspace/Home/Intent.vue
  packages/extensions/fireux-projects/src/runtime/project/components/Workspace/Team/AI.vue
packages/extensions/fireux-projects/src/runtime/project/models/landing-intent.ts
  packages/extensions/fireux-projects/src/runtime/project/components/Workspace/Home/AI.vue
  packages/extensions/fireux-projects/src/runtime/project/components/Workspace/Index.vue
  packages/extensions/fireux-projects/src/runtime/project/server/landing-intent.ts
  projects/fireux/fireux-app/app/components/Workspace/Project/Home/Index.vue
packages/extensions/fireux-projects/src/runtime/project/models/project-user-join.model.ts
  No direct static reference found
packages/extensions/fireux-projects/src/runtime/project/models/project.model.ts
  packages/extensions/fireux-projects/src/runtime/project/components/Collection/Index.vue
  packages/extensions/fireux-projects/src/runtime/project/components/Public/Cards/Preview.vue
  packages/extensions/fireux-projects/src/runtime/project/components/Workspace/Identity/Write.vue
  packages/extensions/fireux-projects/src/runtime/project/components/Workspace/Navigation.vue
  packages/extensions/fireux-projects/src/runtime/project/components/Workspace/Selector/Choices.vue
  packages/extensions/fireux-projects/src/runtime/project/composables/useProjectCollection.ts
  packages/extensions/fireux-projects/src/runtime/project/composables/useProjectDetail.ts
  packages/extensions/fireux-projects/src/runtime/project/composables/useProjectUpdate.ts
  packages/extensions/fireux-projects/src/runtime/project/composables/useProjects.ts
  packages/extensions/fireux-projects/src/runtime/project/composables/workspace/useProjectWorkspaceIdentity.ts
  packages/extensions/fireux-projects/src/runtime/project/server/detail/read.ts
  packages/extensions/fireux-projects/src/runtime/project/server/directory/read.ts
  packages/extensions/fireux-projects/src/runtime/project/server/management/read.ts
  packages/extensions/fireux-projects/src/runtime/project/utils/readProject.ts
  projects/fireux/fireux-app/app/components/Project/Detail/Apps.vue
  projects/fireux/fireux-app/app/components/Project/Detail/Header.vue
  projects/fireux/fireux-app/app/components/Project/Detail/Index.vue
  projects/fireux/fireux-app/app/pages/diagnostics/projects.vue
  projects/fireux/fireux-app/server/api/projects/[id].get.ts
  projects/fireux/fireux-app/server/api/projects/index.get.ts
packages/extensions/fireux-properties/src/runtime/portfolio/models/capabilities.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/models/capability-agents.ts
  projects/granite/granite-app/app/components/Workspace/Portfolio/Home/CapabilityLinks.vue
  projects/granite/granite-app/app/content/landing.ts
  projects/granite/granite-app/app/meta.ts
  projects/granite/granite-app/app/search-demand.ts
packages/extensions/fireux-properties/src/runtime/portfolio/models/capability-agents.ts
  packages/ecosystem/fireux-granite/src/runtime/models/workspace-agents.ts
packages/extensions/fireux-properties/src/runtime/portfolio/models/client.model.ts
  No direct static reference found
packages/extensions/fireux-properties/src/runtime/portfolio/models/portfolio-read.model.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/components/Collection/Index.vue
  packages/extensions/fireux-properties/src/runtime/portfolio/components/Detail/Index.vue
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/firestore/utils/view/usePortfolioInterface.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/usePortfolioDetail.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/usePortfolioDirectory.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/usePortfolioSeo.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/server/index/read.ts
packages/extensions/fireux-properties/src/runtime/portfolio/models/portfolio.model.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/components/Workspace/Identity/Edit/Index.vue
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/firestore/fetch/portfolio-collection-contract.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/firestore/fetch/usePortfolioFetch.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/firestore/mutations/usePortfolioCreate.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/firestore/mutations/usePortfolioUpdate.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/firestore/utils/view/usePortfolioInterface.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/usePortfolioCollection.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/usePortfolioScope.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/usePortfolioSeo.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/workspace/usePortfolioWorkspaceIdentity.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/models/portfolio-read.model.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/server/index/read.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/utils/normalize-portfolio.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/utils/portfolio-path.ts
  packages/extensions/fireux-properties/src/test/portfolio-model-shape.test.mjs
packages/extensions/fireux-properties/src/runtime/property/models/capabilities.ts
  packages/extensions/fireux-properties/src/runtime/property/models/capability-agents.ts
  projects/buenohost/buenohost-app/app/content/landing.ts
  projects/buenohost/buenohost-app/app/meta.ts
  projects/buenohost/buenohost-app/app/search-demand.ts
packages/extensions/fireux-properties/src/runtime/property/models/capability-agents.ts
  packages/ecosystem/fireux-buenohost/src/runtime/models/workspace-agents.ts
packages/extensions/fireux-properties/src/runtime/property/models/property-index.model.ts
  packages/extensions/fireux-properties/src/runtime/property/components/Collection/Index.vue
  packages/extensions/fireux-properties/src/runtime/property/composables/usePropertyDirectory.ts
  packages/extensions/fireux-properties/src/runtime/property/server/index/read.ts
packages/extensions/fireux-properties/src/runtime/property/models/property-onboarding.model.ts
  packages/extensions/fireux-properties/src/runtime/property/server/index/onboarding.ts
packages/extensions/fireux-properties/src/runtime/property/models/property.model.ts
  packages/extensions/fireux-properties/src/runtime/portfolio/composables/usePortfolioPropertyCollection.ts
  packages/extensions/fireux-properties/src/runtime/property/components/Workspace/Identity/Edit.vue
  packages/extensions/fireux-properties/src/runtime/property/composables/firestore/fetch/property-collection-contract.ts
  packages/extensions/fireux-properties/src/runtime/property/composables/firestore/fetch/usePropertyFetch.ts
  packages/extensions/fireux-properties/src/runtime/property/composables/firestore/utils/view/usePropertyInterface.ts
  packages/extensions/fireux-properties/src/runtime/property/composables/usePropertyIdentityUpdate.ts
  packages/extensions/fireux-properties/src/runtime/property/composables/usePropertyScope.ts
  packages/extensions/fireux-properties/src/runtime/property/models/property-index.model.ts
  packages/extensions/fireux-properties/src/runtime/property/server/index/onboarding.ts
  packages/extensions/fireux-properties/src/runtime/property/server/index/read.ts
  packages/extensions/fireux-properties/src/runtime/property/utils/normalize-property.ts
  packages/extensions/fireux-properties/src/runtime/property/utils/property-create.ts
  packages/extensions/fireux-properties/src/test/property-model-shape.test.mjs
  packages/extensions/fireux-reservations/src/runtime/property/server/reservations/access.ts
  projects/buenohost/buenohost-app/app/search-demand.ts
  projects/granite/granite-app/app/search-demand.ts
packages/extensions/fireux-reservations/src/runtime/property/models/reservation.model.ts
  packages/extensions/fireux-reservations/src/runtime/property/components/Workspace/Calendar/Index.vue
  packages/extensions/fireux-reservations/src/runtime/property/components/Workspace/Reservations/Create.vue
  packages/extensions/fireux-reservations/src/runtime/property/components/Workspace/Reservations/Detail.vue
  packages/extensions/fireux-reservations/src/runtime/property/composables/reservations/usePropertyReservation.ts
  packages/extensions/fireux-reservations/src/runtime/property/composables/reservations/usePropertyReservations.ts
  packages/extensions/fireux-reservations/src/runtime/property/composables/reservations/useReservationCreate.ts
  packages/extensions/fireux-reservations/src/runtime/property/composables/reservations/useReservationUpdate.ts
  packages/extensions/fireux-reservations/src/runtime/property/server/reservations/command.ts
  packages/extensions/fireux-reservations/src/runtime/property/server/reservations/read.ts
  packages/extensions/fireux-reservations/src/runtime/property/server/reservations/records.ts
  packages/extensions/fireux-reservations/src/runtime/property/utils/reservation-date.ts
  packages/extensions/fireux-reservations/src/runtime/property/utils/reservation-interface.ts
  projects/buenohost/buenohost-app/app/search-demand.ts
  projects/granite/granite-app/app/search-demand.ts
packages/extensions/fireux-suppliers/src/runtime/supplier/models/Supplier.model.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/suppliers/useKitchenSupplierFetch.ts
  packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/stock/suppliers/useKitchenWorkspaceSuppliers.ts
  packages/extensions/fireux-kitchens/src/runtime/server/api/supply/suppliers.get.ts
  packages/extensions/fireux-suppliers/src/runtime/pages/diagnostics/fireux-drop.vue
  packages/extensions/fireux-suppliers/src/runtime/supplier/components/Detail/Admin.vue
  packages/extensions/fireux-suppliers/src/runtime/supplier/components/Detail/Catalogue.vue
  packages/extensions/fireux-suppliers/src/runtime/supplier/components/Detail/DeliveryAreas.vue
  packages/extensions/fireux-suppliers/src/runtime/supplier/components/Detail/Header.vue
  packages/extensions/fireux-suppliers/src/runtime/supplier/components/Detail/Index.vue
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/fetch/supplier-collection-contract.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/fetch/useSupplierFetch.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/utils/view/useSupplierCatalogueInterface.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/utils/view/useSupplierIngredientInterface.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/utils/view/useSupplierInterface.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierCatalogueCollection.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierCollection.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierDetail.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierDiagnostics.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierIngredientCollection.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierItemCollection.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierSeo.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/catalogue/useSupplierWorkspaceCatalogues.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/ingredients/useSupplierWorkspaceIngredients.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/items/useSupplierWorkspaceItems.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/server/identity/read.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/utils/normalize-supplier.ts
packages/extensions/fireux-suppliers/src/runtime/supplier/models/capabilities.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/models/capability-agents.ts
  projects/bringli/bringli-app/app/content/landing.ts
  projects/bringli/bringli-app/app/meta.ts
  projects/misebox/misebox-app/app/search-demand/supplier.ts
packages/extensions/fireux-suppliers/src/runtime/supplier/models/capability-agents.ts
  packages/ecosystem/fireux-bringli/src/runtime/models/workspace-agents.ts
packages/extensions/fireux-suppliers/src/runtime/supplier/models/supplier-item.model.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/item/useSupplierItemInterface.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/models/Supplier.model.ts
packages/extensions/fireux-suppliers/src/runtime/supplier/models/supplier-onboarding.model.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/mutations/useSupplierCreate.ts
  packages/extensions/fireux-suppliers/src/runtime/supplier/server/index/onboarding.ts
packages/extensions/fireux-tasks/src/runtime/portfolio/models/task.model.ts
  packages/extensions/fireux-documents/src/test/document-commands.test.mjs
  packages/extensions/fireux-tasks/src/runtime/portfolio/components/Workspace/Tasks/Index.vue
  packages/extensions/fireux-tasks/src/runtime/portfolio/composables/tasks/useTaskCreate.ts
  packages/extensions/fireux-tasks/src/runtime/portfolio/composables/tasks/useTaskInterface.ts
  packages/extensions/fireux-tasks/src/runtime/portfolio/composables/tasks/useTaskProjection.ts
  packages/extensions/fireux-tasks/src/runtime/portfolio/composables/tasks/useTaskUpdate.ts
  packages/extensions/fireux-tasks/src/runtime/portfolio/composables/usePortfolioTaskCollection.ts
  packages/extensions/fireux-tasks/src/runtime/portfolio/server/tasks/commands.ts
  packages/extensions/fireux-tasks/src/test/task-commands.test.mjs
  projects/fireux/fireux-app/app/components/Framework/Capabilities.vue
```

</details>
