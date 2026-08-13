// Concurrent edit — 2026-07-20 19:40 CEST — Repo Efficiency Pass 2 of 6: map Norwegian canonical Places to NOK.
// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: carry real Google defaults without inventing missing Place truth.
// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: consume the shared country-to-currency suggestion.
import {
  type BasePlace,
  type GooglePlace,
  type PlaceAddress,
  type PlaceUpsertInput,
} from '../../../../../../models/place.model'
import { toShortAddress } from '../../utils/view/formatPlaceAddress'
import {
  placeBusinessHoursFromGooglePeriods,
  suggestPlaceCurrencyCode,
} from '../../../../../../utils/place-spine'

const GOOGLE_AUTOCOMPLETE_ENDPOINT = '/api/places/autocomplete'

export type PlacesAutocompleteDebug = {
  query: string
  url: string
  ok: boolean
  httpStatus: number | null
  error: string | null
  upstreamStatus: string | null
  predictionsCount: number
  timeMs: number
  at: string
}

let lastAutocompleteDebug: PlacesAutocompleteDebug | null = null
export function getLastPlacesAutocompleteDebug(): PlacesAutocompleteDebug | null {
  return lastAutocompleteDebug
}

const log = (...args: unknown[]) => {
  if (import.meta.dev) {
    console.info('[places][logos]', ...args)
  }
}

/** Normalize any incoming place_id:
 *  - trim
 *  - remove surrounding quotes
 *  - remove accidental `places/` prefix
 *  - return null if empty after normalization
 */
