import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useRuntimePortfolio,
  useRuntimePortfolioPath,
} from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import type { ComplianceRecord } from '../../../../../models/compliance-record.model'
import type { ReadOnlyComplianceRecord } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios'

const normalizeId = (value: unknown) => String(value || '').trim()

const toComplianceRecord = (entry: ReadOnlyComplianceRecord): ComplianceRecord => ({
  id: normalizeId(entry.id),
  portfolio_id: normalizeId(entry.portfolio_id),
  property_id: normalizeId(entry.property_id),
  unit_id: normalizeId(entry.unit_id),
  type_id: normalizeId(entry.type_id),
  type_label: normalizeId(entry.type_label),
  provider: normalizeId(entry.provider),
  issue_date: normalizeId(entry.issue_date),
  expiry_date: normalizeId(entry.expiry_date),
  document_id: normalizeId(entry.document_id),
  notes: '',
  created: { at: {} as any, by: undefined, app_id: undefined },
  updated: { at: {} as any, by: undefined },
})

export function usePortfolioComplianceRecordCollection(runtimePortfolio = useRuntimePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<ComplianceRecord[] | undefined> | null>
  const collectionPath = useRuntimePortfolioPath(runtimePortfolio, 'compliance-records')

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath || runtimePortfolio.isReadOnly.value) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<ComplianceRecord>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<ComplianceRecord[]>(() => {
    if (runtimePortfolio.isReadOnly.value) {
      const records = runtimePortfolio.scenario.value?.complianceRecords ?? []
      return records.map((entry) => toComplianceRecord(entry))
    }
    return sourceRef.value?.value ?? []
  })

  const overdueCount = computed(
    () =>
      collection.value.filter((entry) => {
        const expiry = new Date(entry.expiry_date)
        if (Number.isNaN(expiry.getTime())) return false
        return expiry.getTime() < new Date().setHours(0, 0, 0, 0)
      }).length
  )

  return {
    collectionPath,
    collection,
    overdueCount,
  }
}
