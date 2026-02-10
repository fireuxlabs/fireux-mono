// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Place } from 'fireux-places/runtime/models/place.model'

/**
 * Kitchen collection record (Place-bound)
 * Firestore: kitchens/{placeId}
 * - Document ID is the canonical Place ID.
 * - This is a thin record on top of an existing Place.
 *
 * Canon strategy:
 * - Runtime object is the single source of truth
 * - TypeScript derives types from it
 * - Drift is detected by comparing data ↔ model shape
 */

// 🔑 Runtime + canonical shape for stored collection records (source of truth)
export const KitchenCollection = {
  /** Canonical Place ID (also the Firestore document ID). */
  id: '' as string,

  // Optional flag for test kitchens
  is_test_kitchen: false as boolean,

  // Timestamps only
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type KitchenCollection = {
  [K in keyof typeof KitchenCollection]: (typeof KitchenCollection)[K]
}

/**
 * Read-time enrichment only (never stored)
 * Kitchen is a thin record that can be hydrated from Place.
 */
export type Kitchen = KitchenCollection &
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

export type KitchenCreateInput = Omit<
  KitchenCollection,
  'created_at' | 'updated_at' | 'is_test_kitchen'
> & {
  is_test_kitchen?: boolean
  name?: string
  image_url?: string
}
export type KitchenUpdateInput = Partial<Omit<KitchenCreateInput, 'id'>>
