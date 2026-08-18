import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/portfolio/composables/console/operations/useActivePortfolio'
import { DocumentStorage, type Document } from '../../../../../models/document.model'

const normalizeId = (value: unknown) => String(value || '').trim()
type DemoDocument = Partial<Pick<
  Document,
  | 'id'
  | 'portfolio_id'
  | 'file_name'
  | 'file_type'
  | 'size_bytes'
  | 'storage_path'
  | 'download_url'
  | 'uploaded_at'
>>

const demoDocuments = (scenario: Record<string, unknown> | null): DemoDocument[] => {
  const documents = scenario?.documents
  return Array.isArray(documents) ? documents as DemoDocument[] : []
}

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

export function usePortfolioDocuments(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Document[] | undefined> | null>
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    DocumentStorage.collection
  )

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
      return demoDocuments(runtimePortfolio.scenario.value).map((entry) =>
        toDocument(entry)
      )
    }
    return sourceRef.value?.value ?? []
  })
  const { byId: document } = useCollectionById(collection)

  return {
    collectionPath,
    collection,
    document,
  }
}
