// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: opt the active user into private and app-scoped reads explicitly.
// Concurrent edit — 2026-07-20 13:40 CEST — User boundary pass: describe AppUser as governance/capability state, not another private-content bucket.
// Concurrent edit — 2026-07-21 14:45 CEST — Dashboard Overview pass: expose independent public, private-account, and App-membership read states.
// Concurrent edit — 2026-07-21 15:03 CEST — Werkbox Rules migration: point cross-user display reads at the bounded public projection.
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useUserRead } from './firestore/fetch/useUserRead'
import { useAppUserRead } from '../../app/composables/firestore/fetch/useAppUserRead'
import { useUserCreate } from './firestore/mutations/useUserCreate'
import { useUserUpdate } from './firestore/mutations/useUserUpdate'
import { useUserComputed } from './useUserComputed'
import { useUserInterface } from './useUserInterface'

export type { User } from '../models/user.model.ts'
export type { UserAccount } from '../models/user-account.model.ts'
export { useUserRead } from './firestore/fetch/useUserRead'

/**
 * FireUX stack family: Active identity + app membership.
 * Entity: User.
 * Entity map: docs/concepts/entities.md
 *
 * This seam resolves the active authenticated user, not an arbitrary root User.
 * Core User owns identity and private account data. AppUser is the current
 * App's separate membership, role, subscription, and profile record.
 * For cross-user display reads, use useUserIdentitySummary so callers receive
 * only the bounded public projection instead of a raw User document.
 * Account deletion is not exposed until a real trusted delete flow exists.
 */
export function useUser() {
  const { uid } = useAuth()
  const core = useUserRead(uid, { account: true })
  const app = useAppUserRead(uid)
  const refs = { ...core, ...app }
  const create = useUserCreate()
  const update = useUserUpdate(refs)

  return {
    ...refs,
    create,
    update,
    ...useUserComputed(refs, refs.pending),
    ...useUserInterface(refs.user),
  }
}
