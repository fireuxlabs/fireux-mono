// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: compose Place baselines with only meaningful Kitchen surface deltas.
// Concurrent edit — 2026-07-22 12:35 CEST — Kitchen palette console: preserve bounded server write capability on the live surface.
// Concurrent edit — 2026-07-22 15:12 CEST — Kitchen directory preview: label and unlink Kitchens that are not publicly visible.
import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  Place,
  PlaceImageShade,
} from 'fireux-places/runtime/models/place.model'
import { toShortAddress } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/formatPlaceAddress'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/utils/place-spine'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { FireuxAppScopeState } from 'fireux-core/runtime/models/core/meta.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type {
  Kitchen,
  KitchenMenusConfig,
} from '../../../../../../models/kitchen.model'
import {
  readKitchenAppScope,
  readKitchenIdentity,
  readKitchenMenusConfig,
  readKitchenSproochliConfig,
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
  // View surface only: Place-like fields are a resolved read projection of the
  // linked Place plus meaningful Kitchen/scoped deltas, never Kitchen authority.
  id?: string
  can_write?: boolean
  app_scope_state?: FireuxAppScopeState
  app_scope_app_id?: string
  slug?: string
  show?: boolean
  publicly_visible?: boolean
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
  currency_code?: string
  menu_currency_format?: CurrencyDisplayFormat
  menu_show_currency?: boolean
  menu_available?: boolean
  menus?: KitchenMenusConfig
  sproochli?: SproochliAttachmentConfig
  menu_style?: Partial<PageStyle>
  formatted_address?: string
  short_address?: string
  lat?: number
  lng?: number
  image_url?: string
  display_image_url?: string
  image_shade?: PlaceImageShade
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
    | 'default_currency_code'
    | 'business_hours'
    | 'claimed_by'
    | 'verified'
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

const meaningfulSurfaceDelta = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, item]) => {
      if (typeof item === 'string') return Boolean(item.trim())
      if (Array.isArray(item)) return item.length > 0
      if (typeof item === 'object' && item) return Object.keys(item).length > 0
      return item !== null && item !== undefined
    })
  )
}

const placeBaselineKeys = [
  'name',
  'short_name',
  'brand_tagline',
  'about',
  'formatted_address',
  'short_address',
  'address',
  'lat',
  'lng',
  'timezone',
  'image_url',
  'cover_image',
  'gallery_images',
  'image_shade',
  'phone',
  'email',
  'website',
  'google_maps_url',
  'social_links',
] as const

export function useKitchenInterface() {
  type KitchenIdentity = KitchenCard.Card
  type KitchenPill = KitchenCard.Card
  type KitchenProfile = KitchenCard.Profile

  type KitchenCell = Pick<
    KitchenCard.Card,
    'id' | 'to' | 'name' | 'shortAddress' | 'imageUrl' | 'imageShade'
  > & {
    prop?: string
  }

  type KitchenPreview = {
    imageUrl: string
    imageShade?: PlaceImageShade
    name: string
    formattedAddress: string
    shortAddress?: string
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

    const place = meaningfulSurfaceDelta(parts.place)
    const kitchenDelta = meaningfulSurfaceDelta(kitchen)
    const scopeDelta = meaningfulSurfaceDelta(parts.scope)
    const merged = {
      ...place,
      ...kitchenDelta,
      ...scopeDelta,
    } as TKitchen & KitchenSurface
    for (const key of placeBaselineKeys) {
      if (Object.hasOwn(place, key)) {
        (merged as Record<string, unknown>)[key] = place[key]
      }
    }
    const identityDelta = {
      ...meaningfulSurfaceDelta(kitchenDelta.identity),
      ...meaningfulSurfaceDelta(scopeDelta.identity),
    }
    if (Object.hasOwn(place, 'image_url')) {
      delete merged.display_image_url
      delete identityDelta.image_url
    }
    if (Object.hasOwn(place, 'image_shade')) {
      delete identityDelta.image_shade
    }
    if (Object.hasOwn(place, 'gallery_images')) {
      delete merged.food_gallery
      delete identityDelta.gallery
    }
    if (Object.keys(identityDelta).length) {
      (merged as Record<string, unknown>).identity = identityDelta
    } else {
      delete (merged as Record<string, unknown>).identity
    }
    if (Array.isArray(place.gallery_images)) {
      merged.food_gallery = place.gallery_images as string[]
    }
    const placeCurrencyCode = readPlaceCurrencyCode(parts.place)
    delete merged.currency_code
    if (placeCurrencyCode) merged.currency_code = placeCurrencyCode
    const id = safeString(merged.id).trim()
    if (!id) return null
    const identity = readKitchenIdentity(merged)
    const appScope = readKitchenAppScope(merged)
    const visibility = readKitchenVisibility(merged)
    const menus = readKitchenMenusConfig(merged)
    const sproochli = readKitchenSproochliConfig(merged)

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
      sproochli,
      route_scope: parts.routeScope ?? merged.route_scope,
    }
  }

  function map(kitchen: KitchenSurface): KitchenCard.Card {
    const id = safeString(kitchen.id).trim()
    const slug = safeString(kitchen.slug).trim()
    const identity = readKitchenIdentity(kitchen)
    const name = safeString(identity.displayName || kitchen.name)
    const shortName = safeString(kitchen.short_name)
    const formattedAddress = safeString(kitchen.formatted_address)
    const shortAddress = toShortAddress(
      safeString(kitchen.short_address) || formattedAddress
    )
    const imageUrl = safeString(identity.imageUrl || kitchen.image_url)

    const isPubliclyVisible = kitchen.publicly_visible !== false
    const badges = isPubliclyVisible
      ? []
      : [kitchen.is_test_kitchen ? 'Test' : 'Hidden']

    return {
      id,
      to: isPubliclyVisible
        ? resolveKitchenPath({ id, slug, route_scope: kitchen.route_scope })
        : '',

      title: name,
      subtitle: shortAddress,

      name,
      badges,

      shortName,
      formattedAddress,
      shortAddress,

      imageUrl,

      imageShade: identity.imageShade || kitchen.image_shade,

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
      shortAddress: base.shortAddress,
      imageUrl: base.imageUrl,
      imageShade: base.imageShade,
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
      prop: target.tagline || (target as any)?.brand_tagline,
      website: safeString(target.website),
      phone: safeString(target.phone),
      currencyCode: safeString(target.currency_code),
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
          value: safeString(target.currency_code),
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
