// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: opt the active user into private and app-scoped reads explicitly.
// Concurrent edit — 2026-07-20 13:40 CEST — User boundary pass: describe AppUser as governance/capability state, not another private-content bucket.
// Concurrent edit — 2026-07-21 14:45 CEST — Dashboard Overview pass: expose independent public, private-account, and App-membership read states.
// Concurrent edit — 2026-07-21 15:03 CEST — Werkbox Rules migration: point cross-user display reads at the bounded public projection.
import { computed, unref, type MaybeRef } from 'vue'
import { useUserRead } from './useUserRead'
import { useUserCreate } from './useUserCreate'
import { useUserDelete } from './useUserDelete'
import { useUserUpdate } from './useUserUpdate'

export type { User } from '../models/user.model.ts'
export { useUserRead } from './useUserRead'

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
 * CRUD deletion removes only the Core User root document and does not cascade
 * into Auth, account support, or AppUser records.
 */
export function useUser(id: MaybeRef<string | null | undefined>) {
  const userId = computed(() => String(unref(id) || '').trim())
  const { user, pending, error } = useUserRead(userId)
  const { createUser } = useUserCreate()
  const { updateUser } = useUserUpdate(userId)
  const { deleteUser } = useUserDelete()

  return {
    user,
    pending,
    error,
    create: createUser,
    update: updateUser,
    delete: () => deleteUser(userId.value),
  }
}
