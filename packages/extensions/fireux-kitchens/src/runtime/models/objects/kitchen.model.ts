// FILE: packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FireuxAuthored } from 'fireux-core/runtime/models/core/meta.model'

/**
 * Kitchen overlay (Place-bound)
 * Firestore: kitchens/{placeId}
 * - Document ID is the canonical Place ID.
 * - This is an overlay on top of an existing Place.
 *
 * Canon strategy:
 * - Runtime object is the single source of truth
 * - TypeScript derives types from it
 * - Drift is detected by comparing data ↔ model shape
 */

// 🔑 Runtime + canonical shape (source of truth)
export const Kitchen = {
  /** Canonical Place ID (also the Firestore document ID). */
  id: '',

  name: '',
  formatted_address: '',
  lat: 0,
  lng: 0,
  avatar: '',

  /** Optional kitchen-specific details (empty string means unset) */
  website: '',

  // Authored (FireuxAuthored)
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

// ✅ Type derived from the runtime model (no duplication)
export type Kitchen = FireuxAuthored & {
  [K in keyof typeof Kitchen]: (typeof Kitchen)[K]
}

export type KitchenCreateInput = Omit<Kitchen, keyof FireuxAuthored>
export type KitchenUpdateInput = Partial<Omit<KitchenCreateInput, 'id'>>
