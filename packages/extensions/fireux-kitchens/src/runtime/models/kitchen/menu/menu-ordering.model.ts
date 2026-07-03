import type {
  MenuOrderTypeConfig,
  MenuServiceHoursConfig,
} from './menu.model'
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
  path?: string
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

export type MenuOrderingDeliveryState = {
  ready: boolean
  address?: {
    input?: string
    formatted?: string
    postal_code?: string
    place_id?: string
    lat?: number
    lng?: number
  }
  zone?: unknown
}

export type MenuOrderingIncoming = {
  order_type: KitchenOrderType
  basket: Array<{
    item_id: string
    line_id?: string
    name: string
    quantity: number
    unit_price_chf?: number
  }>
  allergen_checked?: boolean
  choice?: Record<string, unknown>
}

export type MenuOrderingProcessing = {
  exists: boolean
  order_id: string
  order_number: string
  status: string
  fire_state: string
  items: Array<CreatedMenuOrderReceiptLine | MenuOrderingBasketItem>
  total_chf: number
  estimated_ready_minutes?: number
  estimated_ready_at?: string
  order?: CreatedMenuOrder | null
}

export type MenuOrderingSending = {
  endpoint: string
  body: {
    order_type: KitchenOrderType
    items: Array<{
      itemId: string
      quantity: number
      addOns?: Array<{
        id?: string
        label?: string
        price?: number
        priceLabel?: string
      }>
      variant?: {
        id?: string
        label?: string
        price?: number
        priceLabel?: string
      }
    }>
    requested_for?: string
    payment_method?: KitchenOrderPaymentMethod
    customer?: KitchenOrderCustomer
  }
  pending: boolean
  expected_result: {
    status: string
    fire_state: KitchenOrderFireState
  }
  message?: string
  error?: string
  sent_order?: CreatedMenuOrder | null
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
  serviceHours?: MenuServiceHoursConfig
  selection: MenuOrderingSelectionSummary
  sentOrder?: CreatedMenuOrder | null
}

export type MenuOrderingSubmitPayload = {
  customer?: KitchenOrderCustomer
  payment_method?: KitchenOrderPaymentMethod
  requested_for?: string
}

export type MenuOrderingFunnelController = {
  show: boolean
  order: MenuOrderingFunnelState
  incoming: MenuOrderingIncoming
  processing: MenuOrderingProcessing
  sending: MenuOrderingSending
  collect: (payload: Partial<MenuOrderingIncoming>) => void
  clear: () => void
  close: () => void
  open: () => void
  submit: (payload: MenuOrderingSubmitPayload) =>
    Promise<CreatedMenuOrder | null | undefined> |
    CreatedMenuOrder |
    null |
    undefined
}
