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

export const KitchenOrderTypes = [
  'dine_in',
  'eat_in',
  'takeaway',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
] as const

export type KitchenOrderType = (typeof KitchenOrderTypes)[number]

export type KitchenOrderChannel =
  | 'menu'
  | 'table_qr'
  | 'kiosk'
  | 'room_service'
  | 'staff_pos'

export type KitchenOrderAcceptancePolicy = 'automatic' | 'operator'

export type KitchenOrderIntakePolicy = {
  acceptance: KitchenOrderAcceptancePolicy
  channels: readonly KitchenOrderChannel[]
  default_channel: KitchenOrderChannel
}

export const KitchenOrderIntakePolicies = {
  dine_in: {
    acceptance: 'automatic',
    channels: ['table_qr', 'staff_pos'],
    default_channel: 'table_qr',
  },
  eat_in: {
    acceptance: 'automatic',
    channels: ['kiosk', 'staff_pos'],
    default_channel: 'kiosk',
  },
  takeaway: {
    acceptance: 'automatic',
    channels: ['kiosk', 'staff_pos'],
    default_channel: 'kiosk',
  },
  collection: {
    acceptance: 'operator',
    channels: ['menu'],
    default_channel: 'menu',
  },
  delivery: {
    acceptance: 'operator',
    channels: ['menu'],
    default_channel: 'menu',
  },
  pre_order: {
    acceptance: 'operator',
    channels: ['menu'],
    default_channel: 'menu',
  },
  room_service: {
    acceptance: 'operator',
    channels: ['room_service'],
    default_channel: 'room_service',
  },
} as const satisfies Record<KitchenOrderType, KitchenOrderIntakePolicy>

export const KitchenOrderStatuses = [
  'pending_payment',
  'pending_acceptance',
  'accepted',
  'ready',
  'completed',
  'cancelled',
  'trashed',
] as const

export type KitchenOrderStatus = (typeof KitchenOrderStatuses)[number]

export type KitchenOrderInitialStatus = Extract<
  KitchenOrderStatus,
  'pending_payment' | 'pending_acceptance' | 'accepted'
>

export type KitchenOrderPostPaymentStatus = Extract<
  KitchenOrderStatus,
  'pending_acceptance' | 'accepted'
>

export const KitchenOrderTransitions = [
  'accept',
  'reject',
  'mark_ready',
  'return_to_queue',
  'complete',
  'trash',
] as const

export type KitchenOrderTransition = (typeof KitchenOrderTransitions)[number]

export type KitchenOrderBoardStage =
  | 'incoming'
  | 'queue'
  | 'pass'
  | 'recent'
  | 'trash'
  | 'unmapped'

export type KitchenOrderCustomer = {
  name?: string
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
  resume_status?: KitchenOrderPostPaymentStatus
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
  menu_id: '' as string,

  order_number: '' as string,
  status: 'pending_acceptance' as KitchenOrderStatus,
  order_type: 'dine_in' as KitchenOrderType,
  requested_for: '' as string | FirebaseTimestamp,
  collection: {} as KitchenOrderCollection,
  table: {} as KitchenOrderTable,
  room_service: {} as KitchenOrderRoomService,
  estimated_ready_minutes: 0 as number,
  estimated_ready_at: '' as string | FirebaseTimestamp,
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

  // Order source; actor and app identity live in the canonical creation stamp.
  channel: '' as KitchenOrderChannel,

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
}): KitchenOrderBoardStage {
  const status = String(order.status ?? '').trim()

  if (status === 'trashed') return 'trash'
  if (status === 'completed' || status === 'cancelled') return 'recent'
  if (status === 'pending_payment' || status === 'pending_acceptance') {
    return 'incoming'
  }
  if (status === 'ready') return 'pass'
  if (status === 'accepted') return 'queue'
  return 'unmapped'
}

export function isKitchenOrderStatus(value: unknown): value is KitchenOrderStatus {
  return KitchenOrderStatuses.includes(value as KitchenOrderStatus)
}

export function kitchenOrderIntakePolicy(
  orderType: KitchenOrderType
): KitchenOrderIntakePolicy {
  return KitchenOrderIntakePolicies[orderType]
}

export function resolveKitchenOrderIntakeStatus(input: {
  orderType: KitchenOrderType
  paymentPending: boolean
}): KitchenOrderInitialStatus {
  if (input.paymentPending) return 'pending_payment'

  return resolveKitchenOrderPostPaymentStatus(input.orderType)
}

export function resolveKitchenOrderPostPaymentStatus(
  orderType: KitchenOrderType
): KitchenOrderPostPaymentStatus {
  return kitchenOrderIntakePolicy(orderType).acceptance === 'operator'
    ? 'pending_acceptance'
    : 'accepted'
}

export function isKitchenOrderPostPaymentStatus(
  value: unknown
): value is KitchenOrderPostPaymentStatus {
  return value === 'pending_acceptance' || value === 'accepted'
}

export function isKitchenOrderType(value: unknown): value is KitchenOrderType {
  return KitchenOrderTypes.includes(value as KitchenOrderType)
}

export function isKitchenOrderTransition(
  value: unknown
): value is KitchenOrderTransition {
  return KitchenOrderTransitions.includes(value as KitchenOrderTransition)
}

export type KitchenOrderCreateInput = Omit<KitchenOrder, 'created' | 'updated'>
export type KitchenOrderUpdateInput = Partial<
  Omit<KitchenOrder, 'id' | 'created' | 'updated' | 'kitchen_id'>
>
