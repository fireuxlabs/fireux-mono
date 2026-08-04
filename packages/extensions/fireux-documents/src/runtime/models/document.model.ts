import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Portfolio-scoped
 * Storage: console-owned operational record
 * Owner console: Portfolio
 * Scope: portfolio document storage and metadata
 *
 * Decision note:
 * - Document is operational portfolio content, not a shared root entity.
 * - Keep it scoped even if document files are later referenced by other portfolio records.
 * - If that changes later, update the models README first, then this file.
 */
export const DocumentStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/portfolios/{portfolioId}/documents/{documentId}',
  collection: 'documents',
  parent: 'portfolio',
  idParam: 'documentId',
} as const

export const DocumentModel = {
  id: '' as string,
  portfolio_id: '' as string,
  file_name: '' as string,
  file_type: '' as string,
  size_bytes: 0 as number,
  storage_path: '' as string,
  download_url: '' as string,
  uploaded_at: '' as string,
  notes: '' as string,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Document = {
  [K in keyof typeof DocumentModel]: (typeof DocumentModel)[K]
}

export type DocumentCreateInput = Omit<Document, 'id' | 'created' | 'updated'>
export type DocumentUpdateInput = Partial<Omit<Document, 'id' | 'created' | 'updated'>>
