// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: project Customer cards from public User identity only.
import {
  resolveProfileDisplayName,
  safeString,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Customer } from '../../../../../../../models/customer.model'

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
  type CustomerPill = CustomerCard.Card
  type CustomerCell = CustomerCard.Card

  function map(p: Partial<Customer>, u?: UserLike | null): CustomerCard.Card {
    const id =
      safeString(u?.id).trim() ||
      safeString((p as Customer & { id?: string }).id).trim()
    const handle = safeString(u?.handle).trim()
    const avatarUrl = safeString(u?.avatar).trim()
    const displayName = resolveProfileDisplayName([
      u?.display_name,
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
