# Entity Report

Authority: working canon audit
Updated: 2026-03-16

Containment note: recipe references in this report predate recipe containment. Current canonical recipe model is `packages/extensions/fireux-kitchens/src/runtime/models/recipe.model.ts`; the former `kitchen-recipe.model.ts` and Misebox `Recipe.model.ts` files are no longer current files.

## Purpose

This is phase 2 of the entity report.

The goal is no longer just to explain the repo shape. The goal is to create a real cleanup map that can drive phased entity consolidation work.

Strong rule:

Every entity should be readable through the same basic questions:
- what is it for
- what canon class is it in
- where does it actually live
- which file is the real model
- which composables are the real read and write paths
- which pages are the real surfaces
- whether it is a root entity, profile overlay, runtime child, scenario-only record, or ecosystem-specific scaffold
- whether duplicate residence is safe or dangerous

## Executive Summary

The repo still looks healthier than a flat directory scan suggests.

What is structurally strong:
- core system entities such as App and User
- package-owned domain entities such as Place, Product, BlogPost, Document, ComplianceRecord, and Portfolio
- kitchen runtime children, which mostly behave like a coherent operational stack
- profile overlays as a real pattern family, even when the visible paths are still noisy

What still needs real cleanup work:
1. Recipe is still the clearest unfinished entity family. It has pages, cards, collection manager, CTA, and interface code, but no confirmed model residence in the current runtime models tree.
2. Supplier still has the noisiest visible duplicate-residence story because model and composable wrappers are exposed through both profile-style and supplier-style paths.
3. Supplier runtime behavior is still weaker than Project, Kitchen, and Portfolio runtime state because it behaves like a profile console, not a normalized runtime selection family.
4. Property scenarios contain realistic records such as Tenant, Lease, MaintenanceTicket, FinancialSignals, and FinancialTransaction, but those remain scenario-only until they get real model, path, and mutation canon.
5. Some system and supporting entities exist as model-first registries with thin or missing UI stacks, which is acceptable only if that is explicit.

## Canon Classes Used In This Pass

This pass uses the following canon classes:

- root: top-level canonical entity with its own main collection
- user-extension: profile overlay attached to a User identity
- place-attached: entity whose identity is anchored to a Place or Company
- runtime child: entity that primarily lives under an active runtime parent
- scenario-only: read-only scenario type, not production entity canon
- ecosystem-specific: entity or scaffold that only exists in one ecosystem package
- base abstraction: shared type or base model, not a directly operated entity surface
- config registry: system definition or type registry with limited surface area

Structural alignment ratings used in this report:
- strong: model, residence, fetch, UI, and ownership are mostly coherent
- medium: core intent is clear, but one or more stack layers are thin, duplicated, or noisy
- weak: key layers are missing, unresolved, or only partially real

Cleanup priority used in this report:
- high: should drive cleanup planning soon
- medium: worth aligning after higher-risk drift is resolved
- low: acceptable for now if documented

## Entity Inventory Table

