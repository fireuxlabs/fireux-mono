import type { User } from '../models/user.model'
import { resolveUserAvatarSource } from '../utils/user-avatar'
import { useAvatarProxy } from '../../composables/media/useAvatarProxy'

/** Calculated presentation; the User retains its stored identity fields. */
export type UserView = {
  handleLabel: string
  avatarUrl: string
  to: string
}

/** Format a supplied User without acquiring data or copying stored fields. */
export function useUserView() {
  const { getProxiedAvatarUrl } = useAvatarProxy()

  function toView(
    user: Pick<User, 'id' | 'handle' | 'avatar'> | null | undefined
  ): UserView | null {
    if (!user?.id.trim()) return null
    return {
      handleLabel: user.handle ? `@${user.handle}` : '',
      avatarUrl: getProxiedAvatarUrl(resolveUserAvatarSource(user.avatar)),
      to: user.handle ? `/users/${encodeURIComponent(user.handle)}` : '',
    }
  }

  return { toView }
}
