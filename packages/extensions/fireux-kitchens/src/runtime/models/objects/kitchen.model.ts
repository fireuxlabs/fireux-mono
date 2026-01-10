// FILE: packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen.model.ts

/**
 * Kitchen overlay (Place-bound)
 * Firestore: kitchens/{placeId}
 * - Document ID is the canonical Place ID.
 * - This is an overlay on top of an existing Place.
 */

import type { FirestoreTimestampOrString } from 'fireux-core/types/firebase'

export interface Kitchen {
  /** Canonical Place ID (also the Firestore document ID). */
  id: string

  name: string
  formatted_address: string
  lat: number
  lng: number
  avatar: string

  /** Optional kitchen-specific details */
  website: string

  /** System-managed metadata (stamped by Firestore manager). */
  created_at?: FirestoreTimestampOrString
  updated_at?: FirestoreTimestampOrString
  creator_id?: string
}

export type KitchenCreateInput = Omit<Kitchen, 'creator_id' | 'created_at' | 'updated_at'>
export type KitchenUpdateInput = Partial<Omit<KitchenCreateInput, 'id'>>
