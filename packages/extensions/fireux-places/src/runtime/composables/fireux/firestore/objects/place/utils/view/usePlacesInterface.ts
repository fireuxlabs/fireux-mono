import type { BasePlace, PlaceSource } from '../../../../../../../models/objects/place.model'

export namespace PlaceCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    title: string
    subtitle: string

    // Status/label chips
    badges: string[]

    name: string
    formattedAddress: string

    // Secondary media (empty string means unset)
    imageUrl: string

    // Source metadata
    source?: PlaceSource
  }
}

export function usePlacesInterface() {
  function map(place: BasePlace): PlaceCard.Card {
    return {
      id: place.id,
      to: `/places/${encodeURIComponent(place.id)}`,

      avatarUrl: place.place_image,
      title: place.name,
      subtitle: place.formatted_address,
      badges: [],

      name: place.name,
      formattedAddress: place.formatted_address,

      imageUrl: place.place_image,

      source: place.source,
    }
  }

  function card(target?: BasePlace | null | undefined): PlaceCard.Card | null {
    return target ? map(target) : null
  }

  function searchText(place: BasePlace): string {
    return `${place.name} ${place.formatted_address} ${place.id}`.toLowerCase()
  }

  return { card, searchText }
}