| Entity | Entity type | Plain English purpose | Canon class | Primary data residence | Primary model file | Primary fetch composable | Primary create composable | Primary interface composable | Primary public page | Primary console/admin page | Profile extension of user? | Attached to place/company? | Runtime child? | Scenario-only? | Duplicate residence? | Structural alignment | Cleanup priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| App | system entity | canonical app record for the current ecosystem | root | apps/{appId} | packages/core/fireux-core/src/runtime/models/core/app.model.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts | packages/core/fireux-core/src/runtime/pages/apps/index.vue | missing | no | no | no | no | no | strong | medium |
| User | system entity | global user identity across apps | root | users/{userId} and apps/{appId}/users/{userId} | packages/core/fireux-core/src/runtime/models/core/user.model.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserCollection.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts | packages/core/fireux-core/src/runtime/pages/users/index.vue | packages/core/fireux-core/src/runtime/pages/console/user-profile.vue | no | no | no | no | no | strong | low |
| Ecosystem | system registry | ecosystem registry and grouping record | config registry | ecosystems/{ecosystemId} | packages/core/fireux-core/src/runtime/models/system/ecosystem.model.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/ecosystem/fetch/useEcosystemCollection.ts | missing | packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/ecosystem/utils/view/useEcosystemInterface.ts | missing | missing | no | no | no | no | no | medium | medium |
| Project | system registry | Firebase project and control-plane registry | root | projects/{projectId} | packages/core/fireux-core/src/runtime/models/system/project.model.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/project/mutations/useProjectCreate.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface.ts | missing | packages/core/fireux-core/src/runtime/pages/console/projects/overview.vue | no | no | no | no | no | medium | medium |
| Profile | shared abstraction | shared base pattern for user-bound profiles | base abstraction | n/a | packages/core/fireux-core/src/runtime/models/core/profile.model.ts | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection.ts | missing | missing | missing | missing | yes | no | no | no | no | strong | low |
| Kitchen | domain entity | operational kitchen runtime identity | root | kitchens/{kitchenId} and apps/{appId}/kitchens/{kitchenId} | packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenCreate.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface.ts | packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/overview.vue | no | place | no | no | no | strong | medium |
| Menu | runtime entity | sellable service menu for a kitchen | runtime child | kitchens/{kitchenId}/menus/{menuId} | packages/extensions/fireux-kitchens/src/runtime/models/menu.model.ts | not confirmed as a standalone fetch file; runtime menu data and menu helpers are used from runtime-kitchen menu stack | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/menu/mutations/useKitchenMenuStackCreate.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/menu/utils/view/useMenuInterface.ts | packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id]/menu/[menuId].vue | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/menu.vue | no | kitchen parent only | yes | no | no | medium | medium |
| Dish | runtime entity | dish record used inside kitchen menus | runtime child | kitchens/{kitchenId}/dishes/{dishId} | packages/extensions/fireux-kitchens/src/runtime/models/dish.model.ts | runtime-kitchen dish fetch layer present, exact primary fetch wrapper not fully normalized in one file | not confirmed in a single canonical create file from this pass | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/dish/utils/view/useDishInterface.ts | missing | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/dishes.vue | no | kitchen parent only | yes | no | no | medium | medium |
| Ingredient | domain entity | global ingredient registry | root | ingredients/{ingredientId} | packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/fetch/useIngredientFetch.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/mutations/useIngredientCreate.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/utils/view/useIngredientInterface.ts | packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/index.vue | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients.vue | no | no | no | no | no | strong | low |
| KitchenIngredient | link entity | kitchen-specific attachment to a global ingredient | runtime child | kitchens/{kitchenId}/ingredients/{ingredientId} | packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts | runtime kitchen ingredient fetch layer, not exposed as a clean top-level entity fetch | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/ingredient/mutations/useKitchenIngredientAdd.ts | missing | missing | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients.vue | no | kitchen parent only | yes | no | no | medium | medium |
| KitchenSupplierIngredient | link entity | supplier-to-ingredient attachment inside a kitchen | runtime child | kitchens/{kitchenId}/supplier-ingredients/{id} | packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts | indirect through supplier and ingredient runtime reads | missing | missing | missing | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers.vue | no | kitchen parent only | yes | no | no | weak | medium |
| KitchenMiseTask | runtime entity | mise en place prep task | runtime child | kitchens/{kitchenId}/mise/{taskId} | packages/extensions/fireux-kitchens/src/runtime/models/kitchen-mise.model.ts | runtime kitchen mise collection layer | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/mise/mutations/useKitchenMiseCreate.ts | missing | missing | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/mise.vue | no | kitchen parent only | yes | no | no | medium | medium |
| KitchenRecipe | runtime entity | kitchen-scoped recipe record | runtime child | kitchens/{kitchenId}/recipes/{recipeId} | packages/extensions/fireux-kitchens/src/runtime/models/kitchen-recipe.model.ts | runtime recipe/menu stack layer | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/menu/mutations/useKitchenMenuStackCreate.ts | missing | missing | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue | no | kitchen parent only | yes | no | no | medium | medium |
| KitchenTeamMember | runtime entity | kitchen crew roster entry | runtime child | kitchens/{kitchenId}/team/{memberId} | packages/extensions/fireux-kitchens/src/runtime/models/kitchen-team.model.ts | runtime kitchen team read layer | missing | missing | missing | missing | no | kitchen parent only | yes | no | no | medium | low |
| KitchenCostSnapshot | runtime entity | kitchen cost snapshot for reporting | runtime child | kitchens/{kitchenId}/costs/{costId} | packages/extensions/fireux-kitchens/src/runtime/models/kitchen-cost.model.ts | missing | missing | missing | missing | missing | no | kitchen parent only | yes | no | no | weak | medium |
| Chef | profile entity | chef profile overlay for a user | user-extension | chefs/{uid} and apps/{appId}/chefs/{uid} | packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/Chef.model.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefFetch.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefCreate.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface.ts | packages/extensions/fireux-kitchens/src/runtime/pages/chefs/index.vue | packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/profile.vue | yes | optional place/workplace relation only | no | no | no | strong | medium |
| Job | domain entity | job posting and hiring record | root | jobs/{jobId} | packages/extensions/fireux-jobs/src/runtime/models/job.model.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/fetch/useJobCollection.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/mutations/useJobCreate.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/utils/view/useJobInterface.ts | packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue | missing | no | optional company/place link | no | no | no | strong | medium |
| Professional | profile entity | professional hospitality profile | user-extension | professionals/{uid} and apps/{appId}/professionals/{uid} | packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalFetch.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalCreate.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface.ts | packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue | packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue | yes | no | no | no | no | strong | medium |
| Agent | profile entity | recruitment and placement agent profile | user-extension | agents/{uid} and apps/{appId}/agents/{uid} | packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentFetch.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentCreate.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface.ts | packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue | packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue | yes | no | no | no | no | strong | medium |
| Supplier | console business entity | supplier and producer console workspace | extension root + app overlay | suppliers/{supplierId} and apps/{appId}/suppliers/{supplierId} | packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/fetch/useSupplierFetch.ts | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierCreate.ts | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface.ts | packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue | packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/index.vue | yes | no | no | no | canonicalized under supplier entity tree | medium | medium |
| Place | domain entity | canonical place or location identity | root | places/{placeId} | packages/extensions/fireux-places/src/runtime/models/place.model.ts | packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/fetch/usePlacesCollection.ts | packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/mutations/usePlaceCreate.ts | packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/utils/view/usePlaceInterface.ts | packages/extensions/fireux-places/src/runtime/pages/places/index.vue | missing | no | no | no | no | no | strong | low |
| Company | domain entity | organization record anchored to a place | place-attached | companies/{placeId} | packages/extensions/fireux-companies/src/runtime/models/company.model.ts | packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/fetch/useCompanyCollection.ts | packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/mutations/useCompanyCreate.ts | packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface.ts | packages/extensions/fireux-companies/src/runtime/pages/companies/index.vue | packages/extensions/fireux-companies/src/runtime/pages/companies/edit/[id].vue | no | place | no | no | no | medium | medium |
| Product | domain entity | sellable product with pricing | root | products/{productId} | packages/extensions/fireux-products/src/runtime/models/product.model.ts | packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/fetch/useProductCollection.ts | not confirmed in this pass | packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/utils/view/useProductInterface.ts | packages/extensions/fireux-products/src/runtime/pages/products/index.vue | packages/extensions/fireux-products/src/runtime/pages/admin/products/index.vue | no | no | no | no | no | strong | low |
| BlogPost | content entity | blog or article content record | root | blogs/{blogId} | packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts | packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/fetch/useBlogCollection.ts | packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogCreate.ts | packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/utils/view/useBlogInterface.ts | packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue | packages/extensions/fireux-blogs/src/runtime/pages/admin/blogs/index.vue | no | no | no | no | no | strong | low |
| Document | runtime entity | stored portfolio document record | runtime child | portfolios/{portfolioId}/documents/{documentId} | packages/extensions/fireux-documents/src/runtime/models/document.model.ts | packages/extensions/fireux-documents/src/runtime/composables/fireux/firestore/documents/fetch/useDocumentCollection.ts | packages/extensions/fireux-documents/src/runtime/composables/fireux/firestore/documents/mutations/useDocumentCreate.ts | missing | missing | packages/extensions/fireux-documents/src/runtime/pages/console/portfolio/documents.vue | no | portfolio parent only | yes | no | safe scenario mirror exists | medium | medium |
| DocumentLink | runtime entity | link document to a portfolio child entity | runtime child | portfolios/{portfolioId}/document-links/{documentLinkId} | packages/extensions/fireux-documents/src/runtime/models/document-link.model.ts | packages/extensions/fireux-documents/src/runtime/composables/fireux/firestore/documents/fetch/useDocumentLinkCollection.ts | missing | missing | missing | packages/extensions/fireux-documents/src/runtime/pages/console/portfolio/documents.vue | no | portfolio parent only | yes | no | safe scenario mirror exists | medium | medium |
| ComplianceRecord | runtime entity | compliance or certification record | runtime child | portfolios/{portfolioId}/compliance/{recordId} | packages/extensions/fireux-compliance/src/runtime/models/compliance-record.model.ts | packages/extensions/fireux-compliance/src/runtime/composables/fireux/firestore/compliance/fetch/useComplianceRecordCollection.ts | not confirmed in this pass | packages/extensions/fireux-compliance/src/runtime/composables/fireux/firestore/compliance/utils/view/useComplianceRecordInterface.ts | missing | packages/extensions/fireux-compliance/src/runtime/pages/console/portfolio/compliance.vue | no | portfolio parent only | yes | no | no | strong | low |
| Order | operational entity | customer or service order with scope binding | root | orders/{orderId} | packages/extensions/fireux-orders/src/runtime/models/order.model.ts | packages/extensions/fireux-orders/src/runtime/composables/fireux/firestore/orders/fetch/useOrdersFetchByScope.ts | packages/extensions/fireux-orders/src/runtime/composables/useOrderCreate.ts | not confirmed in this pass | missing | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/orders.vue | no | optional place or kitchen link | no | no | no | strong | medium |
| Task (core) | shared base | shared minimal task shape | base abstraction | n/a | packages/core/fireux-core/src/runtime/models/shared/task.model.ts | missing | missing | missing | missing | missing | no | no | no | no | safe extension pair | strong | low |
| Task (extension) | runtime entity | task record with domain source metadata | runtime child | portfolios/{portfolioId}/tasks/{taskId} inferred | packages/extensions/fireux-tasks/src/runtime/models/task.model.ts | packages/extensions/fireux-tasks/src/runtime/composables/fireux/firestore/tasks/fetch/useTaskCollection.ts | packages/extensions/fireux-tasks/src/runtime/composables/fireux/firestore/tasks/mutations/useTaskCreate.ts | packages/extensions/fireux-tasks/src/runtime/composables/fireux/firestore/tasks/utils/view/useTaskInterface.ts | missing | packages/extensions/fireux-tasks/src/runtime/pages/console/portfolio/tasks.vue | no | portfolio parent only | yes | no | safe extension pair | medium | medium |
| Portfolio | domain entity | portfolio runtime root for properties work | root | portfolios/{portfolioId} and apps/{appId}/portfolios/{portfolioId} | packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/fetch/usePortfolioCollection.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/mutations/usePortfolioCreate.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface.ts | packages/extensions/fireux-properties/src/runtime/pages/portfolios/index.vue | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/overview.vue | no | no | no | no | no | strong | medium |
| Property | runtime entity | property record within a portfolio | runtime child | portfolios/{portfolioId}/properties/{propertyId} | packages/extensions/fireux-properties/src/runtime/models/property.model.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/fetch/usePropertyCollection.ts | missing | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/utils/view/usePropertyInterface.ts | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/properties.vue | no | optional place link | yes | no | no | medium | medium |
| Unit | runtime entity | property unit record | runtime child | portfolios/{portfolioId}/properties/{propertyId}/units/{unitId} | packages/extensions/fireux-properties/src/runtime/models/unit.model.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/unit/fetch/useUnitCollection.ts | missing | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/unit/utils/view/useUnitInterface.ts | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/properties.vue | no | property parent only | yes | no | no | medium | medium |
| Client | runtime entity | portfolio stakeholder and account record | runtime child | portfolios/{portfolioId}/clients/{clientId} and read-only scenario derivation | packages/extensions/fireux-properties/src/runtime/models/client.model.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/client/fetch/useClientCollection.ts | missing | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/client/utils/view/useClientInterface.ts | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/clients.vue | no | optional property link | yes | no | no | medium | high |
| Tenant | scenario entity | read-only tenant record for portfolio sandbox mode | scenario-only | read-only scenario only | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts | n/a | n/a | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/clients.vue | no | optional property link | no | yes | no | weak | high |
| Lease | scenario entity | read-only lease record for portfolio sandbox mode | scenario-only | read-only scenario only | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts | n/a | n/a | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/finance.vue | no | property parent only | no | yes | no | weak | high |
| MaintenanceTicket | scenario entity | read-only maintenance incident record | scenario-only | read-only scenario only | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts | n/a | n/a | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/incidents.vue | no | property parent only | no | yes | no | weak | high |
| FinancialSignals | scenario aggregate | read-only finance dashboard aggregate | scenario-only | read-only scenario only | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts | n/a | n/a | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/finance.vue | no | portfolio parent only | no | yes | no | weak | high |
| FinancialTransaction | scenario entity | read-only financial line item | scenario-only | read-only scenario only | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts | n/a | n/a | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/finance.vue | no | portfolio parent only | no | yes | no | weak | high |
| Recipe | ecosystem-specific scaffold | recipe surface in Misebox with unresolved model ownership | ecosystem-specific | not confirmed | missing in current runtime models tree; components import ../../../../../models/Recipe.model from ecosystem package but no matching file was found | packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipes.ts | packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeCreate.ts | packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/utils/view/useRecipeInterface.ts | packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue | missing | no | no | no | unresolved and unsafe | weak | high |

