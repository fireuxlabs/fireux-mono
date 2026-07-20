// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: normalize app-private profile ids.
// Concurrent edit — 2026-07-20 16:20 CEST — Console Spine pass: expose App membership read state to console targeting.
// Concurrent edit — 2026-07-20 19:27 CEST — Repo Efficiency Pass 2 of 6: fail closed when hydrating canonical User avatars.
// Concurrent edit — 2026-07-20 23:21 CEST — Active User Outcome fix: preserve canonical User read outcomes.
import { doc } from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useDocument,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Ref } from 'vue'
import { computed, isRef, watch } from 'vue'
import type {
  UserAppConsoleTargets,
  UserApp,
  UserPrivate,
  User,
} from '../../../../../../models/core/user.model'
import {
  UserAppConsoleTargetsModel,
  UserAppStorage,
  UserPrivateModel,
  UserPrivateStorage,
  UserStorage,
} from '../../../../../../models/core/user.model'
import { AppStorage } from '../../../../../../models/core/app.model'
import { resolveUserAvatarSource } from '../../../../../../models/core/supporting/user-avatar'
import { useFireUXConfig } from '../../../../app/FireUXConfig'

export type UserFetchOutcome =
  | 'idle'
  | 'pending'
  | 'ready'
  | 'missing'
  | 'error'

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
}

function normalizeConsoleTargets(value: unknown): UserAppConsoleTargets {
  const raw =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  const targets: Record<string, string[]> = {
    ...UserAppConsoleTargetsModel,
  }

  for (const key of Object.keys(UserAppConsoleTargetsModel)) {
    targets[key] = asStringArray(raw[key])
  }

  return targets as UserAppConsoleTargets
}

function normalizeCoreUser(raw: User, fallbackId: string): User {
  const anyRaw = raw as any
  return {
    ...raw,
    id: raw.id ?? fallbackId,
    display_name: (raw as any).display_name ?? raw.id ?? fallbackId,
    avatar: resolveUserAvatarSource((raw as any).avatar),
    handle: (raw as any).handle ?? '',
    app_ids: asStringArray(anyRaw.app_ids),
    profiles: asStringArray(anyRaw.profiles),
  }
}

function normalizeUserApp(raw: UserApp, fallbackId: string): UserApp {
  const anyRaw = raw as any
  return {
    ...raw,
    id: raw.id ?? fallbackId,
    role: raw.role === 'admin' ? 'admin' : 'user',
    is_premium:
      typeof anyRaw.is_premium === 'boolean' ? anyRaw.is_premium : false,
    console_enabled:
      typeof anyRaw.console_enabled === 'boolean'
        ? anyRaw.console_enabled
        : false,
    profiles: asStringArray(anyRaw.profiles),
    console_targets: normalizeConsoleTargets(anyRaw.console_targets),
  }
}

function normalizeUserPrivate(
  raw: UserPrivate,
  fallbackId: string
): UserPrivate {
  const preferences =
    raw.preferences && typeof raw.preferences === 'object'
      ? raw.preferences
      : UserPrivateModel.preferences
  const theme = ['system', 'light', 'dark'].includes(String(preferences.theme))
    ? preferences.theme
    : UserPrivateModel.preferences.theme

  return {
    ...raw,
    id: raw.id ?? fallbackId,
    email: typeof raw.email === 'string' ? raw.email : '',
    preferences: {
      language:
        typeof preferences.language === 'string' && preferences.language.trim()
          ? preferences.language
          : UserPrivateModel.preferences.language,
      theme,
      email_security_alerts:
        typeof preferences.email_security_alerts === 'boolean'
          ? preferences.email_security_alerts
          : UserPrivateModel.preferences.email_security_alerts,
      share_usage_analytics:
        typeof preferences.share_usage_analytics === 'boolean'
          ? preferences.share_usage_analytics
          : UserPrivateModel.preferences.share_usage_analytics,
    },
    terms: raw.terms ?? UserPrivateModel.terms,
  }
}

function isOfflineFirestoreError(error: unknown): boolean {
  const code =
    typeof (error as any)?.code === 'string' ? (error as any).code : ''
  const message = String((error as any)?.message ?? '').toLowerCase()
  return code === 'unavailable' || message.includes('client is offline')
}

function guardDocumentPromise(
  state: {
    error?: Ref<unknown | undefined>
    promise?: Ref<Promise<unknown> | undefined>
  },
  context: () => string
) {
  const handled = new WeakSet<Promise<unknown>>()

  watch(
    () => state.promise?.value,
    (promise: Promise<unknown> | undefined) => {
      if (!promise || typeof promise.catch !== 'function') return
      if (handled.has(promise)) return
      handled.add(promise)
      if (state.error) state.error.value = undefined
      const promiseContext = context()

      promise.catch((error: unknown) => {
        if (!import.meta.dev) return
        if (isOfflineFirestoreError(error)) {
          console.warn(
            `[useUserFetch] offline read ignored (${promiseContext})`,
            error
          )
          return
        }
        console.error(`[useUserFetch] read failed (${promiseContext})`, error)
      })
    },
    { immediate: true, flush: 'sync' }
  )
}

