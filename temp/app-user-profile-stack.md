# App / User / Profile stack paths (canon snapshot)

## Core Firestore composables (canon)

- App domain (`packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app`)
  - `fetch/`: `useAppCollection.ts`, `useAppFetch.ts`, `useAppUsers.ts`
  - `mutations/`: `useAppDelete.ts`, `useAppEnsure.ts`, `useAppUpdate.ts`
  - `utils/`: `useAppJoinRequests.ts`, `validation/`, `view/`
  - Root: `useApp.ts`
- Profile domain (`packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile`)
  - `fetch/`: `useProfileCollection.ts`, `useProfileFetch.ts`
  - `mutations/`: `useProfileDelete.ts`, `useProfileEnsure.ts`, `useProfileUpdate.ts`
  - `utils/`: `view/`
  - Root: `useProfile.ts`
- User domain (`packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user`)
  - `fetch/`: `useUserCollection.ts`, `useUserFetch.ts`
  - `mutations/`: `useAppUserUpdate.ts`, `useCoreUserEnsure.ts`, `useCoreUserUpdate.ts`, `useUserDelete.ts`, `useUserEnsure.ts`, `useUserUpdate.ts`
  - `utils/`: `ensureHelpers.ts`, `validation/`, `view/`
  - Root: `useUser.ts`
- Shared state helper
  - `packages/core/fireux-core/src/runtime/composables/fireux/firestore/state/useProfileState.ts` (generic keyed state helper for profiles)

## Components (app/user/profile-related)

- Core app/profile UI
  - `packages/core/fireux-core/src/runtime/components/layouts/dashboard/ProfilesMenu.vue`
  - `packages/core/fireux-core/src/runtime/components/layouts/dashboard/ProfileEdit.vue`
  - `packages/core/fireux-core/src/runtime/components/organisms/Dashboard/Profile/Edit/Profile.vue`
  - `packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Profile.vue`
  - `packages/core/fireux-core/src/runtime/components/organisms/User/Cards/Profile.vue`
  - Dev aid: `packages/core/fireux-core/src/runtime/components/dev/ProfileDiffList.vue`

## Quick align notes

- Canon already matches core pattern: `fetch/`, `mutations/`, `utils/`, root `use<App|Profile|User>.ts`.
- No `state/` folder yet; add if/when we introduce local draft form state for app/profile/user.
- View/validation live under `utils/`; keep exporting through each root to preserve single entrypoint imports.