## Exact Entity Matrix

### App
- Type and class: system entity; root.
- Purpose: canonical app record for the current ecosystem.
- Residence: apps/{appId}.
- Model: packages/core/fireux-core/src/runtime/models/core/app.model.ts.
- Fetch, create, interface: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection.ts; packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts; packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts.
- Public and console surfaces: packages/core/fireux-core/src/runtime/pages/apps/index.vue; no dedicated console/admin page in this pass.
- Flags: not user-extension; not place-attached; not runtime child; not scenario-only; no duplicate residence.
- Rating: strong. Cleanup priority: medium because app canon is good, but broader ecosystem registry decisions are still active.

### User
- Type and class: system entity; root.
- Purpose: global user identity across apps.
- Residence: users/{userId} plus apps/{appId}/users/{userId} overlay.
- Model: packages/core/fireux-core/src/runtime/models/core/user.model.ts.
- Fetch, create, interface: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserCollection.ts; packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts; packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts.
- Public and console surfaces: packages/core/fireux-core/src/runtime/pages/users/index.vue; packages/core/fireux-core/src/runtime/pages/console/user-profile.vue.
- Flags: not user-extension; no duplicate residence.
- Rating: strong. Cleanup priority: low.

### Ecosystem
- Type and class: system registry; config registry.
- Purpose: ecosystem grouping and registry record.
- Residence: ecosystems/{ecosystemId}.
- Model: packages/core/fireux-core/src/runtime/models/system/ecosystem.model.ts.
- Fetch, create, interface: packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/ecosystem/fetch/useEcosystemCollection.ts; create missing; packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/ecosystem/utils/view/useEcosystemInterface.ts.
- Public and console surfaces: missing in this pass.
- Flags: not runtime child; not scenario-only; no duplicate residence.
- Rating: medium. Cleanup priority: medium because the data shape exists but surface ownership is thin.

### Project
- Type and class: system registry; root.
- Purpose: Firebase project and control-plane record.
- Residence: projects/{projectId}.
- Model: packages/core/fireux-core/src/runtime/models/system/project.model.ts.
- Fetch, create, interface: packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection.ts; packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/project/mutations/useProjectCreate.ts; packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface.ts.
- Public and console surfaces: public page missing; packages/core/fireux-core/src/runtime/pages/console/projects/overview.vue is the main console/admin surface.
- Flags: not user-extension; no duplicate residence.
- Rating: medium. Cleanup priority: medium.

