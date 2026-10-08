import { computed } from 'vue'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { DocumentStorage, type Document } from '../../models/document.model'

export function usePortfolioDocuments(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    DocumentStorage.collection
  )
  const source = firestoreFetchCollection<Document>(collectionPath)
  const rawCollection = computed<Document[]>(() => source.value ?? [])
  const pending = source.pending
  const error = source.error
  const { outcome: sourceOutcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count: computed(() => rawCollection.value.length),
    pending,
    error,
  })
  const outcome = computed(() =>
    runtimePortfolio.targetOutcome.value !== 'ready'
      ? runtimePortfolio.targetOutcome.value
      : sourceOutcome.value
  )
  const collection = computed(() =>
    outcome.value === 'ready' ? rawCollection.value : []
  )
  const count = computed(() => collection.value.length)
  const { byId: document } = useCollectionById(collection)
  return {
    collectionPath,
    collection,
    count,
    pending,
    error,
    outcome,
    document,
  }
}
