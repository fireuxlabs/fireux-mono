import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  Place,
  PlaceImageShade,
  PlaceSource,
} from 'fireux-places/runtime/models/place.model'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { FireuxAppScopeState } from 'fireux-core/runtime/models/core/meta.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type { Kitchen } from '../../../../../../models/kitchen.model'
import {
  readKitchenAppScope,
  readKitchenIdentity,
  readKitchenMenusConfig,
  readKitchenVisibility,
} from '../../../../../../utils/kitchen-spine'

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
  // View surface only: Place-like fields here are copied public snapshots from
  // Place or local Kitchen overrides, not live collection-manager hydration.
  id?: string
  app_scope_state?: FireuxAppScopeState
  app_scope_app_id?: string
  slug?: string
  show?: boolean
  active?: boolean
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
  operator_ids?: string[]
  team_ids?: string[]
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

  if (target.route_scope === 'demo' || target.route_scope === 'test') {
    return ''
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
    shortAddress?: string
    source?: PlaceSource
    prop?: string
    website?: string
    phone?: string
    currencyCode?: string
    menuAvailable?: boolean
    badges?: string[]
    details?: {
      label: string
      value?: string | number | null
    }[]
    mapUrl?: string
    to?: string
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
    const identity = readKitchenIdentity(merged)
    const appScope = readKitchenAppScope(merged)
    const visibility = readKitchenVisibility(merged)
    const menus = readKitchenMenusConfig(merged)

    return {
      ...merged,
      id,
      app_scope_state: appScope.state || merged.app_scope_state,
      app_scope_app_id: appScope.appId || merged.app_scope_app_id,
      show: visibility.show,
      active: visibility.active,
      is_test_kitchen: visibility.isTest,
      display_name: identity.displayName || merged.display_name,
      tagline: identity.tagline || merged.tagline,
      display_image_url: identity.imageUrl || merged.display_image_url,
      image_shade: identity.imageShade || merged.image_shade,
      food_gallery: identity.gallery.length ? identity.gallery : merged.food_gallery,
      menu_currency_format: menus.currencyFormat,
      menu_show_currency: menus.showCurrency,
      menu_style: menus.style,
      menu_available: menus.available,
      route_scope: parts.routeScope ?? merged.route_scope,
    }
  }

  function map(kitchen: KitchenSurface): KitchenCard.Card {
    const id = safeString(kitchen.id).trim()
    const slug = safeString(kitchen.slug).trim()
    const identity = readKitchenIdentity(kitchen)
    const name = safeString(identity.displayName || kitchen.name)
    const shortName = safeString(kitchen.short_name)
    const shortAddress = safeString(kitchen.short_address)
    const formattedAddress = safeString(kitchen.formatted_address)
    const imageUrl = safeString(identity.imageUrl || kitchen.image_url)

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
    const identity = readKitchenIdentity(target)
    const displayName = safeString(identity.displayName || target.name).trim()
    const tagline = safeString(identity.tagline).trim()
    const imageUrl = safeString(identity.imageUrl || target.image_url).trim()
    const foodGallery = identity.gallery
    const hasKitchenDisplayData = Boolean(
      displayName ||
        tagline ||
        imageUrl ||
        foodGallery.length
    )

    if (!id || !hasKitchenDisplayData) return null

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
    const slug = safeString(target.slug)
    const publicPath = base.to
    return {
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
      name: base.name,
      formattedAddress: base.formattedAddress,
      shortAddress: base.shortAddress,
      source: (target as any)?.source as PlaceSource | undefined,
      prop: target.tagline || (target as any)?.brand_tagline,
      website: safeString(target.website),
      phone: safeString(target.phone),
      currencyCode: safeString(target.default_currency_code),
      menuAvailable: target.menu_available !== false,
      badges: [
        publicPath || (slug ? `/kitchens/${slug}` : ''),
        safeString(target.place_id) ? 'Place linked' : '',
        safeString(target.claimed_by) ? 'Claimed' : '',
        target.show === false ? 'Hidden' : '',
      ].filter(Boolean),
      to: publicPath,
      mapUrl:
        typeof target.lat === 'number' && typeof target.lng === 'number'
          ? `https://www.google.com/maps/search/?api=1&query=${target.lat},${target.lng}`
          : '',
      details: [
        {
          label: 'Phone',
          value: safeString(target.phone),
        },
        {
          label: 'Website',
          value: safeString(target.website),
        },
        {
          label: 'Currency',
          value: safeString(target.default_currency_code),
        },
      ].filter((item) => Boolean(safeString(item.value))),
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
