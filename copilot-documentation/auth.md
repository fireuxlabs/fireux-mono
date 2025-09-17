# Auth System Reference

This document catalogs the authentication and user-membership system in the FireUX mono-repo. It includes:
- Firebase client initialization (VueFire owns Auth)
- CoreUser (global identity) composables
- AppUser (per-app membership) composables
- Profile creation baseline (uses CoreUser seeds)
- UI helpers (CTAs)

Notes:
- Per ADR-0003, VueFire initializes Auth. Do not initialize Auth in custom plugins.
- Use VueFire composables synchronously in setup; avoid `await` before calling them (see `copilot-documentation/sysncronisty.md`).

---

## Firebase client plugin

File: `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts`

```ts
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseOptions,
} from 'firebase/app'

// Minimal Firebase app initializer.
// VueFire handles auth; do not initialize or touch auth here.
export default defineNuxtPlugin(() => {
  const {
    public: { firebaseConfig },
  } = useRuntimeConfig()

  // HMR-safe: only initialize if no app exists; otherwise ensure default app is accessible
  const devLog = (...args: any[]) => {
    if (import.meta.dev) console.log('[fireux-core/firebase]', ...args)
  }

  const start = performance.now()
  if (import.meta.dev) {
    const { projectId, appId } = (firebaseConfig || {}) as any
    devLog('plugin start', {
      existingApps: getApps().length,
      projectId,
      appId,
      hasConfig: !!firebaseConfig,
    })
  }

  // Basic completeness check so developers immediately see if they forgot to paste values.
  function ensureConfigCompleteness(cfg: any) {
    if (!cfg) return
    const required = ['apiKey', 'authDomain', 'projectId', 'appId']
    const missing = required.filter(
      (k) => !cfg[k] || String(cfg[k]).trim() === ''
    )
    if (missing.length) {
      devLog('CONFIG INCOMPLETE', {
        missing,
        message:
          'One or more required Firebase config fields are empty. Paste the full web app snippet into your FIREBASE_* env vars.',
      })
    }
  }

  // Lightweight coherence validation to catch mixed project credentials
  function validateConfig(cfg: any) {
    if (!cfg) return
    const { projectId, authDomain, storageBucket } = cfg
    const problems: string[] = []
    if (projectId && authDomain && !authDomain.startsWith(projectId)) {
      problems.push(
        `authDomain (${authDomain}) does not start with projectId (${projectId})`
      )
    }
    if (projectId && storageBucket && !storageBucket.startsWith(projectId)) {
      problems.push(
        `storageBucket (${storageBucket}) does not start with projectId (${projectId})`
      )
    }
    if (problems.length) {
      devLog('CONFIG MISMATCH DETECTED', { problems })
      // Provide a focused hint for common copy/paste mixups
      devLog(
        'Hint: Ensure ALL FIREBASE_* vars come from the SAME copied web app snippet in Firebase console.'
      )
    }

    // Extra heuristic: apiKey reuse across differing projectId patterns.
    // If apiKey present but authDomain or storageBucket refer to a *different* prefix, warn.
    // (Developers sometimes paste a new projectId but forget to swap apiKey/appId.)
    const apiKey = cfg.apiKey
    if (apiKey && projectId && authDomain && !authDomain.includes(projectId)) {
      devLog('POSSIBLE_CREDENTIAL_DRIFT', {
        message:
          'authDomain does not include projectId. This often indicates a mixed credential set (apiKey/appId from another project).',
        projectId,
        authDomain,
      })
    }
    const appId = cfg.appId
    if (appId && projectId && /[a-z0-9-]+/.test(projectId)) {
      // appId structure: 1:<senderId>:web:<hash>. Cannot easily encode projectId, so just surface for visual pairing.
      devLog('firebaseAppIdInfo', {
        appIdFragment: appId.split(':').slice(0, 3).join(':'),
        fullAppId: appId,
      })
    }
  }
  if (import.meta.dev) {
    ensureConfigCompleteness(firebaseConfig)
    validateConfig(firebaseConfig)
  }

  if (!getApps().length) {
    try {
      initializeApp(firebaseConfig as FirebaseOptions)
      devLog('initialized new Firebase app')
    } catch (e) {
      devLog('initializeApp failed', e)
      throw e
    }
  } else {
    try {
      const app = getApp()
      devLog('re-using existing Firebase app', { name: app.name })
    } catch (e) {
      devLog('getApp failed unexpectedly', e)
    }
  }

  // Expose for in-browser debugging (non-production only)
  if (import.meta.dev && typeof window !== 'undefined') {
    try {
      // @ts-ignore Debug handle
      window.__fireuxFirebaseApp = getApp()
      devLog('attached app to window.__fireuxFirebaseApp')
    } catch (e) {
      devLog('failed attaching app to window', e)
    }
  }

  devLog('plugin end', { ms: Math.round(performance.now() - start) })
})
```

