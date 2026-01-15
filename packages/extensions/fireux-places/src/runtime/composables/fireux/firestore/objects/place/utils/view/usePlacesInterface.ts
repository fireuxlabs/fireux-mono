import type { BasePlace, PlaceSource } from '../../../../../../../models/objects/place.model'

export type PlaceBase = BasePlace

export namespace PlaceCard {
  export type Cell = {
    id: string
    name: string
    formatted_address: string
    imageUrl: string
    source: PlaceSource
  }

  export type Pill = {
    name: string
    imageUrl: string
  }

  export type Card = {
    id: string
    to: string

    // Canon pill fields
    avatarUrl: string
    title: string
    subtitle: string
    badges: string[]

    // Media (empty string means unset)
    imageUrl: string

    name: string
    formattedAddress: string
  }
}

export function usePlacesInterface() {
  function map(place: BasePlace): PlaceCard.Card {
    return {
      id: place.id,
      to: `/places/${place.id}`,

	  avatarUrl: place.place_image,
      title: place.name,
      subtitle: place.formatted_address,
      badges: [],

	  imageUrl: place.place_image,

      name: place.name,
      formattedAddress: place.formatted_address,
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
