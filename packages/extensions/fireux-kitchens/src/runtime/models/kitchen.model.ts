// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts

import { FireuxConsoleOverlay, type FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

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
 * - Public facade depth can vary by family; Kitchen is expected to have a richer public face than some other console-backed entities.
 * - If Kitchen needs a richer public or operational read shape, that should be built in fetch/runtime/interface layers, not by complicating the stored model file.
 * - Console authority stays user-based in the overlay; Chef is a family-specific prerequisite or presentation layer, not the ownership model.
 * - Kitchen-owned operational children should live beneath the app-hosted overlay.
 * - If that rule changes later, update the models README first, then this file.
 */
/** Core (root scope): kitchens/<placeId> */
export const KitchenModel = {
  /** Canonical Place ID (also the Firestore document ID). */
  id: '' as string,
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

export type Kitchen = {
  [K in keyof typeof KitchenModel]: (typeof KitchenModel)[K]
}

/** App overlay (hosted console/private): apps/<appId>/kitchens/<placeId> */
export const ConsoleKitchenModel = {
  ...FireuxConsoleOverlay,
} as const

export type ConsoleKitchen = {
  [K in keyof typeof ConsoleKitchenModel]: (typeof ConsoleKitchenModel)[K]
}

export type KitchenCreateInput = Omit<Kitchen, 'created' | 'updated'> & {
  is_test_kitchen?: boolean
}

export type KitchenUpdateInput = Partial<Pick<Kitchen, 'is_test_kitchen'>>
