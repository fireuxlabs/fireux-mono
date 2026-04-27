import type {
  FireuxAppOverlay,
  FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model'
import {
  FireuxAppOverlayModel,
  FireuxAppScope,
} from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain
 * Storage: root canonical record plus app-scoped record
 * Root path: /kitchens/<kitchenId>
 * App path: /apps/<appId>/kitchens/<kitchenId>
 * Child scope: /apps/<appId>/kitchens/<kitchenId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Kitchen is one domain entity with a root public entity and an app-hosted scoped record.
 * - The root record stays thin and canonical; the app-scoped record carries governance and private operational state.
 * - Public facade depth can vary by family; Kitchen is expected to have a richer public face than some other app-scoped entities.
 * - If Kitchen needs a richer public or operational read shape, that should be built in fetch/runtime/interface layers, not by complicating the stored model file.
 * - App authority stays user-based in the app-scoped record; Chef is a family-specific prerequisite or presentation layer, not the ownership model.
 * - Kitchen-owned operational children should live beneath the app-hosted record.
 * - If that rule changes later, update the models README first, then this file.
 */
export const KitchenModel = {
  id: '',
  ...FireuxAppScope,
  is_test_kitchen: false,
  place_id: '',

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Kitchen = WidenLiteral<typeof KitchenModel>

export const AppKitchenModel = {
  ...FireuxAppOverlayModel,
} as const

export type AppKitchen = FireuxAppOverlay

export type KitchenCreateInput = Omit<
  Kitchen,
  'created' | 'updated' | 'app_scope_state' | 'app_scope_app_id'
> &
  Partial<Pick<Kitchen, 'app_scope_state' | 'app_scope_app_id'>> & {
    is_test_kitchen?: boolean
  }

export type KitchenUpdateInput = Partial<Pick<Kitchen, 'is_test_kitchen' | 'place_id'>>
