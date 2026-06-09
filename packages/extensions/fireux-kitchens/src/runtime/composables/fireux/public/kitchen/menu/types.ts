import type { Dish } from '../../../../../models/dish.model'
import type {
  MenuItem,
  MenuItemPriceOption,
  MenuSection,
} from '../../../../../models/menu.model'

export type KitchenPublicMenuItemRow = {
  id: string
  item: MenuItem
  dish: Dish | null
  name: string
  description: string
  price: number
  priceOptions: MenuItemPriceOption[]
}

export type KitchenPublicMenuSectionRow = {
  id: string
  section: MenuSection
  label: string
  description: string
  items: KitchenPublicMenuItemRow[]
}
