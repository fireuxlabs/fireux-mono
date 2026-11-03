import type { DishPriceOption, DishAddOnOption } from './dish.model'
import type { Dish } from '../utils/dish.ts'
import type { MenuItem } from '../../menu/models/menu-item.model.ts'
import type { MenuSection } from '../../menu/models/menu-section.model.ts'

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
