// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: opt the active user into private and app-scoped reads explicitly.
// Concurrent edit — 2026-07-20 13:40 CEST — User boundary pass: describe AppUser as governance/capability state, not another private-content bucket.
// Concurrent edit — 2026-07-21 14:45 CEST — Dashboard Overview pass: expose independent public, private-account, and App-membership read states.
// Concurrent edit — 2026-07-21 15:03 CEST — Werkbox Rules migration: point cross-user display reads at the bounded public projection.
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useUserFetch } from './firestore/fetch/useUserFetch'
import { useUserComputed } from './useUserComputed'
import { useUserInterface } from './useUserInterface'

export type { User } from '../models/user.model.ts'
export type { UserAccount } from '../models/user-account.model.ts'
export { useUserFetch } from './firestore/fetch/useUserFetch'

/**
 * FireUX stack family: Active identity + app membership.
 * Entity: User.
 * Entity map: docs/concepts/entities.md
 *
 * This seam resolves the active authenticated user, not an arbitrary root User.
 * User is public identity; UserAccount is account data; AppUser is the current
 * app's membership, authorization, and capability record.
 * For cross-user display reads, use useUserIdentitySummary so callers receive
 * only the bounded public projection instead of a raw User document.
 * Entity commands remain explicit `useUserCreate/Update/Delete` imports; this
 * active-session aggregate does not advertise unsupported lifecycle parity.
 */
export function useUser() {
  const { uid } = useAuth()
  const refs = useUserFetch(uid, { app: true, private: true })

  return {
    ...refs,
    ...useUserComputed(refs, refs.pending),
    ...useUserInterface(refs.user),
  }
}