### Profile
- Type and class: shared abstraction; base abstraction.
- Purpose: shared base for all user-bound profile overlays.
- Residence: abstract only.
- Model: packages/core/fireux-core/src/runtime/models/core/profile.model.ts.
- Fetch: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection.ts.
- Create, interface, public, console: not direct in this pass.
- Flags: user-extension base only.
- Rating: strong. Cleanup priority: low.

### Kitchen
- Type and class: domain entity; root.
- Purpose: operational kitchen runtime identity.
- Residence: kitchens/{kitchenId} plus apps/{appId}/kitchens/{kitchenId}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts.
- Fetch, create, interface: packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch.ts; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenCreate.ts; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface.ts.
- Public and console surfaces: packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue; packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/overview.vue.
- Flags: place-attached by identity; not runtime child.
- Rating: strong. Cleanup priority: medium because console entry logic is still duplicated across tenants.

### Menu
- Type and class: runtime entity; runtime child.
- Purpose: service-ready kitchen menu.
- Residence: kitchens/{kitchenId}/menus/{menuId}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/menu.model.ts.
- Fetch, create, interface: runtime menu stack read layer; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/menu/mutations/useKitchenMenuStackCreate.ts; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/menu/utils/view/useMenuInterface.ts.
- Public and console surfaces: packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id]/menu/index.vue; packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id]/menu/[menuId].vue; packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/menu.vue.
- Flags: runtime child; no duplicate residence.
- Rating: medium. Cleanup priority: medium because the stack is real but the fetch/create naming is still menu-stack oriented rather than clean entity-first.

### Dish
- Type and class: runtime entity; runtime child.
- Purpose: individual dish record used by kitchen menus.
- Residence: kitchens/{kitchenId}/dishes/{dishId}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/dish.model.ts.
- Fetch, create, interface: runtime dish read layer exists; create not confirmed as one canonical file in this pass; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/dish/utils/view/useDishInterface.ts.
- Public and console surfaces: public page missing; packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/dishes.vue.
- Flags: runtime child; no duplicate residence.
- Rating: medium. Cleanup priority: medium.

### Ingredient
- Type and class: domain entity; root.
- Purpose: global ingredient registry.
- Residence: ingredients/{ingredientId}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts.
- Fetch, create, interface: packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/fetch/useIngredientFetch.ts; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/mutations/useIngredientCreate.ts; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/utils/view/useIngredientInterface.ts.
- Public and console surfaces: packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/index.vue; packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients.vue.
- Flags: not runtime child; no duplicate residence.
- Rating: strong. Cleanup priority: low.

### KitchenIngredient
- Type and class: link entity; runtime child.
- Purpose: kitchen-specific attachment to a global ingredient.
- Residence: kitchens/{kitchenId}/ingredients/{ingredientId}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts.
- Fetch, create, interface: runtime attachment fetch layer only; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/ingredient/mutations/useKitchenIngredientAdd.ts; interface missing.
- Public and console surfaces: public page missing; packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients.vue.
- Flags: runtime child; no duplicate residence.
- Rating: medium. Cleanup priority: medium.

### KitchenSupplierIngredient
- Type and class: link entity; runtime child.
- Purpose: supplier-to-ingredient attachment inside a kitchen.
- Residence: kitchens/{kitchenId}/supplier-ingredients/{id}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts.
- Fetch, create, interface: only indirect read path confirmed in this pass; create and interface missing.
- Public and console surfaces: public page missing; packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers.vue.
- Flags: runtime child; no duplicate residence.
- Rating: weak. Cleanup priority: medium.

### KitchenMiseTask
- Type and class: runtime entity; runtime child.
- Purpose: mise en place prep task.
- Residence: kitchens/{kitchenId}/mise/{taskId}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-mise.model.ts.
- Fetch, create, interface: runtime mise read layer; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/mise/mutations/useKitchenMiseCreate.ts; interface missing.
- Public and console surfaces: public page missing; packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/mise.vue.
- Flags: runtime child; no duplicate residence.
- Rating: medium. Cleanup priority: medium.

### KitchenRecipe
- Type and class: runtime entity; runtime child.
- Purpose: kitchen-scoped recipe record.
- Residence: kitchens/{kitchenId}/recipes/{recipeId}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-recipe.model.ts.
- Fetch, create, interface: runtime recipe read layer; create currently travels through menu-stack creation patterns; interface missing in this pass.
- Public and console surfaces: public page missing; packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue.
- Flags: runtime child; no duplicate residence.
- Rating: medium. Cleanup priority: medium.

### KitchenTeamMember
- Type and class: runtime entity; runtime child.
- Purpose: kitchen crew roster entry.
- Residence: kitchens/{kitchenId}/team/{memberId}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-team.model.ts.
- Fetch, create, interface: not confirmed as a complete standalone stack in this pass.
- Public and console surfaces: not confirmed.
- Flags: runtime child; no duplicate residence.
- Rating: medium. Cleanup priority: low.

### KitchenCostSnapshot
- Type and class: runtime entity; runtime child.
- Purpose: kitchen cost reporting snapshot.
- Residence: kitchens/{kitchenId}/costs/{costId}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-cost.model.ts.
- Fetch, create, interface: not confirmed; UI stack weak.
- Public and console surfaces: not confirmed.
- Flags: runtime child; no duplicate residence.
- Rating: weak. Cleanup priority: medium.

### Chef
- Type and class: profile entity; user-extension.
- Purpose: chef profile overlay for a user.
- Residence: chefs/{uid} plus apps/{appId}/chefs/{uid}.
- Model: packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/Chef.model.ts.
- Fetch, create, interface: packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefFetch.ts; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefCreate.ts; packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface.ts.
- Public and console surfaces: packages/extensions/fireux-kitchens/src/runtime/pages/chefs/index.vue; packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/profile.vue.
- Flags: user-extension; no duplicate residence.
- Rating: strong. Cleanup priority: medium because it should stay aligned with Agent, Professional, and Supplier.

### Job
- Type and class: domain entity; root.
- Purpose: job posting and hiring record.
- Residence: jobs/{jobId}.
- Model: packages/extensions/fireux-jobs/src/runtime/models/job.model.ts.
- Fetch, create, interface: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/fetch/useJobCollection.ts; packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/mutations/useJobCreate.ts; packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/utils/view/useJobInterface.ts.
- Public and console surfaces: packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue; no confirmed console/admin page in this pass.
- Flags: may attach to Company or Place, but is not itself a place-attached identity.
- Rating: strong. Cleanup priority: medium because the public/admin route story still looks thinner than the model stack.

