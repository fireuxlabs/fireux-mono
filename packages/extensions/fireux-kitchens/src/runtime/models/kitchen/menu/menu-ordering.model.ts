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
  collection?: MenuOrderingCollectionState
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
  fire_state?: KitchenOrderFireState
  collection?: MenuOrderingCollectionState
  requested_for?: string
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

export type MenuOrderingBasket = {
  items: MenuOrderingBasketItem[]
  quantity: number
}

export type MenuOrderingSelectionSummary = MenuOrderingBasket

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

export type MenuOrderingCollectionState = {
  mode: 'queue' | 'scheduled'
  requested_for?: string
}

export type MenuOrderingTableState = {
  tableNumber: string
}

export type MenuOrderingKioskState = {
  mode: 'eat_in' | 'takeaway'
  handoff: 'tray' | 'bag'
  queueArea?: string
}

export type MenuOrderingPreOrderState = {
  requested_for: string
  notice_hours?: number
  party_size?: number
}

export type MenuOrderingRoomServiceState = {
  room: string
  guestName?: string
}

export type MenuOrderingCateringState = {
  eventDate: string
  location: string
  partySize: number
}

export type MenuOrderingAllergenCheck = {
  checked: boolean
}

export type MenuOrderingRouteContext = {
  menuId: string
  kitchenSlug?: string
}

export type MenuOrderingDraft = {
  orderType: KitchenOrderType
  basket: MenuOrderingBasket
  allergen?: MenuOrderingAllergenCheck
  catering?: MenuOrderingCateringState
  collection?: MenuOrderingCollectionState
  delivery?: MenuOrderingDeliveryState
  kiosk?: MenuOrderingKioskState
  preOrder?: MenuOrderingPreOrderState
  roomService?: MenuOrderingRoomServiceState
  table?: MenuOrderingTableState
}

export type MenuOrderingDraftContext = {
  route: MenuOrderingRouteContext
  draft: MenuOrderingDraft
}

export type MenuOrderingOptionInput = {
  id?: string
  label?: string
  price?: number
  priceLabel?: string
}

export type MenuOrderingSubmitItem = {
  itemId: string
  quantity: number
  addOns?: MenuOrderingOptionInput[]
  variant?: MenuOrderingOptionInput
}

export type MenuOrderingSubmitBody = {
  order_type: KitchenOrderType
  items: MenuOrderingSubmitItem[]
  collection?: MenuOrderingCollectionState
  requested_for?: string
  payment_method?: KitchenOrderPaymentMethod
  customer?: KitchenOrderCustomer
}

export type MenuOrderingSubmission = {
  id: string
  kitchen_id: string
  menu_id: string
  order_number: string
}

export type MenuOrderingKitchenIntake = MenuOrderingDraft & {
  submission: MenuOrderingSubmission
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
  collection?: MenuOrderingCollectionState
  delivery?: MenuOrderingDeliveryState
  pre_order?: MenuOrderingPreOrderState
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
  body: MenuOrderingSubmitBody
  pending: boolean
  expected_result: {
    status: string
    fire_state?: KitchenOrderFireState
  }
  message?: string
  error?: string
  sent_order?: CreatedMenuOrder | null
}

export type MenuOrderingPayment = {
  pending: boolean
  message?: string
  error?: string
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
  collection?: MenuOrderingCollectionState
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
  payment: MenuOrderingPayment
  collect: (payload: Partial<MenuOrderingIncoming>) => void
  clear: () => void
  close: () => void
  open: () => void
  pay: () => Promise<void> | void
  submit: (payload: MenuOrderingSubmitPayload) =>
    Promise<CreatedMenuOrder | null | undefined> |
    CreatedMenuOrder |
    null |
    undefined
}
