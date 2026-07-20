// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: keep public User surfaces on canonical root identity.
import {
  safeArray,
  safeString,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import {
  UserStorage,
  type User,
} from '../../../../../../../models/core/user.model'
import {
  USER_ECOSYSTEM_AVATAR_SRC,
  resolveUserAvatarSource,
} from '../../../../../../../models/core/supporting/user-avatar'
import { useAvatarProxy } from '../../../../../app/ui/useAvatarProxy'
import { normalizeUserHandle } from '../identity/useUserHandleIdentity'

export namespace UserCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    imageUrl: string
    avatarUrl: string
    secondaryAvatarUrl?: string

    displayName: string
    title: string
    subtitle: string
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

export type UserSurfaceParts<TUser extends object = Partial<User>> = {
  user?: TUser | null | undefined
}

export const USER_AVATAR_FALLBACK_SRC = USER_ECOSYSTEM_AVATAR_SRC

export function useUserInterface(userRef?: Ref<User | null | undefined>) {
  type UserPill = UserCard.Card
  type UserCell = UserCard.Card
  type UserPreview = UserCard.Card
  type UserProfile = UserCard.Card

  const { getProxiedAvatarUrl } = useAvatarProxy()

  function surface<TUser extends object = Partial<User>>(
    parts: UserSurfaceParts<TUser>
  ): (TUser & User) | null {
    const source = parts.user ?? null
    if (!source) return null

    const merged = { ...source } as TUser & User
    const id = safeString(merged.id).trim()
    if (!id) return null

    return {
      ...merged,
      id,
    }
  }

  function resolveAvatarUrl(user: User): string {
    return getProxiedAvatarUrl(resolveUserAvatarSource(user.avatar))
  }

  function map(user: User): UserCard.Card {
    const id = safeString(user.id).trim()
    const handle = normalizeUserHandle(safeString(user.handle))
    const handleLabel = handle ? `@${handle}` : ''
    const displayName = safeString(user.display_name).trim() || handleLabel || id
    const appCount = safeArray(user.app_ids).length
    const profiles = safeArray<string>(user.profiles)

    return {
      id,
      to: handle
        ? `/${UserStorage.rootCollection}/${encodeURIComponent(handle)}`
        : '',

      imageUrl: resolveAvatarUrl(user),
      avatarUrl: resolveAvatarUrl(user),
      secondaryAvatarUrl: '',
      displayName,
      title: profiles[0] || '',
      subtitle: displayName !== handleLabel ? handleLabel : '',
      summary: '',

      handle: handleLabel,
      badges: profiles,

      contactEmail: '',
      contactPhone: '',
      websiteUrl: '',

      bio: '',
      profiles,
      appsLabel: appCount ? `${appCount} app${appCount === 1 ? '' : 's'}` : '',
    }
  }

  function buildInterface(
    target?: User | null | undefined
  ): UserCard.Card | null {
    const user = target ?? userRef?.value ?? null
    if (!user) return null
    const mapped = map(user)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: User | null | undefined): UserPill | null {
    return buildInterface(target)
  }

  function cell(target?: User | null | undefined): UserCell | null {
    return buildInterface(target)
  }

  function preview(target?: User | null | undefined): UserPreview | null {
    return buildInterface(target)
  }

  function profile(target?: User | null | undefined): UserProfile | null {
    return buildInterface(target)
  }

  return {
    surface,
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
