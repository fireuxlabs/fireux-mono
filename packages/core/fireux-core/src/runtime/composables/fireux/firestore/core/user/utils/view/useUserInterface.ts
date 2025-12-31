// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts

import type { Ref } from 'vue'
import type { User } from '../../../../../../../models/core/user.model'
import type { UserRefs } from '../../fetch/useUserFetch'
import { useAvatarProxy } from '../../../../../app/ui/useAvatarProxy'

export namespace UserCard {
  export type Card = {
    id: string
    to: string
    avatar: string
    title: string
    subtitle: string
    badges: string[]
    line1: string
    line2: string
    line3: string
  }
}

export function useUserInterface(source?: Ref<User | null | undefined> | UserRefs) {
  const { getProxiedAvatarUrl } = useAvatarProxy()

  const resolve = (): User | undefined => {
    if (!source) return undefined
    if ('coreUser' in (source as UserRefs)) {
      return (source as UserRefs).coreUser.value || undefined
    }
    return (source as Ref<User | null | undefined>).value || undefined
  }

  const toUser = (target?: User): User | undefined => target || resolve()

  const card = (target?: User): UserCard.Card => {
    const user = toUser(target)

    const id = String(user?.id || '').trim()
    const to = id ? `/users/${id}` : ''

    const rawAvatar = String(user?.avatar || '').trim()
    const avatar = rawAvatar ? getProxiedAvatarUrl(rawAvatar) || rawAvatar : ''

    const title = String(user?.display_name || user?.handle || id || 'User').trim() || 'User'
    const handle = String(user?.handle || '').trim()
    const subtitle = handle ? `@${handle}` : ''

    const line1 = String(user?.email || '').trim()
    const line2 = String((user as any)?.bio || '').trim()
    const profiles = Array.isArray((user as any)?.profiles)
      ? ((user as any).profiles as unknown[]).map((p) => String(p).trim()).filter(Boolean)
      : []
    const line3 = profiles.length ? profiles.join(', ') : ''

    return {
      id,
      to,
      avatar,
      title,
      subtitle,
      badges: [],
      line1,
      line2,
      line3,
    }
  }

  return { card }
}
