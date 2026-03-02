# Handle System Report

Generated: 2026-03-02T09:05:13.297Z
Canon version: `server-projection-v1`
Scan scope:
- Included: runtime pages/composables/server APIs, modules, and scripts.
- Signals: `handles` collection references, `users.handle` read/write paths, `seo_index_users` usage.
- Excluded: generated output and non-source assets.

## Current Architecture
- Runtime public routing resolves user handles from `users.handle`.
- Public user pages now use endpoint-first SSR (`/api/public/users`, `/api/public/users/:handle`).
- `seo_index_users` remains transitional fallback for sitemap/API migration safety.
- `handles/{handle}` usage is script-level legacy unless runtime references are listed below.

## Runtime Handle Reads
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserByHandleFetch.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserHandleClaim.ts`

## Handle Write Paths
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserHandleClaim.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/ensureHelpers.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/update/useCoreUserUpdate.ts`
- `packages/ecosystem/fireux-fireux/apps/stitch/app/composables/useStitchProviderCreate.ts`
- `packages/ecosystem/fireux-fireux/apps/stitch/app/composables/useStitchProviderUpdate.ts`
- `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogCreate.ts`
- `scripts/migrate.mjs`
- `scripts/reports/regenerate-reports.mjs`

## Legacy `handles` Collection References
- `scripts/backfill-user-handles-index.mjs`
- `scripts/reports/regenerate-reports.mjs`

## Transitional SEO Projection References (`seo_index_users`)
- `packages/core/fireux-core/src/module.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserHandleClaim.ts`
- `packages/core/fireux-core/src/runtime/server/api/public/users.get.ts`
- `packages/core/fireux-core/src/runtime/server/api/public/users/[handle].get.ts`
- `scripts/reports/regenerate-reports.mjs`
- `scripts/seo-sitemap-counts.mjs`

## Public Endpoint References
- `packages/core/fireux-core/src/module.ts`
- `packages/core/fireux-core/src/runtime/pages/users/[handle].vue`
- `packages/core/fireux-core/src/runtime/pages/users/index.vue`
- `scripts/reports/regenerate-reports.mjs`

## Recommendation
- Canonical runtime routing should remain `users.handle`.
- Keep `seo_index_users` and legacy `handles` scripts during migration; remove only after parity checks.
