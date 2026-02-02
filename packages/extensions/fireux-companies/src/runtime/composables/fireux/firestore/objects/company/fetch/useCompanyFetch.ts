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

  // ✅ raw Firestore sources
  const companiesCollection = firestoreFetchCollection<Company>(COLLECTION_PATH)
  const placesCollection = firestoreFetchCollection<Place>('places')

  // ✅ canonical hydration helpers (rename at call-site)
  const hydrate = hydratePlaceOverlayCollection
  const hydrateDoc = hydratePlaceOverlayDoc

  // ✅ hydrated collection (UI-ready)
  const companies = hydrate(
    computed(() => companiesCollection.value ?? []),
    computed(() => placesCollection.value ?? []),
    (company, place): CompanyView => ({
      ...(place ?? {}),
      ...company,
      id: company.id,
    })
  )

  // ✅ hydrated single doc (UI-ready)
  const company = (id: string) => {
    const companyDoc = firestoreFetchDoc<Company>(COLLECTION_PATH, id)
    const placeDoc = firestoreFetchDoc<Place>('places', id)

    return hydrateDoc(
      computed(() => companyDoc.value),
      computed(() => placeDoc.value),
      computed(() => id),
      (companyValue, placeValue, docId): CompanyView => ({
        ...(placeValue ?? {}),
        ...(companyValue ?? {}),
        id: docId,
      })
    )
  }

  return {
    companies,
    company,
  }
}
