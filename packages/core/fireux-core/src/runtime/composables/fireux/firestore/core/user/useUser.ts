import { useAuth } from '../../../firebase/useAuth'
import { useUserFetch } from './fetch/useUserFetch'
import { useUserDelete } from './mutations/useUserDelete'
import { useUserEnsure } from './mutations/useUserEnsure'
import { useUserUpdate } from './mutations/useUserUpdate'
import { useUserComputed } from './utils/view/useUserComputed'
import { useUserInterface } from './utils/view/useUserInterface'

export type { AppUser, CoreUser } from '../../../../../models/core/user.model'

/**
 * useUser
 * - Resolves both coreUser (global) and appUser (tenant overlay)
 * - Defaults to the authenticated Firebase UID
 * - For arbitrary UID, call useUserFetch(uid) directly
 */
export function useUser() {
  const { uid } = useAuth()
  const refs = useUserFetch(uid)
  const { user, coreUser, appUser, pending } = refs

  return {
    user,
    coreUser,
    appUser,
    pending,
    ...useUserComputed(refs, pending),
    ...useUserInterface(user),
    ...useUserEnsure(),
    ...useUserUpdate(refs, 'useUser'),
    ...useUserDelete(refs),
  }
}
