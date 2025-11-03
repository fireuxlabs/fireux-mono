// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserFetch.ts
import { computed, isRef, ref, type Ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Returns ONE reactive `user`:
 * - null while no id or while core doc missing
 * - merged { ...core, appUser } when present
 */
type UserIdSource = string | null | undefined | Ref<string | null | undefined>

export function useUserFetch(idSource: UserIdSource) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const reactiveId = isRef(idSource)
    ? idSource
    : ref<string | null | undefined>(idSource ?? null)

  const { data: coreUser } = useDocument<User | undefined>(() => {
    const id = reactiveId.value
    return id ? doc(db, 'users', id) : null
  })

  const { data: appUser } = useDocument<AppUser | undefined>(() => {
    const id = reactiveId.value
    if (!(id && isTenant && appId)) return null
    return doc(db, 'apps', appId, 'users', id)
  })

  const user = computed<(User & { appUser?: AppUser | null }) | null>(() => {
    const base = coreUser.value
    if (!base) return null
    return { ...base, appUser: appUser.value ?? null }
  })

  return { user }
}
