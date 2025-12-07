# Firestore Core – Current Fetch & Ensure Contract (2025-11)

This page documents the minimal, stable surface we’re shipping for Firestore core composables. It’s intentionally small so domains (Chef, Supplier, Professional, Agent) can sit cleanly on top.

---

## TL;DR

- **User**
  - `useUser()` → returns one reactive user (core-only).
  - Tenant overlay (`appUser`) is fetched by `useUserFetch` but not merged by `useUser()`.
- **Profiles (Chef/Supplier/Professional/Agent)**
  - `useProfile(config)` → returns grouped refs `{ coreProfile, appProfile }` plus pending state.
  - Overlays stay separate by default; `state/useProfileComputed.ts` can merge them when domains want one object.
  - Shared mutations live in `mutations/useProfileUpdate.ts`; domains can import the helper instead of rolling their own patchers.
- **Ensure**
  - Core ensure lives at `profiles/core/useProfileEnsure.ts`.
  - Domains expose create facades that call ensure and (optionally) add domain flags/props.

---

## Pill Protocol (unchanged)

Use the generic Pill component for UI. It accepts a small, shared prop shape (`avatar`, `title`, `subtitle`, `badges`, `to`). Domains can map their data to it, but don’t bake domain logic into the component.

---

## User API

`useUserFetch(id)`

- Fetches:
  - `users/{id}` → user
  - `apps/{appId}/users/{id}` when tenant → `appUser`
- Returns both raw refs for flexibility: `{ user, appUser }`

`useUser()`

- Public entry point.
- Returns one reactive object: `user` (core-only).
- Keeps extra helpers (computed/ensure/update/delete) colocated, but these are not part of this doc’s minimal surface.

Example:

```ts
// packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/useUser.ts
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth.ts'
import { useUserFetch } from './main/useUserFetch.ts'

export function useUser() {
  const { uid } = useAuth()
  const { user } = useUserFetch(uid)
  return { user }
}
```

---

## Profile API

Profiles are driven by a tiny `ProfileConfig`:

```ts
// packages/core/fireux-core/src/runtime/models/core/profile.model.ts
export interface ProfileConfig {
  id: string // 'chef' | 'supplier' | 'professional' | 'agent'
  collectionName: string // e.g. 'chefs'
  profileType: string // Human label: 'Chef'
  cta?: string
}
```

`useProfileFetch(id, { collectionName })`

- Always fetches core: `/{collectionName}/{id}`
- If tenant context is active, also fetches overlay: `/apps/{appId}/{collectionName}/{id}`
- Returns grouped refs `{ coreProfile, appProfile }`; no merging at the fetch layer.

```ts
// packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/main/useProfileFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import type { Ref } from 'vue'
import type { Profile } from 'fireux-core/runtime/models/core/profile.model.ts'

export type ProfileRefs<TProfile extends Profile = Profile> = {
  coreProfile: Ref<TProfile | undefined | null>
  appProfile: Ref<Partial<TProfile> | undefined | null>
}

export function useProfileFetch<TProfile extends Profile = Profile>(
  id: string | null | undefined,
  options: { collectionName: string }
) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const { data: coreProfile } = useDocument<TProfile | undefined>(
    id ? (doc(db, options.collectionName, id) as any) : null
  )

  const { data: appProfile } = useDocument<Partial<TProfile> | undefined>(
    id && isTenant && appId
      ? (doc(db, 'apps', appId, options.collectionName, id) as any)
      : null
  )

  const profile: ProfileRefs<TProfile> = { coreProfile, appProfile }
  return { profile }
}
```

`useProfileComputed(profileRefs)`

- Optional helper that merges `{ coreProfile, appProfile }` into a single object.
- No implicit user attachments; callers can still layer on pills/cards as needed.

