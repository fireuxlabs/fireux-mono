import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: console-owned operational record
 * Path: /kitchens/<kitchenId>/orders/<orderId>
 * Owner console: Kitchen
 *
 * Decision note:
 * - KitchenOrder is the kitchen-owned operational order record.
 * - Keep it distinct from the generic order engine model until the broader order canon is deliberately reconciled.
 * - If that changes later, update the models README first, then this file.
 */

export type KitchenOrderItem = {
  id: string
  dish_id: string
  label: string
  quantity: number
  checked: boolean
}

export const KitchenOrder = {
  id: '' as string,
  kitchen_id: '' as string,

  order_number: '' as string,
  status: 'open' as string,
  channel: '' as string,

  items: [] as KitchenOrderItem[],

  // Legacy transitional fields still read/written by existing surfaces.
  app_id: '' as string,
  creator_id: '' as string,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,

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

export type KitchenOrder = {
  [K in keyof typeof KitchenOrder]: (typeof KitchenOrder)[K]
}

export type KitchenOrderCreateInput = Omit<
  KitchenOrder,
  'created' | 'updated'
>
