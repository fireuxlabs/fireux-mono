# Ensure Composables Report

_Last updated: 2025-10-20_

## Core Runtime

### app / useAppEnsure.ts

- **Path:** `packages/core/fireux-core/src/runtime/composables/app/useAppEnsure.ts`
- **Purpose:** Produce app payloads for global, tenant, and sandbox contexts without performing Firestore writes.
- **Key API:** `ensureApp(input?)`, `canCreateSandbox()`
- **Notes:** Sandbox creation gated to global role; tenant IDs default to runtime config `appId`.

````ts
import { useFirestore } from 'vuefire'
import { useCurrentApp } from 'fireux-core/runtime/composables/useCurrentApp.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser.ts'
import type { FireUXApp } from 'fireux-core/runtime/typings/app.ts'
import { getDeviceAvatar } from 'fireux-core/runtime/composables/useDeviceAvatar.ts'
import { doc, getDoc } from 'firebase/firestore'

type EnsureAppInput = Partial<FireUXApp>

/**
 * Ensure an app payload with defaulted fields ready for creation.
 * Note: this does not write to Firestore (caller should do that) but batches the logic.
 */
export async function useAppEnsure(input?: EnsureAppInput) {
  const db = useFirestore()
  const config = useFireUXConfig()
  const { app } = useCurrentApp()
  const authUser = await useRequireUser()
  const uid = authUser?.uid

  if (!uid) {
    throw new Error('Authenticated user required to ensure app')
  }

  const now = new Date()

  const base: FireUXApp = {
    id: input?.id ?? config.appId ?? uid,
    name: input?.name ?? 'My FireUX App',
    slug: input?.slug ?? 'my-fireux-app',
    logo: input?.logo ?? app.value?.logo ?? (await getDeviceAvatar(uid)),
    logo_secondary: input?.logo_secondary ?? app.value?.logo_secondary ?? null,
    created_at: input?.created_at ?? now.toISOString(),
    updated_at: now.toISOString(),
    userOf: input?.userOf ?? app.value?.userOf ?? [uid],
    owner: input?.owner ?? uid,
    owner_email: input?.owner_email ?? authUser?.email ?? '',
    sandbox: input?.sandbox ?? false,
    sandboxParent: input?.sandboxParent ?? null,
    tenant: input?.tenant ?? config.role === 'tenant',
    tenant_of:
      input?.tenant_of ??
      (config.role === 'tenant' && config.appId ? [config.appId] : []),
    tier: input?.tier ?? 'free',
    timezone:
      input?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    ## Core Runtime

    ### ensure / useEnsurer.ts

  - **Path:** `packages/core/fireux-core/src/runtime/composables/fireux/firestore/ensure/useEnsurer.ts`
    - **Purpose:** Provide a reusable `ensureDoc` helper that wraps Firestore create-if-missing logic and optional Storage uploads.
    - **Key API:** `ensureDoc(adapter)`, `EnsureAdapter`, `EnsureResult`
    - **Notes:** Leaves creator/timestamp stamping to callers; image handling is opt-in via the adapter.

    ```ts
    import { doc, getDoc, setDoc } from 'firebase/firestore'
    import { useFirestore } from 'vuefire'
    import { useImageStorage } from '../firebase/useImageStorage'

    const avatarUrl = await getDeviceAvatar(uid)


      source: string
      path: string
      field: keyof T
      store?: 'url' | 'path'
    }

    await setDoc(userRef, {

    /** Result shape for ensureDoc */
    export type EnsureResult<T> = {
      created: boolean
      id: string
      data: T
    }

    /** Minimal adapter contract for ensureDoc */
    export type EnsureAdapter<T extends Record<string, unknown>> = {
      target: () => Promise<TargetTuple> | TargetTuple
      build: () => Promise<T> | T
      image?: ImageFactory<T>
    }

    /**
     * Generic ensure helper for Firestore documents.
     * - Returns early if the doc already exists.
     * - Builds the doc via adapter when missing.
     * - Optionally uploads a single image and injects the Storage ref.
     * - Leaves creator metadata and timestamps for the caller to handle.
     */
    export async function ensureDoc<T extends Record<string, unknown>>(
      adapter: EnsureAdapter<T>
    ): Promise<EnsureResult<T>> {
      const db = useFirestore()
      const { uploadImage, getDownloadUrlForPath } = useImageStorage()

      const [collection, id] = await adapter.target()
      const ref = doc(db, collection, id)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        return { created: false, id, data: snap.data() as T }
      }

      const docData = { ...(await adapter.build()) } as T

      if (adapter.image) {
        const spec = adapter.image({ id })
        if (!spec?.source || !spec.path || !spec.field) {
          throw new Error('[ensureDoc] invalid image adapter spec')
        }

        const uploadedUrl = await uploadImage(spec.path, spec.source)
        const storeMode = spec.store ?? 'url'

        let storedRef: string
        if (storeMode === 'path') {
          storedRef = spec.path
        } else {
          storedRef = uploadedUrl || (await getDownloadUrlForPath(spec.path).catch(() => spec.path))
        }

        const fieldName = spec.field
        ;(docData as Record<string, unknown>)[fieldName as string] = storedRef
      }

      await setDoc(ref, docData)

      return { created: true, id, data: docData }
    }
    ```

    ### app / useAppEnsure.ts

    - **Path:** `packages/core/fireux-core/src/runtime/composables/app/useAppEnsure.ts`
    - **Purpose:** Build app payloads for UI flows and expose a sandbox ensure backed by `ensureDoc`.
    - **Key API:** `ensureApp(input?)`, `ensureSandbox(name)`, `canCreateSandbox()`
    - **Notes:** `ensureSandbox` uploads a default avatar via the adapter image hook; creator/timestamps handled downstream.

    ```ts
    // packages/core/fireux-core/src/runtime/composables/app/useAppEnsure.ts
    import type { Ref } from 'vue'
    import type { App, AppRole } from '../../models/core/app.model'
    import { useFireUXConfig } from '../FireUXConfig'
    import {
      ensureDoc,
      type EnsureAdapter,
      type EnsureResult,
  } from '../firestore/ensure/useEnsurer'

    /**
     * Only override allowed: name a sandbox via tuple
     * e.g. ['sandbox', 'Bob’s Burger Joint']
     */
    export type CreateAppInput = ['sandbox', string] | undefined

    /**
     * Unified App Factory / Ensure composable
     * - Combines the logic previously in `useAppFactory`
     * - Safe to call anywhere — no Firestore writes yet
     */
  const DEFAULT_SANDBOX_AVATAR = '/img/core/brand/wordmark-light.svg'

      id: uid,
      avatar_url?: string | null
    }

    export function useAppEnsure(_app?: Ref<App | null | undefined>) {
      const { ecosystem, role, appId, appName, appShortName } = useFireUXConfig()

      if (!ecosystem) {
        throw new Error('useAppEnsure: missing ecosystem in runtime config.')
      }

      /**
       * Create a new app payload (no writes)
       */
      function ensureApp(input?: CreateAppInput): Partial<App> {
        const r = role as AppRole

        // --- Sandbox creation (global only)
        if (input) {
          if (r !== 'global') {
            throw new Error('Sandbox creation is only allowed from the global app.')
          }

          const [, sandboxName] = input
          if (!sandboxName) {
            throw new Error('Sandbox requires a non-empty app name.')
          }

          return {
            id: `sandbox-${Date.now()}`,
            ecosystem,
            app_name: sandboxName,
            role: 'sandbox',
          }
        }

        // --- Global app creation
        if (r === 'global') {
          return {
            id: `${ecosystem}-app`,
            ecosystem,
            app_name: appName,
            ...(appShortName ? { app_short_name: appShortName } : {}),
            role: 'global',
          }
        }

        // --- Tenant app creation
        return {
          id: appId || 'tenant-app',
          ecosystem,
          app_name: appName || 'Tenant App',
          ...(appShortName ? { app_short_name: appShortName } : {}),
          role: 'tenant',
        }
      }

      /**
       * Simple guard for UI
       */
      function canCreateSandbox() {
        return (role as AppRole) === 'global'
      }

      async function ensureSandbox(
        name: string
      ): Promise<EnsureResult<SandboxAppDoc>> {
        if (!name?.trim()) {
          throw new Error('Sandbox requires a non-empty app name.')
        }

        if (!ecosystem) {
          throw new Error('useAppEnsure: missing ecosystem in runtime config.')
        }

        if (!canCreateSandbox()) {
          throw new Error('Sandbox creation is only allowed from the global app.')
        }

        const trimmedName = name.trim()
        const id = `sandbox-${Date.now()}`

        const adapter: EnsureAdapter<SandboxAppDoc> = {
          target: () => ['apps', id],
          build: () => ({
            id,
            ecosystem,
            role: 'sandbox',
            app_name: trimmedName,
          }),
          image: () => ({
            source: DEFAULT_SANDBOX_AVATAR,
            path: `apps/${id}/avatar.png`,
            field: 'avatar_url',
            store: 'url',
          }),
        }

        return ensureDoc<SandboxAppDoc>(adapter)
      }

      return { ensureApp, ensureSandbox, canCreateSandbox }
    }
    ```
      email: authUser?.email ?? '',
      displayName: authUser?.displayName ?? '',
      photoURL: avatarUrl,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      userOf: [config.appId ?? 'global'],
    })

    return getDoc(userRef)
  }

  async function ensureAppUser(uid: string) {
    if (!isTenant.value) return null
    const tenantAppId = config.appId
    if (!tenantAppId) throw new Error('Tenant appId missing in config')

    const userRef = doc(db, `apps/${tenantAppId}/users/${uid}`)
    const snap = await getDoc(userRef)

    if (snap.exists()) return snap

    state.appUserCreated = true

    const coreUserSnapshot = await ensureCoreUser(uid)
    const coreUserData = coreUserSnapshot.data()

    await setDoc(userRef, {
      ...coreUserData,
      id: uid,
      appId: tenantAppId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      role: 'member',
      status: 'active',
    })

    if (coreUserData?.userOf && !coreUserData.userOf.includes(tenantAppId)) {
      await updateDoc(doc(db, 'core-users', uid), {
        userOf: [...coreUserData.userOf, tenantAppId],
        updated_at: serverTimestamp(),
      })
    }

    return getDoc(userRef)
  }

  async function ensureUser() {
    const authUser = await useRequireUser()
    if (!authUser?.uid) throw new Error('No authenticated user')

    const uid = authUser.uid
    const coreUserSnapshot = await ensureCoreUser(uid)

    const coreUserData = coreUserSnapshot.data()

    if (!coreUserData) throw new Error('Failed to ensure core user data')

    if (!coreUserData.photoURL) {
      const avatarUrl = await ensureAvatar(uid)
      if (avatarUrl) {
        await updateDoc(doc(db, 'core-users', uid), {
          photoURL: avatarUrl,
          updated_at: serverTimestamp(),
        })
      }
    }

    const appUserSnapshot = await ensureAppUser(uid)
    const appUserData = appUserSnapshot?.data()

    if (
      options.redirectToDashboard &&
      (state.coreUserCreated || state.appUserCreated)
    ) {
      await router.push('/dashboard')
    }

    return {
      coreUser: coreUserData,
      appUser: appUserData,
      state,
    }
  }

  async function ensureAvatar(uid: string) {
    const authUser = auth?.currentUser
    if (!authUser) return null

    const avatarUrl = authUser.photoURL ?? (await getDeviceAvatar(uid))
    if (!avatarUrl) return null

    const { upload, getDownloadURL } = useStorageUpload()
    const { ensureImageObject } = useImageStorage()

    const fileName = `avatars/${uid}.jpg`
    const fileRef = useStorageUri(fileName)

    const response = await fetch(avatarUrl)
    const blob = await response.blob()

    await upload(fileRef, blob, { contentType: blob.type })
    const downloadURL = await getDownloadURL(fileRef)

    await ensureImageObject({
      id: fileName,
      url: downloadURL,
      ownerId: uid,
      ownerType: 'user',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      metadata: {
        source: 'ensureAvatar',
        size: blob.size,
        type: blob.type,
      },
    })

    state.avatarUploaded = true
    state.lastAvatarUploadUrl = downloadURL

    return downloadURL
  }

  return {
    ensureUser,
    ensureCoreUser,
    ensureAppUser,
    ensureAvatar,
    state,
    isTenant,
    currentApp: app,
  }
}
````

