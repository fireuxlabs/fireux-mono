import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { MenuDeliveryZone } from '../../models/menu/menu.model.ts'

export type MenuDeliveryAddress = {
  input: string
  formatted: string
  postal_code: string
  place_id: string
  lat: number
  lng: number
}

export type MenuDeliveryAddressResult = {
  deliverable: boolean
  reason: string
  address?: MenuDeliveryAddress
  zone?: MenuDeliveryZone
}

const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : undefined
}

const googleMapsApiKey = () => {
  const runtime = useRuntimeConfig() as Record<string, any>

  return text(runtime.googleMapsApiKey || runtime.public?.googleMapsApiKey)
}

export async function checkMenuDeliveryAddress(
  address: string,
  zones: MenuDeliveryZone[]
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

  return checkResolvedDeliveryAddress(resolvedAddress, zones)
}

export async function checkMenuDeliveryCoordinates(
  lat: number,
  lng: number,
  zones: MenuDeliveryZone[]
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

  return checkResolvedDeliveryAddress(resolvedAddress, zones)
}

async function geocodeMenuDeliveryAddress(
  address: string
): Promise<MenuDeliveryAddress> {
  const key = googleMapsApiKey()
  if (!key) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google Maps key is missing.',
    })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', address)
  url.searchParams.set('region', 'ch')
  url.searchParams.set('key', key)

  const response = await fetch(url)
  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Delivery address lookup failed.',
    })
  }

  const payload = await response.json() as Record<string, any>
  const result = Array.isArray(payload.results) ? payload.results[0] : null
  if (payload.status !== 'OK' || !result) {
    return {
      input: address,
      formatted: '',
      postal_code: '',
      place_id: '',
      lat: 0,
      lng: 0,
    }
  }

  const location = result.geometry?.location || {}
  const lat = numberValue(location.lat)
  const lng = numberValue(location.lng)

  return {
    input: address,
    formatted: text(result.formatted_address),
    postal_code: readAddressComponent(result.address_components, 'postal_code'),
    place_id: text(result.place_id),
    lat: lat ?? 0,
    lng: lng ?? 0,
  }
}

async function reverseGeocodeMenuDeliveryAddress(
  lat: number,
  lng: number
): Promise<MenuDeliveryAddress> {
  const key = googleMapsApiKey()
  if (!key) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google Maps key is missing.',
    })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('latlng', `${lat},${lng}`)
  url.searchParams.set('result_type', 'street_address|postal_code')
  url.searchParams.set('key', key)

  const response = await fetch(url)
  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Current location lookup failed.',
    })
  }

  const payload = await response.json() as Record<string, any>
  const result = Array.isArray(payload.results) ? payload.results[0] : null
  if (payload.status !== 'OK' || !result) {
    return {
      input: `${lat},${lng}`,
      formatted: '',
      postal_code: '',
      place_id: '',
      lat,
      lng,
    }
  }

  return {
    input: `${lat},${lng}`,
    formatted: text(result.formatted_address),
    postal_code: readAddressComponent(result.address_components, 'postal_code'),
    place_id: text(result.place_id),
    lat,
    lng,
  }
}

function checkResolvedDeliveryAddress(
  address: MenuDeliveryAddress,
  zones: MenuDeliveryZone[]
): MenuDeliveryAddressResult {
  if (!address.formatted) {
    return {
      deliverable: false,
      reason: 'Delivery address could not be found.',
      address,
    }
  }

  const zone = matchMenuDeliveryZone(address, zones)
  if (!zone) {
    return {
      deliverable: false,
      reason: 'This address is outside the delivery area.',
      address,
    }
  }

  return {
    deliverable: true,
    reason: 'Delivery address is inside the delivery area.',
    address,
    zone,
  }
}

function readAddressComponent(components: unknown, type: string) {
  if (!Array.isArray(components)) return ''

  const component = components.find((entry) =>
    Array.isArray(entry?.types) && entry.types.includes(type)
  )

  return text(component?.long_name || component?.short_name)
}

function matchMenuDeliveryZone(
  address: MenuDeliveryAddress,
  zones: MenuDeliveryZone[]
) {
  const point = { lat: address.lat, lng: address.lng }
  const polygonZone = zones.find((zone) =>
    Array.isArray(zone.polygon) &&
    zone.polygon.length >= 3 &&
    pointInPolygon(point, zone.polygon)
  )
  if (polygonZone) return polygonZone

  const postalCode = text(address.postal_code)
  if (postalCode) {
    const postalZone = zones.find((zone) =>
      (zone.postal_codes || []).map(text).includes(postalCode)
    )
    if (postalZone) return postalZone
  }

  const placeId = text(address.place_id)
  if (placeId) {
    return zones.find((zone) =>
      (zone.place_ids || []).map(text).includes(placeId)
    )
  }

  return undefined
}

function pointInPolygon(
  point: { lat: number, lng: number },
  polygon: Array<{ lat: number, lng: number }>
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
