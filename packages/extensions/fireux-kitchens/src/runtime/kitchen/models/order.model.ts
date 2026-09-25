import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'
import type { DishItemKind } from './dish.model'
import type {
  KitchenOrderChannel,
  KitchenOrderPostPaymentStatus,
  KitchenOrderStatus,
  KitchenOrderType,
} from './order-lifecycle.model'

export type KitchenOrderItem = {
  id: string
  source_item_id?: string
  menu_id?: string
  dish_id: string
  item_kind?: DishItemKind
  label: string
  add_ons?: Array<{ id: string; label: string; price?: number }>
  variant_id?: string
  sellable_id?: string
  sellable_revision?: number
  variant_label?: string
  unit_price?: number
  quantity: number
  checked: boolean
}

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
  | 'pay_later'
  | 'cash'
  | 'card_at_pickup'
  | 'card_to_driver'
  | 'room_charge'
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
export type KitchenOrderPricing = {
  minor_unit_digits: number
  subtotal: FinancialMoney
  delivery_fee: FinancialMoney
  total: FinancialMoney
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
export type KitchenOrderTable = { number?: string }
export type KitchenOrderRoomService = { room?: string }
export type KitchenOrderFulfilmentMatch = Record<string, unknown> & {
  type?: 'table' | 'counter' | 'delivery_zone' | 'room_service'
  reference?: string
  handoff?: 'table_service' | 'tray' | 'bag'
}

export type KitchenOrder = FireuxStamped & {
  id: string
  kitchen_id: string
  menu_id: string
  order_number: string
  service_id: string
  service_number: number
  status: KitchenOrderStatus
  kitchen_service_id?: string
  kitchen_service_name?: string
  order_type: KitchenOrderType
  requested_for: string | FirebaseTimestamp
  collection: KitchenOrderCollection
  table: KitchenOrderTable
  room_service: KitchenOrderRoomService
  estimated_ready_minutes: number
  estimated_ready_at: string | FirebaseTimestamp
  items: KitchenOrderItem[]
  pricing: KitchenOrderPricing
  fulfilment_policy: Record<string, unknown>
  fulfilment_match: KitchenOrderFulfilmentMatch
  driver_responses: Record<string, KitchenOrderDriverResponse>
  customer: KitchenOrderCustomer
  kitchen_note: string
  payment: KitchenOrderPayment
  channel: KitchenOrderChannel | ''
  customer_capability_hash?: string
  customer_uid?: string
}
