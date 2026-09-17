// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: derive new canonical Place truth only from a bounded exact server-side Google Places response.
import { createError, type H3Event } from 'h3'
import { resolvePlacesApiKey } from './places-api-key'

type GoogleAddressComponent = {
  long_name?: unknown
  short_name?: unknown
  types?: unknown
}

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' && value.trim() && value.trim().length <= maxLength
    ? value.trim()
    : ''

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const stringList = (value: unknown, maxItems: number, maxLength: number) => {
  if (!Array.isArray(value)) return []
  return Array.from(
    new Set(
      value
        .slice(0, maxItems)
        .map((item) => text(item, maxLength))
        .filter(Boolean)
    )
  )
}

const httpsUrl = (value: unknown) => {
  const candidate = text(value, 2_048)
  if (!candidate) return ''
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.toString()
      : ''
  } catch {
    return ''
  }
}

const addressComponent = (components: GoogleAddressComponent[], type: string) =>
  components.find(
    (component) =>
      Array.isArray(component.types) && component.types.includes(type)
  ) ?? null

const componentText = (
  components: GoogleAddressComponent[],
  type: string,
  key: 'long_name' | 'short_name' = 'long_name'
) => text(addressComponent(components, type)?.[key], 120)

function providerAddress(value: unknown) {
  const components = Array.isArray(value)
    ? (value.filter(
        (component) => component && typeof component === 'object'
      ) as GoogleAddressComponent[])
    : []
  const streetNumber = componentText(components, 'street_number')
  const route = componentText(components, 'route')
  const city =
    componentText(components, 'locality') ||
    componentText(components, 'postal_town') ||
    componentText(components, 'administrative_area_level_2')
  const region = componentText(
    components,
    'administrative_area_level_1',
    'short_name'
  )
  const postalCode = componentText(components, 'postal_code')
  const countryCode = componentText(
    components,
    'country',
    'short_name'
  ).toUpperCase()

  return Object.fromEntries(
    Object.entries({
      street: [streetNumber, route].filter(Boolean).join(' '),
      city,
      region,
      postal_code: postalCode,
      country_code: /^[A-Z]{2}$/.test(countryCode) ? countryCode : '',
    }).filter(([, entry]) => Boolean(entry))
  )
}

function normalizeSearchTerm(...values: unknown[]) {
  return values
    .map((value) => text(value, 500))
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .slice(0, 1_000)
    .trim()
}

/**
 * Resolves a Google Place on the server and returns only provider-derived
 * canonical fields. The caller-supplied id is accepted only when Google
 * returns the exact same place_id.
 */
export async function fetchVerifiedGooglePlaceDetails(
  event: H3Event,
  placeId: string,
  includeOpeningHours = false
) {
  const key = resolvePlacesApiKey(event)
  if (!key) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Place verification is not configured.',
    })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set(
    'fields',
    [
      'address_component',
      'formatted_address',
      'formatted_phone_number',
      'geometry',
      'international_phone_number',
      'name',
      'place_id',
      'price_level',
      'type',
      'url',
      'vicinity',
      'website',
      ...(includeOpeningHours ? ['opening_hours'] : []),
    ].join(',')
  )
  url.searchParams.set('key', key)

  let response: Response
  let data: Record<string, unknown>
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(8_000) })
    data = record(await response.json())
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Place verification could not be completed.',
    })
  }

  const upstreamStatus = text(data.status, 80)
  if (
    !response.ok ||
    (upstreamStatus !== 'OK' &&
      upstreamStatus !== 'ZERO_RESULTS' &&
      upstreamStatus !== 'NOT_FOUND')
  ) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Place verification could not be completed.',
    })
  }
  if (upstreamStatus !== 'OK') {
    throw createError({
      statusCode: 404,
      statusMessage: 'The Place provider did not recognize this id.',
    })
  }

  const result = record(data.result)
  if (text(result.place_id, 1_500) !== placeId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The Place provider returned a different identity.',
    })
  }

  const name = text(result.name, 240)
  const location = record(record(result.geometry).location)
  const lat =
    typeof location.lat === 'number' ? location.lat : Number(location.lat)
  const lng =
    typeof location.lng === 'number' ? location.lng : Number(location.lng)
  if (
    !name ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    (lat === 0 && lng === 0)
  ) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The Place provider returned incomplete location truth.',
    })
  }

  const formattedAddress = text(
    result.formatted_address || result.vicinity,
    500
  )
  const address = providerAddress(result.address_components)
  const addressRecord = record(address)
  const locality = Array.from(
    new Set(
      [
        text(addressRecord.city, 120),
        text(addressRecord.region, 120),
        text(addressRecord.country_code, 2),
      ].filter(Boolean)
    )
  ).join(', ')
  const phone = text(
    result.international_phone_number || result.formatted_phone_number,
    120
  )
  const website = httpsUrl(result.website)
  const googleMapsUrl = httpsUrl(result.url)
  const types = stringList(result.types, 48, 120)
  const priceLevel = Number(result.price_level)

  const payload: Record<string, unknown> = {
    name,
    lat,
    lng,
    place_type: 'physical',
    search_term: normalizeSearchTerm(
      name,
      formattedAddress,
      addressRecord.city,
      addressRecord.region,
      addressRecord.country_code
    ),
    ...(formattedAddress ? { formatted_address: formattedAddress } : {}),
    ...(locality ? { short_address: locality } : {}),
    ...(Object.keys(address).length ? { address } : {}),
    ...(phone ? { phone } : {}),
    ...(website ? { website } : {}),
    ...(googleMapsUrl ? { google_maps_url: googleMapsUrl } : {}),
    ...(types.length ? { types } : {}),
    ...(Number.isInteger(priceLevel) && priceLevel >= 0 && priceLevel <= 4
      ? { price_level: String(priceLevel) }
      : {}),
  }
  return {
    payload,
    openingHours: includeOpeningHours ? result.opening_hours : undefined,
    attributions: Array.isArray(data.html_attributions)
      ? data.html_attributions
          .filter((value): value is string => typeof value === 'string')
          .slice(0, 20)
      : [],
  }
}

export async function fetchVerifiedGooglePlacePayload(
  event: H3Event,
  placeId: string
): Promise<Record<string, unknown>> {
  return (await fetchVerifiedGooglePlaceDetails(event, placeId)).payload
}
