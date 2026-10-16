import { DishDefaults, type Dish } from '../../../utils/dish.ts'
import {
  MenuDefaults,
  type Menu,
} from '../../../../menu/models/menu-storage.model.ts'
import {
  MenuItemDefaults,
  type MenuItem,
} from '../../../../menu/utils/menu-item.ts'
import {
  MenuSectionDefaults,
  type MenuSection,
} from '../../../../menu/utils/menu-section.ts'
import { kitchenDemoCreated, kitchenDemoUpdated } from '../../core/fixtures'
import type { KitchenDemoIdentity } from '../../core/types'

type DishDefinition = Pick<
  Dish,
  | 'id'
  | 'name'
  | 'description'
  | 'item_kind'
  | 'image'
  | 'price'
  | 'price_options'
  | 'add_ons'
>

type MenuItemInput = {
  id: string
  section_id: string
  dish_id: string
  sort_order: number
}

export const dishes = (
  identity: KitchenDemoIdentity,
  definitions: DishDefinition[]
): Dish[] =>
  definitions.map((definition) => ({
    ...DishDefaults,
    ...definition,
    slug: definition.id,
    kitchen_id: identity.kitchenId,
    created: kitchenDemoCreated(identity),
    updated: kitchenDemoUpdated(),
  }))

export const rootMenu = (
  identity: KitchenDemoIdentity,
  name: string,
  description: string
): Menu => ({
  ...MenuDefaults,
  id: identity.menuId,
  slug: identity.menuId,
  name,
  description,
  status: 'published',
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})

export const kitchenMenu = (
  identity: KitchenDemoIdentity,
  menu: Menu
): Menu => ({
  ...MenuDefaults,
  id: identity.menuId,
  slug: identity.menuId,
  name: menu.name,
  description: menu.description || '',
  status: 'published',
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})

export const menuSection = (
  identity: KitchenDemoIdentity,
  id: string,
  label: string,
  sortOrder: number
): MenuSection => ({
  ...MenuSectionDefaults,
  id,
  kitchen_id: identity.kitchenId,
  menu_id: identity.menuId,
  label,
  sort_order: sortOrder,
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})

export const menuItem = (
  identity: KitchenDemoIdentity,
  input: MenuItemInput
): MenuItem => ({
  ...MenuItemDefaults,
  ...input,
  kitchen_id: identity.kitchenId,
  menu_id: identity.menuId,
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})
