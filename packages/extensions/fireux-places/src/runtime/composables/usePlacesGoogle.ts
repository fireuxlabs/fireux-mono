import type { GooglePlace, Place, PlaceCard } from '../models/place.model'
import { toStoredPlace } from '../models/place.model'

const GOOGLE_AUTOCOMPLETE_ENDPOINT = '/api/places/autocomplete'

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
  limit: number
): Promise<PlaceCard.Cell[]> {
  if (limit <= 0 || typeof window === 'undefined') return []

  try {
    const url = new URL(GOOGLE_AUTOCOMPLETE_ENDPOINT, window.location.origin)
    url.searchParams.set('q', query)

    const res = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return []

    const json = await res.json()
    const preds: GooglePrediction[] = Array.isArray(json?.predictions)
      ? json.predictions
      : []

    const cells: PlaceCard.Cell[] = preds
      .filter((p) => {
        const id = canonicalPlaceId(p?.place_id)
        return id && !excludeIds.has(id)
      })
      .slice(0, limit)
      .map((p): PlaceCard.Cell => {
        const main = p.structured_formatting?.main_text
        const secondary = p.structured_formatting?.secondary_text
        const desc = p.description
        return {
          place_id: canonicalPlaceId(p.place_id) as string,
          name: main || desc || 'Unknown place',
          formatted_address: secondary || desc || undefined,
          source: 'google',
          avatar: null,
        }
      })

    log('autocomplete cells resolved', {
      query,
      total: cells.length,
      immediateLogoIds: cells
        .filter((cell) => Boolean(cell.avatar))
        .map((cell) => cell.place_id),
      pendingCount: cells.filter((cell) => !cell.avatar).length,
    })

    if (import.meta.dev) {
      console.log('[places] google supplement results', {
        query,
        requested: limit,
        count: cells.length,
        ids: cells.map((c) => c.place_id),
      })
    }

    return cells
  } catch (err) {
    if (import.meta.dev) console.error('[places] google supplement failed', err)
    return []
  }
}

export function mapDetailsToGooglePlace(
  id: string,
  result: Record<string, any>
): GooglePlace {
  const location = result?.geometry?.location ?? {}

  let phone: string | null = null
  if (typeof result?.international_phone_number === 'string') {
    phone = result.international_phone_number
  } else if (typeof result?.formatted_phone_number === 'string') {
    phone = result.formatted_phone_number
  }

  return {
    place_id: id,
    name: result?.name ?? 'Unknown place',
    formatted_address:
      result?.formatted_address ?? result?.vicinity ?? 'Unknown address',
    lat: Number(location?.lat ?? 0),
    lng: Number(location?.lng ?? 0),
    source: 'google',
    avatar: typeof result?.icon === 'string' ? result.icon : null,
    website: typeof result?.website === 'string' ? result.website : null,
    phone,
    rating: typeof result?.rating === 'number' ? result.rating : null,
    user_ratings_total:
      typeof result?.user_ratings_total === 'number'
        ? result.user_ratings_total
        : null,
  }
}

export interface PlaceDetailsResult {
  google: GooglePlace
  stored: Place
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
