---
title: Minimal Profile Creation Flow (v1)
status: draft
updated: 2025-09-16
---

# Minimal Profile Creation Flow — quick look

This page mirrors exactly what you see in the console when you press a Create button. Keep it simple: read top-to-bottom and compare to your logs.

## What just happened (your sample)

Input (global role, Chef):

```
[CTA/Chef] Click createChef
[useChefCreate] creating profile [chef] (minimal)
Object { payload: {}, overrides: {…} }
[ensureProfile] type=chef role=global appId=misebox-app uid=vPeLJyKkuVZxOI3M6rbsArXKiZD2
[ensureProfile] global: check path=chefs/vPeLJyKkuVZxOI3M6rbsArXKiZD2 exists=true
[ensureProfile] global: exists path=chefs/vPeLJyKkuVZxOI3M6rbsArXKiZD2 (skip write)
[ensureProfile] role=global no mirror, success in 3ms
[useChefCreate] created profile [chef] success
```

Reading it:

- Click happened; minimal create started.
- We’re in role=global (no tenant mirror work).
- Global doc already exists at `chefs/{uid}` so we skip writing.
- Done in 3ms; success.

## Minimal legend

- type, role, appId, uid — who/where this run is for
- global: check — does the global doc exist?
- global: write — only if missing; minimal fields only (name/avatar if available)
- role=global no mirror — no tenant mirror is attempted in global role
- tenant: … / mirror: … — you’ll only see these lines when role=tenant

## Two tiny examples

1. Global (no mirror)

```
[ensureProfile] type=supplier role=global appId=- uid=abc123
[ensureProfile] global: check path=suppliers/abc123 exists=false
[ensureProfile] global: write path=suppliers/abc123 keys=3 name?=true avatar?=false
[ensureProfile] role=global no mirror, success in 12ms
```

2. Tenant (AppUser + mirror)

```
[ensureProfile] type=chef role=tenant appId=app_42 uid=abc123
[ensureProfile] global: check path=chefs/abc123 exists=true
[ensureProfile] tenant: ensure AppUser start appId=app_42 uid=abc123
[ensureProfile] tenant: AppUser ensured appId=app_42
[ensureProfile] tenant: profiles updated added?=true total=1
[ensureProfile] mirror: write path=apps/app_42/chefs/abc123 keys=3 name?=true avatar?=true
[ensureProfile] success in 75ms
```

## Where this logic lives

- Core ensure: `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts`
- Chef create: `packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts`
- Other profiles: similar paths under Supplier/Employer/Professional

## Quick tips

- No tenant lines? You’re in role=global — that’s expected.
- `exists` true? Nothing to write; creation is idempotent.
- Missing name/avatar flags are fine; we only write what’s present.

## Chef profile creation flow — source files (verbatim)

Below are the five files in this flow, shown exactly as they are in the repo for quick reference.

1. UI entry — `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue`

```vue
<template>
  <div class="profile-cta">
    <p>You’re in {{ tenancyDisplay }}</p>

    <!-- Ecosystem profile -->
    <OrganismsProfilesChefCardsCell
      v-if="ecosystemProfile"
      :chef="ecosystemProfile"
    />
    <p v-else>❌ You don’t have a global Chef profile yet.</p>

    <!-- App profile (only if tenant) -->
    <template v-if="appTenancy === 'tenant'">
      <OrganismsProfilesChefCardsCell v-if="appProfile" :chef="appProfile" />
      <p v-else>❌ You are not a Chef in this app.</p>
    </template>

    <!-- Single CTA button -->
    <div class="cta-buttons">
      <UButton
        v-if="!ecosystemProfile || !appProfile"
        size="lg"
        color="primary"
        :loading="creating"
        :disabled="creating"
        @click="onEnsure"
      >
        {{
          !ecosystemProfile
            ? 'Create Chef Profile'
            : 'Add to ' + tenancyDisplay + ' Chefs'
        }}
      </UButton>
      <p v-if="createError" class="text-red-600 text-sm mt-2">
        {{ createError.message || createError }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { chefConfig } from '../../../../models/profiles/Chef.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useChefCreate } from '../../../../composables/firestore/profiles/Chef/useChefCreate'

const { tenancyDisplay, appTenancy } = useApp()
// Read current profiles via unified profile composable
const { ecosystemProfile, appProfile } = useProfile(chefConfig) as any
// Use minimal creation flow for consistent logging and behavior
const { createChef, creating, error: createError } = useChefCreate()

async function onEnsure() {
  try {
    console.log('[CTA/Chef] Click createChef')
    await createChef()
  } catch (e) {
    // Swallow; createError ref will display
    console.error('[CTA] ensureProfile failed', e)
  }
}
</script>
```

