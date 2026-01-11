import type {
  BasePlace as PlaceBase,
  Place as PlaceEntity,
  PlaceSource,
} from '../../../../../../../models/place.model'

export type { PlaceBase, PlaceEntity, PlaceSource }

export namespace PlaceCard {
  export interface Pill {
    id: string
    name: string

    // Media (empty string means unset)
    imageUrl: string
  }

  export interface Cell extends Pill {
    source: PlaceSource
    formatted_address: string
  }
}

export function usePlacesInterface() {
  function toCell(place: PlaceBase): PlaceCard.Cell {
    return {
      id: place.id,
      name: place.name,
      imageUrl: place.image_url,
      source: place.source,
      formatted_address: place.formatted_address,
    }
  }

  function card(place: PlaceBase): PlaceCard.Cell
  function card(place?: PlaceBase | null | undefined): PlaceCard.Cell | null
  function card(place?: PlaceBase | null | undefined): PlaceCard.Cell | null {
    return place ? toCell(place) : null
  }

  function searchText(place: PlaceBase): string {
    return `${place.name} ${place.formatted_address} ${place.id}`.trim().toLowerCase()
  }

  return { card, toCell, searchText }
}

