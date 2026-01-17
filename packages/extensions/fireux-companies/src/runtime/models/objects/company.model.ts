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

export type CompanyShape = FireuxAuthored & {
  /** Canonical Place ID (also the Firestore document ID). */
  id: string

  /** Display name */
  name: string

  /** Canonical address snapshot */
  formatted_address: string

  /** Canonical location snapshot */
  lat: number
  lng: number

  /** Avatar snapshot (usually places/{id}/avatar storage URL) */
  avatar: string

  /** Optional website (empty string means unset) */
  website: string
}

// 🔑 Runtime + canonical shape (source of truth)
export const Company: CompanyShape = {
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
}

// ✅ Type derived from the runtime model (no duplication)
export type Company = CompanyShape

export type CompanyCreateInput = Omit<Company, keyof FireuxAuthored>
export type CompanyUpdateInput = Partial<Omit<CompanyCreateInput, 'id'>>
