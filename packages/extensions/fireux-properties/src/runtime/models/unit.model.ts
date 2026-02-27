import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export const Unit = {
  id: '' as string,
  portfolio_id: '' as string,
  property_id: '' as string,
  label: '' as string,
  unit_type: 'flat' as 'flat' | 'room' | 'house' | 'commercial',
  bedrooms: 0 as number,
  bathrooms: 0 as number,
  status: 'vacant' as 'vacant' | 'occupied' | 'offline',
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

export type Unit = {
  [K in keyof typeof Unit]: (typeof Unit)[K]
}
