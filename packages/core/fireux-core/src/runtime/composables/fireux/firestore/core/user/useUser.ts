// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: opt the active user into private and app-scoped reads explicitly.
// Concurrent edit — 2026-07-20 13:40 CEST — User boundary pass: describe AppUser as governance/capability state, not another private-content bucket.
// Concurrent edit — 2026-07-21 14:45 CEST — Dashboard Overview pass: expose independent public, private-account, and App-membership read states.
// Concurrent edit — 2026-07-21 15:03 CEST — Werkbox Rules migration: point cross-user display reads at the bounded public projection.
import { useAuth } from '../../../firebase/useAuth'
import { useUserFetch } from './fetch/useUserFetch'
import { useUserCreate } from './mutations/useUserCreate'
import { useUserDelete } from './mutations/useUserDelete'
import { useUserUpdate } from './mutations/useUserUpdate'
import { useUserComputed } from './utils/view/useUserComputed'
import { useUserInterface } from './utils/view/useUserInterface'

export type { User, AppUser } from '../../../../../models/core/user.model'
export type { UserAccount } from '../../../../../models/operations/user-account.model'
export { useUserFetch } from './fetch/useUserFetch'
export { useUserInterface } from './utils/view/useUserInterface'

/**
 * FireUX stack family: Active identity + app membership.
 * Entity: User.
 * Entity map: docs/concepts/entities.md
 *
 * This seam resolves the active authenticated user, not an arbitrary root User.
 * User is public identity; UserAccount is account data; AppUser is the current
 * app's membership, authorization, and capability record.
 * For cross-user display reads, use usePublicUserIdentity so callers receive
 * only the bounded public projection instead of a raw User document.
 */
export function useUser() {
  const { uid } = useAuth()
  const refs = useUserFetch(uid, { app: true, private: true })

  return {
    ...refs,
    ...useUserComputed(refs, refs.pending),
    ...useUserInterface(refs.user),
    ...useUserCreate(),
    ...useUserUpdate(refs, 'useUser'),
    ...useUserDelete(refs),
  }
}
