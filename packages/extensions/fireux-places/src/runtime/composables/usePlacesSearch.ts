/* eslint-disable no-console */
import type { Ref } from 'vue'
import type { Place, PlaceCard } from '../models/place.model'

export interface UsePlacesSearchResult {
  searchPlaces: (query: string) => Promise<PlaceCard.Cell[]>
}

const MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT = 4
const MAX_RESULTS = 10
const GOOGLE_AUTOCOMPLETE_ENDPOINT = '/api/places/autocomplete'

const canonicalPlaceId = (id: string | null | undefined) =>
  (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')

export function usePlacesSearch(
  collection?: Ref<Place[] | undefined>
): UsePlacesSearchResult {
  const norm = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()

  const tokens = (value: string) =>
    norm(value)
      .split(' ')
      .filter((token) => token.length >= 3)

  const scoreTokenMatch = (token: string, candidate: string): number => {
    if (candidate === token) return 3
    if (candidate.startsWith(token) || token.startsWith(candidate)) return 2
    if (candidate.includes(token)) return 1
    return 0
  }

  const shouldIncludeMatch = (
    queryTokens: string[],
    strongMatches: number,
    normalizedHaystack: string,
    normalizedQuery: string
  ): boolean => {
    if (queryTokens.length === 0) {
      return (
        normalizedQuery.length >= 2 &&
        normalizedHaystack.includes(normalizedQuery)
      )
    }

    const requiredStrongMatches =
      queryTokens.length >= 2 ? Math.min(queryTokens.length, 2) : 1
    if (strongMatches >= requiredStrongMatches) {
      return true
    }

    return normalizedHaystack.includes(normalizedQuery)
  }

  const toFirestoreCell = (place: Place): PlaceCard.Cell => ({
    place_id: canonicalPlaceId(place.place_id),
    name: place.name,
    avatar: place.avatar ?? null,
    formatted_address: place.formatted_address,
    rating: place.rating ?? null,
    meta_right: 'Firestore',
  })

  const missingSearchTermWarnings = new Set<string>()

  async function fetchGoogleSupplement(
    query: string,
    excludeIds: Set<string>,
    limit: number
  ): Promise<PlaceCard.Cell[]> {
    if (limit <= 0) return []
    if (typeof window === 'undefined') return []

    try {
      const url = new URL(GOOGLE_AUTOCOMPLETE_ENDPOINT, window.location.origin)
      url.searchParams.set('q', query)

      const response = await fetch(url.toString(), {
        headers: {
          accept: 'application/json',
        },
      })

      if (!response.ok) {
        return []
      }

      const payload = await response.json()
      const predictions = Array.isArray(payload?.predictions)
        ? payload.predictions
        : []

      const filteredPredictions = predictions.filter((prediction: any) => {
        const id = canonicalPlaceId(prediction?.place_id)
        if (!id) return false
        return !excludeIds.has(id)
      })

      const trimmedPredictions = filteredPredictions.slice(0, limit)

      return trimmedPredictions.map((prediction: any): PlaceCard.Cell => {
        const mainText = prediction?.structured_formatting?.main_text
        const secondaryText = prediction?.structured_formatting?.secondary_text
        const description = prediction?.description ?? ''

        return {
          place_id: prediction.place_id,
          name: mainText || description || 'Unknown place',
          avatar: null,
          formatted_address: secondaryText || description || undefined,
          rating: null,
          meta_right: 'Google',
        }
      })
    } catch (error) {
      if (import.meta.dev) {
        console.error('[places] Google supplement failed', error)
      }
      return []
    }
  }

  async function searchPlaces(query: string): Promise<PlaceCard.Cell[]> {
    const normalizedQuery = norm(query)
    if (!normalizedQuery) return []

    const queryTokens = tokens(normalizedQuery)
    const list = collection?.value ?? []

    const localMatches = list
      .map((place) => {
        const canonicalId = canonicalPlaceId(place.place_id)
        if (import.meta.dev && !place.search_term) {
          if (!missingSearchTermWarnings.has(canonicalId)) {
            missingSearchTermWarnings.add(canonicalId)
            console.warn(
              `[places] Missing search_term for place ${canonicalId}. Consider running the data hygiene script to backfill.`
            )
          }
        }

        const haystack = [
          place.name,
          place.formatted_address,
          place.search_term,
        ]
          .filter(Boolean)
          .join(' ')

        const normalizedHaystack = norm(haystack)
        if (!normalizedHaystack) return null

        const haystackTokens = normalizedHaystack
          .split(' ')
          .filter((token) => token.length >= 3)

        const tokenScores = queryTokens.map((token) => {
          let bestScore = 0
          for (const candidate of haystackTokens) {
            const score = scoreTokenMatch(token, candidate)
            if (score === 3) {
              bestScore = 3
              break
            }
            if (score > bestScore) {
              bestScore = score
            }
          }
          return bestScore
        })

        const strongMatches = tokenScores.filter((score) => score >= 2).length
        const include = shouldIncludeMatch(
          queryTokens,
          strongMatches,
          normalizedHaystack,
          normalizedQuery
        )

        if (!include) return null

        const tokenScore = tokenScores.reduce((sum, score) => sum + score, 0)
        const substringBonus = normalizedHaystack.includes(normalizedQuery)
          ? Math.max(2, queryTokens.length)
          : 0

        return {
          place,
          score: tokenScore + substringBonus,
        }
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score) as Array<{
      place: Place
      score: number
    }>

    const firestoreCells = localMatches.map(({ place }) =>
      toFirestoreCell(place)
    )

    if (firestoreCells.length >= MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT) {
      return firestoreCells
    }

    const excludeIds = new Set(
      firestoreCells.map((cell) => canonicalPlaceId(cell.place_id))
    )
    const supplementLimit = Math.max(
      0,
      MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT - firestoreCells.length
    )
    const googleCells = await fetchGoogleSupplement(
      query,
      excludeIds,
      supplementLimit
    )

    const combined = [...firestoreCells, ...googleCells].filter(
      (cell, index, array) =>
        array.findIndex(
          (candidate) =>
            canonicalPlaceId(candidate.place_id) ===
            canonicalPlaceId(cell.place_id)
        ) === index
    )

    if (combined.length > 0) {
      const limited = combined.slice(0, MAX_RESULTS)
      if (firestoreCells.length === 0) {
        console.log(
          `[places] No local match for "${query}", returning Google suggestions.`
        )
      }
      return limited
    }

    console.log(`[places] No local or Google match for "${query}".`)
    return []
  }

  return { searchPlaces }
}
