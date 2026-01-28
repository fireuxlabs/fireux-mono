// FILE: packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Place } from 'fireux-places/runtime/models/objects/place.model'

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

// 🔑 Runtime + canonical shape for stored overlays (source of truth)
export const KitchenOverlay = {
  /** Canonical Place ID (also the Firestore document ID). */
  id: '',

  /** Optional kitchen-specific details (empty string means unset) */
  website: '',

  // Authored (timestamps only; no creator_id on thin overlay)
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type KitchenOverlay = {
  [K in keyof typeof KitchenOverlay]: (typeof KitchenOverlay)[K]
}

export type Kitchen = KitchenOverlay & Partial<
  Pick<
    Place,
    | 'name'
    | 'short_name'
    | 'short_address'
    | 'formatted_address'
    | 'lat'
    | 'lng'
    | 'place_image'
    | 'image_shade'
    | 'claimed_by'
    | 'source'
  >
>

export type KitchenCreateInput = Omit<KitchenOverlay, 'created_at' | 'updated_at'>
export type KitchenUpdateInput = Partial<Omit<KitchenCreateInput, 'id'>>
