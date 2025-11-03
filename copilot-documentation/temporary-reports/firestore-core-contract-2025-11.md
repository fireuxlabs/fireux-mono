# Firestore Core – Current Fetch & Ensure Contract (2025-11)

This page documents the minimal, stable surface we’re shipping for Firestore core composables. It’s intentionally small so domains (Chef, Supplier, Professional, Employer) can sit cleanly on top.

---

## TL;DR

- **User**
  - `useUser()` → returns one reactive user (core-only).
  - Tenant overlay (`appUser`) is fetched by `useUserFetch` but not merged by `useUser()`.
- **Profiles (Chef/Supplier/Professional/Employer)**
  - `useProfile(config)` → returns one reactive profile.
  - If in tenant context, the profile includes app overlay as `profile.app` (no field merges into core).
  - No profile computed/update layers; `useProfileComputed.ts` and `useProfileUpdate.ts` are not part of the public surface.
- **Ensure**
  - Core ensure lives at `profiles/main/useProfileEnsure.ts`.
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
// packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUser.ts
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
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
  id: string                  // 'chef' | 'supplier' | 'professional' | 'employer'
  collectionName: string      // e.g. 'chefs'
  profileType: string         // Human label: 'Chef'
  cta?: string
}
```

`useProfileFetch(id, { collectionName })`

- Always fetches core: `/{collectionName}/{id}`
- If tenant context is active, also fetches overlay: `/apps/{appId}/{collectionName}/{id}`
- Returns one computed profile:
  - Contents are the core profile fields, plus an app property when overlay exists.
  - No field merging into core; the overlay stays namespaced under `app`.

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/core/profile/main/useProfileFetch.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { ProfileBase } from 'fireux-core/runtime/models/core/profile.model.ts'

interface UseProfileFetchOptions { collectionName: string }

export function useProfileFetch<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(id: string, options: UseProfileFetchOptions) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const { data: core } = useDocument<TCore>(
    id ? (doc(db, options.collectionName, id) as any) : null
  )

  const { data: app } = useDocument<TApp>(
    id && isTenant && appId
      ? (doc(db, 'apps', appId, options.collectionName, id) as any)
      : null
  )

  const profile = computed<(TCore & { app?: TApp | null }) | null>(() => {
    const base = core.value
    if (!base) return null
    return { ...base, app: app.value ?? null }
  })

  return { profile }
}
```

`useProfile(config)`

- Public entry point for any profile domain.
- Returns one reactive profile as above.

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/core/profile/useProfile.ts
import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
import type { ProfileConfig, ProfileBase } from '../../../../models/core/profile.model.ts'

export function useProfile<T extends ProfileBase = ProfileBase>(config: ProfileConfig) {
  const { uid } = useAuth()
  const { profile } = useProfileFetch<T>(uid.value || '', { collectionName: config.collectionName })
  return { profile }
}
```

---

## Ensure vs Create

- **Core ensure** (`profiles/main/useProfileEnsure.ts`):
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
