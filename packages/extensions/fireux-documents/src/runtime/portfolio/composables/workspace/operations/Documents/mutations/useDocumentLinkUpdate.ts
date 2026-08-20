// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: require Portfolio operator access for document-link updates.
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  requirePortfolioWorkspaceWrite,
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/operations/useActivePortfolio'
import {
  DocumentLinkStorage,
  type DocumentLink,
  type DocumentLinkUpdateInput,
} from '../../../../../models/document-link.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useDocumentLinkUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    DocumentLinkStorage.collection
  )

  async function updateDocumentLink(
    linkId: string,
    patch: DocumentLinkUpdateInput
  ): Promise<void> {
    requirePortfolioWorkspaceWrite(runtimePortfolio, 'fireux-documents')

    const normalizedLinkId = normalizeString(linkId)
    if (!normalizedLinkId) {
      throw new Error('[fireux-documents] documentLinkId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-documents] runtime document link path is required.')
    }

    await updateDocument<DocumentLink>(collectionPath.value, normalizedLinkId, patch)
  }

  return {
    updateDocumentLink,
  }
}
