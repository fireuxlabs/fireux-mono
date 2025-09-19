# Chef Profile Ensure Flow

Purpose: Document the code path to ensure a Chef profile exists for a signed‑in user in a tenant app, from page CTA to profile creation.

## Overview

- Entry point: tenants/misebox Chefs index page (`packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue`)
- CTA component: uses `UPageCTA` with `chefConfig.ctaTitle` and `chefConfig.ctaDescription`
- Model/config: `packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts`
- Creator composable: `packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts` (if present) or generic `useProfileCreate`
- Generic profile create: `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts`
- User ensure pre-req: `packages/core/fireux-core/src/runtime/composables/firestore/user/useUserEnsure.ts`

## Files and responsibilities

1. Page and CTA

- File: `packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue`
- Purpose:
  - Display Chef listing for tenant app.
  - Show CTA (`UPageCTA`) bound to `chefConfig.ctaTitle` and `chefConfig.ctaDescription`.
  - On CTA action, trigger profile creation flow (via a create composable or navigate to an onboarding flow that calls it).

Contents:

```vue
<template>
  <div class="page space-y-4">
    <!-- CTA only when profile needs to be created or added to app -->
    <template v-if="showCreateGlobal || showAddToApp">
      <UPageCTA :title="ctaTitle" variant="soft">
        <template #links>
          <UButton
            size="lg"
            color="primary"
            :label="primaryLabel"
            @click="onEnsure"
          />
        </template>
      </UPageCTA>
    </template>

    <!-- When both profiles exist: show compact current profile surfaces -->
    <template v-else>
      <div class="mt-4 space-y-2">
        <OrganismsProfilesChefCardsPill
          class="cursor-pointer"
          :chef="current"
        />
        <OrganismsProfilesChefCardsCell
          class="cursor-pointer"
          :chef="current"
        />
      </div>
    </template>

    <!-- Profiles via reusable Root -->
    <OrganismsProfileRoot :config="chefConfig">
      <template #profile-pill="{ profile, navigate }">
        <OrganismsProfilesChefCardsPill
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-card="{ profile, navigate }">
        <OrganismsProfilesChefCardsProfile
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-item="{ profile, navigate }">
        <OrganismsProfilesChefCardsCell
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>
    </OrganismsProfileRoot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { chefConfig } from '../../models/profiles/Chef.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useChefCreate } from '../../composables/firestore/profiles/Chef/useChefCreate'

// tenancy state (strings, not refs)
const { role, tenancyDisplay } = useApp() // e.g. 'global' | 'tenant'

// profile state
const { current, refresh } = useProfile(chefConfig)
const ecosystemProfile = current.global // ref<Document | null>
const appProfile = current.appMirror // ref<Document | null>

// render logic
const showCreateGlobal = computed(() => !ecosystemProfile.value)
const showAddToApp = computed(
  () => ecosystemProfile.value && role === 'tenant' && !appProfile.value
)

const ctaTitle = computed(() => {
  if (showCreateGlobal.value) {
    return chefConfig.ctaTitle
  }
  if (showAddToApp.value) {
    return `Add your Chef profile to ${tenancyDisplay}`
  }
  return `You're all set`
})

const primaryLabel = computed(() => {
  if (showCreateGlobal.value) {
    return 'Create Chef Profile'
  }
  return `Add to ${tenancyDisplay} Chefs`
})

// actions → delegate to useProfileCreate via useChefCreate
const { createChef } = useChefCreate()

async function onEnsure() {
  // no args: create global; if tenant, mirror is auto-created by useProfileCreate
  await createChef()
  await refresh?.()
}
</script>
```

2. Profile model/config

- File: `packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts`
- Purpose:
  - Declares `chefConfig` implementing `ProfileConfig` from core.
  - Includes `collectionName` (e.g., `profiles/chefs`) and metadata.
  - Can provide `ctaTitle` and `ctaDescription` used by CTA.

Contents:

```ts
// packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'

/** 🔹 Unified Chef (mirrors unified User shape) */
export interface Chef {
  id: string
  display_name?: string
  avatar?: string
  core: ChefCoreProfile | null
  app?: ChefAppProfile | null
}

/** Global doc: chefs/{uid} */
export interface ChefCoreProfile extends ProfileBase {
  display_name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App mirror: apps/{appId}/chefs/{uid} */
export interface ChefAppProfile extends ProfileBase {
  display_name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}

/** 🔹 Shapes for rendering cards (parity with UserCard) */
export namespace ChefCard {
  export interface Pill {
    id: string
    display_name: string
    avatar?: string
    title?: string | null
  }

  export interface Cell extends Pill {
    bioShort?: string | null
    specialties?: string[]
  }

