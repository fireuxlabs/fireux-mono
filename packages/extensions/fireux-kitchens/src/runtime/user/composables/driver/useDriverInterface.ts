// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: Driver public identity and app-private operations.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: accept canonical User separately from Driver storage.
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  resolveProfileBadges,
  resolveProfileDisplayName,
  resolveProfileSummary,
  safeString,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/user/models/user.model'
import type {
  Driver,
  DriverDirectoryProfile,
} from '../../models/driver.model.ts'

type UserLike = Pick<User, 'display_name' | 'avatar' | 'handle'> &
  Partial<Pick<User, 'id'>>
type DriverTarget = Driver | DriverDirectoryProfile

export namespace DriverCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    avatarUrl: string
    secondaryAvatarUrl?: string
    displayName: string
    title: string
    subtitle: string
    summary: string
    badges: string[]
    handle: string
  }
}

export function useDriverInterface() {
  type DriverPill = DriverCard.Card
  type DriverCell = DriverCard.Card
  type DriverPreview = DriverCard.Card
  type DriverProfile = DriverCard.Card

  const { uid, currentUser: authUser } = useAuth()

  function resolveUserAvatar(u?: UserLike | null): string {
    const storedAvatar = safeString(u?.avatar).trim()
    if (storedAvatar) return storedAvatar

    const currentUid = safeString(uid.value).trim()
    const targetUid = safeString(u?.id).trim()
    if (!currentUid || !targetUid || currentUid !== targetUid) return ''

    return safeString(authUser.value?.photoURL).trim()
  }

  function map(p: DriverTarget, u?: UserLike | null): DriverCard.Card {
    const id =
      safeString(u?.id).trim() ||
      safeString((p as Driver & { id?: string }).id).trim()
    const handle = safeString(u?.handle).trim()
    const routeKey = handle.replace(/^@/, '').toLowerCase() || id
    const userAvatar = resolveUserAvatar(u)
    const avatarUrl = userAvatar
    const badges = resolveProfileBadges([
      (p as Driver & { tags?: string[] }).tags || [],
    ])
    const displayName = resolveProfileDisplayName([
      u?.display_name,
      safeString((p as Driver & { title?: string }).title).trim(),
      handle ? `@${handle}` : '',
      id,
    ])

    return {
      id,
      to: routeKey ? `/drivers/${encodeURIComponent(routeKey)}` : '',
      imageUrl: avatarUrl,
      avatarUrl,
      displayName,
      title: handle ? `@${handle}` : safeString((p as Driver).title).trim(),
      subtitle: safeString((p as Driver).subtitle),
      summary: resolveProfileSummary([
        (p as Driver).subtitle,
        (p as Driver).tagline,
      ]),
      badges,
      handle,
    }
  }

  function buildInterface(
    target?: DriverTarget | null,
    userOverride?: UserLike | null
  ): DriverCard.Card | null {
    if (!target) return null

    const mapped = map(target, userOverride)
    return mapped.id && mapped.displayName ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: DriverTarget | null,
    userOverride?: UserLike | null
  ): DriverPill | null {
    return buildInterface(target, userOverride)
  }

  function cell(
    target?: DriverTarget | null,
    userOverride?: UserLike | null
  ): DriverCell | null {
    return buildInterface(target, userOverride)
  }

  function preview(
    target?: DriverTarget | null,
    userOverride?: UserLike | null
  ): DriverPreview | null {
    return buildInterface(target, userOverride)
  }

  function profile(
    target?: DriverTarget | null,
    userOverride?: UserLike | null
  ): DriverProfile | null {
    return buildInterface(target, userOverride)
  }

  return {
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
