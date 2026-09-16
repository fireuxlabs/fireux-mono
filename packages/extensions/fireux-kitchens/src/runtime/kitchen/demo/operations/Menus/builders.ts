import { DishDefaults, type Dish } from '../../../utils/dish.ts'
import {
  KitchenMenuDefaults,
  type KitchenMenu,
  type MenuOrderTypeConfig,
} from '../../../../menu/utils/kitchen-menu.ts'
import {
  MenuItemDefaults,
  type MenuItem,
} from '../../../../menu/utils/menu-item.ts'
import {
  MenuSectionDefaults,
  type MenuSection,
} from '../../../../menu/utils/menu-section.ts'
import type { Menu } from '../../../../menu/utils/menu.ts'
import { kitchenDemoCreated, kitchenDemoUpdated } from '../../core/fixtures'
import type { KitchenDemoIdentity } from '../../core/types'

type DishDefinition = Pick<
  Dish,
  'id' | 'name' | 'description' | 'item_kind' | 'image'
> &
  Partial<Pick<Dish, 'is_deal'>>

type MenuItemInput = Pick<
  MenuItem,
  'id' | 'section_id' | 'dish_id' | 'price' | 'sort_order'
> &
  Partial<Pick<MenuItem, 'price_options' | 'add_ons'>>

export const dishes = (
  identity: KitchenDemoIdentity,
  definitions: DishDefinition[]
): Dish[] =>
  definitions.map((definition) => ({
    ...DishDefaults,
    ...definition,
    slug: definition.id,
    is_deal: definition.is_deal ?? false,
    kitchen_id: identity.kitchenId,
    created: kitchenDemoCreated(identity),
    updated: kitchenDemoUpdated(),
  }))

export const rootMenu = (
  identity: KitchenDemoIdentity,
  name: string,
  description: string
): Menu => ({
  id: identity.menuId,
  kind: 'menu',
  name,
  description,
  status: 'published',
  source: {
    app_id: identity.appId,
    kitchen_id: identity.kitchenId,
    menu_id: identity.menuId,
  },
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})

export const kitchenMenu = (
  identity: KitchenDemoIdentity,
  menu: Menu,
  orderTypes: MenuOrderTypeConfig[]
): KitchenMenu => ({
  ...KitchenMenuDefaults,
  id: identity.menuId,
  slug: identity.menuId,
  name: menu.name,
  description: menu.description || '',
  status: 'published',
  ordering: {
    enabled: orderTypes.length > 0,
    order_types: orderTypes,
    service_hours: {
      inherit_kitchen_operation_hours: true,
    },
  },
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
  price_options: input.price_options || [],
  add_ons: input.add_ons || [],
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})
