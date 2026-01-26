import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Kitchen } from '../../../../../../../models/objects/kitchen.model'

export namespace KitchenCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    title: string
    subtitle: string

    name: string
    website: string

    // Status/label chips
    badges: string[]
  }
}

export function useKitchenInterface() {
  function map(kitchen: Kitchen): KitchenCard.Card {
    const id = safeString(kitchen.id).trim()
    const name = safeString(kitchen.name)
    const website = safeString(kitchen.website)
    const address = safeString((kitchen as any)?.formatted_address)

    return {
      id,
      to: id ? `/kitchens/${id}` : '',

      avatarUrl: safeString((kitchen as any)?.place_image),
      title: name,
      subtitle: address,

      name,
      website,

      badges: [],
    }
  }

  function card(target?: Kitchen | null | undefined): KitchenCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function searchText(kitchen: Kitchen): string {
    const name = safeString(kitchen.name)
    const website = safeString(kitchen.website)
    const id = safeString(kitchen.id)
    return `${name} ${website} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
