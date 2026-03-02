# Global Entities Report

Generated: 2026-03-02T09:05:13.297Z
Canon version: `server-projection-v1`
Scan scope:
- Included: `packages/**`, `projects/**`, `apps/**`, `scripts/**` source files.
- Signals: Firestore calls (`collection(...)`, `.collection(...)`) and model path comments.
- Excluded: nested subcollections and app overlays are not treated as canonical global entities.

## Summary
- Root collection candidates detected: 26
- Candidate indexable collections: 8
- SEO projection collections detected: 12

## Detected Collections

| Collection | Indexing recommendation | Example source paths |
| --- | --- | --- |
| `apps` | noindex (default) | packages/core/fireux-core/src/runtime/components/dev/Binding.vue<br/>packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection.ts<br/>packages/core/fireux-core/src/runtime/models/core/app.model.ts |
| `chefs` | index | scripts/migrate-chef-kitchen-ids.mjs |
| `companies` | index | packages/extensions/fireux-companies/src/runtime/models/company.model.ts<br/>scripts/migrate-company-thin-overlay.mjs |
| `dishes` | noindex (default) | scripts/migrate-kitchen-dish-short-names.mjs<br/>scripts/migrate-tapberne-menu-items-to-dishes.mjs |
| `handles` | noindex (default) | scripts/backfill-user-handles-index.mjs |
| `ingredients` | noindex (default) | packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts<br/>scripts/delete-duplicate-ingredients.mjs<br/>scripts/migrate.mjs |
| `jobs` | index | packages/extensions/fireux-jobs/src/runtime/models/job.model.ts<br/>scripts/fill-job-missing-fields.mjs<br/>scripts/migrate.mjs |
| `kitchens` | index | packages/extensions/fireux-kitchens/src/runtime/models/dish.model.ts<br/>packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts<br/>packages/extensions/fireux-kitchens/src/runtime/models/kitchen-cost.model.ts |
| `menus` | noindex (default) | scripts/migrate-tapberne-channel-menus.mjs<br/>scripts/migrate-tapberne-menu-items-to-dishes.mjs<br/>scripts/migrate-tapberne-menus.mjs |
| `places` | index | packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/mutations/usePlaceSave.ts<br/>packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/mutations/usePlaceUpdate.ts<br/>packages/extensions/fireux-places/src/runtime/models/place.model.ts |
| `professionals` | index | scripts/migrate-professional-experience-months.mjs<br/>scripts/migrate-professional-kevin.mjs |
| `recipes` | index | packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeCreate.ts<br/>packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipes.ts |
| `seo_index_agents` | noindex (projection) | packages/extensions/fireux-jobs/src/module.ts<br/>packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentCreate.ts<br/>packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentDelete.ts |
| `seo_index_blogs` | noindex (projection) | packages/extensions/fireux-blogs/src/module.ts<br/>packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogCreate.ts<br/>packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogDelete.ts |
| `seo_index_chefs` | noindex (projection) | packages/extensions/fireux-kitchens/src/module.ts<br/>packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefCreate.ts<br/>packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefDelete.ts |
| `seo_index_companies` | noindex (projection) | packages/extensions/fireux-companies/src/module.ts<br/>packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/mutations/useCompanyCreate.ts<br/>packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/mutations/useCompanyUpdate.ts |
| `seo_index_jobs` | noindex (projection) | packages/extensions/fireux-jobs/src/module.ts<br/>packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/mutations/useJobCreate.ts<br/>packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/mutations/useJobDelete.ts |
| `seo_index_kitchens` | noindex (projection) | packages/extensions/fireux-kitchens/src/module.ts<br/>packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenCreate.ts<br/>packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenUpdate.ts |
| `seo_index_places` | noindex (projection) | packages/extensions/fireux-places/src/module.ts<br/>packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/mutations/usePlaceSave.ts<br/>packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/mutations/usePlaceUpdate.ts |
| `seo_index_products` | noindex (projection) | packages/extensions/fireux-products/src/module.ts<br/>packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/useProductCreate.ts<br/>packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/useProductDelete.ts |
| `seo_index_professionals` | noindex (projection) | packages/extensions/fireux-jobs/src/module.ts<br/>packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalCreate.ts<br/>packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalDelete.ts |
| `seo_index_recipes` | noindex (projection) | packages/ecosystem/fireux-misebox/src/module.ts<br/>packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeCreate.ts<br/>packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeDelete.ts |
| `seo_index_suppliers` | noindex (projection) | packages/extensions/fireux-drop/src/module.ts<br/>packages/extensions/fireux-drop/src/runtime/composables/fireux/firestore/Supplier/main/useSupplierCreate.ts<br/>packages/extensions/fireux-drop/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierDelete.ts |
| `seo_index_users` | noindex (projection) | packages/core/fireux-core/src/module.ts<br/>packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts<br/>packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserHandleClaim.ts |
| `test-kitchens` | noindex (default) | scripts/migrate-test-kitchens.ts |
| `users` | index | packages/core/fireux-core/src/runtime/components/layouts/console/NotificationsSlideover.vue<br/>packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserByHandleFetch.ts<br/>packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserHandleClaim.ts |

## Candidate Indexable Entities
- `chefs`
- `companies`
- `jobs`
- `kitchens`
- `places`
- `professionals`
- `recipes`
- `users`

## Never Index Buckets
- `/console/**`
- `/dashboard/**`
- `/admin/**`
- `/dev/**`
- `/auth/**`
- `/onboarding/**`
- Nested subcollections (`/<root>/{id}/...`)
- App overlays (`/apps/{appId}/...`)

## Transitional State
- Keep `seo_index_*` collections until each entity migrates to canonical-doc sitemap reads.
- Keep legacy `handles/{handle}` scripts until handle migration is closed.
