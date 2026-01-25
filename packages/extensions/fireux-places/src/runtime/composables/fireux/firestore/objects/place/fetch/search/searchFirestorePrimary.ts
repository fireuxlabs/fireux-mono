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
    query: termNormalized || term,
    limit: 5,
  })

  if (!fx.length && termNormalized && !termNormalized.includes(' ')) {
    const prefixes = ['restaurant', 'hotel', 'bar', 'cafe', 'bistro', 'pub', 'inn']
    for (const prefix of prefixes) {
      const query = `${prefix} ${termNormalized}`
      fx = await prefixSearch<PlaceSearchDoc>({
        collection: collectionName,
        field: 'search_term',
        query,
        limit: 5,
      })
      if (fx.length) break
    }
  }

  if (!fx.length) return null
  return {
    results: fx.map((row) => mapToCard(row, collectionName)),
    stage: 'firebase',
    debug: { stage: 'firebase', count: fx.length },
  }
}
