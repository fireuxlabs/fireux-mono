import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: App-scoped Kitchen operation
 * Storage: scoped operational record
 * Path: apps/{appId}/kitchens/{kitchenId}/orders/{orderId}
 * Owner app scope: Kitchen within an app runtime
 *
 * Decision note:
 * - KitchenOrder is the active kitchen-owned operational order record.
 * - Shared order contracts may be composed later without moving Kitchen storage or lifecycle out of this model.
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

export type KitchenOrderChannel =
  | 'menu'
  | 'table_qr'
  | 'kiosk'
  | 'room_service'
  | 'staff_pos'

export type KitchenOrderFireState =
  | 'ready_to_fire'
  | 'held'
  | 'fired'

export type KitchenOrderStatus =
  | 'pending_payment'
  | 'pending_acceptance'
  | 'open'
  | 'on_pass'
  | 'closed'
  | 'cancelled'
  | 'trashed'

export type KitchenOrderBoardStage =
  | 'incoming'
  | 'queue'
  | 'pass'
  | 'recent'
  | 'trash'
  | 'unmapped'

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

export type KitchenOrderTable = {
  number?: string
}

export type KitchenOrderRoomService = {
  room?: string
}

export type KitchenOrderFulfilmentMatch = Record<string, unknown> & {
  type?: 'table' | 'counter' | 'delivery_zone' | 'room_service'
  reference?: string
  handoff?: 'table_service' | 'tray' | 'bag'
}

export const KitchenOrderModel = {
  id: '' as string,
  kitchen_id: '' as string,

  order_number: '' as string,
  status: 'open' as KitchenOrderStatus,
  order_type: 'dine_in' as KitchenOrderType,
  requested_for: '' as string | FirebaseTimestamp,
  collection: {} as KitchenOrderCollection,
  table: {} as KitchenOrderTable,
  room_service: {} as KitchenOrderRoomService,
  estimated_ready_minutes: 0 as number,
  estimated_ready_at: '' as string | FirebaseTimestamp,
  fire_state: 'fired' as KitchenOrderFireState,

  items: [] as KitchenOrderItem[],
  // Snapshot of the selected menu order-type policy at order time.
  // Fulfilment can evolve later without rewriting historical tickets.
  fulfilment_policy: {} as Record<string, unknown>,
  // Snapshot of the concrete fulfilment match, such as the delivery zone found for an address.
  fulfilment_match: {} as KitchenOrderFulfilmentMatch,
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
  channel: '' as KitchenOrderChannel,
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

export function deriveKitchenOrderBoardStage(order: {
  status?: unknown
  fire_state?: unknown
}): KitchenOrderBoardStage {
  const status = String(order.status ?? '').trim().toLowerCase()
  const fireState = String(order.fire_state ?? '').trim().toLowerCase()

  if (['trashed', 'deleted'].includes(status)) return 'trash'
  if (
    ['archived', 'cancelled', 'canceled', 'closed', 'rejected', 'refunded']
      .includes(status)
  ) {
    return 'recent'
  }
  if (
    ['pending_payment', 'pending_acceptance', 'incoming', 'new']
      .includes(status)
  ) {
    return 'incoming'
  }
  if (
    ['on_pass', 'pass', 'ready'].includes(status) ||
    fireState === 'ready_to_fire'
  ) {
    return 'pass'
  }
  if (['open', 'firing'].includes(status)) return 'queue'
  return 'unmapped'
}

export type KitchenOrderCreateInput = Omit<KitchenOrder, 'created' | 'updated'>
export type KitchenOrderUpdateInput = Partial<
  Omit<KitchenOrder, 'id' | 'created' | 'updated' | 'kitchen_id'>
>
