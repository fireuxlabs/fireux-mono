import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Place } from 'fireux-places/runtime/models/objects/place.model'
import { computed } from 'vue'
import type { Company, CompanyOverlay } from '../../../../../../models/objects/company.model'

const COLLECTION_PATH = 'companies'

/**
 * Canon fetch helpers for Company (collection + single doc).
 * Canon: overlay collection `companies/{placeId}`.
 */
export function useCompanyFetch() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const source = firestoreFetchCollection<CompanyOverlay>(COLLECTION_PATH)
  const placesSource = firestoreFetchCollection<Place>('places')

  const companies = computed<Company[]>(() => {
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
        formatted_address: place?.formatted_address || '',
        lat: place?.lat ?? 0,
        lng: place?.lng ?? 0,
        place_image: place?.place_image || '',
        image_shade: place?.image_shade || 'neutral',
        website: overlay?.website || '',
      } as Company
    })
  })

  const company = (id: string) => {
    const companyDoc = firestoreFetchDoc<CompanyOverlay>(COLLECTION_PATH, id)
    const placeDoc = firestoreFetchDoc<Place>('places', id)

    return computed<Company | undefined>(() => {
      const overlay = companyDoc.value
      const place = placeDoc.value

      if (!overlay && !place) return undefined

      return {
        ...place,
        ...overlay,
        id: id,
        name: place?.name || '',
        formatted_address: place?.formatted_address || '',
        lat: place?.lat ?? 0,
        lng: place?.lng ?? 0,
        place_image: place?.place_image || '',
        image_shade: place?.image_shade || 'neutral',
        website: overlay?.website || '',
      } as Company
    })
  }

  return {
    companies,
    company,
  }
}
