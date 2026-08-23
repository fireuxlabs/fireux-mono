import { fetchGoogle, getLastPlacesAutocompleteDebug } from '../google/usePlacesGoogle'
import { resolveExistingPlace } from './resolveExistingPlace'
import type {
  MapToBasePlace,
  PlaceSearchLocation,
  SearchStage,
} from './types'

export const searchGoogle = async (params: {
  term: string
  allowGoogle: boolean
  location?: PlaceSearchLocation | null
  mapToCard: MapToBasePlace
  type?: string | null
}): Promise<SearchStage> => {
  const { term, allowGoogle, location, mapToCard, type } = params

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

  const googleCells = await fetchGoogle(term, new Set(), 4, {
    location,
    type,
  })
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
