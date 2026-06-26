import type {
  MenuManifestAddOn,
  MenuManifestItem,
  MenuManifestPriceOption,
  MenuManifestSection,
  MenuManifest,
} from '../../../composables/fireux/public/menu/useMenuManifest'
import type {
  MenuChoiceOption,
  MenuChoiceValue,
} from '../../../composables/fireux/public/menu/useMenuViewMode'
import type { MenuOrderTypeConfig } from '../../../models/menu/menu.model'
import type { KitchenOrderType } from '../../../models/order.model'

export type { MenuChoiceValue }

// Structured menu component spine: item/section display types come from useMenuManifest so detail rendering stays aligned with the manifest contract.
export type MenuStructuredItem = MenuManifestItem
export type MenuStructuredAddOn = MenuManifestAddOn
export type MenuStructuredPriceOption = MenuManifestPriceOption
export type MenuStructuredOrderItem = MenuStructuredItem & {
  lineId: string
  addOns?: MenuStructuredAddOn[]
  variant?: MenuStructuredPriceOption
}
export type MenuStructuredSection = MenuManifestSection

export type MenuStructuredBasketItem = {
  id: string
  lineId?: string
  name: string
  quantity: number
  unitPrice?: number
}

export type MenuStructuredBaseLayerView = {
  menu: MenuManifest
  choices: MenuChoiceOption[]
  selectedChoice: MenuChoiceValue
  orderMode: boolean
  orderNotice: string
  quantities: Record<string, number>
  dimmed: boolean
}

export type MenuStructuredOrderOverlayState = {
  actionLabel: string
  accepted: boolean
  awaitingAcceptance: boolean
  funnelOpen: boolean
  items: MenuStructuredBasketItem[]
  message: string
  menuId: string
  kitchenSlug?: string
  orderType: KitchenOrderType
  pending: boolean
  policy?: MenuOrderTypeConfig
  quantity: number
  selection: MenuStructuredSelectionSummary
}

export type MenuStructuredSelectionSummary = {
  items: MenuStructuredBasketItem[]
  quantity: number
}
