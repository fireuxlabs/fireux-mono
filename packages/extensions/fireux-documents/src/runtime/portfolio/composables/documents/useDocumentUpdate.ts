// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: require Portfolio operator access for document updates.
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  requirePortfolioWorkspaceWrite,
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import {
  DocumentStorage,
  type Document,
  type DocumentUpdateInput,
} from '../../models/document.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useDocumentUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    DocumentStorage.collection
  )

  async function updateDocumentRecord(input: {
    documentId: string
    changes: DocumentUpdateInput
  }): Promise<void> {
    requirePortfolioWorkspaceWrite(runtimePortfolio, 'fireux-documents')

    const normalizedDocumentId = normalizeString(input.documentId)
    if (!normalizedDocumentId) {
      throw new Error('[fireux-documents] documentId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-documents] runtime document path is required.')
    }

    await updateDocument<Document>(
      collectionPath.value,
      normalizedDocumentId,
      input.changes
    )
  }

  return {
    updateDocumentRecord,
  }
}
