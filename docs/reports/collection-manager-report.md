# Collection Manager Report

Status: generated report
Authority: non-authoritative evidence
Generated: 2026-03-02T11:57:37.372Z
Canon version: `server-projection-v1`
Scan scope:
- Included: collection manager components, public route pages, runtime server API files.
- Signals: endpoint-first reads (`/api/public/*`) vs client Firestore reads (`useCollection`, `useDocument`, `firestoreFetch*`).
- Excluded: private console/dashboard/admin pages from migration scope.

## Current Collection Manager Architecture
- Collection manager UI components remain in-place for CRUD/list UX surfaces.
- Migration scope is public read-path only; manager CRUD patterns remain unchanged.

### Manager Files
- `packages/core/fireux-core/src/runtime/components/organisms/App/Collection/Manager.vue`
- `packages/core/fireux-core/src/runtime/components/organisms/User/Collection/Manager.vue`
- `packages/core/fireux-core/src/runtime/pages/dev/users.vue`
- `packages/core/fireux-core/src/runtime/pages/users/index.vue`
- `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Collection/Manager.vue`
- `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/Collection/Manager.vue`
- `packages/extensions/fireux-companies/src/runtime/components/organisms/Company/Collection/Manager.vue`
- `packages/extensions/fireux-suppliers/src/runtime/components/organisms/Supplier/Collection/Manager.vue`
- `packages/extensions/fireux-jobs/src/runtime/components/organisms/Job/Collection/Manager.vue`
- `packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Collection/Manager.vue`
- `packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Collection/Manager.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Dish/Collection/Manager.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Collection/Manager.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Collection/Manager.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Menu/Collection/Manager.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Mise/Collection/Manager.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Supplier/Collection/Manager.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Collection/Manager.vue`
- `packages/extensions/fireux-places/src/runtime/components/organisms/Place/Collection/Manager.vue`
- `packages/extensions/fireux-products/src/runtime/components/organisms/Product/Collection/Manager.vue`

## Public Read Path Status
- Endpoint-first public pages detected: 2
- Client-Firestore public pages still detected: 3

### Endpoint-First
- `packages/core/fireux-core/src/runtime/pages/users/[handle].vue`
- `packages/core/fireux-core/src/runtime/pages/users/index.vue`

### Still Client Firestore
- `packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/[id].vue`
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id].vue`
- `packages/extensions/fireux-places/src/runtime/pages/places/[id].vue`

## Coupling Analysis
- Server-projection adoption does not require redesigning collection manager CRUD abstractions.
- Required changes are page/public API read-path changes and sitemap source migration only.

## Transitional State
- Keep `seo_index_*` for entities still projection-backed during rollout.
- `handles/{handle}` legacy path is retired in runtime and migration scripts.
- New `/api/public/users` endpoints supersede projection-first public reads incrementally.
