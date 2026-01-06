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

  function resolveUser(target?: User | null | undefined): User | null {
    return target ?? (isUserRefs(source) ? source.coreUser.value : source?.value) ?? null
  }

  function map(user: User): UserCard.Card {
    const proxiedAvatar = getProxiedAvatarUrl(user.avatar)

    return {
      id: user.id,
      to: `/users/${user.id}`,

      avatar: proxiedAvatar || user.avatar,
      title: user.display_name,
      subtitle: user.handle ? `@${user.handle}` : '',
      badges: [],

      line1: user.email,
      line2: user.bio,
      line3: (user.profiles ?? []).join(', '),
    }
  }

  function card(target: User): UserCard.Card
  function card(target?: User | null | undefined): UserCard.Card | null
  function card(target?: User | null | undefined): UserCard.Card | null {
    const user = resolveUser(target)
    return user ? map(user) : null
  }

  return { card }
}