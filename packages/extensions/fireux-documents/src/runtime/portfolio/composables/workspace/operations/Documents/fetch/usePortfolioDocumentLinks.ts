import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { DocumentLinkStorage, type DocumentLink } from '../../../../../models/document-link.model'

/**
 * FireUX stack family: Workspace operation record.
 * Entity: DocumentLink.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/composables/README.md
 *
 * This file reads Portfolio-scoped document attachment records for the selected /workspace/portfolio workspace.
 * It belongs to workspace/portfolio/operations/Documents, not root Firestore entity access.
 */
export function usePortfolioDocumentLinks(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<DocumentLink[] | undefined> | null>
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    DocumentLinkStorage.collection
  )

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<DocumentLink>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<DocumentLink[]>(
    () => sourceRef.value?.value ?? []
  )
  const { byId: documentLink } = useCollectionById(collection)

  return {
    collectionPath,
    collection,
    documentLink,
  }
}
