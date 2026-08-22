// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: fail radius-origin lookup closed when the explicit Place reference is absent.
import { createError } from 'h3'
import type { MenuDeliveryZone } from '../../utils/menu.ts'
import {
  geocodeMenuDeliveryAddress,
  readMenuDeliveryPlaceDetails,
  reverseGeocodeMenuDeliveryAddress,
  type MenuDeliveryAddress,
} from './delivery-google.ts'

export type MenuDeliveryAddressResult = {
  deliverable: boolean
  reason: string
  address?: MenuDeliveryAddress
  zone?: MenuDeliveryZone
  debug?: Record<string, unknown>
}

export type MenuDeliveryOrigin = {
  lat: number
  lng: number
  place_id: string
}

const text = (value: unknown) => String(value ?? '').trim()

export async function checkMenuDeliveryAddress(
  address: string,
  zones: MenuDeliveryZone[],
  origin?: MenuDeliveryOrigin
): Promise<MenuDeliveryAddressResult> {
  const input = text(address)
  if (!input) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Delivery address is required.',
    })
  }
  if (!zones.length) {
    return {
      deliverable: false,
      reason: 'This menu has no delivery zones configured.',
    }
  }

  const resolvedAddress = await geocodeMenuDeliveryAddress(input)

  return checkResolvedDeliveryAddress(resolvedAddress, zones, { origin })
}

export async function checkMenuDeliveryPlaceId(
  placeId: string,
  zones: MenuDeliveryZone[],
  origin?: MenuDeliveryOrigin
): Promise<MenuDeliveryAddressResult> {
  const input = text(placeId)
  if (!input) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Delivery address is required.',
    })
  }
  if (!zones.length) {
    return {
      deliverable: false,
      reason: 'This menu has no delivery zones configured.',
    }
  }

  const resolvedAddress = await readMenuDeliveryPlaceDetails(input)

  return checkResolvedDeliveryAddress(resolvedAddress, zones, {
    selectedAddress: true,
    origin,
  })
}

export async function checkMenuDeliveryCoordinates(
  lat: number,
  lng: number,
  zones: MenuDeliveryZone[],
  origin?: MenuDeliveryOrigin
): Promise<MenuDeliveryAddressResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Current location is required.',
    })
  }
  if (!zones.length) {
    return {
      deliverable: false,
      reason: 'This menu has no delivery zones configured.',
    }
  }

  const resolvedAddress = await reverseGeocodeMenuDeliveryAddress(lat, lng)

  return checkResolvedDeliveryAddress(resolvedAddress, zones, { origin })
}

export async function resolveMenuDeliveryOrigin(
  placeId: string,
  zones: MenuDeliveryZone[]
): Promise<MenuDeliveryOrigin | undefined> {
  if (!zones.some((zone) => Number(zone.radius_m || 0) > 0)) return undefined
  const id = text(placeId)
  if (!id) return undefined

  const address = await readMenuDeliveryPlaceDetails(id)
  if (
    !address.formatted ||
    !Number.isFinite(address.lat) ||
    !Number.isFinite(address.lng)
  ) {
    return undefined
  }

  return {
    lat: address.lat,
    lng: address.lng,
    place_id: address.place_id || id,
  }
}

function checkResolvedDeliveryAddress(
  address: MenuDeliveryAddress,
  zones: MenuDeliveryZone[],
  options: {
    selectedAddress?: boolean
    origin?: MenuDeliveryOrigin
  } = {}
): MenuDeliveryAddressResult {
  const match = matchMenuDeliveryZone(address, zones, options.origin)
  const debug = {
    ...(address.debug || {}),
    selected_address: options.selectedAddress === true,
    zone_count: zones.length,
    zone_ids: zones.map((zone) => text(zone.id || zone.label)).filter(Boolean),
    address_formatted: address.formatted,
    address_postal_code: address.postal_code,
    address_place_id: address.place_id,
    address_lat: address.lat,
    address_lng: address.lng,
    zone_match: match.reason,
    matched_zone_id: match.zone ? text(match.zone.id || match.zone.label) : '',
    delivery_origin_place_id: options.origin?.place_id || '',
    delivery_distance_m: match.distance_m || 0,
  }

  if (!address.formatted) {
    return {
      deliverable: false,
      reason: options.selectedAddress
        ? 'Selected delivery address could not be verified.'
        : 'Delivery address could not be found.',
      address,
      debug: {
        ...debug,
        failure: 'missing_formatted_address',
      },
    }
  }

  const zone = match.zone
  if (!zone) {
    return {
      deliverable: false,
      reason: 'This address is outside the delivery area.',
      address,
      debug: {
        ...debug,
        failure: 'no_matching_delivery_zone',
      },
    }
  }

  return {
    deliverable: true,
    reason: 'Delivery address is inside the delivery area.',
    address,
    zone,
    debug,
  }
}

function matchMenuDeliveryZone(
  address: MenuDeliveryAddress,
  zones: MenuDeliveryZone[],
  origin?: MenuDeliveryOrigin
) {
  const point = { lat: address.lat, lng: address.lng }
  const polygonZone = zones.find(
    (zone) =>
      Array.isArray(zone.polygon) &&
      zone.polygon.length >= 3 &&
      pointInPolygon(point, zone.polygon)
  )
  if (polygonZone) {
    return {
      zone: polygonZone,
      reason: 'polygon',
    }
  }

  const distance = origin ? distanceMetres(origin, point) : 0
  const radiusZone = origin
    ? [...zones]
        .filter((zone) => Number(zone.radius_m || 0) > 0)
        .sort(
          (left, right) =>
            Number(left.radius_m || 0) - Number(right.radius_m || 0)
        )
        .find((zone) => distance <= Number(zone.radius_m || 0))
    : undefined
  if (radiusZone) {
    return {
      zone: radiusZone,
      reason: 'radius',
      distance_m: Math.round(distance),
    }
  }

  const postalCode = text(address.postal_code)
  if (postalCode) {
    const postalZone = zones.find((zone) =>
      (zone.postal_codes || []).map(text).includes(postalCode)
    )
    if (postalZone) {
      return {
        zone: postalZone,
        reason: 'postal_code',
      }
    }
  }

  const placeId = text(address.place_id)
  if (placeId) {
    const placeZone = zones.find((zone) =>
      (zone.place_ids || []).map(text).includes(placeId)
    )
    if (placeZone) {
      return {
        zone: placeZone,
        reason: 'place_id',
      }
    }
  }

  return {
    zone: undefined,
    reason:
      !origin && zones.some((zone) => Number(zone.radius_m || 0) > 0)
        ? 'radius_origin_unavailable'
        : postalCode
          ? 'no_zone_for_postal_code'
          : 'no_postal_code',
    distance_m: Math.round(distance),
  }
}

function distanceMetres(
  left: { lat: number; lng: number },
  right: { lat: number; lng: number }
) {
  const radians = (value: number) => (value * Math.PI) / 180
  const latDelta = radians(right.lat - left.lat)
  const lngDelta = radians(right.lng - left.lng)
  const startLat = radians(left.lat)
  const endLat = radians(right.lat)
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2

  return (
    6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  )
}

function pointInPolygon(
  point: { lat: number; lng: number },
  polygon: Array<{ lat: number; lng: number }>
) {
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]?.lng ?? 0
    const yi = polygon[i]?.lat ?? 0
    const xj = polygon[j]?.lng ?? 0
    const yj = polygon[j]?.lat ?? 0
    const intersects =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi

    if (intersects) inside = !inside
  }

  return inside
}
