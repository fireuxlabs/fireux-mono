import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export const Document = {
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
  [K in keyof typeof Document]: (typeof Document)[K]
}
