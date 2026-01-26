import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  BasePlace,
  PlaceImageShade,
  PlaceSource,
} from '../../../../../../../models/objects/place.model'

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

    // Image tone metadata
    imageShade?: PlaceImageShade

    // Source metadata
    source?: PlaceSource

    // Search collection (optional)
    collection?: string

    // Ownership
    claimedBy?: string
  }
}

export function usePlacesInterface() {
  function map(place: BasePlace): PlaceCard.Card {
    const id = safeString(place.id).trim()
    const name = safeString(place.name)
    const address = safeString((place as any)?.formatted_address)
    const image = safeString((place as any)?.place_image)

    return {
      id,
      to: id ? `/places/${encodeURIComponent(id)}` : '',

      avatarUrl: image,
      title: name,
      subtitle: address,
      badges: [],

      name,
      formattedAddress: address,

      imageUrl: image,

      imageShade: place.image_shade ?? 'neutral',

      source: place.source,

      claimedBy: safeString((place as any)?.claimed_by),
    }
  }

  function card(target?: BasePlace | null | undefined): PlaceCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function searchText(place: BasePlace): string {
    const name = safeString(place.name)
    const address = safeString((place as any)?.formatted_address)
    const id = safeString(place.id)
    return `${name} ${address} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