---

## CoreUser (global identity)

### useCoreUser()
File: `packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUser.ts`

```ts
// ~/composables/firestore/CoreUser/useCoreUser.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useDocument, useCurrentUser, useFirestore } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../useFirestoreManager'
import { useCoreUserEnsure } from './useCoreUserEnsure'
import { useCoreUserUpdate } from './useCoreUserUpdate'
import { useCoreUserDelete } from './useCoreUserDelete'
import { useCoreUserComputed } from './useCoreUserComputed'
import type { CoreUser } from '../../../models/core/coreUser.model'
import { getApps } from 'firebase/app'

export function useCoreUser() {
  // Ensure Firebase is initialized
  if (!getApps().length) {
    throw new Error(
      'Firebase is not initialized. Please initialize Firebase before using this composable.'
    )
  }

  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection } = useFirestoreManager()

  const coreUserDocRef = computed<DocumentReference<CoreUser> | null>(() =>
    currentUser.value
      ? (doc(
          db,
          'core-users',
          currentUser.value.uid
        ) as DocumentReference<CoreUser>)
      : null
  )

  const { data: coreUser } = useDocument<CoreUser>(coreUserDocRef)

  // Collections - fetch all core users (sync via Ref)
  const coreUsers = firestoreFetchCollection<CoreUser>('core-users')

  return {
    // Current entity
    coreUser,

    // Collections
    coreUsers,

    // Child functions
    ...useCoreUserEnsure(),
    ...useCoreUserUpdate(),
    ...useCoreUserDelete(),
    ...useCoreUserComputed(coreUser),
  }
}
```

### useCoreUserEnsure()
File: `packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUserEnsure.ts`

```ts
import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import type { CoreUser } from '../../../models/core/coreUser.model'
import { useMediaStorage } from '../../firebase/useMediaStorage'

// packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUserEnsure.ts
// Simple, core-only ensure. No seeds, no membership, no profiles.
export function useCoreUserEnsure() {
  const db = useFirestore()
  const authUserRef = useCurrentUser()

  async function ensureCoreUser() {
    const user = authUserRef.value
    if (!user?.uid || !user?.email) return

    const ref = doc(db, 'core-users', user.uid)
    const snap = await getDoc(ref)

    // Prefer existing avatar, then auth photoURL; otherwise upload a default into core namespace
    let avatar: string | undefined =
      (snap.exists() ? (snap.data() as any)?.avatar : undefined) ||
      user.photoURL ||
      undefined

    if (!avatar) {
      try {
        const { uploadCoreAvatar } = useMediaStorage()
        // Use a shipped default asset; can be themed per app/ecosystem
        avatar = await uploadCoreAvatar('/img/default-avatar.png', user.uid)
      } catch (e) {
        console.warn(
          '[CoreUser] Default avatar upload failed, falling back to static path:',
          e
        )
        // Final fallback to a static path; never undefined
        avatar = '/img/default-avatar.png'
      }
    }

    const basePayload: Partial<CoreUser> = {
      id: user.uid,
      email: user.email,
      display_name: user.displayName ?? user.email,
      avatar,
      updated_at: serverTimestamp() as any,
    }

    const payload = snap.exists()
      ? basePayload
      : {
          ...basePayload,
          created_at: serverTimestamp() as any,
        }

    await setDoc(ref, payload, { merge: true })
  }

  return { ensureCoreUser }
}
```

