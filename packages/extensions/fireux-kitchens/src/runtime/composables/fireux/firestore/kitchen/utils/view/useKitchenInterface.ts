import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  Place,
  PlaceImageShade,
  PlaceSocialLinks,
  PlaceSource,
} from 'fireux-places/runtime/models/place.model'
import type { Kitchen, KitchenOpeningHours } from '../../../../../../models/kitchen.model'

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

  export type Profile = Card & {
    card: Card
    prop?: string
    website?: string
    address?: string
    phone?: string
    socialLinks?: Partial<PlaceSocialLinks>
    coverImage?: string
    galleryImages?: string[]
    about?: string
    verified?: boolean
  }
}

export type KitchenSurface = {
  id?: string
  slug?: string
  show?: boolean
  route_scope?: 'live' | 'demo' | 'test'
  is_test_kitchen?: boolean
  place_id?: string
  created?: unknown
  updated?: unknown
  name?: string
  short_name?: string
  currency_code?: string
  formatted_address?: string
  short_address?: string
  lat?: number
  lng?: number
  image_url?: string
  image_shade?: PlaceImageShade
  source?: PlaceSource
  claimed_by?: string
  brand_tagline?: string
  website?: string
  phone?: string
  social_links?: unknown
  opening_hours?: KitchenOpeningHours
  cover_image?: string
  gallery_images?: string[]
  about?: string
  verified?: boolean
}

export type KitchenSurfaceParts<TKitchen extends object = Partial<Kitchen>> = {
  kitchen?: TKitchen | null | undefined
  place?: Partial<Pick<
    Place,
    | 'name'
    | 'short_name'
    | 'short_address'
    | 'formatted_address'
    | 'lat'
    | 'lng'
    | 'image_url'
    | 'image_shade'
    | 'claimed_by'
    | 'source'
    | 'slug'
  >> | null | undefined
  scope?: Record<string, unknown> | null | undefined
  routeScope?: KitchenSurface['route_scope']
}

const resolveKitchenPath = (target: {
  id?: string
  slug?: string
  route_scope?: 'live' | 'demo' | 'test'
}) => {
  const slug = safeString(target.slug)
  if (!slug) return ''

  if (target.route_scope === 'demo') {
    return `/demo/kitchens/${encodeURIComponent(slug)}`
  }

  return `/kitchens/${encodeURIComponent(slug)}`
}

export function useKitchenInterface() {
  type KitchenIdentity = KitchenCard.Card
  type KitchenPill = KitchenCard.Card
  type KitchenProfile = KitchenCard.Profile

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

  function surface<TKitchen extends object = Partial<Kitchen>>(
    parts: KitchenSurfaceParts<TKitchen>
  ): (TKitchen & KitchenSurface) | null {
    const kitchen = parts.kitchen ?? null
    if (!kitchen) return null

    const merged = {
      ...(parts.place ?? {}),
      ...kitchen,
      ...(parts.scope ?? {}),
    } as TKitchen & KitchenSurface
    const id = safeString(merged.id).trim()
    if (!id) return null

    return {
      ...merged,
      id,
      route_scope: parts.routeScope ?? merged.route_scope,
    }
  }

  function map(kitchen: KitchenSurface): KitchenCard.Card {
    const id = safeString(kitchen.id).trim()
    const slug = safeString(kitchen.slug).trim()
    const name = safeString(kitchen.name)
    const shortName = safeString(kitchen.short_name)
    const shortAddress = safeString(kitchen.short_address)
    const formattedAddress = safeString(kitchen.formatted_address)
    const imageUrl = safeString(kitchen.image_url)

    const badges = kitchen.show === false ? ['Hidden'] : []

    return {
      id,
      to: resolveKitchenPath({ id, slug, route_scope: kitchen.route_scope }),

      title: name,
      subtitle: shortAddress,

      name,
      badges,

      shortName,
      formattedAddress,
      shortAddress,

      imageUrl,

      imageShade: kitchen.image_shade,

      source: kitchen.source,

      claimedBy: safeString(kitchen.claimed_by),
    }
  }

  function buildInterface(
    target?: KitchenSurface | null | undefined
  ): KitchenCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function identity(
    target?: KitchenSurface | null | undefined
  ): KitchenIdentity | null {
    return buildInterface(target)
  }

  function profile(
    target?: KitchenSurface | null | undefined
  ): KitchenProfile | null {
    const card = identity(target)
    if (!card || !target) return null
    const address = card.shortAddress || card.formattedAddress

    return {
      ...card,
      card,
      prop: safeString((target as any)?.brand_tagline),
      website: safeString((target as any)?.website),
      address,
      phone: safeString((target as any)?.phone),
      socialLinks: (target as any)?.social_links as
        | Partial<PlaceSocialLinks>
        | undefined,
      coverImage: safeString((target as any)?.cover_image),
      galleryImages: (
        (target as any)?.gallery_images as string[] | undefined
      )?.slice(0, 3),
      about: safeString((target as any)?.about),
      verified: Boolean((target as any)?.verified),
    }
  }

  function pill(
    target?: KitchenSurface | null | undefined
  ): KitchenPill | null {
    const base = buildInterface(target)
    if (!base) return null
    return {
      ...base,
      title: base.title,
      subtitle: base.subtitle,
    }
  }

  function cell(
    target?: KitchenSurface | null | undefined
  ): KitchenCell | null {
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
    target?: KitchenSurface | null | undefined
  ): KitchenPreview | null {
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

  return {
    surface,
    interface: toInterface,
    identity,
    pill,
    cell,
    preview,
    profile,
  }
}
