import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type DocumentLinkTargetType =
  | 'portfolio'
  | 'property'
  | 'unit'
  | 'compliance-record'
  | 'tenancy'
  | 'task'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Portfolio-scoped
 * Storage: workspace-owned operational record
 * Owner workspace: Portfolio
 * Scope: links a portfolio-owned document to another portfolio-owned target
 *
 * Decision note:
 * - DocumentLink exists only because portfolio operations need attachment state.
 * - It is scoped by the portfolio even when it points to several target types.
 * - If that ownership changes later, update the models README first, then this file.
 */
export const DocumentLinkStorage = {
  shape: 'scoped',
  path: 'portfolios/{portfolioId}/document-links/{documentLinkId}',
  collection: 'document-links',
  parent: 'portfolio',
  idParam: 'documentLinkId',
} as const

export const DocumentLinkModel = {
  id: '' as string,
  portfolio_id: '' as string,
  document_id: '' as string,
  target_type: '' as DocumentLinkTargetType,
  target_id: '' as string,
  target_label: '' as string,
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

export type DocumentLink = {
  [K in keyof typeof DocumentLinkModel]: (typeof DocumentLinkModel)[K]
}

export type DocumentLinkCreateInput = Omit<DocumentLink, 'id' | 'created' | 'updated'>
export type DocumentLinkUpdateInput = Partial<
  Omit<DocumentLink, 'id' | 'created' | 'updated' | 'portfolio_id'>
>
