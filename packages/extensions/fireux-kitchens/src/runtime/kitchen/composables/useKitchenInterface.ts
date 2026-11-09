import {
  readPlaceCurrencyCode,
  readMediaBackdropColor,
} from 'fireux-places/runtime/place/utils/place-spine'
import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import { toShortAddress } from 'fireux-places/runtime/place/utils/format-place-address'
import type { Kitchen } from '../models/kitchen.model.ts'
import { readKitchenVisibility } from '../utils/kitchen-readers'
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
    const backdrop = readMediaBackdropColor(place.media_backdrop_color)
    const presentation = {
      display_name: safeString(place.name),
      tagline: safeString(place.tagline),
      image_url: safeString(place.image_url),
      ...(backdrop ? { media_backdrop_color: backdrop } : {}),
    }
    delete merged.display_image_url
    // Presentation must never overwrite canonical Kitchen Identity.
    merged.presentation = presentation
    merged.slug = safeString(merged.identity?.slug)
    merged.status = merged.identity?.status
    delete (merged as Record<string, unknown>).currency
    if (Array.isArray(place.gallery_images)) {
      merged.food_gallery = place.gallery_images as string[]
    }
    const placeCurrencyCode = readPlaceCurrencyCode(place)
    delete merged.currency_code
    if (placeCurrencyCode) merged.currency_code = placeCurrencyCode
    const id = safeString(merged.id).trim()
    if (!id) return null
    const visibility = readKitchenVisibility(merged)
    // Child attachment and fulfilment records are never read from root preimages.
    // Only the current presentation fields survive; historical service arrays do not.
    const services = (kitchen as Partial<Kitchen>).services
    if (services && !Array.isArray(services)) {
      ;(merged as Record<string, unknown>).services = {
        ...(typeof services.title === 'string'
          ? { title: services.title }
          : {}),
        ...(typeof services.item_images === 'boolean'
          ? { item_images: services.item_images }
          : {}),
      }
    } else delete (merged as Record<string, unknown>).services
    delete (merged as Record<string, unknown>).integrations
    delete (merged as Record<string, unknown>).sproochli
    delete (merged as Record<string, unknown>).fulfilment

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
      route_scope: parts.routeScope ?? merged.route_scope,
    }
  }

  function map(kitchen: KitchenSurface): KitchenCard.Card {
    const id = safeString(kitchen.id).trim()
    const slug = safeString(kitchen.slug).trim()
    const identity = kitchen.presentation
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

    const visible = readKitchenVisibility(kitchen)
    const badges = visible ? [] : ['Hidden']

    return {
      id,
      to: resolveKitchenPath({ id, slug, route_scope: kitchen.route_scope }),

      title: name,
      subtitle: shortAddress,

      name,
      serviceLabels: kitchen.service_labels || [],
      hasPublishedMenu: kitchen.has_published_menu === true,
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
      mediaBackdropColor: safeString(kitchen.media_backdrop_color),
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

  function pill(
    target?: KitchenSurface | null | undefined
  ): KitchenCard.Card | null {
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

  return {
    surface,
    interface: buildInterface,
    pill,
    cell,
  }
}
