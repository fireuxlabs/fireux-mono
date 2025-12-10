# Product / Job / Blog stack paths

## Products (composables only)

- Canon (new canon path)
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/products/product/useProduct.ts` (entrypoint)
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/products/product/state/useCreateProductState.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/products/product/state/prices/useCreatePricesState.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/products/product/utils/useProductInterface.ts`
- Legacy/to-move (still under `objects/Product/`)
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/Product/useProductCreate.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/Product/useProductDelete.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/Product/useProductUpdate.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/Product/useProductUtils.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/Product/useProducts.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/Product/fetch/useProductBySlug.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/Product/fetch/useProductCollection.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/Product/fetch/useProductPrices.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/Product/fetch/useProductRead.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/Product/utils/useProductFormatting.ts`

## Blogs (composables only)

- Canon (new canon path)
  - `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blogs/post/usePost.ts` (entrypoint)
  - `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blogs/post/state/useBlogDraftState.ts`
- Legacy/to-move (still under `objects/Blog/`)
  - `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/Blog/useBlog.ts`
  - `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/Blog/fetch/useBlogFetch.ts`
  - `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/Blog/mutations/useBlogCreate.ts`
  - `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/Blog/mutations/useBlogDelete.ts`
  - `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/Blog/mutations/useBlogUpdate.ts`
  - `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/Blog/utils/useBlogUtils.ts`

## Jobs (composables only)

- Canon (new canon path)
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/useJob.ts` (entrypoint)
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/state/useJobCreateState.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/fetch/useJobFetch.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/fetch/useJobCollection.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/fetch/useJobRead.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/mutations/useJobCreate.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/mutations/useJobDelete.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/mutations/useJobUpdate.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/utils/useJobEditor.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/utils/useJobComputed.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/utils/useJobInterface.ts`
- Legacy (still under `jobs/` root)
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/useJob.ts`
- Profiles (current structure)
  - Agent: `useAgent.ts`, `utils.ts`, `main/useAgentCollection.ts`, `main/useAgentComputed.ts`, `main/useAgentCreate.ts`, `main/useAgentDelete.ts`, `main/useAgentInterface.ts`, `main/useAgentUpdate.ts`
  - Professional: `useProfessional.ts`, `utils.ts`, `main/useProfessionalCollection.ts`, `main/useProfessionalComputed.ts`, `main/useProfessionalCreate.ts`, `main/useProfessionalDelete.ts`, `main/useProfessionalInterface.ts`, `main/useProfessionalUpdate.ts`
- App routes
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/app/routes/useJobDashboardRoutes.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/app/routes/useJobRoutes.ts`
