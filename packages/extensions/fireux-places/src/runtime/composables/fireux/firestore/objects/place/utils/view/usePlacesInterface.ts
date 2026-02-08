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

    // Primary display fields
    title: string
    subtitle: string

    // Status/label chips
    badges: string[]

    name: string
    shortName: string
    formattedAddress: string
    shortAddress: string

    // Media (empty string means unset)
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

type PlacePill = PlaceCard.Card

type PlaceCell = Pick<
  PlaceCard.Card,
  'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'
> & {
  source?: PlaceSource
  prop?: string
}

type PlacePreview = {
  imageUrl: string
  imageShade?: PlaceImageShade
  name: string
  formattedAddress: string
  source?: PlaceSource
  prop?: string
}

export type PlaceProfile = {
  card: PlaceCard.Card
  title: string
  subtitle: string
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
    const image = safeString((place as any)?.image_url)

    return {
      id,
      to: id ? `/places/${encodeURIComponent(id)}` : '',

      title: name,
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
      title: base.title,
      subtitle: base.subtitle,
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
      source: (target as any)?.source,
      prop: (target as any)?.brand_tagline,
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
      source: (target as any)?.source as PlaceSource | undefined,
      prop: (target as any)?.brand_tagline,
    }
  }

  function profile(target?: (BasePlace & PlaceExtras) | null | undefined): PlaceProfile | null {
    const base = card(target)
    if (!base || !target) return null
    const source = (target as any)?.source as PlaceSource | undefined
    const rating = (target as any)?.rating as number | undefined
    const ratingCount = (target as any)?.rating_count as number | undefined
    const tags = (target as any)?.tags as string[] | undefined
    const types = (target as any)?.types as string[] | undefined
    const phone = (target as any)?.phone as string | undefined
    const email = (target as any)?.email as string | undefined
    const website = (target as any)?.website as string | undefined
    const socialLinks = (target as any)?.social_links as Partial<PlaceSocialLinks> | undefined
    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      imageUrl: (target as any)?.image_url,
      prop: (target as any)?.brand_tagline,
      coverImage: (target as any)?.cover_image,
      galleryImages: ((target as any)?.gallery_images as string[] | undefined)?.slice(0, 3),
      about: (target as any)?.about,
      rating,
      ratingCount,
      priceLevel: (target as any)?.price_level,
      tags,
      types,
      hoursText: (target as any)?.hours_text,
      phone,
      email,
      website,
      socialLinks,
      verified: (target as any)?.verified,
      source,
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
