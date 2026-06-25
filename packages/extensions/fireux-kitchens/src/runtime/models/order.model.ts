import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: scoped operational record
 * Path: /kitchens/<kitchenId>/orders/<orderId>
 * Owner app scope: Kitchen
 *
 * Decision note:
 * - KitchenOrder is the kitchen-owned operational order record.
 * - Keep it distinct from the generic order engine model until the broader order canon is deliberately reconciled.
 * - If that changes later, update the models README first, then this file.
 */
export const KitchenOrderStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/orders/{orderId}',
  collection: 'orders',
  parent: 'kitchen',
  idParam: 'orderId',
} as const

export type KitchenOrderItem = {
  id: string
  dish_id: string
  label: string
  add_ons?: Array<{
    id: string
    label: string
    price?: number
  }>
  variant_id?: string
  variant_label?: string
  unit_price?: number
  quantity: number
  checked: boolean
}

export type KitchenOrderType =
  | 'dine_in'
  | 'collection'
  | 'delivery'
  | 'pre_order'
  | 'room_service'

export type KitchenOrderFireState =
  | 'ready_to_fire'
  | 'held'
  | 'fired'

export const KitchenOrderModel = {
  id: '' as string,
  kitchen_id: '' as string,

  order_number: '' as string,
  status: 'open' as string,
  order_type: 'dine_in' as KitchenOrderType,
  requested_for: '' as string | FirebaseTimestamp,
  fire_state: 'fired' as KitchenOrderFireState,

  items: [] as KitchenOrderItem[],

  // Legacy transitional fields still read/written by existing surfaces.
  channel: '' as string,
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
  [K in keyof typeof KitchenOrderModel]: (typeof KitchenOrderModel)[K]
}

export type KitchenOrderCreateInput = Omit<KitchenOrder, 'created' | 'updated'>
export type KitchenOrderUpdateInput = Partial<
  Omit<KitchenOrder, 'id' | 'created' | 'updated' | 'kitchen_id'>
>
