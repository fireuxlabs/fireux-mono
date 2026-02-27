import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type DocumentLinkTargetType =
  | 'portfolio'
  | 'property'
  | 'unit'
  | 'compliance-record'
  | 'tenancy'
  | 'task'

export const DocumentLink = {
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
  [K in keyof typeof DocumentLink]: (typeof DocumentLink)[K]
}
