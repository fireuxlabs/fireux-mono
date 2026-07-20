// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: project requested time and verified Delivery details to customers.
// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: make absent customer Order projection values truly optional.
import type {
  KitchenOrderPaymentMethod,
  KitchenOrderPaymentStatus,
  KitchenOrderStatus,
  KitchenOrderType,
} from '../kitchen/order.model'

export const CustomerOrderLinkStorage = {
  shape: 'child',
  path: 'customers/{userId}/orders/{orderId}',
  collection: 'orders',
  parent: 'customer',
  idParam: 'orderId',
} as const

export type CustomerOrderItemSummary = {
  id: string
  menu_id: string
  name: string
  quantity: number
  unit_price: number
  variant?: {
    id: string
    label: string
  }
  add_ons: Array<{
    id: string
    label: string
    price: number
  }>
}

export type CustomerOrderSummary = {
  id: string
  order_number?: string
  status: KitchenOrderStatus
  order_type: KitchenOrderType
  requested_for?: string
  created_at?: string
  estimated_ready_minutes?: number
  estimated_ready_at?: string
  kitchen_note?: string
  item_count: number
  items: CustomerOrderItemSummary[]
  kitchen: {
    id: string
    name: string
    path?: string
    logo_image_url?: string
    image_url?: string
    image_shade?: 'light' | 'dark' | 'none'
  }
  menu: {
    id: string
    name: string
    path: string
  }
  collection?: {
    mode: 'queue' | 'scheduled'
    requested_for?: string
  }
  delivery?: {
    address: string
    zone_label?: string
    fee_chf?: number
  }
  payment?: {
    method?: KitchenOrderPaymentMethod
    status: KitchenOrderPaymentStatus
  }
}

export type CustomerOrderPage = {
  items: CustomerOrderSummary[]
  nextCursor: string | null
  debug?: {
    customer_uid: string
    link_count: number
    candidate_count: number
    resolved_order_count: number
    visible_order_count: number
    omitted_count: number
    statuses: Array<{
      id: string
      status: KitchenOrderStatus
      order_type: KitchenOrderType
    }>
  }
}
