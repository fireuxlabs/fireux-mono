import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { DocumentStorage, type Document } from '../../../../../models/document.model'

export function usePortfolioDocuments(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Document[] | undefined> | null>
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    DocumentStorage.collection
  )

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Document>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<Document[]>(() => sourceRef.value?.value ?? [])
  const { byId: document } = useCollectionById(collection)

  return {
    collectionPath,
    collection,
    document,
  }
}
