import { safeArray, safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import type { UserCore } from '../../../../../../../models/core/user.model'
import { normalizeUserHandle } from '../identity/useUserHandleIdentity'

export namespace UserCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string
    secondaryAvatarUrl?: string

    displayName: string
    title: string
    summary: string

    // Public handle (empty string means unset)
    handle: string

    badges: string[]

    contactEmail: string
    contactPhone: string
    websiteUrl: string

    // IMPORTANT: do not expose user.email on public UI surfaces.
    bio: string
    profiles: string[]
    appsLabel: string
  }
}

export function useUserInterface(userRef?: Ref<UserCore | null | undefined>) {
  type UserPill = UserCard.Card
  type UserCell = UserCard.Card
  type UserPreview = UserCard.Card
  type UserProfile = UserCard.Card

  function map(user: UserCore): UserCard.Card {
    const id = safeString(user.id).trim()
    const handle = normalizeUserHandle(safeString(user.handle))
    const appCount = safeArray(user.userOf).length
    const profiles = safeArray<string>(user.profiles)

    return {
      id,
      to: handle ? `/users/${encodeURIComponent(handle)}` : '',

      avatarUrl: safeString(user.avatar).trim(),
      secondaryAvatarUrl: '',
      displayName: safeString(user.display_name).trim(),
      title: profiles[0] || '',
      summary: safeString(user.bio),

      handle: handle ? `@${handle}` : '',
      badges: profiles,

      contactEmail: '',
      contactPhone: '',
      websiteUrl: '',

      bio: safeString(user.bio),
      profiles,
      appsLabel: appCount ? `${appCount} apps` : '',
    }
  }

  function buildInterface(target?: UserCore | null | undefined): UserCard.Card | null {
    const user = target ?? userRef?.value ?? null
    if (!user) return null
    const mapped = map(user)
    return mapped.id ? mapped : null
  }

  function pill(target?: UserCore | null | undefined): UserPill | null {
    return buildInterface(target)
  }

  function cell(target?: UserCore | null | undefined): UserCell | null {
    return buildInterface(target)
  }

  function preview(target?: UserCore | null | undefined): UserPreview | null {
    return buildInterface(target)
  }

  function profile(target?: UserCore | null | undefined): UserProfile | null {
    return buildInterface(target)
  }

  function searchText(user: UserCore): string {
    const displayName = safeString(user.display_name)
    const handle = safeString(user.handle)
    const id = safeString(user.id)
    return `${displayName} ${handle} ${id}`.trim().toLowerCase()
  }

  return { interface: buildInterface, pill, cell, preview, profile, searchText }
}
