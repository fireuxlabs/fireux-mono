import type { MenuOrderTypeConfig } from './menu.model'
import type {
  KitchenOrderCustomer,
  KitchenOrderFireState,
  KitchenOrderPayment,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../order.model'

export type CreatedMenuOrderReceiptLine = {
  id: string
  label: string
  quantity: number
  unit_price_chf: number
  total_chf: number
  add_ons?: Array<{
    id: string
    label: string
    price?: number
  }>
  variant_label?: string
}

export type CreatedMenuOrderReceipt = {
  id: string
  order_number: string
  order_type: KitchenOrderType
  status?: string
  created_at: string
  requested_for?: string
  currency: 'CHF'
  subtotal_chf: number
  delivery_fee_chf?: number
  total_chf: number
  payment?: KitchenOrderPayment
  customer?: KitchenOrderCustomer
  items: CreatedMenuOrderReceiptLine[]
  kitchen: {
    id: string
  }
  menu: {
    id: string
  }
}

export type CreatedMenuOrder = {
  id: string
  order_number: string
  status?: string
  order_type: KitchenOrderType
  fire_state: KitchenOrderFireState
  payment?: KitchenOrderPayment
  receipt?: CreatedMenuOrderReceipt
}

export type MenuOrderingBasketItem = {
  id: string
  lineId?: string
  name: string
  quantity: number
  unitPrice?: number
}

export type MenuOrderingSelectionSummary = {
  items: MenuOrderingBasketItem[]
  quantity: number
}

export type MenuOrderingFunnelState = {
  actionLabel: string
  accepted: boolean
  awaitingAcceptance: boolean
  panelOpen: boolean
  items: MenuOrderingBasketItem[]
  message: string
  menuId: string
  kitchenSlug?: string
  orderType: KitchenOrderType
  pending: boolean
  policy?: MenuOrderTypeConfig
  quantity: number
  selection: MenuOrderingSelectionSummary
  sentOrder?: CreatedMenuOrder | null
}

export type MenuOrderingSubmitPayload = {
  customer?: KitchenOrderCustomer
  payment_method?: KitchenOrderPaymentMethod
}
