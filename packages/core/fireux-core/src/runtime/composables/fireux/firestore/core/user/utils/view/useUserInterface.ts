import type { Ref } from 'vue'
import type {
  User,
  UserCard,
} from '../../../../../../../models/core/user.model'
import type { UserRefs } from '../../fetch/useUserFetch'
import { useAvatarProxy } from '../../../../../app/ui/useAvatarProxy'

export function useUserInterface(
  source?: Ref<User | null | undefined> | UserRefs
) {
  const { getProxiedAvatarUrl } = useAvatarProxy()

  const resolve = (): User | null => {
    if (!source) return null
    if ('coreUser' in (source as UserRefs)) {
      return (source as UserRefs).coreUser.value ?? null
    }
    return (source as Ref<User | null | undefined>).value ?? null
  }

  const toUser = (target?: User | null): User | null => target ?? resolve()

  const toPath = (id: string) => (id ? `/users/${id}` : '')

  const card = (target?: User | null): UserCard.Card => {
    const user = toUser(target)
    const id = (user?.id ?? '').trim()
    const href = toPath(id)

    const title =
      (user?.display_name ?? '').trim() ||
      (user?.handle ?? '').trim() ||
      id ||
      'User'

    const handle = (user?.handle ?? '').trim()
    const subtitle = handle ? `@${handle}` : ''

    const rawAvatar = (user?.avatar ?? '').trim()
    const image = rawAvatar
      ? getProxiedAvatarUrl(rawAvatar) || rawAvatar
      : ''

    return { title, subtitle, image, href, badges: [] }
  }

  return { card }
}
