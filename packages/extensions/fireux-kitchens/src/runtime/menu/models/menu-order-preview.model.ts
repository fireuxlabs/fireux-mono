import type {
  KitchenOrderCustomer,
  KitchenOrderChannel,
  KitchenOrderPaymentMethod,
  KitchenOrderStatus,
  KitchenOrderType,
} from '../../kitchen/utils/order.ts'
import type { MenuServiceHours } from './menu-ordering.model'
import type { MenuOrderTypeConfig } from './menu-ordering.model'
import type {
  CreatedMenuOrderReceiptLine,
  CreatedMenuOrder,
} from './menu-order-receipt.model'
import type {
  MenuOrderingBasketItem,
  MenuOrderingSelectionSummary,
  MenuOrderingDeliveryState,
  MenuOrderingCollectionState,
  MenuOrderingTableState,
  MenuOrderingPreOrderState,
  MenuOrderingRoomServiceState,
  MenuOrderingOperatorPresence,
} from './menu-order-draft.model'
import type {
  MenuOrderingSubmitBody,
  MenuOrderingSubmitPayload,
} from './menu-order-request.model'

export type MenuOrderingIncoming = {
  order_type: KitchenOrderType
  basket: Array<{
    item_id: string
    menu_id?: string
    line_id?: string
    name: string
    quantity: number
    unit_price_chf?: number
  }>
  allergen_checked?: boolean
  collection?: MenuOrderingCollectionState
  delivery?: MenuOrderingDeliveryState
  customer?: KitchenOrderCustomer
  operator?: MenuOrderingOperatorPresence
  payment_method?: KitchenOrderPaymentMethod
  pre_order?: MenuOrderingPreOrderState
  room_service?: MenuOrderingRoomServiceState
  table?: MenuOrderingTableState
  choice?: Record<string, unknown>
}

export type MenuOrderingProcessing = {
  exists: boolean
  order_id: string
  order_number: string
  status: KitchenOrderStatus | ''
  items: Array<CreatedMenuOrderReceiptLine | MenuOrderingBasketItem>
  total_chf: number
  estimated_ready_minutes?: number
  estimated_ready_at?: string
  driver_watching_count?: number
  order?: CreatedMenuOrder | null
}

export type MenuOrderingSending = {
  endpoint: string
  body: MenuOrderingSubmitBody
  pending: boolean
  message?: string
  error?: string
  sent_order?: CreatedMenuOrder | null
}

export type MenuOrderingPayment = {
  pending: boolean
  message?: string
  error?: string
}

export type MenuOrderPreviewState = {
  actionLabel: string
  accepted: boolean
  awaitingAcceptance: boolean
  currencyCode: string
  channel: KitchenOrderChannel
  panelOpen: boolean
  items: MenuOrderingBasketItem[]
  message: string
  menuId: string
  kitchenSlug?: string
  orderType: KitchenOrderType
  pending: boolean
  policy?: MenuOrderTypeConfig
  quantity: number
  serviceHours?: MenuServiceHours
  selection: MenuOrderingSelectionSummary
  sentOrder?: CreatedMenuOrder | null
}

export type MenuOrderPreviewController = {
  show: boolean
  order: MenuOrderPreviewState
  incoming: MenuOrderingIncoming
  processing: MenuOrderingProcessing
  sending: MenuOrderingSending
  payment: MenuOrderingPayment
  collect: (payload: Partial<MenuOrderingIncoming>) => void
  clear: () => void
  close: () => void
  open: () => void
  pay: () => Promise<void> | void
  submit: (
    payload: MenuOrderingSubmitPayload
  ) =>
    | Promise<CreatedMenuOrder | null | undefined>
    | CreatedMenuOrder
    | null
    | undefined
}
