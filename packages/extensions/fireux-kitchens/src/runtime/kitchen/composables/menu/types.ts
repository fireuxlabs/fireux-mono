import type { Dish } from '../../models/dish.model.ts'
import type {
  MenuItemAddOnOption,
  MenuItem,
  MenuItemPriceOption,
} from '../../../menu/models/menu-item.model.ts'
import type { MenuSection } from '../../../menu/models/menu-section.model.ts'

export type KitchenMenuItemRow = {
  id: string
  dish_id: string
  item?: MenuItem
  dish?: Dish | null
  name: string
  description: string
  image_url: string
  price: number
  priceLabel?: string
  priceOptions: MenuItemPriceOption[]
  addOns: MenuItemAddOnOption[]
}

export type KitchenMenuSectionRow = {
  id: string
  section?: MenuSection
  label: string
  description: string
  items: KitchenMenuItemRow[]
}
