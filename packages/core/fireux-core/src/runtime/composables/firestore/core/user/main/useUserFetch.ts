// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import type { Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Minimal user fetch:
 * - Fires global + app listeners (when path pieces exist)
 * - Returns refs directly (no computed merge)
 */
export type UserRefs = {
  coreUser: Ref<User | undefined | null>
  appUser: Ref<AppUser | undefined | null>
}

export function useUserFetch(id: string | null | undefined) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const { data: coreUser } = useDocument<User | undefined>(
    id ? (doc(db, 'users', id) as any) : null
  )

  const { data: appUser } = useDocument<AppUser | undefined>(
    id && appId ? (doc(db, 'apps', appId, 'users', id) as any) : null
  )

  const user: UserRefs = { coreUser, appUser }

  return { user }
}
