import type {
  KitchenOrderCustomer,
  KitchenOrderChannel,
  KitchenOrderFulfilmentMatch,
  KitchenOrderPayment,
  KitchenOrderStatus,
  KitchenOrderType,
} from '../../kitchen/utils/order.ts'
import type {
  MenuOrderingCollectionState,
  MenuOrderingTableState,
  MenuOrderingRoomServiceState,
} from './menu-order-draft.model'

export type CreatedMenuOrderReceiptLine = {
  id: string
  source_item_id?: string
  menu_id?: string
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
  variant_id?: string
}

export type CreatedMenuOrderReceipt = {
  id: string
  order_number: string
  kitchen_service_id?: string
  kitchen_service_name?: string
  order_type: KitchenOrderType
  channel: KitchenOrderChannel
  status: KitchenOrderStatus
  created_at: string
  collection?: MenuOrderingCollectionState
  room_service?: MenuOrderingRoomServiceState
  table?: MenuOrderingTableState
  fulfilment_match?: KitchenOrderFulfilmentMatch
  requested_for?: string
  currency: string
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
  capability_token?: string
  path?: string
  order_number: string
  status: KitchenOrderStatus
  kitchen_service_id?: string
  kitchen_service_name?: string
  order_type: KitchenOrderType
  channel: KitchenOrderChannel
  collection?: MenuOrderingCollectionState
  room_service?: MenuOrderingRoomServiceState
  table?: MenuOrderingTableState
  fulfilment_match?: KitchenOrderFulfilmentMatch
  requested_for?: string
  payment?: KitchenOrderPayment
  receipt?: CreatedMenuOrderReceipt
}
