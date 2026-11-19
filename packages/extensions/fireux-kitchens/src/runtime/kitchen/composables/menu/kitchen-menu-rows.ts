import type { ItemPriceOption, ItemAddOnOption } from '../../utils/item-pricing'
import type { ItemCollectionRow } from '../../utils/item'
import type { MenuEntry } from '../../../menu/records/sections/entry.ts'
import type { MenuSection } from '../../../menu/records/sections/section.ts'

export type KitchenMenuItemRow = {
  id: string
  dish_id: string
  item?: MenuEntry
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