2. Domain wrapper — `packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts`

```ts
// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts
import { ref } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { chefConfig } from '../../../../models/profiles/Chef.model'

export function useChefCreate() {
  const creating = ref(false)
  const error = ref<Error | null>(null)
  // Resolve once during component setup to keep inject() within setup context
  const { createProfile } = useProfile(chefConfig)

  const createChef = async (
    chefData: {
      name?: string
      avatar?: string
    } = {}
  ): Promise<'success'> => {
    const nameOverride =
      typeof chefData.name === 'string' && chefData.name.trim() !== ''
    const avatarOverride =
      typeof chefData.avatar === 'string' && chefData.avatar.trim() !== ''
    console.log('[useChefCreate] creating profile [chef] (minimal)', {
      payload: chefData,
      overrides: { name: nameOverride, avatar: avatarOverride },
    })
    creating.value = true
    error.value = null
    try {
      await createProfile(chefData)
      console.log('[useChefCreate] created profile [chef] success')
      return 'success'
    } catch (err: unknown) {
      const e =
        err instanceof Error ? err : new Error('Failed to create chef profile')
      error.value = e
      console.error('[useChefCreate] failed creating profile [chef]', e)
      throw e
    } finally {
      creating.value = false
    }
  }

  return { createChef, creating, error }
}
```

3. Generic profile entrypoint — `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfile.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfile.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreRead } from '../useFirestoreRead'
import { useProfileCreate } from './useProfileCreate'
import { useProfileDelete } from './useProfileDelete'
import { useApp } from '../../app/useApp'

/**
 * Unified entry-point for profiles.
 *
 * Exposes:
 * - current.global       → ALWAYS the ecosystem doc
 * - current.appMirror    → app doc iff role === 'tenant', else null
 * - collection.local     → app list iff role === 'tenant', else null
 * - collection.global    → ecosystem list iff role === 'global'; in tenant null until fetchGlobal()
 * - collection.fetchGlobal() → lazy loader for collection.global (tenant only; no-op in global)
 * - fetchById(id)        → get a single GLOBAL doc (simple version)
 * - ...create, ...remove, ...update → CRUD spreads
 */
export function useProfile(config: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()

  // Tenancy from useApp()
  const { role, appId } = useApp()
  const isGlobal = computed(() => role === 'global')

  // Firestore helpers
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()
  type ColRef = ReturnType<typeof firestoreFetchCollection> // Ref<any[] | undefined>

  const uid = computed(() => currentUser.value?.uid || null)

  // ---------- CURRENT ----------
  const currentGlobalRef = computed(() =>
    uid.value ? doc(db, config.collectionName, uid.value) : null
  )
  const { data: currentGlobal } = useDocument(currentGlobalRef)

  const currentAppRef = computed(() =>
    uid.value && role === 'tenant' && appId
      ? doc(db, 'apps', appId, config.collectionName, uid.value)
      : null
  )
  const { data: currentAppMirror } = useDocument(currentAppRef)

  // ---------- COLLECTION ----------
  const GLOBAL_PATH = config.collectionName

  // Local: auto in tenant, else null
  const collectionLocal: ColRef | null =
    role === 'tenant' && appId
      ? firestoreFetchCollection(`apps/${appId}/${config.collectionName}`)
      : null

  // Global: auto in global app; tenant starts null (lazy)
  let collectionGlobal: ColRef | null = isGlobal.value
    ? firestoreFetchCollection(GLOBAL_PATH)
    : null

  function fetchGlobal(): ColRef | null {
    if (isGlobal.value) return collectionGlobal
    // Tenant: lazy-load once (nullish coalescing assignment for clarity)
    collectionGlobal ??= firestoreFetchCollection(GLOBAL_PATH)
    return collectionGlobal
  }

  // ---------- Helpers ----------
  const fetchById = (id: string) => firestoreFetchDoc(config.collectionName, id)

  // ---------- CRUD ----------
  const create = useProfileCreate(config) as any
  const remove = useProfileDelete(config) as any
  const update = config.updateComposable ? config.updateComposable() : {}

  return {
    current: {
      global: currentGlobal,
      appMirror: currentAppMirror ?? null,
    },
    collection: {
      local: collectionLocal, // Ref<any[] | undefined> | null
      global: collectionGlobal, // Ref<any[] | undefined> | null
      fetchGlobal, // () => Ref<any[] | undefined> | null
    },
    fetchById,
    ...create,
    ...remove,
    ...update,
  }
}
```

