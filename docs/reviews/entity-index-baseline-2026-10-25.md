# Entity index architectural benchmark

Date: 2026-10-25
Checkpoint: 30c3af248
Role: review snapshot; not a rulebook or proof of alignment

## Scope

19 main Entity index route implementations: 16 package routes plus FireUX App's
App, Project and Ecosystem routes. App-specific Yellow Velo Product, La Tap
Kitchens and Sproochli Menu overrides require a separate comparison; they are
not silently certified by this snapshot. No browser, data-authority or
performance benchmark is claimed here.

## Fixed comparison target

Start from the current Place route's visible composition:

```text
route: metadata, SEO and one canonical collection acquisition
UPage / UPageBody
  EntityHero
  EntityCurrent (when the capability exists)
  EntityCreate (when the capability exists)
  EntityCollection :entities="entities"
  CollectionPagination (when acquisition supports it)
  development diagnostics
```

Use named components, props and events inside pages. Use NuxtPage for route
composition. Avoid custom slot-based page shells. Use the existing design
system; do not author Tailwind utilities. Collection presentation does not
reacquire its primary collection. Keep domain authority and commands with
their existing owners. Missing capabilities must be identified explicitly;
do not manufacture creation commands or passive wrappers for symmetry.

This target records the user's current direction alongside the existing clean
route pattern. Implementation differences are findings, not permission to
weaken the target. Source proves current behavior, not product approval.
Any proposed change to this target must be shown to the user explicitly.

## Before-state inventory

Hashes identify route contents at the checkpoint. The composition column is a
source inventory, not an automated architecture score.

| Route | SHA-256 prefix | Visible named elements |
| --- | --- | --- |
| [packages/core/fireux-core/src/runtime/pages/apps/index.vue](../../packages/core/fireux-core/src/runtime/pages/apps/index.vue) | `cba0c3301fd2` | UPage → UPageBody → AppCollection |
| [packages/core/fireux-core/src/runtime/pages/users/index.vue](../../packages/core/fireux-core/src/runtime/pages/users/index.vue) | `922da2828107` | UPage → UPageBody → UserHero → UserCurrent → UserCreate → UserCollection |
| [packages/extensions/fireux-companies/src/runtime/pages/companies/index.vue](../../packages/extensions/fireux-companies/src/runtime/pages/companies/index.vue) | `af699450580d` | CollectionPage → CompanyCollectionManager → CompanyCTA |
| [packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue](../../packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue) | `da07c30b7375` | CollectionPage → AgentDirectory → AgentCurrent |
| [packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue](../../packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue) | `6dea72b3194b` | UPage → UPageBody → JobHero → JobCreate → JobCollection → CollectionPagination |
| [packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue](../../packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue) | `12965c1c4e76` | CollectionPage → ProfessionalDirectory → ProfessionalCurrent |
| [packages/extensions/fireux-kitchens/src/runtime/pages/chefs/index.vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/chefs/index.vue) | `6e65807147b6` | CollectionPage → ChefDirectory → ChefCurrent |
| [packages/extensions/fireux-kitchens/src/runtime/pages/drivers/index.vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/drivers/index.vue) | `8889f3a0823c` | CollectionPage → DriverDirectory → DriverCurrent |
| [packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/index.vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/index.vue) | `116b68d28d7b` | CollectionPage → IngredientCollection |
| [packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue) | `f05ab6175e17` | UPage → UPageBody → KitchenHero → KitchenCreate → KitchenCollection |
| [packages/extensions/fireux-kitchens/src/runtime/pages/menus/index.vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/menus/index.vue) | `c66005d8fafc` | UPage → UPageBody → MenuCollectionHeader → MenuCollectionResults → CollectionPagination |
| [packages/extensions/fireux-places/src/runtime/pages/places/index.vue](../../packages/extensions/fireux-places/src/runtime/pages/places/index.vue) | `794e652de86d` | UPage → UPageBody → PlaceHero → PlaceCreate → PlaceCollection → CollectionPagination |
| [packages/extensions/fireux-products/src/runtime/pages/products/index.vue](../../packages/extensions/fireux-products/src/runtime/pages/products/index.vue) | `da5a1eee7553` | CollectionPage → ProductCollection → ProductDirectoryActions |
| [packages/extensions/fireux-properties/src/runtime/pages/portfolios/index.vue](../../packages/extensions/fireux-properties/src/runtime/pages/portfolios/index.vue) | `7340aa8f8db5` | UPage → UPageBody → PortfolioHero → PortfolioCreate → PortfolioCollection → CollectionPagination |
| [packages/extensions/fireux-properties/src/runtime/pages/properties/index.vue](../../packages/extensions/fireux-properties/src/runtime/pages/properties/index.vue) | `ff4dabee29d3` | UPage → UPageBody → PropertyHero → PropertyCollection → CollectionPagination |
| [packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue](../../packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue) | `5687927ad820` | UPage → UPageBody → SupplierHero → SupplierCreate → SupplierCollection |
| [projects/fireux/fireux-app/app/pages/apps/index.vue](../../projects/fireux/fireux-app/app/pages/apps/index.vue) | `4d1d66e11950` | UContainer → UPage → UPageHeader → UPageBody → AppCollection |
| [projects/fireux/fireux-app/app/pages/ecosystems/index.vue](../../projects/fireux/fireux-app/app/pages/ecosystems/index.vue) | `165e39cba4de` | UPage → UPageBody → EcosystemHero → EcosystemCollection |
| [projects/fireux/fireux-app/app/pages/projects/index.vue](../../projects/fireux/fireux-app/app/pages/projects/index.vue) | `d5b421fb09bd` | UPage → UPageBody → ProjectHero → ProjectCreate → ProjectCollection |

## Findings carried forward

- Place, Job, Project and Portfolio retain the closest route composition.
- Supplier and User retain named composition; state and pagination wiring vary.
- Core Apps lost AppHero, AppCurrent and AppCreate in e7c391de2 on 2026-09-12.
  Inline utility-styled markup replaced them; AppHero still exists.
- App and User collections accept hasMore beyond the map's records-only API.
- FireUX App Apps uses a separate UContainer/UPageHeader composition.
- Ecosystem has no creation doorway in this route; capability needs inspection.
- Kitchen passes Create through Hero's custom slot; Hero has utility overrides
  and local typography. Menu uses a different Header/Results arrangement.
- Property uses UPageHero and has no creation doorway in this route.
- Company, Product, Ingredient and the four profile indexes retain the older
  CollectionPage custom slot shell. Company retains CollectionManager.
- The collection-page map describes alignment that current consumers do not
  satisfy. Do not update its requirements merely to legitimise those consumers.
- This does not certify the internals of Place or any other component: existing
  utility classes and lower composition must be inspected in the next pass.

## Verification baseline

At the checkpoint, the previous Workspace migration passed FireUX, Misebox,
Granite, Bringli and Blank typechecks, changed-file lint, Sass compilation and
live Kitchen Identity/Appearance/Food-and-drink navigation. BuenoHost retains
pricing route-parameter type errors. Those results do not establish index-page
alignment. No new tests were run for this source inventory.
