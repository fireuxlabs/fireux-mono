import { safeString } from '../../composables/shared/useInterfaceUtils'
import type { User } from '../models/user.model'
import { resolveUserAvatarSource } from '../utils/user-avatar'
import { useAvatarProxy } from '../../composables/media/useAvatarProxy'
import { normalizeUserHandle } from '../utils/user-handle'

/** User-owned values consumed by the current card components. */
export type UserCard = {
  id: string
  to: string
  imageUrl: string
  avatarUrl: string
  displayName: string
  subtitle: string
  summary: string
  handle: string
  bio: string
}

export type UserIdentitySurface = Pick<
  User,
  'id' | 'display_name' | 'avatar' | 'handle'
> &
  Partial<Pick<User, 'bio'>>

/** Presentation only: callers supply their owning User read. */
export function useUserView() {
  const { getProxiedAvatarUrl } = useAvatarProxy()

  function map(target?: UserIdentitySurface | null): UserCard | null {
    if (!target) return null
    const id = safeString(target.id).trim()
    if (!id) return null
    const handle = normalizeUserHandle(safeString(target.handle))
    const handleLabel = handle ? `@${handle}` : ''
    const displayName = safeString(target.display_name).trim()
    const bio = safeString(target.bio).trim()
    const avatarUrl = getProxiedAvatarUrl(
      resolveUserAvatarSource(target.avatar)
    )

    return {
      id,
      to: handle ? `/users/${encodeURIComponent(handle)}` : '',
      imageUrl: avatarUrl,
      avatarUrl,
      displayName,
      subtitle: displayName !== handleLabel ? handleLabel : '',
      summary: bio,
      handle: handleLabel,
      bio,
    }
  }

  return { interface: map, pill: map, profile: map }
}
