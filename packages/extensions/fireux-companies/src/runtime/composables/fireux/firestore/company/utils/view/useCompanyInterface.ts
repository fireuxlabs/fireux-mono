import {
  safeString,
  sanitizeShortAddress,
  stripLocationFromTitle,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { PlaceImageShade } from 'fireux-places/runtime/models/place.model'
import type { CompanyView } from '../../../../../../models/company-public.model'
import { CompanyStorage } from '../../../../../../models/company.model'

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
  coverImage?: string
  galleryImages?: string[]
  about?: string
  verified?: boolean
}

export function useCompanyInterface() {
  type CompanyPill = CompanyCard.Card

  type CompanyCell = Pick<
    CompanyCard.Card,
    'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'
  > & { prop?: string }

  type CompanyPreview = {
    imageUrl: string
    imageShade?: PlaceImageShade
    name: string
    formattedAddress: string
    prop?: string
  }

  function map(company: CompanyView): CompanyCard.Card {
    const id = safeString(company.id).trim()
    const name = safeString(company.name)
    const shortName = safeString(company.short_name)
    const shortAddress = sanitizeShortAddress(company.short_address)
    const formattedAddress = shortAddress
    const displayTitle =
      shortName ||
      stripLocationFromTitle(name, shortAddress || formattedAddress)
    const imageUrl = safeString(company.image_url)

    return {
      id,
      to: id ? `/${CompanyStorage.collection}/${encodeURIComponent(id)}` : '',

      title: displayTitle || name,
      subtitle: shortAddress || formattedAddress,

      name,
      badges: [],

      shortName,
      formattedAddress,
      shortAddress,

      imageUrl,

      imageShade: company.image_shade ?? 'none',
      claimedBy: '',
    }
  }

  function buildInterface(
    target?: CompanyView | null | undefined
  ): CompanyCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: CompanyView | null | undefined
  ): CompanyPill | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(
    target?: CompanyView | null | undefined
  ): CompanyCell | null {
    const base = buildInterface(target)
    if (!base || !target) return null
    return {
      id: base.id,
      to: base.to,
      name: base.name,
      formattedAddress: base.formattedAddress,
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      prop: target.brand_tagline,
    }
  }

  function preview(
    target?: CompanyView | null | undefined
  ): CompanyPreview | null {
    const base = buildInterface(target)
    if (!base || !target) return null
    return {
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      name: base.name,
      formattedAddress: base.formattedAddress,
      prop: target.brand_tagline,
    }
  }

  function profile(
    target?: CompanyView | null | undefined
  ): CompanyProfile | null {
    const base = buildInterface(target)
    if (!base || !target) return null
    const address = base.shortAddress || base.formattedAddress
    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      prop: target.brand_tagline,
      website: target.website,
      address,
      coverImage: target.cover_image,
      galleryImages: target.gallery_images?.slice(0, 3),
      about: target.about,
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
