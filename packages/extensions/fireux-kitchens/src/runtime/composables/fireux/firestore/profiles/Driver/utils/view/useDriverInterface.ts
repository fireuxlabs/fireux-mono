import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  resolveProfileBadges,
  resolveProfileDisplayName,
  resolveProfileImage,
  resolveProfileSummary,
  resolveSecondaryAvatarUrl,
  safeString,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Driver } from 'fireux-kitchens/runtime/models/profiles/Driver/Driver.model'

type UserLike = Pick<User, 'display_name' | 'avatar' | 'handle'> &
  Partial<Pick<User, 'id'>>
type DriverTarget = Driver & { user?: UserLike | null }

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

  const { uid, currentUser: authUser } = useAuth()

  function resolveUserAvatar(u?: UserLike | null): string {
    const storedAvatar = safeString(u?.avatar).trim()
    if (storedAvatar) return storedAvatar

    const currentUid = safeString(uid.value).trim()
    const targetUid = safeString(u?.id).trim()
    if (!currentUid || !targetUid || currentUid !== targetUid) return ''

    return safeString(authUser.value?.photoURL).trim()
  }

  function map(p: Driver, u?: UserLike | null): DriverCard.Card {
    const id =
      safeString(u?.id).trim() ||
      safeString((p as Driver & { id?: string }).id).trim()
    const handle = safeString(u?.handle).trim()
    const profileImage = resolveProfileImage([
      (p as Driver & { image?: string }).image,
      (p as any).avatar,
    ])
    const userAvatar = resolveUserAvatar(u)
    const avatarUrl = profileImage || userAvatar
    const relationBadge = driverKitchenRelationLabel(
      (p as Driver).kitchen_links
    )
    const badges = resolveProfileBadges([
      [
        ...((p as Driver & { tags?: string[] }).tags || []),
        relationBadge,
      ].filter(Boolean),
    ])
    const secondaryAvatarUrl = resolveSecondaryAvatarUrl(avatarUrl, userAvatar)
    const displayName = resolveProfileDisplayName([
      (p as Driver).driver_name,
      u?.display_name,
      safeString((p as any).display_name).trim(),
      safeString((p as Driver & { title?: string }).title).trim(),
      handle ? `@${handle}` : '',
      id,
    ])

    return {
      id,
      to: '',
      imageUrl: avatarUrl,
      avatarUrl,
      secondaryAvatarUrl,
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

  function buildInterface(target?: DriverTarget | null): DriverCard.Card | null {
    if (!target) return null

    const mapped = map(target, target.user ?? null)
    return mapped.id && mapped.displayName ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: DriverTarget | null): DriverPill | null {
    return buildInterface(target)
  }

  function cell(target?: DriverTarget | null): DriverCell | null {
    return buildInterface(target)
  }

  return {
    interface: toInterface,
    pill,
    cell,
  }
}

function driverKitchenRelationLabel(
  links: Driver['kitchen_links'] | undefined
) {
  const active = (links || []).find((link) => link.active)
  if (!active) return ''
  if (active.relation === 'exclusive') return 'house driver'
  if (active.relation === 'preferred') return 'preferred driver'
  return 'available driver'
}
