import type { MenuOrderTypeConfig } from '../../../../models/menu/menu.model'
import type {
  KitchenOrderCustomer,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../../../models/order.model'
import type { CreatedMenuOrder } from '../../../../composables/fireux/public/menu/useMenuOrderCreate'

export type MenuDetailOrderingBasketItem = {
  id: string
  lineId?: string
  name: string
  quantity: number
  unitPrice?: number
}

export type MenuDetailOrderingSelectionSummary = {
  items: MenuDetailOrderingBasketItem[]
  quantity: number
}

export type MenuDetailOrderingLayerState = {
  actionLabel: string
  accepted: boolean
  awaitingAcceptance: boolean
  funnelOpen: boolean
  items: MenuDetailOrderingBasketItem[]
  message: string
  menuId: string
  kitchenSlug?: string
  orderType: KitchenOrderType
  pending: boolean
  policy?: MenuOrderTypeConfig
  quantity: number
  selection: MenuDetailOrderingSelectionSummary
  sentOrder?: CreatedMenuOrder | null
}

export type MenuDetailOrderingSubmitPayload = {
  customer?: KitchenOrderCustomer
  payment_method?: KitchenOrderPaymentMethod
}