```ts
// packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/state/useProfileComputed.ts
import { computed } from 'vue'
import type { Profile } from 'fireux-core/runtime/models/core/profile.model.ts'
import type { ProfileRefs } from '../main/useProfileFetch.ts'

export function useProfileComputed<TProfile extends Profile = Profile>(
  profileRefs: ProfileRefs<TProfile>
) {
  const profile = computed<TProfile | null>(() => {
    const core = profileRefs.coreProfile.value
    const overlay = profileRefs.appProfile.value
    if (!core && !overlay) return null

    const base = core ? { ...core } : ({} as Partial<TProfile>)
    if (overlay) Object.assign(base, overlay)
    return base as TProfile
  })

  return { profile }
}
```

`useProfileUpdate(profileRefs, config)`

- Shared mutation helper that writes either the core document or the tenant overlay.
- Resolves the profile id from refs when one isn’t supplied, so domain buttons can stay lean.

```ts
// packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdate.ts
import { ref } from 'vue'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import type { ProfileRefs } from '../main/useProfileFetch.ts'

type UpdateScope = 'auto' | 'core' | 'app'

export function useProfileUpdate<TProfile extends Profile = Profile>(
  profileRefs: ProfileRefs<TProfile>,
  config: ProfileConfig
) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId, role } = useFireUXConfig()

  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  const ensureId = (explicit?: string | null) => {
    const trimmed = explicit?.trim()
    if (trimmed) return trimmed
    return (
      profileRefs.coreProfile.value?.id ??
      (profileRefs.appProfile.value as { id?: string } | null)?.id ??
      (() => {
        throw new Error(
          `[useProfileUpdate] Missing profile id for ${config.collectionName}`
        )
      })()
    )
  }

  const updateProfile = async (
    partial: Partial<TProfile>,
    options: { scope?: UpdateScope; id?: string } = {}
  ) => {
    const { scope = 'auto', id } = options
    const resolvedId = ensureId(id)

    updating.value = true
    updateError.value = null

    try {
      if (scope === 'core' || (scope === 'auto' && role !== 'tenant')) {
        await updateDocument(config.collectionName, resolvedId, partial)
      } else {
        if (!appId) {
          throw new Error('[useProfileUpdate] Missing appId for tenant scope')
        }
        await updateDocument(
          `apps/${appId}/${config.collectionName}`,
          resolvedId,
          partial
        )
      }
      return 'success'
    } catch (error) {
      updateError.value = error as Error
      throw error
    } finally {
      updating.value = false
    }
  }

  return { updateProfile, updating, updateError }
}
```

`useProfile(config)`

- Minimal public entry point.
- Returns `{ profile, pending }`, where `profile` is the grouped refs object from `useProfileFetch`.

```ts
// packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/useProfile.ts
import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
import type {
  Profile,
  ProfileConfig,
} from '../../../../models/core/profile.model.ts'

export function useProfile<TProfile extends Profile = Profile>(
  config: ProfileConfig
) {
  const { uid } = useAuth()
  const { profile, pending } = useProfileFetch<TProfile>(uid, config)

  return { profile, pending }
}
```

---

## Ensure vs Create

- **Core ensure** (`profiles/core/useProfileEnsure.ts`):
  - Creates core doc if missing.
  - If in tenant context, creates overlay doc if missing.
  - Does not overwrite existing docs.
  - Can add a simple domain marker when invoked by domains.
- **Domain create** (tenants/extensions):
  - Wraps core ensure and passes minimal domain payload (e.g., `{ domain: 'professional' }`).
  - No extra fields required right now—kept intentionally lean.

---

## What We’ve Explicitly Avoided (for now)

- Merging tenant overlay fields into core.
- Profile-level computed and update composables.
- `isRef` ceremony and over-generic fetch signatures in the public surface.
- Spreading UI-mapping logic (like pills) into core.

---

## Why This Shape?

- Keeps core predictable and domain-agnostic.
- Domains get clear extension points (create, validation, lists) without fighting the base layer.
- UI stays in control: it decides whether to show/ignore overlays, and how to build card/pill shapes.

---

If you need to enrich pills/cells, do it in domain UI/composables by reading user (for avatar/display_name) and profile (for role/specialties/etc.), then map to your `Pill.Props`.

---

That’s it—clean, consistent, and easy to extend.