4. Core creator (single source of truth) — `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts
import { ref } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreRead } from '../useFirestoreRead'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { useAppUser } from '../AppUser/useAppUser'
import { useAppUserEnsure } from '../AppUser/useAppUserEnsure'
import useAppUserUpdate from '../AppUser/useAppUserUpdate'
import { useFireUXConfig } from '../../FireUXConfig'
import { useCoreUser } from '../../firestore/CoreUser/useCoreUser'

/**
 * Public API: ensureProfile()
 * - Always ensures the ecosystem (global) profile doc exists
 * - If tenancy === 'tennant': also ensures AppUser + app membership + app mirror doc
 * - If tenancy === 'king': stops after global doc (no app writes)
 */
export function useProfileCreate(config: ProfileConfig) {
  // Capture dependencies at composable invocation (component setup) time
  const currentUser = useCurrentUser()
  // Resolve Firestore helpers at setup-time to keep inject() usage valid
  const { firestoreFetchDoc } = useFirestoreRead()
  const { setDocument } = useFirestoreCreate()
  const { appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { coreUser } = useCoreUser()
  // App user helpers (captured once)
  const { ensureAppUser } = useAppUserEnsure()
  const { appUser } = useAppUser()
  const { useAppUserUpdateFirestore } = useAppUserUpdate()
  const { updateProfiles } = useAppUserUpdateFirestore()

  const creating = ref(false)
  const createError = ref<Error | null>(null)

  // Remove undefined, null, empty string, empty array, and empty object props
  function cleanObject<T extends Record<string, any>>(obj?: T): Partial<T> {
    const out: Record<string, any> = {}
    if (!obj) return {} as Partial<T>
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null) continue
      if (typeof v === 'string' && v.trim() === '') continue
      if (Array.isArray(v) && v.length === 0) continue
      if (
        typeof v === 'object' &&
        !Array.isArray(v) &&
        Object.keys(v).length === 0
      )
        continue
      out[k] = v
    }
    return out as Partial<T>
  }

  // Compute minimal display name once per ensure call (prefer CoreUser)
  function computeNameOnce(
    additionalData: Record<string, any> | undefined
  ): string | undefined {
    if (typeof additionalData?.name === 'string' && additionalData.name)
      return additionalData.name
    if (coreUser.value?.display_name) return coreUser.value.display_name
    if (currentUser.value?.displayName) return currentUser.value.displayName
    if (currentUser.value?.email) return currentUser.value.email.split('@')[0]
    return undefined
  }

  async function createGlobalDoc(uid: string, payload: Record<string, any>) {
    await setDocument(config.collectionName, uid, payload, {
      appScoped: false,
      raw: true,
    })
  }

  async function ensureTenantArtifacts(
    uid: string,
    payload: Record<string, any>
  ) {
    if (!appId) return

    console.log(
      '[ensureProfile] tenant: ensure AppUser start appId=%s uid=%s',
      appId,
      uid
    )
    // Ensure AppUser exists
    await ensureAppUser()
    console.log('[ensureProfile] tenant: AppUser ensured appId=%s', appId)

    // Ensure AppUser.profiles has this profile type
    const current = appUser.value?.profiles || []
    const entry = {
      type: config.id,
      collection: config.collectionName,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    const hasEntry = current.some((p: any) => p.type === entry.type)
    if (!hasEntry) {
      await updateProfiles([...current, entry])
      console.log(
        '[ensureProfile] tenant: profiles updated added?=%s total=%d',
        !hasEntry,
        current.length + 1
      )
    } else {
      console.log(
        '[ensureProfile] tenant: profiles already contain type=%s total=%d',
        entry.type,
        current.length
      )
    }

    // Minimal tenant mirror doc
    const mirrorPath = `apps/${appId}/${config.collectionName}`
    console.log(
      '[ensureProfile] mirror: write path=%s/%s keys=%d name?=%s avatar?=%s',
      mirrorPath,
      uid,
      Object.keys(payload || {}).length,
      String(!!payload?.name),
      String(!!payload?.avatar)
    )
    await setDocument(mirrorPath, uid, payload, {
      appScoped: true,
      raw: true,
    })
  }

  async function ensureProfile(additionalData?: Record<string, any>) {
    const t0 = Date.now()
    console.log(
      '[ensureProfile] type=%s role=%s appId=%s uid=%s',
      config.id,
      role,
      appId || '-',
      currentUser.value?.uid
    )

    const uid = currentUser.value?.uid
    if (!uid) throw new Error('User is not authenticated')

    creating.value = true
    createError.value = null

    try {
      // --- 1) Ensure ecosystem/global profile doc ---
      const globalPath = `${config.collectionName}/${uid}`
      const existsRef = firestoreFetchDoc(config.collectionName, uid)
      console.log(
        '[ensureProfile] global: check path=%s exists=%s',
        globalPath,
        String(!!existsRef?.value)
      )
      if (!existsRef?.value) {
        const base = {
          id: uid,
          avatar:
            (additionalData?.avatar as string | undefined) ??
            coreUser.value?.avatar ??
            null,
          name: computeNameOnce(additionalData) ?? null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }
        const payload = cleanObject(base)
        console.log(
          '[ensureProfile] global: write path=%s keys=%d name?=%s avatar?=%s',
          globalPath,
          Object.keys(payload || {}).length,
          String(!!payload?.name),
          String(!!payload?.avatar)
        )
        await createGlobalDoc(uid, payload)
      } else {
        console.log(
          '[ensureProfile] global: exists path=%s (skip write)',
          globalPath
        )
      }

      // --- 2) If not a tenant app, we’re done (king shouldn’t touch app docs) ---
      if (!isTenant) {
        console.log(
          '[ensureProfile] role=global no mirror, success in %dms',
          Date.now() - t0
        )
        return 'success' as const
      }

      // --- 3) Optional app “mirror” doc (shallow) ---
      if (isTenant) {
        const base = {
          id: uid,
          avatar:
            (additionalData?.avatar as string | undefined) ??
            coreUser.value?.avatar ??
            null,
          name: computeNameOnce(additionalData) ?? null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }
        const mirrorPayload = cleanObject(base)
        await ensureTenantArtifacts(uid, mirrorPayload)
      }

      console.log('[ensureProfile] success in %dms', Date.now() - t0)
      return 'success' as const
    } catch (err: any) {
      createError.value =
        err instanceof Error
          ? err
          : new Error(
              err?.message || `Failed to ensure ${config.profileType} profile`
            )
      console.error('[ensureProfile] error:', createError.value)
      throw createError.value
    } finally {
      creating.value = false
    }
  }

  return {
    createProfile: ensureProfile,
    ensureProfile,
    creating,
    createError,
  }
}
```

