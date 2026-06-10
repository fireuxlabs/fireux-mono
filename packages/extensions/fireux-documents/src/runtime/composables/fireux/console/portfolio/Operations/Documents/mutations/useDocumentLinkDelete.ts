import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/Operations/useActivePortfolio'
import { DocumentLinkStorage } from '../../../../../../../models/document-link.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useDocumentLinkDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    DocumentLinkStorage.collection
  )

  async function deleteDocumentLink(linkId: string): Promise<void> {
    const portfolioId = normalizeString(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-documents] portfolio id is required.')
    }

    if (runtimePortfolio.isDemo.value) {
      throw new Error('[fireux-documents] demo runtime does not allow writes.')
    }

    const normalizedLinkId = normalizeString(linkId)
    if (!normalizedLinkId) {
      throw new Error('[fireux-documents] documentLinkId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-documents] runtime document link path is required.')
    }

    await deleteDocument(collectionPath.value, normalizedLinkId)
  }

  return {
    deleteDocumentLink,
  }
}
