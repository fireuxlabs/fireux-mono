import type { Firestore } from 'firebase/firestore'
import { fetchGoogle, getLastPlacesAutocompleteDebug } from '../google/usePlacesGoogle'
import { resolveExistingPlace } from './resolveExistingPlace'
import type { MapToCard, SearchStage } from './types'

export const searchGoogle = async (params: {
  term: string
  allowGoogle: boolean
  collectionName: string
  db: Firestore
  mapToCard: MapToCard
}): Promise<SearchStage> => {
  const { term, allowGoogle, collectionName, db, mapToCard } = params

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

  const googleCells = await fetchGoogle(term, new Set(), 4)
  const resolved = await Promise.all(
    googleCells.map(async (cell) =>
      (await resolveExistingPlace(db, collectionName, cell.id, mapToCard)) ?? cell
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
