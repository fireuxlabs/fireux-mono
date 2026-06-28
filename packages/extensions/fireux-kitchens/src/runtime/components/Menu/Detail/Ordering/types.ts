import type { MenuOrderTypeConfig } from '../../../../models/menu/menu.model'
import type {
  KitchenOrderCustomer,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../../../models/order.model'
import type { CreatedMenuOrder } from '../../../../composables/fireux/public/menu/useMenuOrderCreate'

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

export type MenuOrderingLayerState = {
  actionLabel: string
  accepted: boolean
  awaitingAcceptance: boolean
  funnelOpen: boolean
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
