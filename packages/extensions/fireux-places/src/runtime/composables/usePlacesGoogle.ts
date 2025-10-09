/* eslint-disable no-console */
import type { PlaceCard } from '../models/place.model'

const GOOGLE_AUTOCOMPLETE_ENDPOINT = '/api/places/autocomplete'

const log = (...args: unknown[]) => {
  if (import.meta.dev) {
    console.info('[places][logos]', ...args)
  }
}

const canonicalPlaceId = (id?: string | null) =>
  (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')

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
    const preds = Array.isArray(json?.predictions) ? json.predictions : []

    const cells = preds
      .filter((p: any) => {
        const id = canonicalPlaceId(p?.place_id)
        return id && !excludeIds.has(id)
      })
      .slice(0, limit)
      .map((p: any): PlaceCard.Cell => {
        const main = p?.structured_formatting?.main_text
        const secondary = p?.structured_formatting?.secondary_text
        const desc = p?.description
        return {
          place_id: canonicalPlaceId(p.place_id),
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
