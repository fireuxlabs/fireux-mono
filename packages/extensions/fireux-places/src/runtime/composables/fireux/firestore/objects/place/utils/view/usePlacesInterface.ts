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
    shortName: string
    formattedAddress: string
    shortAddress: string

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
  const sanitizeShortAddress = (value: string) =>
    safeString(value).replace(/^[^\p{L}\p{N}]+/gu, '').trim()

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const stripLocationFromTitle = (title: string, shortAddress: string) => {
    const cleanedTitle = safeString(title)
    const cleanedShort = sanitizeShortAddress(shortAddress)
    if (!cleanedTitle || !cleanedShort) return cleanedTitle

    const parts = cleanedShort
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)

    if (!parts.length) return cleanedTitle

    let next = cleanedTitle
    for (const part of parts) {
      if (part.length < 3) continue
      const pattern = new RegExp(`\\b${escapeRegExp(part)}\\b`, 'gi')
      next = next.replace(pattern, '').trim()
    }

    next = next
      .replace(/\s{2,}/g, ' ')
      .replace(/\s*[-–—|/]\s*(?=[-–—|/]|$)/g, ' ')
      .replace(/^[-–—|/\s]+/, '')
      .replace(/[-–—|/\s]+$/, '')
      .trim()

    return next || cleanedTitle
  }

  function map(place: BasePlace): PlaceCard.Card {
    const id = safeString(place.id).trim()
    const name = safeString(place.name)
    const shortName = safeString((place as any)?.short_name)
    const address = safeString((place as any)?.formatted_address)
    const shortAddress = sanitizeShortAddress((place as any)?.short_address)
    const displayTitle = shortName || stripLocationFromTitle(name, shortAddress || address)
    const image = safeString((place as any)?.place_image)

    return {
      id,
      to: id ? `/places/${encodeURIComponent(id)}` : '',

      avatarUrl: image,
      title: displayTitle || name,
      subtitle: shortAddress || address,
      badges: [],

      name,
      shortName,
      formattedAddress: address,
      shortAddress,

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
    const shortName = safeString((place as any)?.short_name)
    const address = safeString((place as any)?.formatted_address)
    const shortAddress = sanitizeShortAddress((place as any)?.short_address)
    const id = safeString(place.id)
    return `${name} ${shortName} ${shortAddress || address} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