/** Arbitrary User reads are public-only unless app/private scopes are explicit. */
export function useUserFetch(
  id: string | null | undefined | Ref<string | null | undefined>,
  options: { app?: boolean; private?: boolean } = {}
) {
  const { appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))
  const includeApp = options.app === true
  const includePrivate = options.private === true

  // Auth-bound user docs are not reliably available during SSR.
  // Avoid VueFire SSR warnings by only binding Firestore sources on the client.
  if (import.meta.server) {
    const coreUser = computed<User | null | undefined>(() => null)
    const appUser = computed<UserApp | null | undefined>(() => null)
    const privateUser = computed<UserPrivate | null | undefined>(() => null)
    const user = computed<User | null>(() => null)
    const pending = computed(() => false)
    const coreError = computed<unknown>(() => null)
    const coreOutcome = computed<UserFetchOutcome>(() => 'idle')
    const appPending = computed(() => false)
    const appError = computed<unknown>(() => null)
    const privatePending = computed(() => false)
    const privateError = computed<unknown>(() => null)
    return {
      user,
      coreUser,
      appUser,
      privateUser,
      pending,
      coreError,
      coreOutcome,
      appPending,
      appError,
      privatePending,
      privateError,
    }
  }

  const appDb = useFirestore()
  const identityDb = useFirestore(readRuntimeIdentityFirestoreDatabaseId())

  const coreDoc = computed(() =>
    uid.value
      ? (doc(identityDb, UserStorage.rootCollection, uid.value) as any)
      : null
  )

  const privateDoc = computed(() =>
    uid.value && includePrivate
      ? (doc(
          identityDb,
          UserStorage.rootCollection,
          uid.value,
          UserPrivateStorage.collection,
          UserPrivateStorage.document
        ) as any)
      : null
  )

  /**
   * Canon: UserApp membership record
   * - Path: `apps/{appId}/users/{uid}`
   * - This is NOT a “tenant profile overlay”. It exists to hold app-scoped role,
   *   permissions, and onboarding state.
   * - Therefore it is valid for any app context (including operator apps like `misebox-app`)
   *   whenever `appId` exists.
   */
  const appDoc = computed(() =>
    uid.value && appId && includeApp
      ? (doc(
          appDb,
          AppStorage.collection,
          appId,
          UserAppStorage.collection,
          uid.value
        ) as any)
      : null
  )

  const coreState = useDocument<User | undefined>(
    coreDoc as any,
    {
      ssrKey: 'user-fetch-core',
    } as any
  )
  const appState = useDocument<UserApp | undefined>(
    appDoc as any,
    {
      ssrKey: 'user-fetch-app',
    } as any
  )
  const privateState = useDocument<UserPrivate | undefined>(
    privateDoc as any,
    {
      ssrKey: 'user-fetch-private',
    } as any
  )
  const coreUserRef = coreState.data
  const corePending = coreState.pending
  const coreError = coreState.error
  const appUserRef = appState.data
  const appPending = appState.pending
  const appError = appState.error
  const privateUserRef = privateState.data
  const privatePending = privateState.pending
  const privateError = privateState.error
  guardDocumentPromise(
    coreState as any,
    () => `${UserStorage.rootCollection}/${uid.value ?? ''}`
  )
  guardDocumentPromise(
    appState as any,
    () =>
      `${AppStorage.collection}/${appId}/${UserAppStorage.collection}/${uid.value ?? ''}`
  )
  guardDocumentPromise(
    privateState as any,
    () =>
      `${UserStorage.rootCollection}/${uid.value ?? ''}/${UserPrivateStorage.collection}/${UserPrivateStorage.document}`
  )

  const coreUser = computed<User | null | undefined>(() => {
    if (corePending.value) return undefined
    if (coreError.value) return undefined

    const raw = coreUserRef.value
    if (!raw) return null

    const fallbackId = uid.value ?? ''
    return normalizeCoreUser(raw as User, fallbackId)
  })

  const appUser = computed<UserApp | null | undefined>(() => {
    if (!appDoc.value) return null
    if (appPending.value) return undefined
    const raw = appUserRef.value
    if (!raw) return null
    return normalizeUserApp(raw as UserApp, uid.value ?? '')
  })

  const privateUser = computed<UserPrivate | null | undefined>(() => {
    if (!privateDoc.value) return null
    if (privatePending.value) return undefined
    const raw = privateUserRef.value
    if (!raw) return null
    return normalizeUserPrivate(raw as UserPrivate, uid.value ?? '')
  })

  const coreOutcome = computed<UserFetchOutcome>(() => {
    if (!uid.value) return 'idle'
    if (corePending.value) return 'pending'
    if (coreError.value) return 'error'
    return coreUser.value ? 'ready' : 'missing'
  })

  const user = computed<User | null>(() => coreUser.value ?? null)

  const pending = computed(
    () => Boolean(corePending.value) || Boolean(appPending?.value)
  )

  return {
    user,
    coreUser,
    appUser,
    privateUser,
    pending,
    coreError,
    coreOutcome,
    appPending,
    appError,
    privatePending,
    privateError,
  }
}

export type UserRefs = ReturnType<typeof useUserFetch>
