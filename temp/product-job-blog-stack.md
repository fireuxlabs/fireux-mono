# Product / Job / Blog stack paths

## Products (composables only)

- `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/products/product/useProduct.ts` (entrypoint)
- `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/products/product/state/useCreateProductState.ts`
- `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/products/product/state/prices/useCreatePricesState.ts`
- `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/products/product/utils/useProductInterface.ts`

## Blogs (composables only)

- `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blogs/post/usePost.ts` (entrypoint)
- `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blogs/post/state/useBlogDraftState.ts`

## Jobs (composables only)

- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/useJob.ts` (entrypoint)
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/utils/useJobCreateState.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/fetch/useJobFetch.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/fetch/useJobCollection.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/fetch/useJobRead.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/mutations/useJobCreate.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/mutations/useJobDelete.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/mutations/useJobUpdate.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/utils/useJobEditor.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/utils/useJobComputed.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/job/utils/useJobInterface.ts`
- Profiles (current structure)
  - Agent: `useAgent.ts`, `utils.ts`, `main/useAgentCollection.ts`, `main/useAgentComputed.ts`, `main/useAgentCreate.ts`, `main/useAgentDelete.ts`, `main/useAgentInterface.ts`, `main/useAgentUpdate.ts`
  - Professional: `useProfessional.ts`, `utils.ts`, `main/useProfessionalCollection.ts`, `main/useProfessionalComputed.ts`, `main/useProfessionalCreate.ts`, `main/useProfessionalDelete.ts`, `main/useProfessionalInterface.ts`, `main/useProfessionalUpdate.ts`
- App routes
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/app/routes/useJobDashboardRoutes.ts`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/app/routes/useJobRoutes.ts`
