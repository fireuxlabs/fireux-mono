import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import type {
  User,
  AppUser,
} from '../../../../../../models/core/user.model'

export function useUserFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))

  const coreDoc = computed(() =>
    uid.value ? (doc(db, 'users', uid.value) as any) : null
  )

  /**
   * Canon: AppUser membership overlay
   * - Path: `apps/{appId}/users/{uid}`
   * - This is NOT a “tenant profile overlay”. It exists to hold app-scoped role,
   *   permissions, onboarding state, and app-scoped notifications.
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
    return coreUserRef.value ?? null
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
