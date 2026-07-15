import type { MaybeRefOrGetter } from 'vue'
import type {
  KitchenOrderChannel,
  KitchenOrderCustomer,
  KitchenOrderPaymentMethod,
  KitchenOrderStatus,
  KitchenOrderType,
} from '../../../../../../models/kitchen/order.model'
import type { MenuRouteContext } from '../../../../../../models/kitchen/menu/menu-context.model'
import type { MenuManifest } from '../../../../../../models/kitchen/menu/menu-detail.model'
import type { KitchenMenuRouteMode } from '../../../../../../utils/kitchen-menu-route'
import type {
  MenuFoodItem,
  MenuFoodOrderItem,
} from '../../../../../../models/kitchen/menu/menu-food.model'
import type {
  MenuOrderingCollectionState,
  MenuOrderingRoomServiceState,
  MenuOrderingTableState,
} from '../../../../../../models/kitchen/menu/menu-ordering.model'

export type MenuChoiceValue = string

export type MenuChoiceOption = {
  value: MenuChoiceValue
  label: string
  menuId?: string
  to?: string
  orderType?: KitchenOrderType
  message?: string
}

export type MenuSurfaceOption = {
  value: MenuRouteContext
  label: string
  to: string
  active: boolean
}

export type MenuDetailItem = MenuFoodItem
export type MenuDetailOrderItem = MenuFoodOrderItem

export type MenuDetailView = {
  menu: MenuManifest
  choices: MenuChoiceOption[]
  surfaceOptions: MenuSurfaceOption[]
  surfaceLabel: string
  selectedChoice: MenuChoiceValue
  selectedItemId: string
  orderMode: boolean
  dimmed: boolean
}

export type UseKitchenOrderFunnelOptions = {
  menu: MaybeRefOrGetter<MenuManifest | null>
  menuId: MaybeRefOrGetter<string>
  sourceMenuId?: MaybeRefOrGetter<string | null | undefined>
  menuContext?: MaybeRefOrGetter<MenuRouteContext | string | null | undefined>
  menuRouteMode?: MaybeRefOrGetter<KitchenMenuRouteMode | null | undefined>
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
  sessionKitchenSlug?: MaybeRefOrGetter<string | null | undefined>
}

export type PanelState = 'closed' | 'open'

export type MenuOrderAddOn = {
  id: string
  label: string
  price?: number
  priceLabel?: string
}

export type MenuOrderVariant = {
  id: string
  label: string
  price?: number
  priceLabel?: string
}

export type MenuOrderItem = {
  id: string
  name: string
  addOns?: MenuOrderAddOn[]
  lineId?: string
  menuId?: string
  price?: number
  variant?: MenuOrderVariant
}

export type MenuOrderDraftItem = MenuOrderItem & {
  lineId: string
  menuId?: string
  quantity: number
  unitPrice: number
}

export type MenuOrderDraftOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
  menuContext?: MaybeRefOrGetter<MenuRouteContext | string | null | undefined>
  menuRouteMode?: MaybeRefOrGetter<KitchenMenuRouteMode | null | undefined>
  canOrder?: MaybeRefOrGetter<boolean>
  orderType?: MaybeRefOrGetter<KitchenOrderType>
  sourceMenuId?: MaybeRefOrGetter<string | null | undefined>
  storageKey?: MaybeRefOrGetter<string | null | undefined>
}

export type MenuOrderVariantInput = {
  id?: string
  label?: string
  price?: number
  priceLabel?: string
}

export type MenuOrderLineInput = {
  itemId: string
  menuId?: string
  quantity: number
  addOns?: MenuOrderVariantInput[]
  variant?: MenuOrderVariantInput
}

export type CreateMenuOrderInput = {
  items: MenuOrderLineInput[]
  channel: KitchenOrderChannel
  order_type: KitchenOrderType
  collection?: MenuOrderingCollectionState
  payment_method?: KitchenOrderPaymentMethod
  requested_for?: string
  room_service?: MenuOrderingRoomServiceState
  table?: MenuOrderingTableState
  customer?: KitchenOrderCustomer
}

export type UseMenuOrderCreateOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
  menuContext?: MaybeRefOrGetter<MenuRouteContext | string | null | undefined>
  menuRouteMode?: MaybeRefOrGetter<KitchenMenuRouteMode | null | undefined>
}

export type KitchenOrderFunnelStatus = {
  id: string
  order_number: string
  status: KitchenOrderStatus
  order_type: KitchenOrderType
  estimated_ready_minutes: number
  estimated_ready_at: string
  driver_watching_count: number
}

export type UseMenuOrderStatusOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
  enabled?: MaybeRefOrGetter<boolean>
}
