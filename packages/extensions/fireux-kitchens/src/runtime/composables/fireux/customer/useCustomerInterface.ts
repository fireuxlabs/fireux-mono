import {
  resolveProfileDisplayName,
  safeString,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Customer } from '../../../models/customer.model'

type UserLike = Pick<User, 'display_name' | 'avatar' | 'handle'> &
  Partial<Pick<User, 'id'>>
type CustomerTarget = Partial<Customer> & {
  id?: string
  user?: UserLike | null
}

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
  function map(profile: Partial<Customer>, user?: UserLike | null): CustomerCard.Card {
    const id = safeString(user?.id).trim() || safeString(profile.id).trim()
    const handle = safeString(user?.handle).trim()
    const avatarUrl = safeString(user?.avatar).trim()
    const displayName = resolveProfileDisplayName([
      user?.display_name,
      handle ? `@${handle}` : '',
      id,
    ])

    return {
      id,
      to: '',
      imageUrl: avatarUrl,
      avatarUrl,
      secondaryAvatarUrl: undefined,
      displayName,
      title: handle ? `@${handle}` : 'Customer profile',
      subtitle: '',
      summary: '',
      badges: [],
      handle,
    }
  }

  function buildInterface(target?: CustomerTarget | null): CustomerCard.Card | null {
    if (!target) return null
    const mapped = map(target, target.user ?? null)
    return mapped.id && mapped.displayName ? mapped : null
  }

  return { interface: buildInterface, pill: buildInterface, cell: buildInterface }
}
