
import type { PlaceDoc } from '../../packages/extensions/fireux-places/src/runtime/models/objects/place.model'

export namespace PlaceCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    imageUrl: string

    name: string
    formattedAddress: string
  }
}

export function usePlacesInterface() {
  function map(place: PlaceDoc): PlaceCard.Card {
    return {
      id: place.id,
      to: `/places/${place.id}`,

      imageUrl: place.image_url,

      name: place.name,
      formattedAddress: place.formatted_address,
    }
  }

  function card(target?: PlaceDoc | null | undefined): PlaceCard.Card | null {
    return target ? map(target) : null
  }

  function searchText(place: PlaceDoc): string {
    return `${place.name} ${place.formatted_address} ${place.id}`.toLowerCase()
  }

  return { card, searchText }
}
