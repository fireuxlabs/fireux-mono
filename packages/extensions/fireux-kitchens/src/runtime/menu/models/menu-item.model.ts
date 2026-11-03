import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type MenuItemStatus = 'active' | 'archived'
export type MenuItemReference =
  | { dish_id: string; promotion_id?: never }
  | { promotion_id: string; dish_id?: never }

export type MenuItem = FireuxStamped &
  MenuItemReference & {
    id: string
    kitchen_id: string
    menu_id: string
    section_id: string
    status: MenuItemStatus
    sort_order: number
  }

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
