import type { PlaceDetailResponse } from '../../../../models/place-read.model.ts'
import type { MapToBasePlace } from './types'

export const resolveExistingPlace = async (
  id: string,
  mapToCard: MapToBasePlace
) => {
  try {
    const response = await $fetch<PlaceDetailResponse>(
      `/api/places/${encodeURIComponent(id)}`
    )
    return response?.place ? mapToCard(response.place, 'places') : null
  } catch {
    return null
  }
}
