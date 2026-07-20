// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require Portfolio operator access for document creation.
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import { DocumentStorage, type Document, type DocumentCreateInput } from '../../../../../../../models/document.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useDocumentCreate(runtimePortfolio = useActivePortfolio()) {
  const { createDocument } = useFirestoreCreate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    DocumentStorage.collection
  )

  async function createDocumentRecord(input: DocumentCreateInput): Promise<string> {
    const portfolioId = requirePortfolioConsoleWrite(
      runtimePortfolio,
      'fireux-documents'
    )

    const payload: Omit<Document, 'id'> = {
      portfolio_id: portfolioId,
      file_name: normalizeString(input.file_name),
      file_type: normalizeString(input.file_type),
      size_bytes: Number(input.size_bytes || 0),
      storage_path: normalizeString(input.storage_path),
      download_url: normalizeString(input.download_url),
      uploaded_at: normalizeString(input.uploaded_at),
      notes: normalizeString(input.notes),
      created: { at: {} as any, by: undefined, app_id: undefined },
      updated: { at: {} as any, by: undefined },
    }

    if (!payload.file_name) {
      throw new Error('[fireux-documents] file_name is required.')
    }

    if (!payload.storage_path) {
      throw new Error('[fireux-documents] storage_path is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-documents] runtime document path is required.')
    }

    return createDocument<Omit<Document, 'id'>>(collectionPath.value, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createDocumentRecord,
  }
}
