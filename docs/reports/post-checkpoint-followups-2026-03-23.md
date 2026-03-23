# Post-Checkpoint Followups

Authority: Operational
Updated: 2026-03-23

Purpose: short follow-up list after the broad runtime checkpoint commit.

## 1. Core Runtime And Nav Cleanup

- Review the remaining `fireux-core` routing and nav changes as one family:
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/console/createScopeConsole.ts`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/routing/filterConsoleScopeNavItems.ts`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/routing/useDashboardNav.ts`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/ui/nav/useNav.ts`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/ui/nav/useNavGrouping.ts`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/ui/nav/visibility.ts`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/nav.types.ts`
- Confirm the deleted legacy type files really should stay deleted:
  - `packages/core/fireux-core/src/runtime/types/card-payload.ts`
  - `packages/core/fireux-core/src/types/app/onboarding.ts`
  - `packages/core/fireux-core/src/types/nav.ts`

## 2. App Bootstrap And Env Check Pass

- Revisit the app bootstrap slice together:
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/utils/useAppEnvCheck.ts`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/utils/useAppOnboarding.ts`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/utils/env-check.types.ts`
  - `packages/core/fireux-core/src/runtime/components/organisms/App/Create/OnboardingVariables.vue`
  - `packages/core/fireux-core/src/runtime/components/organisms/App/Edit/Dev.vue`
- Decide whether this batch is runtime-contract work, dev tooling work, or both.

## 3. Visual/Layout Keep Or Revert

- Explicitly decide whether to keep or revert:
  - `packages/core/fireux-core/src/runtime/layouts/default.vue`
  - `packages/core/fireux-core/src/runtime/layouts/docs.vue`
  - `packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/sections.scss`
- This should be judged against the later visual/design phase, not bundled into structural alignment by default.

## 4. Docs Delivery And Module Wiring

- Review docs delivery as one vertical slice:
  - `packages/ecosystem/fireux-fireux/src/module.ts`
  - `packages/ecosystem/fireux-fireux/src/runtime/pages/docs/index.vue`
  - `packages/ecosystem/fireux-fireux/src/runtime/pages/docs/[...slug].vue`
  - `projects/fireux/fireux-app/server/api/docs-manifest.get.ts`
  - `packages/core/fireux-docs/src/module.ts`

## 5. Remaining Entity Followups

- `Project` still needs a focused pass across runtime model, runtime project composables, and console expectations:
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/runtime-project/read-only-scenarios/index.ts`
  - `packages/core/fireux-core/src/runtime/composables/fireux/app/runtime-project/useRuntimeProject.ts`
  - `packages/core/fireux-core/src/runtime/models/system/project.model.ts`
- `Profile` core still needs a second look after the supplier de-profile pass:
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection.ts`
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure.ts`
  - `packages/core/fireux-core/src/runtime/models/core/profile.model.ts`
- Small page/entity cleanup leftovers:
  - `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id].vue`
  - `packages/extensions/fireux-companies/src/runtime/components/organisms/Company/Cards/Profile.vue`
  - `packages/extensions/fireux-companies/src/runtime/components/organisms/Company/Edit.vue`
  - `packages/extensions/fireux-jobs/src/runtime/components/organisms/Job/Cards/Profile.vue`
  - `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalCreate.ts`
  - `packages/extensions/fireux-jobs/src/runtime/pages/jobs/[id].vue`
  - `packages/extensions/fireux-properties/src/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole.ts`
  - `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipes.ts`

## 6. General Naming Debt

- Supplier is structurally de-profiled, but core-wide generic names still exist and should be revisited later:
  - `useConsoleProfileView`
  - `MoleculesProfilesAdminCreateCard`
- These are no longer supplier blockers, but they are still naming debt across the repo.
