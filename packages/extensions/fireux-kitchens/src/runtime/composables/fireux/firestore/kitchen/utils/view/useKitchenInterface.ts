import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
    PlaceImageShade,
    PlaceSocialLinks,
    PlaceSource,
} from 'fireux-places/runtime/models/place.model'
import type { Kitchen } from '../../../../../../../models/kitchen.model'

export namespace KitchenCard {
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

export type KitchenProfile = {
  card: KitchenCard.Card
  title: string
  subtitle: string
  imageUrl?: string
  imageShade?: PlaceImageShade
  prop?: string
  website?: string
  address?: string
  phone?: string
  email?: string
  socialLinks?: Partial<PlaceSocialLinks>
  coverImage?: string
  galleryImages?: string[]
  about?: string
  verified?: boolean
  source?: PlaceSource
}

export function useKitchenInterface() {
  type KitchenPill = KitchenCard.Card

  type KitchenCell = Pick<
    KitchenCard.Card,
    'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'
  > & {
    source?: PlaceSource
    prop?: string
  }

  type KitchenPreview = {
    imageUrl: string
    imageShade?: PlaceImageShade
    name: string
    formattedAddress: string
    source?: PlaceSource
    prop?: string
  }

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

  function map(kitchen: Kitchen): KitchenCard.Card {
    const id = safeString(kitchen.id).trim()
    const isTestKitchen = Boolean((kitchen as any)?.is_test_kitchen)
    let name = safeString(kitchen.name)
    const shortName = safeString((kitchen as any)?.short_name)
    const shortAddress = sanitizeShortAddress((kitchen as any)?.short_address)
    const formattedAddress = safeString((kitchen as any)?.formatted_address)
    if (isTestKitchen && !name) name = 'Test Kitchen'
    const displayTitle = isTestKitchen
      ? shortName || name
      : shortName || stripLocationFromTitle(name, shortAddress || formattedAddress)
    const imageUrl = safeString((kitchen as any)?.image_url)

    return {
      id,
      to: id ? `/kitchens/${encodeURIComponent(id)}` : '',

      title: displayTitle || name,
      subtitle: shortAddress || formattedAddress,

      name,
      badges: [],

      shortName,
      formattedAddress,
      shortAddress,

      imageUrl,

      imageShade: (kitchen as any)?.image_shade ?? 'none',

      source: (kitchen as any)?.source,

      claimedBy: safeString((kitchen as any)?.claimed_by),
    }
  }

  function card(target?: Kitchen | null | undefined): KitchenCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: Kitchen | null | undefined): KitchenPill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: Kitchen | null | undefined): KitchenCell | null {
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

  function preview(target?: Kitchen | null | undefined): KitchenPreview | null {
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

  function profile(target?: Kitchen | null | undefined): KitchenProfile | null {
    const base = card(target)
    if (!base || !target) return null
    const address = base.shortAddress || base.formattedAddress
    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      prop: (target as any)?.brand_tagline,
      website: (target as any)?.website,
      address,
      phone: (target as any)?.phone,
      email: (target as any)?.email,
      socialLinks: (target as any)?.social_links as Partial<PlaceSocialLinks> | undefined,
      coverImage: (target as any)?.cover_image,
      galleryImages: ((target as any)?.gallery_images as string[] | undefined)?.slice(0, 3),
      about: (target as any)?.about,
      verified: (target as any)?.verified,
      source: (target as any)?.source as PlaceSource | undefined,
    }
  }

  function searchText(kitchen: Kitchen): string {
    const name = safeString(kitchen.name)
    const website = safeString((kitchen as any)?.website)
    const shortAddress = sanitizeShortAddress((kitchen as any)?.short_address)
    const formattedAddress = safeString((kitchen as any)?.formatted_address)
    const id = safeString(kitchen.id)
    return `${name} ${website} ${shortAddress || formattedAddress} ${id}`.trim().toLowerCase()
  }

  return { card, pill, cell, preview, profile, searchText }
}
