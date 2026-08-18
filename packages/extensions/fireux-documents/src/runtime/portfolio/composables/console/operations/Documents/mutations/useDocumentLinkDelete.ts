// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require Portfolio operator access for document-link deletion.
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/portfolio/composables/console/operations/useActivePortfolio'
import { DocumentLinkStorage } from '../../../../../models/document-link.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useDocumentLinkDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    DocumentLinkStorage.collection
  )

  async function deleteDocumentLink(linkId: string): Promise<void> {
    requirePortfolioConsoleWrite(runtimePortfolio, 'fireux-documents')

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
