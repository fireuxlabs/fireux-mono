import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import type {
  User,
  AppUser,
} from '../../../../../../models/core/user.model'

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
    avatar: (raw as any).avatar ?? '',
    handle: (raw as any).handle ?? '',
    handle_normalized: (raw as any).handle_normalized ?? (raw as any).handle ?? '',
    email: (raw as any).email ?? '',
    bio: (raw as any).bio ?? '',
    profiles: asStringArray(anyRaw.profiles),
    userOf: asStringArray(anyRaw.userOf),
    adminOf: asStringArray(anyRaw.adminOf),
  }
}

export function useUserFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const { appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))

  // Auth-bound user docs are not reliably available during SSR.
  // Avoid VueFire SSR warnings by only binding Firestore sources on the client.
  if (import.meta.server) {
    const coreUser = computed<User | null | undefined>(() => null)
    const appUser = computed<AppUser | null | undefined>(() => null)
    const user = computed<User | null>(() => null)
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

  const { data: coreUserRef, pending: corePending } = useDocument<
    User | undefined
  >(coreDoc as any)

  const { data: appUserRef, pending: appPending } = useDocument<
    AppUser | undefined
  >(appDoc as any)

  const coreUser = computed<User | null | undefined>(() => {
    if (corePending.value) return undefined

    const raw = coreUserRef.value
    if (!raw) return null

    const fallbackId = uid.value ?? ''
    return normalizeCoreUser(raw as User, fallbackId)
  })

  const appUser = computed<AppUser | null | undefined>(() => {
    if (!appDoc.value) return null
    if (appPending.value) return undefined
    return appUserRef.value ?? null
  })

  const user = computed<User | null>(() => coreUser.value ?? null)

  const pending = computed(
    () => Boolean(corePending.value) || Boolean(appPending?.value)
  )

  return { user, coreUser, appUser, pending }
}

export type UserRefs = ReturnType<typeof useUserFetch>
