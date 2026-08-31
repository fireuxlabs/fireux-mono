import {
  safeString,
  sanitizeShortAddress,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  Place as PlaceShape,
  PlaceSocialLinks,
  PlaceSource,
} from '../../../../models/place.model.ts'
import type { BasePlace } from '../../fetch/search/types'
import type { PlaceImageShade } from '../../../../utils/place-spine'

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
    coverImageUrl: string
    description: string
    categoryLabels: string[]
    imageShade?: PlaceImageShade
    source?: PlaceSource
    collection?: string
    claimedBy?: string
  }
}

type PlaceExtras = Partial<PlaceShape>
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

export function formatPlaceTypeLabel(value: unknown) {
  return safeString(value)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

const formatPlaceTypeList = (values?: string[]) =>
  (values ?? []).map((value) => formatPlaceTypeLabel(value)).filter(Boolean)

export function usePlaceInterface() {
  function map(place: BasePlace): PlaceCard.Card {
    const id = safeString(place.id).trim()
    const name = safeString(place.name)
    const shortName = safeString(place.short_name)
    const address = safeString(place.formatted_address)
    const shortAddress = sanitizeShortAddress(place.short_address)
    const image = safeString(place.image_url)
    const coverImage = safeString(place.cover_image)
    const entityFamilies = place.entity_families

    return {
      id,
      to: id ? `/${'places'}/${encodeURIComponent(id)}` : '',
      title: name,
      subtitle: shortAddress || address,
      badges: entityFamilies.map(
        (entry: string) => entry.charAt(0).toUpperCase() + entry.slice(1)
      ),
      name,
      shortName,
      formattedAddress: address,
      shortAddress,
      imageUrl: image,
      coverImageUrl: coverImage,
      description: safeString(place.about || place.tagline),
      categoryLabels: formatPlaceTypeList(
        place.tags?.length ? place.tags : place.types
      )
        .filter(
          (label) =>
            !['establishment', 'food', 'point of interest'].includes(label)
        )
        .slice(0, 3),
      imageShade: place.image_shade ?? 'none',
      source: place.source,
      claimedBy: safeString(place.claimed_by),
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
      formattedAddress: base.formattedAddress || base.shortAddress,
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      source: target.source,
      prop: target.tagline,
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
      formattedAddress: base.formattedAddress || base.shortAddress,
      source: target.source,
      prop: target.tagline,
    }
  }

  function profile(
    target?: (BasePlace & PlaceExtras) | null | undefined
  ): PlaceProfile | null {
    const base = buildInterface(target)
    if (!base || !target) return null
    const source = target.source
    const tags = target.tags
    const types = target.types
    const phone = target.phone
    const email = target.email
    const website = target.website
    const googleMapsUrl = safeString(target.google_maps_url)
    const lat = Number(target.lat)
    const lng = Number(target.lng)
    const coordinatesMapUrl =
      Number.isFinite(lat) && Number.isFinite(lng)
        ? `https://maps.google.com/?q=${lat},${lng}`
        : ''
    const socialLinks: Partial<PlaceSocialLinks> | undefined =
      target.social_links
    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      imageUrl: target.image_url,
      prop: target.tagline,
      coverImage: target.cover_image,
      galleryImages: target.gallery_images?.slice(0, 3),
      about: target.about,
      priceLevel: target.price_level,
      tags: formatPlaceTypeList(tags),
      types: formatPlaceTypeList(types),
      phone,
      email,
      website,
      googleMapsUrl: googleMapsUrl || coordinatesMapUrl,
      socialLinks,
      verified: target.verified,
      timezone: target.timezone,
      defaultCurrencyCode: target.default_currency_code,
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
