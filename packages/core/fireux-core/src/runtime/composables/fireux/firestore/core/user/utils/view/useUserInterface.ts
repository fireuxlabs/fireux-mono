// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts

import type { Ref } from 'vue'
import type { User } from '../../../../../../../models/core/user.model'

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

export function useUserInterface(userRef?: Ref<User | null | undefined>) {
  function map(user: User): UserCard.Card {
    return {
      id: user.id,
      to: `/users/${user.id}`,

      avatar: user.avatar,
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
    const user = target ?? userRef?.value
    return user ? map(user) : null
  }

  return { card }
}