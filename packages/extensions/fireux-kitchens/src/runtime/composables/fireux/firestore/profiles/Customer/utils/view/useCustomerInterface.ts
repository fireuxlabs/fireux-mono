import {
  resolveProfileBadges,
  resolveProfileDisplayName,
  resolveProfileImage,
  resolveProfileSummary,
  resolveSecondaryAvatarUrl,
  safeString,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Customer } from 'fireux-kitchens/runtime/models/customer.model'

type UserLike = Pick<User, 'display_name' | 'avatar' | 'handle'> &
  Partial<Pick<User, 'id'>>
type CustomerTarget = Customer & { user?: UserLike | null }

export namespace CustomerCard {
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

export function useCustomerInterface() {
  type CustomerPill = CustomerCard.Card
  type CustomerCell = CustomerCard.Card

  const { uid, currentUser: authUser } = useAuth()

  function resolveUserAvatar(u?: UserLike | null): string {
    const storedAvatar = safeString(u?.avatar).trim()
    if (storedAvatar) return storedAvatar

    const currentUid = safeString(uid.value).trim()
    const targetUid = safeString(u?.id).trim()
    if (!currentUid || !targetUid || currentUid !== targetUid) return ''

    return safeString(authUser.value?.photoURL).trim()
  }

  function map(p: Customer, u?: UserLike | null): CustomerCard.Card {
    const id =
      safeString(u?.id).trim() ||
      safeString((p as Customer & { id?: string }).id).trim()
    const handle = safeString(u?.handle).trim()
    const profileImage = resolveProfileImage([
      (p as Customer & { image?: string }).image,
      (p as any).avatar,
    ])
    const userAvatar = resolveUserAvatar(u)
    const avatarUrl = profileImage || userAvatar
    const badges = resolveProfileBadges([
      (p as Customer & { tags?: string[] }).tags,
    ])
    const secondaryAvatarUrl = resolveSecondaryAvatarUrl(avatarUrl, userAvatar)
    const displayName = resolveProfileDisplayName([
      u?.display_name,
      safeString((p as any).display_name).trim(),
      safeString((p as Customer & { title?: string }).title).trim(),
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
      title: handle ? `@${handle}` : id,
      subtitle: safeString((p as Customer & { subtitle?: string }).subtitle),
      summary: resolveProfileSummary([
        (p as Customer & { tagline?: string }).tagline,
      ]),
      badges,
      handle,
    }
  }

  function buildInterface(target?: CustomerTarget | null): CustomerCard.Card | null {
    if (!target) return null

    const mapped = map(target, target.user ?? null)
    return mapped.id && mapped.displayName ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: CustomerTarget | null): CustomerPill | null {
    return buildInterface(target)
  }

  function cell(target?: CustomerTarget | null): CustomerCell | null {
    return buildInterface(target)
  }

  return {
    interface: toInterface,
    pill,
    cell,
  }
}
