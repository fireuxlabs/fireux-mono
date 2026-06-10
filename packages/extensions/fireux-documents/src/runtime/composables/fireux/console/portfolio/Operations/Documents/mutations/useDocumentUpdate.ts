import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/Operations/useActivePortfolio'
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
    const portfolioId = normalizeString(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-documents] portfolio id is required.')
    }

    if (runtimePortfolio.isDemo.value) {
      throw new Error('[fireux-documents] demo runtime does not allow writes.')
    }

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
