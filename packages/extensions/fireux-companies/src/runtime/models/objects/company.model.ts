// FILE: packages/extensions/fireux-companies/src/runtime/models/objects/company.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FireuxAuthored } from 'fireux-core/runtime/models/core/meta.model'

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

  /** Display name */
  name: '',

  /** Canonical address snapshot */
  formatted_address: '',

  /** Canonical location snapshot */
  lat: 0,
  lng: 0,

  /** Avatar snapshot (usually places/{id}/avatar storage URL) */
  avatar: '',

  /** Optional website (empty string means unset) */
  website: '',

  // Authored (FireuxAuthored)
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

// ✅ Type derived from the runtime model (no duplication)
export type Company = FireuxAuthored & {
  [K in keyof typeof Company]: (typeof Company)[K]
}

export type CompanyCreateInput = Omit<Company, keyof FireuxAuthored>
export type CompanyUpdateInput = Partial<Omit<CompanyCreateInput, 'id'>>
