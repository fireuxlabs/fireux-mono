import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { hydratePlaceCollection, hydratePlaceDoc } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/usePlaceHydration'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'
import type { Company } from 'fireux-companies/runtime/models/company.model'
import { CompanyStorage } from 'fireux-companies/runtime/models/company.model'
import type { CompanyHydrated } from './types'
import { computed, isRef, type ComputedRef, type Ref } from 'vue'

type CompanyIdInput = string | Ref<string | null | undefined>
type CompanyFetchFunction = (id: string) => Ref<CompanyHydrated | undefined>

/**
 * Canon fetch helpers for Company (collection + single doc).
 * Canon: collection `companies/{placeId}`.
 */
export function useCompanyFetch(): {
  companies: ComputedRef<CompanyHydrated[]>
  company: CompanyFetchFunction
}
export function useCompanyFetch(id: CompanyIdInput): {
  company: ComputedRef<CompanyHydrated | null>
  pending: ComputedRef<boolean>
  fetchCompany: CompanyFetchFunction
}
export function useCompanyFetch(id?: CompanyIdInput) {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  // ✅ raw Firestore sources
  const companiesCollection = firestoreFetchCollection<Company>(CompanyStorage.collection)
  const placesCollection = firestoreFetchCollection<Place>(PlaceStorage.collection)

  // ✅ canonical hydration helpers (rename at call-site)
  const hydrate = hydratePlaceCollection
  const hydrateDoc = hydratePlaceDoc

  // ✅ hydrated collection (UI-ready)
  const companies = hydrate(
    computed(() => companiesCollection.value ?? []),
    computed(() => placesCollection.value ?? []),
    (entry, place): CompanyHydrated => ({
      ...(place ?? {}),
      ...entry,
      id: entry.id,
    })
  )

  // ✅ hydrated single doc (UI-ready)
  const fetchCompany: CompanyFetchFunction = (companyId: string) => {
    const companyDoc = firestoreFetchDoc<Company>(CompanyStorage.collection, companyId)
    const placeDoc = firestoreFetchDoc<Place>(PlaceStorage.collection, companyId)

    return hydrateDoc(
      computed(() => companyDoc.value),
      computed(() => placeDoc.value),
      computed(() => companyId),
      (entry, place, docId): CompanyHydrated | undefined => {
        if (!entry) return undefined

        return {
          ...(place ?? {}),
          ...entry,
          id: docId,
        }
      }
    )
  }

  if (id !== undefined) {
    const companyId = isRef(id)
      ? computed(() => String(id.value ?? '').trim())
      : computed(() => String(id ?? '').trim())
    const source = computed(() =>
      companyId.value ? fetchCompany(companyId.value) : null
    )
    const company = computed<CompanyHydrated | null>(
      () => source.value?.value ?? null
    )
    const pending = computed(() =>
      Boolean(companyId.value) && source.value?.value === undefined
    )

    return {
      company,
      pending,
      fetchCompany,
    }
  }

  return {
    companies,
    company: fetchCompany,
  }
}