  export interface Profile extends Cell {
    bioLong?: string | null
  }
}

/** 🔹 Config (slim, matches ProfileConfig) */
export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  ctaTitle: 'Showcase your culinary expertise',
  ctaDescription:
    'Create your Chef profile to highlight your skills, share your specialties, and connect with opportunities in the Misebox community.',
} as const
```

3. Generic creation composable

- File: `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts`
- Purpose:
  - Given a `ProfileConfig`, ensures a minimal profile document exists.
  - Always creates/merges the global profile document: `<collectionName>/{uid}`.
  - If running in a tenant app, also writes an app‑scoped mirror: `apps/{appId}/<collectionName>/{uid}`.
  - Seeds id/name/avatar from unified `useUser()` (core user fields) and merges provided fields.
    - Seeds id/display_name/avatar from unified `useUser()` (core user fields) and merges provided fields.
  - Uses `useFirestoreCreate.setDocument()` which stamps `created_at`, `updated_at`, `creator_id` unless `raw` is requested.

Contents:

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts
import { useFireUXConfig } from '../../FireUXConfig'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { useUser } from '../user/useUser'

/**
 * Minimal profile creation:
 * - Always creates a global (ecosystem) profile
 * - If role === 'tenant' → also creates a shallow app mirror
 * - Seeds id/name/avatar from CoreUser (not Firebase Auth)
 * - No defaults: only writes what the caller passes (plus id/name/avatar baseline)
 * - Timestamps/creator are auto-stamped by useFirestoreCreate()
 */
export function useProfileCreate(config: ProfileConfig) {
  const { appId, role } = useFireUXConfig()
  const { setDocument } = useFirestoreCreate()
  const { user } = useUser()

  /**
   * ensure(profileFs): Write minimal profile payload.
   * - Expects Firestore-shaped keys (snake_case if applicable). Use model mappers to convert UI → FS.
   * - Stamping is handled by useFirestoreCreate()
   */
  async function ensure(profile: Record<string, any> = {}) {
    if (!user.value?.id) throw new Error('User not loaded')
    const uid = user.value.id
    const core = user.value.core

    // Global profile
    const base = {
      id: uid,
      name: core?.display_name || 'User',
      avatar: core?.avatar || '',
    }
    await setDocument(config.collectionName, uid, { ...base, ...profile })

    // Tenant mirror (optional)
    if (role === 'tenant' && appId) {
      await setDocument(`apps/${appId}/${config.collectionName}`, uid, {
        ...base,
        ...profile,
      })
    }

    return 'success' as const
  }

  return { ensure }
}
```

4. User pre‑requisite

- File: `packages/core/fireux-core/src/runtime/composables/firestore/user/useUserEnsure.ts`
- Purpose:
  - On auth, ensures a `core-users/{uid}` document exists.
  - In tenant apps, ensures an app user doc exists: `apps/{appId}/users/{uid}`.
  - Profile creation assumes these identities are already ensured by auth flow (`useAuth` calls `ensureUser`).

Contents:

```ts
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreCreate } from '../useFirestoreCreate'
import type { CoreUserDoc, AppUserDoc } from '../../../models/core/user.model'
import { useMediaStorage } from '../../firebase/useMediaStorage'

export function useUserEnsure() {
  const authRef = useCurrentUser()
  const { appId, role } = useFireUXConfig()
  const { setDocument } = useFirestoreCreate()
  const { uploadCoreAvatar, getDefaultAvatarUrl } = useMediaStorage()
  const isTenant = role === 'tenant'

  /**
   * Ensure core-users/{uid} exists and return the avatar URL we stored.
   * - Uploads the avatar to Firebase Storage:
   *   - uses auth.photoURL if present, otherwise a default image
   * - Stamps created_at/updated_at via setDocument()
   */
  async function ensureCoreUser(): Promise<string | undefined> {
    const auth = authRef.value
    if (!auth?.uid || !auth?.email) return

    // Upload avatar to Storage, always producing a canonical URL we control.
    const avatarSource = auth.photoURL || getDefaultAvatarUrl()
    let avatarUrl: string | undefined
    try {
      avatarUrl = await uploadCoreAvatar(avatarSource, auth.uid)
    } catch (e) {
      console.warn(
        '[useUserEnsure] Avatar upload failed, falling back to default URL:',
        e
      )
      avatarUrl = getDefaultAvatarUrl()
    }

    const payload: Partial<CoreUserDoc> = {
      id: auth.uid,
      email: auth.email,
      display_name: auth.displayName || 'New User',
      avatar: avatarUrl,
    }

    await setDocument('core-users', auth.uid, payload)
    return avatarUrl
  }

  /**
   * Ensure apps/{appId}/users/{uid} exists (tenant only).
   * - Mirrors display_name + avatar (uses the core avatar URL we just created).
   * - Role defaults to "user".
   */
  async function ensureAppUser(coreAvatarUrl?: string) {
    if (!isTenant || !appId) return
    const auth = authRef.value
    if (!auth?.uid) return

    const payload: Partial<AppUserDoc> & Record<string, any> = {
      id: auth.uid,
      role: 'user',
      display_name: auth.displayName || 'New User',
      avatar: coreAvatarUrl || getDefaultAvatarUrl(),
    }

    await setDocument(`apps/${appId}/users`, auth.uid, payload)
  }

  /**
   * Public entry: ensure core user, then (if tenant) ensure app user.
   */
  async function ensureUser() {
    const avatarUrl = await ensureCoreUser()
    await ensureAppUser(avatarUrl)
  }

  return { ensureUser }
}
```

## Typical call flow

- User signs in → `useAuth.postProcessAuth` invokes `useUserEnsure().ensureUser()`.
- On Chefs index CTA click:
  - Resolve `chefConfig` (from tenant model), then call `useProfileCreate(chefConfig).ensure(partialPayload)`.
  - `ensure` resolves current user via `useUser()`, constructs base `{ id, display_name, avatar }` from `user.core`, and writes documents.

## Cross‑links

- `packages/core/fireux-core/src/runtime/models/profiles/profile.model.ts` — defines `ProfileConfig` with optional `ctaTitle`/`ctaDescription`.
- `packages/core/fireux-core/src/runtime/composables/firestore/useFirestoreCreate.ts` — provides `setDocument` with stamping.
- `packages/core/fireux-core/src/runtime/composables/firestore/user/useUser.ts` — unified view of `core` and `app` user docs.

## Notes

- If older code references `useCoreUser`/`useAppUser`, prefer migrating to `useUser`.
- For profile deletion, see `useProfileDelete.ts` which now also uses `useUser` and `useFirestoreUpdate` to update `app_profiles` when present.
