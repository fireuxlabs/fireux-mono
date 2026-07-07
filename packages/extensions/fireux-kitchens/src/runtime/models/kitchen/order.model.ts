import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: App-scoped Kitchen operation
 * Storage: scoped operational record
 * Path: apps/{appId}/kitchens/{kitchenId}/orders/{orderId}
 * Owner app scope: Kitchen within an app runtime
 *
 * Decision note:
 * - KitchenOrder is the kitchen-owned operational order record.
 * - Keep it distinct from the generic order engine model until the broader order canon is deliberately reconciled.
 * - If that changes later, update the models README first, then this file.
 */
export const KitchenOrderStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/orders/{orderId}',
  collection: 'orders',
  parent: 'kitchen',
  idParam: 'orderId',
} as const

export type KitchenOrderItem = {
  id: string
  menu_id?: string
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
  | 'eat_in'
  | 'takeaway'
  | 'collection'
  | 'delivery'
  | 'pre_order'
  | 'room_service'

export const FulfilmentModes = [
  'delivery',
  'collection',
  'dineIn',
  'eatIn',
  'takeaway',
] as const

export type FulfilmentMode = typeof FulfilmentModes[number]

export const FulfilmentModeOrderTypes = {
  delivery: 'delivery',
  collection: 'collection',
  dineIn: 'dine_in',
  eatIn: 'eat_in',
  takeaway: 'takeaway',
} as const satisfies Record<FulfilmentMode, KitchenOrderType>

export type KitchenOrderFireState =
  | 'ready_to_fire'
  | 'held'
  | 'fired'

export type KitchenOrderCustomer = {
  name?: string
  avatar?: string
  avatar_url?: string
  email?: string
  phone?: string
  address?: string
  address_place_id?: string
  allergy_note?: string
  notes?: string
  party_size?: number
}

export type KitchenOrderPaymentStatus =
  | 'not_required'
  | 'requires_payment'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export type KitchenOrderPaymentMethod =
  | 'online_card'
  | 'deposit'
  | 'cash'
  | 'card_at_pickup'
  | 'card_to_driver'

export type KitchenOrderPayment = {
  required: boolean
  status: KitchenOrderPaymentStatus
  method?: KitchenOrderPaymentMethod
  amount_chf?: number
  currency_code?: string
  reason?: string
  resume_status?: string
  stripe_checkout_session_id?: string
  stripe_payment_intent_id?: string
  paid_at?: string | FirebaseTimestamp
}

export type KitchenOrderDriverResponse = {
  status?: 'watching' | 'rejected' | 'tendered'
  driver_id?: string
  driver_name?: string
  avatar_url?: string
  updated_at?: string | FirebaseTimestamp
}

export type KitchenOrderCollection = {
  mode?: 'queue' | 'scheduled'
  requested_for?: string | FirebaseTimestamp
}

export const KitchenOrderModel = {
  id: '' as string,
  kitchen_id: '' as string,

  order_number: '' as string,
  status: 'open' as string,
  order_type: 'dine_in' as KitchenOrderType,
  requested_for: '' as string | FirebaseTimestamp,
  collection: {} as KitchenOrderCollection,
  estimated_ready_minutes: 0 as number,
  estimated_ready_at: '' as string | FirebaseTimestamp,
  fire_state: 'fired' as KitchenOrderFireState,

  items: [] as KitchenOrderItem[],
  // Snapshot of the selected menu order-type policy at order time.
  // Fulfilment can evolve later without rewriting historical tickets.
  fulfilment_policy: {} as Record<string, unknown>,
  // Snapshot of the concrete fulfilment match, such as the delivery zone found for an address.
  fulfilment_match: {} as Record<string, unknown>,
  // Driver interest/tender state is attached to the order, not a parallel collection.
  driver_responses: {} as Record<string, KitchenOrderDriverResponse>,
  customer: {} as KitchenOrderCustomer,
  kitchen_note: '' as string,
  payment: {
    required: false,
    status: 'not_required',
    currency_code: '',
  } as KitchenOrderPayment,

  // Flat order index fields used by console and customer route surfaces.
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
