import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Portfolio-scoped
 * Storage: console-owned operational record
 * Owner console: Portfolio
 * Scope: units owned inside a portfolio property hierarchy
 *
 * Decision note:
 * - Unit exists because a portfolio owns and manages the related property.
 * - It should stay scoped until there is a real reason to promote it to shared root truth.
 * - If that changes later, update the models README first, then this file.
 */

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