### Professional
- Type and class: profile entity; user-extension.
- Purpose: professional hospitality profile.
- Residence: professionals/{uid} plus apps/{appId}/professionals/{uid}.
- Model: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts.
- Fetch, create, interface: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalFetch.ts; packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalCreate.ts; packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface.ts.
- Public and console surfaces: packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue; packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue.
- Flags: user-extension; no duplicate residence.
- Rating: strong. Cleanup priority: medium.

### Agent
- Type and class: profile entity; user-extension.
- Purpose: recruitment and placement agent profile.
- Residence: agents/{uid} plus apps/{appId}/agents/{uid}.
- Model: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts.
- Fetch, create, interface: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentFetch.ts; packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentCreate.ts; packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface.ts.
- Public and console surfaces: packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue; packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue.
- Flags: user-extension; no duplicate residence.
- Rating: strong. Cleanup priority: medium.

### Supplier
- Type and class: profile entity; user-extension.
- Purpose: supplier and producer profile.
- Residence: suppliers/{supplierId} plus apps/{appId}/suppliers/{supplierId}.
- Model: packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts.
- Fetch, create, interface: packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/fetch/useSupplierFetch.ts; packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierCreate.ts; packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface.ts.
- Public and console surfaces: packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue; packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/index.vue.
- Flags: user-extension; safe wrapper duplication exists in both model and composable paths.
- Rating: medium. Cleanup priority: high.

### Place
- Type and class: domain entity; root.
- Purpose: canonical location identity.
- Residence: places/{placeId}.
- Model: packages/extensions/fireux-places/src/runtime/models/place.model.ts.
- Fetch, create, interface: packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/fetch/usePlacesCollection.ts; packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/mutations/usePlaceCreate.ts; packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/utils/view/usePlaceInterface.ts.
- Public and console surfaces: packages/extensions/fireux-places/src/runtime/pages/places/index.vue; no dedicated console/admin page in this pass.
- Flags: not user-extension; no duplicate residence.
- Rating: strong. Cleanup priority: low.

### Company
- Type and class: domain entity; place-attached.
- Purpose: organization record anchored to a place.
- Residence: companies/{placeId}.
- Model: packages/extensions/fireux-companies/src/runtime/models/company.model.ts.
- Fetch, create, interface: packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/fetch/useCompanyCollection.ts; packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/mutations/useCompanyCreate.ts; packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface.ts.
- Public and console surfaces: packages/extensions/fireux-companies/src/runtime/pages/companies/index.vue; packages/extensions/fireux-companies/src/runtime/pages/companies/edit/[id].vue.
- Flags: place-attached; no duplicate residence.
- Rating: medium because the model is intentionally thin and relies on place hydration. Cleanup priority: medium.

### Product
- Type and class: domain entity; root.
- Purpose: sellable product record with pricing.
- Residence: products/{productId}.
- Model: packages/extensions/fireux-products/src/runtime/models/product.model.ts.
- Fetch, create, interface: packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/fetch/useProductCollection.ts; create not confirmed in this pass; packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/utils/view/useProductInterface.ts.
- Public and console surfaces: packages/extensions/fireux-products/src/runtime/pages/products/index.vue; packages/extensions/fireux-products/src/runtime/pages/admin/products/index.vue.
- Flags: no duplicate residence.
- Rating: strong. Cleanup priority: low.

### BlogPost
- Type and class: content entity; root.
- Purpose: blog or article content record.
- Residence: blogs/{blogId}.
- Model: packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts.
- Fetch, create, interface: packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/fetch/useBlogCollection.ts; packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogCreate.ts; packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/utils/view/useBlogInterface.ts.
- Public and console surfaces: packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue; packages/extensions/fireux-blogs/src/runtime/pages/admin/blogs/index.vue.
- Flags: no duplicate residence.
- Rating: strong. Cleanup priority: low.

### Document
- Type and class: runtime entity; runtime child.
- Purpose: stored portfolio document record.
- Residence: portfolios/{portfolioId}/documents/{documentId}.
- Model: packages/extensions/fireux-documents/src/runtime/models/document.model.ts.
- Fetch, create, interface: packages/extensions/fireux-documents/src/runtime/composables/fireux/firestore/documents/fetch/useDocumentCollection.ts; packages/extensions/fireux-documents/src/runtime/composables/fireux/firestore/documents/mutations/useDocumentCreate.ts; interface not confirmed in this pass.
- Public and console surfaces: public page missing; packages/extensions/fireux-documents/src/runtime/pages/console/portfolio/documents.vue.
- Flags: runtime child; safe scenario mirror exists.
- Rating: medium. Cleanup priority: medium.

### DocumentLink
- Type and class: runtime entity; runtime child.
- Purpose: link document to another portfolio child entity.
- Residence: portfolios/{portfolioId}/document-links/{documentLinkId}.
- Model: packages/extensions/fireux-documents/src/runtime/models/document-link.model.ts.
- Fetch, create, interface: packages/extensions/fireux-documents/src/runtime/composables/fireux/firestore/documents/fetch/useDocumentLinkCollection.ts; create missing; interface missing.
- Public and console surfaces: public page missing; packages/extensions/fireux-documents/src/runtime/pages/console/portfolio/documents.vue.
- Flags: runtime child; safe scenario mirror exists.
- Rating: medium. Cleanup priority: medium.

### ComplianceRecord
- Type and class: runtime entity; runtime child.
- Purpose: compliance or certification record.
- Residence: portfolios/{portfolioId}/compliance/{recordId}.
- Model: packages/extensions/fireux-compliance/src/runtime/models/compliance-record.model.ts.
- Fetch, create, interface: packages/extensions/fireux-compliance/src/runtime/composables/fireux/firestore/compliance/fetch/useComplianceRecordCollection.ts; create not confirmed in this pass; packages/extensions/fireux-compliance/src/runtime/composables/fireux/firestore/compliance/utils/view/useComplianceRecordInterface.ts.
- Public and console surfaces: public page missing; packages/extensions/fireux-compliance/src/runtime/pages/console/portfolio/compliance.vue.
- Flags: runtime child; no duplicate residence.
- Rating: strong. Cleanup priority: low.

- Flags: not runtime child; no duplicate residence.
- Rating: medium. Cleanup priority: low.

### Order
- Type and class: operational entity; root.
- Purpose: scoped customer or service order.
- Residence: orders/{orderId}.
- Model: packages/extensions/fireux-orders/src/runtime/models/order.model.ts.
- Fetch, create, interface: packages/extensions/fireux-orders/src/runtime/composables/fireux/firestore/orders/fetch/useOrdersFetchByScope.ts; packages/extensions/fireux-orders/src/runtime/composables/useOrderCreate.ts; interface not confirmed in this pass.
- Public and console surfaces: public page missing; packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/orders.vue.
- Flags: not runtime child, but operationally scope-bound.
- Rating: strong. Cleanup priority: medium.

