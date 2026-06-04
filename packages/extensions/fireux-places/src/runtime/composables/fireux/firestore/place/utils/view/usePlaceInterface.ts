import {
  safeString,
  sanitizeShortAddress,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  BasePlace,
  PlaceImageShade,
  Place as PlaceModel,
  PlaceSocialLinks,
  PlaceSource,
} from 'fireux-places/runtime/models/place.model'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'

export namespace PlaceCard {
  export type Card = {
    id: string
    to: string
    title: string
    subtitle: string
    badges: string[]
    name: string
    shortName: string
    formattedAddress: string
    shortAddress: string
    imageUrl: string
    imageShade?: PlaceImageShade
    source?: PlaceSource
    collection?: string
    claimedBy?: string
  }
}

type PlaceExtras = Partial<PlaceModel>
type PlacePill = PlaceCard.Card
type PlaceCellResolved = Pick<
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
  phone?: string
  email?: string
  website?: string
  googleMapsUrl?: string
  socialLinks?: Partial<PlaceSocialLinks>
  coverImage?: string
  galleryImages?: string[]
  about?: string
  verified?: boolean
  timezone?: string
  defaultCurrencyCode?: string
  source?: PlaceSource
}

export function usePlaceInterface() {
  function map(place: BasePlace): PlaceCard.Card {
    const id = safeString(place.id).trim()
    const name = safeString(place.name)
    const shortName = safeString((place as any)?.short_name)
    const address = safeString((place as any)?.formatted_address)
    const shortAddress = sanitizeShortAddress((place as any)?.short_address)
    const image = safeString((place as any)?.image_url)

    return {
      id,
      to: id ? `/${PlaceStorage.collection}/${encodeURIComponent(id)}` : '',
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

  function buildInterface(
    target?: BasePlace | null | undefined
  ): PlaceCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: BasePlace | null | undefined): PlacePill | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(
    target?: (BasePlace & PlaceExtras) | null | undefined
  ): PlaceCellResolved | null {
    const base = buildInterface(target)
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

  function preview(
    target?: (BasePlace & PlaceExtras) | null | undefined
  ): PlacePreview | null {
    const base = buildInterface(target)
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

  function profile(
    target?: (BasePlace & PlaceExtras) | null | undefined
  ): PlaceProfile | null {
    const base = buildInterface(target)
    if (!base || !target) return null
    const source = (target as any)?.source as PlaceSource | undefined
    const rating = (target as any)?.rating as number | undefined
    const ratingCount = (target as any)?.rating_count as number | undefined
    const tags = (target as any)?.tags as string[] | undefined
    const types = (target as any)?.types as string[] | undefined
    const phone = (target as any)?.phone as string | undefined
    const email = (target as any)?.email as string | undefined
    const website = (target as any)?.website as string | undefined
    const googleMapsUrl = safeString((target as any)?.google_maps_url)
    const lat = Number((target as any)?.lat)
    const lng = Number((target as any)?.lng)
    const coordinatesMapUrl =
      Number.isFinite(lat) && Number.isFinite(lng)
        ? `https://maps.google.com/?q=${lat},${lng}`
        : ''
    const socialLinks = (target as any)?.social_links as
      | Partial<PlaceSocialLinks>
      | undefined
    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      imageUrl: (target as any)?.image_url,
      prop: (target as any)?.brand_tagline,
      coverImage: (target as any)?.cover_image,
      galleryImages: (
        (target as any)?.gallery_images as string[] | undefined
      )?.slice(0, 3),
      about: (target as any)?.about,
      rating,
      ratingCount,
      priceLevel: (target as any)?.price_level,
      tags,
      types,
      phone,
      email,
      website,
      googleMapsUrl: googleMapsUrl || coordinatesMapUrl,
      socialLinks,
      verified: (target as any)?.verified,
      timezone: (target as any)?.timezone,
      defaultCurrencyCode: (target as any)?.default_currency_code,
      source,
    }
  }

  return {
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
