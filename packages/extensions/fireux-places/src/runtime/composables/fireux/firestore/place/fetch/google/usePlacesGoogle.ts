import { Place, type BasePlace, type GooglePlace, type PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { toShortAddress } from '../../utils/view/formatPlaceAddress'

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
        const url = new URL(GOOGLE_AUTOCOMPLETE_ENDPOINT, window.location.origin)
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
  return {
    ...Place,
    id: g.id,
    name: g.name,
    short_name: '',
    formatted_address: g.formatted_address,
    short_address: toShortAddress(g.formatted_address),
    lat: g.lat,
    lng: g.lng,
    place_type: 'physical',
    source: 'fireux',
    image_url: '',
    search_term,
  } as PlaceUpsertInput
}


export function mapDetailsToGooglePlace(
  id: string,
  result: Record<string, any>
): GooglePlace {
  const location = result?.geometry?.location ?? {}

  let phone = ''
  if (typeof result?.international_phone_number === 'string') {
    phone = result.international_phone_number
  } else if (typeof result?.formatted_phone_number === 'string') {
    phone = result.formatted_phone_number
  }

  return {
    id,
    name: result?.name ?? 'Unknown place',
    short_name: '',
    place_type: 'physical',
    formatted_address:
      result?.formatted_address ?? result?.vicinity ?? 'Unknown address',
    short_address: toShortAddress(
      result?.formatted_address ?? result?.vicinity ?? 'Unknown address'
    ),
    lat: Number(location?.lat ?? 0),
    lng: Number(location?.lng ?? 0),
    source: 'google',
    image_url: '',
    image_shade: 'none',
    claimed_by: '',
    slug: '',
    website: typeof result?.website === 'string' ? result.website : '',
    phone,
    rating: typeof result?.rating === 'number' ? result.rating : 0,
    user_ratings_total:
      typeof result?.user_ratings_total === 'number'
        ? result.user_ratings_total
        : 0,
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
