import type { KitchenOrderType } from '../../kitchen/utils/order.ts'

export type MenuOrderingBasketItem = {
  id: string
  lineId?: string
  menuId?: string
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
  number: string
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

export type MenuOrderingSubmission = {
  id: string
  kitchen_id: string
  menu_id: string
  order_number: string
}

export type MenuOrderingOperatorPresence = {
  role: 'team_member' | 'kitchen_operator'
  status: 'online' | 'offline'
}

export type MenuOrderingKitchenIntake = MenuOrderingDraft & {
  operator?: MenuOrderingOperatorPresence
  submission: MenuOrderingSubmission
}
