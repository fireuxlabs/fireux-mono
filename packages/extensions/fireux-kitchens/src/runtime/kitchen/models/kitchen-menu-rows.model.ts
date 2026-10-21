import type { DishPriceOption, DishAddOnOption } from './dish.model'
import type { Dish } from '../utils/dish.ts'
import type {

  MenuItem,

} from '../../menu/utils/menu-item.ts'
import type { MenuSection } from '../../menu/utils/menu-section.ts'

export type KitchenMenuItemRow = {
  id: string
  dish_id: string
  item?: MenuItem
  dish?: Dish | null
  name: string
  description: string
  image_url: string
  price?: number
  priceLabel?: string
  priceOptions: DishPriceOption[]
  addOns: DishAddOnOption[]
}

export type KitchenMenuSectionRow = {
  id: string
  section?: MenuSection
  label: string
  description: string
  items: KitchenMenuItemRow[]
}
