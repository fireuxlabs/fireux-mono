import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  useRuntimePortfolio,
  useRuntimePortfolioPath,
} from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import type { Document } from '../../../../../models/document.model'

export type DocumentCreateInput = Pick<
  Document,
  | 'file_name'
  | 'file_type'
  | 'size_bytes'
  | 'storage_path'
  | 'download_url'
  | 'uploaded_at'
  | 'notes'
>

const normalize = (value: unknown) => String(value || '').trim()

export function useDocumentCreate(runtimePortfolio = useRuntimePortfolio()) {
  const { createDocument } = useFirestoreCreate()
  const collectionPath = useRuntimePortfolioPath(runtimePortfolio, 'documents')

  async function createDocumentRecord(input: DocumentCreateInput): Promise<string> {
    const portfolioId = normalize(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-documents] runtimePortfolioId is required.')
    }

    if (runtimePortfolio.isReadOnly.value) {
      throw new Error('[fireux-documents] read-only runtime does not allow writes.')
    }

    const payload: Omit<Document, 'id'> = {
      portfolio_id: portfolioId,
      file_name: normalize(input.file_name),
      file_type: normalize(input.file_type),
      size_bytes: Number(input.size_bytes || 0),
      storage_path: normalize(input.storage_path),
      download_url: normalize(input.download_url),
      uploaded_at: normalize(input.uploaded_at),
      notes: normalize(input.notes),
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
