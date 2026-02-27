import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export const Portfolio = {
  id: '' as string,
  name: '' as string,
  owner_label: '' as string,
  status: 'active' as 'active' | 'archived',
  strategy_label: '' as string,
  region_label: '' as string,
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

export type Portfolio = {
  [K in keyof typeof Portfolio]: (typeof Portfolio)[K]
}
