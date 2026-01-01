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

  const isUserRefs = (value: unknown): value is UserRefs =>
    Boolean(value) && typeof value === 'object' && 'coreUser' in (value as UserRefs)

  const resolveUser = (target?: User): User => {
    const user = target ?? (isUserRefs(source) ? source.coreUser.value : source?.value)
    if (!user) {
      throw new Error('[useUserInterface] User is required')
    }
    return user
  }

  const card = (target?: User): UserCard.Card => {
    const user = resolveUser(target)

    const proxiedAvatar = getProxiedAvatarUrl(user.avatar)
    const avatar = proxiedAvatar || user.avatar

    return {
      id: user.id,
      to: `/users/${user.id}`,
      avatar,
      title: user.display_name,
      subtitle: user.handle ? `@${user.handle}` : '',
      badges: [],
      line1: user.email,
      line2: user.bio,
      line3: user.profiles.join(', '),
    }
  }

  return { card }
}
