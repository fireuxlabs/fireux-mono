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
    return {
      id: kitchen.id,
      to: `/kitchens/${kitchen.id}`,

      avatarUrl: kitchen.place_image,
      title: kitchen.name,
      subtitle: kitchen.website,

      name: kitchen.name,
      website: kitchen.website,

      badges: [],
    }
  }

  function card(target?: Kitchen | null | undefined): KitchenCard.Card | null {
    return target ? map(target) : null
  }

  function searchText(kitchen: Kitchen): string {
    return `${kitchen.name} ${kitchen.website} ${kitchen.id}`.toLowerCase()
  }

  return { card, searchText }
}
