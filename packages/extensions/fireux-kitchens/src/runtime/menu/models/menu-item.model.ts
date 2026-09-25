import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type MenuItemStatus = 'active' | 'archived'
export type MenuItemPriceOption = {
  label: string
  quantity: number
  unit: string
  price: number
}
export type MenuItemAddOnOption = { id: string; label: string; price: number }

export type MenuItem = FireuxStamped & {
  id: string
  kitchen_id: string
  menu_id: string
  section_id: string
  dish_id: string
  /** Adopted placements resolve commercial truth from the Kitchen sellable. */
  sellable_id?: string
  price: number
  price_options: MenuItemPriceOption[]
  add_ons: MenuItemAddOnOption[]
  status: MenuItemStatus
  sort_order: number
}
