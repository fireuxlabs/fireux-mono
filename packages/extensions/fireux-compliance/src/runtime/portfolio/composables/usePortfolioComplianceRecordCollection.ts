import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import {
  ComplianceRecordStorage,
  type ComplianceRecord,
} from '../models/compliance-record.model'

export function usePortfolioComplianceRecordCollection(
  runtimePortfolio = useActivePortfolio()
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    ComplianceRecordStorage.collection
  )

  const source = firestoreFetchCollection<ComplianceRecord>(collectionPath)

  const collection = computed<ComplianceRecord[]>(() => source.value ?? [])

  const overdueCount = computed(
    () =>
      collection.value.filter((entry) => {
        const expiry = new Date(entry.expiry_date)
        if (Number.isNaN(expiry.getTime())) return false
        return expiry.getTime() < new Date().setHours(0, 0, 0, 0)
      }).length
  )
  const { byId: complianceRecord } = useCollectionById(collection)

  const count = computed(() => collection.value.length)
  const pending = source.pending
  const error = source.error
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count,
    pending,
    error,
  })

  return {
    count,
    pending,
    error,
    outcome,
    collectionPath,
    collection,
    complianceRecord,
    overdueCount,
  }
}
