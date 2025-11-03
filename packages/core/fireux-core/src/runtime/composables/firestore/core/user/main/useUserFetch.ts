// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserFetch.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { User, AppUser } from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Returns ONE reactive `user`:
 * - Always fetches global `/users/{uid}`
 * - Adds `appUser` overlay if tenant context is active
 */
export function useUserFetch(id: string) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const { data: coreUser } = useDocument<User>(id ? (doc(db, 'users', id) as any) : null)

  const { data: appUser } = useDocument<AppUser>(
    id && isTenant && appId ? (doc(db, 'apps', appId, 'users', id) as any) : null
  )

  const user = computed<(User & { appUser?: AppUser | null }) | null>(() => {
    const base = coreUser.value
    if (!base) return null
    return { ...base, appUser: appUser.value ?? null }
  })

  return { user }
}