### core/profiles / useProfileEnsure.ts

- **Path:** `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profiles/main/useProfileEnsure.ts`
- **Purpose:** Create profile documents in both core scope and tenant overlay when missing.
- **Key API:** `ensure(profile?)`
- **Notes:** Non-destructive; skips existing docs and mirrors core profile fields into tenant collection.

```ts
import { computed } from 'vue'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser.ts'

interface ProfileDoc {
  id: string
  ownerId: string
  type: 'professional' | 'agent' | 'generic'
  displayName: string
  created_at: any
  updated_at: any
  [key: string]: any
}

export function useProfileEnsure() {
  const db = useFirestore()
  const config = useFireUXConfig()

  const isTenant = computed(() => config.role === 'tenant' && !!config.appId)

  async function ensure(profile?: Partial<ProfileDoc>) {
    const authUser = await useRequireUser()
    if (!authUser?.uid) throw new Error('No authenticated user')

    const uid = authUser.uid
    const now = serverTimestamp()

    const coreProfileRef = doc(db, 'profiles', uid)
    const coreProfileSnap = await getDoc(coreProfileRef)

    if (!coreProfileSnap.exists()) {
      await setDoc(coreProfileRef, {
        id: uid,
        ownerId: uid,
        type: profile?.type ?? 'generic',
        displayName:
          profile?.displayName ?? authUser.displayName ?? 'New Profile',
        created_at: now,
        updated_at: now,
        ...profile,
      })
    }

    if (isTenant.value) {
      const tenantProfileRef = doc(db, `apps/${config.appId}/profiles/${uid}`)
      const tenantProfileSnap = await getDoc(tenantProfileRef)

      if (!tenantProfileSnap.exists()) {
        await setDoc(tenantProfileRef, {
          id: uid,
          ownerId: uid,
          type: profile?.type ?? 'generic',
          displayName:
            profile?.displayName ?? authUser.displayName ?? 'New Profile',
          created_at: now,
          updated_at: now,
          ...profile,
        })
      }
    }

    return {
      id: uid,
      ensuredCore: true,
      ensuredTenant: isTenant.value,
    }
  }

  return { ensure, isTenant }
}
```

## Summary

All ensure composables follow a create-if-missing pattern with limited side-effects. Core runtime now centralises the behaviour through `ensureDoc`, with app, user, and profile composables layering their adapters on top. fireux-jobs’ agent/professional helpers shim to the core `useProfileEnsure` and add no extra logic. No additional `use*Ensure` modules remain in the mono-repo.