5. Config/model — `packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts`

```ts
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'

/** Global doc: chefs/{uid} */
export interface ChefCoreProfile extends ProfileBase {
  // Canonical
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
  available?: boolean
  gallery?: Array<{ name?: string; image_url: string }>

  // Legacy fields (read-only back-compat; prefer canonical)
  chef_name?: string
  bio_short?: string
  bio_long?: string
  cuisine_expertise?: string[]
  available_for_hire?: boolean
}

/** App mirror: apps/{appId}/chefs/{uid} */
export interface ChefAppProfile extends ProfileBase {
  // Canonical
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]

  // Legacy back-compat
  chef_name?: string
  bio_short?: string
}

/** UI views */
export interface ChefPillProps {
  id: string
  name: string
  avatarUrl: string | null
  title?: string | null
}
export interface ChefCellProps extends ChefPillProps {
  bioShort?: string | null
  specialties?: string[]
}
export interface ChefProfileProps extends ChefCellProps {
  bioLong?: string | null
  available?: boolean
  gallery?: Array<{ name?: string; image_url: string }>
}

/** Validation + Config */
export function validateChefProfile(p: Partial<ChefCoreProfile>): boolean {
  return !!(p?.name || p?.chef_name)
}

export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  color: 'orange',
  validationFn: validateChefProfile,
  requiredFields: ['name'],
  searchableFields: ['name', 'specialties', 'cuisine_expertise'],
  defaultValues: {
    title: null,
    bioShort: null,
    bioLong: null,
    specialties: [],
    available: false,
  },
} as const

/** Input / Update */
export type ChefInput = Omit<
  ChefCoreProfile,
  'id' | 'created_at' | 'updated_at'
>
export type ChefUpdate = Partial<ChefInput>
```
