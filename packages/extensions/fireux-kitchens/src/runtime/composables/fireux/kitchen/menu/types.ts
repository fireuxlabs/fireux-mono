import type { Dish } from '../../../../models/dish.model'
import type {
  MenuItemAddOnOption,
  MenuItem,
  MenuItemPriceOption,
} from '../../../../models/menu/menu-item.model'
import type { MenuSection } from '../../../../models/menu/menu-section.model'

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
