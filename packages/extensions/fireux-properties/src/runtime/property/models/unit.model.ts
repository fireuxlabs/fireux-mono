import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Portfolio-scoped
 * Storage: scoped operational record
 * Owner app scope: Portfolio
 * Scope: units owned inside a portfolio property hierarchy
 *
 * Decision note:
 * - Unit exists because a portfolio owns and manages the related property.
 * - It should stay scoped until there is a real reason to promote it to shared root truth.
 * - If that changes later, update the models README first, then this file.
 */
export const UnitStorage = {
  shape: 'scoped',
  path: 'portfolios/{portfolioId}/units/{unitId}',
  collection: 'units',
  parent: 'portfolio',
  idParam: 'unitId',
} as const

export const UnitModel = {
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
  [K in keyof typeof UnitModel]: (typeof UnitModel)[K]
}

export type UnitCreateInput = Omit<Unit, 'created' | 'updated'>
export type UnitUpdateInput = Partial<
  Omit<Unit, 'id' | 'created' | 'updated' | 'portfolio_id' | 'property_id'>
>
