import { doc } from 'firebase/firestore'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Ref } from 'vue'
import { computed, isRef } from 'vue'
import type {
    UserApp,
    UserCore,
} from '../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
}

function normalizeCoreUser(raw: UserCore, fallbackId: string): UserCore {
  const anyRaw = raw as any
  return {
    ...raw,
    id: raw.id ?? fallbackId,
    display_name: (raw as any).display_name ?? raw.id ?? fallbackId,
    avatar: (raw as any).avatar ?? '',
    handle: (raw as any).handle ?? '',
    email: (raw as any).email ?? '',
    bio: (raw as any).bio ?? '',
    profiles: asStringArray(anyRaw.profiles),
    userOf: asStringArray(anyRaw.userOf),
    adminOf: asStringArray(anyRaw.adminOf),
  }
}

function normalizeAppUser(raw: UserApp, fallbackId: string): UserApp {
  const anyRaw = raw as any
  return {
    ...raw,
    id: raw.id ?? fallbackId,
    role: raw.role === 'admin' ? 'admin' : 'user',
    console_enabled:
      typeof anyRaw.console_enabled === 'boolean'
        ? anyRaw.console_enabled
        : false,
    console_scopes: asStringArray(anyRaw.console_scopes),
    notifications: Array.isArray(anyRaw.notifications)
      ? anyRaw.notifications
      : [],
  }
}

function isOfflineFirestoreError(error: unknown): boolean {
  const code = typeof (error as any)?.code === 'string' ? (error as any).code : ''
  const message = String((error as any)?.message ?? '').toLowerCase()
  return code === 'unavailable' || message.includes('client is offline')
}

function guardDocumentPromise(
  state: { promise?: Ref<Promise<unknown>> },
  context: string
) {
  const promise = state.promise?.value
  if (!promise || typeof promise.catch !== 'function') return

  promise.catch((error) => {
    if (!import.meta.dev) return
    if (isOfflineFirestoreError(error)) {
      console.warn(`[useUserFetch] offline read ignored (${context})`, error)
      return
    }
    console.error(`[useUserFetch] read failed (${context})`, error)
  })
}

export function useUserFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const { appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))

  // Auth-bound user docs are not reliably available during SSR.
  // Avoid VueFire SSR warnings by only binding Firestore sources on the client.
  if (import.meta.server) {
    const coreUser = computed<UserCore | null | undefined>(() => null)
    const appUser = computed<UserApp | null | undefined>(() => null)
    const user = computed<UserCore | null>(() => null)
    const pending = computed(() => false)
    return { user, coreUser, appUser, pending }
  }

  const db = useFirestore()

  const coreDoc = computed(() =>
    uid.value ? (doc(db, 'users', uid.value) as any) : null
  )

  /**
   * Canon: AppUser membership overlay
   * - Path: `apps/{appId}/users/{uid}`
    * - This is NOT a “tenant profile overlay”. It exists to hold app-scoped role,
    *   permissions, and onboarding state.
   * - Therefore it is valid for any app context (including operator apps like `misebox-app`)
   *   whenever `appId` exists.
   */
  const appDoc = computed(() =>
    uid.value && appId
      ? (doc(db, 'apps', appId, 'users', uid.value) as any)
      : null
  )

  const coreState = useDocument<UserCore | undefined>(coreDoc as any)
  const appState = useDocument<UserApp | undefined>(appDoc as any)
  const coreUserRef = coreState.data
  const corePending = coreState.pending
  const appUserRef = appState.data
  const appPending = appState.pending
  guardDocumentPromise(coreState as any, `users/${uid.value ?? ''}`)
  guardDocumentPromise(
    appState as any,
    `apps/${appId}/users/${uid.value ?? ''}`
  )

  const coreUser = computed<UserCore | null | undefined>(() => {
    if (corePending.value) return undefined

    const raw = coreUserRef.value
    if (!raw) return null

    const fallbackId = uid.value ?? ''
    return normalizeCoreUser(raw as UserCore, fallbackId)
  })

  const appUser = computed<UserApp | null | undefined>(() => {
    if (!appDoc.value) return null
    if (appPending.value) return undefined
    const raw = appUserRef.value
    if (!raw) return null
    return normalizeAppUser(raw as UserApp, uid.value ?? '')
  })

  const user = computed<UserCore | null>(() => coreUser.value ?? null)

  const pending = computed(
    () => Boolean(corePending.value) || Boolean(appPending?.value)
  )

  return { user, coreUser, appUser, pending }
}

export type UserRefs = ReturnType<typeof useUserFetch>
