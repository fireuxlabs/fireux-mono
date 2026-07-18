import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { CompanyStorage } from 'fireux-companies/runtime/models/company.model'
import { computed } from 'vue'

export function useCompanyCollection<
  T extends Record<string, any> = Record<string, any>,
>(collectionPath: string = CompanyStorage.collection) {
  const { firestoreFetchCollection } = useFirestoreManager()

  const path = computed(() => collectionPath)
  const source = firestoreFetchCollection<T>(path)
  const collection = computed(() => source.value)
  const count = computed(() => (collection.value ?? []).length)
  const pending = computed(() => source.pending.value)
  const error = computed(() => source.error.value)
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })

  return {
    collectionPath: path,
    collection,
    count,
    pending,
    error,
    outcome,
  }
}
