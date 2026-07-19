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

export type CustomerOrderSummary = {
  id: string
  order_number: string
  status: KitchenOrderStatus
  order_type: KitchenOrderType
  created_at: string
  estimated_ready_minutes: number
  estimated_ready_at: string
  kitchen_note?: string
  item_count: number
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
