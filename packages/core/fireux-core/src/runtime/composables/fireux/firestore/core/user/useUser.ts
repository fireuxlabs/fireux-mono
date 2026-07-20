// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: opt the active user into private and app-scoped reads explicitly.
// Concurrent edit — 2026-07-20 13:40 CEST — User boundary pass: describe UserApp as governance/capability state, not another private-content bucket.
import { useAuth } from '../../../firebase/useAuth'
import { useUserFetch } from './fetch/useUserFetch'
import { useUserCreate } from './mutations/useUserCreate'
import { useUserDelete } from './mutations/useUserDelete'
import { useUserUpdate } from './mutations/useUserUpdate'
import { useUserComputed } from './utils/view/useUserComputed'
import { useUserInterface } from './utils/view/useUserInterface'

export type { User, UserApp, UserPrivate } from '../../../../../models/core/user.model'
export { useUserFetch } from './fetch/useUserFetch'
export { useUserInterface } from './utils/view/useUserInterface'

/**
 * FireUX stack family: Active identity + app membership.
 * Entity: User.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 *
 * This seam resolves the active authenticated user, not an arbitrary root User.
 * User is public identity; UserPrivate is account data; UserApp is the current
 * app's membership, authorization, and capability record.
 * For arbitrary uid reads, call useUserFetch(uid) directly.
 */
export function useUser() {
  const { uid } = useAuth()
  const refs = useUserFetch(uid, { app: true, private: true })
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
