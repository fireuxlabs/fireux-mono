// FILE: packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

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
  place_image: '',

  /** Optional kitchen-specific details (empty string means unset) */
  website: '',

  // Authored (FireuxStamped)
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type Kitchen = {
  [K in keyof typeof Kitchen]: (typeof Kitchen)[K]
}

export type KitchenCreateInput = Omit<Kitchen, 'created_at' | 'updated_at' | 'creator_id'>
export type KitchenUpdateInput = Partial<Omit<KitchenCreateInput, 'id'>>
