import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  PlaceImageShade,
  PlaceSource,
} from 'fireux-places/runtime/models/place.model'

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

export type KitchenSurface = {
  id?: string
  slug?: string
  route_scope?: 'live' | 'demo' | 'test'
  is_test_kitchen?: boolean
  place_id?: string
  created?: unknown
  updated?: unknown
  name?: string
  short_name?: string
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
  cover_image?: string
  gallery_images?: string[]
  about?: string
  verified?: boolean
}

const resolveKitchenPath = (target: {
  id?: string
  route_scope?: 'live' | 'demo' | 'test'
}) => {
  const id = safeString(target.id)
  if (!id) return ''

  if (target.route_scope === 'demo') {
    return `/demo/kitchens/${encodeURIComponent(id)}`
  }

  return `/kitchens/${encodeURIComponent(id)}`
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

  function map(kitchen: KitchenSurface): KitchenCard.Card {
    const id = safeString(kitchen.id).trim()
    const name = safeString(kitchen.name)
    const shortName = safeString(kitchen.short_name)
    const shortAddress = safeString(kitchen.short_address)
    const formattedAddress = safeString(kitchen.formatted_address)
    const imageUrl = safeString(kitchen.image_url)

    return {
      id,
      to: resolveKitchenPath({ id, route_scope: kitchen.route_scope }),

      title: name,
      subtitle: shortAddress,

      name,
      badges: [],

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

  function profile(
    target?: KitchenSurface | null | undefined
  ): KitchenCard.Card | null {
    return buildInterface(target)
  }

  return {
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
