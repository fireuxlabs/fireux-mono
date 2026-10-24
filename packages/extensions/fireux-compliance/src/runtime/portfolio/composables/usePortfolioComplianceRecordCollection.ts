import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  usePortfolioScope,
  usePortfolioChildPath,
} from 'fireux-properties/runtime/portfolio/composables/usePortfolioScope'
import {
  ComplianceRecordStorage,
  type ComplianceRecord,
} from '../models/compliance-record.model'

export function usePortfolioComplianceRecordCollection(
  runtimePortfolio: ReturnType<typeof usePortfolioScope>
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const collectionPath = usePortfolioChildPath(
    runtimePortfolio,
    ComplianceRecordStorage.collection
  )

  const source = firestoreFetchCollection<ComplianceRecord>(collectionPath)

  const collection = computed<ComplianceRecord[]>(() =>
    outcome.value === 'ready' ? (source.value ?? []) : []
  )

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
  const { outcome: sourceOutcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count: computed(() => (source.value ?? []).length),
    pending,
    error,
  })

  const outcome = computed(() =>
    runtimePortfolio.targetOutcome.value !== 'ready'
      ? runtimePortfolio.targetOutcome.value
      : sourceOutcome.value
  )

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