### useCoreUserUpdate()
File: `packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUserUpdate.ts`

```ts
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore'
import { useCurrentUser, useFirestore } from 'vuefire'
import type { CoreUser } from '../../../models/core/coreUser.model'

// tiny validators/formatters
const isUrl = (s: string) => /^https?:\/\//i.test(s) || s.startsWith('/')
const normHandle = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '-')

export function useCoreUserUpdate() {
  const db = useFirestore()
  const authUserRef = useCurrentUser()

  const coreRef = (uid?: string) => {
    const id = uid || authUserRef.value?.uid
    if (!id) throw new Error('No UID available for CoreUser update.')
    return doc(db, 'core-users', id)
  }

  // Strip undefined/null (and empty strings) and always set updated_at
  const safePayload = (
    updates: Partial<CoreUser> | Record<string, unknown>
  ) => {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(updates || {})) {
      if (v === undefined || v === null) continue
      if (typeof v === 'string' && v.trim() === '') continue
      if (k === 'email') continue // immutable here; update via Auth and ensure
      out[k] = v
    }
    out.updated_at = serverTimestamp()
    return out
  }

  async function addUserApp(appId: string, uid?: string) {
    if (!appId) throw new Error('appId required')
    await updateDoc(coreRef(uid), {
      userOf: arrayUnion(appId),
      updated_at: serverTimestamp(),
    })
  }

  async function removeUserApp(appId: string, uid?: string) {
    if (!appId) throw new Error('appId required')
    await updateDoc(coreRef(uid), {
      userOf: arrayRemove(appId),
      updated_at: serverTimestamp(),
    })
  }

  async function addAdminApp(appId: string, uid?: string) {
    if (!appId) throw new Error('appId required')
    await updateDoc(coreRef(uid), {
      adminOf: arrayUnion(appId),
      updated_at: serverTimestamp(),
    })
  }

  async function removeAdminApp(appId: string, uid?: string) {
    if (!appId) throw new Error('appId required')
    await updateDoc(coreRef(uid), {
      adminOf: arrayRemove(appId),
      updated_at: serverTimestamp(),
    })
  }

  async function updateCoreUser(
    updates: Partial<CoreUser> & Record<string, any>,
    uid?: string
  ) {
    // light normalization/validation
    if ('handle' in updates && typeof updates.handle === 'string') {
      updates.handle = normHandle(updates.handle)
    }
    if ('avatar' in updates && typeof updates.avatar === 'string') {
      const url = updates.avatar
      if (!isUrl(url)) throw new Error('Invalid avatar URL')
    }
    await updateDoc(coreRef(uid), safePayload(updates))
  }

  // Convenience helpers
  const setDisplayName = (display_name: string, uid?: string) =>
    updateCoreUser({ display_name }, uid)

  const setAvatar = (avatarUrl: string, uid?: string) =>
    updateCoreUser({ avatar: avatarUrl }, uid)

  const setHandle = (handle: string, uid?: string) =>
    updateCoreUser({ handle }, uid)

  // Optional: profiles (global badges)
  const setProfiles = (profiles: string[], uid?: string) =>
    updateCoreUser({ profiles }, uid)

  return {
    updateCoreUser,
    setDisplayName,
    setAvatar,
    setHandle,
    setProfiles,
    addUserApp,
    removeUserApp,
    addAdminApp,
    removeAdminApp,
  }
}
```

### useCoreUserDelete()
File: `packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUserDelete.ts`

```ts
import { doc, deleteDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

export function useCoreUserDelete() {
  const db = useFirestore()

  async function deleteCoreUser(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('[deleteCoreUser] User ID is required.')
    }

    try {
      await deleteDoc(doc(db, 'users', userId))
      console.log(
        `✅ [deleteCoreUser] Core user with ID ${userId} deleted successfully.`
      )
    } catch (error) {
      console.error(
        `[deleteCoreUser] Error deleting core user with ID ${userId}:`,
        error
      )
      throw error
    }
  }

  return {
    deleteCoreUser,
  }
}
```

---

## AppUser (tenant membership)

