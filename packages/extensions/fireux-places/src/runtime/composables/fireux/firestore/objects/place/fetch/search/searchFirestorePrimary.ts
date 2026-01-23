import type { MapToCard, PlaceSearchDoc, PrefixSearch, SearchStage } from './types'

export const searchFirestorePrimary = async (params: {
  prefixSearch: PrefixSearch
  collectionName: string
  term: string
  termNormalized: string
  mapToCard: MapToCard
}): Promise<SearchStage | null> => {
  const { prefixSearch, collectionName, term, termNormalized, mapToCard } = params
  let fx: PlaceSearchDoc[] = []
  fx = await prefixSearch<PlaceSearchDoc>({
    collection: collectionName,
    field: 'search_term',
    query: term,
    limit: 5,
  })

  if (!fx.length && termNormalized && termNormalized !== term) {
    fx = await prefixSearch<PlaceSearchDoc>({
      collection: collectionName,
      field: 'search_term_normalized',
      query: termNormalized,
      limit: 5,
    })
  }

  if (!fx.length) return null
  return {
    results: fx.map((row) => mapToCard(row, collectionName)),
    stage: 'firebase',
    debug: { stage: 'firebase', count: fx.length },
  }
}
