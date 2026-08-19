import type { PlaceIndexPage } from '../../../../models/place-read.model.ts'
import type { MapToBasePlace, SearchStage } from './types'

async function search(query: string) {
  return $fetch<PlaceIndexPage>(`/api/places?q=${encodeURIComponent(query)}`)
}

export const searchPrimary = async (params: {
  term: string
  termNormalized: string
  mapToCard: MapToBasePlace
}): Promise<SearchStage | null> => {
  const { term, termNormalized, mapToCard } = params
  const query = termNormalized || term
  let page = await search(query)

  if (!page.items.length && termNormalized && !termNormalized.includes(' ')) {
    const prefixes = [
      'restaurant',
      'hotel',
      'bar',
      'cafe',
      'bistro',
      'pub',
      'inn',
    ]
    for (const prefix of prefixes) {
      page = await search(`${prefix} ${termNormalized}`)
      if (page.items.length) break
    }
  }

  if (!page.items.length) return null
  return {
    results: page.items.map((row) => mapToCard(row, 'places')),
    stage: 'place-api',
    debug: { stage: 'place-api', count: page.items.length },
  }
}