### useAppUser()
File: `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser.ts`

```ts
import { ref, computed, type Ref } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFirestoreRead } from '../useFirestoreRead'
import type { AppUser } from '../../../models/core/appUser.model'
import { useAppUserUtils } from './useAppUserUtils'
import { useAppUserEnsure } from './useAppUserEnsure'
import useAppUserUpdate from './useAppUserUpdate'
import { useAppUserSubscription } from './useAppUserSubscription'
import { useAppUserComputed } from './useAppUserComputed'
import { useFireUXConfig } from '../../FireUXConfig'

export function useAppUser() {
  // Get app ID dynamically from runtime config
  const { appId } = useFireUXConfig()

  const db = useFirestore()
  const { firestoreFetchCollection } = useFirestoreRead()

  // Guard useCurrentUser() for SSR/hydration; only access on client
  // useCurrentUser() returns Ref<User | null | undefined>; allow undefined in type to satisfy TS
  const currentUser = (
    import.meta.client
      ? (useCurrentUser() as Ref<{ uid: string } | null | undefined>)
      : ref(null)
  ) as Ref<{ uid: string } | null | undefined>

  const appUserDocRef = computed<DocumentReference<AppUser> | null>(() => {
    if (!import.meta.client) return null
    if (!currentUser.value || !appId) return null
    return doc(
      db,
      `apps/${appId}/users`,
      currentUser.value.uid
    ) as DocumentReference<AppUser>
  })

  const { data: appUserData } = useDocument<AppUser>(appUserDocRef)

  // Convert undefined to null for consistency
  const appUser = computed(() => appUserData.value ?? null)

  // Avoid collection fetch without appId or on server
  const appUsers =
    appId && import.meta.client
      ? firestoreFetchCollection<AppUser>(`apps/${appId}/users`)
      : []

  return {
    // Current entity
    appUser,

    // Collections fetcher
    appUsers,

    // Child functions
    ...useAppUserEnsure(),
    ...useAppUserUtils(),
    useAppUserUpdate,
    ...useAppUserSubscription(),
    ...useAppUserComputed(appUser),
  }
}
```

### useAppUserEnsure()
File: `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserEnsure.ts`

```ts
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { AppUser } from '../../../models/core/appUser.model'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { useFirestoreManager } from '../useFirestoreManager'

export function useAppUserEnsure() {
  /**
   * Ensure an AppUser exists for the current auth user in the current app.
   * - Writes ONLY tenant-scoped state (role, profiles?) to apps/{appId}/users/{uid}
   * - Ensures CoreUser exists and updates core-users/{uid}.userOf += appId
   */
  async function ensureAppUser(coreUser?: {
    id: string
    email?: string
    profiles?: string[]
  }): Promise<void> {
    console.log('🚀 [ensureAppUser] start')

    const { appId } = useFireUXConfig()
    if (!appId) {
      console.warn('⚠️ [ensureAppUser] No appId in config')
      return
    }

    const { waitForCurrentUser } = useFirestoreManager()
    const authUser = await waitForCurrentUser()
    const uid = authUser?.uid
    if (!uid) {
      console.warn('⚠️ [ensureAppUser] No authenticated user')
      return
    }

    // 1) Ensure CoreUser exists (if caller didn’t pass it)
    if (!coreUser) {
      const { useCoreUserEnsure } = await import(
        '../CoreUser/useCoreUserEnsure'
      )
      const { ensureCoreUser } = useCoreUserEnsure()
      await ensureCoreUser()
    }

    const db = useFirestore()

    // 2) Verify app exists
    const appRef = doc(db, 'apps', appId)
    const appSnap = await getDoc(appRef)
    if (!appSnap.exists()) {
      console.warn(`❌ [ensureAppUser] App '${appId}' not found`)
      return
    }
    const app = appSnap.data() as { admin_ids?: string[] }

    // 3) If app user already exists, we're done
    const appUserRef = doc(db, `apps/${appId}/users`, uid)
    const appUserSnap = await getDoc(appUserRef)
    if (appUserSnap.exists()) {
      console.log(`✅ [ensureAppUser] AppUser already exists for ${appId}`)
      return
    }

    // 4) Build minimal tenant payload
    const role: AppUser['role'] = app?.admin_ids?.includes(uid)
      ? 'admin'
      : 'user'
    const minimal: Partial<AppUser> = {
      id: uid,
      role,
      // Optional: seed tenant profiles from core (safe to omit)
      // profiles: coreUser?.profiles ?? [],
    }

    // 5) Create app user (adds created_at/updated_at)
    const { setDocument } = useFirestoreCreate()
    await setDocument(`apps/${appId}/users`, uid, minimal)
    console.log(`✅ [ensureAppUser] Created AppUser in ${appId}`)

    // 6) Update CoreUser.userOf
    const coreRef = doc(db, 'core-users', uid)
    await updateDoc(coreRef, { userOf: arrayUnion(appId) })
    console.log(`✅ [ensureAppUser] Added '${appId}' to CoreUser.userOf`)
  }

  return { ensureAppUser }
}
```

