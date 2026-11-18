import type { ItemPriceOption, ItemAddOnOption } from '../../utils/item-pricing'
import type { ItemCollectionRow } from '../../utils/item'
import type { MenuItem } from '../../../menu/models/menu-item.model.ts'
import type { MenuSection } from '../../../menu/models/menu-section.model.ts'

export type KitchenMenuItemRow = {
  id: string
  dish_id: string
  item?: MenuItem
  dish?: ItemCollectionRow | null
  name: string
  description: string
  image_url: string
  price?: number
  priceLabel?: string
  priceOptions: ItemPriceOption[]
  addOns: ItemAddOnOption[]
}

export type KitchenMenuSectionRow = {
  id: string
  section?: MenuSection
  label: string
  description: string
  items: KitchenMenuItemRow[]
}
