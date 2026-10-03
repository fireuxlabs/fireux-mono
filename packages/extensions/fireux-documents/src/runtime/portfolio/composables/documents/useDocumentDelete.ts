// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: require Portfolio operator access for document deletion.
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  requirePortfolioWorkspaceWrite,
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { DocumentStorage } from '../../models/document.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useDocumentDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    DocumentStorage.collection
  )

  async function deleteDocumentRecord(documentId: string): Promise<void> {
    requirePortfolioWorkspaceWrite(runtimePortfolio, 'fireux-documents')

    const normalizedDocumentId = normalizeString(documentId)
    if (!normalizedDocumentId) {
      throw new Error('[fireux-documents] documentId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-documents] runtime document path is required.')
    }

    await deleteDocument(collectionPath.value, normalizedDocumentId)
  }

  return {
    deleteDocumentRecord,
  }
}
