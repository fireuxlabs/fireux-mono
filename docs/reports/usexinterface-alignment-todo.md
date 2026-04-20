# useXInterface Alignment TODO
Authority: Tier2 (Operational worklist)
Updated: 2026-04-19

This file is not canon.

Its job is to track the remaining `useXInterface` drift in the repo until every
interface matches the chosen boring/thin projector shape.

## Working Target

The working target is:

- `useXInterface` = thin projector
- entity in
- small stable UI-ready shape out
- no fetches
- no hidden hydration
- no `Ref`-bound usage pattern
- no console-specific logic
- no rich presenter logic

If a domain still needs richer UI behavior, that belongs in a second layer such
as a presenter/view/profile seam, not in `useXInterface`.

## Stop Rules

Until this worklist is empty:

- do not add new rich domain logic to any `useXInterface`
- do not add new `Ref`-bound interface hooks
- when touching an old rich interface, split richness out instead of extending it

## Current Inventory

Current repo count:

- `28` `useXInterface` files

### Aligned Enough Now

These are the closest to the target thin projector shape:

- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/ecosystem/utils/view/useEcosystemInterface.ts`

### Special Outliers To Fix

These are not rich in the same way as the domain presenters, but they are still
non-canon because the hook itself takes an optional `Ref`:

- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts`

### Remaining Rich Or Mixed Interfaces To Split

- `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/utils/view/useRecipeInterface.ts`
- `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/utils/view/useBlogInterface.ts`
- `packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface.ts`
- `packages/extensions/fireux-compliance/src/runtime/composables/fireux/firestore/compliance/utils/view/useComplianceInterface.ts`
- `packages/extensions/fireux-documents/src/runtime/composables/fireux/firestore/documents/utils/view/useDocumentInterface.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/utils/view/useJobInterface.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/utils/view/useIngredientInterface.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/dish/utils/view/useDishInterface.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/menu/utils/view/useMenuInterface.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/mise/utils/view/useMiseEnPlaceInterface.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/recipe/utils/view/useRecipeInterface.ts`
- `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/utils/view/usePlacesInterface.ts`
- `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/utils/view/useProductInterface.ts`
- `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/client/utils/view/useClientInterface.ts`
- `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface.ts`
- `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/utils/view/usePropertyInterface.ts`
- `packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface.ts`
- `packages/extensions/fireux-tasks/src/runtime/composables/fireux/firestore/tasks/utils/view/useTaskInterface.ts`

## Priority Waves

### Wave 1

Interfaces that affect active console/index work or shared browse seams:

- `useKitchenInterface`
- `useAppInterface`
- `useUserInterface`
- `useSupplierInterface`
- `usePortfolioInterface`
- `usePlacesInterface`
- `useCompanyInterface`

### Wave 2

Interfaces used broadly in shared cards, collections, or public index/detail surfaces:

- `useJobInterface`
- `useProductInterface`
- `useBlogInterface`
- `useClientInterface`
- `usePropertyInterface`
- `useTaskInterface`
- `useDocumentInterface`
- `useComplianceInterface`

### Wave 3

The remaining profile-heavy or runtime-kitchen child interfaces:

- `useAgentInterface`
- `useProfessionalInterface`
- `useChefInterface`
- `useIngredientInterface`
- `useDishInterface`
- `useMenuInterface`
- `useMiseEnPlaceInterface`
- public/runtime `useRecipeInterface`

## Done Criteria

This worklist is done when every `useXInterface`:

- accepts plain entity input rather than a bound `Ref`
- stays fetch-free
- stays hydration-free
- stays console-free
- returns stable small projections for `interface`, `pill`, `cell`, `preview`, and `profile`
- pushes richer UI behavior into a second layer
