import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export const ComplianceItemType = {
  id: '' as string,
  code: '' as string,
  label: '' as string,
  description: '' as string,
  scope: 'property' as 'portfolio' | 'property' | 'unit',
  active: true as boolean,
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

export type ComplianceItemType = {
  [K in keyof typeof ComplianceItemType]: (typeof ComplianceItemType)[K]
}
