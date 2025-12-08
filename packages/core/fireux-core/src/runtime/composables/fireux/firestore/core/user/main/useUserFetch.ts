// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/main/useUserFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

export function useUserFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const uid = computed(() => (isRef(id) ? id.value : id))

  const coreDoc = computed(() =>
    uid.value ? (doc(db, 'users', uid.value) as any) : null
  )

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

  const coreUser = computed(() => coreUserRef.value ?? null)
  const appUser = computed(() => appUserRef.value ?? null)

  const user = computed<User | null>(() => {
    const core = coreUser.value
    const app = appUser.value

    if (!core) return null
    if (!app) return core

    return {
      ...core,
      role: app.role ?? core.role,
      appUser: app,
    }
  })

  const pending = computed(
    () => Boolean(corePending.value) || Boolean(appPending?.value)
  )

  return { user, coreUser, appUser, pending }
}

export type UserRefs = ReturnType<typeof useUserFetch>
