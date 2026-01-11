// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts

import type { Ref } from 'vue'
import type { User } from '../../../../../../../models/core/user.model'

export namespace UserCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    displayName: string

    // Public profile handle (empty string means unset)
    handle: string
    badges: string[]

    // IMPORTANT: do not expose user.email on public UI surfaces.
    bio: string
    profiles: string[]
    apps: string
  }
}

export function useUserInterface(userRef?: Ref<User | null | undefined>) {
  function map(user: User): UserCard.Card {
    const appCount = user.userOf.length
    const handle = user.handle.trim()

    return {
      id: user.id,
      to: `/users/${user.id}`,

      avatarUrl: user.avatar,
      displayName: user.display_name,
      handle: handle ? `@${handle}` : '',
      badges: [],

      bio: user.bio,
      profiles: user.profiles,
      apps: appCount ? `${appCount} apps` : '',
    }
  }

  function searchText(user: User): string {
    return `${user.display_name} ${user.handle} ${user.id}`.trim().toLowerCase()
  }

  function card(target?: User | null | undefined): UserCard.Card | null {
    const user = target ?? userRef?.value
    return user ? map(user) : null
  }

  return { card, searchText }
}