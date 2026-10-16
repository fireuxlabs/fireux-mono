import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { MenuItem } from '../models/menu-item.model'

export type * from '../models/menu-item.model'

export const MenuItemStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}',
  collection: 'items',
  parent: 'menu-section',
  idParam: 'itemId',
} as const
export const MenuItemDefaults: Extract<MenuItem, { dish_id: string }> = {
  id: '',
  kitchen_id: '',
  menu_id: '',
  section_id: '',
  dish_id: '',
  status: 'active',
  sort_order: 0,
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
}
export type MenuItemCreateInput = Omit<MenuItem, 'created' | 'updated'>
export type MenuItemUpdateInput = Partial<
  Omit<
    MenuItem,
    | 'id'
    | 'created'
    | 'updated'
    | 'kitchen_id'
    | 'menu_id'
    | 'section_id'
    | 'dish_id'
    | 'promotion_id'
  >
>
