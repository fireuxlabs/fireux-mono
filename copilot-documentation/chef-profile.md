# Chef Profile – create via useProfile

Purpose: List all files you need and the flow to create a Chef profile using the generic profile composables. This is the machine-usable map for agents.

## What you need

- Canonical profile types
  - `packages/core/fireux-core/src/runtime/models/profiles/profile.model.ts`
    - ProfileBase, ProfileCreate, ProfileUpdate, ProfileConfig
- Chef config (tenant)
  - `packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts`
    - `chefConfig` with id: 'chef', collectionName: 'chefs', profileType: 'Chef', defaults/validation
- Generic profile composables (global)
  - `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts`
  - `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfile.ts`
  - `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileDelete.ts`
- AppUser updater (for membership badges/entries)
  - `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserUpdate.ts`
    - `useAppUserUpdateFirestore().updateProfiles(entries)` (compat)
    - `setProfiles(stringBadges)` (new)
- Firestore helpers
  - `packages/core/fireux-core/src/runtime/composables/firestore/useFirestoreManager.ts`
  - `packages/core/fireux-core/src/runtime/composables/firestore/useFirestoreRead.ts`
- Media defaults (avatars)
  - `packages/core/fireux-core/src/runtime/composables/firebase/useMediaStorage.ts`
- Auth + config (prereqs)
  - `packages/core/fireux-core/src/runtime/components/organisms/Auth/Authenticated.vue`
  - `packages/core/fireux-core/src/runtime/composables/FireUXConfig.ts`

## How the flow works

1) Build the Chef profile config from the tenant model:
   - `import { chefConfig } from '#tenant/models/profiles/Chef.model'`
2) Use the unified profile composable:
   - `const { createProfile } = await useProfile(chefConfig)`
3) Call create with domain fields (min: `chef_name`):
   - `await createProfile({ chef_name: 'Alice Example' })`
4) Under the hood (global-first):
   - Check global doc `chefs/{uid}`
     - If exists: ensure `AppUser.profiles` contains a profile entry `{ type: 'chef', collection: 'chefs', is_active: true, created_at: ... }`
     - If missing: create a new global doc with `ProfileBase` fields (`id`, `avatar`, `created_at`, `updated_at`) plus your domain fields; then update `AppUser.profiles`.
5) Avatar default
   - `useMediaStorage().getDefaultAvatarUrl()` → '/img/default-avatar.png' fallback

## Data shapes

- Global profile doc (chefs/{uid}) minimally conforms to ProfileBase:
  - id (== auth uid), avatar (URL), created_at, updated_at?
  - Domain fields from `Chef.model.ts` (e.g., `chef_name`) go into the same document.
- AppUser doc (apps/{appId}/users/{uid})
  - profiles: either old entry objects (compat path used by create) or new string[] badges (`['chef']`).

## Minimal usage example

```ts
import { useProfile } from '#fireux-core/composables/firestore/profiles/useProfile'
import { chefConfig } from '#tenant/models/profiles/Chef.model'

const { createProfile, creating, createError } = await useProfile(chefConfig)
await createProfile({ chef_name: 'Alice Example' })
```

## Troubleshooting

- Not authenticated → useProfileCreate throws: ensure user is signed in.
- Missing appId → set via FireUXConfig so AppUser writes succeed.
- Validation → provide `chef_name` at minimum (see `chefConfig.requiredFields`).
- Default avatar → falls back to '/img/default-avatar.png' if no user photo.