### useAppUserUpdate()
File: `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserUpdate.ts`

```ts
// ~/composables/useAppUserUpdate.ts
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreUtils } from '../useFirestoreUtils'

// tiny helpers
const toStringArray = (arr: unknown): string[] =>
  Array.isArray(arr)
    ? Array.from(
        new Set(
          arr
            .filter((v): v is string => typeof v === 'string')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        )
      )
    : []

export function useAppUserUpdate() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { waitForCurrentUser } = useFirestoreUtils()

  const getRef = async () => {
    const user = await waitForCurrentUser()
    if (!user) throw new Error('User not authenticated')
    if (!appId) throw new Error('Missing appId')
    return doc(db, `apps/${appId}/users`, user.uid)
  }

  // --- Tenant-scoped updates only (AppUser is membership-only) ---
  // Identity fields (display_name, handle, avatar, email) live on CoreUser.

  async function setProfiles(profiles: unknown) {
    const ref = await getRef()
    const value = toStringArray(profiles)
    await updateDoc(ref, { profiles: value })
    return { success: true, profiles: value }
  }

  // Back-compat updater used by legacy callers that manage an array of
  // profile entry objects: { type, collection, is_active, created_at }
  // We persist the array as-is under AppUser.profiles.
  function useAppUserUpdateFirestore() {
    async function updateProfiles(profiles: unknown[]) {
      const ref = await getRef()
      await updateDoc(ref, { profiles })
      return { success: true, profiles }
    }
    return { updateProfiles }
  }

  // NOTE:
  // - Email is canonical on CoreUser → update via a CoreUser updater (and Auth).
  // - Role, timestamps are system-managed.
  // - If you later add optional fields (e.g., bio), create a tiny updater per field.

  return {
    setProfiles,
    useAppUserUpdateFirestore,
  }
}

export default useAppUserUpdate
```

---

## Profiles creation baseline

### useProfileCreate()
File: `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileCreate.ts
import { useFireUXConfig } from '../../FireUXConfig'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { useCoreUser } from '../CoreUser/useCoreUser'

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
  const { coreUser } = useCoreUser()

  /**
   * ensure(profileFs): Write minimal profile payload.
   * - Expects Firestore-shaped keys (snake_case if applicable). Use model mappers to convert UI → FS.
   * - Stamping is handled by useFirestoreCreate()
   */
  async function ensure(profile: Record<string, any> = {}) {
    if (!coreUser.value?.id) throw new Error('CoreUser not loaded')
    const uid = coreUser.value.id

    // Global profile
    const base = {
      id: uid,
      name: coreUser.value.display_name || 'User',
      avatar: coreUser.value.avatar || '',
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

---

## UI helpers

### AppUser CTA
File: `packages/core/fireux-core/src/runtime/components/organisms/User/App/CTA.vue`

```vue
<template>
  <div class="appuser-cta">
    <p v-if="appUser">✅ You are a member of this app.</p>
    <p v-else>❌ You are not yet a member of this app.</p>

    <div class="cta-buttons">
      <UButton
        v-if="!appUser"
        size="lg"
        color="primary"
        @click="() => ensureAppUser()"
      >
        Join {{ appName }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppUser } from 'fireux-core/runtime/composables/firestore/AppUser/useAppUser'
