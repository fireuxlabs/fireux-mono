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
    avatar?: string | null
  }

  export interface Cell extends Pill {
    source: PlaceSource
    formatted_address?: string
  }
}

export function usePlacesInterface() {
  function toCell(place: PlaceBase): PlaceCard.Cell {
    const rawId = (place as any)?.id ?? (place as any)?.place_id ?? ''
    const id = String(rawId)
    const sourceRaw = (place as any)?.source
    const normalized = sourceRaw === 'firestore' ? 'firebase' : sourceRaw
    const source = (normalized === 'google' ? 'google' : 'firebase') as PlaceSource
    return {
      id,
      name: place.name,
      avatar: place.avatar || null,
      source,
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