export const canonicalPlaceId = (id?: string | null): string | null =>
  (id ?? '')
    .trim()
    .replace(/^"+/, '')
    .replace(/"+$/, '')
    .replace(/^places\//, '') || null

/** Type for Google Autocomplete prediction */
interface GooglePrediction {
  place_id: string
  description?: string
  structured_formatting?: {
    main_text?: string
    secondary_text?: string
  }
  types?: string[]
  terms?: { value: string }[]
}

/**
 * Calls `/api/places/autocomplete?q=...` and returns normalized cells.
 * `excludeIds` should contain canonicalized place_ids to filter dupes.
 */
export async function fetchGoogle(
  query: string,
  excludeIds: Set<string>,
  limit: number,
  options?: { type?: string | null }
): Promise<BasePlace[]> {
  if (limit <= 0 || typeof window === 'undefined') return []

  const start = Date.now()
  try {
    const url = new URL(GOOGLE_AUTOCOMPLETE_ENDPOINT, window.location.origin)
    url.searchParams.set('q', query)
    if (options?.type) {
      url.searchParams.set('type', String(options.type))
    }

    const res = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) {
      if (import.meta.dev) {
        lastAutocompleteDebug = {
          query,
          url: url.toString(),
          ok: false,
          httpStatus: res.status,
          error: 'http_error',
          upstreamStatus: null,
          predictionsCount: 0,
          timeMs: Date.now() - start,
          at: new Date().toISOString(),
        }
      }
      return []
    }

    const json = await res.json()

    if (import.meta.dev) {
      const preds = Array.isArray(json?.predictions) ? json.predictions : []
      lastAutocompleteDebug = {
        query,
        url: url.toString(),
        ok: true,
        httpStatus: res.status,
        error: (json?.error as string | undefined) ?? null,
        upstreamStatus: (json?.upstreamStatus as string | undefined) ?? null,
        predictionsCount: preds.length,
        timeMs: Date.now() - start,
        at: new Date().toISOString(),
      }
    }

    if (import.meta.dev && json?.error) {
      console.warn('[places] autocomplete error', {
        query,
        error: json.error,
        upstreamStatus: json.upstreamStatus ?? null,
      })
    }
    const preds: GooglePrediction[] = Array.isArray(json?.predictions)
      ? json.predictions
      : []

    const places: BasePlace[] = preds
      .filter((p) => {
        const id = canonicalPlaceId(p?.place_id)
        return id && !excludeIds.has(id)
      })
      .slice(0, limit)
      .map((p): BasePlace => {
        const id = canonicalPlaceId(p.place_id) as string
        const main = p.structured_formatting?.main_text
        const secondary = p.structured_formatting?.secondary_text
        const desc = p.description
        const formattedAddress = secondary || desc || ''
        const name = String(main || desc || '').trim()
        return {
          id,
          name,
          short_name: '',
          place_type: 'physical',
          formatted_address: formattedAddress,
          short_address: toShortAddress(formattedAddress),
          lat: 0,
          lng: 0,
          image_url: '',
          image_shade: 'none',
          claimed_by: '',
          source: 'google',
          slug: '',
        }
      })

    log('autocomplete cells resolved', {
      query,
      total: places.length,
      immediateLogoIds: places
        .filter((place) => Boolean(place.image_url))
        .map((place) => place.id),
      pendingCount: places.filter((place) => !place.image_url).length,
    })

    if (import.meta.dev) {
      console.log('[places] google supplement results', {
        query,
        requested: limit,
        count: places.length,
        ids: places.map((c) => c.id),
      })
    }

    return places
  } catch (err) {
    if (import.meta.dev) {
      try {
        const url = new URL(
          GOOGLE_AUTOCOMPLETE_ENDPOINT,
          window.location.origin
        )
        url.searchParams.set('q', query)
        lastAutocompleteDebug = {
          query,
          url: url.toString(),
          ok: false,
          httpStatus: null,
          error: 'exception',
          upstreamStatus: null,
          predictionsCount: 0,
          timeMs: Date.now() - start,
          at: new Date().toISOString(),
        }
      } catch {
        // ignore
      }
    }
    if (import.meta.dev) console.error('[places] google supplement failed', err)
    return []
  }
}

function toStoredPlace(g: GooglePlace): PlaceUpsertInput {
  const search_term = `${g.name} ${g.formatted_address}`.toLowerCase()
  const address = Object.fromEntries(
    Object.entries(g.address).filter(([, value]) => Boolean(String(value || '').trim()))
  )
  const stored: Record<string, unknown> = {
    id: g.id,
    name: g.name,
    place_type: 'physical',
    source: 'fireux',
    search_term,
    ...(Object.keys(address).length ? { address } : {}),
    ...(g.formatted_address ? { formatted_address: g.formatted_address } : {}),
    ...(g.formatted_address
      ? { short_address: toShortAddress(g.formatted_address) }
      : {}),
    ...(Number.isFinite(g.lat) ? { lat: g.lat } : {}),
    ...(Number.isFinite(g.lng) ? { lng: g.lng } : {}),
    ...(g.phone ? { phone: g.phone } : {}),
    ...(g.website ? { website: g.website } : {}),
    ...(g.google_maps_url ? { google_maps_url: g.google_maps_url } : {}),
    ...(g.types.length ? { types: g.types } : {}),
    ...(g.price_level ? { price_level: g.price_level } : {}),
    ...(g.default_currency_code
      ? { default_currency_code: g.default_currency_code }
      : {}),
    ...(g.business_hours ? { business_hours: g.business_hours } : {}),
  }

  return stored as PlaceUpsertInput
}

type GoogleAddressComponent = {
  long_name?: string
  short_name?: string
  types?: string[]
}

const text = (value: unknown) => String(value ?? '').trim()

const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

const numberValue = (value: unknown): number => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const priceLevel = (value: unknown): string => {
  const number = Number(value)
  return Number.isFinite(number) ? String(number) : ''
}

function component(
  components: GoogleAddressComponent[],
  type: string
): GoogleAddressComponent | null {
  return components.find((item) => item.types?.includes(type)) ?? null
}

function addressFromGoogle(components: GoogleAddressComponent[]): PlaceAddress {
  const streetNumber = text(component(components, 'street_number')?.long_name)
  const streetName = text(component(components, 'route')?.long_name)
  const locality = text(component(components, 'locality')?.long_name)
  const region = text(
    component(components, 'administrative_area_level_1')?.short_name
  )
  const postalCode = text(component(components, 'postal_code')?.long_name)
  const countryCode = text(component(components, 'country')?.short_name)

  return {
    street: [streetName, streetNumber].filter(Boolean).join(' '),
    city: locality,
    region,
    postal_code: postalCode,
    country_code: countryCode,
  }
}

export function mapDetailsToGooglePlace(
  id: string,
  result: Record<string, any>
): GooglePlace {
  const location = result?.geometry?.location ?? {}
  const components = Array.isArray(result?.address_components)
    ? result.address_components
    : []
  const address = addressFromGoogle(components)

  let phone = ''
  if (typeof result?.international_phone_number === 'string') {
    phone = result.international_phone_number
  } else if (typeof result?.formatted_phone_number === 'string') {
    phone = result.formatted_phone_number
  }

  return {
    id,
    name: text(result?.name),
    short_name: '',
    place_type: 'physical',
    formatted_address: text(result?.formatted_address || result?.vicinity),
    short_address: toShortAddress(
      text(result?.formatted_address || result?.vicinity)
    ),
    address,
    lat: numberValue(location?.lat),
    lng: numberValue(location?.lng),
    source: 'google',
    image_url: '',
    image_shade: 'none',
    claimed_by: '',
    slug: '',
    website: typeof result?.website === 'string' ? result.website : '',
    phone,
    google_maps_url: typeof result?.url === 'string' ? result.url : '',
    price_level: priceLevel(result?.price_level),
    types: stringArray(result?.types),
    default_currency_code: suggestPlaceCurrencyCode(address.country_code),
    business_hours:
      placeBusinessHoursFromGooglePeriods(result?.opening_hours?.periods) ||
      undefined,
  }
}

export interface PlaceDetailsResult {
  google: GooglePlace
  stored: PlaceUpsertInput
  raw: Record<string, any>
}

export async function fetchPlaceDetails(
  placeId: string
): Promise<PlaceDetailsResult | null> {
  const id = canonicalPlaceId(placeId)
  if (!id) return null
  if (typeof window === 'undefined') return null

  const url = new URL('/api/places/details', window.location.origin)
  url.searchParams.set('place_id', id)

  const res = await fetch(url.toString(), {
    headers: { accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) return null

  const { result } = (await res.json()) as {
    result: Record<string, any> | null
  }
  if (!result) return null

  const google = mapDetailsToGooglePlace(id, result)
  return { google, stored: toStoredPlace(google), raw: result }
}
