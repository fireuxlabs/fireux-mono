import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { KitchenOrder } from '../models/order.model'
import type { KitchenOrderChannel, KitchenOrderStatus, KitchenOrderType } from '../models/order-lifecycle.model'

export * from '../models/order-lifecycle.model'
export type * from '../models/order.model'

export const KitchenOrderStorage = { shape: 'scoped', path: 'kitchens/{kitchenId}/orders/{orderId}', collection: 'orders', parent: 'kitchen', idParam: 'orderId' } as const

export const KitchenOrderDefaults: KitchenOrder = {
  id: '', kitchen_id: '', menu_id: '', order_number: '', service_id: '', service_number: 0,
  status: 'pending_acceptance' as KitchenOrderStatus, order_type: 'dine_in' as KitchenOrderType,
  requested_for: '', collection: {}, table: {}, room_service: {}, estimated_ready_minutes: 0,
  estimated_ready_at: '', items: [],
  pricing: { minor_unit_digits: 2, subtotal: { amount_minor: 0, currency_code: '' }, delivery_fee: { amount_minor: 0, currency_code: '' }, total: { amount_minor: 0, currency_code: '' } },
  fulfilment_policy: {}, fulfilment_match: {}, driver_responses: {}, customer: {}, kitchen_note: '',
  payment: { required: false, status: 'not_required', currency_code: '' },
  channel: '' as KitchenOrderChannel,
  created: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['created']['by'], app_id: '' as FireuxStamped['created']['app_id'] },
  updated: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['updated']['by'] },
}

export type KitchenOrderCreateInput = Omit<KitchenOrder, 'created' | 'updated'>
export type KitchenOrderUpdateInput = Partial<Omit<KitchenOrder, 'id' | 'created' | 'updated' | 'kitchen_id'>>
