import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { Company } from '../../../../../../models/objects/company.model'

const COLLECTION_PATH = 'companies'

/**
 * Canon fetch helpers for Company (collection + single doc).
 * Canon: overlay collection `companies/{placeId}`.
 */
export function useCompanyFetch() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const source = firestoreFetchCollection<Company>(COLLECTION_PATH)
  const companies = computed(() => source.value ?? [])

  const company = (id: string) => firestoreFetchDoc<Company>(COLLECTION_PATH, id)

  return {
    companies,
    company,
  }
}
