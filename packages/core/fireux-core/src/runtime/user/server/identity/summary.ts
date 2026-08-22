import type { UserIdentitySummary } from '../../models/user-directory.model.ts'
import {
  isUserDirectoryEligible,
  normalizeUser,
} from '../../utils/normalize-user.ts'

export function readUserIdentitySummary(
  snapshot: FirebaseFirestore.DocumentSnapshot
): UserIdentitySummary | null {
  if (!snapshot.exists) return null

  const user = normalizeUser(snapshot.id, snapshot.data())
  if (!user || !isUserDirectoryEligible(user) || !user.display_name) return null

  return {
    id: user.id,
    display_name: user.display_name,
    avatar: user.avatar,
    handle: user.handle,
  }
}
