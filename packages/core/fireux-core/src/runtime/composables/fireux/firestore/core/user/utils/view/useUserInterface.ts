import { safeArray, safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import type { CoreUser } from '../../../../../../../models/core/user.model'
import { useAuth } from '../../../../../firebase/useAuth'
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

export function useUserInterface(userRef?: Ref<CoreUser | null | undefined>) {
  type UserPill = UserCard.Card
  type UserCell = UserCard.Card
  type UserPreview = UserCard.Card
  type UserProfile = UserCard.Card

  const { uid, currentUser: authUser } = useAuth()

  function resolveAvatarUrl(user: CoreUser): string {
    const storedAvatar = safeString(user.avatar).trim()
    if (storedAvatar) return storedAvatar

    const currentUid = safeString(uid.value).trim()
    const targetUid = safeString(user.id).trim()
    if (!currentUid || !targetUid || currentUid !== targetUid) return ''

    return safeString(authUser.value?.photoURL).trim()
  }

  function map(user: CoreUser): UserCard.Card {
    const id = safeString(user.id).trim()
    const handle = normalizeUserHandle(safeString(user.handle))
    const appCount = safeArray(user.userOf).length
    const profiles = safeArray<string>(user.profiles)

    return {
      id,
      to: handle ? `/users/${encodeURIComponent(handle)}` : '',

      avatarUrl: resolveAvatarUrl(user),
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

  function buildInterface(target?: CoreUser | null | undefined): UserCard.Card | null {
    const user = target ?? userRef?.value ?? null
    if (!user) return null
    const mapped = map(user)
    return mapped.id ? mapped : null
  }

  function pill(target?: CoreUser | null | undefined): UserPill | null {
    return buildInterface(target)
  }

  function cell(target?: CoreUser | null | undefined): UserCell | null {
    return buildInterface(target)
  }

  function preview(target?: CoreUser | null | undefined): UserPreview | null {
    return buildInterface(target)
  }

  function profile(target?: CoreUser | null | undefined): UserProfile | null {
    return buildInterface(target)
  }

  function searchText(user: CoreUser): string {
    const displayName = safeString(user.display_name)
    const handle = safeString(user.handle)
    const id = safeString(user.id)
    return `${displayName} ${handle} ${id}`.trim().toLowerCase()
  }

  return { interface: buildInterface, pill, cell, preview, profile, searchText }
}
