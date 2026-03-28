// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts

import { FireuxConsoleOverlay, type FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Place } from 'fireux-places/runtime/models/place.model'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Console
 * Storage: root canonical record plus app overlay
 * Root path: /kitchens/<kitchenId>
 * Overlay path: /apps/<appId>/kitchens/<kitchenId>
 * Child scope: /apps/<appId>/kitchens/<kitchenId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Kitchen is one domain entity with a root public entity and an app-hosted kitchen console overlay.
 * - The root record stays thin and canonical; the overlay carries governance and private operational state.
 * - Console authority stays user-based in the overlay; Chef is a family-specific prerequisite or presentation layer, not the ownership model.
 * - Kitchen-owned operational children should live beneath the app-hosted overlay.
 * - If that rule changes later, update the models README first, then this file.
 */

/** Core (root scope): kitchens/<placeId> */
export const KitchenCore = {
  /** Canonical Place ID (also the Firestore document ID). */
  id: '' as string,

  // Optional flag for test kitchens (core)
  is_test_kitchen: false as boolean,

  // Stamps (core)
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type KitchenCore = {
  [K in keyof typeof KitchenCore]: (typeof KitchenCore)[K]
}

/** App overlay (hosted console/private): apps/<appId>/kitchens/<placeId> */
export const KitchenApp = {
  ...FireuxConsoleOverlay,
} as const

export type KitchenApp = {
  [K in keyof typeof KitchenApp]: (typeof KitchenApp)[K]
}

/**
 * Read-time enrichment only (never stored):
 * Kitchen is a thin record that can be hydrated from Place.
 */
export type Kitchen = KitchenCore &
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
      | 'slug'
    >
  >

export type KitchenCreateInput = Omit<KitchenCore, 'created' | 'updated'> & {
  is_test_kitchen?: boolean
}

export type KitchenUpdateInput = Partial<Pick<KitchenCore, 'is_test_kitchen'>>

// Compatibility alias kept while kitchen runtime still imports the older collection-centric name.
export const KitchenCollection = KitchenCore
export type KitchenCollection = KitchenCore
