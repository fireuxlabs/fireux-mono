import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export const Task = {
  id: '' as string,
  portfolio_id: '' as string,
  title: '' as string,
  description: '' as string,
  status: 'open' as 'open' | 'in_progress' | 'done',
  source: 'manual' as 'manual' | 'compliance' | 'documents',
  due_date: '' as string,
  linked_entity_type: '' as string,
  linked_entity_id: '' as string,
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

export type Task = {
  [K in keyof typeof Task]: (typeof Task)[K]
}
