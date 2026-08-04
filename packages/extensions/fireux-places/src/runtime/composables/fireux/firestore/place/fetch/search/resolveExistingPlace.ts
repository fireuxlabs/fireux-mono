// Concurrent edit — 2026-07-21 14:30 CEST — Place public projection: resolve Google candidates through the exact public Place endpoint.
import type { PublicPlaceDetailResponse } from '../../../../../../models/place-public.model'
import type { MapToBasePlace } from './types'

export const resolveExistingPlace = async (
  id: string,
  mapToCard: MapToBasePlace
) => {
  try {
    const response = await $fetch<PublicPlaceDetailResponse>(
      `/api/places/${encodeURIComponent(id)}`
    )
    return response?.item ? mapToCard(response.item, 'places') : null
  } catch {
    return null
  }
}
