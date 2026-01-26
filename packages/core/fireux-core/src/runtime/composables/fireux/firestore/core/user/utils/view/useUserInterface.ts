import { safeArray, safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import type { User } from '../../../../../../../models/core/user.model'

export namespace UserCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    displayName: string

    // Public handle (empty string means unset)
    handle: string

    badges: string[]

    // IMPORTANT: do not expose user.email on public UI surfaces.
    bio: string
    profiles: string[]
    appsLabel: string
  }
}

export function useUserInterface(userRef?: Ref<User | null | undefined>) {
  function map(user: User): UserCard.Card {
    const id = safeString(user.id).trim()
    const handle = safeString(user.handle).trim()
    const appCount = safeArray(user.userOf).length

    return {
      id,
      to: id ? `/users/${id}` : '',

      avatarUrl: safeString(user.avatar).trim(),
      displayName: safeString(user.display_name).trim(),

      handle: handle ? `@${handle}` : '',
      badges: [],

      bio: safeString(user.bio),
      profiles: safeArray<string>(user.profiles),
      appsLabel: appCount ? `${appCount} apps` : '',
    }
  }

  function card(target?: User | null | undefined): UserCard.Card | null {
    const user = target ?? userRef?.value ?? null
    if (!user) return null
    const mapped = map(user)
    return mapped.id ? mapped : null
  }

  function searchText(user: User): string {
    const displayName = safeString(user.display_name)
    const handle = safeString(user.handle)
    const id = safeString(user.id)
    return `${displayName} ${handle} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
