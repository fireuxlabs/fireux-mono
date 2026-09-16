import type {
  KitchenOrderCustomer,
  KitchenOrderChannel,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../kitchen/utils/order.ts'
import type {
  MenuOrderingCollectionState,
  MenuOrderingTableState,
  MenuOrderingRoomServiceState,
} from './menu-order-draft.model'

export type MenuOrderingOptionInput = {
  id?: string
  label?: string
  price?: number
  price_label?: string
}

export type MenuOrderingSubmitItem = {
  item_id: string
  menu_id?: string
  quantity: number
  add_ons?: MenuOrderingOptionInput[]
  variant?: MenuOrderingOptionInput
}

export type MenuOrderingSubmitBody = {
  idempotency_key?: string
  channel: KitchenOrderChannel
  order_type: KitchenOrderType
  items: MenuOrderingSubmitItem[]
  collection?: MenuOrderingCollectionState
  requested_for?: string
  payment_method?: KitchenOrderPaymentMethod
  customer?: KitchenOrderCustomer
  table?: MenuOrderingTableState
  room_service?: MenuOrderingRoomServiceState
}

export type MenuOrderingSubmitPayload = {
  channel?: KitchenOrderChannel
  collection?: MenuOrderingCollectionState
  customer?: KitchenOrderCustomer
  payment_method?: KitchenOrderPaymentMethod
  requested_for?: string
  room_service?: MenuOrderingRoomServiceState
  table?: MenuOrderingTableState
}
