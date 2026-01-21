// FILE: packages/extensions/fireux-companies/src/runtime/models/objects/company.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Company overlay (Place-bound)
 * Firestore: companies/{placeId}
 * - Document ID is the canonical Place ID.
 * - This is an overlay on top of an existing Place.
 *
 * Canon strategy:
 * - Runtime object is the single source of truth
 * - TypeScript derives types from it
 * - Drift is detected by comparing data ↔ model shape
 */

// 🔑 Runtime + canonical shape (source of truth)
export const Company = {
  /** Canonical Place ID (also the Firestore document ID). */
  id: '',

  name: '',
  formatted_address: '',

  /** Canonical location snapshot */
  lat: 0,
  lng: 0,
  place_image: '',

  /** Search helpers */
  search_term: '',
  search_term_normalized: '',

  /** Optional company-specific details (empty string means unset) */
  website: '',

  // Authored (FireuxStamped)
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type Company = {
  [K in keyof typeof Company]: (typeof Company)[K]
}

export type CompanyCreateInput = Omit<Company, 'created_at' | 'updated_at' | 'creator_id'>
export type CompanyUpdateInput = Partial<Omit<CompanyCreateInput, 'id'>>
