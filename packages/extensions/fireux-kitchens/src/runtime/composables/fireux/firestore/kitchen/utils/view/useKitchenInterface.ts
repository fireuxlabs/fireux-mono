import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  Place,
  PlaceImageShade,
  PlaceSource,
} from 'fireux-places/runtime/models/place.model'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type { Kitchen } from '../../../../../../models/kitchen.model'

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
    tagline: string
    foodGallery: string[]
  }
}

export type KitchenSurface = {
  // View surface only: Place-like fields here are hydrated from Place, not
  // repeated Kitchen storage truth.
  id?: string
  slug?: string
  show?: boolean
  route_scope?: 'live' | 'demo' | 'test'
  is_test_kitchen?: boolean
  place_id?: string
  created?: unknown
  updated?: unknown
  name?: string
  display_name?: string
  tagline?: string
  short_name?: string
  food_gallery?: string[]
  default_currency_code?: string
  menu_currency_format?: CurrencyDisplayFormat
  menu_show_currency?: boolean
  menu_available?: boolean
  menu_style?: Partial<PageStyle>
  sproochli_enabled?: boolean
  language_settings?: {
    native_language?: string
    attached_languages?: string[]
    cache_languages?: string[]
    public_languages?: string[]
  }
  formatted_address?: string
  short_address?: string
  lat?: number
  lng?: number
  image_url?: string
  display_image_url?: string
  image_shade?: PlaceImageShade
  source?: PlaceSource
  claimed_by?: string
  brand_tagline?: string
  website?: string
  phone?: string
  social_links?: unknown
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
    | 'brand_tagline'
    | 'about'
    | 'short_address'
    | 'formatted_address'
    | 'address'
    | 'lat'
    | 'lng'
    | 'timezone'
    | 'image_url'
    | 'cover_image'
    | 'gallery_images'
    | 'image_shade'
    | 'phone'
    | 'email'
    | 'website'
    | 'google_maps_url'
    | 'social_links'
    | 'place_type'
    | 'types'
    | 'tags'
    | 'price_level'
    | 'claimed_by'
    | 'verified'
    | 'default_currency_code'
    | 'source'
    | 'slug'
    | 'search_term'
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
    const name = safeString(kitchen.display_name || kitchen.name)
    const shortName = safeString(kitchen.short_name)
    const shortAddress = safeString(kitchen.short_address)
    const formattedAddress = safeString(kitchen.formatted_address)
    const imageUrl = safeString(kitchen.display_image_url || kitchen.image_url)

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
    if (!target) return null

    const id = safeString(target.id).trim()
    const slug = safeString(target.slug).trim()
    const displayName = safeString(target.display_name).trim()
    const tagline = safeString(target.tagline).trim()
    const imageUrl = safeString(target.display_image_url).trim()
    const foodGallery = Array.isArray(target.food_gallery)
      ? target.food_gallery
          .map((image) => safeString(image).trim())
          .filter(Boolean)
      : []
    const hasKitchenPublicData = Boolean(
      displayName ||
        tagline ||
        imageUrl ||
        foodGallery.length
    )

    if (!id || !hasKitchenPublicData) return null

    const badges = [
      target.show === false ? 'Hidden' : '',
    ].filter((badge): badge is string => Boolean(badge))
    const title = displayName || 'Kitchen'
    const card: KitchenCard.Card = {
      id,
      to: resolveKitchenPath({ id, slug, route_scope: target.route_scope }),
      title,
      subtitle: tagline,
      badges,
      name: title,
      shortName: '',
      formattedAddress: '',
      shortAddress: '',
      imageUrl,
      imageShade: undefined,
      source: undefined,
      claimedBy: '',
    }

    return {
      ...card,
      card,
      tagline,
      foodGallery,
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
