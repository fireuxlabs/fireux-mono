import { useAuth } from '../../../firebase/useAuth'
import { useUserFetch } from './fetch/useUserFetch'
import { useUserCreate } from './mutations/useUserCreate'
import { useUserDelete } from './mutations/useUserDelete'
import { useUserUpdate } from './mutations/useUserUpdate'
import { useUserComputed } from './utils/view/useUserComputed'
import { useUserInterface } from './utils/view/useUserInterface'

export type { AppUser, User } from '../../../../../models/core/user.model'

/**
 * FireUX stack family: Active identity + app overlay.
 * Entity: User.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 *
 * This seam resolves the active authenticated user, not an arbitrary root User.
 * Root User is shared identity; AppUser carries app-specific role/capability state.
 * For arbitrary uid reads, call useUserFetch(uid) directly.
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
    ...useUserCreate(),
    ...useUserUpdate(refs, 'useUser'),
    ...useUserDelete(refs),
  }
}
