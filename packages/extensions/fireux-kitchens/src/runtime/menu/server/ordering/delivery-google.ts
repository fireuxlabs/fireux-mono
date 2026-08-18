import { createError } from 'h3'
import { resolveGoogleMapsApiKey } from 'fireux-places/runtime/place/server/integration/google/google-api-key'

// Server API spine: keep provider plumbing separate from delivery-zone matching.
// See docs/concepts/server-api.md and docs/concepts/menu-ordering.md.
export type MenuDeliveryAddress = {
  input: string
  formatted: string
  postal_code: string
  place_id: string
  lat: number
  lng: number
  debug?: Record<string, unknown>
}

const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : undefined
}

export async function readMenuDeliveryPlaceDetails(
  placeId: string
): Promise<MenuDeliveryAddress> {
  const key = resolveGoogleMapsApiKey()
  if (!key.key) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google Maps key is missing.',
    })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set(
    'fields',
    ['address_component', 'formatted_address', 'geometry', 'place_id'].join(',')
  )
  url.searchParams.set('key', key.key)

  const response = await fetch(url)
  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Delivery address lookup failed.',
    })
  }

  const payload = (await response.json()) as Record<string, any>
  const result = payload.result || null
  const baseDebug = {
    lookup: 'place_details',
    input_place_id: placeId,
    key_source: key.source,
    http_status: response.status,
    upstream_status: text(payload.status),
    upstream_error_message: text(payload.error_message),
    has_result: Boolean(result),
  }
  if (payload.status !== 'OK' || !result) {
    return {
      input: placeId,
      formatted: '',
      postal_code: '',
      place_id: placeId,
      lat: 0,
      lng: 0,
      debug: baseDebug,
    }
  }

  const location = result.geometry?.location || {}
  const lat = numberValue(location.lat)
  const lng = numberValue(location.lng)
  const formatted = text(result.formatted_address)
  const postalCode = readAddressComponent(
    result.address_components || result.address_component,
    'postal_code'
  )
  const resolvedPlaceId = text(result.place_id || placeId)

  return {
    input: placeId,
    formatted,
    postal_code: postalCode,
    place_id: resolvedPlaceId,
    lat: lat ?? 0,
    lng: lng ?? 0,
    debug: {
      ...baseDebug,
      resolved_place_id: resolvedPlaceId,
      has_formatted_address: Boolean(formatted),
      postal_code: postalCode,
      lat: lat ?? null,
      lng: lng ?? null,
    },
  }
}

export async function geocodeMenuDeliveryAddress(
  address: string
): Promise<MenuDeliveryAddress> {
  const key = resolveGoogleMapsApiKey()
  if (!key.key) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google Maps key is missing.',
    })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', address)
  url.searchParams.set('region', 'ch')
  url.searchParams.set('key', key.key)

  const response = await fetch(url)
  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Delivery address lookup failed.',
    })
  }

  const payload = (await response.json()) as Record<string, any>
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

export async function reverseGeocodeMenuDeliveryAddress(
  lat: number,
  lng: number
): Promise<MenuDeliveryAddress> {
  const key = resolveGoogleMapsApiKey()
  if (!key.key) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google Maps key is missing.',
    })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('latlng', `${lat},${lng}`)
  url.searchParams.set('result_type', 'street_address|postal_code')
  url.searchParams.set('key', key.key)

  const response = await fetch(url)
  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Current location lookup failed.',
    })
  }

  const payload = (await response.json()) as Record<string, any>
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

function readAddressComponent(components: unknown, type: string) {
  if (!Array.isArray(components)) return ''

  const component = components.find(
    (entry) => Array.isArray(entry?.types) && entry.types.includes(type)
  )

  return text(component?.long_name || component?.short_name)
}
