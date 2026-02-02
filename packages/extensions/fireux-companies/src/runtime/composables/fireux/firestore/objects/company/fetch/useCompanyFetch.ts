import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Place } from 'fireux-places/runtime/models/objects/place.model'
import { computed } from 'vue'
import type { Company, CompanyView } from '../../../../../../models/objects/company.model'

const COLLECTION_PATH = 'companies'

/**
 * Canon fetch helpers for Company (collection + single doc).
 * Canon: overlay collection `companies/{placeId}`.
 */
export function useCompanyFetch() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const source = firestoreFetchCollection<Company>(COLLECTION_PATH)
  const placesSource = firestoreFetchCollection<Place>('places')

  const companies = computed<CompanyView[]>(() => {
    const overlays = source.value ?? []
    const places = placesSource.value ?? []

    if (!overlays.length) return []

    const placeById = new Map<string, Place>()
    for (const place of places) {
      if (place?.id) placeById.set(String(place.id), place)
    }

    return overlays.map((overlay) => {
      const place = overlay?.id ? placeById.get(String(overlay.id)) : undefined
      return {
        ...place,
        ...overlay,
        id: overlay.id,
        name: place?.name || '',
        short_name: place?.short_name || '',
        short_address: place?.short_address || '',
        formatted_address: place?.formatted_address || '',
        search_term: place?.search_term || '',
        lat: place?.lat ?? 0,
        lng: place?.lng ?? 0,
        image_url: place?.image_url || '',
        image_shade: place?.image_shade || 'none',
        phone: place?.phone || '',
        website: place?.website || '',
        rating: place?.rating ?? 0,
        rating_count: place?.rating_count ?? 0,
        types: Array.isArray(place?.types) ? place?.types : [],
        hours_text: Array.isArray(place?.hours_text) ? place?.hours_text : [],
        google_maps_url: place?.google_maps_url || '',
      } as CompanyView
    })
  })

  const company = (id: string) => {
    const companyDoc = firestoreFetchDoc<Company>(COLLECTION_PATH, id)
    const placeDoc = firestoreFetchDoc<Place>('places', id)

    return computed<CompanyView | undefined>(() => {
      const overlay = companyDoc.value
      const place = placeDoc.value

      if (!overlay && !place) return undefined

      return {
        ...place,
        ...overlay,
        id: id,
        name: place?.name || '',
        short_name: place?.short_name || '',
        short_address: place?.short_address || '',
        formatted_address: place?.formatted_address || '',
        search_term: place?.search_term || '',
        lat: place?.lat ?? 0,
        lng: place?.lng ?? 0,
        image_url: place?.image_url || '',
        image_shade: place?.image_shade || 'none',
        phone: place?.phone || '',
        website: place?.website || '',
        rating: place?.rating ?? 0,
        rating_count: place?.rating_count ?? 0,
        types: Array.isArray(place?.types) ? place?.types : [],
        hours_text: Array.isArray(place?.hours_text) ? place?.hours_text : [],
        google_maps_url: place?.google_maps_url || '',
      } as CompanyView
    })
  }

  return {
    companies,
    company,
  }
}
