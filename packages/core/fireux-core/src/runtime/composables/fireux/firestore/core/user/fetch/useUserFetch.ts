// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: normalize app-private profile ids.
// Concurrent edit — 2026-07-20 16:20 CEST — Console Spine pass: expose App membership read state to console targeting.
// Concurrent edit — 2026-07-20 19:27 CEST — Repo Efficiency Pass 2 of 6: fail closed when hydrating canonical User avatars.
// Concurrent edit — 2026-07-20 23:21 CEST — Active User Outcome fix: preserve canonical User read outcomes.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: normalize optional stored biography into the shared User runtime.
// Concurrent edit — 2026-07-21 16:58 CEST — Dashboard Family pass: expose independent App-membership and private-account outcomes.
import { doc } from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useDocument,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Ref } from 'vue'
import { computed, isRef, watch } from 'vue'
import type {
  UserPrivate,
  User,
} from '../../../../../../models/core/user.model'
import {
  UserPrivateModel,
  UserPrivateStorage,
  UserStorage,
} from '../../../../../../models/core/user.model'
import { resolveUserAvatarSource } from '../../../../../../models/utils/user-avatar'
import type { CurrentAppMembershipDto } from '../../../../../../server/utils/public-projection/public-dto.types'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useCurrentAppContext } from '../../../../app/useCurrentAppContext'

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

function normalizeCoreUser(raw: User, fallbackId: string): User {
  const anyRaw = raw as any
  return {
    ...raw,
    id: raw.id ?? fallbackId,
    display_name: (raw as any).display_name ?? raw.id ?? fallbackId,
    bio:
      typeof anyRaw.bio === 'string' && anyRaw.bio.trim().length <= 280
        ? anyRaw.bio.trim()
        : '',
    avatar: resolveUserAvatarSource((raw as any).avatar),
    handle: (raw as any).handle ?? '',
    app_ids: asStringArray(anyRaw.app_ids),
    profiles: asStringArray(anyRaw.profiles),
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

/**
 * Arbitrary User reads are public-only. The optional App scope resolves only
 * the signed-in user's bounded membership projection.
 */
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
    const appUser = computed<CurrentAppMembershipDto | null | undefined>(
      () => null
    )
    const privateUser = computed<UserPrivate | null | undefined>(() => null)
    const user = computed<User | null>(() => null)
    const pending = computed(() => false)
    const coreError = computed<unknown>(() => null)
    const coreOutcome = computed<UserFetchOutcome>(() => 'idle')
    const appPending = computed(() => false)
    const appError = computed<unknown>(() => null)
    const appOutcome = computed<UserFetchOutcome>(() => 'idle')
    const privatePending = computed(() => false)
    const privateError = computed<unknown>(() => null)
    const privateOutcome = computed<UserFetchOutcome>(() => 'idle')
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
      appOutcome,
      privatePending,
      privateError,
      privateOutcome,
    }
  }

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

  const coreState = useDocument<User | undefined>(
    coreDoc as any,
    {
      ssrKey: 'user-fetch-core',
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
  const privateUserRef = privateState.data
  const privatePending = privateState.pending
  const privateError = privateState.error
  const appContext = includeApp ? useCurrentAppContext() : null
  const appScopeRequested = computed(() =>
    Boolean(includeApp && uid.value && appId)
  )
  const appIdentityError = computed<Error | null>(() => {
    if (
      !appScopeRequested.value ||
      !appContext ||
      appContext.pending.value
    ) {
      return null
    }

    return uid.value === appContext.uid.value
      ? null
      : new Error(
          '[useUserFetch] App membership is only available for the signed-in user.'
        )
  })
  const appPending = computed(() =>
    appScopeRequested.value && appContext
      ? Boolean(appContext.pending.value)
      : false
  )
  const appError = computed<unknown>(() => {
    if (!appScopeRequested.value || !appContext) return null
    return appIdentityError.value || appContext.error.value || null
  })
  guardDocumentPromise(
    coreState as any,
    () => `${UserStorage.rootCollection}/${uid.value ?? ''}`
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

  const appUser = computed<CurrentAppMembershipDto | null | undefined>(() => {
    if (!appScopeRequested.value) return null
    if (appPending.value) return undefined
    if (appError.value) return undefined
    return appContext?.membership.value ?? null
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

  const appOutcome = computed<UserFetchOutcome>(() => {
    if (!includeApp || !uid.value || !appId) return 'idle'
    if (appPending.value) return 'pending'
    if (appError.value) return 'error'
    return appUser.value ? 'ready' : 'missing'
  })

  const privateOutcome = computed<UserFetchOutcome>(() => {
    if (!includePrivate || !uid.value) return 'idle'
    if (privatePending.value) return 'pending'
    if (privateError.value) return 'error'
    return privateUser.value ? 'ready' : 'missing'
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
    appOutcome,
    privatePending,
    privateError,
    privateOutcome,
  }
}

export type UserRefs = ReturnType<typeof useUserFetch>
