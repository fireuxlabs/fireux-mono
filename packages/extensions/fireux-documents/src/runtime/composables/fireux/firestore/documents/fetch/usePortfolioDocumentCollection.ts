import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useActivePortfolio,
  useRuntimePortfolioPath,
} from 'fireux-properties/runtime/composables/fireux/app/portfolio-console/useActivePortfolio'
import type { DemoDocument } from 'fireux-properties/runtime/composables/fireux/app/portfolio-console/demo-scenarios'
import type { Document } from '../../../../../models/document.model'

const normalizeId = (value: unknown) => String(value || '').trim()

const toDocument = (entry: DemoDocument): Document => ({
  id: normalizeId(entry.id),
  portfolio_id: normalizeId(entry.portfolio_id),
  file_name: normalizeId(entry.file_name),
  file_type: normalizeId(entry.file_type),
  size_bytes: Number(entry.size_bytes || 0),
  storage_path: normalizeId(entry.storage_path),
  download_url: normalizeId(entry.download_url),
  uploaded_at: normalizeId(entry.uploaded_at),
  notes: '',
  created: { at: {} as any, by: undefined, app_id: undefined },
  updated: { at: {} as any, by: undefined },
})

export function usePortfolioDocumentCollection(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Document[] | undefined> | null>
  const collectionPath = useRuntimePortfolioPath(runtimePortfolio, 'documents')

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath || runtimePortfolio.isDemo.value) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Document>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<Document[]>(() => {
    if (runtimePortfolio.isDemo.value) {
      return (runtimePortfolio.scenario.value?.documents ?? []).map((entry) => toDocument(entry))
    }
    return sourceRef.value?.value ?? []
  })

  return {
    collectionPath,
    collection,
  }
}
