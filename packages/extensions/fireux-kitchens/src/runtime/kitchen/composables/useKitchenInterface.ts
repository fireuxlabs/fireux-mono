import {
  readPlaceCurrencyCode,
  readMediaBackdropColor,
} from 'fireux-places/runtime/place/utils/place-spine'
import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import { toShortAddress } from 'fireux-places/runtime/place/utils/format-place-address'
import type { Kitchen } from '../models/model'
import { readKitchenVisibility } from '../utils/kitchen-readers'
import { resolveKitchenPath } from '../utils/kitchen-interface-projection'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { KitchenCard, KitchenSurface } from '../types/presentation'

type KitchenSurfaceSource = Pick<Kitchen, 'id' | 'identity'> &
  Partial<Omit<Kitchen, 'id' | 'identity'>> &
  Pick<
    KitchenSurface,
    'can_write' | 'service_labels' | 'has_published_menu' | 'route_scope'
  >

export type KitchenSurfaceParts = {
  kitchen?: KitchenSurfaceSource | null
  place?:
    | (Partial<Place> & Pick<KitchenSurface, 'image_shade' | 'image_kind'>)
    | null
  scope?: { operator_ids?: string[]; team_ids?: string[] } | null
  routeScope?: KitchenSurface['route_scope']
}

export function useKitchenInterface() {
  type KitchenCell = Pick<
    KitchenCard,
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

  function surface(parts: KitchenSurfaceParts): KitchenSurface | null {
    const kitchen = parts.kitchen
    if (!kitchen?.identity) return null
    const id = safeString(kitchen.id).trim()
    const place = parts.place
    if (!id || (place?.id && place.id !== id)) return null

    const backdrop = readMediaBackdropColor(place?.media_backdrop_color)
    const presentation = {
      display_name: safeString(place?.name),
      tagline: safeString(place?.tagline),
      image_url: safeString(place?.image_url),
      ...(backdrop ? { media_backdrop_color: backdrop } : {}),
    }
    const currency = readPlaceCurrencyCode(place)
    const services = kitchen.services
    return {
      id,
      identity: kitchen.identity,
      ...(kitchen.created ? { created: kitchen.created } : {}),
      ...(kitchen.updated ? { updated: kitchen.updated } : {}),
      ...(kitchen.context !== undefined ? { context: kitchen.context } : {}),
      ...(kitchen.guidance_ids ? { guidance_ids: kitchen.guidance_ids } : {}),
      ...(kitchen.theme ? { theme: kitchen.theme } : {}),
      ...(kitchen.orders ? { orders: kitchen.orders } : {}),
      ...(kitchen.tables ? { tables: kitchen.tables } : {}),
      ...(services && !Array.isArray(services)
        ? {
            services: {
              ...(typeof services.title === 'string'
                ? { title: services.title }
                : {}),
              ...(typeof services.item_images === 'boolean'
                ? { item_images: services.item_images }
                : {}),
            },
          }
        : {}),
      ...(kitchen.can_write !== undefined
        ? { can_write: kitchen.can_write }
        : {}),
      ...(kitchen.service_labels
        ? { service_labels: kitchen.service_labels }
        : {}),
      ...(kitchen.has_published_menu !== undefined
        ? { has_published_menu: kitchen.has_published_menu }
        : {}),
      ...(parts.scope?.operator_ids
        ? { operator_ids: parts.scope.operator_ids }
        : {}),
      ...(parts.scope?.team_ids ? { team_ids: parts.scope.team_ids } : {}),
      name: place?.name,
      short_name: place?.short_name,
      about: place?.about,
      formatted_address: place?.formatted_address,
      short_address: place?.short_address,
      address: place?.address,
      lat: place?.lat,
      lng: place?.lng,
      timezone: place?.timezone,
      image_url: place?.image_url,
      cover_image: place?.cover_image,
      gallery_images: place?.gallery_images,
      logo_image: place?.logo_image,
      wordmark_image: place?.wordmark_image,
      ...(backdrop ? { media_backdrop_color: backdrop } : {}),
      phone: place?.phone,
      email: place?.email,
      website: place?.website,
      google_maps_url: place?.google_maps_url,
      social_links: place?.social_links,
      types: place?.types,
      tags: place?.tags,
      price_level: place?.price_level,
      claimed_by: place?.claimed_by,
      verified: place?.verified,
      image_shade: place?.image_shade,
      image_kind: place?.image_kind,
      presentation,
      slug: safeString(kitchen.identity.slug),
      status: kitchen.identity.status,
      visibility: readKitchenVisibility(kitchen),
      display_name: presentation.display_name,
      tagline: presentation.tagline,
      display_image_url: presentation.image_url,
      food_gallery: place?.gallery_images || [],
      ...(currency ? { currency_code: currency } : {}),
      route_scope: parts.routeScope ?? kitchen.route_scope,
    }
  }

  function map(kitchen: KitchenSurface): KitchenCard {
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
  ): KitchenCard | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(
    target?: KitchenSurface | null | undefined
  ): KitchenCard | null {
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
