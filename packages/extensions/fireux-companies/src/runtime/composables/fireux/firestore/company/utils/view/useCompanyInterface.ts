import {
  safeString,
  sanitizeShortAddress,
  stripLocationFromTitle,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  PlaceImageShade,
  PlaceSocialLinks,
  PlaceSource,
} from 'fireux-places/runtime/models/place.model'
import type { CompanyHydrated } from 'fireux-companies/runtime/composables/fireux/firestore/company/fetch/types'

export namespace CompanyCard {
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

export type CompanyProfile = {
  card: CompanyCard.Card
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

export function useCompanyInterface() {
  type CompanyPill = CompanyCard.Card

  type CompanyCell = Pick<
    CompanyCard.Card,
    'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'
  > & {
    source?: PlaceSource
    prop?: string
  }

  type CompanyPreview = {
    imageUrl: string
    imageShade?: PlaceImageShade
    name: string
    formattedAddress: string
    source?: PlaceSource
    prop?: string
  }

  function map(company: CompanyHydrated): CompanyCard.Card {
    const id = safeString(company.id).trim()
    const name = safeString(company.name)
    const shortName = safeString((company as any)?.short_name)
    const shortAddress = sanitizeShortAddress((company as any)?.short_address)
    const formattedAddress = safeString((company as any)?.formatted_address)
    const displayTitle = shortName || stripLocationFromTitle(name, shortAddress || formattedAddress)
    const imageUrl = safeString((company as any)?.image_url)

    return {
      id,
      to: id ? `/companies/${encodeURIComponent(id)}` : '',

      title: displayTitle || name,
      subtitle: shortAddress || formattedAddress,

      name,
      badges: [],

      shortName,
      formattedAddress,
      shortAddress,

      imageUrl,

      imageShade: (company as any)?.image_shade ?? 'none',

      source: (company as any)?.source,

      claimedBy: safeString((company as any)?.claimed_by),
    }
  }

  function buildInterface(target?: CompanyHydrated | null | undefined): CompanyCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: CompanyHydrated | null | undefined): CompanyPill | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(target?: CompanyHydrated | null | undefined): CompanyCell | null {
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

  function preview(target?: CompanyHydrated | null | undefined): CompanyPreview | null {
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

  function profile(target?: CompanyHydrated | null | undefined): CompanyProfile | null {
    const base = buildInterface(target)
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
      socialLinks: (target as any)?.social_links as Partial<PlaceSocialLinks> | undefined,
      coverImage: (target as any)?.cover_image,
      galleryImages: ((target as any)?.gallery_images as string[] | undefined)?.slice(0, 3),
      about: (target as any)?.about,
      verified: (target as any)?.verified,
      source: (target as any)?.source as PlaceSource | undefined,
    }
  }

  function searchText(company: CompanyHydrated): string {
    const name = safeString(company.name)
    const website = safeString((company as any)?.website)
    const shortAddress = sanitizeShortAddress((company as any)?.short_address)
    const formattedAddress = safeString((company as any)?.formatted_address)
    const id = safeString(company.id)
    return `${name} ${website} ${shortAddress || formattedAddress} ${id}`.trim().toLowerCase()
  }

  return { interface: buildInterface, searchText }
}
