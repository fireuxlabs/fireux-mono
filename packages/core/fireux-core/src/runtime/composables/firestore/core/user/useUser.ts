import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useUserFetch } from './main/useUserFetch.ts'
import { useUserComputed } from './main/useUserComputed.ts'
import { useUserEnsure } from './main/useUserEnsure.ts'
import { useUserUpdate } from './main/useUserUpdate.ts'
import { useUserDelete } from './main/useUserDelete.ts'
import { useUserInterface } from './main/useUserInterface.ts'

export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * useUser
 * - Resolves both coreUser (global) and appUser (tenant overlay)
 * - Defaults to the authenticated Firebase UID
 * - For arbitrary UID, call useUserFetch(uid) directly
 */
export function useUser() {
  const { uid } = useAuth()
  const { coreUser, appUser } = useUserFetch(uid)

  return {
    coreUser,
    appUser,
    user: coreUser,
    ...useUserComputed({ coreUser, appUser }),
    ...useUserInterface({ coreUser, appUser }),
    ...useUserEnsure({ coreUser, appUser }),
    ...useUserUpdate({ coreUser, appUser }),
    ...useUserDelete({ coreUser, appUser }),
  }
}
