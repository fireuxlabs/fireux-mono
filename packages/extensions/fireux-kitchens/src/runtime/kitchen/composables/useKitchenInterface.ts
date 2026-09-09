import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { PlaceImageShade } from 'fireux-places/runtime/place/utils/place-spine'
import { toShortAddress } from 'fireux-places/runtime/place/composables/firestore/utils/view/formatPlaceAddress'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import type { Kitchen } from '../models/kitchen.model.ts'
import {
  readKitchenMenusConfig,
  readKitchenSproochliConfig,
  readKitchenVisibility,
} from '../utils/kitchen-readers'
import {
  meaningfulSurfaceDelta,
  placeBaselineKeys,
  resolveKitchenPath,
} from '../utils/kitchen-interface-projection'
import type {
  KitchenCard,
  KitchenSurface,
  KitchenSurfaceParts,
} from '../models/kitchen-interface.model.ts'

export function useKitchenInterface() {
  type KitchenIdentity = KitchenCard.Card
  type KitchenPill = KitchenCard.Card
  type KitchenProfile = KitchenCard.Profile

  type KitchenCell = Pick<
    KitchenCard.Card,
    | 'id'
    | 'to'
    | 'name'
    | 'shortAddress'
    | 'imageUrl'
    | 'imageShade'
    | 'imageKind'
  > & {
    prop?: string
    mediaBackdropColor?: string
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
      ...(Array.isArray(scopeDelta.operator_ids)
        ? { operator_ids: scopeDelta.operator_ids }
        : {}),
      ...(Array.isArray(scopeDelta.team_ids)
        ? { team_ids: scopeDelta.team_ids }
        : {}),
    } as TKitchen & KitchenSurface
    for (const key of placeBaselineKeys) {
      if (Object.hasOwn(place, key)) {
        ;(merged as Record<string, unknown>)[key] = place[key]
      }
    }
    const identityDelta = meaningfulSurfaceDelta(kitchenDelta.identity)
    const identity = Object.keys(place).length
      ? {
          display_name: safeString(place.name),
          tagline: safeString(place.tagline),
          image_url: safeString(place.image_url),
          gallery: Array.isArray(place.gallery_images)
            ? (place.gallery_images as string[])
            : [],
        }
      : identityDelta
    delete merged.display_image_url
    if (Object.hasOwn(place, 'gallery_images')) {
      delete merged.food_gallery
      delete identity.gallery
    }
    if (Object.keys(identity).length) {
      ;(merged as Record<string, unknown>).identity = identity
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
    const presentation = merged.identity
    const visibility = readKitchenVisibility(merged)
    const menus = readKitchenMenusConfig(merged)
    const sproochli = readKitchenSproochliConfig(merged)

    return {
      ...merged,
      id,
      visibility,
      display_name: safeString(presentation?.display_name),
      tagline: safeString(presentation?.tagline),
      display_image_url: safeString(place.image_url),
      image_shade: merged.image_shade,
      food_gallery: Array.isArray(place.gallery_images)
        ? (place.gallery_images as string[])
        : [],
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
    const identity = kitchen.identity
    const name = safeString(identity?.display_name)
    const shortName = safeString(kitchen.short_name)
    const formattedAddress = safeString(kitchen.formatted_address)
    const shortAddress = toShortAddress(
      safeString(kitchen.short_address) || formattedAddress
    )
    const imageUrl = safeString(identity?.image_url)
    const discoveryImageUrl =
      safeString(kitchen.food_gallery?.[0]) ||
      safeString(kitchen.cover_image) ||
      imageUrl

    const visible = kitchen.visible !== false
    const badges = visible ? [] : ['Hidden']

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
      tagline: safeString(identity?.tagline),
      about: safeString(kitchen.about),
      priceLevel: safeString(kitchen.price_level),
      fulfilmentModes: Array.isArray(kitchen.fulfilment?.modes)
        ? kitchen.fulfilment.modes
        : [],
      ...(kitchen.fulfilment?.estimated_minutes
        ? { estimatedMinutes: kitchen.fulfilment.estimated_minutes }
        : {}),

      imageUrl,
      discoveryImageUrl,
      logoImageUrl: safeString(kitchen.logo_image || kitchen.logo_image_url),
      categoryLabels: [...(kitchen.tags || []), ...(kitchen.types || [])]
        .filter(
          (label) =>
            !['establishment', 'food', 'point_of_interest'].includes(label)
        )
        .slice(0, 3),

      imageShade: kitchen.image_shade,
      imageKind: kitchen.image_kind || (imageUrl ? 'photograph' : 'brand'),

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
    const identity = target.identity
    const displayName = safeString(identity?.display_name).trim()
    const tagline = safeString(identity?.tagline).trim()
    const imageUrl = safeString(identity?.image_url).trim()
    const foodGallery = Array.isArray(target.food_gallery)
      ? target.food_gallery
      : []
    const hasKitchenDisplayData = Boolean(
      displayName || tagline || imageUrl || foodGallery.length
    )

    if (!id || !hasKitchenDisplayData) return null

    const badges = [target.visibility === false ? 'Hidden' : ''].filter(
      (badge): badge is string => Boolean(badge)
    )
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
      logoImageUrl: safeString(target.logo_image || target.logo_image_url),
      categoryLabels: [],
      imageShade: target.image_shade,
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
      imageKind: base.imageKind,
      mediaBackdropColor: safeString(target.media_backdrop_color),
      prop: safeString(target.tagline),
    }
  }

  function workspaceTarget(
    target?: KitchenSurface | null | undefined
  ): KitchenCell | null {
    const base = buildInterface(target)
    if (!base || !target) return null
    const kitchenIdentity = target.identity

    return {
      id: base.id,
      to: base.to,
      name: base.name,
      shortAddress: base.shortAddress,
      imageUrl: safeString(kitchenIdentity?.image_url).trim(),
      imageShade: target.image_shade,
      imageKind: 'brand',
      mediaBackdropColor: kitchenIdentity?.media_backdrop_color,
      prop: safeString(kitchenIdentity?.tagline),
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
      prop: target.tagline,
      website: safeString(target.website),
      phone: safeString(target.phone),
      currencyCode: safeString(target.currency_code),
      menuAvailable: target.menu_available !== false,
      badges: [
        publicPath || (slug ? `/kitchens/${slug}` : ''),
        safeString(target.id) ? 'Place linked' : '',
        safeString(target.claimed_by) ? 'Claimed' : '',
        target.visibility === false ? 'Hidden' : '',
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
    workspaceTarget,
    preview,
    profile,
  }
}
