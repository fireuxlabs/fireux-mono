import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  BasePlace,
  PlaceImageShade,
  Place as PlaceModel,
  PlaceSocialLinks,
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

type PlaceExtras = Partial<PlaceModel>

type PlacePill = PlaceCard.Card & {
  showBadges?: boolean
  showSubtitle?: boolean
}

type PlaceCell = Pick<
  PlaceCard.Card,
  'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'
> & {
  formatted_address?: string
  source?: PlaceSource
  prop?: string
  showSubtitle?: boolean
  showSource?: boolean
  showTagline?: boolean
}

type PlacePreview = {
  imageUrl: string
  imageShade?: PlaceImageShade
  name: string
  formattedAddress: string
  source: PlaceSource
  prop?: string
  showBadges?: boolean
  showBody?: boolean
}

type PlaceProfile = {
  card: PlaceCard.Card
  imageUrl?: string
  prop?: string
  rating?: number
  ratingCount?: number
  priceLevel?: string
  tags?: string[]
  types?: string[]
  hoursText?: string[]
  phone?: string
  email?: string
  website?: string
  socialLinks?: Partial<PlaceSocialLinks>
  coverImage?: string
  galleryImages?: string[]
  about?: string
  verified?: boolean
  source?: PlaceSource
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

      imageShade: place.image_shade ?? 'none',

      source: place.source,

      claimedBy: safeString((place as any)?.claimed_by),
    }
  }

  function card(target?: BasePlace | null | undefined): PlaceCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: BasePlace | null | undefined): PlacePill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title || base.name,
      subtitle: base.subtitle || base.shortAddress || base.formattedAddress || '',
      showBadges: false,
      showSubtitle: true,
    }
  }

  function cell(target?: (BasePlace & PlaceExtras) | null | undefined): PlaceCell | null {
    const base = card(target)
    if (!base || !target) return null
    return {
      id: base.id,
      to: base.to,
      name: base.name,
      formattedAddress: base.formattedAddress,
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      formatted_address: (target as any)?.formatted_address,
      source: (target as any)?.source,
      prop: (target as any)?.brand_tagline,
      showSubtitle: true,
      showSource: true,
      showTagline: true,
    }
  }

  function preview(target?: (BasePlace & PlaceExtras) | null | undefined): PlacePreview | null {
    const base = card(target)
    if (!base || !target) return null
    return {
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      name: base.name,
      formattedAddress: base.formattedAddress,
      source: ((target as any)?.source as PlaceSource) ?? 'fireux',
      prop: (target as any)?.brand_tagline,
      showBadges: true,
      showBody: true,
    }
  }

  function profile(target?: (BasePlace & PlaceExtras) | null | undefined): PlaceProfile | null {
    const base = card(target)
    if (!base || !target) return null
    return {
      card: base,
      imageUrl: (target as any)?.place_image,
      prop: (target as any)?.brand_tagline,
      coverImage: (target as any)?.cover_image,
      galleryImages: (target as any)?.gallery_images,
      about: (target as any)?.about,
      rating: (target as any)?.rating,
      ratingCount: (target as any)?.rating_count,
      priceLevel: (target as any)?.price_level,
      tags: (target as any)?.tags,
      types: (target as any)?.types,
      hoursText: (target as any)?.hours_text,
      phone: (target as any)?.phone,
      email: (target as any)?.email,
      website: (target as any)?.website,
      socialLinks: (target as any)?.social_links,
      verified: (target as any)?.verified,
      source: (target as any)?.source,
    }
  }

  function searchText(place: BasePlace): string {
    const name = safeString(place.name)
    const shortName = safeString((place as any)?.short_name)
    const address = safeString((place as any)?.formatted_address)
    const shortAddress = sanitizeShortAddress((place as any)?.short_address)
    const id = safeString(place.id)
    return `${name} ${shortName} ${shortAddress || address} ${id}`.trim().toLowerCase()
  }

  return { card, pill, cell, preview, profile, searchText }
}
