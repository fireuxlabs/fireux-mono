// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: centralize the strict public User identity allowlist.
import { resolveUserAvatarSource } from '../../../utils/user-avatar.ts'
import type { PublicUserIdentityDto } from './public-dto.types'

const USER_HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{2,29}$/

export function mapPublicUserIdentity(
  snapshot: FirebaseFirestore.DocumentSnapshot
): PublicUserIdentityDto | null {
  if (!snapshot.exists) return null

  const data = (snapshot.data() || {}) as Record<string, unknown>
  const displayName = String(data.display_name || '').trim()
  const handle = String(data.handle || '').trim().toLowerCase()
  if (
    !displayName ||
    displayName.length > 120 ||
    !USER_HANDLE_PATTERN.test(handle)
  ) {
    return null
  }

  return {
    id: snapshot.id,
    display_name: displayName,
    avatar: resolveUserAvatarSource(data.avatar),
    handle,
  }
}
