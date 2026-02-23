// FILE: packages/extensions/fireux-companies/src/runtime/models/company.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Place } from 'fireux-places/runtime/models/place.model'

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
  created: {
    at: {} as FirebaseTimestamp,
  },
  updated: {
    at: {} as FirebaseTimestamp,
  },
} as const

export type Company = {
  [K in keyof typeof Company]: (typeof Company)[K]
}

/**
 * Read-time enrichment only (never stored)
 * Company is a thin record that can be hydrated from Place.
 */
export type CompanyView = Company &
  Partial<
    Pick<
      Place,
      | 'name'
      | 'short_name'
      | 'short_address'
      | 'formatted_address'
      | 'lat'
      | 'lng'
      | 'image_url'
      | 'image_shade'
      | 'claimed_by'
      | 'source'
    >
  >

export type CompanyCreateInput = Omit<Company, 'created' | 'updated'>
export type CompanyUpdateInput = Partial<Omit<CompanyCreateInput, 'id'>>
