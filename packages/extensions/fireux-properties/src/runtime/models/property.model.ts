import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Portfolio-scoped
 * Storage: console-owned operational record
 * Owner console: Portfolio
 * Scope: portfolio-owned property records
 *
 * Decision note:
 * - Property currently belongs to portfolio operations rather than to a shared root canon.
 * - Keep ownership explicit through `portfolio_id` while that rule holds.
 * - If that changes later, update the models README first, then this file.
 */

export const Property = {
  id: '' as string,
  portfolio_id: '' as string,
  name: '' as string,
  address_line: '' as string,
  city: '' as string,
  postcode: '' as string,
  country: '' as string,
  place_id: '' as string,
  image_url: '' as string,
  property_type: 'residential' as 'residential' | 'commercial' | 'mixed',
  unit_count: 0 as number,
  estimated_value: 0 as number,
  estimated_value_currency: '' as string,
  status: 'active' as 'active' | 'inactive',
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

export type Property = {
  [K in keyof typeof Property]: (typeof Property)[K]
}
