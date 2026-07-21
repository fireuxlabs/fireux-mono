// Concurrent edit — 2026-07-21 14:30 CEST — Place public projection: search the bounded public endpoint without raw Firestore queries.
import type { PublicPlaceIndexPage } from 'fireux-places/runtime/models/place-public.model'
import type { MapToBasePlace, SearchStage } from './types'

async function search(query: string) {
  return $fetch<PublicPlaceIndexPage>(
    `/api/places?q=${encodeURIComponent(query)}`
  )
}

export const searchPublicPrimary = async (params: {
  term: string
  termNormalized: string
  mapToCard: MapToBasePlace
}): Promise<SearchStage | null> => {
  const { term, termNormalized, mapToCard } = params
  const query = termNormalized || term
  let page = await search(query)

  if (!page.items.length && termNormalized && !termNormalized.includes(' ')) {
    const prefixes = ['restaurant', 'hotel', 'bar', 'cafe', 'bistro', 'pub', 'inn']
    for (const prefix of prefixes) {
      page = await search(`${prefix} ${termNormalized}`)
      if (page.items.length) break
    }
  }

  if (!page.items.length) return null
  return {
    results: page.items.map(row => mapToCard(row, 'places')),
    stage: 'public-api',
    debug: { stage: 'public-api', count: page.items.length },
  }
}
