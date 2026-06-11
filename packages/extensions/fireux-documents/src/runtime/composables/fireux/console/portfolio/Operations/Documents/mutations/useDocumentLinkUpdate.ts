import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import {
  DocumentLinkStorage,
  type DocumentLink,
  type DocumentLinkUpdateInput,
} from '../../../../../../../models/document-link.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useDocumentLinkUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    DocumentLinkStorage.collection
  )

  async function updateDocumentLink(
    linkId: string,
    patch: DocumentLinkUpdateInput
  ): Promise<void> {
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

    await updateDocument<DocumentLink>(collectionPath.value, normalizedLinkId, patch)
  }

  return {
    updateDocumentLink,
  }
}
