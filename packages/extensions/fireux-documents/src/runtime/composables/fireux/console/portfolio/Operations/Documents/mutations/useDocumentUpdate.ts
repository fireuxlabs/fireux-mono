// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require Portfolio operator access for document updates.
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import {
  DocumentStorage,
  type Document,
  type DocumentUpdateInput,
} from '../../../../../../../models/document.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useDocumentUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    DocumentStorage.collection
  )

  async function updateDocumentRecord(
    documentId: string,
    patch: DocumentUpdateInput
  ): Promise<void> {
    requirePortfolioConsoleWrite(runtimePortfolio, 'fireux-documents')

    const normalizedDocumentId = normalizeString(documentId)
    if (!normalizedDocumentId) {
      throw new Error('[fireux-documents] documentId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-documents] runtime document path is required.')
    }

    await updateDocument<Document>(collectionPath.value, normalizedDocumentId, patch)
  }

  return {
    updateDocumentRecord,
  }
}