### Task (core)
- Type and class: shared base; base abstraction.
- Purpose: minimal reusable task shape.
- Residence: abstract only.
- Model: packages/core/fireux-core/src/runtime/models/shared/task.model.ts.
- Fetch, create, interface, pages: missing as direct entity surfaces.
- Flags: not scenario-only; safe extension pair with fireux-tasks task model.
- Rating: strong. Cleanup priority: low.

### Task (extension)
- Type and class: runtime entity; runtime child.
- Purpose: task record with source metadata.
- Residence: portfolios/{portfolioId}/tasks/{taskId} inferred.
- Model: packages/extensions/fireux-tasks/src/runtime/models/task.model.ts.
- Fetch, create, interface: packages/extensions/fireux-tasks/src/runtime/composables/fireux/firestore/tasks/fetch/useTaskCollection.ts; packages/extensions/fireux-tasks/src/runtime/composables/fireux/firestore/tasks/mutations/useTaskCreate.ts; packages/extensions/fireux-tasks/src/runtime/composables/fireux/firestore/tasks/utils/view/useTaskInterface.ts.
- Public and console surfaces: public page missing; packages/extensions/fireux-tasks/src/runtime/pages/console/portfolio/tasks.vue.
- Flags: runtime child; safe extension pair with core task base.
- Rating: medium. Cleanup priority: medium.

### Portfolio
- Type and class: domain entity; root.
- Purpose: portfolio runtime root for properties work.
- Residence: portfolios/{portfolioId} plus apps/{appId}/portfolios/{portfolioId}.
- Model: packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts.
- Fetch, create, interface: packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/fetch/usePortfolioCollection.ts; packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/mutations/usePortfolioCreate.ts; packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface.ts.
- Public and console surfaces: packages/extensions/fireux-properties/src/runtime/pages/portfolios/index.vue; packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/overview.vue.
- Flags: not runtime child; no duplicate residence.
- Rating: strong. Cleanup priority: medium.

### Property
- Type and class: runtime entity; runtime child.
- Purpose: property record within a portfolio.
- Residence: portfolios/{portfolioId}/properties/{propertyId}.
- Model: packages/extensions/fireux-properties/src/runtime/models/property.model.ts.
- Fetch, create, interface: packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/fetch/usePropertyCollection.ts; create missing in this pass; packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/utils/view/usePropertyInterface.ts.
- Public and console surfaces: public page missing; packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/properties.vue.
- Flags: runtime child; may reference Place; no duplicate residence.
- Rating: medium. Cleanup priority: medium.

### Unit
- Type and class: runtime entity; runtime child.
- Purpose: unit within a property.
- Residence: portfolios/{portfolioId}/properties/{propertyId}/units/{unitId}.
- Model: packages/extensions/fireux-properties/src/runtime/models/unit.model.ts.
- Fetch, create, interface: packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/unit/fetch/useUnitCollection.ts; create missing in this pass; packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/unit/utils/view/useUnitInterface.ts.
- Public and console surfaces: public page missing; packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/properties.vue.
- Flags: runtime child; no duplicate residence.
- Rating: medium. Cleanup priority: medium.

### Client
- Type and class: runtime entity; runtime child.
- Purpose: portfolio stakeholder and account record.
- Residence: portfolios/{portfolioId}/clients/{clientId}, with read-only scenario derivation when runtime mode is read-only.
- Model: packages/extensions/fireux-properties/src/runtime/models/client.model.ts.
- Fetch, create, interface: packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/client/fetch/useClientCollection.ts; create missing in this pass; packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/client/utils/view/useClientInterface.ts.
- Public and console surfaces: public page missing; packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/clients.vue.
- Flags: runtime child; no duplicate residence, but mixed live-plus-scenario behavior exists.
- Rating: medium. Cleanup priority: high.

### Tenant
- Type and class: scenario entity; scenario-only.
- Purpose: read-only tenant record for portfolio sandbox mode.
- Residence: packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts only.
- Fetch: packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts.
- Create, interface, public page: not applicable.
- Console surface: packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/clients.vue consumes scenario-derived tenant context indirectly.
- Flags: scenario-only.
- Rating: weak. Cleanup priority: high.

### Lease
- Type and class: scenario entity; scenario-only.
- Purpose: read-only lease record for portfolio sandbox mode.
- Residence: packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts only.
- Fetch: packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts.
- Create, interface, public page: not applicable.
- Console surface: packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/finance.vue.
- Flags: scenario-only.
- Rating: weak. Cleanup priority: high.

### MaintenanceTicket
- Type and class: scenario entity; scenario-only.
- Purpose: read-only maintenance incident record.
- Residence: packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts only.
- Fetch: packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts.
- Create, interface, public page: not applicable.
- Console surface: packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/incidents.vue.
- Flags: scenario-only.
- Rating: weak. Cleanup priority: high.

### FinancialSignals
- Type and class: scenario aggregate; scenario-only.
- Purpose: read-only financial dashboard aggregate.
- Residence: packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts only.
- Fetch: packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts.
- Create, interface, public page: not applicable.
- Console surface: packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/finance.vue.
- Flags: scenario-only aggregate, not a full production entity.
- Rating: weak. Cleanup priority: high.

### FinancialTransaction
- Type and class: scenario entity; scenario-only.
- Purpose: read-only financial line item.
- Residence: packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts only.
- Fetch: packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts.
- Create, interface, public page: not applicable.
- Console surface: packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/finance.vue.
- Flags: scenario-only.
- Rating: weak. Cleanup priority: high.

### Recipe
- Type and class: ecosystem-specific scaffold; ecosystem-specific.
- Purpose: recipe surface in Misebox.
- Residence: not confirmed.
- Model: missing in the current runtime models tree. Multiple files import ../../../../../models/Recipe.model from the ecosystem package, but no matching Recipe.model.ts file was found by file search.
- Fetch, create, interface: packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipes.ts; packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeCreate.ts; packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/utils/view/useRecipeInterface.ts.
- Public and console surfaces: packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue; no dedicated console/admin page confirmed.
- Flags: not scenario-only; duplicate residence is unsafe because the imported model path does not resolve to a confirmed file.
- Rating: weak. Cleanup priority: high.

## Duplicate Residence Register

