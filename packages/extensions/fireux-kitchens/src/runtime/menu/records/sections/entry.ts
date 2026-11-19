import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type MenuEntryStatus = 'active' | 'archived'
export type MenuEntryReference =
  | { dish_id: string; promotion_id?: never }
  | { promotion_id: string; dish_id?: never }

export type MenuEntry = FireuxStamped &
  MenuEntryReference & {
    id: string
    kitchen_id: string
    menu_id: string
    section_id: string
    status: MenuEntryStatus
    sort_order: number
  }

export const MenuEntryStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}',
  collection: 'items',
  parent: 'menu-section',
  idParam: 'itemId',
} as const
export const MenuEntryDefaults: Extract<MenuEntry, { dish_id: string }> = {
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
export type MenuEntryCreateInput = Omit<MenuEntry, 'created' | 'updated'>
export type MenuEntryUpdateInput = Partial<
  Omit<
    MenuEntry,
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
