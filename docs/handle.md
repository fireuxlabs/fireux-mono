# Handle System Report

Generated: 2026-03-02T11:57:37.372Z
Canon version: `server-projection-v1`
Scan scope:
- Included: runtime pages/composables/server APIs, modules, and scripts.
- Signals: `handles` collection references, `users.handle` read/write paths, `seo_index_users` usage.
- Excluded: generated output and non-source assets.

## Current Architecture
- Runtime public routing resolves user handles from `users.handle`.
- Public user pages now use endpoint-first SSR (`/api/public/users`, `/api/public/users/:handle`).
- User SEO now resolves from canonical docs (`users`) for pages and sitemap generation.
- `handles/{handle}` should be absent from runtime and cleanup scripts after migration.

## Runtime Handle Reads
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserByHandleFetch.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserHandleClaim.ts`

## Handle Write Paths
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserHandleClaim.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/ensureHelpers.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/update/useCoreUserUpdate.ts`
- `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogCreate.ts`
- `scripts/migrate.mjs`

## Legacy `handles` Collection References
- None detected.

## Transitional SEO Projection References (`seo_index_users`)
- None detected.

## Public Endpoint References
- `packages/core/fireux-core/src/module.ts`
- `packages/core/fireux-core/src/runtime/pages/users/[handle].vue`
- `packages/core/fireux-core/src/runtime/pages/users/index.vue`

## Recommendation
- Canonical runtime routing should remain `users.handle`.
- Runtime should not read or write `seo_index_*` for public route truth; `seo_index_users` is retired.
