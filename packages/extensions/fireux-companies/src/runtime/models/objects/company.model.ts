// FILE: packages/extensions/fireux-companies/src/runtime/models/objects/company.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Place } from 'fireux-places/runtime/models/objects/place.model'

/**
 * Company collection record (Place-bound)
 * Firestore: companies/{placeId}
 * - Document ID is the canonical Place ID.
 * - This is a record on top of an existing Place.
 *
 * Canon strategy:
 * - Runtime object is the single source of truth
 * - TypeScript derives types from it
 * - Drift is detected by comparing data ↔ model shape
 */

// 🔑 Runtime + canonical shape for stored collection records (source of truth)
export const Company = {
  /** Canonical Place ID (also the Firestore document ID). */
  id: '',

  // Authored (timestamps only; no creator_id on thin record)
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type Company = {
  [K in keyof typeof Company]: (typeof Company)[K]
}

/** Hydrated runtime view (record + place snapshot). */
export type CompanyView = Company & Partial<Place>

export type CompanyCreateInput = Omit<Company, 'created_at' | 'updated_at'>
export type CompanyUpdateInput = Partial<Omit<CompanyCreateInput, 'id'>>
