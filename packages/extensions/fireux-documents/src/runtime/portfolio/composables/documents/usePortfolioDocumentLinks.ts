import { computed } from 'vue'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import {
  DocumentLinkStorage,
  type DocumentLink,
} from '../../models/document-link.model'

export function usePortfolioDocumentLinks(
  runtimePortfolio = useActivePortfolio()
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    DocumentLinkStorage.collection
  )
  const source = firestoreFetchCollection<DocumentLink>(collectionPath)
  const rawCollection = computed<DocumentLink[]>(() => source.value ?? [])
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
  const { byId: documentLink } = useCollectionById(collection)
  return {
    collectionPath,
    collection,
    count,
    pending,
    error,
    outcome,
    documentLink,
  }
}
