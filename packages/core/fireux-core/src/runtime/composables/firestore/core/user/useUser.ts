import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useUserFetch } from './main/useUserFetch.ts'
import { useUserComputed } from './main/useUserComputed.ts'
import { useUserEnsure } from './main/useUserEnsure.ts'
import { useUserUpdate } from './main/useUserUpdate.ts'
import { useUserDelete } from './main/useUserDelete.ts'
import { useUserInterface } from './main/useUserInterface.ts'

/**
 * DO NOT REFACTOR:
 * This composable intentionally returns the grouped refs from useUserFetch:
 *   { user } where user = { coreUser, appUser }
 * Helpers (computed/ensure/update/delete) depend on that exact shape.
 */
export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

export function useUser() {
  const { uid } = useAuth()
  const { user } = useUserFetch(uid.value)

  return {
    user,
    ...useUserComputed(user),
    ...useUserInterface(user),
    ...useUserEnsure(user),
    ...useUserUpdate(user),
    ...useUserDelete(user),
  }
}
