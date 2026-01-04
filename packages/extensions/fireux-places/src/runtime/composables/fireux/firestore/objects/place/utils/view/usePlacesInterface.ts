import type {
  BasePlace as PlaceBase,
  Place as PlaceEntity,
  PlaceSource,
} from '../../../../../../../models/objects/place.model'

export type { PlaceBase, PlaceEntity, PlaceSource }

export namespace PlaceCard {
  export interface Pill {
    place_id: string
    name: string
    avatar?: string | null
  }

  export interface Cell extends Pill {
    source: PlaceSource
    formatted_address?: string
  }
}

export function usePlacesInterface() {
  function toCell(place: PlaceBase): PlaceCard.Cell {
    return {
      place_id: place.place_id,
      name: place.name,
      avatar: place.avatar ?? null,
      source: place.source,
      formatted_address: place.formatted_address,
    }
  }

  function card(place: PlaceBase): PlaceCard.Cell
  function card(place?: PlaceBase | null | undefined): PlaceCard.Cell | null
  function card(place?: PlaceBase | null | undefined): PlaceCard.Cell | null {
    return place ? toCell(place) : null
  }

  return { card, toCell }
}

