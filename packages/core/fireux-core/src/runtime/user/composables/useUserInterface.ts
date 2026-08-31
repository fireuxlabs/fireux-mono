// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: keep public User surfaces on canonical root identity.
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: accept minimal allowlisted User identity on public and admin cards.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: map optional biography into shared User cards.
import { safeString } from '../../composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import type { User } from '../models/user.model.ts'
import {
  resolveUserAvatarSource,
  USER_ECOSYSTEM_AVATAR_SRC,
} from '../utils/user-avatar'
import { useAvatarProxy } from '../../composables/media/useAvatarProxy'
import { normalizeUserHandle } from './firestore/utils/identity/useUserHandleIdentity'

export type UserCard = {
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

export type UserSurfaceParts<TUser extends object = Partial<User>> = {
  user?: TUser | null | undefined
}

export type UserIdentitySurface = Pick<
  User,
  'id' | 'display_name' | 'avatar' | 'handle'
> &
  Partial<Pick<User, 'bio'>>

export const USER_AVATAR_FALLBACK_SRC = USER_ECOSYSTEM_AVATAR_SRC

export function useUserInterface(
  userRef?: Ref<UserIdentitySurface | null | undefined>
) {
  type UserPill = UserCard
  type UserCell = UserCard
  type UserPreview = UserCard
  type UserProfile = UserCard

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

  function resolveAvatarUrl(user: UserIdentitySurface): string {
    return getProxiedAvatarUrl(resolveUserAvatarSource(user.avatar))
  }

  function map(user: UserIdentitySurface): UserCard {
    const id = safeString(user.id).trim()
    const handle = normalizeUserHandle(safeString(user.handle))
    const handleLabel = handle ? `@${handle}` : ''
    const displayName = safeString(user.display_name).trim() || handleLabel || id
    const bio = safeString(user.bio).trim()
    const profiles: string[] = []

    return {
      id,
      to: handle
        ? `/${'users'}/${encodeURIComponent(handle)}`
        : '',

      imageUrl: resolveAvatarUrl(user),
      avatarUrl: resolveAvatarUrl(user),
      secondaryAvatarUrl: '',
      displayName,
      title: profiles[0] || '',
      subtitle: displayName !== handleLabel ? handleLabel : '',
      summary: bio,

      handle: handleLabel,
      badges: profiles,

      contactEmail: '',
      contactPhone: '',
      websiteUrl: '',

      bio,
      profiles,
      appsLabel: '',
    }
  }

  function buildInterface(
    target?: UserIdentitySurface | null | undefined
  ): UserCard | null {
    const user = target ?? userRef?.value ?? null
    if (!user) return null
    const mapped = map(user)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: UserIdentitySurface | null | undefined): UserPill | null {
    return buildInterface(target)
  }

  function cell(target?: UserIdentitySurface | null | undefined): UserCell | null {
    return buildInterface(target)
  }

  function preview(target?: UserIdentitySurface | null | undefined): UserPreview | null {
    return buildInterface(target)
  }

  function profile(target?: UserIdentitySurface | null | undefined): UserProfile | null {
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
