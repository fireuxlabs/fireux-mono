import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import {
  ComplianceRecordStorage,
  type ComplianceRecord,
} from '../../../../../models/compliance-record.model'

export function usePortfolioComplianceRecordCollection(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<ComplianceRecord[] | undefined> | null>
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    ComplianceRecordStorage.collection
  )

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<ComplianceRecord>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<ComplianceRecord[]>(() => sourceRef.value?.value ?? [])

  const overdueCount = computed(
    () =>
      collection.value.filter((entry) => {
        const expiry = new Date(entry.expiry_date)
        if (Number.isNaN(expiry.getTime())) return false
        return expiry.getTime() < new Date().setHours(0, 0, 0, 0)
      }).length
  )
  const { byId: complianceRecord } = useCollectionById(collection)

  return {
    collectionPath,
    collection,
    complianceRecord,
    overdueCount,
  }
}