| Entity | Canonical residence | Secondary residence | Wrapper or re-export status | Safe or unsafe | Cleanup recommendation |
| --- | --- | --- | --- | --- | --- |
| Supplier model | packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts | packages/extensions/fireux-suppliers/src/runtime/models/profiles/Supplier/Supplier.model.ts | secondary path is export-only re-export | safe | keep one visible canonical model path and leave wrapper path temporary and thin |
| Supplier fetch and write composables | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/* | none | canonical tree now owns the visible supplier firestore surface | aligned | keep supplier firestore composables under one entity path family |
| Supplier config and helper wrappers | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/app/supplier-console/* and packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/* | none | app runtime and firestore entity seams are now separated clearly | aligned | keep runtime console state under app and entity access under firestore |
| Task base versus extension task | packages/core/fireux-core/src/runtime/models/shared/task.model.ts | packages/extensions/fireux-tasks/src/runtime/models/task.model.ts | extension model extends the base model rather than duplicating it | safe | document this as intentional base-plus-domain-extension behavior |
| Document scenario mirror | packages/extensions/fireux-documents/src/runtime/models/document.model.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | scenario type mirrors production concept | safe if clearly labeled | keep scenario-only types fenced from production canon |
| DocumentLink scenario mirror | packages/extensions/fireux-documents/src/runtime/models/document-link.model.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | scenario type mirrors production concept | safe if clearly labeled | keep scenario-only types fenced from production canon |
| Recipe model import | no confirmed canonical model residence | packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/* and recipe interface files import ../../../../../models/Recipe.model | unresolved import target, not a safe wrapper | unsafe | either add the missing model in one clear runtime models location or remove/defer the current recipe stack |

## Entity Shape Comparison

### App stack

| Layer | Status | Exact path | Notes |
| --- | --- | --- | --- |
| model | full | packages/core/fireux-core/src/runtime/models/core/app.model.ts | canonical model present |
| fetch | full | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection.ts | simple collection read |
| collection | full | packages/core/fireux-core/src/runtime/pages/apps/index.vue | collection manager-driven index |
| create | partial | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts | ensure-oriented rather than explicit create |
| update | full | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppUpdate.ts | present |
| delete | full | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppDelete.ts | present |
| interface | full | packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts | present |
| card surfaces | full | packages/core/fireux-core/src/runtime/components/organisms/App/Cards | present via AppCollectionManager usage |
| collection manager | full | packages/core/fireux-core/src/runtime/components/organisms/App/Collection/Manager.vue | present |
| CTA | medium | packages/core/fireux-core/src/runtime/components/entity/IndexCta.vue | generic CTA only, dedicated App CTA removed |
| public index | full | packages/core/fireux-core/src/runtime/pages/apps/index.vue | canonicalized |
| admin/edit | missing | missing | apps are not treated as their own console runtime now |
| console runtime | intentionally none | n/a | by canon |

### Kitchen stack

| Layer | Status | Exact path | Notes |
| --- | --- | --- | --- |
| model | full | packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts | core plus app overlay |
| fetch | full | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch.ts | present |
| collection | full | packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue | present |
| create | full | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenCreate.ts | present |
| update | full | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenUpdate.ts | present |
| delete | not confirmed | missing in this pass | check if intentionally absent |
| interface | full | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface.ts | present |
| card surfaces | full | packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Cards | present |
| collection manager | full | packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Collection/Manager.vue | present |
| CTA | medium | kitchen-specific action surfaces, not normalized through EntityIndexCta | usable but not yet fully standardized |
| public index | full | packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue | present |
| admin/edit | full | packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/overview.vue | present |
| console runtime | full | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/state.ts | normalized runtime state present |

### Portfolio stack

| Layer | Status | Exact path | Notes |
| --- | --- | --- | --- |
| model | full | packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts | core plus app overlay |
| fetch | full | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/fetch/usePortfolioCollection.ts | present |
| collection | full | packages/extensions/fireux-properties/src/runtime/pages/portfolios/index.vue | present |
| create | full | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/mutations/usePortfolioCreate.ts | present |
| update | not confirmed | missing in this pass | check if route uses inline update or hidden helper |
| delete | not confirmed | missing in this pass | not visible in this pass |
| interface | full | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface.ts | present |
| card surfaces | full | packages/extensions/fireux-properties/src/runtime/components/organisms/Portfolio/Cards | present |
| collection manager | full | packages/extensions/fireux-properties/src/runtime/components/organisms/Portfolio/Collection/Manager.vue | present |
| CTA | medium | mostly local CTA, not fully normalized around EntityIndexCta | usable but mixed |
| public index | full | packages/extensions/fireux-properties/src/runtime/pages/portfolios/index.vue | present |
| admin/edit | full | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/overview.vue | present |
| console runtime | full | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/state.ts | normalized runtime state present |

### Supplier stack

| Layer | Status | Exact path | Notes |
| --- | --- | --- | --- |
| model | full | packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts | canonical supplier model path |
| fetch | full | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/fetch/useSupplierFetch.ts | canonical supplier fetch path |
| collection | full | packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue | present |
| create | full | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierCreate.ts | canonical supplier create path |
| update | full | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierUpdate.ts | canonical supplier update path |
| delete | full | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierDelete.ts | canonical supplier delete path |
| interface | full | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface.ts | canonical supplier interface path |
| card surfaces | full | packages/extensions/fireux-suppliers/src/runtime/components/organisms/Supplier/Cards | present |
| collection manager | full | packages/extensions/fireux-suppliers/src/runtime/components/organisms/Supplier/Collection/Manager.vue | present |
| CTA | full | packages/extensions/fireux-suppliers/src/runtime/components/organisms/Supplier/CTA.vue | present |
| public index | full | packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue | present |
| admin/edit | full | packages/extensions/fireux-suppliers/src/runtime/pages/dashboard/supplier/profile.vue | usable profile-edit surface |
| console runtime | partial | packages/extensions/fireux-suppliers/src/runtime/composables/fireux/app/supplier-console/useRuntimeSupplierConsole.ts | not normalized like project, kitchen, and portfolio |

### Chef, Agent, and Professional profile stack

| Entity | Model | Fetch | Create | Interface | Cards | Collection manager | CTA | Public index | Admin/edit | Console/runtime | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chef | packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/Chef.model.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefFetch.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefCreate.ts | packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface.ts | packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Cards | packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Collection/Manager.vue | packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/CTA.vue | packages/extensions/fireux-kitchens/src/runtime/pages/chefs/index.vue | packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/profile.vue | dashboard/profile plus kitchen runtime, but not its own runtime state family | strongest of the profile overlays in kitchens |
| Agent | packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentFetch.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentCreate.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface.ts | packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Cards | packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Collection/Manager.vue | packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/CTA.vue | packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue | packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue | dashboard/profile only, not runtime-state based | clean overlay pattern |
| Professional | packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalFetch.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalCreate.ts | packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface.ts | packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Cards | packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Collection/Manager.vue | packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/CTA.vue | packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue | packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue | dashboard/profile only, not runtime-state based | clean overlay pattern |

### Place and Company stack

| Entity | Model | Fetch | Create | Interface | Cards | Collection manager | CTA | Public index | Admin/edit | Console/runtime | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Place | packages/extensions/fireux-places/src/runtime/models/place.model.ts | packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/fetch/usePlacesCollection.ts | packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/mutations/usePlaceCreate.ts | packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/utils/view/usePlaceInterface.ts | packages/extensions/fireux-places/src/runtime/components/organisms/Place/Cards | packages/extensions/fireux-places/src/runtime/components/organisms/Place/Collection/Manager.vue | packages/extensions/fireux-places/src/runtime/components/organisms/Place/CTA.vue and packages/core/fireux-core/src/runtime/components/entity/IndexCta.vue at page level | packages/extensions/fireux-places/src/runtime/pages/places/index.vue | packages/extensions/fireux-places/src/runtime/pages/places/edit/[id].vue | no normalized console runtime | very solid canonical entity |
| Company | packages/extensions/fireux-companies/src/runtime/models/company.model.ts | packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/fetch/useCompanyCollection.ts | packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/mutations/useCompanyCreate.ts | packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface.ts | packages/extensions/fireux-companies/src/runtime/components/organisms/Company/Cards | packages/extensions/fireux-companies/src/runtime/components/organisms/Company/Collection/Manager.vue | packages/extensions/fireux-companies/src/runtime/components/organisms/Company/CTA.vue | packages/extensions/fireux-companies/src/runtime/pages/companies/index.vue | packages/extensions/fireux-companies/src/runtime/pages/companies/edit/[id].vue | no normalized console runtime | structurally good, but thin because Company is place-attached |

### Client and scenario property stack

| Entity | Model | Fetch | Create | Interface | Public index | Console/admin | Runtime model | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Client | packages/extensions/fireux-properties/src/runtime/models/client.model.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/client/fetch/useClientCollection.ts | missing | packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/client/utils/view/useClientInterface.ts | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/clients.vue | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/state.ts | live data and scenario data are mixed in one fetch path |
| Tenant | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts | n/a | n/a | missing | indirect via clients page | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/state.ts | scenario-only, not production canon |
| Lease | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts | n/a | n/a | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/finance.vue | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/state.ts | scenario-only, not production canon |
| MaintenanceTicket | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts | n/a | n/a | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/incidents.vue | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/state.ts | scenario-only, not production canon |
| FinancialSignals | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts | n/a | n/a | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/finance.vue | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/state.ts | scenario-only aggregate, not production canon |
| FinancialTransaction | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/_shared/types.ts | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio.ts | n/a | n/a | missing | packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/finance.vue | packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/state.ts | scenario-only, not production canon |

### Recipe stack

| Layer | Status | Exact path | Notes |
| --- | --- | --- | --- |
| model | missing | no file found for Recipe.model.ts in the current workspace | this is the critical gap |
| fetch | partial | packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipes.ts | present |
| collection | weak | packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue | current page returns an empty computed collection |
| create | partial | packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeCreate.ts | present |
| update | partial | packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeUpdate.ts | present |
| delete | partial | packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeDelete.ts | present |
| interface | full | packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/utils/view/useRecipeInterface.ts | present |
| card surfaces | full | packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Cards | present |
| collection manager | full | packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Collection/Manager.vue | present |
| CTA | full | packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/CTA.vue | present |
| public index | partial | packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue | page exists but data source is empty |
| admin/edit | missing | missing | not confirmed |
| console runtime | missing | missing | no normalized runtime state model |

## Missing Pieces

### Pages and components without a confirmed model residence

1. Recipe.
The biggest confirmed gap remains Recipe in Misebox. The UI stack exists, the recipe composables exist, and several files import a Recipe model path, but no matching model file was found in the current workspace.

### Model present but UI stack weak or thin

1. Ecosystem.
Model and collection fetch exist, but no strong public or admin surface was confirmed in this pass.
2. Project.
Model and create path exist, but the dedicated entity-style surface stack is thinner than App or Place.
3. KitchenCostSnapshot.
Model exists, but the visible UI stack is weak.

### Runtime behavior without a normalized runtime state model

1. Supplier.
The supplier console works, but it is still profile-console driven through packages/extensions/fireux-suppliers/src/runtime/composables/fireux/app/supplier-console/useRuntimeSupplierConsole.ts rather than a state.ts family parallel to Project, Kitchen, and Portfolio.
2. Recipe.
Recipe has runtime-ish pages and CRUD naming but no normalized runtime state family and no confirmed model residence.

### Live entity mixed with scenario-only fallback behavior

1. Client.
The client fetch layer blends direct Firestore reads with read-only scenario derivation. That is practical, but it means Client is carrying two conceptual jobs at once.

### Scenario-only records that still need production canon if they are promoted

1. Tenant.
2. Lease.
3. MaintenanceTicket.
4. FinancialSignals.
5. FinancialTransaction.

For any of those to become production entities, each one needs:
- a real model file outside scenario types
- a real collection path
- a real fetch composable
- a real mutation path
- a clear public or console surface contract

## Cleanup Map

### High-priority cleanup targets

1. Recipe.
Decide whether Recipe becomes a real Misebox entity or is removed/deferred until it has a real model and data source.
2. Supplier visible residence.
Choose one canonical visible model and composable path family and leave wrappers temporary.
3. Supplier runtime status.
Either keep Supplier explicitly non-runtime and document the exception, or add a normalized state family parallel to Project, Kitchen, and Portfolio.
4. Client shape.
Separate the live client entity path from the scenario-derived fallback path more clearly.
5. Scenario-only property records.
Keep them fenced, or promote them fully with production canon.

### Medium-priority cleanup targets

1. Normalize runtime-child kitchen naming so Menu, Dish, KitchenRecipe, and KitchenMiseTask read more like clean entity stacks and less like menu-stack plumbing.
2. Strengthen thin registry entities such as Ecosystem and Project where needed.
3. Standardize more entity indexes around the same assembly recipe: page header, EntityIndexCta, entity CTA where useful, collection manager.

### Low-priority cleanup targets

1. Keep base abstraction entities such as Profile and Task base explicit and lightly documented.
2. Leave strong entity families such as App, User, Place, Product, BlogPost, and ComplianceRecord largely alone unless canon changes.

## Audit Method

This pass was built from:
- Tier1 and Tier2 canon reads
- extension contract reads
- repo-wide entity inventory scanning
- targeted file searches for model, fetch, create, interface, page, CTA, and collection manager layers
- direct duplicate-wrapper checks in supplier paths
- direct missing-model checks for Recipe

Interpretation rule used here:

An entity only counts as structurally complete when the repo confirms a stable model residence, a stable data residence, a real fetch path, a real write path or explicit reason not to have one, and a coherent surface story.
