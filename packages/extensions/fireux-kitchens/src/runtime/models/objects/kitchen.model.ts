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

export type KitchenShape = FireuxStamped & {
  /** Canonical Place ID (also the Firestore document ID). */
  id: string

  name: string
  formatted_address: string
  place_image: string

  /** Optional kitchen-specific details (empty string means unset) */
  website: string
}

// 🔑 Runtime + canonical shape (source of truth)
export const Kitchen: KitchenShape = {
  /** Canonical Place ID (also the Firestore document ID). */
  id: '',

  name: '',
  formatted_address: '',
  place_image: '',

  /** Optional kitchen-specific details (empty string means unset) */
  website: '',

  // Authored (FireuxStamped)
  creator_id: undefined,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

// ✅ Type derived from the runtime model (no duplication)
export type Kitchen = KitchenShape

export type KitchenCreateInput = Omit<Kitchen, keyof FireuxStamped>
export type KitchenUpdateInput = Partial<Omit<KitchenCreateInput, 'id'>>
