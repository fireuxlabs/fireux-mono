import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { hydratePlaceOverlayCollection, hydratePlaceOverlayDoc } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlaceOverlayHydration'
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

  const overlays = firestoreFetchCollection<Company>(COLLECTION_PATH)
  const places = firestoreFetchCollection<Place>('places')

  const companies = hydratePlaceOverlayCollection(
    computed(() => overlays.value ?? []),
    computed(() => places.value ?? []),
    (overlay, place): CompanyView => ({
      ...(place ?? {}),
      ...overlay,
      id: overlay.id,
    })
  )

  const company = (id: string) => {
    const companyDoc = firestoreFetchDoc<Company>(COLLECTION_PATH, id)
    const placeDoc = firestoreFetchDoc<Place>('places', id)

    return hydratePlaceOverlayDoc(
      computed(() => companyDoc.value),
      computed(() => placeDoc.value),
      computed(() => id),
      (overlay, place, docId): CompanyView => ({
        ...(place ?? {}),
        ...(overlay ?? {}),
        id: docId,
      })
    )
  }

  return {
    companies,
    company,
  }
}
