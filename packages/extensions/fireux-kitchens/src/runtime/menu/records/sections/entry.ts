import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type MenuEntryStatus = 'active' | 'archived'
export type MenuEntryReference =
  | { item_id: string; promotion_id?: never }
  | { promotion_id: string; item_id?: never }

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
  path: 'kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{entryId}',
  collection: 'items',
  parent: 'menu-section',
  idParam: 'entryId',
} as const
export const MenuEntryDefaults: Extract<MenuEntry, { item_id: string }> = {
  id: '',
  kitchen_id: '',
  menu_id: '',
  section_id: '',
  item_id: '',
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
    | 'item_id'
    | 'promotion_id'
  >
>
