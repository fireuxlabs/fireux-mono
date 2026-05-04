// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-station.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: scoped operational record
 * Path: /kitchens/<kitchenId>/stations/<stationId>
 * Owner app scope: Kitchen
 */
export const KitchenStationModel = {
  id: '' as string,
  kitchen_id: '' as string,

  name: '' as string,
  description: '' as string,
  active: true as boolean,
  sort_order: 0 as number,

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const

export type KitchenStation = {
  [K in keyof typeof KitchenStationModel]: (typeof KitchenStationModel)[K]
}

export type KitchenStationCreateInput = Omit<KitchenStation, 'created' | 'updated'>
export type KitchenStationUpdateInput = Partial<
  Omit<KitchenStation, 'id' | 'created' | 'updated' | 'kitchen_id'>
>
