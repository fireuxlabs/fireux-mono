import {
  safeString,
  sanitizeShortAddress,
  stripLocationFromTitle,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { PlaceImageShade } from 'fireux-places/runtime/place/utils/place-spine'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Business } from '../../models/business.model'
import { BusinessStorage } from '../../models/business.entity.ts'

type BusinessPresentation = Partial<Place> & Pick<Business, 'id' | 'name'> & { description?: string }

export namespace BusinessCard {
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

    // Search collection (optional)
    collection?: string

    // Ownership
    claimedBy?: string
  }
}

export type BusinessProfile = {
  card: BusinessCard.Card
  title: string
  subtitle: string
  imageUrl?: string
  imageShade?: PlaceImageShade
  prop?: string
  website?: string
  address?: string
  phone?: string
  email?: string
  coverImage?: string
  galleryImages?: string[]
  about?: string
  verified?: boolean
}

export function useBusinessInterface() {
  type BusinessPill = BusinessCard.Card

  type BusinessCell = Pick<
    BusinessCard.Card,
    'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'
  > & { prop?: string }

  type BusinessPreview = {
    imageUrl: string
    imageShade?: PlaceImageShade
    name: string
    formattedAddress: string
    prop?: string
  }

  function map(business: BusinessPresentation): BusinessCard.Card {
    const id = safeString(business.id).trim()
    const name = safeString(business.name)
    const shortName = safeString(business.short_name)
    const shortAddress = sanitizeShortAddress(business.short_address || '')
    const formattedAddress = shortAddress
    const displayTitle =
      shortName ||
      stripLocationFromTitle(name, shortAddress || formattedAddress)
    const imageUrl = safeString(business.image_url)

    return {
      id,
      to: id ? `/${BusinessStorage.collection}/${encodeURIComponent(id)}` : '',

      title: displayTitle || name,
      subtitle: shortAddress || formattedAddress,

      name,
      badges: [],

      shortName,
      formattedAddress,
      shortAddress,

      imageUrl,

      imageShade: 'none',
      claimedBy: '',
    }
  }

  function buildInterface(
    target?: BusinessPresentation | null | undefined
  ): BusinessCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: BusinessPresentation | null | undefined): BusinessPill | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: BusinessPresentation | null | undefined): BusinessCell | null {
    const base = buildInterface(target)
    if (!base || !target) return null
    return {
      id: base.id,
      to: base.to,
      name: base.name,
      formattedAddress: base.formattedAddress,
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      prop: target.tagline,
    }
  }

  function preview(target?: BusinessPresentation | null | undefined): BusinessPreview | null {
    const base = buildInterface(target)
    if (!base || !target) return null
    return {
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      name: base.name,
      formattedAddress: base.formattedAddress,
      prop: target.tagline,
    }
  }

  function profile(target?: BusinessPresentation | null | undefined): BusinessProfile | null {
    const base = buildInterface(target)
    if (!base || !target) return null
    const address = base.shortAddress || base.formattedAddress
    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      prop: target.tagline,
      website: target.website,
      address,
      coverImage: target.cover_image,
      galleryImages: target.gallery_images?.slice(0, 3),
      about: target.description || target.about,
      verified: target.verified,
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
