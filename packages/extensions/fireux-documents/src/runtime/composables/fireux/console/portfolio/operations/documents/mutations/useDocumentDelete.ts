import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import { DocumentStorage } from '../../../../../../../models/document.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useDocumentDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    DocumentStorage.collection
  )

  async function deleteDocumentRecord(documentId: string): Promise<void> {
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

    await deleteDocument(collectionPath.value, normalizedDocumentId)
  }

  return {
    deleteDocumentRecord,
  }
}
