import { fetchGoogle, getLastPlacesAutocompleteDebug } from '../google/usePlacesGoogle'
import { resolveExistingPlace } from './resolveExistingPlace'
import type { MapToBasePlace, SearchStage } from './types'

export const searchGoogle = async (params: {
  term: string
  allowGoogle: boolean
  mapToCard: MapToBasePlace
  type?: string | null
}): Promise<SearchStage> => {
  const { term, allowGoogle, mapToCard, type } = params

  if (!allowGoogle) {
    return { results: [], stage: 'skip-google', debug: { stage: 'skip-google' } }
  }

  if (term.length < 4) {
    return {
      results: [],
      stage: 'skip-google-too-short',
      debug: { stage: 'skip-google-too-short' },
    }
  }

  const googleCells = await fetchGoogle(term, new Set(), 4, { type })
  const resolved = await Promise.all(
    googleCells.map(async (cell) =>
      (await resolveExistingPlace(cell.id, mapToCard)) ?? cell
    )
  )

  return {
    results: resolved,
    stage: 'google',
    debug: {
      stage: 'google',
      count: resolved.length,
      google: getLastPlacesAutocompleteDebug(),
    },
  }
}