import { useAppUserEnsure } from 'fireux-core/runtime/composables/firestore/AppUser/useAppUserEnsure'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig'

const { appName } = useFireUXConfig()
const { appUser } = useAppUser()
const { ensureAppUser } = useAppUserEnsure()
</script>

<style scoped>
.appuser-cta {
  display: grid;
  gap: 0.75rem;
}
.cta-buttons {
  margin-top: 0.5rem;
}
</style>
```

### Chef CTA (tenant example)
File: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue`

```vue
<!-- packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
  <UCard class="profile-cta">
    <template #header>
      <div class="cta-header">
        <h3>Chef Profiles</h3>
        <p class="muted">You’re in {{ tenancyDisplay }}</p>
      </div>
    </template>

    <div class="cta-content">
      <!-- Global profile section -->
      <section>
        <h4 class="section-title">Global profile</h4>
        <OrganismsProfilesChefCardsCell
          v-if="ecosystemProfile"
          :chef="ecosystemProfile"
        />
        <UAlert
          v-else
          color="amber"
          variant="soft"
          title="No global profile"
          description="Create your Chef profile for the whole ecosystem."
        />
      </section>

      <UDivider />

      <!-- App profile section (tenant only) -->
      <section v-if="appTenancy === 'tenant'">
        <h4 class="section-title">This app</h4>
        <OrganismsProfilesChefCardsCell v-if="appProfile" :chef="appProfile" />
        <UAlert
          v-else
          color="blue"
          variant="soft"
          title="Not a Chef in this app"
          description="Add your profile to this app to appear in Chef lists."
        />
      </section>
    </div>

    <template #footer>
      <div class="cta-footer">
        <UButton
          v-if="(!ecosystemProfile) || (appTenancy === 'tenant' && !appProfile)"
          size="lg"
          color="primary"
          @click="onEnsure"
        >
          {{ !ecosystemProfile ? 'Create Chef Profile'
                               : 'Add to ' + tenancyDisplay + ' Chefs' }}
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import { chefConfig } from '../../../../models/profiles/Chef.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useChefCreate } from '../../../../composables/firestore/profiles/Chef/useChefCreate'

// tenancy strings
const { tenancyDisplay, appTenancy } = useApp()

// correct shape from useProfile()
const { current } = useProfile(chefConfig)
const ecosystemProfile = current.global      // ref to global (ecosystem) doc
const appProfile = current.appMirror         // ref to app mirror (or null)

// tiny wrapper around profile create
const { createChef } = useChefCreate()

async function onEnsure() {
  try {
    await createChef()
    // If you later add explicit refresh(), call it here.
  } catch (e) {
    console.error('[CTA] ensureProfile failed', e)
  }
}
</script>

<style scoped>
.cta-header {
  display: grid;
  gap: 0.25rem;
}
.muted {
  color: var(--ui-text-muted);
}
.cta-content {
  display: grid;
  gap: 1rem;
}
.section-title {
  font-size: 0.95rem;
  color: var(--ui-text-muted);
}
.cta-footer {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

---

## Key behaviors and contracts

- VueFire owns Auth initialization (see ADR-0003). Avoid duplicate init.
- Auth user → CoreUser → AppUser flow:
  - Auth user signs in via VueFire.
  - `ensureCoreUser()` creates/updates `core-users/{uid}` with seeds (display_name, avatar, timestamps).
  - `ensureAppUser()` creates `apps/{appId}/users/{uid}` with role, then ensures `core-users/{uid}.userOf` contains appId.
- Profiles are separate from CoreUser/AppUser; creation uses `useProfileCreate(config).ensure(fsPayload)` with FS-shaped keys.
- Avoid calling Vue/nuxt/vuefire composables after an `await` inside setup; keep them synchronous and move async into functions.

---

## Related ADRs and docs

- `copilot-documentation/copilot-adr/copilot-0003-vuefire-auth-init.md`
- `copilot-documentation/sysncronisty.md`
- `copilot-documentation/copilot-06-firebase.md`
